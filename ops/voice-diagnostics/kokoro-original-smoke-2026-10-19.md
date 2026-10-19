# Original Kokoro narrator — diagnostic voice-branch replay

Date: 2026-10-19. Purpose: deliberately trigger the **existing** `kokoro-voice-production.yml` `push: voice/**` workflow on the prior reviewed 7-OH nomenclature-safe narration brief; no new synthesis logic, model, voice, or production-publication authority is introduced.

- Exact brief for this replay: `scripts/distribution/voice-briefs/active.json` on `voice/7oh-locant-safe-review-20261013` (existing asset, unchanged).
- Existing workflow should restore the SHA-256-pinned Kokoro INT8 ONNX weights and `am_michael` voicebank from the immutable THS Release; use pinned local Python/ONNX dependencies; reject unknown / silent / incorrect WAV.
- Record any actual job ID, immutable branch commit and conclusion before claiming anything passed. A successful run proves only that GitHub's runner backend can execute that archived model for this exact brief. It does **not** prove local CPU compatibility, phoneme/acoustic correctness, film quality, human review, new 7-OH legal accuracy or publication.
- This diagnostic note is not a PR or merge approval. Research-only; `mayPublish=false` and first excellent master remains 0/1.
