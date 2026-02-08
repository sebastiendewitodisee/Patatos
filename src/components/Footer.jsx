import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        <Link to="/legal" className="footer-link">
          {t("footer.legal")}
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
