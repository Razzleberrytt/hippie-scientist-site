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
import tempfile

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

# Exactly the fields produced by compare_pair -> inspect_both -> decoded
# physical A/B receiver. No additional self-asserted approval or missing
# evidence fields may be smuggled into a stored research HOLD receipt.
ORIGINAL_PAIR_RESEARCH_FIELDS = frozenset((
    "schema", "status", "sourceFrameDigestsMatchAcrossTwoDeclaredRuns",
    "twoActualIndependentJobExecutionsAuthenticated",
    "originalFullStdinExternallyCapturedAndReplayed",
    "nativeFullMediaDecodeAndCraftApproved", "mayPublish",
    "firstExcellentMasterAccepted", "fiveRenderStreakAccepted",
    "twoGitHubHostedRunnerNamesDifferent",
    "twoPhysicalFullNativeSourceRendersProduced",
    "twoNativeDecodedMoviesVerified", "sourceFrameBitwiseMatch",
    "actualOriginalHistoricalFFmpegBinaryPinned",
    "twoResearchSingleThreadEncodedMoviesBitwiseIdentical",
    "downloadedMovieBytesRehashedAgainstBothEncoderReceipts",
    "twoDownloadedNativeMoviesIndependentlyFullyDecoded",
    "twoPhysicalX264DisabledCpuAsmLogsIndependentlyValidated",
))
ORIGINAL_PAIR_RESEARCH_FALSE = frozenset((
    "twoActualIndependentJobExecutionsAuthenticated",
    "nativeFullMediaDecodeAndCraftApproved", "mayPublish",
    "firstExcellentMasterAccepted", "fiveRenderStreakAccepted",
    "actualOriginalHistoricalFFmpegBinaryPinned",
))
ORIGINAL_PAIR_RESEARCH_TRUE = (
    ORIGINAL_PAIR_RESEARCH_FIELDS - ORIGINAL_PAIR_RESEARCH_FALSE -
    {"schema", "status"}
)




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


def assert_original_replay_inputs_unchanged(*, sources, fonts, wav, candidate,
                                            environment):
    """Fail closed if pinned physical inputs change during a long native render.

    Environment fingerprinting before the render is insufficient: the 1,031
    source frames plus independent encoded-film decode take time. Check the
    original paths and bytes again *before* the successful job receipt.
    This is an end-point continuity check, not an atomic filesystem snapshot.
    """
    from original_replay_source_restore import PINNED

    source_hashes = environment.get("sourceHashesSha256")
    font_hashes = environment.get("fontHashesSha256")
    if (not isinstance(source_hashes, dict) or set(source_hashes) != set(PINNED)
            or not isinstance(font_hashes, dict)
            or set(font_hashes) != {"DejaVuSans.ttf", "DejaVuSans-Bold.ttf"}):
        raise ValueError("NATIVE_ORIGINAL_HOLD:ORIGINAL_REPLAY_INPUT_INVENTORY_CHANGED")

    files = ([(Path(sources) / name, digest, "RENDERER_SOURCE")
              for name, digest in sorted(source_hashes.items())] +
             [(Path(fonts) / name, digest, "FONT")
              for name, digest in sorted(font_hashes.items())] +
             [(Path(wav), environment.get("wavSha256"), "NARRATION_WAV"),
              (Path(candidate), environment.get("alignmentCandidateSha256"), "ALIGNMENT"),
              (Path(original_media_executable("ffmpeg")),
               environment.get("ffmpegExecutableSha256"), "ENCODER_BINARY")])
    for path, expected, category in files:
        if (not isinstance(expected, str) or len(expected) != 64
                or any(ch not in "0123456789abcdef" for ch in expected)
                or not path.is_file() or path.is_symlink()
                or sha_file(path) != expected):
            raise ValueError(
                "NATIVE_ORIGINAL_HOLD:ORIGINAL_REPLAY_INPUT_CHANGED_DURING_RENDER:"
                + category)
    return True


