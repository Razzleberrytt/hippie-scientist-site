"""Physical FFmpeg bounded real-movie positive/negative tests for Lane5 scene repair."""
import hashlib
import subprocess
import tempfile
import unittest
from pathlib import Path
from visual_scene_repair_guard import inspect


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


class LocalizedVisualRepairTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        d = Path(cls.temp.name)
        cls.original = d/'original.mp4'
        cls.edited = d/'edited.mp4'
        cls.unrelated = d/'unrelated.mp4'
        cls.unmodified = d/'unmodified.mp4'
        cls.voicechanged = d/'voicechanged.mp4'
        def go(args):
            subprocess.run(args,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,timeout=30)
        go(['ffmpeg','-hide_banner','-loglevel','error',
            '-f','lavfi','-i','color=black:size=96x170:rate=30:duration=3',
            '-f','lavfi','-i','sine=frequency=450:sample_rate=48000:duration=3',
            '-map','0:v:0','-map','1:a:0','-c:v','libx264','-g','30','-pix_fmt','yuv420p',
            '-c:a','aac','-b:a','96k','-y',str(cls.original)])
        go(['ffmpeg','-hide_banner','-loglevel','error','-i',str(cls.original),
            '-vf',"drawbox=x=0:y=0:w=iw:h=ih:color=white:t=fill:enable='between(t,1,1.966)'",
            '-map','0:v:0','-map','0:a:0','-c:v','libx264','-g','30','-pix_fmt','yuv420p',
            '-c:a','copy','-y',str(cls.edited)])
        go(['ffmpeg','-hide_banner','-loglevel','error','-i',str(cls.original),
            '-map','0:v:0','-map','0:a:0','-c:v','libx264','-c:a','copy',
            '-y',str(cls.unmodified)])
        go(['ffmpeg','-hide_banner','-loglevel','error','-i',str(cls.original),
            '-vf','eq=brightness=0.1','-map','0:v:0','-map','0:a:0',
            '-c:v','libx264','-c:a','copy','-y',str(cls.unrelated)])
        go(['ffmpeg','-hide_banner','-loglevel','error','-i',str(cls.edited),
            '-map','0:v:0','-map','0:a:0','-c:v','copy','-af','volume=1.3',
            '-c:a','aac','-y',str(cls.voicechanged)])

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def guard(self, new=None, **kw):
        candidate = new or self.edited
        return inspect(old=self.original,new=candidate,
                       old_sha=sha(self.original),new_sha=sha(candidate),
                       first_frame=kw.get('first_frame',30),last_frame=kw.get('last_frame',59))

    def test_additional_unreviewed_audio_or_video_stream_is_rejected(self):
        for extra in ('0:a:0', '0:v:0'):
            with self.subTest(extra=extra):
                candidate=self.edited.parent/('extra-'+extra[2]+'.mp4')
                subprocess.run(['ffmpeg','-v','error','-i',str(self.edited),
                                '-map','0:v:0','-map','0:a:0','-map',extra,
                                '-c','copy','-y',str(candidate)],check=True,timeout=30)
                with self.assertRaisesRegex(ValueError, 'EXACTLY_ONE_H264_VIDEO_AND_AAC_AUDIO_REQUIRED'):
                    self.guard(candidate)

    def test_exact_scene_visual_repair_retains_unchanged_audio(self):
        receipt=self.guard()
        self.assertEqual(receipt['videoFrameCount'],90)
        self.assertTrue(receipt['originalNarrationElementaryBytesIdentical'])
        self.assertTrue(receipt['presentationFramePtsIdentical'])
        self.assertGreaterEqual(receipt['framesChangedAboveScreen'],28)
        self.assertFalse(receipt['mayPublish'])
        self.assertFalse(receipt['firstExcellentMasterAccepted'])
        self.assertFalse(receipt['fiveRenderStreakAccepted'])

    def test_nonlocal_video_change_must_be_held(self):
        with self.assertRaisesRegex(ValueError,'UNDECLARED_OUTSIDE_SCENE_DIFFERENCE'):
            self.guard(self.unrelated)

    def test_changed_aac_narration_must_be_held(self):
        with self.assertRaisesRegex(ValueError,'AUDIO_PACKET_TIMING_OR_SIZE_CHANGED|SOURCE_NARRATION_AAC_CHANGED'):
            self.guard(self.voicechanged)

    def test_forged_external_checksum_must_be_held(self):
        with self.assertRaisesRegex(ValueError,'SOURCE_SHA_WRONG_OR_FILMS_UNCHANGED'):
            inspect(old=self.original,new=self.edited,old_sha=sha(self.edited),
                    new_sha=sha(self.edited),first_frame=30,last_frame=59)

    def test_unproven_repair_window_must_be_held(self):
        with self.assertRaisesRegex(ValueError,'DECLARED_SCENE_NOT_MEANINGFULLY_REPAIRED'):
            self.guard(self.unmodified,first_frame=30,last_frame=59)

    def test_boolean_and_impossible_scene_not_accepted(self):
        for x,y in [(True,59),(30,999),(30,30),(-1,45)]:
            with self.subTest(x=x,y=y), self.assertRaisesRegex(ValueError,'INVALID_EXTERNALLY_DECLARED_SCENE_WINDOW'):
                self.guard(first_frame=x,last_frame=y)

if __name__=='__main__':unittest.main()
