import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DEFAULT_LANG, getLangFromUrl, setLangToUrl, setStoredLang } from "../i18n";

const navItems = [
  { to: "/", key: "home" },
  { to: "/planning", key: "planning" },
  { to: "/equipe", key: "team" },
  { to: "/varietes", key: "varieties" },
  { to: "/organisation", key: "organisation" },
  { to: "/faq", key: "faq" },
  { to: "/contact", key: "contact" },
];

function Header() {
  const { pathname, search } = useLocation();
  const { t, i18n } = useTranslation();
  const [openAtPath, setOpenAtPath] = useState(null);
  const isOpen = openAtPath === pathname;
  const currentLang = i18n.resolvedLanguage || i18n.language || DEFAULT_LANG;

  const languageItems = useMemo(
    () => [
      { value: "fr", label: t("nav.lang_fr"), ariaLabel: t("nav.switch_to_fr") },
      { value: "nl", label: t("nav.lang_nl"), ariaLabel: t("nav.switch_to_nl") },
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
    const langFromUrl = getLangFromUrl();

    if (langFromUrl && langFromUrl !== currentLang) {
      i18n.changeLanguage(langFromUrl);
      setStoredLang(langFromUrl);
      return;
    }

    if (!langFromUrl) {
      setLangToUrl(currentLang);
    }
  }, [currentLang, i18n, pathname, search]);

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

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label={t("nav.go_home")} onClick={() => setOpenAtPath(null)}>
          <span className="brand-mark" aria-hidden="true">
            🥔
          </span>
          <span>{t("nav.brand")}</span>
        </Link>

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

          <div className="lang-switch" role="group" aria-label={t("nav.language")}>
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
        </nav>
      </div>
    </header>
  );
}

export default Header;
