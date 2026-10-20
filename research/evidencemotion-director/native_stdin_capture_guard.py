#!/usr/bin/env python3
"""Research-only full RGB24 FFmpeg-stdin capture receipt: never a release approval.

Attach write() to the ORIGINAL renderer's rawvideo pipe in two separately
governed jobs. The source must pass independent code, font, version, input,
film and runner attestation before any reproducibility claim.
"""
import hashlib
import re
import subprocess
from pathlib import Path

SCHEMA = "ths-em-original-rgb24-stdin-receipt-v1"
SHA = re.compile(r"^[0-9a-f]{64}$")
IDENT = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.:-]{1,95}$")
NATIVE = (1080, 1920, 1031)
# Versioned v1 envelope: reject any added self-certifying approval fields,
# including names unknown to this guard. New fields require deliberate v2.
RECEIPT_FIELDS = frozenset((
    "schema", "runId", "width", "height", "fps", "pixelFormat",
    "expectedFrames", "capturedFrameCount", "bytesPerFrame", "capturedBytes",
    "frameSha256", "rawStdinSha256", "sourceManifestSha256",
    "originalWavSha256", "environmentSha256", "filmSha256",
    "sinkClosedBeforeEncoderWaitDeclared", "encoderExitCodeDeclared",
    "independentRunnerAuthenticated", "originalMediaExternallyValidated",
    "mayPublish", "streakAccepted",
))


def hold(reason):
    raise ValueError("EM_ORIGINAL_STDIN_HOLD:" + reason)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def sha_check(value, name):
    if not isinstance(value, str) or not SHA.fullmatch(value):
        hold("INVALID_" + name)
    return value


class Capture:
    """Hash frame bytes only after each complete sink.write(), then close."""

    def __init__(self, sink, *, run_id, source_sha, wav_sha, environment_sha,
                 width=1080, height=1920, frames=1031):
        if not isinstance(run_id, str) or not IDENT.fullmatch(run_id):
            hold("INVALID_RUN_ID")
        for key, val in (("SOURCE_SHA", source_sha), ("WAV_SHA", wav_sha),
                         ("ENVIRONMENT_SHA", environment_sha)):
            sha_check(val, key)
        if (type(width) is not int or type(height) is not int or
                type(frames) is not int or min(width, height, frames) < 1):
            hold("INVALID_EXPECTED_GEOMETRY")
        self.sink, self.run_id = sink, run_id
        self.source_sha, self.wav_sha, self.environment_sha = source_sha, wav_sha, environment_sha
        self.width, self.height, self.frames = width, height, frames
        self.frame_bytes = width * height * 3
        self.stream = hashlib.sha256()
        self.frame_hashes = []
        self.total = 0
        self.closed = False
        self.broken = False

    def write(self, raw):
        if self.closed or self.broken:
            hold("PIPE_CLOSED_OR_BROKEN")
        if len(self.frame_hashes) >= self.frames:
            self.broken = True
            hold("EXTRA_FRAME")
        # Cast to byte units, never buffer elements (e.g. uint16), and
        # reject noncontiguous sources rather than miscounting sent bytes.
        try:
            data = memoryview(raw)
        except (TypeError, ValueError):
            self.broken = True
            hold("INVALID_FRAME_BUFFER")
        if not data.c_contiguous:
            self.broken = True
            hold("NONCONTIGUOUS_FRAME")
        try:
            data = data.cast("B")
        except (TypeError, ValueError):
            self.broken = True
            hold("INVALID_FRAME_BUFFER")
        if len(data) != self.frame_bytes:
            self.broken = True
            hold("INCOMPLETE_RGB24_FRAME")
        pos = 0
        try:
            while pos < len(data):
                n = self.sink.write(data[pos:])
                if type(n) is not int or n <= 0 or n > len(data) - pos:
                    self.broken = True
                    hold("INVALID_OR_SHORT_PIPE_WRITE")
                pos += n
        except (OSError, BrokenPipeError):
            self.broken = True
            hold("FFMPEG_STDIN_WRITE_FAILED")
        self.stream.update(data)
        self.frame_hashes.append(digest(data))
        self.total += len(data)

    def close(self):
        if self.closed or self.broken:
            hold("PIPE_CLOSE_AFTER_ERROR_OR_DUPLICATE")
        try:
            self.sink.flush()
            self.sink.close()
        except OSError:
            self.broken = True
            hold("PIPE_FLUSH_CLOSE_FAILED")
        self.closed = True

    def receipt_from_completed_encoder(self, process, film_path):
        """Read the real child's exit and actual encoded film bytes.

        No self-supplied exit status or output digest. This is NOT an
        independently authenticated original renderer, film-quality review or
        repeatability approval. Call only after close() and process.wait().
        """
        if not isinstance(process, subprocess.Popen) or process.stdin is not self.sink:
            hold("ENCODER_PROCESS_STDIN_NOT_BOUND")
        if self.broken or not self.closed:
            hold("CAPTURE_NOT_CLEANLY_CLOSED")
        actual_code = process.poll()
        if actual_code is None:
            hold("ENCODER_STILL_RUNNING")
        if actual_code != 0:
            hold("ENCODER_PROCESS_FAILED")
        path = Path(film_path)
        if path.is_symlink() or not path.is_file():
            hold("FILM_OUTPUT_NOT_REGULAR_FILE")
        hasher = hashlib.sha256()
        n = 0
        with path.open("rb") as handle:
            for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                n += len(chunk)
                hasher.update(chunk)
        if not n:
            hold("ENCODER_OUTPUT_EMPTY")
        return self.receipt(exit_code=actual_code, film_sha=hasher.hexdigest())

    def receipt(self, *, exit_code, film_sha):
        sha_check(film_sha, "FILM_SHA")
        if self.broken or not self.closed:
            hold("SINK_NOT_CLOSED_SUCCESSFULLY")
        if type(exit_code) is not int or exit_code != 0:
            hold("ENCODER_NONZERO_OR_UNVERIFIED_EXIT")
        if len(self.frame_hashes) != self.frames:
            hold("MISSING_FRAMES")
        if self.total != self.frame_bytes * self.frames:
            hold("STREAM_BYTE_COUNT_MISMATCH")
        return {
            "schema": SCHEMA, "runId": self.run_id,
            "width": self.width, "height": self.height, "fps": 30,
            "pixelFormat": "rgb24", "expectedFrames": self.frames,
            "capturedFrameCount": len(self.frame_hashes),
            "bytesPerFrame": self.frame_bytes, "capturedBytes": self.total,
            "frameSha256": list(self.frame_hashes),
            "rawStdinSha256": self.stream.hexdigest(),
            "sourceManifestSha256": self.source_sha, "originalWavSha256": self.wav_sha,
            "environmentSha256": self.environment_sha, "filmSha256": film_sha,
            "sinkClosedBeforeEncoderWaitDeclared": True, "encoderExitCodeDeclared": exit_code,
            "independentRunnerAuthenticated": False,
            "originalMediaExternallyValidated": False,
            "mayPublish": False, "streakAccepted": False,
        }


