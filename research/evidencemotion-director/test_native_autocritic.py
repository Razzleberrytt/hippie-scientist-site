"""Autonomous actual-pixel video review negative tests; no art authority."""
import importlib.util
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
import numpy as np

spec=importlib.util.spec_from_file_location('native_autocritic',Path(__file__).with_name('native_autocritic.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class AutonomousDecodedFilmNegativeTests(unittest.TestCase):
    def test_rejects_invalid_samples(self):
        with self.assertRaisesRegex(ValueError,'INSUFFICIENT_OR_BAD_ACTUAL_FRAME_SAMPLES'):
            m.analyze_grayscale_frames(np.zeros((2,320,180),dtype=np.uint8))
    def test_rejects_same_lifeless_primary_hero_in_all_samples(self):
        f=np.zeros((8,320,180),dtype=np.uint8)
        f[:,80:220,35:145]=190
        q=m.analyze_grayscale_frames(f)
        self.assertIn('REPETITIVE_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR',q['issues'])
        self.assertEqual(q['scope'],'DECODED_LAYOUT_NEGATIVE_FILTER_NOT_AESTHETIC_CERTIFICATION')
    def test_rejects_blank_video_even_if_no_edges_to_compare(self):
        f=np.zeros((8,320,180),dtype=np.uint8)
        x=m.analyze_grayscale_frames(f)
        self.assertIn('EMPTY_OR_UNREADABLE_PRIMARY_VISUAL',x['issues'])
    def test_rejects_actual_decoded_static_mp4_without_owner(self):
        self.assertTrue(shutil.which('ffmpeg'))
        with tempfile.TemporaryDirectory() as t:
            p=Path(t)/'silent.mp4'
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-nostdin','-y',
                '-f','lavfi','-i','color=c=black:s=180x320:r=12:d=14',
                '-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p',str(p)],
                check=True,timeout=30)
            x=m.analyze_video(p)
            self.assertEqual(x['decision'],'AUTO_REVISE')
            self.assertFalse(x['ownerReviewRequiredForThisNegativeDecision'])
            self.assertFalse(x['publishingAllowed'])
            self.assertEqual(len(x['actualVideoSha256']),64)

if __name__=='__main__':unittest.main()
