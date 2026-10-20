"""EM-007.08: original-claim source provenance, process attest and HOLDs."""
import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from claim_source_context_join import join
from scientific_uncertainty_ledger import classify
from claim_strength_source_limits import evaluate
from science_gate_process_attestation import (
    attest, verify_attestation, main, canonical, DOMAIN)
from test_claim_source_context_join import LEDGER, visual_fixture

def digest(data):
    return hashlib.sha256(data).hexdigest()

class ScienceGateProcessAttestationTests(unittest.TestCase):
    def setUp(self):
        spoken = json.loads(LEDGER.read_text(encoding="utf-8"))
        self.source = join(
            spoken, visual_fixture(),
            spoken_sha=digest(LEDGER.read_bytes()),
            visual_sha="d"*64)
        self.source_sha="a"*64
        self.uncertainty = classify(self.source,source_sha=self.source_sha)
        self.uncertainty_sha="b"*64
        self.strength=evaluate(
            self.source,self.uncertainty,
            source_join_sha=self.source_sha,
            uncertainty_sha=self.uncertainty_sha)
        self.strength_sha="c"*64

    def records(self):
        return {"source":self.source,"uncertainty":self.uncertainty,
                "strength":self.strength}

    def hashes(self):
        return {"source":self.source_sha,"uncertainty":self.uncertainty_sha,
                "strength":self.strength_sha}

    def inspect(self):
        return attest(self.records(),self.hashes())

    def test_all_eight_claims_keep_machine_receipt_and_open_holds(self):
        result=self.inspect()
        self.assertTrue(verify_attestation(result))
        self.assertEqual(result["claimsReconciled"],8)
        self.assertEqual(result["materialClaimsReconciled"],6)
        self.assertEqual(len(result["claims"]),8)
        self.assertEqual(
            [x["claimId"] for x in result["claims"]],
            [f"spoken-{n:03d}" for n in range(1,9)])
        self.assertTrue(all(x["unresolvedHoldReasons"] for x in result["claims"]))
        self.assertTrue(all(x["qualifiedIndependentScienceVerdict"]=="NOT_RECEIVED"
                            for x in result["claims"]))
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["approvalToMerge"])
        self.assertFalse(result["independentScientificReviewPassed"])
        self.assertFalse(result["voiceArtHandsetAndAudienceGatesPassed"])
        self.assertTrue(result["processAttestation"]["notHumanSigned"])
        self.assertEqual(result["processAttestation"]["domainSeparatedDigest"],
                         digest(DOMAIN+canonical(
                             {k:v for k,v in result.items()
                              if k!="processAttestation"})))

    def test_clinical_upgrades_in_any_parent_cannot_issue_attestation(self):
        for mutation in (
            lambda: self.source["claims"][6].update(
                {"clinicalEffectAbsenceProven":True}),
            lambda: self.uncertainty.update({"externalHumanOutcomeSearchPerformed":True}),
            lambda: self.strength.update({"clinicalStrengthClaimsApproved":True}),
        ):
            self.setUp()
            mutation()
            with self.assertRaises((ValueError,KeyError)):
                self.inspect()

    def test_missing_or_reordered_claims_refused(self):
        self.strength["claims"].pop()
        with self.assertRaisesRegex(ValueError, "STRENGTH_IS_NOT_RECOMPUTED"):
            self.inspect()
        self.setUp()
        self.source["claims"][2],self.source["claims"][3]=(
            self.source["claims"][3],self.source["claims"][2])
        with self.assertRaises((ValueError,KeyError)):
            self.inspect()

    def test_wrong_parent_sha_or_stale_uncertainty_fails(self):
        self.uncertainty_sha="garbled"
        with self.assertRaisesRegex(ValueError,"EXACT_THREE_PARENT"):
            self.inspect()
        self.setUp()
        self.uncertainty["sourceJoinSha256"]="f"*64
        with self.assertRaisesRegex(ValueError,"UNCERTAINTY_IS_NOT_RECOMPUTED"):
            self.inspect()

    def test_process_digest_detects_changed_hold_or_film(self):
        valid=self.inspect()
        modified=copy.deepcopy(valid)
        modified["claims"][6]["unresolvedHoldReasons"].clear()
        with self.assertRaisesRegex(ValueError, "SOURCE_OR_HOLD_RESULT_TAMPERED"):
            verify_attestation(modified)
        modified=copy.deepcopy(valid)
        modified["filmSha256"]="f"*64
        with self.assertRaisesRegex(ValueError, "SOURCE_OR_HOLD_RESULT_TAMPERED"):
            verify_attestation(modified)

    def test_rehashed_process_report_still_cannot_self_approve(self):
        valid=self.inspect()
        payload={k:v for k,v in valid.items() if k!="processAttestation"}
        payload["mayPublish"]=True
        payload["approvalToMerge"]=True
        record=copy.deepcopy(valid["processAttestation"])
        record["canonicalPayloadSha256"]=digest(canonical(payload))
        record["domainSeparatedDigest"]=digest(DOMAIN+canonical(payload))
        payload["processAttestation"]=record
        with self.assertRaisesRegex(ValueError,"SCIENCE_GATE_CANNOT_SELF_AUTHORIZE_RELEASE"):
            verify_attestation(payload)

    def test_rehashed_claim_id_missing_reviewer_hold_or_extra_scope_refused(self):
        for change in (
            lambda report: report["claims"][2].update({"claimId":"spoken-007"}),
            lambda report: report["claims"][6].update({"unresolvedHoldReasons":[
                "NO_INDEPENDENT_QUALIFIED_SCIENTIFIC_REVIEW_FOR_EXACT_ASSET"]}),
            lambda report: report["claims"][5].update({"sourceScope":"HUMAN_TRIAL_PROVEN"}),
            lambda report: report.update({"independentReviewerReceiptPresent":True}),
            lambda report: report.update({"claimsReconciled":9}),
        ):
            candidate=self.inspect()
            change(candidate)
            payload={k:v for k,v in candidate.items() if k!="processAttestation"}
            candidate["processAttestation"]["canonicalPayloadSha256"]=digest(canonical(payload))
            candidate["processAttestation"]["domainSeparatedDigest"]=digest(
                DOMAIN+canonical(payload))
            with self.subTest(mutation=change.__code__.co_firstlineno):
                with self.assertRaisesRegex(ValueError,
                    "CLAIM_ID_SCOPE_OR_HOLDS_REHASHED|SCIENCE_GATE_CANNOT_SELF_AUTHORIZE_RELEASE"):
                    verify_attestation(candidate)

    def test_actual_cli_writes_three_real_parent_sha_receipts_and_holds(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            source=root/"source.json"
            uncertainty=root/"uncertainty.json"
            strength=root/"strength.json"
            out=root/"gate.json"
            source.write_text(json.dumps(self.source)+"\n",encoding="utf-8")
            sha_source=digest(source.read_bytes())
            u=classify(self.source,source_sha=sha_source)
            uncertainty.write_text(json.dumps(u)+"\n",encoding="utf-8")
            sha_uncertainty=digest(uncertainty.read_bytes())
            result=evaluate(self.source,u,source_join_sha=sha_source,
                            uncertainty_sha=sha_uncertainty)
            strength.write_text(json.dumps(result)+"\n",encoding="utf-8")
            argv=["science_gate_process_attestation.py",
                  "--source",str(source),"--uncertainty",str(uncertainty),
                  "--strength",str(strength),"--out",str(out)]
            with patch("sys.argv",argv):
                main()
            report=json.loads(out.read_text())
            self.assertTrue(verify_attestation(report))
            self.assertEqual(report["sourceJoinSha256"],sha_source)
            self.assertEqual(report["claimStrengthReportSha256"],
                             digest(strength.read_bytes()))
            self.assertFalse(report["mayPublish"])

    def test_duplicate_source_key_and_alias_path_are_rejected(self):
        from science_gate_process_attestation import strict_json
        with self.assertRaisesRegex(ValueError,"DUPLICATED_JSON_KEY"):
            strict_json(b'{"mayPublish":false,"mayPublish":true}')
        with tempfile.TemporaryDirectory() as tmp:
            source=Path(tmp)/"parent.json"
            source.write_text("{}",encoding="utf-8")
            argv=["science_gate_process_attestation.py",
                  "--source",str(source),"--uncertainty",str(source),
                  "--strength",str(source),"--out",str(Path(tmp)/"out.json")]
            with patch("sys.argv",argv),self.assertRaisesRegex(
                    ValueError,"INPUT_OUTPUT_PATH_ALIAS"):
                main()


    def test_failed_second_cli_run_removes_stale_science_receipt(self):
        # A previous report must not survive a subsequently failed source run.
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            source=root/"source.json"
            uncertainty=root/"uncertainty.json"
            strength=root/"strength.json"
            out=root/"science-gate.json"
            source.write_text('{"mayPublish":false,"mayPublish":true}',encoding="utf-8")
            uncertainty.write_text("{}",encoding="utf-8")
            strength.write_text("{}",encoding="utf-8")
            out.write_text(json.dumps(self.inspect())+"\n",encoding="utf-8")
            argv=["science_gate_process_attestation.py",
                  "--source",str(source),"--uncertainty",str(uncertainty),
                  "--strength",str(strength),"--out",str(out)]
            with patch("sys.argv",argv), self.assertRaisesRegex(
                    ValueError, "DUPLICATED_JSON_KEY"):
                main()
            self.assertFalse(out.exists(), "stale science receipt survived failure")

    def test_output_symlink_fails_before_mutating_source(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            source=root/"source.json"
            source.write_text('{"source":"immutable"}',encoding="utf-8")
            output=root/"science-gate.json"
            output.symlink_to(source)
            argv=["science_gate_process_attestation.py",
                  "--source",str(source),"--uncertainty",str(root/"u.json"),
                  "--strength",str(root/"s.json"),"--out",str(output)]
            with patch("sys.argv",argv),self.assertRaisesRegex(
                    ValueError, "INPUT_OUTPUT_PATH_ALIAS|SYMLINK_REPORT_DESTINATION"):
                main()
            self.assertEqual(source.read_text(encoding="utf-8"),
                             '{"source":"immutable"}')
            self.assertTrue(output.is_symlink())

    def test_failed_atomic_rename_leaves_no_report_or_temp(self):
        from science_gate_process_attestation import (
            prepare_report_destination,write_report_atomically)
        with tempfile.TemporaryDirectory() as tmp:
            out=Path(tmp)/"science-gate.json"
            out.write_text(json.dumps(self.inspect()),encoding="utf-8")
            prepare_report_destination(out)
            with patch("science_gate_process_attestation.os.replace",
                       side_effect=OSError("injected rename failure")):
                with self.assertRaises(OSError):
                    write_report_atomically(out,self.inspect())
            self.assertFalse(out.exists())
            self.assertEqual(list(Path(tmp).glob(".science-gate.json.*.tmp")),[])

if __name__ == "__main__":
    unittest.main()
