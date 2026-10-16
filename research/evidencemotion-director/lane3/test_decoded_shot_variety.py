"""Lane 3 independent decoded-film similarity safety tests. No release approval."""
import copy
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch

from decoded_shot_variety import CraftHold, audit, validate_story


class DecodedShotVarietyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
            raise unittest.SkipTest('FFmpeg + FFprobe required for actual decoded media')
        cls.tempdir = tempfile.TemporaryDirectory()
        cls.root = Path(cls.tempdir.name)
        cls.film = cls.root/'real-encoded-test.mp4'
        # A real H.264 encoded test with changing source-area rectangles but
        # near-identical science areas at shots 0→1 and 5→6. The header changes
        # during 0→1; it must NOT mask a repeated body composition.
        vf = []
        x_positions = [200,200,350,490,630,180,180,700,380]
        for i,x in enumerate(x_positions):
            a,b=i/3,(i+1)/3
            vf.append(f'drawbox=x={x}:y=800:w=130:h=190:color=white:t=fill:enable=between(t\\,{a:.6f}\\,{b:.6f})')
            vf.append(f'drawbox=x={x+60}:y=950:w=130:h=70:color=yellow:t=fill:enable=between(t\\,{a:.6f}\\,{b:.6f})')
        vf.append('drawbox=x=80:y=100:w=450:h=110:color=red:t=fill:enable=between(t\\,0\\,.33)')
        vf.append('drawbox=x=80:y=100:w=450:h=110:color=blue:t=fill:enable=between(t\\,.34\\,.67)')
        command=['ffmpeg','-hide_banner','-loglevel','error','-y',
                 '-f','lavfi','-i','color=c=0x07111b:s=1080x1920:r=30:d=3',
                 '-vf',','.join(vf),'-frames:v','90','-an','-c:v','libx264',
                 '-preset','ultrafast','-crf','26','-pix_fmt','yuv420p',str(cls.film)]
        subprocess.run(command,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        digest=hashlib.sha256(cls.film.read_bytes()).hexdigest()
        cls.story = {'nineShotsMapped':9,'encodedH264Sha256':digest,
                     'mayPublish':False,'shots':[
                         {'shot':f'scene-{i}','startSec':i/3,'endSec':(i+1)/3}
                         for i in range(9)]}
        cls.story_file=cls.root/'story.json'
        cls.story_file.write_text(json.dumps(cls.story))

    @classmethod
    def tearDownClass(cls):
        cls.tempdir.cleanup()

    def test_real_decoded_film_catches_same_science_body_despite_header_change(self):
        data=audit(self.film,self.story_file)
        self.assertEqual(data['fullDecodedFrames'],90)
        self.assertEqual(data['status'],'DECODED_VISUAL_REVIEW_REQUIRED')
        self.assertTrue(data['comparisons'][0]['nearDuplicateReviewCandidate'])
        self.assertTrue(data['comparisons'][5]['nearDuplicateReviewCandidate'])
        self.assertFalse(data['comparisons'][2]['nearDuplicateReviewCandidate'])
        self.assertEqual(data['nearDuplicateReviewCount'],2)
        self.assertFalse(data['excellentCertified'])
        self.assertFalse(data['mayPublish'])
        self.assertFalse(data['creativeExceptionsAutomaticallyGranted'])

    def test_swapped_encoded_movie_refused(self):
        stale=copy.deepcopy(self.story)
        stale['encodedH264Sha256']='a'*64
        out=self.root/'forged.json'
        out.write_text(json.dumps(stale))
        with self.assertRaisesRegex(CraftHold,'SHA_MISMATCH'):
            audit(self.film,out)

    def test_approval_claim_in_story_refused_even_if_movie_is_unchanged(self):
        tampered=copy.deepcopy(self.story)
        tampered['mayPublish']=True
        out=self.root/'claimed-release.json'
        out.write_text(json.dumps(tampered))
        with self.assertRaisesRegex(CraftHold,'MAY_PUBLISH'):
            audit(self.film,out)

    def test_gap_in_nine_shot_coverage_refused(self):
        modified=copy.deepcopy(self.story)
        modified['shots'][5]['startSec']+=1/30
        with self.assertRaisesRegex(CraftHold,'GAP_OR_OVERLAP'):
            validate_story(modified,digest=self.story['encodedH264Sha256'],frame_count=90)

    def test_duplicate_shot_identity_refused(self):
        modified=copy.deepcopy(self.story)
        modified['shots'][7]['shot']=modified['shots'][6]['shot']
        with self.assertRaisesRegex(CraftHold,'SHOT_ID'):
            validate_story(modified,digest=self.story['encodedH264Sha256'],frame_count=90)

    def test_real_movie_byte_tamper_is_not_certified(self):
        changed=self.root/'altered.mp4'
        altered=bytearray(self.film.read_bytes())
        altered[-10]^=3
        changed.write_bytes(altered)
        with self.assertRaisesRegex(CraftHold,'SHA_MISMATCH'):
            audit(changed,self.story_file)

    def test_truncated_shot_map_and_film_decoding_cannot_get_a_pass(self):
        invalid=copy.deepcopy(self.story)
        invalid['shots'][-1]['endSec']-=1/30
        with self.assertRaisesRegex(CraftHold,'FRAME_COUNT_MISMATCH'):
            validate_story(invalid,digest=self.story['encodedH264Sha256'],frame_count=90)


class ArchivedFilmOptIn(unittest.TestCase):
    def test_full_archived_timed_movie_when_supplied(self):
        film=os.getenv('LANE3_ACTUAL_FILM')
        story=os.getenv('LANE3_ACTUAL_STORY')
        if not film or not story:
            self.skipTest('Exact archived film+story not bundled in GitHub CI')
        data=audit(film,story)
        self.assertEqual(data['fullDecodedFrames'],1031)
        self.assertEqual(len(data['comparisons']),8)
        self.assertEqual(data['nearDuplicateReviewCount'],2)
        self.assertEqual([(c['from'],c['to']) for c in data['comparisons'] if c['nearDuplicateReviewCandidate']],
                         [('sentence_1_part0','sentence_1_part1'),('sentence_5_part0','sentence_5_part1')])
        self.assertFalse(data['mayPublish'])


if __name__=='__main__':
    unittest.main()
