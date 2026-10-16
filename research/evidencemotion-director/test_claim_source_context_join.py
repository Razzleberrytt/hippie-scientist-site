"""EM-007.03 tested provenance joins, not independent clinical approval."""
import copy
import json
import unittest
from pathlib import Path
from unittest.mock import patch

from autonomous_script_asr_research import WAV_SHA
from claim_source_context_join import (
    join,SCHEMA,SUPPORT,BLOCKED_HUMAN_CONTEXT,
    MITRAGYNINE,HYDROXYMITRAGYNINE)
from visual_claim_inventory import EXACT_SHOTS,SOURCE_CARD_LABELS

LEDGER=Path(__file__).with_name("EM00701-FROZEN-SPOKEN-LEDGER-20261016.json")

def visual_fixture():
    rows=[]
    for shot in EXACT_SHOTS:
        rows.append({
            "shot":shot,
            "emittedSourceAnnotations":{
                "source":list(SOURCE_CARD_LABELS) if shot=="source_hold" else []},
            "impliedEffectOrMisreadingToReview":"Not a clinical study",
            "humanInterpretationReviewed":False,
            "clinicalEffectSupportedByThisVisual":False,
        })
    return {
        "schema":"ths-em00702-exact-film-visual-claim-inventory-v1",
        "task":"EM-007.02",
        "sourceWavSha256":WAV_SHA,
        "filmSha256":"a"*64,
        "receiptSha256":"b"*64,
        "storyMapSha256":"c"*64,
        "shotsInspected":9,"sourceCaptionCuesAssigned":71,
        "scienceClaimsApproved":False,
        "impliedEffectRisksHumanReviewed":False,
        "mayPublish":False,
        "rows":rows,
    }

class ExactClaimContextTests(unittest.TestCase):
    def setUp(self):
        self.spoken=json.loads(LEDGER.read_text(encoding="utf8"))
        self.visual=visual_fixture()
    def produce(self):
        return join(self.spoken,self.visual,spoken_sha="d"*64,visual_sha="e"*64)
    def test_exact_eight_claims_six_material_not_trials(self):
        x=self.produce()
        self.assertEqual(x["schema"],SCHEMA)
        self.assertEqual(len(x["claims"]),8)
        self.assertEqual(x["materialClaimCount"],6)
        self.assertEqual(x["materialClaimsWithTypedSourceContext"],6)
        self.assertEqual(x["humanStudyContextsMissingForOutcomeInference"],["spoken-007"])
        self.assertEqual(x["claims"][6]["studyContextStatus"],BLOCKED_HUMAN_CONTEXT)
        self.assertEqual(x["claims"][6]["humanStudyId"],None)
        self.assertFalse(x["claims"][6]["clinicalEffectAbsenceProven"])
        self.assertEqual(x["claims"][-1]["sourceIds"],[])
        self.assertTrue(all(c["sourceIds"] for c in x["claims"] if c["material"]))
        self.assertFalse(x["clinicalSourceClaimsApproved"])
        self.assertTrue(x["needsIndependentScientificReview"])
        self.assertFalse(x["mayPublish"])
    def test_real_two_pubchem_identities_and_chemical_only_scope(self):
        x=self.produce()
        sources=x["sources"]
        self.assertEqual(sources["pubchem:3034396"]["cid"],3034396)
        self.assertEqual(sources["pubchem:44301524"]["cid"],44301524)
        self.assertEqual(sources["pubchem:3034396"]["inchiKey"],MITRAGYNINE.inchi_key)
        self.assertEqual(sources["pubchem:44301524"]["inchiKey"],HYDROXYMITRAGYNINE.inchi_key)
        self.assertEqual([sources[k]["measuredHumanOutcome"] for k in
                          ("pubchem:3034396","pubchem:44301524")],[None,None])
        self.assertEqual(x["claims"][4]["supportedMeaningScope"],"FILM_FOOTAGE_SCOPE_ONLY")
        self.assertFalse(any(c["sourceLinksSupportClinicalEffect"] for c in x["claims"]))
        self.assertEqual(x["fabricatedPubmedIds"],[])
    def test_malformed_original_WAV_and_verbatim_claim_rejected(self):
        self.spoken["sourceWavSha256"]="deadbeef"
        with self.assertRaisesRegex(ValueError,"EXACT_RESEARCH_INPUT_CONTRACT"):
            self.produce()
        self.setUp()
        self.spoken["assertions"][6]["text"]="no health effects exist"
        with self.assertRaisesRegex(ValueError,"ASSERTION_SPANS"):
            self.produce()
    def test_missing_duplicated_claim_or_missing_visible_risk_rejected(self):
        self.spoken["assertions"][2]["wordIndices"].append(37)
        with self.assertRaisesRegex(ValueError,"ASSERTION_SPANS"):
            self.produce()
        self.setUp()
        self.visual["rows"][3]["impliedEffectOrMisreadingToReview"]=""
        with self.assertRaisesRegex(ValueError,"VISUAL_SCOPE_OR_RISKS_REQUIRED"):
            self.produce()
    def test_swapped_cid_source_card_rejected_even_with_same_media_hash(self):
        self.visual["rows"][7]["emittedSourceAnnotations"]["source"][2]="7-OH • CID 3034396"
        with self.assertRaisesRegex(ValueError,"SOURCE_CARD_MISMATCH"):
            self.produce()
    def test_no_effect_source_inflation_or_missing_required_material_join(self):
        with patch.dict(SUPPORT,{"spoken-002":((),"CLINICAL_EFFECT_PROVEN","PAPER")},clear=False):
            with self.assertRaisesRegex(ValueError,"SOURCE_SCOPE_EXCEEDS_CHEMISTRY_OR_MEDIA"):
                self.produce()
        with patch.dict(SUPPORT,{"spoken-007":(("pubchem:44301524",),
                     "WRONGLY_PROVEN_CLINICAL_CURE","HUMAN_TRIAL")},clear=False):
            # Check that the hard-coded approved source scope is not overridden
            # by code accidentally mistaking chemical labels for trials.
            with self.assertRaisesRegex(ValueError,"SOURCE_SCOPE"):
                self.produce()
    def test_no_human_release_upgrade_from_changed_flags(self):
        self.visual["scienceClaimsApproved"]=True
        with self.assertRaisesRegex(ValueError,"EXACT_RESEARCH_INPUT_CONTRACT"):
            self.produce()
        self.setUp()
        self.visual["rows"][0]["clinicalEffectSupportedByThisVisual"]=True
        with self.assertRaisesRegex(ValueError,"VISUAL_SCOPE"):
            self.produce()

if __name__=="__main__":unittest.main()
