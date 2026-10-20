#!/usr/bin/env python3
"""Lane1 current H264 science redline: source-pinned negative pixel replay.

The archived exact baseline was independently viewed showing "No reaction" under
both compounds. Equal decoded pixel crops across all opening frames prove the
candidate did not remove it. DIFFERENT pixels never prove clinical or semantic
accuracy and still require manual/independent review. No auto-science PASS.
"""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

BASELINE_FILM_SHA = "45f86dad98f82dbe0e7e21f831529a8bc4256a8a053bd74a94c5666d03a5e122"
FRAME_COUNT = 1031
INTRO_FRAMES = 105
REGION = (60, 1210, 460, 70)  # native x, y, width, height

class ScienceHold(ValueError):
    pass

def sha256_file(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as src:
        for block in iter(lambda: src.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()

def validate_file(path, expected, *, baseline=False):
    p = Path(path)
    if not p.is_file() or p.is_symlink():
        raise ScienceHold("SOURCE_MUST_BE_REGULAR_NON_SYMLINK_FILM")
    if not isinstance(expected, str) or re.fullmatch(r"[a-f0-9]{64}", expected) is None:
        raise ScienceHold("REQUIRE_FULL_EXACT_ENCODED_FILM_SHA256")
    if baseline and expected != BASELINE_FILM_SHA:
        raise ScienceHold("AMBIGUOUS_INTRO_BASELINE_IDENTITY_NOT_TRUSTED")
    if sha256_file(p) != expected:
        raise ScienceHold("CURRENT_OR_BASELINE_FILM_IDENTITY_CHANGED")
    return p

def extract_intro_crops(movie):
    """Physically decode 105 complete native 460x70 RGB24 frame crops."""
    probe = subprocess.run([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=codec_name,width,height,r_frame_rate,nb_frames",
        "-of", "json", str(movie)],
        capture_output=True, text=True, check=True, timeout=20)
    try:
        stream = json.loads(probe.stdout)["streams"][0]
        right_stream = (stream["codec_name"] == "h264"
                        and stream["width"] == 1080
                        and stream["height"] == 1920
                        and stream["r_frame_rate"] == "30/1"
                        and int(stream["nb_frames"]) == FRAME_COUNT)
    except (ValueError, KeyError, IndexError, TypeError):
        right_stream = False
    if not right_stream:
        raise ScienceHold("CURRENT_FILM_NATIVE_FRAME_IDENTITY_HOLD")
    x, y, width, height = REGION
    decode = subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error",
        "-threads", "1", "-filter_threads", "1",
        "-i", str(movie), "-map", "0:v:0", "-an",
        "-vf", f"crop={width}:{height}:{x}:{y},format=rgb24",
        "-frames:v", str(INTRO_FRAMES), "-f", "rawvideo", "pipe:1"],
        check=True, capture_output=True, timeout=110)
    length = width * height * 3
    if len(decode.stdout) != length * INTRO_FRAMES:
        raise ScienceHold("ENCODED_CAPTION_DECODE_SHORT_TRUNCATED_OR_EXTRA")
    return [decode.stdout[i*length:(i+1)*length]
            for i in range(INTRO_FRAMES)]

def classify_actual_crops(previous, current):
    if (len(previous) != INTRO_FRAMES or len(current) != INTRO_FRAMES
        or any(not isinstance(x, bytes) or len(x) != REGION[2]*REGION[3]*3
               for x in previous + current)):
        raise ScienceHold("EXACT_NATIVE_INTRO_PIXELS_REQUIRED")
    exact_frames = [i for i, (a, b) in enumerate(zip(previous, current))
                    if a == b]
    return {
        "scienceVerdict": ("HOLD_UNCHANGED_KNOWN_AMBIGUOUS_CAPTION"
                           if len(exact_frames) == INTRO_FRAMES else
                           "HOLD_CHANGED_PIXELS_REQUIRE_NEW_SEMANTIC_REVIEW"),
        "physicallyDecodedCaptionCropFramesEach": INTRO_FRAMES,
        "identicalNativeRgbCaptionFrameCount": len(exact_frames),
        "identicalFrameIndices": exact_frames,
        "priorOrderedNativeRgbCaptionSequenceSha256": hashlib.sha256(b"".join(previous)).hexdigest(),
        "currentOrderedNativeRgbCaptionSequenceSha256": hashlib.sha256(b"".join(current)).hexdigest(),
        "currentFilmMeaningAutomaticallyProven": False,
        "allCurrentFilmFramesSemanticallyReviewed": False,
        "qualifiedIndependentScientificReviewCompleted": False,
        "currentIntroScienceApproved": False,
        "externalIndependentReviewed": False,
        "mayPublish": False,
        "newAtomicWorkcardCredit": 0,
    }

def audit(previous, current, expected_current_sha):
    previous = validate_file(previous, BASELINE_FILM_SHA, baseline=True)
    current = validate_file(current, expected_current_sha)
    if previous.resolve() == current.resolve():
        raise ScienceHold("PREVIOUS_AND_CURRENT_FILM_MUST_BE_DISTINCT")
    old = extract_intro_crops(previous)
    new = extract_intro_crops(current)
    return {
        "schema": "ths-em00707-current-movie-ambiguous-opening-physical-negative-v1",
        "previousFilmSha256": BASELINE_FILM_SHA,
        "currentFilmSha256": expected_current_sha,
        "scientificIssueId": "L1-R01",
        "reportedOriginalCaptionTextFromManualBaselineInspection": "No reaction",
        "originalCaptionInterpretableAsNoBiologicalReaction": True,
        "baselineCaptionRegionNative": dict(zip(("x","y","width","height"), REGION)),
        "baselineCaptionSourceKnownOnlyForThisExactArchivedFilm": True,
        "pixelIdentityDoesNotRecognizeTextOrViewerUnderstanding": True,
        **classify_actual_crops(old, new),
    }

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--known-bad-baseline-film", required=True)
    p.add_argument("--current-film", required=True)
    p.add_argument("--current-film-sha256", required=True)
    args = p.parse_args()
    print(json.dumps(audit(args.known_bad_baseline_film,
                           args.current_film, args.current_film_sha256),
                     sort_keys=True, indent=2))

if __name__ == "__main__":
    main()
