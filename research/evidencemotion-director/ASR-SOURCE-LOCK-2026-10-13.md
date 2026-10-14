# EvidenceMotion: original-WAV autonomous speech script review (research pilot)

**Owner policy updated October 13, 2026:** the October 12 EvidenceMotion R-version/capability freeze is **lifted**. Continue normal bounded, reviewable improvements. The first genuinely excellent master and the five-consecutive-first-render quality challenge remain quality targets, **not blockers to unrelated development/version increments**. Existing science, source trust, media integrity, protected CI, cost, licensing and authorized-publication safeguards remain mandatory. No inferred posting permission.

## Working bounded slice

`autonomous_script_asr_research.py` uses the SHA-locked original V12/V13 7-OH WAV, **34.347333s 24k PCM mono**, SHA-256 `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`. The *revised* script was recovered from the actual original-V12/V13 creative brief in the previously completed native 1080 review bundle (brief SHA `db95adc5dce3eb6e19c81719fec9222e3511856e85dbf862351ce231c8661ea8`), **not** the obsolete R8.05 "position seven" draft on `voice/7oh-director-review-20261013`.

Six spoken beats in order:

1. "What makes seven O H different from mitragynine?"
2. "This hydroxyl group is a structural difference between seven-hydroxymitragynine and mitragynine."
3. "This molecular structure is built from a verified chemical record, atom by atom."
4. "But the three dimensional pose is computed. It is not footage of a molecule binding to a receptor."
5. "So the picture explains its structure, not what its effects feel like."
6. "That's the kind of detail worth looking closer at."

A separate 3.2-second PubChem source reading hold is **intentionally silent**. Do not label that silence as narration dropout or invent transcript words for it.

The exact-head PR workflow has two separate checks:
- Fast **negative script/word-timestamp comparator** test, with deliberately missing "hydroxyl" and "mitragynine", hallucinated clinical statement, bad timestamps and sham speech "approval" fixtures. These tests do not pretend to run an ASR model.
- **Actual CPU transcription test:** uses GitHub's same-repo previously successful narration artifact from Actions run `38417454106`, `ths-kokoro-narration`, verifies WAV SHA before model download, then installs pinned open-source `faster-whisper` / CTranslate2 CPU int8, and downloads **exactly the previously executed** Systran tiny.en commit `0d3d19a32d3338f10357c0889762bd8d64bbdeba`, verifying `model.bin` SHA-256 `1a5afae06a4db91c975c9a9d78be5cc110ee4ea022ad57d55492e4550e936b2a` before inference. The model consumes an FFmpeg-decoded 16k float32 mono waveform, avoiding an incompatible PyAV 19 decoder API, with its resampled bytes hash stored in the receipt. Receipt records model revision/bytes, actual recognized word intervals and confidence, script agreement, suspect chemical words, and unexpectedly introduced medical claims. CPU threads capped at 2; single manual/PR bounded run, not a scheduler or paid model API. It will fail loudly if the old Actions WAV artifact expires, the model cannot download, identity drifts, or no real ASR words are produced. GitHub Actions minutes and actual long-term cost remain unknown.

## Responsible output decisions

- `AUTO_REVISE_SCRIPT_MISMATCH`: detected differences/missing source terms or unexpected medical assertion. **Needs a repair and fresh evidence**, though ASR confusion is not itself proof the voice is phonetically wrong.
- `SCRIPT_MATCH_CANDIDATE_ONLY`: the recognized word sequence is sufficiently close for **further review**. Does *not* pass phonetic stress, technical pronunciation, cadence, speech naturalness, health-claim accuracy or craft.
- Missing actual ASR model run, unpinned artifact, or altered brief/WAV: HOLD. Never fabricate a transcript or silently substitute a regenerated voice.
- Whisper word start/end times are estimated and **not independently validated forced alignment/MFA**. They may not drive certified word-level animation until a separate alignment and timing-accuracy check passes.
- No new clinical effect claims, no content auto-publication and no creative first-final-render PASS based on a transcription receipt.

## Checklist governance

The canonical **24/46** count remains unchanged by implementing an ASR experiment. The following existing open conditions have not yet been completed: genuine validated word-level alignment for final cue timings; automatic expert-grade scientific review of every implied claim; dependable phonetic-pronunciation verification; genuine premium visual/media assessment; golden master and five diverse excellent final outputs. The owner's permission to iterate versions is now unconditionally recorded, but this permission **does not turn a production-promotion quality criterion into a free checkbox**.

The voice-reviewed source and evidence receipts can later join the existing autonomous visual critic and audio signal auditor behind the currently nonpublishing arbiter, once calibration against actual videos and negative counterexamples is established. The old release protections remain in force.

## Observed, actually executed remote pilot (GitHub run 38504866667)

Original source and tiny.en model execution passed end-to-end after fixing the initial PyAV keyword compatibility and missing FFmpeg provision. **Actual transcript agreement 0.93151** on 73 recognized vs 73 expected tokens, with the research decision `AUTO_REVISE_SCRIPT_MISMATCH` because scientific names were uncertain. Tiny.en recognized **“Mitrogenine” instead of “mitragynine,” “7 hydroxometrogenine” instead of “seven-hydroxymitragynine,” and “poles” instead of “pose.”** Their word intervals are present in uploaded artifact `evidencemotion-source-locked-7oh-asr-word-intervals` (artifact 11867296826). This is not a finding that the narrator definitely mispronounced these words: small ASR models commonly transcribe unfamiliar terminology incorrectly. It is actionable automatic review, NOT a verified phonetic error and NOT word-level MFA. The actual raw waveform input has SHA `ccfd0e29167a548fbadcb74fff9e1f88f6774d4f86c5773f6fbcf378cf6682df`.

No single-model script recognition can be promoted to excellent voice/correctness. New model/lexicon decisions must be compared on the same actual WAV with an independent calibrated acoustic/phonetic method and disclose mismatches. This pilot earns no automatic 46-item checkpoint.
