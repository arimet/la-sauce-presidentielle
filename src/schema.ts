import { z } from 'astro/zod';

export const FACT_TYPES = ['conviction', 'proceeding', 'allegation', 'stance', 'party', 'context'] as const;
export const STATUSES = ['final', 'appeal', 'ongoing', 'acquitted', 'dismissed', 'dropped'] as const;
// Order defines display order everywhere (labels in src/lib/programme.ts).
export const THEMES = ['economy', 'work', 'immigration', 'security', 'ecology', 'healthEducation', 'institutions', 'international'] as const;
export const PROGRAMME_STATUSES = ['published', 'announced'] as const;
const CONVICTION_STATUSES: readonly string[] = ['final', 'appeal', 'acquitted'];
const NO_FINAL_STATUSES: readonly string[] = ['ongoing', 'appeal', 'acquitted', 'dismissed', 'dropped'];

const source = z.object({
  title: z.string().min(1),
  outlet: z.string().min(1),
  url: z.url({ protocol: /^https?$/ }),
  archive: z.url().startsWith('https://web.archive.org/web/'),
  date: z.coerce.date(),
});

const measure = z.object({ text: z.string().min(1).max(280), source });

const programme = z.object({
  status: z.enum(PROGRAMME_STATUSES),
  checkedAt: z.coerce.date(),
  sources: z.array(source).min(1),
  // Enum keys: an unknown theme is rejected; every theme is optional.
  themes: z.partialRecord(z.enum(THEMES), z.array(measure).min(1).max(3)),
});

const fact = z
  .object({
    title: z.string().min(1),
    type: z.enum(FACT_TYPES),
    status: z.enum(STATUSES).optional(),
    date: z.coerce.date(),
    summary: z.string().min(1),
    response: z.string().optional(),
    sources: z.array(source).min(1),
    concerns: z.object({ name: z.string().min(1), position: z.string().min(1) }).optional(),
  })
  .superRefine((f, ctx) => {
    if ((f.type === 'stance' || f.type === 'context') && f.status) {
      ctx.addIssue({ code: 'custom', path: ['status'], message: `a ${f.type} has no status` });
    }
    if (f.type !== 'stance' && f.type !== 'party' && f.type !== 'context' && !f.status) {
      ctx.addIssue({ code: 'custom', path: ['status'], message: `status is required for type "${f.type}"` });
    }
    if (f.type === 'party' && !f.concerns) {
      ctx.addIssue({ code: 'custom', path: ['concerns'], message: 'a party fact needs concerns (name and position)' });
    }
    if (f.type !== 'party' && f.concerns) {
      ctx.addIssue({ code: 'custom', path: ['concerns'], message: 'only a party fact can have concerns' });
    }
    if (f.type === 'party' && f.sources.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['sources'], message: 'a party fact needs at least 2 sources' });
    }
    if (f.type === 'context' && f.sources.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['sources'], message: 'a context fact needs at least 2 sources' });
    }
    if (f.type === 'conviction' && f.status && !CONVICTION_STATUSES.includes(f.status)) {
      ctx.addIssue({ code: 'custom', path: ['status'], message: 'a conviction status is final, appeal or acquitted' });
    }
    if ((f.type === 'allegation' || f.type === 'proceeding') && f.status && !NO_FINAL_STATUSES.includes(f.status)) {
      ctx.addIssue({ code: 'custom', path: ['status'], message: `a ${f.type} status cannot be final` });
    }
    if (f.type === 'allegation' && f.sources.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['sources'], message: 'an allegation needs at least 2 sources' });
    }
  });

export const person = z
  .object({
    name: z.string().min(1),
    party: z.string().min(1),
    role: z.enum(['candidate', 'team']),
    candidateOf: z.string().nullish(),
    teamPosition: z.string().nullish(),
    partyColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    photo: z.string().startsWith('/photos/').optional(),
    photoCredit: z.string().optional(),
    updatedAt: z.coerce.date(),
    facts: z.array(fact).default([]),
    programme: programme.optional(),
  })
  .superRefine((p, ctx) => {
    if (p.role === 'team' && (!p.candidateOf || !p.teamPosition)) {
      ctx.addIssue({ code: 'custom', path: ['role'], message: 'a team member needs candidateOf and teamPosition' });
    }
    if (p.role === 'candidate' && !p.partyColor) {
      ctx.addIssue({ code: 'custom', path: ['partyColor'], message: 'a candidate needs a partyColor (#rrggbb)' });
    }
    if (p.role === 'candidate' && (p.candidateOf || p.teamPosition)) {
      ctx.addIssue({ code: 'custom', path: ['role'], message: 'a candidate has no candidateOf or teamPosition' });
    }
    if (p.photo && !p.photoCredit) {
      ctx.addIssue({ code: 'custom', path: ['photoCredit'], message: 'photoCredit is required when photo is set' });
    }
  });

export type Person = z.infer<typeof person>;
export type Fact = Person['facts'][number];
export type FactType = (typeof FACT_TYPES)[number];
export type Theme = (typeof THEMES)[number];
export type Programme = NonNullable<Person['programme']>;
export type Status = (typeof STATUSES)[number];
