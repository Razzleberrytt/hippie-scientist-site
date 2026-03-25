# Deploy Success Report

## Router strategy

- **Router used:** `BrowserRouter`
- **Why:** The site is deployed via Netlify, and Netlify SPA fallback is guaranteed with `public/_redirects` set to:
  - `/* /index.html 200`

## Project structure cleanup

- Unpacked `hippie-scientist-patched.zip` was reviewed and identified as **mixed** (source + prebuilt static output in root paths like `/about`, `/blog`, `/herbs`, `/disclaimer`, `404.html`, `robots.txt`).
- Active repository was kept as a **single Vite source project** (`src/`, `public/`, config files), and no mixed static root artifacts were reintroduced.

## Build verification

Executed:

- `npm install`
- `npm run build`

Verified in `dist/`:

- `index.html` with no `/src` references
- `assets/*`
- `_redirects`
- `sitemap.xml`
- `robots.txt`

## Deploy method

- **Method used:** Netlify CLI (`netlify deploy --prod --dir=dist --json`)
- **Result:** Deployment command reached Netlify CLI but failed due missing authentication token.

## Final live URL

- **Live URL:** _Not available from this run (deploy blocked by missing `NETLIFY_AUTH_TOKEN`)._

## Warnings / limitations

- Netlify authentication is not configured in this environment, so production deploy could not be completed automatically in this run.
- Once `NETLIFY_AUTH_TOKEN` (and optionally `NETLIFY_SITE_ID`) are set, rerun:
  - `netlify deploy --prod --dir=dist --json`
