#!/usr/bin/env python3
"""Lane 5: exact-byte decoded-film intake and research-only acceptance scoreboard.

This unifies machine evidence, not a qualified scientific, aesthetic, phonetic
or physical-device review. Never authorizes publication, promotion or atomic
completion. Other lanes must review the SAME immutable film/audio/story.
"""
import argparse
from decimal import Decimal, InvalidOperation
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
        # Metadata can miss same-size writes with restored mtime within one tick.
        f.seek(0)
        confirmation = hashlib.sha256()
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            confirmation.update(chunk)
        if d.digest() != confirmation.digest():
            hold("FILE_CHANGED_DURING_REVIEW")
        after_fd = os.fstat(f.fileno())
    after = _safe_file(path)
    signature = lambda s: (s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns, s.st_ctime_ns)
    # Windows path stat and descriptor stat can expose different ctime semantics.
    # Compare each surface with itself; retain both mutation checks.
    if signature(fd) != signature(after_fd) or signature(before) != signature(after):
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



def _decoded_audio_coverage(movie, sample_rate, expected_frames):
    """Require real decoded AAC samples to span the physical 30fps video.

    FFmpeg succeeds on a video with a short but valid audio stream; that is not
    full-film narration coverage. Inspect every decoded audio frame's clock
    and sample count rather than trusting container stream duration metadata.
    Does not judge words, intelligibility or audible voice quality.
    """
    if type(sample_rate) is not int or not 8000 <= sample_rate <= 192000:
        hold("INVALID_AUDIO_SAMPLE_RATE")
    try:
        result = subprocess.run([
            "/usr/bin/ffprobe", "-v", "error", "-select_streams", "a:0",
            "-show_frames", "-show_entries",
            "frame=best_effort_timestamp_time,nb_samples",
            "-of", "json", str(movie)
        ], text=True, capture_output=True, timeout=60, check=True)
        if len(result.stdout) > 2_000_000:
            hold("UNBOUNDED_AUDIO_FRAME_INVENTORY")
        observations = strict_json(result.stdout)["frames"]
    except (OSError, subprocess.SubprocessError, ValueError, KeyError) as exc:
        if str(exc).startswith("LANE5_CANDIDATE_HOLD:"):
            raise
        hold("DECODED_AUDIO_FRAME_PROBE_FAILED:" + type(exc).__name__)
    if not isinstance(observations, list) or not 1 <= len(observations) <= 30000:
        hold("MISSING_OR_UNBOUNDED_DECODED_AUDIO")
    total_samples = 0
    initial = previous_end = None
    discontinuities = []
    cumulative_discontinuity = Decimal(0)
    for index, frame in enumerate(observations):
        if (not isinstance(frame, dict)
                or type(frame.get("nb_samples")) is not int
                or not 0 < frame["nb_samples"] <= 8192
                or not isinstance(frame.get("best_effort_timestamp_time"), str)):
            hold("INVALID_DECODED_AUDIO_FRAME:" + str(index))
        try:
            start = Decimal(frame["best_effort_timestamp_time"])
        except InvalidOperation:
            hold("NONNUMERIC_DECODED_AUDIO_PTS")
        if not start.is_finite():
            hold("NONFINITE_DECODED_AUDIO_PTS")
        end = start + Decimal(frame["nb_samples"]) / Decimal(sample_rate)
        if previous_end is None:
            initial = start
        else:
            drift = start - previous_end
            if abs(drift) > Decimal("0.050"):
                hold("DECODED_AUDIO_TIMELINE_GAP_OR_OVERLAP")
            # Timestamp rounding at ffprobe's six-decimal precision can
            # introduce <1 microsecond noise. Larger systematic <12ms drifts
            # still deserve source review: repetition can be much worse than
            # one visibly large gap, even if the film's end-time looks right.
            if abs(drift) > Decimal("0.001"):
                cumulative_discontinuity += abs(drift)
                if cumulative_discontinuity > Decimal("0.080"):
                    hold("EXCESS_CUMULATIVE_DECODED_AUDIO_PTS_DRIFT")
                discontinuities.append({
                    "audioFrameIndex": index,
                    "startSeconds": round(float(start), 6),
                    "signedGapMs": round(float(drift * 1000), 3),
                })
        previous_end = end
        total_samples += frame["nb_samples"]
    movie_end = Decimal(expected_frames) / Decimal(FPS)
    if initial < Decimal("-0.09") or initial > Decimal("0.08"):
        hold("DECODED_AUDIO_START_MISALIGNED")
    if previous_end < movie_end - Decimal("0.08"):
        hold("DECODED_AUDIO_EARLY_EOF")
    if previous_end > movie_end + Decimal("0.50"):
        hold("DECODED_AUDIO_OVERRUN")
    return {
        "decodedAudioFrameCount": len(observations),
        "decodedAudioSamples": total_samples,
        "audioDecodedStartSeconds": round(float(initial), 6),
        "audioDecodedEndSeconds": round(float(previous_end), 6),
        "videoEndSeconds": round(float(movie_end), 6),
        "audioCoverageTechnicallyComplete": True,
        "audioPtsAnomalyCount": len(discontinuities),
        "audioPtsAnomaliesNeedSourceReview": bool(discontinuities),
        "audioPtsAnomalies": discontinuities,
    }


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
    try:
        sr = int(a[0].get("sample_rate", "0"))
    except (TypeError, ValueError):
        hold("INVALID_AUDIO_SAMPLE_RATE")
    audio = _decoded_audio_coverage(movie, sr, frames)
    if _physical_sha(movie) != pinned:
        hold("FILM_CHANGED_DURING_DECODE")
    return {"fullVideoAudioPhysicalDecode": True, "nativeFrames": frames,
            "width": width, "height": height, "fps": FPS,
            "audioCodec": "aac", **audio}


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



