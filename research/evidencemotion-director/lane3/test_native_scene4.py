"""Native renderer scientific/art input and absolute-frame timing negative tests."""
from pathlib import Path
import os
import tempfile
import unittest
import native_scene4 as S

HERE=Path(__file__).resolve().parent
SOURCE=Path(os.environ.get('THS_LANE3_SOURCE_FILM',str(HERE/'specimen_NEW_RESEARCH_CANDIDATE.mp4')))
MOL=Path(os.environ.get('THS_LANE3_SOURCE_MOL',str(HERE/'source-7oh-computed.mol')))

class NativeSceneTest(unittest.TestCase):
  def test_pinned_absolute_frames(self):
    self.assertEqual((S.START_FRAME,S.END_FRAME,S.FPS),(498,702,30))
    self.assertEqual((S.W,S.H),(1080,1920))
    self.assertEqual((S.COMPUTED_AT,S.NOT_AT),(18.48,19.83))
    self.assertEqual(S.state(554/30),'SOURCE')
    self.assertEqual(S.state(555/30),'COMPUTED')
    self.assertEqual(S.state(594/30),'COMPUTED')
    self.assertEqual(S.state(595/30),'LIMIT')
  def test_caption_cues_are_not_early(self):
    self.assertNotIn('computed.',S.caption(554/30))
    self.assertIn('computed.',S.caption(555/30))
    self.assertNotIn('not',S.caption(594/30))
    self.assertIn('not',S.caption(595/30))
    self.assertNotIn('receptor.',S.caption(595/30))
  def test_unknown_audio_master_rejected_before_file_access(self):
    with self.assertRaisesRegex(S.SceneHold,'UNKNOWN_NARRATION_SOURCE_REVISION'):
      S.material(Path('not_exists.mp4'),Path('not_exists.mol'),expected_film_sha='0'*64)
  def test_publication_and_chemical_limits_constant(self):
    self.assertEqual(S.INCHIKEY,'RYENLSMHLCNXJT-CYXFISRXSA-N')
    self.assertEqual(S.MOL_SHA,'150ccd331963beab2481ad47c36e1e171db6bdd37e4d50746a3d6b4b5be60bcb')
    self.assertEqual(S.NARRATION_SHA,'9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435')
  @unittest.skipUnless(SOURCE.is_file() and MOL.is_file(),'needs original hosted movie and RDKit source MOL')
  def test_real_verified_structure_and_non_authored_scene_protection(self):
    mol,diagram=S.material(SOURCE,MOL)
    self.assertTrue(mol.GetConformer().Is3D())
    self.assertEqual(diagram.size,(1340,800))
    with self.assertRaisesRegex(S.SceneHold,'FRAME_OUTSIDE_SCENE'):
      S.render_frame(497,mol,diagram)
    with self.assertRaisesRegex(S.SceneHold,'FRAME_OUTSIDE_SCENE'):
      S.render_frame(702,mol,diagram)
  @unittest.skipUnless(SOURCE.is_file() and MOL.is_file(),'needs hosted movie and RDKit source MOL')
  def test_real_encoded_source_to_computed_limit_pixels(self):
    from numpy import array
    mol,diagram=S.material(SOURCE,MOL)
    x=S.render_frame(554,mol,diagram)
    y=S.render_frame(555,mol,diagram)
    q=S.render_frame(594,mol,diagram)
    z=S.render_frame(595,mol,diagram)
    self.assertEqual(x.size,(1080,1920))
    self.assertGreater(float(array(x)[450:900,65:1015].mean()),float(array(y)[450:900,65:1015].mean())+30)
    roi=(slice(1427,1575),slice(72,83))
    orange_before=((array(q)[roi][:,:,0]>225)&(array(q)[roi][:,:,1]>100)&(array(q)[roi][:,:,1]<175)).sum()
    orange_after=((array(z)[roi][:,:,0]>225)&(array(z)[roi][:,:,1]>100)&(array(z)[roi][:,:,1]<175)).sum()
    self.assertLess(orange_before,8)
    self.assertGreater(orange_after,300)
  @unittest.skipUnless(SOURCE.is_file() and MOL.is_file(),'needs original hosted movie and molecule')
  def test_bad_molecule_file_fails_before_art_generation(self):
    with tempfile.TemporaryDirectory() as d:
      bad=Path(d)/'fake.mol';bad.write_bytes(MOL.read_bytes()+b'changed')
      with self.assertRaisesRegex(S.SceneHold,'SOURCE_MOL_SHA_MISMATCH'):
        S.material(SOURCE,bad)
  @unittest.skipUnless(SOURCE.is_file() and MOL.is_file(),'needs original hosted movie and molecule')
  def test_altered_film_fails_before_art_generation(self):
    with tempfile.TemporaryDirectory() as d:
      bad=Path(d)/'fake.mp4';bad.write_bytes(SOURCE.read_bytes()+b'changed')
      with self.assertRaisesRegex(S.SceneHold,'SOURCE_FILM_SHA_MISMATCH'):
        S.material(bad,MOL)

if __name__=='__main__':unittest.main()
