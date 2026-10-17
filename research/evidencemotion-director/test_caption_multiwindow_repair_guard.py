"""FFmpeg-backed real encoded film controls: authored disjoint cue repair QA."""
import hashlib
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from caption_multiwindow_repair_guard import inspect, _cues
from fractions import Fraction


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

class CaptionDisjointWindowsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp=tempfile.TemporaryDirectory()
        root=Path(cls.temp.name)
        cls.src=root/'src.mp4';cls.edit=root/'edited.mp4';cls.badoutside=root/'badoutside.mp4';cls.badaudio=root/'badaudio.mp4'
        cls.srt=root/'frozen.srt'
        cls.srt.write_text('''1\n00:00:00,000 --> 00:00:01,000\nOne\n\n2\n00:00:01,000 --> 00:00:02,000\nTwo\n\n3\n00:00:02,000 --> 00:00:03,000\nThree\n\n4\n00:00:03,000 --> 00:00:04,000\nFour\n''')
        def go(args):
            subprocess.run(args,check=True,capture_output=True,timeout=30)
        go(['ffmpeg','-hide_banner','-loglevel','error','-f','lavfi','-i','color=black:s=96x170:r=30:d=4',
            '-f','lavfi','-i','sine=frequency=440:sample_rate=44100:duration=4',
            '-map','0:v:0','-map','1:a:0','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-y',str(cls.src)])
        def edit(out, expression, audio='copy'):
            inp=['ffmpeg','-hide_banner','-loglevel','error','-i',str(cls.src),'-map','0:v:0','-map','0:a:0',
                 '-vf',f"drawbox=x=1:y=5:w=90:h=155:color=white:t=fill:enable='{expression}'",
                 '-c:v','libx264','-pix_fmt','yuv420p']
            if audio=='copy':inp+=['-c:a','copy']
            else:inp+=['-af','volume=1.5','-c:a','aac']
            go(inp+['-y',str(out)])
        edit(cls.edit,'between(n,30,59)+between(n,90,119)')
        edit(cls.badoutside,'between(n,0,15)+between(n,30,59)+between(n,90,119)')
        edit(cls.badaudio,'between(n,30,59)+between(n,90,119)',audio='remix')

    @classmethod
    def tearDownClass(cls):cls.temp.cleanup()

    def check(self, *, new=None, cues=None, srt=None, srt_hash=None):
        target=new or self.edit
        srt=srt or self.srt
        return inspect(source=self.src,edited=target,source_sha=sha(self.src),edited_sha=sha(target),
                       srt=srt,srt_sha=srt_hash or sha(srt),cue_ids=cues if cues is not None else [2,4])

    def test_disjoint_two_cue_actual_encoded_edit_and_release_never_authorized(self):
        r=self.check()
        self.assertEqual([(x['firstFrame'],x['lastFrame']) for x in r['editedCueWindows']],[(30,59),(90,119)])
        self.assertEqual((r['targetFrames'],r['otherFrames']),(60,60))
        self.assertEqual(len(r['originalAacElementarySha256']),64)
        self.assertTrue(r['audioPacketsBitstreamAndTimingUnchanged'])
        self.assertFalse(r['mayPublish'])
        self.assertFalse(r['firstExcellentMasterAccepted'])
        self.assertFalse(r['fiveRenderStreakAccepted'])

    def test_outside_time_change_rejected(self):
        with self.assertRaisesRegex(ValueError,'UNDECLARED_GRAY_OR_COLOR_CHANGE'):
            self.check(new=self.badoutside)

    def test_both_movies_shifted_half_second_cannot_steal_old_srt_windows(self):
        """Same shifted decoded PTS ≠ SRT's original zero-origin frame clock."""
        root = Path(self.temp.name)
        shifted_source, shifted_edit = root/'shifted-original.mp4', root/'shifted-edited.mp4'
        for original, target in ((self.src, shifted_source),
                                 (self.edit, shifted_edit)):
            subprocess.run([
                'ffmpeg', '-nostdin', '-hide_banner', '-v', 'error',
                '-i', str(original), '-map', '0', '-c', 'copy',
                '-output_ts_offset', '0.5', '-y', str(target)
            ], check=True, capture_output=True, timeout=30)
        with self.assertRaisesRegex(ValueError, 'FRAME_PTS_NOT_AUTHORED_CFR_CLOCK'):
            inspect(source=shifted_source, edited=shifted_edit,
                    source_sha=sha(shifted_source), edited_sha=sha(shifted_edit),
                    srt=self.srt, srt_sha=sha(self.srt), cue_ids=[2,4])

    def test_original_aac_audio_change_rejected(self):
        with self.assertRaisesRegex(ValueError,'AAC_PACKET_TIMING_CHANGED|ORIGINAL_AAC_ELEMENTARY_CHANGED'):
            self.check(new=self.badaudio)

    def test_wrong_cue_selection_cannot_explain_actual_edits(self):
        with self.assertRaisesRegex(ValueError,'UNDECLARED_GRAY_OR_COLOR_CHANGE'):
            self.check(cues=[2])
        with self.assertRaisesRegex(ValueError,'CUE_SELECTION_DUPLICATE_OR_INVALID'):
            self.check(cues=[4,2])

    def test_srt_authored_timing_rebinding_requires_external_hash(self):
        altered=Path(self.temp.name)/'altered.srt'
        altered.write_text(self.srt.read_text().replace('00:00:02,000\nTwo','00:00:02,200\nTwo'))
        with self.assertRaisesRegex(ValueError,'EXTERNAL_AUTHOR_SRT_SHA_MISMATCH'):
            self.check(srt=altered,srt_hash=sha(self.srt))
        with self.assertRaisesRegex(ValueError,'SRT_CUES_OVERLAP|UNDECLARED_GRAY_OR_COLOR_CHANGE'):
            self.check(srt=altered)

    def test_invalid_cue_time_and_selection_refused(self):
        with self.assertRaises(ValueError):
            _cues('1\n00:00:03,000 --> 00:00:02,000\nBad\n',120,Fraction(30,1))
        with self.assertRaisesRegex(ValueError,'CUE_SELECTION_DUPLICATE_OR_INVALID'):
            self.check(cues=[True,4])

if __name__=='__main__':unittest.main()
