"""Distinguish verified engineering throughput from accepted atomic evidence."""
import copy
import json
import unittest
from atomic_progress_reconciler import DEFAULT_OBSERVATION, reconcile
from validate_atomic_proof_ledger import LEDGER


class AtomicProgressReconcilerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ledger=json.loads(LEDGER.read_text(encoding="utf-8"))
        cls.snapshot=json.loads(DEFAULT_OBSERVATION.read_text(encoding="utf-8"))

    def test_15_confirmed_prs_13_distinct_integration_commits_no_card_inflation(self):
        r=reconcile(self.ledger, LEDGER.parent, self.snapshot)
        self.assertEqual(r["mergedPRs"], 15)
        self.assertEqual(r["distinctMergeCommits"], 13)
        self.assertEqual(r["fiveActiveLanesMergedPRs"], 12)
        self.assertEqual(r["perLaneMergedPRs"],
            {"lane1":2,"lane2":2,"lane3":4,"lane4":2,"lane5":2})
        self.assertEqual(r["sharedIntegrationCommits"][0]["prs"],[6845,6846,6852])
        self.assertEqual(r["individualMachineVerifiedResearchCards"],168)
        self.assertEqual(sum(r["individualVerifiedByLane"].values()),168)
        self.assertEqual(r["inheritedProvisionalNOTIndividuallyAudited"],707)
        self.assertEqual(r["provisionalCoverageOnly"],875)
        self.assertEqual(r["notEvenProvisionallyMapped"],715)
        self.assertEqual(r["reconciliationState"],"NEEDS_CARD_RECONCILIATION")
        self.assertIn(r["freshness"], ("DATED_CURRENT_OBSERVATION","HISTORICAL_SNAPSHOT_NOT_LIVE"))
        self.assertEqual(r["acceptedResearchFoundations"],26)
        self.assertEqual(r["excellentFirstRender"]["accepted"],0)
        self.assertEqual(r["variedExcellentFirstRenderStreak"]["accepted"],0)
        self.assertFalse(r["mayPublish"])

    def test_snapshot_timestamp_cannot_launder_future_or_missing_date(self):
        for observed in (None, "2026-10-18T10:00:00Z", "not-an-instant"):
            bad=copy.deepcopy(self.snapshot)
            bad["observedAtUtc"]=observed
            with self.assertRaisesRegex(ValueError,"OBSERVATION_TIMESTAMP_NOT_SOURCE_BOUND"):
                reconcile(self.ledger,LEDGER.parent,bad)

    def test_same_merge_sha_is_not_counted_three_times(self):
        s=copy.deepcopy(self.snapshot)
        same=[p for p in s["mergedPRs"] if p["mergeCommitSha"]=="3aceadcf156ebbfd14c07575d91ea8e40c33fd85"]
        self.assertEqual(len(same),3)
        r=reconcile(self.ledger,LEDGER.parent,s)
        self.assertEqual(r["distinctMergeCommits"],r["mergedPRs"]-2)

    def test_duplicate_pr_number_rejected(self):
        s=copy.deepcopy(self.snapshot)
        s["mergedPRs"].append(copy.deepcopy(s["mergedPRs"][0]))
        with self.assertRaisesRegex(ValueError,"DUPLICATE_PR"):
            reconcile(self.ledger,LEDGER.parent,s)

    def test_forged_merge_hash_or_date_rejected(self):
        for k,value in (("mergeCommitSha","not-a-real-commit"),
                        ("mergedAt","2026-10-18T10:00:00Z"),
                        ("url","https://example.com/fake-pr")):
            s=copy.deepcopy(self.snapshot)
            s["mergedPRs"][0][k]=value
            with self.assertRaisesRegex(ValueError,"MERGE_SOURCE_OR_DAY_MISMATCH"):
                reconcile(self.ledger,LEDGER.parent,s)

    def test_open_and_merged_can_never_be_same_pr(self):
        s=copy.deepcopy(self.snapshot)
        s["openPRs"][0]["number"]=s["mergedPRs"][0]["number"]
        s["openPRs"][0]["url"]=s["mergedPRs"][0]["url"]
        with self.assertRaisesRegex(ValueError,"INCONSISTENT_OPEN_PR_SNAPSHOT"):
            reconcile(self.ledger,LEDGER.parent,s)

    def test_no_fake_approval_or_missing_ledger_group(self):
        bad=copy.deepcopy(self.ledger)
        bad["mayPublish"]=True
        with self.assertRaisesRegex(ValueError,"DENOMINATOR_OR_ACCEPTANCE_CONTRACT_TAMPER"):
            reconcile(bad,LEDGER.parent,self.snapshot)
        bad=copy.deepcopy(self.ledger)
        bad["proofGroups"].pop()
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE"):
            reconcile(bad,LEDGER.parent,self.snapshot)


if __name__=="__main__":
    unittest.main()
