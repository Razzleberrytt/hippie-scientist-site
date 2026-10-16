"""EM-007.07 packet requires actual independent review; cannot self-certify."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from science_reviewer_handoff import reviewer_packet, verify_packet, main, SCHEMA
from test_science_gate_process_attestation import ScienceGateProcessAttestationTests


class IndependentScienceIntakeTests(unittest.TestCase):
    def setUp(self):
        fixture = ScienceGateProcessAttestationTests(
            "test_all_eight_claims_keep_machine_receipt_and_open_holds")
        fixture.setUp()
        self.gate = fixture.inspect()

    def test_handoff_is_exactly_eight_claims_with_no_fake_review(self):
        packet = reviewer_packet(self.gate)
        self.assertTrue(verify_packet(packet, self.gate))
        self.assertEqual(packet["schema"], SCHEMA)
        self.assertEqual(packet["exactFilmSha256"], self.gate["filmSha256"])
        self.assertEqual(packet["exactOriginalWavSha256"], self.gate["sourceWavSha256"])
        self.assertEqual(packet["eightClaimsToReview"][0]["claimId"], "spoken-001")
        self.assertEqual(packet["eightClaimsToReview"][-1]["claimId"], "spoken-008")
        self.assertEqual(
            sum(len(x["sourceWordIndices"]) for x in packet["eightClaimsToReview"]),73)
        self.assertTrue(all(x["verbatimFrozenSpokenClaim"].strip()
                            for x in packet["eightClaimsToReview"]))
        self.assertEqual([i for row in packet["eightClaimsToReview"]
                          for i in row["sourceWordIndices"]],list(range(73)))
        self.assertEqual(sum(x["material"] for x in packet["eightClaimsToReview"]), 6)
        self.assertTrue(all(x["requiredIndependentChecks"] and
                            x["submittedReviewerFinding"] is None and
                            x["claimApproved"] is False
                            for x in packet["eightClaimsToReview"]))
        self.assertFalse(packet["independentQualifiedReviewReceived"])
        self.assertFalse(packet["independentScientificReviewPassed"])
        self.assertFalse(packet["mayPublish"])
        self.assertFalse(packet["approvalToMerge"])
        self.assertFalse(packet["reviewer"]["receiptAuthenticated"])

    def test_human_axes_are_requested_without_implying_no_trials_exist(self):
        packet = reviewer_packet(self.gate)
        for row in packet["eightClaimsToReview"]:
            qs = " ".join(row["requiredIndependentChecks"])
            self.assertIn("exact audio", qs)
            if row["material"]:
                self.assertIn("population", qs)
                self.assertIn("follow-up", qs)
                self.assertIn("no studies exist", qs)
            else:
                self.assertNotIn("follow-up", qs)
        first = packet["eightClaimsToReview"][1]["exactSourceIdentifiers"]
        self.assertEqual(first[0]["primaryRecordUrl"],
                         "https://pubchem.ncbi.nlm.nih.gov/compound/3034396")

    def test_rehashed_fabricated_review_or_source_swap_never_approves(self):
        for mutate in (
            lambda p: p.update({"mayPublish": True}),
            lambda p: p.update({"independentScientificReviewPassed": True}),
            lambda p: p["reviewer"].update({"receiptAuthenticated": True}),
            lambda p: p["eightClaimsToReview"][2].update({"claimApproved": True}),
            lambda p: p["eightClaimsToReview"][4].update({"claimId": "spoken-007"}),
            lambda p: p["eightClaimsToReview"][4].update({"verbatimFrozenSpokenClaim": "Cures pain"}),
            lambda p: p["eightClaimsToReview"][4].update({"sourceWordIndices": [30,31]}),
            lambda p: p.update({"exactFilmSha256": "b"*64}),
        ):
            packet = reviewer_packet(self.gate)
            mutate(packet)
            # Re-signing the packet's public, non-authenticating SHA is trivial.
            from science_reviewer_handoff import PACKET_DOMAIN
            from science_gate_process_attestation import canonical
            import hashlib
            payload = {k:v for k,v in packet.items() if k != "processPacketDigest"}
            packet["processPacketDigest"] = hashlib.sha256(
                PACKET_DOMAIN + canonical(payload)).hexdigest()
            with self.subTest(mutation=mutate.__code__.co_firstlineno):
                with self.assertRaisesRegex(ValueError, "REVIEW_INTAKE_MUTATED"):
                    verify_packet(packet, self.gate)

    def test_rehashed_source_gate_publishing_claim_refused(self):
        from science_gate_process_attestation import DOMAIN, canonical
        import hashlib
        self.gate["mayPublish"] = True
        p = {k:v for k,v in self.gate.items() if k!="processAttestation"}
        self.gate["processAttestation"]["canonicalPayloadSha256"] = hashlib.sha256(
            canonical(p)).hexdigest()
        self.gate["processAttestation"]["domainSeparatedDigest"] = hashlib.sha256(
            DOMAIN + canonical(p)).hexdigest()
        with self.assertRaisesRegex(ValueError,"SCIENCE_GATE_CANNOT_SELF_AUTHORIZE"):
            reviewer_packet(self.gate)

    def test_cli_emits_open_review_and_fails_closed_on_bad_next_run(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            gate_path = root/"verified-gate.json"
            out = root/"independent-review-packet.json"
            gate_path.write_text(json.dumps(self.gate)+"\n",encoding="utf-8")
            argv=["science_reviewer_handoff.py","--gate",str(gate_path),"--out",str(out)]
            with patch("sys.argv",argv):
                main()
            packet=json.loads(out.read_text())
            self.assertTrue(verify_packet(packet, self.gate))
            gate_path.write_text('{"scienceGate":"HOLD","scienceGate":"PASS"}',
                                 encoding="utf-8")
            with patch("sys.argv",argv),self.assertRaisesRegex(
                    ValueError,"DUPLICATED_JSON_KEY"):
                main()
            self.assertFalse(out.exists())

    def test_cannot_overwrite_input_and_symlink_target(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            gate = root/"verified-gate.json"
            gate.write_text(json.dumps(self.gate),encoding="utf-8")
            argv=["science_reviewer_handoff.py","--gate",str(gate),"--out",str(gate)]
            with patch("sys.argv",argv),self.assertRaisesRegex(ValueError,
                    "INPUT_OUTPUT_PATH_ALIAS"):
                main()
            before=gate.read_bytes()
            link=root/"output.json"
            link.symlink_to(gate)
            argv[-1]=str(link)
            with patch("sys.argv",argv),self.assertRaisesRegex(ValueError,
                    "INPUT_OUTPUT_PATH_ALIAS"):
                main()
            self.assertEqual(gate.read_bytes(),before)
            self.assertTrue(link.is_symlink())


if __name__ == "__main__":
    unittest.main()
