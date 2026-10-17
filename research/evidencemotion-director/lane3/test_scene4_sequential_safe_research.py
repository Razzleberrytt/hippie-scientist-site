"""Fail-closed research tests; synthetic pixels do NOT certify original media."""
from pathlib import Path
import tempfile, unittest
from PIL import Image, ImageFont
import scene4_sequential_safe_research as s

FONT=Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
class SafeSequenceTest(unittest.TestCase):
    def setUp(self):
        self.source=Image.new('RGB',(1080,450),(7,27,41))
        self.source.paste((15,185,210),(105,728-s.ROI_TOP,445,918-s.ROI_TOP))
        self.source.paste((230,130,40),(518,704-s.ROI_TOP,1010,924-s.ROI_TOP))
    def render(self,n):return s.make_overlay(self.source,n,FONT)
    def test_real_cue_frame_boundaries_are_constant(self):
        self.assertEqual((s.FIRST,s.THREED_START,s.CAVEAT_START,s.LAST),(498,555,595,701))
    def test_only_native_real_stage_inputs_accepted(self):
        with self.assertRaises(s.ResearchHold):s.make_overlay(Image.new('RGB',(96,170)),630,FONT)
        with self.assertRaises(s.ResearchHold):s.make_overlay(self.source,702,FONT)
    def test_caveat_strict_onset(self):
        self.assertNotEqual(self.render(594).tobytes(),self.render(595).tobytes())
        self.assertNotEqual(self.render(554).tobytes(),self.render(555).tobytes())
    def test_2d_3d_science_art_not_redrawn(self):
        for n,box,target in [(530,s.ART_2D,(480,268)),(630,s.ART_3D,(600,268))]:
            out=self.render(n)
            crop=self.source.crop((box[0],box[1]-s.ROI_TOP,box[2],box[3]-s.ROI_TOP)).convert('RGBA')
            copied=crop.resize(target,Image.Resampling.LANCZOS)
            x=(65+835-target[0])//2
            # Pixel within inset science pixels but away from overlaid titles/footers.
            self.assertEqual(out.getpixel((x+target[0]//2,106+target[1]//2)),copied.getpixel((target[0]//2,target[1]//2)))
    def test_no_important_pixels_right_of_proxy_start(self):
        for n in (498,554,555,594,595,630,701):
            p=self.render(n)
            for x in (864,970,1079):
                for y in (100,200,400):
                    r,g,b,a=p.getpixel((x,y))
                    self.assertEqual((r,g,b,a),(5,24,37,255))
    def test_size_ratio_preserves_science_proportions(self):
        for box,target in [(s.ART_2D,(480,268)),(s.ART_3D,(600,268))]:
            orig=(box[2]-box[0])/(box[3]-box[1]);resized=target[0]/target[1]
            self.assertLess(abs(orig-resized)/orig,0.003)
    def test_source_sha_pinned_and_invalid_font_fails_before_write(self):
        with tempfile.TemporaryDirectory() as d:
            bad=Path(d)/'badmovie';bad.write_bytes(b'not a movie')
            out=Path(d)/'out'
            with self.assertRaisesRegex(s.ResearchHold,'SOURCE_OR_FONT_SHA_NOT_PINNED'):
                s.prepare(bad,FONT,out)
            self.assertFalse(out.exists())
    def test_hash_is_streamed_not_path_guess(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'bytes';p.write_bytes(b'hello')
            self.assertEqual(s.digest(p),'2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
    def test_optin_padding_keeps_existing_default_unchanged(self):
        old=s.make_overlay(self.source,630,FONT)
        explicit_default=s.make_overlay(self.source,630,FONT,padding_study=False)
        self.assertEqual(old.tobytes(),explicit_default.tobytes())
        raised=s.make_overlay(self.source,630,FONT,padding_study=True)
        self.assertNotEqual(old.tobytes(),raised.tobytes())
        self.assertEqual(raised.getpixel((450,440))[:3],(64,150,158))
    def test_optin_padding_preserves_actual_science_stage_pixels(self):
        prior=s.make_overlay(self.source,630,FONT)
        repaired=s.make_overlay(self.source,630,FONT,padding_study=True)
        for x,y in ((350,180),(450,240),(550,310)):
            self.assertEqual(prior.getpixel((x,y)),repaired.getpixel((x,y)))
    def test_optin_padding_still_reveals_disclosure_only_at_cue(self):
        a=s.make_overlay(self.source,594,FONT,padding_study=True)
        b=s.make_overlay(self.source,595,FONT,padding_study=True)
        self.assertNotEqual(a.crop((100,350,835,440)).tobytes(),
                            b.crop((100,350,835,440)).tobytes())
    def test_optin_padding_never_draws_in_right_exclusion(self):
        for idx in (498,554,555,594,595,630,701):
            r=s.make_overlay(self.source,idx,FONT,padding_study=True)
            for x in (864,975,1079):
                for y in (100,350,441):
                    self.assertEqual(r.getpixel((x,y))[:3],(5,24,37))

if __name__=='__main__':unittest.main()
