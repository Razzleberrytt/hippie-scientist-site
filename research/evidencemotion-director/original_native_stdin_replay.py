#!/usr/bin/env python3
"""Isolated original-source 1,031-frame physical FFmpeg-stdin replay.

Two independently scheduled GitHub research jobs supply per-frame/stream receipts.
Restores only pinned original scripts and archival timing; does not replace
production, claim original encoder provenance, grade craft, or permit publishing.
"""
import argparse
import hashlib
import importlib
import json
import math
import os
from pathlib import Path
import platform
import subprocess
import sys
import time

from native_stdin_capture_guard import Capture, compare_pair, digest, NATIVE
from original_frame_replay_probe import (
    CANDIDATE_SHA, ARCHIVED_PNG_SHA, ARCHIVED_PATH, sha_file
)
from original_replay_admission import (
    inspect_replay_inputs, ORIGINAL_TIMED_RECEIPT_SHA256,
    ORIGINAL_WAV_SHA256, strict_json
)

EXPECTED_FRAME_COUNT = 1031
SAMPLE_INDEX_SET = frozenset(ARCHIVED_PNG_SHA)
ORIGINAL_NAME = "specimen_NEW_RESEARCH_CANDIDATE.mp4"


def original_media_executable(tool):
    """Bind both probes and encodes to a real fixed binary, not a PATH shadow.

    A prior environment receipt hashed /usr/bin/ffmpeg while launching the
    unqualified 'ffmpeg' binary. A different PATH entry could falsify the
    recorded encoder provenance even though the workflow reported success.
    """
    if tool not in ("ffmpeg", "ffprobe"):
        raise ValueError("NATIVE_ORIGINAL_HOLD:UNRECOGNIZED_MEDIA_EXECUTABLE")
    exe = Path("/usr/bin") / tool
    if not exe.is_file() or exe.is_symlink():
        raise ValueError("NATIVE_ORIGINAL_HOLD:MEDIA_EXECUTABLE_UNVERIFIED")
    return str(exe)


