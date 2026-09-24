# La Sauce Présidentielle

[English](README.md) · **Français**

Un site neutre et sourcé sur les candidats à l'élection présidentielle française de 2027.
Site en ligne : https://arimet.github.io/la-sauce-presidentielle/

Pour chaque candidat, le site recense :

- les **condamnations** et **procédures judiciaires**, toujours avec leur issue (appel, relaxe, non-lieu, classement sans suite) ;
- les **allégations** rapportées par au moins deux médias indépendants ;
- les **prises de position controversées** (déclarations ou votes ayant suscité une controverse publique documentée) ;
- **« Autour du parti »** : les polémiques documentées impliquant d'autres membres du parti du candidat, avec le nom de la personne concernée, jamais imputées au candidat ;
- le **contexte** : les débats publics documentés liés au candidat qui ne portent pas sur ses propres actes ;
- les **grandes lignes du programme** par thème, tirées uniquement de sources officielles ;
- l'**entourage** : au plus 8 rôles clés de campagne par candidat, avec leur parcours documenté depuis 2012 et leurs liens d'intérêts déclarés, ainsi qu'un graphe et un tableau des organisations communes à plusieurs entourages (`/entourage`). Un lien d'intérêt déclaré n'implique aucune faute.

Les candidats sont affichés dans un ordre aléatoire à chaque visite.

## Principes

- **Neutralité** : rédaction factuelle, sans adjectif qui juge, sans commentaire.
- **Présomption d'innocence** : toute affaire non définitive (en cours, en appel) porte une mention le rappelant.
- **Issues toujours indiquées** : relaxes, non-lieux et classements sont regroupés à part, jamais comptés comme condamnations ou procédures.
- **Vie privée exclue**.
- **Mêmes critères** pour tous les candidats et tous les partis.

