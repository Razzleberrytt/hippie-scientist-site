# React Hooks Exhaustive Deps Audit

This audit documents `react-hooks/exhaustive-deps` risk before enabling or fixing the rule.

This is a documentation-only audit. It does not modify ESLint config, runtime code, dependencies, or lockfiles.

## Current rule posture

`eslint.config.js` spreads `reactHooks.configs.recommended.rules`, then explicitly disables:

- `react-hooks/exhaustive-deps`
- `react-hooks/set-state-in-effect`
- `react-hooks/purity`
- `react-hooks/preserve-manual-memoization`

`react-hooks/exhaustive-deps` remains globally `off`.

Do not enable it broadly yet. The repository uses `eslint . --max-warnings=0`, so warning-level enforcement would still fail CI. Hook dependency fixes can also change runtime behavior, especially when effects fetch data, subscribe to events, respond to route state, or synchronize UI state.

## Scope reviewed

Active client-facing paths considered:

- `app/**`
- `components/**`
- `src/components/explore/**`
- `src/components/runtime/**`
- `src/components/mobile-bottom-nav.tsx`

Priority should go to files with a top-level `'use client'` directive and active imports from app routes or active layout/navigation surfaces.

Connector search did not return a complete hook inventory in this audit, so this document should be treated as a risk and remediation plan, not a full static-analysis report.

## Hook dependency risk classes

### 1. Likely safe / no issue

Patterns:

```tsx
useMemo(() => expensivePureCalculation(input), [input])
useCallback(() => onSelect(id), [onSelect, id])
useEffect(() => {
  document.title = title
}, [title])
```

Expected action:

- Safe to enforce once verified by lint output.
- These files are good candidates for the first implementation batch.

### 2. Missing primitive dependency

Patterns:

```tsx
useEffect(() => {
  setLabel(slug)
}, [])
```

Risk:

- Low to medium.
- Adding a missing primitive dependency such as `slug`, `query`, `isOpen`, or `pathname` is usually safe if the effect is supposed to track that value.

Expected action:

- Fix in small batches.
- Prefer adding the dependency over suppressing the rule.

### 3. Missing function or object dependency

Patterns:

```tsx
useEffect(() => {
  loadResults(filters)
}, [filters])
```

where `loadResults` is declared in component scope.

Risk:

- Medium to high.
- Adding the function directly can cause effect churn if the function is recreated each render.

Expected action:

- Stabilize with `useCallback` only when the function is semantically stable.
- Alternatively move the function inside the effect when it is only used there.
- Do not mechanically add object/function dependencies without checking render behavior.

### 4. Intentionally stable mount-only effect

Patterns:

```tsx
useEffect(() => {
  initializeOnce()
}, [])
```

Risk:

- Medium.
- Some mount-only effects are legitimate: analytics beacons, one-time DOM setup, hydration-safe feature detection, or one-time listener registration.

Expected policy:

- Prefer refactoring to make dependencies explicit when practical.
- If mount-only behavior is intentional and safe, allow a narrowly scoped inline disable with an explanatory comment.
- The comment must state why re-running would be incorrect or materially harmful.

Acceptable example:

```tsx
// Intentionally mount-only: registers a single global listener and cleans it up on unmount.
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```

Do not use bare disables without explanation.

### 5. Needs `useCallback` / `useMemo` stabilization

Patterns:

```tsx
const options = { limit, mode }
useEffect(() => {
  runSearch(options)
}, [options])
```

Risk:

- Medium.
- Object/array identities can cause unnecessary re-runs.

Expected action:

- Use `useMemo` for derived objects only when identity stability is meaningful.
- Prefer deriving primitives when possible.
- Avoid introducing memoization solely to silence lint if it makes the code harder to reason about.

### 6. Risky to change without interactive testing

High-risk components likely include:

- search or filter UIs
- mobile navigation/menu state
- semantic graph or visualization components
- animated/scroll-aware components
- components that attach DOM/window listeners
- components that coordinate route/pathname state
- components that fetch or derive runtime data based on user input

Expected action:

- Do not fix blindly.
- Require local interaction checks or preview testing.
- Keep each remediation PR small and route/component-specific.

## Representative active file categories to review

Because connector search did not produce a complete hook inventory, future implementation batches should start by checking active client files in these categories:

| Category | Paths | Risk |
| --- | --- | --- |
| Navigation/menu components | `components/**`, `src/components/mobile-bottom-nav.tsx` | Medium to high if effects manage focus, escape keys, outside clicks, or route changes. |
| Explore/semantic UI | `src/components/explore/**`, `components/semantic-*` | Medium to high if hooks derive graph state or synchronize visualization inputs. |
| Runtime safety/boundary UI | `src/components/runtime/**` | Medium if effects coordinate fallback rendering, visibility, or hydration behavior. |
| Search/filter components | active `components/**` or `app/**` client files | High if dependencies affect filtering, debouncing, or async state. |
| Visual/animation components | active `components/**` client files | High if effects attach observers, timers, or animation frame callbacks. |

## Low-risk first remediation batch candidates

First implementation batch should be limited to files that meet all of these conditions:

- top-level `'use client'`
- small file, fully visible in review
- at most one or two hooks
- hook body only references primitive props/state or stable imports
- no timers, observers, DOM listeners, route subscriptions, or async fetch logic
- no behavioral refactor required

Suggested first batch policy:

1. Enable or run `react-hooks/exhaustive-deps` only locally for a hand-selected file list.
2. Fix no more than 3 files.
3. Prefer missing primitive dependency fixes.
4. Do not add broad `useCallback`/`useMemo` wrappers unless obviously necessary.
5. Do not add inline disables unless the mount-only behavior is justified in the comment.

## Higher-risk batches that need testing

Defer these until after low-risk files are clean:

- mobile menu/focus-loop logic
- outside-click and Escape-key listeners
- route/pathname synchronization
- search debouncing or filtering effects
- graph/visualization memoization
- animated/scroll/observer effects
- effects that write to storage or analytics

These should have manual preview validation notes for the specific interaction touched.

## Recommended staged plan

### Stage 0: Inventory

- Produce a local list of active files using `useEffect`, `useMemo`, and `useCallback`.
- Separate server-only files from client files.
- Prioritize top-level `'use client'` files.

### Stage 1: Low-risk primitive dependencies

- Fix missing primitive dependencies in small client components.
- Avoid behavior changes beyond correctly tracking referenced values.

### Stage 2: Stable function/object dependencies

- Refactor only where the intended identity is clear.
- Prefer moving helper functions inside effects when they are effect-local.
- Use `useCallback` or `useMemo` only when meaningful.

### Stage 3: Intentional mount-only effects

- Require explanatory comments for every suppression.
- Suppress only the specific line, not the file or rule globally.

### Stage 4: Interactive components

- Address menu, search, graph, animation, and listener-heavy components with manual interaction testing.
- Keep PRs component-specific.

### Stage 5: Scoped enforcement

- Once low-risk active files are clean, add a scoped ESLint override for a small active file list.
- Do not globally enable `react-hooks/exhaustive-deps` until legacy/deferred code is either cleaned or explicitly quarantined.

## Non-goals

This audit does not:

- enable `react-hooks/exhaustive-deps`
- modify `eslint.config.js`
- modify runtime code
- add `useCallback` or `useMemo`
- add inline suppressions
- update dependencies
- edit lockfiles
- claim a complete static-analysis inventory

## Maintainer validation notes

This PR is documentation-only. Suggested maintainer validation:

```bash
npm run lint
npx tsc --noEmit
```
