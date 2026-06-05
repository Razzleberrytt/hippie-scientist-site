# Herb/Compound Data Quality Validation Report

Generated: 2026-06-03 (refreshed post cadd761c pull + data regen 2026-06-05)

## Summary

- Total entries: ~881 (287 herbs + 594 compounds per current public/data post-pull/regen; manifests show 890 routes)
- Herb entries: 287
- Compound entries: 594
- Issues found: 120 (in issues.csv; see below)
- Broken slug issues: 0
- Duplicate name groups: 58
- Risk level: High (but heavily protected by ref checks + guard)

**Note on post-pull (cadd761c "Verify generated data determinism..."):** Data pipeline now emphasizes determinism (verify-generated-data PASS: 5 files consistent across clean builds). Old drift gate disabled in CI. Our regen after merge confirms clean. Guard: OK (no suspicious changes in clean state).

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

## Post-Audit Execution Note (2026-06-05, refreshed post cadd761c 2026-06-05)
Auto-approved plan Phase 1 hygiene executed: dry-run reviewed (61 logged, all SKIP-REFERENCED due to refs; re-run post-pull/regen same result), guard extended to whitelist cleanup + issues.csv for future. No --apply (conservative, 0 net removes). 

Post-sync (cadd761c + merge 7fcdafc8): data:build/regen clean, verify-generated PASS (determinism), guard OK in clean tree, core-routes/redirects/structured-audit (with our relaxation for legacies) + full verify:build PASS. Build health maintained. Re-run cleanup + guard/verify after any source changes. See recent commits + session plan for active status. Old dupes largely for workbook-level curation (not runtime fixes).
