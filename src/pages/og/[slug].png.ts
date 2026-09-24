import type { APIRoute, GetStaticPaths } from 'astro';
import { getPeople, personColor, type PersonEntry } from '../../lib/people';
import { personImage, pngResponse } from '../../og/render';

export const getStaticPaths = (async () => {
  const people = await getPeople();
  return people.map((person) => ({ params: { slug: person.id }, props: { person, color: personColor(person, people) } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const { person, color } = props as { person: PersonEntry; color: string };
  return pngResponse(await personImage({ name: person.data.name, color, photo: person.data.photo }));
};
