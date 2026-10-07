#!/usr/bin/env python3
"""Render THS narration locally with no hosted API, account, or metered credits.

R8.05 is voice-first: an approved creative brief is synthesized at natural
speed before visual timing exists. The exact WAV creates the semantic beat
timeline that later visual rendering must follow.

R8.04 legacy package-timed rendering remains available for reproducibility.
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
R805_TIMELINE_SCHEMA = "ths-r805-semantic-beat-timeline-v1"


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_text(value: str) -> str:
    return sha256_bytes(" ".join(str(value or "").strip().split()).encode("utf-8"))


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
        audio = getattr(result, "audio", None)
        if audio is None and isinstance(result, tuple) and len(result) >= 3:
            audio = result[2]
        arr = as_audio_array(audio)
        if arr.size:
            chunks.append(arr)
    if not chunks:
        raise RuntimeError("Kokoro produced no audio for a non-empty narration beat")
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

    padded = np.zeros(target_samples, dtype=np.float32)
    padded[: audio.size] = audio
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


def load_pipeline(language: str):
    try:
        from kokoro import KPipeline
    except Exception as exc:
        raise RuntimeError(
            "local Kokoro runtime is unavailable; install requirements-local-voice.txt and espeak-ng. "
            "R8.04/R8.05 forbid falling back to a hosted/credit TTS service."
        ) from exc
    return KPipeline(lang_code=language)


def engine_metadata(language: str, voice: str):
    try:
        kokoro_version = importlib.metadata.version("kokoro")
    except importlib.metadata.PackageNotFoundError:
        kokoro_version = "unknown"
    return {
        "name": "kokoro",
        "model": "Kokoro-82M",
        "packageVersion": kokoro_version,
        "kind": "local-open-source",
        "language": language,
        "voice": voice,
    }


def signal_metrics(audio: np.ndarray):
    abs_audio = np.abs(audio)
    return {
        "peak": round(float(abs_audio.max()) if abs_audio.size else 0.0, 6),
        "rms": round(float(np.sqrt(np.mean(np.square(audio)))) if audio.size else 0.0, 6),
        "activeRatio": round(float(np.mean(abs_audio > 0.0025)) if abs_audio.size else 0.0, 6),
    }


def render_r805(package_dir: Path, brief_path: Path, args) -> int:
    brief_bytes = brief_path.read_bytes()
    brief = json.loads(brief_bytes.decode("utf-8"))
    if brief.get("release") != "R8.05":
        raise RuntimeError("R8.05 natural narration requires a creative brief with release R8.05")
    beats = brief.get("beats")
    if not isinstance(beats, list) or not beats:
        raise RuntimeError("R8.05 creative brief has no semantic beats")

    pipeline = load_pipeline(args.language)
    rendered = []
    timeline_beats = []
    cursor_samples = 0
    seen = set()

    for index, beat in enumerate(beats):
        beat_id = str(beat.get("id") or "").strip()
        if not beat_id or beat_id in seen:
            raise RuntimeError(f"R8.05 beat {index + 1} has missing/duplicate id")
        seen.add(beat_id)
        narration = " ".join(str(beat.get("narration") or "").strip().split())
        spoken_anchor = " ".join(str(beat.get("spokenAnchor") or "").strip().split())
        start_samples = cursor_samples

        if narration:
            if not spoken_anchor or spoken_anchor.lower() not in narration.lower():
                raise RuntimeError(f"R8.05 beat {beat_id} spokenAnchor must occur inside narration")
            audio = generate_text(pipeline, narration, args.voice, args.speed)
            speech_samples = audio.size
            pause_seconds = float(beat.get("pauseAfterSeconds", 0.14))
            if pause_seconds < 0 or pause_seconds > 1:
                raise RuntimeError(f"R8.05 beat {beat_id} pauseAfterSeconds must be between 0 and 1")
            pause_samples = round(pause_seconds * SAMPLE_RATE)
            beat_audio = np.concatenate([audio, np.zeros(pause_samples, dtype=np.float32)])
            speech_end_samples = start_samples + speech_samples
            anchor_index = narration.lower().index(spoken_anchor.lower())
            anchor_mid_ratio = (anchor_index + (len(spoken_anchor) / 2.0)) / max(1, len(narration))
            anchor_cue_samples = start_samples + round(speech_samples * anchor_mid_ratio)
        else:
            hold_seconds = float(beat.get("holdSeconds", 0))
            if hold_seconds <= 0 or hold_seconds > 7:
                raise RuntimeError(f"R8.05 silent beat {beat_id} requires holdSeconds > 0 and <= 7")
            beat_audio = np.zeros(round(hold_seconds * SAMPLE_RATE), dtype=np.float32)
            speech_end_samples = start_samples
            anchor_cue_samples = start_samples

        rendered.append(beat_audio)
        cursor_samples += beat_audio.size
        timeline_beats.append({
            "id": beat_id,
            "role": str(beat.get("role") or "").strip(),
            "start": round(start_samples / SAMPLE_RATE, 4),
            "speechEnd": round(speech_end_samples / SAMPLE_RATE, 4),
            "end": round(cursor_samples / SAMPLE_RATE, 4),
            "duration": round(beat_audio.size / SAMPLE_RATE, 4),
            "anchorCue": round(anchor_cue_samples / SAMPLE_RATE, 4) if narration else None,
            "anchorTimingMethod": "voice-duration-proportional-text-anchor" if narration else "hold",
            "narrationSha256": sha256_text(narration),
            "onScreenTextSha256": sha256_text(str(beat.get("onScreenText") or "")),
            "visualPurposeSha256": sha256_text(str(beat.get("visualPurpose") or "")),
            "spokenAnchorSha256": sha256_text(str(beat.get("spokenAnchor") or "")),
            "visualActionSha256": sha256_text(str(beat.get("visualAction") or "")),
            "cutReason": str(beat.get("cutReason") or "").strip(),
            "factualAuthority": str(beat.get("factualAuthority") or "creative-framing").strip(),
            "spoken": bool(narration),
            "speed": round(float(args.speed), 4),
        })

    final_audio = np.concatenate(rendered)
    duration_seconds = round(final_audio.size / SAMPLE_RATE, 4)
    if duration_seconds < 5 or duration_seconds > 60:
        raise RuntimeError(f"R8.05 natural runtime {duration_seconds:.3f}s is outside the governed 5-60s short-video envelope")

    output_path = package_dir / "narration.wav"
    write_wav(output_path, final_audio)
    output_bytes = output_path.read_bytes()
    audio_sha = sha256_bytes(output_bytes)
    brief_sha = sha256_bytes(brief_bytes)

    timeline = {
        "schemaVersion": R805_TIMELINE_SCHEMA,
        "release": "R8.05",
        "timingAuthority": "exact-local-narration",
        "creativeBriefFile": brief_path.name,
        "creativeBriefSha256": brief_sha,
        "audioFile": "narration.wav",
        "audioSha256": audio_sha,
        "sampleRate": SAMPLE_RATE,
        "durationSeconds": duration_seconds,
        "beats": timeline_beats,
    }
    timeline_bytes = (json.dumps(timeline, indent=2) + "\n").encode("utf-8")
    timeline_path = package_dir / "semantic-beat-timeline.json"
    timeline_path.write_bytes(timeline_bytes)
    timeline_sha = sha256_bytes(timeline_bytes)

    receipt = {
        "schemaVersion": SCHEMA,
        "release": "R8.05",
        "engine": engine_metadata(args.language, args.voice),
        "accountRequired": False,
        "apiKeyRequired": False,
        "meteredCreditsRequired": False,
        "source": {
            "creativeBriefFile": brief_path.name,
            "creativeBriefSha256": brief_sha,
            "beatTimelineFile": "semantic-beat-timeline.json",
            "beatTimelineSha256": timeline_sha,
            "timingAuthority": "exact-local-narration",
        },
        "profile": {
            "sampleRate": SAMPLE_RATE,
            "channels": 1,
            "durationSeconds": duration_seconds,
            "format": "wav-pcm16",
        },
        "signal": signal_metrics(final_audio),
        "sceneReceipts": timeline_beats,
        "perceptualQA": {
            "naturalPresence": "pending",
            "pronunciation": "pending",
            "note": "Exact local narration created the semantic beat timeline; perceptual approval is still required.",
        },
        "output": {
            "file": "narration.wav",
            "sha256": audio_sha,
            "bytes": len(output_bytes),
        },
    }
    (package_dir / "narration.wav.receipt.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(f"[voice-engine] R8.05 natural local narration rendered: {output_path} ({duration_seconds:.3f}s)")
    print("[voice-engine] Exact WAV owns semantic timing; approve Natural Presence before visual/MP4 release.")
    return 0


def render_r804(package_dir: Path, args) -> int:
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

    pipeline = load_pipeline(args.language)
    rendered = []
    scene_receipts = []
    for scene in scenes:
        start = float(scene["start"])
        end = float(scene["end"])
        target_samples = round((end - start) * SAMPLE_RATE)
        text = str(scene.get("text") or "").strip()
        audio, used_speed = fit_scene(pipeline, text, target_samples, args.voice, args.speed, args.max_speed)
        rendered.append(audio)
        scene_receipts.append({
            "role": str(scene.get("role") or ""),
            "start": start,
            "end": end,
            "textSha256": sha256_text(text),
            "spoken": bool(text),
            "speed": round(float(used_speed), 4),
        })

    final_audio = np.concatenate(rendered)
    if final_audio.size != 30 * SAMPLE_RATE:
        raise RuntimeError("R8.04 local narration sample count drift")

    output_path = package_dir / "narration.wav"
    write_wav(output_path, final_audio)
    output_bytes = output_path.read_bytes()
    receipt = {
        "schemaVersion": SCHEMA,
        "release": "R8.04",
        "engine": engine_metadata(args.language, args.voice),
        "accountRequired": False,
        "apiKeyRequired": False,
        "meteredCreditsRequired": False,
        "source": {
            "scriptFile": script_name,
            "scriptSha256": sha256_bytes(script_bytes),
            "packId": script.get("packId"),
        },
        "profile": {"sampleRate": SAMPLE_RATE, "channels": 1, "durationSeconds": 30, "format": "wav-pcm16"},
        "signal": signal_metrics(final_audio),
        "sceneReceipts": scene_receipts,
        "perceptualQA": {
            "naturalPresence": "pending",
            "pronunciation": "pending",
            "note": "Signal/provenance passed; exact audio still requires PerceptualQA approval before MP4 rendering.",
        },
        "output": {"file": "narration.wav", "sha256": sha256_bytes(output_bytes), "bytes": len(output_bytes)},
    }
    (package_dir / "narration.wav.receipt.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(f"[voice-engine] R8.04 local Kokoro narration rendered: {output_path}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Render local THS narration without hosted credits")
    parser.add_argument("--package-dir", required=True)
    parser.add_argument("--brief", default=None, help="R8.05 creative brief; copied/bound into package directory")
    parser.add_argument("--voice", default="am_michael")
    parser.add_argument("--language", default="a", help="Kokoro language code; a = American English")
    parser.add_argument("--speed", type=float, default=1.0)
    parser.add_argument("--max-speed", type=float, default=1.16)
    args = parser.parse_args()

    package_dir = Path(args.package_dir).resolve()
    package_dir.mkdir(parents=True, exist_ok=True)

    brief_path = Path(args.brief).resolve() if args.brief else package_dir / "r805-creative-brief.json"
    if brief_path.is_file():
        if brief_path.parent != package_dir:
            target = package_dir / "r805-creative-brief.json"
            target.write_bytes(brief_path.read_bytes())
            brief_path = target
        return render_r805(package_dir, brief_path, args)

    return render_r804(package_dir, args)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"[voice-engine] FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
