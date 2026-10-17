"""Lane5 independently pinned two-report continuity; no release authority."""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from exact_film_research_join import inspect


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


class ResearchJoinTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        d = Path(self.tmp.name)
        self.film = d/'edited.mp4'
        self.film.write_bytes(b'synthetic previous video + new scene sound-locked (identity fixture only)')
        self.other = d/'old.mp4'
        self.other.write_bytes(b'unedited old film')
        self.visual = d/'visual.json'
        self.experience = d/'experience.json'
        self.v = {'schema':'ths-lane5-physical-visual-repair-boundary-v1',
                  'editedSha256':sha(self.film),'sourceSha256':sha(self.other),
                  'fullH264AndAacPhysicallyDecoded':True,'videoFrameCount':90,
                  'presentationFramePtsIdentical':True,'originalNarrationElementaryBytesIdentical':True,
                  'originalAacElementarySha256':sha(self.other),
                  'editedAacElementarySha256':sha(self.other),
                  'declaredSceneFramesInclusive':[30,59],
                  'editedSceneFrames':30,'framesChangedAboveScreen':30,
                  'decision':'VISUAL_CHANGE_LOCALIZED_AUDIO_LOCKED_SCIENCE_QA_HOLD',
                  'mayPublish':False,'firstExcellentMasterAccepted':False,
                  'fiveRenderStreakAccepted':False,
                  'originalKnownSourceClaimCorrectionsIndependentlyCertified':False,
                  'subtitleLexicalMobileAndScientificAcceptanceProven':False}
        self.e = {'schema':'ths-em-lane5-decoded-experience-research-v1',
                  'movieSha256':sha(self.film),'videoFrames':90,
                  'physicalAudioAndVideoFramesDecoded':True,'mayPublish':False,
                  'firstExcellentMasterAccepted':False,'fiveRenderStreakAccepted':False,
                  'probeIsNotSceneIntentOrCraftJudgment':True,
                  'qualifiedScienceAndNativeHandsetReviewComplete':False,
                  'needsExperienceReview':False,'silentAndNearStaticSpans':[],
                  'decision':'NO_LONG_COINCIDENT_GAP_AT_THIS_PROXY'}

    def tearDown(self):
        self.tmp.cleanup()

    def check(self):
        self.visual.write_text(json.dumps(self.v))
        self.experience.write_text(json.dumps(self.e))
        return inspect(movie=self.film,expected_movie_sha=sha(self.film),
                       visual_receipt=self.visual,visual_receipt_sha=sha(self.visual),
                       experience_receipt=self.experience,
                       experience_receipt_sha=sha(self.experience))

    def test_same_film_valid_receipts_still_hold_release(self):
        r=self.check()
        self.assertEqual(r['status'],'TWO_RESEARCH_DOMAINS_CONSISTENT_RELEASE_HOLD')
        self.assertEqual(r['videoFrames'],90)
        self.assertTrue(r['staleCrossFilmEvidenceRejected'])
        self.assertFalse(r['mayPublish'])
        self.assertEqual(r['acceptedAtomicCards'],0)
        self.assertFalse(r['firstExcellentMasterAccepted'])
        self.assertFalse(r['fiveRenderStreakAccepted'])

    def test_old_v10_experience_receipt_rejected_for_new_film(self):
        self.e['movieSha256']=sha(self.other)
        with self.assertRaisesRegex(ValueError,'EXPERIENCE_RECEIPT_WRONG_FILM'):
            self.check()

    def test_edited_visual_receipt_for_other_video_rejected(self):
        self.v['editedSha256']=sha(self.other)
        with self.assertRaisesRegex(ValueError,'VISUAL_RECEIPT_DIFFERENT_FILM'):
            self.check()

    def test_changed_film_after_receipt_rejected(self):
        self.check()
        self.film.write_bytes(b'new bitstream mutation')
        self.visual.write_text(json.dumps(self.v))
        self.experience.write_text(json.dumps(self.e))
        with self.assertRaisesRegex(ValueError,'CURRENT_FILM_NOT_EXTERNALLY_PINNED'):
            inspect(movie=self.film,expected_movie_sha=self.v['editedSha256'],
                    visual_receipt=self.visual, visual_receipt_sha=sha(self.visual),
                    experience_receipt=self.experience,experience_receipt_sha=sha(self.experience))

    def test_forged_repair_or_release_claim_rejected(self):
        self.v['framesChangedAboveScreen']=31
        with self.assertRaisesRegex(ValueError,'INVALID_OR_FORGED_EDITED_FRAME_COUNTS'):
            self.check()
        self.v['framesChangedAboveScreen']=30
        self.v['mayPublish']=True
        with self.assertRaisesRegex(ValueError,'VISUAL_RECEIPT_DIFFERENT_FILM'):
            self.check()
        self.v['mayPublish']=False
        self.e['qualifiedScienceAndNativeHandsetReviewComplete']=True
        with self.assertRaisesRegex(ValueError,'EXPERIENCE_RECEIPT_WRONG_FILM'):
            self.check()

    def test_contradictory_experience_flag_rejected(self):
        self.e['needsExperienceReview']=True
        with self.assertRaisesRegex(ValueError,'INCONSISTENT_EXPERIENCE_HOLD_STATE'):
            self.check()

    def test_actual_review_window_can_carry_forward_but_not_resolve(self):
        self.e['needsExperienceReview']=True
        self.e['decision']='RESEARCH_REVIEW_REQUIRED'
        self.e['silentAndNearStaticSpans']=[{'firstFrame':35,'lastFrameInclusive':75}]
        r=self.check()
        self.assertTrue(r['experienceProxyNeedsReview'])
        self.assertEqual(r['experienceReviewIntervals'][0]['firstFrame'],35)
        self.assertFalse(r['mayPublish'])

    def test_stale_receipt_external_sha_and_json_duplicates_rejected(self):
        self.check()
        self.visual.write_text(json.dumps({**self.v,'new_unapproved_claim':True}))
        with self.assertRaisesRegex(ValueError,'RECEIPT_BYTES_MISMATCH_EXTERNAL_PIN'):
            inspect(movie=self.film,expected_movie_sha=sha(self.film),
                    visual_receipt=self.visual,visual_receipt_sha=hashlib.sha256(b'not current').hexdigest(),
                    experience_receipt=self.experience,experience_receipt_sha=sha(self.experience))
        self.visual.write_text('{"schema":"X","schema":"Y"}')
        with self.assertRaisesRegex(ValueError,'DUPLICATE_JSON_FIELDS'):
            inspect(movie=self.film,expected_movie_sha=sha(self.film),
                    visual_receipt=self.visual,visual_receipt_sha=sha(self.visual),
                    experience_receipt=self.experience,experience_receipt_sha=sha(self.experience))


if __name__=='__main__':unittest.main()
