import { useEffect, useRef, useState } from "react";
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
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const [openAtPath, setOpenAtPath] = useState(null);
  const [theme, setTheme] = useState(() => getStoredTheme() || getSystemTheme());
  const [hasThemePreference, setHasThemePreference] = useState(() => Boolean(getStoredTheme()));
  const [logoFailed, setLogoFailed] = useState(false);
  const [wordmarkFailed, setWordmarkFailed] = useState(false);
  const isOpen = openAtPath === pathname;
  const currentLang = i18n.resolvedLanguage || i18n.language || DEFAULT_LANG;
  const currentLangCode = currentLang.toLowerCase().startsWith("nl") ? "nl" : "fr";
  const nextLang = currentLangCode === "fr" ? "nl" : "fr";
  const nextLangFlag = nextLang === "fr" ? "\u{1F1EB}\u{1F1F7}" : "\u{1F1F3}\u{1F1F1}";
  const nextLangAriaLabel = nextLang === "fr" ? t("nav.lang_to_fr") : t("nav.lang_to_nl");
  const logoSrc = `${import.meta.env.BASE_URL}brand/logo-team-patates-patatos.svg`;
  const wordmarkSrc = `${import.meta.env.BASE_URL}brand/wordmark-team-patates-patatos.svg`;

  const isDarkTheme = theme === "dark";
  const nextTheme = isDarkTheme ? "light" : "dark";
  const nextThemeIcon = isDarkTheme ? "\u2600\uFE0F" : "\u{1F319}";
  const nextThemeAriaLabel = isDarkTheme ? t("nav.theme_to_light") : t("nav.theme_to_dark");

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
    if (!isOpen || typeof document === "undefined") {
      return undefined;
    }

    const onPointerDown = (event) => {
      const headerEl = headerRef.current;
      if (headerEl && !headerEl.contains(event.target)) {
        setOpenAtPath(null);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(min-width: 881px)");
    const onViewportChange = (event) => {
      if (event.matches) {
        setOpenAtPath(null);
      }
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", onViewportChange);
      return () => mediaQuery.removeEventListener("change", onViewportChange);
    }

    mediaQuery.addListener(onViewportChange);
    return () => mediaQuery.removeListener(onViewportChange);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      if (!window.matchMedia("(max-width: 880px)").matches) {
        return;
      }

      const firstLink = navRef.current?.querySelector("a");
      if (firstLink instanceof HTMLElement) {
        firstLink.focus();
      }
    });

    return () => window.cancelAnimationFrame(frame);
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

    if (lang !== currentLangCode) {
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
    <header ref={headerRef} className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label={t("nav.go_home")} onClick={() => setOpenAtPath(null)}>
          <span className="brand-mark">
            {logoFailed ? (
              <span className="brand-logo-fallback" aria-hidden="true">
                {"\u{1F954}"}
              </span>
            ) : (
              <img
                className="brand-logo"
                src={logoSrc}
                alt={t("nav.brand_alt")}
                loading="eager"
                decoding="async"
                onError={() => setLogoFailed(true)}
              />
            )}
          </span>
          {wordmarkFailed ? (
            <span className="brand-wordmark-fallback">{t("nav.brand")}</span>
          ) : (
            <img
              className="brand-wordmark"
              src={wordmarkSrc}
              alt={t("nav.brand_wordmark_alt")}
              loading="eager"
              decoding="async"
              onError={() => setWordmarkFailed(true)}
            />
          )}
        </Link>

        <nav ref={navRef} id="main-navigation" className={`site-nav${isOpen ? " is-open" : ""}`}>
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
            <button
              type="button"
              className={`lang-btn theme-toggle-btn ${isDarkTheme ? "is-style-dark" : "is-style-light"}`}
              aria-label={nextThemeAriaLabel}
              aria-pressed={isDarkTheme}
              title={nextThemeAriaLabel}
              onClick={() => handleThemeChange(nextTheme)}
            >
              <span className="theme-icon" aria-hidden="true">
                {nextThemeIcon}
              </span>
            </button>
          </div>

          <div className="lang-switch header-language-switch" role="group" aria-label={t("nav.language")}>
            <button
              type="button"
              className="lang-btn lang-toggle-btn"
              aria-label={nextLangAriaLabel}
              title={nextLangAriaLabel}
              onClick={() => handleLanguageChange(nextLang)}
            >
              <span className="lang-flag" aria-hidden="true">
                {nextLangFlag}
              </span>
            </button>
          </div>
        </div>

        <button
          type="button"
          className={`burger-btn${isOpen ? " is-open" : ""}`}
          aria-expanded={isOpen}
          aria-controls="main-navigation"
          aria-label={isOpen ? t("nav.close_menu") : t("nav.open_menu")}
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
