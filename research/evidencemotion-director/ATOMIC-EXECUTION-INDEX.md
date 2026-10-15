# EvidenceMotion Atomic Execution Index

> **Owner direction: 2026-10-15.** Atomic action map over [243 granular subtasks](GRANULAR-46-EXECUTION-REGISTER.md) and the one authoritative [46-milestone checklist](COMPLETION-CHECKLIST.md). This is a work-planning overlay, **not** a new completion score, runtime admission, publication permission or test result.

## Verified structural inventory

- **46 original parent milestones:** 26 accepted research foundations / 20 open as recorded in the canonical tracker at preparation.
- **243 retained, non-renumbered child task definitions.**
- **1,590 atomic action cards:** exactly 243 each of unit inventory (`U`), source pin (`S`), acceptance oracle (`O`), bounded execution (`X`), actual test (`T`), decision receipt (`R`), plus 132 negative-control (`N`) cards; **all initially NOT_AUDITED** at this new atomization level.
- **Variable real-unit instances not guessed:** per-claim, word, shot, rendered video, issue/CI run and real device session instantiations can add real work after source inventory; do not silently freeze an invented instance denominator.
- **Quality milestones unchanged:** one excellent first render 0/1; five consecutive excellent varied first renders 0/5. No film/craft/science/handset/publication gate completed by writing this checklist.

## Browse by domain

| Domain | Parent IDs | Microtasks | Atomic cards | File |
|---|---|---:|---:|---|
| Operating & Science | EM-001…EM-008 | 38 | 245 | [Open workcards](atomic/01-operating-science.md) |
| Voice & Word Timing | EM-009…EM-017 | 44 | 289 | [Open workcards](atomic/02-narration-timing.md) |
| Cinematography & Craft | EM-018…EM-028 | 52 | 332 | [Open workcards](atomic/03-direction-craft.md) |
| Mobile, Technical QA & Safety | EM-029…EM-037 | 55 | 373 | [Open workcards](atomic/04-trust-mobile.md) |
| Production, 5-Render Streak & Operations | EM-038…EM-046 | 54 | 351 | [Open workcards](atomic/05-canonical-promotion.md) |

## What an *atomic* item means

Each card is **one independently observable operation or assertion on exactly one real unit**. A source task like “verify every scientific claim” is *not* done after verifying one claim: first inventory all claims, then instantiate and verify a card series **per claim**. Preserve separate IDs for the 243 tasks. Source code being written is not the same as a passing output.

| Stage | Do exactly this | Minimum receipt |
|---|---|---|
| `U` | Name **one** real unit, e.g., claim-017, word-042, shot-009 or permission-TikTok | Stable unit key, source location |
| `S` | Pin **one required source/asset identity** for that unit | Source URI/version and SHA or explicit blocker |
| `O` | Declare **one falsifiable expected result** before attempting execution | One pass/fail assertion and acceptance rule |
| `X` | Execute or re-prove **one bounded operation** only for that unit | One changed artifact, measurement or reproducible execution |
| `T` | Test **one actual assertion** against real output (not metadata alone) | One measured PASS/FAIL/HOLD and test input identity |
| `N` | Where assigned, show **one disallowed/negative example is rejected** | Failing fixture/real negative-control run and reason |
| `R` | Store **one audit-grade evidence receipt** and disposition | Immutable SHA, exact CI/run, reviewer scope and link |

For a multiple-input step, instantiate `.S@source-ID`; for a multiple-test step, `.T@assertion-ID`. An action combining multiple independent changes must be split into `.X@operation-ID` instances rather than hiding work behind one checkmark.

**Example for the original confusing '27':** The canonical `EM-027` was the *already accepted* PubChem reading hold. The separately open combined-caption/muted-comprehension work called “#27” in [PR #6817](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6817) is tracked under **EM-034** (alongside EM-017 and EM-036). Start with `EM-034.04.U@scene-001` for the first actual shot, `S@scene-001` for exact encoded frames and text sources, `O@scene-001` for a frozen reading-load threshold, `X@scene-001` to compute its total visible-text rate, `T@scene-001` for actual decoded output, and `R@scene-001` to attach objective before/after proof. *Do not use the research 99% proxy as canonical percentage completion.*

## Per-milestone crosswalk

