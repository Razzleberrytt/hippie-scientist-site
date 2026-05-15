# ESLint and TypeScript Safety Audit

This audit documents the current lint and TypeScript safety posture without changing runtime behavior, build behavior, dependencies, or lockfiles.

## Scope

Audited files:

- `eslint.config.js`
- `tsconfig.json`
- `package.json` scripts

This is intentionally documentation-only. It does not attempt to fix violations, rewrite config, or broadly re-enable strict rules.

## Current package scripts

Relevant scripts in `package.json`:

| Script | Current command | Notes |
| --- | --- | --- |
| `lint` | `eslint . --max-warnings=0` | ESLint is available as a strict zero-warning gate, but multiple safety rules are currently disabled globally. |
| `check` | `npm run build` | Main verification path runs the production build pipeline. |
| `build` | blog build, data build, data validation, source-of-truth guard, `next build`, then `verify:build` | Build coverage is broad but is not the same as a standalone TypeScript gate. |
| `verify:build` | route/CSS/deploy/public JSON/data verification checks | Includes `validate:public-json-imports` and generated-data checks. |

There is no dedicated `typecheck` script documented in `package.json` at the time of this audit. Maintainers can still run TypeScript directly during validation.

## ESLint posture

`eslint.config.js` uses:

- `@eslint/js` recommended config
- `typescript-eslint` recommended config
- `eslint-plugin-jsx-a11y` recommended rules, then several accessibility rules disabled
- `eslint-plugin-react-hooks` recommended rules, then several React Hooks rules disabled
- `eslint-config-prettier`

### Global ignores

Current ESLint ignores:

| Pattern | Risk | Notes |
| --- | --- | --- |
| `dist/**` | Low | Build output. |
| `out/**` | Low | Static/export output. |
| `.next/**` | Low | Next.js generated output. |
| `node_modules/**` | Low | Dependency output. |
| `scripts/data/build-runtime-from-workbook.mjs` | Medium | Important data-generation script is excluded from lint. This may be intentional due to script complexity, but it should remain visible as a known exception. |

### Disabled or weakened lint rules

These rules are disabled globally for `**/*.{ts,tsx,js,jsx,mjs,cjs}` unless overridden elsewhere.

| Rule | Current setting | Risk | Why it matters |
| --- | --- | --- | --- |
| `@typescript-eslint/no-unused-vars` | `off` | Medium | Unused variables can hide incomplete refactors, stale imports, and dead branches. Risk is higher in active routes/components where unused imports can indicate broken feature wiring. |
| `@typescript-eslint/no-explicit-any` | `off` | Medium | `any` weakens route params, runtime-data records, component props, and helper boundaries. Some `any` use is expected around generated workbook/runtime JSON, but active app boundaries should gradually narrow it. |
| `react-hooks/exhaustive-deps` | `off` | High for client components | Missing dependencies can cause stale closures, incorrect effects, and user-visible state bugs. Server components are lower risk, but active client components need coverage. |
| `jsx-a11y/alt-text` | `off` | High | Missing image alt text is a direct accessibility and SEO quality issue, especially in active app/components surfaces. |
| `jsx-a11y/label-has-associated-control` | `off` | High | Labels without associated controls degrade form accessibility and screen-reader behavior. Relevant to search, filters, newsletter/form surfaces, and any active inputs. |
| `jsx-a11y/anchor-is-valid` | `off` | Medium | Invalid anchors can break navigation semantics. Next.js `Link` usage sometimes creates false positives, so staged enforcement is safer than global re-enable. |
| `jsx-a11y/no-static-element-interactions` | `off` | Medium | Click handlers on non-interactive elements can break keyboard accessibility. Needs staged handling to avoid a noisy PR. |
| `jsx-a11y/click-events-have-key-events` | `off` | Medium | Mouse-only interactions can exclude keyboard users. Best reintroduced for active interactive components first. |
| `jsx-a11y/no-noninteractive-element-interactions` | `off` | Medium | Similar risk to static-element interaction rules. Needs active-path scoping. |
| `jsx-a11y/no-redundant-roles` | `off` | Low to Medium | Usually easy to fix, but can be noisy if legacy components are included. |
| `jsx-a11y/img-redundant-alt` | `off` | Low to Medium | Text quality issue for image alt copy; lower risk than missing alt text. |
| `@typescript-eslint/no-require-imports` | `off` | Low to Medium | Common in Node scripts/configs. Less concerning for app code, but active ESM app modules should not need `require`. |
| `react-hooks/set-state-in-effect` | `off` | Medium | Can reveal inefficient or unstable client state flows. This is a React compiler-era rule and may require careful staged review. |
| `react-hooks/purity` | `off` | Medium | Can catch render-time side effects. Re-enable only after active client components are understood. |
| `react-hooks/preserve-manual-memoization` | `off` | Low to Medium | Performance/correctness guard for memoization. Lower priority than `exhaustive-deps`. |

