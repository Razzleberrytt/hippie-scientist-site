"""Actual-decoded-media autonomy negative tests. No artistic or science approval."""
import importlib.util
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
import numpy as np

s=importlib.util.spec_from_file_location(
    'native_autocritic',Path(__file__).with_name('native_autocritic.py'))
m=importlib.util.module_from_spec(s)
s.loader.exec_module(m)

class AutonomousFilmCriticTests(unittest.TestCase):
    def test_invalid_decoded_samples_are_rejected(self):
        with self.assertRaisesRegex(ValueError,'ACTUAL_DECODED_SAMPLES_REQUIRED'):
            m.review_decoded_samples(np.zeros((2,320,180),dtype=np.uint8))
        with self.assertRaisesRegex(ValueError,'ACTUAL_DECODED_SAMPLES_REQUIRED'):
            m.review_decoded_samples(np.zeros((9,320,180,3),dtype=np.uint8))
    def test_static_source_is_autonomously_flagged(self):
        f=np.zeros((9,320,180),dtype=np.uint8)
        f[:,60:213,30:160]=185
        report=m.review_decoded_samples(f)
        self.assertIn('REPETITIVE_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR',report['issues'])
        self.assertGreater(report['highEdgeSimilarityFraction'],.9)
    def test_blank_subject_is_not_accepted(self):
        report=m.review_decoded_samples(np.zeros((9,320,180),dtype=np.uint8))
        self.assertIn('MISSING_RECOGNIZABLE_SUBJECT_OR_NEAR_BLANK_CENTRAL_STAGE',report['issues'])
        self.assertIn('REPETITIVE_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR',report['issues'])
    def test_varied_subjects_are_not_certified_as_premium(self):
        rng=np.random.default_rng(20261013)
        f=np.zeros((9,320,180),dtype=np.uint8)
        for i in range(9):
            # Deliberately vary the actual central subject pixels, while
            # holding header and subtitle bands constant.
            f[i,35:225,5:175]=rng.integers(0,255,(190,170),dtype=np.uint8)
        r=m.review_decoded_samples(f)
        self.assertLess(r['highEdgeSimilarityFraction'],.45)
        self.assertFalse(r['issues'])
        self.assertIn('NOT_HUMAN_QUALITY',r['critiqueScope'])
    def test_real_decode_pins_sha_and_blocks_static_mp4(self):
        if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
            self.skipTest('FFmpeg required for actual media test')
        with tempfile.TemporaryDirectory() as td:
            clip=Path(td)/'actual.mp4'
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error',
                '-nostdin','-y','-f','lavfi','-i','color=c=black:s=180x320:r=12:d=14',
                '-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p',str(clip)],
                check=True,timeout=30)
            original=m.sha256(clip)
            verdict=m.analyze_video(clip,original)
            self.assertEqual(verdict['decision'],'AUTO_REVISE')
            self.assertEqual(verdict['actualVideoSha256'],original)
            self.assertFalse(verdict['automaticallyApprovedPremiumCraft'])
            self.assertFalse(verdict['automaticallyApprovedScientificClaims'])
            self.assertFalse(verdict['mayPublish'])
            clip.write_bytes(clip.read_bytes()+b'changed')
            with self.assertRaisesRegex(ValueError,'VIDEO_IDENTITY_CHANGED'):
                m.analyze_video(clip,original)
    def test_missing_media_is_not_a_source_receipt(self):
        with self.assertRaisesRegex(ValueError,'ACTUAL_REGULAR_VIDEO_REQUIRED'):
            m.analyze_video('does-not-exist.mp4')

if __name__=='__main__':
    unittest.main()
