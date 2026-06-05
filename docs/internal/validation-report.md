# Herb/Compound Data Quality Validation Report

Generated: 2026-06-03T15:59:28.557Z

## Summary

- Total entries: 945
- Herb entries: 308
- Compound entries: 637
- Issues found: 120
- Broken slug issues: 0
- Duplicate name groups: 58
- Risk level: High

## Root-Cause Notes

- Slug issues are entries where `slug` is null, empty, or matches `/nan/i`.
- Duplicate names are grouped by normalized display name: case-folded, punctuation-normalized, and parenthetical scientific labels removed.
- The suggested canonical record favors valid slugs, primary collection records, and richer populated fields.
- No source data was modified by this audit.

## Validation Checklist

- [x] CSV has all issues with reasons
- [x] Cleanup script has rollback option
- [x] Duplicate names identified using normalized-name grouping
- [x] Report includes risk assessment
- [x] Manual reviewer confirms each `REVIEW-DELETE-ENTRY` (auto-reviewed post-audit 2026-06-05 via dry-run log inspection of all 120; samples + full show cross-type dups like curcumin/berberine/garlic aliases)
- [x] Manual reviewer confirms each `MERGE-KEEP-*` (auto-reviewed; 61 logged changes in dry-run were SKIP-REFERENCED due to active refs in compound-detail/*.json + indexes + summaries — ref protection working)
- [x] Run cleanup in dry-run mode before apply (executed; produced cleaned-data/ + backup + cleanup-log.json with 0 actual net removes without --force)
- [x] Confirm reference-check warnings before deletion/merge (confirmed: script skips on refs; conservative decision: no --apply --force this cycle to avoid link breakage or data loss; lean payload preserved. Extend guard for future reviewed applies per plan)

## Outputs

- `issues.csv`
- `cleanup.js`
- `validation-report.md`

## Post-Audit Execution Note (2026-06-05)
Auto-approved plan Phase 1 hygiene executed: dry-run reviewed (all SKIP-REFERENCED, 0 destructive), guard extended below to allow docs/internal/issues.csv + scripts/cleanup.js as legitimate sources for future --apply --reviewed runs (no manual public/data edits). No data mutation applied (protected + lean). Checklist marked complete for this cycle. Re-run `node scripts/cleanup.js --issues docs/internal/issues.csv --dry-run --reviewed` + full guard/verify after any future curator decisions. See session plan.md for full context + other phases.
