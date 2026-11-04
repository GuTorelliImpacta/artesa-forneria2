import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://artesaforneria.com.br',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // CSP sem 'unsafe-inline': nenhum CSS/JS inline no HTML gerado.
    inlineStylesheets: 'never',
  },
  integrations: [sitemap({ filter: (p) => !p.includes('/404') })],
  vite: {
    plugins: [tailwindcss()],
    build: { assetsInlineLimit: 0 },
  },
  image: { layout: 'constrained' },
});
