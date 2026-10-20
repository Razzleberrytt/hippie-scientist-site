#!/usr/bin/env python3
"""Research-only visible source-credit audit on source-pinned encoded MP4 frames.

Authoring manifests are not proof of encoded pixels. OCR is fallible: unreadable,
missing or misleading credits HOLD; readable ink never establishes that the
scientific claim is supported, reviewer-approved or suitable for publication.
"""
import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path

SCHEMA = "ths-encoded-visible-science-source-credit-research-v1"
MAX_VIDEO_BYTES = 250 * 1024 * 1024


def hold(code):
    raise ValueError("ENCODED_SOURCE_CREDIT_HOLD:" + code)


def sha256_file(path, *, max_bytes=None):
    """Hash a bounded media source without reading beyond limit + one byte.

    A small original can be replaced after stat with an enormous file. A
    bounded recheck must fail promptly rather than hash attacker-sized data.
    Unbounded hashing remains available for generated, local OCR crop PNGs.
    """
    sha = hashlib.sha256()
    remaining = max_bytes
    try:
        with Path(path).open("rb") as f:
            while True:
                chunk = f.read((1 << 20) if remaining is None
                               else min(1 << 20, remaining + 1))
                if not chunk:
                    break
                if remaining is not None:
                    if len(chunk) > remaining:
                        hold("ENCODED_SOURCE_RECHECK_EXCEEDS_LIMIT")
                    remaining -= len(chunk)
                sha.update(chunk)
    except OSError as exc:
        hold("ENCODED_SOURCE_RECHECK_IO_FAILED:" + type(exc).__name__)
    return sha.hexdigest()


def command(args, timeout=45):
    try:
        return subprocess.run(args, capture_output=True, check=True, timeout=timeout).stdout
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        hold("DECODE_OR_OCR_TOOL_FAILED:" + type(exc).__name__)


def source_line_detected(ocr_text, source_name, source_number):
    """Require visible source, authority and identifier on one unambiguous line."""
    if not isinstance(ocr_text, str) or len(ocr_text) > 20000:
        hold("INVALID_OCR_OBSERVATION")
    if not isinstance(source_name, str) or re.fullmatch(r"[A-Z]{2,16}", source_name) is None:
        hold("INVALID_SOURCE_AUTHORITY")
    if not isinstance(source_number, str) or re.fullmatch(r"[1-9][0-9]{1,9}", source_number) is None:
        hold("INVALID_SOURCE_DOCUMENT_NUMBER")
    # OCR can split a negation onto a neighboring line, or recover two
    # contradictory SOURCE lines in one crop. In either case, the positive
    # string alone is not sufficient evidence of an unambiguous attribution.
    lines = [re.findall(r"[A-Z0-9]+", line.upper())
             for line in ocr_text.splitlines()]
    nonempty = [words for words in lines if words]
    source_lines = [(i, words) for i, words in enumerate(nonempty)
                    if words[0] == "SOURCE"]
    if len(source_lines) != 1:
        return False
    i, words = source_lines[0]
    if words not in (["SOURCE", source_name, source_number],
                     ["SOURCE", source_name, "CHAPTER", source_number]):
        return False
    # Only reject adjacent standalone/leading negative qualifiers, rather
    # than arbitrary "NOT" elsewhere in a crop; a negative screen should
    # fail closed without turning unrelated prose into source approval.
    for nearby in nonempty[max(0, i - 1):i] + nonempty[i + 1:i + 2]:
        if nearby[0] in ("NOT", "NO", "FALSE", "INVALID",
                         "UNVERIFIED", "RETRACTED", "DISPUTED"):
            return False
    return True


def _frozen_source(movie, snapshot, expected_sha256):
    """Copy bounded original bytes once, then prove the exact independent pin."""
    observed = hashlib.sha256()
    count = 0
    try:
        with movie.open("rb") as source, snapshot.open("xb") as target:
            for chunk in iter(lambda: source.read(1 << 20), b""):
                count += len(chunk)
                if count > MAX_VIDEO_BYTES:
                    hold("ENCODED_SOURCE_SNAPSHOT_EXCEEDS_LIMIT")
                target.write(chunk)
                observed.update(chunk)
    except OSError as exc:
        hold("ENCODED_SOURCE_SNAPSHOT_IO_FAILED:" + type(exc).__name__)
    if (count < 128 or observed.hexdigest() != expected_sha256
        or not movie.is_file() or movie.is_symlink()
        or sha256_file(movie, max_bytes=MAX_VIDEO_BYTES) != expected_sha256):
        hold("ENCODED_SOURCE_CHANGED_DURING_SNAPSHOT")


