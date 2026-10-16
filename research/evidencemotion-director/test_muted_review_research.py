"""Negative control tests for sound-off *packet*, never viewer approval."""
import json
import tempfile
import unittest
from pathlib import Path

from autonomous_script_asr_research import WAV_SHA
from muted_review_research import reject_untrusted, sha, SCENE_IDS, SOURCE_REFS


class RealMutedReviewPacketTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        root = Path(self.tmp.name)
        self.movie = root / "film.mp4"
        self.manifest = root / "manifest.json"
        self.receipt = root / "receipt.json"
        self.claim = root / "claim.json"
        self.movie.write_bytes(b"fake film: contract-only test not a real MP4")
        names = SCENE_IDS
        bounds = (0, 1.5, 3.5, 10.5, 16.5, 23.3, 25.7, 27.35, 31.25, 34.367)
        self.plan = {
            "status": "RESEARCH_ONLY",
            "releaseApproved": False,
            "expectedVideoSha256": sha(self.movie),
            "shots": [
                {"id": name, "startSec": bounds[i], "endSec": bounds[i+1],
                 "annotations": [{"role": "science", "text": source}]}
                for i, (name, source) in enumerate(zip(names, (
                    "MITRAGYNINE", "7-OH",
                    "Look at hydroxyl –OH", "Connected atoms", "Computed 3D illustration",
                    "Structure", "HUMAN EXPERIENCE", "PubChem 7-OH • CID 44301524 Mitragynine • CID 3034396 CID = compound record number",
                    "Look closer")))
            ]
        }
        self.data = {
            "status": "NEW_RENDERED_RESEARCH_CANDIDATE_REQUIRES_INDEPENDENT_REVIEW",
            "isOriginalV5": False, "resolution": [1080, 1920],
            "treatment": "specimen", "scienceApproved": False, "mayPublish": False,
            "sourceWavSha256": WAV_SHA, "videoSha256": sha(self.movie),
            "chemistry": [{"cid": 3034396, "url": SOURCE_REFS[0]},
                          {"cid": 44301524, "url": SOURCE_REFS[1]}]
        }
        self.screen = {
            "status": "MECHANICAL_SOURCE_CAPTION_SCREEN_PASS_INDEPENDENT_REVIEW_REQUIRED",
            "actualVideoSha256": sha(self.movie), "actualWavSha256": WAV_SHA,
            "narratedScenesInspected": 7, "emittedShotIntervalsInspected": 9,
            "mutedComprehensionApproved": False, "mayPublish": False
        }

    def examine(self):
        self.manifest.write_text(json.dumps(self.plan))
        self.receipt.write_text(json.dumps(self.data))
        self.screen["receiptSha256"] = sha(self.receipt)
        self.screen["phonePlanSha256"] = sha(self.manifest)
        self.claim.write_text(json.dumps(self.screen))
        return reject_untrusted(self.movie, self.manifest, self.receipt,
                                self.claim, 1080, 1920, 34.367)

    def test_good_synthetic_contract_is_not_a_viewer_pass(self):
        plan, receipt, video_sha = self.examine()
        self.assertEqual(len(plan["shots"]), 9)
        self.assertEqual(video_sha, sha(self.movie))
        self.assertFalse(receipt["mayPublish"])

    def test_final_tail_gap_is_rejected_even_with_matching_hashes(self):
        # Interior gaps still fail at 1 ms; the final tail tolerates only
        # one 30-fps frame of encoder rounding, NOT a multi-frame hole.
        # Test a 70-ms tail so this rejects an actual unaccounted video interval.
        self.plan["shots"][-1]["endSec"] -= 0.070
        with self.assertRaisesRegex(ValueError, "INCOMPLETE_FILM_COVERAGE"):
            self.examine()

    def test_corrupted_actual_video_cannot_reuse_old_receipts(self):
        self.movie.write_bytes(b"wrong revision")
        with self.assertRaisesRegex(ValueError, "FILM_OR_PROVENANCE"):
            self.examine()

    def test_modified_manifest_even_if_matching_hash_cannot_add_clinical_label(self):
        self.plan["shots"][6]["annotations"][0]["text"] = "Human effects not proven"
        with self.assertRaisesRegex(ValueError, "MISSING_SOUND_OFF_TEACHING_EVIDENCE"):
            self.examine()

    def test_wrong_first_compound_identity_is_hold(self):
        self.plan["shots"][0]["annotations"][0]["text"] = "WRONG MOLECULE"
        with self.assertRaisesRegex(ValueError, "MISSING_SOUND_OFF_TEACHING_EVIDENCE"):
            self.examine()

    def test_draft_or_untrusted_claim_verdict_is_hold(self):
        self.screen["status"] = "APPROVED"
        with self.assertRaisesRegex(ValueError, "RESEARCH_ONLY"):
            self.examine()

    def test_publication_authorization_is_never_inherited(self):
        self.plan["releaseApproved"] = True
        with self.assertRaisesRegex(ValueError, "RESEARCH_ONLY"):
            self.examine()

    def test_changed_source_audio_is_hold(self):
        self.data["sourceWavSha256"] = "0" * 64
        with self.assertRaisesRegex(ValueError, "ORIGINAL_LOCKED_NARRATION"):
            self.examine()

    def test_missing_viewer_scenes_is_hold(self):
        self.plan["shots"].pop(3)
        with self.assertRaisesRegex(ValueError, "NONCONTIGUOUS|EXACT_NINE"):
            self.examine()


if __name__ == "__main__":
    unittest.main()
