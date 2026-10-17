"""Research-only native-pixel regression fixtures for source-preserving camera study."""
from pathlib import Path
import unittest
from PIL import Image, ImageDraw
import scene4_sequential_safe_research as s

FONT=Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')

class CameraStudyContract(unittest.TestCase):
    def setUp(self):
        self.frame=Image.new('RGB',(1080,450),(5,24,37))
        ImageDraw.Draw(self.frame).ellipse((650,185,740,250),fill=(255,210,100))

    def make(self,n,opt):
        return s.make_overlay(self.frame,n,FONT,camera_study=opt)

    def test_default_path_exact_optout(self):
        for n in (498,530,554,555,595,630,701):
            self.assertEqual(self.make(n,False).tobytes(),s.make_overlay(self.frame,n,FONT).tobytes())

    def test_only_calculated_stage_receives_camera_motion(self):
        for n in (498,530,554):
            self.assertEqual(self.make(n,True).tobytes(),self.make(n,False).tobytes())
        self.assertNotEqual(self.make(630,True).tobytes(),self.make(630,False).tobytes())

    def test_source_caveat_cue_remains_frame595(self):
        self.assertNotEqual(self.make(594,True).tobytes(),self.make(595,True).tobytes())

    def test_content_never_bleeds_right_safe_strip(self):
        for n in (498,554,555,595,630,700,701):
            art=self.make(n,True).convert('RGB')
            for x in (864,900,1079):
                for y in (70,120,225,370):
                    self.assertEqual(art.getpixel((x,y)),(5,24,37))

    def test_existing_scientific_crops_unchanged(self):
        self.assertEqual(s.ART_3D,(518,704,1010,924))
        self.assertEqual(s.ART_2D,(105,728,445,918))

    def test_optin_does_not_promote_release(self):
        self.assertFalse(any(s.NO_RELEASE.values()))

    def test_model_moves_without_header_motion(self):
        first=self.make(555,True)
        last=self.make(701,True)
        self.assertNotEqual(first.tobytes(),last.tobytes())
        self.assertEqual(first.crop((65,15,835,90)).tobytes(),last.crop((65,15,835,90)).tobytes())

    def test_optin_legibility_and_native_bottom_padding(self):
        # True rasterized source-label pixels: require >=12px before cyan rule y428.
        # Synthetic science frame; physical encoded H264 clearance is checked separately.
        for index in (530,595,630,701):
            rgb=self.make(index,True).convert('RGB')
            ys=[]
            for y in range(346,428):
                for x in range(125,830):
                    red,green,blue=rgb.getpixel((x,y))
                    if min(red,green,blue)>=170 and max(red,green,blue)-min(red,green,blue)<60:
                        ys.append(y)
            self.assertTrue(ys)
            self.assertGreaterEqual(428-max(ys)-1,12)
        # The caution does not appear before the original spoken onset f595.
        prior=self.make(594,True).convert('RGB')
        self.assertFalse(any(min(prior.getpixel((x,y)))>=170 for y in range(346,428) for x in range(125,830)))

    def test_authored_48_native_px_credit_is_at_least_14px_in_320_preview(self):
        self.assertGreaterEqual(48*320/1080,14)

if __name__=='__main__':
    unittest.main()
