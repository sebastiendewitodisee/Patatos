import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const AUTHOR_MAX_LENGTH = 120;
const MESSAGE_MAX_LENGTH = 2000;
const COOLDOWN_SECONDS = 60;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SubmitPayload = {
  post_id?: unknown;
  slug?: unknown;
  lang?: unknown;
  author_name?: unknown;
  message?: unknown;
  content?: unknown;
  honeypot?: unknown;
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeLang(value: unknown) {
  const normalizedValue = normalizeText(value).toLowerCase();
  if (normalizedValue.startsWith("nl")) {
    return "nl";
  }

  if (normalizedValue.startsWith("fr")) {
    return "fr";
  }

  return "";
}

function sanitizeSlug(value: unknown) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getIpFromHeaders(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? "";
  const firstEntry = forwarded.split(",")[0] ?? "";
  return firstEntry.trim();
}

async function sha256Hex(value: string) {
  const encodedValue = new TextEncoder().encode(value);
  const digestBuffer = await crypto.subtle.digest("SHA-256", encodedValue);
  const digestArray = Array.from(new Uint8Array(digestBuffer));
  return digestArray.map((part) => part.toString(16).padStart(2, "0")).join("");
}

function getCooldownSecondsRemaining(createdAt: string) {
  const createdAtMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdAtMs)) {
    return COOLDOWN_SECONDS;
  }

  const elapsedSeconds = Math.floor((Date.now() - createdAtMs) / 1000);
  return Math.max(1, COOLDOWN_SECONDS - elapsedSeconds);
}

function isMissingRateLimitTable(error: { code?: string; message?: string } | null) {
  if (!error) {
    return false;
  }

  const code = String(error.code ?? "").toLowerCase();
  const message = String(error.message ?? "").toLowerCase();
  return code === "42p01" || message.includes("comment_rate_limits");
}

function createServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

type ResolvedPostIdResult =
  | { ok: true; postId: string }
  | { ok: false; error: "validation" | "lang_required" | "generic" };

type SupabaseAdminClient = NonNullable<ReturnType<typeof createServiceClient>>;

async function resolvePostIdFromPayload(
  supabaseAdmin: SupabaseAdminClient,
  payload: SubmitPayload
): Promise<ResolvedPostIdResult> {
  const rawPostId = normalizeText(payload.post_id);
  if (UUID_PATTERN.test(rawPostId)) {
    return { ok: true, postId: rawPostId };
  }

  const slug = sanitizeSlug(payload.slug);
  if (!slug) {
    return { ok: false, error: "validation" };
  }

  const lang = normalizeLang(payload.lang);

  let query = supabaseAdmin
    .from("content_posts")
    .select("id, lang")
    .eq("slug", slug)
    .eq("published", true)
    .limit(2);

  if (lang) {
    query = query.eq("lang", lang);
  }

  const { data, error } = await query;

  if (error) {
    return { ok: false, error: "generic" };
  }

  const rows = Array.isArray(data) ? data : [];
  if (rows.length === 0) {
    return { ok: false, error: "validation" };
  }

  if (!lang && rows.length > 1) {
    return { ok: false, error: "lang_required" };
  }

  const resolvedRow = rows[0];
  const resolvedId = normalizeText(resolvedRow?.id);
  if (!UUID_PATTERN.test(resolvedId)) {
    return { ok: false, error: "validation" };
  }

  return { ok: true, postId: resolvedId };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { ok: false, error: "method_not_allowed" });
  }

  const supabaseAdmin = createServiceClient();
  if (!supabaseAdmin) {
    return jsonResponse(500, { ok: false, error: "generic" });
  }

  let payload: SubmitPayload = {};
  try {
    payload = (await request.json()) as SubmitPayload;
  } catch {
    return jsonResponse(400, { ok: false, error: "validation" });
  }

  const message = normalizeText(payload.message ?? payload.content);
  const authorName = normalizeText(payload.author_name);
  const honeypot = normalizeText(payload.honeypot);

  if (honeypot.length > 0) {
    return jsonResponse(400, { ok: false, error: "spam" });
  }

  if (!authorName || !message) {
    return jsonResponse(400, { ok: false, error: "validation" });
  }

  if (authorName.length > AUTHOR_MAX_LENGTH || message.length > MESSAGE_MAX_LENGTH) {
    return jsonResponse(400, { ok: false, error: "validation" });
  }

  const resolvedPostId = await resolvePostIdFromPayload(supabaseAdmin, payload);
  if (!resolvedPostId.ok) {
    return jsonResponse(400, { ok: false, error: resolvedPostId.error });
  }

  const requestIp = getIpFromHeaders(request.headers);
  if (requestIp) {
    const ipHash = await sha256Hex(requestIp);
    const windowStartIso = new Date(Date.now() - COOLDOWN_SECONDS * 1000).toISOString();

    const { data: recentRateLimit, error: rateLimitError } = await supabaseAdmin
      .from("comment_rate_limits")
      .select("created_at")
      .eq("ip_hash", ipHash)
      .gte("created_at", windowStartIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (rateLimitError && !isMissingRateLimitTable(rateLimitError)) {
      return jsonResponse(500, { ok: false, error: "generic" });
    }

    if (recentRateLimit?.created_at) {
      return jsonResponse(429, {
        ok: false,
        error: "cooldown",
        seconds: getCooldownSecondsRemaining(recentRateLimit.created_at),
      });
    }

    if (!rateLimitError) {
      const { error: insertRateLimitError } = await supabaseAdmin
        .from("comment_rate_limits")
        .insert({ ip_hash: ipHash });

      if (insertRateLimitError && !isMissingRateLimitTable(insertRateLimitError)) {
        return jsonResponse(500, { ok: false, error: "generic" });
      }
    }
  }

  const { error: insertCommentError } = await supabaseAdmin.from("comments").insert({
    post_id: resolvedPostId.postId,
    author_name: authorName,
    message,
  });

  if (insertCommentError) {
    const insertCode = String(insertCommentError.code ?? "");
    if (insertCode === "23503") {
      return jsonResponse(400, { ok: false, error: "validation" });
    }

    return jsonResponse(500, { ok: false, error: "generic" });
  }

  return jsonResponse(201, { ok: true });
});
