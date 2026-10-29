# AGENTS.md

## Required operating sequence

Before beginning work, agents must:

1. Read `docs/PROJECT_CHARTER.md`, `docs/CURRENT_STATE.md`, `docs/ROADMAP.md`, `docs/CURRENT_SPRINT.md`, `docs/MASTER_BACKLOG.md`, `docs/DECISIONS.md`, and `docs/SCOREBOARD.md` in the order defined by `docs/DOCS_INDEX.md`.
2. Select the highest-priority unblocked ticket in `docs/CURRENT_SPRINT.md`; do not execute old plans or backlog seeds directly.
3. Inspect the existing implementation and recent relevant history before editing.
4. Avoid duplicating an existing system; extend or repair it when evidence supports doing so.
5. Preserve stable URLs unless a documented decision authorizes a change; add redirects and regressions for authorized changes.
6. Preserve evidence, safety, disclosure, privacy, and editorial standards as release gates.
7. Work on one scoped ticket at a time.
8. Avoid unrelated cleanup during scoped work.
9. Run the tests and audits relevant to the changed behavior.
10. Run the production build before completion unless the ticket is explicitly access-only and changes no repository behavior.
11. Visually verify user-facing changes when possible, in both themes and relevant responsive layouts.
12. Record validation evidence, commands, results, limitations, and proof required by the ticket.
13. Update ticket status and backlog records when work starts, blocks, enters review, or completes.
14. Update authoritative documentation when architecture, behavior, metric definitions, or operating assumptions change.
15. Stop after completing the scoped ticket rather than inventing additional work.
16. Report unknowns, assumptions, access limitations, and failed validation honestly.
17. Never fabricate analytics, business results, tests, screenshots, deployment status, or completion evidence.

**Strict WIP limit:** Maximum three concurrent workstreams—Discovery/SEO, Revenue/Conversion, and Authority/Content. Within a workstream, activate one ticket at a time. Safety incidents may interrupt work but must be recorded explicitly.

## One-active-PR admission and fast-failure rule (owner directive, 2026-10-23)

- **One active implementation PR across the repository** at a time; EvidenceMotion Lane 1 authors and Lane 2 verifies the **same** PR. Existing drafts and explicitly held non-draft PRs awaiting independent scientific/human approval are preserved as review-only, never counted as merged or eligible. Holds still reserve their issue and changed paths but do not occupy the active implementation slot. The maximum three admitted project tickets remains a ceiling, not three parallel implementation PRs.
- Before creating a new implementation PR, check **all** open PRs for the same scoped issue and overlapping files; reuse a draft, held, or failing PR rather than authoring a duplicate. Use `node .agents/skills/pr-admission-preflight.mjs --repo Razzleberrytt/hippie-scientist-site --issue <ISSUE> --files path/a,path/b`; it refuses to grant new admission when the inventory is inaccessible, overlapping, or another non-draft, non-held PR is active. Existing PR repair uses `--existing <PR_NUMBER>`.
- Before expensive full CI on a change that can be checked locally, run `node .agents/skills/pre-pr-fast-check.mjs` and relevant **changed-scope** tests. Repair a failing shared security, lock, or guide parity test before scheduling full runs. This is an early negative screen, **not** a complete validation, deployment receipt, or approval. If tooling is unavailable, report NOT RUN and HOLD, not PASS.
- Urgent security interruptions require explicit issue/owner scope and may replace the active integration priority, **not** silently open another PR or relax audit. CI/governance, human science, publication and serialized protected-merge controls remain fully binding. No mass close/merge/rebase simply to meet a PR-count target.
- Track verified **merged-and-deployed changes**, elapsed development effort per accepted change, full CI reruns per merge, and work abandoned/reused. Opening PRs is not a completion metric.

## Video production must use the native workflow
- All THS/EvidenceMotion video requests, including ordinary "make today's video", "continue" and "get it ready to post", first use `.agents/skills/em-tiktok-producer/SKILL.md`. Never substitute disposable-chat Python/FFmpeg slides, third-party credit services, generic voices or forged QA for the approved source-locked narrator/native producer. If the canonical runtime/assets or original-film proof are unavailable, stop at PREPRODUCTION_ONLY; do not call an improvised MP4 a release.
- Video production is separate from EvidenceMotion code-development lanes; engineer actual native blockers only under the existing single-PR admission and protection rules.

## Optional project-local agent skills

- For scoped work with a matching specialty, consult [`.agents/skills/README.md`](.agents/skills/README.md) and its relevant `SKILL.md` after reading the required authoritative docs. These are instruction references, not new agents, admission slots, release permissions, installed ChatGPT plugins, or independently tested capabilities.
- These skills are subordinate to this file, `docs/CURRENT_SPRINT.md`, source/claim and safety policy, protected merge-controller checks, and current GitHub/production evidence. Do not load them to bypass existing controls.

## Project guidance for coding agents

