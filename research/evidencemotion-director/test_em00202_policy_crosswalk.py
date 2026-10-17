"""EM-002.02: real pinned policy inputs and synthetic fail-closed tamper tests."""
import unittest
from validate_em00202_policy_crosswalk import (
    ROOT, REPORT, PolicyCrosswalkHold, inspect
)


class EM00202PolicyCrosswalkTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.doc = REPORT.read_text(encoding="utf-8")

    def test_live_crosswalk_matches_five_actual_repository_blobs(self):
        receipt = inspect(self.doc)
        self.assertEqual(receipt["status"], "PASS_RESEARCH_POLICY_CROSSWALK_BYTES_ONLY")
        self.assertEqual(len(receipt["sourcePins"]), 5)
        self.assertEqual(receipt["policyRows"], 7)
        for decision in (
            "mayPublish", "releaseAuthorized", "independentScienceApproved",
            "realIphonePlaybackVerified", "canonicalMilestonePromoted"
        ):
            self.assertFalse(receipt[decision])

    def test_premature_publish_or_release_is_rejected(self):
        for unsafe in (
            self.doc.replace("mayPublish=false", "mayPublish=true", 1),
            self.doc.replace("releaseAuthorized=false", "releaseAuthorized=true", 1),
        ):
            with self.assertRaisesRegex(PolicyCrosswalkHold, "PREMATURE_RELEASE"):
                inspect(unsafe)

    def test_policy_source_mutation_invalidates_receipt(self):
        path = "AGENTS.md"
        original = (ROOT / path).read_bytes()
        with self.assertRaisesRegex(PolicyCrosswalkHold, "STALE_POLICY_SOURCE"):
            inspect(self.doc, source_overrides={path: original + b"\n# drift"})

    def test_missing_policy_admission_or_source_pin_rejected(self):
        for unsafe in (
            self.doc.replace("**WIP / admission**", "**no owner admission needed**", 1),
            self.doc.replace("08c7fb68759faec3dc26c83928eb7e73e3c1abf8",
                             "0000000000000000000000000000000000000000", 1),
            self.doc.replace("rescinded the version freeze", "lifted every safety gate", 1),
        ):
            with self.assertRaises(PolicyCrosswalkHold):
                inspect(unsafe)

    def test_broken_governing_link_is_rejected(self):
        bad = self.doc.replace(
            "](COMPLETION-CHECKLIST.md)",
            "](nonexistent-canonical-policy.md)", 1
        )
        with self.assertRaisesRegex(PolicyCrosswalkHold, "INVALID_POLICY_DOC_LINK"):
            inspect(bad)


if __name__ == "__main__":
    unittest.main()