SOURCE_CARD_LINES = frozenset((
    "mitragynine_cid_line", "pubchem_heading", "seven_oh_cid_line",
    "cid_definition_line", "molecular_formula", "pubchem_source_url"))
SOURCE_CARD_FRAMES = 116
SOURCE_CARD_SCHEMA = "ths-lane4-source-card-native-ink-proxy-v1"


def _strict_source_card_ink(report, film_sha):
    """Verify the L4 physical-review inventory before deriving any gain.

    Values are externally measured research proxies, NOT OCR or a human
    readability certificate. Actual decoded movie authenticity is established
    separately by Lane4 and by score_candidate's exact-film media check.
    """
    if (not isinstance(report, dict) or report.get("schema") != SOURCE_CARD_SCHEMA
            or report.get("filmSha256") != film_sha
            or report.get("decodedFrameWindow") != [822, 937]
            or type(report.get("physicallyInspectedFrames")) is not int
            or report["physicallyInspectedFrames"] != SOURCE_CARD_FRAMES
            or report.get("nativeRegion") != [60, 680, 750, 1200]
            or report.get("phoneViewportWidths") != [320, 375, 430]
            or type(report.get("reviewThresholdPx")) is not int
            or report["reviewThresholdPx"] != 14
            or report.get("criterionIsCalibratedHumanReadability") is not False
            or report.get("physicalPhoneReviewed") is not False
            or report.get("independentHumanComprehensionReviewed") is not False
            or report.get("mayPublish") is not False):
        hold("SOURCE_CARD_REVIEW_SCOPE_OR_AUTHORITY_INVALID")
    rows = report.get("lines")
    if not isinstance(rows, list) or len(rows) != len(SOURCE_CARD_LINES):
        hold("SOURCE_CARD_SIX_LINES_REQUIRED")
    heights = {}
    for row in rows:
        if not isinstance(row, dict):
            hold("SOURCE_CARD_ROW_INVALID")
        name = row.get("lineIdentifier")
        if name not in SOURCE_CARD_LINES or name in heights:
            hold("SOURCE_CARD_LINE_IDENTITY_DUPLICATE_OR_UNKNOWN")
        band = row.get("rowBandsInFirstFrame")
        height = row.get("nativePixelHeight")
        height_range = row.get("observedHeightPxRange")
        if (not isinstance(band, list) or len(band) != 2
                or any(type(x) is not int for x in band)
                or not 680 <= band[0] <= band[1] < 1200
                or type(height) not in (float, int)
                or type(height) is bool or not 0 < height <= 520
                or height != band[1] - band[0] + 1
                or height_range != [height, height]
                or type(row.get("sourceCardFramesObserved")) is not int
                or row["sourceCardFramesObserved"] != SOURCE_CARD_FRAMES):
            hold("SOURCE_CARD_PER_FRAME_BAND_INCONSISTENT")
        projected = row.get("projectedGlyphInkHeightsPx")
        if not isinstance(projected, dict) or set(projected) != {"320", "375", "430"}:
            hold("SOURCE_CARD_PHONE_PROJECTION_INCOMPLETE")
        for width in (320, 375, 430):
            h = projected.get(str(width))
            if (type(h) not in (int, float) or not 0 <= h < 520
                    or abs(h - round(height * width / 1080, 2)) > 0.001):
                hold("SOURCE_CARD_FORGED_PROJECTED_SIZE")
        if (type(row.get("sub14pxAt320")) is not bool
                or row["sub14pxAt320"] != (projected["320"] < 14)
                or type(row.get("sub14pxAt375")) is not bool
                or row["sub14pxAt375"] != (projected["375"] < 14)):
            hold("SOURCE_CARD_FORGED_LINE_THRESHOLD")
        heights[name] = height
    if set(heights) != SOURCE_CARD_LINES:
        hold("SOURCE_CARD_LINE_INVENTORY_MISSING")
    for width in (320, 375):
        counted = sum(round(h * width / 1080, 2) < 14 for h in heights.values())
        if type(report.get("sub14pxAt{}Lines".format(width))) is not int or (
                report["sub14pxAt{}Lines".format(width)] != counted):
            hold("SOURCE_CARD_FORGED_SUMMARY_COUNT")
    return heights


