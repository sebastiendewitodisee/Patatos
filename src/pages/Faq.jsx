import { useTranslation } from "react-i18next";
import { faqItems } from "../data/faq";

function Faq() {
  const { t } = useTranslation();

  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>{t("faq.title")}</h1>
        <p className="section-intro">{t("faq.intro")}</p>
      </section>

      <section className="section">
        <div className="faq-list">
          {faqItems.map((item) => (
            <details key={item.id} className="faq-item">
              <summary>{t(item.questionKey)}</summary>
              <p>{t(item.answerKey)}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Faq;
