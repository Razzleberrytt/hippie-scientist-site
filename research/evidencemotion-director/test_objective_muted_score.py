"""EvidenceMotion objective muted teaching score cannot mint fabricated 100%."""
import copy
import unittest

import numpy as np
from objective_muted_score import (BASE_PERCENT, AUTOMATED_CAP_PERCENT,
                                   evaluate, compare_transfer_frames)


class ObjectiveMutedScoreTests(unittest.TestCase):
    def setUp(self):
        ids = (
            "sentence_1_part0", "sentence_1_part1", "sentence_2", "sentence_3",
            "sentence_4", "sentence_5_part0", "sentence_5_part1",
            "source_hold", "sentence_6"
        )
        bounds = (0, 1.61, 3.47, 10.85, 16.58, 23.379999,
                  25.709999, 27.35, 31.25, 34.347333)
        words = (
            ["7-OH vs\nmitragynine", "MITRAGYNINE",
             "Separate structures • no reaction"],
            ["7-OH vs\nmitragynine", "7-OH",
             "Separate structures • no reaction"],
            ["Look at the\nhydroxyl group.", "–OH group: oxygen + hydrogen"],
            ["Dots mark atoms. Lines mark bonds."],
            ["A possible\n3D shape.", "Computed 3D illustration • not filmed"],
            ["STRUCTURE"],
            ["HUMAN EXPERIENCE"],
            ["PubChem", "7-OH • CID 44301524", "CID = compound record number",
             "Mitragynine • CID 3034396"],
            ["Look closer."]
        )
        self.plan={"shots":[
            {"id": id, "startSec": bounds[i], "endSec": bounds[i+1],
             "annotations":[{"role":"science","text":text} for text in annotations]}
            for i,(id,annotations) in enumerate(zip(ids,words))
        ]}
        self.variance = {k:22. for k in
                         ("opening","chemical_detail","computed_model","source_card")}
        self.transfer={"structureComparisonVisiblyDifferent":True,
                       "negationPayoffVisibleWithStableScience":True}

    def score(self, **kwargs):
        return evaluate(self.plan, image_variation=kwargs.get("pixel",self.variance),
                        safe_zone_pass=kwargs.get("safe",True),
                        identical_soundoff_stream=kwargs.get("silent",True),
                        transfer_evidence=kwargs.get("transfer",self.transfer))

    def test_all_ten_proxies_still_withhold_viewer_approval(self):
        x=self.score()
        self.assertEqual(x["currentStepObjectiveProgressPercent"],92)
        self.assertEqual(x["microChecksPassed"],12)
        self.assertEqual(x["baseEvidencePercent"],80)
        self.assertFalse(x["actualUnfamiliarViewerComprehensionVerified"])
        self.assertFalse(x["mayPublish"])
        self.assertEqual(x["automaticScoreCeilingPercent"],92)

    def test_missing_first_cid_definition_fails_two_independent_guards(self):
        self.plan["shots"][7]["annotations"] = [
            a for a in self.plan["shots"][7]["annotations"]
            if "CID =" not in a["text"]]
        x=self.score()
        self.assertEqual(x["currentStepObjectiveProgressPercent"],90)
        self.assertFalse(next(c["passed"] for c in x["measured"]
                              if c["code"]=="first_use_cid_defined"))

    def test_jargon_3d_without_plain_language_fails(self):
        self.plan["shots"][4]["annotations"][0]["text"]="The pose\nis computed."
        x=self.score()
        self.assertEqual(x["microChecksPassed"],11)
        self.assertFalse(next(c["passed"] for c in x["measured"]
                              if c["code"]=="computed_shape_no_real_binding_claim"))

    def test_early_claim_spoiler_not_accepted(self):
        self.plan["shots"][5]["annotations"].append(
            {"role":"science","text":"HUMAN EXPERIENCE"})
        self.assertEqual(self.score()["microChecksPassed"],11)

    def test_deleted_mute_track_proof_is_not_faked(self):
        x=self.score(silent=False)
        self.assertEqual(x["currentStepObjectiveProgressPercent"],91)
        self.assertFalse(x["mayPublish"])

    def test_blanked_encoded_frames_not_counted(self):
        x=self.score(pixel={})
        self.assertEqual(x["currentStepObjectiveProgressPercent"],91)

    def test_platform_unsafe_content_not_counted(self):
        x=self.score(safe=False)
        self.assertEqual(x["microChecksPassed"],11)

    def test_source_card_too_fast_to_read_not_counted(self):
        self.plan["shots"][7]["endSec"]=self.plan["shots"][7]["startSec"]+1.5
        x=self.score()
        self.assertFalse(next(c["passed"] for c in x["measured"]
                              if c["code"]=="source_card_held_and_defined"))

    def test_unknown_duplicate_shots_fail_closed(self):
        self.plan["shots"][8]["id"]="sentence_5_part1"
        with self.assertRaisesRegex(ValueError,"UNKNOWN_OR_REORDERED"):
            self.score()

    def test_cannot_make_any_invented_viewer_comprehension_pass(self):
        for remove in range(10):
            fixture=copy.deepcopy(self.plan)
            self.plan["shots"][1]["annotations"]=[]
            score=self.score()
            self.assertFalse(score["actualUnfamiliarViewerComprehensionVerified"])
            self.assertLessEqual(score["currentStepObjectiveProgressPercent"],92)
            self.plan=fixture


    def test_transfer_challenges_require_actual_source_differences(self):
        frames=[np.zeros((1920,1080,3),dtype=np.uint8) for _ in range(4)]
        frames[1][620:1060,155:765,:]=100
        frames[3][1132:1290,70:840,:]=110
        obs=compare_transfer_frames(*frames)
        self.assertTrue(obs["structureComparisonVisiblyDifferent"])
        self.assertTrue(obs["negationPayoffVisibleWithStableScience"])
        self.assertEqual(obs["sourceGraphStabilityAtNegationPixelMad"],0)
        scored=self.score(transfer=obs)
        self.assertEqual(scored["currentStepObjectiveProgressPercent"],92)
        self.assertFalse(scored["actualUnfamiliarViewerComprehensionVerified"])

    def test_static_opening_identical_graph_fails_comparison(self):
        frames=[np.zeros((1920,1080,3),dtype=np.uint8) for _ in range(4)]
        frames[3][1132:1290,70:840,:]=100
        obs=compare_transfer_frames(*frames)
        self.assertFalse(obs["structureComparisonVisiblyDifferent"])
        self.assertTrue(obs["negationPayoffVisibleWithStableScience"])
        self.assertEqual(self.score(transfer=obs)["currentStepObjectiveProgressPercent"],91)

    def test_negative_payoff_not_visible_fails(self):
        frames=[np.zeros((1920,1080,3),dtype=np.uint8) for _ in range(4)]
        frames[1][620:1060,155:765,:]=100
        obs=compare_transfer_frames(*frames)
        self.assertTrue(obs["structureComparisonVisiblyDifferent"])
        self.assertFalse(obs["negationPayoffVisibleWithStableScience"])
        self.assertEqual(self.score(transfer=obs)["currentStepObjectiveProgressPercent"],91)

    def test_fabricated_chemical_reaction_at_negation_fails_stability(self):
        frames=[np.zeros((1920,1080,3),dtype=np.uint8) for _ in range(4)]
        frames[1][620:1060,155:765,:]=100
        frames[3][1132:1290,70:840,:]=100
        frames[3][620:1060,155:765,:]=100
        obs=compare_transfer_frames(*frames)
        self.assertGreater(obs["sourceGraphStabilityAtNegationPixelMad"],1)
        self.assertFalse(obs["negationPayoffVisibleWithStableScience"])

    def test_wrong_frame_shape_refused(self):
        bad=np.zeros((320,180,3),dtype=np.uint8)
        with self.assertRaisesRegex(ValueError,"EXACT_UNALTERED_NATIVE_RGB"):
            compare_transfer_frames(*([bad]*4))

    def test_unproven_pixel_transfer_not_credited(self):
        self.assertEqual(self.score(transfer={})["currentStepObjectiveProgressPercent"],90)
        self.assertFalse(self.score(transfer={})["mayPublish"])


if __name__ == "__main__":
    unittest.main()
