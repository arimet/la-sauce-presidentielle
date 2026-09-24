import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortFacts, summarizeCounts, needsPresumptionNotice, formatDate, groupByType, groupOf, splitLede } from '../src/lib/facts.ts';

const fact = (type, date, status) => ({ type, status, date: new Date(date) });

test('sortFacts orders newest first without mutating', () => {
  const facts = [fact('stance', '2020-01-01'), fact('stance', '2023-01-01'), fact('stance', '2021-01-01')];
  const sorted = sortFacts(facts);
  assert.deepEqual(sorted.map((f) => f.date.getFullYear()), [2023, 2021, 2020]);
  assert.equal(facts[0].date.getFullYear(), 2020);
});

test('summarizeCounts pluralizes, keeps type order, skips zeros', () => {
  const facts = [
    fact('stance', '2020-01-01'),
    fact('conviction', '2020-01-01', 'final'),
    fact('conviction', '2021-01-01', 'final'),
    fact('proceeding', '2022-01-01', 'ongoing'),
  ];
  assert.equal(summarizeCounts(facts), '2\u00a0condamnations\u00a0· 1\u00a0procédure\u00a0· 1\u00a0position');
});

test('summarizeCounts handles no facts', () => {
  assert.equal(summarizeCounts([]), 'Aucun fait recensé');
});

test('needsPresumptionNotice when status is ongoing or appeal', () => {
  assert.equal(needsPresumptionNotice(fact('allegation', '2020-01-01', 'ongoing')), true);
  assert.equal(needsPresumptionNotice(fact('conviction', '2020-01-01', 'appeal')), true);
  assert.equal(needsPresumptionNotice(fact('conviction', '2020-01-01', 'final')), false);
  assert.equal(needsPresumptionNotice(fact('allegation', '2020-01-01', 'dropped')), false);
  assert.equal(needsPresumptionNotice(fact('stance', '2020-01-01')), false);
});

test('formatDate uses French long format', () => {
  assert.equal(formatDate(new Date('2019-05-14T00:00:00Z')), '14 mai 2019');
});

test('groupByType keeps type order, skips empty types, sorts each group', () => {
  const facts = [
    fact('stance', '2020-01-01'),
    fact('conviction', '2019-01-01', 'final'),
    fact('conviction', '2022-01-01', 'appeal'),
  ];
  const groups = groupByType(facts);
  assert.deepEqual(groups.map(([type]) => type), ['conviction', 'stance']);
  assert.deepEqual(groups[0][1].map((f) => f.date.getFullYear()), [2022, 2019]);
});

test('groupOf sends acquitted, dismissed and dropped facts to cleared, whatever their type', () => {
  assert.equal(groupOf(fact('conviction', '2020-01-01', 'acquitted')), 'cleared');
  assert.equal(groupOf(fact('proceeding', '2020-01-01', 'dropped')), 'cleared');
  assert.equal(groupOf(fact('allegation', '2020-01-01', 'dismissed')), 'cleared');
  assert.equal(groupOf(fact('conviction', '2020-01-01', 'final')), 'conviction');
  assert.equal(groupOf(fact('stance', '2020-01-01')), 'stance');
});

test('groupOf sends a party fact to party, even with an acquitted status', () => {
  assert.equal(groupOf(fact('party', '2020-01-01')), 'party');
  assert.equal(groupOf(fact('party', '2020-01-01', 'acquitted')), 'party');
});

test('groupByType keeps party last and summarizeCounts includes it', () => {
  const facts = [
    fact('stance', '2020-01-01'),
    fact('party', '2021-01-01'),
    fact('party', '2019-01-01', 'acquitted'),
  ];
  const groups = groupByType(facts);
  assert.deepEqual(groups.map(([group]) => group), ['stance', 'party']);
  assert.equal(groups[1][1].length, 2);
  assert.equal(summarizeCounts(facts), '1\u00a0position\u00a0· 2\u00a0autour du parti');
});

test('groupByType and summarizeCounts move cleared facts out of their original type, outcome-blind counts', () => {
  const facts = [
    fact('conviction', '2020-01-01', 'final'),
    fact('conviction', '2019-01-01', 'acquitted'),
    fact('proceeding', '2021-01-01', 'dropped'),
  ];
  const groups = groupByType(facts);
  assert.deepEqual(groups.map(([group]) => group), ['conviction', 'cleared']);
  assert.equal(groups[0][1].length, 1);
  assert.equal(groups[1][1].length, 2);
  assert.equal(summarizeCounts(facts), '1\u00a0condamnation\u00a0· 2\u00a0relaxes, non-lieux ou classements');
});

test('groupOf sends a context fact to context, groupByType puts it after party', () => {
  assert.equal(groupOf(fact('context', '2020-01-01')), 'context');
  const facts = [fact('context', '2022-01-01'), fact('party', '2021-01-01'), fact('stance', '2020-01-01')];
  assert.deepEqual(groupByType(facts).map(([group]) => group), ['stance', 'party', 'context']);
  assert.equal(summarizeCounts(facts), '1\u00a0position\u00a0· 1\u00a0autour du parti\u00a0· 1\u00a0contexte');
});

test('splitLede cuts after the first sentence, not after initials, abbreviations or quotes', () => {
  assert.deepEqual(splitLede('Selon M. Dupont et J.-L. Mélenchon, il a été condamné. Puis rien.'),
    ['Selon M. Dupont et J.-L. Mélenchon, il a été condamné.', 'Puis rien.']);
  assert.deepEqual(splitLede('Il a dit : « Un devoir. » Après cela, Mme Durand a répondu.'),
    ['Il a dit : « Un devoir. »', 'Après cela, Mme Durand a répondu.']);
  assert.deepEqual(splitLede('Il a dit : « Assez. Partez. » Puis il est parti.'),
    ['Il a dit : « Assez. Partez. »', 'Puis il est parti.']);
  assert.deepEqual(splitLede('Une seule phrase, 3 ans.'), ['Une seule phrase, 3 ans.', '']);
});
