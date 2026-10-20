"""EM-001.03: synthetic negative fixtures for a real-media ZIP handoff.

Tests deliberately mock FFprobe for synthetic fixture bytes. The actual
original 7-OH MP4 is separately downloaded, fully decoded and SHA verified;
these unit tests alone NEVER establish real iPhone playback.
"""
import copy
import hashlib
import json
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

from iphone_review_handoff import (
    MEMBER, VIDEO_NAME, BUNDLE_NAME, ReviewHold, build_bundle,
    extract_verified, inspect_probe, sha_file,
)

ACTUAL_META = {
    "streams": [
        {"codec_type": "video", "codec_name": "h264", "profile": "High",
         "pix_fmt": "yuv420p", "width": 1080, "height": 1920,
         "avg_frame_rate": "30/1"},
        {"codec_type": "audio", "codec_name": "aac", "profile": "LC",
         "sample_rate": "24000", "channels": 1},
    ],
    "format": {"duration": "34.366667"},
}
FAKE_DATA = b"synthetic fixture bytes; deliberately NOT an MP4"


class IphoneReviewHandoffTests(unittest.TestCase):
    def setUp(self):
        self.work = tempfile.TemporaryDirectory()
        self.addCleanup(self.work.cleanup)
        self.root = Path(self.work.name)
        self.source = self.root / "source.zip"
        self.out_dir = self.root / "output"
        self.make_zip()
        self.source_hash = sha_file(self.source)
        self.video_hash = hashlib.sha256(FAKE_DATA).hexdigest()

    def make_zip(self, member=MEMBER, payload=FAKE_DATA):
        with zipfile.ZipFile(self.source, "w", zipfile.ZIP_DEFLATED) as z:
            z.writestr(member, payload)

    def test_real_archive_identity_and_nested_mp4_sha_required(self):
        self.assertEqual(extract_verified(self.source, self.source_hash, self.video_hash), FAKE_DATA)
        with self.assertRaisesRegex(ReviewHold, "ORIGINAL_ARTIFACT_SHA256_MISMATCH"):
            extract_verified(self.source, "0" * 64, self.video_hash)
        with self.assertRaisesRegex(ReviewHold, "ORIGINAL_MP4_SHA256_MISMATCH"):
            extract_verified(self.source, self.source_hash, "0" * 64)

    def test_zip_crc_corruption_rejected(self):
        raw = bytearray(self.source.read_bytes())
        raw[40] ^= 0x03
        self.source.write_bytes(raw)
        with self.assertRaises(ReviewHold):
            extract_verified(self.source, sha_file(self.source), self.video_hash)

    def test_duplicate_original_member_rejected(self):
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            with zipfile.ZipFile(self.source, "a") as z:
                z.writestr(MEMBER, FAKE_DATA)
        with self.assertRaisesRegex(ReviewHold, "AMBIGUOUS"):
            extract_verified(self.source, sha_file(self.source), self.video_hash)

    def test_missing_member_rejected(self):
        self.make_zip("a-wrong-folder/review.mp4")
        with self.assertRaisesRegex(ReviewHold, "AMBIGUOUS"):
            extract_verified(self.source, sha_file(self.source), self.video_hash)

    def test_invalid_digest_format_rejected(self):
        for invalid in ("", "zz" * 32, "A" * 64):
            with self.subTest(invalid=invalid):
                with self.assertRaisesRegex(ReviewHold, "INVALID_EXPECTED_SHA256"):
                    extract_verified(self.source, invalid, self.video_hash)

    def test_actual_codec_profile_contract_for_iphone(self):
        meta = inspect_probe(ACTUAL_META)
        self.assertEqual(meta["videoCodec"], "h264")
        self.assertEqual(meta["audioCodec"], "aac")
        self.assertEqual(meta["durationSeconds"], 34.366667)

    def test_unsupported_codec_audio_dimensions_fps_and_missing_stream_refused(self):
        variants = [
            ("video_codec", ("streams", 0, "codec_name"), "av1"),
            ("pixel_format", ("streams", 0, "pix_fmt"), "yuv444p"),
            ("resolution", ("streams", 0, "width"), 640),
            ("frame_rate", ("streams", 0, "avg_frame_rate"), "24/1"),
            ("audio_codec", ("streams", 1, "codec_name"), "opus"),
            ("audio_profile", ("streams", 1, "profile"), "HE-AAC"),
            ("video_profile", ("streams", 0, "profile"), "High 4:4:4 Predictive"),
        ]
        for label, (root, index, field), value in variants:
            with self.subTest(case=label):
                probe = copy.deepcopy(ACTUAL_META)
                probe[root][index][field] = value
                with self.assertRaisesRegex(ReviewHold, "MOBILE_DECODE"):
                    inspect_probe(probe)
        missing = copy.deepcopy(ACTUAL_META)
        missing["streams"] = missing["streams"][:1]
        with self.assertRaisesRegex(ReviewHold, "REQUIRE_ONE"):
            inspect_probe(missing)

    def test_invalid_duration_refused(self):
        for value in ("", "-1", "100000", "oops"):
            with self.subTest(duration=value):
                p = copy.deepcopy(ACTUAL_META)
                p["format"]["duration"] = value
                with self.assertRaises(ReviewHold):
                    inspect_probe(p)

    def test_bundle_contains_exact_mp4_and_never_approves_on_mocked_compatibility(self):
        # Synthetic fixture proving package plumbing only, not actual codec test.
        with patch("iphone_review_handoff.inspect_real_media", return_value=inspect_probe(ACTUAL_META)):
            outcome = build_bundle(self.source, self.source_hash, self.video_hash, self.out_dir)
        self.assertFalse(outcome["mayPublish"])
        self.assertFalse(outcome["realIphoneOpenPlaybackVerified"])
        self.assertFalse(outcome["creativeScienceVoiceOrViewerApproved"])
        self.assertEqual(sha_file(self.out_dir / VIDEO_NAME), self.video_hash)
        self.assertEqual(sha_file(self.out_dir / BUNDLE_NAME), outcome["portableBundleSha256"])
        with zipfile.ZipFile(self.out_dir / BUNDLE_NAME) as z:
            self.assertIsNone(z.testzip())
            self.assertEqual(z.read(VIDEO_NAME), FAKE_DATA)
            self.assertIn(self.video_hash.encode(), z.read("SHA256SUMS.txt"))
            receipt = json.loads(z.read("verification.json"))
            self.assertFalse(receipt["realIphoneOpenPlaybackVerified"])
            self.assertFalse(receipt["mayPublish"])

    def test_invalid_real_media_probe_cannot_produce_a_success_bundle(self):
        with patch("iphone_review_handoff.inspect_real_media", side_effect=ReviewHold("UNPLAYABLE")):
            with self.assertRaisesRegex(ReviewHold, "UNPLAYABLE"):
                build_bundle(self.source, self.source_hash, self.video_hash, self.out_dir)
        self.assertFalse((self.out_dir / BUNDLE_NAME).exists())
        self.assertFalse((self.out_dir / VIDEO_NAME).exists())


if __name__ == "__main__":
    unittest.main()
