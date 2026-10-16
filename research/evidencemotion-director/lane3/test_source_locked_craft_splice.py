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
from unittest.mock import patch

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
  def test_newer_master_pin_is_distinct_and_still_research_only(self):
    pin=ROOT/'scene4-pr6836-native1080-framepts-pin.json'
    m=S.trusted_manifest(pin,'a78ef93305b7725633fb690cef3d7b1167d106ce2907e0c3d1285d6b28b698ef')
    self.assertNotEqual(self.m['sourceFilmSha256'],m['sourceFilmSha256'])
    self.assertNotEqual(self.m['craftSceneSha256'],m['craftSceneSha256'])
    self.assertEqual(m['originalNarrationSha256'],self.m['originalNarrationSha256'])
    self.assertEqual(m['endFrameExclusive']-m['startFrame'],204)
    for k in ('mayPublish','craftApproved','scienceApproved','phonePlaybackApproved'):
      self.assertIs(m[k],False)
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
  def test_cfr_timestamp_sequence_accepts_exact_grid(self):
    # Mocked probe payload; the real H264/AAC positive stays in the codec test.
    data={'frames':[{'best_effort_timestamp_time':p} for p in
                    ('0.000000','0.033333','0.066667')]}
    with patch.object(S,'run',return_value=json.dumps(data)) as probe:
      self.assertEqual(S.require_exact_cfr_frame_grid('native.mp4',3),3)
      self.assertIn('-show_frames',probe.call_args.args[0])

  def test_noncfr_timestamp_rejected_despite_nominal_30fps(self):
    # A manifest declaring FPS 30 does not make a delayed reveal safe.
    data={'frames':[{'best_effort_timestamp_time':p} for p in
                    ('0.000000','0.033333','0.100000')]}
    with patch.object(S,'run',return_value=json.dumps(data)):
      with self.assertRaisesRegex(S.CraftHold,'NON_CFR_OR_SHIFTED_FRAME_PTS'):
        S.require_exact_cfr_frame_grid('nominal30-vfr.mp4',3)

  def test_shifted_first_frame_or_nonfinite_timing_rejected(self):
    for timestamps in [('-0.033333','0.000000','0.033333'),
                       ('0.000000','NaN','0.066667')]:
      data={'frames':[{'best_effort_timestamp_time':p} for p in timestamps]}
      with self.subTest(timestamps=timestamps),patch.object(S,'run',return_value=json.dumps(data)):
        with self.assertRaisesRegex(S.CraftHold,'NON_CFR_OR_SHIFTED_FRAME_PTS'):
          S.require_exact_cfr_frame_grid('shifted.mp4',3)

  def test_missing_or_extra_decoded_frame_timestamp_holds(self):
    for data,reason in [
      ({'frames':[{'best_effort_timestamp_time':'0'}]},'DECODED_FRAME_TIMESTAMP_COUNT_MISMATCH'),
      ({'frames':[{}, {'best_effort_timestamp_time':'0.033333'}]},'DECODED_FRAME_TIMESTAMPS_UNAVAILABLE'),
      ({'frames':'not-an-array'},'DECODED_FRAME_TIMESTAMP_COUNT_MISMATCH')]:
      with self.subTest(reason=reason),patch.object(S,'run',return_value=json.dumps(data)):
        with self.assertRaisesRegex(S.CraftHold,reason):
          S.require_exact_cfr_frame_grid('incomplete.mp4',2)

  def test_all_untouched_frames_are_explicitly_counted(self):
    manifest={'frames':5,'startFrame':1,'endFrameExclusive':3}
    a=[bytes([10]*12)]*5
    b=list(a)
    b[1]=bytes([255]*12)  # Inside the authorized scene can change.
    b[2]=bytes([0]*12)
    def decode(which):return iter(a if which=='source' else b)
    r=S.audit_outside_scene_frames('source','output',manifest,decoder=decode)
    self.assertEqual(r['framesComparedOutsideScene'],3)
    self.assertEqual(r['outsideFrameMeanAbsRgb255'],0)

  def test_subtle_outside_scene_overlay_is_rejected(self):
    manifest={'frames':5,'startFrame':1,'endFrameExclusive':3}
    a=[bytes([10]*12)]*5
    b=list(a)
    b[0]=bytes([200]*12)
    def decode(which):return iter(a if which=='source' else b)
    with self.assertRaisesRegex(S.CraftHold,'OUTSIDE_CRAFT_SCENE_VISUAL_DRIFT'):
      S.audit_outside_scene_frames('source','output',manifest,decoder=decode)

  def test_incomplete_decode_cannot_gain_source_preservation_receipt(self):
    manifest={'frames':5,'startFrame':1,'endFrameExclusive':3}
    a=[bytes([10]*12)]*5
    b=list(a[:-1])
    def decode(which):return iter(a if which=='source' else b)
    with self.assertRaisesRegex(S.CraftHold,'INCOMPLETE_DECODED_FRAME_SEQUENCE'):
      S.audit_outside_scene_frames('source','output',manifest,decoder=decode)

  def test_extra_decoded_frame_cannot_be_ignored(self):
    manifest={'frames':5,'startFrame':1,'endFrameExclusive':3}
    a=[bytes([10]*12)]*5
    b=a+[bytes([10]*12)]
    def decode(which):return iter(a if which=='source' else b)
    with self.assertRaisesRegex(S.CraftHold,'UNEXPECTED_EXTRA_DECODED_FRAMES'):
      S.audit_outside_scene_frames('source','output',manifest,decoder=decode)

  def test_source_frame_and_new_frame_size_mismatch_holds(self):
    manifest={'frames':5,'startFrame':1,'endFrameExclusive':3}
    a=[bytes([10]*12)]*5
    b=list(a);b[0]=bytes([10]*9)
    def decode(which):return iter(a if which=='source' else b)
    with self.assertRaisesRegex(S.CraftHold,'INCOMPLETE_DECODED_FRAME_SEQUENCE'):
      S.audit_outside_scene_frames('source','output',manifest,decoder=decode)

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
    self.assertEqual(result['outsideSceneVisualAudit']['framesComparedOutsideScene'],827)
    self.assertLess(result['outsideSceneVisualAudit']['outsideFrameMaxMeanAbsRgb255'],0.5)
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


  def test_staging_filename_cannot_overwrite_pinned_source(self):
    # The prior fixed 'movie.tmp.mp4' temporary path could be the actual input.
    # Use mocks ONLY for the codec boundary; source bytes are real local files.
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      source=folder/'movie.tmp.mp4';source.write_bytes(b'PINNED FILM')
      scene=folder/'scene.mp4';scene.write_bytes(b'PINNED SCENE')
      output=folder/'movie.mp4'
      called=[]
      def fake_ffmpeg(argv,**_):
        staged=Path(argv[-1])
        self.assertNotIn(staged.resolve(),{source.resolve(),scene.resolve()})
        called.append(staged)
        staged.write_bytes(b'RESEARCH FILM')
        return ''
      manifest={'startFrame':1,'endFrameExclusive':2,
                'sourceFilmSha256':S.digest(source),'craftSceneSha256':S.digest(scene)}
      verdict={'mayPublish':False,'status':'MOCK_CODEC_CONTRACT_ONLY'}
      with patch.object(S,'preflight',return_value=True), \
           patch.object(S,'run',side_effect=fake_ffmpeg), \
           patch.object(S,'verify_result',return_value=verdict):
        received=S.splice(source,scene,output,manifest)
      self.assertEqual(received,verdict)
      self.assertEqual(source.read_bytes(),b'PINNED FILM')
      self.assertEqual(scene.read_bytes(),b'PINNED SCENE')
      self.assertEqual(output.read_bytes(),b'RESEARCH FILM')
      self.assertEqual(json.loads(output.with_suffix('.receipt.json').read_text()),verdict)
      self.assertEqual(len(called),1)
      self.assertFalse(called[0].exists())
      self.assertEqual(list(folder.glob('.lane3-splice-*')),[])

  def test_sidecar_destination_cannot_overwrite_source(self):
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      source=folder/'movie.receipt.json';source.write_bytes(b'ORIGINAL PINNED SOURCE')
      scene=folder/'scene.mp4';scene.write_bytes(b'SCENE')
      with patch.object(S,'preflight',return_value=True),patch.object(S,'run') as ffmpeg:
        with self.assertRaisesRegex(S.CraftHold,'REFUSE_OVERWRITE_INPUT'):
          S.splice(source,scene,folder/'movie.mp4',{'startFrame':1,'endFrameExclusive':2})
        ffmpeg.assert_not_called()
      self.assertEqual(source.read_bytes(),b'ORIGINAL PINNED SOURCE')

  def test_failed_staged_verification_preserves_prior_film_and_receipt(self):
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      source=folder/'source.mp4';source.write_bytes(b'SOURCE')
      scene=folder/'scene.mp4';scene.write_bytes(b'SCENE')
      output=folder/'output.mp4';output.write_bytes(b'PRIOR FILM')
      receipt=output.with_suffix('.receipt.json');receipt.write_bytes(b'PRIOR RECEIPT')
      def fake_ffmpeg(argv,**_):
        Path(argv[-1]).write_bytes(b'FAILED CANDIDATE')
      with patch.object(S,'preflight',return_value=True), \
           patch.object(S,'run',side_effect=fake_ffmpeg), \
           patch.object(S,'verify_result',side_effect=S.CraftHold('FAILED_VISUAL_NEGATIVE')):
        with self.assertRaisesRegex(S.CraftHold,'FAILED_VISUAL_NEGATIVE'):
          S.splice(source,scene,output,{'startFrame':1,'endFrameExclusive':2})
      self.assertEqual(output.read_bytes(),b'PRIOR FILM')
      self.assertEqual(receipt.read_bytes(),b'PRIOR RECEIPT')
      self.assertEqual(source.read_bytes(),b'SOURCE')
      self.assertEqual(list(folder.glob('.lane3-splice-*')),[])


  def test_no_clobber_pair_preserves_prior_movie_receipt_and_symlinks(self):
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      stage=folder/'stage.mp4';stage.write_bytes(b'VERIFIED VIDEO')
      staged_receipt=folder/'stage.receipt.json'
      staged_receipt.write_text(json.dumps({'mayPublish':False})+'\n')
      movie=folder/'movie.mp4';sidecar=folder/'movie.receipt.json'
      movie.write_bytes(b'OWNER MOVIE');sidecar.write_bytes(b'OWNER RECEIPT')
      with self.assertRaisesRegex(S.CraftHold,'FRESH_OUTPUT_AND_RECEIPT_REQUIRED'):
        S.publish_verified_pair_no_clobber(stage,staged_receipt,movie,sidecar)
      self.assertEqual(movie.read_bytes(),b'OWNER MOVIE')
      self.assertEqual(sidecar.read_bytes(),b'OWNER RECEIPT')
      movie.unlink();sidecar.unlink()
      linked=folder/'alias.mp4';linked.symlink_to(stage)
      with self.assertRaisesRegex(S.CraftHold,'FRESH_OUTPUT_AND_RECEIPT_REQUIRED'):
        S.publish_verified_pair_no_clobber(stage,staged_receipt,linked,sidecar)
      self.assertTrue(linked.is_symlink())
      linked.unlink()
      self.assertTrue(S.publish_verified_pair_no_clobber(stage,staged_receipt,movie,sidecar))
      self.assertEqual(movie.read_bytes(),b'VERIFIED VIDEO')
      self.assertEqual(sidecar.read_bytes(),staged_receipt.read_bytes())
      self.assertEqual((movie.stat().st_dev,movie.stat().st_ino),
                       (stage.stat().st_dev,stage.stat().st_ino))
      self.assertFalse(json.loads(sidecar.read_text())['mayPublish'])

  def test_receipt_collision_after_movie_link_rolls_back_without_clobber(self):
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      stage=folder/'stage.mp4';stage.write_bytes(b'VERIFIED VIDEO')
      staged_receipt=folder/'stage.receipt.json';staged_receipt.write_bytes(b'RECEIPT')
      movie=folder/'movie.mp4';sidecar=folder/'movie.receipt.json'
      real_link=os.link
      def conflict_after_first_link(src,dst):
        if Path(dst)==sidecar:
          sidecar.write_bytes(b'RACED OWNER RECEIPT')
        return real_link(src,dst)
      with patch.object(S.os,'link',side_effect=conflict_after_first_link):
        with self.assertRaisesRegex(S.CraftHold,'APPEARED_AFTER_PREFLIGHT'):
          S.publish_verified_pair_no_clobber(stage,staged_receipt,movie,sidecar)
      self.assertFalse(movie.exists())
      self.assertEqual(sidecar.read_bytes(),b'RACED OWNER RECEIPT')
      self.assertEqual(stage.read_bytes(),b'VERIFIED VIDEO')

  def test_movie_collision_during_link_never_replaces_new_owner_file(self):
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      stage=folder/'stage.mp4';stage.write_bytes(b'VERIFIED VIDEO')
      staged_receipt=folder/'stage.receipt.json';staged_receipt.write_bytes(b'RECEIPT')
      movie=folder/'movie.mp4';sidecar=folder/'movie.receipt.json'
      real_link=os.link
      def inject_owner_movie(src,dst):
        if Path(dst)==movie:
          movie.write_bytes(b'CONCURRENT OWNER MOVIE')
        return real_link(src,dst)
      with patch.object(S.os,'link',side_effect=inject_owner_movie):
        with self.assertRaisesRegex(S.CraftHold,'APPEARED_AFTER_PREFLIGHT'):
          S.publish_verified_pair_no_clobber(stage,staged_receipt,movie,sidecar)
      self.assertEqual(movie.read_bytes(),b'CONCURRENT OWNER MOVIE')
      self.assertFalse(sidecar.exists())

  def test_changed_output_during_receipt_collision_is_not_deleted(self):
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      stage=folder/'stage.mp4';stage.write_bytes(b'VERIFIED VIDEO')
      staged_receipt=folder/'stage.receipt.json';staged_receipt.write_bytes(b'RECEIPT')
      movie=folder/'movie.mp4';sidecar=folder/'movie.receipt.json'
      real_link=os.link
      def race_change(src,dst):
        if Path(dst)==sidecar:
          movie.write_bytes(b'OWNER EDITED MOVIE')
          sidecar.write_bytes(b'CONCURRENT RECEIPT')
        return real_link(src,dst)
      with patch.object(S.os,'link',side_effect=race_change):
        with self.assertRaisesRegex(S.CraftHold,'PARTIAL_FILM_CHANGED_CANNOT_ROLL_BACK'):
          S.publish_verified_pair_no_clobber(stage,staged_receipt,movie,sidecar)
      self.assertEqual(movie.read_bytes(),b'OWNER EDITED MOVIE')
      self.assertEqual(sidecar.read_bytes(),b'CONCURRENT RECEIPT')

  def test_splice_rejects_existing_output_and_sidecar_before_encoder(self):
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      src=folder/'source.mp4';src.write_bytes(b'SOURCE')
      scene=folder/'scene.mp4';scene.write_bytes(b'SCENE')
      dst=folder/'out.mp4';receipt=dst.with_suffix('.receipt.json')
      for occupied in (dst,receipt):
        occupied.write_bytes(b'DO NOT OVERWRITE')
        with patch.object(S,'preflight',return_value=True),patch.object(S,'run') as encode:
          with self.assertRaisesRegex(S.CraftHold,'FRESH_OUTPUT_AND_RECEIPT_REQUIRED'):
            S.splice(src,scene,dst,{'startFrame':1,'endFrameExclusive':2})
          encode.assert_not_called()
        self.assertEqual(occupied.read_bytes(),b'DO NOT OVERWRITE')
        occupied.unlink()
      self.assertEqual(src.read_bytes(),b'SOURCE')
      self.assertEqual(scene.read_bytes(),b'SCENE')

  def test_source_mutation_during_splice_holds_before_final_handoff(self):
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      src=folder/'source.mp4';src.write_bytes(b'ORIGINAL SOURCE')
      scene=folder/'scene.mp4';scene.write_bytes(b'SCIENCE SCENE')
      dst=folder/'output.mp4'
      manifest={'startFrame':1,'endFrameExclusive':2,
        'sourceFilmSha256':S.digest(src),'craftSceneSha256':S.digest(scene)}
      verdict={'status':'RESEARCH_TEST_ONLY','mayPublish':False}
      def render_then_mutate(argv,**_):
        Path(argv[-1]).write_bytes(b'ENCODED CANDIDATE')
        src.write_bytes(b'MUTATED SOURCE')
        return ''
      with patch.object(S,'preflight',return_value=True), \
           patch.object(S,'run',side_effect=render_then_mutate), \
           patch.object(S,'verify_result',return_value=verdict):
        with self.assertRaisesRegex(S.CraftHold,'PINNED_SOURCE_CHANGED_DURING_SPLICE'):
          S.splice(src,scene,dst,manifest)
      self.assertFalse(dst.exists())
      self.assertFalse(dst.with_suffix('.receipt.json').exists())
      self.assertFalse(list(folder.glob('.lane3-splice-*')))

if __name__=='__main__':unittest.main()
