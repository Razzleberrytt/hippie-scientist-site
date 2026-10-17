#!/usr/bin/env python3
"""EvidenceMotion research-only actual-MP4 autonomous visual negative critic.

This is a deterministic, reproducible *screening* tool, not a learned aesthetic
model or proof of accessible/beautiful cinematography. It autonomously raises
actionable visual REVISE signals, with SHA-bound decoded media and time windows,
without requiring a human to detect repeated frames. No release authority.
"""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

SAMPLE_STEP_SECONDS = 2
FRAME_W, FRAME_H = 180, 320
EDGE_MATCH_LIMIT = 0.95
HIGH_REPETITION_FRAC = 0.45
MIN_SUSTAINED_REPEATED_PAIRS = 3  # 3 * 2s = 6s, even if global fraction stays below .45
MIN_VISIBLE_SUBJECT_STD = 4.5
# Separate the teaching subject from decorative motion INSIDE the broad body.
# These fixed coordinates are a provisional negative-screen for centered hero
# art, not a universal composition requirement (off-center stages may be valid).
CENTER_HERO_BOX = (58, 86, 122, 190)  # x0,y0,x1,y1 at 180x320
CENTER_HERO_MATCH_LIMIT = 0.985
MIN_MASKED_HERO_REPEAT_PAIRS = 3  # 6s at the existing 2s cadence
TWO_STATE_MATCH_LIMIT = 0.985  # sampled A/B/A/B loop advisory
MIN_TWO_STATE_MATCHED_PAIRS = 4  # needs six sampled layouts
MIN_SEC, MAX_SEC = 12, 90


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def similarity(p, q):
    np_norm = float(np.linalg.norm(p) * np.linalg.norm(q))
    if np_norm <= 1.e-12:
        return 1.0 if np.array_equal(p, q) else 0.0
    return float(np.dot(p, q) / np_norm)