| Canonical milestone | Original microtasks | Atomic cards | Atomic file |
|---|---:|---:|---|
| EM-001 | 4 | 24 | [Details](atomic/01-operating-science.md) |
| EM-002 | 4 | 25 | [Details](atomic/01-operating-science.md) |
| EM-003 | 5 | 31 | [Details](atomic/01-operating-science.md) |
| EM-004 | 4 | 25 | [Details](atomic/01-operating-science.md) |
| EM-005 | 4 | 25 | [Details](atomic/01-operating-science.md) |
| EM-006 | 4 | 24 | [Details](atomic/01-operating-science.md) |
| EM-007 | 8 | 56 | [Details](atomic/01-operating-science.md) |
| EM-008 | 5 | 35 | [Details](atomic/01-operating-science.md) |
| EM-009 | 4 | 25 | [Details](atomic/02-narration-timing.md) |
| EM-010 | 4 | 25 | [Details](atomic/02-narration-timing.md) |
| EM-011 | 5 | 31 | [Details](atomic/02-narration-timing.md) |
| EM-012 | 5 | 30 | [Details](atomic/02-narration-timing.md) |
| EM-013 | 4 | 24 | [Details](atomic/02-narration-timing.md) |
| EM-014 | 6 | 42 | [Details](atomic/02-narration-timing.md) |
| EM-015 | 5 | 35 | [Details](atomic/02-narration-timing.md) |
| EM-016 | 6 | 42 | [Details](atomic/02-narration-timing.md) |
| EM-017 | 5 | 35 | [Details](atomic/02-narration-timing.md) |
| EM-018 | 4 | 25 | [Details](atomic/03-direction-craft.md) |
| EM-019 | 4 | 25 | [Details](atomic/03-direction-craft.md) |
| EM-020 | 4 | 24 | [Details](atomic/03-direction-craft.md) |
| EM-021 | 4 | 25 | [Details](atomic/03-direction-craft.md) |
| EM-022 | 6 | 38 | [Details](atomic/03-direction-craft.md) |
| EM-023 | 6 | 37 | [Details](atomic/03-direction-craft.md) |
| EM-024 | 4 | 25 | [Details](atomic/03-direction-craft.md) |
| EM-025 | 5 | 31 | [Details](atomic/03-direction-craft.md) |
| EM-026 | 4 | 28 | [Details](atomic/03-direction-craft.md) |
| EM-027 | 4 | 25 | [Details](atomic/03-direction-craft.md) |
| EM-028 | 7 | 49 | [Details](atomic/03-direction-craft.md) |
| EM-029 | 4 | 25 | [Details](atomic/04-trust-mobile.md) |
| EM-030 | 4 | 28 | [Details](atomic/04-trust-mobile.md) |
| EM-031 | 5 | 35 | [Details](atomic/04-trust-mobile.md) |
| EM-032 | 5 | 31 | [Details](atomic/04-trust-mobile.md) |
| EM-033 | 5 | 30 | [Details](atomic/04-trust-mobile.md) |
| EM-034 | 16 | 112 | [Details](atomic/04-trust-mobile.md) |
| EM-035 | 6 | 42 | [Details](atomic/04-trust-mobile.md) |
| EM-036 | 6 | 42 | [Details](atomic/04-trust-mobile.md) |
| EM-037 | 4 | 28 | [Details](atomic/04-trust-mobile.md) |
| EM-038 | 7 | 43 | [Details](atomic/05-canonical-promotion.md) |
| EM-039 | 6 | 37 | [Details](atomic/05-canonical-promotion.md) |
| EM-040 | 4 | 25 | [Details](atomic/05-canonical-promotion.md) |
| EM-041 | 6 | 42 | [Details](atomic/05-canonical-promotion.md) |
| EM-042 | 5 | 32 | [Details](atomic/05-canonical-promotion.md) |
| EM-043 | 5 | 35 | [Details](atomic/05-canonical-promotion.md) |
| EM-044 | 7 | 44 | [Details](atomic/05-canonical-promotion.md) |
| EM-045 | 7 | 49 | [Details](atomic/05-canonical-promotion.md) |
| EM-046 | 7 | 44 | [Details](atomic/05-canonical-promotion.md) |

## Status and work sequencing

1. `NOT_AUDITED` means its previous implementation/evidence has not been mapped to this new card; it does **not** mean 0% engineering progress. Search prior merged PR/CI/encoded assets and mark **VERIFIED** only after validating original proof on exact applicable source/film identity.
2. `READY` requires a named real unit, source availability, a frozen pass condition and existing allowed workstream/owner; `BLOCKED` names an unavailable asset, access, calibration, real-device requirement or owner permission; `FAILED` records reproducible failing evidence.
3. Before coding, select only the highest-priority unblocked admitted ticket from `docs/CURRENT_SPRINT.md`. These cards are **not** 1,590 new GitHub issues, PRs, feature requests or new workstreams; bundle coherent operations under the one current owner and normal 3-slot D/R/A WIP.
4. For any actual changes, run targeted relevant tests, protected exact-head required CI and full build, and use the single authorized merge controller. Source/science, real audio, device, clinical review, platform consent and craft conditions remain separate. A green test alone is never approval to publish.
5. Report **parent 26/46** separately from audited atoms and real-case instances. Atom denominator remains 1,590 template cards only; instance denominator is shown only when a complete real-unit inventory exists. Do not increment simply to make each chat message's percentage change.

## Suggested receipt record

```json
{
  "atomic_id": "EM-034.04.T",
  "unit_id": "scene-001",
  "state": "NOT_AUDITED",
  "source_uri": null,
  "source_sha": null,
  "artifact_sha": null,
  "acceptance_assertion": null,
  "observed_value": null,
  "evidence_url": null,
  "tool_or_run_id": null,
  "review_scope": "machine-only | calibrated independent | real-device | owner-authorized",
  "blocker": null,
  "measured_at": null
}
```

Values above are an **empty example schema**, not a fabricated executed check. Every mandatory field must be backed by evidence for `VERIFIED`. No user/owner name, paid provider or external viewer is automatically inferred.
