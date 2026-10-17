#!/usr/bin/env python3
"""Lane 5: exact-byte decoded-film intake and research-only acceptance scoreboard.

This unifies machine evidence, not a qualified scientific, aesthetic, phonetic
or physical-device review. Never authorizes publication, promotion or atomic
completion. Other lanes must review the SAME immutable film/audio/story.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import tempfile
import wave

from original_replay_admission import strict_json

HEX = re.compile(r"^[0-9a-f]{64}$")
DOMAINS = ("science", "voice", "craft", "mobile", "handoff")
SCHEMA = "ths-em-lane5-candidate-machine-scorecard-v1"
FPS = 30
NATIVE = (1080, 1920, 1031)
MAX_JSON = 3_000_000


def hold(reason):
    raise ValueError("LANE5_CANDIDATE_HOLD:" + reason)


def _safe_file(path, *, maximum=None):
    p = Path(path)
    if p.is_symlink() or any(x.is_symlink() for x in p.parents):
        hold("UNTRUSTED_FILE_ALIAS")
    try:
        s = p.stat()
    except OSError:
        hold("INPUT_MISSING")
    if not stat.S_ISREG(s.st_mode) or s.st_size < 1:
        hold("UNSAFE_OR_EMPTY_INPUT")
    if maximum is not None and s.st_size > maximum:
        hold("UNBOUNDED_INPUT")
    return s


def _physical_sha(path):
    before = _safe_file(path)
    d = hashlib.sha256()
    with open(path, "rb") as f:
        fd = os.fstat(f.fileno())
        if (fd.st_dev, fd.st_ino) != (before.st_dev, before.st_ino):
            hold("FILE_CHANGED_BEFORE_READ")
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            d.update(chunk)
        after_fd = os.fstat(f.fileno())
    after = _safe_file(path)
    signature = lambda s: (s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns, s.st_ctime_ns)
    if signature(before) != signature(after_fd) or signature(before) != signature(after):
        hold("FILE_CHANGED_DURING_REVIEW")
    return d.hexdigest()


def _read_json(path, expected_sha=None):
    if expected_sha is not None and not HEX.fullmatch(expected_sha):
        hold("INVALID_EXPECTED_JSON_SHA")
    _safe_file(path, maximum=MAX_JSON)
    raw = Path(path).read_bytes()
    if len(raw) > MAX_JSON:
        hold("UNBOUNDED_JSON")
    sha = _physical_sha(path)
    if hashlib.sha256(raw).hexdigest() != sha:
        hold("JSON_CHANGED_DURING_READ")
    if expected_sha is not None and sha != expected_sha:
        hold("JSON_PIN_MISMATCH")
    try:
        obj = strict_json(raw.decode("utf-8"))
    except (UnicodeError, ValueError) as exc:
        hold("INVALID_JSON:" + str(exc))
    if not isinstance(obj, dict):
        hold("JSON_ROOT_NOT_OBJECT")
    return obj, sha


def _same_pin(path, pin):
    if not isinstance(pin, str) or not HEX.fullmatch(pin):
        hold("MISSING_INDEPENDENT_EXPECTED_SHA")
    value = _physical_sha(path)
    if value != pin:
        hold("SOURCE_BYTES_DO_NOT_MATCH_EXTERNAL_PIN")
    return value


def _physical_av(movie, dimensions=NATIVE):
    """Probe then strictly decode both real tracks, and rehash after decoding."""
    if (len(dimensions) != 3 or any(type(i) is not int or i < 1 for i in dimensions)):
        hold("INVALID_EXPECTED_DIMENSIONS")
    width, height, frames = dimensions
    pinned = _physical_sha(movie)
    try:
        p = subprocess.run([
            "/usr/bin/ffprobe", "-v", "error", "-count_frames",
            "-show_entries",
            "stream=codec_type,codec_name,width,height,pix_fmt,avg_frame_rate,nb_read_frames,sample_rate",
            "-of", "json", str(movie)
        ], text=True, capture_output=True, timeout=60, check=True)
        streams = strict_json(p.stdout)["streams"]
    except (OSError, subprocess.SubprocessError, ValueError, KeyError) as exc:
        hold("PHYSICAL_AV_PROBE_FAILED:" + type(exc).__name__)
    if not isinstance(streams, list) or len(streams) != 2:
        hold("UNEXPECTED_MEDIA_TRACKS")
    v = [s for s in streams if isinstance(s, dict) and s.get("codec_type") == "video"]
    a = [s for s in streams if isinstance(s, dict) and s.get("codec_type") == "audio"]
    if (len(v) != 1 or len(a) != 1
            or v[0].get("codec_name") != "h264"
            or v[0].get("pix_fmt") != "yuv420p"
            or (v[0].get("width"), v[0].get("height")) != (width, height)
            or v[0].get("avg_frame_rate") != "30/1"
            or v[0].get("nb_read_frames") != str(frames)
            or a[0].get("codec_name") != "aac"):
        hold("PHYSICAL_AV_GEOMETRY_OR_CODEC_DRIFT")
    try:
        subprocess.run([
            "/usr/bin/ffmpeg", "-nostdin", "-hide_banner",
            "-v", "error", "-xerror", "-err_detect", "explode",
            "-i", str(movie), "-map", "0:v:0", "-map", "0:a:0",
            "-f", "null", "-"
        ], capture_output=True, timeout=180, check=True)
    except (OSError, subprocess.SubprocessError):
        hold("PHYSICAL_AV_DECODE_FAILED")
    if _physical_sha(movie) != pinned:
        hold("FILM_CHANGED_DURING_DECODE")
    return {"fullVideoAudioPhysicalDecode": True, "nativeFrames": frames,
            "width": width, "height": height, "fps": FPS,
            "audioCodec": "aac"}


def _screen_stats(screen, film_sha, story_sha, frames):
    if (screen.get("schema") != "ths-em-lane4-full-film-right-strip-negative-screen-v1"
            or screen.get("filmSha256") != film_sha
            or screen.get("storyboardSha256") != story_sha
            or screen.get("strictFullH264AndAACDecodePassed") is not True
            or screen.get("decodedVideoFrames") != frames
            or screen.get("mayPublish") is not False
            or screen.get("rightBoundaryX") != 864
            or screen.get("verticalReviewWindow") != [192, 1573]):
        hold("CROSS_FILM_OR_UNSCOPED_MOBILE_SCREEN")
    observations = screen.get("perFrame")
    if not isinstance(observations, list) or len(observations) != frames:
        hold("INCOMPLETE_SCREEN_FRAME_INVENTORY")
    bright, highlighted = [], []
    for i, row in enumerate(observations):
        if not isinstance(row, dict) or type(row.get("frameIndex")) is not int or row["frameIndex"] != i:
            hold("SCREEN_FRAME_SEQUENCE_DRIFT")
        b, c = row.get("rightStripBrightNeutralPixels"), row.get("rightStripHighlightedPixels")
        if any(type(n) is not int or n < 0 or n > 1080 * 1920 for n in (b, c)):
            hold("INVALID_PIXEL_OBSERVATION")
        if b:
            bright.append(i)
        if c:
            highlighted.append(i)
    if (screen.get("brightNeutralPositiveFrameCount") != len(bright)
            or screen.get("highlightedPositiveFrameCount") != len(highlighted)):
        hold("SCREEN_SUMMARY_CONTRADICTS_FRAMES")
    return bright, highlighted


def _windows(indices):
    if not indices:
        return []
    groups = [[indices[0], indices[0]]]
    for n in indices[1:]:
        if n == groups[-1][1] + 1:
            groups[-1][1] = n
        else:
            groups.append([n, n])
    return [{"firstFrame": start, "lastFrame": end,
             "firstSecond": round(start / FPS, 3),
             "endSecondExclusive": round((end + 1) / FPS, 3),
             "frames": end - start + 1} for start, end in groups]


def score_candidate(*, film, wav, story_path, screen_path,
                    expected_film_sha, expected_wav_sha, expected_story_sha,
                    expected_screen_sha, previous_screen_path=None,
                    expected_previous_screen_sha=None, dimensions=NATIVE):
    """Return an explicitly non-promotable scorecard for one physically decoded film."""
    film_sha = _same_pin(film, expected_film_sha)
    wav_sha = _same_pin(wav, expected_wav_sha)
    story, story_sha = _read_json(story_path, expected_story_sha)
    screen, screen_sha = _read_json(screen_path, expected_screen_sha)
    if (story.get("schema") != "ths-lane3-research-visual-treatment-story-v1"
            or story.get("encodedH264Sha256") != film_sha
            or len(story.get("shots", [])) != 9
            or story.get("mayPublish") is not False
            or story.get("realPhonePlaybackVerified") is not False
            or story.get("independentCraftCalibrationPassed") is not False):
        hold("UNTRUSTED_OR_CROSS_FILM_STORY")
    with wave.open(str(wav), "rb") as w:
        if (w.getnchannels(), w.getsampwidth(), w.getframerate()) != (1, 2, 24000):
            hold("ORIGINAL_WAV_FORMAT_DRIFT")
        wav_samples = w.getnframes()
    av = _physical_av(film, dimensions)
    bright, colors = _screen_stats(screen, film_sha, story_sha, dimensions[2])
    previous = None
    if (previous_screen_path is None) != (expected_previous_screen_sha is None):
        hold("PREVIOUS_SCREEN_AND_PIN_REQUIRED_TOGETHER")
    if previous_screen_path is not None:
        prior, prior_sha = _read_json(previous_screen_path, expected_previous_screen_sha)
        previous_film = prior.get("filmSha256")
        if previous_film == film_sha or not isinstance(previous_film, str) or not HEX.fullmatch(previous_film):
            hold("INVALID_PRIOR_FILM_IDENTITY")
        previous = {
            "priorFilmSha256": previous_film,
            "previousScreenSha256": prior_sha,
            "priorReportedBrightFrames": prior.get("brightNeutralPositiveFrameCount"),
            "priorReportedHighlightFrames": prior.get("highlightedPositiveFrameCount"),
        }
        if (type(previous["priorReportedBrightFrames"]) is not int
                or type(previous["priorReportedHighlightFrames"]) is not int
                or not 0 <= previous["priorReportedBrightFrames"] <= dimensions[2]
                or not 0 <= previous["priorReportedHighlightFrames"] <= dimensions[2]):
            hold("PRIOR_SCREEN_COUNT_INVALID")
        previous["brightFrameDelta"] = len(bright) - previous["priorReportedBrightFrames"]
        previous["highlightFrameDelta"] = len(colors) - previous["priorReportedHighlightFrames"]
    blockers = []
    if bright:
        blockers.append("BRIGHT_CRITICAL_CANDIDATES_RIGHT_APP_EXCLUSION")
    if colors:
        blockers.append("COLOR_RIGHT_EXCLUSION_REQUIRES_SEMANTIC_CLASSIFICATION")
    if story.get("phonePlanSha256") is None:
        blockers.append("AUTHENTICATED_CURRENT_PHONE_PLAN_MISSING")
    # Cross-lane identity and independent source/phone/craft gates cannot be
    # established by this same-process research scorecard.
    blockers += ["INDEPENDENT_SCIENCE_AND_CLAIM_REVIEW_MISSING",
                 "ACTUAL_PCM_TO_AAC_PHONETIC_AND_CAPTION_REVIEW_MISSING",
                 "CALIBRATED_INDEPENDENT_CRAFT_REVIEW_MISSING",
                 "REAL_HANDSET_REVIEW_MISSING",
                 "SIX_LANE_INDEPENDENT_EXACT_BYTE_RECEIPTS_INCOMPLETE"]
    return {
        "schema": SCHEMA, "status": "RESEARCH_HOLD_NO_PROMOTION",
        "filmSha256": film_sha, "originalWavSha256": wav_sha,
        "storySha256": story_sha, "mobileScreenSha256": screen_sha,
        "originalWavSamplesAt24000Hz": wav_samples,
        "observedTechnicalMedia": av,
        "machineReviewed": True, "externalIndependentReviewed": False,
        "physicalPhoneReviewed": False, "firstFinalRenderProven": False,
        "firstExcellentMasterAccepted": False, "fiveRenderStreakAccepted": False,
        "mayPublish": False, "atomicCardsNewlyAccepted": 0,
        "rightExclusionProxy": {
            "boundaryX": 864, "neutralBrightFrames": len(bright),
            "neutralBrightIntervals": _windows(bright),
            "coloredHighlightFrames": len(colors),
            "coloredHighlightIntervals": _windows(colors),
            "qualifiedSemanticLegibilityVerdict": "UNVERIFIED",
            "measurementLimit": "Pixel-threshold proxy; no semantic OCR or actual platform UI"
        },
        "priorCandidateComparison": previous,
        "calibratedPremiumCraftScore": None,
        "hardAndReviewHolds": blockers,
        "nextDependency": "LANE6_SAME_FILM_AUTHENTICATED_PHONE_PLAN_AND_CROSS_LANE_RECEIPTS",
    }


def write_once(path, report):
    if report.get("schema") != SCHEMA or report.get("mayPublish") is not False:
        hold("UNSAFE_SCORECARD")
    output = Path(path)
    if (output.exists() or output.is_symlink() or not output.parent.is_dir()
            or any(p.is_symlink() for p in output.parents)):
        hold("SCORECARD_OUTPUT_UNSAFE")
    blob = (json.dumps(report, indent=2, allow_nan=False) + "\n").encode()
    tmp = None
    try:
        with tempfile.NamedTemporaryFile(dir=output.parent, prefix=".em-l5-",
                                         delete=False) as f:
            tmp = Path(f.name)
            f.write(blob)
            f.flush()
            os.fsync(f.fileno())
        os.link(tmp, output)
    finally:
        if tmp is not None:
            tmp.unlink(missing_ok=True)
    return output


def main():
    p = argparse.ArgumentParser()
    for key in ("film", "wav", "story_path", "screen_path", "expected_film_sha",
                "expected_wav_sha", "expected_story_sha", "expected_screen_sha"):
        p.add_argument("--" + key.replace("_", "-"), required=True)
    p.add_argument("--previous-screen-path")
    p.add_argument("--expected-previous-screen-sha")
    p.add_argument("--out", required=True)
    a = p.parse_args()
    result = score_candidate(**{
        key: getattr(a, key) for key in (
            "film", "wav", "story_path", "screen_path",
            "expected_film_sha", "expected_wav_sha",
            "expected_story_sha", "expected_screen_sha",
            "previous_screen_path", "expected_previous_screen_sha"
        )
    })
    write_once(a.out, result)
    print(result["status"], result["filmSha256"])


if __name__ == "__main__":
    main()
