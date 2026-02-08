import Badge from "./Badge";
import { STATUS_META, TYPE_META } from "../data/planning";
import { getEventScheduleLabel, getIndicativeValidationMessage, isEventIndicative } from "../utils/planning";

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
        const status = STATUS_META[event.status] ?? STATUS_META.todo;
        const type = TYPE_META[event.type] ?? TYPE_META.preparation;

        return (
          <li key={event.id} className="timeline-item">
            <span className="timeline-date">Période: {getEventScheduleLabel(event)}</span>
            <article className="timeline-card">
              <div className="timeline-head">
                <h3>{event.title}</h3>
                <div className="timeline-badges">
                  <Badge tone={status.tone}>{status.label}</Badge>
                  <Badge tone={type.tone}>{type.label}</Badge>
                  {isEventIndicative(event) ? <Badge tone="neutral">Indicatif</Badge> : null}
                </div>
              </div>

              <p>{event.description}</p>

              {isEventIndicative(event) ? (
                <p className="timeline-meta">{getIndicativeValidationMessage(event)}</p>
              ) : null}

              {event.responsibles?.length ? (
                <p className="timeline-meta">
                  Responsable(s) : <strong>{event.responsibles.join(", ")}</strong>
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