def assert_original_renderer_module_import_safe(source_dir, *, loaded=None):
    """Reject Python's sys.modules cache as an archival-renderer substitute.

    The path list alone does not force a fresh import. A prior import under
    the same module name would win, regardless of the byte-pinned directory.
    Caller must perform pre-import check before changing sys.path; after
    import, validate the entrypoint's actual module origin.
    """
    from original_replay_source_restore import PINNED

    if loaded is None:
        cached = sorted(name[:-3] for name in PINNED if name[:-3] in sys.modules)
        if cached:
            raise ValueError(
                "NATIVE_ORIGINAL_HOLD:ARCHIVED_RENDERER_MODULE_PRELOADED:" +
                ",".join(cached))
        return True

    expected = Path(source_dir) / "narration_locked_treatments.py"
    origin = getattr(getattr(loaded, "__spec__", None), "origin", None)
    location = getattr(loaded, "__file__", None)
    if (getattr(loaded, "__name__", None) != "narration_locked_treatments"
            or not isinstance(origin, str) or not isinstance(location, str)
            or Path(origin).resolve() != expected.resolve()
            or Path(location).resolve() != expected.resolve()
            or not expected.is_file() or expected.is_symlink()
            or sha_file(expected) != PINNED["narration_locked_treatments.py"]):
        raise ValueError("NATIVE_ORIGINAL_HOLD:ARCHIVED_RENDERER_IMPORT_ORIGIN_DRIFT")
    return True


def release_owned_original_renderer_modules(source_dir):
    """Uncache only the archival Python modules loaded by this replay.

    A provenance guard that rejects any preloaded renderer would otherwise
    reject a legitimate second replay inside the same Python process. The
    pre-import check establishes that these names were initially absent.
    Do NOT evict foreign-origin modules: that could erase another owner's
    cached code after an unexpected import-path collision.
    """
    from original_replay_source_restore import PINNED

    owned = []
    for name in PINNED:
        module_name = name[:-3]
        loaded = sys.modules.get(module_name)
        if loaded is None:
            continue
        expected = (Path(source_dir) / name).resolve()
        location = getattr(loaded, "__file__", None)
        origin = getattr(getattr(loaded, "__spec__", None), "origin", None)
        if (not isinstance(location, str) or not isinstance(origin, str)
                or Path(location).resolve() != expected
                or Path(origin).resolve() != expected):
            raise ValueError(
                "NATIVE_ORIGINAL_HOLD:ARCHIVED_RENDERER_CACHE_ORIGIN_DRIFT:" + module_name)
        owned.append(module_name)
    for module_name in owned:
        del sys.modules[module_name]
    return tuple(owned)


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
    # A cached sys.modules entry overrides sys.path even if every archived
    # source file on disk is SHA-pinned. Reject before any renderer execution.
    assert_original_renderer_module_import_safe(source_dir)
    # Never import the current main or candidate reimplementation in place of the
    # 11 byte-pinned historical renderer modules.
    sys.path.insert(0, str(source_dir))
    process = None
    start = time.monotonic()
    try:
        r = importlib.import_module("narration_locked_treatments")
        assert_original_renderer_module_import_safe(source_dir, loaded=r)
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
        assert_original_replay_inputs_unchanged(
            sources=source_dir, fonts=font_dir, wav=wav_path,
            candidate=align_path, environment=environment)
        if (sha_file(archive_root / "render-receipt.json") != ORIGINAL_TIMED_RECEIPT_SHA256
                or any(sha_file(archive_root / f"source_frame_{index:04d}.png")
                       != ARCHIVED_PNG_SHA[index] for index in SAMPLE_INDEX_SET)
                or sha_file(out_dir / "environment.json") != sha(
                    (json.dumps(environment, indent=2) + "\n").encode("utf-8"))
                or sha_file(movie) != receipt["filmSha256"]):
            raise ValueError("NATIVE_ORIGINAL_HOLD:ORIGINAL_REPLAY_EVIDENCE_CHANGED_DURING_RENDER")
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
        try:
            release_owned_original_renderer_modules(source_dir)
        finally:
            if not sys.path or sys.path[0] != str(source_dir):
                raise ValueError("NATIVE_ORIGINAL_HOLD:ARCHIVED_RENDERER_IMPORT_PATH_DRIFT")
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
    if (not path.is_dir() or path.is_symlink()
            or _original_receipt_has_symlinked_ancestor(
                path / "full-original-replay.json")):
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
                (json.dumps(e, indent=2) + "\n").encode()):
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
    if (not p.is_file() or p.is_symlink() or p.stat().st_size == 0
            or _original_receipt_has_symlinked_ancestor(p)):
        raise ValueError("NATIVE_ORIGINAL_HOLD:X264_CPU_ASM_PROOF_LOG_MISSING")
    log = p.read_bytes()
    if (b"using cpu capabilities: none!" not in log
            or b"Error parsing option" in log):
        raise ValueError("NATIVE_ORIGINAL_HOLD:X264_CPU_ASM_CONTROL_NOT_PROVEN")
    return True


