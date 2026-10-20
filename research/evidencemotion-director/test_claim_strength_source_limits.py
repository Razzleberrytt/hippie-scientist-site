"""EM-007.05 source-scope check: hermetic pass and deliberate escalation HOLDs.

Uses the existing synthetic EM-007.03 fixture, not invented human studies.
Actual film proof must come from the original-WAV native workflow.
"""
import copy
import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from claim_source_context_join import join
from scientific_uncertainty_ledger import classify
from claim_strength_source_limits import (
    evaluate, main as strength_main, HUMAN_AXES, UNREPORTED, NOT_APPLICABLE,
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

    # EM-007.04 now rejects corrupted nonclinical source packs before EM-007.05.
    # Either specific fail-closed stage is correct; an accepted fake is not.
    def test_fake_human_dose_or_follow_up_in_chemical_records_is_blocked(self):
        for field,value in (("doseMg",7),("followUpDays",14),
                            ("population","human volunteers"),
                            ("effectEstimate",.54),
                            ("clinicalTrial",{"n":40})):
            self.setUp()
            self.join["sources"]["pubchem:44301524"][field]=value
            with self.subTest(field=field), self.assertRaisesRegex(
                    ValueError,"(?:INJECTED_HUMAN_STUDY_METADATA|NONCLINICAL_SOURCE_SCHEMA_OR_MEANING_DRIFT)"):
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
                    ValueError, "(?:NONCLINICAL_SOURCE_SCHEMA_DRIFT|INJECTED_HUMAN_STUDY_METADATA|NONCLINICAL_SOURCE_SCHEMA_OR_MEANING_DRIFT)"):
                self.inspect()
        self.setUp()
        # Lost scope metadata must not be mistaken for a source-backed PASS.
        self.join["sources"]["pubchem:3034396"].pop("permittedMeaning")
        with self.assertRaisesRegex(ValueError, "(?:NONCLINICAL_SOURCE_SCHEMA_DRIFT|NONCLINICAL_SOURCE_SCHEMA_OR_MEANING_DRIFT)"):
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
                    ValueError,"(?:SOURCE_MEANING_EXCEEDS_NONCLINICAL_SCOPE|NONCLINICAL_SOURCE_SCHEMA_OR_MEANING_DRIFT)"):
                self.inspect()
        self.setUp()
        self.join["sources"]["media:render"]["permittedMeaning"]=""
        with self.assertRaisesRegex(ValueError,"(?:SOURCE_MEANING_EXCEEDS_NONCLINICAL_SCOPE|NONCLINICAL_SOURCE_SCHEMA_OR_MEANING_DRIFT)"):
            self.inspect()

    def test_fake_clinical_fields_in_internal_film_are_blocked(self):
        self.join["sources"]["media:render"]["sampleSize"]=31
        with self.assertRaisesRegex(ValueError,"(?:INJECTED_HUMAN_STUDY_METADATA|NONCLINICAL_SOURCE_SCHEMA_OR_MEANING_DRIFT)"):
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

    def test_cli_rejects_output_alias_to_either_parent_without_writing(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source, uncertainty = root / "source.json", root / "uncertainty.json"
            for p in (source, uncertainty):
                p.write_text("original input bytes", encoding="utf-8")
            for output in (source, uncertainty):
                with self.subTest(output=output.name), patch.object(sys, "argv", [
                    "claim_strength_source_limits", "--source-join", str(source),
                    "--uncertainty", str(uncertainty), "--out", str(output),
                ]):
                    with self.assertRaisesRegex(ValueError, "OUTPUT_SYMLINK_OR_INPUT_ALIAS"):
                        strength_main()
            self.assertEqual(source.read_text(encoding="utf-8"), "original input bytes")
            self.assertEqual(uncertainty.read_text(encoding="utf-8"), "original input bytes")

    def test_stale_strength_report_removed_on_invalid_input(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source, uncertainty, output = (
                root / "source.json", root / "uncertainty.json", root / "report.json"
            )
            source.write_text("{}", encoding="utf-8")
            uncertainty.write_text("{}", encoding="utf-8")
            output.write_text('{"mayPublish":true}', encoding="utf-8")
            with patch.object(sys, "argv", [
                "claim_strength_source_limits", "--source-join", str(source),
                "--uncertainty", str(uncertainty), "--out", str(output),
            ]):
                with self.assertRaises(ValueError):
                    strength_main()
            self.assertFalse(output.exists())
            self.assertTrue(source.exists())
            self.assertTrue(uncertainty.exists())

    def test_successful_strength_cli_writes_exact_holds(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source, uncertainty, output = (
                root / "source.json", root / "uncertainty.json", root / "report.json"
            )
            source.write_text(json.dumps(self.join), encoding="utf-8")
            source_sha = hashlib.sha256(source.read_bytes()).hexdigest()
            expected = classify(self.join, source_sha=source_sha)
            uncertainty.write_text(json.dumps(expected), encoding="utf-8")
            with patch.object(sys, "argv", [
                "claim_strength_source_limits", "--source-join", str(source),
                "--uncertainty", str(uncertainty), "--out", str(output),
            ]):
                strength_main()
            report = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(report["sourceJoinSha256"], source_sha)
            self.assertEqual(report["materialClaimsWithSourceScopeComparison"], 6)
            self.assertFalse(report["mayPublish"])

    def test_cli_rejects_ambiguous_json_in_either_parent_and_clears_old_report(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            join_file,uncertainty_file,out=(
                root/"source.json",root/"uncertainty.json",root/"report.json"
            )
            for badfile,good in ((join_file,self.join),(uncertainty_file,self.uncertainty)):
                for typ in ("duplicate","nan","overflow"):
                    join_file.write_text(json.dumps(self.join),encoding="utf8")
                    uncertainty_file.write_text(json.dumps(self.uncertainty),encoding="utf8")
                    original=json.dumps(good)
                    payload=('{"mayPublish":false,'+original[1:]
                             if typ=="duplicate" else
                             '{"decoy":'+("NaN" if typ=="nan" else "1e999")+','+original[1:])
                    badfile.write_text(payload,encoding="utf8")
                    out.write_text('{"mayPublish":true}',encoding="utf8")
                    with self.subTest(input=badfile.name,typ=typ),patch.object(sys,"argv",[
                        "claim_strength_source_limits","--source-join",str(join_file),
                        "--uncertainty",str(uncertainty_file),"--out",str(out),
                    ]):
                        with self.assertRaisesRegex(
                            ValueError,"DUPLICATE_JSON_KEY" if typ=="duplicate" else "NONFINITE_JSON_NUMBER"
                        ):
                            strength_main()
                    self.assertFalse(out.exists())
                    self.assertEqual(badfile.read_text(encoding="utf8"),payload)

if __name__ == "__main__":
    unittest.main()
