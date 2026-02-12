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
  author_name?: unknown;
  message?: unknown;
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

  const postId = normalizeText(payload.post_id);
  const authorName = normalizeText(payload.author_name);
  const message = normalizeText(payload.message);
  const honeypot = normalizeText(payload.honeypot);

  if (honeypot.length > 0) {
    return jsonResponse(400, { ok: false, error: "spam" });
  }

  if (!UUID_PATTERN.test(postId)) {
    return jsonResponse(400, { ok: false, error: "validation" });
  }

  if (!authorName || !message) {
    return jsonResponse(400, { ok: false, error: "validation" });
  }

  if (authorName.length > AUTHOR_MAX_LENGTH || message.length > MESSAGE_MAX_LENGTH) {
    return jsonResponse(400, { ok: false, error: "validation" });
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
    post_id: postId,
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
