"""Negative controls: source-backed native text must be legible, not merely annotated."""
import copy
import unittest
import subprocess
import tempfile
from decimal import Decimal
from pathlib import Path
from unittest.mock import patch

import numpy as np

from native_master_audit import frame_timestamps
from native_text_legibility_audit import (REQUIRED, SCHEMA, get_boxes,
                                          score_samples, MIN_INK_DYNAMIC_RANGE,
                                          exact_gray_samples, audit)


class RealEncodedTextInkTests(unittest.TestCase):
    def setUp(self):
        self.plan={"shots":[]}
        self.good=np.full((1920,1080),20,dtype=np.uint8)
        self.dark=np.full((1920,1080),20,dtype=np.uint8)
        self.faded=np.full((1920,1080),20,dtype=np.uint8)
        start=0.
        for i,(scene,terms) in enumerate(REQUIRED.items()):
            width=600
            rows=[]
            for j,term in enumerate(terms):
                box=[80,480+j*100,80+width,540+j*100]
                rows.append({"role":"science","text":term,"boxPx":box,"fontPx":42})
                x1,y1,x2,y2=box
                # Synthetic glyph alternation = positive/negative contrast,
                # not a fake real-movie approval. Pixel check is genuine.
                self.good[y1:y2,x1+20:x2-20:2]=235
                self.faded[y1:y2,x1+20:x2-20:2]=80
            self.plan["shots"].append({
                "id":scene,"startSec":start,"endSec":start+2.,
                "annotations":rows})
            start+=2.
        self.samples={(s,t):(self.good,self.good,self.good)
                      for s,terms in REQUIRED.items() for t in terms}

    def test_exact_16_visible_labels_meet_both_one_point_proxy_criteria(self):
        result=score_samples(self.plan,self.samples)
        self.assertEqual(result["schema"],SCHEMA)
        self.assertEqual(result["testedCriticalVisibleLabels"],16)
        self.assertEqual(result["additionalObjectivePoints"],2)
        self.assertTrue(all("middle" in item for item in result["observations"]))
        self.assertTrue(all(x["passed"] for x in result["criteria"]))
        self.assertFalse(result["viewerComprehensionApproved"])
        self.assertFalse(result["mayPublish"])

    def test_black_frame_does_not_earn_readability(self):
        self.samples[("sentence_4","A possible\n3D shape.")]=(self.dark,self.dark,self.dark)
        r=score_samples(self.plan,self.samples)
        self.assertEqual(r["additionalObjectivePoints"],0)

    def test_faded_glyph_ink_loses_contrast(self):
        self.samples[("sentence_4","Computed 3D illustration • not filmed")]=(self.faded,self.faded,self.faded)
        r=score_samples(self.plan,self.samples)
        self.assertFalse(r["criteria"][0]["passed"])
        self.assertLess(r["additionalObjectivePoints"],2)

    def test_disappearing_late_text_rejected(self):
        self.samples[("sentence_1_part0","No reaction")]=(self.good,self.good,self.dark)
        r=score_samples(self.plan,self.samples)
        self.assertFalse(r["criteria"][0]["passed"])
        self.assertFalse(r["criteria"][1]["passed"])

    def test_invisible_middle_text_fails_even_when_first_and_last_are_identical(self):
        # Prior two-point sampling awarded both proxy points even if the
        # teaching label vanished halfway through the intended reading hold.
        self.samples[("sentence_4","Computed 3D illustration • not filmed")]=(
            self.good,self.dark,self.good)
        r=score_samples(self.plan,self.samples)
        self.assertEqual(r["additionalObjectivePoints"],0)
        self.assertFalse(r["criteria"][0]["passed"])
        self.assertFalse(r["criteria"][1]["passed"])
        self.assertEqual(r["testedCriticalVisibleLabels"],16)

    def test_two_frame_receipt_cannot_claim_three_phase_persistence(self):
        self.samples[("sentence_2","–OH group: oxygen + hydrogen")]=(
            self.good,self.good)
        with self.assertRaisesRegex(ValueError,"EARLY_MIDDLE_LATE_NATIVE_FRAME_SAMPLES_REQUIRED"):
            score_samples(self.plan,self.samples)

    def test_flickering_contrast_breaks_persistence(self):
        late=self.good.copy()
        # Still clearly >130 dynamic range, but contrast intensity difference
        # >16 should fail stable visibility, not first-frame contrast.
        box=[80,480,680,540]
        x1,y1,x2,y2=box
        late[y1:y2,x1+20:x2-20:2]=170
        self.samples[("sentence_1_part0","MITRAGYNINE")]=(self.good,self.good,late)
        r=score_samples(self.plan,self.samples)
        self.assertTrue(r["criteria"][0]["passed"])
        self.assertFalse(r["criteria"][1]["passed"])

    def test_insufficient_hold_time_rejected(self):
        self.plan["shots"][0]["endSec"]=1.0
        r=score_samples(self.plan,self.samples)
        self.assertFalse(r["criteria"][1]["passed"])

    def test_word_preserving_mobile_line_wrap_is_not_falsely_rejected(self):
        # The actual 36px one-line atom/bond overlay cannot simply grow to
        # 42px inside the conservative 1080px-phone UI safe region.
        shot=next(s for s in self.plan["shots"] if s["id"]=="sentence_3")
        target=next(a for a in shot["annotations"]
                    if a["text"]=="Dots mark atoms. Lines mark bonds.")
        target["text"]="Dots mark atoms.\nLines mark bonds."
        r=score_samples(self.plan,self.samples)
        self.assertEqual(r["testedCriticalVisibleLabels"],16)
        self.assertEqual(r["additionalObjectivePoints"],2)
        self.assertFalse(r["mayPublish"])

    def test_full_computed_disclosure_can_wrap_without_losing_caveat(self):
        shot=next(s for s in self.plan["shots"] if s["id"]=="sentence_4")
        target=next(a for a in shot["annotations"]
                    if a["text"]=="Computed 3D illustration • not filmed")
        target["text"]="Computed 3D illustration\n• not filmed"
        _,boxes=get_boxes(self.plan)
        self.assertIn(("sentence_4","Computed 3D illustration • not filmed"),boxes)

    def test_wrapping_cannot_hide_missing_scientific_words_or_caveats(self):
        shot=next(s for s in self.plan["shots"] if s["id"]=="sentence_3")
        target=next(a for a in shot["annotations"]
                    if a["text"]=="Dots mark atoms. Lines mark bonds.")
        target["text"]="Dots mark bonds.\nLines mark atoms."
        with self.assertRaisesRegex(ValueError,"MISSING_OR_DUPLICATE_CRITICAL_LABEL"):
            get_boxes(self.plan)
        disclaimer=next(s for s in self.plan["shots"] if s["id"]=="sentence_4")
        target2=next(a for a in disclaimer["annotations"]
                     if a["text"]=="Computed 3D illustration • not filmed")
        target2["text"]="Computed 3D illustration"
        with self.assertRaisesRegex(ValueError,"MISSING_OR_DUPLICATE_CRITICAL_LABEL"):
            get_boxes(self.plan)

    def test_duplicate_wrapped_label_cannot_double_count_same_science(self):
        shot=next(s for s in self.plan["shots"] if s["id"]=="sentence_3")
        old=next(a for a in shot["annotations"]
                 if a["text"]=="Dots mark atoms. Lines mark bonds.")
        another=copy.deepcopy(old)
        another["text"]="Dots mark atoms.\nLines mark bonds."
        shot["annotations"].append(another)
        with self.assertRaisesRegex(ValueError,"MISSING_OR_DUPLICATE_CRITICAL_LABEL"):
            get_boxes(self.plan)

    def test_real_renderer_line_break_metadata_preserves_scientific_claims(self):
        # Lane 3 uses immutable metadata 'text' plus emitted layout lines;
        # both need to agree on the actual science and not-filmed disclaimer.
        actual={
            "sentence_3":("Dots mark atoms. Lines mark bonds.",
                          ["Dots mark atoms.","Lines mark bonds."]),
            "sentence_4":("Computed 3D illustration • not filmed",
                          ["Computed 3D illustration","• not filmed"]),
        }
        for scene,(label,lines) in actual.items():
            shot=next(s for s in self.plan["shots"] if s["id"]==scene)
            target=next(a for a in shot["annotations"] if a["text"]==label)
            target["renderedLineBreaks"]=lines
        r=score_samples(self.plan,self.samples)
        self.assertEqual(r["testedCriticalVisibleLabels"],16)
        self.assertEqual(r["additionalObjectivePoints"],2)
        self.assertIs(r["mayPublish"],False)

    def test_forged_rendered_disclosure_cannot_omit_not_filmed(self):
        shot=next(s for s in self.plan["shots"] if s["id"]=="sentence_4")
        target=next(a for a in shot["annotations"]
                    if a["text"]=="Computed 3D illustration • not filmed")
        # The canonical source statement remains intact; only visual lines
        # are tampered. The old word-preserving source matcher let this pass.
        target["renderedLineBreaks"]=["Computed 3D","illustration"]
        with self.assertRaisesRegex(ValueError,"RENDERED_LINES_MISMATCH_DECLARED_TEXT"):
            score_samples(self.plan,self.samples)

    def test_forged_rendered_science_reorder_or_duplication_fails(self):
        shot=next(s for s in self.plan["shots"] if s["id"]=="sentence_3")
        target=next(a for a in shot["annotations"]
                    if a["text"]=="Dots mark atoms. Lines mark bonds.")
        for lines in (["Lines mark bonds.","Dots mark atoms."],
                      ["Dots mark atoms.","Lines mark bonds.","Lines mark bonds."]):
            target["renderedLineBreaks"]=lines
            with self.subTest(lines=lines):
                with self.assertRaisesRegex(ValueError,"RENDERED_LINES_MISMATCH_DECLARED_TEXT"):
                    get_boxes(self.plan)

    def test_malformed_or_empty_rendered_line_cannot_fake_mobile_reflow(self):
        shot=next(s for s in self.plan["shots"] if s["id"]=="sentence_3")
        target=next(a for a in shot["annotations"]
                    if a["text"]=="Dots mark atoms. Lines mark bonds.")
        for malformed in (None,"Dots mark atoms. Lines mark bonds.",
                          ["Dots mark atoms.","","Lines mark bonds."],
                          ["Dots mark atoms.\nLines mark bonds."],
                          ["Dots mark atoms.",42,"Lines mark bonds."]):
            target["renderedLineBreaks"]=malformed
            with self.subTest(value=malformed):
                with self.assertRaisesRegex(ValueError,"RENDERED_LINES_MISMATCH_DECLARED_TEXT"):
                    get_boxes(self.plan)

    def test_missing_first_use_definition_rejected(self):
        shot=next(s for s in self.plan["shots"] if s["id"]=="source_hold")
        shot["annotations"]=[a for a in shot["annotations"]
                             if a["text"]!="CID = compound record number"]
        with self.assertRaisesRegex(ValueError,"MISSING_OR_DUPLICATE_CRITICAL_LABEL"):
            score_samples(self.plan,self.samples)

    def test_wrong_scene_order_is_not_a_valid_full_film(self):
        self.plan["shots"].pop(1)
        with self.assertRaisesRegex(ValueError,"NINE_REAL_SCENES"):
            score_samples(self.plan,self.samples)

    def test_missing_frame_samples_hold_not_neutral(self):
        del self.samples[("source_hold","7-OH • CID 44301524")]
        with self.assertRaisesRegex(ValueError,"EARLY_MIDDLE_LATE_NATIVE_FRAME_SAMPLES_REQUIRED"):
            score_samples(self.plan,self.samples)

    def test_cannot_pass_with_simulated_human_comprehension(self):
        r=score_samples(self.plan,self.samples)
        for k in ("viewerComprehensionApproved","naturalVoiceApproved",
                  "excellentFilmApproved","realHandsetApproved","mayPublish"):
            self.assertIs(r[k],False)


