# THS Original Narrator — Permanent Model Vault (R8.11+)

## What happened
The local Kokoro speech renderer already failed closed when Kokoro was missing, but the recovery workflow kept its generated WAV in a 30-day GitHub Actions artifact. It never preserved the source model weights. Previous Drive documentation contained descriptions of voice systems and presets, not the Torch model assets. A source-code branch is also **not** a durable model store.

The original current governed narrator is **Kokoro-82M / am_michael** using the Python `kokoro` package. A portable Kokoro-ONNX variant or older Holden/Reid preset may be related but is **not** interchangeable without owner review. This fix explicitly archives the original Torch implementation, not a generic new TTS.

## Permanent canonical asset
- GitHub Release tag: `ths-kokoro-torch-am-michael-v1` in `Razzleberrytt/hippie-scientist-site`.
- Original upstream repo: `hexgrad/Kokoro-82M`, pinned to the immutable Hugging Face commit SHA observed at bootstrap.
- Files: `kokoro-v1_0.pth`, `voices/am_michael.pt`, `config.json`, `voice-vault.json`.
- The manifest records the actual SHA-256 and byte count of every asset.
- `.github/workflows/voice-model-vault.yml` bootstraps the release after merge to `main`, downloads it **again**, verifies SHA-256, reconstructs the offline Hugging Face cache, and synthesizes audible PCM with the restored model. If the release already exists, it never overwrites or re-fetches new weights. Future voice changes use new tags.
- `scripts/distribution/voice-vault.py` is the manifest validator and offline cache restorer.

## Mandatory render contract
- `.github/workflows/kokoro-voice-production.yml` now **must** download and verify the above release. Missing release / any mismatch = FAIL.
- `render-local-narration.py` now requires `THS_VOICE_VAULT`; verifies the saved model, restores the exact files into Hugging Face's offline cache, sets `HF_HUB_OFFLINE=1`, and only then initializes Kokoro.
- The narrator receipt includes `modelSourceRevision`, `modelWeightsSha256`, `voiceWeightsSha256`, `modelConfigSha256`, and `voiceVaultTag` in addition to the WAV/brief/timeline hashes. Version of the `kokoro` package is pinned to 0.9.4.
- No engine may substitute OS TTS, provider defaults, alternate voices or ONNX backends for this canon.

## Recovery when running outside GitHub
Install `gh`, Python 3.11, FFmpeg, `espeak-ng` and dependencies in `scripts/distribution/requirements-local-voice.txt`. Use:

```bash
mkdir -p .cache/ths-voice-vault/voices
gh release download ths-kokoro-torch-am-michael-v1 --repo Razzleberrytt/hippie-scientist-site --dir .cache/ths-voice-vault
mv .cache/ths-voice-vault/am_michael.pt .cache/ths-voice-vault/voices/am_michael.pt
python scripts/distribution/voice-vault.py verify .cache/ths-voice-vault
export THS_VOICE_VAULT=.cache/ths-voice-vault
export HF_HOME="$HOME/.cache/huggingface"
python scripts/distribution/voice-vault.py restore "$THS_VOICE_VAULT"
python scripts/distribution/render-local-narration.py --package-dir artifacts/narration/example --brief scripts/distribution/voice-briefs/active.json
```

## Google Drive mirror
Owner requested persistence, with Drive as an acceptable additional home. GitHub Release provides the primary versioned binary backup without needing to give GitHub Actions broad access to personal Google Drive. An authorized Google Drive copy should mirror the **same original four files**, not just this README; verify hashes on Drive readback before asserting a second backup. Existing Drive docs and ZIPs cannot be counted as verified weight backups.

## Acceptance vs pending
**Implementation is not backup proof.** Completion requires successful GitHub model-vault workflow and a readable release with both weights, plus smoke synthesis and perceptual A/B audition of a real spoken master. Only then may the production voice be considered restored. Robotic narration still blocks publishing, even when model integrity passes.
