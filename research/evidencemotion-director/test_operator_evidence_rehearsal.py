"""Hermetic risk/rollback safety fixtures; fake bytes NEVER imply film approval."""
import hashlib
import json
import stat
import tempfile
import unittest
import zipfile
from pathlib import Path
from operator_evidence_rehearsal import REQUIRED,rehearse,PINNED_SOURCE_WAV_SHA

class ResearchOperatorHandoffTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory()
  self.addCleanup(self.temp.cleanup)
  self.path=Path(self.temp.name)/'review.zip'
  self.files=self.fixture()
 @staticmethod
 def fixture():
  files={
   'film.mp4':b'synthetic-fixture-movie-NOT-REAL',
   'sound-off.mp4':b'synthetic-fixture-no-sound-NOT-REAL',
   'phone-ui-plan.json':json.dumps({'releaseApproved':False}).encode(),
   'decoded-technical.json':json.dumps({'releaseApproved':False}).encode(),
  }
  film=hashlib.sha256(files['film.mp4']).hexdigest()
  mute=hashlib.sha256(files['sound-off.mp4']).hexdigest()
  phone=hashlib.sha256(files['phone-ui-plan.json']).hexdigest()
  enc=lambda x:json.dumps(x).encode()
  files['decoded-technical.json']=enc(dict(releaseApproved=False,technical='PASS',
      masterSha256=film,audioAdtsSha256='a'*64,fullDecodePerformed=True,
      frameTimingVerified=True))
  files['claim-screen.json']=enc(dict(mayPublish=False,actualVideoSha256=film,
      independentScientificReviewApproved=False,craftApproved=False,
      actualWavSha256=PINNED_SOURCE_WAV_SHA,
      realHandsetPlaybackVerified=False))
  claim=hashlib.sha256(files['claim-screen.json']).hexdigest()
  files.update({
   'render-receipt.json':enc(dict(mayPublish=False,videoSha256=film,
       sourceWavSha256=PINNED_SOURCE_WAV_SHA,
       craftApproved=False,scienceApproved=False,pronunciationVerified=False,deviceVerified=False)),
   'actual-pixel-text-evidence.json':enc(dict(mayPublish=False,exactMovieSha256=film,
       exactPhonePlanSha256=phone,exactClaimReportSha256=claim,answersRecovered=5,
       negativeControlsRejected=10,humanAudienceParticipants=0,
       humanUnderstandingDemonstrated=False,humanComprehensionCalibrated=False,
       annotationTextUsedAsAnswer=False,automationAdditionalResearchPoints=1,
       answerEvidenceFromPixelsOnly={f'q{i}':True for i in range(1,6)},
       frameProofs={name:{'timeSec':t,'frameSha256':hashlib.sha256(name.encode()).hexdigest()}
                    for name,t in [('compound_a',0.8),('compound_b',2.4),
                    ('hydroxyl',6),('computed_shape',19.5),
                    ('human_effect_limit',26.2),('source_hold',28.8)]},
       negativeControls=[{'fault':key,'target':value,'rejected':True} for key,value in (
           ('delete_physical_frame:compound_a','q1'),
           ('delete_physical_frame:compound_b','q1'),
           ('delete_physical_frame:hydroxyl','q2'),
           ('delete_physical_frame:computed_shape','q3'),
           ('delete_physical_frame:human_effect_limit','q4'),
           ('delete_physical_frame:source_hold','q5'),
           ('swap_first_two_chemical_frames','q1'),
           ('show_molecule_instead_of_source_card','q5'),
           ('swap_both_valid_cid_number_assignments','q5'),
           ('remove_7oh_to_cid_join_keep_cid_number','q5'),
       )])),
   'opening-reading-budget.json':enc(dict(mayPublish=False,
       schema='ths-evidencemotion-native-rapid-cut-reading-budget-v2',
       allScenesReadingBudgetPass=True,
       legacyOverlayOnlyGate=True,captionWordsSampled=40,
       allScenesCombinedVisibleTextBudgetPass=False,
       combinedCaptionOverlayLoadRequiresReview=True,
       fullMutedComprehensionApproved=False,
       allSceneSpans=[{'passesFullFilmReadingBudget':True} for _ in range(9)])),
   'objective-score.json':enc(dict(mayPublish=False,actualVideoSha256=film,
       actualMutedVideoSha256=mute,exactPhonePlanSha256=phone,
       exactScientificClaimScreenSha256=claim,microChecksPassed=12,microChecksTotal=12,
       actualUnfamiliarViewerComprehensionVerified=False,humanAudienceResponsesObserved=0)),
   'answer-recovery.json':enc(dict(mayPublish=False,actualFilmSha256=film,
       exactPhonePlanSha256=phone,exactClaimScreenSha256=claim)),
   'native-text-legibility.json':enc(dict(mayPublish=False,actualFilmSha256=film,
       testedCriticalVisibleLabels=16,additionalObjectivePoints=2)),
   'negative-critic.json':enc(dict(mayPublish=False,actualVideoSha256=film)),
  })
  assert set(REQUIRED).issubset(files)
  return files
 def write(self,extra=()):
  with zipfile.ZipFile(self.path,'w',compression=zipfile.ZIP_DEFLATED) as z:
   for k,v in self.files.items():z.writestr(k,v)
   for k,v in extra:z.writestr(k,v)
  return hashlib.sha256(self.path.read_bytes()).hexdigest()
 def check(self,extra=()):
  sha=self.write(extra)
  # Synthetic probes validate only contracts, not actual encoded media.
  return rehearse(self.path,sha,
      probe=lambda p: {'syntheticFixtureOnly':True,
                       'audioAdtsSha256':'a'*64 if p.name=='film.mp4' else None},
      expected_film_sha=hashlib.sha256(self.files['film.mp4']).hexdigest())
 def change(self,file,**changes):
  j=json.loads(self.files[file]);j.update(changes)
  self.files[file]=json.dumps(j).encode()
 def test_research_pass_cannot_approve_release(self):
  x=self.check()
  self.assertEqual(x['status'],'PASS_RESEARCH_ONLY_RELEASE_HELD')
  self.assertTrue(x['simulatedResearchRollbackProtected'])
  self.assertFalse(x['mayPublish'])
  self.assertFalse(x['realProductionRollbackExecuted'])
 def test_refuses_noncanonical_film_even_when_all_receipts_are_rehashed(self):
  original=hashlib.sha256(self.files['film.mp4']).hexdigest()
  self.files['film.mp4']=b'substituted-AAC-narration'
  changed=hashlib.sha256(self.files['film.mp4']).hexdigest()
  self.change('render-receipt.json',videoSha256=changed)
  self.change('decoded-technical.json',masterSha256=changed)
  for name,key in (
   ('actual-pixel-text-evidence.json','exactMovieSha256'),
   ('native-text-legibility.json','actualFilmSha256'),
   ('answer-recovery.json','actualFilmSha256'),
   ('objective-score.json','actualVideoSha256'),
   ('negative-critic.json','actualVideoSha256'),
   ('claim-screen.json','actualVideoSha256')):
   self.change(name,**{key:changed})
  sha=self.write()
  with self.assertRaisesRegex(ValueError,'PINNED_MASTER_MEDIA_DRIFT'):
   rehearse(self.path,sha,probe=lambda _:None,expected_film_sha=original)
 def test_rejects_missing_pinned_wav_identity(self):
  self.change('render-receipt.json',sourceWavSha256='0'*64)
  with self.assertRaisesRegex(ValueError,'PINNED_SOURCE_WAV_IDENTITY_DRIFT'):
   self.check()
 def test_rejects_misleading_decoded_aac_receipt(self):
  self.change('decoded-technical.json',audioAdtsSha256='b'*64)
  with self.assertRaisesRegex(ValueError,'ACTUAL_AAC_NARRATION_NOT_PINNED'):
   self.check()
 def test_missing_decoded_full_integrity_receipt_holds(self):
  self.change('decoded-technical.json',fullDecodePerformed=False)
  with self.assertRaisesRegex(ValueError,'DECODED_AUDIO_VIDEO_IDENTITY_NOT_VERIFIED'):
   self.check()
 def test_external_archive_hash_drift_fails(self):
  self.write()
  with self.assertRaisesRegex(ValueError,'ARCHIVE_HASH_DRIFT'):
   rehearse(self.path,'0'*64,probe=lambda _:None)
 def test_edited_movie_rehashed_outer_archive_still_fails(self):
  self.files['film.mp4']+=b'bad'
  with self.assertRaisesRegex(ValueError,'CROSS_DOCUMENT_PROVENANCE_MISMATCH'):
   self.check()
 def test_modified_phone_plan_violates_exact_source(self):
  self.files['phone-ui-plan.json']+=b'\n'
  with self.assertRaisesRegex(ValueError,'CROSS_DOCUMENT_PROVENANCE_MISMATCH'):
   self.check()
 def test_publish_yes_fails_even_with_new_zip_sha(self):
  self.change('claim-screen.json',mayPublish=True)
  with self.assertRaisesRegex(ValueError,'UNAUTHORIZED_PUBLICATION_VERDICT|CROSS_DOCUMENT_PROVENANCE_MISMATCH'):
   self.check()
 def test_cannot_forge_human_understanding(self):
  self.change('actual-pixel-text-evidence.json',humanUnderstandingDemonstrated=True)
  with self.assertRaisesRegex(ValueError,'PIXEL_ONLY_RESEARCH'):
   self.check()
 def test_all_ten_negative_controls_are_required(self):
  self.change('actual-pixel-text-evidence.json',negativeControlsRejected=8)
  with self.assertRaisesRegex(ValueError,'PIXEL_ONLY_RESEARCH'):
   self.check()
 def test_counterfactual_summary_cannot_lie_about_incomplete_rows(self):
  self.change('actual-pixel-text-evidence.json',negativeControls=[{'fault':'fake','target':'q5','rejected':True}])
  with self.assertRaisesRegex(ValueError,'PIXEL_NEGATIVE_EVIDENCE'):
   self.check()
 def test_swapped_source_molecule_assignments_must_be_rejected(self):
  data=json.loads(self.files['actual-pixel-text-evidence.json'])
  data['negativeControls'][-2]['rejected']=False
  self.change('actual-pixel-text-evidence.json',negativeControls=data['negativeControls'])
  with self.assertRaisesRegex(ValueError,'PIXEL_NEGATIVE_EVIDENCE'):
   self.check()
 def test_forged_two_cid_numbers_with_no_mapping_test_fails(self):
  data=json.loads(self.files['actual-pixel-text-evidence.json'])
  data['negativeControls']=data['negativeControls'][:-1]
  data['negativeControls'].append({'fault':'mere_two_numbers_present','target':'q5','rejected':True})
  self.change('actual-pixel-text-evidence.json',negativeControls=data['negativeControls'])
  with self.assertRaisesRegex(ValueError,'PIXEL_NEGATIVE_EVIDENCE'):
   self.check()
 def test_nonexistent_ocr_frame_hash_is_not_evidence(self):
  data=json.loads(self.files['actual-pixel-text-evidence.json'])
  del data['frameProofs']['source_hold']
  self.change('actual-pixel-text-evidence.json',frameProofs=data['frameProofs'])
  with self.assertRaisesRegex(ValueError,'PIXEL_FRAME_HASH_EVIDENCE'):
   self.check()
 def test_missing_real_visual_answer_rejected_even_with_count_five(self):
  data=json.loads(self.files['actual-pixel-text-evidence.json'])
  data['answerEvidenceFromPixelsOnly']['q5']=False
  self.change('actual-pixel-text-evidence.json',answerEvidenceFromPixelsOnly=data['answerEvidenceFromPixelsOnly'])
  with self.assertRaisesRegex(ValueError,'PIXEL_SCIENCE_ANSWER_EVIDENCE'):
   self.check()
 def test_storyboard_answer_substitution_refused(self):
  self.change('actual-pixel-text-evidence.json',annotationTextUsedAsAnswer=True)
  with self.assertRaisesRegex(ValueError,'PIXEL_ONLY_RESEARCH'):
   self.check()
 def test_nine_silent_scene_checks_mandatory(self):
  self.change('opening-reading-budget.json',allScenesReadingBudgetPass=False)
  with self.assertRaisesRegex(ValueError,'MISSING_REAL_NINE_SCENE_CHECKS'):
   self.check()
 def test_caption_invisible_to_legacy_audit_cannot_get_full_mute_pass(self):
  self.change('opening-reading-budget.json',
     captionWordsSampled=0,allScenesCombinedVisibleTextBudgetPass=True,
     combinedCaptionOverlayLoadRequiresReview=False,fullMutedComprehensionApproved=True)
  with self.assertRaisesRegex(ValueError,'COMBINED_CAPTION_READING_LOAD'):
   self.check()
 def test_missing_or_stale_caption_load_schema_holds(self):
  self.change('opening-reading-budget.json',
     schema='ths-evidencemotion-native-rapid-cut-reading-budget-v1')
  with self.assertRaisesRegex(ValueError,'COMBINED_CAPTION_READING_LOAD'):
   self.check()
 def test_missing_source_receipt_is_hard_hold(self):
  del self.files['render-receipt.json']
  with self.assertRaisesRegex(ValueError,'MISSING_EVIDENCE_MEMBERS'):
   self.check()
 def test_duplicate_names_are_rejected(self):
  with self.assertRaisesRegex(ValueError,'DUPLICATED_OR_EXCESSIVE_MEMBERS'):
   self.check(extra=[('film.mp4',b'malicious duplicate')])
 def test_zip_traversal_never_extracted(self):
  with self.assertRaisesRegex(ValueError,'UNSAFE_ARCHIVE_ENTRY'):
   self.check(extra=[('../out-of-dir',b'payload')])
 def test_archive_symlink_never_extracted(self):
  with zipfile.ZipFile(self.path,'w') as z:
   for k,v in self.files.items():z.writestr(k,v)
   x=zipfile.ZipInfo('link');x.create_system=3
   x.external_attr=(stat.S_IFLNK|0o777)<<16
   z.writestr(x,'/tmp/outside')
  sha=hashlib.sha256(self.path.read_bytes()).hexdigest()
  with self.assertRaisesRegex(ValueError,'UNSAFE_ARCHIVE_ENTRY'):
   rehearse(self.path,sha,probe=lambda _:None)
 def test_unverified_excellence_cannot_be_written(self):
  self.change('render-receipt.json',craftApproved=True)
  with self.assertRaisesRegex(ValueError,'RESEARCH_RENDER_MISLABELLED_AS_APPROVED'):
   self.check()

if __name__=='__main__':unittest.main()
