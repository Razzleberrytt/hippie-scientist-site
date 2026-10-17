"""Synthetic fail-closed tests for Lane 3 opt-in Shot5 phone-safe source pixels."""
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path
from PIL import Image,ImageDraw
import shot5_mobile_safe_research as S

class Shot5PhoneSafeTests(unittest.TestCase):
    def setUp(self):
        self.im=Image.new('RGB',S.SIZE,(8,30,44))
        self.font=Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')

    def test_authored_frame_window_and_safe_art_right_edge(self):
        self.assertEqual((S.FIRST,S.LAST,S.STILL),(773,820,795))
        self.assertEqual(S.LAST-S.FIRST+1,48)
        self.assertEqual(S.SAFE_RIGHT_START,864)
        self.assertLess(S.CARD[2],S.SAFE_RIGHT_START)
        self.assertLess(S.MOL_DEST[0]+S.SOURCE_MOL[2]-S.SOURCE_MOL[0],595)

    def test_overlay_is_transparent_outside_owned_scene_region(self):
        o=S.draw_overlay(self.im,self.font)
        self.assertEqual(o.size,(1080,1920))
        self.assertEqual(o.getpixel((40,700))[3],0)
        self.assertEqual(o.getpixel((1040,700))[3],0)
        self.assertEqual(o.getpixel((1000,900))[3],255)

    def test_actual_source_atom_pixels_are_copied_one_to_one(self):
        source=self.im.copy()
        ImageDraw.Draw(source).rectangle(S.SOURCE_MOL,fill=(172,31,200))
        o=S.draw_overlay(source,self.font)
        x,y=S.MOL_DEST
        self.assertEqual(o.getpixel((x+20,y+20))[:3],(172,31,200))
        self.assertEqual(o.getpixel((x+200,y+80))[:3],(172,31,200))

    def test_nominal_right_strip_no_critical_new_art(self):
        o=S.draw_overlay(self.im,self.font)
        for x in (864,900,1000,1034):
            for y in (700,780,880,920):
                r,g,b,a=o.getpixel((x,y))
                self.assertFalse(r>140 and g>145 and b>140,(x,y,r,g,b))

    def test_reject_forged_movie_or_source_as_output(self):
        with tempfile.TemporaryDirectory() as d:
            s=Path(d)/'x.mp4';font=Path(d)/'font.ttf'
            overlay=Path(d)/'patch.png';out=Path(d)/'out.mp4'
            s.write_bytes(b'not a film');font.write_bytes(b'fake')
            with self.assertRaisesRegex(S.Shot5Hold,'OVERLAPPING_SOURCE_OUTPUT'):
                S.replay(s,font,overlay,s)
            with self.assertRaisesRegex(S.Shot5Hold,'SOURCE_H264_SHA_CHANGED'):
                S.replay(s,font,overlay,out)

    def test_no_accidental_pub_credence_or_alternate_geometry(self):
        self.assertEqual(S.AUDIO_SHA,
            'f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98')
        for item in ('SOURCE_SHA','FONT_SHA','AUDIO_SHA'):
            self.assertRegex(getattr(S,item),r'^[a-f0-9]{64}$')
        with self.assertRaisesRegex(S.Shot5Hold,'NON_NATIVE_FRAME'):
            S.draw_overlay(Image.new('RGB',(100,100)),self.font)

class ReplayOutputOwnershipTests(unittest.TestCase):
    def test_encoder_failure_preserves_concurrently_created_outputs(self):
        with tempfile.TemporaryDirectory() as td:
            source,font,overlay,film=[Path(td)/n for n in ('source.mp4','font.ttf','patch.png','out.mp4')]
            source.write_bytes(b'synthetic source');font.write_bytes(b'synthetic font')
            def fail_encoder(command):
                overlay.write_bytes(b'concurrent overlay');film.write_bytes(b'concurrent film')
                raise S.Shot5Hold('synthetic encoder failure')
            with patch.object(S,'SOURCE_SHA',S.digest(source)), patch.object(S,'FONT_SHA',S.digest(font)), \
                 patch.object(S,'source_frame'), patch.object(S,'draw_overlay',return_value=Image.new('RGBA',(1,1))), \
                 patch.object(S,'shell',side_effect=fail_encoder):
                with self.assertRaises(S.Shot5Hold): S.replay(source,font,overlay,film)
            self.assertEqual(overlay.read_bytes(),b'concurrent overlay')
            self.assertEqual(film.read_bytes(),b'concurrent film')

    def test_publication_collision_preserves_existing_film(self):
        with tempfile.TemporaryDirectory() as td:
            source,font,overlay,film=[Path(td)/n for n in ('source.mp4','font.ttf','patch.png','out.mp4')]
            source.write_bytes(b'synthetic source');font.write_bytes(b'synthetic font')
            def finish_encoder(command):
                Path(command[-1]).write_bytes(b'synthetic encoded candidate')
                film.write_bytes(b'concurrent film')
                return b''
            with patch.object(S,'SOURCE_SHA',S.digest(source)), patch.object(S,'FONT_SHA',S.digest(font)), \
                 patch.object(S,'source_frame'), patch.object(S,'draw_overlay',return_value=Image.new('RGBA',(1,1))), \
                 patch.object(S,'shell',side_effect=finish_encoder):
                with self.assertRaisesRegex(S.Shot5Hold,'OUTPUT_MUST_BE_FRESH'):
                    S.replay(source,font,overlay,film)
            self.assertEqual(film.read_bytes(),b'concurrent film')

    def test_fresh_output_pair_publishes_without_creative_approval(self):
        with tempfile.TemporaryDirectory() as td:
            source,font,overlay,film=[Path(td)/n for n in ('source.mp4','font.ttf','patch.png','out.mp4')]
            source.write_bytes(b'synthetic source');font.write_bytes(b'synthetic font')
            def finish_encoder(command):
                Path(command[-1]).write_bytes(b'synthetic encoded candidate')
                return b''
            with patch.object(S,'SOURCE_SHA',S.digest(source)), patch.object(S,'FONT_SHA',S.digest(font)), \
                 patch.object(S,'source_frame'), patch.object(S,'draw_overlay',return_value=Image.new('RGBA',(1,1))), \
                 patch.object(S,'shell',side_effect=finish_encoder):
                report=S.replay(source,font,overlay,film)
            self.assertEqual(report['overlaySha256'],S.digest(overlay))
            self.assertEqual(report['outputFilmSha256'],S.digest(film))
            self.assertFalse(report['mayPublish'])
            self.assertEqual(set(Path(td).iterdir()),{source,font,overlay,film})


if __name__=='__main__':unittest.main()
