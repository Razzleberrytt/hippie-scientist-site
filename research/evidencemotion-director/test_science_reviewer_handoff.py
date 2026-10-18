"""EM-007.07 packet requires actual independent review; cannot self-certify."""
import copy
import json
import tempfile
import hashlib
from contextlib import nullcontext
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


    def current_candidate_fixture(self, root):
        """A byte-real OTHER candidate, but no claim of real H264 pixel proof."""
        import hashlib
        from science_gate_process_attestation import attest
        from claim_source_context_join import join
        from scientific_uncertainty_ledger import classify
        from claim_strength_source_limits import evaluate
        from test_claim_source_context_join import LEDGER,visual_fixture
        film=Path(root)/"synthetic-candidate.mp4"
        film.write_bytes(b"ALTERNATE CURRENT FILM - fixture only")
        sha=hashlib.sha256(film.read_bytes()).hexdigest()
        visual=visual_fixture()
        visual["filmSha256"]=sha
        source=join(json.loads(LEDGER.read_text()),visual,
                    spoken_sha=hashlib.sha256(LEDGER.read_bytes()).hexdigest(),
                    visual_sha="d"*64)
        source_sha="a"*64
        uncertainty=classify(source,source_sha=source_sha)
        uncertainty_sha="b"*64
        strength=evaluate(source,uncertainty,source_join_sha=source_sha,
                          uncertainty_sha=uncertainty_sha)
        gate=attest({"source":source,"uncertainty":uncertainty,"strength":strength},
                    {"source":source_sha,"uncertainty":uncertainty_sha,
                     "strength":"c"*64})
        return film,gate

    def test_current_render_packet_binds_real_other_h264_identity_and_holds(self):
        from science_reviewer_handoff import (
            FILM_SHA,CURRENT_SCHEMA,current_candidate_reviewer_packet,
            verify_current_candidate_reviewer_packet)
        import hashlib
        with tempfile.TemporaryDirectory() as temp:
            movie,gate=self.current_candidate_fixture(temp)
            packet=current_candidate_reviewer_packet(gate,movie)
            self.assertTrue(verify_current_candidate_reviewer_packet(packet,gate,movie))
            self.assertEqual(packet["schema"],CURRENT_SCHEMA)
            self.assertEqual(packet["exactCurrentEncodedH264Sha256"],
                             hashlib.sha256(movie.read_bytes()).hexdigest())
            self.assertNotEqual(packet["exactCurrentEncodedH264Sha256"],FILM_SHA)
            self.assertEqual(len(packet["eightClaimsToReview"]),8)
            self.assertEqual(sum(x["material"] for x in packet["eightClaimsToReview"]),6)
            self.assertTrue(packet["sourceOnlyTimecodesNotCurrentFilmVerified"])
            self.assertTrue(packet["pastArchivedPixelAndOcrPassNotInherited"])
            self.assertFalse(packet["independentQualifiedReviewReceived"])
            self.assertFalse(packet["currentFilmPixelReviewCompleted"])
            self.assertFalse(packet["currentFilmHumanReviewCompleted"])
            self.assertFalse(packet["mayPublish"])
            self.assertFalse(packet["approvalToMerge"])
            self.assertEqual(packet["eightClaimsToReview"][0]["originalWavAlignedStartMs"],160)
            self.assertEqual(packet["eightClaimsToReview"][0]["originalWavAlignedEndMs"],2920)
            self.assertTrue(all(row["currentH264FrameContentInspectedForThisClaim"] is False
                                for row in packet["eightClaimsToReview"]))

    def test_frozen_original_movie_isolated_and_swap_fails_closed(self):
        import science_reviewer_handoff as handoff
        with tempfile.TemporaryDirectory() as folder:
            movie=Path(folder)/"mutable.mp4"
            movie.write_bytes(b"A"*256)
            pin=hashlib.sha256(movie.read_bytes()).hexdigest()
            with self.assertRaisesRegex(
                ValueError,"SCIENCE_REVIEW_ORIGINAL_CHANGED_DURING_DECODE"
            ):
                with handoff._pinned_review_movie(movie,pin) as frozen:
                    self.assertNotEqual(movie.resolve(),frozen.resolve())
                    self.assertEqual(frozen.read_bytes(),b"A"*256)
                    movie.write_bytes(b"B"*256)
                    self.assertEqual(frozen.read_bytes(),b"A"*256)
            self.assertFalse(frozen.exists())
            with self.assertRaisesRegex(
                ValueError,"ENCODED_SOURCE_CHANGED_DURING_SNAPSHOT"
            ):
                with handoff._pinned_review_movie(movie,pin):
                    self.fail("cannot enter after source changed")

    def test_frozen_copy_mutation_during_decode_fails_closed(self):
        import science_reviewer_handoff as handoff
        with tempfile.TemporaryDirectory() as folder:
            movie=Path(folder)/"immutable-original.mp4"
            original=b"A"*256
            movie.write_bytes(original)
            pin=hashlib.sha256(original).hexdigest()
            with self.assertRaisesRegex(
                ValueError,"SCIENCE_REVIEW_FROZEN_CHANGED_DURING_DECODE"
            ):
                with handoff._pinned_review_movie(movie,pin) as frozen:
                    self.assertEqual(frozen.read_bytes(),original)
                    frozen.write_bytes(b"B"*256)
                    self.assertEqual(movie.read_bytes(),original)
            self.assertFalse(frozen.exists())
            self.assertEqual(movie.read_bytes(),original)
            # Unchanged originals still pass the post-decode integrity check.
            with handoff._pinned_review_movie(movie,pin) as frozen:
                self.assertEqual(frozen.read_bytes(),original)
            # Deleted snapshots are never implicitly accepted as proof.
            with self.assertRaisesRegex(
                ValueError,"SCIENCE_REVIEW_FROZEN_CHANGED_DURING_DECODE"
            ):
                with handoff._pinned_review_movie(movie,pin) as frozen:
                    frozen.unlink()

    def test_science_review_rehash_stops_after_limit_plus_one_byte(self):
        import hashlib
        import science_reviewer_handoff as handoff
        with tempfile.TemporaryDirectory() as root:
            film=Path(root)/"growing-original.mp4"
            film.write_bytes(b"A"*4096)
            self.assertEqual(handoff._hash_file(film,max_bytes=4096),
                             hashlib.sha256(film.read_bytes()).hexdigest())
            with film.open("wb") as stream:
                stream.truncate(16*1024*1024)
            with self.assertRaisesRegex(
                ValueError,"SCIENCE_REVIEW_SOURCE_EXCEEDS_BYTE_LIMIT"
            ):
                handoff._hash_file(film,max_bytes=4096)
            self.assertEqual(film.stat().st_size,16*1024*1024)
            with self.assertRaisesRegex(ValueError,"SCIENCE_REVIEW_HASH_LIMIT_INVALID"):
                handoff._hash_file(film,max_bytes=-1)

    def test_current_review_intake_rejects_oversize_film_not_fake_approval(self):
        import science_reviewer_handoff as handoff
        import encoded_source_credit_guard as credit_guard
        with tempfile.TemporaryDirectory() as root:
            movie,gate=self.current_candidate_fixture(root)
            self.assertFalse(handoff.current_candidate_reviewer_packet(
                gate,movie)["mayPublish"])
            with movie.open("wb") as stream:
                stream.truncate(8*1024*1024)
            with patch.object(credit_guard,"MAX_VIDEO_BYTES",4096):
                with self.assertRaisesRegex(
                    ValueError,"SCIENCE_REVIEW_SOURCE_EXCEEDS_BYTE_LIMIT"
                ):
                    handoff.current_candidate_reviewer_packet(gate,movie)

    def test_current_render_intake_refuses_changed_actual_film_bytes(self):
        from science_reviewer_handoff import current_candidate_reviewer_packet
        with tempfile.TemporaryDirectory() as tmp:
            movie,gate=self.current_candidate_fixture(tmp)
            movie.write_bytes(movie.read_bytes()+b"foreign")
            with self.assertRaisesRegex(ValueError,
                    "CURRENT_RENDER_NOT_BOUND_TO_ITS_EXACT_SCIENCE_GATE"):
                current_candidate_reviewer_packet(gate,movie)

    def test_current_render_intake_rejects_rehashed_claim_review_approval(self):
        from science_reviewer_handoff import (
            current_candidate_reviewer_packet,
            verify_current_candidate_reviewer_packet,CURRENT_DOMAIN)
        from science_gate_process_attestation import canonical
        import hashlib
        with tempfile.TemporaryDirectory() as tmp:
            movie,gate=self.current_candidate_fixture(tmp)
            for mutation in (
                lambda packet: packet.update({"mayPublish":True}),
                lambda packet: packet.update({"currentFilmPixelReviewCompleted":True}),
                lambda packet: packet["eightClaimsToReview"][0].update(
                    {"scientificApproval":True}),
                lambda packet: packet["eightClaimsToReview"][0].update(
                    {"sourceScope":"HUMAN_TRIAL_VERIFIED"}),
                lambda packet: packet["eightClaimsToReview"][0].update(
                    {"originalWavAlignedEndMs":9999}),
                lambda packet: packet.update(
                    {"pastArchivedPixelAndOcrPassNotInherited":False}),
            ):
                packet=current_candidate_reviewer_packet(gate,movie)
                mutation(packet)
                material={k:v for k,v in packet.items()
                          if k!="currentFilmReviewRequestDigest"}
                packet["currentFilmReviewRequestDigest"]=hashlib.sha256(
                    CURRENT_DOMAIN+canonical(material)).hexdigest()
                with self.subTest(mutation=mutation.__code__.co_firstlineno):
                    with self.assertRaisesRegex(ValueError,"CURRENT_FILM_REVIEW_REQUEST_MUTATED"):
                        verify_current_candidate_reviewer_packet(packet,gate,movie)

    def test_cli_current_film_emits_provisional_unapproved_distinct_intake(self):
        from science_reviewer_handoff import main,current_candidate_reviewer_packet
        with tempfile.TemporaryDirectory() as tmp:
            movie,gate=self.current_candidate_fixture(tmp)
            gate_path=Path(tmp)/"exact-current-gate.json"
            gate_path.write_text(json.dumps(gate)+"\n")
            out=Path(tmp)/"current-qualified-review-INTAKE-ONLY.json"
            argv=["science_reviewer_handoff.py","--gate",str(gate_path),
                  "--candidate-movie",str(movie),"--out",str(out)]
            with patch("sys.argv",argv):
                main()
            packet=json.loads(out.read_text())
            self.assertEqual(packet,current_candidate_reviewer_packet(gate,movie))
            self.assertTrue(packet["pastArchivedPixelAndOcrPassNotInherited"])
            self.assertFalse(packet["mayPublish"])
            movie.write_bytes(b"different filmed content")
            with patch("sys.argv",argv),self.assertRaisesRegex(
                ValueError,"CURRENT_RENDER_NOT_BOUND_TO_ITS_EXACT_SCIENCE_GATE"):
                main()
            self.assertFalse(out.exists())

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




    def test_temporal_no_reaction_requires_actual_archived_h264(self):
        from science_reviewer_handoff import screen_original_no_reaction_temporal
        packet=reviewer_packet(self.gate)
        with tempfile.TemporaryDirectory() as directory:
            source=Path(directory)/"not-original.mp4"
            source.write_bytes(b"local fictional movie")
            with self.assertRaisesRegex(ValueError,
                 "NO_REACTION_TIMELINE_REQUIRES_PINNED_ORIGINAL_H264"):
                screen_original_no_reaction_temporal(source,self.gate,packet)

    def test_temporal_no_reaction_refuses_missing_one_selected_frame(self):
        import science_reviewer_handoff as handoff
        packet=reviewer_packet(self.gate)
        with tempfile.TemporaryDirectory() as directory:
            source=Path(directory)/"fake.mp4";source.write_bytes(b"mock film")
            def missing_one(command,**kwargs):
                folder=Path(command[-1]).parent
                for i in range(7):
                    (folder/f"intro-{i:02d}.png").write_bytes(b"a"*200)
            with patch.object(handoff,"_hash_file",return_value=handoff.FILM_SHA), \
                 patch.object(handoff,"_pinned_review_movie",return_value=nullcontext(source)):
                with patch.object(handoff.subprocess,"run",side_effect=missing_one):
                    with self.assertRaisesRegex(ValueError,
                         "NO_REACTION_TIMELINE_EIGHT_REAL_FRAMES_REQUIRED"):
                        handoff.screen_original_no_reaction_temporal(source,self.gate,packet)

    def test_temporal_no_reaction_refuses_ocr_without_source_phrase(self):
        import science_reviewer_handoff as handoff
        packet=reviewer_packet(self.gate)
        with tempfile.TemporaryDirectory() as directory:
            source=Path(directory)/"fake.mp4";source.write_bytes(b"mock film")
            calls=[]
            def mock_steps(command,**kwargs):
                if command[0]=="ffmpeg":
                    folder=Path(command[-1]).parent
                    # These are mock PNG headers, NOT pixel-grounded proof.
                    header=(b"\x89PNG\r\n\x1a\n"+(13).to_bytes(4,"big")
                            +b"IHDR"+(540).to_bytes(4,"big")
                            +(960).to_bytes(4,"big")+b"a"*130)
                    for i in range(8):
                        (folder/f"intro-{i:02d}.png").write_bytes(header)
                    return None
                calls.append(command)
                return type("R",(),{"stdout":"MITRAGYNINE; no biochemical study"})()
            with patch.object(handoff,"_hash_file",return_value=handoff.FILM_SHA), \
                 patch.object(handoff,"_pinned_review_movie",return_value=nullcontext(source)):
                with patch.object(handoff.subprocess,"run",side_effect=mock_steps):
                    with self.assertRaisesRegex(ValueError,
                        "NO_REACTION_TIMELINE_VISIBLE_TEXT_NOT_RECOVERED"):
                        handoff.screen_original_no_reaction_temporal(source,self.gate,packet)
            self.assertEqual(len(calls),1)

    def test_known_original_no_reaction_ocr_risk_never_self_approves(self):
        # Contract fixture only: the hosted original-film CI must physically
        # recover "No reaction" from exact archived H264 frame 45.
        from science_reviewer_handoff import (
            original_no_reaction_ocr_verdict,NO_REACTION_STILL_SHA,
            FILM_SHA,NO_REACTION_RISK_SCHEMA,
        )
        original={"claimId":"spoken-001","originalH264FrameIndex":45,
                  "originalH264TimeSec":1.5,"pngSha256":NO_REACTION_STILL_SHA,
                  "sourceFilmSha256":FILM_SHA,
                  "qualifiedVisualOrScientificReviewCompleted":False,
                  "mayPublish":False}
        ocr={"psm6":"MITRAGYNINE\nNo reaction\nO H\n",
             "psm11":"THE HIPPIE SCIENTIST\nNo reaction\n"}
        result=original_no_reaction_ocr_verdict(original,ocr)
        self.assertEqual(result["schema"],NO_REACTION_RISK_SCHEMA)
        self.assertEqual(result["claimId"],"spoken-001")
        self.assertEqual(result["actualOriginalEncodedFrameIndex"],45)
        self.assertEqual(len(result["actualOriginalPngIndependentOCR"]),2)
        self.assertTrue(result["requiresQualifiedReview"])
        self.assertFalse(result["qualifiedIndependentReviewerResolved"])
        self.assertFalse(result["clinicalOrPlantAssayMeaningEstablished"])
        self.assertFalse(result["reviewedEntireOriginalScene"])
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["approvalToMerge"])

    def test_no_reaction_ocr_risk_refuses_false_or_absent_source_wording(self):
        from science_reviewer_handoff import (
            original_no_reaction_ocr_verdict,NO_REACTION_STILL_SHA,FILM_SHA
        )
        original={"claimId":"spoken-001","originalH264FrameIndex":45,
                  "originalH264TimeSec":1.5,"pngSha256":NO_REACTION_STILL_SHA,
                  "sourceFilmSha256":FILM_SHA,
                  "qualifiedVisualOrScientificReviewCompleted":False,
                  "mayPublish":False}
        for corrupted in (
            {"psm6":"no reaction","psm11":"No biology observed"},
            {"psm6":"no reaction"},
            {"psm6":"","psm11":"No reaction"},
            {"psm6":"no reactionary event","psm11":"No reaction"},
            {"psm6":"No reactions","psm11":"No reaction"},
            {"psm6":"not reaction","psm11":"No reaction"},
        ):
            with self.subTest(ocr=corrupted),self.assertRaises(ValueError):
                original_no_reaction_ocr_verdict(original,corrupted)

    def test_no_reaction_ocr_risk_rejects_rehashed_swapped_or_preapproved_frame(self):
        from science_reviewer_handoff import (
            original_no_reaction_ocr_verdict,NO_REACTION_STILL_SHA,FILM_SHA
        )
        true={"claimId":"spoken-001","originalH264FrameIndex":45,
              "originalH264TimeSec":1.5,"pngSha256":NO_REACTION_STILL_SHA,
              "sourceFilmSha256":FILM_SHA,
              "qualifiedVisualOrScientificReviewCompleted":False,
              "mayPublish":False}
        recovered={"psm6":"NO REACTION","psm11":"No reaction"}
        for change in (
            {"claimId":"spoken-004"},
            {"originalH264FrameIndex":46},
            {"originalH264TimeSec":1.533333},
            {"pngSha256":"a"*64},
            {"sourceFilmSha256":"b"*64},
            {"qualifiedVisualOrScientificReviewCompleted":True},
            {"mayPublish":True},
        ):
            original=dict(true,**change)
            with self.subTest(change=change), self.assertRaisesRegex(
                 ValueError,"AMBIGUOUS_CAPTION_SOURCE_IMAGE_OR_REVIEWER"):
                original_no_reaction_ocr_verdict(original,recovered)

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
            pinned_fixture=root/"explicit-pinned-input.mp4"
            pinned_fixture.write_bytes(b"not-original-PNG-mock")

            def mock_ffmpeg(command,**kwargs):
                self.assertEqual(command[command.index("-i")+1],str(pinned_fixture))
                self.assertIn("select=",next(x for x in command if
                                            isinstance(x,str) and x.startswith("select=")))
                for n in range(8):
                    (Path(command[-1]).parent/f"original-claim-{n:02d}.png").write_bytes(
                        (b"\x89PNG\r\n\x1a\n"+(13).to_bytes(4,"big")+b"IHDR"+(540).to_bytes(4,"big")+(960).to_bytes(4,"big")+b"a"*130))
                return None
            with patch.object(handoff,"_hash_file",return_value=FILM_SHA), \
                 patch.object(handoff,"_pinned_review_movie",return_value=nullcontext(pinned_fixture)):
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
            with patch.object(handoff,"_hash_file",return_value=FILM_SHA), \
                 patch.object(handoff,"_pinned_review_movie",return_value=nullcontext(film)):
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

    def test_current_movie_alias_never_unlinks_source_before_validation(self):
        # These are filesystem safety fixtures, NOT authentic encoded film.
        # The old CLI cleaned --out BEFORE checking a current-movie alias.
        import os
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            gate = root / "gate.json"
            gate.write_text(json.dumps(self.gate), encoding="utf8")
            movie = root / "current.mp4"
            original = b"precious current encoded film bytes"
            movie.write_bytes(original)
            hardlink = root / "different-name-output.json"
            os.link(movie, hardlink)
            alias_dir = root / "alias-directory"
            alias_dir.symlink_to(root, target_is_directory=True)
            inputs = (movie, hardlink, alias_dir / "current.mp4")
            for output in inputs:
                with self.subTest(output=str(output)):
                    argv = ["science_reviewer_handoff.py", "--gate",
                            str(gate), "--candidate-movie", str(movie),
                            "--out", str(output)]
                    with patch("sys.argv", argv), self.assertRaisesRegex(
                            ValueError, "CURRENT_MOVIE_OUTPUT_PATH_ALIAS"):
                        main()
                    self.assertEqual(movie.read_bytes(), original)
                    self.assertEqual(hardlink.read_bytes(), original)
                    self.assertTrue(gate.is_file())

    def test_gate_hardlink_alias_rejected_before_report_cleanup(self):
        import os
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            gate = root / "gate.json"
            payload = (json.dumps(self.gate) + "\\n").encode("utf8")
            gate.write_bytes(payload)
            same_inode_output = root / "report.json"
            os.link(gate, same_inode_output)
            argv = ["science_reviewer_handoff.py", "--gate",
                    str(gate), "--out", str(same_inode_output)]
            with patch("sys.argv", argv), self.assertRaisesRegex(
                    ValueError, "INPUT_OUTPUT_PATH_ALIAS"):
                main()
            self.assertEqual(gate.read_bytes(), payload)
            self.assertEqual(same_inode_output.read_bytes(), payload)

    def test_frozen_spoken_ledger_alias_cannot_destroy_original_source(self):
        import os
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            gate = root / "gate.json"
            gate.write_text(json.dumps(self.gate), encoding="utf8")
            words = root / "original-source-words.json"
            original = b"protected frozen original spoken-word source"
            words.write_bytes(original)
            output = root / "apparently-unrelated-report.json"
            os.link(words, output)
            argv = ["science_reviewer_handoff.py", "--gate",
                    str(gate), "--out", str(output)]
            with patch("science_reviewer_handoff.FROZEN_SPOKEN_LEDGER", words):
                with patch("sys.argv", argv), self.assertRaisesRegex(
                        ValueError, "FROZEN_SOURCE_WORD_LEDGER_OUTPUT_PATH_ALIAS"):
                    main()
            self.assertEqual(words.read_bytes(), original)
            self.assertEqual(output.read_bytes(), original)
            self.assertTrue(gate.is_file())

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
