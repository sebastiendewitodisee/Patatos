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
  if (!events.length) {
    return (
      <div className="empty-state">
        <p>Aucun événement ne correspond aux filtres actuels.</p>
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
            <span className="timeline-date">Période: {getEventScheduleLabel(event)}</span>
            <article className={`timeline-card ${isLate ? "is-late" : ""}`.trim()}>
              <div className="timeline-head">
                <h3>{event.title}</h3>
                <div className="timeline-badges">
                  <Badge tone={status.tone}>{status.label}</Badge>
                  <Badge tone={type.tone}>{type.label}</Badge>
                  {isEventIndicative(event) ? <Badge tone="neutral">Indicatif</Badge> : null}
                  {isLate ? <Badge tone="late">⚠ En retard</Badge> : null}
                </div>
              </div>

              <p className={event.callout ? "timeline-callout" : undefined}>{event.description}</p>

              {isEventIndicative(event) ? (
                <p className="timeline-meta">{getIndicativeValidationMessage(event)}</p>
              ) : null}

              {responsiblesDisplay ? (
                <p className="timeline-meta">
                  Responsable :{" "}
                  {responsiblesDisplay.isTeam ? (
                    responsiblesDisplay.principal
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
