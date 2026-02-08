import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import Card from "../components/Card";
import Filters from "../components/Filters";
import Timeline from "../components/Timeline";
import {
  PHASE_ORDER,
  PLANNING_SEASON,
  STATUS_META,
  STATUS_OPTIONS,
  TYPE_META,
  planningEvents,
} from "../data/planning";
import {
  formatDateFr,
  getChecklistByPhase,
  getEventScheduleLabel,
  getLastUpdatedEvent,
  getPlanningProgress,
  getUpcomingEvent,
  isEventIndicative,
  sortEventsByDate,
} from "../utils/planning";

function Planning() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const sortedEvents = useMemo(() => sortEventsByDate(planningEvents), []);
  const progress = useMemo(() => getPlanningProgress(planningEvents), []);
  const upcomingEvent = useMemo(() => getUpcomingEvent(planningEvents), []);
  const lastUpdate = useMemo(() => getLastUpdatedEvent(planningEvents), []);
  const checklist = useMemo(() => getChecklistByPhase(planningEvents, PHASE_ORDER), []);

  const typeOptions = useMemo(() => {
    const uniqueTypes = [...new Set(planningEvents.map((event) => event.type))];
    return [
      { value: "all", label: "Tous les types" },
      ...uniqueTypes.map((typeKey) => ({
        value: typeKey,
        label: TYPE_META[typeKey]?.label ?? typeKey,
      })),
    ];
  }, []);

  const filteredEvents = useMemo(() => {
    const loweredSearch = search.trim().toLowerCase();

    return sortedEvents.filter((event) => {
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      const matchesType = typeFilter === "all" || event.type === typeFilter;
      const matchesSearch =
        loweredSearch.length === 0 ||
        [event.title, event.description, event.responsibles?.join(" "), event.period]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(loweredSearch);

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [search, sortedEvents, statusFilter, typeFilter]);

  return (
    <div className="container page-block planning-page">
      <section className="section section-tight">
        <h1>Planning central 🗓️</h1>
        <p className="section-intro">Référence commune de la team pour la saison en cours.</p>
        <p className="muted-text">{PLANNING_SEASON}</p>

        <div className="grid three-columns summary-grid">
          <Card title="Prochaine étape">
            {upcomingEvent ? (
              <>
                <p className="summary-title">{upcomingEvent.title}</p>
                <p className="muted-text">{getEventScheduleLabel(upcomingEvent)}</p>
              </>
            ) : (
              <p>Aucun événement à venir.</p>
            )}
          </Card>

          <Card title="Dernière mise à jour">
            {lastUpdate ? (
              <>
                <p className="summary-title">{lastUpdate.title}</p>
                <p className="muted-text">{formatDateFr(lastUpdate.updatedAt)}</p>
              </>
            ) : (
              <p>Pas encore de mise à jour.</p>
            )}
          </Card>

          <Card title="Progression">
            <p className="summary-title">{progress.percent}%</p>
            <p className="muted-text">
              {progress.done} tâche(s) faite(s) · {progress.remaining} restante(s)
            </p>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: `${progress.percent}%` }} />
            </div>
          </Card>
        </div>
      </section>

      <section className="section">
        <h2>Timeline des événements</h2>
        <p className="muted-text">
          Format saison: les étapes sont affichées par période (ex: Mars–Avril), pas par date exacte.
        </p>
        <Filters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          search={search}
          onSearchChange={setSearch}
          statusOptions={STATUS_OPTIONS}
          typeOptions={typeOptions}
        />
        <Timeline events={filteredEvents} />
      </section>

      <section className="section">
        <h2>Checklist par phase</h2>
        <div className="grid two-columns">
          {checklist.map((phaseBlock) => (
            <Card key={phaseBlock.phase} title={phaseBlock.phase}>
              {phaseBlock.tasks.length ? (
                <ul className="checklist">
                  {phaseBlock.tasks.map((task) => {
                    const status = STATUS_META[task.status] ?? STATUS_META.todo;

                    return (
                      <li key={task.id} className="checklist-item">
                        <span className={`checkbox ${task.status === "done" ? "is-checked" : ""}`} aria-hidden="true" />
                        <div>
                          <p>{task.title}</p>
                          <Badge tone={status.tone}>{status.label}</Badge>
                          {isEventIndicative(task) ? <p className="muted-text">{task.period ?? "Indicatif"}</p> : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="muted-text">Aucune tâche dans cette phase.</p>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Comment mettre à jour le planning ?</h2>
        <Card>
          <p>
            Modifie simplement <code>src/data/planning.js</code>. Un objet = un événement (ordre, période, statut,
            type, phase, description).
          </p>
          <pre className="code-block">{`{
  id: "nouvelle-tache",
  order: 4,
  period: "Avril–Mai 2026 (indicatif)",
  title: "Nouvelle action",
  type: "suivi",
  status: "todo",
  phase: "Suivi",
  isIndicative: true,
  description: "Décrire ce qu'on fait"
}`}</pre>
        </Card>
      </section>
    </div>
  );
}

export default Planning;
