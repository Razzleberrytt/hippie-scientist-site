# 7-OH original-Kokoro visual treatment comparison — 2026-10-13

**Status: RESEARCH ONLY, CRAFT HOLD.** Original voice, scientific geometry, source attribution and the production freeze are unchanged. No new R-number, release/publish action, paid inference, laptop dependency or owner acceptance.

## Inputs pinned and independently confirmed in local environment
- Narration: original Kokoro ONNX `am_michael` WAV, SHA-256 `434fca399f1ab74a12a5beb3da44373fe1117696b045ffd8026179df7bf14b34`, 33.1353 seconds. No time stretch, re-synthesis or substituted narrator.
- 3D: fixed source 72-frame RDKit/VTK computed-conformer preview, SHA-256 `2feb490879e912e54165e42c3eb60cbdc915cde6eabcf05f8af48eeee5f44076`. Its structure is deterministic, not a measured conformation or docking.
- Background: **nonfactual illustrative botanical crop** PNG, SHA-256 `4516b902806630ba97941636fbe11a5db8859b8c19a5089adaedbde6d497090e`. Never claim it documents 7OH contents of any plant image.
- Molecular 2D: freshly drawn by RDKit from pinned isomeric source SMILES, checked InChIKey `RYENLSMHLCNXJT-CYXFISRXSA-N`, formula C23H30N2O5. The complete RDKit alpha-ink bbox is trimmed before aspect-ratio **contain** rendering, preventing accidental cropping of bonds and atoms.
- Beat cuts: seven exact R8.05 original-WAV beat boundaries; **not** falsely represented as word-level MFA alignment. Long narrated beats can contain additional editorial hard cuts, but the natural WAV duration remains authoritative.

## Research outputs actually rendered and decoded locally
All three contain 497 real decoded frames, 540×960, 15fps, 33.133333s H.264 Constrained Baseline, yuv420p + AAC LC, with the original WAV identity preserved.

| Candidate | MP4 SHA-256 | Difference from previous |
| --- | --- | --- |
| V4 alternate | `71f029c2488e287fd55d727ba37c6d6d71384aa3999bd812536f14ca319f1017` | More varied graph/model panels but headline-heavy slide composition |
| V5.2 hero-first / complete graph | `30bb2e26f346dfa2b8fd2494fe428ff30af5c68a345b296172b8a17cad6c2270` | Enlarged hero, compact headings, complete uncropped RDKit 2D graph, more photo-like background |
| V5.3 narrative hard cuts | `2b0567329d0f4bd773393f44c97cbd5f1c18511645a6c0c833db26fc8462db81` | In the relevant narration beats, cuts from true 3D OH site to source-verified 2D map, then from 2D graph to computed 3D pose; no fabricated bond morphs |

**Reproducibility proof:** A self-contained, argument-driven local V5.2 Python renderer was separately executed from explicitly supplied verified WAV, botanical PNG and 3D source video, reproducing V5.2 MP4 SHA **exactly** (`30bb...c2270`). That portable source and the preview MP4 are current-conversation artifacts. They are **not** checked into this GitHub PR; the repository does not contain the source artwork, WAV or source video bytes, and a GitHub build/CI reproduction is not yet claimed.

## Actual negative-filter measurements
Independent OpenCV decode of the central image ROI (x=70:460, y=190:640) at 96×110 grayscale; >=9/255 pixel difference counts as changed; less than 2% pixel change marks near-static frame. These are codec/ROI-dependent diagnostic heuristics, **not proof** of cinematic quality.

| Candidate | Median change fraction | Share of near-static pairs | Longest near-static interval |
| --- | --- | --- | --- |
| V4 | 0 | 70.36% | 3.133s |
| V5.2 | 0 | 64.52% | 5.733s |
| V5.3 | 0 | 62.50% | 5.733s |

All pass the strict >6-second contiguous static **kill** at this ROI, yet exhibit an obvious **moving-poster risk**. The two additional source-governed editorial cuts in V5.3 modestly improve temporal variation but do not cure flat cinematography, small type, modest physical material detail or lack of a dramatic hero transformation. Craft remains **HOLD**.

## Next research criterion
1. **Human audition:** owner listen to the original 7OH WAV on phone for exact pronunciation, cadence and emotional presence. Model identity is verified; this utterance's artistic quality is *not*.
2. **New 3D cinematography, not repainted panels:** source-preserving physical camera move/lighting and a stronger hero asset. Do not trade narrative semantic motion for flashing particles, arbitrary wipes or mere zoom.
3. Real independently verified word-level MFA timing before karaoke/subtitle claims or sub-beat scientific reveal sync; current captions are full-sentence **beat-aligned** only.
4. Compare any candidate at 1080×1920 pixel-density previz against 3–5 best niche references and review on iPhone. No first full-HD 30fps **final** until concept, voice and honest source depictions are accepted.
5. Every new research comparison remains inert and cannot be published by the automated pipeline.

**Milestone unchanged:** zero owner-accepted excellent first-render masters; five consecutive only after the first pass.
