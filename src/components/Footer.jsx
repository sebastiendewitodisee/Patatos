import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { applyLanguageSelection, DEFAULT_LANG } from "../i18n";

function Footer({ onReopenWelcome }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage || i18n.language || DEFAULT_LANG;
  const currentLangCode = currentLang.toLowerCase().startsWith("nl") ? "nl" : "fr";

  const handleLanguageChange = (lang) => {
    if (!lang) {
      return;
    }

    applyLanguageSelection(lang, currentLangCode);
  };

  const handleReopenWelcome = () => {
    if (typeof onReopenWelcome === "function") {
      onReopenWelcome();
    }
  };

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-meta">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <Link to="/legal" className="footer-link">
            {t("footer.legal")}
          </Link>
        </div>

        <section className="footer-preferences" aria-label={t("footer.preferences_title")}>
          <p className="footer-pref-title">{t("footer.preferences_title")}</p>
          <div className="footer-pref-row">
            <span className="footer-pref-label">{t("footer.language")}</span>
            <div className="lang-switch footer-lang-switch" role="group" aria-label={t("footer.language")}>
              <button
                type="button"
                className={`lang-btn${currentLangCode === "fr" ? " is-active" : ""}`}
                aria-label={t("nav.lang_to_fr")}
                onClick={() => handleLanguageChange("fr")}
              >
                {t("nav.lang_fr")}
              </button>
              <button
                type="button"
                className={`lang-btn${currentLangCode === "nl" ? " is-active" : ""}`}
                aria-label={t("nav.lang_to_nl")}
                onClick={() => handleLanguageChange("nl")}
              >
                {t("nav.lang_nl")}
              </button>
            </div>
          </div>

          <button type="button" className="footer-reopen-btn" onClick={handleReopenWelcome}>
            {t("welcome.reopen")}
          </button>
        </section>
      </div>
    </footer>
  );
}

export default Footer;
