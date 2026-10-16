"""Adversarial EM-007.05 tests using real downloaded original movie bytes.

These only run when the dedicated hosted job sets the exact archive root.
No human-science, device, voice, or release approval is inferred.
"""
import os
import unittest
from pathlib import Path

from em00705_original_archive_replay import replay, EXPECTED, FILM, SOURCE, UNCERTAINTY


class ActualOriginalFilmSourceReplayTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        root = os.environ.get("THS_EM00705_ARCHIVE_ROOT")
        if not root:
            raise RuntimeError("THS_EM00705_ARCHIVE_ROOT required; never substitute synthetic source")
        folder = Path(root)
        cls.real = {key:(folder / key).read_bytes() for key in EXPECTED}

    def test_pinned_film_source_and_six_material_claims_replay(self):
        result = replay(self.real)
        self.assertEqual(result["frozenClaimCount"],8)
        self.assertEqual(result["materialClaims"],6)
        self.assertEqual(result["materialStudyAxesRecordedAbsent"],30)
        self.assertFalse(result["currentHeadNativeRenderCertified"])
        self.assertFalse(result["qualifiedHumanScientistApproval"])
        self.assertFalse(result["externalClinicalLiteratureReviewed"])
        self.assertFalse(result["mayPublish"])

    def test_movie_mutation_cannot_inherit_correct_provenance(self):
        wrong = dict(self.real)
        wrong[FILM] += b"invalid movie alteration"
        with self.assertRaisesRegex(ValueError,"PINNED_ARCHIVE_BYTES_MISMATCH"):
            replay(wrong)

    def test_source_join_mutation_cannot_gain_approval(self):
        wrong = dict(self.real)
        wrong[SOURCE] = wrong[SOURCE].replace(
            b'"clinicalSourceClaimsApproved": false',
            b'"clinicalSourceClaimsApproved": true')
        if wrong[SOURCE] == self.real[SOURCE]:
            self.fail("Expected change of original source JSON did not happen")
        with self.assertRaisesRegex(ValueError,"PINNED_ARCHIVE_BYTES_MISMATCH"):
            replay(wrong)

    def test_uncertainty_report_change_cannot_claim_human_effects(self):
        wrong = dict(self.real)
        wrong[UNCERTAINTY] += b" "
        with self.assertRaisesRegex(ValueError,"PINNED_ARCHIVE_BYTES_MISMATCH"):
            replay(wrong)

    def test_missing_or_substituted_original_records_fail(self):
        for removed in EXPECTED:
            wrong = dict(self.real)
            wrong.pop(removed)
            with self.subTest(file=removed),self.assertRaisesRegex(
                    ValueError,"THREE_ORIGINAL_ARCHIVED_FILES_REQUIRED"):
                replay(wrong)

    def test_extra_untrusted_attachment_cannot_satisfy_source_scope(self):
        wrong = dict(self.real)
        wrong["fictitious-human-study.json"] = b'{"outcome":"cure"}'
        with self.assertRaisesRegex(ValueError,"THREE_ORIGINAL_ARCHIVED_FILES_REQUIRED"):
            replay(wrong)


if __name__ == "__main__":
    unittest.main()
