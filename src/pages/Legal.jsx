import { useTranslation } from "react-i18next";
import Card from "../components/Card";

function Legal() {
  const { t } = useTranslation();

  return (
    <div className="container page page-block">
      <section className="section section-tight stack">
        <h1 className="page-title">{t("legal.title")}</h1>
      </section>

      <section className="section stack">
        <Card>
          <p>{t("legal.p1")}</p>
          <p>{t("legal.p2")}</p>
          <p>{t("legal.p3")}</p>
        </Card>
      </section>
    </div>
  );
}

export default Legal;
