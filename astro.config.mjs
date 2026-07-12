import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://boomich.pt',
  integrations: [
    sitemap({
      filter: (page) => page !== 'https://boomich.pt/og/',
    }),
  ],
});
