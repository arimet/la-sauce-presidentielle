import { getCollection, type CollectionEntry } from 'astro:content';

export type PersonEntry = CollectionEntry<'people'>;

// Zod validates one entry at a time, so cross-entry references are checked here.
export async function getPeople(): Promise<PersonEntry[]> {
  const people = await getCollection('people');
  const candidates = new Set(people.filter((p) => p.data.role === 'candidate').map((p) => p.id));
  for (const p of people) {
    if (p.data.candidateOf && !candidates.has(p.data.candidateOf)) {
      throw new Error(`${p.id}: candidateOf "${p.data.candidateOf}" is not a candidate slug`);
    }
  }
  return people;
}

/** Hero color of a person page: own party color, else their candidate's. */
export const personColor = (person: PersonEntry, people: PersonEntry[]) =>
  person.data.partyColor ?? people.find((p) => p.id === person.data.candidateOf)?.data.partyColor ?? '#1c1b19';
