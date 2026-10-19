// The ID keeps recurring event names unique and lets old links keep working.
export function eventPath(event) {
  const name = String(event.title || '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'event';
  return `/events/${name}-${event.id}`;
}

export function eventIdFromLink(value) {
  const match = String(value || '').match(/(?:^|-)([1-9]\d*)$/);
  return match ? match[1] : '';
}
