# THS local voice runtime — R8.04 sovereignty + R8.05 voice-first timing

THS Voice Engine 0.56 remains a local open-source speech path. Descript, ElevenLabs, hosted TTS APIs, account-bound credits, and operating-system fallback voices are not part of the canonical path.

R8.05 changes **when** narration is created: the exact local WAV now owns the visual timing.

## Runtime

The baseline runtime is Kokoro-82M through the open `kokoro` Python package. It runs on the production machine. The first run may fetch open model weights into the local cache; no hosted synthesis API, subscription, API key, or metered generation credit is used.

Prerequisites:

- Python 3.10–3.12
- `espeak-ng`
- FFmpeg
- packages in `scripts/distribution/requirements-local-voice.txt`

## R8.05 canonical sequence

### 1. Approve the creative brief before generating media

Place the governed work order at:

`<package-dir>/r805-creative-brief.json`

The brief must pass `scripts/distribution/r805-creative-gate.mjs`: cold-viewer interest, one mental job, payoff before methodology, cognitive-load limits, semantic beat ownership, and the one-rebuild rescue rule.

### 2. Generate narration first, at natural speed

```bash
python scripts/distribution/render-local-narration.py \
  --package-dir artifacts/distribution/pilots/<research-object-id> \
  --brief artifacts/distribution/pilots/<research-object-id>/r805-creative-brief.json \
  --voice am_michael
```

R8.05 creates:

- `narration.wav`
- `narration.wav.receipt.json`
- `semantic-beat-timeline.json`

The semantic timeline is measured from the exact WAV. Spoken beats are **not** padded or crushed to hit 30 seconds. The complete runtime is the natural sum of spoken beats, authored pauses, and explicit silent holds such as the readable source scene.

### 3. Listen to and approve the exact WAV

```bash
node scripts/distribution/approve-local-narration.mjs \
  --package-dir artifacts/distribution/pilots/<research-object-id> \
  --reviewer perceptual-qa \
  --natural-presence pass \
  --pronunciation pass \
  --notes "Conversational cadence; qualifiers audible; no robotic phrase endings."
```

The R8.05 voice-QA receipt binds the exact WAV, creative brief, and semantic beat timeline.

If the voice sounds robotic or a qualifier lands badly, **do not approve it**. Re-author or regenerate locally.

### 4. Build visuals from the exact voice timeline

Only after steps 1–3 may `render-vertical-video-package.mjs` create visual scenes.

Every scene must reproduce the corresponding semantic beat identity and timing. Beat IDs, narration hashes, on-screen-text hashes, visual-purpose hashes, spoken-anchor hashes, visual-action hashes, cut reasons, and timing are carried into the governed visual package.

The visual renderer may not invent an independent timeline.

### 5. Encode the MP4 at the natural runtime

`render-vertical-video-mp4.mjs` reads the governed runtime from the voice-authored package and propagates it through FFmpeg, AAC audio, and the render receipt.

R8.05 has **no creative 30-second target**. The current governed short-video envelope is 5–60 seconds.

### 6. Watch the exact MP4 as one piece

Technical sync is not enough. Review the actual `short-video.mp4` at normal playback speed.

Only when it genuinely feels co-authored may the exact master be approved:

```bash
node scripts/distribution/approve-r805-master.mjs \
  --package-dir artifacts/distribution/pilots/<research-object-id> \
  --reviewer perceptual-qa \
  --whole-piece-cohesion pass \
  --narration-visual-sync pass \
  --internal-motion-sync pass \
  --cognitive-continuity pass \
  --hook-promise-delivery pass \
  --notes "Voice, visual reveals, cuts, and payoff read as one authored piece."
```

This writes `r805-master-qa.receipt.json`, bound to the exact MP4 hash, MP4 render receipt, parent manifest, creative brief, and semantic beat timeline.

### 7. Stage or manually upload

R8.05 publication staging fails closed without the exact-master QA receipt. Manual native upload remains the baseline transport.

## R8.04 legacy reproducibility

The old package-first exact-30-second narration mode remains available only for reproducing governed R8.04 artifacts. It is not the canonical path for new THS videos.

## Failure rule

Quality may fail closed. Dependencies may not fail open.

If local narration, semantic timing, visual cohesion, or the final master is weak, repair locally or retire/reframe the angle. Never silently switch to a paid provider, robotic system TTS, fixed-duration padding, or an unreviewed master.
