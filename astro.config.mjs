import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://diagnow.ai',
  output: 'static',
  trailingSlash: 'ignore',
  // Never inline scripts: the Content-Security-Policy in public/_headers only allows 'self'.
  vite: { build: { assetsInlineLimit: 0 } },
  i18n: {
    defaultLocale: 'bg',
    locales: ['bg', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
