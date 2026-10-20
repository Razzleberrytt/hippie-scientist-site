import unittest,tempfile
from pathlib import Path
import source_card_citation_focus_research as m
class ResearchSourceCardTests(unittest.TestCase):
    def test_frozen_frame_bounds(self):
        self.assertEqual((m.FRAME_START,m.FRAME_END),(821,937))
    def test_source_text_area_never_overwritten(self):
        for i in (821,835,849,870,900,931,937):
            x=m.overlay(i)
            for px,py in ((155,727),(150,803),(338,909),(280,960),(195,1037),(220,1140)):
                self.assertEqual(x.getpixel((px,py))[3],0,(i,px,py))
    def test_opacity_introduced_smoothly(self):
        self.assertEqual(m.overlay(821).getbbox(),None)
        self.assertIsNotNone(m.overlay(840).getbbox())
        self.assertEqual(m.overlay(937).getbbox(),None)
    def test_no_unsafe_right_pixels(self):
        for i in (822,850,870,900,930):
            x=m.overlay(i)
            self.assertIsNone(x.crop((59,0,1080,1920)).getbbox())
    def test_no_new_research_words(self):
        self.assertNotIn('text(',__import__('inspect').getsource(m.overlay))
        self.assertFalse(m.NO_RELEASE['mayPublish'])
    def test_current_movie_sha_required_before_work(self):
        with tempfile.TemporaryDirectory() as root:
            f=Path(root)/'notcurrent.mp4';f.write_bytes(b'not a film')
            dest=Path(root)/'out.mp4';work=Path(root)/'overlays'
            with self.assertRaisesRegex(m.ResearchHold,'CURRENT_FILM_SHA_MISMATCH'):
                m.render(f,dest,work)
            self.assertFalse(dest.exists());self.assertFalse(work.exists())
if __name__=='__main__': unittest.main()