def check_one(receipt, *, expected_source, expected_wav, expected_environment,
              geometry=NATIVE):
    if not isinstance(receipt, dict) or receipt.get("schema") != SCHEMA:
        hold("RECEIPT_SCHEMA")
    if set(receipt) != RECEIPT_FIELDS:
        hold("NONCANONICAL_RECEIPT_FIELDS")
    if not isinstance(receipt.get("runId"), str) or not IDENT.fullmatch(receipt["runId"]):
        hold("RECEIPT_RUN_ID")
    w, h, frames = geometry
    if any(type(receipt.get(key)) is not int or receipt[key] != value for key, value in (
            ("width", w), ("height", h), ("fps", 30),
            ("expectedFrames", frames), ("capturedFrameCount", frames),
            ("bytesPerFrame", w*h*3), ("capturedBytes", w*h*3*frames))):
        hold("INCOMPLETE_OR_WRONG_GEOMETRY")
    if receipt.get("pixelFormat") != "rgb24":
        hold("WRONG_PIXEL_FORMAT")
    for key, expected in (("sourceManifestSha256", expected_source),
                          ("originalWavSha256", expected_wav),
                          ("environmentSha256", expected_environment)):
        sha_check(expected, "EXTERNAL_EXPECTED_" + key)
        if receipt.get(key) != expected:
            hold("EXTERNAL_IDENTITY_MISMATCH_" + key)
    for key in ("filmSha256", "rawStdinSha256"):
        sha_check(receipt.get(key), key)
    hashes = receipt.get("frameSha256")
    if not isinstance(hashes, list) or len(hashes) != frames or any(
            not isinstance(v, str) or not SHA.fullmatch(v) for v in hashes):
        hold("FRAME_SHA_INVENTORY_INVALID")
    if (receipt.get("sinkClosedBeforeEncoderWaitDeclared") is not True or
            type(receipt.get("encoderExitCodeDeclared")) is not int or
            receipt["encoderExitCodeDeclared"] != 0):
        hold("PIPE_COMPLETION_NOT_PROVEN")
    if (receipt.get("mayPublish") is not False or
            receipt.get("streakAccepted") is not False or
            receipt.get("independentRunnerAuthenticated") is not False or
            receipt.get("originalMediaExternallyValidated") is not False):
        hold("FORGED_APPROVAL_OR_ATTESTATION")
    return True


def compare_pair(first, second, *, expected_source, expected_wav,
                 expected_environment, geometry=NATIVE):
    for item in (first, second):
        check_one(item, expected_source=expected_source,
                  expected_wav=expected_wav,
                  expected_environment=expected_environment, geometry=geometry)
    if first["runId"] == second["runId"]:
        hold("RUN_IDENTITIES_NOT_DISTINCT")
    if (first["rawStdinSha256"] != second["rawStdinSha256"] or
            first["frameSha256"] != second["frameSha256"]):
        hold("REPLAYED_SOURCE_FRAMES_DISAGREE")
    return {
        "schema": "ths-em-native-stdin-pair-research-v1",
        "sourceFrameDigestsMatchAcrossTwoDeclaredRuns": True,
        "twoActualIndependentJobExecutionsAuthenticated": False,
        "originalFullStdinExternallyCapturedAndReplayed": False,
        "nativeFullMediaDecodeAndCraftApproved": False,
        "mayPublish": False,
        "firstExcellentMasterAccepted": False, "fiveRenderStreakAccepted": False,
        "status": "HOLD_INDEPENDENT_RUNNER_AND_ORIGINAL_MEDIA_PROOF_REQUIRED"
    }


