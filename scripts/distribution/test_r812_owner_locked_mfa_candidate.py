"""Negative WAV-lock tests for owner-selected MFA; no false alignment output."""
import importlib.util
import json
import os
import shutil
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).with_name("r812-owner-locked-mfa-candidate.py")
spec = importlib.util.spec_from_file_location("r812_candidate", SCRIPT)
candidate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(candidate)

class LockedSourceTests(unittest.TestCase):
    def setUp(self):
        original = os.environ.get("THS_R812_SOURCE_DIR")
        if not original:
            self.fail("THS_R812_SOURCE_DIR must point to the original GitHub WAV artifact; no synthetic audio permitted")
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.source = self.root/"source"
        self.source.mkdir()
        for name in ("r812-mitragynine-authentic-voice-REVIEW.wav",
                     "r812-mitragynine-authentic-voice-REVIEW.receipt.json"):
            shutil.copyfile(Path(original)/name, self.source/name)

    def test_real_pcm_and_exact_scene_sample_coverage(self):
        receipt, pcm = candidate.source_files(self.source)
        self.assertEqual(len(pcm), candidate.MASTER_FRAMES * 2)
        self.assertEqual(len(receipt["clips"]), 10)
        root, rows, _ = candidate.stage_source(self.source, self.root/"stage-output")
        self.assertEqual(len(rows), 10)
        self.assertEqual(rows[-1]["masterEndFrame"], candidate.MASTER_FRAMES)
        self.assertIn("craytum", (root/"stage/02-leaf.txt").read_text())

    def test_modified_real_wav_is_rejected(self):
        path = self.source/"r812-mitragynine-authentic-voice-REVIEW.wav"
        bytes_ = bytearray(path.read_bytes()); bytes_[86] ^= 1; path.write_bytes(bytes_)
        with self.assertRaisesRegex(ValueError, "UNAPPROVED_MASTER_SHA"):
            candidate.source_files(self.source)

    def test_forged_scene_offsets_are_rejected(self):
        path = self.source/"r812-mitragynine-authentic-voice-REVIEW.receipt.json"
        receipt = json.loads(path.read_text())
        receipt["clips"][1]["voiceStartFrame"] += 1
        path.write_text(json.dumps(receipt))
        with self.assertRaisesRegex(ValueError, "SCENE_FRAME_OR_SCRIPT_DRIFT"):
            candidate.source_files(self.source)

    def test_original_synthesis_receipt_must_stay_review_only(self):
        path = self.source/"r812-mitragynine-authentic-voice-REVIEW.receipt.json"
        receipt = json.loads(path.read_text())
        receipt["humanAuditoryReview"] = "pass"
        path.write_text(json.dumps(receipt))
        with self.assertRaisesRegex(ValueError, "ORIGINAL_SOURCE_GATES_CHANGED"):
            candidate.source_files(self.source)

    def test_no_clobber_of_previous_candidate(self):
        (self.root/"occupied").mkdir()
        with self.assertRaisesRegex(ValueError, "NEW_EMPTY_OUTPUT_DIR_REQUIRED"):
            candidate.stage_source(self.source, self.root/"occupied")

    def test_model_hashes_are_fully_pinned(self):
        self.assertTrue(all(len(x)==64 and set(x)<=set("0123456789abcdef")
                            for x in candidate.MODEL_PINS.values()))

if __name__ == "__main__":
    unittest.main()
