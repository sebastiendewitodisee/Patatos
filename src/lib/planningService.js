import { isSupabaseConfigured, supabase } from "./supabaseClient";

function normalizeLang(lang) {
  if (typeof lang !== "string") {
    return "fr";
  }

  return lang.toLowerCase().startsWith("nl") ? "nl" : "fr";
}

export async function fetchPlanningItemsFromSupabase(lang) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const resolvedLang = normalizeLang(lang);
    const { data, error } = await supabase
      .from("planning_items")
      .select("id, lang, title, description, period, status, sort_order, updated_at")
      .eq("lang", resolvedLang)
      .order("sort_order", { ascending: true });

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
