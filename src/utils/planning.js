function parsePlanningDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const parsed = new Date(`${dateValue}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const MONTH_INDEX_BY_NAME = {
  janvier: 0,
  fevrier: 1,
  mars: 2,
  avril: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  aout: 7,
  septembre: 8,
  octobre: 9,
  novembre: 10,
  decembre: 11,
};

const PHASE_ID_BY_LEGACY_NAME = {
  preparation: "preparation",
  plantation: "plantation",
  suivi: "suivi",
  recolte: "recolte",
  conservation: "conservation",
};

function stripAccents(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizePeriodLabel(periodValue) {
  return stripAccents(periodValue.toLowerCase())
    .replace(/\([^)]*\)/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/\b1er\b/g, "1")
    .replace(/\s+/g, " ")
    .trim();
}

function getMonthIndex(monthName) {
  if (!monthName) {
    return null;
  }

  return MONTH_INDEX_BY_NAME[monthName] ?? null;
}

function getLastDayOfMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function clampDay(year, monthIndex, dayValue) {
  const lastDay = getLastDayOfMonth(year, monthIndex);
  const numericDay = Number(dayValue);

  if (!Number.isFinite(numericDay)) {
    return 1;
  }

  return Math.min(Math.max(Math.trunc(numericDay), 1), lastDay);
}

function createRange(year, monthIndex, startDay, endDay) {
  const safeStart = clampDay(year, monthIndex, startDay);
  const safeEnd = clampDay(year, monthIndex, endDay);
  const normalizedStart = Math.min(safeStart, safeEnd);
  const normalizedEnd = Math.max(safeStart, safeEnd);

  return {
    start: new Date(year, monthIndex, normalizedStart, 12, 0, 0, 0),
    end: new Date(year, monthIndex, normalizedEnd, 12, 0, 0, 0),
  };
}

function normalizeReferenceDate(dateValue) {
  const resolvedDate = dateValue instanceof Date ? new Date(dateValue) : new Date();
  resolvedDate.setHours(12, 0, 0, 0);
  return resolvedDate;
}

function hasIndicativeKeyword(value) {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = stripAccents(value.toLowerCase());
  return normalized.includes("indicatif") || normalized.includes("indicatief");
}

function getEventOrder(event) {
  if (Number.isFinite(event.order)) {
    return event.order;
  }

  const datedOrder = parsePlanningDate(event.date)?.getTime();
  return datedOrder ?? Number.MAX_SAFE_INTEGER;
}

export function formatDateLocale(dateValue, locale = "fr-BE", fallbackLabel = "") {
  const parsed = parsePlanningDate(dateValue);
  if (!parsed) {
    return fallbackLabel;
  }

  const resolvedLocale = typeof locale === "string" && locale.trim().length > 0 ? locale : "fr-BE";

  return parsed.toLocaleDateString(resolvedLocale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateFr(dateValue, fallbackLabel = "") {
  return formatDateLocale(dateValue, "fr-BE", fallbackLabel);
}

export function getEventScheduleLabel(
  event,
  { periodFallback = "", dateFallback = "", locale = "fr-BE" } = {}
) {
  if (event.period) {
    return event.period;
  }

  if (event.date) {
    return formatDateLocale(event.date, locale, dateFallback);
  }

  return periodFallback;
}

export function isEventIndicative(event) {
  return Boolean(event.isIndicative || hasIndicativeKeyword(event.period) || hasIndicativeKeyword(event.title));
}

export function getEventPhaseId(event) {
  const rawPhase = event?.phaseId ?? event?.phase ?? "";
  if (!rawPhase) {
    return "";
  }

  const normalized = stripAccents(String(rawPhase).toLowerCase().trim());
  return PHASE_ID_BY_LEGACY_NAME[normalized] ?? normalized;
}

export function getIndicativeValidationMessage(event, fallbackMessage = "") {
  if (!isEventIndicative(event)) {
    return "";
  }

  return event.validation ?? fallbackMessage;
}

export function parsePeriodRange(periodValue) {
  if (typeof periodValue !== "string" || periodValue.trim().length === 0) {
    return null;
  }

  const normalized = normalizePeriodLabel(periodValue);
  let match = normalized.match(/^(\d{1,2})\s*-\s*(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);

  if (match) {
    const [, startDay, endDay, monthName, yearValue] = match;
    const monthIndex = getMonthIndex(monthName);
    const year = Number(yearValue);

    if (monthIndex !== null && Number.isFinite(year)) {
      return createRange(year, monthIndex, startDay, endDay);
    }
  }

  match = normalized.match(/^debut\s+([a-z]+)\s+(\d{4})$/);

  if (match) {
    const [, monthName, yearValue] = match;
    const monthIndex = getMonthIndex(monthName);
    const year = Number(yearValue);

    if (monthIndex !== null && Number.isFinite(year)) {
      return createRange(year, monthIndex, 1, 10);
    }
  }

  match = normalized.match(/^fin\s+([a-z]+)\s+(\d{4})$/);

  if (match) {
    const [, monthName, yearValue] = match;
    const monthIndex = getMonthIndex(monthName);
    const year = Number(yearValue);

    if (monthIndex !== null && Number.isFinite(year)) {
      return createRange(year, monthIndex, 20, getLastDayOfMonth(year, monthIndex));
    }
  }

  match = normalized.match(/^([a-z]+)\s*-\s*([a-z]+)\s+(\d{4})$/);

  if (match) {
    const [, startMonthName, endMonthName, yearValue] = match;
    const startMonthIndex = getMonthIndex(startMonthName);
    const endMonthIndex = getMonthIndex(endMonthName);
    const startYear = Number(yearValue);

    if (startMonthIndex !== null && endMonthIndex !== null && Number.isFinite(startYear)) {
      const endYear = endMonthIndex < startMonthIndex ? startYear + 1 : startYear;
      const start = new Date(startYear, startMonthIndex, 1, 12, 0, 0, 0);
      const end = new Date(endYear, endMonthIndex, getLastDayOfMonth(endYear, endMonthIndex), 12, 0, 0, 0);
      return { start, end };
    }
  }

  match = normalized.match(/^([a-z]+)\s+(\d{4})\s*-\s*([a-z]+)\s+(\d{4})$/);

  if (match) {
    const [, startMonthName, startYearValue, endMonthName, endYearValue] = match;
    const startMonthIndex = getMonthIndex(startMonthName);
    const endMonthIndex = getMonthIndex(endMonthName);
    const startYear = Number(startYearValue);
    const endYear = Number(endYearValue);

    if (
      startMonthIndex !== null &&
      endMonthIndex !== null &&
      Number.isFinite(startYear) &&
      Number.isFinite(endYear) &&
      endYear >= startYear
    ) {
      const start = new Date(startYear, startMonthIndex, 1, 12, 0, 0, 0);
      const end = new Date(endYear, endMonthIndex, getLastDayOfMonth(endYear, endMonthIndex), 12, 0, 0, 0);
      return { start, end };
    }
  }

  match = normalized.match(/^([a-z]+)\s+(\d{4})$/);

  if (match) {
    const [, monthName, yearValue] = match;
    const monthIndex = getMonthIndex(monthName);
    const year = Number(yearValue);

    if (monthIndex !== null && Number.isFinite(year)) {
      return createRange(year, monthIndex, 1, getLastDayOfMonth(year, monthIndex));
    }
  }

  return null;
}

export function getEffectiveStatus(event, referenceDate = new Date()) {
  if (event?.status === "done") {
    return "done";
  }

  if (event?.status === "doing") {
    return "doing";
  }

  if (!event?.period) {
    return event?.status === "upcoming" ? "upcoming" : "todo";
  }

  const periodRange = parsePeriodRange(event.period);

  if (!periodRange) {
    return event?.status === "upcoming" ? "upcoming" : "todo";
  }

  const reference = normalizeReferenceDate(referenceDate).getTime();
  const periodStart = normalizeReferenceDate(periodRange.start).getTime();

  return reference < periodStart ? "upcoming" : "todo";
}

export function isEventLate(event, now = new Date()) {
  if (!event || event.status === "done" || event.status === "doing") {
    return false;
  }

  if (getEffectiveStatus(event, now) === "upcoming") {
    return false;
  }

  const periodRange = parsePeriodRange(event.period);

  if (!periodRange?.end) {
    return false;
  }

  const reference = normalizeReferenceDate(now).getTime();
  const periodEnd = normalizeReferenceDate(periodRange.end).getTime();

  return reference > periodEnd;
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
  return sorted.find((event) => getEffectiveStatus(event) !== "done") ?? null;
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
  return phaseOrder.map((phaseId) => ({
    phase: phaseId,
    tasks: sortEventsByDate(events.filter((event) => getEventPhaseId(event) === phaseId)),
  }));
}

