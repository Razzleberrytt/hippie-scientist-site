# R8.04 local voice runtime

THS Voice Engine 0.56 uses a local open-source speech path. Descript, ElevenLabs, hosted TTS APIs, account-bound credits, and operating-system fallback voices are not part of the canonical path.

## Runtime

The baseline runtime is Kokoro-82M through the open `kokoro` Python package. It runs on the machine performing production. The first run may fetch the open model weights into the machine's model cache; no hosted synthesis API, subscription, API key, or metered generation credit is used.

Prerequisites:

- Python 3.10–3.12
- `espeak-ng`
- FFmpeg
- packages in `scripts/distribution/requirements-local-voice.txt`

Example setup:

```bash
python -m venv .venv-voice
source .venv-voice/bin/activate
python -m pip install -r scripts/distribution/requirements-local-voice.txt
# Debian/Ubuntu:
sudo apt-get install -y espeak-ng ffmpeg
```

Windows can install `espeak-ng` locally and point `FFMPEG_PATH` at a local FFmpeg executable. No global Python package install is required when a virtual environment is used.

## Preferred operator path

Use the repo-owned R8.04 commands rather than invoking provider tools or remembering the individual build steps:

```bash
npm run social:local:prepare
```

For a short-video selection, this builds the governed distribution package and bounded pilot, generates the exact local Kokoro narration, writes `artifacts/distribution/local-production-state.json`, and **stops at voice QA**. Listen to the generated `narration.wav`; do not approve a robotic take.

After the exact WAV passes Natural Presence and pronunciation review:

```bash
npm run social:local:finalize -- \\
  --reviewer perceptual-qa \\
  --natural-presence pass \\
  --pronunciation pass
```

Finalize renders the audible MP4, re-validates provenance and voice receipts, and writes a self-contained manual-upload packet under `artifacts/distribution/manual-upload/<research-object>/<bundle>/`. The packet contains the exact media, `caption.txt`, `UPLOAD.txt`, and a hash-bound `release-manifest.json`. No scheduler or premium editor is required.

Use `npm run social:local:status` to inspect the current local production state.

## Exact production sequence

After a governed vertical-video package exists:

```bash
python scripts/distribution/render-local-narration.py \
  --package-dir artifacts/distribution/pilots/<research-object-id> \
  --voice am_michael
```

This creates `narration.wav` and `narration.wav.receipt.json`. It does **not** mark Natural Presence as passed.

Listen to the exact WAV at normal playback speed. Only after the voice is genuinely acceptable:

```bash
node scripts/distribution/approve-local-narration.mjs \
  --package-dir artifacts/distribution/pilots/<research-object-id> \
  --reviewer perceptual-qa \
  --natural-presence pass \
  --pronunciation pass \
  --notes "Conversational cadence; qualifiers audible; no robotic phrase endings."
```

Then the governed MP4 renderer may run. It binds the narration WAV and voice-QA receipt into the render identity and muxes AAC audio into the final MP4. Publication staging refuses silent video, stale narration, hosted-credit voice provenance, or missing Natural Presence/pronunciation approval.

## Failure rule

If the local voice sounds robotic, **do not approve it**. Re-author the spoken line, regenerate locally, change an approved local model/voice, or use an authorized human house-voice recording. The system is allowed to stop; it is not allowed to switch to a paid provider or ship bad narration.
