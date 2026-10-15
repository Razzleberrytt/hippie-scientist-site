"""Negative controls: source-backed native text must be legible, not merely annotated."""
import copy
import unittest

import numpy as np

from native_text_legibility_audit import (REQUIRED, SCHEMA, get_boxes,
                                          score_samples, MIN_INK_DYNAMIC_RANGE)


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
        self.plan["shots"].append({
            "id":"sentence_6","startSec":start,"endSec":start+2.,
            "annotations":[{"role":"science","text":"Look closer.","boxPx":[80,400,400,470]}]})
        self.samples={(s,t):(self.good,self.good)
                      for s,terms in REQUIRED.items() for t in terms}

    def test_exact_13_visible_labels_meet_both_one_point_criteria(self):
        result=score_samples(self.plan,self.samples)
        self.assertEqual(result["schema"],SCHEMA)
        self.assertEqual(result["testedCriticalVisibleLabels"],13)
        self.assertEqual(result["additionalObjectivePoints"],2)
        self.assertTrue(all(x["passed"] for x in result["criteria"]))
        self.assertFalse(result["viewerComprehensionApproved"])
        self.assertFalse(result["mayPublish"])

    def test_black_frame_does_not_earn_readability(self):
        self.samples[("sentence_4","A possible\n3D shape.")]=(self.dark,self.dark)
        r=score_samples(self.plan,self.samples)
        self.assertEqual(r["additionalObjectivePoints"],0)

    def test_faded_glyph_ink_loses_contrast(self):
        self.samples[("sentence_4","Computed 3D illustration • not filmed")]=(self.faded,self.faded)
        r=score_samples(self.plan,self.samples)
        self.assertFalse(r["criteria"][0]["passed"])
        self.assertLess(r["additionalObjectivePoints"],2)

    def test_disappearing_late_text_rejected(self):
        self.samples[("sentence_1_part0","CID = compound record number")]=(self.good,self.dark)
        r=score_samples(self.plan,self.samples)
        self.assertFalse(r["criteria"][0]["passed"])
        self.assertFalse(r["criteria"][1]["passed"])

    def test_flickering_contrast_breaks_persistence(self):
        late=self.good.copy()
        # Still clearly >130 dynamic range, but contrast intensity difference
        # >16 should fail stable visibility, not first-frame contrast.
        box=[80,480,680,540]
        x1,y1,x2,y2=box
        late[y1:y2,x1+20:x2-20:2]=170
        self.samples[("sentence_1_part0","MITRAGYNINE • CID 3034396")]=(self.good,late)
        r=score_samples(self.plan,self.samples)
        self.assertTrue(r["criteria"][0]["passed"])
        self.assertFalse(r["criteria"][1]["passed"])

    def test_insufficient_hold_time_rejected(self):
        self.plan["shots"][0]["endSec"]=1.0
        r=score_samples(self.plan,self.samples)
        self.assertFalse(r["criteria"][1]["passed"])

    def test_missing_first_use_definition_rejected(self):
        shot=self.plan["shots"][0]
        shot["annotations"]=[a for a in shot["annotations"]
                             if a["text"]!="CID = compound record number"]
        with self.assertRaisesRegex(ValueError,"MISSING_OR_DUPLICATE_CRITICAL_LABEL"):
            score_samples(self.plan,self.samples)

    def test_wrong_scene_order_is_not_a_valid_full_film(self):
        self.plan["shots"].pop(1)
        with self.assertRaisesRegex(ValueError,"NINE_REAL_SCENES"):
            score_samples(self.plan,self.samples)

    def test_missing_frame_samples_hold_not_neutral(self):
        del self.samples[("source_hold","CID 44301524")]
        with self.assertRaisesRegex(ValueError,"EARLY_LATE_NATIVE_FRAME_SAMPLES_REQUIRED"):
            score_samples(self.plan,self.samples)

    def test_cannot_pass_with_simulated_human_comprehension(self):
        r=score_samples(self.plan,self.samples)
        for k in ("viewerComprehensionApproved","naturalVoiceApproved",
                  "excellentFilmApproved","realHandsetApproved","mayPublish"):
            self.assertIs(r[k],False)


if __name__=="__main__":
    unittest.main()
