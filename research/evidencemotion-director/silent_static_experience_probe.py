#!/usr/bin/env python3
"""Research-only independent finished-MP4 quiet/static co-occurrence detector.

A candidate film can be legal/safe and intentionally pause for reading; a flag is an
experiential REVIEW, never an automatic craft verdict. ALL outcomes hold release.
Do not replace independent editorial, qualified science, real handset, or phonetic QA.
"""
import argparse
import hashlib
import json
import math
import re
import subprocess
from array import array
from fractions import Fraction
from pathlib import Path

HEX = re.compile(r"[a-f0-9]{64}\Z")
FRAME_WIDTH = 96
FRAME_HEIGHT = 170
AUDIO_HZ = 24000
SILENT_FRAME_RMS_DBFS = -75.0
LOW_MOTION_MAE_8BIT = 0.1
MIN_FLAG_SECONDS = 2.5
MAX_FILM_SECONDS = 90


def _hold(message):
    raise ValueError("EXPERIENCE_PROBE_HOLD:" + message)


def _sha(path):
    path = Path(path)
    if path.is_symlink() or any(p.is_symlink() for p in path.parents):
        _hold("UNSAFE_MEDIA_SYMLINK")
    if not path.is_file() or path.stat().st_size == 0:
        _hold("MISSING_MEDIA")
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1048576), b""):
            h.update(block)
    return h.hexdigest()


def _run(args):
    try:
        return subprocess.run(args, capture_output=True, check=True, timeout=90).stdout
    except (OSError, subprocess.SubprocessError) as exc:
        _hold("PHYSICAL_MEDIA_DECODE_FAILED:" + type(exc).__name__)


def _decode_and_probe(path):
    meta = json.loads(_run(["ffprobe", "-v", "error", "-show_streams", "-of", "json", str(path)]))
    streams = meta.get("streams", [])
    if len(streams) != 2 or [s.get("codec_type") for s in streams] != ["video", "audio"]:
        _hold("REQUIRES_EXACTLY_ONE_VIDEO_AND_ONE_AUDIO")
    video, audio = streams
    if video.get("codec_name") != "h264" or audio.get("codec_name") != "aac":
        _hold("UNSUPPORTED_CODEC_MUST_NOT_BE_APPROVED")
    try:
        rate = Fraction(video["avg_frame_rate"])
        if rate != Fraction(video["r_frame_rate"]) or rate <= 0 or rate > 60:
            _hold("UNCALIBRATED_FRAME_RATE")
        n = int(video["nb_frames"])
        duration = Fraction(n, 1) / rate
    except (KeyError, ValueError, ZeroDivisionError, TypeError) as exc:
        _hold("UNKNOWN_FRAME_RATE_OR_FRAME_COUNT:" + type(exc).__name__)
    if n < 30 or n > 5400 or duration > MAX_FILM_SECONDS:
        _hold("OUT_OF_BOUNDS_FILM")
    try:
        if abs(float(video["start_time"])) > 0.01 or abs(float(audio["start_time"])) > 0.01:
            _hold("NONZERO_MEDIA_START_REQUIRES_ALIGNMENT")
    except (KeyError, ValueError, TypeError) as exc:
        _hold("UNKNOWN_STREAM_START:" + type(exc).__name__)
    # Force complete PTS read; average CFR metadata alone is not sufficient.
    stamps = _run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                   "-show_entries", "frame=best_effort_timestamp_time", "-of", "csv=p=0", str(path)])
    try:
        actual = [float(x.strip().split(",")[0]) for x in stamps.decode().splitlines() if x.strip()]
    except (UnicodeError, ValueError) as exc:
        _hold("UNREADABLE_PHYSICAL_PTS:" + type(exc).__name__)
    if len(actual) != n or any(abs(t - float(Fraction(i, 1) / rate)) > 0.001
                                 for i, t in enumerate(actual)):
        _hold("NON_CFR_OR_NONZERO_VID_PTS")
    frames = _run(["ffmpeg", "-nostdin", "-v", "error", "-xerror", "-err_detect", "explode",
                   "-i", str(path), "-map", "0:v:0", "-vf",
                   f"scale={FRAME_WIDTH}:{FRAME_HEIGHT}:flags=area,format=gray",
                   "-an", "-vsync", "0", "-f", "rawvideo", "-pix_fmt", "gray", "-"])
    size = FRAME_WIDTH * FRAME_HEIGHT
    if len(frames) != n * size:
        _hold("UNEXPECTED_DECODED_VIDEO_FRAME_COUNT")
    audio_pcm = _run(["ffmpeg", "-nostdin", "-v", "error", "-xerror", "-err_detect", "explode",
                      "-i", str(path), "-map", "0:a:0", "-vn", "-ac", "1", "-ar", str(AUDIO_HZ),
                      "-f", "s16le", "-"])
    if len(audio_pcm) % 2:
        _hold("ODD_PCM_BYTES")
    pcm = array("h")
    pcm.frombytes(audio_pcm)
    if not math.isclose(len(pcm) / AUDIO_HZ, float(duration), abs_tol=0.15):
        _hold("DECODED_AUDIO_VIDEO_DURATION_MISMATCH")
    return n, rate, frames, pcm


