import { test } from 'node:test';
import assert from 'node:assert/strict';
import { person } from '../src/schema.ts';

const source = {
  title: 'Article',
  outlet: 'Le Monde',
  url: 'https://example.com/a',
  archive: 'https://web.archive.org/web/2024/https://example.com/a',
  date: '2024-01-02',
};
const candidate = {
  name: 'Camille Exemple',
  party: 'Parti Test',
  role: 'candidate',
  partyColor: '#1d4ed8',
  updatedAt: '2026-09-23',
  facts: [],
};
const withFact = (fact) => ({
  ...candidate,
  facts: [{ title: 'Titre', date: '2024-01-01', summary: 'Résumé', sources: [source], ...fact }],
});
const accepts = (data) => {
  const result = person.safeParse(data);
  assert.equal(result.success, true, JSON.stringify(result.error?.issues));
};
const rejects = (data) => assert.equal(person.safeParse(data).success, false);

test('accepts a candidate with a sourced final conviction', () => {
  accepts(withFact({ type: 'conviction', status: 'final' }));
});

test('rejects a fact without source', () => {
  rejects(withFact({ type: 'conviction', status: 'final', sources: [] }));
});

test('rejects a source without archive link', () => {
  const { archive, ...noArchive } = source;
  rejects(withFact({ type: 'conviction', status: 'final', sources: [noArchive] }));
});

test('rejects a source with an invalid url', () => {
  rejects(withFact({ type: 'conviction', status: 'final', sources: [{ ...source, url: 'not a url' }] }));
});

test('requires two sources for an allegation', () => {
  rejects(withFact({ type: 'allegation', status: 'ongoing' }));
  accepts(withFact({ type: 'allegation', status: 'ongoing', sources: [source, { ...source, outlet: 'AFP' }] }));
});

test('restricts conviction statuses to final, appeal, acquitted', () => {
  rejects(withFact({ type: 'conviction', status: 'ongoing' }));
  accepts(withFact({ type: 'conviction', status: 'appeal' }));
});

test('forbids a status on a stance and requires one elsewhere', () => {
  accepts(withFact({ type: 'stance' }));
  rejects(withFact({ type: 'stance', status: 'final' }));
  rejects(withFact({ type: 'proceeding' }));
});

test('requires candidateOf and teamPosition for a team member', () => {
  rejects({ ...candidate, role: 'team' });
  accepts({ ...candidate, role: 'team', candidateOf: 'camille-exemple', teamPosition: 'Porte-parole' });
});

test('forbids candidateOf on a candidate', () => {
  rejects({ ...candidate, candidateOf: 'someone' });
});

test('requires photoCredit when photo is set', () => {
  rejects({ ...candidate, photo: '/photos/camille-exemple.png' });
  accepts({ ...candidate, photo: '/photos/camille-exemple.png', photoCredit: 'Wikimedia Commons, CC BY-SA 4.0' });
});

test('requires a hex partyColor on a candidate', () => {
  const { partyColor, ...noColor } = candidate;
  rejects(noColor);
  rejects({ ...candidate, partyColor: 'blue' });
});

test('rejects a non-http(s) source url', () => {
  rejects(withFact({ type: 'conviction', status: 'final', sources: [{ ...source, url: 'javascript:alert(1)' }] }));
});

test('rejects an archive link that is not a web.archive.org snapshot', () => {
  rejects(withFact({ type: 'conviction', status: 'final', sources: [{ ...source, archive: 'https://example.com/x' }] }));
  rejects(withFact({ type: 'conviction', status: 'final', sources: [{ ...source, archive: 'https://web.archive.org/save/https://x' }] }));
});

test('forbids a final status on an allegation or a proceeding', () => {
  rejects(withFact({ type: 'allegation', status: 'final', sources: [source, { ...source, outlet: 'AFP' }] }));
  rejects(withFact({ type: 'proceeding', status: 'final' }));
  accepts(withFact({ type: 'proceeding', status: 'ongoing' }));
});

const concerns = { name: 'Someone Else', position: 'député RN de la Somme' };

