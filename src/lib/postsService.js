import { isSupabaseConfigured, supabase } from "./supabaseClient";

const POSTS_SELECT_COLUMNS = "id, slug, lang, title, excerpt, body, created_at, updated_at";

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
