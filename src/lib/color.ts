const DARK = '#111111';
const LIGHT = '#ffffff';

// WCAG 2 relative luminance.
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

export function textOn(hex: string): typeof DARK | typeof LIGHT {
  const l = luminance(hex);
  return contrast(l, luminance(DARK)) >= contrast(l, luminance(LIGHT)) ? DARK : LIGHT;
}

/** Tone of the ink outline drawn around portraits on this background (see the filters in Base.astro). */
export const inkTone = (hex: string) => (textOn(hex) === LIGHT ? 'light' : 'dark');
