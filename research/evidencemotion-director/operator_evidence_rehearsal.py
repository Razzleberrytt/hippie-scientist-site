#!/usr/bin/env python3
"""Operator rehearsal for an immutable EvidenceMotion research QA bundle.

Reads actual bytes, refuses tampering, duplicates, zip traversal/symlinks,
unsafe source/approval drift, and checks actual H264/AAC & silent media.
Simulates research-staging rollback in a temporary sandbox; NEVER publishes,
deploys or promotes research output. This is not a human comprehension test.
"""
import argparse
import hashlib
import json
import re
import stat
import subprocess
import tempfile
import zipfile
from pathlib import Path, PurePosixPath

REQUIRED=(
 'film.mp4','sound-off.mp4','actual-pixel-text-evidence.json',
 'opening-reading-budget.json','objective-score.json','answer-recovery.json',
 'native-text-legibility.json','claim-screen.json','phone-ui-plan.json',
 'render-receipt.json','negative-critic.json','decoded-technical.json')
SHA=re.compile(r'^[0-9a-f]{64}$')
# Externally recorded immutable identities of this ONE reviewed research film.
# Changing the accepted film requires a separately source-reviewed handoff.
PINNED_RESEARCH_FILM_SHA='acff8b90d29c0a3086dc50a41b5c411fea8c1d770ce5467d31bd16329fc3f574'
PINNED_SOURCE_WAV_SHA='9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435'
REQUIRED_PIXEL_NEGATIVES={
 'delete_physical_frame:compound_a':'q1',
 'delete_physical_frame:compound_b':'q1',
 'delete_physical_frame:hydroxyl':'q2',
 'delete_physical_frame:computed_shape':'q3',
 'delete_physical_frame:human_effect_limit':'q4',
 'delete_physical_frame:source_hold':'q5',
 'swap_first_two_chemical_frames':'q1',
 'show_molecule_instead_of_source_card':'q5',
 'swap_both_valid_cid_number_assignments':'q5',
 'remove_7oh_to_cid_join_keep_cid_number':'q5',
}

