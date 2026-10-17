from pathlib import Path
import tempfile,unittest
from PIL import Image,ImageDraw
import decoded_craft_motion_review as m

class PhysicalMotionReviewContract(unittest.TestCase):
    def test_entirely_static_synthetic_frames_flagged(self):
        f=[Image.new('L',(m.W,m.H),20) for _ in range(100)]
        result=m.summarize(m.process_frames(f),0,99)
        self.assertEqual(result['pairwiseFrames'],99)
        self.assertTrue(result['staticCompositionReviewCandidate'])
        self.assertEqual(result['medianGrayDelta255'],0)
    def test_nonstatic_bright_to_dark_is_not_false_static(self):
        f=[Image.new('L',(m.W,m.H),0 if i%2 else 255) for i in range(110)]
        self.assertFalse(m.summarize(m.process_frames(f),0,109)['staticCompositionReviewCandidate'])
    def test_source_hash_fail_closed(self):
        with tempfile.TemporaryDirectory() as td:
            p=Path(td)/'fake';p.write_bytes(b'fake')
            with self.assertRaisesRegex(m.Hold,'PINNED_FILM_BYTES_MISMATCH'):
                m.decode_stream(p,'a'*64)
    def test_frame_geometry_required(self):
        with self.assertRaisesRegex(m.Hold,'WRONG_GRAYSCALE_FRAME_GEOMETRY'):
            m.process_frames([Image.new('L',(119,214)),Image.new('L',(119,214))])
    def test_ignore_beat_initial_cut(self):
        f=[Image.new('L',(m.W,m.H),i*100 if i<2 else 100) for i in range(100)]
        s=m.summarize(m.process_frames(f),1,99)
        self.assertEqual(s['medianGrayDelta255'],0)
        self.assertTrue(s['staticCompositionReviewCandidate'])
    def test_require_both_source_and_sha(self):
        with self.assertRaisesRegex(m.Hold,'SOURCE_NEEDS_SHA_PIN'):
            m.review('x','y',source='unbound',source_sha=None)
    def test_transitions_index_later_frame(self):
        a=Image.new('L',(m.W,m.H),0)
        b=Image.new('L',(m.W,m.H),20)
        self.assertEqual(m.process_frames([a,b],start=15),[(16,20.0)])
    def test_story_grid_is_explicit_and_nonapproving(self):
        self.assertEqual(len(m.BEATS),8)
        self.assertEqual(m.BEATS['scene4_3d_555_701'],(555,701))
    def test_moving_lower_caption_does_not_fake_science_stage_motion(self):
        a=Image.new('L',(m.W,m.H),0);b=a.copy()
        ImageDraw.Draw(b).rectangle((0,180,119,213),fill=255)
        self.assertGreater(m.frame_delta(a,b),1)
        self.assertEqual(m.frame_delta(a,b,m.HERO_BOX),0)
    def test_branding_header_does_not_fake_science_stage_motion(self):
        a=Image.new('L',(m.W,m.H),0);b=a.copy()
        ImageDraw.Draw(b).rectangle((0,0,119,25),fill=255)
        self.assertEqual(m.frame_delta(a,b,m.HERO_BOX),0)
    def test_reject_invalid_subject_roi(self):
        f=[Image.new('L',(m.W,m.H),0)]*3
        with self.assertRaisesRegex(m.Hold,'INVALID_SUBJECT_ROI'):
            m.process_frames(f,box=(10,10,121,100))
    def test_reading_source_card_not_automatic_visual_failure(self):
        self.assertIn('source_card_821_937',m.INTENTIONAL_HOLD_BEATS)
        self.assertNotIn('scene4_3d_555_701',m.INTENTIONAL_HOLD_BEATS)

if __name__=='__main__':unittest.main()
