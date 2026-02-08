function parsePlanningDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const parsed = new Date(`${dateValue}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateFr(dateValue) {
  const parsed = parsePlanningDate(dateValue);
  if (!parsed) {
    return "Date à confirmer";
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function sortEventsByDate(events, order = "asc") {
  const sorted = [...events].sort((a, b) => {
    const aDate = parsePlanningDate(a.date)?.getTime() ?? 0;
    const bDate = parsePlanningDate(b.date)?.getTime() ?? 0;
    return aDate - bDate;
  });

  return order === "desc" ? sorted.reverse() : sorted;
}

export function getUpcomingEvent(events, referenceDate = new Date()) {
  const startOfDay = new Date(referenceDate);
  startOfDay.setHours(0, 0, 0, 0);

  return sortEventsByDate(events).find((event) => {
    const eventDate = parsePlanningDate(event.date);
    return eventDate && eventDate >= startOfDay && event.status !== "fait";
  });
}

export function getLastUpdatedEvent(events) {
  return [...events]
    .sort((a, b) => {
      const aDate = parsePlanningDate(a.updatedAt ?? a.date)?.getTime() ?? 0;
      const bDate = parsePlanningDate(b.updatedAt ?? b.date)?.getTime() ?? 0;
      return bDate - aDate;
    })
    .at(0);
}

export function getLatestUpdates(events, limit = 3) {
  return [...events]
    .sort((a, b) => {
      const aDate = parsePlanningDate(a.updatedAt ?? a.date)?.getTime() ?? 0;
      const bDate = parsePlanningDate(b.updatedAt ?? b.date)?.getTime() ?? 0;
      return bDate - aDate;
    })
    .slice(0, limit);
}

export function getPlanningProgress(events) {
  const total = events.length;
  const done = events.filter((event) => event.status === "fait").length;
  const remaining = Math.max(total - done, 0);
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return { total, done, remaining, percent };
}

export function getChecklistByPhase(events, phaseOrder = []) {
  return phaseOrder.map((phaseName) => ({
    phase: phaseName,
    tasks: sortEventsByDate(events.filter((event) => event.phase === phaseName)),
  }));
}
