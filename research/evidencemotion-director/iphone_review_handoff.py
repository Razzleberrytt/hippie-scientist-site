#!/usr/bin/env python3
"""EM-001.03 research-only: source-locked, portable MP4/ZIP handoff.

GitHub artifact -> verified original MP4 -> simple iPhone-compatible review ZIP.
Machine compatibility is NOT an actual iPhone open/play test or film approval.
No network access, third-party media providers, GPU or publication actions.
"""
import argparse
import hashlib
import json
import os
import subprocess
import tempfile
import zipfile
from pathlib import Path

MEMBER = "specimen-timed-native/specimen_NEW_RESEARCH_CANDIDATE.mp4"
VIDEO_NAME = "EvidenceMotion-7OH-Review.mp4"
BUNDLE_NAME = "EvidenceMotion-7OH-iPhone-Review.zip"
MAX_VIDEO_BYTES = 100_000_000
VALID_VIDEO_PROFILES = {"Baseline", "Main", "High"}
SHA_HEX = set("0123456789abcdef")


class ReviewHold(ValueError):
    pass


def hold(reason):
    raise ReviewHold("EM00103_REVIEW_HOLD:" + reason)


def sha_bytes(data):
    return hashlib.sha256(data).hexdigest()


def sha_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1048576), b""):
            h.update(block)
    return h.hexdigest()


def require_sha(value):
    if not isinstance(value, str) or len(value) != 64 or any(ch not in SHA_HEX for ch in value):
        hold("INVALID_EXPECTED_SHA256")
    return value


def extract_verified(archive, expected_archive_sha, expected_video_sha):
    archive = Path(archive)
    require_sha(expected_archive_sha)
    require_sha(expected_video_sha)
    if not archive.is_file() or sha_file(archive) != expected_archive_sha:
        hold("ORIGINAL_ARTIFACT_SHA256_MISMATCH")
    try:
        with zipfile.ZipFile(archive) as z:
            names = z.namelist()
            if names.count(MEMBER) != 1 or len(names) != len(set(names)):
                hold("AMBIGUOUS_OR_MISSING_ORIGINAL_MP4_MEMBER")
            info = z.getinfo(MEMBER)
            if info.is_dir() or info.file_size <= 0 or info.file_size > MAX_VIDEO_BYTES:
                hold("INVALID_OR_OVERSIZED_VIDEO")
            if z.testzip() is not None:
                hold("ZIP_CRC_FAILURE")
            data = z.read(MEMBER)
    except (zipfile.BadZipFile, OSError, RuntimeError) as exc:
        hold("INVALID_OR_INACCESSIBLE_SOURCE_ZIP:" + type(exc).__name__)
    if sha_bytes(data) != expected_video_sha:
        hold("ORIGINAL_MP4_SHA256_MISMATCH")
    return data


def inspect_probe(probe):
    if not isinstance(probe, dict) or not isinstance(probe.get("streams"), list):
        hold("NO_REAL_STREAM_METADATA")
    vs = [x for x in probe["streams"] if x.get("codec_type") == "video"]
    aus = [x for x in probe["streams"] if x.get("codec_type") == "audio"]
    if len(vs) != 1 or len(aus) != 1:
        hold("REQUIRE_ONE_VIDEO_AND_ONE_AUDIO_STREAM")
    v, a = vs[0], aus[0]
    if (v.get("codec_name") != "h264" or v.get("profile") not in VALID_VIDEO_PROFILES
        or v.get("pix_fmt") != "yuv420p" or v.get("width") != 1080
        or v.get("height") != 1920 or v.get("avg_frame_rate") != "30/1"
        or a.get("codec_name") != "aac" or a.get("profile") != "LC"
        or a.get("sample_rate") not in {"24000", "44100", "48000"}
        or int(a.get("channels", 0)) not in {1, 2}):
        hold("MOBILE_DECODE_COMPATIBILITY_NOT_VERIFIED")
    try:
        duration = float(probe["format"]["duration"])
    except (TypeError, ValueError, KeyError):
        hold("INVALID_DURATION")
    if not 2.0 <= duration <= 120.0:
        hold("UNEXPECTED_DURATION")
    return {"videoCodec": v["codec_name"], "videoProfile": v["profile"],
            "width": v["width"], "height": v["height"],
            "pixelFormat": v["pix_fmt"], "fps": v["avg_frame_rate"],
            "audioCodec": a["codec_name"], "audioProfile": a["profile"],
            "audioSampleRate": int(a["sample_rate"]), "channels": int(a["channels"]),
            "durationSeconds": duration}


