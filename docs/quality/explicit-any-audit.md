# Explicit Any Usage Audit

This audit documents explicit `any` usage in active production paths before enabling `@typescript-eslint/no-explicit-any` enforcement.

This is a documentation-only audit. It does not change ESLint config, TypeScript config, runtime code, dependencies, or lockfiles.

## Scope

Active production paths reviewed for explicit `any` usage:

- `app/**`
- `components/**`
- `lib/**`
- `src/components/explore/**`
- `src/components/runtime/**`
- `src/components/mobile-bottom-nav.tsx`
- `src/lib/runtime-*.ts`

Connector search results were used for targeted inspection. Counts below are approximate because this PR intentionally does not run local static-analysis commands.

## Current rule posture

`@typescript-eslint/no-explicit-any` remains globally disabled in `eslint.config.js`.

This PR does not enable the rule because the repository uses `eslint . --max-warnings=0`; warning-level enforcement would still fail CI and could force a broad cleanup. The safer path is to remediate small typed boundaries first, then enable scoped enforcement later.

## Approximate usage by area

| Area | Approximate explicit `any` concentration | Common pattern | Risk |
| --- | ---: | --- | --- |
| `app/**` route modules | High | `({ params }: any)`, `(record: any)`, `(item: any)`, JSON-derived route data | Medium |
| `components/**` | Medium | flexible props, visual payloads, runtime record cards | Medium |
| `lib/**` | Medium to High | runtime JSON normalization, ranking/scoring helpers, schema-like objects | Medium to High |
| `src/components/explore/**` | Medium | semantic discovery records, graph candidates, runtime payloads | Medium |
| `src/components/runtime/**` | Medium | runtime-rendered records and safety wrappers | Medium |
| `src/components/mobile-bottom-nav.tsx` | Low | no obvious need for `any` based on active-path role | Low |
| `src/lib/runtime-*.ts` | Medium | generated public data adapters and runtime record helpers | Medium |

## Classification

### 1. Route boundary props

Examples include App Router route signatures such as:

```ts
export default async function Page({ params }: any) { ... }
export async function generateMetadata({ params }: any) { ... }
```

Observed in active App Router paths during targeted search, including dynamic routes such as blog/best-for/supernode-style pages.

Risk: low to medium.

Why it exists:

- Next.js route props changed around async params handling.
- Many route files use a pragmatic `any` to avoid repeated route prop definitions.

Preferred replacement pattern:

```ts
type RouteParams = Promise<{ slug: string }>

type PageProps = {
  params: RouteParams
}
```

Use route-specific names when the param is not `slug`.

This is a high-value, low-risk cleanup target because each file can usually be fixed independently.

### 2. External data parsing boundaries

These are places where generated JSON, workbook-derived data, or public runtime payloads enter TypeScript code.

Common patterns:

```ts
const records = data as any[]
function normalizeRecord(record: any) { ... }
```

Risk: medium.

Why it exists:

- The workbook/runtime payloads are generated and can have loose or partially optional shapes.
- Some records combine herbs, compounds, semantic fields, affiliate fields, and evidence fields.

Preferred later direction:

- Replace `any` with `unknown` at parse boundaries.
- Narrow with local guards before property access.
- Introduce minimal shared runtime record types only where fields are actually used.

Do not replace these mechanically without tests, because overly broad shared types can become inaccurate and hide real data-shape drift.

### 3. Dynamic JSON/data normalization

These usages appear in semantic discovery, ecosystem, scoring, filtering, and card-building code.

Common pattern:

```ts
records.map((record: any) => ...)
items.filter((item: any) => ...)
```

Risk: medium to high depending on route visibility.

Why it exists:

- Normalizers consume heterogeneous generated records.
- Many fields are optional, array-or-string, or derived from workbook columns.

Preferred later direction:

