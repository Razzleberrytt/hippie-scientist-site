# TypeScript Quarantine Coverage Audit

This audit documents whether `tsconfig.json` exclude/quarantine patterns appear to hide active production source from TypeScript checking.

This is a documentation-only audit. It does not change compiler options, runtime code, dependencies, lockfiles, or build behavior.

## Scope

Audited configuration and documentation:

- `tsconfig.json`
- `docs/quality/eslint-typescript-audit.md`

Active production path patterns reviewed against the current include/exclude posture:

- `app/**`
- `src/app/**`
- `components/**`
- `src/components/explore/**`
- `src/components/runtime/**`
- `src/components/mobile-bottom-nav.tsx`
- `lib/**`
- `src/lib/runtime-*.ts`

Connector search and file inspection were used for this audit. No terminal commands were run.

## Current TypeScript include posture

`tsconfig.json` currently includes:

```jsonc
"include": [
  "next-env.d.ts",
  "**/*.ts",
  "**/*.tsx",
  ".next/types/**/*.ts"
]
```

This is a broad include posture. By default, TypeScript sees TypeScript source across the repository unless a path is explicitly excluded.

Important implication: active App Router files under both `app/**` and `src/app/**` are included unless matched by an exclude entry. The current exclude list does not contain broad `app/**`, `src/app/**`, `components/**`, `lib/**`, `src/components/explore/**`, `src/components/runtime/**`, or `src/lib/runtime-*.ts` patterns.

## Current TypeScript exclude posture

`tsconfig.json` currently excludes these major buckets:

| Bucket | Pattern style | Current intent | Active coverage risk |
| --- | --- | --- | --- |
| Dependencies | `node_modules` | Avoid dependency typechecking | Low |
| Dev-only viewer code | `src/dev/**/*` | Keep non-production viewer code out of app typecheck | Low |
| Legacy Pages Router | `src/pages/**/*` | Quarantine pre-App Router pages | Low to Medium if any route is resurrected there |
| Tooling scripts | `scripts/**/*` | Validate scripts outside app typecheck | Medium for build tooling, but not active UI route coverage |
| Governed-enrichment agents | `agent/**/*` | Defer inactive agent/runtime tooling | Low for current MVP UI |
| Legacy `src/components` surfaces | explicit files and selected subtrees | Quarantine removed/deferred MVP systems | Medium if any excluded component is imported by active routes |
| Deprecated `src/lib` experiments | explicit files | Quarantine duplicate/deferred data consumers | Medium if any active code imports one later |

The exclude list is intentionally targeted rather than one broad `src/**/*` quarantine. That is the right direction for protecting active route coverage.

## Active production coverage assessment

### Covered by current TypeScript include/exclude posture

The following active path groups appear included by the current configuration:

| Active path group | Coverage assessment | Notes |
| --- | --- | --- |
| `app/**` | Included | No broad or targeted `app/**` exclude was observed. |
| `src/app/**` | Included | No `src/app/**` exclude was observed. Search surfaced active dynamic routes under `src/app/**`, and they do not match current excludes. |
| `components/**` | Included | Top-level `components/**` is not excluded. |
| `src/components/explore/**` | Included | Search surfaced active files in this subtree; no matching exclude pattern was observed. |
| `src/components/runtime/**` | Included | Search surfaced active runtime boundary components; no matching exclude pattern was observed. |
| `src/components/mobile-bottom-nav.tsx` | Included | No matching explicit exclude was observed. |
| `lib/**` | Included | Top-level `lib/**` is not excluded. |
| `src/lib/runtime-*.ts` | Included | `tsconfig.json` explicitly comments that active `src/lib/runtime-*.ts` should remain included, and no matching runtime wildcard exclude was observed. |

### No clearly accidental active exclusion found

Based on the visible `tsconfig.json` and targeted connector searches, this audit did not identify a clearly accidental exclusion of the listed active production paths.

Therefore this PR does not remove excludes or change `tsconfig.json` behavior.

## Import-drift guardrail

A lightweight validator now exists at:

```text
scripts/ci/validate-quarantine-imports.mjs
```

Purpose:

