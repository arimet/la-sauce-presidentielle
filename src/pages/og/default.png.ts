import type { APIRoute } from 'astro';
import { getPeople } from '../../lib/people';
import { defaultImage, pngResponse } from '../../og/render';

export const GET: APIRoute = async () => {
  const colors = (await getPeople())
    .filter((p) => p.data.role === 'candidate')
    .sort((a, b) => a.data.name.localeCompare(b.data.name, 'fr'))
    .map((p) => p.data.partyColor!);
  return pngResponse(await defaultImage(colors));
};
