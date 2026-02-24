import { isSupabaseConfigured, supabase } from "./supabaseClient";

const POSTS_SELECT_COLUMNS = "id, slug, lang, title, excerpt, body, created_at, updated_at";
const LATEST_POSTS_SELECT_COLUMNS = "id, slug, lang, title, excerpt, body, updated_at";
const APPROVED_COMMENTS_SELECT_COLUMNS = "id, author_name, message, created_at";

function normalizeUiLang(lang) {
  if (typeof lang !== "string") {
    return "fr";
  }

  return lang.toLowerCase().startsWith("nl") ? "nl" : "fr";
}

function sanitizeSlug(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getFallbackLang(lang) {
  return normalizeUiLang(lang) === "nl" ? "fr" : "nl";
}

function getCreateCommentErrorKey(error) {
  const message = String(error?.message ?? "").toLowerCase();

  if (message.includes("network") || message.includes("fetch")) {
    return "commentForm.errors.network";
  }

  return "commentForm.errors.generic";
}

function resolveCooldownSeconds(value) {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return 60;
  }

  return Math.max(1, Math.ceil(parsedValue));
}

function getFunctionPayloadResult(payload, statusCode) {
  const payloadError = String(payload?.error ?? payload?.code ?? "").toLowerCase();

  if (payloadError === "lang_required") {
    return {
      ok: false,
      errorKey: "commentForm.errors.generic",
      errorSeconds: null,
      shouldFallbackToInsert: false,
    };
  }

  if (statusCode === 429 || payloadError === "cooldown") {
    return {
      ok: false,
      errorKey: "commentForm.errors.cooldown",
      errorSeconds: resolveCooldownSeconds(payload?.seconds),
      shouldFallbackToInsert: false,
    };
  }

  if (statusCode === 400 || payloadError === "validation" || payloadError === "spam") {
    return {
      ok: false,
      errorKey: "commentForm.errors.spam",
      errorSeconds: null,
      shouldFallbackToInsert: false,
    };
  }

  return {
    ok: false,
    errorKey: "commentForm.errors.generic",
    errorSeconds: null,
    shouldFallbackToInsert: false,
  };
}

async function getFunctionInvokeErrorResult(error) {
  const message = String(error?.message ?? "").toLowerCase();
  let statusCode = 0;
  let payload = null;

  try {
    const responseContext = error?.context;
    if (responseContext && typeof responseContext.status === "number") {
      statusCode = responseContext.status;
    }

    if (responseContext && typeof responseContext.clone === "function") {
      payload = await responseContext.clone().json();
    }
  } catch {
    payload = null;
  }

  if (statusCode === 404 || (message.includes("404") && message.includes("function"))) {
    return {
      ok: false,
      errorKey: "commentForm.errors.generic",
      errorSeconds: null,
      shouldFallbackToInsert: true,
    };
  }

  if (statusCode === 429 || statusCode === 400 || payload) {
    return getFunctionPayloadResult(payload, statusCode);
  }

  if (message.includes("network") || message.includes("fetch")) {
    return {
      ok: false,
      errorKey: "commentForm.errors.network",
      errorSeconds: null,
      shouldFallbackToInsert: false,
    };
  }

  return {
    ok: false,
    errorKey: "commentForm.errors.generic",
    errorSeconds: null,
    shouldFallbackToInsert: false,
  };
}

async function createCommentViaDirectInsert({ postId, authorName, message }) {
  const { error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      author_name: authorName,
      message,
    })
    .select("id")
    .single();

  if (error) {
    return {
      ok: false,
      errorKey: getCreateCommentErrorKey(error),
      errorSeconds: null,
    };
  }

  return { ok: true };
}

async function fetchPublishedPostsByLang(resolvedLang) {
  const { data, error } = await supabase
    .from("content_posts")
    .select(POSTS_SELECT_COLUMNS)
    .eq("lang", resolvedLang)
    .eq("published", true)
    .order("updated_at", { ascending: false });

  if (error) {
    return { ok: false, data: null };
  }

  return {
    ok: true,
    data: Array.isArray(data) ? data : [],
  };
}

async function fetchPublishedPostBySlugInLang(resolvedLang, resolvedSlug) {
  const { data, error } = await supabase
    .from("content_posts")
    .select(POSTS_SELECT_COLUMNS)
    .eq("lang", resolvedLang)
    .eq("slug", resolvedSlug)
    .eq("published", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    return { ok: false, data: null };
  }

  return {
    ok: true,
    data: data ?? null,
  };
}

async function createCommentViaEdgeFunction({ postId, lang, slug, authorName, message, honeypot }) {
  try {
    const { data, error } = await supabase.functions.invoke("submit-comment", {
      body: {
        post_id: postId,
        lang: lang || undefined,
        slug: slug || undefined,
        author_name: authorName,
        message,
        honeypot: String(honeypot ?? ""),
      },
    });

    if (!error) {
      if (data?.ok === false) {
        return getFunctionPayloadResult(data, 200);
      }

      return { ok: true };
    }

    return getFunctionInvokeErrorResult(error);
  } catch {
    return {
      ok: false,
      errorKey: "commentForm.errors.network",
      errorSeconds: null,
      shouldFallbackToInsert: false,
    };
  }
}