def physical_environment(*, sources, fonts, wav, candidate, encoder_mode):
    """Stable cross-run fingerprint of actual runtime file bytes, not runner ID."""
    import PIL
    import rdkit
    from original_replay_source_restore import PINNED

    exe = original_media_executable("ffmpeg")
    source_hashes = {name: sha_file(sources / name) for name in sorted(PINNED)}
    font_hashes = {name: sha_file(fonts / name) for name in
                   ("DejaVuSans.ttf", "DejaVuSans-Bold.ttf")}
    environment = {
        "schema": "ths-em-original-stdin-env-v1",
        "archivedOriginalReceiptSha256": ORIGINAL_TIMED_RECEIPT_SHA256,
        "alignmentCandidateSha256": sha_file(candidate),
        "wavSha256": sha_file(wav),
        "sourceHashesSha256": source_hashes,
        "fontHashesSha256": font_hashes,
        "pillowVersion": PIL.__version__,
        "rdkitVersion": rdkit.__version__,
        "pythonVersion": platform.python_version(),
        "ffmpegExecutableSha256": sha_file(exe),
        "ffmpegVersion": subprocess.check_output([exe, "-version"], text=True).splitlines()[0],
        "encoderMode": encoder_mode,
    }
    environment_sha = hashlib.sha256(
        json.dumps(environment, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()
    environment["environmentSha256"] = environment_sha
    environment["originalArchivedFFmpegBinarySha256Verified"] = False
    environment["releaseAuthorized"] = False
    return environment


def replay(*, source_dir, font_dir, wav_path, archive_dir, out_dir, run_id):
    import PIL
    from PIL import Image

    source_dir, font_dir, wav_path = map(lambda x: Path(x).resolve(),
                                        (source_dir, font_dir, wav_path))
    archive_dir, out_dir = Path(archive_dir).resolve(), Path(out_dir)
    if out_dir.exists() or out_dir.is_symlink() or not out_dir.parent.is_dir():
        raise ValueError("NATIVE_ORIGINAL_HOLD:FRESH_OUTPUT_DIRECTORY_REQUIRED")
    archive_root = archive_dir / ARCHIVED_PATH
    admission = inspect_replay_inputs(
        receipt_path=archive_root / "render-receipt.json",
        renderer_dir=source_dir, font_dir=font_dir, wav_path=wav_path)
    if admission["status"] != "LOCAL_INPUT_PINS_MATCH_RESEARCH_ONLY":
        raise ValueError("NATIVE_ORIGINAL_HOLD:ADMISSION:" + repr(admission["blockingReasons"]))
    align_path = archive_dir / "result" / "alignment-candidate.json"
    if not align_path.is_file() or align_path.is_symlink() or sha_file(align_path) != CANDIDATE_SHA:
        raise ValueError("NATIVE_ORIGINAL_HOLD:ARCHIVED_ALIGNMENT_CANDIDATE_CHANGED")
    alignment = json.loads(align_path.read_text())
    old_receipt = json.loads((archive_root / "render-receipt.json").read_text())
    if (alignment.get("revisionSha256") != old_receipt.get("alignmentRevisionSha256")
            or alignment.get("inputSha256", {}).get("wav") != ORIGINAL_WAV_SHA256
            or alignment.get("sampleCount") != 824336
            or math.ceil(alignment["sampleCount"] / 24000 * 30) != EXPECTED_FRAME_COUNT):
        raise ValueError("NATIVE_ORIGINAL_HOLD:ARCHIVED_TIMING_DRIFT")
    # Research A/B: force one x264 worker and disable parallel lookahead.
    # The earlier default-thread two-run CI remains immutably recorded.
    encoder_mode = "CPU_ASM_DISABLED_X264_AND_SWSCALE_RESEARCH"
    environment = physical_environment(
        sources=source_dir, fonts=font_dir, wav=wav_path, candidate=align_path,
        encoder_mode=encoder_mode)
    out_dir.mkdir(parents=False)
    (out_dir / "environment.json").write_text(json.dumps(environment, indent=2) + "\n")
    # Never import the current main or candidate reimplementation in place of the
    # 11 byte-pinned historical renderer modules.
    sys.path.insert(0, str(source_dir))
    process = None
    start = time.monotonic()
    try:
        r = importlib.import_module("narration_locked_treatments")
        if r.FPS != 30 or r.WAV_SHA != ORIGINAL_WAV_SHA256:
            raise ValueError("NATIVE_ORIGINAL_HOLD:RENDERER_CONSTANT_DRIFT")
        scenes = r.timeline(alignment)
        font, fontpins = r.fonts(font_dir)
        if fontpins != old_receipt["fonts"]:
            raise ValueError("NATIVE_ORIGINAL_HOLD:FONT_PIN_DRIFT")
        assets = r.chemistry_assets(light=False)
        assets["dark_diagram"] = r.chemistry_assets(light=False)["7_hydroxymitragynine"]["diagram"]
        movie = out_dir / ORIGINAL_NAME
        cmd = [
            original_media_executable("ffmpeg"), "-v", "info", "-cpuflags", "0", "-nostdin", "-y",
            "-f", "rawvideo", "-pixel_format", "rgb24",
            "-video_size", "1080x1920", "-framerate", "30",
            "-i", "pipe:0", "-i", str(wav_path),
            "-map", "0:v", "-map", "1:a",
            "-c:v", "libx264", "-threads:v", "1",
            "-x264-params", "asm=0:sync-lookahead=0",
            "-preset", "fast", "-crf", "18",
            "-pix_fmt", "yuv420p", "-af", r.AUDIO_FILTER,
            "-c:a", "aac", "-b:a", "192k",
            "-frames:v", "1031", "-movflags", "+faststart", str(movie),
        ]
        with (out_dir / "encoder.log").open("wb") as stderr_log:
            process = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                                       stdout=subprocess.DEVNULL, stderr=stderr_log)
            writer = Capture(process.stdin, run_id=run_id,
                             source_sha=ORIGINAL_TIMED_RECEIPT_SHA256,
                             wav_sha=ORIGINAL_WAV_SHA256,
                             environment_sha=environment["environmentSha256"])
            archived_samples_match = []
            for i in range(EXPECTED_FRAME_COUNT):
                img = r.render_frame(i / 30, scenes, assets, "specimen", (1080, 1920), font,
                                     caption_mode="timed_research")
                if img.mode != "RGB" or img.size != (1080, 1920):
                    raise ValueError("NATIVE_ORIGINAL_HOLD:SOURCE_FRAME_GEOMETRY_OR_RGB_DRIFT")
                if i in SAMPLE_INDEX_SET:
                    ref = archive_root / f"source_frame_{i:04d}.png"
                    if (not ref.is_file() or ref.is_symlink()
                            or sha_file(ref) != ARCHIVED_PNG_SHA[i]):
                        raise ValueError("NATIVE_ORIGINAL_HOLD:PINNED_ARCHIVED_FRAME_CHANGED")
                    with Image.open(ref) as ref_img:
                        if ref_img.convert("RGB").tobytes() != img.tobytes():
                            raise ValueError(f"NATIVE_ORIGINAL_HOLD:ACTUAL_FRAME_MISMATCH:{i}")
                    archived_samples_match.append(i)
                writer.write(img.tobytes())
            writer.close()
            process.wait(timeout=120)
            receipt = writer.receipt_from_completed_encoder(process, movie)
            validate_disabled_x264_cpu_asm(out_dir / "encoder.log")
        if tuple(archived_samples_match) != tuple(sorted(SAMPLE_INDEX_SET)):
            raise ValueError("NATIVE_ORIGINAL_HOLD:ARCHIVED_FRAME_INVENTORY_INCOMPLETE")
        if not movie.is_file():
            raise ValueError("NATIVE_ORIGINAL_HOLD:NO_OUTPUT_MOVIE")
        probe = subprocess.run([
            original_media_executable("ffprobe"), "-v", "error", "-count_frames", "-select_streams", "v:0",
            "-show_entries", "stream=codec_name,width,height,nb_read_frames,avg_frame_rate",
            "-of", "json", str(movie)
        ], check=True, capture_output=True, text=True, timeout=45)
        v = json.loads(probe.stdout)["streams"][0]
        if (v.get("codec_name") != "h264" or v.get("width") != 1080
                or v.get("height") != 1920 or v.get("avg_frame_rate") != "30/1"
                or int(v.get("nb_read_frames", -1)) != 1031):
            raise ValueError("NATIVE_ORIGINAL_HOLD:REAL_ENCODED_FILM_FRAME_OR_FORMAT_DRIFT")
        subprocess.run([original_media_executable("ffmpeg"), "-v", "error", "-xerror", "-i", str(movie),
                        "-f", "null", "-"], check=True, capture_output=True, timeout=120)
        proof = {
            "schema": "ths-em-original-stdin-full-native-replay-job-v1",
            "status": "ONE_ORIGINAL_SOURCE_RENDER_RESEARCH_ONLY",
            "encoderMode": encoder_mode,
            "runId": run_id, "runnerJobId": os.environ.get("GITHUB_JOB", "LOCAL_UNATTESTED"),
            "runnerName": os.environ.get("RUNNER_NAME", "LOCAL_UNATTESTED"),
            "githubRunId": os.environ.get("GITHUB_RUN_ID", "LOCAL_UNATTESTED"),
            "originalRendererGitSourcesRecovered": True,
            "allEightArchivedOriginalPixelSamplesBitwiseMatched": True,
            "nativeEncodedFilmFullDecode": True,
            "originalRendererFullRenderExecuted": True,
            "x264CpuAsmDisabledMachineLogObserved": True,
            "sourceToEncoderStdinReceipt": receipt,
            "sha256EnvironmentJson": sha_file(out_dir / "environment.json"),
            "wallSeconds": round(time.monotonic() - start, 3),
            "mayPublish": False, "firstExcellentMasterAccepted": False,
            "fiveRenderStreakAccepted": False,
            "independentJobProvenanceExternallyAuthenticated": False,
            "originalArchivedFFmpegBinaryAuthenticated": False,
        }
        (out_dir / "full-original-replay.json").write_text(json.dumps(proof, indent=2) + "\n")
        return proof
    except BaseException:
        if process and process.poll() is None:
            process.kill()
            process.wait()
        raise
    finally:
        sys.path.pop(0)



# Freeze exactly the v1 data that originally went into environmentSha256.
# Neither an extra field, an added self-approval, nor an edited nested source
# may be smuggled into a pair-comparison receipt without deliberate v2 review.
ENVIRONMENT_V1_IDENTITY_FIELDS = frozenset((
    "schema", "archivedOriginalReceiptSha256", "alignmentCandidateSha256",
    "wavSha256", "sourceHashesSha256", "fontHashesSha256",
    "pillowVersion", "rdkitVersion", "pythonVersion",
    "ffmpegExecutableSha256", "ffmpegVersion", "encoderMode",
))
ENVIRONMENT_V1_FIELDS = ENVIRONMENT_V1_IDENTITY_FIELDS | frozenset((
    "environmentSha256", "originalArchivedFFmpegBinarySha256Verified",
    "releaseAuthorized",
))
ORIGINAL_FONT_PINS = {
    "DejaVuSans.ttf": "ae7b7855e115a5966d8b1b3f80f254ccc117ec86f9965e202ee2940453837280",
    "DejaVuSans-Bold.ttf": "5c1247acef7f2b8522a31742c76d6adcb5569bacc0be7ceaa4dc39dd252ce895",
}


def validate_environment_report_v1(environment):
    """Independently verify exact frozen environmental identity, research only.

    A matching whole JSON SHA from the same producer cannot prove its inner
    environmentSha256 was calculated correctly. Recompute the canonical v1
    fingerprint, verify independently pinned sources/fonts/WAV/receipts, and
    forbid unknown fields that could masquerade as reviewer approvals.
    """
    from original_replay_source_restore import PINNED

    if not isinstance(environment, dict) or set(environment) != ENVIRONMENT_V1_FIELDS:
        raise ValueError("NATIVE_ORIGINAL_HOLD:ENVIRONMENT_FIELDS_OR_SCHEMA_DRIFT")
    if (environment["schema"] != "ths-em-original-stdin-env-v1"
            or environment["originalArchivedFFmpegBinarySha256Verified"] is not False
            or environment["releaseAuthorized"] is not False):
        raise ValueError("NATIVE_ORIGINAL_HOLD:INVALID_ENVIRONMENT_REPORT")
    if (environment["archivedOriginalReceiptSha256"] != ORIGINAL_TIMED_RECEIPT_SHA256
            or environment["alignmentCandidateSha256"] != CANDIDATE_SHA
            or environment["wavSha256"] != ORIGINAL_WAV_SHA256
            or environment["sourceHashesSha256"] != PINNED
            or environment["fontHashesSha256"] != ORIGINAL_FONT_PINS):
        raise ValueError("NATIVE_ORIGINAL_HOLD:ENVIRONMENT_SOURCE_IDENTITY_DRIFT")
    hashes = ("archivedOriginalReceiptSha256", "alignmentCandidateSha256",
              "wavSha256", "ffmpegExecutableSha256", "environmentSha256")
    if any(not isinstance(environment[k], str) or len(environment[k]) != 64
           or any(ch not in "0123456789abcdef" for ch in environment[k])
           for k in hashes):
        raise ValueError("NATIVE_ORIGINAL_HOLD:INVALID_ENVIRONMENT_SHA")
    strings = ("pillowVersion", "rdkitVersion", "pythonVersion",
               "ffmpegVersion", "encoderMode")
    if any(not isinstance(environment[k], str) or not environment[k].strip()
           for k in strings):
        raise ValueError("NATIVE_ORIGINAL_HOLD:INVALID_ENVIRONMENT_IDENTITY")
    identity = {name: environment[name] for name in ENVIRONMENT_V1_IDENTITY_FIELDS}
    recomputed = sha(json.dumps(
        identity, sort_keys=True, separators=(",", ":")).encode("utf-8"))
    if recomputed != environment["environmentSha256"]:
        raise ValueError("NATIVE_ORIGINAL_HOLD:ENVIRONMENT_FINGERPRINT_MISMATCH")
    return recomputed



# v1 is a closed research receipt schema. A producer may not invent a new
# approval field without a separately reviewed versioned contract.
ORIGINAL_JOB_V1_FIELDS = frozenset((
    "schema", "status", "encoderMode", "runId", "runnerJobId", "runnerName",
    "githubRunId", "originalRendererGitSourcesRecovered",
    "allEightArchivedOriginalPixelSamplesBitwiseMatched",
    "nativeEncodedFilmFullDecode", "originalRendererFullRenderExecuted",
    "x264CpuAsmDisabledMachineLogObserved", "sourceToEncoderStdinReceipt",
    "sha256EnvironmentJson", "wallSeconds", "mayPublish",
    "firstExcellentMasterAccepted", "fiveRenderStreakAccepted",
    "independentJobProvenanceExternallyAuthenticated",
    "originalArchivedFFmpegBinaryAuthenticated",
))
JOB_V1_TRUE_MACHINE_ASSERTIONS = (
    "originalRendererGitSourcesRecovered",
    "allEightArchivedOriginalPixelSamplesBitwiseMatched",
    "nativeEncodedFilmFullDecode", "originalRendererFullRenderExecuted",
    "x264CpuAsmDisabledMachineLogObserved",
)
JOB_V1_FALSE_UNAUTHORIZED_ASSERTIONS = (
    "mayPublish", "firstExcellentMasterAccepted", "fiveRenderStreakAccepted",
    "independentJobProvenanceExternallyAuthenticated",
    "originalArchivedFFmpegBinaryAuthenticated",
)


def validate_original_job_v1(job):
    """Enforce bounded machine facts and ALL withheld creative/trust approvals."""
    if not isinstance(job, dict) or set(job) != ORIGINAL_JOB_V1_FIELDS:
        raise ValueError("NATIVE_ORIGINAL_HOLD:NONCANONICAL_JOB_RECEIPT_FIELDS")
    if (job["schema"] != "ths-em-original-stdin-full-native-replay-job-v1"
            or job["status"] != "ONE_ORIGINAL_SOURCE_RENDER_RESEARCH_ONLY"):
        raise ValueError("NATIVE_ORIGINAL_HOLD:NOT_ORIGINAL_SOURCE_JOB")
    if any(job[k] is not True for k in JOB_V1_TRUE_MACHINE_ASSERTIONS):
        raise ValueError("NATIVE_ORIGINAL_HOLD:ORIGINAL_FRAME_OR_DECODE_CHECK_FAILED")
    if any(job[k] is not False for k in JOB_V1_FALSE_UNAUTHORIZED_ASSERTIONS):
        raise ValueError("NATIVE_ORIGINAL_HOLD:FORGED_CREATIVE_OR_TRUST_APPROVAL")
    if (not isinstance(job["sourceToEncoderStdinReceipt"], dict)
            or not isinstance(job["sha256EnvironmentJson"], str)
            or len(job["sha256EnvironmentJson"]) != 64
            or any(x not in "0123456789abcdef" for x in job["sha256EnvironmentJson"])):
        raise ValueError("NATIVE_ORIGINAL_HOLD:INVALID_JOB_EVIDENCE_IDENTITY")
    if any(not isinstance(job[k], str) or not job[k].strip()
           for k in ("encoderMode", "runId", "runnerJobId", "runnerName", "githubRunId")):
        raise ValueError("NATIVE_ORIGINAL_HOLD:INVALID_JOB_IDENTITY")
    if (type(job["wallSeconds"]) not in (float, int)
            or not math.isfinite(job["wallSeconds"]) or job["wallSeconds"] <= 0):
        raise ValueError("NATIVE_ORIGINAL_HOLD:INVALID_JOB_DURATION")
    return True


def read_original_pair_dir(directory):
    """Read physical producer bytes with strict JSON, no links or self-approval."""
    path = Path(directory)
    if not path.is_dir() or path.is_symlink():
        raise ValueError("NATIVE_ORIGINAL_HOLD:PAIR_ARTIFACT_DIRECTORY_UNSAFE")
    records = []
    for name in ("full-original-replay.json", "environment.json"):
        candidate = path / name
        if (not candidate.is_file() or candidate.is_symlink()
                or candidate.stat().st_size == 0
                or candidate.stat().st_size > 2_000_000):
            raise ValueError("NATIVE_ORIGINAL_HOLD:PAIR_REPORT_MISSING_OR_UNSAFE:" + name)
        try:
            parsed = strict_json(candidate.read_text(encoding="utf-8"))
        except (ValueError, UnicodeError) as exc:
            raise ValueError("NATIVE_ORIGINAL_HOLD:PAIR_REPORT_MALFORMED:" + name) from exc
        if not isinstance(parsed, dict):
            raise ValueError("NATIVE_ORIGINAL_HOLD:PAIR_REPORT_NOT_OBJECT:" + name)
        records.append(parsed)
    report, environment = records
    validate_original_job_v1(report)
    validate_environment_report_v1(environment)
    if report["sha256EnvironmentJson"] != sha_file(path / "environment.json"):
        raise ValueError("NATIVE_ORIGINAL_HOLD:PHYSICAL_ENV_FILE_SHA_MISMATCH")
    verify_uploaded_movie(path, report)
    return report, environment


def inspect_both(first, second, environment_first, environment_second):
    """Strict physical pair comparator; no self-granted executor attestation."""
    for e in (environment_first, environment_second):
        validate_environment_report_v1(e)
    for d, e in ((first, environment_first), (second, environment_second)):
        validate_original_job_v1(d)
        if d["sha256EnvironmentJson"] != sha(
                (json.dumps(e, indent=2) + "\\n").encode()):
            raise ValueError("NATIVE_ORIGINAL_HOLD:ENV_REPORT_BYTES_DIFFER")
    if (first.get("encoderMode") != "CPU_ASM_DISABLED_X264_AND_SWSCALE_RESEARCH"
            or second.get("encoderMode") != first["encoderMode"]
            or environment_first.get("encoderMode") != first["encoderMode"]
            or environment_second.get("encoderMode") != second["encoderMode"]):
        raise ValueError("NATIVE_ORIGINAL_HOLD:ENCODER_MODE_DRIFT")
    if (first["sourceToEncoderStdinReceipt"]["filmSha256"]
            != second["sourceToEncoderStdinReceipt"]["filmSha256"]):
        raise ValueError("NATIVE_ORIGINAL_HOLD:SINGLE_THREAD_ENCODED_FILMS_DIFFER")
    sha1 = environment_first.get("environmentSha256")
    sha2 = environment_second.get("environmentSha256")
    if sha1 != sha2 or not isinstance(sha1, str):
        raise ValueError("NATIVE_ORIGINAL_HOLD:PHYSICAL_RUNTIME_VERSIONS_OR_BYTES_DIFFER")
    if first["githubRunId"] != second["githubRunId"] or (
            first["runnerName"] == second["runnerName"]):
        raise ValueError("NATIVE_ORIGINAL_HOLD:RUNNER_IDENTITY_NOT_DISTINCT")
    result = compare_pair(first["sourceToEncoderStdinReceipt"],
                          second["sourceToEncoderStdinReceipt"],
                          expected_source=ORIGINAL_TIMED_RECEIPT_SHA256,
                          expected_wav=ORIGINAL_WAV_SHA256,
                          expected_environment=sha1, geometry=NATIVE)
    return {
        **result,
        "twoGitHubHostedRunnerNamesDifferent": True,
        "twoPhysicalFullNativeSourceRendersProduced": True,
        "twoNativeDecodedMoviesVerified": True,
        "sourceFrameBitwiseMatch": True,
        "actualOriginalHistoricalFFmpegBinaryPinned": False,
        "twoResearchSingleThreadEncodedMoviesBitwiseIdentical": True,
        "originalFullStdinExternallyCapturedAndReplayed": True,
        "twoActualIndependentJobExecutionsAuthenticated": False,
        "nativeFullMediaDecodeAndCraftApproved": False,
        "mayPublish": False,
        "status": "SINGLE_THREAD_ORIGINAL_SOURCE_H264_BITWISE_REPLAY_RESEARCH_HOLD",
    }


def validate_disabled_x264_cpu_asm(encoder_log):
    """Refuse FFmpeg's silent x264 parameter parse errors.

    A successful process can still log "Error parsing option" while ignoring
    an x264-params setting. This proof is a *machine encoder check only*.
    """
    p = Path(encoder_log)
    if not p.is_file() or p.is_symlink() or p.stat().st_size == 0:
        raise ValueError("NATIVE_ORIGINAL_HOLD:X264_CPU_ASM_PROOF_LOG_MISSING")
    log = p.read_bytes()
    if (b"using cpu capabilities: none!" not in log
            or b"Error parsing option" in log):
        raise ValueError("NATIVE_ORIGINAL_HOLD:X264_CPU_ASM_CONTROL_NOT_PROVEN")
    return True


def verify_uploaded_movie(artifact_dir, report):
    """Hash downloaded physical film bytes instead of trusting report metadata."""
    movie = Path(artifact_dir) / ORIGINAL_NAME
    if not movie.is_file() or movie.is_symlink() or movie.stat().st_size == 0:
        raise ValueError("NATIVE_ORIGINAL_HOLD:UPLOADED_MOVIE_MISSING_EMPTY_OR_SYMLINK")
    receipt = report.get("sourceToEncoderStdinReceipt")
    if not isinstance(receipt, dict):
        raise ValueError("NATIVE_ORIGINAL_HOLD:MISSING_MOVIE_SHA_RECEIPT")
    expected = receipt.get("filmSha256")
    if (not isinstance(expected, str) or len(expected) != 64
            or any(char not in "0123456789abcdef" for char in expected)):
        raise ValueError("NATIVE_ORIGINAL_HOLD:INVALID_MOVIE_SHA_RECEIPT")
    observed = sha_file(movie)
    if observed != expected:
        raise ValueError("NATIVE_ORIGINAL_HOLD:UPLOADED_MOVIE_BYTES_DIFFER_FROM_ENCODER_RECEIPT")
    return observed


def sha(data):
    return hashlib.sha256(data).hexdigest()


if __name__ == "__main__":
    cli = argparse.ArgumentParser()
    sub = cli.add_subparsers(dest="command", required=True)
    run = sub.add_parser("render")
    for key in ("source-dir", "font-dir", "wav", "archive-dir", "out", "run-id"):
        run.add_argument("--" + key, required=True)
    pair = sub.add_parser("compare")
    pair.add_argument("--first", required=True)
    pair.add_argument("--second", required=True)
    pair.add_argument("--out", required=True)
    args = cli.parse_args()
    if args.command == "render":
        report = replay(source_dir=args.source_dir, font_dir=args.font_dir,
                        wav_path=args.wav, archive_dir=args.archive_dir,
                        out_dir=args.out, run_id=args.run_id)
        print(json.dumps({"status": report["status"],
                          "capturedNativeRgbFrames": report["sourceToEncoderStdinReceipt"]["capturedFrameCount"],
                          "rawInputSha256": report["sourceToEncoderStdinReceipt"]["rawStdinSha256"],
                          "mayPublish": False}, indent=2))
    else:
        a, ae = read_original_pair_dir(args.first)
        b, be = read_original_pair_dir(args.second)
        report = inspect_both(a, b, ae, be)
        report["downloadedMovieBytesRehashedAgainstBothEncoderReceipts"] = True
        Path(args.out).write_text(json.dumps(report, indent=2) + "\n")
        print(json.dumps(report, indent=2))
