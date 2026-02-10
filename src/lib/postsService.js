import { isSupabaseConfigured, supabase } from "./supabaseClient";

const POSTS_SELECT_COLUMNS = "id, slug, lang, title, excerpt, body, created_at, updated_at";
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

function getCreateCommentErrorKey(error) {
  const message = String(error?.message ?? "").toLowerCase();

  if (message.includes("network") || message.includes("fetch")) {
    return "commentForm.errors.network";
  }

  return "commentForm.errors.generic";
}

export async function fetchPublishedPosts(lang) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const resolvedLang = normalizeUiLang(lang);
    const { data, error } = await supabase
      .from("content_posts")
      .select(POSTS_SELECT_COLUMNS)
      .eq("lang", resolvedLang)
      .eq("published", true)
      .order("updated_at", { ascending: false });

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

    const { data, error } = await supabase
      .from("content_posts")
      .select(POSTS_SELECT_COLUMNS)
      .eq("lang", resolvedLang)
      .eq("slug", resolvedSlug)
      .eq("published", true)
      .limit(1)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data ?? null;
  } catch {
    return null;
  }
}

export async function createComment({ lang, slug, postId, authorName, message }) {
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

    if (!resolvedLang || !resolvedSlug) {
      return { ok: false, errorKey: "commentForm.errors.generic" };
    }

    const { error } = await supabase
      .from("comments")
      .insert({
        post_id: resolvedPostId,
        author_name: resolvedAuthor,
        message: resolvedMessage,
      })
      .select("id")
      .single();

    if (error) {
      return { ok: false, errorKey: getCreateCommentErrorKey(error) };
    }

    return { ok: true };
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
