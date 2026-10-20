#!/usr/bin/env python3
"""Two authentic Kokoro pronunciation takes for owner listening, not publication.

The active production lexicon uses unmodified mitragynine after owner feedback
that hyphenated IPA-like syllable guides sounded unnaturally chopped.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

from voice_pronunciation import apply_pronunciations, lexicon_receipt

VOICE = "am_michael"
BASE = "Kratom leaf contains mitragynine."
TAKES = {
    "native": apply_pronunciations(BASE),
    "joined-alternative": apply_pronunciations("Kratom leaf contains mitrajenine."),
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main(output: Path):
    vault = os.getenv("THS_VOICE_VAULT")
    if not vault:
        raise RuntimeError("Pinned THS_VOICE_VAULT is required; no substitute TTS")
    subprocess.run([sys.executable, str(Path(__file__).with_name("voice-vault.py")),
                    "verify", vault], check=True, capture_output=True, text=True)
    model = Path(vault) / "kokoro-v1.0.int8.onnx"
    voicebank = Path(vault) / "voices-v1.0.bin"
    engine = Kokoro(str(model), str(voicebank))
    output.mkdir(parents=True, exist_ok=True)
    receipts = []
    for name, spoken in TAKES.items():
        samples, rate = engine.create(spoken, voice=VOICE, speed=1.05, lang="en-us")
        audio = np.asarray(samples, dtype=np.float32).reshape(-1)
        if rate != 24000 or not audio.size or not np.isfinite(audio).all():
            raise RuntimeError(f"Unusable Kokoro sample: {name}")
        rms = float(np.sqrt(np.mean(audio ** 2)))
        if rms < 0.005:
            raise RuntimeError(f"Silent Kokoro sample: {name}")
        wav = output / f"mitragynine-{name}-LISTEN.wav"
        mp3 = output / f"mitragynine-{name}-LISTEN.mp3"
        sf.write(wav, audio, rate, subtype="PCM_16")
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                        "-i", str(wav), "-codec:a", "libmp3lame", "-qscale:a", "3",
                        str(mp3)], check=True, timeout=60)
        receipts.append({"take": name, "sourceCaption": BASE, "ttsInput": spoken,
                         "wavSha256": sha(wav), "mp3Sha256": sha(mp3),
                         "durationSeconds": round(len(audio) / rate, 3),
                         "humanAuditoryReview": "pending"})
    (output / "mitragynine-listen.receipt.json").write_text(
        json.dumps({"releaseAuthority": "owner-audition-only",
                    "engine": "kokoro-onnx", "voice": VOICE,
                    "lexicon": lexicon_receipt(),
                    "modelSha256": sha(model), "voicebankSha256": sha(voicebank),
                    "takes": receipts}, indent=2) + "\n", encoding="utf-8"
    )
    print("Audition-only native/continuous takes rendered:", receipts)


if __name__ == "__main__":
    try:
        main(Path(sys.argv[1] if len(sys.argv) > 1 else "artifacts/r812/mitragynine-probe"))
    except Exception as error:
        print(f"VOICE PRONUNCIATION PROBE FAILED: {error}", file=sys.stderr)
        sys.exit(1)