def inspect_real_media(movie):
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries",
         "format=duration:stream=codec_name,codec_type,profile,width,height,avg_frame_rate,pix_fmt,sample_rate,channels",
         "-of", "json", str(movie)],
        capture_output=True, text=True, check=False)
    if probe.returncode:
        hold("FFPROBE_FAILED")
    try:
        metadata = inspect_probe(json.loads(probe.stdout))
    except json.JSONDecodeError:
        hold("UNPARSEABLE_FFPROBE")
    decode = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-xerror",
                             "-i", str(movie), "-f", "null", "-"],
                            capture_output=True, text=True, check=False)
    if decode.returncode:
        hold("FULL_MP4_DECODE_FAILED")
    return metadata


def fixed_info(name, compression):
    i = zipfile.ZipInfo(name, (1980, 1, 1, 0, 0, 0))
    i.compress_type = compression
    i.external_attr = 0o644 << 16
    return i


def build_bundle(source_zip, expected_archive_sha, expected_video_sha, out_dir):
    out_dir = Path(out_dir)
    data = extract_verified(source_zip, expected_archive_sha, expected_video_sha)
    # Verify source video against actual FFprobe and complete audio/video decode
    # BEFORE creating the user-facing deliverables.
    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / VIDEO_NAME
        raw.write_bytes(data)
        metadata = inspect_real_media(raw)
    out_dir.mkdir(parents=True, exist_ok=True)
    receipt = {
        "status": "TECHNICAL_REVIEW_EXPORT_VERIFIED_NO_REAL_IPHONE_SESSION",
        "sourceArtifactSha256": expected_archive_sha,
        "videoSha256": expected_video_sha,
        "videoBytes": len(data), "verifiedFormat": metadata,
        "sourceZipMember": MEMBER,
        "realIphoneOpenPlaybackVerified": False,
        "creativeScienceVoiceOrViewerApproved": False,
        "mayPublish": False,
    }
    text = ("EvidenceMotion 7-OH — RESEARCH VIDEO FOR PHONE REVIEW\n"
            "Open the MP4 in your iPhone Files app and check sound, captions and pacing.\n"
            "Do NOT publish. Machine compatibility is not verified real-device playback.\n"
            "Original source ZIP and MP4 hashes are recorded in verification.json.\n")
    checksums = expected_video_sha + "  " + VIDEO_NAME + "\n"
    bundle = out_dir / BUNDLE_NAME
    # Do not replace an existing good bundle before a complete verified build.
    with tempfile.NamedTemporaryFile(prefix=".em-review-", suffix=".zip",
                                     dir=out_dir, delete=False) as tmp:
        temp_path = Path(tmp.name)
    try:
        with zipfile.ZipFile(temp_path, "w", allowZip64=False) as z:
            z.writestr(fixed_info(VIDEO_NAME, zipfile.ZIP_STORED), data)
            z.writestr(fixed_info("SHA256SUMS.txt", zipfile.ZIP_DEFLATED), checksums)
            z.writestr(fixed_info("README.txt", zipfile.ZIP_DEFLATED), text)
            z.writestr(fixed_info("verification.json", zipfile.ZIP_DEFLATED),
                       json.dumps(receipt, sort_keys=True, indent=2) + "\n")
        with zipfile.ZipFile(temp_path) as z:
            if z.testzip() is not None or sha_bytes(z.read(VIDEO_NAME)) != expected_video_sha:
                hold("FINAL_REVIEW_BUNDLE_VERIFICATION_FAILED")
        os.replace(temp_path, bundle)
    finally:
        temp_path.unlink(missing_ok=True)
    video_path = out_dir / VIDEO_NAME
    video_path.write_bytes(data)
    if sha_file(video_path) != expected_video_sha:
        hold("EXTRACTED_VIDEO_RECHECK_FAILED")
    receipt["portableBundleSha256"] = sha_file(bundle)
    return receipt


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--archive", required=True, type=Path)
    p.add_argument("--expected-archive-sha", required=True)
    p.add_argument("--expected-video-sha", required=True)
    p.add_argument("--out-dir", required=True, type=Path)
    a = p.parse_args()
    print(json.dumps(build_bundle(a.archive, a.expected_archive_sha,
                                  a.expected_video_sha, a.out_dir), indent=2))


if __name__ == "__main__":
    main()
