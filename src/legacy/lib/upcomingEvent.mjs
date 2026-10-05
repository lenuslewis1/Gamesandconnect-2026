// Ghana uses UTC. Keep today's events available until the calendar day ends.
export function selectUpcomingEvent(events, today = new Date().toISOString().slice(0, 10)) {
  const startOfToday = Date.parse(`${today}T00:00:00Z`);
  return events
    .filter((event) => Number.isFinite(Date.parse(event.date)) && Date.parse(event.date) >= startOfToday)
    .reduce((next, event) => !next || Date.parse(event.date) < Date.parse(next.date) ? event : next, null);
}
