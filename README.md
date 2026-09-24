# La Sauce Présidentielle

**English** · [Français](README.fr.md)

A neutral, sourced website about the candidates in the 2027 French presidential election.
Live site: https://arimet.github.io/la-sauce-presidentielle/

For each candidate, the site lists:

- **convictions** and **legal proceedings**, always with their outcome (appeal, acquittal, dismissal, case dropped);
- **allegations** reported by at least two independent outlets;
- **controversial public stances** (statements or votes that caused a documented public controversy);
- **"Autour du parti"**: documented controversies involving other members of the candidate's party, naming the person concerned and never imputed to the candidate;
- **context**: documented public debates related to the candidate that are not about their own acts;
- **programme highlights** by theme, taken from official sources only;
- **entourage**: up to 8 key campaign roles per candidate, with their documented career since 2012 and their declared interests, plus a graph and a table of the organizations shared by several entourages (`/entourage`). A declared interest does not imply any wrongdoing.

Candidates are shown in a random order on every visit.

## Principles

- **Neutrality**: factual wording, no judgemental adjectives, no commentary.
- **Presumption of innocence**: every matter that is not final (ongoing, under appeal) carries a notice saying so.
- **Outcomes always shown**: acquittals, dismissals and dropped cases are displayed in their own group, not counted as convictions or proceedings.
- **Private life is excluded**.
- **Same criteria** for every candidate and every party.

