import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { person } from './schema';

const people = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/people' }),
  schema: person,
});

export const collections = { people };
