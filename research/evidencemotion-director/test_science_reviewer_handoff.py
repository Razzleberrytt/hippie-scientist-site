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
        # This suite is a METADATA fixture, not a film playback. Rebuild the
        # synthetic source report under the *actual pinned film identity*
        # instead of borrowing its old generic 'a'*64 mock-movie digest.
        from test_claim_source_context_join import LEDGER, visual_fixture
        from claim_source_context_join import join
        from scientific_uncertainty_ledger import classify
        from claim_strength_source_limits import evaluate
        from science_reviewer_handoff import FILM_SHA
        import hashlib
        visual=visual_fixture()
        visual["filmSha256"]=FILM_SHA
        fixture.source=join(
            json.loads(LEDGER.read_text()),visual,
            spoken_sha=hashlib.sha256(LEDGER.read_bytes()).hexdigest(),
            visual_sha="d"*64)
        fixture.uncertainty=classify(fixture.source,source_sha=fixture.source_sha)
        fixture.strength=evaluate(
            fixture.source,fixture.uncertainty,
            source_join_sha=fixture.source_sha,
            uncertainty_sha=fixture.uncertainty_sha)
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

    def test_eight_original_wav_windows_are_precisely_film_frame_bounded(self):
        packet=reviewer_packet(self.gate)
        rows=packet["eightClaimsToReview"]
        assert len(packet["frozenAlignedWordLedgerSha256"])==64
        self.assertEqual([r["claimId"] for r in rows],
                         [f"spoken-{n:03d}" for n in range(1,9)])
        expected=(
            (160.0,2920.0), (3470.0,10270.0),
            (10850.0,15990.0), (16580.0,19150.0),
            (19590.0,22860.001), (23379.999,25389.999),
            (25709.999,27350.0), (31250.0,33889.999),
        )
        import math
        for row,(a,b) in zip(rows,expected):
            time=row["originalWavAlignedReviewWindow"]
            self.assertAlmostEqual(time["spokenStartMs"],a,places=3)
            self.assertAlmostEqual(time["spokenEndMs"],b,places=3)
            self.assertEqual(time["firstPotentiallyOverlappingFrame"],
                             math.floor(a*30/1000))
            self.assertEqual(time["lastPotentiallyOverlappingFrame"],
                             math.ceil(b*30/1000)-1)
            self.assertLess(time["lastPotentiallyOverlappingFrame"],1031)
            self.assertFalse(time["actualFilmPixelsIndependentlyReviewedForClaim"])
            self.assertFalse(time["independentQualifiedReviewerApproved"])
            self.assertIn("NOT_HUMAN_AUDITION",time["sourceAlignment"])
        self.assertFalse(packet["independentScientificReviewPassed"])
        self.assertFalse(packet["mayPublish"])

    def test_modified_frozen_wav_timing_or_claim_id_cannot_rehash_to_review(self):
        import science_reviewer_handoff as handoff
        from science_reviewer_handoff import frozen_claim_review_windows
        original=json.loads(handoff.FROZEN_SPOKEN_LEDGER.read_text())
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"frozen-words.json"
            for mutate in (
                lambda record: record["words"][8].update({"startMs":3540.0}),
                lambda record: record["words"][72].update({"endMs":34000.0}),
                lambda record: record["assertions"][2].update({"id":"spoken-005"}),
                lambda record: record.update({"sourceWavSha256":"a"*64}),
                lambda record: record.update({"scienceApproved":True}),
                lambda record: record["words"][35].update({"startMs":-3.0}),
            ):
                mutated=copy.deepcopy(original)
                mutate(mutated)
                path.write_text(json.dumps(mutated)+"\n")
                with patch.object(handoff,"FROZEN_SPOKEN_LEDGER",path):
                    with self.subTest(mutation=mutate.__code__.co_firstlineno):
                        with self.assertRaises(ValueError):
                            reviewer_packet(self.gate)

    def test_rehashed_time_window_or_original_media_claim_cannot_self_approve(self):
        packet=reviewer_packet(self.gate)
        packet["eightClaimsToReview"][4]["originalWavAlignedReviewWindow"][
            "firstPotentiallyOverlappingFrame"]=0
        from science_reviewer_handoff import PACKET_DOMAIN
        from science_gate_process_attestation import canonical
        import hashlib
        payload={k:v for k,v in packet.items() if k!="processPacketDigest"}
        packet["processPacketDigest"]=hashlib.sha256(
            PACKET_DOMAIN+canonical(payload)).hexdigest()
        with self.assertRaisesRegex(ValueError,"REVIEW_INTAKE_MUTATED"):
            verify_packet(packet,self.gate)


    def test_real_review_images_refuse_any_substituted_fake_film(self):
        from science_reviewer_handoff import original_review_stills
        packet=reviewer_packet(self.gate)
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            movie=root/"substitute.mp4"
            movie.write_bytes(b"not-the-real-original-source")
            with self.assertRaisesRegex(ValueError,"ACTUAL_ARCHIVED_H264_BYTES_REQUIRED"):
                original_review_stills(movie,self.gate,packet,root/"review-stills")
            self.assertFalse((root/"review-stills").exists())

    def test_real_review_images_refuse_rehashed_forged_review_packet(self):
        from science_reviewer_handoff import original_review_stills
        packet=reviewer_packet(self.gate)
        packet["eightClaimsToReview"][1]["originalWavAlignedReviewWindow"][
            "lastPotentiallyOverlappingFrame"]=99
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            film=root/"archive.mp4"
            film.write_bytes(b"untrusted")
            with self.assertRaisesRegex(ValueError,"REVIEW_INTAKE_MUTATED"):
                original_review_stills(film,self.gate,packet,root/"out")

    def test_mocked_png_extraction_has_exact_eight_original_claim_ids(self):
        # A mocked FFmpeg call exercises output protocol only. THE separate
        # hosted original-archive run must prove actual movie frame extraction.
        from science_reviewer_handoff import original_review_stills,FILM_SHA
        import science_reviewer_handoff as handoff
        packet=reviewer_packet(self.gate)
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            film=root/"mock.mp4"
            film.write_bytes(b"mock-bytes-not-actual-media")
            def mock_ffmpeg(command,**kwargs):
                self.assertIn("select=",next(x for x in command if
                                            isinstance(x,str) and x.startswith("select=")))
                for n in range(8):
                    (Path(command[-1]).parent/f"original-claim-{n:02d}.png").write_bytes(
                        (b"\x89PNG\r\n\x1a\n"+(13).to_bytes(4,"big")+b"IHDR"+(540).to_bytes(4,"big")+(960).to_bytes(4,"big")+b"a"*130))
                return None
            with patch.object(handoff,"_hash_file",return_value=FILM_SHA):
                with patch.object(handoff.subprocess,"run",side_effect=mock_ffmpeg) as subprocess_run:
                    result=original_review_stills(film,self.gate,packet,root/"out")
                self.assertEqual(subprocess_run.call_count,1)
            self.assertTrue((root/"out/REVIEW-SAMPLES-RESEARCH-ONLY.json").is_file())
            stored=json.loads((root/"out/REVIEW-SAMPLES-RESEARCH-ONLY.json").read_text())
            self.assertEqual(stored,result)
            self.assertEqual(len(result["originalClaimFrameStills"]),8)
            self.assertEqual([x["claimId"] for x in result["originalClaimFrameStills"]],
                             [f"spoken-{i:03d}" for i in range(1,9)])
            self.assertTrue(all(x["qualifiedVisualOrScientificReviewCompleted"] is False
                                and x["mayPublish"] is False
                                for x in result["originalClaimFrameStills"]))
            self.assertFalse(result["qualifiedIndependentScienceReviewCompleted"])
            self.assertFalse(result["mayPublish"])
            from science_reviewer_handoff import verify_original_review_stills
            self.assertTrue(verify_original_review_stills(root/"out",self.gate,packet))
            img=root/"out/original-claim-03.png"
            original=img.read_bytes()
            img.write_bytes(original+b"tampered")
            with self.assertRaisesRegex(ValueError,"REVIEW_STILL_ARCHIVE_PNG_PIXELS"):
                verify_original_review_stills(root/"out",self.gate,packet)
            img.write_bytes(original)
            manifest=root/"out/REVIEW-SAMPLES-RESEARCH-ONLY.json"
            raw=manifest.read_text()
            fake=json.loads(raw)
            fake["qualifiedIndependentScienceReviewCompleted"]=True
            manifest.write_text(json.dumps(fake))
            with self.assertRaisesRegex(ValueError,"REVIEW_STILL_ARCHIVE_MANIFEST"):
                verify_original_review_stills(root/"out",self.gate,packet)
            manifest.write_text(raw)
            extra=root/"out/secret-review-approval.json"
            extra.write_text("{}")
            with self.assertRaisesRegex(ValueError,"REVIEW_STILL_ARCHIVE_MISSING_EXTRA"):
                verify_original_review_stills(root/"out",self.gate,packet)
            extra.unlink()
            self.assertTrue(verify_original_review_stills(root/"out",self.gate,packet))
            with self.assertRaisesRegex(ValueError,"REVIEW_STILL_OUTPUT_MUST_BE_NEW"):
                with patch.object(handoff,"_hash_file",return_value=FILM_SHA):
                    original_review_stills(film,self.gate,packet,root/"out")

    def test_incomplete_frame_render_refuses_and_leaves_no_approved_manifest(self):
        from science_reviewer_handoff import original_review_stills,FILM_SHA
        import science_reviewer_handoff as handoff
        packet=reviewer_packet(self.gate)
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            film=root/"mock.mp4"
            film.write_bytes(b"mock-media")
            def incomplete(command,**kwargs):
                (Path(command[-1]).parent/"original-claim-00.png").write_bytes(
                    (b"\x89PNG\r\n\x1a\n"+(13).to_bytes(4,"big")+b"IHDR"+(540).to_bytes(4,"big")+(960).to_bytes(4,"big")+b"a"*130))
            with patch.object(handoff,"_hash_file",return_value=FILM_SHA):
                with patch.object(handoff.subprocess,"run",side_effect=incomplete):
                    with self.assertRaisesRegex(ValueError,"ORIGINAL_REVIEW_STILL_COUNT_OR_SEQUENCE"):
                        original_review_stills(film,self.gate,packet,root/"out")
            self.assertFalse((root/"out").exists())

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
