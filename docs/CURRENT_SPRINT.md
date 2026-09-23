# Current Sprint

**Status:** Authoritative immediate execution queue
**Sprint:** Governed Distribution MVP + Measurement Foundation
**Updated:** 2026-09-23
**Normal WIP limit:** `AGENTS.md` permits Discovery/SEO, Revenue/Conversion, and Authority/Content only, with one active ticket per workstream. Distribution lanes do not independently grant additional Revenue/Conversion slots; Operations is not a fourth normal workstream.
**WIP cap:** 3
**Current admission:** #5703 remains the sole Authority/Content implementation item and is blocked on its required governor lease. #5753 is admitted into the free Revenue/Conversion lane for a bounded Kava post-answer journey audit, with fail-closed no-op retirement if current MAIN already has one compliant action. Normal implementation WIP is **2/3**. Discovery/SEO remains free. Missing external conversion/revenue observations remain `Unknown`.

**Control dependencies:** #4412 <- #4411; #4406 <- #4388, #4401, #4405; #4407 <- #4406

## Sprint objective

Finish the smallest trustworthy Evidence → Distribution loop that can produce a governed asset, preserve exact factual provenance through presentation/rendering, move it through an idempotent dry-run publishing lifecycle, and accept attributable outcome observations for deterministic feedback.

## Execution rules

- Start only tickets listed under `Active` or `Ready next` below, and only when a real WIP slot exists.
- GitHub issue/PR state outranks stale document wording.
- The normal WIP cap remains three.
- Missing production/external metrics remain `Unknown`, never zero and never inferred success.
- Deterministic failures found inside scope are repaired before merge. Merge only on exact intended head when required gates are green and no blocking review/governance defect remains.

## Active / in review — implementation WIP 2/3

| Lane | Ticket | Title | Status | Priority | Score | Freshness |
|---|---|---|---|---|---:|---|
| A | #5703 | Close cobalamin deficiency-vs-enhancement evidence with new 2024 null meta-analysis | Admitted — blocked on required lease | P1 evidence governance | — | Existing governed scientific admission; canonical mutation remains lease-gated |
| R | #5753 | Audit Kava post-answer journey for one evidence-first next action | Admitted — audit first; fail closed to no-op if already compliant | Revenue/Conversion | — | Revalidated 2026-09-23 against exact MAIN `68f6c4f0eb14e4a76ebfca3a3cbe9ef7fe0b2603`; external conversion/revenue observations remain `Unknown` |

- **Discovery/SEO:** free.
- **Revenue/Conversion:** occupied by #5753. Add at most one trust-preserving evidence-first next action only if a deterministic gap remains. Do not alter scientific conclusions, evidence grades, dosing, contraindications, safety language, canonical identity, disclosure ordering, affiliate behavior, or analytics contracts except to repair a deterministic in-scope defect.
- **Authority/Content:** occupied by #5703; canonical mutation remains forbidden until its required non-overlapping governor lease is merged.

## Ready next — strict dependency order

Discovery/SEO remains free. Reconcile current GitHub state first, then promote only a fresh legal non-overlapping candidate through the repository's single scoring/freshness policy. Fresh dated page-level search opportunity remains primary for Discovery/SEO; missing external evidence remains `Unknown`.

## External blockers preserved

Production analytics receipt, fixed-window GSC evidence, aligned funnel/revenue baseline, and provider-side deployment evidence remain externally gated where authorized source access is unavailable. These blockers do not freeze unrelated governed repository work.