def capture_renderer_encoder_call(render_fn, *, run_id, source_sha, wav_path,
                                  environment_sha, film_path, expected_wav_sha,
                                  geometry=NATIVE):
    """Opt-in RESEARCH interception of actual original renderer->FFmpeg writes.

    No original renderer edits. The caller must independently pin the exact
    source+font+runtime+runner provenance: this wrapper cannot authenticate it.
    It verifies the WAV's physical bytes before/after and the movie's physical
    bytes after encoder exit; these do not imply science/craft approval.
    """
    import os
    import subprocess
    from pathlib import Path
    from unittest.mock import patch

    wav, film = Path(wav_path), Path(film_path)
    for name, value in (("SOURCE_SHA", source_sha),
                        ("ENVIRONMENT_SHA", environment_sha),
                        ("WAV_SHA", expected_wav_sha)):
        sha_check(value, name)
    if (not isinstance(geometry, tuple) or len(geometry) != 3 or
            any(type(v) is not int or v < 1 for v in geometry)):
        hold("INVALID_GEOMETRY")
    w, h, frames = geometry
    # A fresh renderer may create its output directory; only its existing
    # trusted parent must already exist. Original WAV is always required.
    if (not wav.is_file() or wav.is_symlink()
            or not (film.parent.is_dir() or film.parent.parent.is_dir())):
        hold("SOURCE_WAV_OR_RENDER_PARENT_UNAVAILABLE")
    if film.is_symlink() or film.exists():
        hold("STALE_OR_SYMLINKED_FILM_DESTINATION")
    if _hash_file(wav) != expected_wav_sha:
        hold("ORIGINAL_WAV_BYTES_DRIFT")
    original = subprocess.Popen
    matched = []

    def intercept(argv, *args, **kwargs):
        command = [str(v) for v in argv] if isinstance(argv, (list, tuple)) else None
        is_rawvideo_encoder = (
            command is not None
            and os.path.basename(command[0]) == "ffmpeg"
            and "pipe:0" in command
            and "rawvideo" in command
        )
        if not is_rawvideo_encoder:
            return original(argv, *args, **kwargs)
        if matched:
            hold("MULTIPLE_ORIGINAL_ENCODERS_UNEXPECTED")
        def value_after(flag):
            try:
                return command[command.index(flag) + 1]
            except (IndexError, ValueError):
                hold("MISSING_ENCODER_ARGUMENT_" + flag)
        if (value_after("-video_size") != f"{w}x{h}"
                or value_after("-framerate") != "30"
                or value_after("-pixel_format") != "rgb24"
                or value_after("-frames:v") != str(frames)
                or value_after("-c:v") != "libx264"):
            hold("ENCODER_CONFIGURATION_DRIFT")
        if kwargs.get("stdin") is not subprocess.PIPE:
            hold("RENDERER_MUST_USE_PIPE")
        # FFmpeg source soundtrack argument must point at the pinned WAV.
        input_paths = [command[i+1] for i, v in enumerate(command[:-1]) if v == "-i"]
        if len(input_paths) != 2 or input_paths[0] != "pipe:0" or (
                Path(input_paths[1]).resolve() != wav.resolve()):
            hold("ENCODER_SOURCE_WAV_PATH_DRIFT")
        if Path(command[-1]).resolve() != film.resolve():
            hold("ENCODER_FILM_OUTPUT_PATH_DRIFT")
        process = original(argv, *args, **kwargs)
        writer = Capture(process.stdin, run_id=run_id,
                         source_sha=source_sha, wav_sha=expected_wav_sha,
                         environment_sha=environment_sha,
                         width=w, height=h, frames=frames)
        process.stdin = writer
        matched.append((process, writer))
        return process

    try:
        with patch.object(subprocess, "Popen", side_effect=intercept):
            render_fn()
    except BaseException:
        for process, _ in matched:
            if process.poll() is None:
                process.kill()
                process.wait()
        raise
    if len(matched) != 1:
        hold("ORIGINAL_ENCODER_NOT_OBSERVED")
    process, writer = matched[0]
    if process.poll() is None or process.returncode != 0:
        hold("ORIGINAL_ENCODER_NOT_SUCCESSFULLY_WAITED")
    if not film.is_file() or film.is_symlink() or _hash_file(wav) != expected_wav_sha:
        hold("ENCODED_FILM_MISSING_OR_WAV_CHANGED")
    # Reuse the exact v1 schema: unknown fields are deliberately rejected.
    # The captured film SHA is derived from physical output bytes here.
    return writer.receipt(exit_code=process.returncode, film_sha=_hash_file(film))


def _hash_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()
