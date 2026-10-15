"""Hermetic risk/rollback safety fixtures; fake bytes NEVER imply film approval."""
import hashlib
import json
import stat
import tempfile
import unittest
import zipfile
from pathlib import Path
from operator_evidence_rehearsal import REQUIRED,rehearse

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
  files['claim-screen.json']=enc(dict(mayPublish=False,actualVideoSha256=film,
      independentScientificReviewApproved=False,craftApproved=False,
      realHandsetPlaybackVerified=False))
  claim=hashlib.sha256(files['claim-screen.json']).hexdigest()
  files.update({
   'render-receipt.json':enc(dict(mayPublish=False,videoSha256=film,
       craftApproved=False,scienceApproved=False,pronunciationVerified=False,deviceVerified=False)),
   'actual-pixel-text-evidence.json':enc(dict(mayPublish=False,exactMovieSha256=film,
       exactPhonePlanSha256=phone,exactClaimReportSha256=claim,answersRecovered=5,
       negativeControlsRejected=8,humanAudienceParticipants=0,
       humanUnderstandingDemonstrated=False,humanComprehensionCalibrated=False)),
   'opening-reading-budget.json':enc(dict(mayPublish=False,allScenesReadingBudgetPass=True,
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
  return rehearse(self.path,sha,probe=lambda _: {'syntheticFixtureOnly':True})
 def change(self,file,**changes):
  j=json.loads(self.files[file]);j.update(changes)
  self.files[file]=json.dumps(j).encode()
 def test_research_pass_cannot_approve_release(self):
  x=self.check()
  self.assertEqual(x['status'],'PASS_RESEARCH_ONLY_RELEASE_HELD')
  self.assertTrue(x['simulatedResearchRollbackProtected'])
  self.assertFalse(x['mayPublish'])
  self.assertFalse(x['realProductionRollbackExecuted'])
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
 def test_all_eight_negative_controls_are_required(self):
  self.change('actual-pixel-text-evidence.json',negativeControlsRejected=7)
  with self.assertRaisesRegex(ValueError,'PIXEL_ONLY_RESEARCH'):
   self.check()
 def test_nine_silent_scene_checks_mandatory(self):
  self.change('opening-reading-budget.json',allScenesReadingBudgetPass=False)
  with self.assertRaisesRegex(ValueError,'MISSING_REAL_NINE_SCENE_CHECKS'):
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
