# EM-007.05 — Real original-film source-strength ceiling receipt

**Date:** 2026-10-16. **Scope:** verifiable *machine research* about the original narration, existing PubChem chemistry records and H264 render; NOT clinical literature review, reviewer approval, first-render excellence, human/handset assessment, protected merge or publication.

## Bound actual source and independent replay
- Existing Lane 1 research draft [#6832](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6832). New replay implementation `em00705_original_archive_replay.py` and `test_em00705_original_archive_replay.py`; research workflow downloads a **previously successful real original-WAV native artifact**, independently verifies its bytes, then re-executes current claim-strength ceilings. This avoids the *separate* failing FFmpeg decoded-frame phone/UI gate and makes **no claim** that the new branch's full film render passed.
- **Hosted execution** [run 38923516698](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38923516698), exact implementation commit `580005fb5cabdcef18868efba412d535b8c7dd71`. `science-source-adversarial-controls` job SUCCESS, including source, uncertainty, claim-strength, genuine film archive-source replay and dedicated six original-file negative/positive cases. Real downloaded source archive from prior green [run 38914069118/artifact 12052645131](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38914069118/artifacts/12052645131).
- New [actual result artifact 12055906795](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38923516698/artifacts/12055906795), `em00705-original-archive-source-ceiling-only` ZIP. Downloaded and independently rehashed: ZIP SHA-256 `d571ecc7354e2a71c20d5fe3b1abebaf8e08570439f07cca5c471c5e1e4cff64`, 731 bytes. Its single JSON is 894 bytes, SHA-256 `98a6a63ac23f8fd3030ebd91f13b18e5fc3302b7456740c43204058d4b606a4f`.
- Independently pinned authentic H264 film SHA `4a36305c08e422d85a006332c4e83d39dac4a8f12c87502ad842cb99b8f874e3`, EM-007.03 primary-source join SHA `96c2c7c940b729dcc42264a24861b98edf2e45f4a5d0ac8b332500b4adac2aca`, EM-007.04 uncertainty receipt SHA `a806a2d71027f3facec74f4a02f8b3f88afb949d64219f18d1073aeda0c9dbb6`, source WAV SHA `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`. Exact film/source/uncertainty identities in the emitted JSON matched this independent downloaded ZIP.
- Derived canonical machine claim-strength receipt digest (sorted JSON) `7622e201f8a023c16c58cfff9d204330c91339a370ee8a62454ec151694e2874`. This is a recalculated science-ceiling **research** comparison, not a new filming pass or human-study estimate.

## Exhaustive comparison and negative controls
The replay audited exactly **eight immutable original narrated claims**, including six material claims `spoken-002` through `spoken-007`. All **30/30** fields (population, human outcome, dose, exposure duration, follow-up × six material claims) are *NOT REPORTED IN THIS SELECTED NONCLINICAL SOURCE PACK*. Chemical structure records (PubChem CID 3034396, 44301524) and local artwork are **not human trials**. This does **not** conclude that no human study exists elsewhere, that studies show no effect, or that actual drug effects do/do not occur. Question and editorial invitation are explicitly non-outcome claims.
- The same real bytes pass the positive eight-claim comparison without granting clinical significance.
- The six dedicated hosted tests include actual movie mutation, source-claim JSON mutation, uncertainty JSON mutation, missing data, injected fictitious source attachment and correct original H264/claim/source replay; every alteration fails closed against the pinned artifact bytes. The larger existing source-scope suite additionally tests clinical metadata injection, wrong CID, changed claim meaning, false approval and study-absence conflation.
- Result `currentHeadNativeRenderCertified=false`, `qualifiedHumanScientistApproval=false`, `externalClinicalLiteratureReviewed=false`, `mayPublish=false`. CI proof here **does not override** current-head slow native-phone H264/FFmpeg failures.

## Seven distinct machine-research workcard dispositions
| Card | Independently verifiable bounded research proof |
|---|---|
| `EM-007.05.U` | **VERIFIED_MACHINE_RESEARCH** — exact eight frozen claim units, six material |
| `EM-007.05.S` | **VERIFIED_MACHINE_RESEARCH** — independently rehashed real film, source join, uncertainty JSON, original voice, and artifact receipt |
| `EM-007.05.O` | **VERIFIED_MACHINE_RESEARCH** — independently declared five population/outcome/dose/exposure/follow-up axes; all source ceilings limited to chemistry/computed film |
| `EM-007.05.X` | **VERIFIED_MACHINE_RESEARCH** — hosted CPU execution of exact real source archive through current code without a fresh H264 render |
| `EM-007.05.T` | **VERIFIED_MACHINE_RESEARCH** — actual original-H264/source JSON positive replay and 30/30 study axes, hosted SUCCESS and independently rehashed result archive |
| `EM-007.05.N` | **VERIFIED_MACHINE_RESEARCH** — six hosted real-artifact mutation/negative method tests plus existing science-ceiling adversarial controls all reject false human clinical authority |
| `EM-007.05.R` | **VERIFIED_MACHINE_RESEARCH** — this precise source/run/artifact/byte receipt with explicit unresolved clinical/phone/viewer/craft/release HOLDs |

**Accounting proposal:** +7 uniquely machine-audited cards over verified 75 = **82** individual machine-research cards, plus **707** inherited *non-audited* provisional cards = **789/1590 (49.6226%) provisional**; only after the updated proof-ledger host gate accepts this receipt. The full 46-item milestone count and first-render/streak acceptance remain unchanged. EM-007.07 qualified independent review and EM-007.08 release/process gate remain open. This is **not production** and `mayPublish=false`.


## Merge review: immutable replay inputs - October 17, 2026

The CLI now reuses research_receipt_io.prepare_research_output and
emit_research_output. Reject direct and hardlinked aliases to all three archived
inputs before reading/validating or writing; emit through the existing atomic
receipt writer. Original replay/evaluate logic and SHA pins are unchanged.
The six alias cases initially failed because alias admission was not checked;
all now fail closed at the output boundary and preserve the input bytes.

Focused OutputSafety regression: 1 test / 6 subcases PASS on Windows and Linux,
exits0. Shared research_receipt_io suite: Windows 5 PASS / one symlink privilege
SKIP; Linux 6/6 PASS, exits0. Existing gut archive resource-limit suite: 19 PASS /
one optional archive-input SKIP on both platforms, exits0. Its current reader
already bounds package, member count, member size, total expansion and manifest
before decompression; no duplicate reader implementation added.

The six original-film replay cases require the separately pinned real archive
and were not run locally in this focused follow-up. Hosted original-archive,
full CI/build and sole-controller merge remain mandatory; no human science,
phone, craft, voice, release or publishing approval is inferred.

Concurrent owner commit d3f43ba01 added validate_receipt_target during this repair.
Retained that diagnostic precheck and added shared atomic output handling;
regressions accept either explicit alias refusal and preserve all six inputs.
