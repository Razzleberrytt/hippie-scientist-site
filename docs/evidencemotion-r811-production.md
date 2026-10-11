# EvidenceMotion R8.11 — Compounding Production and Learning

**Release status:** PR #6660 stacked on R8.10 PR #6658. This document describes an implementation candidate, not production deployment or demonstrated real-platform results.

R8.11 is an **opt-in production system**. It keeps `creativeMethodRelease: R8.10` and the local R8.05 runtime. The R8.05–R8.10 scientific evidence, voice, frame, safety, provenance and human exact-master checks remain authoritative.

## How the eight ideas become actual systems

| Principle | Implementation | Guardrail |
|---|---|---|
| Kaizen | One deliberate hypothesis, one experimental variable, chosen metric and exact plan SHA in every opted-in package | No extra experiments or auto-success claim |
| A/B | Three individually editorial-approved first-three-second hooks; three actual local **silent draft MP4s** and visual/source previews; optional real-world manual cohort analysis | No automatic posting, winner or new voice without independent approval |
| Template lineage | A separately human-approved existing flywheel proposal + measured before/after cohort → new immutable component version | Future videos only, old component version preserved |
| Asset compounding | SHA-addressed SVG actors/layouts/captions/cards with licensing, provenance and topic-bound reuse rules | No silent cross-topic clinical claims |
| Leverage | Single source packet drives governed master plus teaser work order, cover, source-trust card and 3 A/B draft intro assets | Work orders and previews are not approved derivatives |
| Bootstrapping | Local Sharp/FFmpeg, zero-paid-critical-path receipt, source import and network audit regression | No hosted generation/API-key fallback |
| Evidence moat | Source URL and actual reviewed-as-of date visibly represented in cover/trust cards | No invented recency or scientific accreditation |
| Systems over goals | Text cadence report: posted-video records vs 2/day target, metric coverage, experiment coverage, next smallest improvement | No vanity metrics used as scientific quality indicators |

## Operator commands

```bash
node scripts/distribution/r811-operations-cli.mjs help
node scripts/distribution/r811-operations-cli.mjs preflight --input plan.json --r810 approved-r810.json
node scripts/distribution/r811-operations-cli.mjs inspect-package --package /path/to/fully-built-package
node scripts/distribution/r811-operations-cli.mjs render-hook-clips --package /path/to/fully-built-package
node scripts/distribution/r811-operations-cli.mjs compare-hooks --experiment kava-hook-experiment --window first-7d
node scripts/distribution/r811-operations-cli.mjs cadence --days 7 --target 2
node scripts/distribution/evidencemotion-flywheel-cli.mjs observe --input actual-tiktok-stats.json
node scripts/distribution/evidencemotion-flywheel-cli.mjs report --window first-7d --last 10
```

Use **real**, owner-entered TikTok statistics. Unknown views, retention and attributed follows are `null`, not fabricated zeros. Register actual published video identities in the R8.10 flywheel; the R8.11 add-on binds each record to source, experiment and chosen hook when present. A/B comparison requires 3 real source-matched same-platform posts at least 4 hours apart, with comparable age-scoped observations. A reported leader remains **exploratory**, never automatically causal.

## Production vs draft boundary

1. `buildR811Receipt` requires one reviewed experiment, 3 reviewed hook variants, approved original source packet, component version IDs and no paid generation.
2. The R8.10 renderer creates the full master plus R8.11 sidecars; the R8.11 module creates 3 SVG drafts, a cover, a source card and an immutable derivative work order.
3. The optional offline FFmpeg action creates three **silent, visibly watermarked 3-second draft MP4s**. They cannot be published as voiced A/B treatments.
4. R8.10 acoustic word alignment, local voice QA, all inherited safety/QC gates and **a separate human exact-master review** still apply to the production video; R8.11 experiment/derivative receipt is independently checked during staging.
5. Each teaser or truly publishable A/B arm requires its own approved script, actual local narration, word alignment, original evidence caveats, accessible captions, independent QA and publication authorization. None is automatically generated or posted by the draft API.

## Acceptance proof versus fixtures

- Added synthetic unit tests for immutable assets, explicit experiment guardrails, no-metered dependencies, source-time integrity, zero voice in draft previews, 3-video A/B metrics, human approval and version lineage.
- **Not yet proven:** three real published A/B videos, true follow-conversion data, a real measured version lift, render/audio inspection, verified two-a-day production cadence, or actual provider distribution receipts.
- PR #6658 must first pass exact-head CI and merge under the serialized controller; then PR #6660 requires fresh exact-head CI against `main`, review and protected-controller merge. No bypass.
