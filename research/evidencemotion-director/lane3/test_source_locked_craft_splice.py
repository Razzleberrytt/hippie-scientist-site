"""Research-only real-asset and adversarial source-locked splicer tests.

Run after installing FFmpeg. Three real media assets remain in the conversation
ZIP; GitHub stores code and the external manifest, not the 5.6MB media archive.
"""
import copy
import hashlib
import json
import os
import shutil
import subprocess
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

  def test_hidden_third_stream_is_rejected_before_splice_mapping(self):
    normal=[
      {'codec_type':'video','codec_name':'h264','pix_fmt':'yuv420p',
       'sample_aspect_ratio':'1:1'},
      {'codec_type':'audio','codec_name':'aac','sample_rate':'24000'}
    ]
    for extra in (
      {'codec_type':'subtitle','codec_name':'mov_text'},
      {'codec_type':'data','codec_name':'bin_data'},
      {'codec_type':'attachment','codec_name':'ttf'},
      {'codec_type':'video','codec_name':'h264'}
    ):
      with self.subTest(extra=extra['codec_type']):
        payload=json.dumps({'streams':normal+[extra]})
        with patch.object(S,'run',return_value=payload):
          with self.assertRaisesRegex(S.CraftHold,'AMBIGUOUS_TRACK_LAYOUT'):
            S.media_info('bad-tracks.mp4')

  def test_square_pixel_yuv420_admission_and_refusal(self):
    base={'codec_type':'video','codec_name':'h264',
          'pix_fmt':'yuv420p','sample_aspect_ratio':'1:1'}
    self.assertTrue(S.require_square_yuv420_video(base,'SOURCE'))
    for change in (
      {'pix_fmt':'yuv444p'},
      {'pix_fmt':'yuv422p'},
      {'pix_fmt':'yuv420p10le'},
      {'sample_aspect_ratio':'2:1'},
      {'sample_aspect_ratio':'N/A'},
    ):
      candidate={**base,**change}
      with self.subTest(change=change):
        with self.assertRaisesRegex(S.CraftHold,'SOURCE_PIXEL_FORMAT_OR_ASPECT_MISMATCH'):
          S.require_square_yuv420_video(candidate,'SOURCE')

  def test_physical_444_and_anamorphic_source_tracks_are_rejected(self):
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
      self.skipTest('Native ffmpeg is required for actual H264 metadata')
    with tempfile.TemporaryDirectory() as td:
      root=Path(td)
      for tag,options in (
        ('444',['-pix_fmt','yuv444p']),
        ('anamorphic',['-vf','setsar=2/1','-pix_fmt','yuv420p']),
      ):
        with self.subTest(tag=tag):
          movie=root/(tag+'.mp4')
          subprocess.run(['ffmpeg','-nostdin','-v','error','-f','lavfi',
            '-i','testsrc2=s=64x96:r=30','-frames:v','3',
            '-c:v','libx264',*options,str(movie)],
            check=True,capture_output=True)
          stream,audio=S.media_info(movie)
          self.assertEqual(stream['codec_name'],'h264')
          self.assertEqual(audio,[])
          with self.assertRaisesRegex(S.CraftHold,'CRAFT_SCENE_PIXEL_FORMAT_OR_ASPECT_MISMATCH'):
            S.require_square_yuv420_video(stream,'CRAFT_SCENE')

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


  def test_inserted_scene_matches_decoded_output_and_is_visibly_new(self):
    source=[bytes([0]*12) for _ in range(6)]
    scene=[bytes([255]*12),bytes([150]*12)]
    output=[*source[:2],*scene,*source[4:]]
    manifest={'frames':6,'startFrame':2,'endFrameExclusive':4}
    def decode(path):
      return iter({'src':source,'scene':scene,'final':output}[path])
    r=S.audit_inserted_scene_frames('src','scene','final',manifest,decoder=decode)
    self.assertEqual(r['insertedFramesCompared'],2)
    self.assertEqual(r['visiblyChangedEditedFrames'],2)
    self.assertEqual(r['maxSceneToOutputMeanAbsRgb255'],0)
    self.assertEqual(r['maxEditedSourceToOutputMeanAbsRgb255'],255)

  def test_missing_or_misordered_craft_scene_is_refused(self):
    source=[bytes([0]*12) for _ in range(6)]
    scene=[bytes([255]*12),bytes([150]*12)]
    manifest={'frames':6,'startFrame':2,'endFrameExclusive':4}
    candidate_frames={
      'omitted':source,
      'wrong_scene':[*source[:2],bytes([40]*12),bytes([90]*12),*source[4:]],
      'reordered':[*source[:2],scene[1],scene[0],*source[4:]],
    }
    for kind,candidate in candidate_frames.items():
      def decode(path):
        return iter({'src':source,'scene':scene,'final':candidate}[path])
      with self.subTest(kind=kind),self.assertRaisesRegex(
          S.CraftHold,'INSERTED_SCENE_DOES_NOT_MATCH_ENCODED_MOVIE'):
        S.audit_inserted_scene_frames('src','scene','final',manifest,decoder=decode)

  def test_identical_replacement_cannot_claim_visible_craft_edit(self):
    source=[bytes([11]*12) for _ in range(6)]
    scene=[bytes([11]*12) for _ in range(2)]
    manifest={'frames':6,'startFrame':2,'endFrameExclusive':4}
    def decode(path):
      return iter({'src':source,'scene':scene,'final':source}[path])
    with self.assertRaisesRegex(S.CraftHold,'NO_VISIBLE_CRAFT_EDIT_IN_INSERTION_INTERVAL'):
      S.audit_inserted_scene_frames('src','scene','final',manifest,decoder=decode)

  def test_inserted_scene_requires_complete_all_streams(self):
    source=[bytes([0]*12) for _ in range(6)]
    scene=[bytes([255]*12),bytes([150]*12)]
    candidate=[*source[:2],*scene,*source[4:]]
    manifest={'frames':6,'startFrame':2,'endFrameExclusive':4}
    for kind,streams in {
      'short scene':{'src':source,'scene':scene[:1],'final':candidate},
      'extra scene':{'src':source,'scene':scene+[bytes([1]*12)],'final':candidate},
      'short output':{'src':source,'scene':scene,'final':candidate[:-1]},
      'extra source':{'src':source+[bytes([0]*12)],'scene':scene,'final':candidate},
      'bad scene geometry':{'src':source,'scene':[bytes([255]*6),scene[1]],'final':candidate}
    }.items():
      def decode(path):
        return iter(streams[path])
      with self.subTest(kind=kind),self.assertRaises(S.CraftHold):
        S.audit_inserted_scene_frames('src','scene','final',manifest,decoder=decode)

  def test_inserted_scene_rejects_untrusted_bounds(self):
    src=[bytes([0]*12) for _ in range(6)]
    def decode(path):return iter(src)
    for bad in ({'frames':6,'startFrame':-1,'endFrameExclusive':4},
                {'frames':6,'startFrame':2,'endFrameExclusive':7},
                {'frames':6,'startFrame':4,'endFrameExclusive':4}):
      with self.subTest(bad=bad),self.assertRaisesRegex(S.CraftHold,'UNTRUSTED_INSERTION_INTERVAL'):
        S.audit_inserted_scene_frames('src','scene','final',bad,decoder=decode)

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
        self.assertIn('-xerror',argv)
        staged=Path(argv[-1])
        self.assertNotIn(staged.resolve(),{source.resolve(),scene.resolve()})
        called.append(staged)
        staged.write_bytes(b'RESEARCH FILM')
        return ''
      manifest={'startFrame':1,'endFrameExclusive':2,
                'sourceFilmSha256':S.digest(source),'craftSceneSha256':S.digest(scene)}
      verdict={'mayPublish':False,'status':'MOCK_CODEC_CONTRACT_ONLY',
               'outputFilmSha256':hashlib.sha256(b'RESEARCH FILM').hexdigest(),
               'scienceApproved':False,'craftApproved':False,
               'phonePlaybackApproved':False}
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

  def test_prior_film_and_receipt_cannot_be_replaced_even_before_encoder(self):
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      source=folder/'source.mp4';source.write_bytes(b'SOURCE')
      scene=folder/'scene.mp4';scene.write_bytes(b'SCENE')
      output=folder/'output.mp4';output.write_bytes(b'PRIOR FILM')
      receipt=output.with_suffix('.receipt.json');receipt.write_bytes(b'PRIOR RECEIPT')
      with patch.object(S,'preflight',return_value=True),patch.object(S,'run') as encode:
        with self.assertRaisesRegex(S.CraftHold,'FRESH_OUTPUT_AND_RECEIPT_REQUIRED'):
          S.splice(source,scene,output,{'startFrame':1,'endFrameExclusive':2})
        encode.assert_not_called()
      self.assertEqual(output.read_bytes(),b'PRIOR FILM')
      self.assertEqual(receipt.read_bytes(),b'PRIOR RECEIPT')
      self.assertEqual(source.read_bytes(),b'SOURCE')
      self.assertEqual(list(folder.glob('.lane3-splice-*')),[])

  def test_failed_staged_verification_never_exposes_unapproved_fresh_film(self):
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      source=folder/'source.mp4';source.write_bytes(b'SOURCE')
      scene=folder/'scene.mp4';scene.write_bytes(b'SCENE')
      output=folder/'fresh.mp4'
      def fake_ffmpeg(argv,**_):
        Path(argv[-1]).write_bytes(b'FAILED CANDIDATE')
      with (
        patch.object(S,'preflight',return_value=True),
        patch.object(S,'run',side_effect=fake_ffmpeg),
        patch.object(S,'verify_result',side_effect=S.CraftHold('FAILED_VISUAL_NEGATIVE')),
      ):
        with self.assertRaisesRegex(S.CraftHold,'FAILED_VISUAL_NEGATIVE'):
          S.splice(source,scene,output,{'startFrame':1,'endFrameExclusive':2})
      self.assertFalse(output.exists())
      self.assertFalse(output.with_suffix('.receipt.json').exists())
      self.assertEqual(source.read_bytes(),b'SOURCE')
      self.assertEqual(scene.read_bytes(),b'SCENE')
      self.assertEqual(list(folder.glob('.lane3-splice-*')),[])




  def test_truncated_h264_is_refused_without_publishing_a_movie(self):
    """Physical truncated H264: decoder failure means research HOLD.

    FFmpeg versions differ on which entropy-corrupt packet warnings are
    fatal, so use actual truncated MP4 transport, not a guessed macroblock
    damage pattern. Full exact-PTS retention is NOT claimed by this fixture.
    """
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
      self.skipTest('Native FFmpeg is required for real truncated film negative')
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      original=folder/'original.mp4'
      scene=folder/'replacement.mp4'
      subprocess.run(['ffmpeg','-nostdin','-v','error','-f','lavfi',
        '-i','testsrc2=s=96x170:r=30',
        '-f','lavfi','-i','anullsrc=r=24000:cl=mono',
        '-frames:v','35','-shortest','-c:v','libx264','-pix_fmt','yuv420p',
        '-c:a','aac','-movflags','+faststart',str(original)],
        check=True,capture_output=True)
      subprocess.run(['ffmpeg','-nostdin','-v','error','-f','lavfi',
        '-i','color=c=white:s=96x170:r=30','-frames:v','4',
        '-c:v','libx264','-pix_fmt','yuv420p',str(scene)],
        check=True,capture_output=True)
      source=folder/'damaged.mp4'
      raw=original.read_bytes()
      self.assertIn(b'moov',raw[:5000])
      # Retain the MP4 header/index while truncating a H264 payload.
      # Try several physical cuts because AAC/H264 packet layout differs
      # across FFmpeg versions.
      corrupt=None
      for cut in (32,64,128,512,len(raw)-128):
        source.write_bytes(raw[:-cut])
        try:
          list(S._decoded_rgb_frames(source,width=96,height=170))
        except S.CraftHold:
          corrupt=source.read_bytes()
          break
      self.assertIsNotNone(corrupt,'Failed to create a genuinely unreadable H264 film')
      self.assertNotEqual(hashlib.sha256(corrupt).hexdigest(),S.digest(original))
      manifest={'frames':35,'width':96,'height':170,'fps':30,
        'startFrame':14,'endFrameExclusive':18,
        'sourceFilmSha256':S.digest(source),
        'craftSceneSha256':S.digest(scene)}
      output=folder/'should-not-exist.mp4'
      with self.assertRaises(S.CraftHold):
        S.splice(source,scene,output,manifest)
      self.assertFalse(output.exists())
      self.assertFalse(output.with_suffix('.receipt.json').exists())
      self.assertEqual(list(folder.glob('.lane3-splice-*')),[])


  def test_aac_packet_timeline_rejects_missing_duration_and_nonfinite(self):
    baseline={'packets':[{'pts_time':'-0.042667','dts_time':'-0.042667',
                           'duration_time':'0.042667'}]}
    with patch.object(S,'run',return_value=json.dumps(baseline)):
      result=S.original_aac_packet_timeline('fake.mp4')
      self.assertEqual(len(result),1)
    for change in ({'duration_time':'0'},
                   {'duration_time':'-0.040'},
                   {'duration_time':'NaN'},
                   {'pts_time':'Infinity'},
                   {'dts_time':'1e999'},
                   {'pts_time':'-300'},
                   {'duration_time':'2.0'},
                   {'duration_time':None}):
      bad=json.loads(json.dumps(baseline))
      bad['packets'][0].update(change)
      with self.subTest(change=change),patch.object(S,'run',return_value=json.dumps(bad)):
        with self.assertRaises(S.CraftHold):
          S.original_aac_packet_timeline('bad.mp4')
    with patch.object(S,'run',return_value=json.dumps({'packets':[]})):
      with self.assertRaisesRegex(S.CraftHold,'AAC_PACKET_TIMELINE_UNAVAILABLE'):
        S.original_aac_packet_timeline('empty.mp4')

  def test_aac_packet_timeline_rejects_missing_shifted_or_resized_packet(self):
    from decimal import Decimal as D
    base=[(D('-0.042667'),D('-0.042667'),D('0.042667')),
          (D('0.000000'),D('0.000000'),D('0.042667'))]
    cases={
      'missing_packet':base[:1],
      'shifted_pts':[(base[0][0]+D('.100'),base[0][1],base[0][2]),base[1]],
      'shifted_dts':[(base[0][0],base[0][1]+D('.100'),base[0][2]),base[1]],
      'wrong_duration':[(base[0][0],base[0][1],D('.060')),base[1]],
    }
    for name,changed in cases.items():
      def fake(path):return base if path=='original' else changed
      with self.subTest(name=name),patch.object(S,'original_aac_packet_timeline',side_effect=fake):
        reason=('ORIGINAL_AAC_PACKET_COUNT_CHANGED' if name=='missing_packet'
                else 'ORIGINAL_AAC_PACKET_TIMING_CHANGED')
        with self.assertRaisesRegex(S.CraftHold,reason):
          S.audit_original_aac_timing('original','changed')
    acceptable=[tuple(v+D('.0005') for v in packet) for packet in base]
    with patch.object(S,'original_aac_packet_timeline',side_effect=lambda p:base if p=='original' else acceptable):
      verdict=S.audit_original_aac_timing('original','rounded')
    self.assertEqual(verdict['packetsCompared'],2)
    self.assertEqual(verdict['maxTimestampOrDurationDriftMs'],0.5)

  def test_real_h264_aac_full_splice_preserves_unedited_frames_and_sound(self):
    """Exercise preflight, concat, encoded QA and handoff with *real* FFmpeg.

    Synthetic 12-frame black H264 + silent AAC and 4-frame white replacement
    are NOT the archived evidence movie or the original Kokoro narration.
    This protects the full-film mechanics, not independent craft acceptance.
    """
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
      self.skipTest('Free native FFmpeg/FFprobe required for real splice fixture')
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      source=folder/'synthetic-source.mp4'
      scene=folder/'synthetic-white-replacement.mp4'
      output=folder/'new-full.mp4'
      subprocess.run(['ffmpeg','-nostdin','-v','error','-f','lavfi',
        '-i','color=c=black:s=96x170:r=30',
        '-f','lavfi','-i','anullsrc=r=24000:cl=mono',
        '-frames:v','12','-c:v','libx264','-pix_fmt','yuv420p',
        '-c:a','aac','-shortest',str(source)],
        check=True,capture_output=True)
      subprocess.run(['ffmpeg','-nostdin','-v','error','-f','lavfi',
        '-i','color=c=white:s=96x170:r=30','-frames:v','4',
        '-an','-c:v','libx264','-pix_fmt','yuv420p',str(scene)],
        check=True,capture_output=True)
      source_pin,scene_pin=S.digest(source),S.digest(scene)
      audio_pin=S.aac_sha(source)
      fixture={
        'frames':12,'width':96,'height':170,'fps':30,
        'startFrame':4,'endFrameExclusive':8,
        'sourceFilmSha256':source_pin,'craftSceneSha256':scene_pin
      }
      self.assertTrue(S.preflight(source,scene,fixture))
      result=S.splice(source,scene,output,fixture)
      self.assertEqual(S.digest(source),source_pin)
      self.assertEqual(S.digest(scene),scene_pin)
      self.assertEqual(S.digest(output),result['outputFilmSha256'])
      self.assertEqual(S.aac_sha(output),audio_pin)
      self.assertEqual(result['aacAdtsSha256'],audio_pin)
      self.assertGreater(result['aacPacketTimelineAudit']['packetsCompared'],0)
      self.assertLessEqual(result['aacPacketTimelineAudit']['maxTimestampOrDurationDriftMs'],1.5)
      self.assertEqual(result['frames'],12)
      self.assertEqual(result['outsideSceneVisualAudit']['framesComparedOutsideScene'],8)
      self.assertEqual(result['outsideSceneVisualAudit']['outsideFrameMaxMeanAbsRgb255'],0)
      self.assertEqual(result['insertedSceneVisualAudit']['insertedFramesCompared'],4)
      self.assertGreaterEqual(result['insertedSceneVisualAudit']['visiblyChangedEditedFrames'],3)
      self.assertLessEqual(result['insertedSceneVisualAudit']['maxSceneToOutputMeanAbsRgb255'],12)
      frames=list(S._decoded_rgb_frames(output,width=96,height=170))
      self.assertEqual(len(frames),12)
      self.assertTrue(all(max(frame)==0 for frame in frames[:4]+frames[8:]))
      self.assertGreater(min(frames[5]),200)
      receipt=output.with_suffix('.receipt.json')
      self.assertEqual(json.loads(receipt.read_text()),result)
      # Real physical A/V desync: reuse *identical* AAC elementary frames,
      # but delay their MP4 packet timestamps by 100ms. SHA alone misses it.
      shifted=folder/'shifted-audio-not-approved.mp4'
      subprocess.run(['ffmpeg','-nostdin','-v','error','-i',str(output),
        '-itsoffset','0.100','-i',str(output),
        '-map','0:v:0','-map','1:a:0','-c','copy',
        '-movflags','+faststart',str(shifted)],
        check=True,capture_output=True)
      self.assertEqual(S.aac_sha(shifted),audio_pin)
      self.assertEqual(len(S.original_aac_packet_timeline(shifted)),
                       result['aacPacketTimelineAudit']['packetsCompared'])
      with self.assertRaisesRegex(S.CraftHold,'ORIGINAL_AAC_PACKET_TIMING_CHANGED'):
        S.verify_result(source,shifted,fixture,scene=scene)
      for key in ('scienceApproved','craftApproved','phonePlaybackApproved','mayPublish'):
        self.assertIs(result[key],False)
      self.assertFalse(list(folder.glob('.lane3-splice-*')))
      # Preflight legitimately calls ffprobe via run(); mock that layer only
      # for this second call so the assertion measures encoder non-admission.
      with patch.object(S,'preflight',return_value=True), patch.object(S,'run') as launch:
        with self.assertRaisesRegex(S.CraftHold,'FRESH_OUTPUT_AND_RECEIPT_REQUIRED'):
          S.splice(source,scene,output,fixture)
        launch.assert_not_called()

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
      protected=folder/'protected-owner.mp4';protected.write_bytes(b'OWNER FILM')
      linked=folder/'alias.mp4';linked.symlink_to(protected)
      with self.assertRaisesRegex(S.CraftHold,'FRESH_OUTPUT_AND_RECEIPT_REQUIRED'):
        S.publish_verified_pair_no_clobber(stage,staged_receipt,linked,sidecar)
      self.assertTrue(linked.is_symlink())
      self.assertEqual(protected.read_bytes(),b'OWNER FILM')
      linked.unlink()
      self.assertTrue(S.publish_verified_pair_no_clobber(stage,staged_receipt,movie,sidecar))
      self.assertEqual(movie.read_bytes(),b'VERIFIED VIDEO')
      self.assertEqual(protected.read_bytes(),b'OWNER FILM')
      self.assertEqual(sidecar.read_bytes(),staged_receipt.read_bytes())
      self.assertEqual((movie.stat().st_dev,movie.stat().st_ino),
                       (stage.stat().st_dev,stage.stat().st_ino))
      self.assertFalse(json.loads(sidecar.read_text())['mayPublish'])


  def test_staged_research_receipt_must_bind_exact_unchanged_film(self):
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      stage=folder/'stage.mp4';stage.write_bytes(b'PINNED MOVIE')
      sidecar=folder/'stage.receipt.json'
      out=folder/'movie.mp4';out_receipt=folder/'movie.receipt.json'
      trusted={'outputFilmSha256':S.digest(stage),'mayPublish':False,
        'scienceApproved':False,'craftApproved':False,'phonePlaybackApproved':False}
      sidecar.write_text(json.dumps(trusted,indent=2)+'\n')
      stage.write_bytes(b'CHANGED AFTER QA')
      with self.assertRaisesRegex(S.CraftHold,'STAGED_FILM_RECEIPT_SHA_MISMATCH'):
        S.publish_verified_pair_no_clobber(stage,sidecar,out,out_receipt,
          trusted_receipt=trusted)
      self.assertFalse(out.exists());self.assertFalse(out_receipt.exists())
      stage.write_bytes(b'PINNED MOVIE')
      sidecar.write_text(json.dumps(trusted,indent=2)+'\n'+'{"mayPublish":true}')
      with self.assertRaisesRegex(S.CraftHold,'STAGED_RECEIPT_CONTENT_CHANGED'):
        S.publish_verified_pair_no_clobber(stage,sidecar,out,out_receipt,
          trusted_receipt=trusted)
      self.assertFalse(out.exists());self.assertFalse(out_receipt.exists())
      sidecar.write_text(json.dumps(trusted,indent=2)+'\n')
      self.assertTrue(S.publish_verified_pair_no_clobber(stage,sidecar,out,out_receipt,
        trusted_receipt=trusted))
      self.assertEqual(S.digest(out),trusted['outputFilmSha256'])
      self.assertEqual(out_receipt.read_bytes(),sidecar.read_bytes())

  def test_staged_receipt_release_authorization_cannot_be_claimed(self):
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      stage=folder/'stage.mp4';stage.write_bytes(b'FILM')
      sidecar=folder/'stage.receipt.json'
      out=folder/'movie.mp4';out_receipt=folder/'movie.receipt.json'
      base={'outputFilmSha256':S.digest(stage),'mayPublish':False,
        'scienceApproved':False,'craftApproved':False,'phonePlaybackApproved':False}
      for field in ('mayPublish','scienceApproved','craftApproved','phonePlaybackApproved'):
        dishonest=dict(base);dishonest[field]=True
        sidecar.write_text(json.dumps(dishonest,indent=2)+'\n')
        with self.subTest(field=field),self.assertRaisesRegex(
            S.CraftHold,'STAGED_RESEARCH_RELEASE_HOLD_CHANGED'):
          S.publish_verified_pair_no_clobber(stage,sidecar,out,out_receipt,
            trusted_receipt=dishonest)
      self.assertFalse(out.exists());self.assertFalse(out_receipt.exists())

  def test_splice_refuses_mutated_video_between_qa_and_publication(self):
    with tempfile.TemporaryDirectory() as td:
      folder=Path(td)
      source=folder/'source.mp4';source.write_bytes(b'SOURCE')
      scene=folder/'scene.mp4';scene.write_bytes(b'SCENE')
      output=folder/'new.mp4'
      manifest={'startFrame':1,'endFrameExclusive':2,
        'sourceFilmSha256':S.digest(source),'craftSceneSha256':S.digest(scene)}
      validated={'outputFilmSha256':hashlib.sha256(b'ENCODED APPROVED').hexdigest(),
        'mayPublish':False,'scienceApproved':False,
        'craftApproved':False,'phonePlaybackApproved':False}
      def fake_encode(args,**_):
        Path(args[-1]).write_bytes(b'ENCODED APPROVED')
        return ''
      real_publish=S.publish_verified_pair_no_clobber
      def changed_after_qa(stage,receipt,movie,sidecar,**kw):
        Path(stage).write_bytes(b'ENCODED MODIFIED')
        return real_publish(stage,receipt,movie,sidecar,**kw)
      with (
        patch.object(S,'preflight',return_value=True),
        patch.object(S,'run',side_effect=fake_encode),
        patch.object(S,'verify_result',return_value=validated),
        patch.object(S,'publish_verified_pair_no_clobber',side_effect=changed_after_qa),
      ):
        with self.assertRaisesRegex(S.CraftHold,'STAGED_FILM_RECEIPT_SHA_MISMATCH'):
          S.splice(source,scene,output,manifest)
      self.assertEqual(source.read_bytes(),b'SOURCE')
      self.assertEqual(scene.read_bytes(),b'SCENE')
      self.assertFalse(output.exists())
      self.assertFalse(output.with_suffix('.receipt.json').exists())
      self.assertEqual(list(folder.glob('.lane3-splice-*')),[])

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
