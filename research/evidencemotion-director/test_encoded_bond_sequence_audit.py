"""Fail-closed tests for encoded RDKit six-bond teaching order and color ink."""
import unittest
import numpy as np

from encoded_bond_sequence_audit import (
    H,W,expected_cue_counts,amber_pixels_near,
    MIN_VISIBLE_AMBER,MAX_UNSHOWN_AMBER)

class EncodedBondSequenceTests(unittest.TestCase):
    def test_exact_progression_seven_sample_requirements(self):
        rows=[{"active":i,"visible":i} for i in range(7)]
        self.assertTrue(expected_cue_counts(rows))
        deleted=[dict(x) for x in rows]
        deleted[3]["visible"]=2
        with self.assertRaisesRegex(ValueError,"UNEXPECTED_SOURCE_PIXEL_MARKER_ORDER"):
            expected_cue_counts(deleted)
        premature=[dict(x) for x in rows]
        premature[0]["visible"]=1
        with self.assertRaisesRegex(ValueError,"VISIBLE_BEFORE_SPOKEN_CUE"):
            expected_cue_counts(premature)

    def test_source_marker_color_comes_from_decode_not_annotation_metadata(self):
        f=np.zeros((H,W,3),dtype=np.uint8)
        x,y=420,900
        self.assertEqual(amber_pixels_near(f,x,y),0)
        f[y-10:y+10,x-10:x+10]=[255,193,100]
        self.assertGreater(amber_pixels_near(f,x,y),MIN_VISIBLE_AMBER)
        f[y-10:y+10,x-10:x+10]=[100,100,100]
        self.assertLessEqual(amber_pixels_near(f,x,y),MAX_UNSHOWN_AMBER)

    def test_noise_and_missing_media_fail_closed(self):
        with self.assertRaisesRegex(ValueError,"SOURCE_FRAME"):
            amber_pixels_near(np.zeros((540,960,3),dtype=np.uint8),420,900)
        with self.assertRaisesRegex(ValueError,"SOURCE_MARKER_OFF_FILM"):
            amber_pixels_near(np.zeros((H,W,3),dtype=np.uint8),1080,900)
        with self.assertRaisesRegex(ValueError,"WRONG_SPEECH_BOUND_PIXEL_COUNT"):
            expected_cue_counts([{"active":i,"visible":i} for i in range(6)])

if __name__=="__main__":
    unittest.main()
