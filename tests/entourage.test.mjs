import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPeriod, groupInterests, INTEREST_LABELS } from '../src/lib/entourage.ts';
import { INTEREST_KINDS } from '../src/schema.ts';

const d = (s) => new Date(s);

test('formats a period in month and year', () => {
  assert.equal(formatPeriod({ start: d('2017-05-17'), end: d('2018-01-03') }), 'mai 2017 – janvier 2018');
  assert.equal(formatPeriod({ start: d('2017-05-17') }), 'depuis mai 2017');
  assert.equal(formatPeriod({ end: d('2018-01-03') }), 'jusqu’en janvier 2018');
  assert.equal(formatPeriod({}), '');
});

test('labels every interest kind', () => {
  assert.deepEqual(Object.keys(INTEREST_LABELS), [...INTEREST_KINDS]);
});

test('groups interests by kind in schema order', () => {
  const i = (kind) => ({ kind, organization: kind });
  const groups = groupInterests([i('other'), i('directorship'), i('other')]);
  assert.deepEqual(groups.map(([kind, list]) => [kind, list.length]), [['directorship', 1], ['other', 2]]);
});
