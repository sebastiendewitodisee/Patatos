export const STORAGE_KEY = "patatos_lang";
export const SUPPORTED_LANGS = ["fr", "nl"];
export const DEFAULT_LANG = "fr";

export function normalizeLang(lang) {
  if (typeof lang !== "string" || lang.trim().length === 0) {
    return "";
  }

  const normalized = lang.trim().toLowerCase().replace(/_/g, "-");
  const [baseLang = ""] = normalized.split("-");

  return SUPPORTED_LANGS.includes(baseLang) ? baseLang : "";
}

export function isSupportedLang(lang) {
  return Boolean(normalizeLang(lang));
}

function getHashParams(hashValue = "") {
  const normalizedHash = (hashValue || "").replace(/^#/, "");
  const [, hashQuery = ""] = normalizedHash.split("?");
  return new URLSearchParams(hashQuery);
}

function buildUrlObject(href) {
  if (typeof href !== "string" || href.trim().length === 0) {
    return null;
  }

  try {
    return new URL(href, "http://localhost");
  } catch {
    return null;
  }
}

export function getLangFromHref(href) {
  const url = buildUrlObject(href);
  if (!url) {
    return "";
  }

  const searchLang = normalizeLang(url.searchParams.get("lang"));
  if (searchLang) {
    return searchLang;
  }

  return normalizeLang(getHashParams(url.hash).get("lang"));
}

export function getLangFromNavigator(navigatorLanguages = []) {
  const candidates = Array.isArray(navigatorLanguages) ? navigatorLanguages : [navigatorLanguages];

  for (const candidate of candidates) {
    const normalized = normalizeLang(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

export function resolvePreferredLang({ href = "", storedLang = "", navigatorLanguages = [] } = {}) {
  const langFromUrl = getLangFromHref(href);
  if (langFromUrl) {
    return langFromUrl;
  }

  const langFromStorage = normalizeLang(storedLang);
  if (langFromStorage) {
    return langFromStorage;
  }

  const langFromNavigator = getLangFromNavigator(navigatorLanguages);
  if (langFromNavigator) {
    return langFromNavigator;
  }

  return DEFAULT_LANG;
}

export function buildPathWithLangBeforeHash(href, lang) {
  const normalizedLang = normalizeLang(lang);
  const url = buildUrlObject(href);

  if (!normalizedLang || !url) {
    return "";
  }

  const searchParams = new URLSearchParams(url.search);
  searchParams.set("lang", normalizedLang);

  const nextSearch = searchParams.toString();
  return `${url.pathname}${nextSearch ? `?${nextSearch}` : ""}${url.hash}`;
}
