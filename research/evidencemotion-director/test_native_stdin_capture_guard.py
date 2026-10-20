"""Adversarial research tests: these use tiny synthetic frames, not a real render."""
import io
import hashlib
import json
import os
import shutil
import stat
import subprocess
import sys
import tempfile
import unittest
import wave
from pathlib import Path
from unittest.mock import patch

from original_replay_admission import inspect_replay_inputs, EXPECTED_RENDERER_FILES, EXPECTED_FONTS
from original_replay_source_restore import restore_pinned_sources
from native_stdin_capture_guard import (
    Capture, check_one, compare_pair, digest, capture_renderer_encoder_call
)

SOURCE = digest(b"real-source-manifest-placeholder")
WAV = digest(b"real-WAV-identity-placeholder")
ENV = digest(b"real-environment-identity-placeholder")
FILM = digest(b"synthetic-video-not-actual-film")
GEOM = (2, 1, 3)
FRAME = b"\x02\x04\x06\x08\x0a\x0c"


def capture(run="run-one", frames=3, sink=None):
    writer = Capture(sink or io.BytesIO(), run_id=run, source_sha=SOURCE,
                     wav_sha=WAV, environment_sha=ENV,
                     width=2, height=1, frames=frames)
    for _ in range(frames):
        writer.write(FRAME)
    writer.close()
    return writer.receipt(exit_code=0, film_sha=FILM)


def pair(a=None, b=None):
    return compare_pair(a or capture("run-one"), b or capture("run-two"),
                        expected_source=SOURCE, expected_wav=WAV,
                        expected_environment=ENV, geometry=GEOM)


def synthetic_git_history_fixture(folder):
    repo=Path(folder)/"repo"
    src=repo/"research"/"evidencemotion-director"
    src.mkdir(parents=True)
    def git(*args):
        proc=subprocess.run(["git","-C",str(repo),*args],
                            capture_output=True,text=True,check=True)
        return proc.stdout.strip()
    git("init","-q")
    git("config","user.name","EvidenceMotion Fixture")
    git("config","user.email","evidencemotion@example.invalid")
    (src/"alpha.py").write_bytes(b"original alpha\n")
    (src/"beta.py").write_bytes(b"first beta\n")
    git("add",".");git("commit","-qm","baseline fixture")
    older=git("rev-parse","HEAD")
    (src/"beta.py").write_bytes(b"original beta\n")
    git("add",".");git("commit","-qm","changed beta fixture")
    newer=git("rev-parse","HEAD")
    pins={"alpha.py":digest(b"original alpha\n"),
          "beta.py":digest(b"original beta\n")}
    refs={"alpha.py":older,"beta.py":newer}
    return repo,pins,refs


def pinned_environment_fixture(folder):
    """Synthetic local inputs with real byte pins, never original media."""
    base=Path(folder)
    sources=base/"source"; sources.mkdir()
    fonts=base/"fonts"; fonts.mkdir()
    source_pins={}
    font_pins={}
    for name in EXPECTED_RENDERER_FILES:
        p=sources/name
        p.write_bytes(("pinned-test-source:"+name).encode())
        source_pins[name]=digest(p.read_bytes())
    for name in EXPECTED_FONTS:
        p=fonts/name
        p.write_bytes(("pinned-test-font:"+name).encode())
        font_pins[name]=digest(p.read_bytes())
    wav=base/"narration.wav"
    wav.write_bytes(b"pinned-synthetic-wav-fixture")
    receipt=base/"original-render-receipt.json"
    receipt.write_text(json.dumps({
        "rendererSourcesSha256":source_pins,
        "fonts":font_pins,"sourceWavSha256":digest(wav.read_bytes()),
        "pillowVersion":"12.0.0","rdkitVersion":"2025.09.4",
        "resolution":[1080,1920],"frames":1031,"fps":30,
        "treatment":"specimen","experimentCaptionMode":"TIMED_RESEARCH",
    },sort_keys=True))
    args=dict(receipt_path=receipt,renderer_dir=sources,font_dir=fonts,
              wav_path=wav,expected_receipt_sha=digest(receipt.read_bytes()),
              expected_wav_sha=digest(wav.read_bytes()),
              pillow_version="12.0.0",rdkit_version="2025.09.4")
    return args


class ShortSink:
    def __init__(self): self.chunks = []; self.closed = False
    def write(self, data):
        self.chunks.append(bytes(data[:2])); return min(2, len(data))
    def flush(self): pass
    def close(self): self.closed = True


class ZeroSink(ShortSink):
    def write(self, data): return 0


