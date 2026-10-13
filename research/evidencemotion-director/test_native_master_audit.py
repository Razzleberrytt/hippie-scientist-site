"""Native final media audit negative tests; no media needed for test fixtures."""
import tempfile
import unittest
import subprocess
from decimal import Decimal
from pathlib import Path
from unittest.mock import patch
import native_master_audit as target


class NativeMasterAuditTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.master = Path(self.folder.name) / 'master.mp4'
        self.ref = Path(self.folder.name) / 'ref.mp4'
        self.master.write_bytes(b'a')
        self.ref.write_bytes(b'b')
        self.video = {'codec_type': 'video', 'codec_name': 'h264',
                      'width': 1080, 'height': 1920, 'r_frame_rate': '30/1', 'avg_frame_rate': '30/1',
                      'nb_frames': '1031', 'duration': '34.366667'}
        self.audio = {'codec_type': 'audio', 'codec_name': 'aac', 'duration': '34.347'}

    def run_checked(self, *, frames=None, audio_hashes=None, **changes):
        video = {**self.video, **changes}
        if audio_hashes is None:
            audio_hashes = ['b' * 64, 'b' * 64]
        stamps = frames if frames is not None else [Decimal(i)/30 for i in range(1031)]
        with patch.object(target, 'probe', return_value=[video, self.audio]), \
             patch.object(target, 'frame_timestamps', return_value=stamps), \
             patch.object(target, 'audio_hash', side_effect=audio_hashes):
            return target.verify(self.master, self.ref, target.sha256_file(self.master),
                                 'b' * 64, 1031, decode_all=False)

    def test_valid_media_still_never_grants_release(self):
        result = self.run_checked()
        self.assertEqual(result['technical'], 'PASS')
        for key in ('releaseApproved', 'craftApproved', 'scientificEditorialApproved',
                    'ownerDevicePlaybackApproved'):
            self.assertFalse(result[key])

    def test_wrong_frame_rate_and_dimensions_rejected(self):
        for invalid in ({'width': 540}, {'r_frame_rate': '15/1'}, {'nb_frames': '1030'}):
            self.assertEqual(self.run_checked(**invalid)['technical'], 'HOLD')

    def test_missing_media_rejected(self):
        self.ref.unlink()
        result = target.verify(self.master, self.ref, 'a' * 64, 'b' * 64, 1031)
        self.assertIn('REFERENCE_AUDIO_MISSING', result['problems'])

    def test_invalid_master_hash_rejected(self):
        with patch.object(target, 'probe', return_value=[self.video, self.audio]), \
             patch.object(target, 'audio_hash', return_value='b' * 64):
            result = target.verify(self.master, self.ref, 'a' * 64, 'b' * 64,
                                   1031, decode_all=False)
        self.assertIn('MASTER_BYTES_CHANGED', result['problems'])

    def test_wrong_audio_stream_fails_closed(self):
        with patch.object(target, 'probe', return_value=[self.video, self.audio]), \
             patch.object(target, 'audio_hash', side_effect=['a' * 64, 'b' * 64]):
            result = target.verify(self.master, self.ref, target.sha256_file(self.master),
                                   'b' * 64, 1031, decode_all=False)
        self.assertIn('NARRATION_AAC_NOT_EXACTLY_PINNED', result['problems'])

    def test_bad_duration_is_rejected(self):
        self.audio['duration'] = '34.0'
        self.assertIn('AUDIO_VIDEO_DURATION_MISMATCH', self.run_checked()['problems'])


    def test_guessed_30fps_but_variable_frame_timestamps_rejected(self):
        stamps = [Decimal(i)/30 for i in range(1031)]
        stamps[10] += Decimal('0.025')
        result = self.run_checked(frames=stamps)
        self.assertEqual(result['technical'], 'HOLD')
        self.assertIn('NONCONSTANT_VIDEO_FRAME_TIMING', result['problems'])

    def test_frame_timestamps_unavailable_rejected(self):
        with patch.object(target, 'probe', return_value=[self.video, self.audio]), \
             patch.object(target, 'frame_timestamps',
                          side_effect=subprocess.CalledProcessError(1, 'ffprobe')), \
             patch.object(target, 'audio_hash', return_value='b' * 64):
            result = target.verify(self.master, self.ref,
                                   target.sha256_file(self.master), 'b'*64,
                                   1031, decode_all=False)
        self.assertIn('FRAME_TIMESTAMP_EXTRACTION_FAILED', result['problems'])

    def test_duration_not_consistent_with_frame_count_rejected(self):
        result = self.run_checked(duration='34.50')
        self.assertIn('VIDEO_DURATION_NOT_FIXED_FPS', result['problems'])

    def test_missing_master_audio_returns_structured_hold(self):
        error = subprocess.CalledProcessError(1, 'ffmpeg -map 0:a:0')
        result = self.run_checked(audio_hashes=[error, 'b'*64])
        self.assertEqual(result['technical'], 'HOLD')
        self.assertIn('MASTER_AUDIO_EXTRACTION_FAILED', result['problems'])

    def test_missing_reference_audio_returns_structured_hold(self):
        error = subprocess.CalledProcessError(1, 'ffmpeg -map 0:a:0')
        result = self.run_checked(audio_hashes=['b'*64, error])
        self.assertEqual(result['technical'], 'HOLD')
        self.assertIn('REFERENCE_AUDIO_EXTRACTION_FAILED', result['problems'])

    def test_decoded_frame_count_mismatch_rejected(self):
        stamps = [Decimal(i)/30 for i in range(100)]
        result = self.run_checked(frames=stamps)
        self.assertIn('DECODED_FRAME_COUNT_MISMATCH', result['problems'])
        self.assertFalse(result['releaseApproved'])


    def test_malformed_expected_hash_fails_without_probe(self):
        with patch.object(target, 'probe', side_effect=AssertionError('must stop early')):
            result = target.verify(self.master, self.ref, 'bad hash', 'b'*64, 1031, decode_all=False)
        self.assertEqual(result['technical'], 'HOLD')
        self.assertIn('PINNED_HASHES_REQUIRED', result['problems'])

    def test_actual_timestamp_parser_uses_frame_timestamps(self):
        with patch.object(target, 'command', return_value=b'0.000000,\n0.033333\n0.066667\n'):
            actual = target.frame_timestamps(self.master)
        self.assertEqual(len(actual), 3)
        self.assertEqual(actual[1], Decimal('0.033333'))

    def test_actual_audio_hash_uses_adts_bytes(self):
        import hashlib
        with patch.object(target, 'command', return_value=b'ADTS-STREAM-BYTES') as cmd:
            actual = target.audio_hash(self.master)
        self.assertEqual(actual, hashlib.sha256(b'ADTS-STREAM-BYTES').hexdigest())
        self.assertIn('-f', cmd.call_args.args[0])
        self.assertIn('adts', cmd.call_args.args[0])

    def test_empty_audio_stream_is_hard_error(self):
        with patch.object(target, 'command', return_value=b''):
            with self.assertRaises(ValueError):
                target.audio_hash(self.master)


if __name__ == '__main__':
    unittest.main()
