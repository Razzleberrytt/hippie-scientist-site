"""Adversarial pixel fixtures, distinct from the true native film replay."""
import unittest,tempfile
from pathlib import Path
import numpy as np
import scene_text_temporal_qa as m

class TemporalTextContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        f=np.zeros((117,m.H,m.W),dtype='uint8')
        for name,y,size in m.LINES:
            f[:,y-m.Y0+5:y-m.Y0+60,126-m.X0+12:126-m.X0+130]=210
        cls.valid=f
    def test_valid_static_citations_present_all_frames(self):
        r=m.temporal_report(self.valid)
        self.assertEqual(r['decodedSceneFrames'],117)
        self.assertEqual(r['rowsChecked'],9)
        self.assertTrue(r['allSourceRowsEveryFramePass14pxResearchThreshold'])
        self.assertIs(r['mayPublish'],False)
    def test_partial_one_frame_disappearance_holds(self):
        f=self.valid.copy()
        y=m.LINES[4][1]-m.Y0
        f[110,y:y+80,:]=0
        with self.assertRaisesRegex(m.ReviewHold,'FACTUAL_TEXT_DISAPPEARS'):
            m.temporal_report(f)
    def test_30_native_row_text_too_small_holds(self):
        f=self.valid.copy()
        y=m.LINES[2][1]-m.Y0
        f[:,y:y+82,:]=0
        f[:,y+8:y+36,30:130]=190
        with self.assertRaisesRegex(m.ReviewHold,'TEXT_BELOW_MOBILE_320_IN_ANY_FRAME'):
            m.temporal_report(f)
    def test_one_frame_spurious_bright_text_flicker_holds(self):
        f=self.valid.copy()
        y=m.LINES[2][1]-m.Y0
        f[5,y+5:y+60,200:450]=255
        with self.assertRaisesRegex(m.ReviewHold,'FACTUAL_TEXT_FLICKER_OR_MUTATION'):
            m.temporal_report(f)
    def test_short_or_corrupt_grid_holds(self):
        with self.assertRaisesRegex(m.ReviewHold,'SCENE_FRAME_GRID_INVALID'):
            m.temporal_report(self.valid[:116])
    def test_dtype_mismatch_holds(self):
        with self.assertRaisesRegex(m.ReviewHold,'SCENE_FRAME_GRID_INVALID'):
            m.temporal_report(self.valid.astype('float32'))
    def test_wrong_movie_hash_holds_without_decoding(self):
        with tempfile.TemporaryDirectory() as td:
            p=Path(td)/'wrong.mp4';p.write_bytes(b'wrong')
            with self.assertRaisesRegex(m.ReviewHold,'WRONG_EXACT_FILM_SHA'):
                m.check_actual_frames(p)

if __name__=='__main__':unittest.main()