def assess_source_card_glyph_gain(*, previous_path, current_path,
                                  previous_sha, current_sha,
                                  previous_film_sha, current_film_sha):
    """Conservative research stop/go for two independently pinned L4 reports.

    Must not elevate the underlying L4 ink proxy into actual-phone or
    qualified human legibility evidence. Never counts a first render.
    """
    if (not isinstance(previous_film_sha, str)
            or not isinstance(current_film_sha, str)
            or not HEX.fullmatch(previous_film_sha)
            or not HEX.fullmatch(current_film_sha)
            or previous_film_sha == current_film_sha):
        hold("SOURCE_CARD_PAIR_FILM_IDENTITY_INVALID")
    previous, observed_previous_sha = _read_json(previous_path, previous_sha)
    current, observed_current_sha = _read_json(current_path, current_sha)
    old = _strict_source_card_ink(previous, previous_film_sha)
    new = _strict_source_card_ink(current, current_film_sha)
    size_gains = {name: new[name] - old[name] for name in sorted(SOURCE_CARD_LINES)}
    proxy_now_below = sorted(name for name in SOURCE_CARD_LINES
                             if round(new[name] * 320 / 1080, 2) < 14)
    newly_above = sorted(name for name in SOURCE_CARD_LINES
                         if round(old[name] * 320 / 1080, 2) < 14
                         and round(new[name] * 320 / 1080, 2) >= 14)
    unchanged = all(delta == 0 for delta in size_gains.values())
    return {
        "schema": "ths-em-lane5-source-card-gain-stop-v1",
        "previousFilmSha256": previous_film_sha,
        "currentFilmSha256": current_film_sha,
        "previousPhysicalInkReceiptSha256": observed_previous_sha,
        "currentPhysicalInkReceiptSha256": observed_current_sha,
        "actualMediaDecodedByThisFunction": False,
        "externalReviewScope": "L4_INTERNAL_PHYSICAL_PROXY_NOT_HUMAN_OR_PHONE",
        "nativeLineHeightDeltasPx": size_gains,
        "newLinesAbove320px14pxProxy": newly_above,
        "currentLinesBelow320px14pxProxy": proxy_now_below,
        "noMeasuredTypeSizeGain": unchanged,
        "researchDecision": (
            "STOP_NO_MEASURABLE_SOURCE_TEXT_SIZE_GAIN" if unchanged
            else "REVIEW_SOURCE_CARD_SIZE_CHANGE_INDEPENDENTLY"),
        "mayPublish": False,
        "firstExcellentMasterAccepted": False,
        "atomicCardsNewlyAccepted": 0,
    }


def _phone_plan_claim_hold(story):
    """A storyboard digest is a producer assertion, not received/verified bytes.

    This scorecard has no trusted plan-receiving interface yet. Do not silently
    clear the missing-plan blocker when a producer types a plausible SHA.
    """
    claim = story.get("phonePlanSha256")
    if claim is None:
        return "AUTHENTICATED_CURRENT_PHONE_PLAN_MISSING"
    if type(claim) is not str or HEX.fullmatch(claim) is None:
        hold("INVALID_UNVERIFIED_PHONE_PLAN_DIGEST")
    return "PHONE_PLAN_DIGEST_CLAIM_WITHOUT_INDEPENDENT_PLAN_BYTES"