class StaleNativeAuditReceiptTests(unittest.TestCase):
    def test_failing_new_media_audit_removes_prior_success_receipt(self):
        with tempfile.TemporaryDirectory() as d:
            out=Path(d)/"native-text-legibility.json"
            out.write_text('{"additionalObjectivePoints":2,"mayPublish":true}')
            with patch("native_text_legibility_audit.probe_movie",
                       side_effect=ValueError("bad new film")):
                with self.assertRaisesRegex(ValueError,"bad new film"):
                    audit(Path(d)/"missing.mp4",Path(d)/"plan.json",
                          Path(d)/"receipt.json",Path(d)/"claim.json",out)
            self.assertFalse(out.exists(),
                             "prior PASS must not survive a failed audit")

    def test_receipt_path_must_not_alias_an_input_file(self):
        with tempfile.TemporaryDirectory() as d:
            movie=Path(d)/"original-movie.mp4"
            movie.write_bytes(b"immutable source bytes")
            with self.assertRaisesRegex(ValueError,
                                        "OUTPUT_RECEIPT_MUST_NOT_OVERWRITE_INPUT"):
                audit(movie,Path(d)/"plan.json",Path(d)/"receipt.json",
                      Path(d)/"claim.json",movie)
            self.assertEqual(movie.read_bytes(),b"immutable source bytes")


