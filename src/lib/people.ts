import { getCollection, type CollectionEntry } from 'astro:content';

export const MAX_TEAM = 8;

export type PersonEntry = CollectionEntry<'people'>;

// Zod validates one entry at a time, so cross-entry references are checked here.
export async function getPeople(): Promise<PersonEntry[]> {
  const people = await getCollection('people');
  const candidates = new Set(people.filter((p) => p.data.role === 'candidate').map((p) => p.id));
  const teamSize = new Map<string, number>();
  for (const p of people) {
    if (p.data.candidateOf && !candidates.has(p.data.candidateOf)) {
      throw new Error(`${p.id}: candidateOf "${p.data.candidateOf}" is not a candidate slug`);
    }
    if (p.data.candidateOf) teamSize.set(p.data.candidateOf, (teamSize.get(p.data.candidateOf) ?? 0) + 1);
  }
  // Same cap for every candidate (neutrality rule of the Entourage section).
  for (const [slug, size] of teamSize) {
    if (size > MAX_TEAM) throw new Error(`${slug}: ${size} team members, the cap is ${MAX_TEAM}`);
  }
  return people;
}

/** Hero color of a person page: own party color, else their candidate's. */
export const personColor = (person: PersonEntry, people: PersonEntry[]) =>
  person.data.partyColor ?? people.find((p) => p.id === person.data.candidateOf)?.data.partyColor ?? '#1c1b19';
