# THS Original Narrator — Permanent Kokoro ONNX Model Vault

## Confirmed incident diagnosis (October 11, 2026)
The actual R8.11 V3 review bundle's `mitragynine_r811_v3_alignment.json` explicitly identifies its voice as **FFmpeg Flite rms TEMPORARY**. That robot narrator did NOT originate in the governed local Kokoro pipeline. The review bundle warned that it was not a release-approved narration. The earlier pipeline itself failed closed if Kokoro was missing; this incident was a *bypass outside that pipeline*.

The supplied `THS_R811_Kokoro_AutoFinish_Kit.zip` identifies the user's updated house voice as **Kokoro ONNX 0.6.1 / Kokoro v1 INT8 / am_michael**, with two exact pinned upstream assets. It is different from the older Python Torch `kokoro` workflow and unrelated to historical Holden/Reid provider presets. This vault preserves the newer house voice exactly, not a plausible-sounding substitute.

## Canonical permanent assets
- Durable project-owned GitHub Release: `ths-kokoro-onnx-am-michael-int8-v1`.
- Exact upstream release: `https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/`.
- Model: `kokoro-v1.0.int8.onnx`, SHA-256 `ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c`.
- Voicebank: `voices-v1.0.bin`, SHA-256 `bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d`.
- Engine: `kokoro-onnx==0.6.1`; narrator: `am_michael`, locale `en-us`.
- Third release asset: `voice-vault.json` containing identity, exact hashes and expected source release.

The hashes originate in the house-voice rebuild kit's own approved asset list. The validator independently compares the binary bytes to these exact constants, not merely an easily changed manifest.

## Archive and recover
1. `.github/workflows/voice-model-vault.yml` first downloads and validates the exact files, then stores them in a durable immutable GitHub Release. On subsequent runs it restores from the same release, never silently overwrites.
2. That workflow **downloads its own Release again**, revalidates the bytes, installs pinned Kokoro ONNX and synthesizes a non-silent test sentence using the **saved** files. Until this workflow reports SUCCESS, the archive is not proven.
3. `.github/workflows/kokoro-voice-production.yml` now retrieves that saved release and fails if it or any checksum is wrong; rendering is blocked without this asset.
4. `scripts/distribution/render-local-narration.py` verifies assets before initializing the ONNX engine, restricts speaker to `am_michael`, and records model and voicebank SHA-256 in the actual narration receipt.
5. A transient 7-day Action artifact makes verified model assets transferable to the owner-authorized Google Drive backup folder. It is **not** the durable source. No claim of a Drive mirror until upload and readback succeed.

## Local recovery
Install Python 3.11, espeak-ng, FFmpeg, GitHub CLI, and `scripts/distribution/requirements-local-voice.txt`.

```bash
mkdir -p .cache/ths-voice-vault
gh release download ths-kokoro-onnx-am-michael-int8-v1 \
  --repo Razzleberrytt/hippie-scientist-site --dir .cache/ths-voice-vault
python scripts/distribution/voice-vault.py verify .cache/ths-voice-vault
export THS_VOICE_VAULT=.cache/ths-voice-vault
python scripts/distribution/render-local-narration.py \
  --package-dir artifacts/narration/approved-video \
  --brief path/to/r805-creative-brief.json
```

Source code branch checkouts, readme files, 30-day voice artifacts, cached weights in disposable ChatGPT containers, and a generated WAV are **not** canonical model backups. Reject any render that lacks a verified manifest, correct voice engine identity or perceptual narrator approval. A pass on data integrity is necessary but does not itself certify natural-sounding speech.

## Video publication
The R8.11 V3 Flite reference cut remains **REVIEW ONLY**. Remake its spoken track with the exact ONNX voice, verify word/caption/audio synchrony against actual emitted waveform, listen at normal speed, then approve the complete MP4 with voice, captions and quiet music together. The house voice must be a real perceptual quality gate, not a synthetic metadata check.
