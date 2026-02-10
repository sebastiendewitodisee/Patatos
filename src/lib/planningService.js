import { isSupabaseConfigured, supabase } from "./supabaseClient";

const PLANNING_SELECT_V2 = "id, lang, title, description, period, status, sort_order, updated_at, phase_id, type";
const PLANNING_SELECT_V1 = "id, lang, title, description, period, status, sort_order, updated_at";

function normalizeLang(lang) {
  if (typeof lang !== "string") {
    return "fr";
  }

  return lang.toLowerCase().startsWith("nl") ? "nl" : "fr";
}

function isMissingColumnError(error) {
  const code = String(error?.code ?? "");
  const message = String(error?.message ?? "").toLowerCase();

  return code === "42703" || (message.includes("column") && message.includes("does not exist"));
}

async function selectPlanningItems(resolvedLang, columns) {
  return supabase
    .from("planning_items")
    .select(columns)
    .eq("lang", resolvedLang)
    .order("sort_order", { ascending: true });
}

export async function fetchPlanningItemsFromSupabase(lang) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const resolvedLang = normalizeLang(lang);
    let { data, error } = await selectPlanningItems(resolvedLang, PLANNING_SELECT_V2);

    if (error && isMissingColumnError(error)) {
      ({ data, error } = await selectPlanningItems(resolvedLang, PLANNING_SELECT_V1));
    }

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