def inspect(*, movie, movie_sha):
    if not isinstance(movie_sha, str) or not HEX.fullmatch(movie_sha):
        _hold("EXTERNAL_MOVIE_SHA_REQUIRED")
    before = _sha(movie)
    if before != movie_sha:
        _hold("EXTERNAL_MOVIE_SHA_MISMATCH")
    n, rate, frames, pcm = _decode_and_probe(movie)
    previous = None
    active = []
    groups = []
    video_size = FRAME_WIDTH * FRAME_HEIGHT
    # Complete-film 30-ish fps PCM RMS and independently decoded visual delta.
    for i in range(n):
        start = (i * AUDIO_HZ * rate.denominator) // rate.numerator
        end = ((i + 1) * AUDIO_HZ * rate.denominator) // rate.numerator
        if end > len(pcm):
            _hold("AUDIO_TRUNCATED_BEFORE_LAST_VIDEO_FRAME")
        group = pcm[start:end]
        rms = math.sqrt(sum(float(v) * v for v in group) / len(group)) / 32768.0
        audio_db = 20 * math.log10(max(rms, 1e-12))
        current = frames[i * video_size:(i + 1) * video_size]
        motion = None if previous is None else sum(abs(a-b) for a, b in zip(previous, current)) / video_size
        previous = current
        quiet_static = (motion is not None and motion <= LOW_MOTION_MAE_8BIT
                        and audio_db <= SILENT_FRAME_RMS_DBFS)
        if quiet_static:
            active.append((i, audio_db, motion))
        elif active:
            groups.append(active)
            active = []
    if active:
        groups.append(active)
    min_frames = math.ceil(MIN_FLAG_SECONDS * rate)
    results = []
    for group in groups:
        if len(group) < min_frames:
            continue
        first, last = group[0][0], group[-1][0]
        results.append({"firstFrame": first, "lastFrameInclusive": last,
                        "startSec": round(float(Fraction(first) / rate), 3),
                        "endExclusiveSec": round(float(Fraction(last + 1) / rate), 3),
                        "durationSec": round(float(Fraction(len(group)) / rate), 3),
                        "maximumFrameMotionMAE8bit": round(max(row[2] for row in group), 6),
                        "loudestFrameRmsDBFS": round(max(row[1] for row in group), 1)})
    if _sha(movie) != before:
        _hold("MOVIE_CHANGED_WHILE_TESTING")
    return {"schema": "ths-em-lane5-decoded-experience-research-v1",
            "movieSha256": before, "physicalAudioAndVideoFramesDecoded": True,
            "videoFrames": n, "fps": str(rate),
            "audioRmsFrameThresholdDbfs": SILENT_FRAME_RMS_DBFS,
            "frameToFrame96x170MotionMaeThreshold8bit": LOW_MOTION_MAE_8BIT,
            "minCoincidentSpanSeconds": MIN_FLAG_SECONDS,
            "silentAndNearStaticSpans": results,
            "needsExperienceReview": bool(results),
            "decision": "RESEARCH_REVIEW_REQUIRED" if results else "NO_LONG_COINCIDENT_GAP_AT_THIS_PROXY",
            "probeIsNotSceneIntentOrCraftJudgment": True,
            "qualifiedScienceAndNativeHandsetReviewComplete": False,
            "mayPublish": False, "firstExcellentMasterAccepted": False,
            "fiveRenderStreakAccepted": False}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--movie", required=True)
    p.add_argument("--movie-sha", required=True)
    p.add_argument("--output", required=True)
    args = p.parse_args()
    result = inspect(movie=args.movie, movie_sha=args.movie_sha)
    Path(args.output).write_text(json.dumps(result, indent=2, sort_keys=True) + "\n")
    print(result["decision"], "candidate intervals:", len(result["silentAndNearStaticSpans"]))


if __name__ == "__main__":
    main()
