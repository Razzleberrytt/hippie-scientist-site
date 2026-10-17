"""Synthetic contract checks for opt-in source-font replay, no media approval."""
from pathlib import Path
import tempfile, unittest
from unittest.mock import patch
import scene4_legible_footnotes_research as M

class PhoneFootnoteResearchTests(unittest.TestCase):
 def test_only_original_source_wording_can_be_promoted(self):
  g=M.graph('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
  self.assertIn('RDKit / source-linked',g)
  self.assertIn('Not a receptor recording',g)
  self.assertNotIn('receptor binding shown',g) # existing untouched disclosure
  self.assertIn('between(n,498,701)',g)
  self.assertIn('between(n,595,701)',g)
  self.assertEqual(g.count('drawbox='),2)
  self.assertEqual(g.count('drawtext='),2)
  self.assertEqual(g.count('fontsize=34'),2)
 def test_no_right_negation_before_original_authorized_reveal(self):
  self.assertEqual((M.FIRST,M.RIGHT_FIRST,M.LAST),(498,595,701))
  g=M.graph('pin.ttf')
  # FFmpeg enable expressions contain commas: do not split them as
  # filter separators and accidentally weaken temporal gating checks.
  self.assertIn("drawbox=x=505:y=944:w=474:h=44:color=0x0c2230:t=fill:enable='between(n,595,701)'",g)
  self.assertIn("text='Not a receptor recording':fontsize=34:fontcolor=0xc2d9de:x=505:y=940:enable='between(n,595,701)'",g)
 def test_right_legacy_label_tail_erased_without_covering_panel_border(self):
  graph=M.graph('pin.ttf')
  # The original smaller glyphs extended through native y987, surviving
  # the old 40px patch that stopped at y983. Erase up to y987 only.
  self.assertIn("drawbox=x=505:y=944:w=474:h=44:color=0x0c2230:t=fill:enable='between(n,595,701)'",graph)
  self.assertNotIn("drawbox=x=505:y=944:w=474:h=40",graph)
  self.assertNotIn("drawbox=x=505:y=944:w=474:h=45",graph)
  # Still present only at the original negation: no early added wording.
  self.assertIn("text='Not a receptor recording':fontsize=34:fontcolor=0xc2d9de:x=505:y=940:enable='between(n,595,701)'",graph)
 def test_no_source_overwrite_and_only_hash_pinned_movie(self):
  with tempfile.TemporaryDirectory() as d:
   m=Path(d)/'source.mp4';f=Path(d)/'font.ttf'
   m.write_bytes(b'fake media');f.write_bytes(b'fake font')
   with self.assertRaisesRegex(M.ResearchHold,'FRESH_DISTINCT_OUTPUT'):
    M.render(m,f,m)
   with self.assertRaisesRegex(M.ResearchHold,'EXACT_CLEAN_FILM_SHA'):
    M.render(m,f,Path(d)/'output.mp4')
 def test_font_pin_cannot_be_swapped_by_benign_filename(self):
  with tempfile.TemporaryDirectory() as d:
   m=Path(d)/'source.mp4';f=Path(d)/'font.ttf'
   m.write_bytes(b'fake');f.write_bytes(b'spoof')
   with patch.object(M,'sha',side_effect=[M.SOURCE_SHA,'wrong-font']):
    with self.assertRaisesRegex(M.ResearchHold,'REVIEWED_FONT_SHA'):
     M.render(m,f,Path(d)/'out.mp4')
 def test_research_only_authority_no_admission(self):
  self.assertEqual((M.W,M.H,M.FPS,M.FRAMES),(1080,1920,30,1031))
  self.assertEqual(M.ORIGINAL_AAC_SHA,'f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98')
  self.assertRegex(M.SOURCE_SHA,r'^[a-f0-9]{64}$')
  self.assertRegex(M.FONT_SHA,r'^[a-f0-9]{64}$')
if __name__=='__main__':unittest.main()
