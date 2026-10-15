// Fills <!--slot:head--> and <!--slot:body--> in index.html from src/render.js (which reads src/content.js).
// Runs in dev and build, so the shipped HTML holds every word of copy; JS only adds motion.
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export default function pages() {
  let root = process.cwd();
  return {
    name: 'phosphor-pages',
    configResolved(c) { root = c.root; },
    async transformIndexHtml(html, ctx) {
      const url = pathToFileURL(resolve(root, 'src/render.js')).href + `?t=${Date.now()}`;
      const r = await import(url);
      return html.replace('<!--slot:head-->', r.renderHead()).replace('<!--slot:body-->', r.renderBody());
    },
    // 404.html is standalone (GitHub Pages serves it at any depth); the repo and site links are filled in.
    async generateBundle() {
      const { readFile } = await import('node:fs/promises');
      const c = await import(pathToFileURL(resolve(root, 'src/content.js')).href + `?t=${Date.now()}`);
      // the home link is absolute (SITE_URL), so it lands on the project site, not on the github.io root
      const site = new URL(c.SITE_URL, 'https://localhost/');
      const html = (await readFile(resolve(root, 'src/404.html'), 'utf8'))
        .replaceAll('%REPO_URL%', c.REPO_URL)
        .replaceAll('%SITE_URL%', c.SITE_URL)
        .replaceAll('%SITE_PATH%', site.pathname);
      this.emitFile({ type: 'asset', fileName: '404.html', source: html });
    },
    handleHotUpdate({ file, server }) {
      if (/src\/(content|render)\.js$/.test(file)) server.ws.send({ type: 'full-reload' });
    },
  };
}
