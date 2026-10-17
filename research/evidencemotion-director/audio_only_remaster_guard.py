#!/usr/bin/env python3
"""Lane5 research-only: independently compare an audio remaster against exact movie.

Never certifies science, craft, phone playback, first render, streak or release.
Requires caller-supplied immutable hashes; physical media and A/V are decoded.
"""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

HEX = re.compile(r"[0-9a-f]{64}\Z")


def hold(reason):
    raise ValueError("AUDIO_ONLY_REMASTER_HOLD:" + reason)


def run(args, *, timeout=180):
    try:
        return subprocess.run(args, text=True, capture_output=True,
                              timeout=timeout, check=True).stdout
    except (OSError, subprocess.SubprocessError) as exc:
        hold("PHYSICAL_MEDIA_CHECK_FAILED:" + type(exc).__name__)


def sha(path):
    p = Path(path)
    if p.is_symlink() or any(parent.is_symlink() for parent in p.parents):
        hold("UNSAFE_MEDIA_ALIAS")
    if not p.is_file() or not p.stat().st_size:
        hold("MEDIA_MISSING_OR_EMPTY")
    digest = hashlib.sha256()
    with p.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1048576), b""):
            digest.update(chunk)
    return digest.hexdigest()


def exact(path, pin):
    if not isinstance(pin, str) or HEX.fullmatch(pin) is None:
        hold("EXTERNAL_SHA256_REQUIRED")
    actual = sha(path)
    if actual != pin:
        hold("MEDIA_PIN_MISMATCH")
    return actual


def probe(path):
    out = json.loads(run(["ffprobe", "-v", "error", "-count_frames",
                          "-show_entries", "stream=codec_type,codec_name,width,height,avg_frame_rate,nb_read_frames,sample_rate,channels",
                          "-show_entries", "format=duration", "-of", "json", str(path)], timeout=60))
    streams = out.get("streams", [])
    video = [s for s in streams if s.get("codec_type") == "video"]
    audio = [s for s in streams if s.get("codec_type") == "audio"]
    if len(streams) != 2 or len(video) != 1 or len(audio) != 1:
        hold("EXACTLY_ONE_VIDEO_AND_AUDIO_REQUIRED")
    v, a = video[0], audio[0]
    if (v.get("codec_name") != "h264" or a.get("codec_name") != "aac"
            or int(v.get("nb_read_frames", 0)) < 1):
        hold("H264_AAC_FRAME_COUNT_REQUIRED")
    return {"video": v, "audio": a, "durationSeconds": float(out["format"]["duration"])}


def fingerprint(path, selector):
    out = run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(path),
               "-map", selector, "-c", "copy", "-f", "streamhash", "-hash", "SHA256", "-"])
    match = re.fullmatch(r"\s*0,[av],SHA256=([0-9a-f]{64})\s*", out)
    if match is None:
        hold("MISSING_ELEMENTARY_STREAM_DIGEST")
    return match.group(1)


def video_packets(path):
    out = json.loads(run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                          "-show_entries", "packet=pts,dts,duration,size,flags", "-of", "json", str(path)], timeout=60))
    rows = [{k: row[k] for k in ("pts", "dts", "duration", "size", "flags")}
            for row in out["packets"]]
    if not rows:
        hold("VIDEO_PACKETS_MISSING")
    return rows


def physical_decode(path):
    run(["ffmpeg", "-nostdin", "-v", "error", "-xerror", "-err_detect", "explode",
         "-i", str(path), "-map", "0:v:0", "-map", "0:a:0", "-f", "null", "-"])



def _audio_r128(path):
    """Measure both complete AAC decodes; never infer loudness from metadata."""
    try:
        output = subprocess.run([
            "ffmpeg", "-nostdin", "-v", "info", "-nostats", "-i", str(path),
            "-map", "0:a:0", "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"
        ], capture_output=True, text=True, timeout=60, check=True).stderr
    except (OSError, subprocess.SubprocessError) as exc:
        hold("AUDIO_R128_PHYSICAL_CHECK_FAILED:" + type(exc).__name__)
    summary = output.rsplit("Summary:", 1)
    if len(summary) != 2:
        hold("AUDIO_R128_SUMMARY_MISSING")
    levels = re.search(r"Integrated loudness:\s*I:\s*(-?\d+(?:\.\d+)?) LUFS", summary[1])
    peak = re.search(r"True peak:\s*Peak:\s*(-?\d+(?:\.\d+)?) dBFS", summary[1])
    if levels is None or peak is None:
        hold("AUDIO_R128_UNMEASURABLE")
    return {"integratedLUFS": float(levels.group(1)),
            "truePeakDBTP": float(peak.group(1))}


