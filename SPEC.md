# The Hippie Scientist SPEC
## Purpose
The Hippie Scientist is a science-first educational site for herbs, compounds, mechanisms, safety context, and curated references.
The site is educational only and must not provide medical advice.
## Stack
- Next.js
- React
- TypeScript
- Tailwind
- Cloudflare Pages
- Workbook-driven data pipeline
## Source of Truth
The canonical content source is:
`data-sources/herb_monograph_master.xlsx`
Generated files under `public/data` must not be manually edited.
## Required Public Routes
- `/`
- `/herbs`
- `/compounds`
- `/blog`
- `/learning`
- `/about`
- `/herbs/[slug]`
- `/compounds/[slug]`
## Build Contract
A valid production build must pass:
```bash
npm ci
npm run lint
npm run typecheck
npm run data:build
npm run build
npm run verify:build

Deployment Contract

Cloudflare Pages deployment must:

1. Decode workbook secret when present.
2. Rebuild runtime data.
3. Generate sitemap and robots.
4. Run production build.
5. Generate Cloudflare Pages output.
6. Verify critical assets.
7. Deploy only if all checks pass.

Debug Requirements

Every failed deploy should clearly report:

* missing environment variable
* failed script name
* missing generated file
* data validation failure
* route generation failure

SEO Requirements

Every indexable page must include:

* canonical URL
* title
* description
* structured data when useful
* safety disclaimer
* source/reference section where available

Safety Requirements

All herb/compound content must include:

* educational-only disclaimer
* not-medical-advice disclaimer
* warning area when relevant
* no unsupported treatment claims
* no unsourced dosage instructions

Acceptance Criteria

A release is valid only when:

* lint passes
* TypeScript passes
* data build passes
* production build passes
* sitemap contains expected public routes
* robots excludes private/dev routes
* no generated JSON was manually edited
* top herb and compound pages render without runtime errors
