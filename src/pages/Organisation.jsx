import { useTranslation } from "react-i18next";
import Card from "../components/Card";

const taskKeys = [
  "organisation.tasks.preparation",
  "organisation.tasks.plantation",
  "organisation.tasks.buttage",
  "organisation.tasks.watering",
  "organisation.tasks.disease_watch",
  "organisation.tasks.harvest_storage",
];

function Organisation() {
  const { t } = useTranslation();

  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>{t("organisation.title")}</h1>
        <p className="section-intro">{t("organisation.intro")}</p>
      </section>

      <section className="section">
        <Card title={t("organisation.tasks_title")}>
          <ul className="task-list">
            {taskKeys.map((taskKey) => (
              <li key={taskKey}>{t(taskKey)}</li>
            ))}
          </ul>
          <p className="muted-text">{t("organisation.tasks_note")}</p>
        </Card>
      </section>

      <section className="section">
        <Card className="highlight-card">
          <p className="highlight-line">{t("organisation.highlight_questions")}</p>
          <p className="highlight-line">{t("organisation.highlight_join")}</p>
        </Card>
      </section>
    </div>
  );
}

export default Organisation;
