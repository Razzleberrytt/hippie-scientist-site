"""Opt-in craft camera: baseline-byte preservation and actual source-only visual probes.

No film/chemical source assets are bundled with repository source; absent media tests
SKIP in hosted CI and RUN against the original source in portable research kits.
"""
import hashlib
import os
from pathlib import Path
import unittest

import native_scene4 as n

ROOT=Path(__file__).resolve().parent
FILM=Path(os.environ.get('THS_LANE3_SOURCE_FILM',str(ROOT/'specimen_NEW_RESEARCH_CANDIDATE.mp4')))
MOL=Path(os.environ.get('THS_LANE3_SOURCE_MOL',str(ROOT/'source-7oh-computed.mol')))
BASELINE={498:'5196f9d98073',554:'02bb833bc1c6',555:'7ca1165e5f6f',594:'5046c52757c3',595:'9799249d84ba',701:'a3def3325d3c'}

class OfflineContract(unittest.TestCase):
 def test_unknown_treatment_fails_without_art_dependency(self):
  with self.assertRaisesRegex(n.SceneHold,'UNKNOWN_CINEMATIC_TREATMENT'):
   n.render_frame(555,None,None,treatment='unreviewed')
 def test_unknown_camera_fails_without_art_dependency(self):
  with self.assertRaisesRegex(n.SceneHold,'UNKNOWN_CINEMATIC_CAMERA'):
   n.model(None,19.,camera='unreviewed')
 def test_fixed_source_and_narration_constraints(self):
  self.assertEqual(n.INCHIKEY,'RYENLSMHLCNXJT-CYXFISRXSA-N')
  self.assertEqual(n.NARRATION_SHA,'9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435')
  self.assertEqual((n.START_FRAME,n.END_FRAME,n.FPS),(498,702,30))

@unittest.skipUnless(FILM.exists() and MOL.exists(),'original research video and verified molecule not bundled on hosted runner')
class ActualSourceAndEncodedFrameEvidence(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.m,cls.diagram=n.material(FILM,MOL)
 def test_baseline_frame_pixels_preserved(self):
  for frame,expected in BASELINE.items():
   got=hashlib.sha256(n.render_frame(frame,self.m,self.diagram).tobytes()).hexdigest()
   self.assertTrue(got.startswith(expected),frame)
 def test_source_geometry_and_stereo_unmodified(self):
  import numpy as np
  from rdkit import Chem
  before=np.asarray(self.m.GetConformer().GetPositions()).copy()
  for t in (18.5,19.8,20.5,22,23.35):n.model(self.m,t,camera='depth_study')
  np.testing.assert_array_equal(before,np.asarray(self.m.GetConformer().GetPositions()))
  self.assertEqual(Chem.MolToInchiKey(Chem.RemoveHs(self.m)),n.INCHIKEY)
 def test_complete_molecule_never_outside_stage(self):
  for t in (18.5,19.8,20.5,22,23.35):
   left,top,right,bottom=n.model(self.m,t,camera='depth_study').getbbox()
   self.assertGreater(left,50);self.assertLess(right,985)
   self.assertGreater(top,12);self.assertLess(bottom,710)
 def test_source_cut_and_not_footage_aligned_to_voice(self):
  import numpy as np
  a=np.asarray(n.render_frame(554,self.m,self.diagram,treatment='depth_study'))
  b=np.asarray(n.render_frame(555,self.m,self.diagram,treatment='depth_study'))
  q=np.asarray(n.render_frame(594,self.m,self.diagram,treatment='depth_study'))
  z=np.asarray(n.render_frame(595,self.m,self.diagram,treatment='depth_study'))
  self.assertGreater(float(a[700:1180,80:1000].mean()),float(b[700:1180,80:1000].mean())+25)
  self.assertTrue(np.array_equal(a,np.asarray(n.render_frame(554,self.m,self.diagram))))
  r=(slice(1430,1565),slice(72,84))
  self.assertGreater(int(z[r][:,:,0].sum()),int(q[r][:,:,0].sum())+1000)
  self.assertEqual(n.state(594/n.FPS),'COMPUTED');self.assertEqual(n.state(595/n.FPS),'LIMIT')
 def test_source_bound_motion_difference(self):
  import numpy as np
  def score(treatment):
   k={} if treatment=='baseline' else {'treatment':'depth_study'}
   a=np.asarray(n.render_frame(555,self.m,self.diagram,**k),dtype=np.int16)[740:1300,60:1040]
   b=np.asarray(n.render_frame(690,self.m,self.diagram,**k),dtype=np.int16)[740:1300,60:1040]
   return float(np.mean(np.max(np.abs(a-b),axis=2)>15))
  baseline,depth=score('baseline'),score('depth_study')
  self.assertGreater(depth,baseline+0.02)
  self.assertLess(depth,0.5) # not a flashing scene-wide transition
 def test_exact_source_hashes_remain_required(self):
  self.assertEqual(n.sha(FILM),n.SAMPLE_FILM_SHA)
  self.assertEqual(n.sha(MOL),n.MOL_SHA)

if __name__=='__main__':unittest.main()
