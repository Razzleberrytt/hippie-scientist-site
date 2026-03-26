# DEPLOY_SUCCESS_REPORT

Date (UTC): 2026-03-25

## Live URL

- Canonical domain observed: https://www.thehippiescientist.net
- Apex redirects: https://thehippiescientist.net -> https://www.thehippiescientist.net

## Deploy status

- **Status:** BLOCKED (no production deploy executed)
- **Reason:** Netlify CLI authentication required interactive browser authorization and could not complete in this container.
- Attempted command: `npx --yes netlify-cli@latest deploy --prod --build`
- Netlify CLI output indicated: "Unable to open browser automatically: Running inside a docker container" and then waited for authorization ticket completion.

## Router used

- App router appears to be browser-history routing (deep-link routes expected to resolve server-side).

## SPA fallback status

- **Netlify config in repo:** present (`netlify.toml`) with `[[redirects]] from = "/*" to = "/index.html" status = 200` and `publish = "dist"`.
- **Live host behavior observed:** not matching Netlify fallback behavior; deep direct routes currently return 404 on the live site.

## Route test results (direct URL load)

Tested with `curl -sSL -w "%{http_code} %{url_effective}"` against the listed routes.

- `/` -> `200` (final: `https://www.thehippiescientist.net/`)
- `/blog` -> `200` (final: `https://www.thehippiescientist.net/blog`)
- `/about` -> `404`
- `/herbs` -> `404`
- `/compounds` -> `404`
- `/contact` -> `404`
- `/privacy-policy` -> `404`
- `/disclaimer` -> `404`

## Rendering / assets / navigation checks

- Root page HTML loads and references JS/CSS assets.
- Sample asset checks:
  - `/assets/index-fcd80106.js` -> 200
  - `/assets/index-95041464.css` -> 200
- Navigation behavior in an actual browser session was **not validated here** because deployment was blocked and only CLI/HTTP checks were available.

## Any remaining issues

1. Netlify production deployment cannot proceed without Netlify account authorization/token in this environment.
2. Live production host currently serves deep routes with 404s for most SPA paths listed above.
3. Deployment target/host mismatch should be resolved before reattempting production verification.
