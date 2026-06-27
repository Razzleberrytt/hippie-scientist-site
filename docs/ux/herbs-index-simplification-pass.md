# Herbs index simplification pass

## Scope

This pass is limited to `/herbs` and the `/herbs` page shell and page-local herb-card UI in `app/herbs/HerbsIndexClient.tsx`. It does not change workbook files, runtime-generation scripts, route contracts, package files, or any unrelated application surface.

## Hierarchy changes

The `/herbs` card pattern now follows a fixed decision hierarchy:

1. **Herb name** — the primary scan anchor.
2. **One-line practical summary** — capped to two lines and sourced only from existing summary fields.
3. **Best-for context** — promoted into a single emphasized snapshot block so users can answer “why would I care?” quickly.
4. **Evidence** — shown as a compact decision metric with conservative fallbacks such as `Insufficient evidence`, `Traditional use`, and `Needs review`.
5. **Safety** — shown beside evidence instead of being mixed into a large badge stack.
6. **Time-to-effect** — shown only when the runtime record already provides timing information.
7. **Mechanism hints** — demoted to small tertiary tags and capped to avoid “wall of badges” behavior.
8. **CTA** — a full-width mobile tap target that clearly advances to the herb detail page.

## Card philosophy

The card is a decision snapshot, not a mini monograph. It should help readers answer five questions before clicking:

- What herb is this?
- What is the shortest practical framing?
- What context is it most relevant to?
- Is the evidence/safety framing strong enough to keep reading?
- Where do I go for detail?

The card intentionally avoids dosage guidance, deterministic outcomes, and promotional wellness language. If data is sparse, labels should preserve uncertainty rather than imply confidence.

## Mobile scan strategy

- Use a single-column rhythm by default and avoid competing horizontal badge rows.
- Keep search above filters so the first action is obvious on narrow screens.
- Put context filters inside a `<details>` region so mobile users are not forced through every control immediately.
- Keep card CTAs at least `min-h-11` for comfortable touch targets.
- Use short section headers and fewer decorative elements above the first grid.
- Avoid duplicate default cards by showing a “Start here” group followed by the remaining library profiles.

## Evidence and safety presentation rules

- Evidence labels must remain conservative and source-derived.
- `none` evidence resolves to `Insufficient evidence`.
- traditional-only labels resolve to `Traditional use`.
- review, unknown, or TBD-style values resolve to `Needs review`.
- Low safety confidence resolves to `Limited safety data` rather than implying the herb is safe.
- Medium safety confidence resolves to `Some safety context`.
- High safety confidence resolves to `Safety context`, not “safe.”

## Search, filtering, and empty states

Search and filter controls now sit in a compact decision panel:

- The main search accepts herb names, effects, mechanisms, and safety-context terms already present in runtime data.
- Context filters are intentionally broad and progressive: calm/stress, sleep, focus/fatigue, and inflammation.
- Filtered views use the same card hierarchy as the default library.
- Empty filtered results render a recovery state with reset and goal-browsing actions instead of an empty section shell or blank grid.
- If the full herb list is unavailable, the page renders a separate runtime-data recovery state.

## Constraints and non-goals

- No workbook/runtime pipeline changes.
- No generated JSON hand edits.
- No dependency changes.
- No route or architecture changes.
- No global redesign or dark-mode additions.
- No invented claims, dosage guidance, or hype language.
- No broad component refactor beyond the `/herbs` page-local card pattern.
