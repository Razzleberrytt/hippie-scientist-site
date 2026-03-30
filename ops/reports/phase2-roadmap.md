# Phase 2A Winner Rollout + Next-Quarter Roadmap

Generated: 2026-03-30T17:20:48.253Z

## Evidence snapshot
- Conversion analytics available: **no**
- Affiliate analytics available: **no**
- Publishing regression failures: **0**
- Structured-data failures: **0**
- Indexable herbs: **12 / 699**
- Indexable compounds: **0 / 393**

## 1) Standardize broadly now (proven winners)
1. Keep publication hardening checks mandatory (publishing + structured-data verification).
2. Keep curated affiliate readiness policy as a hard gate before rendering.
3. Keep trust-first detail-page CTA posture (Variant B default + trust guard behavior).

## 2) Keep limited / experimental
1. Collection Variant A overrides for current five targeted collections only.
2. Trust-first affiliate module copy/order updates on current three mapped pages only.
3. Any broader CTA or affiliate rollout until scorecard status moves beyond `insufficient data`.

## 3) Stop or defer
1. Defer broad compound publication expansion (current indexable compounds = 0).
2. Stop broad affiliate footprint expansion until confidence tiers and analytics coverage improve.
3. Stop making winner claims without event-backed sample size.

## Next-quarter workstreams
### Content quality
- Raise indexable coverage by fixing high-frequency exclusion reasons first (weakDescription, placeholderText, nanArtifacts).
- Prioritize non-indexable but SEO-priority herbs for evidence/editorial upgrades.

### Conversion optimization
- Re-test collection Variant A targets once analytics exports are available.
- Maintain trust-first B on detail pages unless scorecard signals justify change.

### Affiliate operations
- Keep confidence-tier + disclosure/rationale policy strict.
- Expand only where confidence and review recency pass.

### Technical hardening
- Keep publishing + structured-data checks release-blocking.
- Track parity/head-tag/schema regressions weekly.

### Analytics/reporting
- Implement reliable event export ingestion.
- Run scorecard, affiliate inventory, and phase2 roadmap reports weekly.

## Prioritized backlog
### Do now
- Standardize verification scripts on every release.
- Preserve trust-first detail-page CTA defaults.
- Preserve affiliate readiness policy gates.

### Next sprint
- Fix analytics ingestion so scorecards can classify winners/losers.
- Re-score the five collection CTA overrides using fresh events.
- Start highest-impact herb quality remediation.

### Later
- Expand affiliate coverage to additional pages only after confidence tiers improve.
- Resume compound SEO expansion only after compounds clear quality gates.

### Stop doing
- Stop broad rollout assertions for experiments with insufficient data.
- Stop compound expansion proposals disconnected from quality-gate outcomes.

## Explicit recommendations
- **CTA variants worth keeping:** Keep Variant B as standard on detail pages; keep Variant A limited to current collection experiment set.
- **Editorial investment focus:** Herb detail pages first, then collection pages; compound expansion deferred.
- **Collections policy:** Expand only within currently approved/indexable collection routes; keep unapproved collections noindex.
- **Affiliate confidence-tier policy:** High/medium can scale with healthy readiness; low confidence remains tightly controlled.
- **Essential scripts:** `report:conversion-scorecard`, `report:affiliate-inventory`, `verify:affiliate-products`, `verify:publishing`, `verify:structured-data`, `report:phase2-roadmap`.

## Machine-readable artifact
- `ops/reports/phase2-winner-rollout.json`
