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