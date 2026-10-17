# EM-006.04 — synthetic botanical caption deception negative-control receipt

**Lane 1; 2026-10-16; strictly machine-verified research-only metadata.** This is one bounded test family for `EM-006.04`, “Test a deceptive filmed-as-real or analytical-data caption.” It tests a **caller-supplied scene description** against an existing source-approved botanical crop annotation, **not** real rendered/video pixels, caption OCR, a biological measurement, a film-science review, or a license to publish. The parent botanical honesty milestone is already canonically evidence-scoped; these individually audited subtask cards do not increment canonical 26/46. `mayPublish=false`.

## Exact upstream research input identity

- Existing original human-annotated, generated source PNG **SHA-256** `b041fb2ec302b869d9d69cb02dad52afd4186e6aa577e794ba93b05c79b6978d`, original size **940×1672**, exclusively admitted rectangle `[0,0,940,520]`; cropped illustrative pixels previously hashed `4516b902806630ba97941636fbe11a5db8859b8c19a5089adaedbde6d497090e`. All generated molecular drawings/captions lower in the original are **not approved**. Historical source/art audit: [ITERATION-MACRO-AUDIT-2026-10-12.md](ITERATION-MACRO-AUDIT-2026-10-12.md), Git blob `d93908eb6a3fdfe417e816cb073d6088d12b4b97`; [existing source-crop fence](illustrative-crop-gate.mjs), Git blob `35546fff613836afaa89fe43abb897f92d72015a`. These are provenance *records*; the PNG's actual bytes are **not committed or reopened in this test**.
- **Predeclared source-policy hypothesis:** a research montage made from this admitted AI botanical crop may carry only the explicit `AI-ILLUSTRATED BOTANICAL ART` annotation with `originType=synthetic-illustration`, `depictionIntent=nonfactual-atmosphere`, `assertedEvidenceType=none`; any report of real clinical footage, microscopy, authentic species, chemically assayed kratom plant material, measured 7-OH dose, missing disclosure, mutated crop/source digest or extra publication/benefit metadata must HOLD. Even the annotated nonfactual caption is NOT approved for a finished video without real pixel/OCR, rights, scientific and phone-platform readability review.
- Implementation [botanical_caption_honesty_gate.mjs](botanical_caption_honesty_gate.mjs) imports the **existing** `approveIllustrativeCrop` instead of reproducing its overlap checks. The narrow API emits `ANNOTATED_NONFACTUAL_CAPTION_RESEARCH_ONLY` only for authorized self-declared **metadata**; every nonallowlisted input emits `HOLD_DECEPTIVE_OR_UNVERIFIED_BOTANICAL_CONTEXT` with reasons. Both branches permanently force `sourceCropVerified=false`, `actualFrameInspected=false`, `scientificContentMeasured=false`, `phoneContrastChecked=false`, `mayPublish=false`.
- Negative-control implementation [test_em00604_botanical_caption_gate.mjs](test_em00604_botanical_caption_gate.mjs) has 15 tests: controlled annotated-only positive, missing source, wrong full source SHA, unreviewed SHA, wrong crop SHA, overlapping fake chemical source art, absent forbidden-region manifest, fraudulent real film, false species authentication, invented alkaloid assay, fake microscopy, missing disclaimer, replacement with a measured-plant-content claim, undeclared human-effect/permission fields, and null/array values.
- **Real hosted runner proof:** [GitHub Actions #38978057760 / job #117232141676](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38978057760/job/117232141676), exact implementation head `f1a060ba5ee125c4d1d370c6459bcb1763b0b7f4`, conclusion **SUCCESS**. Independently retrieved raw job logs: **15/15** new botanical-caption tests **PASS** and **4/4** reused legacy source-crop fence tests **PASS**. This historical code-only head predates this written receipt and ledger revision; an **additional exact-final-head CI pass** is needed before counting new ledger totals as tested.

## Seven individually bounded atomic research cards

| Card | Machine research evidence (not film acceptance) |
|---|---|
| `EM-006.04.U` | **VERIFIED_MACHINE_RESEARCH** — selected one source-annotated generated botanical crop and one caption-provenance/analytical-data deception class |
| `EM-006.04.S` | **VERIFIED_MACHINE_RESEARCH** — original full generated PNG SHA, admitted crop SHA, source dimension/bounds, prior gate Git blob, tested exact commit and hosted runner pinned |
| `EM-006.04.O` | **VERIFIED_MACHINE_RESEARCH** — exact allowed nonfactual caption/origin/meaning schema; deceptive photo/assay/plant-7-OH declaration must HOLD |
| `EM-006.04.X` | **VERIFIED_MACHINE_RESEARCH** — imported/reused established crop fence and executed narrowly scoped generated-art caption policy, no production invocation or source-art mutation |
| `EM-006.04.T` | **VERIFIED_MACHINE_RESEARCH** — actual hosted node runner executed 15/15 botanical-caption tests and 4/4 existing source-crop tests PASS |
| `EM-006.04.N` | **VERIFIED_MACHINE_RESEARCH** — fake filmed-as-real, pseudo-assay, fake microscopy, false species, missing disclaimer, swapped SHA, generated chemical pixels and forged `mayPublish=true` were correctly refused in synthetic hostile metadata cases |
| `EM-006.04.R` | **VERIFIED_MACHINE_RESEARCH** — this SHA-bound test/receipt with actual hosted run and explicit unresolved true-video/site/owner science approvals |

## Remaining explicit HOLD

`EM-006.01` complete source/generator-prompt provenance is not fully inventoried; `EM-006.02/.03` require actual authored scene and real frame inspection; `EM-008.01` requires chosen native film exact botanical frame timestamp/pixel hashes, `EM-008.02/.03` require source-aware repair and rendered disclosure, and `EM-008.04` independent real handset/validated phone readability remains undone. No known actual named botanical clip was re-decoded here. A valid metadata caption is not evidence of a printed onscreen caption or a source-verified botanical species/7-OH assay. Independent clinical science `EM-007.07` remains HOLD; premium master **0/1**, consecutive varied first renders **0/5**; **no version/publishing/merge authorizations**.

Parent canonical counter remains **26/46**. Research draft [#6840](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6840), issue [#6743](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6743).


## Merge-gate lint repair - October 17, 2026

Hosted CI 39048894758 failed lint: botanical_caption_honesty_gate.mjs declared
OWN but never used it; max warnings is zero. Remove only that dead declaration.
No scientific decision, asset pin, caption policy or approval flag changes.
Fresh Node botanical-caption suite: 15/15 PASS, exit0. Focused ESLint 9.39.5
with unchanged repository eslint.config.js and --max-warnings=0: PASS, exit0.
Initial local lint attempts used an unsupported legacy flag and a wrong config
extension; the corrected invocation passed. Full exact-head CI/build remains
required after push. Existing research HOLD and mayPublish=false remain.
