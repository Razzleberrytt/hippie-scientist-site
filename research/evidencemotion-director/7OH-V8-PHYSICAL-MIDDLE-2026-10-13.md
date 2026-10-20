# EvidenceMotion — 7-OH V8 physical-middle experiment (2026-10-13)

**Status: RESEARCH ONLY, CRAFT HOLD.** No release, no production import or R-version, no publication, no automatic CI/render job, no GPU upgrade or laptop requirement. Owner phone-first workflow unchanged.

## Why V8 was attempted
V7.2 delivered a compelling source-linked oxygen pullback in the opening but kept most of its later seven narration beats nearly static. The next correction was **not** more random particle movement, false chemical interactions, or new generative video models. We prepared five new CPU-rendered native VTK shots from the **same pinned RDKit 7-hydroxymitragynine graph**:

1. **oxygen** — a motivated source-anchored dolly toward the chemically real hydroxyl oxygen;
2. **structure3d** — a lateral physical-camera tracking view of the verified atom/bond geometry;
3. **volume** — a different real VTK van der Waals space-filling representation, communicating occupied molecular volume rather than bond connectivity;
4. **volume_back** — a pullback from the space-filling silhouette;
5. **whole** — a single restrained orbit to preserve full-structure context.

All five use identical RDKit atom identity, stereochemical graph, and an ETKDG/MMFF **computed** conformer. A cut between alternate scientific visual representations is **not** a chemical transformation, experimental microscopy, drug effects or receptor docking. The AI-illustrated botanical backdrop remains explicitly illustrative, not a plant-content assay.

## Exact edited timeline (existing WAV controls all beat edges)
- **0–3.512s:** V7.2 opening oxygen-to-whole-camera shot unchanged.
- **3.512–6.530s:** new physical hydroxyl dolly; **6.530–9.4607s:** existing full 2D chemically verified diagram.
- **9.4607–12.200s:** existing 2D chemistry; **12.200–15.2627s:** new physically tracked entire 3D structure.
- **15.2627–18.480s:** true bond-model lateral shot; **18.480–22.0433s:** space-filling physical 3D molecular model.
- **22.0433–24.340s:** space-filling pullback; **24.340–26.6353s:** full molecule orbit.
- **26.6353–29.8353s:** readable PubChem source hold unchanged.
- **29.8353–33.1353s:** original ending shot unchanged.

Internal picture cuts above are **creative decisions inside exactly measured Kokoro narration beats**, not words aligned by Montréal Forced Aligner. No word/phoneme-specific synchronization is claimed.

## Verified local artifacts
- Original house voice WAV SHA-256: `434fca399f1ab74a12a5beb3da44373fe1117696b045ffd8026179df7bf14b34` — untouched from original pinned Kokoro ONNX `am_michael`.
- V8 research preview MP4 SHA-256: `8467c8a9f50f2989b6b47ce950fbc68eeca5574ae66ec5983bd3b22b107b555e`.
- H.264 Constrained Baseline 540×960 @ 15fps, 497/497 frames independently decoded, AAC-LC 1555 packets 33.135s, full FFmpeg decode succeeded.
- AAC elementary ADTS SHA: `2cdaa9fdfc3bb6187fae771cfa060dc5c943232cdfd3acdbbbff4851dd126ef6`; **identical to V7.2** after a lossless remux. Initial one-step mux clipped the last AAC packet (1554 rather than 1555); that transient output was **rejected**, and a second mux took ALL AAC from original V7.2 unmodified.
- 212 locally rendered native PNG frames across five source-specific physical camera treatments, not model-generated chemical diagrams.
- A separate conversation artifact `EvidenceMotion_7OH_V8_research_bundle.zip` includes the locally executable research compositor, deterministic VTK source script, original WAV, base MP4, all required PNGs, manifests, latest video and contact sheet. **These binaries are not in the PR or GitHub.** Exact repo-side source reproduction cannot be claimed from documents alone.
- Research compositor uses correct original WAV hash, correct RDKit InChIKey and molecular formula assertions, and a post-encode full video decode. All snapshots and bitstream comparisons performed locally against real files.

## Comparative negative-filter (same algorithm and crop for both encoded videos)
Subject ROI: x55–485, y215–645. Grayscale resized to 96×106; absolute 8-bit pixel difference >=9 counts changed; frame pairs with <2% changed pixels are near-static. These are **pixel diagnostics**, not any proxy for semantic worth, excitement, correctly spaced edits or cinematic taste.

| Metric | V7.2 original | V8 physical-middle |
| --- | ---: | ---: |
| Frame count | 497 | 497 |
| Median changed-pixel fraction | 0.00398 | 0.02869 |
| Whole-cut near-static frame share | 75.20% | **43.35%** |
| Middle-section near-static share | 84.44% | **38.90%** |
| Longest near-static stretch | 3.600 sec | **3.133 sec** |

These improvements are real in the chosen metric, but more camera movement is not necessarily more engaging; the ultimate criterion is whether a cold viewer understands, feels interest, and isn't watching cheap CG. **Craft review is pending, not granted.**

## Before canonical system adoption
- Compare V8 on an actual iPhone at normal speed against the owner's reference shelf.
- Human-audition the exact WAV for `7-OH`, `hydroxyl` and `mitragynine`; original model SHA and sound-signal tests do not establish pronunciation/naturalness.
- Run qualified scientific/editorial claim review, and independent V craft review only if actually performed.
- Verify exact owner-accepted audio and real MFA word timings before claiming word-level captions/reveals.
- Produce only then a **native 1080×1920/30fps final**, complete decoded A/V/phone and master QA.
- After one accepted excellent first-final-render master, freeze remains active until **five more consecutive excellent first renders**. Approved visual vocabulary/negative regressions should then be extracted into **general-purpose** EvidenceMotion without hard-coding kratom/7-OH chemistry.
- No blanket auto-merge/auto-publish authority follows from a positive pixel-motion score.

**No milestones completed.** Research remains parked in draft PR #6736 pending exact-head review and full checks.
