# SR-15099 EvidenceMotion — V5 research checkpoint (2026-10-13)

**STATUS: REVIEW ONLY. NOT a finished or published video; NOT V_VERIFIED; NOT an EvidenceMotion R-version upgrade.** The version freeze and high-end-first-render gate remain unchanged.

## New delivered assets
- Native 1080×1920, 30fps **11-second silent** two-assay teaching sequence (2020 hot-plate vs 2021 warm-water tail-immersion), plus original Python renderer, 6-frame contact sheet, fully decoded 330-frame QA and SHA-256 receipt. These are conversation download artifacts, **not committed repo binaries**. Visuals are qualitative schematics, not experimental footage or measurements.
- Nine-beat scientific scene contract and seven local Node regression tests. **7/7 passed** locally; this is a local research result, *not* green GitHub CI and *not* proof of visual excellence.
- The 2020 paper reports morphine sensitivity returned in **both** SR-17018-substituted and vehicle-substituted mice in hot-plate testing after three days; their withdrawal experience differed. The 2021 study reports **no reversal** on SR-17018 substitution in a **different** warm-water tail-immersion assay. SR-15099 is not the tested drug in either tolerance study.

## Original source references
- Grim et al., 2020, PMID [31443104](https://pubmed.ncbi.nlm.nih.gov/31443104/).
- Pantouli et al., 2021, PMID [33345829](https://pubmed.ncbi.nlm.nih.gov/33345829/).
- Schmid et al., 2017, PMID [29149605](https://pubmed.ncbi.nlm.nih.gov/29149605/).

## Original house voice recovery discovered
The exact native model and voicebank already live in the project's permanent GitHub release `ths-kokoro-onnx-am-michael-int8-v1`. Source-of-truth is `docs/voice-model-vault.md`; recover via `gh release download ...` and verify with `scripts/distribution/voice-vault.py verify`. Expected SHA-256:
- Model `kokoro-v1.0.int8.onnx`: `ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c`.
- Voicebank `voices-v1.0.bin`: `bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d`.

These binaries **cannot be downloaded through the current connector/runtime**. No house narration WAV was created; the connected hosted-TTS account had no credits and was not used. **Do not substitute a different robot narrator.**

## Creative verdict
**HOLD**: the new apparatus sequence is clear but looks more like schematic vector motion than cinematic art; quantitative proxy 46.2% adjacent hero-ROI frames had near-zero change (mean gray delta under 1), and that proxy cannot award or revoke human craft acceptance. Do not use it as a scored flagship render.

## Mandatory next sequence
Restore house voice → audition SR pronunciations and pacing → synthesize original WAV → derive genuine word alignment → direct voice-timed visual scenes → native final render → science/craft/phone reviews → separate owner approval to release. No fixed-time silent animatic is permitted to masquerade as a voice-first release. The narrated script is ~419 words; the existing 5–60s short release envelope is **not** silently bypassed—choose a supported long-form route or a distinct short-form cut with full source review.

Research assets are provided in the conversation V5 ZIP. Preserve the main production branch and R-version freeze.