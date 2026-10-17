"""EM-002.01: dated owner freeze/rescission source integrity controls."""
import unittest

from validate_em00201_decision_record import (
    ROOT, SOURCE_MAP, DatedPolicyHold, audit
)


class EM00201DecisionRecordTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.actual = {
            k: (ROOT / path).read_bytes()
            for k, (path, expected) in SOURCE_MAP.items()
        }

    def test_real_repository_sources_confirm_chronology_and_separate_holds(self):
        receipt = audit()
        self.assertEqual(receipt["status"], "PASS_DATED_REPOSITORY_POLICY_EVIDENCE_ONLY")
        self.assertEqual(receipt["oct12RecordedState"], "VERSION_FREEZE_ACTIVE_AT_THAT_TIME")
        self.assertEqual(receipt["oct13RecordedState"], "VERSION_FREEZE_RESCINDED")
        self.assertEqual(len(receipt["sourceGitBlobShas"]), 3)
        for k in ("ownerCommentIdentityIndependentlyAuthenticated",
                  "newWorkstreamAdmitted", "additionalPublishingPermission",
                  "scientificAcceptance", "fullFilmAccepted", "mayPublish"):
            self.assertFalse(receipt[k])

    def test_tampering_with_each_dated_source_requires_reaudit(self):
        for key, original in self.actual.items():
            with self.subTest(key=key):
                with self.assertRaisesRegex(DatedPolicyHold, "SOURCE_SHA_MISMATCH"):
                    audit({key: original + b"\n# unreviewed policy change"})

    def test_missing_real_source_never_becomes_approval(self):
        # Empty but explicit substitution must be rejected, not treated as
        # a missing override meaning “use normal source”.
        for key in SOURCE_MAP:
            with self.subTest(key=key):
                with self.assertRaises(DatedPolicyHold):
                    audit({key: b""})

    def test_dated_evidence_is_exactly_original_not_rewritten_to_inflate_progress(self):
        receipt = audit()
        self.assertTrue(receipt["mergedOwnerPolicyPullRequest"].endswith("/6788"))
        self.assertTrue(receipt["ownerCommentReference"].endswith("6160074905"))
        self.assertEqual(len(receipt["mergedPolicyCommitSha"]), 40)
        self.assertFalse(receipt["mayPublish"])


if __name__ == "__main__":
    unittest.main()