`prefer-const` remains enabled as an error globally, except in the tools/config override.

### Existing scoped hardening

For `src/**/*.{js,jsx,ts,tsx}`:

- `no-console`: `error`
- `no-debugger`: `error`

This is useful, but it does not cover `app/**`, `components/**`, or root `lib/**` unless another config applies. If active production code lives in those paths, a future staged PR should consider applying equivalent no-debugger/no-console coverage there too.

## TypeScript posture

`tsconfig.json` currently has:

| Option | Current value | Risk | Notes |
| --- | --- | --- | --- |
| `strict` | `true` | Positive | Strict mode is enabled. |
| `noImplicitAny` | `false` | Medium | Explicitly permits implicit `any` despite strict mode. This reduces safety at untyped boundaries and should be improved gradually. |
| `skipLibCheck` | `true` | Low | Common pragmatic setting for app builds. |
| `allowJs` | `true` | Medium | JavaScript files participate in the project, but type guarantees are weaker than TS files. Useful during migration. |
| `resolveJsonModule` | `true` | Medium | Required by existing JSON usage, but broad JSON imports need governance to avoid client bundle regressions. |
| `isolatedModules` | `true` | Positive | Compatible with modern Next/TS compilation constraints. |

### TypeScript includes

Current include patterns:

- `next-env.d.ts`
- `**/*.ts`
- `**/*.tsx`
- `.next/types/**/*.ts`

This is broad enough to include active production TypeScript files by default, including:

- `app/**`
- `components/**`
- `lib/**`
- `src/lib/runtime-*.ts`, unless individually excluded

### TypeScript excludes

Current excludes include normal generated/dependency paths plus a quarantine list.

| Exclude group | Risk | Notes |
| --- | --- | --- |
| `node_modules` | Low | Standard dependency exclusion. |
| `src/dev/**/*` | Low to Medium | Marked dev-only and not imported by active App Router pages. |
| `src/pages/**/*` | Medium | Broad legacy Pages Router quarantine. Acceptable only if active production routes truly live under `app/**`. |
| `scripts/**/*` | Medium | Tooling scripts are excluded from app typecheck. Some scripts are build-critical, so separate script validation remains important. |
| `agent/**/*` | Low to Medium | Deferred governed-enrichment agents. Fine if inactive for MVP runtime. |
| selected `src/components/**` files/folders | Medium | Large legacy component quarantine. Comments state these are removed/deferred MVP systems. Risk is accidental re-import from active paths. |
| selected `src/lib/**` files | Medium to High | Some excluded modules are duplicate data consumers or deprecated experiments. Risk is higher if active app/components import one by accident. |
| `src/types.ts` | Medium | Excluding a generic type file can hide stale shared types. Leave unchanged in this PR, but revisit during cleanup. |

The current `tsconfig.json` already includes explanatory comments for quarantined legacy areas and explicitly states that active `src/lib/runtime-*.ts` files should remain included.

## Active vs legacy/deferred path assessment

### Appears active / should stay covered

These paths appear to be active production surfaces and should remain covered by TypeScript and ESLint:

- `app/**`
- `components/**`
- `lib/**`
- `src/components/mobile-bottom-nav.tsx`
- `src/components/runtime/**`
- `src/components/explore/**`
- `src/lib/runtime-*.ts`
- `src/lib/semantic-*`

### Appears legacy/deferred / currently quarantined

These paths are intentionally excluded or relaxed based on comments in `tsconfig.json`:

- `src/pages/**/*`
- `src/dev/**/*`
- selected old `src/components/*` files
- selected old `src/components/cta`, `detail`, `filters`, `interactions`, and `trust` folders
- selected old `src/lib/*` modules tied to duplicate data consumers, affiliate tracking, governed enrichment, recommendations, and deprecated experiments
- `agent/**/*`
- `scripts/**/*` from TypeScript app typecheck

