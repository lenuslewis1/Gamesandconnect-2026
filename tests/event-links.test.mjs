import test from 'node:test';
import assert from 'node:assert/strict';
import { eventPath, eventIdFromLink } from '../src/legacy/lib/eventLinks.mjs';

test('event names become readable paths with punctuation and accents cleaned up', () => {
  assert.equal(eventPath({ title: 'The Savannah Experience', id: 40 }), '/events/the-savannah-experience-40');
  assert.equal(eventPath({ title: 'Café & Games: Let’s Play!', id: 41 }), '/events/cafe-and-games-lets-play-41');
  assert.equal(eventPath({ title: '  ', id: 42 }), '/events/event-42');
});

test('recurring names stay unique and names containing numbers resolve correctly', () => {
  assert.notEqual(eventPath({ title: 'Game Day', id: 1 }), eventPath({ title: 'Game Day', id: 2 }));
  assert.equal(eventIdFromLink('game-day-2026-42'), '42');
  assert.equal(eventIdFromLink('40'), '40');
  assert.equal(eventIdFromLink('renamed-event-40'), '40');
  for (const invalid of ['', 'missing-event', '0', '40junk', 'game-0']) assert.equal(eventIdFromLink(invalid), '');
});