def review_decoded_samples(samples):
    """Actual decoded grayscale frame samples; callers may construct test frames.

    Exclude persistent header, lower subtitle/UI region, and outer 5 pixels so
    repeating brand chrome cannot constitute subject movement/hero progression.
    A content-static film can be REVISE even with an animated logo or captions.
    """
    frames = np.asarray(samples, dtype=np.uint8)
    if frames.ndim != 3 or frames.shape[1:] != (FRAME_H, FRAME_W) or len(frames) < 4:
        raise ValueError("ACTUAL_DECODED_SAMPLES_REQUIRED")
    vectors, visible_stds, center_vectors, center_stds = [], [], [], []
    for arr in frames:
        subject = arr[33:226, 6:174]
        visible_stds.append(float(subject.std()))
        x0, y0, x1, y1 = CENTER_HERO_BOX
        center_stds.append(float(arr[y0:y1, x0:x1].std()))
        edge = np.asarray(Image.fromarray(arr).filter(ImageFilter.FIND_EDGES)).copy()
        edge[:33, :] = 0
        edge[226:, :] = 0
        edge[:, :5] = 0
        edge[:, 175:] = 0
        vectors.append(edge.reshape(32, 10, 18, 10).mean(axis=(1, 3)).ravel().astype(np.float64))
        # 104x64 -> 13x8 bins of 8x8 pixels. Core motion is measured
        # separately so moving peripheral lines cannot certify hero progress.
        core = edge[y0:y1, x0:x1]
        center_vectors.append(core.reshape(13, 8, 8, 8).mean(axis=(1, 3)).ravel().astype(np.float64))
    similarities = [similarity(a, b) for a, b in zip(vectors, vectors[1:])]
    repeated = [i for i, sim in enumerate(similarities) if sim > EDGE_MATCH_LIMIT]
    repetition_fraction = len(repeated) / len(similarities)
    # A long local visual plateau is unacceptable even when fast cuts elsewhere
    # dilute the whole-film repeat fraction. Preserve contiguous pair windows.
    def consecutive_runs(indices):
        result, current = [], []
        for i in indices:
            if current and i != current[-1] + 1:
                result.append(current)
                current = []
            current.append(i)
        if current:
            result.append(current)
        return result

    runs = consecutive_runs(repeated)
    sustained = [run for run in runs if len(run) >= MIN_SUSTAINED_REPEATED_PAIRS]
    center_matches = [similarity(a, b) for a, b in zip(center_vectors, center_vectors[1:])]
    masked_core_pairs = [
        i for i, (broad, core) in enumerate(zip(similarities, center_matches))
        if broad <= EDGE_MATCH_LIMIT and core >= CENTER_HERO_MATCH_LIMIT
        and min(center_stds[i], center_stds[i + 1]) >= MIN_VISIBLE_SUBJECT_STD
    ]
    # Advisory, not an automatic artistic veto: a deliberately held source
    # card or a focal subject located elsewhere can be good direction.
    masked_core_runs = [run for run in consecutive_runs(masked_core_pairs)
                        if len(run) >= MIN_MASKED_HERO_REPEAT_PAIRS]
    # A/B/A/B cycles can evade consecutive-pair screening despite static ideas.
    # This is advisory: deliberate comparisons can be appropriate teaching.
    two_state_pairs = [
        i for i in range(len(vectors) - 2)
        if min(visible_stds[i:i + 3]) >= MIN_VISIBLE_SUBJECT_STD
        and similarities[i] <= EDGE_MATCH_LIMIT
        and similarities[i + 1] <= EDGE_MATCH_LIMIT
        and similarity(vectors[i], vectors[i + 2]) >= TWO_STATE_MATCH_LIMIT
    ]
    two_state_runs = [run for run in consecutive_runs(two_state_pairs)
                      if len(run) >= MIN_TWO_STATE_MATCHED_PAIRS]
    longest_run_sec = max((len(run) for run in runs), default=0) * SAMPLE_STEP_SECONDS
    empty_subject = float(np.median(visible_stds)) < MIN_VISIBLE_SUBJECT_STD
    issues = []
    if empty_subject:
        issues.append("MISSING_RECOGNIZABLE_SUBJECT_OR_NEAR_BLANK_CENTRAL_STAGE")
    if repetition_fraction >= HIGH_REPETITION_FRAC:
        issues.append("REPETITIVE_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR")
    if sustained:
        issues.append("SUSTAINED_REPEATED_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR")
    return {
        "samples": len(frames),
        "sampleEverySeconds": SAMPLE_STEP_SECONDS,
        "repeatedSamplePairsStartSec": [i * SAMPLE_STEP_SECONDS for i in repeated],
        "highEdgeSimilarityFraction": round(repetition_fraction, 4),
        "medianSubjectLayoutSimilarity": round(float(np.median(similarities)), 4),
        "medianSubjectGrayscaleStd": round(float(np.median(visible_stds)), 3),
        "layoutRepetitionThreshold": HIGH_REPETITION_FRAC,
        "longestRepeatedLayoutRunSec": longest_run_sec,
        "sustainedLayoutThresholdSec": MIN_SUSTAINED_REPEATED_PAIRS * SAMPLE_STEP_SECONDS,
        "sustainedRepeatWindowsSec": [
            {"startSec": run[0] * SAMPLE_STEP_SECONDS,
             "endSec": (run[-1] + 1) * SAMPLE_STEP_SECONDS,
             "repeatedPairCount": len(run)} for run in sustained
        ],
        "centerHeroProbeBoxPixels": list(CENTER_HERO_BOX),
        "centerHeroStasisPeripheralMotionWindowsSec": [
            {"startSec": run[0] * SAMPLE_STEP_SECONDS,
             "endSec": (run[-1] + 1) * SAMPLE_STEP_SECONDS,
             "repeatedPairCount": len(run)} for run in masked_core_runs
        ],
        "twoStateAlternationWindowsSec": [
            {"startSec": run[0] * SAMPLE_STEP_SECONDS,
             "endSec": (run[-1] + 2) * SAMPLE_STEP_SECONDS,
             "lagTwoMatchedPairs": len(run)} for run in two_state_runs
        ],
        "reviewCandidates": (
            (["CENTERED_TEACHING_HERO_STASIS_MASKED_BY_PERIPHERAL_MOTION"]
             if masked_core_runs else []) +
            (["TWO_STATE_LAYOUT_OSCILLATION_WITHOUT_VISUAL_PROGRESSION"]
             if two_state_runs else [])),
        "twoStateScope": "2s-sampled lag-two negative advisory; deliberate A/B teaching may be valid and intermediate frames are not exhaustively judged. Never quality approval.",
        "centerHeroScope": "A centered-hero 2s-sampled negative advisory; intentional holds and off-center subjects require separate source-bound craft reasoning. Never a quality PASS.",
        "issues": issues,
        "critiqueScope": "AUTONOMOUS_ACTUAL_PIXELS_NEGATIVE_SCREENING_NOT_HUMAN_QUALITY",
    }


