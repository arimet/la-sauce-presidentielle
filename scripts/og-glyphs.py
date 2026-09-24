"""Extract glyph outlines + pair kerning from the self-hosted fonts into src/og/glyphs.json.

The social images (src/og/render.ts) draw text as SVG paths, because librsvg/Pango
can't load woff2 files and would silently fall back to a system font.
Run once when the fonts or the character set change:

    python3 -m venv /tmp/v && /tmp/v/bin/pip install fonttools brotli
    /tmp/v/bin/python scripts/og-glyphs.py
"""
import json
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen

# Latin-1, Latin Extended-A and typographic punctuation: enough for French names.
CHARS = [chr(c) for c in [*range(0x20, 0x7F), *range(0xA0, 0x180), 0x2019, 0x2013, 0x2014, 0x2026, 0x202F]]
FONTS = {  # key: (woff2 files latin first, weight)
    'serifItalic': (['cormorant-garamond-italic-400-latin', 'cormorant-garamond-italic-400-latin-ext'], 500),
    'serif': (['cormorant-garamond-normal-400-latin', 'cormorant-garamond-normal-400-latin-ext'], 500),
    'sans': (['schibsted-grotesk-latin', 'schibsted-grotesk-latin-ext'], 600),
}


def kerning(font, names):
    """Flattened {pair: value} for the given glyph-name -> char map (GPOS PairPos, first lookup wins)."""
    out = {}
    if 'GPOS' not in font:
        return out
    for lookup in font['GPOS'].table.LookupList.Lookup:
        for s in lookup.SubTable:
            if lookup.LookupType == 9 and s.ExtensionLookupType == 2:
                s = s.ExtSubTable
            elif lookup.LookupType != 2:
                continue
            cov = s.Coverage.glyphs
            if s.Format == 1:
                for g1, ps in zip(cov, s.PairSet):
                    for r in ps.PairValueRecord:
                        v = getattr(r.Value1, 'XAdvance', 0) if r.Value1 else 0
                        if v and g1 in names and r.SecondGlyph in names:
                            out.setdefault(names[g1] + names[r.SecondGlyph], v)
            elif s.Format == 2:
                c1, c2 = s.ClassDef1.classDefs, s.ClassDef2.classDefs
                for g1 in cov:
                    if g1 not in names:
                        continue
                    rec = s.Class1Record[c1.get(g1, 0)]
                    for g2 in names:
                        r = rec.Class2Record[c2.get(g2, 0)]
                        v = getattr(r.Value1, 'XAdvance', 0) if r.Value1 else 0
                        if v:
                            out.setdefault(names[g1] + names[g2], v)
    return out


result = {}
for key, (files, weight) in FONTS.items():
    glyphs, kern, meta = {}, {}, None
    for i, file in enumerate(files):
        font = TTFont(f'public/fonts/{file}.woff2')
        font = instantiateVariableFont(font, {'wght': weight})
        if meta is None:
            meta = {'upm': font['head'].unitsPerEm, 'ascender': font['hhea'].ascent, 'descender': font['hhea'].descent}
        cmap, gs, hmtx = font.getBestCmap(), font.getGlyphSet(), font['hmtx']
        names = {}
        for ch in CHARS:
            if ch in glyphs or ord(ch) not in cmap:
                continue
            name = cmap[ord(ch)]
            pen = SVGPathPen(gs, lambda v: str(round(v)))
            gs[name].draw(pen)
            glyphs[ch] = [hmtx[name][0], pen.getCommands()]
            names[name] = ch
        if i == 0:
            kern = kerning(font, names)
    result[key] = {**meta, 'glyphs': glyphs, 'kern': kern}
    print(key, len(glyphs), 'glyphs', len(kern), 'kern pairs')

with open('src/og/glyphs.json', 'w') as f:
    json.dump(result, f, ensure_ascii=False, separators=(',', ':'))
