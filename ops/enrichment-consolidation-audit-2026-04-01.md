# Enrichment Consolidation Audit — 2026-04-01

## Scope
Audit of existing repository assets related to herb missing-field detection, enrichment, evidence/citations, validation, confidence/review queues, completion metrics, and indexing readiness.

This is a consolidation audit only (no new pipeline design/implementation).

## 1) Related files and components found

### A. Core orchestration + state (pipeline backbone)
- `scripts/enrichment/plan-run.mjs`
- `scripts/enrichment/run-batch.mjs`
- `scripts/enrichment/validate-schema.mjs`
- `scripts/enrichment/validate-domain.mjs`
- `scripts/enrichment/apply-patches.mjs`
- `scripts/enrichment/report-coverage.mjs`
- `scripts/enrichment/release-gate.mjs`
- `scripts/enrichment/_shared.mjs`
- `ops/migrations/001-initial.sql` ... `ops/migrations/005-evidence-pipeline.sql`
- `ops/state.db` (runtime sqlite state, generated locally)
- `ops/manifests/*.plan.json|*.batch.json|*.apply.json`
- `patches/*.json`
- `ops/rollback-manifests/*.json`

### B. Evidence + confidence + queueing
- `scripts/enrichment/run-evidence-pipeline.mjs`
- `scripts/enrichment/evidence-grading.mjs`
- `scripts/enrichment/evidence-grading.md`
- SQLite tables from migration `005-evidence-pipeline.sql`:
  - `evidence_review_queue`
  - `evidence_conflict_queue`
  - `enrichment_batch_state`

### C. Missing-field + readiness + reporting ecosystems
- Legacy/simple missing scanner: `scripts/check-missing-fields.mjs` (writes `public/data/missing-fields-report.json`)
- Expanded missing/indexability inventory: `scripts/report-herb-missing-data-inventory.mjs` (writes `ops/reports/herb-missing-data-inventory.{json,md}`)
- Indexability evidence gap auditor: `scripts/report-indexability-evidence-gaps.mjs`
- Report chains in `package.json` for backlog/review/workpacks/source queues/completion scorecards/indexability rescue.
- Wave orchestration + docs:
  - `scripts/run-enrichment-wave.mjs`
  - `ops/enrichment-wave-runner.md`
  - `ops/governed-enrichment-wave-contractor-note.md`

### D. Source/evidence/citation data artifacts
- `ops/source-candidates.json`
- `ops/enrichment-submissions.json`
- `schemas/source-candidate.schema.json`
- `schemas/sources-suggestion.schema.json`
- `schemas/source-registry.schema.json`
- `schemas/research-enrichment.schema.json`

### E. Validation and schema surfaces
- `schemas/patch.schema.json`
- `schemas/herb-mechanism.schema.json`
- `schemas/compound-mechanism.schema.json`
- `schemas/interaction-tags.vocab.json`
- `schemas/normalized-enrichment-entry.schema.json`
- `schemas/enrichment-submission.schema.json`

## 2) Grouping: active vs duplicated vs stale/partial/unclear

## Active / likely authoritative
1. **Patch-based enrichment lane in `scripts/enrichment/*`**:
   - Plan (`plan-run`) -> Batch (`run-batch`) -> Validate (`validate-schema` + `validate-domain`) -> Apply (`apply-patches`) -> Coverage + Release Gate.
2. **SQLite-backed governance/state model** via `_shared.mjs` + migrations + manifests.
3. **Governed wave runner** for operational campaign-style sequencing (`run-enrichment-wave.mjs`) that calls report/review phases without bypassing governance.

## Duplicated
1. **Missing-field detection has at least two parallel implementations**:
   - `scripts/check-missing-fields.mjs` (small fixed field set, public report).
   - `scripts/report-herb-missing-data-inventory.mjs` (broader field set, placeholder detection, indexability weighting, ops reports).
2. **Readiness/coverage appears split across multiple report families**:
   - `report-coverage.mjs` (mechanism coverage, backlog burn-down, link integrity).
   - `report-indexability-evidence-gaps.mjs` (quality gates/defects/indexability-wave targeting).
   - large TS report chain (`report:enrichment-*`, `report:source-*`, `report:completion-*`) with overlapping intent.

## Stale / legacy / superseded
1. `scripts/check-missing-fields.mjs` appears legacy relative to richer inventory/reporting stack (narrow fields, no governance coupling).
2. `ops/codex-queue.yaml` and queue-driven references are now explicitly de-emphasized in current repo guidance.
3. Older wave-specific naming conventions still appear in report scripts (wave-1/wave-2/wave-2b) while `run-enrichment-wave.mjs` attempts genericization.

## Incomplete / partial
1. `run-batch.mjs` resolves prompt/provider and can stage patches, but provider dispatch is explicitly TODO unless an operations file is supplied.
2. Dry-run autogeneration for mechanism tasks writes synthetic placeholder-like patch content for plumbing, not authoritative research output.
3. Evidence pipeline (`run-evidence-pipeline.mjs`) scores/queues based on operation payload structure and source metadata but does not perform external source retrieval/verification itself.

## Unclear purpose / high ambiguity
1. Coexistence of many report scripts with similar domain nouns (health/backlog/review/workpacks/waves/completion/indexability) obscures which report is decision-authoritative.
2. Multiple artifacts under `ops/targets/*.json` and `ops/reports/*wave*` without one explicit “single source of operational truth” marker.

