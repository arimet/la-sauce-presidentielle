# Portraits — sourcing and licenses

Every portrait is a freely licensed photo (sources and licenses below), background-removed
with rembg and cropped to head and shoulders (consistent framing, max 1200px tall, optimized
PNG < 600 KB each), stored at `public/photos/<slug>.png`. Original files are not kept in the
repository; follow the source links below to get them. The YAML lines under each person are
the `photo` / `photoCredit` values used in `src/content/people/<slug>.md`.

---

## marine-le-pen

```yaml
photo: /photos/marine-le-pen.png
photoCredit: "VOX España, Wikimedia Commons, CC0, détourée"
```

- Source page: https://commons.wikimedia.org/wiki/File:Marine_Le_Pen_2022_(cropped).jpg
- Original file: https://upload.wikimedia.org/wikipedia/commons/e/e0/Marine_Le_Pen_2022_%28cropped%29.jpg
- License: Public Domain / CC0 (uploader-dedicated) — https://creativecommons.org/publicdomain/zero/1.0/deed.en (Commons page lists "Public domain", credited to VOX España / Flickr)
- Why chosen: front-facing, natural smile (neutral, not a grimace or a glamour shot), sharp, formal setting (in front of the French flag), good resolution (1099×1621). Compared against a 2025 press-conference close-up (slight smirk) and a VIVA24 shot (mouth open mid-sentence) — this one reads as the fairest, most neutral image of the three.

---

## edouard-philippe

```yaml
photo: /photos/edouard-philippe.png
photoCredit: "Wasasaq8, Wikimedia Commons, CC0, détourée"
```

- Source page: https://commons.wikimedia.org/wiki/File:Edouard_Philippe_3x4_crop.jpg
- Original file: https://upload.wikimedia.org/wikipedia/commons/a/a3/Edouard_Philippe_3x4_crop.jpg
- License: CC0 (public domain dedication) — https://creativecommons.org/publicdomain/zero/1.0/deed.en
- Why chosen: described by the uploader as "Edouard Philippe posant pour un portrait" — an actual studio-style headshot, neutral expression, front-facing, plain grey background, sharp. Compared against a 2023 Châlons-en-Champagne shot (mouth open mid-speech, harsh flash glare) and a 2019 podium shot (slight smile, good quality but mid-speech looking) — the 3x4 portrait is the most neutral of the three, at the cost of a somewhat lower source resolution (718×958, still enough for a 1200px-tall cut-out).

---

## jean-luc-melenchon

```yaml
photo: /photos/jean-luc-melenchon.png
photoCredit: "jlm2017.fr, Wikimedia Commons, CC BY 4.0, détourée"
```

- Source page: https://commons.wikimedia.org/wiki/File:Jean-Luc_M%C3%A9lenchon_en_2026.png
- Original file: https://upload.wikimedia.org/wikipedia/commons/7/7f/Jean-Luc_M%C3%A9lenchon_en_2026.png
- License: CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/deed.en
- Why chosen: the most recent portrait available (2026), serious/neutral expression, front-facing, sharp, high resolution (1568×2093). Compared against a 2022 stage shot (mouth open mid-speech, off-color stage lighting) — the 2026 photo is clearly the fairer, more neutral choice despite the busier indoor background (removed by the cut-out anyway).
- Background removal note: `u2net` and `isnet-general-use` left a grey ghosting artifact from the office bookshelf on the left edge; re-ran with `u2net_human_seg`, which gave a clean silhouette — used for the final file.

---

## gabriel-attal

```yaml
photo: /photos/gabriel-attal.png
photoCredit: "Ismail Aissoub, Wikimedia Commons, CC BY 4.0, détourée"
```

- Source page: https://commons.wikimedia.org/wiki/File:Gabriel_Attal_2025_(cropped2).jpg
- Original file: https://upload.wikimedia.org/wikipedia/commons/a/a7/Gabriel_Attal_2025_%28cropped2%29.jpg
- License: CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/deed.en
- Why chosen: recent (2025), front-facing, neutral almost-neutral expression, sharp, formal suit, high resolution (1787×2381). Compared against an older casual outdoor headshot (denim shirt, informal, pre-PM era) which didn't fit the neutral/formal register of the other four portraits.

