You are Codex working on the Hippie Scientist Next.js static-export site.

Use the attached updated zip as the new baseline source package. Do not reintroduce old code from earlier versions unless explicitly required.

## Goal

Implement and verify the updated site version from this package, preserving the fixes already applied:

1. Keep the safe DOM construction patch in `components/content/ContentCards.tsx`.
2. Keep the dependency security posture in `package.json` and `package-lock.json`.
3. Confirm the site builds as a Cloudflare Pages static export.
4. Produce a concise implementation report with any remaining blockers.

## Important Context

This is a Next.js App Router site configured for static export:

- Host target: Cloudflare Pages
- Build output: `out/`
- Build command: `npm run build`
- Static output mode: `output: 'export'`
- Security headers are managed through `public/_headers`, not `next.config.mjs` headers.
- Public redirects are managed through `public/_redirects`.
- Canonical source of structured herb/compound data is `data-sources/herb_monograph_master.xlsx`.
- Generated runtime data lives under `public/data/**`.

## Apply This Package

1. Unzip the package.
2. Install dependencies with:
   ```bash
   npm ci
   ```
3. Confirm the changed files are present:
   ```bash
   git diff -- package.json package-lock.json components/content/ContentCards.tsx docs/audits/deep-audit-2026-07-07.md CODEX_IMPLEMENTATION_PROMPT.md
   ```

## Required Verification

Run these checks in order and stop only if a command fails:

```bash
npm run check:node
npm audit --audit-level=moderate
npm run typecheck
npm run lint:nocache
npm run validate:static-export
npm run validate:security-headers
npm run validate:public-json-imports
npm run validate:xlsx-boundary
npm run validate:direct-dependencies
npm run validate:quarantine-imports
npm run validate:canonical-host
npm run validate:fonts
npm run validate:article-quality
npm run validate:profile-verdicts
npm run validate:claim-discipline
npm run validate:safety-visibility
npm run data:build:core
node scripts/validate-data-files.mjs
npm run build:app
npm run build:pagefind
npm run verify:core-routes
npm run verify:redirects
npm run validate:deploy-readiness
npm run validate:build-seo-metadata
npm run audit:metadata
npm run audit:internal-links
npm run audit:structured-data
npm run audit:seo-routes
npm run validate:guide-faqs
npm run validate:sitemap:built
npm run validate:sitemap-completeness
npm run validate:robots
npm run audit:sitemap-affiliate
npm run validate:pagefind-body
npm run validate:build-artifacts
node scripts/report-performance-budget.mjs
npm test
```

## Expected Results

The audit package was already verified with the following expected outcomes:

- `npm audit --audit-level=moderate` should report 0 vulnerabilities.
- `npm run typecheck` should pass.
- `npm run lint:nocache` should pass.
- `npm run build:app` should complete a static export.
- `npm run build:pagefind` should create `out/pagefind`.
- `npm run validate:build-artifacts` should pass after Pagefind is built.
- `npx vitest run app/__tests__/subscribe.test.ts` passed with 17 tests.

## Known Non-Blocking Diagnostics

Do not treat these as blockers unless they become failing checks:

1. `npm run data:build:core` may log that ExcelJS full workbook read failed and that it fell back to the streaming row reader.
2. `npm run validate:claim-discipline` may emit two non-failing prose warnings.
3. `npm run audit:data-governance` may report diagnostic source coverage gaps for indexable compound profiles.
4. `node scripts/report-performance-budget.mjs` may warn that the main JS bundle exceeds the 350 KB target while still passing.
5. `npm run audit:structured-data` may report diagnostic schema gaps while representative/core checks pass.

## Implementation Rules

- Do not remove the `ws` or `uuid` overrides unless you prove `npm audit --audit-level=moderate` still returns 0 vulnerabilities without them.
- Do not downgrade Next.js or `@next/bundle-analyzer` to resolve audit findings.
- Do not add server-only Next.js features; this site must remain compatible with static export.
- Do not commit `node_modules`, `.next`, or local build logs.
- Only commit `out/` if the deployment workflow explicitly expects checked-in build output. Otherwise, deploy from Cloudflare Pages build output.

## Deliverable

Return a final implementation report with:

1. Files changed.
2. Commands run.
3. Pass/fail status for each command.
4. Any unresolved blockers.
5. Whether the site is ready for Cloudflare Pages deployment.