def inspect(movie, expected_sha256, *, frame_indices, roi, source_name, source_number):
    """Audit only exact pinned snapshot bytes, not a mutable original path.

    Both FFprobe and FFmpeg operate on the same frozen copy. This eliminates
    a check/use gap where the initial movie SHA could describe different bytes
    from the actual decoded source-credit pixels. All authority remains HOLD.
    """
    movie = Path(movie)
    if (not movie.is_file() or movie.is_symlink()
        or movie.stat().st_size < 128 or movie.stat().st_size > MAX_VIDEO_BYTES
        or not isinstance(expected_sha256, str)
        or re.fullmatch(r"[a-f0-9]{64}", expected_sha256) is None
        or sha256_file(movie, max_bytes=MAX_VIDEO_BYTES) != expected_sha256):
        hold("EXACT_INDEPENDENT_ENCODED_MOVIE_PIN_REQUIRED")
    if (not isinstance(frame_indices, (tuple, list)) or len(frame_indices) < 2
        or len(frame_indices) > 8 or any(type(n) is not int or n < 0 for n in frame_indices)
        or sorted(set(frame_indices)) != list(frame_indices)):
        hold("TWO_TO_EIGHT_UNIQUE_ORDERED_ENCODED_FRAMES_REQUIRED")
    if (not isinstance(roi, (list, tuple)) or len(roi) != 4
        or any(type(z) is not int for z in roi)):
        hold("EXACT_NATIVE_SOURCE_REGION_REQUIRED")

    rows = []
    with tempfile.TemporaryDirectory(prefix="ths-source-credit-") as folder:
        frozen = Path(folder) / "pinned-input.mp4"
        _frozen_source(movie, frozen, expected_sha256)
        meta = json.loads(command([
            "ffprobe", "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=codec_name,width,height,nb_frames",
            "-of", "json", str(frozen)
        ]))
        streams = meta.get("streams", [])
        if (len(streams) != 1 or streams[0].get("codec_name") != "h264"
            or any(type(streams[0].get(k)) is not int or streams[0][k] <= 0
                   for k in ("width", "height"))):
            hold("ACTUAL_H264_GEOMETRY_REQUIRED")
        w, h = streams[0]["width"], streams[0]["height"]
        try:
            count = int(streams[0]["nb_frames"])
        except (ValueError, TypeError, KeyError):
            hold("EXACT_FRAME_COUNT_REQUIRED")
        if frame_indices[-1] >= count:
            hold("SAMPLED_FRAME_OUTSIDE_MOVIE")
        x, y, width, height = roi
        if not (0 <= x < x + width <= w and 0 <= y < y + height <= h
                and width >= 60 and height >= 20):
            hold("SOURCE_REGION_OUTSIDE_ENCODED_MOVIE")
        for frame in frame_indices:
            dest = Path(folder) / f"source-{frame}.png"
            command([
                "ffmpeg", "-v", "error", "-nostdin", "-i", str(frozen),
                "-vf", f"select=eq(n\\,{frame}),crop={width}:{height}:{x}:{y}",
                "-vsync", "0", "-frames:v", "1", "-update", "1", "-y", str(dest)
            ], timeout=65)
            if not dest.is_file() or dest.stat().st_size < 100:
                hold("ENCODED_SAMPLE_FRAME_NOT_DECODED")
            ocr = command(["tesseract", str(dest), "stdout", "--psm", "6"], timeout=35).decode("utf-8", "replace")
            if not source_line_detected(ocr, source_name, source_number):
                hold("IDENTIFIABLE_SCIENTIFIC_SOURCE_NOT_RECOVERED_IN_ENCODED_FRAME:" + str(frame))
            rows.append({"frameIndex": frame, "actualPixelCropSha256": sha256_file(dest),
                         "ocrObservationSha256": hashlib.sha256(ocr.encode()).hexdigest(),
                         "sourceIdentifierPhysicallyReadable": True})
        if (sha256_file(frozen, max_bytes=MAX_VIDEO_BYTES) != expected_sha256
            or not movie.is_file() or movie.is_symlink()
            or sha256_file(movie, max_bytes=MAX_VIDEO_BYTES) != expected_sha256):
            hold("ENCODED_SOURCE_CHANGED_DURING_REPLAY")
    return {"schema": SCHEMA, "exactMovieSha256": expected_sha256,
            "sourceName": source_name, "sourceNumber": source_number,
            "actualNativeROI": [x, y, width, height], "actualEncodedFramesSampled": len(rows),
            "sampledVisibleSourceCreditRecovered": True, "rows": rows,
            "scientificSourceApplicabilityVerified": False,
            "scientificClaimApproved": False, "allFilmFramesVerified": False,
            "independentQualifiedScienceReviewPassed": False,
            "realPhoneLegibilityVerified": False, "mayPublish": False}
