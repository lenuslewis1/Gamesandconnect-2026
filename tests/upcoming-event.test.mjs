import test from "node:test";
import assert from "node:assert/strict";
import { selectUpcomingEvent } from "../src/legacy/lib/upcomingEvent.mjs";

test("past and invalid events cannot be featured", () => {
  assert.equal(selectUpcomingEvent([
    { id: 40, date: "2026-09-18" },
    { id: 41, date: "invalid" },
  ], "2026-10-03"), null);
  assert.equal(selectUpcomingEvent([], "2026-10-03"), null);
});

test("selects the earliest upcoming event regardless of input order", () => {
  const events = [
    { id: 3, date: "2026-11-10" },
    { id: 1, date: "2026-09-18" },
    { id: 2, date: "2026-10-04" },
  ];
  assert.equal(selectUpcomingEvent(events, "2026-10-03").id, 2);
  assert.equal(events[0].id, 3);
});

test("today stays available and drops out on the next calendar day", () => {
  const event = { id: 2, date: "2026-10-03" };
  assert.equal(selectUpcomingEvent([event], "2026-10-03"), event);
  assert.equal(selectUpcomingEvent([event], "2026-10-04"), null);
});
