---
description: Research the entourage of a candidate (list, then career and declared interests) for La Sauce Présidentielle
argument-hint: "list <candidate-slug> | details <person-slug> [<person-slug>…]"
---

Research for the **Entourage** section of La Sauce Présidentielle: who surrounds each 2027 presidential candidate and where they come from. The goal is transparency, not accusation: a declared interest is not a fault. Read `src/schema.ts` (`person`, `job`, `interest`), `src/pages/methodologie.astro` (section « Entourage ») and `.claude/commands/research.md` (accepted outlets, archiving) first.

Arguments: $ARGUMENTS

## Rules (never break them)

- **Scope, identical for every candidate**: campaign director, spokespeople, treasurer or financial agent (mandataire financier), programme coordinator, advisers publicly named as such by the campaign or the press. **At most 8 people per candidate.** Never simple supporters, endorsers or activists. When more than 8 qualify, keep the most senior roles, in this order: direction, finance, programme, spokespeople, advisers.
- **Public role only**: publish only the person's public role and information already made public by an official source or by two independent outlets (GDPR data minimisation, art. 5). Never private life: address, family, undeclared personal wealth, health, religious or political opinions beyond the public role.
- **Sources**: every element (campaign role, position, interest) has at least one source with `url`, `archive` (`https://web.archive.org/web/…`) and `date`. Official sources are strong: HATVP, Journal officiel (Légifrance), company register (RNE / Annuaire des entreprises), official campaign or party website. Press without an official source needs **2 independent outlets** (two outlets, not one article quoted by another). Accepted outlets: those listed in `research.md`. Archive as in `research.md` step 3.
- **Homonyms**: attach a mandate, declaration or company role to a person only with at least two matching elements (name + publicly known birth date, or name + a position quoted by a source). Otherwise leave it out and note it in the checklist under « Homonymes écartés ».
- **Career** (`career`): public and professional positions since 2012, newest first, documented only. No position without a source. Omit `start` or `end` when no source gives it; no end = current.
- **Interests** (`interests`): `kind` is one of `directorship`, `shareholding`, `consulting`, `lobbying`, `employment`, `board`, `other`. `official: true` only when the source is HATVP, Journal officiel or the company register; otherwise `official: false` and 2 independent sources. `description` (French, 280 characters max) states the fact and its date, neutrally: no adjective, no suggestion of wrongdoing.
- Text in French, neutral, factual. Never modify or delete existing content written by someone else; list suspected errors in the checklist.
- **Never commit, push or open a PR.** Write files only; a human reviews and commits.
- Validate with `node scripts/check-people.mjs <files>` (never `npm run build`: other agents run in parallel).

## `list <candidate-slug>` — who is in the entourage

1. Read `src/content/people/<candidate-slug>.md` (name, party).
2. Search the official campaign site, the party site and the press for the campaign organisation chart: « directeur de campagne », « porte-parole », « mandataire financier », « trésorier de campagne », « chargé du programme », « conseiller de <candidate> ».
3. For each person (≤ 8), create `src/content/people/<person-slug>.md` (lowercase ASCII kebab-case of the name; if the file exists, stop and report it):
   ```yaml
   ---
   name: Prénom Nom
   party: <party of the person as stated by the sources, or « Sans étiquette »>
   role: team
   candidateOf: <candidate-slug>
   teamPosition: <role in the campaign, in French, as the sources name it>
   teamSources: [<official source, or 2 independent outlets>]
   updatedAt: <today>
   ---
   ```
   No `career`, no `interests`, no photo at this stage.
4. Write `docs/reviews/<candidate-slug>-entourage.md`:
   - `## Liste` : one checkbox per person: `- [ ] Nom · rôle · depuis <date> — <source urls>`.
   - `## Écartés` : people considered and left out, and why (supporter only, single source, role unclear, over the cap).
   - `## Points d'attention` : doubtful roles, uncertain dates.
   - End with: « Relire la liste avant l'étape 2 (parcours et liens d'intérêts). »
5. Report the list in your final message.

## `details <person-slug>…` — career and declared interests

For each person:

1. Read their file. Check whether they appear in the **HATVP open data** (local copy: `$HATVP_DIR`, or download once from https://www.hatvp.fr/open-data/ into a work folder outside the repo) and in the **company register** (`curl -s "https://recherche-entreprises.api.gouv.fr/search?q=<nom>"`, look at `dirigeants`). Apply the homonym rule. Official records come before any web search.
2. Then complete with the press: cabinet appointments (Journal officiel via Légifrance), previous jobs, boards, consulting, lobbying.
3. Fill `career` and `interests` in their file, following the rules above, and set `updatedAt` to today.
4. Append to `docs/reviews/<candidate-slug>-entourage.md` a `## <Nom>` section: one checkbox per career entry and per interest (`- [ ] <kind|poste> · <organisation> · <période> — <source urls>`), then « Homonymes écartés » and « Points d'attention ».
5. Run `node scripts/check-people.mjs <files>` and fix every error.
6. Report the counts and anything left out for lack of sources.
