# EM-002.02 — EvidenceMotion policy crosswalk (research-only, 2026-10-16)

**Purpose / real unit:** one EvidenceMotion version/admission-policy restriction for `EM-002.02`. This crosswalk records existing authorities; it does **not** invent a workstream, a permission, a reviewer, a new version freeze, or completion credit. Existing research [issue #6743](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6743) / **draft** [PR #6840](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6840) remain research-only. `mayPublish=false`.

## Owner decision and precedence

- **October 12:** the owner initially imposed an EvidenceMotion version/capability freeze pending genuinely excellent first-final quality. **October 13:** the owner explicitly **rescinded the version freeze**. Iteration is allowed **only** under ordinary work admission, protection, budgets, science and safety constraints. The signed-in repository [canonical checklist](COMPLETION-CHECKLIST.md) records both dates, distinguishes freeze rescission from deployment/publishing authority, and remains the milestone authority.
- **Authority order for this unit:** [AGENTS.md](../../AGENTS.md) / [CURRENT_SPRINT.md](../../docs/CURRENT_SPRINT.md) for admission and WIP; [DECISIONS.md](../../docs/DECISIONS.md) for recorded governance; [canonical EvidenceMotion checklist](COMPLETION-CHECKLIST.md) for media/science/owner gates; [atomic register](GRANULAR-46-EXECUTION-REGISTER.md) for this decomposed acceptance item. Live issue/PR/CI state outranks dated prose. The atomic index and this report are not new control planes. The canonical tracker currently has **26/46** accepted foundations; this crosswalk does not increase that count.

## Still-required policy crosswalk

| Requirement | Primary governing source | Required action / stop condition |
|---|---|---|
| **WIP / admission** | [AGENTS](../../AGENTS.md), [CURRENT_SPRINT](../../docs/CURRENT_SPRINT.md) | No more than **three normal active workstreams**: Discovery/SEO (D), Revenue/Conversion (R), Authority/Content (A); at most one active ticket per workstream. A research chat lane / draft PR does **not** consume or confer admission to an extra Operations workstream. Current sprint was 2/3 at the 2026-10-16 reconciliation; recalculate from GitHub before admitting anything. |
| **Source and scientific truth** | [AGENTS](../../AGENTS.md), [canonical checklist](COMPLETION-CHECKLIST.md) | Bind each factual/visual claim to retrievable source/context and exact asset identities; unsupported human effects stay HOLD. Qualified independent or separately calibrated primary-source-grounded review is still required; a synthetic suite or solo model opinion cannot self-approve science. |
| **Spending / dependencies** | [CURRENT_SPRINT](../../docs/CURRENT_SPRINT.md), [DECISIONS](../../docs/DECISIONS.md) | No new paid critical-path dependency or spending authorization arises from an EvidenceMotion version or research run. Use existing CPU/open tooling unless a distinct owner-authorized, governed cost decision exists. Unknown cost is **Unknown**, not free-by-assertion. |
| **Security / privileged actions** | [AGENTS](../../AGENTS.md), [DECISIONS](../../docs/DECISIONS.md), [EM-002.03 guard](research_workflow_release_guard.py) | Preserve secrets/permissions/security gates, reject write scopes, posting/deploy triggers and privileged workflow changes. The narrow research-workflow source guard is **not** a complete arbitrary-script security proof. |
| **Protected integration / release** | [CURRENT_SPRINT](../../docs/CURRENT_SPRINT.md), [DECISIONS](../../docs/DECISIONS.md) | Exact current head/base, mandatory protected CI, resolved relevant review, source and safety checks, sole protected merge controller and required actual deployment receipts. Draft research PR checks do not substitute for these gates or self-merge. |
| **Media, device and independent acceptance** | [canonical checklist](COMPLETION-CHECKLIST.md) | Real 1080×1920/30 fps decoded native final, original voice/phonetic proof, genuine handset playback, calibrated science/craft acceptance, then first excellent first render **0/1** and five varied excellent first renders **0/5** until independently earned. |
| **Publication / integration authorization** | [canonical checklist](COMPLETION-CHECKLIST.md), [EM-002.03 guard](research_workflow_release_guard.py) | **Explicit separate owner authorization** before TikTok/YouTube posting, automated posting, production publisher changes or lifting any release HOLD. `mayPublish=false`, `releaseAuthorized=false` and no research result changes those flags. |

## Evidence pins for this fixed crosswalk

The source **Git blob SHA-1** values below bind the assertions to exact fetched repository bytes on the existing Lane 1 branch. Changing the source content invalidates this dated crosswalk and requires re-review; these pins are *not* signatures by a reviewer.

| Source path | Git blob SHA-1 at inspection |
|---|---|
| `AGENTS.md` | `08c7fb68759faec3dc26c83928eb7e73e3c1abf8` |
| `docs/CURRENT_SPRINT.md` | `16f5f65e142e9268a190ae6e443aed79b992217d` |
| `docs/DECISIONS.md` | `80e43540c3ef6c43025715bdbb4564d3bb45d0d1` |
| `research/evidencemotion-director/COMPLETION-CHECKLIST.md` | `de3501764918492216e4a84c11e563d34fc71e6c` |
| `research/evidencemotion-director/research_workflow_release_guard.py` | `738cd6d2b2fdf7607a9e686fc2fd59b54bc114bb` |


### 2026-10-18 source revision (pending protected PR integration)

The CURRENT_SPRINT source document has a new dated, research-only EvidenceMotion metric reconciliation paragraph under [PR #6912](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6912). The Git blob pin above now identifies the exact **current** sprint source `1010b8698bafa2c2b68de0625ddcf1996823c3a1` rather than the historic 2026-10-16 source `3fd3e60e6ed15679e1d11a8b97ea4aba632600f6`. The earlier hosted 5/5 report documents only its original historical source snapshot and is **not** offered as test approval of these amended bytes. A fresh source-locked EM-002.02 validation run, full exact-head CI, current-base controller merge and actual deployment receipt remain required. The amendment changes only the current reporting definition (820 distinct research-only mapped of 1,590; 167 machine-audited stages, 707 inherited including 54 overlaps, one orphan), not D/R/A admission, clinical/craft/handset acceptance or `mayPublish=false`.

### 2026-10-19 source pin refresh after protected-main integration

The authoritative `docs/CURRENT_SPRINT.md` changed on `main` during later protected merges. The original research crosswalk remains fail-closed; its one sprint Git-blob pin is refreshed above to the actual `16f5f65e142e9268a190ae6e443aed79b992217d` bytes after a non-conflicting current-main branch sync. The dated older source `1010b8698bafa2c2b68de0625ddcf1996823c3a1` is historical, and its hosted green checks must not be reused as current-head proof. This does not add admission, any scientific/voice/craft review, atomic /1,590 acceptance or release authorization; `mayPublish=false`.

## Measurable acceptance and held conditions

- **PASS (bounded document scope):** each of the five above Git blobs matches the pinned bytes; all seven policy rows and governing links remain present; rescission explicitly remains separate from publishing/merge authority; the policy has no grant of a fourth normal WIP slot or independent media acceptance.
- **FAIL/HOLD:** missing source, mutated/premature admission or publication assertion, source SHA drift, broken crosswalk rows. The accompanying `test_em00202_policy_crosswalk.py` exercises both this live report and synthetic tamper cases; a green unit test is **document-integrity only**, not a real merge/phone/science/craft audit.
- **Unresolved:** exact-final handset playback `EM-001.03.T`, independently calibrated scientific claim review `EM-007.07`, independent speech/craft gates, PR approval/merge, first premium render and five-render streak. **No canonical parent or film gate is advanced by this report.** `mayPublish=false`.

## Machine-only atomic receipt — EM-002.02

**Hosted proof source:** exact original CI code head `3df4f10d53b643102b34a5657b51eaa8e30312f7`, [atomic proof run #38975052480, job #117222371489](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38975052480/job/117222371489), **SUCCESS**. Retrieved hosted runner logs confirm **5/5** crosswalk tests PASS, actual `PASS_RESEARCH_POLICY_CROSSWALK_BYTES_ONLY` report with five original Git blob matches and seven policy rows. The adversarial cases rejected source drift, a missing WIP row, missing owner freeze-rescission language, forged publish permissions and broken source links. This is exact source/document evidence, **not** qualified science, real device, protected merge or production execution. Any subsequent report/ledger edit needs a new exact-head CI recheck before final accounting.

| Atomic card | Source-bound proof |
|---|---|
| `EM-002.02.U` | **VERIFIED_MACHINE_RESEARCH** — one real EvidenceMotion version/admission policy restriction identified; not another lane or scope |
| `EM-002.02.S` | **VERIFIED_MACHINE_RESEARCH** — five exact source Git blob identities pinned above and independently matched from the actual hosted checkout |
| `EM-002.02.O` | **VERIFIED_MACHINE_RESEARCH** — predeclared seven required gate rows, revoked-vs-retained authority distinction, explicit fail-closed missing/drift criteria |
| `EM-002.02.X` | **VERIFIED_MACHINE_RESEARCH** — crosswalk, deterministic SHA policy validator, adversarial test fixture and mandatory CI integration executed for that bounded unit |
| `EM-002.02.T` | **VERIFIED_MACHINE_RESEARCH** — hosted first-party tests **5/5 PASS** at exact cited CI source, including validation of actual source bytes and governing links |
| `EM-002.02.R` | **VERIFIED_MACHINE_RESEARCH** — this dated source-SHA/CI/exact-scope audit record, with independent science/film/phone/merge/posting gates explicitly HOLD |

**Score boundary:** exactly six independently auditable machine-only research cards for this one EM-002.02 unit, never a parent EM-002 accepted checkbox, owner review, additional slot or publication permission. The existing 707 inherited provisional items remain unaudited. The canonical 26/46, excellent-first 0/1 and varied streak 0/5 stay unchanged; `mayPublish=false`.

## EM-002.04 trace target (NOT accepted by this EM-002.02 report)

The governing parent remains [EvidenceMotion COMPLETION-CHECKLIST.md, section A](COMPLETION-CHECKLIST.md) and the [EM-002.04 granular task](GRANULAR-46-EXECUTION-REGISTER.md#em-002). This document **links** there but intentionally does not edit a canonical checked box, the main project sprint or any runtime production controller. A separate exact-source trace/approval is required before `EM-002.04` acceptance.
