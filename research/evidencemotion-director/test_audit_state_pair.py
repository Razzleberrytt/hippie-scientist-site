"""Research-only decoded-before/after adversarial checks. Needs ffmpeg and OpenCV."""
import tempfile,subprocess,unittest
from pathlib import Path
import numpy as np
from audit_state_pair import audit

class StatePairTests(unittest.TestCase):
    def clip(self,folder,kind):
        path=Path(folder)/f'{kind}.mp4'; w,h,fps=180,320,10
        proc=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-y',
          '-f','rawvideo','-pixel_format','rgb24','-video_size',f'{w}x{h}',
          '-framerate',str(fps),'-i','pipe:0','-c:v','libx264',
          '-preset','ultrafast','-crf','18','-pix_fmt','yuv420p','-an',str(path)],
          stdin=subprocess.PIPE,stderr=subprocess.PIPE)
        for frame in range(40):
            rgb=np.zeros((h,w,3),dtype=np.uint8)
            rgb[35:280,20:160]=[40,130,45]
            if kind=='hero-change' and frame>=20:
                rgb[65:260,30:148]=[35,45,245]
            if kind=='confetti':
                x=40+frame%35;y=90+frame%100
                rgb[y:y+2,x:x+2]=255
            proc.stdin.write(rgb.tobytes())
        proc.stdin.close();err=proc.stderr.read();proc.wait(timeout=10)
        proc.stderr.close()
        if proc.returncode:raise RuntimeError(err.decode())
        return path
    def test_actual_hero_change_is_only_a_candidate(self):
        with tempfile.TemporaryDirectory() as d:
            r=audit(self.clip(d,'hero-change'),.5,3,[20,35,160,280])
            self.assertGreater(r['changedSubjectBlocksFraction'],.35)
            self.assertFalse(r['craftApproved'])
    def test_particles_do_not_fake_hero_change(self):
        with tempfile.TemporaryDirectory() as d:
            r=audit(self.clip(d,'confetti'),.5,3,[20,35,160,280])
            self.assertEqual(r['advisory'],'NO_SUBSTANTIVE_STATE_CHANGE_DETECTED')
    def test_static_is_not_a_reveal(self):
        with tempfile.TemporaryDirectory() as d:
            r=audit(self.clip(d,'static'),.5,3,[20,35,160,280])
            self.assertLess(r['changedSubjectBlocksFraction'],.02)
    def test_bad_time_range_fails_closed(self):
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(ValueError):
                audit(self.clip(d,'static'),5,3,[20,35,160,280])

if __name__=='__main__':unittest.main()
