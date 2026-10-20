"""End-to-end failure replay using REAL H.264/AAC, no probe/hash mocks.

The existing native_master_audit remains the verifier. A remuxed movie keeps
20 genuine 10-fps video frames but loses >1 second of actual encoded AAC.
The reference movie is independently generated and NOT clipped.
"""
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from native_master_audit import verify,sha256_file,audio_hash,probe

class ActualTruncatedAacTests(unittest.TestCase):
    def test_actual_audio_truncation_in_real_mp4_is_rejected(self):
        self.assertIsNotNone(shutil.which('ffmpeg'))
        self.assertIsNotNone(shutil.which('ffprobe'))
        with tempfile.TemporaryDirectory(prefix='ths-aac-fault-') as td:
            root=Path(td)
            full=root/'full.mp4'
            clipped=root/'clipped.mp4'
            subprocess.run([
                'ffmpeg','-hide_banner','-loglevel','error','-nostdin','-y',
                '-f','lavfi','-i','color=c=black:s=160x288:r=10:d=2',
                '-f','lavfi','-i','sine=frequency=440:sample_rate=44100:duration=2',
                '-t','2','-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p',
                '-c:a','aac','-b:a','96k','-shortest',str(full)
            ],check=True,timeout=35)
            baseline_adts=audio_hash(full)
            baseline=verify(full,full,sha256_file(full),baseline_adts,20,
                            width=160,height=288,fps=10,decode_all=True)
            self.assertEqual(baseline['technical'],'PASS',baseline['problems'])
            self.assertTrue(baseline['frameTimingVerified'])
            self.assertTrue(baseline['fullDecodePerformed'])
            # The audio is genuinely re-encoded to just 0.8 seconds while the
            # original 2.0-second video track is byte-copied and left intact.
            subprocess.run([
                'ffmpeg','-hide_banner','-loglevel','error','-nostdin','-y',
                '-i',str(full),'-map','0:v:0','-map','0:a:0','-c:v','copy',
                '-af','atrim=duration=0.8','-c:a','aac','-b:a','96k',str(clipped)
            ],check=True,timeout=35)
            streams=probe(clipped)
            v=next(x for x in streams if x['codec_type']=='video')
            a=next(x for x in streams if x['codec_type']=='audio')
            self.assertEqual(int(v['nb_frames']),20)
            self.assertAlmostEqual(float(v['duration']),2.0,places=2)
            self.assertLess(float(a['duration']),1.0)
            verdict=verify(clipped,full,sha256_file(clipped),baseline_adts,20,
                           width=160,height=288,fps=10,decode_all=True)
            self.assertEqual(verdict['technical'],'HOLD',verdict)
            self.assertIn('AUDIO_VIDEO_DURATION_MISMATCH',verdict['problems'])
            self.assertIn('NARRATION_AAC_NOT_EXACTLY_PINNED',verdict['problems'])
            self.assertTrue(verdict['frameTimingVerified'])
            self.assertTrue(verdict['fullDecodePerformed'])
            self.assertFalse(verdict['releaseApproved'])

if __name__=='__main__':
    unittest.main()
