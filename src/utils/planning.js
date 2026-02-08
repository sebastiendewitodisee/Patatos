function parsePlanningDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const parsed = new Date(`${dateValue}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function hasIndicativeKeyword(value) {
  return typeof value === "string" && value.toLowerCase().includes("indicatif");
}

function getEventOrder(event) {
  if (Number.isFinite(event.order)) {
    return event.order;
  }

  const datedOrder = parsePlanningDate(event.date)?.getTime();
  return datedOrder ?? Number.MAX_SAFE_INTEGER;
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

export function getEventScheduleLabel(event) {
  if (event.period) {
    return event.period;
  }

  if (event.date) {
    return formatDateFr(event.date);
  }

  return "Période à confirmer";
}

export function isEventIndicative(event) {
  return Boolean(event.isIndicative || hasIndicativeKeyword(event.period) || hasIndicativeKeyword(event.title));
}

export function sortEventsByDate(events, order = "asc") {
  const sorted = [...events].sort((a, b) => {
    const aOrder = getEventOrder(a);
    const bOrder = getEventOrder(b);

    if (aOrder === bOrder) {
      const aUpdated = parsePlanningDate(a.updatedAt)?.getTime() ?? 0;
      const bUpdated = parsePlanningDate(b.updatedAt)?.getTime() ?? 0;
      return aUpdated - bUpdated;
    }

    return aOrder - bOrder;
  });

  return order === "desc" ? sorted.reverse() : sorted;
}

export function getUpcomingEvent(events) {
  const sorted = sortEventsByDate(events);
  return sorted.find((event) => event.status !== "done") ?? null;
}

export function getLastUpdatedEvent(events) {
  return [...events]
    .sort((a, b) => {
      const aDate = parsePlanningDate(a.updatedAt)?.getTime() ?? 0;
      const bDate = parsePlanningDate(b.updatedAt)?.getTime() ?? 0;
      return bDate - aDate;
    })
    .at(0);
}

export function getLatestUpdates(events, limit = 3) {
  return [...events]
    .sort((a, b) => {
      const aDate = parsePlanningDate(a.updatedAt)?.getTime() ?? 0;
      const bDate = parsePlanningDate(b.updatedAt)?.getTime() ?? 0;
      return bDate - aDate;
    })
    .slice(0, limit);
}

export function getPlanningProgress(events) {
  const total = events.length;
  const done = events.filter((event) => event.status === "done").length;
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
