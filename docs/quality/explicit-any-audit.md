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

#### Completed remediation batch 1

Completed dynamic route boundary typing for:

1. `app/blog/[slug]/page.tsx`
2. `app/best-for/[slug]/page.tsx`
3. `app/supernodes/[slug]/page.tsx`

Changes completed:

- added local Promise-based route param types
- replaced route-boundary `({ params }: any)` usage
- aligned route access with Next.js 15 async params semantics
- preserved route behavior, metadata behavior, static params behavior, and UI

#### Completed remediation batch 2

Completed additional dynamic route boundary typing for:

1. `app/learn/[slug]/page.tsx`
2. `app/best/[slug]/page.tsx`

Changes completed:

- added local Promise-based route param types
- replaced route-boundary `({ params }: any)` usage
- aligned route access with Next.js 15 async params semantics
- preserved route behavior, static params behavior, and UI

#### Completed remediation batch 3

Completed additional dynamic route boundary typing for:

1. `src/app/compare/[slug]/page.tsx`
2. `src/app/protocols/[slug]/page.tsx`
3. `src/app/stacks/[slug]/page.tsx`
4. `src/app/ecosystems/[slug]/page.tsx`
5. `src/app/topics/[slug]/page.tsx`

Changes completed:

- added local Promise-based route param types
- replaced route-boundary `({ params }: any)` usage only
- aligned route access with Next.js 15 async params semantics
- preserved route behavior, metadata behavior, static params behavior, data fetching, and UI
- intentionally left runtime record-processing `any` usage untouched

Files intentionally skipped in this batch:

- `app/explore/[topic]/page.tsx`

Reason skipped:

- connector output for the file was truncated
- the remediation policy for these batches forbids patching truncated route files
- future follow-up should apply only the minimal route-boundary typing changes:

```ts
type TopicRouteParams = Promise<{ topic: string }>

type TopicRouteProps = {
  params: TopicRouteParams
}
```

and preserve all existing runtime logic unchanged.

Remaining route-boundary cleanup should continue in similarly small batches.

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