---

## raphael-glucksmann

```yaml
photo: /photos/raphael-glucksmann.png
photoCredit: "European Union 2024 - Source : EP, European Parliament, CC BY 4.0, détourée"
```

- Source page: https://commons.wikimedia.org/wiki/File:1720448398743_20240708_GLUCKSMANN_Raphael_FR_006.jpg
- Original file: https://upload.wikimedia.org/wikipedia/commons/1/1f/1720448398743_20240708_GLUCKSMANN_Raphael_FR_006.jpg
- License: European Parliament reuse license (CC BY 4.0) — https://www.europarl.europa.eu/legal-notice/en/ and https://creativecommons.org/licenses/by/4.0/deed.en
- Why chosen: official European Parliament studio headshot (white background, front-facing, neutral expression, sharp, 3528×4536) — the best-quality and most neutral portrait of the whole set, effectively already an official ID-style photo.

---

## Licensing note (CC BY-SA)

None of the five final picks are CC BY-SA, so no derivative-license obligation applies here.
(For reference: had a CC BY-SA source been used — e.g. the alternate 2023 Édouard Philippe or
2021 Jérémy Barande photos considered and rejected above — the cut-out PNG derivative would
have to stay CC BY-SA too, and that should be noted in the photoCredit line.)

## Processing details

- Background removal: `rembg[cpu]` in a throwaway venv, models `u2net` (default) and
  `u2net_human_seg` (used for Mélenchon after `u2net`/`isnet-general-use` left an edge
  artifact).
- Crop: to the alpha channel's bounding box (head+shoulders, top of head at the top edge),
  resized so height ≤ 1200px, kept aspect ratio.
- Optimization: PNG palette-quantized (Pillow, Fast Octree + Floyd–Steinberg dither) to stay
  well under 600 KB — actual sizes: Le Pen 183 KB, Philippe 117 KB, Mélenchon 195 KB,
  Attal 177 KB, Glucksmann 245 KB.
- Originals are not in the repository (see source links).

## Party colors (2026-09-23)

`partyColor` follows the colors French media and Wikipedia use for each party, so readers
recognize them; the party's official logo color is the fallback.

- Rassemblement national: `#0D378A` (media/Wikipedia navy).
- La France insoumise: `#CC2443` (media/Wikipedia red).
- Renaissance: `#FFEB00` (media/Wikipedia yellow; text switches to dark via `textOn`).
- Horizons: `#0001B8`. The official site (horizonsleparti.fr theme CSS) uses `#27348A`,
  a navy nearly identical to RN's `#0D378A`, so the saturated blue was kept instead.
- Place publique: `#E83A7F`, the official accent (`--secondary` in the place-publique.eu
  theme CSS; the primary `#0F345C` is navy and would clash with RN/Horizons).

## Bust rounding (2026-09-23)

The bottom corners of every cut-out are rounded into a bust shape (alpha multiplied by an
elliptical mask, radii 24% of width / 26% of height, rendered at 4x and downsampled), so
the ink outline follows a curve instead of the photo's straight crop.

## Intro backdrop: Palais de l'Élysée (2026-09-23)

`public/images/elysee-toon.webp` (1920×1000, ~80 KB), shown behind the drips on the home
intro slide, credited on the slide.

- Source page: https://commons.wikimedia.org/wiki/File:Palais_de_l%27%C3%89lys%C3%A9e_2019.jpg
- Author: Leynadmar (own work, 2019-09-28)
- License: CC BY-SA 4.0 — https://creativecommons.org/licenses/by-sa/4.0 — the stylized
  derivative is therefore also CC BY-SA 4.0.
- Treatment (offline with OpenCV, not a project dependency): cropped to the
  cour d'honneur facade, repeated bilateral smoothing, posterized to 4 low-contrast neutral
  tones, Canny ink lines with small specks removed and anti-aliased, sky faded into the page
  background.

---

## Second batch — Zemmour, Roussel, Retailleau, Cazeneuve, Bertrand, Batho, Faure (2026-09-23)

