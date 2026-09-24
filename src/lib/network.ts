// Organizations shared by the entourages of several candidates.

type Org = { organization: string };
type Member = { id: string; data: { name: string; candidateOf?: string | null; career?: Org[]; interests?: Org[] } };
/** Canonical name → other spellings (src/data/organization-aliases.json). */
export type Aliases = Record<string, string[]>;
export type SharedOrganization<M> = { name: string; people: M[]; candidates: string[] };

export const normalize = (name: string) =>
  name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

export function sharedOrganizations<M extends Member>(people: M[], aliases: Aliases = {}): SharedOrganization<M>[] {
  const canonical = new Map<string, string>();
  for (const [name, variants] of Object.entries(aliases)) {
    for (const v of [name, ...variants]) canonical.set(normalize(v), name);
  }
  const orgs = new Map<string, { name: string; people: Set<M> }>();
  for (const p of people) {
    if (!p.data.candidateOf) continue;
    for (const { organization } of [...(p.data.career ?? []), ...(p.data.interests ?? [])]) {
      const name = canonical.get(normalize(organization)) ?? organization;
      const key = normalize(name);
      if (!orgs.has(key)) orgs.set(key, { name, people: new Set() });
      orgs.get(key)!.people.add(p);
    }
  }
  return [...orgs.values()]
    .map(({ name, people }) => ({
      name,
      people: [...people],
      candidates: [...new Set([...people].map((p) => p.data.candidateOf!))].sort(),
    }))
    .filter((o) => o.candidates.length >= 2)
    .sort((a, b) => b.candidates.length - a.candidates.length || a.name.localeCompare(b.name, 'fr'));
}
