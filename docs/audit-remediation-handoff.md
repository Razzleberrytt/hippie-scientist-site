# Audit Remediation Handoff

This zip is a conservative hardening patch for `hippie-scientist-site`.

It intentionally does **not** delete generated data directories or rewrite the application. Instead, it adds enforceable audit tooling and one production-facing security hardening patch so another agent or contractor can safely continue the cleanup.

## Included changes

1. Added `scripts/ci/validate-data-governance.mjs`.
   - Detects duplicate singular/plural generated data directories.
   - Detects count drift between `public/data/build-report.json` and `public/data/_meta/build-info.json`.
   - Detects restricted/high-risk compound records without explicit governance metadata.
   - Reports herb/compound record-level source coverage.
   - Supports:
     - `npm run audit:data-governance`
     - `npm run audit:data-governance:json`
     - `npm run audit:data-governance:strict`

2. Added package scripts:
   - `audit:data-governance`
   - `audit:data-governance:json`
   - `audit:data-governance:strict`
   - `validate:audit-hardening`

3. Hardened `functions/api/subscribe.ts`.
   - Rate-limit keys are now hashed before KV storage.
   - Production fails closed if `RATE_LIMIT_KV` is missing.
   - Production fails closed if `TURNSTILE_SECRET_KEY` is missing.
   - KV read/write failures fail closed in production but remain permissive in local development.

4. Updated `.env.example`.
   - Added `ENVIRONMENT`.
   - Added `RATE_LIMIT_IP_HASH_SALT`.

## Current known audit findings

Running:

```bash
npm run audit:data-governance:json
```

currently reports:

- Duplicate herb detail directories:
  - `public/data/herb-detail`
  - `public/data/herbs-detail`
- Duplicate compound detail directories:
  - `public/data/compound-detail`
  - `public/data/compounds-detail`
- Build manifest count drift:
  - `build-report.json` reports 287 herbs / 597 compounds.
  - `_meta/build-info.json` reports 285 herbs / 235 compounds.
- Restricted/high-risk compound records without governance metadata:
  - `5-meo-dmt`
  - `7-hydroxymitragynine`
  - `amanita-muscaria`
  - `dmt`
  - `harmaline`
  - `ibogaine`
  - `ketamine`
  - `kratom`
  - `mescaline`
  - `mitragynine`
  - `psilocybin`
  - `salvinorin-a`
- Compound detail records do not expose direct record-level source/evidence fields in the shape checked by the audit script.

## Recommended next steps

### Phase 1 — make one canonical data source

Pick one detail folder pair as canonical:

```text
public/data/herb-detail
public/data/compound-detail
```

or:

```text
public/data/herbs-detail
public/data/compounds-detail
```

Then update all imports, route generators, sitemap builders, and search builders to read only the canonical folders.

Do not delete the non-canonical folders until a full route/sitemap/search validation passes.

### Phase 2 — add governance metadata

Every public herb/compound profile should include:

```json
{
  "governance": {
    "reviewStatus": "approved",
    "legalRisk": "none",
    "medicalRisk": "low",
    "monetizationAllowed": true,
    "indexingAllowed": true,
    "recommendationAllowed": true,
    "requiresHumanReview": false,
    "reason": ""
  }
}
```

Restricted/high-risk compounds should use stricter values, for example:

```json
{
  "governance": {
    "reviewStatus": "needs_review",
    "legalRisk": "controlled",
    "medicalRisk": "high",
    "monetizationAllowed": false,
    "indexingAllowed": false,
    "recommendationAllowed": false,
    "requiresHumanReview": true,
    "reason": "restricted_or_high_risk_compound"
  }
}
```

### Phase 3 — add evidence claim mapping

Every indexable public profile should expose source-backed evidence:

```json
{
  "evidence": {
    "human": [],
    "mechanistic": [],
    "safety": [],
    "traditional": []
  },
  "claimMap": [
    {
      "claim": "Supports sleep quality",
      "claimType": "human",
      "strength": "limited",
      "sourceIds": ["pmid:12345678"]
    }
  ]
}
```

### Phase 4 — enforce strict mode

After the data generator emits canonical folders, consistent manifests, governance metadata, and source-backed evidence, add this to `validate:release`:

```bash
npm run audit:data-governance:strict
```

Until then, keep it as a non-blocking audit command.

## Cloudflare production variables

Set these in Cloudflare Pages production environment variables:

```text
ENVIRONMENT=production
RATE_LIMIT_IP_HASH_SALT=<long-random-secret>
TURNSTILE_SECRET_KEY=<cloudflare-turnstile-secret>
```

Also confirm `RATE_LIMIT_KV` is bound for the Pages Function. With this patch, production newsletter subscription will return `503` if the rate-limit KV binding or Turnstile secret is missing.
