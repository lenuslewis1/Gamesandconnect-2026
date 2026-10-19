// Public URLs use the event name only.
export function eventPath(event) {
  const name = String(event.title || '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'event';
  return `/events/${name}`;
}

export function eventIdFromLink(value) {
  const match = String(value || '').match(/(?:^|-)([1-9]\d*)$/);
  return match ? match[1] : '';
}

export function resolveEventLink(events, value) {
  // Match names first: a title can legitimately end in a number.
  const matches = events.filter(event => eventPath(event) === `/events/${value}`);
  if (matches.length) {
    // A recurring event name opens its latest edition, independent of list order.
    return [...matches].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || Number(b.id) - Number(a.id))[0];
  }
  const legacyId = eventIdFromLink(value);
  return legacyId ? events.find(event => String(event.id) === legacyId) : undefined;
}
