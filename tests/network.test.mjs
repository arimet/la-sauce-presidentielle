import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, sharedOrganizations } from '../src/lib/network.ts';

const person = (id, candidateOf, orgs, interestOrgs = []) => ({
  id,
  data: {
    name: id,
    candidateOf,
    career: orgs.map((organization) => ({ position: 'Poste', organization })),
    interests: interestOrgs.map((organization) => ({ kind: 'board', organization })),
  },
});

test('normalizes case, accents, punctuation and spaces', () => {
  assert.equal(normalize("  Ministère de l'Intérieur "), 'ministere de l interieur');
});

test('keeps organizations shared by at least two candidates', () => {
  const people = [
    person('a', 'x', ['Banque Rothschild', 'Mairie de Paris']),
    person('b', 'y', ['banque rothschild']),
    person('c', 'x', ['Mairie de Paris']),
  ];
  const shared = sharedOrganizations(people);
  assert.equal(shared.length, 1);
  assert.equal(shared[0].name, 'Banque Rothschild');
  assert.deepEqual(shared[0].people.map((p) => p.id), ['a', 'b']);
  assert.deepEqual(shared[0].candidates, ['x', 'y']);
});

test('merges aliases under the canonical name and counts interests', () => {
  const aliases = { 'Ministère de l’Économie': ['Bercy', 'ministere de l economie et des finances'] };
  const people = [person('a', 'x', ['Bercy']), person('b', 'y', [], ['Ministère de l’Économie et des Finances'])];
  const [org] = sharedOrganizations(people, aliases);
  assert.equal(org.name, 'Ministère de l’Économie');
  assert.deepEqual(org.candidates, ['x', 'y']);
});

test('lists a person once per organization and ignores people without candidate', () => {
  const people = [person('a', 'x', ['Org', 'Org']), person('b', 'y', ['Org']), person('z', null, ['Org'])];
  const [org] = sharedOrganizations(people);
  assert.deepEqual(org.people.map((p) => p.id), ['a', 'b']);
});

import { layoutGraph } from '../src/lib/network.ts';

test('lays out candidates, people and shared organizations inside the viewBox, deterministically', () => {
  const people = [person('a', 'x', ['Org']), person('b', 'y', ['Org']), person('c', 'y', ['Autre'])];
  const graph = layoutGraph(sharedOrganizations(people), 600, 400);
  const ids = graph.nodes.map((n) => `${n.kind}:${n.id}`).sort();
  assert.deepEqual(ids, ['candidate:x', 'candidate:y', 'org:org', 'person:a', 'person:b']);
  assert.equal(graph.links.length, 4); // a–x, a–Org, b–y, b–Org
  for (const n of graph.nodes) {
    assert.ok(n.x >= 0 && n.x <= 600 && n.y >= 0 && n.y <= 400, `${n.id} at ${n.x},${n.y}`);
  }
  assert.deepEqual(layoutGraph(sharedOrganizations(people), 600, 400), graph);
});

test('an empty network has no nodes', () => {
  assert.deepEqual(layoutGraph([], 600, 400), { nodes: [], links: [] });
});
