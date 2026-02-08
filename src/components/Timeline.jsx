import { useTranslation } from "react-i18next";
import Badge from "./Badge";
import { STATUS_META, TYPE_META } from "../data/planning";
import {
  getEffectiveStatus,
  getEventScheduleLabel,
  getIndicativeValidationMessage,
  isEventIndicative,
  isEventLate,
} from "../utils/planning";

function getResponsiblesDisplay(responsibles) {
  if (!responsibles?.length) {
    return null;
  }

  if (responsibles[0] === "Toute la team") {
    return { isTeam: true, principal: "Toute la team", extra: 0 };
  }

  return {
    isTeam: false,
    principal: responsibles[0],
    extra: Math.max(responsibles.length - 1, 0),
  };
}

function Timeline({ events }) {
  const { t } = useTranslation();
  const dateFallback = t("planning.fallbacks.date_tbc");
  const periodFallback = t("planning.fallbacks.period_tbc");
  const validationFallback = t("planning.fallbacks.validation");

  if (!events.length) {
    return (
      <div className="empty-state">
        <p>{t("planning.timeline.empty")}</p>
      </div>
    );
  }

  return (
    <ol className="timeline-list">
      {events.map((event) => {
        const effectiveStatus = getEffectiveStatus(event);
        const status = STATUS_META[effectiveStatus] ?? STATUS_META.todo;
        const type = TYPE_META[event.type] ?? TYPE_META.preparation;
        const responsiblesDisplay = getResponsiblesDisplay(event.responsibles);
        const isLate = isEventLate(event);

        return (
          <li key={event.id} className="timeline-item">
            <span className="timeline-date">
              {t("common.period_with_value", {
                value: getEventScheduleLabel(event, { periodFallback, dateFallback }),
              })}
            </span>
            <article className={`timeline-card ${isLate ? "is-late" : ""}`.trim()}>
              <div className="timeline-head">
                <h3>{event.title}</h3>
                <div className="timeline-badges">
                  <Badge tone={status.tone}>{t(`status.${effectiveStatus}`)}</Badge>
                  <Badge tone={type.tone}>{t(`planning.types.${event.type}`)}</Badge>
                  {isEventIndicative(event) ? <Badge tone="neutral">{t("planning.timeline.indicative")}</Badge> : null}
                  {isLate ? <Badge tone="late">{t("planning.timeline.late")}</Badge> : null}
                </div>
              </div>

              <p className={event.callout ? "timeline-callout" : undefined}>{event.description}</p>

              {isEventIndicative(event) ? (
                <p className="timeline-meta">{getIndicativeValidationMessage(event, validationFallback)}</p>
              ) : null}

              {responsiblesDisplay ? (
                <p className="timeline-meta">
                  {t("planning.timeline.responsible")} :{" "}
                  {responsiblesDisplay.isTeam ? (
                    t("planning.timeline.team_all")
                  ) : (
                    <>
                      <strong>{responsiblesDisplay.principal}</strong>
                      {responsiblesDisplay.extra > 0 ? ` (+${responsiblesDisplay.extra})` : ""}
                    </>
                  )}
                </p>
              ) : null}
            </article>
          </li>
        );
      })}
    </ol>
  );
}

export default Timeline;