class ActualH264FrameIdentityTests(unittest.TestCase):
    def test_early_late_ink_samples_use_exact_decoded_frames_across_hard_cut(self):
        # A real 90-frame 1080p H264 changes red to blue at frame 45.
        # Both gray pixel values and PTS/shot IDs must stay coupled.
        with tempfile.TemporaryDirectory() as d:
            movie=Path(d)/"hard-cut.mp4"
            subprocess.run([
                "ffmpeg","-hide_banner","-loglevel","error","-nostdin","-y",
                "-f","lavfi","-i","color=c=red:s=1080x1920:r=30:d=1.5",
                "-f","lavfi","-i","color=c=blue:s=1080x1920:r=30:d=1.5",
                "-filter_complex","[0:v][1:v]concat=n=2:v=1:a=0[v]",
                "-map","[v]","-c:v","libx264","-preset","ultrafast",
                "-pix_fmt","yuv420p","-an",str(movie)
            ],capture_output=True,check=True,timeout=60)
            stamps=frame_timestamps(movie)
            self.assertEqual(len(stamps),90)
            first={"id":"red","startSec":0.0,"endSec":1.5}
            second={"id":"blue","startSec":1.5,"endSec":3.0}
            requests=[(("blue","early"),second,1.51),
                      (("red","late"),first,1.49),
                      (("red","middle"),first,0.75),
                      (("blue","middle"),second,2.25)]
            frames,proof=exact_gray_samples(movie,requests,stamps)
            self.assertEqual([p["frameIndex"] for p in proof[:2]],[45,44])
            self.assertEqual([p["shotId"] for p in proof],
                             ["blue","red","red","blue"])
            self.assertTrue(0.0 <= proof[2]["actualFramePtsSec"] < 1.5)
            self.assertTrue(1.5 <= proof[3]["actualFramePtsSec"] < 3.0)
            self.assertAlmostEqual(proof[0]["actualFramePtsSec"],1.5,places=4)
            self.assertAlmostEqual(proof[1]["actualFramePtsSec"],44/30,places=4)
            self.assertLess(int(frames[("blue","early")][960,540]),45)
            self.assertGreater(int(frames[("red","late")][960,540]),65)
            self.assertGreater(int(frames[("red","middle")][960,540]),65)
            self.assertLess(int(frames[("blue","middle")][960,540]),45)

    def test_three_phase_missing_movie_fails_closed(self):
        # In contrast to the real encoded cut test above, this adversarial
        # control intentionally provides no film and must never earn a receipt.
        shot={"id":"center","startSec":0.0,"endSec":3.0}
        samples=[(("center","early"),shot,0.3),
                 (("center","middle"),shot,1.5),
                 (("center","late"),shot,2.7)]
        # A missing source does not silently generate positive media proof.
        with self.assertRaisesRegex(ValueError,"EXACT_PRESENTED_FRAME_EXTRACTION_FAILED"):
            exact_gray_samples("/missing/not-a-film.mp4",samples,
                               [Decimal(i)/30 for i in range(90)])

    def test_out_of_shot_sample_fails_before_extracting_pixels(self):
        with self.assertRaisesRegex(ValueError,"SAMPLE_TIME_OUTSIDE_DECLARED_SHOT"):
            exact_gray_samples(
                "/unused/movie.mp4",
                [(("scene","late"),{"id":"scene","startSec":0.0,"endSec":1.0},1.2)],
                [Decimal("0.0"),Decimal("0.033333"),Decimal("0.066667")])

    def test_missing_actual_frame_list_fails_closed(self):
        with self.assertRaisesRegex(ValueError,"EXACT_NATIVE_SAMPLE_REQUESTS_REQUIRED"):
            exact_gray_samples("/unused/movie.mp4",[],[])


if __name__=="__main__":
    unittest.main()