- Keep routes like `/herbs/:slug`, `/compounds/:slug`, `/guides/:cluster/:slug`, `/learn/:slug`, `/info/:slug`, and `/evidence/:slug` stable; if you must rename or remove one, add a redirect in `public/_redirects` so links and SEO don't break.
- Prefer minimal, surgical changes.
- Treat `/public/data` as a core publish target.
- Validate slugs and required fields before writing JSON artifacts.
- Avoid replacing existing data pipelines when they can be extended.
- Keep changes small and easy to review.
- Run build checks after data-pipeline edits.
- Favor lean payloads for initial shipping.
- This project currently deploys as a static export (`output: 'export'` on Cloudflare Pages). Server features (API routes, middleware, server actions, `next/headers`, `next/server` runtime, `force-dynamic`, runtime revalidation) will not work under static export — if you need them, migrate the deployment model first.

## Site architecture

### Two-layer content model
1. **Discovery layer** — entry pages and cluster guides that capture broader search intent and funnel users into the depth layer
2. **Depth layer** — herb and compound monograph detail pages

### Discovery layer routes (stable; add a redirect if you change one)
- `/guides` — guide index
- `/guides/adhd/*` — ADHD supplement and nutrient guides
- `/guides/sleep/*` — sleep supplement and comparison guides
- `/guides/anxiety/*` — anxiety, stress, adaptogen, and cortisol guides
- `/guides/focus/*` — focus, nootropic, and caffeine-smoothing guides
- `/guides/herbs/*` — editorial herb guide pages
- `/guides/compare/*` — comparison hub and pairwise tradeoff pages
- `/guides/best/*` — curated best-of guides
- `/guides/other/*` — valid guides outside a primary cluster
- `/learn/*`, `/info/*`, and `/evidence/*` — education, trust, and evidence utility pages

### Depth layer routes (stable; add a redirect if you change one)
- `/herbs/:slug` — individual herb profiles
- `/compounds/:slug` — individual compound profiles

Older `/articles/*`, `/goals/*`, `/stacks/*`, top-level `/compare/*`, and top-level `/best-supplements-for-*` URLs are legacy taxonomy/compatibility surfaces. Some `/articles/*` and `/goals/*` routes remain live and user-facing; do not remove, deindex, or consolidate them without route/query evidence, a documented decision, redirects, internal-link updates, and regression tests. Prefer linking new work to the current `/guides/*` taxonomy. See `docs/site-organization.md`.

## Evidence-first decision pages

Before editing a best-of guide, comparison, stack, condition-adjacent page, or any route that helps a reader decide what to take or buy, read `docs/content-quality/evidence-first-decision-page-standard.md`.

Required practices:

- Separate outcomes that are not interchangeable: acute attention, long-term memory, fatigue, sleep, deficiency correction, symptom scales, and biomarkers require different claims.
- State the studied population, comparator, product or extract, duration, and directness boundary.
- Include null, negative, contradictory, subgroup-only, and non-replicated evidence—not only studies that support the ranking.
- Treat trial doses and timelines as study context, not universal protocols.
- Do not convert mechanism, observational association, preclinical findings, or an adjacent population into direct treatment evidence.
- Disclose meaningful product funding, investigator conflicts, and lack of independent replication when they affect interpretation.
- Set evidence order before product availability or commission; broad comparisons should not monetize only one ranked option without an explicit reason.
- Consolidate overlapping routes when they serve the same reader job, and protect the decision with redirects, documentation, and regression tests.
- Add route-specific tests for the exact overclaim, dose, monetization, or canonical pattern removed during the upgrade.

## Data pipeline
- Primary source: `data-sources/herb_monograph_master.xlsx`. The workbook is editable — edit it to make broad/structured content changes, then run `npm run data:build`.
- Generated JSON lives in `public/data/`. You may also edit these files directly to fix or patch content, but for larger changes prefer the workbook so edits are not lost on the next regeneration.
- Run `npm run data:build` after workbook changes, before `npm run build`.

## Affiliate config
- Affiliate tag is in `config/affiliate.ts` — use `AFFILIATE_TAGS.amazon` not hardcoded strings
- Set `AMAZON_AFFILIATE_TAG` env var in Cloudflare Pages to override

## Theme
- Light and dark mode are both supported (toggle in the header via `DarkModeProvider`/`DarkModeToggle`). Default base: `--bg: #fffdf7`, dark text on warm background.
- Emerald accent: `#358f52`
- `app/globals.css` is the source of truth for CSS variables, including the `.dark` overrides.
- New pages may use `dark:` classes; keep light and dark variants in sync.

## Publication manifest
- Build/update through `npm run data:build`.
- Treat pre-build eligibility as provisional. Verify final built robots and sitemap behavior as well as `public/data/publication-manifest.json`; until ticket SEO-001 is complete, record any count disagreement rather than choosing the most favorable artifact.

## Agent Enrichment and Patch Workflow

The agent system automatically generates patches for content enrichment. These patches are tracked and validated in CI:

**Agent execution:**
```bash
npm run agent:run --mode=standard --batch=5
```
Produces JSON patches in `agent/patches/{date}/*.json`

**CI Validation (automatic in npm run check:full):**
- `npm run validate:agent-patches` — Validates patch JSON structure and required fields
- `npm run report:pending-patches` — Reports summary of pending patches

**Manual Review:**
```bash
npm run agent:review
```
Generates `ops/agent-review/approved-patches.{json,csv}` with patch summaries.

**Integration:**
1. Review approved patches from CSV/JSON
2. Extract and merge approved data into workbook
3. Run `npm run data:build` to regenerate public/data

See `docs/agent-integration-guide.md` for full details on patch formats, validation, and future automation.
