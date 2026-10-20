"""Adversarial EM-007.05 tests using real downloaded original movie bytes.

These only run when the dedicated hosted job sets the exact archive root.
No human-science, device, voice, or release approval is inferred.
"""
import os
import unittest
import tempfile
from unittest.mock import patch
from pathlib import Path

from em00705_original_archive_replay import replay, EXPECTED, FILM, SOURCE, UNCERTAINTY


class ReplayOutputSafetyTests(unittest.TestCase):
    def test_direct_and_hardlinked_output_aliases_preserve_all_inputs(self):
        import em00705_original_archive_replay as subject
        for target_name in EXPECTED:
            for hardlink in (False, True):
                with self.subTest(input=target_name, hardlink=hardlink), tempfile.TemporaryDirectory() as td:
                    root = Path(td)
                    before = {}
                    for name in EXPECTED:
                        path = root/name
                        path.parent.mkdir(parents=True, exist_ok=True)
                        before[path] = b'synthetic safety fixture: ' + name.encode()
                        path.write_bytes(before[path])
                    output = root/target_name
                    if hardlink:
                        output = root/'alias.json'
                        os.link(root/target_name, output)
                    with patch('sys.argv', ['replay', '--root', str(root), '--out', str(output)]):
                        with self.assertRaisesRegex(ValueError,'OUTPUT_SYMLINK_OR_INPUT_ALIAS|RECEIPT_OUTPUT_ALIASES_PINNED_ARCHIVE_INPUT'):
                            subject.main()
                    for path, raw in before.items():
                        self.assertEqual(path.read_bytes(), raw)


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