La méthodologie complète est sur le site : [Méthodologie](https://arimet.github.io/la-sauce-presidentielle/methodologie).

## Comment les sources sont trouvées et validées

La recherche est assistée par un agent d'IA, puis validée par un humain. Rien n'est publié sans relecture humaine.

1. **Recherche assistée par IA.** La commande [`/research`](.claude/commands/research.md), lancée avec [Claude Code](https://claude.com/claude-code) (`/research Prénom Nom`), cherche sur le web les condamnations, procédures, polémiques et le programme officiel. Elle suit des règles strictes :
   - uniquement des sources acceptées : décisions de justice et Légifrance, HATVP, AFP, Le Monde, Le Figaro, Libération, Les Échos, La Croix, L'Humanité, Mediapart, Le Canard enchaîné, France Info, France Inter, France 24, RFI, Public Sénat, LCP, Le Parisien, Ouest-France, 20 Minutes, TF1 Info. Réseaux sociaux, blogs et sites partisans ne sont jamais une source unique ;
   - les allégations, faits « autour du parti » et faits de contexte exigent **deux sources indépendantes** ;
   - les mesures de programme viennent uniquement de sources officielles (document de programme, site du candidat ou du parti, déclaration de candidature) ;
   - chaque URL est **archivée sur la Wayback Machine** ; une source sans lien d'archive est écartée ;
   - la dernière issue connue de chaque affaire est indiquée.

   L'agent rédige le fichier Markdown (`src/content/people/<slug>.md`) et une liste de relecture (`docs/reviews/<slug>.md`) qui reprend chaque fait avec ses sources, les classements douteux et les faits écartés, puis ouvre une pull request.
   La commande [`/entourage`](.claude/commands/entourage.md) procède en deux temps, pour qu'un humain valide le périmètre avant la recherche approfondie : `/entourage list <slug-du-candidat>` recense les rôles clés de campagne (sourcés, 8 au plus), puis `/entourage details <slug-de-la-personne>…` complète le parcours et les liens d'intérêts déclarés, en partant des sources officielles (open data HATVP, registre des entreprises, Journal officiel), avec une règle stricte sur les homonymes. Elle écrit les fichiers et une liste de vérification (`docs/reviews/<slug>-entourage.md`) mais ne commite jamais. `node scripts/check-people.mjs` valide les fichiers avec le schéma sans build complet.
2. **Validation humaine.** Une personne ouvre chaque source, vérifie chaque fait, coche la liste et seulement ensuite fusionne. Les listes restent dans [`docs/reviews/`](docs/reviews/), par transparence.
3. **Contrôles du schéma.** [`src/schema.ts`](src/schema.ts) (Zod) fait échouer la compilation pour tout fait sans source, toute source sans archive `web.archive.org/web/`, une allégation à source unique, un statut définitif sur une allégation, une photo sans crédit, etc.

L'IA peut se tromper : mal lire un article, mal classer un fait, manquer une décision plus récente. C'est pourquoi chaque fait passe par une relecture humaine et pourquoi les listes de relecture sont publiques. Si vous repérez une erreur, signalez-la (voir plus bas).

## Photos

Les portraits sont des images sous licence libre issues de Wikimedia Commons et d'institutions européennes (CC0, CC BY ou CC BY-SA), détourées et stylisées. Chaque page crédite sa photo ; sources, licences et traitements sont listés dans [`docs/reviews/photos.md`](docs/reviews/photos.md).

## Corrections et droit de réponse

Une erreur, une décision de justice plus récente, une réponse à publier : écrivez à l'adresse indiquée sur la [page Méthodologie](https://arimet.github.io/la-sauce-presidentielle/methodologie), ou [ouvrez une issue GitHub](https://github.com/arimet/la-sauce-presidentielle/issues), en précisant la page concernée et vos sources.

## Technique

Site statique [Astro 7](https://astro.build) : content collections, schéma Zod, pas de base de données, pas de framework JavaScript (seulement quelques petits scripts en ligne).

```
src/
  content/people/   un fichier Markdown par personne (frontmatter YAML)
  schema.ts         schéma Zod : les règles de publication
  content.config.ts collection de contenu
  lib/              libellés, regroupements, couleurs, gestion du base path
  components/       PersonCard, Measures
  layouts/Base.astro
  pages/            accueil, page personne, programmes, méthodologie, 404
public/             photos, polices, favicon, fond de l'Élysée
docs/reviews/       listes de relecture et crédits photo
tests/              tests unitaires node:test
.claude/commands/research.md   instructions de l'agent de recherche
```

Nécessite Node 24.

```sh
npm install
npm run dev     # http://localhost:4321
npm test        # tests unitaires (schéma, regroupements, couleurs)
npm run build   # site statique dans dist/
```

### Ajouter un candidat

Lancez `/research Prénom Nom` dans Claude Code, ou écrivez le fichier à la main.

1. Créez `src/content/people/<slug>.md` (slug : nom en minuscules ASCII, mots séparés par des tirets) :

   ```yaml
   ---
   name: Camille Exemple
   party: Parti Exemple
   role: candidate            # ou "team" avec candidateOf: <slug>, teamPosition, teamSources (voir /entourage)
   partyColor: "#1D4ED8"
   photo: /photos/camille-exemple.png
   photoCredit: "Auteur, Wikimedia Commons, CC BY-SA 4.0, détourée"
   updatedAt: 2026-09-23
   facts:
     - title: Mise en examen pour ...
       type: proceeding       # conviction | proceeding | allegation | stance | party | context
       status: ongoing        # final | appeal | ongoing | acquitted | dismissed | dropped
       date: 2025-01-15
       summary: >
         Résumé neutre et factuel, avec la dernière issue connue.
       sources:
         - title: Titre de l'article
           outlet: Le Monde
           url: https://www.lemonde.fr/...
           archive: https://web.archive.org/web/2025.../https://www.lemonde.fr/...
           date: 2025-01-15
   programme:                 # facultatif
     status: published        # ou announced
     checkedAt: 2026-09-23
     sources: [ ... ]         # même forme que ci-dessus
     themes:                  # economy, work, immigration, security, ecology,
       economy:               # healthEducation, institutions, international
         - text: Mesure, 280 caractères maximum
           source: { ... }
   ---
   ```

   Les faits `stance` et `context` n'ont pas de `status` ; les faits `party` exigent `concerns: { name, position }`.
2. **partyColor** : la couleur utilisée par les médias français et Wikipédia pour le parti ; à défaut, la couleur principale du logo officiel. La couleur du texte par-dessus est choisie automatiquement pour le contraste.
3. **Photo** (facultative) : un portrait sous licence libre, détouré, en buste, enregistré en PNG transparent dans `public/photos/<slug>.png`. Renseignez `photo` et `photoCredit`, et ajoutez source et licence dans `docs/reviews/photos.md`. Sans photo, les initiales s'affichent.
4. **Fichier de relecture** : `docs/reviews/<slug>.md`, une liste de chaque fait et de ses sources, cochée par la personne qui relit.
5. Lancez `npm test && npm run build`.

### Dépannage

Si le serveur de dev affiche un contenu périmé après un changement de schéma (par exemple un nouveau champ qui n'apparaît pas), arrêtez-le, supprimez `.astro/data-store.json` puis relancez `npm run dev`. Les builds de production ne sont pas concernés.

## Déploiement (GitHub Pages)

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) teste, compile et déploie à chaque push sur `main` (et sur déclenchement manuel). [`ci.yml`](.github/workflows/ci.yml) lance tests et compilation sur les pull requests.

Configuration unique : **Settings → Pages → Source : GitHub Actions**.

Le base path est géré automatiquement : `actions/configure-pages` fournit `SITE_URL` et `BASE_PATH` (`/la-sauce-presidentielle` pour un site de projet, vide avec un domaine personnalisé), et tous les liens internes passent par `src/lib/url.ts`. Pour un domaine personnalisé, renseignez-le dans les réglages Pages (ou ajoutez `public/CNAME`) et configurez le DNS ; aucun changement de code n'est nécessaire.

## Mesure d'audience

La mesure d'audience utilise [GoatCounter](https://www.goatcounter.com), sans cookie ni donnée personnelle, uniquement en production. Pour utiliser votre propre compte, changez le code GoatCounter dans [`src/layouts/Base.astro`](src/layouts/Base.astro).

## Licences

- **Code** : [MIT](LICENSE).
- **Contenu éditorial** (`src/content/`, `docs/reviews/`) : [CC BY-SA 4.0](LICENSE-content.md), car certaines photos dérivées sont sous CC BY-SA.
- **Photos** : chacune garde sa propre licence (CC0, CC BY 4.0, CC BY-SA 2.0 ou 4.0), listée dans [`docs/reviews/photos.md`](docs/reviews/photos.md).
- **Polices** (Cormorant Garamond, Schibsted Grotesk, IBM Plex Mono) : SIL Open Font License, voir [`public/fonts/LICENSE.md`](public/fonts/LICENSE.md).

## Auteur

Anthony Rimet — https://github.com/arimet
