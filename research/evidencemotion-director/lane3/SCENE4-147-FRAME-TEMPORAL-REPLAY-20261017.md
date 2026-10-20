# Lane 3 — All-147-frame source-footer negative replay (2026-10-17)

**Research only; no production, version bump, D/R/A admission, merge or publish approval.**

## Rationale

The existing clipped-molecule correction had tested a representative physical frame (frame 630), and visual contact-sheet frames. That does **not** rule out ghost fragments returning in a *later* frame of the 3D rotation or the disclosure dropping out near the end of the scene.

This continuation re-decodes **every actual film frame 555–701 inclusive** from the untouched Shot5 source and the cleaned Scene4 film, checks original source media identity before and after FFmpeg, and adds negative tests that force single-frame artifact and disclosure dropouts. It **does not** regenerate or modify the encoded film.

### Exact source pins and local physical replay

- Before: `e79e44746e8a8581ecc592e41de20bb67ded7e999042234902ed30b0142a0c9a`.
- After: `3c4e91b37958f1e86b6a04486933bbfc719bf6a196203711d6421eca58b70d31`.
- Physical render, original 1080×1920 / 30fps H264: **147/147 frame samples** decoded for each movie via FFmpeg strict `-xerror` native color crop.
- Region: native pixel rectangle x515–948, y944–993 (434×50 RGB24 with **FFmpeg crop `exact=1`** (otherwise chroma-subsampled source silently rounds the odd x515 origin)). A bright-atom-fragment negative screen uses x565–948/y944–959. The original disclosure ink screen uses x515–879/y960–986. Pixel counts can never certify literal wording, OCR, body-science accuracy or visual beauty.
- **Before:** bright leftover molecule fragments in **142/147 frames**; five earliest frames had none.
- **After:** **0/147** frames contain those bright fragments at the same threshold.
- Footer ink first appears at **frame 595**, as expected for `not`; 107 consecutive frames retain the same ink-presence class through frame 701. Worst relative text-ink pixel count change among those frames: **1.1905%**, attributable to lossy H264 encoding, not an automatic OCR proof.
- Local physical replay receipt: `scene4_temporal_full147_replay_receipt.json`, SHA256 `7f155364dafcce32bda1d8c9f3db22c4f26653dd6dd3d46f6b6c4dd18d2ad8cb` in originating working environment. The two film source hashes were rechecked after reading.
- Standalone reproducible CLI: `lane3/scene4_temporal_footer_watch.py --before PATH_TO_EXACT_ORIGINAL --after PATH_TO_EXACT_CLEAN`. The full original+clean H264 files were provided in the earlier user-chat `EvidenceMotion_Lane3_Scene4_CleanPanel_Actual_Research_20261017.zip`; not hosted in GitHub. The tool refuses alternate film hashes and will fail closed on truncated or changed inputs.
- Seven fast always-on negative tests: original identity mutation; a single late ghost at frame 685; disappearing footer at frame 701; an early unearned disclosure; ink drift; missing/short physical measurements; false success with no original defect; byte/pixel crop predicates. The locally run tests were **7/7 PASS**.

## Scope and explicit holds

This is a **negative regression detector**, not human film quality confirmation. The unchanged video may still have a small 375px phone label, an unsatisfying editorial rhythm, insufficient storytelling, science/caption issues, or problematic sound; independent Lane4 actual-phone OCR and auditory/creative reviewer assessment remain required. `scienceApproved=false`, `craftApproved=false`, `phonePlaybackApproved=false`, `mayPublish=false`.

At document creation the new exact-head native GitHub tests had been **queued**, not assumed green. The existing research PR is still DRAFT/unmerged, 17 commits behind `main` at the last comparison. No new milestone/atomic-card credit; first excellent first-render 0/1 and five excellent varied first renders 0/5. Controller-only protected merge.

