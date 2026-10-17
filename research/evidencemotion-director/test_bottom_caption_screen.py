"""Lane4 negative controls for actual decoded bottom zone video proof."""
import hashlib,subprocess,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
import bottom_caption_screen as guard
from bottom_caption_screen import measure_bright_ink,check_frames,run_movie,source_sha,BRIGHT_THRESHOLDS

H='e'*64

def frame(i, n=8, bright=0):
    return {'index':i,'thresholds':{str(t):bright for t in BRIGHT_THRESHOLDS}}

def paint_rect(y1,y2,x1,x2,color):
    data=bytearray(160*800*3)
    pixels=bytes(color)*(x2-x1)
    for y in range(y1,y2):
        start=(y*800+x1)*3
        data[start:start+len(pixels)]=pixels
    return data

class BottomCaptionScreenTests(unittest.TestCase):
    def test_bright_caption_inside_crop_holds(self):
        arr=paint_rect(25,58,110,570,(245,242,233))
        result=measure_bright_ink(arr)
        self.assertTrue(result['flagged']);self.assertEqual(result['nativeBBox'],[250,1601,709,1633])
    def test_outside_colored_art_not_confused_with_pale_caption(self):
        arr=paint_rect(25,58,110,570,(10,230,245))
        self.assertFalse(measure_bright_ink(arr)['flagged'])
    def test_no_numpy_fallback_agrees_with_numpy_accelerated_path_if_available(self):
        raw=paint_rect(25,58,110,570,(245,242,233))
        normal=measure_bright_ink(raw)
        with patch.object(guard,"np",None):
            fallback=guard.measure_bright_ink(raw)
        self.assertEqual(normal,fallback)

    def test_single_pixel_is_not_fake_large_caption(self):
        arr=paint_rect(25,26,110,111,(245,245,245))
        r=measure_bright_ink(arr);self.assertEqual(r['count'],1);self.assertFalse(r['flagged'])
    def test_no_ink_cannot_certify_publish(self):
        receipt=check_frames([frame(i) for i in range(8)],expected_frames=8,expected_movie_sha=H)
        self.assertFalse(receipt['mayPublish']);self.assertEqual(receipt['researchVerdict'],'NEGATIVE_SCREEN_EMPTY_REVIEW_REQUIRED')
    def test_one_transient_frame_is_not_missed(self):
        xs=[frame(i,bright=500 if i==3 else 0) for i in range(8)]
        r=check_frames(xs,expected_frames=8,expected_movie_sha=H)
        self.assertEqual(r['frameCountsByInkThreshold']['140'],1);self.assertEqual(r['researchVerdict'],'POTENTIAL_BOTTOM_UI_INK_COLLISION_HOLD')
    def test_duplicate_missing_and_reordered_frames_rejected(self):
        for vals in ([0,1,2,3,3,5,6,7],[0,1,2,4,5,6,7],[0,2,1,3,4,5,6,7]):
            with self.subTest(vals=vals),self.assertRaisesRegex(ValueError,'MISSING_DUPLICATED_OR_OUT_OF_ORDER_FRAMES'):
                check_frames([frame(i) for i in vals],expected_frames=8,expected_movie_sha=H)
    def test_bad_threshold_schema_and_boolean_pixel_counts_rejected(self):
        xs=[frame(i) for i in range(8)];xs[2]['thresholds'].pop('195')
        with self.assertRaisesRegex(ValueError,'THRESHOLD_SET_CHANGED'):check_frames(xs,expected_frames=8,expected_movie_sha=H)
        xs=[frame(i) for i in range(8)];xs[2]['thresholds']['140']=True
        with self.assertRaisesRegex(ValueError,'INVALID_PIXEL_COUNT'):check_frames(xs,expected_frames=8,expected_movie_sha=H)
    def test_wrong_sha_fails_before_any_decode(self):
        with tempfile.TemporaryDirectory() as td:
            p=Path(td)/'not_movie.mp4';p.write_bytes(b'not a movie')
            with self.assertRaisesRegex(ValueError,'EXACT_FILM_SHA_MISMATCH'):run_movie(p,H,8)
    def test_actual_short_h264_with_single_ink_event(self):
        with tempfile.TemporaryDirectory() as td:
            movie=Path(td)/'synthetic.mp4'
            cmd=['ffmpeg','-nostdin','-v','error','-f','lavfi','-i','color=c=black:s=1080x1920:r=30',
                '-vf',"drawbox=x=200:y=1600:w=350:h=40:color=white:t=fill:enable='eq(n,3)'",'-frames:v','8',
                '-an','-c:v','libx264','-preset','ultrafast','-crf','12','-pix_fmt','yuv420p',str(movie)]
            subprocess.run(cmd,check=True,timeout=35)
            r,frames=run_movie(movie,source_sha(movie),8)
            self.assertEqual(len(frames),8)
            self.assertEqual(r['frameCountsByInkThreshold']['140'],1)
            self.assertFalse(r['mayPublish'])

if __name__=='__main__':unittest.main()