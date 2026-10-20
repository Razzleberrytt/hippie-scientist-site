"""Adversarial decoded H264 caption-band research tests; never a voice/craft pass."""
import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
from encoded_caption_transition_gate import (
    BAND_HEIGHT, BAND_WIDTH, FRAMES, HEIGHT, WIDTH, FPS,
    evaluate_decoded_band, validate_ledger, audit,
)


class EncodedCaptionBandTests(unittest.TestCase):
    def setUp(self):
        self.movie_sha = 'a'*64
        self.voice_sha = 'b'*64
        self.ledger = {
            'schema': 'ths-evidencemotion-temporal-caption-emission-v1',
            'videoSha256': self.movie_sha,
            'sourceWavSha256': self.voice_sha,
            'fps': FPS, 'width': WIDTH, 'height': HEIGHT,
            'encodedFilmOCRIndependentlyChecked': False,
            'humanComprehensionObserved': False,
            'mayPublish': False,
            'frames': [
                {'index': i, 'second': round(i/FPS, 6), 'scene': 'synthetic',
                 'rgbSha256': 'c'*64,
                 'annotations': [['caption', 'What']] if 5 <= i < 29 else
                                [['caption', 'makes']] if 29 <= i < 50 else []}
                for i in range(FRAMES)
            ],
        }

    def test_expected_events_include_separate_visible_and_blank_transitions(self):
        cues = validate_ledger(self.ledger, self.movie_sha, self.voice_sha)
        self.assertEqual([a['frame'] for a in cues], [5,29,50])
        self.assertEqual(cues[1]['previousCaption'], ['What'])
        self.assertEqual(cues[1]['currentCaption'], ['makes'])

    def test_actual_decoded_band_changes_at_every_ledger_event(self):
        events = validate_ledger(self.ledger, self.movie_sha, self.voice_sha)
        decoded = np.zeros((FRAMES,BAND_HEIGHT,BAND_WIDTH,3),dtype=np.uint8)
        decoded[5:29, 15:35, 10:45] = [15, 230, 200]  # teal text-like patch
        decoded[29:50, 15:35, 60:95] = [230, 230, 220]  # white patch
        verdicts = evaluate_decoded_band(decoded, events)
        self.assertEqual(len(verdicts), 3)
        self.assertTrue(all(v['pixelChangeDetected'] for v in verdicts))
        self.assertEqual([v['foregroundColorMaskChangedPixels'] for v in verdicts], [700, 1400, 700])

    def test_missing_actual_caption_transition_is_not_accepted_as_ledger_event(self):
        events = validate_ledger(self.ledger, self.movie_sha, self.voice_sha)
        decoded = np.zeros((FRAMES,BAND_HEIGHT,BAND_WIDTH,3),dtype=np.uint8)
        decoded[5:50, 15:35, 10:45] = [15, 230, 200]  # previous caption stays
        vals = evaluate_decoded_band(decoded, events)
        self.assertEqual([v['frame'] for v in vals if not v['pixelChangeDetected']], [29])
        self.assertFalse(vals[1]['pixelChangeDetected'])

    def test_background_motion_without_caption_foreground_is_not_a_pass(self):
        # Pre-fix MAE alone would count three scene/background color changes
        # as if actual caption words had changed.
        events = validate_ledger(self.ledger, self.movie_sha, self.voice_sha)
        decoded = np.zeros((FRAMES, BAND_HEIGHT, BAND_WIDTH, 3), dtype=np.uint8)
        decoded[5:29] = [25, 45, 65]
        decoded[29:50] = [80, 100, 105]
        result = evaluate_decoded_band(decoded, events)
        self.assertEqual([v['decodedBandMeanAbsoluteRGB'] for v in result], [45., 50., 95.])
        self.assertTrue(all(v['foregroundColorMaskChangedPixels'] == 0 for v in result))
        self.assertTrue(all(not v['pixelChangeDetected'] for v in result))

    def test_foreground_color_patch_may_change_without_proving_text(self):
        # Deliberate spoof: colored rectangles mimic the palette. Screening
        # must NEVER set text/OCR/voice/publish certification from this signal.
        events = validate_ledger(self.ledger, self.movie_sha, self.voice_sha)
        decoded = np.zeros((FRAMES, BAND_HEIGHT, BAND_WIDTH, 3), dtype=np.uint8)
        decoded[5:29, 15:35, 10:45] = [15, 230, 200]
        decoded[29:50, 15:35, 60:95] = [230, 230, 220]
        vals = evaluate_decoded_band(decoded, events)
        self.assertTrue(all(v['pixelChangeDetected'] for v in vals))
        self.assertFalse(any('ocrText' in v or 'actualCaptionTextVerified' in v for v in vals))

    def test_forged_pixel_source_identity_or_publish_authority_refused(self):
        for field,val in [('videoSha256','f'*64),('sourceWavSha256','f'*64),
                          ('mayPublish',True),('encodedFilmOCRIndependentlyChecked',True),
                          ('humanComprehensionObserved',True)]:
            prev=self.ledger[field]
            self.ledger[field]=val
            with self.assertRaises(ValueError):
                validate_ledger(self.ledger,self.movie_sha,self.voice_sha)
            self.ledger[field]=prev

    def test_duplicate_missing_or_retimed_frame_refused_even_with_new_json_hash(self):
        for changed in (0,5,1000):
            prev=self.ledger['frames'][changed]['index']
            self.ledger['frames'][changed]['index']=changed+1
            with self.assertRaisesRegex(ValueError,'FRAME_NUMBER_OR_SOURCE_IDENTITY_INVALID'):
                validate_ledger(self.ledger,self.movie_sha,self.voice_sha)
            self.ledger['frames'][changed]['index']=prev
        self.ledger['frames'].pop()
        with self.assertRaisesRegex(ValueError,'COMPLETE_1031_FRAME_LEDGER_REQUIRED'):
            validate_ledger(self.ledger,self.movie_sha,self.voice_sha)

    def test_missing_or_poisoned_decoded_pixels_do_not_fake_positive(self):
        events=validate_ledger(self.ledger,self.movie_sha,self.voice_sha)
        data=np.zeros((FRAMES,BAND_HEIGHT,BAND_WIDTH,3),dtype=np.uint8)
        for wrong in (data[:-1], data.astype(np.int16), data[:,:,:,:1]):
            with self.assertRaisesRegex(ValueError,'EXACT_DECODED_CAPTION_BAND_REQUIRED'):
                evaluate_decoded_band(wrong, events)

    def test_changed_film_or_changed_ledger_stops_before_decoder_and_returns_hold(self):
        with tempfile.TemporaryDirectory() as tmp:
            video=Path(tmp)/'source.mp4'
            video.write_bytes(b'not the original source film')
            original=json.dumps(self.ledger).encode()
            frozen=hashlib.sha256(original).hexdigest()
            r=audit(video,self.movie_sha,original,frozen,self.voice_sha)
            self.assertEqual(r['status'],'HOLD')
            self.assertIn('VIDEO_SOURCE_SHA_MISMATCH',r['errors'])
            r=audit(video,self.movie_sha,original+b'changed',frozen,self.voice_sha)
            self.assertEqual(r['status'],'HOLD')
            self.assertIn('MEDIA_OR_LEDGER_CHANGED_OR_UNSAFE',r['errors'])

    def test_real_cli_never_fakes_success_when_source_movie_is_wrong(self):
        with tempfile.TemporaryDirectory() as tmp:
            d=Path(tmp);(d/'source.mp4').write_bytes(b'invalid bytes')
            raw=json.dumps(self.ledger).encode()
            (d/'ledger.json').write_bytes(raw)
            call=[sys.executable,str(Path(__file__).with_name('encoded_caption_transition_gate.py')),
                  '--film',str(d/'source.mp4'),'--film-sha256',self.movie_sha,
                  '--frame-ledger',str(d/'ledger.json'),
                  '--frame-ledger-sha256',hashlib.sha256(raw).hexdigest(),
                  '--source-wav-sha256',self.voice_sha]
            p=subprocess.run(call,text=True,capture_output=True,timeout=20)
            self.assertEqual(p.returncode,2)
            self.assertEqual(json.loads(p.stdout)['status'],'HOLD')


if __name__ == '__main__':
    unittest.main()
