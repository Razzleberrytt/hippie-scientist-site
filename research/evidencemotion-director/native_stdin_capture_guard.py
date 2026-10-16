#!/usr/bin/env python3
"""Research-only full RGB24 FFmpeg-stdin capture receipt: never a release approval.

Attach write() to the ORIGINAL renderer's rawvideo pipe in two separately
governed jobs. The source must pass independent code, font, version, input,
film and runner attestation before any reproducibility claim.
"""
import hashlib
import io
import re

SCHEMA = "ths-em-original-rgb24-stdin-receipt-v1"
SHA = re.compile(r"^[0-9a-f]{64}$")
IDENT = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.:-]{1,95}$")
NATIVE = (1080, 1920, 1031)


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
            hold("EXTRA_FRAME")
        data = memoryview(raw)
        if len(data) != self.frame_bytes:
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