test('a party fact requires concerns', () => {
  rejects(withFact({ type: 'party', sources: [source, { ...source, outlet: 'AFP' }] }));
});

test('a party fact requires at least 2 sources', () => {
  rejects(withFact({ type: 'party', concerns, sources: [source] }));
});

test('accepts a party fact with concerns and 2 sources, with or without status', () => {
  accepts(withFact({ type: 'party', concerns, sources: [source, { ...source, outlet: 'AFP' }] }));
  accepts(withFact({ type: 'party', concerns, status: 'final', sources: [source, { ...source, outlet: 'AFP' }] }));
});

test('forbids concerns on a non-party type', () => {
  rejects(withFact({ type: 'stance', concerns }));
});

test('a context fact has no status', () => {
  rejects(withFact({ type: 'context', status: 'ongoing', sources: [source, { ...source, outlet: 'AFP' }] }));
});

test('a context fact requires at least 2 sources', () => {
  rejects(withFact({ type: 'context', sources: [source] }));
});

test('accepts a context fact with 2 sources and no status', () => {
  accepts(withFact({ type: 'context', sources: [source, { ...source, outlet: 'AFP' }] }));
});

test('forbids concerns on a context fact', () => {
  rejects(withFact({ type: 'context', concerns, sources: [source, { ...source, outlet: 'AFP' }] }));
});

const measure = { text: 'Proposition reformulée', source };
const programme = {
  status: 'published',
  checkedAt: '2026-09-23',
  sources: [source],
  themes: { economy: [measure], ecology: [measure, measure, measure] },
};
const withProgramme = (p) => ({ ...candidate, programme: { ...programme, ...p } });

test('accepts a valid programme', () => {
  accepts(withProgramme({}));
  accepts(withProgramme({ status: 'announced', themes: {} }));
});

test('rejects an unknown programme theme', () => {
  rejects(withProgramme({ themes: { culture: [measure] } }));
});

test('rejects more than 3 measures in a theme', () => {
  rejects(withProgramme({ themes: { economy: [measure, measure, measure, measure] } }));
});

test('rejects a measure without source', () => {
  rejects(withProgramme({ themes: { economy: [{ text: 'Proposition' }] } }));
});

test('rejects a programme without sources', () => {
  rejects(withProgramme({ sources: [] }));
});

test('rejects an unknown programme status and an over-long measure', () => {
  rejects(withProgramme({ status: 'draft' }));
  rejects(withProgramme({ themes: { economy: [{ text: 'x'.repeat(281), source }] } }));
});

test('accepts a person without programme', () => {
  accepts(candidate);
});

const member = { ...candidate, role: 'team', candidateOf: 'camille-exemple', teamPosition: 'Porte-parole' };
const job = { position: 'Directeur de cabinet', organization: "Ministère de l'Intérieur", start: '2017-05-17', sources: [source] };
const interest = {
  kind: 'directorship',
  organization: 'Exemple SAS',
  description: 'Président de la société',
  start: '2019-01-01',
  official: true,
  sources: [source],
};

test('accepts a team member with career and interests', () => {
  accepts({ ...member, career: [job, { ...job, end: '2018-01-01' }], interests: [interest] });
});

test('rejects a career entry or an interest without source', () => {
  rejects({ ...member, career: [{ ...job, sources: [] }] });
  rejects({ ...member, interests: [{ ...interest, sources: [] }] });
});

test('requires two sources for a non-official interest', () => {
  rejects({ ...member, interests: [{ ...interest, official: false }] });
  accepts({ ...member, interests: [{ ...interest, official: false, sources: [source, { ...source, outlet: 'AFP' }] }] });
});

test('rejects an unknown interest kind and an over-long description', () => {
  rejects({ ...member, interests: [{ ...interest, kind: 'friendship' }] });
  rejects({ ...member, interests: [{ ...interest, description: 'x'.repeat(281) }] });
});

test('rejects an end date before the start date', () => {
  rejects({ ...member, career: [{ ...job, end: '2016-01-01' }] });
  rejects({ ...member, interests: [{ ...interest, end: '2018-01-01' }] });
});
