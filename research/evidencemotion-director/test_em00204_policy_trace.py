"""EM-002.04 tracker policy trace: actual files and synthetic negative controls."""
import unittest

from validate_em00204_policy_trace import (
    REGISTER, CANONICAL, POLICY, PolicyTrackerHold, inspect
)


class PolicyTraceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.register = REGISTER.read_text(encoding="utf-8")
        cls.canonical = CANONICAL.read_text(encoding="utf-8")
        cls.policy = POLICY.read_text(encoding="utf-8")

    def test_live_research_trace_pinned_to_three_original_authorities(self):
        receipt = inspect(self.register, self.canonical, self.policy)
        self.assertEqual(receipt["status"], "PASS_RESEARCH_POLICY_TRACKER_LINK_ONLY")
        self.assertEqual(len(receipt["gitBlobPins"]), 3)
        self.assertEqual(len(receipt["linkedPolicyDocuments"]), 3)
        for blocked in ("childMilestoneAccepted", "canonicalPromotion",
                        "additionalWipSlot", "releaseAuthorized", "mayPublish"):
            self.assertFalse(receipt[blocked])

    def test_missing_or_swapped_policy_target_is_hold(self):
        for changed in (
            self.register.replace("EM00202-POLICY-CROSSWALK-20261016.md",
                                  "missing-policy-review.md", 1),
            self.register.replace("EM00203-RESEARCH-WORKFLOW-RELEASE-GUARD-20261016.md",
                                  "COMPLETION-CHECKLIST.md", 1),
        ):
            with self.assertRaisesRegex(PolicyTrackerHold, "POLICY_TRACE_LINK"):
                inspect(changed, self.canonical, self.policy, check_pins=False)

    def test_premature_child_check_or_extra_workstream_is_hold(self):
        changed = self.register.replace(
            "- [ ] **EM-002.04**", "- [x] **EM-002.04**", 1
        )
        with self.assertRaisesRegex(PolicyTrackerHold, "PREMATURE_CHILD_APPROVAL"):
            inspect(changed, self.canonical, self.policy, check_pins=False)
        changed = self.register.replace("**three D/R/A normal workstreams**",
                                        "**four autonomous video workstreams**", 1)
        with self.assertRaisesRegex(PolicyTrackerHold, "WIP_RULE"):
            inspect(changed, self.canonical, self.policy, check_pins=False)

    def test_removed_freeze_rescission_or_publish_hold_is_rejected(self):
        for changed in (
            self.register.replace("**rescinded Oct 13**", "permanent", 1),
            self.register.replace("`mayPublish=false`", "`mayPublish=true`", 1),
        ):
            with self.assertRaisesRegex(PolicyTrackerHold, "RELEASE_HOLD_OR_WIP_RULE"):
                inspect(changed, self.canonical, self.policy, check_pins=False)

    def test_changed_source_sha_requires_policy_reaudit(self):
        for key, value in (
            ("register", self.register + "\nunauthorized-change"),
            ("canonical", self.canonical + "\nunauthorized-change"),
            ("policy", self.policy + "\nunauthorized-change"),
        ):
            docs={"register": self.register, "canonical": self.canonical,
                  "policy": self.policy}
            docs[key]=value
            with self.subTest(source=key):
                with self.assertRaisesRegex(PolicyTrackerHold, "STALE_GOVERNING_SOURCE"):
                    inspect(docs["register"], docs["canonical"], docs["policy"])


if __name__ == "__main__":
    unittest.main()
