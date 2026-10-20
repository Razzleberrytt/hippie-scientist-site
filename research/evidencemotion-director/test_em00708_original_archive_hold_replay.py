"""Original real-film EM-007.08 replay, independent of broken new native runs.

Requires prior pinned GitHub artifact bytes, never synthetic stand-in media.
"""
import copy
import os
import unittest
from pathlib import Path
from unittest.mock import patch

from em00708_original_archive_hold_replay import replay, main, GATE
from em00705_original_archive_replay import EXPECTED, FILM, SOURCE, UNCERTAINTY
from science_gate_process_attestation import attest, verify_attestation, canonical, DOMAIN
from claim_strength_source_limits import evaluate
from scientific_uncertainty_ledger import classify
from hashlib import sha256


class RealSourceScienceHoldReplayTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        root=os.environ.get("THS_EM00705_ARCHIVE_ROOT")
        if not root:
            raise RuntimeError("Original GitHub archive required; no synthetic film substitution")
        cls.root=Path(root)
        cls.real={k:(cls.root/k).read_bytes() for k in EXPECTED}

    def test_actual_movie_withholds_all_eight_claim_release_gates(self):
        report=replay(self.real)
        self.assertEqual(report["frozenClaimCount"],8)
        self.assertEqual(report["materialClaimCount"],6)
        self.assertEqual(report["materialHumanStudyAxesUnreported"],30)
        self.assertTrue(report["actualArchivedFilmRehashed"])
        self.assertEqual(report["scienceGate"],GATE)
        self.assertFalse(report["independentQualifiedReviewerApproved"])
        self.assertFalse(report["externalClinicalLiteratureReviewed"])
        self.assertFalse(report["nativeCurrentHeadExecutionOrReleaseCertified"])
        self.assertFalse(report["mayPublish"])

    def test_actual_movie_byte_mutation_blocks_reused_process_proof(self):
        altered=dict(self.real)
        altered[FILM] += b"altered"
        with self.assertRaisesRegex(ValueError,"PINNED_ARCHIVE_BYTES_MISMATCH"):
            replay(altered)

    def test_changed_or_swapped_source_json_refuses_reuse(self):
        for path in (SOURCE,UNCERTAINTY):
            altered=dict(self.real)
            altered[path] = b" " + altered[path]
            with self.subTest(path=path),self.assertRaisesRegex(
                    ValueError,"PINNED_ARCHIVE_BYTES_MISMATCH"):
                replay(altered)

    def test_extra_fabricated_study_cannot_enter_source_pack(self):
        altered=dict(self.real)
        altered["fake-human-trial.json"]=b'{"positiveTrial":true}'
        with self.assertRaisesRegex(ValueError,"THREE_ORIGINAL_ARCHIVED_FILES_REQUIRED"):
            replay(altered)

    def test_missing_exact_source_file_is_blocked(self):
        for missing in EXPECTED:
            altered=dict(self.real)
            altered.pop(missing)
            with self.subTest(missing=missing),self.assertRaisesRegex(
                    ValueError,"THREE_ORIGINAL_ARCHIVED_FILES_REQUIRED"):
                replay(altered)

    def test_process_report_is_not_a_signoff_even_with_valid_sha(self):
        from science_gate_process_attestation import (
            attest, verify_attestation, DOMAIN, canonical)
        import json
        source=json.loads(self.real[SOURCE])
        uncertainty=json.loads(self.real[UNCERTAINTY])
        source_sha=sha256(self.real[SOURCE]).hexdigest()
        uncertainty_sha=sha256(self.real[UNCERTAINTY]).hexdigest()
        strength=evaluate(source, uncertainty, source_join_sha=source_sha,
                          uncertainty_sha=uncertainty_sha)
        strength_sha=sha256(canonical(strength)).hexdigest()
        signed=attest({"source":source,"uncertainty":uncertainty,"strength":strength},
                      {"source":source_sha,"uncertainty":uncertainty_sha,
                       "strength":strength_sha})
        self.assertTrue(verify_attestation(signed))
        changed=copy.deepcopy(signed)
        changed["mayPublish"]=True
        payload={k:v for k,v in changed.items() if k!="processAttestation"}
        changed["processAttestation"]["canonicalPayloadSha256"] = (
            sha256(canonical(payload)).hexdigest())
        changed["processAttestation"]["domainSeparatedDigest"] = (
            sha256(DOMAIN+canonical(payload)).hexdigest())
        with self.assertRaisesRegex(ValueError,"SCIENCE_GATE_CANNOT_SELF_AUTHORIZE"):
            verify_attestation(changed)

    def test_cli_writes_only_science_hold_receipt(self):
        import tempfile
        import json
        with tempfile.TemporaryDirectory() as tmp:
            out=Path(tmp)/"em00708-hold.json"
            with patch("sys.argv",["em00708_original_archive_hold_replay.py",
                                   "--root",str(self.root),"--out",str(out)]):
                main()
            receipt=json.loads(out.read_text())
            self.assertEqual(receipt["scienceGate"],GATE)
            self.assertFalse(receipt["mayPublish"])
            self.assertTrue(len(receipt["scienceProcessDomainSeparatedDigest"])==64)

if __name__=="__main__":
    unittest.main()
