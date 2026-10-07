#!/usr/bin/env python3
"""THS R8.04 local narration generator.

No hosted API calls are made by this script. The selected Chatterbox model is
loaded in-process. Model weights may be downloaded by the upstream library on
first use and then reused from the local cache.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import sys
from dataclasses import asdict, dataclass
from pathlib import Path

import torch
import torchaudio as ta


@dataclass
class TakeMetric:
    index: int
    seed: int
    path: str
    duration_seconds: float
    words: int
    wpm: float
    peak_dbfs: float
    rms_dbfs: float
    technical_score: float
    technical_pass: bool


def dbfs(value: float) -> float:
    return 20.0 * math.log10(max(value, 1e-9))


def pick_device(requested: str) -> str:
    if requested != "auto":
        return requested
    if torch.cuda.is_available():
        return "cuda"
    if getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def load_model(kind: str, device: str):
    if kind in {"nano", "turbo"}:
        from chatterbox.tts_turbo import ChatterboxTurboTTS

        return ChatterboxTurboTTS.from_pretrained(
            device=device,
            nano=(kind == "nano"),
        )

    if kind == "standard":
        from chatterbox.tts import ChatterboxTTS

        return ChatterboxTTS.from_pretrained(device=device)

    raise ValueError(f"unsupported model: {kind}")


def evaluate(wav: torch.Tensor, sr: int, words: int) -> tuple[float, float, float, float, bool]:
    mono = wav.detach().float().cpu()
    if mono.ndim > 1:
        mono = mono.mean(dim=0)
    duration = float(mono.numel()) / float(sr)
    peak = float(mono.abs().max()) if mono.numel() else 0.0
    rms = float(torch.sqrt(torch.mean(mono ** 2))) if mono.numel() else 0.0
    wpm = 0.0 if duration <= 0 else words / (duration / 60.0)

    peak_db = dbfs(peak)
    rms_db = dbfs(rms)

    # Technical filter only. Natural Presence remains a perceptual gate.
    speed_penalty = min(abs(wpm - 150.0) / 40.0, 2.0)
    peak_penalty = 1.0 if peak_db > -0.2 else 0.0
    silence_penalty = 1.0 if rms_db < -42.0 else 0.0
    score = 10.0 - speed_penalty - peak_penalty - silence_penalty
    passed = 110.0 <= wpm <= 190.0 and peak_db <= 0.0 and rms_db > -48.0 and duration > 0.25
    return duration, wpm, peak_db, rms_db, passed


def run_ffmpeg_master(source: Path, output: Path) -> None:
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("ffmpeg is required for local mastering")

    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-i", str(source),
        "-af", "highpass=f=65,loudnorm=I=-14:LRA=7:TP=-1.5",
        "-c:a", "pcm_s16le",
        str(output),
    ]
    subprocess.run(cmd, check=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--plan", required=True, help="JSON voice plan")
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--reference", help="authorized local reference WAV")
    parser.add_argument("--model", choices=["nano", "turbo", "standard"], default="nano")
    parser.add_argument("--device", choices=["auto", "cpu", "cuda", "mps"], default="auto")
    parser.add_argument("--takes", type=int, default=5)
    parser.add_argument("--seed", type=int, default=24041)
    args = parser.parse_args()

    plan_path = Path(args.plan).resolve()
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    plan = json.loads(plan_path.read_text(encoding="utf-8"))
    text = str(plan.get("text", "")).strip()
    if not text:
        raise SystemExit("voice plan must contain non-empty 'text'")

    reference = Path(args.reference).resolve() if args.reference else None
    if reference and not reference.is_file():
        raise SystemExit(f"reference WAV not found: {reference}")

    device = pick_device(args.device)
    model = load_model(args.model, device)
    sr = int(model.sr)
    words = len([x for x in text.split() if x.strip()])
    metrics: list[TakeMetric] = []

    for i in range(args.takes):
        seed = args.seed + i
        torch.manual_seed(seed)
        kwargs = {}
        if reference:
            kwargs["audio_prompt_path"] = str(reference)

        wav = model.generate(text, **kwargs)
        take_path = output_dir / f"take-{i+1:02d}.wav"
        ta.save(str(take_path), wav.detach().cpu(), sr)

        duration, wpm, peak_db, rms_db, passed = evaluate(wav, sr, words)
        speed_penalty = min(abs(wpm - 150.0) / 40.0, 2.0)
        score = 10.0 - speed_penalty - (1.0 if peak_db > -0.2 else 0.0) - (1.0 if rms_db < -42.0 else 0.0)
        metrics.append(
            TakeMetric(
                index=i + 1,
                seed=seed,
                path=str(take_path),
                duration_seconds=round(duration, 4),
                words=words,
                wpm=round(wpm, 2),
                peak_dbfs=round(peak_db, 2),
                rms_dbfs=round(rms_db, 2),
                technical_score=round(score, 3),
                technical_pass=passed,
            )
        )

    passing = [m for m in metrics if m.technical_pass]
    if not passing:
        receipt = {
            "schema": "ths.voice.local.receipt.v1",
            "release": "R8.04",
            "model": args.model,
            "device": device,
            "reference": str(reference) if reference else None,
            "natural_presence": "UNASSESSED_BLOCKING",
            "status": "BLOCKED_NO_TECHNICAL_TAKE",
            "takes": [asdict(x) for x in metrics],
        }
        (output_dir / "voice-receipt.json").write_text(json.dumps(receipt, indent=2), encoding="utf-8")
        raise SystemExit("no local take passed technical voice QA")

    selected = sorted(passing, key=lambda m: m.technical_score, reverse=True)[0]
    mastered = output_dir / "narration.wav"
    run_ffmpeg_master(Path(selected.path), mastered)

    receipt = {
        "schema": "ths.voice.local.receipt.v1",
        "release": "R8.04",
        "model": args.model,
        "device": device,
        "reference": str(reference) if reference else None,
        "selected_take": selected.index,
        "mastered_output": str(mastered),
        "natural_presence": "UNASSESSED_BLOCKING",
        "status": "TECHNICAL_PASS_PENDING_PERCEPTUAL_QA",
        "takes": [asdict(x) for x in metrics],
        "note": "Technical metrics cannot certify human naturalness. PerceptualQA must approve the actual narration before release.",
    }
    (output_dir / "voice-receipt.json").write_text(json.dumps(receipt, indent=2), encoding="utf-8")
    print(mastered)
    return 0


if __name__ == "__main__":
    sys.exit(main())
