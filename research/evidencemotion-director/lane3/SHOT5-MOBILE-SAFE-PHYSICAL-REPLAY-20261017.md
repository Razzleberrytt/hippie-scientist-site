# Lane 3 — Shot 5 source-bound mobile-safe art direction (Oct 17, 2026)

**RESEARCH_ONLY / DRAFT / MAY_PUBLISH=FALSE / NO STREAK OR ATOMIC CREDIT.**

## Why this visual change was warranted

Independent Lane 4 and Lane 5 physical-video audits on the prior source-bound 34px-label films detected **three different** nominal TikTok right-20%-strip conflicts: source-footnote ink in Scene 4; moving calculated-3D model art in Scene 4; and the exact Shot5 critical words `NOT SHOWN` extending into x≥864. Lane 4's current nominal UI-mask is **not** a verified TikTok platform overlay or a real physical phone test, but hiding a core science negation behind likely controls is a tangible defect worth fixing. Source clip frame 795 was visually reopened at native 1080×1920 and at 375px width. The previous source artwork places the `NOT SHOWN` bbox around x739–1019; a physical reviewer reported 48/48 affected frames.

**Rejected:** simply reducing text size, rectangular overpainting of old source label, and pixel inpainting produced either worse comprehension or visible erasure seams. Do not use those as release candidates.

## Exact completed opt-in artwork

The research candidate recasts only `sentence_5_part1`, video frame **773–820 inclusive** (48 frames), as one card ending at **x851**, inside the nominal safe limit x864. It keeps the original molecule's actual encoded 2D pixels **1:1** from same source frame 795, without RDKit redrawing or topology edits, and preserves original scientific text:

- `STRUCTURE` header, same original source molecular illustration;
- question mark;
- `NOT SHOWN`, now 2 lines left of the nominal x864 right control boundary;
- existing unmodified `≠ HUMAN EXPERIENCE` and original time-aligned word captions **below** the reconstructed card.

The read-only source renderer is `lane3/shot5_mobile_safe_research.py` and the six new always-on fail-closed tests are `lane3/test_shot5_mobile_safe_research.py`. It requires original H264 SHA and a hash-pinned installed free font, does not include or redistribute font files, generates a transparent original-pixel card overlay, composites it only onto the 48 frames with FFmpeg `overlay=format=yuv420`, and keeps the original AAC as stream-copy. It never rewrites timing or narration. Source and font are SHA rechecked after rendering and source overwrite is refused.

## Actual physical-media verification (local/owner working environment; NOT hosted large-media CI)

| Actual input/readback | Result |
|---|---|
| Source full H264/AAC movie SHA256 | `53cbd9c4d35df96602280d713f6d2f2a1e2ba1bb57a3ec6af593c09d3e83f496` |
| **NEW Shot5 alternative full 34.37s movie SHA256** | `fdece1d9bbd021d514c2510c5bf1e787a2555712f0fd48af8807994ed1816725` |
| Transparent opt-in overlay PNG SHA256 | `9e26a5c281eda5ff6b884d3f0b18dd7d802760c954396d927484f3878e48b27d` |
| Source/film native resolution/FPS and decoded frames | Both H264, 1080×1920, **30/1 fps**, **1031/1031** full decoded frames |
| Decoded best-effort video PTS grid | Max delta to 30fps frame grid **0.0000003333 seconds** |
| Original vs new AAC ADTS elementary stream | **Identical** SHA `f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98` |
| Original/new AAC packet PTS/DTS/duration | **807/807 exactly identical** |
| Exact native x≥864/y680–959 bright-neutral science/text-pixel screen during Shot5 f773..820 | Previous **2,405/frame**; new **0/frame**, **48/48** frames |
| All unaffected frames 0..772 and 821..1030 | **983/983** physically re-decoded at 96×170 gray, mean MAE **0.0083229/255**, worst per-frame MAE **0.0186887/255**, not fully lossless after H264 re-encode |
| Fast source/contract tests in originating runtime | **6/6 PASS** |

**Important media encoding finding:** Initial `overlay=format=auto` produced mean outside-scene gray MAE 1.27485/255, unexpectedly high. That attempt was **rejected**. Final `overlay=format=yuv420` kept native YUV420 sampling and reduced outside-scene change to 0.00832/255. A portable Pillow-only version of gradient reconstruction gave a near-identical overlay (10/8,294,400 pixel channels differ by one unit vs initial NumPy implementation), and the final encoded receipt above belongs to the **Pillow version**, not the superseded output. The GitHub research code uses the same Pillow-only method.

The physical replay receipt `proof/actual_source_movie_receipt.json` was generated in the local research environment; not a GitHub CI "original-media verified" status. The code tests are source/contract regression only and do not certify the film is appealing or scientifically approved.

## Portable verified user-chat handoff (not GitHub-hosted)

`EvidenceMotion_Lane3_Shot5_Mobile_Safe_Research_20261017.zip`, **5,239,915 bytes**, exact outer ZIP SHA256 **`404df9ba41ffa3dde87d638d5500d5e7318c50b50681ce2c766ba7830adda196`**; **12 manifest-pinned members independently rehashed and all ZIP CRC passed**:

- Before and after full source H264/AAC films, source exact original WAV SHA `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`, RDKit source molecule SHA `150ccd331963beab2481ad47c36e1e171db6bdd37e4d50746a3d6b4b5be60bcb`;
- New research storyboard physically bound to the new actual H264 SHA, SHA `3c48c814244d9b3bb6ac1fdbb28e98a68c7cada48031eb0a410801c9ee978ffa`; still `phonePlanSha256=null`, science/creative/current-phone signoffs false. Do not pretend this is **COMPLETE** receiver intake;
- Pillow-only research code, exact source overlay, negative regression tests, actual-media inspection script and 375px before/after screenshot (review-only red x864 guide; not present in film).

The handoff ZIP is **in the owner's conversation workspace**, not on the GitHub PR or CI. Independent Lane 6/Lane 4 receivers must acquire and hash the exact bytes before claiming independent validation; a GitHub comment alone is not a received artifact.

## Remaining unclosed gates

**Scene 4 is NOT fixed by this Shot 5 research treatment.** The previous real-film 3D molecule extends to ~x987 in the same nominal x≥864 phone-control zone for **147/147 frames**, and the enlarged Scene4 footnote also extends right; both remain MOBILE HOLD. A full current-film safe-area review including the title, caption negative claims, overlays and source-card data; actual iPhone/app UI playback; independent scientist/editorial source verification; human artistic benchmarking; original narration ear audition; controller integration and release approvals have **not** occurred.

Draft PR remains UNMERGED. No 46-parent/1,590-atomic card completion inferred from this narrow negative screen; excellent first render and five-first-render streak not advanced. `mayPublish=false`. Normal 3-slot D/R/A admission and protected merge rights unchanged.