- prevent active production code from importing quarantined legacy/deferred TypeScript surfaces
- reduce long-term import drift risk identified in this audit
- preserve the current targeted quarantine strategy without broad TypeScript config rewrites

Current validator behavior:

- scans only active production roots
- ignores `node_modules`, `.next`, `out`, `public`, and `docs`
- uses conservative string-based import checks only
- checks obvious `import`, dynamic `import()`, and `require()` patterns
- validates imports against quarantined `src/components/**` and `src/lib/**` patterns documented in `tsconfig.json`
- avoids heavy module-resolution logic to reduce false positives and CI overhead

The validator is intentionally lightweight and should evolve conservatively.

## Risk notes

### 1. `src/pages/**/*` is a broad quarantine

This is correct if the project has fully moved active routing to App Router. It becomes risky only if a page under `src/pages/**` is reactivated later without removing or narrowing the exclude.

Recommendation: keep the exclusion for now, but require any future resurrection of `src/pages/**` to include a matching TypeScript coverage change.

### 2. `scripts/**/*` hides important build tooling from the app typecheck

This does not hide active production UI routes, but some scripts are critical to data generation and build correctness.

Recommendation: keep script quarantine out of this PR. Later, add a dedicated script typecheck/lint plan rather than folding all scripts into the app TypeScript gate at once.

### 3. Explicit legacy component excludes need import-drift protection

Many individual `src/components/*.tsx` files and subtrees are excluded as legacy/deferred code. This is safer than excluding all `src/components/**`, but it can become stale if an active route imports one of those excluded files later.

Recommendation: before removing any excluded component entry, first verify whether it is imported by active `app/**`, `src/app/**`, `components/**`, or active `src/components/**` code. Remove entries in small batches only after fixing real type errors.

### 4. Explicit legacy `src/lib` excludes can mask accidental reuse

The excluded `src/lib` files are documented as deprecated experiments or duplicate data consumers. The current active runtime convention is to keep `src/lib/runtime-*.ts` included.

Recommendation: preserve the runtime-file boundary. If active code starts importing an excluded `src/lib` module, either move that module into active type coverage and fix errors, or replace the import with an active runtime adapter.

## Recommended staged remediation plan

### Stage 1: Keep current active-path coverage documented

- Keep `app/**`, `src/app/**`, top-level `components/**`, top-level `lib/**`, `src/components/explore/**`, `src/components/runtime/**`, and `src/lib/runtime-*.ts` inside TypeScript coverage.
- Do not add broad `src/**` or `components/**` excludes.
- Treat any new active route/component exclusion as a high-risk change that requires explicit documentation.

### Stage 2: Add import-drift guardrails before removing quarantines

Before deleting current legacy excludes, inspect whether excluded files are imported by active production paths.

Recommended first target areas:

1. explicit `src/components/*.tsx` excludes with no active imports
2. excluded `src/components/*/` subtrees that are confirmed unreachable
3. explicit deprecated `src/lib/*.ts` excludes with no active imports

Do not mix component quarantine cleanup and runtime data adapter cleanup in the same PR.

### Stage 3: Remove tiny, low-risk excludes in small batches

A safe first implementation batch would be documentation-backed and limited to a few files:

- pick 3 to 5 excluded `src/components/*.tsx` files
- verify they are not imported by active production paths
- either delete them if truly dead, or fix their type errors and remove only those exact exclude entries
- run maintainer validation before merge

### Stage 4: Add a separate script/tooling typecheck strategy

Do not remove `scripts/**/*` from the app `tsconfig.json` as a broad cleanup. Build tooling has different runtime assumptions than Next app code.

Recommended later path:

- create a separate script-focused TypeScript or lint strategy
- start with data-build scripts that are critical to production output
- avoid forcing all historical scripts into the app typecheck at once

## First safe implementation batch

No active production exclusion was clearly accidental in this audit, so there is no behavior-changing implementation batch recommended for this PR.

The first safe follow-up is:

1. keep this PR documentation-focused and validator-focused
2. run maintainer validation
3. choose a separate tiny PR to audit active imports into excluded `src/components/*.tsx` entries
4. remove or fix at most 3 to 5 confirmed-dead component quarantines

## Maintainer validation notes

```bash
npm run lint
npx tsc --noEmit
npm run verify:build
```