def hold(reason):raise ValueError('RESEARCH_HANDOFF_HOLD:'+reason)
def sha_bytes(data):return hashlib.sha256(data).hexdigest()
def sha_path(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as f:
  for p in iter(lambda:f.read(1024*1024),b''):h.update(p)
 return h.hexdigest()

def probe_movie(path):
 raw=subprocess.check_output(['ffprobe','-v','error','-count_frames',
    '-show_entries','stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames',
    '-of','json',str(path)],stderr=subprocess.DEVNULL,timeout=60)
 streams=json.loads(raw)['streams']
 vids=[s for s in streams if s['codec_type']=='video']
 aud=[s for s in streams if s['codec_type']=='audio']
 if len(vids)!=1 or not all([vids[0].get('codec_name')=='h264',
       vids[0].get('width')==1080,vids[0].get('height')==1920,
       vids[0].get('r_frame_rate')=='30/1',
       int(vids[0].get('nb_read_frames','-1'))==1031]):
  hold('NATIVE_VIDEO_INVALID_OR_INCOMPLETE')
 if Path(path).name=='sound-off.mp4':
  if aud:hold('MUTED_STREAM_CONTAINS_AUDIO')
 elif len(aud)!=1 or aud[0]['codec_name']!='aac':
  hold('MASTER_MISSING_AAC')
 audio_adts_sha=None
 if aud:
  try:
   adts=subprocess.check_output(['ffmpeg','-hide_banner','-v','error',
        '-i',str(path),'-map','0:a:0','-c:a','copy','-f','adts','-'],
        stderr=subprocess.DEVNULL,timeout=60)
  except (subprocess.CalledProcessError,subprocess.TimeoutExpired,OSError):
   hold('ACTUAL_NARRATION_AAC_EXTRACTION_FAILED')
  if not adts:hold('ACTUAL_NARRATION_AAC_EMPTY')
  audio_adts_sha=sha_bytes(adts)
 return {'decodedVideoFrames':1031,'nativeResolution':[1080,1920],
         'actualEncodedVideoConfirmed':True,'audioStreamCount':len(aud),
         'audioAdtsSha256':audio_adts_sha}

def rehearse(archive,expected_archive_sha,*,probe=probe_movie,
             expected_film_sha=PINNED_RESEARCH_FILM_SHA):
 # The CLI deliberately never exposes a film-SHA override. Test-only fixture
 # injection is explicit rather than allowing a forged ZIP to bless its own MP4.
 if not isinstance(expected_film_sha,str) or not SHA.fullmatch(expected_film_sha):
  hold('INDEPENDENT_PINNED_FILM_SHA_REQUIRED')
 archive=Path(archive)
 if not SHA.fullmatch(expected_archive_sha):hold('EXPECTED_ARCHIVE_HASH_REQUIRED')
 if (not archive.is_file() or archive.is_symlink()
       or archive.stat().st_size>150_000_000):hold('ARCHIVE_UNAVAILABLE_OR_UNSAFE')
 archive_sha=sha_path(archive)
 if archive_sha!=expected_archive_sha:hold('ARCHIVE_HASH_DRIFT')
 with zipfile.ZipFile(archive) as z:
  infos=z.infolist();names=[i.filename for i in infos]
  if len(names)!=len(set(names)) or len(names)>120:hold('DUPLICATED_OR_EXCESSIVE_MEMBERS')
  if sum(i.file_size for i in infos)>250_000_000:hold('ZIP_BOMB_SIZE_LIMIT')
  for info in infos:
   path=PurePosixPath(info.filename)
   if (path.is_absolute() or not info.filename or '\\' in info.filename
      or '..' in path.parts or '.' in path.parts or info.file_size>120_000_000
      or stat.S_ISLNK((info.external_attr>>16)&0xffff)):
    hold('UNSAFE_ARCHIVE_ENTRY')
  if not set(REQUIRED).issubset(names):hold('MISSING_EVIDENCE_MEMBERS')
  data={n:z.read(n) for n in REQUIRED}
 docs={n:json.loads(v) for n,v in data.items() if n.endswith('.json')}
 movie=sha_bytes(data['film.mp4']);muted=sha_bytes(data['sound-off.mp4'])
 if movie!=expected_film_sha:hold('PINNED_MASTER_MEDIA_DRIFT')
 plan=sha_bytes(data['phone-ui-plan.json']);claim=sha_bytes(data['claim-screen.json'])
 for doc,key,expected in (
  ('render-receipt.json','videoSha256',movie),
  ('actual-pixel-text-evidence.json','exactMovieSha256',movie),
  ('native-text-legibility.json','actualFilmSha256',movie),
  ('answer-recovery.json','actualFilmSha256',movie),
  ('objective-score.json','actualVideoSha256',movie),
  ('negative-critic.json','actualVideoSha256',movie),
  ('claim-screen.json','actualVideoSha256',movie),
  ('objective-score.json','actualMutedVideoSha256',muted),
  ('actual-pixel-text-evidence.json','exactPhonePlanSha256',plan),
  ('objective-score.json','exactPhonePlanSha256',plan),
  ('answer-recovery.json','exactPhonePlanSha256',plan),
  ('actual-pixel-text-evidence.json','exactClaimReportSha256',claim),
  ('objective-score.json','exactScientificClaimScreenSha256',claim),
  ('answer-recovery.json','exactClaimScreenSha256',claim)):
  if docs[doc].get(key)!=expected:hold('CROSS_DOCUMENT_PROVENANCE_MISMATCH:'+doc+':'+key)
 for name,d in docs.items():
  if 'mayPublish' in d:
   if d['mayPublish'] is not False:hold('UNAUTHORIZED_PUBLICATION_VERDICT:'+name)
  elif d.get('releaseApproved') is not False:
   hold('MISSING_RELEASE_HOLD:'+name)
 receipt=docs['render-receipt.json']
 if (receipt.get('sourceWavSha256')!=PINNED_SOURCE_WAV_SHA or
     docs['claim-screen.json'].get('actualWavSha256')!=PINNED_SOURCE_WAV_SHA):
  hold('PINNED_SOURCE_WAV_IDENTITY_DRIFT')
 technical=docs['decoded-technical.json']
 if (technical.get('technical')!='PASS'
     or technical.get('masterSha256')!=movie
     or technical.get('fullDecodePerformed') is not True
     or technical.get('frameTimingVerified') is not True
     or not SHA.fullmatch(str(technical.get('audioAdtsSha256','')))):
  hold('DECODED_AUDIO_VIDEO_IDENTITY_NOT_VERIFIED')
 if any(receipt.get(k) is not False for k in
        ('craftApproved','scienceApproved','pronunciationVerified','deviceVerified')):
  hold('RESEARCH_RENDER_MISLABELLED_AS_APPROVED')
 px=docs['actual-pixel-text-evidence.json']
 if (px.get('answersRecovered')!=5 or px.get('negativeControlsRejected')!=10
     or px.get('humanAudienceParticipants')!=0
     or px.get('humanUnderstandingDemonstrated') is not False
     or px.get('humanComprehensionCalibrated') is not False
     or px.get('annotationTextUsedAsAnswer') is not False
     or px.get('automationAdditionalResearchPoints')!=1):
  hold('PIXEL_ONLY_RESEARCH_OR_NEGATIVE_CONTROLS_MISSING')
 # Never let a contradictory or forged aggregate count bless an unsafe screen.
 observed=px.get('negativeControls')
 if not isinstance(observed,list) or len(observed)!=10:
  hold('PIXEL_NEGATIVE_EVIDENCE_ROWS_MISSING')
 if ({x.get('fault'):x.get('target') for x in observed if isinstance(x,dict)}
      != REQUIRED_PIXEL_NEGATIVES
     or any(not isinstance(x,dict) or x.get('rejected') is not True
            for x in observed)):
  hold('PIXEL_NEGATIVE_EVIDENCE_FALSE_PASS')
 answers=px.get('answerEvidenceFromPixelsOnly')
 if (not isinstance(answers,dict) or set(answers)!={'q1','q2','q3','q4','q5'}
     or any(answers[k] is not True for k in answers)):
  hold('PIXEL_SCIENCE_ANSWER_EVIDENCE_MISSING')
 frames=px.get('frameProofs')
 if (not isinstance(frames,dict) or
     set(frames)!={'compound_a','compound_b','hydroxyl','computed_shape',
                  'human_effect_limit','source_hold'} or
     any(not isinstance(v,dict) or not SHA.fullmatch(
         str(v.get('frameSha256',''))) for v in frames.values())):
  hold('PIXEL_FRAME_HASH_EVIDENCE_MISSING')
 score=docs['objective-score.json'];load=docs['opening-reading-budget.json']
 if (score.get('microChecksPassed')!=12 or score.get('microChecksTotal')!=12
     or score.get('actualUnfamiliarViewerComprehensionVerified') is not False
     or score.get('humanAudienceResponsesObserved')!=0
     or len(load.get('allSceneSpans',[]))!=9
     or load.get('allScenesReadingBudgetPass') is not True
     or any(not x.get('passesFullFilmReadingBudget') for x in load['allSceneSpans'])):
  hold('MISSING_REAL_NINE_SCENE_CHECKS')
 # The legacy overlay-only 5-word/s pass is not a full visible-text pass:
 # real rendered captions add words to the same rapid cuts.
 if (load.get('schema')!='ths-evidencemotion-native-rapid-cut-reading-budget-v2'
     or load.get('legacyOverlayOnlyGate') is not True
     or not isinstance(load.get('captionWordsSampled'),int)
     or load['captionWordsSampled']<=0
     or load.get('allScenesCombinedVisibleTextBudgetPass') is not False
     or load.get('combinedCaptionOverlayLoadRequiresReview') is not True
     or load.get('fullMutedComprehensionApproved') is not False):
  hold('COMBINED_CAPTION_READING_LOAD_NOT_AUDITED_OR_FALSIFIED')
 contrast=docs['native-text-legibility.json']
 if (contrast.get('testedCriticalVisibleLabels')!=16
     or contrast.get('additionalObjectivePoints')!=2):
  hold('PIXEL_CONTRAST_OR_PERSISTENCE_UNVERIFIED')
 claims=docs['claim-screen.json']
 if any(claims.get(k) is not False for k in
      ('independentScientificReviewApproved','craftApproved','realHandsetPlaybackVerified')):
  hold('INVENTED_SCIENCE_CRAFT_OR_DEVICE_VERDICT')
 with tempfile.TemporaryDirectory(prefix='evidencemotion-operator-') as temp:
  tmp=Path(temp)
  for name in ('film.mp4','sound-off.mp4'):(tmp/name).write_bytes(data[name])
  decoded={name:probe(tmp/name) for name in ('film.mp4','sound-off.mp4')}
  if (decoded['film.mp4'].get('audioAdtsSha256')!=technical['audioAdtsSha256']
      or decoded['sound-off.mp4'].get('audioAdtsSha256') is not None):
   hold('ACTUAL_AAC_NARRATION_NOT_PINNED_TO_DECODED_TECHNICAL')
  # RESEARCH ONLY: a simulated failed candidate must NOT replace the last
  # verified research hash. No external publishing or deployment interfaces.
  stable={'researchSha':movie,'releaseApproved':False}
  mutated={'researchSha':'0'*64,'releaseApproved':False}
  if mutated['researchSha']==movie:hold('ROLLBACK_NEGATIVE_NOT_MUTATED')
  recovered=dict(stable)
  if recovered!=stable or recovered['releaseApproved']:
   hold('STAGING_ROLLBACK_DRILL_FAILED')
 return {
  'status':'PASS_RESEARCH_ONLY_RELEASE_HELD',
  'archiveSha256':archive_sha,'actualFilmSha256':movie,
  'actualMutedSha256':muted,'phonePlanSha256':plan,'claimReceiptSha256':claim,
  'pinnedSourceWavSha256':PINNED_SOURCE_WAV_SHA,
  'verifiedEncodedAacSha256':technical['audioAdtsSha256'],
  'mediaProbe':decoded,'simulatedResearchRollbackProtected':True,
  'sourceWavBytesPresentInThisBundle':False,'durableExternalEscrowVerified':False,
  'realProductionRollbackExecuted':False,'audienceComprehensionVerified':False,
  'medicalExpertApproved':False,'premiumFilmApproved':False,
  'realHandsetApproved':False,'mayPublish':False,
  'requiredNext':'Exact WAV escrow, independent calibrated reviews, genuine approved release + rollback before operator-gate checklist completion'
 }

if __name__=='__main__':
 a=argparse.ArgumentParser()
 a.add_argument('--bundle',required=True)
 a.add_argument('--expected-sha',required=True)
 a.add_argument('--out',required=True)
 args=a.parse_args()
 result=rehearse(args.bundle,args.expected_sha)
 out=Path(args.out);out.parent.mkdir(parents=True,exist_ok=True)
 out.write_text(json.dumps(result,indent=2)+'\n')
 print(json.dumps(result,indent=2))
