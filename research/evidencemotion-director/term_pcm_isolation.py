#!/usr/bin/env python3
"""EM-014.01: extract actual original-WAV scientific-term PCM, research only.

MFA word windows are candidates, not measured pronunciation or naturalness.
No resynthesis, processing, tempo edits, or publication approvals.
"""
import argparse
import hashlib
import json
import math
import wave
from collections import Counter
from pathlib import Path

from autonomous_script_asr_research import WAV_SHA, source_check
from mfa_acoustic_alignment import term_windows
from spoken_claim_ledger import inventory, load_original_alignment

SAMPLE_RATE = 24000
EXPECTED_COUNTS = {"7-OH": 1, "hydroxyl": 1, "mitragynine": 2,
                   "7-hydroxymitragynine": 1}


def hold(reason):
    raise ValueError("EM01401_PCM_HOLD:" + reason)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def targets(alignment):
    # inventory() first locks all 73 word identities, ordering, and candidate
    # boundaries to the frozen authored script and original WAV SHA.
    frozen = inventory(alignment)
    windows = term_windows(alignment["wordAlignment"])
    if Counter(w["term"] for w in windows) != Counter(EXPECTED_COUNTS):
        hold("SCIENTIFIC_TERM_INSTANCE_COUNT_CHANGED")
    used = set()
    for window in windows:
        indices = window["wordIndices"]
        if (not indices or any(i in used for i in indices)
                or any(not isinstance(i, int) or i < 0 or i >= frozen["wordCount"] for i in indices)):
            hold("SCIENTIFIC_TERM_WORDS_OVERLAP_OR_INVALID")
        used.update(indices)
        if (window["startMs"] != frozen["words"][indices[0]]["startMs"]
                or window["endMs"] != frozen["words"][indices[-1]]["endMs"]):
            hold("TERM_WINDOW_MISMATCH_FROZEN_SOURCE")
    return sorted(windows, key=lambda w: (w["startMs"], w["endMs"]))


def pcm_slice(pcm, start_ms, end_ms, frame_rate=SAMPLE_RATE):
    if (frame_rate != SAMPLE_RATE or not isinstance(pcm, bytes) or len(pcm) % 2
            or not all(isinstance(x, (int, float)) and not isinstance(x, bool)
                       and math.isfinite(x) for x in (start_ms, end_ms))
            or not 0 <= start_ms < end_ms):
        hold("INVALID_PCM_OR_WINDOW")
    # Outward sample rounding retains the entire MFA candidate window. No
    # interpolation: each output sample is byte-identical to source PCM.
    start = math.floor(start_ms * SAMPLE_RATE / 1000)
    end = math.ceil(end_ms * SAMPLE_RATE / 1000)
    if start >= end or end > len(pcm) // 2:
        hold("WINDOW_OUTSIDE_ORIGINAL_PCM")
    return start, end, pcm[2 * start:2 * end]


def execute(root, manifest, clip_dir, output):
    clip_dir = Path(clip_dir).resolve()
    output = Path(output).resolve()
    root = Path(root).resolve()
    if (clip_dir.exists() or output.exists()
            or clip_dir.is_relative_to(root) or output.is_relative_to(root)
            or output.is_relative_to(clip_dir) or clip_dir.is_relative_to(output)
            or any(p.is_symlink() for p in (root, *root.parents))):
        hold("FRESH_OUTPUT_OUTSIDE_IMMUTABLE_INPUTS_REQUIRED")
    alignment, wav_path = load_original_alignment(root, manifest)
    source_check(wav_path)
    with wave.open(str(wav_path), "rb") as wav:
        if (wav.getnchannels(), wav.getsampwidth(), wav.getframerate(), wav.getcomptype()) != (1, 2, SAMPLE_RATE, "NONE"):
            hold("ORIGINAL_WAV_PCM_FORMAT_REQUIRED")
        pcm = wav.readframes(wav.getnframes())
        frame_count = wav.getnframes()
    if len(pcm) != frame_count * 2:
        hold("ORIGINAL_PCM_BYTES_TRUNCATED")
    instances = targets(alignment)
    clip_dir.mkdir(parents=True, exist_ok=False)
    result = []
    for index, item in enumerate(instances, 1):
        start, end, fragment = pcm_slice(pcm, item["startMs"], item["endMs"])
        filename = f"term-{index:02d}.wav"
        clip = clip_dir / filename
        with wave.open(str(clip), "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(SAMPLE_RATE)
            wav.writeframes(fragment)
        with wave.open(str(clip), "rb") as wav:
            roundtrip = wav.readframes(wav.getnframes())
            if (wav.getnchannels(), wav.getsampwidth(), wav.getframerate(), wav.getnframes()) != (1, 2, SAMPLE_RATE, end-start):
                hold("CLIP_PCM_FORMAT_OR_DURATION_CHANGED")
        if roundtrip != fragment or fragment != pcm[start*2:end*2]:
            hold("OUTPUT_NOT_EXACT_ORIGINAL_PCM_SLICE")
        result.append({"id": f"EM-014.01-{index:02d}", "term": item["term"],
                       "wordIndices": item["wordIndices"], "startMs": item["startMs"],
                       "endMs": item["endMs"], "startSample": start,
                       "endSampleExclusive": end, "sampleCount": end-start,
                       "pcmSha256": sha(fragment), "clipWavSha256": sha(clip.read_bytes()),
                       "clipFile": filename, "exactSourcePcmMatch": True,
                       "candidateWordTimingOnly": True, "pronunciationVerified": False})
    source_check(wav_path)  # prove no source mutation during processing
    report = {"schema": "ths-em01401-original-pcm-term-inventory-v1",
              "task": "EM-014.01", "sourceWavSha256": WAV_SHA,
              "alignmentRevisionSha256": alignment["revisionSha256"],
              "sampleRate": SAMPLE_RATE, "sourceFrameCount": frame_count,
              "instanceCount": len(result), "instances": result,
              "everyClipIdenticalToOriginalPcmSlice": True,
              "phonemeAccuracyCalibrated": False, "naturalnessApproved": False,
              "voiceApproved": False, "mayPublish": False}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--clips", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    report = execute(args.root, args.manifest, args.clips, args.out)
    print(json.dumps({"status": "PASS_SOURCE_PCM_INSTANCE_ISOLATION_ONLY",
                      "instanceCount": report["instanceCount"],
                      "sourceWavSha256": report["sourceWavSha256"],
                      "pronunciationVerified": False, "mayPublish": False}))


if __name__ == "__main__":
    main()
