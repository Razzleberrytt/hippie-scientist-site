"""EM-007.04 uncertainty categories: bounded proof, never scientific approval."""
import copy
import json
import unittest

from claim_source_context_join import join
from test_claim_source_context_join import LEDGER, visual_fixture
from uncertainty_evidence_ledger import (
    separate, SCHEMA, NOT_ASSESSED, ABSENT_FROM_THIS_ASSET,
    NO_HUMAN_CONCLUSION,
)


class UncertaintySeparationTests(unittest.TestCase):
    def setUp(self):
        spoken = json.loads(LEDGER.read_text(encoding="utf-8"))
        visual = visual_fixture()
        self.parent = join(spoken, visual,
                           spoken_sha="d"*64, visual_sha="e"*64)

    def get(self):
        return separate(self.parent, parent_sha="f"*64)

    def test_all_eight_categories_are_research_only(self):
        result = self.get()
        self.assertEqual(result["schema"], SCHEMA)
        self.assertEqual(result["claimCount"], 8)
        self.assertEqual(len(result["claims"]), 8)
        self.assertEqual(result["outcomeInferenceGapClaimIds"], ["spoken-007"])
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["scienceApproved"])
        self.assertFalse(result["noHumanEffectsProven"])
        self.assertFalse(result["conflictingStudiesReviewed"])
        self.assertTrue(result["needsIndependentHumanStudyReview"])
        self.assertTrue(all(row["clinicalEvidenceAxes"] ==
                            {axis: NOT_ASSESSED for axis in (
                                "positiveHumanFinding", "nullHumanFinding",
                                "conflictingHumanFinding")}
                            for row in result["claims"]))
        self.assertTrue(all(not row["mechanismOrComputedStructureIsHumanOutcomeEvidence"]
                            for row in result["claims"]))
        self.assertTrue(all(row["effectPresenceOrAbsenceConclusion"] ==
                            NO_HUMAN_CONCLUSION for row in result["claims"]))
        self.assertEqual(result["claims"][6]["humanOutcomeEvidenceInSelectedAsset"],
                         ABSENT_FROM_THIS_ASSET)
        self.assertEqual(result["claims"][5]["humanOutcomeEvidenceInSelectedAsset"],
                         "NOT_A_HUMAN_OUTCOME_STUDY_ASSERTION")
        self.assertEqual(result["sourceContextJoinSha256"], "f"*64)

    def test_missing_human_study_is_not_negative_result(self):
        report = self.get()
        row = report["claims"][6]
        self.assertEqual(row["uncertaintyDisposition"],
                         "DEPICTION_CANNOT_ESTABLISH_SUBJECTIVE_OUTCOME")
        self.assertFalse(report["nullStudyFindingsReported"])
        self.assertFalse(report["negativeStudyFindingsReported"])
        self.assertFalse(report["clinicalLiteratureCompletenessEstablished"])
        self.assertFalse(row["humanLiteratureReviewComplete"])

    def test_reject_false_positive_or_negative_effect_conclusion(self):
        for field, changed in (
            ("sourceLinksSupportClinicalEffect", True),
            ("clinicalEffectAbsenceProven", True),
            ("qualifiedIndependentScientificReview", True),
            ("humanStudyId", 123456),
        ):
            original = self.parent["claims"][6][field]
            self.parent["claims"][6][field] = changed
            with self.subTest(field=field), self.assertRaisesRegex(
                    ValueError, "CLAIM_OR_EVIDENCE_CEILING_DRIFT"):
                self.get()
            self.parent["claims"][6][field] = original

    def test_malicious_extra_finding_or_study_metadata_fails(self):
        self.parent["claims"][6]["humanTrialShowsNoEffect"] = True
        with self.assertRaisesRegex(ValueError, "CLAIM_OR_EVIDENCE_CEILING_DRIFT"):
            self.get()
        self.setUp()
        self.parent["sources"]["pubchem:44301524"]["studyPopulation"] = "n=50 people"
        with self.assertRaisesRegex(ValueError, "NONSTUDY_RECORD_FALSIFIED"):
            self.get()
        self.setUp()
        self.parent["sources"]["media:render"]["measuredHumanOutcome"] = "pain relief"
        with self.assertRaisesRegex(ValueError, "NONSTUDY_RECORD_FALSIFIED"):
            self.get()

    def test_reject_changed_claim_meaning_context_or_source(self):
        for field, bad in (
            ("supportedMeaningScope", "CLINICAL_CURE"),
            ("studyContextStatus", "CLINICALLY_VERIFIED"),
            ("sourceIds", ["pubchem:3034396"]),
            ("material", False),
        ):
            old = self.parent["claims"][6][field]
            self.parent["claims"][6][field] = bad
            with self.subTest(field=field), self.assertRaisesRegex(
                    ValueError, "CLAIM_OR_EVIDENCE_CEILING_DRIFT"):
                self.get()
            self.parent["claims"][6][field] = old

    def test_missing_source_ids_extra_source_or_release_unlock_rejected(self):
        self.parent["sources"]["pubmed:12345"] = {
            "kind": "FABRICATED_HUMAN_STUDY"}
        with self.assertRaisesRegex(ValueError,"CANONICAL_NONSTUDY"):
            self.get()
        self.setUp()
        self.parent["mayPublish"] = True
        with self.assertRaisesRegex(ValueError, "SOURCE_CONTEXT_CANNOT"):
            self.get()
        self.setUp()
        self.parent["fabricatedPubmedIds"] = [12345]
        with self.assertRaisesRegex(ValueError, "SOURCE_CONTEXT_CANNOT"):
            self.get()

    def test_invalid_or_stale_direct_parent_digest_fails(self):
        with self.assertRaisesRegex(ValueError, "EXACT_SOURCE_JOIN_SHA"):
            separate(self.parent, parent_sha="wrong")
        self.parent["humanStudyContextsMissingForOutcomeInference"] = []
        with self.assertRaisesRegex(ValueError,"SOURCE_CONTEXT_CANNOT"):
            self.get()


if __name__ == "__main__":
    unittest.main()
