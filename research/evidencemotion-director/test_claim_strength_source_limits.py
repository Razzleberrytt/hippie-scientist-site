"""EM-007.05 source-scope check: hermetic pass and deliberate escalation HOLDs.

Uses the existing synthetic EM-007.03 fixture, not invented human studies.
Actual film proof must come from the original-WAV native workflow.
"""
import copy
import hashlib
import json
import unittest

from claim_source_context_join import join
from scientific_uncertainty_ledger import classify
from claim_strength_source_limits import (
    evaluate, HUMAN_AXES, UNREPORTED, NOT_APPLICABLE,
)
from test_claim_source_context_join import LEDGER, visual_fixture


class ClaimStrengthSourceLimitsTests(unittest.TestCase):
    def setUp(self):
        spoken = json.loads(LEDGER.read_text(encoding="utf-8"))
        self.join = join(spoken, visual_fixture(),
                         spoken_sha=hashlib.sha256(LEDGER.read_bytes()).hexdigest(),
                         visual_sha="b"*64)
        self.join_sha = "a"*64
        self.uncertainty = classify(self.join, source_sha=self.join_sha)
        self.uncertainty_sha = "c"*64

    def inspect(self):
        return evaluate(self.join, self.uncertainty,
                        source_join_sha=self.join_sha,
                        uncertainty_sha=self.uncertainty_sha)

    def test_exact_eight_spans_have_five_typed_study_axes_and_no_clinical_pass(self):
        result = self.inspect()
        self.assertEqual((result["spokenClaimsAssessed"],
                          result["materialClaimsWithSourceScopeComparison"]), (8, 6))
        self.assertEqual(len(result["claims"]), 8)
        self.assertEqual(result["sourceJoinSha256"], self.join_sha)
        self.assertEqual(result["uncertaintyLedgerSha256"], self.uncertainty_sha)
        for i, row in enumerate(result["claims"]):
            self.assertEqual(row["claimId"],f"spoken-{i+1:03d}")
            self.assertEqual(tuple(row["populationOutcomeDoseTimingFollowUp"]), HUMAN_AXES)
            self.assertEqual(row["spokenStrengthScope"],
                             row["strongestAvailableSourceScope"])
            self.assertFalse(row["sourceSupportsEffectsOrAbsence"])
            self.assertFalse(row["independentScienceApproval"])
            if 1 <= i <= 6:
                self.assertTrue(all(v == UNREPORTED
                                    for v in row["populationOutcomeDoseTimingFollowUp"].values()))
                self.assertIn("HOLD_NO_HUMAN", row["clinicalEffectStrengthComparison"])
            else:
                self.assertTrue(all(v == NOT_APPLICABLE
                                    for v in row["populationOutcomeDoseTimingFollowUp"].values()))
        self.assertFalse(result["humanStudyComparisonPossible"])
        self.assertFalse(result["clinicalStrengthClaimsApproved"])
        self.assertFalse(result["externalPopulationOutcomeDoseTimingSearchPerformed"])
        self.assertFalse(result["mayPublish"])

    def test_fake_human_dose_or_follow_up_in_chemical_records_is_blocked(self):
        for field,value in (("doseMg",7),("followUpDays",14),
                            ("population","human volunteers"),
                            ("effectEstimate",.54),
                            ("clinicalTrial",{"n":40})):
            self.setUp()
            self.join["sources"]["pubchem:44301524"][field]=value
            with self.subTest(field=field), self.assertRaisesRegex(
                    ValueError,"INJECTED_HUMAN_STUDY_METADATA"):
                self.inspect()

    def test_nonclinical_source_record_schema_refuses_unknown_efficacy_fields(self):
        # Keyword denylist alone previously missed these plausible payloads.
        for source, key, value in (
            ("pubchem:44301524", "effectiveDoseMg", 20),
            ("media:render", "reportedEfficacy", 0.95),
            ("media:story", "clinicalConfidence", "high"),
        ):
            self.setUp()
            self.join["sources"][source][key] = value
            with self.subTest(source=source, key=key), self.assertRaisesRegex(
                    ValueError, "NONCLINICAL_SOURCE_SCHEMA_DRIFT|INJECTED_HUMAN_STUDY_METADATA"):
                self.inspect()
        self.setUp()
        # Lost scope metadata must not be mistaken for a source-backed PASS.
        self.join["sources"]["pubchem:3034396"].pop("permittedMeaning")
        with self.assertRaisesRegex(ValueError, "NONCLINICAL_SOURCE_SCHEMA_DRIFT"):
            self.inspect()

    def test_rehashed_source_record_cannot_inflate_the_meaning_of_evidence(self):
        # These attacks change no keys, source IDs or output parent SHA shape.
        # A structure database cannot suddenly justify human-effect claims,
        # and computed images cannot become direct receptor observations.
        attacks=(
            ("pubchem:3034396","human analgesic efficacy proven in trial"),
            ("pubchem:44301524","human withdrawal outcome verified"),
            ("media:render","real molecular receptor-binding footage"),
            ("media:story","all biological effects established"),
        )
        for sid, promoted in attacks:
            self.setUp()
            self.join["sources"][sid]["permittedMeaning"]=promoted
            with self.subTest(sid=sid), self.assertRaisesRegex(
                    ValueError,"SOURCE_MEANING_EXCEEDS_NONCLINICAL_SCOPE"):
                self.inspect()
        self.setUp()
        self.join["sources"]["media:render"]["permittedMeaning"]=""
        with self.assertRaisesRegex(ValueError,"SOURCE_MEANING_EXCEEDS_NONCLINICAL_SCOPE"):
            self.inspect()

    def test_fake_clinical_fields_in_internal_film_are_blocked(self):
        self.join["sources"]["media:render"]["sampleSize"]=31
        with self.assertRaisesRegex(ValueError,"INJECTED_HUMAN_STUDY_METADATA"):
            self.inspect()

    def test_modified_uncertainty_receipt_cannot_self_certify_a_human_study(self):
        self.uncertainty["claims"][6]["nullFinding"]="NO_EFFECT_IN_HUMANS"
        with self.assertRaisesRegex(ValueError,"UNCERTAINTY_REPORT_OR_SOURCE_JOIN_DRIFT"):
            self.inspect()
        self.setUp()
        self.uncertainty["claims"][6]["humanOutcomeEvidence"]="STUDY_COMPLETE"
        with self.assertRaisesRegex(ValueError,"UNCERTAINTY_REPORT_OR_SOURCE_JOIN_DRIFT"):
            self.inspect()
        self.setUp()
        self.uncertainty["externalHumanOutcomeSearchPerformed"]=True
        with self.assertRaisesRegex(ValueError,"UNCERTAINTY_REPORT_OR_SOURCE_JOIN_DRIFT"):
            self.inspect()

    def test_source_scope_or_claim_strength_upgrade_never_passes(self):
        self.join["claims"][6]["supportedMeaningScope"]="CONTROLLED_TRIAL_CURE"
        with self.assertRaisesRegex(ValueError,"CONFLATION"):
            self.inspect()
        self.setUp()
        self.join["claims"][3]["sourceLinksSupportClinicalEffect"]=True
        with self.assertRaisesRegex(ValueError,"CONFLATION"):
            self.inspect()

    def test_tampered_source_context_but_unchanged_uncertainty_is_hold(self):
        self.join["sources"]["pubchem:3034396"]["studyPopulation"]="patients"
        with self.assertRaisesRegex(ValueError,"CHEMICAL_RECORD"):
            self.inspect()
        self.setUp()
        self.join["humanStudyContextsMissingForOutcomeInference"]=[]
        with self.assertRaisesRegex(ValueError,"SOURCE_JOIN_IDENTITY"):
            self.inspect()

    def test_missing_input_hash_or_source_is_hold(self):
        with self.assertRaisesRegex(ValueError,"BOTH_EXACT_PARENT_DIGESTS_REQUIRED"):
            evaluate(self.join,self.uncertainty,source_join_sha="broken",
                     uncertainty_sha=self.uncertainty_sha)
        self.join["sources"].pop("media:render")
        with self.assertRaisesRegex(ValueError,"EXACT_SOURCE_PACK"):
            self.inspect()

    def test_wrong_source_id_and_reordered_claims_fail_closed(self):
        self.join["claims"][1]["sourceIds"]=["pubchem:44301524"]
        with self.assertRaisesRegex(ValueError,"CONFLATION"):
            self.inspect()
        self.setUp()
        self.join["claims"][4],self.join["claims"][5]=(
            self.join["claims"][5],self.join["claims"][4])
        with self.assertRaisesRegex(ValueError,"CONFLATION"):
            self.inspect()

if __name__ == "__main__":
    unittest.main()
