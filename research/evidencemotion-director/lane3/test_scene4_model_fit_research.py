"""Research-only body-pixel source-fit negative and positive fixtures."""
import tempfile
import unittest
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops
import scene4_model_fit_research as M

class FitContracts(unittest.TestCase):
    def setUp(self):
        self.current=Image.new('RGB',(M.W,M.H),(12,31,44))
        self.archived=Image.new('RGB',(M.W,M.H),(9,27,41))
        draw=ImageDraw.Draw(self.archived)
        draw.ellipse((95,710,145,760),fill=(215,225,230))
        draw.ellipse((630,990,680,1040),fill=(220,92,38))
    def test_source_cue_does_not_add_model_before_word_computed(self):
        for n in (M.FIRST,520,M.COMPUTED-1):
            self.assertEqual(M.reframe(self.current,self.archived,n).tobytes(),
                             self.current.tobytes())
    def test_model_reframe_preserves_every_pixel_outside_edit_box(self):
        out=M.reframe(self.current,self.archived,M.COMPUTED)
        x0,y0,x1,y1=M.ERASE
        for region in ((0,0,M.W,y0),(0,y1,M.W,M.H),(0,y0,x0,y1),(x1,y0,M.W,y1)):
            self.assertIsNone(ImageChops.difference(out.crop(region),
                                                    self.current.crop(region)).getbbox())
        self.assertIsNotNone(ImageChops.difference(out.crop(M.TARGET),
                                                  self.current.crop(M.TARGET)).getbbox())
    def test_full_source_model_extents_remain_visible(self):
        out=M.reframe(self.current,self.archived,630)
        data=out.crop(M.TARGET).tobytes()
        values=zip(data[::3],data[1::3],data[2::3])
        self.assertTrue(any(p[0]>180 and p[1]>180 and p[2]>180 for p in values))
        values=zip(data[::3],data[1::3],data[2::3])
        self.assertTrue(any(p[0]>180 and p[1]<120 and p[2]<120 for p in values))
    def test_truncated_model_fragments_erased_but_footer_glyph_pixels_untouched(self):
        # Physical screenshot discovered ghost fragments immediately above
        # the authored disclosure. A negative fixture reproduces the hazard.
        source=self.current.copy()
        pen=ImageDraw.Draw(source)
        pen.rectangle((565,945,930,959),fill=(220,216,209))
        pen.rectangle((565,964,870,981),fill=(204,208,216))
        cleaned=M.reframe(source,self.archived,630)
        # White model tail removed all the way to the footer threshold.
        self.assertEqual(cleaned.crop((565,945,930,960)).getpixel((0,7)),
                         (14,36,48))
        for y in (960,963,964,972,981,985):
            self.assertEqual(cleaned.crop((507,y,997,y+1)).tobytes(),
                             source.crop((507,y,997,y+1)).tobytes())
        # No pre-onset erasure is permitted, even if bad pixels exist.
        self.assertEqual(M.reframe(source,self.archived,554).tobytes(),source.tobytes())
        self.assertFalse(M.reframe(source,self.archived,630).tobytes()==source.tobytes())

    def test_bounds_missing_source_wrong_shape_and_unknown_media_fail_closed(self):
        for n in (M.FIRST-1,M.LAST):
            with self.assertRaisesRegex(M.CraftHold,'OUT_OF_BOUNDS'):
                M.reframe(self.current,self.archived,n)
        with self.assertRaisesRegex(M.CraftHold,'NATIVE_FRAME'):
            M.reframe(self.current,Image.new('RGB',(100,100)),630)
        with tempfile.TemporaryDirectory() as d:
            fake=Path(d)/'film.mp4';fake.write_bytes(b'forged')
            with self.assertRaisesRegex(M.CraftHold,'REVISED_FILM_SHA_MISMATCH'):
                M.preflight(fake,'missing','missing','missing')
    def test_locked_ids_geometry_and_nonpublishing_contract(self):
        self.assertEqual((M.W,M.H,M.FPS,M.N),(1080,1920,30,1031))
        self.assertEqual((M.FIRST,M.COMPUTED,M.LAST),(498,555,702))
        self.assertEqual(M.ORIGINAL_MODEL,(35,650,800,1080))
        self.assertEqual(M.TARGET,(507,650,997,932))
        self.assertEqual(M.ERASE,(507,650,997,960))
        self.assertEqual(M.FOOTER_START,960)
        for key in ('REVISED_SHA','ORIGINAL_SHA','STORY_SHA','MOL_SHA','NARRATION_SHA'):
            self.assertRegex(getattr(M,key),r'^[a-f0-9]{64}$')
if __name__=='__main__':unittest.main()
