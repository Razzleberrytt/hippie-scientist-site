"""Adversarial research-only contracts; fixtures are NOT independent film science."""
import hashlib
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import em00707_current_intro_semantic_guard as guard

class AmbiguousOpeningPhysicalNegativeTests(unittest.TestCase):
    def setUp(self):
        self.size = guard.REGION[2] * guard.REGION[3] * 3
        self.bad = [bytes([i % 251]) * self.size for i in range(guard.INTRO_FRAMES)]

    def test_all_105_unchanged_is_hold_not_false_pass(self):
        result = guard.classify_actual_crops(self.bad, list(self.bad))
        self.assertEqual(result["scienceVerdict"],
                         "HOLD_UNCHANGED_KNOWN_AMBIGUOUS_CAPTION")
        self.assertEqual(result["identicalNativeRgbCaptionFrameCount"], 105)
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["qualifiedIndependentScientificReviewCompleted"])
        self.assertEqual(result["newAtomicWorkcardCredit"], 0)

    def test_one_changed_frame_still_requires_semantic_review(self):
        changed = list(self.bad)
        changed[55] = b"Z" * self.size
        result = guard.classify_actual_crops(self.bad, changed)
        self.assertEqual(result["identicalNativeRgbCaptionFrameCount"], 104)
        self.assertEqual(result["scienceVerdict"],
                         "HOLD_CHANGED_PIXELS_REQUIRE_NEW_SEMANTIC_REVIEW")
        self.assertFalse(result["currentIntroScienceApproved"])
        self.assertNotIn(55, result["identicalFrameIndices"])

    def test_missing_extra_truncated_and_nonnative_pixels_refused(self):
        for alternative in ([], self.bad[:104], self.bad + [self.bad[0]],
                            self.bad[:-1] + [b"short"],
                            self.bad[:-1] + ["string"]):
            with self.subTest(length=len(alternative)), self.assertRaisesRegex(
                    guard.ScienceHold, "EXACT_NATIVE_INTRO_PIXELS_REQUIRED"):
                guard.classify_actual_crops(self.bad, alternative)

    def test_foreign_film_symlink_and_fake_sha_hold(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = root / "fake.mp4"
            movie.write_bytes(b"not-authentic-h264")
            with self.assertRaisesRegex(guard.ScienceHold, "IDENTITY_CHANGED"):
                guard.validate_file(movie, "a" * 64)
            with self.assertRaisesRegex(guard.ScienceHold, "BASELINE_IDENTITY"):
                guard.validate_file(movie, "a" * 64, baseline=True)
            link = root / "alias.mp4"
            link.symlink_to(movie)
            with self.assertRaisesRegex(guard.ScienceHold, "NON_SYMLINK"):
                guard.validate_file(link, hashlib.sha256(movie.read_bytes()).hexdigest())
            with self.assertRaisesRegex(guard.ScienceHold, "FULL_EXACT"):
                guard.validate_file(movie, "not-a-full-hash")

    def test_same_source_and_candidate_never_valid_new_revision(self):
        with tempfile.TemporaryDirectory() as directory:
            p = Path(directory) / "movie.mp4"
            p.write_bytes(b"fixture")
            with patch.object(guard, "validate_file", return_value=p):
                with self.assertRaisesRegex(guard.ScienceHold, "MUST_BE_DISTINCT"):
                    guard.audit(p, p, "a" * 64)

if __name__ == "__main__":
    unittest.main()