## 3) Actual current end-to-end flow (as implemented)

1. **Source input / candidate selection**
   - Claims/tasks live in sqlite `claim_backlog`.
   - `plan-run.mjs` selects pending entities by task/priority and writes a deterministic plan manifest.

2. **Scan missing fields**
   - At least three separate paths:
     - operational missing inferred from patch-required fields in `run-evidence-pipeline.mjs` (`scanMissingFields`).
     - lightweight inventory via `check-missing-fields.mjs`.
     - weighted indexability inventory via `report-herb-missing-data-inventory.mjs`.

3. **Research/evidence lookup**
   - **Not fully automated in core pipeline**.
   - `run-batch.mjs` currently stages operations from provided files or dry-run synthesis; it does not execute a real retrieval/extraction loop itself.
   - Source candidate ecosystems exist (`ops/source-candidates.json`, source queue reports), but orchestration is report/governance-heavy vs unified fetch/extract/apply automation.

4. **Normalization**
   - Normalization scripts exist (`normalize-enrichment-entries.mjs`, `validate-normalized-enrichment.mjs`) but are not clearly the mandatory path in the primary plan->run->validate->apply sequence.

5. **Validation**
   - Schema validation: `validate-schema.mjs` against `schemas/patch.schema.json`.
   - Domain validation: `validate-domain.mjs` task-specific gates (mechanism, interaction severity evidence checks, source suggestion DOI/URL rules, etc.).

6. **Writeback**
   - `apply-patches.mjs` applies only approved lane-A mechanism patches by default; lane-C requires explicit approved review decision rows.
   - Writes to `public/data/herbs.json` and `public/data/compounds.json` with rollback manifest generation.

7. **Reporting**
   - Coverage + burn-down + link integrity: `report-coverage.mjs`.
   - Release gate enforces prebuild/build/validation/coverage/lane-c approvals: `release-gate.mjs`.
   - Separate report families drive source waves, authoring, submission review, and completion scorecards.

## 4) True blockers to source-backed completion

1. **Primary blocker: source retrieval/extraction is not the authoritative automated core path.**
   - The backbone is patch-governance and validation, but evidence acquisition is mostly externalized into candidate/report workflows and manual/ops staging.

2. **Provider execution gap in core batch script.**
   - `run-batch.mjs` includes explicit TODO notes for dispatching provider requests and writing outputs; reliable retrieval->extraction is not integrated end-to-end.

3. **Too many parallel “inventory/report” paths.**
   - Missing-field and readiness logic is duplicated across scripts with different field models and outputs, creating ambiguity over what should drive prioritization.

4. **Governance is strong but orchestration authority is fragmented.**
   - Multiple waves/reports/targets exist, but no single clearly documented source-of-truth orchestrator for daily enrichment intake->evidence->apply lifecycle.

5. **Potential validation-data tension (not recommended to weaken).**
   - Domain gates can block sparse entities (e.g., severe interaction checks), which is correct for safety, but without strong evidence intake this increases queue accumulation.

## 5) What is the real issue?

Most likely **not “no pipeline.”**

The dominant issue is **“too many pipelines/report paths + weak authoritative orchestration of source acquisition and evidence extraction.”**

Secondary issue: **field mapping and readiness logic are fragmented**, creating duplicate work and unclear ownership of completion truth.

## 6) Consolidation recommendation (without lowering standards)

## Keep (authoritative core)
1. Keep `scripts/enrichment/plan-run.mjs` + `run-batch.mjs` + `validate-schema.mjs` + `validate-domain.mjs` + `apply-patches.mjs` + `report-coverage.mjs` + `release-gate.mjs` as the single governed enrichment backbone.
2. Keep sqlite migrations/tables and manifest/rollback model.
3. Keep lane review approvals and fail-closed release gate behavior exactly as-is.

## Remove or archive (after confirmation)
1. **Archive legacy/simple missing scanner** `scripts/check-missing-fields.mjs` (or re-scope it to call the canonical inventory logic).
2. Archive/report-deprecate wave-specific one-off report scripts that duplicate generic wave-runner outputs (especially where they are superseded by `run-enrichment-wave.mjs` + parameterized paths).
3. Reduce redundant readiness reports to one canonical “completion truth” artifact.

## Promote to single authoritative path
1. **Authoritative operational path should be:**
   - backlog target selection -> patch generation from source-backed evidence -> schema/domain validation -> explicit review decisions -> apply -> coverage/release gate.
2. **Authoritative inventory should be one missing/readiness model** (likely the richer indexability-aware inventory) reused by wave targeting + backlog prioritization.
3. **Authoritative evidence intake should feed the same sqlite + patch flow**, not a parallel reporting-only lane.

## 7) Standards constraints confirmed
- Do not weaken validation.
- Do not auto-fill fields with synthetic claims.
- Do not auto-approve review queues.

## 8) Minimal next action to unblock real enrichment

**Minimal unblock step (no new pipeline build):**
- Define and document one canonical “enrichment operations runbook” that names:
  1) the single missing-field inventory source,
  2) the single target queue source,
  3) the single patch generation input contract (source-backed evidence payload), and
  4) the mandatory validation/review/apply/release commands.

Then deprecate duplicate scripts by marking them non-authoritative in docs/package scripts before removing them.

