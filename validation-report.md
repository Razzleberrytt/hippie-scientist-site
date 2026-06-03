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
- [ ] Manual reviewer confirms each `REVIEW-DELETE-ENTRY`
- [ ] Manual reviewer confirms each `MERGE-KEEP-*`
- [ ] Run cleanup in dry-run mode before apply
- [ ] Confirm reference-check warnings before deletion/merge

## Outputs

- `issues.csv`
- `cleanup.js`
- `validation-report.md`
