# 7-OH caption-safe technical finish (2026-10-13)

**Research-only technical review; DO NOT PUBLISH.** This record supersedes *only the prior V3 delivery candidate for technical testing*, not the source V3 ZIP/history. No EvidenceMotion system version changed.

## Why a new review binary was necessary

Exact V3 caption-side-margin measurement against the rendered Inter SemiBold 48px ASS typography found **2 of 6 spoken subtitle blocks** spilling beyond the conservative mobile content region. The first attempted safe-area remux also unexpectedly reduced narrator RMS by ~3.0 dB because ordinary mono→stereo upmix attenuated the source. Both bugs were rejected prior to packaging.

The corrected `captions_safe.ass` re-wraps only the two affected subtitle blocks, preserving normalized word text and all start/end times. Explicit full-amplitude `pan=stereo|c0=c0|c1=c0` duplicates the locked Kokoro audio without changing speech speed or voice model.

## Exact new immutable media

- **Current technical candidate:** `EvidenceMotion_7OH_1080p_SubtitlesSafe_TECHNICAL_REVIEW.mp4`, SHA-256 **`d2aff53b7a18c32eb6c4ee9d60fd3bb216593d897b730f5ebf58086dd2a71e51`**.
- **Playback fallback:** `EvidenceMotion_7OH_720p_SubtitlesSafe_FALLBACK.mp4`, SHA-256 **`62502fd25725500fa4830e68f10917fdbf6a8f44cd30d7b9df306797f28934b4`** (a 720p derivative, not a native first-render substitute).
- **Source V3 reference stays unchanged:** SHA-256 `9259b639d607baf131c26cd8d0f09935e03cbd7c9107f8e6d8d4747565ad9c22`.
- **Reproducibility ZIP** `EvidenceMotion_7OH_SubtitlesSafe_Technical_Package.zip`, SHA-256 **`a5b3209ca0b9ca429d5f741491adb4c616c70ae364629d7d306c135437ddb635`**, archived as a conversation file, **not stored in Git**.

Both outputs were reconstructed from the original pinned **native silent 1080p frame source**, revised ASS and exact mastered Kokoro source WAV. Actual source is the existing deterministic RDKit/VTK research renderer; no molecular source geometry or narration wording changed.

## Independent local test results

1. Full FFmpeg decode of both MP4s **PASS**, with 1,031/1,031 H.264 Constrained Baseline frames, exact portrait dimensions (1080×1920 / 720×1280), constant 30fps presentation timestamp grid, and AAC-LC 48kHz two-channel audio.
2. All six actual ASS subtitle boxes fit conservative **1080p pixel coordinates**: left edge >=105, right edge <=900, top >=300, bottom <=1500. The rendered text bounds use pinned `Inter-SemiBold.otf` at 48px with a border allowance. Each caption preserves exactly the source narration text after punctuation normalization, including 7-hydroxymitragynine.
3. New 1080p decoded AAC versus older V3 source AAC: **signed waveform correlation 0.9998719**, **zero measured sample offset**, RMS amplitude ratio **0.998897**. Repaired 3 dB attenuation; this is technical signal identity only, not a human ear-check.
4. `MANIFEST.json` SHA-bound all source and output files. The package validator returned **PASS_RESEARCH_ONLY**; intentionally appending corrupt bytes to the ASS triggered `SHA_MISMATCH:captions_safe.ass` and a HOLD, and restoring original bytes then restored PASS. It refuses human/clinical/craft/release approval unconditionally.
5. The 3.2s intentionally silent PubChem CID 44301524 citation hold is unchanged. The original content script, chemical formulas, model-computed warnings and V3 scene order remain pinned. The picture is genuinely 1080p sourced, with no upscaled-source promotion.

## Scope / non-completion

This closes the **complete encoded final-media engineering and caption placement** checklist item only, because its technical tests use actual media. It does **not** close the separate full TikTok/Shorts interaction-UI audit, genuine MFA acoustic word alignment, independent chemistry/editorial signoff, direct iPhone playback, owner voice audition, reference-shelf craft acceptance, canonical director adoption or owner publication authorization. Do not label the film upload-ready or V_VERIFIED.
