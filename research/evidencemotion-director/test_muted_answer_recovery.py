"""Honest, fault-injectable five-question real mute-video evidence test."""
import copy
import unittest
from unittest.mock import patch

import numpy as np
from muted_answer_recovery import (QUESTIONS, POISON, answer_all,
                                   answer_evidence, adversarial_test,
                                   actual_answer_pixel_support)


class AnswerRecoveryTests(unittest.TestCase):
    def setUp(self):
        names=[
            "sentence_1_part0","sentence_1_part1","sentence_2","sentence_3",
            "sentence_4","sentence_5_part0","sentence_5_part1",
            "source_hold","sentence_6"
        ]
        bounds=(0,1.61,3.47,10.85,16.58,23.38,25.71,27.35,31.25,34.34733)
        self.plan={"shots":[{"id":name,"startSec":bounds[i],
                 "endSec":bounds[i+1],"annotations":[]} for i,name in enumerate(names)]}
        lookup={s["id"]:s for s in self.plan["shots"]}
        for question in QUESTIONS:
            for scene,target in question[2]:
                existing=[a["text"] for a in lookup[scene]["annotations"]]
                if target in existing: continue
                i=len(existing)
                lookup[scene]["annotations"].append(
                    {"role":"science","text":target,
                     "boxPx":[70,450+i*95,700,510+i*95]})
        for source_text in ("Mitragynine • CID 3034396",
                            "CID = compound record number"):
            lookup["source_hold"]["annotations"].append({
                "role":"source","text":source_text,
                "boxPx":[70,750,720,816]})
        lookup["sentence_2"]["annotations"].append(
            {"role":"caption","text":"This hydroxyl group is a structural difference."})
        lookup["sentence_4"]["annotations"].append(
            {"role":"caption","text":"It is not footage of a molecule binding."})
        lookup["sentence_5_part1"]["annotations"].append(
            {"role":"caption","text":"not what its effects feel like."})
        self.good=np.full((1920,1080),20,dtype=np.uint8)
        for s in self.plan["shots"]:
            for a in s["annotations"]:
                if a["role"]=="caption":continue
                x1,y1,x2,y2=a["boxPx"]
                self.good[y1:y2,x1:x2:2]=230

    def test_five_answer_evidence_questions_independently_recoverable(self):
        self.assertEqual(answer_all(self.plan),{f"Q{i}":True for i in range(1,6)})

    def test_ten_counterfactuals_independently_reject_unsupported_answer(self):
        controls=adversarial_test(self.plan)
        self.assertEqual(len(controls),5)
        self.assertTrue(all(x["erasingKeyFactDropsAnswer"] for x in controls))
        self.assertTrue(all(x["addingContradictionDropsAnswer"] for x in controls))

    def test_each_deleted_answer_fact_rejects_exact_question(self):
        for q in QUESTIONS:
            with self.subTest(question=q[0]):
                changed=copy.deepcopy(self.plan)
                scene,target=q[2][-1]
                s=next(x for x in changed["shots"] if x["id"]==scene)
                s["annotations"]=[a for a in s["annotations"] if a["text"]!=target]
                self.assertFalse(answer_evidence(changed,q))

    def test_each_conflicting_science_statement_causes_refusal(self):
        for i,(qid,scene,poison) in enumerate(POISON):
            with self.subTest(id=qid):
                changed=copy.deepcopy(self.plan)
                s=next(x for x in changed["shots"] if x["id"]==scene)
                s["annotations"].append({"role":"science","text":poison,
                                         "boxPx":[70,450,680,510]})
                self.assertFalse(answer_evidence(changed,QUESTIONS[i]))

    def test_spoken_binding_disclaimer_required(self):
        changed=copy.deepcopy(self.plan)
        s=next(x for x in changed["shots"] if x["id"]=="sentence_4")
        s["annotations"]=[a for a in s["annotations"] if a["role"]!="caption"]
        self.assertFalse(answer_evidence(changed,QUESTIONS[2]))

    def test_spoken_not_is_not_optional(self):
        changed=copy.deepcopy(self.plan)
        s=next(x for x in changed["shots"] if x["id"]=="sentence_5_part1")
        next(a for a in s["annotations"] if a["role"]=="caption")["text"]="what effects feel like"
        self.assertFalse(answer_evidence(changed,QUESTIONS[3]))

    def test_silent_reference_card_must_be_readable_long_enough(self):
        changed=copy.deepcopy(self.plan)
        s=next(x for x in changed["shots"] if x["id"]=="source_hold")
        s["endSec"]=s["startSec"]+1.1
        self.assertFalse(answer_evidence(changed,QUESTIONS[4]))

    def test_real_frame_contrast_binds_all_question_facts(self):
        with patch("muted_answer_recovery.native_gray_frame",return_value=self.good):
            r=actual_answer_pixel_support("mock.mp4",self.plan)
        self.assertEqual(len(r),5)
        self.assertTrue(all(x["allRequiredAnswersInkVisible"] for x in r))

    def test_blank_video_cannot_pass_question_coverage(self):
        blank=np.zeros((1920,1080),dtype=np.uint8)
        with patch("muted_answer_recovery.native_gray_frame",return_value=blank):
            r=actual_answer_pixel_support("mock.mp4",self.plan)
        self.assertTrue(any(not x["allRequiredAnswersInkVisible"] for x in r))

    def test_source_referenced_answers_cannot_override_viewer_hold(self):
        # Claim truth is assessed from pixels + primary record graph, not from
        # fictional respondents or the pre-existing separate answer key.
        self.assertTrue(all(answer_all(self.plan).values()))
        self.assertFalse(any("audience" in k.lower() for k in answer_all(self.plan)))


if __name__=="__main__":
    unittest.main()