Same pipeline as the first five: rembg (`isnet-general-use`, except Batho which needed
`u2net_human_seg` to remove a hair-fringe ghosting artifact) in the session venv, crop to
the alpha bounding box, resize to ≤1200px tall, bust-rounded corners (same mask as above),
palette-quantized PNG. Cazeneuve's first source pick (a "portrait 2024" crowd photo) had
another minister's head overlapping his shoulder and rembg couldn't cleanly separate them
even after a tight manual pre-crop — swapped for a solo Jérémy Barande photo instead (see
below). All final sizes are under 600 KB; originals are not in the repository.

### eric-zemmour

```yaml
photo: /photos/eric-zemmour.png
photoCredit: "Anh De France, Wikimedia Commons, CC0, détourée"
```

- Source page: https://commons.wikimedia.org/wiki/File:Portrait_d%27%C3%89ric_Zemmour,_avril_2022_(cropped).jpg
- Original file: https://upload.wikimedia.org/wikipedia/commons/9/9c/Portrait_d%27%C3%89ric_Zemmour%2C_avril_2022_%28cropped%29.jpg
- License: CC0 — http://creativecommons.org/publicdomain/zero/1.0/deed.en
- Why chosen: an actual studio-style portrait (not a rally/podium shot), front-facing,
  natural closed-mouth smile, sharp, high resolution (1793×2276). Compared against a 2023
  BFM TV appearance (CC BY-SA 2.0, decent but slightly more posed-for-TV) and a 2024
  European-elections crowd photo (too far, low usable resolution) — the 2022 portrait is
  the most neutral and highest quality of the three.

### fabien-roussel

```yaml
photo: /photos/fabien-roussel.png
photoCredit: "Zouhaïr Nakara (NakaraZn), Wikimedia Commons, CC BY-SA 4.0, détourée"
```

- Source page: https://commons.wikimedia.org/wiki/File:Fabien_Roussel_2022_(cropped).jpg
- Original file: https://upload.wikimedia.org/wikipedia/commons/0/00/Fabien_Roussel_2022_%28cropped%29.jpg
- License: CC BY-SA 4.0 — https://creativecommons.org/licenses/by-sa/4.0 — the cut-out
  derivative stays CC BY-SA 4.0.
- Why chosen: nearly every other available Commons photo of Roussel is a podium/rally shot
  with an open mouth mid-speech (checked ~8 candidates from PCF congresses 2018–2026,
  including the French Wikipedia infobox pick, "Roussel Fabien 1.jpg", which is sharp but
  also mid-word and lower resolution at 591×849). This 2022 photo is the only one with a
  natural closed-mouth smile, front-facing, sharp, and decent resolution (914×1219).

### bruno-retailleau

```yaml
photo: /photos/bruno-retailleau.png
photoCredit: "Jean Baptiste Doat, Wikimedia Commons, CC BY-SA 4.0, détourée"
```

- Source page: https://commons.wikimedia.org/wiki/File:Bruno_Retailleau.png
- Original file: https://upload.wikimedia.org/wikipedia/commons/5/57/Bruno_Retailleau.png
- License: CC BY-SA 4.0 — https://creativecommons.org/licenses/by-sa/4.0 — the cut-out
  derivative stays CC BY-SA 4.0. Photo supplied directly by the author and VRT-verified
  (OTRS ticket #2019031510003642).
- Why chosen: most other Retailleau photos on Commons are mid-speech close-ups with
  microphones in frame (Ministry press events) or off-angle profile shots. This one is a
  genuine portrait: front-facing, natural smile, sharp, plain bookshelf background. Also
  rejected the European Council press photo "Bruno RETAILLEAU (Minister for the Interior,
  France).jpg" — good quality and pose, but flagged on Commons under "Attribution only
  license" and an active June 2026 deletion request, so not safely reusable. Trade-off:
  this pick is from 2019 (photo date), older than the 2020+ preference, and lower
  resolution (483×598) than the other picks — accepted for the much better neutrality/quality
  and clean, VRT-confirmed permission.

### bernard-cazeneuve

```yaml
photo: /photos/bernard-cazeneuve.png
photoCredit: "Jérémy Barande, Wikimedia Commons, CC BY-SA 2.0, détourée"
```

