# Lane 3 — Actual decoded footer ghost-band correction (2026-10-17 UTC)

**Status: RESEARCH_ONLY / DRAFT / NO SCIENCE, CRAFT, PHONE OR PUBLISH APPROVAL.**

This is a bounded continuation of the original chemically source-bound Scene 4 model-fit experiment. The prior first repair `78bfa78665d1e72b33e947db66fcb354701b5a086d0aaee13d6f1cf78bc6f0c2` fit the calculated molecule inside the 3D panel but still left a thin row of **old clipped molecular fragments immediately above the source disclosure** `Not a receptor recording` (native y944–959). Those remnants were visible in decoded 1080p, not merely synthetic test metadata.

## Exact-asset-preserving correction

- Still uses original revised Shot5 film SHA256 `e79e44746e8a8581ecc592e41de20bb67ded7e999042234902ed30b0142a0c9a` and complete archived molecule movie SHA256 `2851c9ce6bbac6c5bd396c28cb4ab3c59caf5a4f5baaa1ffddc77f05bfd6988a`; 7-OH source MOL SHA `150ccd331963beab2481ad47c36e1e171db6bdd37e4d50746a3d6b4b5be60bcb` and approved source/claim/story identity unchanged.
- Narrow research-only edit to `lane3/scene4_model_fit_research.py`: image fit box changed from `(507,670,997,958)` to `(507,650,997,932)`, with **separate lower-tail erase region** `(507,650,997,960)`. This deletes the leftover molecular source pixels up to, **not including**, the original source disclosure glyph band y≥960. The 3D model only appears at **frame 555**, not before the narration word `computed`.
- Same-frame physically archived 3D source pixels are scaled preserving aspect ratio; no pose invention, receptor-binding effect, clinical fact change, narration generation, text edit or retiming. The exact original old footer and other scene labels are retained as decoded source pixels before re-encoding.
- One additional positive/adversarial test `test_truncated_model_fragments_erased_but_footer_glyph_pixels_untouched` injects a bright old-model tail at y945–959 and separate artificial footer ink at y964–981, confirms the former is erased without changing any native row y≥960, and checks pre-`computed` onset bytes unchanged. Existing ROI tests now protect the full erase region.

## Actual H.264/AAC result (independent local physical replay, **not** GitHub CI media)

| Evidence | Actual result |
|---|---|
| New silent Scene4 clip SHA256 | `92a3c5b9df05d577abff2d4422a63fd0b61d768968cc30484012389317574f89` |
| **New complete actual film SHA256** | `3c4e91b37958f1e86b6a04486933bbfc719bf6a196203711d6421eca58b70d31` |
| Codec/grid | H264 + original AAC, 1080 × 1920, 30/1 fps, **1031/1031** frames |
| Physical best-effort PTS grid | Worst delta **0.0000003333 s** |
| Original/new AAC ADTS SHA256 | Same `f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98` |
| Actual AAC packet timestamps | All **807/807** original and new `pts_time`, `dts_time`, `duration_time` identical |
| Outside edited Scene4 (498–701) | **827/827** actual decoded frames; 96×170 grayscale mean MAE **0.010831/255**, worst **0.024142/255** (lossy re-encode is NOT byte-identical) |
| Frame 630 ghost-band diagnostic | Bright fragments **391 → 0** in x565–950,y944–959; a negative pixel screen, not calibrated creative judgment |
| Frame 630 original footer ink diagnostic | High-gray ink pixels **1092 → 1079** after lossy H264 re-encode (approximately 1.2% difference) |

The actual first FFmpeg remux attempt showed a noncanonical average frame-rate header `3093/103` despite valid PTS and was **REJECTED**, not released. Re-encoding with explicit `-fps_mode cfr -r 30 -frames:v 1031 -video_track_timescale 15360` produced the verified exact film above with both `avg_frame_rate=30/1` and `r_frame_rate=30/1`. All measurements refer only to the **second, correct** output.

The local replay receipt is `scene4_v2b_actual_verification_receipt.json`; updated archival test script is `verify_scene4_v2_media.py`. For user review, the fully verified owner-chat package `EvidenceMotion_Lane3_Scene4_CleanPanel_Actual_Research_20261017.zip` (9,966,232 bytes, ZIP SHA256 `28dfa2a793db546e6e39329d1278cad1214b931d6c6b6f929e3754e2242ecb2b`) contains **14 entries, 12 manifest-bound actual files SHA-checked / every ZIP member CRC-passed**: before/after movies, source/archived movie, WAV, molecule/story, actual scene, JSON receipt, reproducible source/test and phone-sized contact image. **This ZIP is delivered only in the owner's conversation, not GitHub Actions or main.** Receiver must independently fetch+recheck the actual bytes.

**Remaining holds:** Human creative/on-phone experience, phonetic ear audition, science/editorial and accurate decoded text/OCR still require independent reviewers on new exact SHA; matched shot boundaries may be intentional. No automatic scoring/approval, D/R/A admission, deployment/publish, controller merge, new milestone or atomic-card count. First excellent render remains **0/1**, consecutive excellent first renders **0/5**; `mayPublish=false`.