def verify_uploaded_movie(artifact_dir, report):
    """Hash downloaded physical film bytes instead of trusting report metadata."""
    movie = Path(artifact_dir) / ORIGINAL_NAME
    if (not movie.is_file() or movie.is_symlink() or movie.stat().st_size == 0
            or _original_receipt_has_symlinked_ancestor(movie)):
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



def audit_downloaded_original_movie(artifact_dir, *, expected_geometry=NATIVE,
                                    expected_film_sha256=None):
    """Physically decode the exact downloaded video, with input identity held.

    The CLI supplies the producer's verified encoded-film hash. A fixture
    may omit that external pin but must still pass the before/after byte
    continuity check. This cannot replace independent craft/phone review.
    """
    if (not isinstance(expected_geometry, tuple) or len(expected_geometry) != 3
            or any(type(n) is not int or n < 1 for n in expected_geometry)):
        raise ValueError("NATIVE_ORIGINAL_HOLD:INVALID_MEDIA_EXPECTATION")
    width, height, frames = expected_geometry
    base = Path(artifact_dir)
    movie = base / ORIGINAL_NAME
    if (not movie.is_file() or movie.is_symlink()
            or _original_receipt_has_symlinked_ancestor(movie)):
        raise ValueError("NATIVE_ORIGINAL_HOLD:DOWNLOADED_FILM_UNAVAILABLE")
    if expected_film_sha256 is not None and (
            not isinstance(expected_film_sha256, str)
            or len(expected_film_sha256) != 64
            or any(c not in "0123456789abcdef" for c in expected_film_sha256)):
        raise ValueError("NATIVE_ORIGINAL_HOLD:EXPECTED_DOWNLOADED_FILM_SHA_INVALID")
    encoder_log = base / "encoder.log"
    validate_disabled_x264_cpu_asm(encoder_log)
    movie_sha_before = sha_file(movie)
    encoder_log_sha_before = sha_file(encoder_log)
    if (expected_film_sha256 is not None
            and movie_sha_before != expected_film_sha256):
        raise ValueError("NATIVE_ORIGINAL_HOLD:DOWNLOADED_FILM_NOT_PRODUCER_PINNED")
    try:
        probe = subprocess.run([
            original_media_executable("ffprobe"), "-v", "error",
            "-count_frames", "-show_entries",
            "stream=codec_type,codec_name,width,height,pix_fmt,nb_read_frames,avg_frame_rate,sample_aspect_ratio,sample_rate",
            "-of", "json", str(movie),
        ], capture_output=True, check=True, text=True, timeout=80)
        streams = strict_json(probe.stdout).get("streams")
    except (OSError, subprocess.SubprocessError, ValueError, UnicodeError) as exc:
        raise ValueError("NATIVE_ORIGINAL_HOLD:DOWNLOADED_MEDIA_PROBE_FAILED") from exc
    if not isinstance(streams, list):
        raise ValueError("NATIVE_ORIGINAL_HOLD:DOWNLOADED_MEDIA_STREAM_INVENTORY_INVALID")
    videos = [s for s in streams if s.get("codec_type") == "video"]
    audios = [s for s in streams if s.get("codec_type") == "audio"]
    if len(streams) != 2 or len(videos) != 1 or len(audios) != 1:
        raise ValueError("NATIVE_ORIGINAL_HOLD:DOWNLOADED_MEDIA_STREAM_INVENTORY_INVALID")
    v = videos[0]
    if (v.get("codec_name") != "h264" or v.get("width") != width
            or v.get("height") != height or v.get("pix_fmt") != "yuv420p"
            or v.get("avg_frame_rate") != "30/1"
            or v.get("sample_aspect_ratio", "1:1") != "1:1"
            or str(v.get("nb_read_frames")) != str(frames)
            or audios[0].get("codec_name") != "aac"):
        raise ValueError("NATIVE_ORIGINAL_HOLD:DOWNLOADED_MEDIA_CODEC_OR_FRAME_DRIFT")
    # Presence of an AAC track does not prove it covers the movie. The actual
    # archived original is ~34.37 s; a valid 0.05 s AAC track attached to it
    # still fully decodes and would formerly have passed. FFprobe -count_frames
    # counts decoded AAC access units (normally 1024 samples). Allow two
    # 1024-sample access units of encoder priming/end-padding tolerance.
    audio = audios[0]
    sr_text, count_text = audio.get("sample_rate"), audio.get("nb_read_frames")
    if (not isinstance(sr_text, str) or not sr_text.isascii() or not sr_text.isdecimal()
            or not isinstance(count_text, str) or not count_text.isascii()
            or not count_text.isdecimal()):
        raise ValueError("NATIVE_ORIGINAL_HOLD:DOWNLOADED_AAC_COVERAGE_UNPROVEN")
    sample_rate, decoded_aac_frames = int(sr_text), int(count_text)
    if not 8000 <= sample_rate <= 192000 or decoded_aac_frames < 1:
        raise ValueError("NATIVE_ORIGINAL_HOLD:DOWNLOADED_AAC_COVERAGE_UNPROVEN")
    expected_aac_frames = (frames * sample_rate + 30 * 1024 - 1) // (30 * 1024)
    # Permit only two AAC access units (priming and end-padding) of drift in
    # either direction. A much longer AAC track also fully decodes, but can
    # smuggle an unrelated extra tail into an otherwise valid 1,031-frame MP4.
    minimum_aac_frames = max(1, expected_aac_frames - 2)
    maximum_aac_frames = expected_aac_frames + 2
    if decoded_aac_frames < minimum_aac_frames:
        raise ValueError("NATIVE_ORIGINAL_HOLD:DOWNLOADED_AAC_TOO_SHORT_FOR_FILM")
    if decoded_aac_frames > maximum_aac_frames:
        raise ValueError("NATIVE_ORIGINAL_HOLD:DOWNLOADED_AAC_TOO_LONG_FOR_FILM")
    try:
        subprocess.run([
            original_media_executable("ffmpeg"), "-nostdin", "-v", "error",
            "-xerror", "-i", str(movie), "-map", "0:v:0", "-map", "0:a:0",
            "-f", "null", "-",
        ], check=True, capture_output=True, timeout=120)
    except (OSError, subprocess.SubprocessError) as exc:
        raise ValueError("NATIVE_ORIGINAL_HOLD:DOWNLOADED_MEDIA_FULL_DECODE_FAILED") from exc
    # Metadata/probe/decode verdicts only apply to the exact bytes we saw
    # before starting. No successful receipt for a replaced movie/log.
    if (not movie.is_file() or movie.is_symlink()
            or _original_receipt_has_symlinked_ancestor(movie)
            or not encoder_log.is_file() or encoder_log.is_symlink()
            or _original_receipt_has_symlinked_ancestor(encoder_log)
            or sha_file(movie) != movie_sha_before
            or sha_file(encoder_log) != encoder_log_sha_before):
        raise ValueError("NATIVE_ORIGINAL_HOLD:DOWNLOADED_MEDIA_BYTES_CHANGED_DURING_AUDIT")
    return {
        "originalNativeFullMediaPhysicalDecode": True,
        "actualDecodedSourceFrameCount": frames,
        "actualPhysicalAACStreamConfirmed": True,
        "physicalEncoderCpuAsmDisabledLogConfirmed": True,
        "humanCraftOrPhoneApproved": False,
        "mayPublish": False,
    }



