# Deploy: GitHub Pages at phosphor.creativllc.org

The site is static (`npm run build` makes `dist/`). The workflow `.github/workflows/pages.yml` builds it and
publishes it to GitHub Pages on every push to `main` (or by hand: Actions > pages > Run workflow).
The site lives at the domain root, so Vite's `base` is `/` and `public/CNAME` holds `phosphor.creativllc.org`.

## 1. GitHub repo settings

1. Put this folder in its own repo (this one is not pushed anywhere yet) and push `main`.
2. Settings > Pages > Build and deployment > Source: **GitHub Actions**.
3. Run the workflow once (push, or Actions > pages > Run workflow). The first run creates the `github-pages` environment.
4. Settings > Pages > Custom domain: `phosphor.creativllc.org` > Save. (`public/CNAME` ships the same name in every
   build, so the setting sticks.) GitHub checks the DNS record and issues the certificate; this can take up to an hour.
5. When the check is green, tick **Enforce HTTPS**.

## 2. Cloudflare DNS

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `phosphor` | `creativllc.github.io` | **DNS only** (grey cloud) |

Keep the cloud grey: GitHub has to see the CNAME to issue the certificate. Turning the proxy on later is possible
(set SSL/TLS to Full), but not needed.

## 3. Check

- `https://phosphor.creativllc.org/` loads, `https://phosphor.creativllc.org/nope` shows the kernel-panic 404.
- Link preview: the `og:image` / `og:url` / canonical tags all point at `https://phosphor.creativllc.org/`.
- The repo link in the page is `REPO_URL` in `src/content.js`: `https://github.com/CreativLLC/phosphor-os`.

## Media size

Pages limits: a published site up to 1 GB, soft 100 GB/month bandwidth, and Git itself rejects files over 100 MB.
Every file in `public/media/` is far below that (the biggest is the 45 s trailer, about 12 MB; the rest are under 3 MB).
Git LFS files are **not** served by Pages (visitors would get the pointer text), so keep media small and in plain git.
Re-encode with `tools/encode.sh` rather than committing bigger masters.
