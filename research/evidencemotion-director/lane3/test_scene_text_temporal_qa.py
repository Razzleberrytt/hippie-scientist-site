"""Adversarial pixel fixtures, distinct from the true native film replay."""
import unittest,tempfile
from pathlib import Path
import scene_text_temporal_qa as m
np=m.np

@unittest.skipUnless(np is not None,"NumPy native-array fixtures unavailable in this hosted runner; portable safety rules still tested")
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
    def test_first_pixel_of_next_cid_cannot_inflate_previous_7oh_height(self):
        f=self.valid.copy()
        row_y=m.LINES[4][1]-m.Y0
        f[:,row_y,126-m.X0+550:126-m.X0+600]=225
        report=m.temporal_report(f)
        seven=next(x for x in report['textRows'] if x['text']=='7-OH')
        self.assertEqual(seven['nativeYWindowHalfOpen'],[906,985])
        self.assertEqual(seven['minNativeInkRows'],55)
        self.assertEqual(seven['maxNativeInkRows'],55)
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

class PortableRowSafetyTests(unittest.TestCase):
    def test_nonoverlapping_source_windows_never_see_next_line(self):
        result=m.nonoverlapping_text_windows()
        self.assertEqual(len(result),9)
        self.assertEqual(next((start,end) for name,start,end in result if name=='7-OH'),(906,985))
        self.assertEqual(next((start,end) for name,start,end in result if name=='CID = compound'),(1160,1232))
    def test_invalid_or_reversed_row_definitions_hold(self):
        for bad in [[('a',906,76),('b',905,10)],[('a',906,0)]]:
            with self.assertRaisesRegex(m.ReviewHold,'FACTUAL_ROW_GEOMETRY_INVALID'):
                m.nonoverlapping_text_windows(bad)
    def test_same_actual_valid_number_of_frames(self):
        self.assertTrue(m.validate_row_stats('CID 3034396',[52]*117,0.12259,808,117))
    def test_single_frame_missing_or_shrunken_citation_holds(self):
        with self.assertRaisesRegex(m.ReviewHold,'TEXT_BELOW_MOBILE_320_IN_ANY_FRAME'):
            m.validate_row_stats('CID 3034396',[52]*116+[20],0.0,808,117)
    def test_altered_time_window_cannot_satisfy_complete_check(self):
        with self.assertRaisesRegex(m.ReviewHold,'FACTUAL_TEXT_FRAME_COVERAGE_INVALID'):
            m.validate_row_stats('CID 3034396',[52]*116,0.0,808,116)
    def test_text_flicker_holds_without_numeric_library(self):
        with self.assertRaisesRegex(m.ReviewHold,'FACTUAL_TEXT_FLICKER_OR_MUTATION'):
            m.validate_row_stats('CID 3034396',[52]*117,10.0,808,117)
    def test_unsafe_right_line_holds_without_numeric_library(self):
        with self.assertRaisesRegex(m.ReviewHold,'TEXT_OUTSIDE_EDITED_SAFE_CARD'):
            m.validate_row_stats('CID 3034396',[52]*117,0.0,835,117)
    def test_invalid_stat_input_holds(self):
        with self.assertRaisesRegex(m.ReviewHold,'FACTUAL_TEXT_FRAME_COVERAGE_INVALID'):
            m.validate_row_stats('CID 3034396',[52]*116+[-1],0.0,808,117)
    def test_original_film_identity_bound(self):
        with tempfile.TemporaryDirectory() as td:
            p=Path(td)/'tampered.mp4';p.write_bytes(b'tampered')
            if np is None:
                with self.assertRaisesRegex(m.ReviewHold,'NUMPY_REQUIRED_FOR_NATIVE_FILM_ANALYSIS'):
                    m.check_actual_frames(p)
            else:
                with self.assertRaisesRegex(m.ReviewHold,'WRONG_EXACT_FILM_SHA'):
                    m.check_actual_frames(p)

if __name__=='__main__':unittest.main()
