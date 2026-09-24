// Social (Open Graph) images, 1200x630 PNG, rendered at build time with sharp.
// Text is drawn as SVG paths from src/og/glyphs.json (see scripts/og-glyphs.py):
// librsvg can't load our woff2 fonts and would silently use a system font.
import sharp from 'sharp';
import glyphData from './glyphs.json';
import { textOn } from '../lib/color';

const W = 1200, H = 630; // og:image:width/height in Base.astro
const INK = '#111111';
const BG = '#f4f4f2'; // --bg in Base.astro

type Font = { upm: number; ascender: number; descender: number; glyphs: Record<string, [number, string]>; kern: Record<string, number> };
const FONTS = glyphData as Record<'serifItalic' | 'serif' | 'sans', Font>;

/** Advance width of `text` in px (tracking in em). Unknown characters advance like a space. */
function measure(font: Font, text: string, size: number, tracking = 0): number {
  const chars = [...text];
  const units = chars.reduce((sum, ch, i) => sum + (font.glyphs[ch] ?? font.glyphs[' '])[0] + (font.kern[ch + (chars[i + 1] ?? '')] ?? 0), 0);
  return (units / font.upm + tracking * chars.length) * size;
}

/** `text` as SVG paths, baseline-left at (x, y). */
function text(font: Font, str: string, size: number, x: number, y: number, fill: string, tracking = 0): string {
  const s = size / font.upm;
  const chars = [...str];
  let pen = 0; // font units
  const paths = chars.map((ch, i) => {
    const [adv, d] = font.glyphs[ch] ?? font.glyphs[' '];
    const path = d ? `<path transform="translate(${pen} 0)" d="${d}"/>` : '';
    pen += adv + (font.kern[ch + (chars[i + 1] ?? '')] ?? 0) + tracking * font.upm;
    return path;
  });
  return `<g fill="${fill}" transform="translate(${x} ${y}) scale(${s} ${-s})">${paths.join('')}</g>`;
}

/** Greedy word wrap into at most `maxLines` lines, shrinking the size until it fits `maxWidth`. */
function fitLines(font: Font, str: string, size: number, maxWidth: number, maxLines: number, tracking: number) {
  for (; ; size -= 4) {
    const lines: string[] = [];
    for (const word of str.split(' ')) {
      const last = lines.at(-1);
      if (last !== undefined && measure(font, `${last} ${word}`, size, tracking) <= maxWidth) lines[lines.length - 1] = `${last} ${word}`;
      else lines.push(word);
    }
    if ((lines.length <= maxLines && lines.every((l) => measure(font, l, size, tracking) <= maxWidth)) || size <= 40) return { lines, size };
  }
}

const svg = (body: string) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${body}</svg>`);

/** Home / generic pages: Élysée backdrop, party-color stripes, wordmark and tagline. */
export async function defaultImage(colors: string[]): Promise<Buffer> {
  const backdrop = await sharp('public/images/elysee-toon.webp').resize(W, H, { fit: 'cover', position: 'bottom' }).toBuffer();
  const sw = W / colors.length, sh = 22;
  const stripes = colors.map((c, i) => `<rect x="${i * sw}" y="0" width="${sw}" height="${sh}" fill="${c}"/>`).join('')
    + colors.slice(1).map((_, i) => `<rect x="${(i + 1) * sw - 1}" y="0" width="2" height="${sh}" fill="${INK}"/>`).join('')
    + `<rect x="0" y="${sh}" width="${W}" height="3" fill="${INK}"/>`;
  const overlay = svg(`
    <defs><radialGradient id="wash" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0.55" stop-color="${BG}"/><stop offset="1" stop-color="${BG}" stop-opacity="0"/>
    </radialGradient></defs>
    ${stripes}
    <ellipse cx="330" cy="470" rx="560" ry="260" fill="url(#wash)"/>
    ${text(FONTS.serifItalic, 'La Sauce', 150, 64, 440, INK, -0.03)}
    ${text(FONTS.serifItalic, 'Présidentielle', 63, 70, 502, INK, -0.01)}
    ${text(FONTS.serif, 'Avant de voter, les faits.', 44, 70, 570, INK, -0.01)}`);
  return sharp(backdrop).composite([{ input: overlay }]).png().toBuffer();
}

/** Candidate page: party-color background, outlined cut-out portrait, name and wordmark. */
export async function personImage({ name, color, photo }: { name: string; color: string; photo?: string }): Promise<Buffer> {
  const ink = textOn(color);
  const layers: sharp.OverlayOptions[] = [];
  let textRight = W - 64;
  if (photo) {
    // Ink outline, same technique as the SVG filters in Base.astro: blur the alpha,
    // then a steep linear ramp re-thresholds it r px outside the silhouette.
    const r = 6, sigma = r / 2, slope = sigma / 0.054, pad = r * 3;
    const portrait = await sharp(`public${photo}`).resize({ height: 700 })
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } }).ensureAlpha().png().toBuffer();
    const { width = 0, height = 0 } = await sharp(portrait).metadata();
    // Two pipelines: sharp applies linear() before blur() within one.
    const blurred = await sharp(portrait).extractChannel('alpha').blur(sigma).png().toBuffer();
    const mask = await sharp(blurred).linear(slope, (0.5 - slope * 0.0228) * 255).toBuffer();
    const outline = await sharp({ create: { width, height, channels: 3, background: ink } }).joinChannel(mask).png().toBuffer();
    const top = 40 - pad; // the bottom of the cut-out runs off the edge, like the site hero
    const outlined = await sharp(outline).composite([{ input: portrait }]).png().toBuffer();
    const cropped = await sharp(outlined).extract({ left: 0, top: 0, width, height: Math.min(height, H - top) }).toBuffer();
    const left = W - width - 30;
    layers.push({ input: cropped, left, top });
    textRight = left + pad - 32;
  }
  const { lines, size } = fitLines(FONTS.sans, name, 120, textRight - 60, 3, -0.04);
  const lineH = size * 0.95;
  const top = 360 - ((lines.length - 1) * lineH) / 2;
  layers.push({
    input: svg(`
      ${text(FONTS.serifItalic, 'La Sauce Présidentielle', 44, 64, 96, ink, -0.01)}
      ${lines.map((l, i) => text(FONTS.sans, l, size, 60, top + i * lineH, ink, -0.04)).join('')}`),
    left: 0, top: 0,
  });
  return sharp({ create: { width: W, height: H, channels: 3, background: color } }).composite(layers).png().toBuffer();
}

export const pngResponse = (body: Buffer) => new Response(new Uint8Array(body), { headers: { 'Content-Type': 'image/png' } });

