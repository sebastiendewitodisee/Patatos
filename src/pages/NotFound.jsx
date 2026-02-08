import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>404</h1>
        <p className="section-intro">{t("not_found.message")}</p>
        <Link to="/" className="btn btn-primary">
          {t("not_found.back_home")}
        </Link>
      </section>
    </div>
  );
}

export default NotFound;
