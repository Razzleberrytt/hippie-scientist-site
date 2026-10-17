"""FFmpeg-backed Lane5 research-only positive and negative audio remaster controls."""
import hashlib
import subprocess
import tempfile
import unittest
from pathlib import Path

from audio_only_remaster_guard import inspect, sha


class AudioOnlyRemasterTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.root = Path(cls.temp.name)
        cls.orig = cls.root / "source.mp4"
        cls.loud = cls.root / "audio-only.mp4"
        cls.wrong = cls.root / "wrong-video.mp4"
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i",
                        "testsrc2=size=64x64:rate=30:duration=0.6", "-f", "lavfi", "-i",
                        "sine=frequency=440:sample_rate=44100:duration=0.6",
                        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest",
                        "-y", str(cls.orig)], check=True)
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(cls.orig),
                        "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy",
                        "-af", "volume=2.0", "-c:a", "aac", "-y", str(cls.loud)], check=True)
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i",
                        "color=c=red:s=64x64:r=30:d=0.6", "-i", str(cls.orig),
                        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "libx264",
                        "-c:a", "aac", "-y", str(cls.wrong)], check=True)

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def test_physical_audio_only_replay_held_not_promoted(self):
        result = inspect(source=self.orig, remaster=self.loud,
                         source_sha=sha(self.orig), remaster_sha=sha(self.loud))
        self.assertTrue(result["videoPacketsAndTimestampsIdentical"])
        self.assertTrue(result["bothFullAvStreamsPhysicallyDecoded"])
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["firstExcellentMasterAccepted"])
        self.assertEqual(result["atomicCardsNewlyAccepted"], 0)

    def test_tampered_source_external_hash_refused(self):
        with self.assertRaisesRegex(ValueError, "MEDIA_PIN_MISMATCH"):
            inspect(source=self.orig, remaster=self.loud,
                    source_sha=hashlib.sha256(b"wrong").hexdigest(),
                    remaster_sha=sha(self.loud))

    def test_video_changed_even_when_aac_retained_refused(self):
        with self.assertRaisesRegex(ValueError, "NOT_AUDIO_ONLY_VIDEO_BYTES_OR_TIMING_DRIFT"):
            inspect(source=self.orig, remaster=self.wrong,
                    source_sha=sha(self.orig), remaster_sha=sha(self.wrong))

    def test_identical_video_and_audio_cannot_claim_hotfix(self):
        with tempfile.TemporaryDirectory() as td:
            copy = Path(td) / "copy.mp4"
            copy.write_bytes(self.orig.read_bytes())
            with self.assertRaisesRegex(ValueError, "NO_DISTINCT_AUDIO_REMASTER"):
                inspect(source=self.orig, remaster=copy,
                        source_sha=sha(self.orig), remaster_sha=sha(copy))

    def test_rejects_symlinked_film(self):
        with tempfile.TemporaryDirectory() as td:
            alias = Path(td) / "alias.mp4"
            try:
                alias.symlink_to(self.orig)
            except (OSError, NotImplementedError) as exc:
                self.skipTest(str(exc))
            with self.assertRaisesRegex(ValueError, "UNSAFE_MEDIA_ALIAS"):
                sha(alias)


if __name__ == "__main__":
    unittest.main()
