"""EM-007.04 hermetic negative tests; never evidence of clinical review."""
import copy
import unittest

from autonomous_script_asr_research import WAV_SHA
from scientific_uncertainty_ledger import (
    classify, NULL_STATUS, CONFLICT_STATUS, HUMAN_STATUS,
    SOURCE_CONTEXT, SOURCE_IDS, KINDS,
)

H = lambda letter: letter * 64

def fixture():
    chemical=lambda cid: {
        "kind":"PRIMARY_CHEMICAL_RECORD","cid":cid,
        "url":f"https://pubchem.ncbi.nlm.nih.gov/compound/{cid}",
        "inchiKey":"CHEMISTRY-SOURCE-TEST-ONLY",
        "recordType":"COMPUTED_STRUCTURE_DESCRIPTOR",
        "studyPopulation":None,"measuredHumanOutcome":None,
    }
    return {
        "schema":"ths-em00703-source-context-join-v1","task":"EM-007.03",
        "sourceWavSha256":WAV_SHA,"spokenLedgerSha256":H("a"),
        "visualInventorySha256":H("b"),"filmSha256":H("c"),
        "materialClaimCount":6,"materialClaimsWithTypedSourceContext":6,
        "humanStudyContextsMissingForOutcomeInference":["spoken-007"],
        "fabricatedPubmedIds":[],"clinicalSourceClaimsApproved":False,
        "needsIndependentScientificReview":True,"mayPublish":False,
        "sources":{
            "pubchem:3034396":chemical(3034396),
            "pubchem:44301524":chemical(44301524),
            "media:render":{"kind":"SOURCE_FILM_ATTESTATION",
                "artifactSha256":H("c"),"studyPopulation":None,
                "measuredHumanOutcome":None},
            "media:story":{"kind":"SOURCE_SHOT_STORY_MAP",
                "storyMapSha256":H("d"),"studyPopulation":None,
                "measuredHumanOutcome":None},
        },
        "claims":[{
            "claimId":f"spoken-{i+1:03d}","claimType":KINDS[i],
            "verbatimFrozenTokens":f"test tokens {i}",
            "studyContextStatus":SOURCE_CONTEXT[i],
            "material":1<=i<=6,
            "sourceIds":list(SOURCE_IDS[i]),
            "humanStudyId":None,
            "sourceLinksSupportClinicalEffect":False,
            "clinicalEffectAbsenceProven":False,
            "qualifiedIndependentScientificReview":False,
            "sourceContextMachineJoined":True,
        } for i in range(8)],
    }

class UncertaintyLedgerContracts(unittest.TestCase):
    def setUp(self):
        self.join=fixture()

    def inspect(self):
        return classify(self.join, source_sha=H("e"))

    def test_eight_claims_keep_null_conflict_and_missing_study_separate(self):
        result=self.inspect()
        self.assertEqual((result["totalClaims"],result["materialClaims"]),(8,6))
        self.assertEqual(result["schema"],"ths-em00704-frozen-claim-uncertainty-v1")
        self.assertEqual(len(result["claims"]),8)
        self.assertEqual(result["claims"][6]["humanOutcomeEvidence"],HUMAN_STATUS)
        for claim in result["claims"]:
            self.assertEqual(claim["nullFinding"],NULL_STATUS)
            self.assertEqual(claim["conflictingFindings"],CONFLICT_STATUS)
            self.assertTrue(claim["missingStudyDoesNotImplyNullEffect"])
            self.assertFalse(claim["clinicalEffectOrAbsenceProven"])
            self.assertFalse(claim["externalLiteratureReviewed"])
        self.assertFalse(result["nullFindingsEvaluated"])
        self.assertFalse(result["conflictingStudiesEvaluated"])
        self.assertFalse(result["noHumanStudiesExistProven"])
        self.assertFalse(result["mechanismClinicallyValidated"])
        self.assertFalse(result["mayPublish"])

    def test_fabricated_human_trial_or_negative_effect_claim_is_rejected(self):
        for key,value in (("humanStudyId","PMID:12345678"),
                          ("sourceLinksSupportClinicalEffect",True),
                          ("clinicalEffectAbsenceProven",True),
                          ("qualifiedIndependentScientificReview",True)):
            self.join=fixture()
            self.join["claims"][6][key]=value
            with self.subTest(key=key),self.assertRaisesRegex(ValueError,"CONFLATION"):
                self.inspect()

    def test_wrong_source_id_or_misclassified_context_fails(self):
        self.join["claims"][6]["sourceIds"]=["pubchem:3034396"]
        with self.assertRaisesRegex(ValueError,"CONFLATION"):
            self.inspect()
        self.join=fixture()
        self.join["claims"][6]["studyContextStatus"]="CLINICAL_TRIAL_CONFIRMED"
        with self.assertRaisesRegex(ValueError,"CONFLATION"):
            self.inspect()

    def test_swapped_source_cids_are_not_film_evidence(self):
        self.join["sources"]["pubchem:44301524"]["cid"]=3034396
        with self.assertRaisesRegex(ValueError,"CHEMICAL_RECORD"):
            self.inspect()
        self.join=fixture()
        self.join["sources"]["pubchem:3034396"]["measuredHumanOutcome"]="proven cure"
        with self.assertRaisesRegex(ValueError,"CHEMICAL_RECORD"):
            self.inspect()

    def test_false_release_or_fabricated_pubmed_is_hold(self):
        self.join["mayPublish"]=True
        with self.assertRaisesRegex(ValueError,"SOURCE_JOIN_IDENTITY"):
            self.inspect()
        self.join=fixture()
        self.join["fabricatedPubmedIds"]=["12345678"]
        with self.assertRaisesRegex(ValueError,"SOURCE_JOIN_IDENTITY"):
            self.inspect()

    def test_missing_or_duplicate_claims_never_pass(self):
        self.join["claims"].pop()
        with self.assertRaisesRegex(ValueError,"EIGHT_EXACT"):
            self.inspect()
        self.join=fixture()
        self.join["claims"][4]=copy.deepcopy(self.join["claims"][3])
        with self.assertRaisesRegex(ValueError,"CONFLATION"):
            self.inspect()

    def test_missing_asset_identity_cannot_be_reported_as_evaluated(self):
        self.join["sources"]["media:render"]["artifactSha256"]=H("f")
        with self.assertRaisesRegex(ValueError,"COMPUTED_MEDIA"):
            self.inspect()
        self.join=fixture()
        self.join["spokenLedgerSha256"]="bad"
        with self.assertRaisesRegex(ValueError,"SOURCE_JOIN_IDENTITY"):
            self.inspect()

if __name__ == "__main__":
    unittest.main()
