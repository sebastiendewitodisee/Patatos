import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Badge from "../components/Badge";
import Card from "../components/Card";
import { planningEvents, STATUS_META } from "../data/planning";
import {
  formatDateFr,
  getEffectiveStatus,
  getEventScheduleLabel,
  getIndicativeValidationMessage,
  getLatestUpdates,
  getUpcomingEvent,
  isEventIndicative,
} from "../utils/planning";

function Home() {
  const { t } = useTranslation();
  const latestUpdates = getLatestUpdates(planningEvents, 3);
  const upcomingEvent = getUpcomingEvent(planningEvents);
  const dateFallback = t("planning.fallbacks.date_tbc");
  const periodFallback = t("planning.fallbacks.period_tbc");
  const validationFallback = t("planning.fallbacks.validation");

  return (
    <div className="container page-block home-page">
      <section className="hero-panel">
        <p className="eyebrow">{t("home.eyebrow")}</p>
        <h1>
          {t("home.title")} <span aria-hidden="true">🥔</span>
        </h1>
        <p className="hero-copy">{t("home.subtitle")}</p>

        <div className="cta-row">
          <Link to="/planning" className="btn btn-primary">
            {t("home.cta_planning")}
          </Link>
          <Link to="/equipe" className="btn">
            {t("home.cta_team")}
          </Link>
          <Link to="/varietes" className="btn btn-ghost">
            {t("home.cta_varieties")}
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>{t("home.concept_title")}</h2>
        <div className="grid three-columns">
          <Card title={t("home.concept_simple_title")}>{t("home.concept_simple_text")}</Card>
          <Card title={t("home.concept_fun_title")}>{t("home.concept_fun_text")}</Card>
          <Card title={t("home.concept_efficient_title")}>{t("home.concept_efficient_text")}</Card>
        </div>
      </section>

      <section className="section">
        <h2>{t("home.latest_updates_title")}</h2>
        <div className="grid three-columns">
          {latestUpdates.map((item) => {
            const statusKey = getEffectiveStatus(item);
            const status = STATUS_META[statusKey] ?? STATUS_META.todo;

            return (
              <Card key={item.id} title={item.title}>
                <p className="muted-text">{t("home.updated_at", { date: formatDateFr(item.updatedAt, dateFallback) })}</p>
                <Badge tone={status.tone}>{t(`status.${statusKey}`)}</Badge>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2>{t("home.next_title")}</h2>
        <Card className="next-event-card">
          {upcomingEvent ? (
            <>
              <p className="next-event-title">{upcomingEvent.title}</p>
              <p className="muted-text">
                {t("common.period_with_value", {
                  value: getEventScheduleLabel(upcomingEvent, { periodFallback, dateFallback }),
                })}
              </p>
              {isEventIndicative(upcomingEvent) ? (
                <p className="muted-text">{getIndicativeValidationMessage(upcomingEvent, validationFallback)}</p>
              ) : null}
              <p>{upcomingEvent.description}</p>
            </>
          ) : (
            <p>{t("home.no_upcoming")}</p>
          )}
        </Card>
      </section>
    </div>
  );
}

export default Home;
