# THS local voice runtime — R8.04 sovereignty + R8.05 voice-first timing

THS Voice Engine 0.56 remains a local open-source speech path. Descript, ElevenLabs, hosted TTS APIs, account-bound credits, and operating-system fallback voices are not part of the canonical path.

R8.05 changes **when** narration is created: the exact local WAV now owns the visual timing.

## Runtime

The current THS house voice is **Kokoro-82M INT8 through `kokoro-onnx==0.6.1`, voice `am_michael`**, the portable Voice Engine 0.44+ configuration. Its **exact** `kokoro-v1.0.int8.onnx` and `voices-v1.0.bin` assets are pinned by SHA-256 and restored from the project's permanent GitHub Release `ths-kokoro-onnx-am-michael-int8-v1`. A disposable machine's normal model cache is never the authoritative store. See `docs/voice-model-vault.md`. Earlier `kokoro` Torch documentation is historical, not the current narrator.

Prerequisites:

- Python 3.10–3.12
- `espeak-ng`
- FFmpeg
- packages in `scripts/distribution/requirements-local-voice.txt`
- verified `THS_VOICE_VAULT` pointing to the restored original ONNX model/voicebank and manifest (see `docs/voice-model-vault.md`)

## Scientific term pronunciation (spoken audio only)

The governed house narrator applies `scripts/distribution/voice-pronunciations.json`
through `voice_pronunciation.py` immediately before Kokoro synthesis. The
source script, scientific spelling, on-screen captions, article text and
word-alignment transcript **must not** be rewritten to phonetic approximations.

Initial entries (October 12, 2026):
- `kratom` → "craytum" (owner-selected English reading: KRAY-tum).
- `mitragynine` → **native Kokoro spelling** (`mitragynine`) after owner rejected
  syllable-split phonetic input. Target dictionary stress is mi-TRA-juh-neen,
  https://www.merriam-webster.com/dictionary/mitragynine. A new one-token alias
  must be auditioned before replacing native synthesis.

To add another term, append a unique, lowercase canonical term, a TTS-friendly
`spokenAs`, readable `reading`, and a credible `source` to the lexicon.
Never encode pronunciation guides with hyphens into `spokenAs`: these have
produced artificial syllable separation in the house voice. Whole-word natural
readings are preferred; audition candidates side-by-side. Override whole terms only; related compounds (such as
`7-hydroxymitragynine`) need their own verified entries rather than unsafe
substring edits. If the dictionary is corrupt or missing, synthesis stops.

Narration receipts include the lexicon SHA-256, version, and a
`humanAuditoryReview: required` marker. Text replacements are only a first
pass: produce a short pronunciation probe using the pinned `am_michael`
voice, **listen** to the exact rendered WAV, check stress and natural pacing,
and leave the audio unapproved until it sounds right. Any phonetic alias that
sounds stilted must be iterated before publication. Audio changes alter beat
timings; regenerate alignment, captions/timing receipts and the final MP4
from the corrected WAV. Do not rubber-stamp previously approved audio.

For R8.10 Montreal Forced Aligner, keep canonical words in the alignment
transcript and ensure its acoustic pronunciation dictionary reflects the
reviewed reading; do not pass the phonetic TTS alias as visible text. If
word alignment cannot be validated, block the final release.

Run lexical contract tests with:

```bash
python -m unittest discover -s scripts/distribution/tests -p 'test_voice_pronunciation.py' -v
```

## R8.05 canonical sequence

### 1. Approve the creative brief before generating media

Place the governed work order at:

`<package-dir>/r805-creative-brief.json`

The brief must pass `scripts/distribution/r805-creative-gate.mjs`: cold-viewer interest, one mental job, payoff before methodology, cognitive-load limits, semantic beat ownership, and the one-rebuild rescue rule.

### 2. Restore and verify the saved voice, then synthesize at natural speed

The model and voicebank are never assumed to survive across runners or local workspaces. From the repo root, with `gh` authenticated and `scripts/distribution/requirements-local-voice.txt` installed, restore the project-owned archive first:

```bash
export THS_VOICE_VAULT="$PWD/.cache/ths-voice-vault"
mkdir -p "$THS_VOICE_VAULT"
gh release download ths-kokoro-onnx-am-michael-int8-v1 \
  --repo Razzleberrytt/hippie-scientist-site \
  --dir "$THS_VOICE_VAULT"
python scripts/distribution/voice-vault.py verify "$THS_VOICE_VAULT"
```

If the release is unavailable or any checksum fails, **STOP**; do not run a placeholder narrator. The canonical voice workflow does the same restore automatically in GitHub Actions.

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


## R8.08+ required Kokoro recovery path

The V3 October 11 robot reference narration came from FFmpeg Flite outside the governed renderer. Such a cut is never a released THS master. To recover the approved Voice Engine 0.44+ house voice, use the permanent ONNX vault, not a different model that happens to share the name `am_michael`.

1. `main` must contain `.github/workflows/voice-model-vault.yml`; the workflow must report SUCCESS after GitHub Release readback and audible offline synthesis. If not, block narration publication.
2. Start from `main` and commit the approved R8.05 beat brief at `scripts/distribution/voice-briefs/active.json` on a `voice/**` branch.
3. `.github/workflows/kokoro-voice-production.yml` downloads **exact** model assets from the permanent GitHub Release, validates model and voicebank SHA-256 and synthesizes using `kokoro-onnx==0.6.1`.
4. Retrieve `ths-kokoro-narration`, verify SHA-256, build visuals against the WAV-authored timeline and listen/watch the encoded full video.
5. Missing archive, invalid hash, inaudible signal, synthetic-sounding voice, or failing natural-presence QA means **FAIL CLOSED**. No Flite, espeak narrator, paid voice provider, unrelated Torch weights, or other TTS substitution is authorized.

The 30-day narration WAV artifact is a derived output; the saved GitHub Release contains the durable model binary and voicebank. GitHub Actions minutes are ordinary build usage, not TTS metering.