def inspect(*, source, remaster, source_sha, remaster_sha,
            expected_remaster_sample_rate=None):
    old = exact(source, source_sha)
    new = exact(remaster, remaster_sha)
    if old == new:
        hold("NO_DISTINCT_AUDIO_REMASTER")
    a, b = probe(source), probe(remaster)
    if a["video"] != b["video"]:
        hold("VIDEO_STREAM_METADATA_CHANGED")
    if (a["audio"].get("codec_name"), a["audio"].get("channels")) != (
        b["audio"].get("codec_name"), b["audio"].get("channels")):
        hold("AUDIO_CODEC_OR_CHANNEL_COUNT_CHANGED")
    old_rate, new_rate = int(a["audio"]["sample_rate"]), int(b["audio"]["sample_rate"])
    if not (8000 <= old_rate <= 192000 and 8000 <= new_rate <= 192000):
        hold("INVALID_AUDIO_SAMPLE_RATE")
    # Legitimate 44.1 -> 48k remasters need a declared external output pin.
    if old_rate != new_rate:
        if (type(expected_remaster_sample_rate) is not int
                or expected_remaster_sample_rate != new_rate):
            hold("UNDECLARED_AUDIO_SAMPLE_RATE_CHANGE")
    elif expected_remaster_sample_rate is not None and (
            type(expected_remaster_sample_rate) is not int
            or expected_remaster_sample_rate != new_rate):
        hold("EXPECTED_AUDIO_SAMPLE_RATE_MISMATCH")
    av, bv = fingerprint(source, "0:v:0"), fingerprint(remaster, "0:v:0")
    if av != bv or video_packets(source) != video_packets(remaster):
        hold("NOT_AUDIO_ONLY_VIDEO_BYTES_OR_TIMING_DRIFT")
    aa, ba = fingerprint(source, "0:a:0"), fingerprint(remaster, "0:a:0")
    if aa == ba:
        hold("UNMODIFIED_AUDIO_NOT_A_HOTFIX")
    physical_decode(source)
    physical_decode(remaster)
    old_loudness, new_loudness = _audio_r128(source), _audio_r128(remaster)
    if exact(source, source_sha) != old or exact(remaster, remaster_sha) != new:
        hold("MOVIE_CHANGED_WHILE_TESTING")
    return {"schema": "ths-em-lane5-audio-only-remaster-research-v1",
            "sourceFilmSha256": old, "remasteredFilmSha256": new,
            "identicalH264ElementarySha256": av,
            "sourceAacElementarySha256": aa, "remasteredAacElementarySha256": ba,
            "frameCount": int(a["video"]["nb_read_frames"]),
            "sourceAudioSampleRateHz": old_rate,
            "remasterAudioSampleRateHz": new_rate,
            "audioResamplingExplicitlyPinned": old_rate != new_rate,
            "sourceDurationSeconds": a["durationSeconds"],
            "remasteredDurationSeconds": b["durationSeconds"],
            "containerDurationDeltaSeconds": round(b["durationSeconds"] - a["durationSeconds"], 6),
            "videoPacketsAndTimestampsIdentical": True,
            "bothFullAvStreamsPhysicallyDecoded": True,
            "measuredCompleteTrackEbuR128": {
                "source": old_loudness,
                "remaster": new_loudness,
                "integratedLoudnessIncreaseLU": round(new_loudness["integratedLUFS"] - old_loudness["integratedLUFS"], 1),
                "remasterTruePeakBelow0DBTP": new_loudness["truePeakDBTP"] < 0,
                "masteringQualityIndependentlyCertified": False,
                "measurementLimit": "EBU R128 loudness and intersample peak; no naturalness, distortion or phone audition verdict"},
            "editorialAndVoicePhoneticsInheritedFromSource": "REQUIRES_SEPARATE_REVIEW",
            "machineTechnicalVerdict": "AUDIO_ONLY_STRUCTURE_VERIFIED_EDITORIAL_HOLD",
            "independentHumanOrPhoneApproval": False,
            "firstExcellentMasterAccepted": False,
            "fiveRenderStreakAccepted": False,
            "mayPublish": False,
            "atomicCardsNewlyAccepted": 0}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--source", required=True)
    p.add_argument("--remaster", required=True)
    p.add_argument("--source-sha", required=True)
    p.add_argument("--remaster-sha", required=True)
    p.add_argument("--expected-remaster-sample-rate", type=int)
    p.add_argument("--out", required=True)
    args = p.parse_args()
    result = inspect(source=args.source, remaster=args.remaster,
                     source_sha=args.source_sha, remaster_sha=args.remaster_sha,
                     expected_remaster_sample_rate=args.expected_remaster_sample_rate)
    output = Path(args.out)
    if output.exists() or output.is_symlink() or not output.parent.is_dir():
        hold("OUTPUT_ALREADY_EXISTS_OR_UNSAFE")
    output.write_text(json.dumps(result, indent=2) + "\n")
    print(result["machineTechnicalVerdict"])


if __name__ == "__main__":
    main()
