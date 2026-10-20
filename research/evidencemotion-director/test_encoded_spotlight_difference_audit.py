"""Adversarial checks for original-voice encoded oxygen-locus contrast."""
import unittest
import numpy as np
from encoded_spotlight_difference_audit import (
    H,W,measure_stage_difference,evaluate,hold,
    MIN_INSIDE_CHANGED_PIXELS)


class EncodedResearchDirectionChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.baseline=np.zeros((H,W,3),dtype=np.uint8)
        cls.center=(622,945,32)

    def frame_with_locus(self):
        candidate=self.baseline.copy()
        cx,cy,r=self.center
        # Deliberately localized evidence that is not caption text.
        candidate[cy-36:cy+36,cx-36:cx+36,:]=[255,190,80]
        return candidate

    def test_source_locus_only_after_acoustic_reveal_passes(self):
        before=(self.baseline.copy(),self.baseline)
        after=(self.frame_with_locus(),self.baseline)
        result=evaluate(before,[after,after],self.center)
        self.assertTrue(result["spotlightOnlyAfterOriginalSpeech"])
        self.assertGreaterEqual(result["after"][0]["changedInsideSourceLocus"],
                                MIN_INSIDE_CHANGED_PIXELS)
        self.assertEqual(result["after"][0]["changedOutsideSourceLocus"],0)

    def test_premature_highlight_fails_hard(self):
        before=(self.frame_with_locus(),self.baseline)
        after=(self.frame_with_locus(),self.baseline)
        with self.assertRaisesRegex(ValueError,"BEFORE_FROZEN"):
            evaluate(before,[after],self.center)

    def test_wrong_off_source_area_fails_hard(self):
        off=self.frame_with_locus()
        off[610:690,105:185,:]=[255,190,80]
        with self.assertRaisesRegex(ValueError,"NON_SOURCE_CHEMISTRY"):
            evaluate((self.baseline,self.baseline),
                     [(off,self.baseline)],self.center)

    def test_no_actual_focus_fails_hard(self):
        with self.assertRaisesRegex(ValueError,"NOT_VISIBLY_HIGHLIGHTED"):
            evaluate((self.baseline,self.baseline),
                     [(self.baseline,self.baseline)],self.center)

    def test_reject_wrong_geometry_and_untrusted_frame_dimensions(self):
        with self.assertRaisesRegex(ValueError,"TWO_INDEPENDENT_ACTUAL_RGB"):
            measure_stage_difference(np.zeros((540,960,3),dtype=np.uint8),
                                     self.baseline,self.center)
        with self.assertRaisesRegex(ValueError,"SOURCE_LOCUS_NOT_SAFE"):
            measure_stage_difference(self.baseline,self.baseline,(1020,945,32))
        with self.assertRaisesRegex(ValueError,"SOURCE_GEOMETRY_REQUIRED"):
            measure_stage_difference(self.baseline,self.baseline,("622",945,32))


if __name__=="__main__":
    unittest.main()
