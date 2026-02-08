import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/fr.json";
import nl from "./locales/nl.json";

export const STORAGE_KEY = "patatos_lang";
export const SUPPORTED_LANGS = ["fr", "nl"];
export const DEFAULT_LANG = "fr";

function isSupportedLang(lang) {
  return typeof lang === "string" && SUPPORTED_LANGS.includes(lang);
}

function getHashRouteData(hashValue = "") {
  const normalizedHash = (hashValue || "").replace(/^#/, "");
  const [rawPath = "/", rawQuery = ""] = normalizedHash.split("?");

  return {
    path: rawPath || "/",
    params: new URLSearchParams(rawQuery),
  };
}

function getStoredLang() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isSupportedLang(stored) ? stored : "";
  } catch {
    return "";
  }
}

export function getLangFromUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  const url = new URL(window.location.href);
  const searchLang = url.searchParams.get("lang");
  if (isSupportedLang(searchLang)) {
    return searchLang;
  }

  const { params } = getHashRouteData(url.hash);
  const hashLang = params.get("lang");

  return isSupportedLang(hashLang) ? hashLang : "";
}

export function setStoredLang(lang) {
  if (!isSupportedLang(lang) || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // No-op when storage is unavailable.
  }
}

export function setLangToUrl(lang) {
  if (!isSupportedLang(lang) || typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  const baseSearchParams = new URLSearchParams(url.search);
  baseSearchParams.delete("lang");

  const { path, params } = getHashRouteData(url.hash);
  params.set("lang", lang);

  const nextHash = `${path}${params.toString() ? `?${params.toString()}` : ""}`;
  const nextSearch = baseSearchParams.toString();
  const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ""}#${nextHash}`;

  window.history.replaceState({}, "", nextUrl);
}

function resolveInitialLang() {
  const langFromUrl = getLangFromUrl();
  if (isSupportedLang(langFromUrl)) {
    return langFromUrl;
  }

  const storedLang = getStoredLang();
  if (isSupportedLang(storedLang)) {
    return storedLang;
  }

  return DEFAULT_LANG;
}

const initialLang = resolveInitialLang();

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    nl: { translation: nl },
  },
  lng: initialLang,
  fallbackLng: DEFAULT_LANG,
  interpolation: {
    escapeValue: false,
  },
});

setStoredLang(initialLang);

i18n.on("languageChanged", (lang) => {
  setStoredLang(lang);
});

export default i18n;
