"""Pure deterministic checks: never count GitHub PR events as atomic proof."""
import copy
import json
import unittest

from em_progress_reconcile import OBSERVATION, reconcile


GOOD_AUDITED = {
    "mayPublish": False,
    "individuallyAuditedMachineResearchOnly": 168,
    "inheritedProvisionalCoverageNotIndividuallyAudited": 707,
    "provisionalCoverage": 875,
    "totalAtomicTemplates": 1590,
}


class ProgressReconciliationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.original = json.loads(OBSERVATION.read_text(encoding="utf-8"))

    def test_oct17_merged_prs_do_not_change_atomic_credit(self):
        result = reconcile(self.original, GOOD_AUDITED, today_utc="2026-10-17")
        self.assertEqual(result["engineeringMergedPRs"], 15)
        self.assertEqual(result["distinctMergeCommits"], 13)
        self.assertEqual(result["duplicateMergeCommitAppearances"], 2)
        self.assertEqual(sum(result["mergedFiveLanePRs"].values()), 12)
        self.assertEqual(result["mergedFiveLanePRs"], {
            "lane1": 2, "lane2": 2, "lane3": 4,
            "lane4": 2, "lane5": 2,
        })
        self.assertEqual(result["openPRsAtObservationOnly"], 10)
        self.assertEqual(result["machineAuditedCards"], 168)
        self.assertEqual(result["inheritedProvisionalNotIndividuallyAudited"], 707)
        self.assertEqual(result["provisionalCoverageCards"], 875)
        self.assertEqual(result["newCardsAwardedByThisReport"], 0)
        self.assertEqual(result["status"], "MERGED_ENGINEERING_WITH_UNRECONCILED_CREDIT")
        self.assertEqual(result["freshness"], "DATED_CURRENT_OBSERVATION")
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["excellentFirstRenderApproved"])

    def test_historical_snapshot_is_not_called_live(self):
        self.assertEqual(reconcile(self.original, GOOD_AUDITED,
                         today_utc="2026-10-18")["freshness"],
                         "HISTORICAL_SNAPSHOT_NOT_LIVE")

    def test_existing_lanes_not_reclassified_into_daily_video(self):
        copy_input = copy.deepcopy(self.original)
        copy_input["mergedPRs"][0]["lane"] = "daily_video_audit"
        result = reconcile(copy_input, GOOD_AUDITED, today_utc="2026-10-17")
        self.assertEqual(result["newCardsAwardedByThisReport"], 0)

    def test_duplicate_pr_and_open_merge_alias_rejected(self):
        copy_input = copy.deepcopy(self.original)
        copy_input["mergedPRs"].append(copy_input["mergedPRs"][0])
        with self.assertRaisesRegex(ValueError, "DUPLICATE_UNVERIFIED"):
            reconcile(copy_input, GOOD_AUDITED, today_utc="2026-10-17")
        copy_input = copy.deepcopy(self.original)
        copy_input["openPRs"][0]["number"] = copy_input["mergedPRs"][0]["number"]
        with self.assertRaisesRegex(ValueError, "MERGED_PR_RELISTED"):
            reconcile(copy_input, GOOD_AUDITED, today_utc="2026-10-17")

    def test_ledger_requires_verified_arithmetic_and_no_publish(self):
        for change in (
            {"mayPublish": True},
            {"provisionalCoverage": 876},
            {"individuallyAuditedMachineResearchOnly": True},
        ):
            with self.subTest(change=change):
                with self.assertRaises(ValueError):
                    reconcile(self.original, {**GOOD_AUDITED, **change},
                              today_utc="2026-10-17")

    def test_missing_or_falsely_dated_merge_rejected(self):
        bad = copy.deepcopy(self.original)
        bad["mergedPRs"][0]["mergeCommitSha"] = "no-sha"
        with self.assertRaisesRegex(ValueError, "WRONG_DATE_MERGE_ROW"):
            reconcile(bad, GOOD_AUDITED, today_utc="2026-10-17")
        bad = copy.deepcopy(self.original)
        bad["observedDate"] = "2026-10-16"
        with self.assertRaisesRegex(ValueError, "INVALID_DATED_OBSERVATION"):
            reconcile(bad, GOOD_AUDITED, today_utc="2026-10-17")


if __name__ == "__main__":
    unittest.main()
