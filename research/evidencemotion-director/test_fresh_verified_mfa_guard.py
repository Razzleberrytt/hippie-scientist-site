"""Fail closed on stale audio and modified alignment; old source remains default."""
import sys
from pathlib import Path
import tempfile
import unittest
import wave
sys.path.insert(0,str(Path(__file__).parent))
from fresh_verified_mfa_guard import FRESH_INPUTS, verify_fresh_manifest, verify_fresh_wave

class FreshWavRegression(unittest.TestCase):
    def test_exact_manifest(self):
        manifest={k:{'path':k,'sha256':v} for k,v in FRESH_INPUTS.items()}
        self.assertTrue(verify_fresh_manifest(None,manifest))
        del manifest['acousticModel']
        with self.assertRaisesRegex(ValueError,'EXACT_FIVE'):
            verify_fresh_manifest(None,manifest)
    def test_archived_wav_rejected(self):
        manifest={k:{'path':k,'sha256':v} for k,v in FRESH_INPUTS.items()}
        manifest['wav']['sha256']='9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435'
        with self.assertRaisesRegex(ValueError,'SOURCE_PIN_MISMATCH:wav'):
            verify_fresh_manifest(None,manifest)
    def test_forged_textgrid_rejected(self):
        manifest={k:{'path':k,'sha256':v} for k,v in FRESH_INPUTS.items()}
        manifest['textgrid']['sha256']='0'*64
        with self.assertRaisesRegex(ValueError,'SOURCE_PIN_MISMATCH:textgrid'):
            verify_fresh_manifest(None,manifest)
    def test_bad_wav_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            p=Path(directory)/'fresh.wav'
            with wave.open(str(p),'wb') as wav:
                wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(24000);wav.writeframes(b'\x00\x01'*824720)
            with self.assertRaisesRegex(ValueError,'IDENTITY_CHANGED'):
                verify_fresh_wave(p)
    def test_missing_wav_rejected(self):
        with self.assertRaisesRegex(ValueError,'NOT_REGULAR_FILE'):
            verify_fresh_wave(Path('/no/such/wav'))
    def test_default_original_path_remains(self):
        from inspect import signature
        from narration_locked_treatments import render
        self.assertFalse(signature(render).parameters['fresh_verified_mfa'].default)

if __name__=='__main__':
    unittest.main()
