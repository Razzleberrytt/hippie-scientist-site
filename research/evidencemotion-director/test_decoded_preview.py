"""Research-only integration tests; require ffmpeg, ffprobe and numpy.
Run: python -m unittest test_decoded_preview.py
"""
import tempfile, subprocess, unittest
from pathlib import Path
import numpy as np
from audit_decoded_preview import audit

class DecodedPreviewTests(unittest.TestCase):
    def clip(self,directory,kind,seconds):
        path=Path(directory)/f'{kind}.mp4'
        w,h,fps=180,320,12
        p=subprocess.Popen(['ffmpeg','-hide_banner','-v','error','-y','-f','rawvideo',
          '-pixel_format','rgb24','-video_size',f'{w}x{h}','-framerate',str(fps),
          '-i','pipe:0','-c:v','libx264','-preset','ultrafast','-crf','18','-pix_fmt',
          'yuv420p','-an',str(path)],stdin=subprocess.PIPE,stderr=subprocess.PIPE)
        for i in range(fps*seconds):
            a=np.zeros((h,w,3),dtype=np.uint8)
            if kind=='moving':
                x=25+i*2
                a[80:230,x:x+35,1]=230
            else:
                a[80:230,25:60,1]=230
            p.stdin.write(a.tobytes())
        p.stdin.close();err=p.stderr.read();p.wait(timeout=15);p.stderr.close()
        if p.returncode:raise RuntimeError(err.decode())
        return path
    def test_reject_static_over_six_seconds(self):
        with tempfile.TemporaryDirectory() as d:
            x=audit(self.clip(d,'static',8))
            self.assertEqual(x['origin'],'independent-full-decode')
            self.assertTrue(x['hasSixSecondStaticKill'])
            self.assertGreater(x['maxCaptionExcludedStaticSec'],6)
            self.assertFalse(x['excellentCertified'])
    def test_motion_is_not_aesthetic_approval(self):
        with tempfile.TemporaryDirectory() as d:
            x=audit(self.clip(d,'moving',3))
            self.assertFalse(x['hasSixSecondStaticKill'])
            self.assertFalse(x['excellentCertified'])
            self.assertEqual(x['decodedFrameCount'],36)

if __name__=='__main__':unittest.main()
