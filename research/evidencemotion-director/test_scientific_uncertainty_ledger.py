"""EM-007.04 hermetic negative tests; never evidence of clinical review."""
import copy
import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from autonomous_script_asr_research import WAV_SHA
from scientific_uncertainty_ledger import (
    classify, main as uncertainty_main, NULL_STATUS, CONFLICT_STATUS, HUMAN_STATUS,
    SOURCE_CONTEXT, SOURCE_IDS, SOURCE_SCOPES, KINDS,
    FROZEN_SPOKEN_LEDGER, frozen_claim_spans,
)

H = lambda letter: letter * 64

def fixture():
    chemical=lambda cid: {
        "kind":"PRIMARY_CHEMICAL_RECORD","cid":cid,
        "url":f"https://pubchem.ncbi.nlm.nih.gov/compound/{cid}",
        "inchiKey":("LELBFTMXCIIKKX-QVRQZEMUSA-N" if cid == 3034396
                    else "RYENLSMHLCNXJT-CYXFISRXSA-N"),
        "recordType":"COMPUTED_STRUCTURE_DESCRIPTOR",
        "formula":("C23H30N2O4" if cid == 3034396 else "C23H30N2O5"),
        "studyPopulation":None,
        "measuredHumanOutcome":None,
        "permittedMeaning":("mitragynine chemical identity/connectivity only"
            if cid == 3034396 else
            "7-hydroxymitragynine identity, O-H, connectivity only"),
    }
    return {
        "schema":"ths-em00703-source-context-join-v1","task":"EM-007.03",
        "sourceWavSha256":WAV_SHA,
        "spokenLedgerSha256":hashlib.sha256(FROZEN_SPOKEN_LEDGER.read_bytes()).hexdigest(),
        "visualInventorySha256":H("b"),"filmSha256":H("c"),
        "materialClaimCount":6,"materialClaimsWithTypedSourceContext":6,
        "humanStudyContextsMissingForOutcomeInference":["spoken-007"],
        "fabricatedPubmedIds":[],"clinicalSourceClaimsApproved":False,
        "needsIndependentScientificReview":True,"mayPublish":False,
        "sources":{
            "pubchem:3034396":chemical(3034396),
            "pubchem:44301524":chemical(44301524),
            "media:render":{"kind":"SOURCE_FILM_ATTESTATION",
                "artifactSha256":H("c"),"renderReceiptSha256":H("f"),
                "url":None, "studyPopulation":None,
                "measuredHumanOutcome":None,
                "permittedMeaning":"film is computed structure artwork, not receptor footage"},
            "media:story":{"kind":"SOURCE_SHOT_STORY_MAP",
                "storyMapSha256":H("d"),"url":None,
                "studyPopulation":None, "measuredHumanOutcome":None,
                "permittedMeaning":"source-locked shot annotations and limits only"},
        },
        "claims":[{
            "claimId":f"spoken-{i+1:03d}","claimType":KINDS[i],
            "verbatimFrozenTokens":frozen_claim_spans()[i][1],
            "studyContextStatus":SOURCE_CONTEXT[i],
            "supportedMeaningScope":SOURCE_SCOPES[i],
            "wordIndices":frozen_claim_spans()[i][0],
            "shotIds":["synthetic-shot-test"],
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

    def test_claim_scope_cannot_be_promoted_by_rehash_or_extra_key(self):
        self.join["claims"][6]["supportedMeaningScope"]="CLINICAL_EFFECT_PROVEN"
        with self.assertRaisesRegex(ValueError,"CONFLATION"):
            self.inspect()
        self.join=fixture()
        self.join["claims"][6]["humanTrialShowsNoEffect"]=True
        with self.assertRaisesRegex(ValueError,"CONFLATION"):
            self.inspect()

    def test_frozen_spoken_claim_text_and_span_cannot_be_changed_by_rehash(self):
        self.join["claims"][6]["verbatimFrozenTokens"]="not that any effects exist"
        with self.assertRaisesRegex(ValueError,"CONFLATION"):
            self.inspect()
        self.join=fixture()
        self.join["claims"][6]["wordIndices"]=[58,59,60,61,62,63]
        with self.assertRaisesRegex(ValueError,"CONFLATION"):
            self.inspect()
        self.join=fixture()
        self.join["spokenLedgerSha256"]=H("a")
        with self.assertRaisesRegex(ValueError,"SOURCE_JOIN_IDENTITY"):
            self.inspect()

    def test_rehashed_wrong_formula_or_inchikey_cannot_pass_source_identity(self):
        # Preserve correct CID/URL and rehashable JSON while corrupting its
        # structural descriptor: first-stage uncertainty audit must HOLD.
        for sid, field, corrupted in (
            ("pubchem:3034396", "formula", "C23H30N2O5"),
            ("pubchem:44301524", "formula", "C23H30N2O4"),
            ("pubchem:3034396", "inchiKey", "RYENLSMHLCNXJT-CYXFISRXSA-N"),
            ("pubchem:44301524", "inchiKey", "LELBFTMXCIIKKX-QVRQZEMUSA-N"),
        ):
            self.join = fixture()
            self.join["sources"][sid][field] = corrupted
            with self.subTest(source=sid, field=field), self.assertRaisesRegex(
                    ValueError, "CHEMICAL_RECORD_CANNOT_BECOME_HUMAN_STUDY"):
                self.inspect()

    def test_swapped_source_cids_are_not_film_evidence(self):
        self.join["sources"]["pubchem:44301524"]["cid"]=3034396
        with self.assertRaisesRegex(ValueError,"CHEMICAL_RECORD"):
            self.inspect()
        self.join=fixture()
        self.join["sources"]["pubchem:3034396"]["measuredHumanOutcome"]="proven cure"
        with self.assertRaisesRegex(ValueError,"CHEMICAL_RECORD"):
            self.inspect()

    def test_extra_clinical_and_unknown_fields_rejected_at_first_report(self):
        # EM-007.04, not just downstream EM-007.05, must fail closed.
        for sid, field, value in (
            ("pubchem:44301524", "humanEffectiveDoseMg", 15),
            ("pubchem:3034396", "clinicalTrial", {"n": 40}),
            ("media:render", "receptorBindingObserved", True),
            ("media:story", "unknownConfidence", 1.0),
        ):
            self.join=fixture()
            self.join["sources"][sid][field]=value
            with self.subTest(source=sid,field=field), self.assertRaisesRegex(
                    ValueError,"NONCLINICAL_SOURCE_SCHEMA_OR_MEANING_DRIFT"):
                self.inspect()

    def test_rehashed_source_meaning_and_missing_fields_rejected(self):
        for sid, claim in (
            ("pubchem:3034396","human clinical efficacy proven"),
            ("pubchem:44301524","7-OH safe for human dosing"),
            ("media:render","actual filmed receptor binding"),
            ("media:story","clinical outcome explained"),
        ):
            self.join=fixture()
            self.join["sources"][sid]["permittedMeaning"]=claim
            with self.subTest(source=sid), self.assertRaisesRegex(
                    ValueError,"NONCLINICAL_SOURCE_SCHEMA_OR_MEANING_DRIFT"):
                self.inspect()
        self.join=fixture()
        del self.join["sources"]["media:render"]["renderReceiptSha256"]
        with self.assertRaisesRegex(ValueError,"NONCLINICAL_SOURCE_SCHEMA_OR_MEANING_DRIFT"):
            self.inspect()
        self.join=fixture()
        self.join["sources"]["media:render"]["url"]="https://example.test/fake-study"
        with self.assertRaisesRegex(ValueError,"COMPUTED_MEDIA_CANNOT_POSE_AS_EXTERNAL_STUDY"):
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

    def test_output_reuse_and_symlink_never_overwrite_source(self):
        # The command-line path guard must run before parsing any source JSON.
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / "source.json"
            source.write_text("original source bytes", encoding="utf-8")
            with patch.object(sys, "argv", [
                "scientific_uncertainty_ledger", "--source-join", str(source),
                "--out", str(source),
            ]):
                with self.assertRaisesRegex(ValueError, "OUTPUT_SYMLINK_OR_INPUT_ALIAS"):
                    uncertainty_main()
            self.assertEqual(source.read_text(encoding="utf-8"), "original source bytes")
            link = root / "linked-output.json"
            try:
                link.symlink_to(source)
            except (OSError, NotImplementedError):
                self.skipTest("symlinks not supported in test environment")
            with patch.object(sys, "argv", [
                "scientific_uncertainty_ledger", "--source-join", str(source),
                "--out", str(link),
            ]):
                with self.assertRaisesRegex(ValueError, "OUTPUT_SYMLINK_OR_INPUT_ALIAS"):
                    uncertainty_main()
            self.assertEqual(source.read_text(encoding="utf-8"), "original source bytes")

    def test_invalid_replay_removes_stale_uncertainty_report(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source, output = root / "bad-source.json", root / "report.json"
            source.write_text("{}", encoding="utf-8")
            output.write_text('{"mayPublish":true}', encoding="utf-8")
            with patch.object(sys, "argv", [
                "scientific_uncertainty_ledger", "--source-join", str(source),
                "--out", str(output),
            ]):
                with self.assertRaises(ValueError):
                    uncertainty_main()
            self.assertFalse(output.exists())
            self.assertTrue(source.exists())

    def test_successful_uncertainty_cli_writes_hash_bound_atomic_hold(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source, output = root / "source.json", root / "report.json"
            source.write_text(json.dumps(fixture()), encoding="utf-8")
            with patch.object(sys, "argv", [
                "scientific_uncertainty_ledger", "--source-join", str(source),
                "--out", str(output),
            ]):
                uncertainty_main()
            report = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(report["sourceJoinSha256"], hashlib.sha256(source.read_bytes()).hexdigest())
            self.assertFalse(report["mayPublish"])
            self.assertEqual(report["totalClaims"], 8)

    def test_cli_ambiguous_or_nonfinite_input_is_hold_without_stale_report(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            source,out=root/"source.json",root/"report.json"
            standard=json.dumps(fixture())
            attacks=(
                ('{"mayPublish":false,'+standard[1:],"DUPLICATE_JSON_KEY"),
                ('{"decoy":NaN,'+standard[1:],"NONFINITE_JSON_NUMBER"),
                ('{"decoy":1e999,'+standard[1:],"NONFINITE_JSON_NUMBER"),
            )
            for payload,reason in attacks:
                source.write_text(payload,encoding="utf8")
                out.write_text('{"mayPublish":true}',encoding="utf8")
                with self.subTest(reason=reason),patch.object(sys,"argv",[
                    "scientific_uncertainty_ledger","--source-join",str(source),"--out",str(out),
                ]):
                    with self.assertRaisesRegex(ValueError,reason):
                        uncertainty_main()
                self.assertFalse(out.exists())
                self.assertEqual(source.read_text(encoding="utf8"),payload)

if __name__ == "__main__":
    unittest.main()