def analyze_video(path, expected_sha=None):
    """Measure actual MP4; abort on decoder errors or a wrong pinned file."""
    path = Path(path)
    if not path.is_file() or path.is_symlink():
        raise ValueError("ACTUAL_REGULAR_VIDEO_REQUIRED")
    source_sha = sha256(path)
    if expected_sha is not None and source_sha != expected_sha:
        raise ValueError("VIDEO_IDENTITY_CHANGED")
    probe = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_streams", "-show_format",
        "-of", "json", str(path)], timeout=30))
    videos = [s for s in probe.get("streams", []) if s.get("codec_type") == "video"]
    if len(videos) != 1:
        raise ValueError("EXACTLY_ONE_VIDEO_STREAM_REQUIRED")
    v = videos[0]
    duration = float(probe.get("format", {}).get("duration", 0))
    if not MIN_SEC <= duration <= MAX_SEC:
        raise ValueError("BOUND_VIDEO_DURATION_REQUIRED")
    if int(v.get("width", 0)) < 180 or int(v.get("height", 0)) < 320:
        raise ValueError("ACTUAL_VIDEO_TOO_SMALL")
    # Sampling is a craft negative-screen; this separately decodes the WHOLE
    # media stream, not just sample points, to reject damaged or incomplete A/V.
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin",
        "-xerror", "-i", str(path), "-f", "null", "-"],
        check=True, capture_output=True, timeout=90)
    raw = subprocess.check_output([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin",
        "-xerror", "-i", str(path), "-vf",
        f"fps=1/{SAMPLE_STEP_SECONDS},scale={FRAME_W}:{FRAME_H},format=gray",
        "-f", "rawvideo", "-pix_fmt", "gray", "pipe:1"], timeout=90)
    size = FRAME_W * FRAME_H
    if not raw or len(raw) % size:
        raise ValueError("INCOMPLETE_DECODED_SAMPLE_GRID")
    frames = np.frombuffer(raw, dtype=np.uint8).reshape(-1, FRAME_H, FRAME_W)
    result = review_decoded_samples(frames)
    result.update({
        "schemaVersion": "ths-autonomous-film-critic-research-v1",
        "actualVideoSha256": source_sha,
        "actualDurationSeconds": round(duration, 5),
        "actualSourceResolution": [int(v["width"]), int(v["height"])],
        "decision": ("AUTO_REVISE" if result["issues"]
                     else "CRAFT_REVIEW_HOLD" if result["reviewCandidates"]
                     else "AWAIT_MULTIMODAL_SCIENCE_VOICE_CRAFT_EVIDENCE"),
        "negativeFindingsDoNotRequireOwnerVerdict": True,
        "automaticallyApprovedScientificClaims": False,
        "automaticallyApprovedNaturalVoice": False,
        "automaticallyApprovedPremiumCraft": False,
        "mayPublish": False,
        "excellentFirstRenderCredited": False,
    })
    return result


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("video")
    p.add_argument("--expected-sha")
    p.add_argument("--out")
    args = p.parse_args()
    report = analyze_video(args.video, args.expected_sha)
    if args.out:
        Path(args.out).write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))
