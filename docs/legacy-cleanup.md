# Legacy Cleanup Log

## 2026-04-30 — Deletion-first pass

### Active roots used for reachability
- `app/**`
- Components imported by `app/**` (checked via import scan)
- `src/lib/runtime-data.ts` and its direct dependencies
- `scripts/data/**` workbook generation/validation/audit scripts
- Build/deploy configs (`package.json`, `next.config.mjs`, Cloudflare config)
- `public` runtime data targets produced by workbook scripts
- `data-sources/herb_monograph_master.xlsx`
- Rescue tracking docs in `docs/**`

### Reachability/check commands
- `rg "^import|from '" app src scripts/data -n`
- `rg "EffectExplorer|effectSearch" app src -n`
- `npm run check`

### Classification decisions
- `src/components/EffectExplorer.tsx` → `DELETE_OBSOLETE`
  - Reason: Not imported by `app/**` or workbook/build roots; depended on missing legacy `@/utils/effectSearch`; removal preferred over recreating stale dependency.

### Files quarantined
- None in this pass.

### Files deleted
- `src/components/EffectExplorer.tsx`

### Active imports removed
- None required (component was unreachable from active roots).

### Features intentionally deferred
- Legacy effect-search UI behavior formerly in `EffectExplorer`.
- Any legacy `@/utils/effectSearch`-dependent ranking/suggestion logic.

### UNKNOWN_REVIEW
- None introduced by this cleanup pass.

### Next blocking error
- After deleting `src/components/EffectExplorer.tsx`, `npm run check` fails in the workbook audit phase with:
  - `[source-of-truth-audit] issues=452 blocking=1`
  - blocking item in generated report: path `reports/source-of-truth-audit.md` entry `ERROR` for `archive/legacy-src/src/components/EffectExplorer.tsx` (resolved by deletion in this pass; rerun required).


## Post-cleanup check result
- `npm run check` progressed past workbook audit and now fails in active build/typecheck code:
  - `./src/components/EmailCapture.tsx:4:35`
  - `Type error: Cannot find module '@/hooks/useSubmissionForm' or its corresponding type declarations.`
