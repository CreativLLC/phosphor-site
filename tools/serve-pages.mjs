// Serves dist/ the way GitHub Pages does: real files, "dir/" -> dir/index.html, anything else -> 404.html (status 404).
// Optional sub-path, to test base './': node tools/serve-pages.mjs 4175 /phosphor-os/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const port = +(process.argv[2] || 4175);
const prefix = process.argv[3] || '/';
const root = path.resolve(import.meta.dirname, '../dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.txt': 'text/plain' };
http
  .createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (!p.startsWith(prefix)) return send(res, path.join(root, '404.html'), 404);
    p = p.slice(prefix.length - 1);
    let f = path.join(root, p);
    if (!f.startsWith(root)) return send(res, path.join(root, '404.html'), 404);
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    fs.existsSync(f) ? send(res, f, 200, req) : send(res, path.join(root, '404.html'), 404);
  })
  .listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}${prefix}`));
function send(res, f, code, req) {
  const st = fs.statSync(f);
  const type = types[path.extname(f)] || 'application/octet-stream';
  const range = req?.headers.range?.match(/bytes=(\d*)-(\d*)/);
  if (range && code === 200) {
    const start = +range[1] || 0;
    const end = range[2] ? +range[2] : st.size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
    return fs.createReadStream(f, { start, end }).pipe(res);
  }
  res.writeHead(code, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes' });
  fs.createReadStream(f).pipe(res);
}
