import test from 'node:test';
import assert from 'node:assert/strict';
import { eventPath, eventIdFromLink, resolveEventLink } from '../src/legacy/lib/eventLinks.mjs';

test('event names become readable paths with punctuation and accents cleaned up', () => {
  assert.equal(eventPath({ title: 'The Savannah Experience', id: 40 }), '/events/the-savannah-experience');
  assert.equal(eventPath({ title: 'Café & Games: Let’s Play!', id: 41 }), '/events/cafe-and-games-lets-play');
  assert.equal(eventPath({ title: '  ', id: 42 }), '/events/event');
});

test('legacy numeric and name-plus-ID links still resolve correctly', () => {
  assert.equal(eventIdFromLink('game-day-2026-42'), '42');
  assert.equal(eventIdFromLink('40'), '40');
  assert.equal(eventIdFromLink('renamed-event-40'), '40');
  for (const invalid of ['', 'missing-event', '0', '40junk', 'game-0']) assert.equal(eventIdFromLink(invalid), '');
});

test('names resolve before numeric suffixes and old links remain valid', () => {
  const events = [{ id: 41, title: 'The Island Camping Experience' }, { id: 9, title: 'Game Day 41' }];
  assert.equal(resolveEventLink(events, 'the-island-camping-experience')?.id, 41);
  assert.equal(resolveEventLink(events, 'the-island-camping-experience-41')?.id, 41);
  assert.equal(resolveEventLink(events, '41')?.id, 41);
  assert.equal(resolveEventLink(events, 'game-day-41')?.id, 9);
  assert.equal(resolveEventLink(events, 'missing-event'), undefined);
});

test('a recurring name deterministically opens the latest edition', () => {
  const events = [{ id: 2, title: 'Game Day', date: '2026-12-01' }, { id: 1, title: 'Game Day', date: '2026-01-01' }];
  assert.equal(resolveEventLink(events, 'game-day')?.id, 2);
  assert.equal(resolveEventLink([...events].reverse(), 'game-day')?.id, 2);
});
