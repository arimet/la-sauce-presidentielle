import type { APIRoute } from 'astro';
import { getPeople } from '../lib/people';
import { absoluteUrl } from '../lib/url';

const day = (d: Date) => d.toISOString().slice(0, 10);

export const GET: APIRoute = async () => {
  const people = await getPeople();
  const latest = new Date(Math.max(...people.map((p) => p.data.updatedAt.getTime())));
  const entries: [string, Date?][] = [
    ['/', latest],
    ['/programmes/', latest],
    ['/entourage/', latest],
    ['/methodologie/'],
    ...people.map((p): [string, Date] => [`/${p.id}/`, p.data.updatedAt]),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(([path, lastmod]) => `  <url><loc>${absoluteUrl(path)}</loc>${lastmod ? `<lastmod>${day(lastmod)}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
