import type { Fact, FactType, Status } from '../schema';

// Key order defines display order everywhere.
export const TYPE_LABELS: Record<FactType, [string, string]> = {
  conviction: ['condamnation', 'condamnations'],
  proceeding: ['procédure', 'procédures'],
  allegation: ['allégation', 'allégations'],
  stance: ['position', 'positions'],
  party: ['autour du parti', 'autour du parti'],
  context: ['contexte', 'contexte'],
};

// A fact whose status shows the person was cleared is displayed and counted
// separately, never lumped in with the type it started as.
export type Group = FactType | 'cleared';

const CLEARED_STATUSES: readonly Status[] = ['acquitted', 'dismissed', 'dropped'];

// Key order defines display order everywhere.
export const GROUP_LABELS: Record<Group, [string, string]> = {
  conviction: TYPE_LABELS.conviction,
  proceeding: TYPE_LABELS.proceeding,
  allegation: TYPE_LABELS.allegation,
  cleared: ['relaxe, non-lieu ou classement', 'relaxes, non-lieux ou classements'],
  stance: TYPE_LABELS.stance,
  party: TYPE_LABELS.party,
  context: TYPE_LABELS.context,
};

export function groupOf(fact: Fact): Group {
  if (fact.type === 'party' || fact.type === 'context') return fact.type;
  return fact.status && CLEARED_STATUSES.includes(fact.status) ? 'cleared' : fact.type;
}

export const STATUS_LABELS: Record<Status, string> = {
  final: 'Définitive',
  appeal: 'En appel',
  ongoing: 'En cours',
  acquitted: 'Relaxe / acquittement',
  dismissed: 'Non-lieu',
  dropped: 'Classement sans suite',
};

export function sortFacts(facts: Fact[]): Fact[] {
  return [...facts].sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function summarizeCounts(facts: Fact[]): string {
  const parts = (Object.keys(GROUP_LABELS) as Group[])
    .map((group) => [group, facts.filter((f) => groupOf(f) === group).length] as const)
    .filter(([, count]) => count > 0)
    // Non-breaking space keeps each number on the same line as its label.
    .map(([group, count]) => `${count}\u00a0${GROUP_LABELS[group][count > 1 ? 1 : 0]}`);
  return parts.length ? parts.join('\u00a0· ') : 'Aucun fait recensé';
}

export function needsPresumptionNotice(fact: Fact): boolean {
  return fact.status === 'ongoing' || fact.status === 'appeal';
}

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' });

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

export function groupByType(facts: Fact[]): [Group, Fact[]][] {
  return (Object.keys(GROUP_LABELS) as Group[])
    .map((group) => [group, sortFacts(facts.filter((f) => groupOf(f) === group))] as [Group, Fact[]])
    .filter(([, group]) => group.length > 0);
}

// First sentence of a summary, shown while the fact card is collapsed. A period ends a
// sentence only after a word of 2+ letters (not an initial like "M." or "J.-L."), before an
// uppercase letter and outside « quotations »; abbreviations below never end one.
// ponytail: heuristic split, add abbreviations here if a lede gets cut short.
const ABBREVIATIONS = /(?:^|[\s(])(?:Mme|Mmes|MM|Dr|Me|St|Ste|art|av|cf|etc|no|vol|p)$/;
export function splitLede(summary: string): [string, string] {
  const text = summary.trim();
  for (const m of text.matchAll(/([.!?…])(?:\s?["»)])?\s+(?=[«"(]?\s*[A-ZÀ-Ý])/g)) {
    const before = text.slice(0, m.index);
    if (m[1] === '.' && (/(?:^|[\s.'’(-])\p{L}$/u.test(before) || ABBREVIATIONS.test(before))) continue;
    const end = m.index + m[0].length;
    const head = text.slice(0, end);
    if (head.split('«').length > head.split('»').length) continue; // inside a quotation
    return [head.trim(), text.slice(end).trim()];
  }
  return [text, ''];
}
