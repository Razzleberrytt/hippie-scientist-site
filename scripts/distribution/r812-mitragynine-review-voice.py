#!/usr/bin/env python3
"""R8.12 V3 narration diagnostic: authentic house voice only; NOT publication approval.

Exact V3 review narration is intentionally unchanged to match the provided
43-second visual draft's existing phrase captions. This script does not
claim word-level alignment or a finished R8.12 master.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
from voice_pronunciation import apply_pronunciations, lexicon_receipt

VOICE = "am_michael"
RATE = 24000
DURATION = 43.0
MAX_TEMPO = 1.23
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
    speech = np.zeros(int(DURATION * RATE), dtype=np.float32)
    receipts = []
    with tempfile.TemporaryDirectory(prefix="ths-r812-kokoro-") as tmpdir:
        tmp = Path(tmpdir)
        for idx, (name, start, end, words) in enumerate(SCENES):
            voice_input = apply_pronunciations(words)
            raw, rate = engine.create(voice_input, voice=VOICE, speed=1.05, lang="en-us")
            if rate != RATE:
                raise RuntimeError(f"Unexpected Kokoro sample rate: {rate} != {RATE}")
            raw = np.asarray(raw, dtype=np.float32)
            if raw.size == 0 or not np.isfinite(raw).all():
                raise RuntimeError(f"Missing/invalid genuine Kokoro speech in {name}")
            raw_rms = float(np.sqrt(np.mean(np.square(raw))))
            if raw_rms < 0.005 or float(np.max(np.abs(raw))) < 0.01:
                raise RuntimeError(
                    f"{name}: voice model returned silent/inaudible segment; "
                    "refetch/review Kokoro output, never substitute a robotic narrator"
                )
            # Honor the original review visuals; no scene may be accelerated >23%.
            available = end - start - 0.19
            ratio = (len(raw) / RATE) / available
            if ratio > MAX_TEMPO:
                raise RuntimeError(
                    f"{name} authentic Kokoro is {len(raw)/RATE:.2f}s but scene "
                    f"has {available:.2f}s: requires speed {ratio:.3f} > {MAX_TEMPO}. "
                    "Re-author V3 beats; NO robotic voice substitution."
                )
            in_wav = tmp / f"{idx:02d}-raw.wav"
            out_wav = tmp / f"{idx:02d}-fit.wav"
            sf.write(in_wav, raw, RATE, subtype="PCM_16")
            tempo = max(1.0, ratio)
            cmd = [
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-i", str(in_wav), "-af",
                f"atempo={tempo:.6f},afade=t=in:st=0:d=0.03",
                "-ac", "1", "-ar", str(RATE), str(out_wav),
            ]
            subprocess.run(cmd, check=True, timeout=90)
            fit, r = sf.read(out_wav, dtype="float32")
            if r != RATE or len(fit) == 0:
                raise RuntimeError("FFmpeg changed authorized speech rate or removed audio")
            offset = round((start + 0.10) * RATE)
            available_samples = round((end - 0.08) * RATE) - offset
            if len(fit) > available_samples:
                raise RuntimeError(f"{name} fitted speech exceeds exact assigned scene")
            fade = min(1200, len(fit))
            fit[-fade:] *= np.linspace(1.0, 0.0, fade, dtype=np.float32)
            speech[offset : offset + len(fit)] += fit
            receipts.append({
                "scene": name, "startSeconds": start, "endSeconds": end,
                "script": words, "voiceInput": voice_input, "rawSeconds": round(len(raw) / RATE, 3),
                "fittedSeconds": round(len(fit) / RATE, 3),
                "rawRms": round(raw_rms, 6),
                "tempo": round(tempo, 4),
            })
            print(f"KOKORO {name}: raw {len(raw)/RATE:.2f}s, slot {available:.2f}s, tempo {tempo:.3f}", flush=True)
    peak = float(np.max(np.abs(speech)))
    rms = float(np.sqrt(np.mean(speech**2)))
    if rms <= 0.001 or peak <= 0.01:
        raise RuntimeError("Authentic Kokoro output silent, fail closed")
    speech *= min(1.25, 0.78 / peak)
    audio_path = output_dir / "r812-mitragynine-authentic-voice-REVIEW.wav"
    sf.write(audio_path, np.clip(speech, -0.98, 0.98), RATE, subtype="PCM_16")
    receipt = {
        "schemaVersion": "ths-r812-authentic-v3-review-wav-v1",
        "releaseAuthority": "draft-only-not-for-publication",
        "voiceEngine": "kokoro-onnx==0.6.1",
        "voice": VOICE,
        "pronunciationLexicon": lexicon_receipt(),
        "modelSha256": sha_file(model),
        "voicebankSha256": sha_file(voices),
        "voiceModelAsset": model.name,
        "voicebankAsset": voices.name,
        "voiceVaultRelease": "ths-kokoro-onnx-am-michael-int8-v1",
        "narrationWavSha256": sha_file(audio_path),
        "durationSeconds": DURATION,
        "sampleRate": RATE,
        "sceneTiming": "original-43s-V3-scene-phrase-only",
        "wordLevelAlignmentCertified": False,
        "humanAuditoryReview": "pending",
        "scienceReview": "pending",
        "clips": receipts,
    }
    (output_dir / "r812-mitragynine-authentic-voice-REVIEW.receipt.json").write_text(
        json.dumps(receipt, indent=2) + "\n", encoding="utf-8"
    )
    print("KOKORO REVIEW WAV:", audio_path, "sha256:", receipt["narrationWavSha256"])
    return receipt

if __name__ == "__main__":
    vault = Path(os.environ.get("THS_VOICE_VAULT", ""))
    if not os.environ.get("THS_VOICE_VAULT"):
        sys.exit("voice model missing, re-fetch immutable THS house voice; no fallback")
    try:
        create_review_audio(vault, Path(sys.argv[1] if len(sys.argv) > 1 else "artifacts/r812"))
    except Exception as exc:
        sys.exit("R8.12 VOICE REVIEW FAILED CLOSED: " + str(exc))
