"""Actual fully encoded film replay: no random-seek ambiguity around spoken cues.

This suite only runs when original 7-OH source media is explicitly available.
Hosted CI without large media marks these tests SKIP, never invented PASS.
"""
from pathlib import Path
import os
import subprocess
import unittest
import source_locked_craft_splice as S

ROOT=Path(__file__).resolve().parent
SOURCE=ROOT/'specimen_NEW_RESEARCH_CANDIDATE.mp4'
BASELINE=ROOT/'EvidenceMotion_Lane3_GitHubNative_FULLFILM_RESEARCH.mp4'
NEW=ROOT/'EvidenceMotion_DepthStudy_FullFilm_RESEARCH.mp4'
CLIP=ROOT/'Scene4_DepthStudy_NATIVE1080_RESEARCH.mp4'
PIN=ROOT/'scene4-depth-study-optin-pin.json'
EXPECTED_FILM='13641cbe59fa208b378ff5630cdebb2651bd5e753b016e27874dda99baad9ac1'
EXPECTED_CLIP='a922ba5b4714ca03ec58a4b69d17bac01b78f9a82f7e25950b35318fb15a410e'
EXTERNAL_MANIFEST='61ff8b60f9197d8ea9263747c765f3013e07c72ef84a1f88306d2b49e860e981'

def exact_decoded_frames(path,frame_ids):
    import numpy as np
    # Decode from the START; the H.264 B-frame decoder owns presentation order.
    vf='select='+'+'.join(f'eq(n\\,{idx})' for idx in sorted(frame_ids))
    command=['ffmpeg','-nostdin','-v','error','-i',str(path),'-vf',vf,
             '-vsync','0','-f','rawvideo','-pix_fmt','rgb24','-']
    done=subprocess.run(command,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if done.returncode:raise AssertionError(done.stderr.decode(errors='replace')[:400])
    size=1080*1920*3;ids=sorted(frame_ids)
    if len(done.stdout)!=len(ids)*size:raise AssertionError('INCOMPLETE_DECODED_FRAME_SAMPLE')
    return {i:np.frombuffer(done.stdout[k*size:(k+1)*size],dtype=np.uint8).reshape(1920,1080,3).copy()
            for k,i in enumerate(ids)}

@unittest.skipUnless(all(f.exists() for f in (SOURCE,BASELINE,NEW,CLIP,PIN)),
    'needs exact archived 7-OH full-length source and two full research movies')
class DepthFilmVerification(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.m=S.trusted_manifest(PIN,EXTERNAL_MANIFEST)
    def test_actual_clip_fullfilm_hash_and_frame_counts(self):
        self.assertEqual(S.digest(NEW),EXPECTED_FILM)
        self.assertEqual(S.digest(CLIP),EXPECTED_CLIP)
        self.assertTrue(S.preflight(SOURCE,CLIP,self.m))
        self.assertEqual(S.media_info(NEW)[0]['nb_frames'],'1031')
        self.assertFalse(self.m['mayPublish'])
    def test_encoded_computed_and_negation_physical_frame_cuts(self):
        f=exact_decoded_frames(NEW,[554,555,594,595])
        # The picture actually cuts to dark computer-visualization stage at 555.
        self.assertGreater(float(f[554][700:1180,80:1000].mean()),
                           float(f[555][700:1180,80:1000].mean())+25)
        def orange_bar(frame):
            p=f[frame][1435:1570,71:85].astype('int16')
            return int(((p[:,:,0]>200)&(p[:,:,1]>90)&(p[:,:,1]<185)&(p[:,:,2]<155)).sum())
        before,after=orange_bar(594),orange_bar(595)
        self.assertLess(before,10)
        self.assertGreater(after,100)
    def test_source_aac_and_every_unedited_frame(self):
        result=S.verify_result(SOURCE,NEW,self.m)
        self.assertEqual(result['frames'],1031)
        self.assertEqual(result['outsideSceneVisualAudit']['framesComparedOutsideScene'],827)
        self.assertEqual(S.aac_sha(SOURCE),S.aac_sha(NEW))
        self.assertFalse(result['scienceApproved'])
        self.assertFalse(result['craftApproved'])
        self.assertFalse(result['mayPublish'])
    def test_camera_changes_vs_unchanged_footage(self):
        import numpy as np
        a=exact_decoded_frames(BASELINE,[555,690]); b=exact_decoded_frames(NEW,[555,690])
        roi=(slice(740,1300),slice(60,1040))
        def score(pair):
            x=pair[555][roi].astype('int16');y=pair[690][roi].astype('int16')
            return float(np.mean(np.max(abs(x-y),axis=2)>15))
        self.assertGreater(score(b),score(a)+0.02)
        self.assertLess(score(b),0.5)
if __name__=='__main__':unittest.main()
