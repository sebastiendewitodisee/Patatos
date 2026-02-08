import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DEFAULT_LANG, setLangToUrl, setStoredLang } from "../i18n";

const THEME_STORAGE_KEY = "patatos_theme";
const THEMES = ["dark", "light"];

const navItems = [
  { to: "/", key: "home" },
  { to: "/planning", key: "planning" },
  { to: "/equipe", key: "team" },
  { to: "/varietes", key: "varieties" },
  { to: "/organisation", key: "organisation" },
  { to: "/faq", key: "faq" },
  { to: "/contact", key: "contact" },
];

function getStoredTheme() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return THEMES.includes(storedTheme) ? storedTheme : null;
}

function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle("theme-light", theme === "light");
  root.classList.toggle("theme-dark", theme === "dark");
}

function Header() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const [openAtPath, setOpenAtPath] = useState(null);
  const [theme, setTheme] = useState(() => getStoredTheme() || getSystemTheme());
  const [hasThemePreference, setHasThemePreference] = useState(() => Boolean(getStoredTheme()));
  const isOpen = openAtPath === pathname;
  const currentLang = i18n.resolvedLanguage || i18n.language || DEFAULT_LANG;

  if (import.meta.env.DEV) {
    console.log("HEADER_RENDER_VERSION_2026-02-08_A", { isOpen });
  }

  const languageItems = useMemo(
    () => [
      { value: "fr", label: t("nav.lang_fr"), ariaLabel: t("nav.switch_to_fr") },
      { value: "nl", label: t("nav.lang_nl"), ariaLabel: t("nav.switch_to_nl") },
    ],
    [t]
  );

  const themeItems = useMemo(
    () => [
      { value: "dark", label: t("nav.theme_dark"), ariaLabel: t("nav.switch_to_dark") },
      { value: "light", label: t("nav.theme_light"), ariaLabel: t("nav.switch_to_light") },
    ],
    [t]
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenAtPath(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    applyTheme(theme);

    if (typeof window === "undefined") {
      return;
    }

    if (hasThemePreference) {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      return;
    }

    window.localStorage.removeItem(THEME_STORAGE_KEY);
  }, [hasThemePreference, theme]);

  useEffect(() => {
    if (hasThemePreference || typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const onThemeChange = (event) => {
      setTheme(event.matches ? "light" : "dark");
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", onThemeChange);
      return () => mediaQuery.removeEventListener("change", onThemeChange);
    }

    mediaQuery.addListener(onThemeChange);
    return () => mediaQuery.removeListener(onThemeChange);
  }, [hasThemePreference]);

  const handleLanguageChange = (lang) => {
    if (!lang) {
      return;
    }

    if (lang !== currentLang) {
      i18n.changeLanguage(lang);
    }

    setStoredLang(lang);
    setLangToUrl(lang);
    setOpenAtPath(null);
  };

  const handleThemeChange = (nextTheme) => {
    if (!THEMES.includes(nextTheme)) {
      return;
    }

    setTheme(nextTheme);
    setHasThemePreference(true);
    setOpenAtPath(null);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label={t("nav.go_home")} onClick={() => setOpenAtPath(null)}>
          <span className="brand-mark" aria-hidden="true">
            🥔
          </span>
          <span className="brand-label">{t("nav.brand")}</span>
        </Link>

        {import.meta.env.DEV ? (
          <span
            className="muted-text"
            style={{ fontSize: "0.62rem", lineHeight: 1, whiteSpace: "nowrap" }}
            data-dev-header-version="HEADER_VERSION_2026-02-08_A"
          >
            HEADER_VERSION_2026-02-08_A
          </span>
        ) : null}

        <nav id="main-navigation" className={`site-nav${isOpen ? " is-open" : ""}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
              onClick={() => setOpenAtPath(null)}
            >
              {t(`nav.${item.key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="header-controls">
          <div className="lang-switch theme-switch header-theme-switch" role="group" aria-label={t("nav.theme")}>
            {themeItems.map((themeItem) => (
              <button
                key={themeItem.value}
                type="button"
                className={`lang-btn${theme === themeItem.value ? " is-active" : ""}`}
                aria-label={themeItem.ariaLabel}
                aria-pressed={theme === themeItem.value}
                onClick={() => handleThemeChange(themeItem.value)}
              >
                <span className="theme-label-desktop">{themeItem.label}</span>
                <span className="theme-label-mobile" aria-hidden="true">
                  {themeItem.value === "dark" ? "🌙" : "☀️"}
                </span>
              </button>
            ))}
          </div>

          <div className="lang-switch header-language-switch" role="group" aria-label={t("nav.language")}>
            {languageItems.map((language) => (
              <button
                key={language.value}
                type="button"
                className={`lang-btn${currentLang === language.value ? " is-active" : ""}`}
                aria-label={language.ariaLabel}
                onClick={() => handleLanguageChange(language.value)}
              >
                {language.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={`burger-btn${isOpen ? " is-open" : ""}`}
          aria-expanded={isOpen}
          aria-controls="main-navigation"
          aria-label={t("nav.open_menu")}
          onClick={() => setOpenAtPath(isOpen ? null : pathname)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export default Header;
