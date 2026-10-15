import { defineConfig } from 'vite';
import pages from './plugins/pages.js';

// Served by GitHub Pages at the custom domain phosphor.creativllc.org, at the root path (see public/CNAME, DEPLOY.md).
export default defineConfig({
  base: '/',
  plugins: [pages()],
  build: {
    assetsDir: 'bundle',
    target: 'es2022',
    modulePreload: { polyfill: false },
    cssMinify: true,
    // inline the 18 KB VT323 into the CSS so text paints once, in the right font
    assetsInlineLimit: (file) => (file.endsWith('.woff2') ? true : undefined),
  },
  server: { host: '127.0.0.1', port: 5181, strictPort: true },
  preview: { host: '127.0.0.1', port: 5182, strictPort: true },
});
