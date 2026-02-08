import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_LANG, hasSeenWelcome, markWelcomeSeen, setLangToUrl, setStoredLang } from "../i18n";

function normalizeCurrentLang(lang) {
  if (typeof lang !== "string" || lang.trim().length === 0) {
    return DEFAULT_LANG;
  }

  return lang.toLowerCase().startsWith("nl") ? "nl" : "fr";
}

function WelcomeModal({ openNonce = 0 }) {
  const { t, i18n } = useTranslation();
  const dialogRef = useRef(null);
  const primaryActionRef = useRef(null);
  const previousFocusRef = useRef(null);
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return !hasSeenWelcome();
  });
  const wordmarkSrc = useMemo(
    () => `${import.meta.env.BASE_URL}team/logo2_wide.transparent-v2.png`,
    []
  );

  const closeModal = useCallback(() => {
    setIsOpen(false);
    markWelcomeSeen();
  }, []);

  const handleLanguageSelect = useCallback(
    (lang) => {
      const nextLang = lang === "nl" ? "nl" : "fr";
      const currentLang = normalizeCurrentLang(i18n.resolvedLanguage || i18n.language || DEFAULT_LANG);

      if (nextLang !== currentLang) {
        i18n.changeLanguage(nextLang);
      }

      setStoredLang(nextLang);
      setLangToUrl(nextLang);
      closeModal();
    },
    [closeModal, i18n]
  );

  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      primaryActionRef.current?.focus();
    });

    const getFocusableElements = () => {
      const root = dialogRef.current;
      if (!root) {
        return [];
      }

      return Array.from(
        root.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute("disabled"));
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstElement || !dialogRef.current?.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [closeModal, isOpen]);

  useEffect(() => {
    if (openNonce <= 0 || typeof window === "undefined") {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      setIsOpen(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [openNonce]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="welcome-modal-overlay" role="presentation">
      <section
        ref={dialogRef}
        className="welcome-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        aria-describedby="welcome-copy"
        tabIndex={-1}
      >
        <button type="button" className="welcome-close-btn" aria-label={t("welcome.close")} onClick={closeModal}>
          {"\u00D7"}
        </button>

        <img className="welcome-image" src={wordmarkSrc} alt={t("welcome.image_alt")} loading="eager" decoding="async" />

        <h2 id="welcome-title" className="welcome-title">
          <span>{t("welcome.title")}</span>
          <span className="welcome-secondary">{t("welcome.title_other")}</span>
        </h2>

        <p id="welcome-copy" className="welcome-copy">
          <span>{t("welcome.subtitle")}</span>
          <span className="welcome-copy-secondary">{t("welcome.subtitle_other")}</span>
        </p>

        <div className="welcome-actions" role="group" aria-label={t("welcome.actions_aria")}>
          <button
            ref={primaryActionRef}
            type="button"
            className="welcome-lang-btn"
            aria-label={t("welcome.choose_fr_aria")}
            onClick={() => handleLanguageSelect("fr")}
          >
            {t("welcome.choose_fr")}
          </button>
          <button
            type="button"
            className="welcome-lang-btn"
            aria-label={t("welcome.choose_nl_aria")}
            onClick={() => handleLanguageSelect("nl")}
          >
            {t("welcome.choose_nl")}
          </button>
        </div>
      </section>
    </div>
  );
}

export default WelcomeModal;
