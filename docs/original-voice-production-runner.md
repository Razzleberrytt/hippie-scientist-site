# Original Kokoro narration: repeatable production route

## Diagnosis
ChatGPT's temporary execution containers are not canonical THS production runners.
They may have Python 3.13, no internet access, no ONNX Runtime, and no espeak-ng.
A recovered **model** is not an installed **runtime**. Never silently replace the
approved narrator with system TTS, Flite, a hosted speaker, or a silent video.

## Standard voice runner
Use the existing **THS Kokoro required voice render** GitHub Actions workflow.
It pins Python 3.11, installs `scripts/distribution/requirements-local-voice.txt`,
downloads the immutable release `ths-kokoro-onnx-am-michael-int8-v1`, checks
the model and voicebank hashes, and now runs
`scripts/distribution/voice-runtime-readiness.py` before synthesis.

### Test the runtime before trusting production
On GitHub, select Actions → **THS Kokoro required voice render** →
**Run workflow** on main → `runtime_canary=true`. Or, with an authorized CLI:

```sh
gh workflow run kokoro-voice-production.yml --repo Razzleberrytt/hippie-scientist-site --ref main -f runtime_canary=true
```

The `ths-kokoro-runtime-canary` artifact must contain:
- `voice-runtime-readiness.json` with `status=PASS`
- `original-narrator-canary.wav` with actual audible PCM
- `original-narrator-canary.json` with exact WAV SHA-256 and original engine identity

Canary success establishes runtime availability, **not** video QA, human
pronunciation approval, actual captions, or a publishable film.

### Real per-video narration
1. Source-check the creative brief and pass `assertR805CreativeBrief`.
2. Use an isolated `voice/<video-job-id>` branch created from current main.
   Put the approved brief at `scripts/distribution/voice-briefs/active.json`
   on that isolated branch. Push only that job file; **do not modify main,
   development lanes, or another video job's brief**.
3. The existing `voice/**` push trigger installs the exact runtime on a fresh
   GitHub Actions Python 3.11 runner. `runtime_canary` does not affect pushes.
4. Retrieve the `ths-kokoro-narration` artifact only after the job succeeds.
   Verify `voice-runtime-readiness.json`, narration and timeline receipts and
   the exact WAV SHA-256. Listen to the emitted WAV, correct pronunciation if
   necessary, and regenerate timings after any narration change.
5. Feed that exact approved WAV to the authentic EvidenceMotion audio-first
   visual renderer. Align captions acoustically; run full exact-master audio,
   video, scientific, and mobile review separately. Never assume a green
   narration workflow means `READY_TO_UPLOAD`.

## Failure handling / hard boundaries
- A local `voice-runtime-readiness.py --vault <path>` HOLD means use the
  GitHub runner; do not spend the video deadline debugging an offline container.
- A GitHub runner download/egress limit, failed install, bad archive hash,
  near-silent canary or failed production run means **HOLD**, not a substitute
  narrator or a forced merge. Record the exact error and retry only after the
  underlying dependency has genuinely changed.
- The workflow is read-only with respect to repository content. It does not
  publish TikToks, create development PRs or increment the 1,590-card ledger.
- A first successful canary on a fresh GitHub runner **and** at least one
  successful new voice-job branch are required before calling the recurring
  voice-runtime problem solved.
