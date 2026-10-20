"""FFmpeg-backed Lane5 research-only positive and negative audio remaster controls."""
import hashlib
import json
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

        cls.resampled = cls.root / "resampled-audio.mp4"
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(cls.orig),
                        "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy", "-af", "volume=1.5",
                        "-ar", "48000", "-ac", "1", "-c:a", "aac", "-y", str(cls.resampled)], check=True)

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def test_short_nonsilent_aac_prefix_cannot_pass_as_complete_remaster(self):
        short = self.root/'short-prefix.mp4'
        subprocess.run(['ffmpeg','-v','error','-i',str(self.orig),
                        '-map','0:v:0','-map','0:a:0','-c:v','copy',
                        '-af','atrim=duration=0.1,volume=2','-c:a','aac',
                        '-y',str(short)],check=True,timeout=30)
        with self.assertRaisesRegex(ValueError, 'AUDIO_TRACK_DOES_NOT_COVER_VIDEO'):
            inspect(source=self.orig, remaster=short,
                    source_sha=sha(self.orig), remaster_sha=sha(short))

    def test_physical_audio_only_replay_held_not_promoted(self):
        result = inspect(source=self.orig, remaster=self.loud,
                         source_sha=sha(self.orig), remaster_sha=sha(self.loud))
        self.assertTrue(result["videoPacketsAndTimestampsIdentical"])
        self.assertTrue(result["bothFullAvStreamsPhysicallyDecoded"])
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["firstExcellentMasterAccepted"])
        self.assertEqual(result["atomicCardsNewlyAccepted"], 0)

    def test_declared_48000_hz_resample_keeps_video_identity_and_hold(self):
        result = inspect(source=self.orig, remaster=self.resampled,
                         source_sha=sha(self.orig), remaster_sha=sha(self.resampled),
                         expected_remaster_sample_rate=48000)
        self.assertEqual((result["sourceAudioSampleRateHz"], result["remasterAudioSampleRateHz"]),
                         (44100, 48000))
        self.assertTrue(result["audioResamplingExplicitlyPinned"])
        self.assertTrue(result["videoPacketsAndTimestampsIdentical"])
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["firstExcellentMasterAccepted"])
        self.assertFalse(result["fiveRenderStreakAccepted"])
        self.assertFalse(result["measuredCompleteTrackEbuR128"]["masteringQualityIndependentlyCertified"])
        self.assertTrue(result["measuredCompleteTrackEbuR128"]["remasterTruePeakBelow0DBTP"])

    def test_resample_without_correct_external_pin_fails_closed(self):
        for pin in (None, 44100, 96000, True):
            with self.subTest(expected_sample_rate=pin):
                with self.assertRaisesRegex(ValueError, "UNDECLARED_AUDIO_SAMPLE_RATE_CHANGE"):
                    inspect(source=self.orig, remaster=self.resampled,
                            source_sha=sha(self.orig), remaster_sha=sha(self.resampled),
                            expected_remaster_sample_rate=pin)

    def test_declared_wrong_rate_cannot_disguise_unchanged_audio_format(self):
        with self.assertRaisesRegex(ValueError, "EXPECTED_AUDIO_SAMPLE_RATE_MISMATCH"):
            inspect(source=self.orig, remaster=self.loud,
                    source_sha=sha(self.orig), remaster_sha=sha(self.loud),
                    expected_remaster_sample_rate=48000)

    def test_unmeasurable_r128_cannot_fake_audio_qc_success(self):
        from audio_only_remaster_guard import _audio_r128
        from unittest.mock import patch
        from types import SimpleNamespace
        with patch("audio_only_remaster_guard.subprocess.run",
                   return_value=SimpleNamespace(stderr="Summary:\n  Integrated loudness:\n I: -inf LUFS")):
            with self.assertRaisesRegex(ValueError, "AUDIO_R128_UNMEASURABLE"):
                _audio_r128(self.orig)

    def make_source_holds(self, path):
        from audio_only_remaster_guard import fingerprint
        record = {"schema": "ths-em-lane5-prior-video-defects-v1",
                  "sourceFilmSha256": sha(self.orig),
                  "sourceH264Sha256": fingerprint(self.orig, "0:v:0"),
                  "scope": "INTERNAL_SOURCE_REVIEW_NOT_QUALIFIED",
                  "status": "RESEARCH_HOLD", "mayPublish": False,
                  "knownOpenHolds": [{"id": "L1-GUT-01", "firstFrame": 1,
                                     "lastFrame": 3,
                                     "sourceReviewUrl": "https://github.com/example/repo/issues/1"}]}
        path.write_text(json.dumps(record))
        return record

    def test_known_open_visual_defect_survives_real_audio_remaster(self):
        with tempfile.TemporaryDirectory() as td:
            receipt = Path(td) / "prior-holds.json"
            self.make_source_holds(receipt)
            result = inspect(source=self.orig, remaster=self.loud,
                             source_sha=sha(self.orig), remaster_sha=sha(self.loud),
                             known_hold_receipt=receipt, known_hold_receipt_sha=sha(receipt))
            self.assertEqual(result["priorKnownVideoHolds"]["openKnownVideoHolds"][0]["id"], "L1-GUT-01")
            self.assertFalse(result["priorKnownVideoHolds"]["priorDefectActualFramesReinspectedByThisFunction"])
            self.assertTrue(result["priorOpenHoldsExplicitlyReconciled"])
            self.assertFalse(result["mayPublish"])
            self.assertFalse(result["firstExcellentMasterAccepted"])

    def test_pinned_known_hold_receipt_rejects_rewritten_or_wrong_source(self):
        with tempfile.TemporaryDirectory() as td:
            receipt = Path(td) / "prior-holds.json"
            original = self.make_source_holds(receipt)
            def check_rejected(data, label):
                receipt.write_text(json.dumps(data))
                with self.subTest(label=label), self.assertRaises(ValueError):
                    inspect(source=self.orig, remaster=self.loud,
                            source_sha=sha(self.orig), remaster_sha=sha(self.loud),
                            known_hold_receipt=receipt, known_hold_receipt_sha=sha(receipt))
            check_rejected({**original, "mayPublish": True}, "forged-publish")
            check_rejected({**original, "sourceFilmSha256": sha(self.loud)}, "cross-film")
            check_rejected({**original, "knownOpenHolds": []}, "erased-defect")
            check_rejected({**original, "knownOpenHolds": [original["knownOpenHolds"][0]] * 2}, "duplicated-defect")
            check_rejected({**original, "knownOpenHolds": [{**original["knownOpenHolds"][0],
                                                              "lastFrame": 1000}]}, "impossible-frame")
            receipt.write_text(json.dumps(original))
            with self.assertRaisesRegex(ValueError, "KNOWN_HOLD_RECEIPT_SHA_MISMATCH"):
                inspect(source=self.orig, remaster=self.loud,
                        source_sha=sha(self.orig), remaster_sha=sha(self.loud),
                        known_hold_receipt=receipt,
                        known_hold_receipt_sha=hashlib.sha256(b"wrong").hexdigest())
            with self.assertRaisesRegex(ValueError, "KNOWN_HOLD_RECEIPT_AND_EXTERNAL_SHA_REQUIRED_TOGETHER"):
                inspect(source=self.orig, remaster=self.loud,
                        source_sha=sha(self.orig), remaster_sha=sha(self.loud),
                        known_hold_receipt=receipt)
            receipt.write_text('{"schema":"a","schema":"b"}')
            with self.assertRaisesRegex(ValueError, "KNOWN_HOLD_DUPLICATE_JSON_FIELD"):
                inspect(source=self.orig, remaster=self.loud,
                        source_sha=sha(self.orig), remaster_sha=sha(self.loud),
                        known_hold_receipt=receipt, known_hold_receipt_sha=sha(receipt))

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
