"""Research-only real-asset and adversarial source-locked splicer tests.

Run after installing FFmpeg. Three real media assets remain in the conversation
ZIP; GitHub stores code and the external manifest, not the 5.6MB media archive.
"""
import copy
import hashlib
import json
import os
from pathlib import Path
import tempfile
import unittest

import source_locked_craft_splice as S

ROOT=Path(__file__).resolve().parent
MEDIA_ROOT=Path(os.environ.get('THS_LANE3_ARCHIVE_ROOT',str(ROOT.parent)))
FILM=MEDIA_ROOT/'lane3_cinematic_v2'/'specimen_NEW_RESEARCH_CANDIDATE.mp4'
SCENE=MEDIA_ROOT/'lane3_fullfilm_integration'/'Scene4_Cinematic_V3_Native1080_RESEARCH.mp4'
FULL=MEDIA_ROOT/'lane3_fullfilm_integration'/'EvidenceMotion_FullFilm_Scene4_V3_Native1080_RESEARCH.mp4'
MANIFEST=ROOT/'scene4-native1080-archived-pin.json'
EXTERNAL='6490462606506f5cee4dbe5dee561a04b30d8def2b226f6d92d2ec0c1633e3ed'

class CraftSourceLockedContractTests(unittest.TestCase):
  @classmethod
  def setUpClass(cls):
    cls.m=S.trusted_manifest(MANIFEST,EXTERNAL)
  def test_trusted_external_manifest_pin(self):
    self.assertEqual(S.digest(MANIFEST),EXTERNAL)
    self.assertEqual(self.m['endFrameExclusive']-self.m['startFrame'],204)
    self.assertFalse(self.m['mayPublish'])
  def test_changed_manifest_is_not_self_approved(self):
    with tempfile.TemporaryDirectory() as td:
      p=Path(td)/'changed.json'
      x=copy.deepcopy(self.m);x['mayPublish']=True
      p.write_text(json.dumps(x))
      with self.assertRaisesRegex(S.CraftHold,'EXTERNAL_MANIFEST_SHA_MISMATCH'):
        S.trusted_manifest(p,EXTERNAL)
      # Even someone separately repinning a dishonest manifest cannot approve.
      with self.assertRaisesRegex(S.CraftHold,'INVALID_FIELD_mayPublish'):
        S.trusted_manifest(p,S.digest(p))
  def test_missing_external_sha(self):
    for fake in ('','a'*63,'b'*64):
      with self.assertRaises(S.CraftHold):S.trusted_manifest(MANIFEST,fake)
  @unittest.skipUnless(SCENE.exists(), 'archived scene artifact not provided')
  def test_source_revision_mismatch(self):
    with tempfile.TemporaryDirectory() as td:
      p=Path(td)/'fake_source.mp4';p.write_bytes(b'filmed visual edited')
      with self.assertRaisesRegex(S.CraftHold,'SOURCE_FILM_REVISION_MISMATCH'):
        S.preflight(p,SCENE,self.m)
  @unittest.skipUnless(FILM.exists(), 'archived source artifact not provided')
  def test_scene_revision_mismatch(self):
    with tempfile.TemporaryDirectory() as td:
      p=Path(td)/'fake_scene.mp4';p.write_bytes(b'new visual')
      with self.assertRaisesRegex(S.CraftHold,'REPLACEMENT_SCENE_REVISION_MISMATCH'):
        S.preflight(FILM,p,self.m)
  def test_invalid_temporal_geometry_refused(self):
    for field,v in [('startFrame',702),('endFrameExclusive',498),('fps',24),('height',720)]:
      with tempfile.TemporaryDirectory() as td:
        p=Path(td)/'unsafe.json';x=copy.deepcopy(self.m);x[field]=v;p.write_text(json.dumps(x))
        with self.assertRaises(S.CraftHold):S.trusted_manifest(p,S.digest(p))
  def test_original_narration_pin_requires_exact_sha(self):
    with tempfile.TemporaryDirectory() as td:
      p=Path(td)/'bad_wav.json';x=copy.deepcopy(self.m);x['originalNarrationSha256']='0';p.write_text(json.dumps(x))
      with self.assertRaisesRegex(S.CraftHold,'INVALID_SHA_originalNarrationSha256'):
        S.trusted_manifest(p,S.digest(p))
  @unittest.skipUnless(FILM.exists() and SCENE.exists(), 'archived media artifacts not provided')
  def test_real_pinned_source_and_scene_preflight(self):
    self.assertTrue(S.preflight(FILM,SCENE,self.m))
    self.assertEqual(S.digest(FILM),self.m['sourceFilmSha256'])
    self.assertEqual(S.digest(SCENE),self.m['craftSceneSha256'])
  @unittest.skipUnless(FILM.exists() and FULL.exists(), 'archived media artifacts not provided')
  def test_real_native_full_film_aac_and_frame_contract(self):
    result=S.verify_result(FILM,FULL,self.m)
    self.assertEqual(result['frames'],1031)
    self.assertEqual(result['aacAdtsSha256'],'f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98')
    self.assertEqual(result['outputFilmSha256'],'62cd299089bbde5b91cd03d1ec6cb2c710bfee17bb5ecca9c65f0b2e41e8e567')
    self.assertFalse(result['scienceApproved'])
    self.assertFalse(result['craftApproved'])
    self.assertFalse(result['mayPublish'])
  @unittest.skipUnless(FILM.exists() and SCENE.exists(), 'archived media artifacts not provided')
  def test_input_paths_never_overwritten(self):
    with self.assertRaisesRegex(S.CraftHold,'REFUSE_OVERWRITE_INPUT'):
      S.splice(FILM,SCENE,FILM,self.m)
  @unittest.skipUnless(FILM.exists() and SCENE.exists(), 'archived media artifacts not provided')
  def test_outside_ended_scene_cannot_claim_same_aac(self):
    with self.assertRaisesRegex(S.CraftHold,'SPLICED_OUTPUT_TECHNICAL_MISMATCH'):
      S.verify_result(FILM,SCENE,self.m)

if __name__=='__main__':unittest.main()
