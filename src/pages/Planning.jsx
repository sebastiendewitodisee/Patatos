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
  planningEvents,
} from "../data/planning";
import {
  formatDateFr,
  getChecklistByPhase,
  getEffectiveStatus,
  getEventScheduleLabel,
  getIndicativeValidationMessage,
  getLastUpdatedEvent,
  getPlanningProgress,
  getUpcomingEvent,
  isEventLate,
  isEventIndicative,
  sortEventsByDate,
} from "../utils/planning";

function Planning() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [search, setSearch] = useState("");

  function resetFilters() {
    setPhaseFilter("all");
    setStatusFilter("all");
    setSearch("");
  }

  const isResetDisabled = phaseFilter === "all" && statusFilter === "all" && search.trim().length === 0;

  const sortedEvents = useMemo(() => sortEventsByDate(planningEvents), []);
  const progress = useMemo(() => getPlanningProgress(planningEvents), []);
  const upcomingEvent = useMemo(() => getUpcomingEvent(planningEvents), []);
  const lastUpdate = useMemo(() => getLastUpdatedEvent(planningEvents), []);
  const checklist = useMemo(() => getChecklistByPhase(planningEvents, PHASE_ORDER), []);

  const phaseOptions = useMemo(
    () => [{ value: "all", label: "Toutes les phases" }, ...PHASE_ORDER.map((phase) => ({ value: phase, label: phase }))],
    []
  );

  const filteredEvents = useMemo(() => {
    const loweredSearch = search.trim().toLowerCase();

    return sortedEvents.filter((event) => {
      const effectiveStatus = getEffectiveStatus(event);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "done" && event.status === "done") ||
        (statusFilter === "doing" && event.status === "doing") ||
        (statusFilter === "todo" && effectiveStatus === "todo") ||
        (statusFilter === "upcoming" && effectiveStatus === "upcoming");
      const matchesPhase = phaseFilter === "all" || event.phase === phaseFilter;
      const matchesSearch =
        loweredSearch.length === 0 ||
        [event.title, event.description, event.responsibles?.join(" "), event.period, event.validation]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(loweredSearch);

      return matchesStatus && matchesPhase && matchesSearch;
    });
  }, [phaseFilter, search, sortedEvents, statusFilter]);

  const ratio = sortedEvents.length ? Math.round((filteredEvents.length / sortedEvents.length) * 100) : 0;
  const trimmedSearch = search.trim();
  const activeChips = [];

  if (statusFilter !== "all") {
    activeChips.push({
      key: `status-${statusFilter}`,
      label: `Statut: ${STATUS_META[statusFilter]?.label ?? statusFilter}`,
      onClear: () => setStatusFilter("all"),
    });
  }

  if (phaseFilter !== "all") {
    activeChips.push({
      key: `phase-${phaseFilter}`,
      label: `Phase: ${phaseFilter}`,
      onClear: () => setPhaseFilter("all"),
    });
  }

  if (trimmedSearch) {
    activeChips.push({
      key: `search-${trimmedSearch.toLowerCase()}`,
      label: `Recherche: ${trimmedSearch}`,
      onClear: () => setSearch(""),
    });
  }

  return (
    <div className="container page-block planning-page">
      <section className="section section-tight">
        <h1>Planning central 🗓️</h1>
        <p className="section-intro">Référence commune de la team pour la saison en cours.</p>
        <p className="muted-text">{PLANNING_SEASON}</p>

        <Card title="Règles Patatos">
          <ul className="tips-list">
            <li>Le planning = la référence.</li>
            <li>Après chaque session: on met à jour le statut.</li>
            <li>Indicatif = on valide sur place (météo/sol/feuillage).</li>
            <li>Une tâche = un responsable principal (si possible).</li>
          </ul>
        </Card>

        <div className="grid three-columns summary-grid">
          <Card title="Prochaine étape">
            {upcomingEvent ? (
              <>
                <p className="summary-title">{upcomingEvent.title}</p>
                <p className="muted-text">Période: {getEventScheduleLabel(upcomingEvent)}</p>
                {isEventIndicative(upcomingEvent) ? (
                  <p className="muted-text">{getIndicativeValidationMessage(upcomingEvent)}</p>
                ) : null}
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
          Chaque carte affiche une période saisonnière. Les tâches indicatives incluent une règle de validation.
        </p>
        <Filters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          phaseFilter={phaseFilter}
          onPhaseChange={setPhaseFilter}
          search={search}
          onSearchChange={setSearch}
          statusOptions={STATUS_OPTIONS}
          phaseOptions={phaseOptions}
          onReset={resetFilters}
          isResetDisabled={isResetDisabled}
        />
        <div className="planning-results sticky-results">
          <p className="muted-text">
            <strong>{filteredEvents.length}</strong> résultat(s) · sur {sortedEvents.length}
          </p>

          <div className="result-bar" aria-hidden="true">
            <span style={{ width: `${ratio}%` }} />
          </div>

          {activeChips.length ? (
            <div className="active-filters" aria-label="Filtres actifs">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className="active-chip"
                  onClick={chip.onClear}
                  aria-label={`Retirer filtre ${chip.label}`}
                >
                  {chip.label} <span aria-hidden="true">✕</span>
                </button>
              ))}
              <button type="button" className="active-chip active-chip-clearall" onClick={resetFilters}>
                Tout effacer
              </button>
            </div>
          ) : (
            <p className="muted-text planning-hint">Aucun filtre actif.</p>
          )}

          {filteredEvents.length === 0 ? (
            <p className="muted-text planning-zero">Aucun résultat: essaie de reset les filtres ou enlève un mot-clé.</p>
          ) : null}
        </div>
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
                    const effectiveStatus = getEffectiveStatus(task);
                    const status = STATUS_META[effectiveStatus] ?? STATUS_META.todo;
                    const isLate = isEventLate(task);

                    return (
                      <li key={task.id} className="checklist-item">
                        <span className={`checkbox ${task.status === "done" ? "is-checked" : ""}`} aria-hidden="true" />
                        <div>
                          <p>{task.title}</p>
                          <div className="timeline-badges">
                            <Badge tone={status.tone}>{status.label}</Badge>
                            {isEventIndicative(task) ? <Badge tone="neutral">Indicatif</Badge> : null}
                            {isLate ? <Badge tone="late">⚠ En retard</Badge> : null}
                          </div>
                          <p className="muted-text">Période: {task.period ?? "À confirmer"}</p>
                          {isEventIndicative(task) ? (
                            <p className="muted-text">{getIndicativeValidationMessage(task)}</p>
                          ) : null}
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
          <p className="muted-text">Mini règle: si une tâche est indicative, ajoute toujours un champ `validation`.</p>
          <pre className="code-block">{`{
  id: "nouvelle-tache",
  order: 4,
  period: "Avril–Mai 2026 (indicatif)",
  title: "Nouvelle action",
  type: "suivi",
  status: "todo",
  phase: "Suivi",
  isIndicative: true,
  validation: "Validation: on confirme après inspection terrain.",
  description: "Décrire ce qu'on fait"
}`}</pre>
        </Card>
      </section>
    </div>
  );
}

export default Planning;
