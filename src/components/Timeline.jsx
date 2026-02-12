import { useTranslation } from "react-i18next";
import Badge from "./Badge";
import { RESPONSIBLE_TBD_TOKEN, STATUS_META, TYPE_META } from "../data/planning";
import {
  getEventScheduleLabel,
  getPlanningStatus,
  getIndicativeValidationMessage,
  isEventIndicative,
} from "../utils/planning";

function getResponsiblesDisplay(event) {
  if (event?.isTeam) {
    return { isTeam: true, principal: "", extra: 0 };
  }

  const responsibles = event?.responsibles;
  if (!responsibles?.length) {
    return null;
  }

  return {
    isTeam: false,
    principal: responsibles[0],
    extra: Math.max(responsibles.length - 1, 0),
  };
}

function getResponsibleLabel(responsible, t) {
  if (responsible === RESPONSIBLE_TBD_TOKEN) {
    return t("common.to_define");
  }

  return responsible;
}

function getResponsibleBadgeLabel(responsible, t) {
  if (typeof responsible !== "string" || responsible.trim().length === 0) {
    return "";
  }

  const normalizedResponsible =
    responsible.trim() === RESPONSIBLE_TBD_TOKEN ? t("common.to_define") : responsible.trim();

  return t("planning.responsible_with_value", {
    value: normalizedResponsible,
    defaultValue: `${t("planning.responsible_label")}: ${normalizedResponsible}`,
  });
}

function getEventText(event, keyName, fallbackKeyName, t) {
  const translationKey = event?.[keyName];
  const fallbackValue = fallbackKeyName ? event?.[fallbackKeyName] : "";

  if (!translationKey) {
    return fallbackValue ?? "";
  }

  return t(translationKey, { defaultValue: fallbackValue ?? "" });
}

function getEventPeriodLabel(event, t, periodFallback, dateFallback) {
  const fallbackLabel = getEventScheduleLabel(event, { periodFallback, dateFallback });
  return event?.periodKey ? t(event.periodKey, { defaultValue: fallbackLabel }) : fallbackLabel;
}

function getEventValidationText(event, t, validationFallback) {
  const fallbackLabel = getIndicativeValidationMessage(event, validationFallback);
  return event?.validationKey ? t(event.validationKey, { defaultValue: fallbackLabel }) : fallbackLabel;
}

function getPlanningStatusLabel(status, t) {
  return t(`planning.status.${status}`, {
    defaultValue: t(`status.${status}`, { defaultValue: status }),
  });
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
        const phaseStatus = getPlanningStatus(event);
        const status = STATUS_META[phaseStatus.status] ?? STATUS_META.todo;
        const type = TYPE_META[event.type] ?? TYPE_META.preparation;
        const responsiblesDisplay = getResponsiblesDisplay(event);
        const isLate = phaseStatus.isLate;
        const responsibleBadgeLabel = getResponsibleBadgeLabel(event?.responsible, t);

        return (
          <li key={event.id} className="timeline-item">
            <span className="timeline-date">
              {t("common.period_with_value", {
                value: getEventPeriodLabel(event, t, periodFallback, dateFallback),
              })}
            </span>
            <article className={`timeline-card ${isLate ? "is-late" : ""}`.trim()}>
              <div className="timeline-head">
                <h3>{getEventText(event, "titleKey", "title", t)}</h3>
                <div className="timeline-badges">
                  <Badge tone={status.tone}>{getPlanningStatusLabel(phaseStatus.status, t)}</Badge>
                  <Badge tone={type.tone}>{t(`planning.types.${event.type}`)}</Badge>
                  {responsibleBadgeLabel ? <Badge tone="neutral">{responsibleBadgeLabel}</Badge> : null}
                  {isEventIndicative(event) ? <Badge tone="neutral">{t("planning.timeline.indicative")}</Badge> : null}
                  {isLate ? <Badge tone="late">{t("planning.late")}</Badge> : null}
                </div>
              </div>

              <p className={event.callout ? "timeline-callout" : undefined}>{getEventText(event, "descriptionKey", "description", t)}</p>

              {isEventIndicative(event) ? (
                <p className="timeline-meta">{getEventValidationText(event, t, validationFallback)}</p>
              ) : null}

              {responsiblesDisplay ? (
                <p className="timeline-meta">
                  {t("planning.timeline.responsible")} :{" "}
                  {responsiblesDisplay.isTeam ? (
                    t("planning.timeline.team_all")
                  ) : (
                    <>
                      <strong>{getResponsibleLabel(responsiblesDisplay.principal, t)}</strong>
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
