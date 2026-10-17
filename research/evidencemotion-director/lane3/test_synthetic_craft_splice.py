"""Offline real-encoded FFmpeg smoke test; synthetic frames confer zero film/science approval."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

import source_locked_craft_splice as S


def ffmpeg(*args):
    done=subprocess.run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-y',*map(str,args)],
                        capture_output=True)
    if done.returncode:
        raise AssertionError(done.stderr.decode(errors='replace')[:600])


class OfflineActualCodecContract(unittest.TestCase):
    def test_actual_h264_aac_splice_and_outside_scene_tamper(self):
        with tempfile.TemporaryDirectory() as td:
            root=Path(td);source=root/'source.mp4';scene=root/'scene.mp4'
            output=root/'output.mp4';tampered=root/'tampered.mp4'
            ffmpeg('-f','lavfi','-i','color=c=blue:s=1080x1920:r=30:d=3',
                   '-f','lavfi','-i','anullsrc=channel_layout=mono:sample_rate=24000',
                   '-map','0:v:0','-map','1:a:0','-t','3',
                   '-c:v','libx264','-preset','ultrafast','-crf','22',
                   '-c:a','aac','-ar','24000','-ac','1','-movflags','+faststart',source)
            ffmpeg('-f','lavfi','-i','color=c=green:s=1080x1920:r=30:d=1',
                   '-an','-c:v','libx264','-preset','ultrafast','-crf','22',scene)
            manifest={'schema':S.SCHEMA,'researchOnly':True,'mayPublish':False,
                      'scienceApproved':False,'craftApproved':False,'phonePlaybackApproved':False,
                      'sourceFilmSha256':S.digest(source),'craftSceneSha256':S.digest(scene),
                      'originalNarrationSha256':'a'*64,
                      'frames':90,'width':1080,'height':1920,'fps':30,
                      'startFrame':30,'endFrameExclusive':60,
                      'computedSpokenOnsetSec':1.2,'negationSpokenOnsetSec':1.7}
            pin=root/'manifest.json';pin.write_text(json.dumps(manifest,sort_keys=True)+'\n')
            trusted=S.trusted_manifest(pin,S.digest(pin))
            proof=S.splice(source,scene,output,trusted)
            self.assertEqual(proof['status'],'RESEARCH_ONLY_AUDIO_AND_OUTSIDE_SCENE_VERIFIED')
            self.assertEqual(proof['frames'],90)
            self.assertEqual(proof['outsideSceneVisualAudit']['framesComparedOutsideScene'],60)
            self.assertEqual(S.aac_sha(source),S.aac_sha(output))
            self.assertFalse(proof['mayPublish'])
            self.assertFalse(proof['craftApproved'])
            # Modify only a pre-scene *original* frame, preserving AAC and frame count.
            ffmpeg('-i',output,'-vf',
                   "drawbox=x=50:y=200:w=350:h=350:color=red:t=fill:enable='between(t,0.2,0.45)'",
                   '-map','0:v:0','-map','0:a:0','-c:v','libx264','-preset','ultrafast',
                   '-crf','20','-c:a','copy',tampered)
            self.assertEqual(S.aac_sha(source),S.aac_sha(tampered))
            self.assertEqual(S.media_info(tampered)[0]['nb_frames'],'90')
            with self.assertRaisesRegex(S.CraftHold,'OUTSIDE_CRAFT_SCENE_VISUAL_DRIFT'):
                S.verify_result(source,tampered,trusted)
            # A byte-for-byte changed scene requires a new externally pinned manifest.
            with self.assertRaisesRegex(S.CraftHold,'REPLACEMENT_SCENE_REVISION_MISMATCH'):
                S.preflight(source,tampered,trusted)


if __name__=='__main__':unittest.main()