def _original_receipt_has_symlinked_ancestor(path):
    """Refuse folder aliases even above the immediate output parent.

    Preserve lexical '..' path elements while inspecting: resolving or
    normalizing first can conceal a symlink traversed by the filesystem.
    """
    candidate = Path(path)
    parent = (candidate if candidate.is_absolute() else Path.cwd() / candidate).parent
    while True:
        if parent.is_symlink():
            return True
        if parent == parent.parent:
            return False
        parent = parent.parent


def write_original_pair_research_hold(destination, report):
    """Stage a complete research-only receipt, then expose it without clobber.

    Do not overwrite a prior receipt, follow a destination symlink, or publish
    a partial JSON report on a failing write. Local atomic hardlink creation
    makes pre-existing output names a HOLD (same principle as film handoff).
    """
    if (not isinstance(report, dict)
            or set(report) != ORIGINAL_PAIR_RESEARCH_FIELDS
            or report.get("schema") != "ths-em-native-stdin-pair-research-v1"
            or report.get("status") != "SINGLE_THREAD_ORIGINAL_SOURCE_H264_BITWISE_REPLAY_RESEARCH_HOLD"
            or any(report.get(field) is not False for field in ORIGINAL_PAIR_RESEARCH_FALSE)
            or any(report.get(field) is not True for field in ORIGINAL_PAIR_RESEARCH_TRUE)):
        raise ValueError("NATIVE_ORIGINAL_HOLD:UNAUTHORIZED_RECEIPT_CONTENT")
    final = Path(destination)
    parent = final.parent
    if (not parent.is_dir() or _original_receipt_has_symlinked_ancestor(final)
            or not final.name or final.name in (".", "..")
            or final.exists() or final.is_symlink()):
        raise ValueError("NATIVE_ORIGINAL_HOLD:RESEARCH_RECEIPT_DESTINATION_UNSAFE")
    blob = (json.dumps(report, indent=2, allow_nan=False) + "\n").encode("utf-8")
    staged = None
    try:
        with tempfile.NamedTemporaryFile(
                dir=str(parent), prefix=".em-original-receipt-", suffix=".tmp",
                mode="wb", delete=False) as stream:
            staged = Path(stream.name)
            stream.write(blob)
            stream.flush()
            os.fsync(stream.fileno())
        if staged.stat().st_size != len(blob) or sha_file(staged) != sha(blob):
            raise ValueError("NATIVE_ORIGINAL_HOLD:RESEARCH_RECEIPT_STAGE_DRIFT")
        # Hardlink is atomic and refuses existing paths, unlike os.replace().
        try:
            os.link(staged, final)
        except FileExistsError as exc:
            raise ValueError("NATIVE_ORIGINAL_HOLD:RESEARCH_RECEIPT_ALREADY_EXISTS") from exc
        if sha_file(final) != sha(blob):
            raise ValueError("NATIVE_ORIGINAL_HOLD:RESEARCH_RECEIPT_COMMIT_DRIFT")
    finally:
        if staged is not None:
            staged.unlink(missing_ok=True)
    return str(final)


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
        verified_a = audit_downloaded_original_movie(
            args.first, expected_film_sha256=a["sourceToEncoderStdinReceipt"]["filmSha256"])
        verified_b = audit_downloaded_original_movie(
            args.second, expected_film_sha256=b["sourceToEncoderStdinReceipt"]["filmSha256"])
        report = inspect_both(a, b, ae, be)
        report["downloadedMovieBytesRehashedAgainstBothEncoderReceipts"] = True
        report["twoDownloadedNativeMoviesIndependentlyFullyDecoded"] = (
            verified_a["originalNativeFullMediaPhysicalDecode"]
            and verified_b["originalNativeFullMediaPhysicalDecode"])
        report["twoPhysicalX264DisabledCpuAsmLogsIndependentlyValidated"] = (
            verified_a["physicalEncoderCpuAsmDisabledLogConfirmed"]
            and verified_b["physicalEncoderCpuAsmDisabledLogConfirmed"])
        write_original_pair_research_hold(args.out, report)
        print(json.dumps(report, indent=2))
