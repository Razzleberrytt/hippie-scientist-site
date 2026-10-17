"""Regression checks for research-only exact-master triage. Run with Python unittest."""
from pathlib import Path
import hashlib
import json
import subprocess
import tempfile
import unittest
import evidencemotion_exact_master_gate as gate

class ExactMasterGateTests(unittest.TestCase):
    def test_srt_parse_and_cross_midnight(self):
        cues=gate.parse_srt('1\n00:00:00,020 --> 00:00:01,040\nRead the label.\n\n2\n00:00:01,040 --> 00:00:02,100\nAnd ask questions.\n')
        self.assertEqual(len(cues),2)
        self.assertAlmostEqual(cues[0]['start'], .02)
        self.assertAlmostEqual(cues[-1]['end'],2.1)
    def test_srt_rejects_corrupt_timing(self):
        with self.assertRaises(ValueError):gate.parse_srt('1\nBAD --> 00:00:01,000\nwrong')
    def test_reject_missing_untimed_and_blank_srt(self):
        for content in ('', 'nonsense',
                        '1\\n00:00:00,020 --> 00:00:01,040\\nlegitimate\\n\\n2\\nThis cue is missing timestamps',
                        '1\\n00:00:00,020 --> 00:00:01,040\\n'):
            with self.subTest(content=content):
                with self.assertRaises(ValueError): gate.parse_srt(content)

    def test_loudness_parser(self):
        block='Summary:\nIntegrated loudness:\n    I: -7.1 LUFS\nLoudness range:\n    LRA: 1.7 LU\nTrue peak:\n    Peak: -0.5 dBFS'
        self.assertEqual(gate.extract_ebur128(block),{'integrated_lufs':-7.1,'loudness_range_lu':1.7,'true_peak_dbtp':-.5})
    def test_loudness_parser_fails_absent(self):
        self.assertTrue(all(v is None for v in gate.extract_ebur128('random output').values()))
    def test_missing_master_must_fail(self):
        r=gate.audit(Path('/invalid/absent.mp4'),'0'*64,None,None,[])
        self.assertEqual(r['checks'][0]['status'],'FAIL')
    def test_sha_mismatch_early_stop(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'a.mp4';p.write_bytes(b'fake.mp4')
            r=gate.audit(p,'0'*64,None,None,[])
            self.assertEqual(len(r['checks']),1)
            self.assertEqual(r['checks'][0]['code'],'EXACT_MASTER_HASH')
            self.assertFalse(r['mayPublish'])
    def test_no_fake_release_flag(self):
        r=gate.audit(Path('/invalid/absent.mp4'),'0'*64,None,None,[])
        self.assertFalse(r['mayPublish'])
        self.assertFalse(r['independently_verified'])
        self.assertFalse(r['owner_phone_verified'])
    def test_srt_multiple_phrases_and_malformed_second(self):
        with self.assertRaises(ValueError):
            gate.parse_srt('1\n00:00:00,020 --> 00:00:00,900\nA\n\n2\n00:00:01,000 --> WRONG\nB\n')
    def test_invalid_scene_bounds_cannot_be_marked_good(self):
        self.assertEqual(gate.MOTION_DIFF,10)
        self.assertGreater(gate.MAX_LUFS, -15)
    def test_true_peak_parser_is_separate_from_lufs(self):
        txt='Summary:\nIntegrated loudness:\nI: -16.0 LUFS\nLoudness range:\nLRA: 4.0 LU\nTrue peak:\nPeak: -0.2 dBFS'
        self.assertGreater(gate.extract_ebur128(txt)['true_peak_dbtp'],gate.MAX_TRUE_PEAK)
    def test_early_exit_explicit_fail_status(self):
        missing=gate.audit(Path('/missing/does-not-exist.mp4'),'0'*64,None,None,[])
        self.assertEqual(missing['status'],'FAIL')
        with tempfile.TemporaryDirectory() as tmp:
            video=Path(tmp)/'bad.mp4'; video.write_bytes(b'garbage')
            mismatch=gate.audit(video,'0'*64,None,None,[])
            self.assertEqual(mismatch['status'],'FAIL')

    def test_cli_never_overwrites_original_video_or_caption(self):
        with tempfile.TemporaryDirectory() as tmp:
            video=Path(tmp)/'real.mp4'; video.write_bytes(b'precious-original')
            caption=Path(tmp)/'text.srt'; caption.write_bytes(b'precious-srt')
            for target in (video,caption):
                rc=gate.main(['--video',str(video),'--expected-sha256',gate.sha256(video),
                              '--captions',str(caption),'--output',str(target)])
                self.assertEqual(rc,1)
                self.assertEqual(video.read_bytes(),b'precious-original')
                self.assertEqual(caption.read_bytes(),b'precious-srt')
            alias=Path(tmp)/'alias.mp4'; alias.symlink_to(video)
            self.assertEqual(gate.main(['--video',str(video),'--expected-sha256',gate.sha256(video),
                                        '--output',str(alias)]),1)
            self.assertEqual(video.read_bytes(),b'precious-original')

    def test_hash_lock_is_cryptographic(self):
        with tempfile.TemporaryDirectory() as tmp:
            f=Path(tmp)/'sample.mp4';f.write_bytes(b'123')
            self.assertEqual(gate.sha256(f),hashlib.sha256(b'123').hexdigest())
    @unittest.skipUnless(bool(__import__('shutil').which('ffmpeg')),'needs ffmpeg')
    def test_real_media_decode_and_missing_caption_hold(self):
        with tempfile.TemporaryDirectory() as tmp:
            f=Path(tmp)/'tiny.mp4'
            cp=subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-f','lavfi','-i','color=c=blue:s=160x284:r=30:d=2','-f','lavfi','-i','sine=frequency=800:sample_rate=48000:duration=2','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-shortest','-y',str(f)],capture_output=True)
            self.assertEqual(cp.returncode,0,cp.stderr.decode())
            r=gate.audit(f,gate.sha256(f),None,None,[0,2.0])
            bycode={x['code']:x['status'] for x in r['checks']}
            self.assertEqual(bycode['FULL_AV_DECODE'],'PASS')
            self.assertEqual(bycode['EXACT_MASTER_HASH'],'PASS')
            self.assertEqual(bycode['CAPTION_SOURCE_SHA'],'HOLD')
            self.assertFalse(r['mayPublish'])

if __name__=='__main__': unittest.main()