"""EvidenceMotion no-double-count, no-self-approval atomic ledger tests."""
import copy
import json
import unittest
from validate_atomic_proof_ledger import LEDGER,validate

class AtomicProofLedgerTests(unittest.TestCase):
    def test_new_proof_group_requires_canonical_card_sha_and_real_run_identity(self):
        # Positive case is a synthetic ledger-structure fixture, NOT an
        # independent real-film/clinical/phone approval.
        import hashlib
        import shutil
        import tempfile
        from pathlib import Path
        with tempfile.TemporaryDirectory() as temporary:
            directory=Path(temporary)
            for group in self.good["proofGroups"]:
                shutil.copyfile(LEDGER.parent/group["source"],
                                directory/group["source"])
            shutil.copyfile(LEDGER.parent/"COMPLETION-CHECKLIST.md",directory/"COMPLETION-CHECKLIST.md")
            (directory/"atomic").mkdir()
            for planning_file in sorted((LEDGER.parent/"atomic").glob("0[1-5]-*.md")):
                shutil.copyfile(planning_file,directory/"atomic"/planning_file.name)
            merge="a"*40
            run=39060226925
            proof="".join((
                "# Machine-only research proof\n",
                "https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/"+str(run)+"\n",
                "merge "+merge+"\nmayPublish=false\n",
                "| ID | Status | Receipt |\n| --- | --- | --- |\n",
                "| \`EM-034.08.U\` | VERIFIED_MACHINE_RESEARCH | exact unit only |\n",
                "| \`EM-034.08.S\` | VERIFIED_MACHINE_RESEARCH | source SHA only |\n",
            )).replace(r"\`", chr(96))
            name="EM03408-MACHINE-ONLY-20261017.md"
            (directory/name).write_text(proof,encoding="utf-8")
            extra={"group":"EM-034.08","source":name,
                "sourceSha256":hashlib.sha256(proof.encode()).hexdigest(),
                "mergeCommitSha":merge,"workflowRunId":run,
                "cards":["EM-034.08.U","EM-034.08.S"]}
            candidate=copy.deepcopy(self.good)
            candidate["proofGroups"].append(extra)
            candidate["individualMachineVerifiedResearchCardCount"]=170
            candidate["provisionalCoverageCardCount"]=877
            candidate["provisionalCoveragePercent"]=round(877/1590*100,4)
            result=validate(candidate,directory)
            self.assertEqual(result["evidenceGroupCount"],27)
            self.assertEqual(result["individuallyAuditedMachineResearchOnly"],170)
            self.assertEqual(result["provisionalCoverage"],877)
            self.assertFalse(result["mayPublish"])
            same_accepted=copy.deepcopy(candidate)
            same_accepted["proofGroups"][-1]["group"]="EM-001.05"
            with self.assertRaisesRegex(ValueError,"ACCEPTED_PARENT_REQUIRES_INHERITED_RECLASSIFICATION"):
                validate(same_accepted,directory)
            for corrupt,why in (
                ({"sourceSha256":"0"*64},"NEW_EVIDENCE_SOURCE_SHA_UNVERIFIED"),
                ({"workflowRunId":None},"NEW_EVIDENCE_MERGE_RUN_OR_HOLD"),
                ({"cards":["EM-034.08.U","EM-034.08.U"]},"DUPLICATED_CARD_CLAIM"),
                ({"cards":["EM-034.08.X"]},"NO_EXPLICIT_RESEARCH_PROOF_TABLE_ROW"),
                ({"cards":["EM-034.99.U"]},"WRONG_PROOF_GROUP_FOR_CARD"),
            ):
                bad=copy.deepcopy(candidate)
                bad["proofGroups"][-1].update(corrupt)
                bad["individualMachineVerifiedResearchCardCount"]=168+len(bad["proofGroups"][-1]["cards"])
                bad["provisionalCoverageCardCount"]=707+bad["individualMachineVerifiedResearchCardCount"]
                bad["provisionalCoveragePercent"]=round(100*bad["provisionalCoverageCardCount"]/1590,4)
                with self.assertRaisesRegex(ValueError,why):
                    validate(bad,directory)


    @classmethod
    def setUpClass(cls):
        cls.good=json.loads(LEDGER.read_text(encoding="utf-8"))

    def test_corrected_deduplicated_820_stage_headline_requires_real_union(self):
        corrected=copy.deepcopy(self.good)
        corrected["provisionalCoverageCardCount"]=820
        corrected["provisionalCoveragePercent"]=round(820/1590*100,4)
        report=validate(corrected,LEDGER.parent)
        self.assertEqual(report["provisionalCoverage"],820)
        self.assertEqual(report["individuallyAuditedMachineResearchOnly"],168)
        self.assertFalse(report["mayPublish"])
        bad=copy.deepcopy(corrected)
        bad["provisionalCoverageCardCount"]=821
        bad["provisionalCoveragePercent"]=round(821/1590*100,4)
        with self.assertRaisesRegex(ValueError,"RESEARCH_CARD_ARITHMETIC_OR_ROLLUP_WRONG"):
            validate(bad,LEDGER.parent)

    def test_exact_named_research_cards_and_honest_707_inherited_estimate(self):
        result=validate(self.good,LEDGER.parent)
        self.assertEqual(result["evidenceGroupCount"],26)
        self.assertEqual(result["individuallyAuditedMachineResearchOnly"],168)
        self.assertEqual(result["inheritedProvisionalCoverageNotIndividuallyAudited"],707)
        self.assertEqual(result["provisionalCoverage"],875)
        self.assertEqual(result["totalAtomicTemplates"],1590)
        self.assertAlmostEqual(result["provisionalCoveragePercent"],55.0314,places=4)
        self.assertEqual(len(result["individualResearchCardIDs"]),168)
        self.assertIn("EM-001.01.R",result["individualResearchCardIDs"])
        self.assertIn("EM-001.02.R",result["individualResearchCardIDs"])
        self.assertIn("EM-001.04.R",result["individualResearchCardIDs"])
        self.assertIn("EM-001.03.R",result["individualResearchCardIDs"])
        self.assertNotIn("EM-001.03.T",result["individualResearchCardIDs"])
        self.assertIn("EM-007.08.R",result["individualResearchCardIDs"])
        self.assertIn("EM-007.06.R",result["individualResearchCardIDs"])
        self.assertIn("EM-007.05.R",result["individualResearchCardIDs"])
        self.assertIn("EM-007.04.R",result["individualResearchCardIDs"])
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["finalCreativeScientificViewerOrDeviceApproved"])


    def test_em00707_only_original_claim_intake_prerequisites_are_creditable(self):
        result=validate(self.good,LEDGER.parent)
        ids=set(result["individualResearchCardIDs"])
        for card in ("EM-007.07.U", "EM-007.07.S", "EM-007.07.O"):
            self.assertIn(card,ids)
        for suffix in ("X", "T", "N", "R"):
            self.assertNotIn("EM-007.07."+suffix,ids)
        fake=copy.deepcopy(self.good)
        next(x for x in fake["proofGroups"] if x["group"]=="EM-007.07")["cards"].append("EM-007.07.X")
        with self.assertRaisesRegex(ValueError,"EM00707_INDEPENDENT_REVIEW_NOT_RECEIVED"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(x for x in fake["proofGroups"] if x["group"]=="EM-007.07")["cards"].append("EM-007.07.R")
        with self.assertRaisesRegex(ValueError,"EM00707_INDEPENDENT_REVIEW_NOT_RECEIVED"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(x for x in fake["proofGroups"] if x["group"]=="EM-007.07")["source"]="invented-qualified-review.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[x for x in fake["proofGroups"] if x["group"]!="EM-007.07"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE"):
            validate(fake,LEDGER.parent)

    def test_em00704_receipt_cannot_be_missing_or_misbound(self):
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-007.04"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE_EVIDENCE_GROUPS_REQUIRED"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-007.04")["source"]="imaginary-review.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)

    def test_em00706_proof_without_source_row_or_with_fake_group_is_hold(self):
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-007.06")["source"]="fake-successful-redteam.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-007.06"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE_EVIDENCE_GROUPS_REQUIRED"):
            validate(fake,LEDGER.parent)

    def test_em00705_real_archive_proof_cannot_be_forged_or_dropped(self):
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-007.05")["source"]="fictional-human-study-confirmed.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-007.05"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE_EVIDENCE_GROUPS_REQUIRED"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-007.05")["cards"].append("EM-007.05.R")
        with self.assertRaisesRegex(ValueError,"DUPLICATED_CARD_CLAIM"):
            validate(fake,LEDGER.parent)

    def test_science_gate_receipt_cannot_grant_clinical_or_release_credit(self):
        fake=copy.deepcopy(self.good)
        group=next(g for g in fake["proofGroups"] if g["group"]=="EM-007.08")
        group["source"]="fake-human-scientist-approved.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-007.08"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        group=next(g for g in fake["proofGroups"] if g["group"]=="EM-007.08")
        group["cards"].append(group["cards"][0])
        with self.assertRaisesRegex(ValueError,"DUPLICATED_CARD_CLAIM"):
            validate(fake,LEDGER.parent)

    def test_em00101_three_actual_hosted_run_receipt_required(self):
        report=validate(self.good,LEDGER.parent)
        expected={f"EM-001.01.{part}" for part in ("U","S","O","X","T","R")}
        self.assertTrue(expected.issubset(set(report["individualResearchCardIDs"])))
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-001.01"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-001.01")["source"]="fictional-cpu-success.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-001.01")["cards"].append("EM-001.01.R")
        with self.assertRaisesRegex(ValueError,"DUPLICATED_CARD_CLAIM"):
            validate(fake,LEDGER.parent)

    def test_em00102_cpu_only_video_receipt_exact_six_cards(self):
        result=validate(self.good,LEDGER.parent)
        ids={f"EM-001.02.{part}" for part in ("U","S","O","X","T","R")}
        self.assertTrue(ids.issubset(result["individualResearchCardIDs"]))
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-001.02"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-001.02")["source"]="fake-gpu-success.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-001.02")["cards"].append("EM-001.02.R")
        with self.assertRaisesRegex(ValueError,"DUPLICATED_CARD_CLAIM"):
            validate(fake,LEDGER.parent)
    def test_em00104_cpu_required_guard_receipts_exact_six_cards(self):
        result=validate(self.good,LEDGER.parent)
        ids={f"EM-001.04.{part}" for part in ("U","S","O","X","T","R")}
        self.assertTrue(ids.issubset(set(result["individualResearchCardIDs"])))
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-001.04"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-001.04")["source"]="gpu-required-unreviewed.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-001.04")["cards"].append("EM-001.04.R")
        with self.assertRaisesRegex(ValueError,"DUPLICATED_CARD_CLAIM"):
            validate(fake,LEDGER.parent)

    def test_em00103_mobile_review_bytes_are_partial_not_iphone_approved(self):
        result=validate(self.good,LEDGER.parent)
        verified={f"EM-001.03.{part}" for part in ("U","S","O","X","R")}
        ids=set(result["individualResearchCardIDs"])
        self.assertTrue(verified.issubset(ids))
        self.assertNotIn("EM-001.03.T",ids)
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-001.03"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-001.03")["source"]="imagined-phone-review.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-001.03")["cards"].append("EM-001.03.T")
        with self.assertRaisesRegex(ValueError,"NO_EXPLICIT_RESEARCH_PROOF_TABLE_ROW"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-001.03")["cards"].append("EM-001.03.R")
        with self.assertRaisesRegex(ValueError,"DUPLICATED_CARD_CLAIM"):
            validate(fake,LEDGER.parent)

    def test_em00202_crosswalk_receipt_cannot_be_missing_misbound_or_double_counted(self):
        result=validate(self.good,LEDGER.parent)
        expected={f"EM-002.02.{part}" for part in ("U","S","O","X","T","R")}
        self.assertTrue(expected.issubset(set(result["individualResearchCardIDs"])))
        self.assertFalse(result["mayPublish"])
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-002.02"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-002.02")["source"]="fake-owner-grant.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-002.02")["cards"].append("EM-002.02.R")
        with self.assertRaisesRegex(ValueError,"DUPLICATED_CARD_CLAIM"):
            validate(fake,LEDGER.parent)

    def test_real_em00804_independent_ocr_frame_proof_bound_to_source_and_no_release(self):
        result=validate(self.good,LEDGER.parent)
        ids=set(result["individualResearchCardIDs"])
        self.assertTrue({f"EM-008.04.{stage}" for stage in "USOXTNR"}.issubset(ids))
        self.assertFalse(result["mayPublish"])
        altered=copy.deepcopy(self.good)
        altered["proofGroups"]=[g for g in altered["proofGroups"]
                                if g["group"]!="EM-008.04"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE"):
            validate(altered,LEDGER.parent)
        altered=copy.deepcopy(self.good)
        next(g for g in altered["proofGroups"] if g["group"]=="EM-008.04")["source"]="invented-physician-approved-iphone.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(altered,LEDGER.parent)
        altered=copy.deepcopy(self.good)
        next(g for g in altered["proofGroups"] if g["group"]=="EM-008.04")["cards"].append("EM-008.04.R")
        with self.assertRaisesRegex(ValueError,"DUPLICATED_CARD_CLAIM"):
            validate(altered,LEDGER.parent)

    def test_real_em00803_hosted_pixel_proof_is_source_bound_nonduplicated_and_no_release(self):
        result=validate(self.good,LEDGER.parent)
        ids=set(result["individualResearchCardIDs"])
        self.assertTrue({f"EM-008.03.{stage}" for stage in "USOXTNR"}.issubset(ids))
        self.assertFalse(result["mayPublish"])
        altered=copy.deepcopy(self.good)
        altered["proofGroups"]=[g for g in altered["proofGroups"] if g["group"]!="EM-008.03"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE"):
            validate(altered,LEDGER.parent)
        altered=copy.deepcopy(self.good)
        next(g for g in altered["proofGroups"] if g["group"]=="EM-008.03")["source"]="fake-actual-iphone-human-approved.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(altered,LEDGER.parent)
        altered=copy.deepcopy(self.good)
        next(g for g in altered["proofGroups"] if g["group"]=="EM-008.03")["cards"].append("EM-008.03.R")
        with self.assertRaisesRegex(ValueError,"DUPLICATED_CARD_CLAIM"):
            validate(altered,LEDGER.parent)

    def test_real_em00805_h264_negative_proof_cannot_be_dropped_rebound_or_double_counted(self):
        result=validate(self.good,LEDGER.parent)
        ids=set(result["individualResearchCardIDs"])
        expected={f"EM-008.05.{stage}" for stage in "USOXTNR"}
        self.assertTrue(expected.issubset(ids))
        self.assertFalse(result["mayPublish"])
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-008.05"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-008.05")["source"]="fabricated-clinical-reviewed-botanical.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-008.05")["cards"].append("EM-008.05.N")
        with self.assertRaisesRegex(ValueError,"DUPLICATED_CARD_CLAIM"):
            validate(fake,LEDGER.parent)

    def test_em00604_illustrative_botanical_false_measurement_negative_receipt(self):
        report=validate(self.good,LEDGER.parent)
        expected={f"EM-006.04.{stage}" for stage in ("U","S","O","X","T","N","R")}
        self.assertTrue(expected.issubset(set(report["individualResearchCardIDs"])))
        self.assertFalse(report["mayPublish"])
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-006.04"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-006.04")["source"]="fake-independent-botanical-assay.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-006.04")["cards"].append("EM-006.04.N")
        with self.assertRaisesRegex(ValueError,"DUPLICATED_CARD_CLAIM"):
            validate(fake,LEDGER.parent)

    def test_em00201_dated_version_policy_evidence_exact_six_cards(self):
        report=validate(self.good,LEDGER.parent)
        expected={f"EM-002.01.{stage}" for stage in ("U","S","O","X","T","R")}
        self.assertTrue(expected.issubset(set(report["individualResearchCardIDs"])))
        self.assertFalse(report["mayPublish"])
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-002.01"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-002.01")["source"]="unsourced-freeze-lift.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-002.01")["cards"].append("EM-002.01.R")
        with self.assertRaisesRegex(ValueError,"DUPLICATED_CARD_CLAIM"):
            validate(fake,LEDGER.parent)

    def test_em00204_governing_register_trace_exact_six_machine_cards(self):
        result=validate(self.good,LEDGER.parent)
        expected={f"EM-002.04.{stage}" for stage in ("U","S","O","X","T","R")}
        self.assertTrue(expected.issubset(set(result["individualResearchCardIDs"])))
        self.assertNotIn("EM-002.04.N",result["individualResearchCardIDs"])
        self.assertFalse(result["mayPublish"])
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-002.04"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-002.04")["source"]="fake-tracker-approval.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-002.04")["cards"].append("EM-002.04.R")
        with self.assertRaisesRegex(ValueError,"DUPLICATED_CARD_CLAIM"):
            validate(fake,LEDGER.parent)

    def test_em00203_research_release_negative_receipt_has_exact_seven_cards(self):
        result=validate(self.good,LEDGER.parent)
        expected={f"EM-002.03.{stage}" for stage in ("U","S","O","X","T","N","R")}
        self.assertTrue(expected.issubset(set(result["individualResearchCardIDs"])))
        self.assertFalse(result["mayPublish"])
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-002.03"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWENTY_SIX_SOURCE"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-002.03")["source"]="fake-version-approved.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-002.03")["cards"].append("EM-002.03.N")
        with self.assertRaisesRegex(ValueError,"DUPLICATED_CARD_CLAIM"):
            validate(fake,LEDGER.parent)

    def test_duplicate_card_does_not_earn_credit(self):
        fake=copy.deepcopy(self.good)
        fake["proofGroups"][0]["cards"].append(fake["proofGroups"][0]["cards"][0])
        with self.assertRaisesRegex(ValueError,"DUPLICATED_CARD_CLAIM"):
            validate(fake,LEDGER.parent)

    def test_missing_or_nonapproved_proof_table_row_fails(self):
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-034.12")["cards"][-1]="EM-034.12.T"
        with self.assertRaisesRegex(ValueError,"NO_EXPLICIT_RESEARCH_PROOF_TABLE_ROW"):
            validate(fake,LEDGER.parent)

    def test_false_provisional_percent_or_counter_fails(self):
        fake=copy.deepcopy(self.good)
        fake["provisionalCoverageCardCount"]+=1
        with self.assertRaisesRegex(ValueError,"ARITHMETIC"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        fake["provisionalCoveragePercent"]=47.0
        with self.assertRaisesRegex(ValueError,"ARITHMETIC"):
            validate(fake,LEDGER.parent)

    def test_inherited_are_not_silently_treated_as_audited(self):
        fake=copy.deepcopy(self.good)
        fake["individualMachineVerifiedResearchCardCount"]=736
        with self.assertRaisesRegex(ValueError,"ARITHMETIC"):
            validate(fake,LEDGER.parent)

    def test_source_group_cannot_be_swapped_or_missing(self):
        fake=copy.deepcopy(self.good)
        fake["proofGroups"][0]["source"]=fake["proofGroups"][1]["source"]
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        fake["proofGroups"][0]["source"]="fictitious-positive.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)

    def test_publishing_or_human_approval_cannot_be_granted_by_counter(self):
        for change in [
            {"mayPublish":True},
            {"allCreativeScientificHumanHandsetAndMergeGatesPassed":True},
            {"status":"ALL_DONE"},
            {"inheritedMappedToAcceptedFoundationsNotIndividuallyAudited":736},
        ]:
            fake={**copy.deepcopy(self.good),**change}
            with self.assertRaisesRegex(ValueError,"ACCEPTANCE_CONTRACT_TAMPER"):
                validate(fake,LEDGER.parent)

if __name__=="__main__":
    unittest.main()