This quarantine strategy is reasonable for avoiding a giant cleanup PR, but it should be defended with reachability checks and comments whenever active paths are changed.

## Coverage concerns

1. ESLint safety rules are disabled globally, not only for legacy/deferred code.
   - This means active `app/**`, `components/**`, `lib/**`, and `src/**` files inherit the relaxed posture.

2. React Hooks safety is materially weakened.
   - `react-hooks/exhaustive-deps` is disabled globally, which is high risk for active client components.

3. Accessibility linting is materially weakened.
   - `jsx-a11y/alt-text` and `jsx-a11y/label-has-associated-control` are disabled globally.

4. TypeScript strict mode is partially softened.
   - `strict` is enabled, but `noImplicitAny` is disabled and `@typescript-eslint/no-explicit-any` is disabled.

5. The TypeScript quarantine is broad but documented.
   - This is acceptable short term if active paths remain included and legacy paths are not imported by active runtime code.

## Staged remediation plan

### Stage 0: Preserve current behavior

- Keep current config unchanged until active violations are measured.
- Continue documenting known quarantines.
- Avoid broad re-enables that create a noisy cleanup PR.

### Stage 1: Accessibility baseline for active UI only

Recommended first implementation batch:

- Re-enable `jsx-a11y/alt-text` for active `app/**`, `components/**`, and selected active `src/components/**` only.
- Keep legacy/deferred paths relaxed.
- Fix only real active missing-alt violations in the same small PR.
- Do not touch generated data or unrelated UI.

Rationale: missing alt text is high-impact, usually easy to review, and improves accessibility/SEO without changing app architecture.

### Stage 2: Active form accessibility

- Re-enable or warn on `jsx-a11y/label-has-associated-control` for active form/search/filter components only.
- Keep old newsletter/lead-capture/deferred components quarantined until they are deleted or rebuilt.

Rationale: form accessibility is high impact, but false positives and custom components can require careful review.

### Stage 3: React Hooks safety for active client components

- Add a scoped override for active client component paths.
- Start with `react-hooks/exhaustive-deps` as `warn` for active client components.
- Do not apply to legacy quarantined client components.
- Fix warnings in small batches grouped by feature surface.

Rationale: stale effects can create real bugs, but this rule can produce noisy diffs if enabled globally.

### Stage 4: Type boundary tightening

- Add `@typescript-eslint/no-explicit-any` as `warn` for active route boundaries and runtime helpers.
- Prioritize:
  - route params
  - generated runtime JSON helpers
  - component props crossing app/component boundaries
  - SEO/schema helpers
- Continue allowing pragmatic `any` at workbook/runtime-data ingestion boundaries where schemas are not finalized.

Rationale: runtime JSON records need gradual typing; enforcing this globally would create churn.

### Stage 5: Unused variable cleanup for active code

- Re-enable `@typescript-eslint/no-unused-vars` for active app/components/lib paths.
- Use an ignore pattern for intentionally unused underscore-prefixed variables if needed.
- Keep scripts/legacy relaxed until separately addressed.

Rationale: unused variables are useful refactor smoke alarms, but the first pass can be noisy.

### Stage 6: TypeScript quarantine hardening

- Keep the existing exclude quarantine for legacy/deferred files.
- Add or maintain comments for every excluded active-looking file.
- Add a lightweight reachability guard in a later PR if practical, ensuring excluded legacy modules are not imported by active app/routes/components.

Rationale: the quarantine is currently the main protection against a giant cleanup PR. The risk is accidental active imports from excluded files.

## Recommended first safe PR after this audit

Open a small implementation PR with this scope only:

- Add an ESLint override for active UI paths only.
- Re-enable `jsx-a11y/alt-text` for:
  - `app/**/*.{tsx,jsx}`
  - `components/**/*.{tsx,jsx}`
  - explicitly active `src/components/**/*.{tsx,jsx}` paths that are not quarantined
- Fix only active missing-alt violations.
- Do not touch legacy/deferred excluded files.
- Do not change TypeScript excludes.
- Do not update dependencies or lockfile.

## Non-goals

This audit does not recommend:

- globally re-enabling all disabled rules at once
- removing the legacy/deferred quarantine in one PR
- converting all `any` usage immediately
- changing build behavior
- changing dependency versions
- manually editing `package-lock.json`

## Maintainer validation notes

This PR is documentation-only. Suggested maintainer validation:

```bash
npm run lint
npx tsc --noEmit
```
