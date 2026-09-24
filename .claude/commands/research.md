---
description: Research a person and open a PR with sourced facts for La Sauce Présidentielle
argument-hint: "Prénom Nom"
---

Research **$ARGUMENTS** for La Sauce Présidentielle, a neutral, factual site listing convictions, legal proceedings, allegations and controversial public stances of 2027 French presidential candidates and their teams. Read `src/schema.ts`, `src/pages/methodologie.astro` and `README.md` (section on sources) first.

## Rules (never break them)

- Every fact has at least one source with `url`, `archive` and `date`. An `allegation` has at least 2 independent sources (two outlets, not one article quoted by another).
- Accepted sources: Légifrance and court decisions, HATVP, AFP, Le Monde, Le Figaro, Libération, Les Échos, La Croix, L'Humanité, Mediapart, Le Canard enchaîné, France Info, France Inter, France 24, ICI (ex-France Bleu, Radio France), RFI, Public Sénat, LCP, Le Parisien, Ouest-France, 20 Minutes, TF1 Info. If an outlet blocks direct access, read it through an existing Wayback snapshot (`https://web.archive.org/web/2026/<url>`) and cite the original URL. Social networks, blogs and partisan sites are never a sole source.
- Write fact text in French, neutral and factual: what happened, when, which court or outlet. No adjectives that judge, no commentary, no speculation.
- Never present an allegation or a proceeding as established. Always record the latest known outcome (appeal, acquittal, dismissal, dropped case) in `status`, and mention it in `summary`.
- A `stance` is a public statement or vote, sourced to the primary quote (interview, video, official record). Only include stances that caused documented public controversy.
- A `party` fact is a documented controversy or proceeding involving another member of the candidate's party (elected official, party officer, or endorsed candidate) — never the candidate. It needs at least 2 independent sources and a `concerns` object naming the person and their position precisely (e.g. `{ name: "X", position: "député RN de la Somme" }`). Record the party's or candidate's public reaction in `response` only when a source reports it. Apply identical criteria to every party. List the most significant or recent first, at most ~5 per party. If the candidate personally reacted to the controversy (defended, condemned, or stayed silent when explicitly asked), record that reaction as a separate `stance` fact on the candidate, not as part of the `party` fact.
- A `context` fact ("Contexte") is a documented public debate relevant to the candidate that is neither an act or statement of theirs nor a judicial matter (e.g. a potential conflict of interest raised by the press). It has no `status` and no `concerns`, and needs at least 2 independent sources. Private life is never covered as such (art. 9 Code civil): mention a relationship only when it is the public context of a documented professional debate, stated by the sources, never as news in itself, and give no private details.
- Record a `response` only when the person publicly responded and a source says so.
- Never modify or delete an existing fact. Only add new ones. If a newer source shows an existing fact's status is outdated (acquittal, dismissal, appeal, etc.), do not edit it either: list it in the PR body under "Statuts à mettre à jour" with the new source, so a human updates it.
- Never merge. Never push to `main`.

## Programme

Fill the optional `programme` object of the person (candidates only) following `src/schema.ts`:

- **Official sources only**: the published programme document, the candidate's or party's official website, the candidacy declaration, or interviews/posts on the candidate's official channels. Press articles never provide a measure; they may only be used to locate the official source, which is then cited instead.
- `status`: `published` if a programme document exists; otherwise `announced`, with measures taken from official declarations or interviews on official channels.
- `sources`: the programme document, official site or candidacy declaration (at least one, with `url`, `archive`, `date`).
- `themes`: only the keys `economy`, `work`, `immigration`, `security`, `ecology`, `healthEducation`, `institutions`, `international`. For each theme, up to 3 measures, the most prominent ones as presented by the candidate. Omit a theme when no measure is found (the site shows « Pas de proposition identifiée »).
- Each measure: `text` (French, 280 characters max) reformulated neutrally, stating what is proposed, with figures when the source gives them; no adjectives, no evaluation of cost or feasibility, no campaign slogans. Each measure has its own `source`, the official page or document where it appears.
- Set `checkedAt` to the day you verified the sources. When a `programme` already exists, change a measure only if its official source changed, and list every added, changed or removed measure in the PR body.

## Steps

1. Slug: lowercase ASCII kebab-case of the name (`Jean-Luc Mélenchon` → `jean-luc-melenchon`). If `src/content/people/<slug>.md` exists, read it: you only add facts not already listed.
2. Search the web: convictions, "mis en examen", "procès", "enquête", "condamné", "relaxé", HATVP, and controversies. Open each article; do not rely on search snippets.
3. For each source URL, get an archive link. First check an existing snapshot:
   `curl -s --get --data-urlencode "url=<url>" https://archive.org/wayback/available` and use `archived_snapshots.closest.url` if present.
   Otherwise request one: `curl -s -o /dev/null -w '%{url_effective}' -L "https://web.archive.org/save/<url>"` and use the resulting `web.archive.org/web/...` URL. Accept an archive link only if it starts with `https://web.archive.org/web/`; if it doesn't, or if both steps fail, drop that source.
4. Write or update `src/content/people/<slug>.md` following `src/schema.ts`. Set `updatedAt` to today. For a new file, `role` is `candidate` unless told otherwise, and set `partyColor` (hex) to the color French media and Wikipedia use for the party; if there is none, the primary color of the party's official logo. Cite where you took it in the PR body. Do not add a photo.
5. Run `npm test && npm run build`. Fix schema errors. If the build still fails after 2 attempts, stop and report the error.
6. `git checkout -b research/<slug>`, commit (`content: research <name>`), push, and open a PR with `gh pr create`. PR body: one line per new fact, as a checklist:
   `- [ ] <type> · <date> · <title> — <source urls>`
   followed by, when applicable, a "Statuts à mettre à jour" section listing any existing fact whose status a newer source shows as outdated, with that source.
   Also write the same checklist to `docs/reviews/<slug>.md`, with a "Points d'attention" section (doubtful classifications, facts left out and why) and where `partyColor` comes from.
   End with: "Merge only after opening every source and checking every box."
7. Report the PR URL and any fact you left out because sources were insufficient.
