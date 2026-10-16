"""Adversarial research tests: these use tiny synthetic frames, not a real render."""
import io
import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
import wave
from pathlib import Path

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
