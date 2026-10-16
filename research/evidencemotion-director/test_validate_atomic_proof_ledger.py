"""EvidenceMotion no-double-count, no-self-approval atomic ledger tests."""
import copy
import json
import unittest
from validate_atomic_proof_ledger import LEDGER,validate

class AtomicProofLedgerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.good=json.loads(LEDGER.read_text(encoding="utf-8"))

    def test_exact_named_research_cards_and_honest_707_inherited_estimate(self):
        result=validate(self.good,LEDGER.parent)
        self.assertEqual(result["evidenceGroupCount"],12)
        self.assertEqual(result["individuallyAuditedMachineResearchOnly"],82)
        self.assertEqual(result["inheritedProvisionalCoverageNotIndividuallyAudited"],707)
        self.assertEqual(result["provisionalCoverage"],789)
        self.assertEqual(result["totalAtomicTemplates"],1590)
        self.assertAlmostEqual(result["provisionalCoveragePercent"],49.6226,places=4)
        self.assertEqual(len(result["individualResearchCardIDs"]),82)
        self.assertIn("EM-007.06.R",result["individualResearchCardIDs"])
        self.assertIn("EM-007.05.R",result["individualResearchCardIDs"])
        self.assertIn("EM-007.04.R",result["individualResearchCardIDs"])
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["finalCreativeScientificViewerOrDeviceApproved"])

    def test_em00704_receipt_cannot_be_missing_or_misbound(self):
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-007.04"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWELVE_SOURCE_EVIDENCE_GROUPS_REQUIRED"):
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
        with self.assertRaisesRegex(ValueError,"EXACT_TWELVE_SOURCE_EVIDENCE_GROUPS_REQUIRED"):
            validate(fake,LEDGER.parent)

    def test_em00705_real_archive_proof_cannot_be_forged_or_dropped(self):
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-007.05")["source"]="fictional-human-study-confirmed.md"
        with self.assertRaisesRegex(ValueError,"MISBOUND"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        fake["proofGroups"]=[g for g in fake["proofGroups"] if g["group"]!="EM-007.05"]
        with self.assertRaisesRegex(ValueError,"EXACT_TWELVE_SOURCE_EVIDENCE_GROUPS_REQUIRED"):
            validate(fake,LEDGER.parent)
        fake=copy.deepcopy(self.good)
        next(g for g in fake["proofGroups"] if g["group"]=="EM-007.05")["cards"].append("EM-007.05.R")
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
