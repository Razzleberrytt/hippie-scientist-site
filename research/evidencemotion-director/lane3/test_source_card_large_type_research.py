import unittest,sys,tempfile
from pathlib import Path
from PIL import Image,ImageFont
sys.path.insert(0,str(Path(__file__).parent))
import source_card_reflow_research as m

class ReflowTests(unittest.TestCase):
 def test_exact_citation_semantics_not_altered(self):
  self.assertEqual(m.EXACT_STRINGS,['PubChem','Mitragynine','CID 3034396','7-OH','CID 44301524','C23H30N2O5','CID = compound','record number','pubchem.ncbi.nlm.nih.gov'])
 def test_320_native_glyph_ink_threshold(self):
  m.labels_fit_safe_region()
  for txt,y,sz,w,c in m.TEXT:
   f=ImageFont.truetype(str(m.BOLD if w=='bold' else m.REGULAR),sz)
   bb=f.getbbox(txt)
   self.assertGreaterEqual((bb[3]-bb[1])*320/1080,14,txt)
 def test_all_text_stays_inside_mobile_safe_areas(self):
  for txt,y,sz,w,c in m.TEXT:
   f=ImageFont.truetype(str(m.BOLD if w=='bold' else m.REGULAR),sz)
   self.assertGreaterEqual(126,m.SAFE_LEFT)
   self.assertLess(126+f.getlength(txt),m.SAFE_RIGHT)
   bb=f.getbbox(txt)
   self.assertLess(y+(bb[3]-bb[1]),1400)
 def test_original_preserved_at_non_source_card(self):
  for frame in (0,820,938,1030):
   with self.assertRaisesRegex(m.Hold,'FRAME_OUTSIDE_SOURCE_HOLD'):
    m.image(frame)
 def test_overlay_has_no_right_side_pixels(self):
  for i in (821,849,850,880,909,910,937):
   im=m.image(i)
   self.assertIsNone(im.crop((864,0,1080,1920)).getbbox())
 def test_source_patch_covers_all_old_citation_text_region(self):
  for frame in (821,880,937):
   im=m.image(frame)
   for x,y in [(62,616),(62,755),(62,812),(62,990),(722,1409)]:
    self.assertGreater(im.getpixel((x,y))[3],240,(frame,x,y))
 def test_moving_marker_has_nonzero_internal_timeline(self):
  a=m.image(825).crop((80,810,120,1380)).tobytes()
  b=m.image(875).crop((80,810,120,1380)).tobytes()
  self.assertNotEqual(a,b)
 def test_wrong_source_refused_before_creating_any_files(self):
  with tempfile.TemporaryDirectory() as d:
   src=Path(d)/'test.mp4';src.write_bytes(b'wrong')
   out=Path(d)/'output.mp4';work=Path(d)/'overlays'
   with self.assertRaisesRegex(m.Hold,'CURRENT_ORIGINAL_FILM_SHA_MISMATCH'):
    m.render(src,out,work)
   self.assertFalse(out.exists());self.assertFalse(work.exists())
 def test_original_immutable_story_scope(self):
  self.assertEqual((m.START,m.END),(821,937))
  self.assertIs(m.NO_RELEASE['mayPublish'],False)
  self.assertEqual(m.NO_RELEASE['newAcceptedAtomicCards'],0)
if __name__=='__main__':unittest.main()
