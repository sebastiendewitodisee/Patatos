import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Badge from "../components/Badge";
import Card from "../components/Card";
import Filters from "../components/Filters";
import Timeline from "../components/Timeline";
import { PHASE_ORDER, RESPONSIBLE_TBD_TOKEN, STATUS_META, STATUS_OPTIONS, planningEvents } from "../data/planning";
import {
  formatDateLocale,
  getChecklistByPhase,
  getEventPhaseId,
  getEventScheduleLabel,
  getPhaseStatus,
  getIndicativeValidationMessage,
  getLastUpdatedEvent,
  getPlanningProgress,
  getUpcomingEvent,
  isEventIndicative,
  sortEventsByDate,
} from "../utils/planning";

function getPhaseLabel(phaseId, t) {
  if (!phaseId) {
    return "";
  }

  return t(`planning.phases.${phaseId}`, { defaultValue: phaseId });
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

function getResponsiblesSearchText(event, t) {
  if (event?.isTeam) {
    return t("planning.timeline.team_all");
  }

  const responsibles = event?.responsibles;
  if (!responsibles?.length) {
    return "";
  }

  return responsibles
    .map((responsible) => (responsible === RESPONSIBLE_TBD_TOKEN ? t("common.to_define") : responsible))
    .join(" ");
}

function normalizeUiLang(lang) {
  if (typeof lang !== "string") {
    return "fr";
  }

  return lang.toLowerCase().startsWith("nl") ? "nl" : "fr";
}

function normalizeRemoteStatus(status) {
  if (typeof status !== "string") {
    return "todo";
  }

  const normalized = status.trim().toLowerCase();

  if (normalized === "done" || normalized === "todo" || normalized === "doing" || normalized === "in_progress") {
    return normalized;
  }

  return "todo";
}

function mapRemotePlanningItem(item, index) {
  const parsedOrder = Number(item?.sort_order);

  return {
    id: item?.id ?? `remote-${index + 1}`,
    order: Number.isFinite(parsedOrder) ? parsedOrder : index + 1,
    period: item?.period ?? "",
    updatedAt: item?.updated_at ?? "",
    title: item?.title ?? "",
    description: item?.description ?? "",
    status: normalizeRemoteStatus(item?.status),
    type: "preparation",
    phaseId: "preparation",
    phase: "preparation",
    responsibles: [],
    isTeam: true,
  };
}

function Planning() {
  const { t, i18n } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [remoteItems, setRemoteItems] = useState(null);
  const [remoteLang, setRemoteLang] = useState("");
  const currentLang = normalizeUiLang(i18n.resolvedLanguage || i18n.language);
  const locale = currentLang === "nl" ? "nl-BE" : "fr-BE";
  const dateFallback = t("planning.fallbacks.date_tbc");
  const periodFallback = t("planning.fallbacks.period_tbc");
  const validationFallback = t("planning.fallbacks.validation");

  function resetFilters() {
    setPhaseFilter("all");
    setStatusFilter("all");
    setSearch("");
  }

  const isResetDisabled = phaseFilter === "all" && statusFilter === "all" && search.trim().length === 0;

  useEffect(() => {
    let cancelled = false;

    const loadRemoteItems = async () => {
      try {
        const { fetchPlanningItemsFromSupabase } = await import("../lib/planningService");
        const items = await fetchPlanningItemsFromSupabase(currentLang);

        if (cancelled) {
          return;
        }

        if (items === null) {
          setRemoteLang(currentLang);
          setRemoteItems(null);
          return;
        }

        if (items.length === 0) {
          setRemoteLang(currentLang);
          setRemoteItems([]);
          return;
        }

        setRemoteLang(currentLang);
        setRemoteItems(items.map(mapRemotePlanningItem));
      } catch {
        if (cancelled) {
          return;
        }

        setRemoteLang(currentLang);
        setRemoteItems(null);
      }
    };

    loadRemoteItems();

    return () => {
      cancelled = true;
    };
  }, [currentLang]);

  const planningSourceEvents = useMemo(() => {
    const hasRemoteItems = remoteLang === currentLang && Array.isArray(remoteItems) && remoteItems.length > 0;
    return hasRemoteItems ? remoteItems : planningEvents;
  }, [currentLang, remoteItems, remoteLang]);

  const sortedEvents = useMemo(() => sortEventsByDate(planningSourceEvents), [planningSourceEvents]);
  const progress = useMemo(() => getPlanningProgress(planningSourceEvents), [planningSourceEvents]);
  const upcomingEvent = useMemo(() => getUpcomingEvent(planningSourceEvents), [planningSourceEvents]);
  const lastUpdate = useMemo(() => getLastUpdatedEvent(planningSourceEvents), [planningSourceEvents]);
  const checklist = useMemo(() => getChecklistByPhase(planningSourceEvents, PHASE_ORDER), [planningSourceEvents]);

  const statusOptions = useMemo(
    () =>
      STATUS_OPTIONS.map((option) => ({
        value: option.value,
        label: t(`status.${option.value}`),
      })),
    [t]
  );

  const phaseOptions = useMemo(
    () => [
      { value: "all", label: t("planning.filters.all_phases") },
      ...PHASE_ORDER.map((phaseId) => ({ value: phaseId, label: getPhaseLabel(phaseId, t) })),
    ],
    [t]
  );

  const filteredEvents = useMemo(() => {
    const loweredSearch = search.trim().toLowerCase();

    return sortedEvents.filter((event) => {
      const phaseStatus = getPhaseStatus(event);
      const eventPhaseId = getEventPhaseId(event);
      const matchesStatus = statusFilter === "all" || phaseStatus.status === statusFilter;
      const matchesPhase = phaseFilter === "all" || eventPhaseId === phaseFilter;
      const matchesSearch =
        loweredSearch.length === 0 ||
        [
          getEventText(event, "titleKey", "title", t),
          getEventText(event, "descriptionKey", "description", t),
          getEventPeriodLabel(event, t, periodFallback, dateFallback),
          getEventValidationText(event, t, validationFallback),
          event.phaseKey ? t(event.phaseKey, { defaultValue: getPhaseLabel(eventPhaseId, t) }) : getPhaseLabel(eventPhaseId, t),
          getResponsiblesSearchText(event, t),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(loweredSearch);

      return matchesStatus && matchesPhase && matchesSearch;
    });
  }, [dateFallback, periodFallback, phaseFilter, search, sortedEvents, statusFilter, t, validationFallback]);

  const ratio = sortedEvents.length ? Math.round((filteredEvents.length / sortedEvents.length) * 100) : 0;
  const trimmedSearch = search.trim();
  const activeChips = [];

  if (statusFilter !== "all") {
    activeChips.push({
      key: `status-${statusFilter}`,
      label: t("planning.filters.active_status", { value: t(`status.${statusFilter}`) }),
      onClear: () => setStatusFilter("all"),
    });
  }

  if (phaseFilter !== "all") {
    activeChips.push({
      key: `phase-${phaseFilter}`,
      label: t("planning.filters.active_phase", { value: getPhaseLabel(phaseFilter, t) }),
      onClear: () => setPhaseFilter("all"),
    });
  }

  if (trimmedSearch) {
    activeChips.push({
      key: `search-${trimmedSearch.toLowerCase()}`,
      label: t("planning.filters.active_search", { value: trimmedSearch }),
      onClear: () => setSearch(""),
    });
  }

  return (
    <div className="container page page-block planning-page">
      <section className="section section-tight stack">
        <h1 className="page-title">{t("planning.title")}</h1>
        <p className="section-intro page-subtitle">{t("planning.intro")}</p>
        <p className="section-subtitle muted-text">{t("planning.season")}</p>

        <Card title={t("planning.rules_title")}>
          <ul className="tips-list">
            <li>{t("planning.rules.r1")}</li>
            <li>{t("planning.rules.r2")}</li>
            <li>{t("planning.rules.r3")}</li>
            <li>{t("planning.rules.r4")}</li>
          </ul>
        </Card>

        <div className="grid three-columns summary-grid">
          <Card title={t("planning.summary.next")}>
            {upcomingEvent ? (
              <>
                <p className="summary-title">{getEventText(upcomingEvent, "titleKey", "title", t)}</p>
                <p className="muted-text">
                  {t("common.period_with_value", {
                    value: getEventPeriodLabel(upcomingEvent, t, periodFallback, dateFallback),
                  })}
                </p>
                {isEventIndicative(upcomingEvent) ? (
                  <p className="muted-text">{getEventValidationText(upcomingEvent, t, validationFallback)}</p>
                ) : null}
              </>
            ) : (
              <p>{t("planning.summary.none_upcoming")}</p>
            )}
          </Card>

          <Card title={t("planning.summary.last_update")}>
            {lastUpdate ? (
              <>
                <p className="summary-title">{getEventText(lastUpdate, "titleKey", "title", t)}</p>
                <p className="muted-text">{formatDateLocale(lastUpdate.updatedAt, locale, dateFallback)}</p>
              </>
            ) : (
              <p>{t("planning.summary.none_update")}</p>
            )}
          </Card>

          <Card title={t("planning.summary.progress")}>
            <p className="summary-title">{progress.percent}%</p>
            <p className="muted-text">{t("planning.summary.progress_details", { done: progress.done, remaining: progress.remaining })}</p>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: `${progress.percent}%` }} />
            </div>
          </Card>
        </div>
      </section>

      <section className="section stack">
        <h2 className="section-title">{t("planning.timeline.title")}</h2>
        <p className="section-subtitle muted-text">{t("planning.timeline.intro")}</p>
        <Filters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          phaseFilter={phaseFilter}
          onPhaseChange={setPhaseFilter}
          search={search}
          onSearchChange={setSearch}
          statusOptions={statusOptions}
          phaseOptions={phaseOptions}
          onReset={resetFilters}
          isResetDisabled={isResetDisabled}
        />
        <div className="planning-results sticky-results">
          <p className="muted-text">
            <strong>{filteredEvents.length}</strong> {t("planning.timeline.results_tail", { total: sortedEvents.length })}
          </p>

          <div className="result-bar" aria-hidden="true">
            <span style={{ width: `${ratio}%` }} />
          </div>

          {activeChips.length ? (
            <div className="active-filters" aria-label={t("planning.timeline.active_filters_aria")}>
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className="active-chip"
                  onClick={chip.onClear}
                  aria-label={t("planning.timeline.remove_filter", { label: chip.label })}
                >
                  {chip.label} <span aria-hidden="true">✕</span>
                </button>
              ))}
              <button type="button" className="active-chip active-chip-clearall" onClick={resetFilters}>
                {t("planning.timeline.clear_all")}
              </button>
            </div>
          ) : (
            <p className="muted-text planning-hint">{t("planning.timeline.none_active")}</p>
          )}

          {filteredEvents.length === 0 ? <p className="muted-text planning-zero">{t("planning.timeline.no_results")}</p> : null}
        </div>
        <Timeline events={filteredEvents} />
      </section>

      <section className="section stack">
        <h2 className="section-title">{t("planning.checklist.title")}</h2>
        <div className="grid two-columns">
          {checklist.map((phaseBlock) => (
            <Card key={phaseBlock.phase} title={getPhaseLabel(phaseBlock.phase, t)}>
              {phaseBlock.tasks.length ? (
                <ul className="checklist">
                  {phaseBlock.tasks.map((task) => {
                    const phaseStatus = getPhaseStatus(task);
                    const status = STATUS_META[phaseStatus.status] ?? STATUS_META.todo;

                    return (
                      <li key={task.id} className="checklist-item">
                        <span className={`checkbox ${task.status === "done" ? "is-checked" : ""}`} aria-hidden="true" />
                        <div>
                          <p>{getEventText(task, "titleKey", "title", t)}</p>
                          <div className="timeline-badges">
                            <Badge tone={status.tone}>{t(`status.${phaseStatus.status}`)}</Badge>
                            {isEventIndicative(task) ? <Badge tone="neutral">{t("planning.timeline.indicative")}</Badge> : null}
                            {phaseStatus.isLate ? <Badge tone="late">{t("planning.timeline.late")}</Badge> : null}
                          </div>
                          <p className="muted-text">
                            {t("common.period_with_value", {
                              value: getEventPeriodLabel(task, t, periodFallback, dateFallback),
                            })}
                          </p>
                          {isEventIndicative(task) ? (
                            <p className="muted-text">{getEventValidationText(task, t, validationFallback)}</p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="muted-text">{t("planning.checklist.empty")}</p>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section className="section stack">
        <h2 className="section-title">{t("planning.update.title")}</h2>
        <Card>
          <p>
            {t("planning.update.instruction_prefix")} <code>src/data/planning.js</code>. {t("planning.update.instruction_suffix")}
          </p>
          <p className="muted-text">{t("planning.update.rule")}</p>
        </Card>
      </section>
    </div>
  );
}

export default Planning;
