"""Native final media audit negative tests; no media needed for test fixtures."""
import tempfile
import unittest
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
                      'width': 1080, 'height': 1920, 'r_frame_rate': '30/1',
                      'nb_frames': '1031', 'duration': '34.366667'}
        self.audio = {'codec_type': 'audio', 'codec_name': 'aac', 'duration': '34.347'}

    def run_checked(self, **changes):
        video = {**self.video, **changes}
        with patch.object(target, 'probe', return_value=[video, self.audio]), \
             patch.object(target, 'audio_hash', return_value='b' * 64):
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


if __name__ == '__main__':
    unittest.main()
