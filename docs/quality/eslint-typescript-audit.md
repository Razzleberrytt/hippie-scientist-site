# ESLint and TypeScript Safety Audit

This audit documents the current lint and TypeScript safety posture without changing runtime behavior, build behavior, dependencies, or lockfiles.

## Scope

Audited files:

- `eslint.config.js`
- `tsconfig.json`
- `package.json` scripts

Related audits:

- `docs/quality/explicit-any-audit.md`
- `docs/quality/react-hooks-exhaustive-deps-audit.md`
- `docs/quality/typescript-quarantine-audit.md`

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
| `@typescript-eslint/no-unused-vars` | globally `off`, then re-enabled for active production paths with underscore ignore conventions | Medium | The third staged remediation batch has started. Active production code now receives unused-variable enforcement while legacy/deferred paths remain relaxed to avoid noisy cleanup churn. |
| `@typescript-eslint/no-explicit-any` | `off` | Medium | Explicit any usage is currently under audit before enforcement. See `docs/quality/explicit-any-audit.md` for staged remediation guidance and boundary classification. |
| `react-hooks/exhaustive-deps` | `off` | High for client components | Missing dependencies can cause stale closures, incorrect effects, and user-visible state bugs. Dedicated audit and staged remediation guidance now live in `docs/quality/react-hooks-exhaustive-deps-audit.md`. |
| `jsx-a11y/alt-text` | globally `off`, then re-enabled for active production UI paths | Medium | The first staged remediation batch has started. Active production UI paths now receive alt-text enforcement while legacy/deferred paths remain relaxed to avoid a giant cleanup PR. |
| `jsx-a11y/label-has-associated-control` | globally `off`, then re-enabled for active production UI paths | Medium | The second staged accessibility remediation batch has started. Active production UI paths now receive label association enforcement while legacy/deferred paths remain relaxed to avoid broad form cleanup churn. |
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
