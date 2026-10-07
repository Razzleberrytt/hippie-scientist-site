#!/usr/bin/env python3
"""Render a scene-timed THS narration WAV entirely on the local machine.

R8.04 invariant: no hosted TTS API, account, token, or metered credit is used.
The first Kokoro run may download open model weights; subsequent runs use the
local model cache.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import math
import sys
import wave
from pathlib import Path

import numpy as np


SAMPLE_RATE = 24_000
SCHEMA = "ths-local-narration-receipt-v1"
SCRIPT_SCHEMA = "ths-local-narration-script-v1"


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def as_audio_array(value) -> np.ndarray:
    if value is None:
        return np.zeros(0, dtype=np.float32)
    if hasattr(value, "detach"):
        value = value.detach()
    if hasattr(value, "cpu"):
        value = value.cpu()
    if hasattr(value, "numpy"):
        value = value.numpy()
    return np.asarray(value, dtype=np.float32).reshape(-1)


def generate_text(pipeline, text: str, voice: str, speed: float) -> np.ndarray:
    chunks = []
    for result in pipeline(text, voice=voice, speed=speed, split_pattern=r"\n+"):
        # Kokoro >=0.9 returns Result objects; older compatible builds may return tuples.
        audio = getattr(result, "audio", None)
        if audio is None and isinstance(result, tuple) and len(result) >= 3:
            audio = result[2]
        arr = as_audio_array(audio)
        if arr.size:
            chunks.append(arr)
    if not chunks:
        raise RuntimeError("Kokoro produced no audio for a non-empty narration scene")
    return np.concatenate(chunks)


def fit_scene(pipeline, text: str, target_samples: int, voice: str, base_speed: float, max_speed: float) -> tuple[np.ndarray, float]:
    if not text.strip():
        return np.zeros(target_samples, dtype=np.float32), base_speed

    audio = generate_text(pipeline, text, voice, base_speed)
    used_speed = base_speed

    if audio.size > target_samples:
        required = base_speed * (audio.size / target_samples) * 1.015
        if required > max_speed:
            raise RuntimeError(
                f"narration scene requires speed {required:.3f}, above R8.04 max {max_speed:.3f}; "
                "shorten/re-author the spoken line instead of crushing prosody"
            )
        used_speed = max(base_speed, required)
        audio = generate_text(pipeline, text, voice, used_speed)

    if audio.size > target_samples:
        raise RuntimeError(
            f"narration still exceeds scene by {(audio.size - target_samples) / SAMPLE_RATE:.3f}s "
            "after bounded local speed adjustment"
        )

    # Preserve natural speech and fill the rest of the authored beat with silence.
    padded = np.zeros(target_samples, dtype=np.float32)
    padded[: audio.size] = audio

    # Tiny edge fades prevent clicks without changing the spoken performance.
    fade = min(int(SAMPLE_RATE * 0.006), max(0, audio.size // 4))
    if fade > 1:
        padded[:fade] *= np.linspace(0.0, 1.0, fade, dtype=np.float32)
        padded[audio.size - fade : audio.size] *= np.linspace(1.0, 0.0, fade, dtype=np.float32)

    return padded, used_speed


def write_wav(path: Path, audio: np.ndarray) -> None:
    peak = float(np.max(np.abs(audio))) if audio.size else 0.0
    if peak > 0.98:
        audio = audio * (0.98 / peak)
    pcm = np.clip(audio, -1.0, 1.0)
    pcm = (pcm * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(pcm.tobytes())


def main() -> int:
    parser = argparse.ArgumentParser(description="Render R8.04 local Kokoro narration")
    parser.add_argument("--package-dir", required=True)
    parser.add_argument("--voice", default="am_michael")
    parser.add_argument("--language", default="a", help="Kokoro language code; a = American English")
    parser.add_argument("--speed", type=float, default=1.0)
    parser.add_argument("--max-speed", type=float, default=1.16)
    args = parser.parse_args()

    package_dir = Path(args.package_dir).resolve()
    manifest_path = package_dir / "video-asset-manifest.json"
    if not manifest_path.is_file():
        raise RuntimeError("missing video-asset-manifest.json")

    manifest = read_json(manifest_path)
    script_meta = manifest.get("narrationScript") or {}
    script_name = str(script_meta.get("file") or "")
    if script_name != "narration-script.json":
        raise RuntimeError("R8.04 local voice requires canonical narration-script.json")

    script_path = package_dir / script_name
    script_bytes = script_path.read_bytes()
    if sha256_bytes(script_bytes) != str(script_meta.get("sha256") or ""):
        raise RuntimeError("narration script hash does not match parent manifest")

    script = json.loads(script_bytes.decode("utf-8"))
    if script.get("schemaVersion") != SCRIPT_SCHEMA:
        raise RuntimeError(f"unexpected narration script schema: {script.get('schemaVersion')}")
    if script.get("packId") != manifest.get("packId"):
        raise RuntimeError("narration script pack identity does not match manifest")
    if float(script.get("durationSeconds", 0)) != 30:
        raise RuntimeError("R8.04 local narration requires an exact 30-second script")

    scenes = script.get("scenes")
    if not isinstance(scenes, list) or not scenes:
        raise RuntimeError("narration script has no scenes")

    expected = 0.0
    for index, scene in enumerate(scenes):
        start = float(scene.get("start", -1))
        end = float(scene.get("end", -1))
        if not math.isclose(start, expected, abs_tol=0.001) or end <= start:
            raise RuntimeError(f"narration scene {index + 1} timing is not contiguous")
        expected = end
    if not math.isclose(expected, 30.0, abs_tol=0.001):
        raise RuntimeError("narration scenes do not cover exactly 30 seconds")

    try:
        from kokoro import KPipeline
    except Exception as exc:
        raise RuntimeError(
            "local Kokoro runtime is unavailable; install requirements-local-voice.txt and espeak-ng. "
            "R8.04 forbids falling back to a hosted/credit TTS service."
        ) from exc

    pipeline = KPipeline(lang_code=args.language)
    rendered = []
    scene_receipts = []
    for scene in scenes:
        start = float(scene["start"])
        end = float(scene["end"])
        target_samples = round((end - start) * SAMPLE_RATE)
        text = str(scene.get("text") or "").strip()
        audio, used_speed = fit_scene(
            pipeline,
            text,
            target_samples,
            args.voice,
            args.speed,
            args.max_speed,
        )
        rendered.append(audio)
        scene_receipts.append({
            "role": str(scene.get("role") or ""),
            "start": start,
            "end": end,
            "textSha256": sha256_bytes(text.encode("utf-8")),
            "spoken": bool(text),
            "speed": round(float(used_speed), 4),
        })

    final_audio = np.concatenate(rendered)
    expected_samples = 30 * SAMPLE_RATE
    if final_audio.size != expected_samples:
        raise RuntimeError(f"local narration sample count drift: {final_audio.size} != {expected_samples}")

    output_path = package_dir / "narration.wav"
    write_wav(output_path, final_audio)
    output_bytes = output_path.read_bytes()

    abs_audio = np.abs(final_audio)
    peak = float(abs_audio.max()) if abs_audio.size else 0.0
    rms = float(np.sqrt(np.mean(np.square(final_audio)))) if final_audio.size else 0.0
    active_ratio = float(np.mean(abs_audio > 0.0025)) if abs_audio.size else 0.0

    try:
        kokoro_version = importlib.metadata.version("kokoro")
    except importlib.metadata.PackageNotFoundError:
        kokoro_version = "unknown"

    receipt = {
        "schemaVersion": SCHEMA,
        "engine": {
            "name": "kokoro",
            "model": "Kokoro-82M",
            "packageVersion": kokoro_version,
            "kind": "local-open-source",
            "language": args.language,
            "voice": args.voice,
        },
        "accountRequired": False,
        "apiKeyRequired": False,
        "meteredCreditsRequired": False,
        "source": {
            "scriptFile": script_name,
            "scriptSha256": sha256_bytes(script_bytes),
            "packId": script.get("packId"),
        },
        "profile": {
            "sampleRate": SAMPLE_RATE,
            "channels": 1,
            "durationSeconds": 30,
            "format": "wav-pcm16",
        },
        "signal": {
            "peak": round(peak, 6),
            "rms": round(rms, 6),
            "activeRatio": round(active_ratio, 6),
        },
        "sceneReceipts": scene_receipts,
        "perceptualQA": {
            "naturalPresence": "pending",
            "pronunciation": "pending",
            "note": "Signal/provenance passed; exact audio still requires PerceptualQA approval before MP4 render.",
        },
        "output": {
            "file": "narration.wav",
            "sha256": sha256_bytes(output_bytes),
            "bytes": len(output_bytes),
        },
    }
    receipt_path = package_dir / "narration.wav.receipt.json"
    receipt_path.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")

    print(f"[voice-engine] local Kokoro narration rendered: {output_path}")
    print("[voice-engine] Natural Presence remains pending; approve the exact WAV before MP4 rendering.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"[voice-engine] FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
