import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import Card from "../components/Card";
import Filters from "../components/Filters";
import Timeline from "../components/Timeline";
import {
  PHASE_ORDER,
  STATUS_META,
  STATUS_OPTIONS,
  TYPE_META,
  planningEvents,
} from "../data/planning";
import {
  formatDateFr,
  getChecklistByPhase,
  getLastUpdatedEvent,
  getPlanningProgress,
  getUpcomingEvent,
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
        [event.title, event.description, event.responsibles?.join(" ")]
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
        <p className="section-intro">
          C&apos;est la page la plus importante: elle évolue au fil des sessions et sert de référence pour toute la team.
        </p>

        <div className="grid three-columns summary-grid">
          <Card title="Prochaine étape">
            {upcomingEvent ? (
              <>
                <p className="summary-title">{upcomingEvent.title}</p>
                <p className="muted-text">{formatDateFr(upcomingEvent.date)}</p>
              </>
            ) : (
              <p>Aucun événement à venir.</p>
            )}
          </Card>

          <Card title="Dernière mise à jour">
            {lastUpdate ? (
              <>
                <p className="summary-title">{lastUpdate.title}</p>
                <p className="muted-text">{formatDateFr(lastUpdate.updatedAt ?? lastUpdate.date)}</p>
              </>
            ) : (
              <p>Pas encore de mise à jour.</p>
            )}
          </Card>

          <Card title="Progression">
            <p className="summary-title">{progress.percent}%</p>
            <p className="muted-text">
              {progress.done} tâche(s) faite(s) · {progress.remaining} à faire
            </p>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: `${progress.percent}%` }} />
            </div>
          </Card>
        </div>
      </section>

      <section className="section">
        <h2>Timeline des événements</h2>
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
                    const status = STATUS_META[task.status] ?? STATUS_META["a-faire"];

                    return (
                      <li key={task.id} className="checklist-item">
                        <span className={`checkbox ${task.status === "fait" ? "is-checked" : ""}`} aria-hidden="true" />
                        <div>
                          <p>{task.title}</p>
                          <Badge tone={status.tone}>{status.label}</Badge>
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
        <h2>Comment on met à jour le planning ?</h2>
        <Card>
          <p>
            Modifie simplement le fichier <code>src/data/planning.js</code>. Chaque ligne correspond à un événement
            (date, statut, type, description...).
          </p>
          <p className="muted-text">
            Le choix est volontairement simple: pas de backend, juste des fichiers versionnés dans le repo.
          </p>
          <pre className="code-block">{`{
  id: "nouvelle-tache",
  date: "2026-04-25",
  title: "Nouvelle action (indicatif)",
  type: "suivi",
  status: "a-faire",
  phase: "Suivi",
  description: "Décrire ce qu'il faut faire"
}`}</pre>
        </Card>
      </section>
    </div>
  );
}

export default Planning;