def score_candidate(*, film, wav, story_path, screen_path,
                    expected_film_sha, expected_wav_sha, expected_story_sha,
                    expected_screen_sha, previous_screen_path=None,
                    expected_previous_screen_sha=None, dimensions=None,
                    expected_shot_count=9, previous_ink_path=None, current_ink_path=None,
                    expected_previous_ink_sha=None, expected_current_ink_sha=None,
                    previous_ink_film_sha=None):
    """Return an explicitly non-promotable scorecard for one physically decoded film."""
    if dimensions is None:
        hold("EXPLICIT_EXPECTED_NATIVE_DIMENSIONS_REQUIRED")
    film_sha = _same_pin(film, expected_film_sha)
    wav_sha = _same_pin(wav, expected_wav_sha)
    story, story_sha = _read_json(story_path, expected_story_sha)
    screen, screen_sha = _read_json(screen_path, expected_screen_sha)
    if type(expected_shot_count) is not int or not 1 <= expected_shot_count <= 30:
        hold("INVALID_EXPECTED_SHOT_COUNT")
    shots = story.get("shots")
    if not isinstance(shots, list) or len(shots) != expected_shot_count:
        hold("STORY_SHOT_INVENTORY_DRIFT")
    if (story.get("schema") != "ths-lane3-research-visual-treatment-story-v1"
            or story.get("encodedH264Sha256") != film_sha
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
        # A hash alone proves bytes did not drift, not that their counts are
        # true. Run the SAME entire per-frame structural verifier against the
        # older screen; otherwise an inconsistent rehashed baseline can forge
        # an apparent improvement without ever possessing old-frame evidence.
        prior_story_sha = prior.get("storyboardSha256")
        if not isinstance(prior_story_sha, str) or not HEX.fullmatch(prior_story_sha):
            hold("PRIOR_STORYBOARD_SHA_INVALID")
        older_bright, older_colors = _screen_stats(
            prior, previous_film, prior_story_sha, dimensions[2])
        previous = {
            "priorFilmSha256": previous_film,
            "priorStoryboardSha256": prior_story_sha,
            "previousScreenSha256": prior_sha,
            "priorReportedBrightFrames": len(older_bright),
            "priorReportedHighlightFrames": len(older_colors),
            "priorPhysicalDecodeReplayedHere": False,
        }
        previous["brightFrameDelta"] = len(bright) - previous["priorReportedBrightFrames"]
        previous["highlightFrameDelta"] = len(colors) - previous["priorReportedHighlightFrames"]
    # Paired ink reports come from L4's physically decoded complete source-card
    # scene; a digest-only or partial report must never award a gain.
    source_card_gain = None
    pair = (previous_ink_path, current_ink_path,
            expected_previous_ink_sha, expected_current_ink_sha,
            previous_ink_film_sha)
    if any(value is not None for value in pair):
        if any(value is None for value in pair):
            hold("SOURCE_CARD_PAIR_INCOMPLETE")
        source_card_gain = assess_source_card_glyph_gain(
            previous_path=previous_ink_path, current_path=current_ink_path,
            previous_sha=expected_previous_ink_sha,
            current_sha=expected_current_ink_sha,
            previous_film_sha=previous_ink_film_sha,
            current_film_sha=film_sha)
    blockers = []
    if av.get("audioPtsAnomaliesNeedSourceReview"):
        blockers.append("AUDIO_PTS_ANOMALY_REQUIRES_ORIGINAL_PCM_COMPARISON")
    if source_card_gain is not None and source_card_gain["noMeasuredTypeSizeGain"]:
        blockers.append("SOURCE_CARD_DECORATIVE_ITERATION_STOP_NO_TYPE_GAIN")
    if bright:
        blockers.append("BRIGHT_CRITICAL_CANDIDATES_RIGHT_APP_EXCLUSION")
    if colors:
        blockers.append("COLOR_RIGHT_EXCLUSION_REQUIRES_SEMANTIC_CLASSIFICATION")
    blockers.append(_phone_plan_claim_hold(story))
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
        "declaredStoryShotCount": expected_shot_count,
        "observedStoryShotCount": len(shots),
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
        "sourceCardResearchGain": source_card_gain,
        "calibratedPremiumCraftScore": None,
        "hardAndReviewHolds": blockers,
        "nextDependency": "LANE6_SAME_FILM_AUTHENTICATED_PHONE_PLAN_AND_CROSS_LANE_RECEIPTS",
    }


