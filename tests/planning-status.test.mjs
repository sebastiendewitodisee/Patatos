import assert from "node:assert/strict";
import test from "node:test";
import { getPhaseStatus } from "../src/utils/planning.js";

test("getPhaseStatus returns done when event is manually done", () => {
  const event = { status: "done", period: "1-14 fevrier 2026" };
  const result = getPhaseStatus(event, new Date("2026-03-01T12:00:00"));

  assert.deepEqual(result, { status: "done", isLate: false });
});

test("getPhaseStatus returns upcoming before period start", () => {
  const event = { status: "todo", period: "15-28 fevrier 2026" };
  const result = getPhaseStatus(event, new Date("2026-02-08T12:00:00"));

  assert.deepEqual(result, { status: "upcoming", isLate: false });
});

test("getPhaseStatus returns in_progress during period", () => {
  const event = { status: "todo", period: "1-14 fevrier 2026" };
  const result = getPhaseStatus(event, new Date("2026-02-08T12:00:00"));

  assert.deepEqual(result, { status: "in_progress", isLate: false });
});

test("getPhaseStatus returns todo + late after period end", () => {
  const event = { status: "todo", period: "1-14 fevrier 2026" };
  const result = getPhaseStatus(event, new Date("2026-02-20T12:00:00"));

  assert.deepEqual(result, { status: "todo", isLate: true });
});

test("getPhaseStatus keeps legacy doing as in_progress fallback when no period exists", () => {
  const event = { status: "doing" };
  const result = getPhaseStatus(event, new Date("2026-02-20T12:00:00"));

  assert.deepEqual(result, { status: "in_progress", isLate: false });
});

test("getPhaseStatus keeps date-based logic even with legacy doing when period exists", () => {
  const event = { status: "doing", period: "15-28 fevrier 2026" };
  const result = getPhaseStatus(event, new Date("2026-02-08T12:00:00"));

  assert.deepEqual(result, { status: "upcoming", isLate: false });
});