export async function fetchPublishedPosts(lang) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const resolvedLang = normalizeUiLang(lang);
    const response = await fetchPublishedPostsByLang(resolvedLang);

    if (!response.ok) {
      return null;
    }

    if (response.data.length === 0) {
      return [];
    }

    return response.data;
  } catch {
    return null;
  }
}

export async function fetchPublishedPostsWithLangFallback(lang) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const requestedLang = normalizeUiLang(lang);
    const fallbackLang = getFallbackLang(requestedLang);

    const primaryResponse = await fetchPublishedPostsByLang(requestedLang);
    if (!primaryResponse.ok) {
      return null;
    }

    if (primaryResponse.data.length > 0) {
      return {
        posts: primaryResponse.data,
        requestedLang,
        displayedLang: requestedLang,
        fallbackUsed: false,
      };
    }

    const fallbackResponse = await fetchPublishedPostsByLang(fallbackLang);
    if (!fallbackResponse.ok) {
      return null;
    }

    return {
      posts: fallbackResponse.data,
      requestedLang,
      displayedLang: fallbackResponse.data.length > 0 ? fallbackLang : requestedLang,
      fallbackUsed: fallbackResponse.data.length > 0,
    };
  } catch {
    return null;
  }
}

export async function fetchLatestPublishedPosts(lang, limit = 3) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const resolvedLang = normalizeUiLang(lang);
    const limitValue = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.floor(Number(limit)) : 3;

    const { data, error } = await supabase
      .from("content_posts")
      .select(LATEST_POSTS_SELECT_COLUMNS)
      .eq("lang", resolvedLang)
      .eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(limitValue);

    if (error) {
      return null;
    }

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data;
  } catch {
    return null;
  }
}

export async function fetchPublishedPostBySlug(lang, slug) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const resolvedLang = normalizeUiLang(lang);
    const resolvedSlug = sanitizeSlug(slug);

    if (!resolvedSlug) {
      return null;
    }

    const response = await fetchPublishedPostBySlugInLang(resolvedLang, resolvedSlug);
    if (!response.ok) {
      return null;
    }

    return response.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchPublishedPostBySlugWithLangFallback(lang, slug) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const requestedLang = normalizeUiLang(lang);
    const fallbackLang = getFallbackLang(requestedLang);
    const resolvedSlug = sanitizeSlug(slug);

    if (!resolvedSlug) {
      return {
        post: null,
        requestedLang,
        displayedLang: requestedLang,
        fallbackUsed: false,
      };
    }

    const primaryResponse = await fetchPublishedPostBySlugInLang(requestedLang, resolvedSlug);
    if (!primaryResponse.ok) {
      return null;
    }

    if (primaryResponse.data) {
      return {
        post: primaryResponse.data,
        requestedLang,
        displayedLang: requestedLang,
        fallbackUsed: false,
      };
    }

    const fallbackResponse = await fetchPublishedPostBySlugInLang(fallbackLang, resolvedSlug);
    if (!fallbackResponse.ok) {
      return null;
    }

    if (fallbackResponse.data) {
      return {
        post: fallbackResponse.data,
        requestedLang,
        displayedLang: fallbackLang,
        fallbackUsed: true,
      };
    }

    return {
      post: null,
      requestedLang,
      displayedLang: requestedLang,
      fallbackUsed: false,
    };
  } catch {
    return null;
  }
}

export async function createComment({ lang, slug, postId, authorName, message, honeypot }) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, errorKey: "commentForm.unavailable_body" };
  }

  try {
    const resolvedLang = normalizeUiLang(lang);
    const resolvedSlug = sanitizeSlug(slug);
    const resolvedPostId = String(postId ?? "").trim();
    const resolvedAuthor = String(authorName ?? "").trim();
    const resolvedMessage = String(message ?? "").trim();

    if (!resolvedPostId || !resolvedAuthor || !resolvedMessage) {
      return { ok: false, errorKey: "commentForm.errors.required" };
    }

    if (resolvedAuthor.length > 120 || resolvedMessage.length > 2000) {
      return { ok: false, errorKey: "commentForm.errors.required" };
    }

    const functionResult = await createCommentViaEdgeFunction({
      postId: resolvedPostId,
      lang: resolvedLang,
      slug: resolvedSlug,
      authorName: resolvedAuthor,
      message: resolvedMessage,
      honeypot,
    });

    if (functionResult?.ok) {
      return { ok: true };
    }

    if (functionResult?.shouldFallbackToInsert) {
      return createCommentViaDirectInsert({
        postId: resolvedPostId,
        authorName: resolvedAuthor,
        message: resolvedMessage,
      });
    }

    return {
      ok: false,
      errorKey: functionResult?.errorKey ?? "commentForm.errors.generic",
      errorSeconds: functionResult?.errorSeconds ?? null,
    };
  } catch {
    return { ok: false, errorKey: "commentForm.errors.generic" };
  }
}

export async function fetchApprovedCommentsByPostId(postId) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const resolvedPostId = String(postId ?? "").trim();

    if (!resolvedPostId) {
      return [];
    }

    const { data, error } = await supabase
      .from("comments")
      .select(APPROVED_COMMENTS_SELECT_COLUMNS)
      .eq("post_id", resolvedPostId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      return null;
    }

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data;
  } catch {
    return null;
  }
}
