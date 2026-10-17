"""No fake progress: regression, history-poisoning and stall recovery controls."""
import unittest
from atomic_progress_stall_watch import (
    SCHEMA, decide, trustworthy_previous, history_from_github,
    authenticated_history_checkpoint,
)

CURRENT = {"schema":SCHEMA,"repository":"Razzleberrytt/hippie-scientist-site",
           "branch":"research/em-lane1-current-main-science-20261016",
           "runId":"100","headSha":"a"*40,"atomicCount":875,
           "denominator":1590,"proofValidatorPassed":True,"mayPublish":False}

def prior(num, count=875, **changes):
    rec={**CURRENT,"runId":str(num),"headSha":format(num,"040x"),"atomicCount":count}
    rec.update(changes)
    return rec


class AtomicProgressWatchTests(unittest.TestCase):
    def test_three_consecutive_independent_successful_checks_trigger_unsticker(self):
        result=decide(CURRENT,[prior(99),prior(98)])
        self.assertEqual(result["status"],"STALLED_THREE_VERIFIED_CHECKPOINTS")
        self.assertTrue(result["requiresRecovery"])
        self.assertEqual(result["currentCount"],875)
        self.assertEqual(result["newCardsCreditedByWatchdog"],0)
        self.assertIsNone(result["nextReadyUnclaimedCard"])
        self.assertEqual(result["namedBlockedRecoveryTargets"][0]["atomicId"],"EM-007.07.X")
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["approvalToMerge"])

    def test_missing_history_is_unknown_not_stalled(self):
        self.assertEqual(decide(CURRENT,[])["status"],"INSUFFICIENT_VERIFIED_HISTORY")
        self.assertEqual(decide(CURRENT,[prior(99)])["status"],"INSUFFICIENT_VERIFIED_HISTORY")

    def test_duplicate_runs_cannot_manufacture_three_checkpoints(self):
        report=decide(CURRENT,[prior(99),prior(99),prior(99)])
        self.assertEqual(report["verifiedHistoryLength"],1)

    def test_old_history_does_not_override_real_new_earned_credit(self):
        self.assertEqual(decide(CURRENT,[prior(99,872),prior(98,872)])["status"],
                         "ADVANCING_VERIFIED")

    def test_previous_mixed_counts_does_not_claim_flat_three(self):
        self.assertEqual(decide(CURRENT,[prior(99,875),prior(98,872)])["status"],
                         "RECENT_PROGRESS_NOT_STALLED")

    def test_count_regression_requires_reconciliation_never_an_auto_increment(self):
        report=decide(CURRENT,[prior(99,876),prior(98,875)])
        self.assertEqual(report["status"],"COUNT_REGRESSION_REQUIRES_RECONCILIATION")
        self.assertTrue(report["requiresRecovery"])
        self.assertEqual(report["newCardsCreditedByWatchdog"],0)

    def test_foreign_repo_branch_and_current_run_are_not_eligible(self):
        report=decide(CURRENT,[prior(99,repository="foreign/repo"),
                               prior(98,branch="main"),prior(100)])
        self.assertEqual(report["verifiedHistoryLength"],0)

    def test_malformed_or_release_granting_history_is_untrusted(self):
        report=decide(CURRENT,[prior(99,mayPublish=True),
                               prior(98,proofValidatorPassed=False),
                               prior(97,atomicCount=True),
                               prior(96,denominator=500),
                               prior(95,headSha="not-a-sha")])
        self.assertEqual(report["verifiedHistoryLength"],0)

    def test_current_must_be_proof_validated_and_release_denied(self):
        for bad in ({"proofValidatorPassed":False},{"mayPublish":True},
                    {"denominator":999},{"schema":"wrong"}):
            with self.subTest(bad=bad):
                with self.assertRaisesRegex(ValueError,"CURRENT_UNVERIFIED"):
                    decide({**CURRENT,**bad},[prior(99),prior(98)])

    def test_two_nearest_distinct_runs_win_not_very_old_stale_plateau(self):
        r=decide(CURRENT,[prior(99),prior(98),prior(97,500)])
        self.assertEqual(r["previousCounts"],[875,875])
        self.assertEqual(r["status"],"STALLED_THREE_VERIFIED_CHECKPOINTS")

    def test_checkpoints_validate_exact_sha_run_and_scope(self):
        self.assertFalse(trustworthy_previous(prior(99,headSha="0"),CURRENT))
        self.assertFalse(trustworthy_previous(prior(99,runId="100"),CURRENT))
        self.assertFalse(trustworthy_previous(prior(99,atomicCount="875"),CURRENT))
        self.assertTrue(trustworthy_previous(prior(99),CURRENT))

    def test_same_source_head_reruns_do_not_mimic_engineering_stall(self):
        result=decide(CURRENT,[prior(99,headSha=CURRENT["headSha"]),
                               prior(98,headSha=CURRENT["headSha"])])
        self.assertEqual(result["status"],"INSUFFICIENT_VERIFIED_HISTORY")
        self.assertEqual(result["verifiedHistoryLength"],0)
        self.assertFalse(result["requiresRecovery"])

    def test_only_unique_successful_source_revisions_count_for_stall(self):
        result=decide(CURRENT,[prior(99),prior(98,headSha=prior(99)["headSha"]),
                               prior(97)])
        self.assertEqual(result["status"],"STALLED_THREE_VERIFIED_CHECKPOINTS")
        self.assertEqual(result["verifiedHistoryLength"],2)

    def test_github_completed_proof_run_identity_is_mandatory(self):
        source={"id":99,"head_sha":prior(99)["headSha"]}
        viewed={"workflowName":"EvidenceMotion atomic proof ledger gate",
                "status":"completed","conclusion":"success",
                "headBranch":CURRENT["branch"],"headSha":source["head_sha"]}
        args=(prior(99),CURRENT["repository"],CURRENT["branch"],"99",source)
        self.assertTrue(authenticated_history_checkpoint(*args,viewed))
        for fault in ({"conclusion":"failure"},{"status":"in_progress"},
                      {"workflowName":"CI"},{"headSha":"f"*40},
                      {"headBranch":"main"}):
            with self.subTest(fault=fault):
                self.assertFalse(authenticated_history_checkpoint(
                    *args,{**viewed,**fault}))
        self.assertFalse(authenticated_history_checkpoint(
            *args,{**viewed,"headSha":"not-a-sha"}))
        self.assertFalse(authenticated_history_checkpoint(
            prior(99,proofValidatorPassed=False),
            CURRENT["repository"],CURRENT["branch"],"99",source,viewed))
        self.assertFalse(authenticated_history_checkpoint(
            prior(99),CURRENT["repository"],CURRENT["branch"],"99",
            {**source,"id":98},viewed))
        self.assertFalse(authenticated_history_checkpoint(
            prior(99),CURRENT["repository"],CURRENT["branch"],"99",
            {**source,"head_sha":"f"*40},viewed))

    def test_real_history_scans_past_reruns_to_two_distinct_verified_heads(self):
        """A duplicate artifact must not hide the next older distinct source."""
        import os
        import json
        from pathlib import Path
        from unittest.mock import patch
        same_head = prior(99)["headSha"]
        entries = [(99,same_head),(98,same_head),(97,prior(97)["headSha"])]
        seen_downloads = []
        artifacts = [
            {"name":"evidencemotion-atomic-progress-checkpoint",
             "created_at":f"2026-10-17T17:{n:02d}:00Z",
             "expired":False,
             "workflow_run":{"id":n,"head_branch":CURRENT["branch"],
                             "head_sha":head}}
            for n,head in entries
        ]
        # Numeric created_at would sort 99 first if sorting on minute % 60
        for index,item in enumerate(artifacts):
            item["created_at"]=f"2026-10-17T{19-index:02d}:00:00Z"

        def fake_gh(args):
            if args[0] == "api":
                return json.dumps({"artifacts":artifacts}).encode()
            run=int(args[2])
            head=dict(entries)[run]
            if args[:2] == ["run","view"]:
                return json.dumps({
                    "workflowName":"EvidenceMotion atomic proof ledger gate",
                    "status":"completed","conclusion":"success",
                    "headBranch":CURRENT["branch"],"headSha":head
                }).encode()
            if args[:2] == ["run","download"]:
                folder=Path(args[args.index("--dir")+1])
                folder.joinpath("snapshot.json").write_text(
                    json.dumps(prior(run,headSha=head)),encoding="utf-8")
                seen_downloads.append(run)
                return b""
            raise AssertionError(f"unexpected GitHub invocation: {args}")

        with patch.dict(os.environ,{"GH_TOKEN":"fixture"}),patch(
                "atomic_progress_stall_watch._gh",side_effect=fake_gh):
            history,status=history_from_github(
                CURRENT["repository"],CURRENT["branch"],CURRENT["runId"])
        self.assertEqual(status,"OK")
        self.assertEqual([int(r["runId"]) for r in history],[99,97])
        self.assertEqual(seen_downloads,[99,97])
        self.assertEqual(decide(CURRENT,history)["status"],
                         "STALLED_THREE_VERIFIED_CHECKPOINTS")

    def test_history_same_head_only_remains_unknown_not_false_stall(self):
        import os
        import json
        from pathlib import Path
        from unittest.mock import patch
        head=prior(99)["headSha"]
        artifacts=[
            {"name":"evidencemotion-atomic-progress-checkpoint",
             "created_at":f"2026-10-17T{19-i:02d}:00:00Z",
             "expired":False,
             "workflow_run":{"id":n,"head_branch":CURRENT["branch"],
                             "head_sha":head}}
            for i,n in enumerate((99,98))
        ]
        def fake_gh(args):
            if args[0]=="api":
                return json.dumps({"artifacts":artifacts}).encode()
            run=int(args[2])
            if args[:2]==["run","view"]:
                return json.dumps({"workflowName":"EvidenceMotion atomic proof ledger gate",
                                   "status":"completed","conclusion":"success",
                                   "headBranch":CURRENT["branch"],
                                   "headSha":head}).encode()
            if args[:2]==["run","download"]:
                Path(args[args.index("--dir")+1],"snapshot.json").write_text(
                    json.dumps(prior(run,headSha=head)),encoding="utf-8")
                return b""
            raise AssertionError(args)
        with patch.dict(os.environ,{"GH_TOKEN":"fixture"}),patch(
                "atomic_progress_stall_watch._gh",side_effect=fake_gh):
            history,status=history_from_github(
                CURRENT["repository"],CURRENT["branch"],CURRENT["runId"])
        self.assertEqual(status,"HISTORY_NOT_YET_ESTABLISHED")
        self.assertEqual(len(history),1)
        self.assertEqual(decide(CURRENT,history)["status"],
                         "INSUFFICIENT_VERIFIED_HISTORY")

    def test_lack_of_github_token_cannot_fabricate_history(self):
        import os
        from unittest.mock import patch
        with patch.dict(os.environ,{"GH_TOKEN":""}):
            history,status=history_from_github(CURRENT["repository"],CURRENT["branch"],"100")
        self.assertEqual(history,[])
        self.assertEqual(status,"NO_GITHUB_READ_TOKEN")

if __name__=="__main__":
    unittest.main()
