# Post-merge verification pass

Date: 2026-05-16
Branch: `post-merge-verification-pass`
Base verified: latest fetched `origin/main` at commit `12a4911` (`fix(lint): remove unused variable build blockers (#1559)`).

## Build result

`npm run build` completed successfully.

Notable build output:
- Next.js production compilation completed successfully.
- Type/lint validation completed without build-blocking errors.
- Static generation completed for 1,335 pages.
- `verify:build` completed successfully, including core route verification, redirects verification, CSS asset verification, deploy-readiness validation, public JSON import governance, quarantine import validation, and generated data verification.
- Existing deploy-readiness warning observed: `sitemap.xml missing (allowed in MVP)`.
- Existing npm warning observed: `Unknown env config "http-proxy"`.

## Focused route audit

Audited only the requested routes:

- `/`
- `/herbs`
- `/compounds`
- `/compare`
- `/comparisons`
- `/education/how-receptors-work`

Static export/runtime smoke checks were performed against the generated `out/` directory with a local static server. Each requested route returned HTTP 200 after normal trailing-slash resolution and produced non-empty HTML without common runtime-error markers such as `ReferenceError`, `TypeError`, `Hydration failed`, `Unhandled Runtime Error`, `Application error`, or `NEXT_NOT_FOUND`.

Observed route smoke-check output:

| Route | Result | Rendered bytes | Title |
| --- | --- | ---: | --- |
| `/` | HTTP 200 | 47,653 | `The Hippie Scientist` |
| `/herbs` | HTTP 200 | 1,080,138 | `Herbs \| The Hippie Scientist \| The Hippie Scientist` |
| `/compounds` | HTTP 200 | 2,926,510 | `The Hippie Scientist` |
| `/compare` | HTTP 200 | 318,837 | `Compare Supplements and Compounds \| The Hippie Scientist` |
| `/comparisons` | HTTP 200 | 57,370 | `The Hippie Scientist` |
| `/education/how-receptors-work` | HTTP 200 | 54,052 | `The Hippie Scientist` |

No broken imports, route export failures, empty render regressions, undefined-access build crashes, or accidental JSX breakage were found in this focused pass.

## Suppression grep results

Command run:

```sh
grep -R "eslint-disable\\|@ts-ignore\\|ts-ignore" app lib src
```

Results:

```text
src/lib/collectionTracking.ts:    // eslint-disable-next-line no-console
src/lib/affiliateClickTracking.ts:    // eslint-disable-next-line no-console
src/lib/curatedProducts.ts:  // eslint-disable-next-line no-console
```

These suppressions were documented during this pass. They do not appear to have been introduced by the most recent lint cleanup commit, and they were not removed because doing so would be outside this conservative post-merge verification scope.

## Generated artifact and dependency/config verification

After the build, generated/runtime output was checked and any local build artifacts produced by verification were discarded before committing this document.

Confirmed no intentional changes were introduced to:

- `public/data`
- generated manifests
- `package-lock.json`
- dependency declarations
- dependency versions
- `package.json`
- `tsconfig` files
- ESLint configuration

## Regression finding

No directly related post-merge regressions were found.

Runtime behavior appears unchanged for the audited production routes, and no surgical code fixes were required.
