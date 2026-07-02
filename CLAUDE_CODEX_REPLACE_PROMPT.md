You are Claude Code/Codex working inside my existing project workspace.

I have attached a zip named `hippie-scientist-site-main-seo-audited.zip`. Replace the current buggy repository with the audited version in that zip while preserving local secrets and deployment settings.

Do this carefully:

1. Back up the current repository first, or work on a new branch.
2. Do not overwrite `.env`, `.env.local`, `.env.*.local`, or any production secret files.
3. Unzip `hippie-scientist-site-main-seo-audited.zip` into a temporary directory.
4. Replace the existing repo contents with the unzipped audited repo contents. Use a sync command that deletes obsolete source files but excludes:
   - `.env*`
   - `node_modules`
   - `.next`
   - `out`
   - `.git`
   - local IDE/cache files
5. Install dependencies with `npm ci`.
6. Run these validation commands and stop if any fail:
   ```bash
   npm run -s typecheck
   npm run -s lint:nocache
   npm run -s validate:route-seo
   npm run -s audit:metadata
   npm run -s validate:static-export
   npm run -s validate:security-headers
   npm run -s validate:canonical-host
   npm run -s build
   npm run -s validate:sitemap:built
   npm run -s validate:sitemap-completeness
   npm run -s seo:audit-sitemap
   npm run -s audit:structured-data
   npm run -s audit:seo-routes
   npm run -s audit:sitemap-affiliate
   npm run -s validate:build-seo-metadata
   npm run -s validate:deploy-readiness
   ```
7. Confirm that `npm run -s seo:audit-sitemap` reports:
   - 454 total URLs
   - 454 live indexable URLs
   - 0 canonical mismatches
   - 0 noindex URLs in sitemap
   - 0 missing canonicals
8. Confirm that `npm run -s audit:seo-routes` reports:
   - severe=0
   - blockingSevere=0
   - moderate=0
9. Review `AUDIT_SUMMARY_SEO_FIXES.md` in the repo root for a summary of what changed.
10. Commit the replacement with a message like:
   `Fix sitemap canonicalization and SEO metadata audit failures`

The most important fix in this zip is that sitemap-listed routes now self-canonicalize correctly. Do not reintroduce canonicals that point from `/guides/.../` sitemap URLs to non-existent `/articles/.../`, `/best-.../`, or top-level guide aliases.