The full methodology (in French) is on the site: [Méthodologie](https://arimet.github.io/la-sauce-presidentielle/methodologie).

## How sources are found and validated

Research is assisted by an AI agent, then validated by a human. Nothing is published without human review.

1. **AI-assisted research.** The [`/research`](.claude/commands/research.md) command, run with [Claude Code](https://claude.com/claude-code) (`/research Firstname Lastname`), searches the web for convictions, proceedings, controversies and the official programme. It follows strict rules:
   - only accepted sources: court decisions and Légifrance, HATVP, AFP, Le Monde, Le Figaro, Libération, Les Échos, La Croix, L'Humanité, Mediapart, Le Canard enchaîné, France Info, France Inter, France 24, RFI, Public Sénat, LCP, Le Parisien, Ouest-France, 20 Minutes, TF1 Info. Social networks, blogs and partisan sites are never a sole source;
   - allegations, party facts and context facts require **two independent sources**;
   - programme measures come only from official sources (programme document, candidate or party website, candidacy declaration);
   - every URL is **archived on the Wayback Machine**; a source without an archive link is dropped;
   - the latest known outcome of every matter is recorded.

   The agent writes the Markdown file (`src/content/people/<slug>.md`) and a review checklist (`docs/reviews/<slug>.md`) listing every fact with its sources, doubtful classifications and facts left out, then opens a pull request.
   The [`/entourage`](.claude/commands/entourage.md) command works in two steps, so a human checks who is in scope before the deeper research: `/entourage list <candidate-slug>` finds the key campaign roles (sourced, at most 8), then `/entourage details <person-slug>…` fills the career and declared interests, starting from official records (HATVP open data, company register, Journal officiel), with a strict homonym rule. It writes files and a checklist (`docs/reviews/<slug>-entourage.md`) but never commits. `node scripts/check-people.mjs` validates files against the schema without a full build.
2. **Human validation.** A person opens every source, checks each fact against it, ticks the checklist and only then merges. The checklists stay in [`docs/reviews/`](docs/reviews/) for transparency.
3. **Schema checks.** [`src/schema.ts`](src/schema.ts) (Zod) makes the build fail on any fact without a source, any source without a `web.archive.org/web/` snapshot, an allegation with a single source, a final status on an allegation, a photo without credit, and so on.

AI can make mistakes: misreading an article, misclassifying a fact, missing a later ruling. That is why every fact goes through human review and why the checklists are public. If you spot an error, please report it (see below).

## Photos

Portraits are freely licensed images from Wikimedia Commons and EU institutions (CC0, CC BY or CC BY-SA), with the background removed and a stylised outline. Each page credits its photo; sources, licenses and processing are listed in [`docs/reviews/photos.md`](docs/reviews/photos.md).

## Corrections and right of reply

An error, a more recent court decision, a response to publish: write to the address on the [methodology page](https://arimet.github.io/la-sauce-presidentielle/methodologie), or [open a GitHub issue](https://github.com/arimet/la-sauce-presidentielle/issues), with the page concerned and your sources.

## Tech

[Astro 7](https://astro.build) static site: content collections, a Zod schema, no database, no JavaScript framework (a few small inline scripts only).

```
src/
  content/people/   one Markdown file per person (YAML frontmatter)
  schema.ts         Zod schema: the publication rules
  content.config.ts content collection
  lib/              labels, grouping, colors, base-path helper
  components/       PersonCard, Measures
  layouts/Base.astro
  pages/            home, person page, programmes, methodology, 404
public/             photos, fonts, favicon, Élysée backdrop
docs/reviews/       review checklists and photo credits
tests/              node:test unit tests
.claude/commands/research.md   the research agent's instructions
```

Requires Node 24.

```sh
npm install
npm run dev     # http://localhost:4321
npm test        # unit tests (schema, grouping, colors)
npm run build   # static site in dist/
```

### Adding a candidate

Either run `/research Firstname Lastname` in Claude Code, or write the file by hand.

1. Create `src/content/people/<slug>.md` (slug: lowercase ASCII kebab-case of the name):

   ```yaml
   ---
   name: Camille Exemple
   party: Parti Exemple
   role: candidate            # or "team" with candidateOf: <slug>, teamPosition, teamSources (see /entourage)
   partyColor: "#1D4ED8"
   photo: /photos/camille-exemple.png
   photoCredit: "Author, Wikimedia Commons, CC BY-SA 4.0, détourée"
   updatedAt: 2026-09-23
   facts:
     - title: Mise en examen pour ...
       type: proceeding       # conviction | proceeding | allegation | stance | party | context
       status: ongoing        # final | appeal | ongoing | acquitted | dismissed | dropped
       date: 2025-01-15
       summary: >
         Neutral, factual summary in French, including the latest known outcome.
       sources:
         - title: Article title
           outlet: Le Monde
           url: https://www.lemonde.fr/...
           archive: https://web.archive.org/web/2025.../https://www.lemonde.fr/...
           date: 2025-01-15
   programme:                 # optional
     status: published        # or announced
     checkedAt: 2026-09-23
     sources: [ ... ]         # same shape as above
     themes:                  # economy, work, immigration, security, ecology,
       economy:               # healthEducation, institutions, international
         - text: Measure, 280 characters max
           source: { ... }
   ---
   ```

   `stance` and `context` facts have no `status`; `party` facts need `concerns: { name, position }`.
2. **partyColor**: the color French media and Wikipedia use for the party; failing that, the main color of the party's official logo. The text color on top is picked automatically for contrast.
3. **Photo** (optional): a freely licensed portrait, background removed, head and shoulders, saved as a transparent PNG in `public/photos/<slug>.png`. Set `photo` and `photoCredit`, and add its source and license to `docs/reviews/photos.md`. Without a photo, initials are shown.
4. **Review file**: `docs/reviews/<slug>.md`, a checklist of every fact and its sources, ticked by the human reviewer.
5. Run `npm test && npm run build`.

### Troubleshooting

If the dev server shows stale content after a schema change (for example a new field that does not appear), stop it, delete `.astro/data-store.json` and run `npm run dev` again. Production builds are not affected.

## Deployment (GitHub Pages)

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) tests, builds and deploys on every push to `main` (and on manual dispatch). [`ci.yml`](.github/workflows/ci.yml) runs tests and build on pull requests.

One-time setup: **Settings → Pages → Source: GitHub Actions**.

The base path is handled automatically: `actions/configure-pages` provides `SITE_URL` and `BASE_PATH` (`/la-sauce-presidentielle` for a project site, empty with a custom domain), and every internal link goes through `src/lib/url.ts`. To use a custom domain, set it in the Pages settings (or add `public/CNAME`) and configure DNS; no code change is needed.

## Analytics

Audience measurement uses [GoatCounter](https://www.goatcounter.com), cookieless and without personal data, in production builds only. To use your own account, change the GoatCounter code in [`src/layouts/Base.astro`](src/layouts/Base.astro).

## Licenses

- **Code**: [MIT](LICENSE).
- **Editorial content** (`src/content/`, `docs/reviews/`): [CC BY-SA 4.0](LICENSE-content.md), because some photo derivatives are CC BY-SA.
- **Photos**: each keeps its own license (CC0, CC BY 4.0, CC BY-SA 2.0 or 4.0), listed in [`docs/reviews/photos.md`](docs/reviews/photos.md).
- **Fonts** (Cormorant Garamond, Schibsted Grotesk, IBM Plex Mono): SIL Open Font License, see [`public/fonts/LICENSE.md`](public/fonts/LICENSE.md).

## Author

Anthony Rimet — https://github.com/arimet
