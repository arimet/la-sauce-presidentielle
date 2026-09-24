// Organizations shared by the entourages of several candidates.
import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force';

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

/** `excluded`: name prefixes left out of the network (src/data/network-excluded.json). */
export function sharedOrganizations<M extends Member>(people: M[], aliases: Aliases = {}, excluded: string[] = []): SharedOrganization<M>[] {
  const skip = excluded.map(normalize);
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
      if (skip.some((prefix) => key.startsWith(prefix))) continue;
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

// Graph laid out once at build time; the page ships a static SVG.
export type GraphNode = { kind: 'candidate' | 'person' | 'org'; id: string; label: string; x: number; y: number; candidates: string[] };
/** source / target: node keys (`<kind>:<id>`). */
export type GraphLink = { source: string; target: string; x1: number; y1: number; x2: number; y2: number; candidates: string[] };
export const NODE_RADIUS = { candidate: 22, person: 7, org: 11 } as const;

// Padding leaves room for labels: names run up to ~100 units either side of a node, and below it.
export function layoutGraph<M extends Member>(shared: SharedOrganization<M>[], width: number, height: number, padX = 110, padY = 45) {
  type N = GraphNode & { key: string; index?: number; vx?: number; vy?: number };
  const nodes = new Map<string, N>();
  const edges: { source: string; target: string; candidates: string[] }[] = [];
  const add = (n: Omit<N, 'key' | 'x' | 'y'>) => {
    const key = `${n.kind}:${n.id}`;
    if (!nodes.has(key)) nodes.set(key, { ...n, key, x: 0, y: 0 });
    return key;
  };
  const edgeKeys = new Set<string>();
  const link = (source: string, target: string, candidates: string[]) => {
    if (edgeKeys.has(`${source}|${target}`)) return;
    edgeKeys.add(`${source}|${target}`);
    edges.push({ source, target, candidates });
  };
  for (const org of shared) {
    const o = add({ kind: 'org', id: normalize(org.name), label: org.name, candidates: org.candidates });
    for (const p of org.people) {
      const c = p.data.candidateOf!;
      const k = add({ kind: 'person', id: p.id, label: p.data.name, candidates: [c] });
      link(k, add({ kind: 'candidate', id: c, label: c, candidates: [c] }), [c]);
      link(k, o, [c]);
    }
  }
  if (!nodes.size) return { nodes: [], links: [] };

  // Deterministic: same data, same picture (d3 only draws random numbers to separate coincident nodes).
  let seed = 1;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const list = [...nodes.values()];
  const links = edges.map((e) => ({ ...e }));
  forceSimulation(list)
    .randomSource(random)
    .force('link', forceLink(links).id((n: N) => n.key).distance(60))
    .force('charge', forceManyBody().strength(-160))
    .force('collide', forceCollide((n: N) => NODE_RADIUS[n.kind] + 6))
    .force('x', forceX(0).strength(0.05))
    .force('y', forceY(0).strength(0.08))
    .stop()
    .tick(400);

  // Fit into the viewBox, keeping proportions.
  const xs = list.map((n) => n.x), ys = list.map((n) => n.y);
  const [minX, minY] = [Math.min(...xs), Math.min(...ys)];
  const spanX = Math.max(...xs) - minX || 1, spanY = Math.max(...ys) - minY || 1;
  const scale = Math.min((width - 2 * padX) / spanX, (height - 2 * padY) / spanY);
  const offX = (width - spanX * scale) / 2, offY = (height - spanY * scale) / 2;
  const round = (v: number) => Math.round(v * 10) / 10;
  for (const n of list) {
    n.x = round(offX + (n.x - minX) * scale);
    n.y = round(offY + (n.y - minY) * scale);
  }
  return {
    nodes: list.map(({ kind, id, label, x, y, candidates }): GraphNode => ({ kind, id, label, x, y, candidates })),
    links: edges.map((e): GraphLink => {
      const s = nodes.get(e.source)!, t = nodes.get(e.target)!;
      return { source: e.source, target: e.target, x1: s.x, y1: s.y, x2: t.x, y2: t.y, candidates: e.candidates };
    }),
  };
}
