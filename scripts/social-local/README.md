# THS local social-production kit — R8.04

This directory is the executable baseline for the R8.04 **Sovereign Production & Zero-Credit Critical Path**.

It exists so a THS social video can be created and packaged without Descript, Metricool, ElevenLabs, hosted image/video credits, a premium editor, or any other metered generation service.

## Runtime contract

Canonical path:

```text
approved evidence/script
  -> local voice candidates
  -> local scene/media inputs
  -> local FFmpeg composition
  -> exact-artifact preflight
  -> release packet
  -> manual native upload
```

The system may use open-source software and model weights downloaded from their upstream repositories. After the model files are cached, generation can run without a provider account or credit balance.

## Voice

Primary local family: Resemble AI Chatterbox.

- Chatterbox is open source under the MIT license.
- `nano` is the default CPU-capable path.
- `turbo` is the preferred higher-quality local English path when hardware permits.
- `standard` remains available when its quality is preferable and local compute permits.
- A user-owned/authorized reference WAV may be used to lock a consistent house voice.
- A basic OS/system voice is deliberately not implemented as a fallback.

Install into a dedicated Python environment:

```bash
python3.11 -m venv .venv-ths-voice
source .venv-ths-voice/bin/activate
python -m pip install --upgrade pip
python -m pip install -r scripts/social-local/requirements-local.txt
```

The first Chatterbox model load can download open model weights. To prove the runtime is no longer using a network dependency after the model is cached, run subsequent production with your model cache intact and network disabled.

Generate narration candidates:

```bash
python scripts/social-local/voice_local.py \
  --plan path/to/voice-plan.json \
  --output-dir artifacts/social/my-video/voice \
  --reference path/to/authorized-house-reference.wav \
  --model nano \
  --device cpu
```

The script emits:

- one WAV candidate per take;
- `voice-receipt.json` with seeds, durations, peak/RMS levels, WPM and selected technical candidate;
- `narration.wav`, mastered locally through FFmpeg.

**Natural Presence is still a hard perceptual gate.** Signal metrics can reject broken takes; they cannot prove human naturalness. If no local take sounds acceptable, release fails closed.

## Local render

Create a work order from `example.work-order.json`. Each scene can be a local image or local video. Nothing in the work order may be an HTTP URL.

Render:

```bash
node scripts/social-local/render_local.mjs path/to/work-order.json
```

The renderer:

- refuses remote media;
- verifies FFmpeg/FFprobe exist;
- normalizes each scene to 1080x1920;
- concatenates locally;
- mixes the local narration;
- exports H.264/AAC MP4 with fast-start metadata.

For sophisticated authored motion, EvidenceMotion can render scene clips separately; this composer remains the deterministic final assembly layer.

## Release packet

After PerceptualQA approves the actual encoded artifact:

```bash
node scripts/social-local/build_release_packet.mjs \
  --video artifacts/social/my-video/final.mp4 \
  --cover artifacts/social/my-video/cover.png \
  --caption artifacts/social/my-video/caption.txt \
  --evidence artifacts/social/my-video/evidence.json \
  --out artifacts/social/my-video/release.json
```

The release packet records the exact SHA-256, ffprobe media properties, companion artifact hashes, R8.04 identity and `manual_native_upload` transport.

## Recovery order

1. Regenerate/retune locally.
2. Adjust local script segmentation, prosody, scene timing or composition while preserving EvidenceBridge permission.
3. Switch between approved local open-source model variants.
4. Use an authorized human recording.
5. Fail closed.

There is no fallback to a paid-credit provider.
