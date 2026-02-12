import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/fr.json";
import nl from "./locales/nl.json";
import {
  buildPathWithLangBeforeHash,
  DEFAULT_LANG,
  getLangFromHref,
  normalizeLang,
  resolvePreferredLang,
  STORAGE_KEY,
} from "./language-utils";

export { DEFAULT_LANG, STORAGE_KEY, SUPPORTED_LANGS } from "./language-utils";
export const WELCOME_SEEN_STORAGE_KEY = "patatos_has_seen_welcome";

export function getStoredLang() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return normalizeLang(stored);
  } catch {
    return "";
  }
}

export function hasSeenWelcome() {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    return window.localStorage.getItem(WELCOME_SEEN_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markWelcomeSeen() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(WELCOME_SEEN_STORAGE_KEY, "1");
  } catch {
    // No-op when storage is unavailable.
  }
}

export function resetWelcomeSeen() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(WELCOME_SEEN_STORAGE_KEY);
  } catch {
    // No-op when storage is unavailable.
  }
}

function getNavigatorCandidates() {
  if (typeof window === "undefined") {
    return [];
  }

  const languages = [];
  const navigatorLanguages = window.navigator?.languages ?? [];

  if (Array.isArray(navigatorLanguages)) {
    languages.push(...navigatorLanguages);
  }

  if (window.navigator?.language) {
    languages.push(window.navigator.language);
  }

  return languages;
}

export function getLangFromUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  return getLangFromHref(window.location.href);
}

export function setStoredLang(lang) {
  const normalizedLang = normalizeLang(lang);

  if (!normalizedLang || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, normalizedLang);
  } catch {
    // No-op when storage is unavailable.
  }
}

export function setLangToUrl(lang) {
  const normalizedLang = normalizeLang(lang);

  if (!normalizedLang || typeof window === "undefined") {
    return;
  }

  const nextPath = buildPathWithLangBeforeHash(window.location.href, normalizedLang);
  if (!nextPath) {
    return;
  }

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextPath === currentPath) {
    return;
  }

  window.history.replaceState({}, "", nextPath);
}

export function applyLanguageSelection(lang, currentLang = "") {
  const normalizedTargetLang = normalizeLang(lang);
  if (!normalizedTargetLang) {
    return;
  }

  const normalizedCurrentLang = normalizeLang(currentLang);

  if (normalizedTargetLang === normalizedCurrentLang) {
    setStoredLang(normalizedTargetLang);
    setLangToUrl(normalizedTargetLang);
    return;
  }

  i18n.changeLanguage(normalizedTargetLang);
}

function resolveInitialLang() {
  if (typeof window === "undefined") {
    return DEFAULT_LANG;
  }

  return resolvePreferredLang({
    href: window.location.href,
    storedLang: getStoredLang(),
    navigatorLanguages: getNavigatorCandidates(),
  });
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
setLangToUrl(initialLang);

i18n.on("languageChanged", (lang) => {
  setStoredLang(lang);
  setLangToUrl(lang);
});

export default i18n;
