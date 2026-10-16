"""Adversarial research tests: these use tiny synthetic frames, not a real render."""
import io
import hashlib
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

from native_stdin_capture_guard import Capture, check_one, compare_pair, hold, digest

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


class ShortSink:
    def __init__(self): self.chunks = []; self.closed = False
    def write(self, data):
        self.chunks.append(bytes(data[:2])); return min(2, len(data))
    def flush(self): pass
    def close(self): self.closed = True


class ZeroSink(ShortSink):
    def write(self, data): return 0


class Tests(unittest.TestCase):
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
            self.assertEqual(proc.returncode, 0, stderr.decode("utf-8", "replace"))
            report = writer.receipt(exit_code=proc.returncode,
                                    film_sha=hashlib.sha256(movie.read_bytes()).hexdigest())
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

    def test_partial_writes_are_completed_not_silently_truncated(self):
        s=ShortSink()
        w=Capture(s,run_id="run-one",source_sha=SOURCE,wav_sha=WAV,
                  environment_sha=ENV,width=2,height=1,frames=1)
        w.write(FRAME); w.close()
        self.assertEqual(b"".join(s.chunks),FRAME)
        self.assertEqual(w.receipt(exit_code=0,film_sha=FILM)["capturedBytes"],6)

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