- Define narrow local types per function, not one giant global type.
- Use helpers such as `safeArray`, `safeLower`, `safeSlug`, and `safeTrim` to narrow `unknown` values.
- Convert callback `any` parameters to small interfaces where only `slug`, `name`, `summary`, `effects`, or `mechanisms` are used.

### 4. Event handlers

No high-confidence active event-handler `any` cluster was identified from connector search in this audit.

If found later, these are usually low-risk replacements:

```ts
React.ChangeEvent<HTMLInputElement>
React.MouseEvent<HTMLButtonElement>
React.FormEvent<HTMLFormElement>
```

Event-handler cleanup is a good candidate only after exact files are identified by lint output.

### 5. Third-party library escape hatches

Potential candidates may exist in graph/visualization, animation, or search-related helpers.

Risk: medium.

Preferred later direction:

- Keep third-party escape hatches local.
- Prefer `unknown` plus library-provided types when available.
- Avoid introducing dependency upgrades only to improve typing.

### 6. Genuinely replaceable `any` usage

Likely low-risk replacements include:

- route `params` props
- simple `generateMetadata` props
- simple `.map((item: any) => ...)` callbacks where the fields are only `slug`, `name`, and `summary`
- local arrays currently typed as `any[]` but only used as read-only display records
- `catch (error: any)` if present, replaceable with `unknown` and stringification helpers

## High-value low-risk replacements

Recommended replacement categories:

1. **Dynamic route prop typing**
   - Replace `({ params }: any)` with route-local `PageProps`.
   - Start with pages that only read `params.slug` or another single param.

2. **Metadata route prop typing**
   - Apply the same route-local props to `generateMetadata`.
   - Keep changes per route file.

3. **Simple display-card records**
   - Add local `type DisplayRecord = { slug?: string; name?: string; summary?: string; description?: string }`.
   - Replace callback `any` only where fields are limited and obvious.

4. **Simple generated arrays**
   - Replace `any[]` with `Array<Record<string, unknown>>` only if property access is already guarded.
   - Otherwise defer until guards are added.

## Risky areas to avoid without tests

Do not start with these areas:

- workbook runtime generation and validation paths
- semantic graph orchestration helpers
- ranking/scoring logic
- product/affiliate mapping logic
- generated JSON adapter boundaries
- ecosystem normalization logic used by multiple routes
- any file with mixed herbs/compounds/protocols/stacks records and many optional fields

These areas should get focused tests or snapshot checks before typing changes.

## Proposed first implementation batch: maximum 5 files

First no-explicit-any remediation PR should be limited to route-boundary typing only.

Suggested maximum 5 files:

1. `app/blog/[slug]/page.tsx`
2. `app/best-for/[slug]/page.tsx`
3. `app/supernodes/[slug]/page.tsx`
4. one additional simple dynamic route under `app/**` that only reads `params.slug`
5. one additional simple dynamic route under `app/**` that only reads one route param

Allowed changes in that first implementation batch:

- Add local `type PageProps` or `type RouteProps`.
- Replace `({ params }: any)` in page and metadata functions.
- Await params where required by Next.js 15 semantics.
- Do not type runtime records in the same PR.
- Do not enable `@typescript-eslint/no-explicit-any` yet unless the scoped file list is clean.

## Later enforcement plan

After the first implementation batch:

1. Continue route-boundary batches until simple App Router `params` usages are typed.
2. Add scoped `@typescript-eslint/no-explicit-any` enforcement only for already-clean files or small globs.
3. Keep generated data ingestion boundaries relaxed until narrow runtime record types exist.
4. Convert dynamic JSON boundaries from `any` to `unknown` with guards in separate PRs.
5. Only then consider a broader active-path rule override.

## Non-goals

This audit does not:

- enable `@typescript-eslint/no-explicit-any`
- change runtime code
- change ESLint config
- change TypeScript config
- update dependencies
- edit lockfiles
- refactor data normalization
- claim exact counts from a local lint run

## Maintainer validation notes

This PR is documentation-only. Suggested maintainer validation:

```bash
npm run lint
npx tsc --noEmit
```
