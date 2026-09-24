import { defineConfig } from 'astro/config';

// SITE_URL and BASE_PATH are set by the deploy workflow (GitHub Pages).
export default defineConfig({
  site: process.env.SITE_URL,
  base: process.env.BASE_PATH || '/',
});
