"""Fault injection: read only independently decoded screenshot text, not plans."""
import unittest

from actual_pixel_text_recovery import (SECONDS, BANNED, recover,
                                        critical_negatives)

class ActualPixelReadingTests(unittest.TestCase):
    def setUp(self):
        # Deliberately representative *lossy* OCR, NOT an official ground
        # truth transcript and not any prewritten storyboard annotation.
        self.frames={
            "compound_a":("THE HIPPIE SCIENTIST\n7-OH vs\nmitragynine\n"
                          "MITRAGYNINE\nSeparate structures * no reaction\n"
                          "What makes seven O H different\nfrom mitragynine?\n"),
            "compound_b":("THE HIPPIE SCIENTIST\n7-OH vs\nmitragynine\n"
                          "7-OH\nSeparate structures * no reaction\n"),
            "hydroxyl":("Look at the\nhydroxyl group\n"
                        "-OH group: oxygen + hydrogen\n"
                        "This hydroxyl group is a\nstructural difference\n"),
            "computed_shape":("A possible\n3D shape.\n"
                              "Computed 3D illustration ¢ not filmed\n"
                              "It is not footage of\na molecule binding\n"),
            "human_effect_limit":("What it cannot\ntell us.\n"
                                  "STRUCTURE\nHUMAN EXPERIENCE\n"
                                  "not what its effects feel like.\n"),
            "source_hold":("Mitragynine * CID 3034396\nPubChem\n"
                           "7-OH * CID 44301524\nCID = compound record number\n"
                           "pubchem.ncbi.nim.nih.gov\n")
        }

    def test_five_distinct_questions_recovered_from_lossy_visual_text(self):
        self.assertEqual(recover(self.frames),{
            "q1":True,"q2":True,"q3":True,"q4":True,"q5":True})

    def test_compact_opening_keeps_individual_identity_and_no_reaction(self):
        self.frames['compound_a']='MITRAGYNINE\nNo reaction\nWhat makes seven O H'
        self.frames['compound_b']='7-OH\nNo reaction\ndifferent from mitragynine?'
        self.assertTrue(recover(self.frames)['q1'])
        self.frames['compound_b']=self.frames['compound_a']
        self.assertFalse(recover(self.frames)['q1'])

    def test_compact_opening_cannot_drop_no_reaction_disclosure(self):
        self.frames['compound_a']='MITRAGYNINE\nWhat makes seven O H'
        self.assertFalse(recover(self.frames)['q1'])

    def test_six_blank_single_frame_dropouts_each_invalidate_relevant_answer(self):
        rows=critical_negatives(self.frames,"")
        self.assertEqual(len(rows),10)
        self.assertTrue(all(r["rejected"] for r in rows))
        self.assertEqual({r["target"] for r in rows},
                         {"q1","q2","q3","q4","q5"})

    def test_full_duplicate_first_compound_frame_fails_distinction(self):
        altered=dict(self.frames)
        altered["compound_b"]=self.frames["compound_a"]
        self.assertFalse(recover(altered)["q1"])

    def test_source_card_not_substitutable_by_hook(self):
        altered=dict(self.frames)
        altered["source_hold"]=self.frames["compound_a"]
        self.assertFalse(recover(altered)["q5"])

    def test_placeholder_factual_text_is_not_extracted_from_announcement(self):
        altered=dict(self.frames)
        altered["hydroxyl"]="Look at the hydroxyl group"
        self.assertFalse(recover(altered)["q2"])

    def test_computed_shape_without_unfilmed_disclaimer_is_unanswerable(self):
        altered=dict(self.frames)
        altered["computed_shape"]="A possible 3D shape. Computed 3D illustration"
        self.assertFalse(recover(altered)["q3"])

    def test_no_justification_without_not_effect_caption(self):
        altered=dict(self.frames)
        altered["human_effect_limit"]="HUMAN EXPERIENCE\n"
        self.assertFalse(recover(altered)["q4"])

    def test_every_named_cid_required_in_true_pixel_source_card(self):
        for cid in ("3034396","44301524"):
            with self.subTest(cid=cid):
                altered=dict(self.frames)
                altered["source_hold"]=altered["source_hold"].replace(cid,"000000")
                self.assertFalse(recover(altered)["q5"])

    def test_no_faked_overly_reassuring_human_effects_claim(self):
        for poison in BANNED:
            with self.subTest(poison=poison):
                altered=dict(self.frames)
                altered["computed_shape"]+="\n"+poison
                self.assertFalse(any(recover(altered).values()))

    def test_black_screen_cannot_satisfy_science_q(self):
        self.assertFalse(any(recover({name:"" for name in SECONDS}).values()))

    def test_unexpected_missing_screenshot_fails_closed(self):
        altered=dict(self.frames)
        del altered["source_hold"]
        with self.assertRaisesRegex(ValueError,"EXACT_SIX_ACTUAL_FRAME_SLOTS"):
            recover(altered)

    def test_both_real_cids_swapped_between_compound_names_fail_closed(self):
        card=self.frames["source_hold"]
        swapped=(card.replace("3034396","__TEMP_CID__")
                      .replace("44301524","3034396")
                      .replace("__TEMP_CID__","44301524"))
        altered=dict(self.frames,source_hold=swapped)
        self.assertIn("3034396",swapped)
        self.assertIn("44301524",swapped)
        self.assertFalse(recover(altered)["q5"])

    def test_both_valid_cids_without_pairwise_name_labels_fail_closed(self):
        card=self.frames["source_hold"]
        altered=dict(self.frames)
        altered["source_hold"]=card.replace("7-OH * CID 44301524",
                                             "CID 44301524")
        self.assertIn("3034396",altered["source_hold"])
        self.assertIn("44301524",altered["source_hold"])
        self.assertFalse(recover(altered)["q5"])

    def test_ocr_can_be_messy_but_comprehension_is_not_claimed(self):
        self.assertTrue(all(recover(self.frames).values()))
        # Human comprehension is categorically not inferred by this
        # module's output; this test cannot set any 'viewer passed' flag.
        self.assertFalse(any("participant" in k for k in recover(self.frames)))


if __name__=="__main__":
    unittest.main()