class Tests(unittest.TestCase):
    @staticmethod
    def _frozen_environment_v1():
        from original_replay_source_restore import PINNED
        from original_replay_admission import ORIGINAL_TIMED_RECEIPT_SHA256, ORIGINAL_WAV_SHA256
        from original_frame_replay_probe import CANDIDATE_SHA
        from original_native_stdin_replay import ORIGINAL_FONT_PINS
        env = {
            "schema": "ths-em-original-stdin-env-v1",
            "archivedOriginalReceiptSha256": ORIGINAL_TIMED_RECEIPT_SHA256,
            "alignmentCandidateSha256": CANDIDATE_SHA,
            "wavSha256": ORIGINAL_WAV_SHA256,
            "sourceHashesSha256": dict(PINNED),
            "fontHashesSha256": dict(ORIGINAL_FONT_PINS),
            "pillowVersion": "12.0.0",
            "rdkitVersion": "2025.09.4",
            "pythonVersion": "3.11.17",
            "ffmpegExecutableSha256": digest(b"fixture actual ffmpeg executable"),
            "ffmpegVersion": "ffmpeg version 6.1.1-3ubuntu5",
            "encoderMode": "CPU_ASM_DISABLED_X264_AND_SWSCALE_RESEARCH",
        }
        env["environmentSha256"] = digest(json.dumps(
            env, sort_keys=True, separators=(",", ":")).encode("utf-8"))
        env["originalArchivedFFmpegBinarySha256Verified"] = False
        env["releaseAuthorized"] = False
        return env

    @classmethod
    def _job_v1_fixture(cls, *, movie_bytes=b"synthetic-research-video-not-real-film"):
        from original_native_stdin_replay import ORIGINAL_JOB_V1_FIELDS
        env = cls._frozen_environment_v1()
        environment_file = (json.dumps(env, indent=2) + "\n").encode()
        job = {
            "schema": "ths-em-original-stdin-full-native-replay-job-v1",
            "status": "ONE_ORIGINAL_SOURCE_RENDER_RESEARCH_ONLY",
            "encoderMode": "CPU_ASM_DISABLED_X264_AND_SWSCALE_RESEARCH",
            "runId": "fixture-run-one",
            "runnerJobId": "research-matrix",
            "runnerName": "fixture-runner",
            "githubRunId": "fixture-github-run",
            "originalRendererGitSourcesRecovered": True,
            "allEightArchivedOriginalPixelSamplesBitwiseMatched": True,
            "nativeEncodedFilmFullDecode": True,
            "originalRendererFullRenderExecuted": True,
            "x264CpuAsmDisabledMachineLogObserved": True,
            "sourceToEncoderStdinReceipt": {"filmSha256": digest(movie_bytes)},
            "sha256EnvironmentJson": digest(environment_file),
            "wallSeconds": 12.125,
            "mayPublish": False,
            "firstExcellentMasterAccepted": False,
            "fiveRenderStreakAccepted": False,
            "independentJobProvenanceExternallyAuthenticated": False,
            "originalArchivedFFmpegBinaryAuthenticated": False,
        }
        assert set(job) == ORIGINAL_JOB_V1_FIELDS, "Fixture must exactly model original v1 writer"
        return job, env, movie_bytes

    @staticmethod
    def _pair_hold_for_write():
        # Exact expected compare_pair + physical receiver schema, not a
        # minimal partial fixture that could accidentally bless omissions.
        return {
            "schema": "ths-em-native-stdin-pair-research-v1",
            "status": "SINGLE_THREAD_ORIGINAL_SOURCE_H264_BITWISE_REPLAY_RESEARCH_HOLD",
            "sourceFrameDigestsMatchAcrossTwoDeclaredRuns": True,
            "twoActualIndependentJobExecutionsAuthenticated": False,
            "originalFullStdinExternallyCapturedAndReplayed": True,
            "nativeFullMediaDecodeAndCraftApproved": False,
            "mayPublish": False,
            "firstExcellentMasterAccepted": False,
            "fiveRenderStreakAccepted": False,
            "twoGitHubHostedRunnerNamesDifferent": True,
            "twoPhysicalFullNativeSourceRendersProduced": True,
            "twoNativeDecodedMoviesVerified": True,
            "sourceFrameBitwiseMatch": True,
            "actualOriginalHistoricalFFmpegBinaryPinned": False,
            "twoResearchSingleThreadEncodedMoviesBitwiseIdentical": True,
            "downloadedMovieBytesRehashedAgainstBothEncoderReceipts": True,
            "twoDownloadedNativeMoviesIndependentlyFullyDecoded": True,
            "twoPhysicalX264DisabledCpuAsmLogsIndependentlyValidated": True,
        }

    def test_research_pair_receipt_fresh_complete_atomically_published(self):
        from original_native_stdin_replay import write_original_pair_research_hold
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "original-pair-HOLD.json"
            receipt = self._pair_hold_for_write()
            self.assertEqual(write_original_pair_research_hold(output, receipt), str(output))
            self.assertEqual(json.loads(output.read_text()), receipt)
            self.assertFalse(receipt["mayPublish"])
            self.assertFalse(receipt["twoActualIndependentJobExecutionsAuthenticated"])
            self.assertEqual(sorted(p.name for p in Path(directory).iterdir()),
                             ["original-pair-HOLD.json"])
            self.assertTrue(output.read_bytes().endswith(b"\n"))

    def test_research_pair_receipt_no_clobber_original_bytes(self):
        from original_native_stdin_replay import write_original_pair_research_hold
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "original-pair-HOLD.json"
            output.write_bytes(b"OWNER_FILE_MUST_SURVIVE")
            with self.assertRaisesRegex(ValueError, "RESEARCH_RECEIPT_DESTINATION_UNSAFE"):
                write_original_pair_research_hold(output, self._pair_hold_for_write())
            self.assertEqual(output.read_bytes(), b"OWNER_FILE_MUST_SURVIVE")
            self.assertEqual(len(list(Path(directory).iterdir())), 1)

    def test_research_pair_receipt_rejects_symlink_without_target_change(self):
        from original_native_stdin_replay import write_original_pair_research_hold
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target = root / "owner.txt"
            target.write_bytes(b"OWNER_BYTES")
            link = root / "original-pair-HOLD.json"
            link.symlink_to(target)
            with self.assertRaisesRegex(ValueError, "RESEARCH_RECEIPT_DESTINATION_UNSAFE"):
                write_original_pair_research_hold(link, self._pair_hold_for_write())
            self.assertEqual(target.read_bytes(), b"OWNER_BYTES")
            self.assertTrue(link.is_symlink())

    def test_research_pair_receipt_untrusted_parent_link_rejected(self):
        from original_native_stdin_replay import write_original_pair_research_hold
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            real = root / "owner"; real.mkdir()
            alias = root / "shortcut"; alias.symlink_to(real, target_is_directory=True)
            with self.assertRaisesRegex(ValueError, "RESEARCH_RECEIPT_DESTINATION_UNSAFE"):
                write_original_pair_research_hold(alias / "HOLD.json",
                                                  self._pair_hold_for_write())
            self.assertEqual(list(real.iterdir()), [])

    def test_original_pair_receipt_rejects_nested_ancestor_alias_and_dotdot(self):
        from original_native_stdin_replay import write_original_pair_research_hold
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            real = root / "real" / "nested"
            real.mkdir(parents=True)
            alias = root / "alias"
            try:
                alias.symlink_to(root / "real", target_is_directory=True)
            except (OSError, NotImplementedError) as exc:
                self.skipTest(f"directory symlinks unavailable: {exc}")
            nested = alias / "nested" / "HOLD.json"
            self.assertFalse(nested.parent.is_symlink())
            with self.assertRaisesRegex(ValueError, "RESEARCH_RECEIPT_DESTINATION_UNSAFE"):
                write_original_pair_research_hold(nested, self._pair_hold_for_write())
            self.assertFalse((real / "HOLD.json").exists())

            # Keep the lexical symlink rather than normalizing it away at '..'.
            (root / "safe").mkdir()
            dotdot = alias / ".." / "safe" / "HOLD.json"
            self.assertTrue(dotdot.parent.is_dir())
            with self.assertRaisesRegex(ValueError, "RESEARCH_RECEIPT_DESTINATION_UNSAFE"):
                write_original_pair_research_hold(dotdot, self._pair_hold_for_write())
            self.assertFalse((root / "safe" / "HOLD.json").exists())
            # Legitimate physical destination still works under the same policy.
            direct = real / "HOLD.json"
            write_original_pair_research_hold(direct, self._pair_hold_for_write())
            self.assertEqual(json.loads(direct.read_text())["mayPublish"], False)

    def test_research_pair_receipt_cannot_self_approve_or_relabel(self):
        from original_native_stdin_replay import write_original_pair_research_hold
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            alterations = [
                ("publish", {"mayPublish": True}),
                ("fake-human", {"nativeFullMediaDecodeAndCraftApproved": True}),
                ("fake-runner", {"twoActualIndependentJobExecutionsAuthenticated": True}),
                ("wrong-status", {"status": "PUBLISHED"}),
                ("fake-type", {"mayPublish": 0}),
            ]
            for name, mutation in alterations:
                with self.subTest(name=name):
                    report = {**self._pair_hold_for_write(), **mutation}
                    with self.assertRaisesRegex(ValueError, "UNAUTHORIZED_RECEIPT_CONTENT"):
                        write_original_pair_research_hold(root / ("output-"+name+".json"), report)
            self.assertFalse(any(root.iterdir()))

    def test_research_pair_receipt_nonfinite_or_unserializable_blocks_without_file(self):
        from original_native_stdin_replay import write_original_pair_research_hold
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name, data in (("infinity", float("inf")), ("nan", float("nan")),
                               ("object", object())):
                with self.subTest(name=name):
                    report = {**self._pair_hold_for_write(), "invalidExtra": data}
                    with self.assertRaises((TypeError, ValueError)):
                        write_original_pair_research_hold(root / (name+".json"), report)
            self.assertFalse(any(root.iterdir()))

    def test_original_pair_receipt_refuses_extra_approval_and_missing_proof(self):
        from original_native_stdin_replay import (
            write_original_pair_research_hold, ORIGINAL_PAIR_RESEARCH_FIELDS)
        baseline = self._pair_hold_for_write()
        self.assertEqual(set(baseline), ORIGINAL_PAIR_RESEARCH_FIELDS)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            forged = [
                ("extra-release", {**baseline, "publicationApproved": True}),
                ("extra-human", {**baseline, "qualifiedHumanFilmReviewApproved": True}),
                ("missing-physical-audio", {
                    k: v for k, v in baseline.items()
                    if k != "twoDownloadedNativeMoviesIndependentlyFullyDecoded"}),
                ("wrong-schema", {**baseline, "schema": "unreviewed"}),
                ("film-decode-not-observed", {
                    **baseline, "twoDownloadedNativeMoviesIndependentlyFullyDecoded": False}),
                ("fake-binary", {
                    **baseline, "actualOriginalHistoricalFFmpegBinaryPinned": True}),
                ("fake-first-excellent", {
                    **baseline, "firstExcellentMasterAccepted": True}),
                ("boolean-coercion", {
                    **baseline, "sourceFrameDigestsMatchAcrossTwoDeclaredRuns": 1}),
                ("no-streak", {
                    **baseline, "fiveRenderStreakAccepted": None}),
            ]
            for name, candidate in forged:
                with self.subTest(name=name):
                    target = root / (name + ".json")
                    with self.assertRaisesRegex(ValueError, "UNAUTHORIZED_RECEIPT_CONTENT"):
                        write_original_pair_research_hold(target, candidate)
                    self.assertFalse(target.exists())
            self.assertEqual(list(root.iterdir()), [])

    def test_actual_pair_report_assembly_stays_compatible_with_strict_writer(self):
        # Test the REAL inspect_both assembly shape. Only the costly physical
        # encoder comparator is mocked; this does not pretend actual film QA.
        from original_native_stdin_replay import (
            inspect_both, write_original_pair_research_hold)
        first, env, _ = self._job_v1_fixture()
        second = {**first, "runId": "fixture-run-two",
                  "runnerName": "fixture-runner-two"}
        with patch("original_native_stdin_replay.compare_pair", return_value=pair()):
            assembled = inspect_both(first, second, env, env)
        assembled.update({
            "downloadedMovieBytesRehashedAgainstBothEncoderReceipts": True,
            "twoDownloadedNativeMoviesIndependentlyFullyDecoded": True,
            "twoPhysicalX264DisabledCpuAsmLogsIndependentlyValidated": True,
        })
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "complete-research-HOLD.json"
            write_original_pair_research_hold(output, assembled)
            result = json.loads(output.read_text())
            self.assertEqual(result, assembled)
            self.assertFalse(result["firstExcellentMasterAccepted"])
            self.assertFalse(result["mayPublish"])

    def test_original_job_v1_valid_bounded_fixture(self):
        from original_native_stdin_replay import validate_original_job_v1
        job, _, _ = self._job_v1_fixture()
        self.assertTrue(validate_original_job_v1(job))

    def test_original_job_v1_blocks_forged_approvals(self):
        from original_native_stdin_replay import validate_original_job_v1
        for name in ("mayPublish", "firstExcellentMasterAccepted",
                     "fiveRenderStreakAccepted", "independentJobProvenanceExternallyAuthenticated",
                     "originalArchivedFFmpegBinaryAuthenticated"):
            for spoof in (True, 0, "false"):
                job, _, _ = self._job_v1_fixture()
                job[name] = spoof
                with self.subTest(name=name, spoof=spoof):
                    with self.assertRaisesRegex(ValueError, "FORGED_CREATIVE_OR_TRUST_APPROVAL"):
                        validate_original_job_v1(job)

    def test_original_job_v1_blocks_unrecognized_keys_false_machine_claims(self):
        from original_native_stdin_replay import validate_original_job_v1
        job, _, _ = self._job_v1_fixture()
        job["externalFilmApproved"] = True
        with self.assertRaisesRegex(ValueError, "NONCANONICAL_JOB_RECEIPT_FIELDS"):
            validate_original_job_v1(job)
        job, _, _ = self._job_v1_fixture()
        job["nativeEncodedFilmFullDecode"] = 1
        with self.assertRaisesRegex(ValueError, "ORIGINAL_FRAME_OR_DECODE_CHECK_FAILED"):
            validate_original_job_v1(job)
        job, _, _ = self._job_v1_fixture()
        job["wallSeconds"] = float("nan")
        with self.assertRaisesRegex(ValueError, "INVALID_JOB_DURATION"):
            validate_original_job_v1(job)

    @classmethod
    def _write_pair_fixture(cls, path):
        from original_native_stdin_replay import ORIGINAL_NAME
        job, env, movie = cls._job_v1_fixture()
        root = Path(path)
        (root / ORIGINAL_NAME).write_bytes(movie)
        # The producer's sha256EnvironmentJson pins canonical LF *bytes*.
        # Path.write_text translates to CRLF on Windows and would forge an
        # invalid "valid" fixture. Do not weaken the physical SHA receiver.
        (root / "environment.json").write_bytes(
            (json.dumps(env, indent=2) + "\n").encode("utf-8"))
        (root / "full-original-replay.json").write_bytes(
            (json.dumps(job, indent=2) + "\n").encode("utf-8"))
        return job, env

    def test_pair_fixture_is_actual_canonical_lf_bytes_not_windows_text_mode(self):
        from original_native_stdin_replay import ORIGINAL_NAME
        with tempfile.TemporaryDirectory() as d:
            job, env = self._write_pair_fixture(d)
            root = Path(d)
            raw = (root / "environment.json").read_bytes()
            self.assertEqual(raw, (json.dumps(env, indent=2) + "\n").encode("utf-8"))
            self.assertNotIn(b"\r\n", raw)
            self.assertEqual(digest(raw), job["sha256EnvironmentJson"])
            self.assertEqual(digest((root / ORIGINAL_NAME).read_bytes()),
                             job["sourceToEncoderStdinReceipt"]["filmSha256"])

    def test_pair_fixture_physical_environment_crlf_mutation_still_hold(self):
        from original_native_stdin_replay import read_original_pair_dir
        with tempfile.TemporaryDirectory() as d:
            self._write_pair_fixture(d)
            path = Path(d) / "environment.json"
            path.write_bytes(path.read_bytes().replace(b"\n", b"\r\n"))
            with self.assertRaisesRegex(ValueError, "PHYSICAL_ENV_FILE_SHA_MISMATCH"):
                read_original_pair_dir(d)

    def test_physical_pair_json_valid_synthetic_fixture_still_research_only(self):
        from original_native_stdin_replay import read_original_pair_dir
        with tempfile.TemporaryDirectory() as directory:
            job, env = self._write_pair_fixture(directory)
            received_job, received_env = read_original_pair_dir(directory)
            self.assertEqual(received_job, job)
            self.assertEqual(received_env, env)
            self.assertFalse(received_job["mayPublish"])

    def test_physical_pair_rejects_duplicate_json_keys_and_nonfinite_values(self):
        from original_native_stdin_replay import read_original_pair_dir
        with tempfile.TemporaryDirectory() as directory:
            self._write_pair_fixture(directory)
            job_path = Path(directory) / "full-original-replay.json"
            original = job_path.read_text()
            job_path.write_text(original.replace(
                '"mayPublish": false', '"mayPublish": false, "mayPublish": true', 1))
            with self.assertRaisesRegex(ValueError, "PAIR_REPORT_MALFORMED"):
                read_original_pair_dir(directory)
            job_path.write_text(original.replace('"wallSeconds": 12.125',
                                                '"wallSeconds": NaN', 1))
            with self.assertRaisesRegex(ValueError, "PAIR_REPORT_MALFORMED"):
                read_original_pair_dir(directory)

    def test_physical_pair_rejects_symlink_or_mutated_film(self):
        from original_native_stdin_replay import read_original_pair_dir, ORIGINAL_NAME
        with tempfile.TemporaryDirectory() as directory:
            self._write_pair_fixture(directory)
            root = Path(directory)
            env = root / "environment.json"
            other = root / "alternate.json"
            other.write_bytes(env.read_bytes())
            env.unlink()
            env.symlink_to(other)
            with self.assertRaisesRegex(ValueError, "PAIR_REPORT_MISSING_OR_UNSAFE"):
                read_original_pair_dir(root)
            env.unlink()
            env.write_bytes(other.read_bytes())
            (root / ORIGINAL_NAME).write_bytes(b"tampered physical movie")
            with self.assertRaisesRegex(ValueError, "UPLOADED_MOVIE_BYTES_DIFFER"):
                read_original_pair_dir(root)

    @staticmethod
    def _small_h264_aac_original_codec_fixture(directory, *, audio_duration=0.4):
        """Real 12-frame 64x64 test media, NOT the pinned original video."""
        from original_native_stdin_replay import ORIGINAL_NAME, original_media_executable
        base = Path(directory)
        movie = base / ORIGINAL_NAME
        proc = subprocess.run([
            original_media_executable("ffmpeg"), "-hide_banner", "-v", "info",
            "-cpuflags", "0", "-nostdin",
            "-f", "lavfi", "-i", "testsrc2=size=64x64:rate=30:duration=0.4",
            "-f", "lavfi", "-i",
            f"sine=frequency=500:sample_rate=24000:duration={audio_duration}",
            "-map", "0:v:0", "-map", "1:a:0",
            "-c:v", "libx264", "-threads:v", "1",
            "-x264-params", "asm=0:sync-lookahead=0", "-pix_fmt", "yuv420p",
            "-preset", "ultrafast", "-crf", "28", "-c:a", "aac", "-b:a", "64k",
            "-frames:v", "12", "-movflags", "+faststart", "-y", str(movie),
        ], capture_output=True, timeout=45)
        if proc.returncode:
            raise AssertionError("Actual tiny FFmpeg fixture failed: " +
                                 proc.stderr[-2000:].decode("utf-8", "replace"))
        (base / "encoder.log").write_bytes(proc.stderr)
        return movie

    def test_original_replay_checks_all_pinned_input_bytes_after_render(self):
        from original_native_stdin_replay import assert_original_replay_inputs_unchanged
        from original_replay_source_restore import PINNED
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            sources, fonts = root / "sources", root / "fonts"
            sources.mkdir(); fonts.mkdir()
            for name in PINNED:
                (sources / name).write_bytes(("source:" + name).encode("utf-8"))
            for name in ("DejaVuSans.ttf", "DejaVuSans-Bold.ttf"):
                (fonts / name).write_bytes(("fixture-font:" + name).encode("utf-8"))
            wav, align, binary = (root / "original.wav", root / "alignment.json",
                                  root / "synthetic-ffmpeg")
            wav.write_bytes(b"original fixture WAV bytes")
            align.write_bytes(b'{"research":true}\n')
            binary.write_bytes(b"synthetic FFmpeg executable identity")
            environment = {
                "sourceHashesSha256": {
                    name: digest((sources / name).read_bytes()) for name in PINNED},
                "fontHashesSha256": {
                    name: digest((fonts / name).read_bytes())
                    for name in ("DejaVuSans.ttf", "DejaVuSans-Bold.ttf")},
                "wavSha256": digest(wav.read_bytes()),
                "alignmentCandidateSha256": digest(align.read_bytes()),
                "ffmpegExecutableSha256": digest(binary.read_bytes()),
            }
            inputs = dict(sources=sources, fonts=fonts, wav=wav,
                          candidate=align, environment=environment)
            with patch("original_native_stdin_replay.original_media_executable",
                       return_value=str(binary)):
                self.assertTrue(assert_original_replay_inputs_unchanged(**inputs))
                for label, target in (
                        ("RENDERER_SOURCE", sources / next(iter(PINNED))),
                        ("FONT", fonts / "DejaVuSans.ttf"),
                        ("NARRATION_WAV", wav),
                        ("ALIGNMENT", align),
                        ("ENCODER_BINARY", binary)):
                    with self.subTest(label=label):
                        original = target.read_bytes()
                        target.write_bytes(original + b"-TAMPERED")
                        try:
                            with self.assertRaisesRegex(
                                    ValueError,
                                    "ORIGINAL_REPLAY_INPUT_CHANGED_DURING_RENDER:" + label):
                                assert_original_replay_inputs_unchanged(**inputs)
                        finally:
                            target.write_bytes(original)
                        self.assertTrue(assert_original_replay_inputs_unchanged(**inputs))
                # Same byte contents via a symlink must not stand in for the
                # originally pinned direct source input.
                original = wav.read_bytes()
                foreign = root / "foreign-original.wav"
                foreign.write_bytes(original)
                wav.unlink()
                try:
                    wav.symlink_to(foreign)
                except (OSError, NotImplementedError) as exc:
                    self.skipTest(f"file symlinks unavailable: {exc}")
                with self.assertRaisesRegex(
                        ValueError, "ORIGINAL_REPLAY_INPUT_CHANGED_DURING_RENDER:NARRATION_WAV"):
                    assert_original_replay_inputs_unchanged(**inputs)

    def test_original_replay_input_recheck_is_before_successful_job_receipt(self):
        import inspect
        from original_native_stdin_replay import replay
        source = inspect.getsource(replay)
        self.assertLess(source.index('"-f", "null", "-"'),
                        source.index("assert_original_replay_inputs_unchanged("))
        self.assertLess(source.index("assert_original_replay_inputs_unchanged("),
                        source.index('"full-original-replay.json").write_text'))

    def test_original_replay_rejects_preloaded_archival_renderer_module(self):
        from types import ModuleType
        from original_native_stdin_replay import (
            assert_original_renderer_module_import_safe, replay)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            # sys.path insertion alone cannot outrank a cached module.
            with patch.dict(sys.modules, {
                    "narration_locked_treatments": ModuleType("narration_locked_treatments")}):
                with self.assertRaisesRegex(
                        ValueError, "ARCHIVED_RENDERER_MODULE_PRELOADED"):
                    assert_original_renderer_module_import_safe(root)
            with patch.dict(sys.modules, {
                    "source_locked_visual_direction": ModuleType("source_locked_visual_direction")}):
                with self.assertRaisesRegex(
                        ValueError, "ARCHIVED_RENDERER_MODULE_PRELOADED"):
                    assert_original_renderer_module_import_safe(root)
            import inspect
            source = inspect.getsource(replay)
            self.assertLess(
                source.index("assert_original_renderer_module_import_safe(source_dir)"),
                source.index("sys.path.insert(0, str(source_dir))"))
            self.assertLess(
                source.index('importlib.import_module("narration_locked_treatments")'),
                source.index("assert_original_renderer_module_import_safe(source_dir, loaded=r)"))

    def test_original_replay_rejects_wrong_module_origin_despite_source_pin(self):
        from types import ModuleType, SimpleNamespace
        from original_native_stdin_replay import assert_original_renderer_module_import_safe
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            physical = root / "narration_locked_treatments.py"
            physical.write_bytes(b"archived fixture source\n")
            source_sha = digest(physical.read_bytes())
            module = ModuleType("narration_locked_treatments")
            module.__file__ = str(physical)
            module.__spec__ = SimpleNamespace(origin=str(physical))
            # The exact historical hash is patched only in this isolated
            # synthetic unit test; the real production PINNED map is untouched.
            with patch.dict("original_replay_source_restore.PINNED", {
                    "narration_locked_treatments.py": source_sha}, clear=True):
                self.assertTrue(assert_original_renderer_module_import_safe(
                    root, loaded=module))
                foreign = root / "foreign.py"
                foreign.write_bytes(physical.read_bytes())
                module.__spec__ = SimpleNamespace(origin=str(foreign))
                with self.assertRaisesRegex(
                        ValueError, "ARCHIVED_RENDERER_IMPORT_ORIGIN_DRIFT"):
                    assert_original_renderer_module_import_safe(root, loaded=module)
                module.__spec__ = SimpleNamespace(origin=str(physical))
                physical.write_bytes(b"changed source bytes\n")
                with self.assertRaisesRegex(
                        ValueError, "ARCHIVED_RENDERER_IMPORT_ORIGIN_DRIFT"):
                    assert_original_renderer_module_import_safe(root, loaded=module)

    def test_original_import_cache_is_clean_between_two_real_python_imports(self):
        import importlib
        from original_native_stdin_replay import (
            assert_original_renderer_module_import_safe,
            release_owned_original_renderer_modules, replay)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "narration_locked_treatments.py"
            source.write_bytes(b"REPLAY_FIXTURE_ID = 'archival'\n")
            with patch.dict("original_replay_source_restore.PINNED", {
                    "narration_locked_treatments.py": digest(source.read_bytes())},
                    clear=True):
                sys.path.insert(0, str(root))
                try:
                    for iteration in range(2):
                        with self.subTest(replay=iteration):
                            self.assertTrue(assert_original_renderer_module_import_safe(root))
                            loaded = importlib.import_module("narration_locked_treatments")
                            self.assertEqual(loaded.REPLAY_FIXTURE_ID, "archival")
                            self.assertTrue(assert_original_renderer_module_import_safe(
                                root, loaded=loaded))
                            self.assertEqual(release_owned_original_renderer_modules(root),
                                             ("narration_locked_treatments",))
                            self.assertNotIn("narration_locked_treatments", sys.modules)
                finally:
                    sys.path.remove(str(root))
                    sys.modules.pop("narration_locked_treatments", None)
        import inspect
        code = inspect.getsource(replay)
        self.assertIn("release_owned_original_renderer_modules(source_dir)", code)
        self.assertLess(code.index("release_owned_original_renderer_modules(source_dir)"),
                        code.index("sys.path.pop(0)"))

    def test_original_import_cache_cleanup_never_evicts_foreign_module(self):
        from types import ModuleType, SimpleNamespace
        from original_native_stdin_replay import release_owned_original_renderer_modules
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            expected = root / "narration_locked_treatments.py"
            expected.write_text("archival")
            other = root / "source_locked_visual_direction.py"
            other.write_text("archival-other")
            foreign = root / "not-archival.py"
            foreign.write_text("foreign")
            legitimate = ModuleType("narration_locked_treatments")
            legitimate.__file__ = str(expected)
            legitimate.__spec__ = SimpleNamespace(origin=str(expected))
            impostor = ModuleType("source_locked_visual_direction")
            impostor.__file__ = str(foreign)
            impostor.__spec__ = SimpleNamespace(origin=str(foreign))
            with patch.dict("original_replay_source_restore.PINNED", {
                    expected.name: digest(expected.read_bytes()),
                    other.name: digest(other.read_bytes())}, clear=True):
                with patch.dict(sys.modules, {
                        "narration_locked_treatments": legitimate,
                        "source_locked_visual_direction": impostor}):
                    with self.assertRaisesRegex(
                            ValueError, "ARCHIVED_RENDERER_CACHE_ORIGIN_DRIFT"):
                        release_owned_original_renderer_modules(root)
                    self.assertIs(sys.modules["narration_locked_treatments"],
                                  legitimate)
                    self.assertIs(sys.modules["source_locked_visual_direction"],
                                  impostor)

    def test_downloaded_native_media_real_codec_fixture(self):
        from original_native_stdin_replay import audit_downloaded_original_movie
        with tempfile.TemporaryDirectory() as directory:
            self._small_h264_aac_original_codec_fixture(directory)
            report = audit_downloaded_original_movie(directory,
                                                     expected_geometry=(64, 64, 12))
            self.assertTrue(report["originalNativeFullMediaPhysicalDecode"])
            self.assertEqual(report["actualDecodedSourceFrameCount"], 12)
            self.assertTrue(report["actualPhysicalAACStreamConfirmed"])
            self.assertFalse(report["humanCraftOrPhoneApproved"])
            self.assertFalse(report["mayPublish"])

    def test_original_receiver_rejects_nested_directory_symlink_in_all_intake_paths(self):
        """Alias to valid physical bytes is not a trusted input directory."""
        from original_native_stdin_replay import (
            ORIGINAL_NAME, audit_downloaded_original_movie,
            read_original_pair_dir, verify_uploaded_movie,
            validate_disabled_x264_cpu_asm
        )
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            physical = root / "physical" / "payload"
            physical.mkdir(parents=True)
            job, _ = self._write_pair_fixture(physical)
            alias = root / "alias"
            try:
                alias.symlink_to(root / "physical", target_is_directory=True)
            except (OSError, NotImplementedError) as exc:
                self.skipTest(f"symlink permissions unavailable: {exc}")
            # The last directory and film are not themselves symlinks, yet
            # traversing the lexical ancestor redirects the trust boundary.
            redirected = alias / "payload"
            self.assertFalse(redirected.is_symlink())
            self.assertFalse((redirected / ORIGINAL_NAME).is_symlink())
            with self.assertRaisesRegex(ValueError, "PAIR_ARTIFACT_DIRECTORY_UNSAFE"):
                read_original_pair_dir(redirected)
            with self.assertRaisesRegex(ValueError, "MISSING_EMPTY_OR_SYMLINK"):
                verify_uploaded_movie(redirected, job)
            # A real small encoded movie with a valid encoder log proves
            # the receiver rejects the alias before treating codec success
            # as trusted intake. No native original film is approved.
            self._small_h264_aac_original_codec_fixture(physical)
            with self.assertRaisesRegex(ValueError, "DOWNLOADED_FILM_UNAVAILABLE"):
                audit_downloaded_original_movie(
                    redirected, expected_geometry=(64, 64, 12))
            with self.assertRaisesRegex(ValueError, "PROOF_LOG_MISSING"):
                validate_disabled_x264_cpu_asm(redirected / "encoder.log")
            # Read-only physical source package remains intact.
            self.assertTrue((physical / ORIGINAL_NAME).is_file())

    def test_original_receiver_requires_physically_pinned_film_on_cli_path(self):
        from original_native_stdin_replay import audit_downloaded_original_movie
        with tempfile.TemporaryDirectory() as directory:
            movie = self._small_h264_aac_original_codec_fixture(directory)
            film_sha = digest(movie.read_bytes())
            report = audit_downloaded_original_movie(
                directory, expected_geometry=(64, 64, 12),
                expected_film_sha256=film_sha)
            self.assertTrue(report["originalNativeFullMediaPhysicalDecode"])
            with self.assertRaisesRegex(ValueError, "DOWNLOADED_FILM_NOT_PRODUCER_PINNED"):
                audit_downloaded_original_movie(
                    directory, expected_geometry=(64, 64, 12),
                    expected_film_sha256=digest(b"different film"))
            with self.assertRaisesRegex(ValueError, "EXPECTED_DOWNLOADED_FILM_SHA_INVALID"):
                audit_downloaded_original_movie(
                    directory, expected_geometry=(64, 64, 12),
                    expected_film_sha256=True)

    def test_original_receiver_refuses_movie_replaced_during_actual_decode(self):
        from original_native_stdin_replay import audit_downloaded_original_movie
        real_run = subprocess.run
        with tempfile.TemporaryDirectory() as directory:
            movie = self._small_h264_aac_original_codec_fixture(directory)
            old_sha = digest(movie.read_bytes())
            observed = []
            def after_decode(cmd, *args, **kwargs):
                result = real_run(cmd, *args, **kwargs)
                if "-xerror" in cmd and "-f" in cmd and "null" in cmd:
                    observed.append("real-full-decode")
                    movie.write_bytes(movie.read_bytes() + b"late-substitution")
                return result
            with patch("original_native_stdin_replay.subprocess.run",
                       side_effect=after_decode):
                with self.assertRaisesRegex(
                        ValueError, "DOWNLOADED_MEDIA_BYTES_CHANGED_DURING_AUDIT"):
                    audit_downloaded_original_movie(
                        directory, expected_geometry=(64, 64, 12),
                        expected_film_sha256=old_sha)
            self.assertEqual(observed, ["real-full-decode"])
            self.assertNotEqual(digest(movie.read_bytes()), old_sha)

    def test_original_receiver_refuses_encoder_proof_changed_during_decode(self):
        from original_native_stdin_replay import audit_downloaded_original_movie
        real_run = subprocess.run
        with tempfile.TemporaryDirectory() as directory:
            movie = self._small_h264_aac_original_codec_fixture(directory)
            film_sha = digest(movie.read_bytes())
            log = Path(directory) / "encoder.log"
            before = digest(log.read_bytes())
            observed = []
            def after_decode(cmd, *args, **kwargs):
                result = real_run(cmd, *args, **kwargs)
                if "-xerror" in cmd and "-f" in cmd and "null" in cmd:
                    observed.append("real-full-decode")
                    log.write_bytes(log.read_bytes() + b"forged-second-encoder-log")
                return result
            with patch("original_native_stdin_replay.subprocess.run",
                       side_effect=after_decode):
                with self.assertRaisesRegex(
                        ValueError, "DOWNLOADED_MEDIA_BYTES_CHANGED_DURING_AUDIT"):
                    audit_downloaded_original_movie(
                        directory, expected_geometry=(64, 64, 12),
                        expected_film_sha256=film_sha)
            self.assertEqual(observed, ["real-full-decode"])
            self.assertNotEqual(digest(log.read_bytes()), before)
            self.assertEqual(digest(movie.read_bytes()), film_sha)

    def test_downloaded_media_rejects_real_short_aac_attached_to_full_video(self):
        from original_native_stdin_replay import (
            audit_downloaded_original_movie, original_media_executable)
        with tempfile.TemporaryDirectory() as directory:
            movie = self._small_h264_aac_original_codec_fixture(
                directory, audio_duration=0.05)
            # This is genuine playable H264+AAC, not a missing-track fixture:
            # the video still has 12 full frames while AAC has only 2.
            probe = subprocess.run([
                original_media_executable("ffprobe"), "-v", "error",
                "-count_frames", "-show_entries",
                "stream=codec_type,nb_read_frames",
                "-of", "json", str(movie),
            ], capture_output=True, text=True, check=True, timeout=15)
            streams = json.loads(probe.stdout)["streams"]
            self.assertEqual(
                next(int(s["nb_read_frames"]) for s in streams
                     if s["codec_type"] == "video"), 12)
            self.assertLess(
                next(int(s["nb_read_frames"]) for s in streams
                     if s["codec_type"] == "audio"), 8)
            with self.assertRaisesRegex(ValueError,
                                        "DOWNLOADED_AAC_TOO_SHORT_FOR_FILM"):
                audit_downloaded_original_movie(
                    directory, expected_geometry=(64, 64, 12),
                    expected_film_sha256=digest(movie.read_bytes()))

    def test_downloaded_media_rejects_real_overlong_aac_attached_to_full_video(self):
        """A playable overlong AAC stream must not pass mere full-decode tests."""
        from original_native_stdin_replay import (
            audit_downloaded_original_movie, original_media_executable)
        with tempfile.TemporaryDirectory() as directory:
            movie = self._small_h264_aac_original_codec_fixture(directory)
            audio = Path(directory) / "overlong-audio.m4a"
            remuxed = Path(directory) / "overlong-video.mp4"
            subprocess.run([
                original_media_executable("ffmpeg"), "-nostdin", "-v", "error",
                "-f", "lavfi", "-i",
                "sine=frequency=500:sample_rate=24000:duration=1.6",
                "-c:a", "aac", "-y", str(audio),
            ], check=True, capture_output=True, timeout=30)
            subprocess.run([
                original_media_executable("ffmpeg"), "-nostdin", "-v", "error",
                "-i", str(movie), "-i", str(audio), "-map", "0:v:0",
                "-map", "1:a:0", "-c", "copy", "-y", str(remuxed),
            ], check=True, capture_output=True, timeout=30)
            os.replace(remuxed, movie)
            # The malicious remux really does decode both audio and video.
            subprocess.run([
                original_media_executable("ffmpeg"), "-nostdin", "-v", "error",
                "-xerror", "-i", str(movie), "-map", "0:v:0",
                "-map", "0:a:0", "-f", "null", "-",
            ], check=True, capture_output=True, timeout=30)
            probe = subprocess.run([
                original_media_executable("ffprobe"), "-v", "error",
                "-count_frames", "-show_entries",
                "stream=codec_type,nb_read_frames", "-of", "json", str(movie),
            ], capture_output=True, text=True, check=True, timeout=15)
            streams = json.loads(probe.stdout)["streams"]
            by_type = {s["codec_type"]: int(s["nb_read_frames"]) for s in streams}
            self.assertEqual(by_type["video"], 12)
            self.assertGreater(by_type["audio"], 12)
            with self.assertRaisesRegex(
                    ValueError, "DOWNLOADED_AAC_TOO_LONG_FOR_FILM"):
                audit_downloaded_original_movie(
                    directory, expected_geometry=(64, 64, 12),
                    expected_film_sha256=digest(movie.read_bytes()))

    def test_downloaded_native_media_rejects_removed_or_faked_encoder_control(self):
        from original_native_stdin_replay import audit_downloaded_original_movie
        with tempfile.TemporaryDirectory() as directory:
            self._small_h264_aac_original_codec_fixture(directory)
            (Path(directory) / "encoder.log").write_bytes(
                b"using cpu capabilities: AVX2\nError parsing option 'asm = invalid'\n")
            with self.assertRaisesRegex(ValueError, "X264_CPU_ASM_CONTROL_NOT_PROVEN"):
                audit_downloaded_original_movie(directory,
                                              expected_geometry=(64, 64, 12))

    def test_downloaded_native_media_rejects_truncated_actual_encoded_movie(self):
        from original_native_stdin_replay import audit_downloaded_original_movie
        with tempfile.TemporaryDirectory() as directory:
            movie = self._small_h264_aac_original_codec_fixture(directory)
            data = movie.read_bytes()
            movie.write_bytes(data[:len(data) // 2])
            with self.assertRaisesRegex(ValueError, "DOWNLOADED_MEDIA_"):
                audit_downloaded_original_movie(directory,
                                              expected_geometry=(64, 64, 12))

    def test_environment_v1_recompute_realistic_fixture(self):
        from original_native_stdin_replay import validate_environment_report_v1
        env = self._frozen_environment_v1()
        self.assertEqual(validate_environment_report_v1(env), env["environmentSha256"])

    def test_environment_v1_changed_version_with_old_internal_digest_is_rejected(self):
        from original_native_stdin_replay import validate_environment_report_v1
        env = self._frozen_environment_v1()
        env["pillowVersion"] = "99.0.0"
        with self.assertRaisesRegex(ValueError, "ENVIRONMENT_FINGERPRINT_MISMATCH"):
            validate_environment_report_v1(env)

    def test_environment_v1_changed_encoder_hash_with_old_digest_is_rejected(self):
        from original_native_stdin_replay import validate_environment_report_v1
        env = self._frozen_environment_v1()
        env["ffmpegExecutableSha256"] = digest(b"shadowed binary")
        with self.assertRaisesRegex(ValueError, "ENVIRONMENT_FINGERPRINT_MISMATCH"):
            validate_environment_report_v1(env)

    def test_environment_v1_injected_approval_or_unknown_field_is_rejected(self):
        from original_native_stdin_replay import validate_environment_report_v1
        for key, value in (("mayPublish", True), ("twoRunnersAttested", True),
                           ("unreviewedExtra", False)):
            env = self._frozen_environment_v1()
            env[key] = value
            with self.subTest(key=key):
                with self.assertRaisesRegex(ValueError, "ENVIRONMENT_FIELDS_OR_SCHEMA_DRIFT"):
                    validate_environment_report_v1(env)

    def test_environment_v1_recomputed_forgery_cannot_change_archived_source(self):
        from original_native_stdin_replay import validate_environment_report_v1
        from original_native_stdin_replay import ENVIRONMENT_V1_IDENTITY_FIELDS
        env = self._frozen_environment_v1()
        env["sourceHashesSha256"]["phone_ui_audit.py"] = digest(b"forged source")
        identity = {k: env[k] for k in ENVIRONMENT_V1_IDENTITY_FIELDS}
        env["environmentSha256"] = digest(json.dumps(
            identity, sort_keys=True, separators=(",", ":")).encode("utf-8"))
        with self.assertRaisesRegex(ValueError, "ENVIRONMENT_SOURCE_IDENTITY_DRIFT"):
            validate_environment_report_v1(env)

    def test_environment_v1_wrong_flag_type_missing_field_and_schema_fail_closed(self):
        from original_native_stdin_replay import validate_environment_report_v1
        cases = [
            ("boolean-relabel", {"releaseAuthorized": 0}, "INVALID_ENVIRONMENT_REPORT"),
            ("missing-fingerprint", {"environmentSha256": None}, "INVALID_ENVIRONMENT_SHA"),
            ("wrong-schema", {"schema": "v2"}, "INVALID_ENVIRONMENT_REPORT"),
        ]
        for name, patch, reason in cases:
            env = self._frozen_environment_v1()
            env.update(patch)
            with self.subTest(name=name):
                with self.assertRaisesRegex(ValueError, reason):
                    validate_environment_report_v1(env)
        missing = self._frozen_environment_v1()
        missing.pop("ffmpegVersion")
        with self.assertRaisesRegex(ValueError, "ENVIRONMENT_FIELDS_OR_SCHEMA_DRIFT"):
            validate_environment_report_v1(missing)

    def test_original_media_executables_ignore_path_shadow(self):
        """The file hashed as encoder must actually be the binary executed."""
        import os
        from unittest.mock import patch
        from original_native_stdin_replay import original_media_executable
        with tempfile.TemporaryDirectory() as temp:
            for tool in ("ffmpeg", "ffprobe"):
                shadow = Path(temp) / tool
                shadow.write_text("#!/bin/sh\nexit 42\n")
                shadow.chmod(0o755)
            with patch.dict(os.environ, {"PATH": temp + os.pathsep + os.environ.get("PATH", "")}):
                for tool in ("ffmpeg", "ffprobe"):
                    self.assertEqual(original_media_executable(tool), "/usr/bin/" + tool)
                    probe = subprocess.run([original_media_executable(tool), "-version"],
                                           capture_output=True, text=True, timeout=10)
                    self.assertEqual(probe.returncode, 0, probe.stderr[-500:])
                    self.assertIn(tool + " version", probe.stdout.lower())
            with self.assertRaisesRegex(ValueError, "UNRECOGNIZED_MEDIA_EXECUTABLE"):
                original_media_executable("../ffmpeg")
            with self.assertRaisesRegex(ValueError, "UNRECOGNIZED_MEDIA_EXECUTABLE"):
                original_media_executable("ffmpeg -y")

    def test_x264_cpu_asm_0_physically_confirmed_on_small_ffmpeg_fixture(self):
        from original_native_stdin_replay import validate_disabled_x264_cpu_asm
        with tempfile.TemporaryDirectory() as d:
            movie = Path(d) / "tiny-asm-disabled.mp4"
            logfile = Path(d) / "encoder.log"
            cmd = ["ffmpeg", "-hide_banner", "-v", "info", "-cpuflags", "0",
                   "-nostdin", "-f", "lavfi",
                   "-i", "testsrc2=size=32x32:rate=30:duration=0.1",
                   "-c:v", "libx264", "-threads:v", "1",
                   "-x264-params", "asm=0:sync-lookahead=0",
                   "-pix_fmt", "yuv420p", "-y", str(movie)]
            proc = subprocess.run(cmd, capture_output=True, timeout=35)
            self.assertEqual(proc.returncode, 0, proc.stderr[-300:])
            self.assertTrue(movie.is_file() and movie.stat().st_size > 0)
            logfile.write_bytes(proc.stderr)
            self.assertTrue(validate_disabled_x264_cpu_asm(logfile))

    def test_reject_ignored_x264_cpu_asm_param_and_invalid_encoder_log(self):
        from original_native_stdin_replay import validate_disabled_x264_cpu_asm
        with tempfile.TemporaryDirectory() as d:
            logfile = Path(d) / "encoder.log"
            with self.assertRaisesRegex(ValueError, "PROOF_LOG_MISSING"):
                validate_disabled_x264_cpu_asm(logfile)
            logfile.write_bytes(b"Error parsing option 'asm = invalid'!\\n"
                                b"using cpu capabilities: none!\\n")
            with self.assertRaisesRegex(ValueError, "CONTROL_NOT_PROVEN"):
                validate_disabled_x264_cpu_asm(logfile)
            logfile.write_bytes(b"using cpu capabilities: SSE2 AVX2\\n")
            with self.assertRaisesRegex(ValueError, "CONTROL_NOT_PROVEN"):
                validate_disabled_x264_cpu_asm(logfile)
            other = Path(d) / "other"
            other.write_bytes(b"using cpu capabilities: none!\\n")
            logfile.unlink()
            logfile.symlink_to(other)
            with self.assertRaisesRegex(ValueError, "PROOF_LOG_MISSING"):
                validate_disabled_x264_cpu_asm(logfile)


    def test_uploaded_original_movie_identity_matches_actual_bytes(self):
        from original_native_stdin_replay import verify_uploaded_movie, ORIGINAL_NAME
        with tempfile.TemporaryDirectory() as directory:
            payload = b"synthetic transfer fixture - not a real encoded movie"
            (Path(directory) / ORIGINAL_NAME).write_bytes(payload)
            receipt = {"sourceToEncoderStdinReceipt": {
                "filmSha256": hashlib.sha256(payload).hexdigest()}}
            self.assertEqual(verify_uploaded_movie(directory, receipt),
                             hashlib.sha256(payload).hexdigest())

    def test_uploaded_original_movie_mutation_rejected(self):
        from original_native_stdin_replay import verify_uploaded_movie, ORIGINAL_NAME
        with tempfile.TemporaryDirectory() as directory:
            payload = b"synthetic"
            movie = Path(directory) / ORIGINAL_NAME
            movie.write_bytes(payload)
            receipt = {"sourceToEncoderStdinReceipt": {
                "filmSha256": hashlib.sha256(payload).hexdigest()}}
            movie.write_bytes(payload + b"mutated")
            with self.assertRaisesRegex(ValueError, "UPLOADED_MOVIE_BYTES_DIFFER"):
                verify_uploaded_movie(directory, receipt)

    def test_uploaded_original_movie_missing_symlink_and_forged_receipt_rejected(self):
        from original_native_stdin_replay import verify_uploaded_movie, ORIGINAL_NAME
        with tempfile.TemporaryDirectory() as directory:
            movie = Path(directory) / ORIGINAL_NAME
            receipt = {"sourceToEncoderStdinReceipt": {"filmSha256": "a" * 64}}
            with self.assertRaisesRegex(ValueError, "MISSING_EMPTY_OR_SYMLINK"):
                verify_uploaded_movie(directory, receipt)
            target = Path(directory) / "other"
            target.write_bytes(b"fake")
            movie.symlink_to(target)
            with self.assertRaisesRegex(ValueError, "MISSING_EMPTY_OR_SYMLINK"):
                verify_uploaded_movie(directory, receipt)
            movie.unlink()
            movie.write_bytes(b"not a movie")
            with self.assertRaisesRegex(ValueError, "INVALID_MOVIE_SHA_RECEIPT"):
                verify_uploaded_movie(directory, {"sourceToEncoderStdinReceipt": {
                    "filmSha256": "!" * 64}})


    def test_complete_two_run_synthetic_still_hold(self):
        self.assertFalse(pair()["mayPublish"])
        self.assertFalse(pair()["twoActualIndependentJobExecutionsAuthenticated"])
        self.assertTrue(pair()["sourceFrameDigestsMatchAcrossTwoDeclaredRuns"])

    def test_actual_frame_hashes_and_stream_bytes_from_physical_sink(self):
        sink=io.BytesIO()
        w=Capture(sink,run_id="run-one",source_sha=SOURCE,wav_sha=WAV,
                  environment_sha=ENV,width=2,height=1,frames=3)
        for _ in range(3):w.write(FRAME)
        w.close()
        r=w.receipt(exit_code=0,film_sha=FILM)
        self.assertEqual(r["capturedBytes"],18)
        self.assertEqual(r["rawStdinSha256"],digest(FRAME*3))
        self.assertEqual(r["frameSha256"],[digest(FRAME)]*3)

    def test_original_source_restore_two_historical_commits_physically_verified(self):
        with tempfile.TemporaryDirectory() as d:
            repo,pins,refs=synthetic_git_history_fixture(d)
            dest=Path(d)/"separate-recovered-source"
            result=restore_pinned_sources(repo,dest,pins=pins,refs=refs)
            self.assertTrue(result["allSha256Verified"])
            self.assertEqual((dest/"alpha.py").read_bytes(),b"original alpha\n")
            self.assertEqual((dest/"beta.py").read_bytes(),b"original beta\n")
            self.assertFalse(result["mayPublish"])
            self.assertFalse(result["originalFullRenderExecuted"])

    def test_original_source_restore_modified_blob_fails_atomically(self):
        with tempfile.TemporaryDirectory() as d:
            repo,pins,refs=synthetic_git_history_fixture(d)
            pins["alpha.py"]=digest(b"some other alpha")
            dest=Path(d)/"blocked-sources"
            with self.assertRaisesRegex(ValueError,"SOURCE_SHA_DRIFT"):
                restore_pinned_sources(repo,dest,pins=pins,refs=refs)
            self.assertFalse(dest.exists())

    def test_original_source_restore_existing_directory_not_overwritten(self):
        with tempfile.TemporaryDirectory() as d:
            repo,pins,refs=synthetic_git_history_fixture(d)
            dest=Path(d)/"do-not-touch";dest.mkdir()
            (dest/"user.txt").write_text("preserve")
            with self.assertRaisesRegex(ValueError,"FRESH_OUTPUT_PARENT_REQUIRED"):
                restore_pinned_sources(repo,dest,pins=pins,refs=refs)
            self.assertEqual((dest/"user.txt").read_text(),"preserve")

    def test_win_readonly_staging_cleanup_preserves_git_hold(self):
        """Simulate Windows WinError5 on staged 0444 file on hosted Linux."""
        with tempfile.TemporaryDirectory() as d:
            repo,pins,refs=synthetic_git_history_fixture(d)
            refs["beta.py"]="f"*40
            dest=Path(d)/"blocked-sources"
            real_rmtree=shutil.rmtree
            triggered=[]
            def simulate_windows_permission(stage, *, onerror):
                first=Path(stage)/"alpha.py"
                self.assertTrue(first.is_file())
                self.assertEqual(first.stat().st_mode & stat.S_IWUSR, 0)
                e=PermissionError(13, "simulated Windows read-only WinError5")
                onerror(os.unlink, str(first), (PermissionError, e, None))
                triggered.append(not first.exists())
                real_rmtree(stage)
            with patch("original_replay_source_restore.shutil.rmtree",
                       side_effect=simulate_windows_permission):
                with self.assertRaisesRegex(ValueError, "GIT_REVISION_UNAVAILABLE:beta.py"):
                    restore_pinned_sources(repo,dest,pins=pins,refs=refs)
            self.assertEqual(triggered,[True])
            self.assertFalse(dest.exists())
            self.assertFalse(any(Path(d).glob(".em-original-sources-*")))

    def test_readonly_stage_cleanup_rejects_foreign_file_repair(self):
        from original_replay_source_restore import _cleanup_owned_readonly_stage
        with tempfile.TemporaryDirectory() as d:
            root=Path(d)
            stage=root/"owned";stage.mkdir()
            owner=root/"do-not-change.py"
            owner.write_bytes(b"foreign owner bytes")
            owner.chmod(0o444)
            original_mode=owner.stat().st_mode
            real_rmtree=shutil.rmtree
            def trigger_foreign_path(stage_path, *, onerror):
                e=PermissionError(13, "simulated outside-stage cleanup")
                onerror(os.unlink, str(owner), (PermissionError, e, None))
            try:
                with patch("original_replay_source_restore.shutil.rmtree",
                           side_effect=trigger_foreign_path):
                    with self.assertRaises(PermissionError):
                        _cleanup_owned_readonly_stage(stage)
                self.assertEqual(owner.read_bytes(), b"foreign owner bytes")
                self.assertEqual(owner.stat().st_mode, original_mode)
            finally:
                owner.chmod(0o600)
                real_rmtree(stage)

    def test_original_source_restore_unavailable_git_commit_fails_atomically(self):
        with tempfile.TemporaryDirectory() as d:
            repo,pins,refs=synthetic_git_history_fixture(d)
            refs["beta.py"]="f"*40
            dest=Path(d)/"blocked-sources"
            with self.assertRaisesRegex(ValueError,"GIT_REVISION_UNAVAILABLE"):
                restore_pinned_sources(repo,dest,pins=pins,refs=refs)
            self.assertFalse(dest.exists())

    def test_original_admission_synthetic_exact_pins_allow_local_only(self):
        with tempfile.TemporaryDirectory() as d:
            args=pinned_environment_fixture(d)
            out=inspect_replay_inputs(**args)
            self.assertEqual(out["status"],"LOCAL_INPUT_PINS_MATCH_RESEARCH_ONLY")
            self.assertEqual(out["blockingReasons"],[])
            self.assertFalse(out["twoNativeRendererRunsExecuted"])
            self.assertFalse(out["originalEncoderVersionAuthenticated"])
            self.assertFalse(out["mayPublish"])

    def test_original_admission_changed_renderer_fails_before_encode(self):
        with tempfile.TemporaryDirectory() as d:
            args=pinned_environment_fixture(d)
            (args["renderer_dir"]/"narration_locked_treatments.py").write_text("changed")
            out=inspect_replay_inputs(**args)
            self.assertIn("RENDERER_SOURCE_DRIFT:narration_locked_treatments.py",
                          out["blockingReasons"])
            self.assertEqual(out["status"],"HOLD")

    def test_original_admission_changed_font_fails_before_encode(self):
        with tempfile.TemporaryDirectory() as d:
            args=pinned_environment_fixture(d)
            (args["font_dir"]/"DejaVuSans.ttf").write_bytes(b"changed")
            out=inspect_replay_inputs(**args)
            self.assertIn("FONT_BYTES_DRIFT:DejaVuSans.ttf",out["blockingReasons"])

    def test_original_admission_missing_font_fails_before_encode(self):
        with tempfile.TemporaryDirectory() as d:
            args=pinned_environment_fixture(d)
            (args["font_dir"]/"DejaVuSans-Bold.ttf").unlink()
            out=inspect_replay_inputs(**args)
            self.assertIn("MISSING_OR_SYMLINK_FONT:DejaVuSans-Bold.ttf",
                          out["blockingReasons"])

    def test_original_admission_missing_source_fails_before_encode(self):
        with tempfile.TemporaryDirectory() as d:
            args=pinned_environment_fixture(d)
            (args["renderer_dir"]/"narration_locked_treatments.py").unlink()
            out=inspect_replay_inputs(**args)
            self.assertIn("MISSING_OR_SYMLINK_RENDERER:narration_locked_treatments.py",
                          out["blockingReasons"])

    def test_original_admission_changed_wav_fails_before_encode(self):
        with tempfile.TemporaryDirectory() as d:
            args=pinned_environment_fixture(d)
            args["wav_path"].write_bytes(b"changed")
            out=inspect_replay_inputs(**args)
            self.assertIn("ORIGINAL_WAV_BYTES_DRIFT",out["blockingReasons"])

    def test_original_admission_version_drift_fails_before_encode(self):
        with tempfile.TemporaryDirectory() as d:
            args=pinned_environment_fixture(d)
            args["pillow_version"]="12.3.0"
            args["rdkit_version"]="2026.03.1"
            out=inspect_replay_inputs(**args)
            self.assertIn("PILLOW_VERSION_DRIFT",out["blockingReasons"])
            self.assertIn("RDKIT_VERSION_DRIFT",out["blockingReasons"])

    def test_original_admission_receipt_edit_fails_even_if_pins_look_plausible(self):
        with tempfile.TemporaryDirectory() as d:
            args=pinned_environment_fixture(d)
            args["receipt_path"].write_text(args["receipt_path"].read_text()+" ")
            out=inspect_replay_inputs(**args)
            self.assertEqual(out["blockingReasons"],
                ["PINNED_ORIGINAL_RECEIPT_UNAVAILABLE_OR_CHANGED"])

    def test_original_admission_font_symlink_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            args=pinned_environment_fixture(d)
            font=args["font_dir"]/"DejaVuSans.ttf"
            other=args["font_dir"]/"alternate.ttf"
            other.write_bytes(font.read_bytes())
            font.unlink(); font.symlink_to(other)
            out=inspect_replay_inputs(**args)
            self.assertIn("MISSING_OR_SYMLINK_FONT:DejaVuSans.ttf",
                          out["blockingReasons"])

    def test_original_renderer_unmodified_call_intercept_real_ffmpeg(self):
        # Opt-in from calling control runner, original producer function untouched.
        # This small real encoded fixture is NOT original source, full resolution,
        # or independent publisher approval.
        with tempfile.TemporaryDirectory() as d:
            base=Path(d)
            wav=base/"narration.wav"
            with wave.open(str(wav),"wb") as file:
                file.setnchannels(1)
                file.setsampwidth(2)
                file.setframerate(24000)
                file.writeframes(b"\0"*48000)
            wav_sha=hashlib.sha256(wav.read_bytes()).hexdigest()
            frames=[bytes([30])*12,bytes([150])*12,bytes([230])*12]
            def emit(run_name):
                movie=base/(run_name+".mp4")
                def original_renderer():
                    command=["ffmpeg","-hide_banner","-v","error","-nostdin",
                             "-y","-f","rawvideo","-pixel_format","rgb24",
                             "-video_size","2x2","-framerate","30","-i","pipe:0",
                             "-i",str(wav),"-map","0:v","-map","1:a",
                             "-c:v","libx264","-pix_fmt","yuv420p","-frames:v","3",
                             str(movie)]
                    process=subprocess.Popen(command,stdin=subprocess.PIPE,
                                             stderr=subprocess.PIPE)
                    for frame in frames:
                        process.stdin.write(frame)
                    process.stdin.close()
                    code=process.wait(timeout=20)
                    error=process.stderr.read()
                    process.stderr.close()
                    self.assertEqual(code,0,error.decode("utf-8","replace"))
                report=capture_renderer_encoder_call(
                    original_renderer,run_id=run_name,source_sha=SOURCE,
                    wav_path=wav,expected_wav_sha=wav_sha,
                    environment_sha=ENV,film_path=movie,geometry=(2,2,3))
                self.assertEqual(report["filmSha256"],
                                 hashlib.sha256(movie.read_bytes()).hexdigest())
                self.assertEqual(report["rawStdinSha256"],digest(b"".join(frames)))
                self.assertEqual(report["frameSha256"],[digest(f) for f in frames])
                self.assertFalse(report["mayPublish"])
                return report
            a,b=emit("separate-run-a"),emit("separate-run-b")
            result=compare_pair(a,b,expected_source=SOURCE,
                                expected_wav=wav_sha,
                                expected_environment=ENV,geometry=(2,2,3))
            self.assertTrue(result["sourceFrameDigestsMatchAcrossTwoDeclaredRuns"])
            self.assertFalse(result["twoActualIndependentJobExecutionsAuthenticated"])

    def test_renderer_hook_requires_observed_real_encoder(self):
        with tempfile.TemporaryDirectory() as d:
            wav=Path(d)/"wav"; wav.write_bytes(b"valid-pinned-research-fixture")
            with self.assertRaisesRegex(ValueError,"ORIGINAL_ENCODER_NOT_OBSERVED"):
                capture_renderer_encoder_call(
                    lambda: None,run_id="absent-encoder",source_sha=SOURCE,
                    wav_path=wav,expected_wav_sha=digest(wav.read_bytes()),
                    environment_sha=ENV,film_path=Path(d)/"not-made.mp4",
                    geometry=(2,2,3))

    def test_renderer_hook_rejects_stale_movie_even_if_film_is_valid(self):
        with tempfile.TemporaryDirectory() as d:
            wav=Path(d)/"wav"; wav.write_bytes(b"fixture")
            movie=Path(d)/"output.mp4";movie.write_bytes(b"old bytes")
            with self.assertRaisesRegex(ValueError,"STALE_OR_SYMLINKED_FILM_DESTINATION"):
                capture_renderer_encoder_call(
                    lambda: None,run_id="stale-film",source_sha=SOURCE,
                    wav_path=wav,expected_wav_sha=digest(wav.read_bytes()),
                    environment_sha=ENV,film_path=movie,geometry=(2,2,3))

    def test_renderer_hook_rejects_wrong_original_wav_bytes(self):
        with tempfile.TemporaryDirectory() as d:
            wav=Path(d)/"wav"; wav.write_bytes(b"fixture")
            with self.assertRaisesRegex(ValueError,"ORIGINAL_WAV_BYTES_DRIFT"):
                capture_renderer_encoder_call(
                    lambda: None,run_id="bad-wav",source_sha=SOURCE,
                    wav_path=wav,expected_wav_sha=digest(b"other"),
                    environment_sha=ENV,film_path=Path(d)/"new.mp4",
                    geometry=(2,2,3))

    def test_real_ffmpeg_pipe_and_decoded_fixture(self):
        # Live FFmpeg with three tiny REAL frames; never represents the 7-OH
        # original 1080p 1031-frame film or a human/craft review.
        with tempfile.TemporaryDirectory() as temp:
            movie = Path(temp) / "tiny-h264-fixture.mp4"
            cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error",
                   "-nostdin", "-y", "-f", "rawvideo", "-pixel_format", "rgb24",
                   "-video_size", "2x2", "-framerate", "30", "-i", "pipe:0",
                   "-frames:v", "3", "-c:v", "libx264", "-pix_fmt", "yuv420p",
                   str(movie)]
            proc = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                                    stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
            writer = Capture(proc.stdin, run_id="native-pipe-fixture",
                             source_sha=SOURCE, wav_sha=WAV, environment_sha=ENV,
                             width=2, height=2, frames=3)
            frames = [bytes([n]) * 12 for n in (30, 150, 230)]
            for frame in frames:
                writer.write(frame)
            writer.close()
            proc.wait(timeout=20)
            stderr = proc.stderr.read()
            proc.stderr.close()
            self.assertEqual(proc.returncode, 0, stderr.decode("utf-8", "replace"))
            report = writer.receipt_from_completed_encoder(proc, movie)
            self.assertEqual(report["filmSha256"], hashlib.sha256(movie.read_bytes()).hexdigest())
            self.assertEqual(report["capturedBytes"], 36)
            self.assertEqual(report["frameSha256"], [digest(frame) for frame in frames])
            self.assertEqual(report["rawStdinSha256"], digest(b"".join(frames)))
            probe = subprocess.run([
                "ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0",
                "-show_entries", "stream=codec_name,width,height,nb_read_frames",
                "-of", "json", str(movie)
            ], check=True, capture_output=True, text=True, timeout=20)
            stream = json.loads(probe.stdout)["streams"][0]
            self.assertEqual((stream["codec_name"], stream["width"], stream["height"],
                              int(stream["nb_read_frames"])), ("h264", 2, 2, 3))
            # Independent actual decode, not just receipt claims.
            subprocess.run(["ffmpeg", "-v", "error", "-xerror", "-i", str(movie),
                            "-f", "null", "-"], check=True, capture_output=True, timeout=20)
            self.assertFalse(report["originalMediaExternallyValidated"])
            self.assertFalse(report["mayPublish"])

    def test_real_completed_encoder_binds_process_and_film_bytes(self):
        with tempfile.TemporaryDirectory() as directory:
            movie=Path(directory)/"output.bin"
            script=("import sys,pathlib;sys.stdin.buffer.read();"
                    "pathlib.Path(sys.argv[1]).write_bytes(b'ENCODED')") 
            proc=subprocess.Popen([sys.executable,"-c",script,str(movie)],
                                  stdin=subprocess.PIPE)
            writer=Capture(proc.stdin,run_id="run-physical-1",source_sha=SOURCE,
                           wav_sha=WAV,environment_sha=ENV,width=2,height=1,frames=1)
            writer.write(FRAME)
            writer.close()
            proc.wait(timeout=10)
            receipt=writer.receipt_from_completed_encoder(proc,movie)
            self.assertEqual(receipt["filmSha256"],digest(b"ENCODED"))
            self.assertEqual(receipt["encoderExitCodeDeclared"],0)
            self.assertFalse(receipt["mayPublish"])

    def test_wrong_real_encoder_process_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            movie=Path(directory)/"output.bin"
            script=("import sys,pathlib;sys.stdin.buffer.read();"
                    "pathlib.Path(sys.argv[1]).write_bytes(b'ENCODED')")
            children=[subprocess.Popen([sys.executable,"-c",script,str(movie)],
                                       stdin=subprocess.PIPE) for _ in range(2)]
            for proc in children:
                proc.stdin.write(FRAME);proc.stdin.close()
                proc.wait(timeout=10)
            writer=Capture(io.BytesIO(),run_id="wrong-process",source_sha=SOURCE,
                           wav_sha=WAV,environment_sha=ENV,width=2,height=1,frames=1)
            writer.write(FRAME);writer.close()
            with self.assertRaisesRegex(ValueError,"ENCODER_PROCESS_STDIN_NOT_BOUND"):
                writer.receipt_from_completed_encoder(children[0],movie)

    def test_encoder_nonzero_exit_rejected_without_supplied_zero(self):
        with tempfile.TemporaryDirectory() as directory:
            movie=Path(directory)/"output.bin"
            proc=subprocess.Popen([sys.executable,"-c",
                                   "import sys;sys.stdin.buffer.read();sys.exit(7)"],
                                  stdin=subprocess.PIPE)
            writer=Capture(proc.stdin,run_id="failed-process",source_sha=SOURCE,
                           wav_sha=WAV,environment_sha=ENV,width=2,height=1,frames=1)
            writer.write(FRAME);writer.close()
            self.assertEqual(proc.wait(timeout=10),7)
            with self.assertRaisesRegex(ValueError,"ENCODER_PROCESS_FAILED"):
                writer.receipt_from_completed_encoder(proc,movie)

    def test_missing_output_file_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            movie=Path(directory)/"missing.bin"
            proc=subprocess.Popen([sys.executable,"-c",
                                   "import sys;sys.stdin.buffer.read()"],stdin=subprocess.PIPE)
            writer=Capture(proc.stdin,run_id="missing-film",source_sha=SOURCE,
                           wav_sha=WAV,environment_sha=ENV,width=2,height=1,frames=1)
            writer.write(FRAME);writer.close()
            self.assertEqual(proc.wait(timeout=10),0)
            with self.assertRaisesRegex(ValueError,"FILM_OUTPUT_NOT_REGULAR_FILE"):
                writer.receipt_from_completed_encoder(proc,movie)

    def test_empty_encoded_output_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            movie=Path(directory)/"empty.bin"
            script=("import sys,pathlib;sys.stdin.buffer.read();"
                    "pathlib.Path(sys.argv[1]).touch()")
            proc=subprocess.Popen([sys.executable,"-c",script,str(movie)],
                                  stdin=subprocess.PIPE)
            writer=Capture(proc.stdin,run_id="empty-film",source_sha=SOURCE,
                           wav_sha=WAV,environment_sha=ENV,width=2,height=1,frames=1)
            writer.write(FRAME);writer.close();self.assertEqual(proc.wait(timeout=10),0)
            with self.assertRaisesRegex(ValueError,"ENCODER_OUTPUT_EMPTY"):
                writer.receipt_from_completed_encoder(proc,movie)

    def test_symlinked_output_file_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            movie=Path(directory)/"movie.bin"
            alias=Path(directory)/"alias.bin"
            script=("import sys,pathlib;sys.stdin.buffer.read();"
                    "pathlib.Path(sys.argv[1]).write_bytes(b'ENCODED')")
            proc=subprocess.Popen([sys.executable,"-c",script,str(movie)],
                                  stdin=subprocess.PIPE)
            writer=Capture(proc.stdin,run_id="alias-film",source_sha=SOURCE,
                           wav_sha=WAV,environment_sha=ENV,width=2,height=1,frames=1)
            writer.write(FRAME);writer.close();self.assertEqual(proc.wait(timeout=10),0)
            alias.symlink_to(movie)
            with self.assertRaisesRegex(ValueError,"FILM_OUTPUT_NOT_REGULAR_FILE"):
                writer.receipt_from_completed_encoder(proc,alias)

    def test_partial_writes_are_completed_not_silently_truncated(self):
        s=ShortSink()
        w=Capture(s,run_id="run-one",source_sha=SOURCE,wav_sha=WAV,
                  environment_sha=ENV,width=2,height=1,frames=1)
        w.write(FRAME); w.close()
        self.assertEqual(b"".join(s.chunks),FRAME)
        self.assertEqual(w.receipt(exit_code=0,film_sha=FILM)["capturedBytes"],6)

    def test_short_frame_cannot_be_caught_then_retried_as_clean(self):
        w=Capture(io.BytesIO(),run_id="run-one",source_sha=SOURCE,wav_sha=WAV,
                  environment_sha=ENV,width=2,height=1,frames=1)
        with self.assertRaisesRegex(ValueError,"INCOMPLETE_RGB24_FRAME"):
            w.write(FRAME[:-1])
        with self.assertRaisesRegex(ValueError,"PIPE_CLOSED_OR_BROKEN"):
            w.write(FRAME)
        with self.assertRaisesRegex(ValueError,"PIPE_CLOSE_AFTER_ERROR_OR_DUPLICATE"):
            w.close()

    def test_extra_frame_attempt_poisoned_even_if_exception_caught(self):
        w=Capture(io.BytesIO(),run_id="run-one",source_sha=SOURCE,wav_sha=WAV,
                  environment_sha=ENV,width=2,height=1,frames=1)
        w.write(FRAME)
        with self.assertRaisesRegex(ValueError,"EXTRA_FRAME"):
            w.write(FRAME)
        with self.assertRaisesRegex(ValueError,"PIPE_CLOSE_AFTER_ERROR_OR_DUPLICATE"):
            w.close()

    def test_noncontiguous_rgb_input_poisoned(self):
        raw = memoryview(bytearray(range(12)))[::2]
        w=Capture(io.BytesIO(),run_id="run-one",source_sha=SOURCE,wav_sha=WAV,
                  environment_sha=ENV,width=2,height=1,frames=1)
        with self.assertRaisesRegex(ValueError,"NONCONTIGUOUS_FRAME"):
            w.write(raw)
        with self.assertRaisesRegex(ValueError,"PIPE_CLOSED_OR_BROKEN"):
            w.write(FRAME)

    def test_non_buffer_input_poisoned(self):
        w=Capture(io.BytesIO(),run_id="run-one",source_sha=SOURCE,wav_sha=WAV,
                  environment_sha=ENV,width=2,height=1,frames=1)
        with self.assertRaisesRegex(ValueError,"INVALID_FRAME_BUFFER"):
            w.write("not raw bytes")
        with self.assertRaisesRegex(ValueError,"PIPE_CLOSED_OR_BROKEN"):
            w.write(FRAME)

    def test_unrecognized_self_approved_field_rejected(self):
        r=capture()
        r["firstExcellentMasterAccepted"]=True
        with self.assertRaisesRegex(ValueError,"NONCANONICAL_RECEIPT_FIELDS"):
            pair(r)

    def test_missing_canonical_field_rejected(self):
        r=capture()
        r.pop("independentRunnerAuthenticated")
        with self.assertRaisesRegex(ValueError,"NONCANONICAL_RECEIPT_FIELDS"):
            pair(r)

    def test_zero_write_rejected(self):
        w=Capture(ZeroSink(),run_id="run-one",source_sha=SOURCE,wav_sha=WAV,
                  environment_sha=ENV,width=2,height=1,frames=1)
        with self.assertRaisesRegex(ValueError,"INVALID_OR_SHORT_PIPE_WRITE"):w.write(FRAME)

    def test_short_frame_rejected(self):
        w=Capture(io.BytesIO(),run_id="run-one",source_sha=SOURCE,wav_sha=WAV,
                  environment_sha=ENV,width=2,height=1,frames=1)
        with self.assertRaisesRegex(ValueError,"INCOMPLETE_RGB24_FRAME"):w.write(FRAME[:-1])

    def test_extra_frame_rejected(self):
        w=Capture(io.BytesIO(),run_id="run-one",source_sha=SOURCE,wav_sha=WAV,
                  environment_sha=ENV,width=2,height=1,frames=1)
        w.write(FRAME)
        with self.assertRaisesRegex(ValueError,"EXTRA_FRAME"):w.write(FRAME)

    def test_incomplete_inventory_rejected(self):
        w=Capture(io.BytesIO(),run_id="run-one",source_sha=SOURCE,wav_sha=WAV,
                  environment_sha=ENV,width=2,height=1,frames=3)
        w.write(FRAME);w.close()
        with self.assertRaisesRegex(ValueError,"MISSING_FRAMES"):w.receipt(exit_code=0,film_sha=FILM)

    def test_unclosed_stdin_rejected(self):
        w=Capture(io.BytesIO(),run_id="run-one",source_sha=SOURCE,wav_sha=WAV,
                  environment_sha=ENV,width=2,height=1,frames=1)
        w.write(FRAME)
        with self.assertRaisesRegex(ValueError,"SINK_NOT_CLOSED"):w.receipt(exit_code=0,film_sha=FILM)

    def test_failed_encoder_rejected(self):
        w=Capture(io.BytesIO(),run_id="run-one",source_sha=SOURCE,wav_sha=WAV,
                  environment_sha=ENV,width=2,height=1,frames=1)
        w.write(FRAME);w.close()
        with self.assertRaisesRegex(ValueError,"ENCODER_NONZERO"):w.receipt(exit_code=1,film_sha=FILM)

    def test_cloned_run_identifiers_rejected(self):
        with self.assertRaisesRegex(ValueError,"RUN_IDENTITIES_NOT_DISTINCT"):
            pair(capture(),capture())

    def test_changed_source_is_rejected(self):
        r=capture();r["sourceManifestSha256"]=digest(b"other source")
        with self.assertRaisesRegex(ValueError,"EXTERNAL_IDENTITY_MISMATCH"):pair(r)

    def test_changed_wav_is_rejected(self):
        r=capture();r["originalWavSha256"]=digest(b"other WAV")
        with self.assertRaisesRegex(ValueError,"EXTERNAL_IDENTITY_MISMATCH"):pair(r)

    def test_modified_frame_digest_is_rejected(self):
        r=capture();r["frameSha256"][1]=digest(b"mutated frame")
        with self.assertRaisesRegex(ValueError,"REPLAYED_SOURCE_FRAMES_DISAGREE"):pair(r)

    def test_modified_stream_digest_is_rejected(self):
        r=capture();r["rawStdinSha256"]=digest(b"mutated stream")
        with self.assertRaisesRegex(ValueError,"REPLAYED_SOURCE_FRAMES_DISAGREE"):pair(r)

    def test_truncated_frame_inventory_is_rejected(self):
        r=capture();r["frameSha256"].pop()
        with self.assertRaisesRegex(ValueError,"FRAME_SHA_INVENTORY_INVALID"):pair(r)

    def test_false_native_geometry_rejected(self):
        with self.assertRaisesRegex(ValueError,"INCOMPLETE_OR_WRONG_GEOMETRY"):
            compare_pair(capture(),capture("run-two"),
                         expected_source=SOURCE,expected_wav=WAV,
                         expected_environment=ENV)

    def test_forged_media_approval_rejected(self):
        r=capture();r["originalMediaExternallyValidated"]=True
        with self.assertRaisesRegex(ValueError,"FORGED_APPROVAL_OR_ATTESTATION"):pair(r)

    def test_forged_publication_rejected(self):
        r=capture();r["mayPublish"]=True
        with self.assertRaisesRegex(ValueError,"FORGED_APPROVAL_OR_ATTESTATION"):pair(r)

    def test_forged_streak_rejected(self):
        r=capture();r["streakAccepted"]=True
        with self.assertRaisesRegex(ValueError,"FORGED_APPROVAL_OR_ATTESTATION"):pair(r)


if __name__=="__main__":
    unittest.main()
