import { INTEREST_KINDS, type Interest, type InterestKind } from '../schema.ts';

// Order follows INTEREST_KINDS.
export const INTEREST_LABELS: Record<InterestKind, string> = {
  directorship: 'Mandats de dirigeant',
  shareholding: 'Participations',
  consulting: 'Activités de conseil',
  lobbying: 'Représentation d’intérêts',
  employment: 'Emplois',
  board: 'Conseils et comités',
  other: 'Autres liens',
};

export const NO_FAULT_NOTICE = 'Un lien d’intérêt déclaré n’implique aucune faute.';

const month = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export function formatPeriod({ start, end }: { start?: Date; end?: Date }): string {
  if (start && end) return `${month.format(start)} – ${month.format(end)}`;
  if (start) return `depuis ${month.format(start)}`;
  if (end) return `jusqu’en ${month.format(end)}`;
  return '';
}

export function groupInterests<I extends Pick<Interest, 'kind'>>(interests: I[]): [InterestKind, I[]][] {
  return INTEREST_KINDS.map((kind) => [kind, interests.filter((i) => i.kind === kind)] as [InterestKind, I[]]).filter(
    ([, list]) => list.length > 0,
  );
}
