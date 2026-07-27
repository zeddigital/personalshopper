# Handoff — Cloudflare Pages deployment

Static HTML/CSS/JS. **No build step, no dependencies, no `package.json`.**
`index.html` sits at the repo root, so Cloudflare serves it directly.

Repo: `https://github.com/zeddigital/personalshopper`
Branch: `claude/website-build-commands-r8jt1l`

---

## Cloudflare Pages build settings

Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** →
pick `zeddigital/personalshopper`, then:

| Setting | Value |
| --- | --- |
| Framework preset | **None** |
| Build command | *(leave completely empty)* |
| Build output directory | `/` |
| Root directory | *(leave empty — repo root)* |
| Production branch | `claude/website-build-commands-r8jt1l` (or `main` once merged) |
| Environment variables | none needed |

If the dashboard refuses an empty build command, use a no-op:

```
exit 0
```

### Build output directory — why `/`

Everything is already at the repo root. Setting this to `dist`, `build`, or
`public` fails the deploy with "output directory not found" — no such folder
exists.

---

## Alternative: deploy from the terminal (no Git connection)

```bash
npx wrangler login
npx wrangler pages deploy . --project-name=personalshopper
```

Wrangler prints the live URL when it finishes.

---

## Things to know after the first deploy

- **Clean URLs.** Pages serves `about.html` at `/about` and 301-redirects
  `/about.html` → `/about` automatically. Existing `.html` links keep working.
- **404s.** Without a custom `404.html`, Pages shows its default not-found page.
  Add `404.html` at the root for a branded one.
- **Auto-deploy.** Every push to the production branch triggers a new build.

---

## Files

```
index.html      services.html   journal.html   about.html   contact.html
styles.css      app.js          README.md
```

Shared `styles.css` + `app.js` power all five pages.

## Before launch

- Images are editorial stand-ins from Unsplash with a picsum fallback — swap the
  `src` values in the HTML for the real photos.
- Contact form is a `mailto:` handoff to `hello@ambermorrey.com.au` — change that
  address in `app.js`, or wire it to a real form endpoint.
- Replace placeholder copy and contact details throughout.
