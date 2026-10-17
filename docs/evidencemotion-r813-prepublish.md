# EvidenceMotion R8.13 — exact-master prepublish quality gate

**Status:** scoped implementation candidate, not an encoded V3 release or permission to publish. Follow docs/CURRENT_SPRINT.md admission and serial merge-controller rules. Maintains R8.12 and earlier science, source, consent and voice controls. No new metered services or TikTok publishing access.

## What this adds

A single offline inspect-and-export command binds the *actual* MP4 to its current parent manifest, R8.10 original offline-MFA word receipt, original governed SRT, R8.11 experiment / exactly three SHA-verified silent-watermarked hook drafts, and R8.12 independently measured final AAC loudness. It calls FFprobe on the actual H.264/AAC streams, checks 1080×1920 and duration, and validates the original pinned Kokoro v1 INT8 **am_michael** model and voicebank bytes against the two SHA-256 values used by the existing voice-vault module. No model download, voice substitution, re-synthesis, premium API, or silent fallback is permitted.

It exports **aligned-captions.srt**, a **first-frame cover-frame.png**, three sampled visual-inspection frames, and **r813-prepublish-report.json** to a review folder. Sampled frames are *review material*, not a claim that screen text is legible. A matching exact-master human approval record can be read, but is never auto-generated or inferred from a test.

## Usage

First generate a package and successfully render an R8.12-enabled exact final MP4 using the existing pipeline and approved R8.10 scientific/caption/voice process. Create the three silent R8.11 hook draft MP4s with the existing hook operation, then restore the exact voice vault as described in [voice-model-vault.md](voice-model-vault.md).

Run:

~~~sh
node scripts/distribution/r813-prepublish-qa.mjs \
  --package /path/to/package \
  --mp4 /path/to/final-master.mp4 \
  --vault .cache/ths-voice-vault
~~~

Optional flags: --review /path/to/independent-human-review.json, --out /path/to/review-directory, --ffmpeg /path/to/local-ffmpeg, --ffprobe /path/to/local-ffprobe. Human review fields are videoSha256, status=approved, reviewerId, and each of science, perceptualMotion, mobileSafeArea, captionsAndPacing, voiceAuditory, sourceVisibility set to pass. The command **never publishes**. Any missing hash, model, hook, exact alignment, audio, export or provenance fails closed and exits nonzero.

## What is still genuinely open

- The current upstream narration receipt does **not** prove which original ONNX model and voicebank produced the WAV. The new gate verifies that the persistent originals exist and that the narration identifies as Kokoro am_michael, but marks the synthesis-binary linkage **NOT_YET_AVAILABLE** rather than inventing a verified result. Require a signed renderer-to-model hash receipt before changing that label.
- Static SVG checks and four rendered frame grabs do **not** replace actual mobile/perceptual review across the whole video. Motion-density scoring and an owner-approved golden-reference image review are next separate tickets.
- External scientific/caption/auditory approval, actual V3 video render, the 9:16 final upload, true audience metrics, and cross-platform distribution are **not demonstrated** by unit tests or this code.
- A true source-verified standalone social CTA, real human word-aligned captions, and correct voice/music balance must all be checked on the exact master; do not claim human-reviewed or V_VERIFIED from an AI-only code check.

This is the first focused R8.13 QA slice (priority items 1 and 5 of docs/evidencemotion-r813-triage.md), plus source/voice/audio cross-checks. Scope deliberately excludes parallel R8.13 SEO, music, crop variants, automatic publication, scientific claim rewriting and measurement experiments.