- Source page: https://commons.wikimedia.org/wiki/File:Bernard_Cazeneuve,_(42399145362)_(cropped).jpg
- Original file: https://upload.wikimedia.org/wikipedia/commons/a/ac/Bernard_Cazeneuve%2C_%2842399145362%29_%28cropped%29.jpg
- License: CC BY-SA 2.0 — https://creativecommons.org/licenses/by-sa/2.0 — the cut-out
  derivative stays CC BY-SA 2.0.
- Why chosen: first pick was a 2014 Flickr photo ("Bernard Cazeneuve (octobre 2014).jpg",
  CC BY 2.0) of him walking flanked by two gendarmes — looked clean at thumbnail size, but
  at full resolution another official's head is directly behind/overlapping his shoulder,
  and even a tight manual pre-crop couldn't get rembg to separate them without a ghost
  fringe. Swapped for this Jérémy Barande shot instead: natural (if broad) smile, sharp,
  good resolution (2087×2917) — the same photographer/session used for the first-batch
  Assemblée nationale portraits elsewhere in this project.

### xavier-bertrand

```yaml
photo: /photos/xavier-bertrand.png
photoCredit: "Mathieu Drean / European Union 2023, Wikimedia Commons, CC BY 4.0, détourée"
```

- Source page: https://commons.wikimedia.org/wiki/File:Xavier_Bertrand_-_2023_(cropped).jpg
- Original file: https://upload.wikimedia.org/wikipedia/commons/a/a4/Xavier_Bertrand_-_2023_%28cropped%29.jpg
- License: European Commission Audiovisual Service reuse license (CC BY 4.0) —
  https://creativecommons.org/licenses/by/4.0
- Why chosen: official EU photographer portrait taken during a ministerial visit to
  Brussels, front-facing, neutral expression, sharp, plain backdrop. Compared against a
  2025 EU photo of the same series (also good, but this 2023 one had the calmer
  expression) and several rally/assembly shots from 2011–2019 that were lower quality or
  off-angle.

### delphine-batho

```yaml
photo: /photos/delphine-batho.png
photoCredit: "DeuxSevres79, Wikimedia Commons, CC BY-SA 4.0, détourée"
```

- Source page: https://commons.wikimedia.org/wiki/File:Delphine_Batho_(cropped-2).png
- Original file: https://upload.wikimedia.org/wikipedia/commons/c/c2/Delphine_Batho_%28cropped-2%29.png
- License: CC BY-SA 4.0 — https://creativecommons.org/licenses/by-sa/4.0 — the cut-out
  derivative stays CC BY-SA 4.0.
- Why chosen: this is also the current French Wikipedia infobox photo for her. Checked
  ~8 alternatives (2013 debate stills, 2021 event crops, ministry-era photos) — all were
  either lower resolution, mid-speech, or too distant; this one is sharp, high resolution
  (2894×3840), and while she's looking slightly up and to the side rather than straight at
  the camera, the expression is calm/thoughtful rather than a grimace, matching the
  neutral-and-fair bar used for the rest of the set.
- Background removal note: `isnet-general-use` left a translucent ghost of a stray curl
  behind her head; re-ran with `u2net_human_seg`, which gave a clean silhouette.

### olivier-faure

```yaml
photo: /photos/olivier-faure.png
photoCredit: "Olivier Faure, Wikimedia Commons, CC BY-SA 2.0, détourée"
```

- Source page: https://commons.wikimedia.org/wiki/File:Portrait_d%27Olivier_Faure_(cropped_2).jpg
- Original file: https://upload.wikimedia.org/wikipedia/commons/b/b5/Portrait_d%27Olivier_Faure_%28cropped_2%29.jpg
- License: CC BY-SA 2.0 — https://creativecommons.org/licenses/by-sa/2.0 (self-published by
  Faure on Flickr in 2012) — the cut-out derivative stays CC BY-SA 2.0.
- Why chosen: a genuine studio-style headshot, front-facing, natural smile, plain grey
  background, sharp, good resolution (2040×2855). Compared against a 2024 Parti Socialiste
  d'été event photo (CC0, decent but distant/serious) and a 2023 PES congress portrait
  (CC BY 2.0, sharp but dramatic stage lighting and a look-away gaze) — this one is older
  (2012, predates the 2020+ preference) but is clearly the best match for the neutral,
  plain-background style used across the rest of the set.