# A research-only writer must never become a second route for forged release,
# first-render, external review or atomic-card approval. These are authority
# fields, not descriptive metrics; the guard applies even to caller-supplied JSON.
RESEARCH_REQUIRED_HOLDS = frozenset((
    "INDEPENDENT_SCIENCE_AND_CLAIM_REVIEW_MISSING",
    "ACTUAL_PCM_TO_AAC_PHONETIC_AND_CAPTION_REVIEW_MISSING",
    "CALIBRATED_INDEPENDENT_CRAFT_REVIEW_MISSING",
    "REAL_HANDSET_REVIEW_MISSING",
    "SIX_LANE_INDEPENDENT_EXACT_BYTE_RECEIPTS_INCOMPLETE",
))
RESEARCH_FALSE_FIELDS = (
    "mayPublish", "externalIndependentReviewed", "physicalPhoneReviewed",
    "firstFinalRenderProven", "firstExcellentMasterAccepted",
    "fiveRenderStreakAccepted",
)


def write_once(path, report):
    holds = report.get("hardAndReviewHolds") if type(report) is dict else None
    if (type(report) is not dict
            or report.get("schema") != SCHEMA
            or report.get("status") != "RESEARCH_HOLD_NO_PROMOTION"
            or report.get("machineReviewed") is not True
            or any(report.get(field) is not False for field in RESEARCH_FALSE_FIELDS)
            or type(report.get("atomicCardsNewlyAccepted")) is not int
            or report["atomicCardsNewlyAccepted"] != 0
            or report.get("calibratedPremiumCraftScore") is not None
            or not isinstance(holds, list)
            or any(type(item) is not str for item in holds)
            or not RESEARCH_REQUIRED_HOLDS.issubset(holds)):
        hold("UNSAFE_SCORECARD")
    # Bounded AAC PTS anomalies are admitted for forensic source review,
    # never as a clean voice verdict. Do not let a serialized scorecard lose
    # the exact corresponding hard review hold through report mutation.
    media = report.get("observedTechnicalMedia")
    if type(media) is not dict:
        hold("MISSING_OBSERVED_TECHNICAL_MEDIA")
    count = media.get("audioPtsAnomalyCount", 0)
    needs_review = media.get("audioPtsAnomaliesNeedSourceReview", False)
    anomalies = media.get("audioPtsAnomalies", [])
    if (type(count) is not int or count < 0
            or type(needs_review) is not bool
            or type(anomalies) is not list
            or count != len(anomalies)
            or needs_review != (count > 0)
            or (needs_review and
                "AUDIO_PTS_ANOMALY_REQUIRES_ORIGINAL_PCM_COMPARISON" not in holds)):
        hold("AUDIO_PTS_REVIEW_HOLD_MISSING_OR_FORGED")
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
    p.add_argument("--previous-ink-path")
    p.add_argument("--current-ink-path")
    p.add_argument("--expected-previous-ink-sha")
    p.add_argument("--expected-current-ink-sha")
    p.add_argument("--previous-ink-film-sha")
    p.add_argument("--out", required=True)
    # Actual films differ: 7-OH=1031 frames, Gut=845, Phenibut=1112.
    # Preserve an external exact-frame expectation; never silently use the
    # historical 1031-frame example for another candidate's full-film QA.
    p.add_argument("--expected-frames", type=int, required=True)
    p.add_argument("--expected-shots", type=int, default=9,
                   help="Externally declared authored shot count (9 for archival original)")
    a = p.parse_args()
    if not 1 <= a.expected_frames <= 5400:
        hold("EXPECTED_FRAMES_OUT_OF_RANGE")
    result = score_candidate(**{
        key: getattr(a, key) for key in (
            "film", "wav", "story_path", "screen_path",
            "expected_film_sha", "expected_wav_sha",
            "expected_story_sha", "expected_screen_sha",
            "previous_screen_path", "expected_previous_screen_sha",
            "previous_ink_path", "current_ink_path",
            "expected_previous_ink_sha", "expected_current_ink_sha",
            "previous_ink_film_sha"
        )
    }, dimensions=(1080, 1920, a.expected_frames),
       expected_shot_count=a.expected_shots)
    write_once(a.out, result)
    print(result["status"], result["filmSha256"])


if __name__ == "__main__":
    main()
