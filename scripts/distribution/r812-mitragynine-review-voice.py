#!/usr/bin/env python3
"""Mitragynine narration diagnostic: authentic house voice, natural-length radio edit.

The source lines are retained from an older 43-second V3 visual draft, but that
visual cut is NOT timing authority. Finish the voice first; the picture must be
redirected against the actual resulting audio. Review-only; no MFA or release pass.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

VOICE = "am_michael"
RATE = 24000
LEGACY_VISUAL_DURATION_SECONDS = 43.0  # comparison only, never used to time audio
MODEL_HASH = "ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c"
VOICES_HASH = "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d"
SCENES = [
    ("hook", 0.0, 3.0, "Your liver can make seven O H."),
    ("leaf", 3.0, 6.5, "Kratom leaf contains mitragynine."),
    ("enzyme", 6.5, 12.4, "C Y P three A four converts some of it into seven O H."),
    ("receptor", 12.4, 17.2, "Seven O H is more active in lab opioid receptor tests."),
    ("qualifier", 17.2, 20.5, "That is not a human dose comparison."),
    ("study2019", 20.5, 24.6, "Scientists found this in human liver preparations."),
    ("study2024", 24.6, 29.6, "A later study detected seven O H in blood after kratom tea."),
    ("itraconazole", 29.6, 35.6, "Peak seven O H levels fell fifty six percent with itraconazole pretreatment."),
    ("product", 35.6, 39.5, "Kratom leaf is not a seven O H concentrate."),
    ("cta", 39.5, 43.0, "The D E A notice is next. Follow for more."),
]

def sha_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def check_vault(vault: Path) -> tuple[Path, Path]:
    model = vault / "kokoro-v1.0.int8.onnx"
    voices = vault / "voices-v1.0.bin"
    if not model.is_file() or not voices.is_file():
        raise RuntimeError("voice model missing, re-fetch original THS release; no Flite fallback")
    if sha_file(model) != MODEL_HASH or sha_file(voices) != VOICES_HASH:
        raise RuntimeError("voice model checksum mismatch; re-fetch original THS release; no substitute")
    return model, voices

def create_review_audio(vault: Path, output_dir: Path) -> dict:
    model, voices = check_vault(vault)
    output_dir.mkdir(parents=True, exist_ok=True)
    engine = Kokoro(str(model), str(voices))
    clips = []
    receipts = []
    cursor_samples = 0
    pause_samples = round(0.18 * RATE)

    for idx, (name, old_start, old_end, words) in enumerate(SCENES):
        # One stable delivery setting. Never accelerate a spoken line to match
        # its previously assigned visual slot. These old times are reference
        # metadata only; edit the visuals after listening to the completed WAV.
        raw, rate = engine.create(words, voice=VOICE, speed=1.0, lang="en-us")
        if rate != RATE:
            raise RuntimeError(f"Unexpected Kokoro sample rate: {rate} != {RATE}")
        raw = np.asarray(raw, dtype=np.float32).reshape(-1)
        if raw.size == 0 or not np.isfinite(raw).all():
            raise RuntimeError(f"Missing/invalid genuine Kokoro speech in {name}")
        raw_rms = float(np.sqrt(np.mean(np.square(raw))))
        if raw_rms < 0.005 or float(np.max(np.abs(raw))) < 0.01:
            raise RuntimeError(
                f"{name}: voice model returned silent/inaudible segment; "
                "refetch/review Kokoro output, never substitute a robotic narrator"
            )

        clip = raw.copy()
        fade = min(1200, len(clip))
        if fade > 1:
            clip[-fade:] *= np.linspace(1.0, 0.0, fade, dtype=np.float32)
        start_samples = cursor_samples
        end_samples = start_samples + len(clip)
        clips.append(clip)
        cursor_samples = end_samples
        if idx < len(SCENES) - 1:
            clips.append(np.zeros(pause_samples, dtype=np.float32))
            cursor_samples += pause_samples
        receipts.append({
            "scene": name,
            "script": words,
            "voiceStartSeconds": round(start_samples / RATE, 4),
            "voiceEndSeconds": round(end_samples / RATE, 4),
            "naturalSpeechSeconds": round(len(clip) / RATE, 4),
            "pauseAfterSeconds": 0.18 if idx < len(SCENES) - 1 else 0.0,
            "legacyPictureStartSeconds": old_start,
            "legacyPictureEndSeconds": old_end,
            "rawRms": round(raw_rms, 6),
            "timeStretchApplied": False,
        })
        print(
            f"KOKORO {name}: audio {start_samples / RATE:.2f}–{end_samples / RATE:.2f}s "
            f"(legacy picture was {old_start:.2f}–{old_end:.2f}s); no tempo fitting",
            flush=True,
        )

    speech = np.concatenate(clips)
    peak = float(np.max(np.abs(speech)))
    rms = float(np.sqrt(np.mean(speech ** 2)))
    if rms <= 0.001 or peak <= 0.01:
        raise RuntimeError("Authentic Kokoro output silent, fail closed")
    speech *= min(1.25, 0.78 / peak)
    audio_path = output_dir / "r812-mitragynine-authentic-voice-REVIEW.wav"
    sf.write(audio_path, np.clip(speech, -0.98, 0.98), RATE, subtype="PCM_16")
    duration_seconds = round(len(speech) / RATE, 4)

    receipt = {
        "schemaVersion": "ths-r812-authentic-v3-review-wav-v1",
        "releaseAuthority": "draft-only-not-for-publication",
        "voiceEngine": "kokoro-onnx==0.6.1",
        "voice": VOICE,
        "modelSha256": sha_file(model),
        "voicebankSha256": sha_file(voices),
        "voiceModelAsset": model.name,
        "voicebankAsset": voices.name,
        "voiceVaultRelease": "ths-kokoro-onnx-am-michael-int8-v1",
        "narrationWavSha256": sha_file(audio_path),
        "durationSeconds": duration_seconds,
        "legacyPictureDurationSeconds": LEGACY_VISUAL_DURATION_SECONDS,
        "sceneTiming": "natural-voice-locked-radio-edit; picture must be recut",
        "originalDurationPreserved": True,
        "timeStretchApplied": False,
        "wordLevelAlignmentCertified": False,
        "humanAuditoryReview": "pending",
        "scienceReview": "pending",
        "clips": receipts,
    }
    (output_dir / "r812-mitragynine-authentic-voice-REVIEW.receipt.json").write_text(
        json.dumps(receipt, indent=2) + "\n", encoding="utf-8"
    )
    print(
        f"KOKORO NATURAL RADIO EDIT: {audio_path} ({duration_seconds:.2f}s); "
        "the 43-second picture timeline is INVALID for this WAV",
        "sha256:", receipt["narrationWavSha256"],
    )
    return receipt

if __name__ == "__main__":
    vault = Path(os.environ.get("THS_VOICE_VAULT", ""))
    if not os.environ.get("THS_VOICE_VAULT"):
        sys.exit("voice model missing, re-fetch immutable THS house voice; no fallback")
    try:
        create_review_audio(vault, Path(sys.argv[1] if len(sys.argv) > 1 else "artifacts/r812"))
    except Exception as exc:
        sys.exit("R8.12 VOICE REVIEW FAILED CLOSED: " + str(exc))
