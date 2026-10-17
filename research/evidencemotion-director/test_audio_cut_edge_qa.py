"""Fail-closed research tests. Synthetic PCM is not a calibrated natural voice."""
import hashlib
import io
import math
import struct
import unittest
import wave

from audio_cut_edge_qa import audit_cut_edges


def synthetic_wav():
    # 440Hz voice-like fixture; quiet 0.5s, audible 1.0s.
    frames = []
    for i in range(48000):
        sec = i / 24000
        value = int(12000 * math.sin(2 * math.pi * 440 * sec)) if .75 <= sec < 1.25 else 0
        frames.append(value)
    bio = io.BytesIO()
    with wave.open(bio, 'wb') as w:
        w.setparams((1, 2, 24000, 0, 'NONE', 'not compressed'))
        w.writeframes(struct.pack('<' + 'h' * len(frames), *frames))
    return bio.getvalue()


class CutEdgeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.wav = synthetic_wav()
        cls.sha = hashlib.sha256(cls.wav).hexdigest()

    def check(self, cuts, wav=None, sha=None):
        return audit_cut_edges(self.wav if wav is None else wav,
                               self.sha if sha is None else sha, cuts)

    def test_visual_edit_during_audible_narration_is_not_an_audio_splice(self):
        r = self.check([{'id': 'cut_01', 'kind': 'visual_cut', 'atMs': 1000}])
        self.assertEqual(r['status'], 'RESEARCH_TELEMETRY_ONLY')
        self.assertFalse(r['edges'][0]['quietWindow'])
        self.assertEqual(r['edges'][0]['status'], 'VISUAL_CUT_TELEMETRY_ONLY')
        self.assertFalse(r['mayPublish'])

    def test_loud_audio_splice_holds_and_quiet_candidate_does_not_certify(self):
        r = self.check([{'id': 'splice_a', 'kind': 'audio_splice', 'atMs': 500},
                        {'id': 'splice_b', 'kind': 'audio_splice', 'atMs': 1000}])
        self.assertEqual(r['status'], 'HOLD_AUDIO_SPLICE_REVIEW')
        self.assertEqual([x['status'] for x in r['edges']],
                         ['QUIET_SPLICE_CANDIDATE', 'AUDIO_SPLICE_REQUIRES_REVIEW'])
        self.assertFalse(r['audioCertified'])

    def test_quiet_splice_still_only_research_telemetry(self):
        r = self.check([{'id': 'join', 'kind': 'audio_splice', 'atMs': 500}])
        self.assertEqual(r['status'], 'RESEARCH_TELEMETRY_ONLY')
        self.assertFalse(r['audioCertified'])
        self.assertFalse(r['mayPublish'])

    def test_mutated_wav_is_refused_even_if_old_manifest_is_reused(self):
        mutated = bytearray(self.wav)
        mutated[-4] ^= 1
        r = self.check([{'id': 'cut_01', 'kind': 'visual_cut', 'atMs': 500}], wav=bytes(mutated))
        self.assertEqual(r['errors'], ['SOURCE_WAV_SHA_MISMATCH'])
        self.assertEqual(r['edges'], [])

    def test_malformed_duplicate_and_nonmonotonic_cut_records_hold(self):
        cases = ([], [{'id': 'x', 'kind': 'visual_cut', 'atMs': 200}],
                 [{'id': 'cut_1', 'kind': 'visual_cut', 'atMs': float('nan')}],
                 [{'id': 'cut_1', 'kind': 'visual_cut', 'atMs': 300},
                  {'id': 'cut_1', 'kind': 'visual_cut', 'atMs': 400}],
                 [{'id': 'cut_2', 'kind': 'visual_cut', 'atMs': 1000},
                  {'id': 'cut_1', 'kind': 'visual_cut', 'atMs': 500}],
                 [{'id': 'cut_1', 'kind': 'audio_insert', 'atMs': 500}],
                 [{'id': 'cut_1', 'kind': 'audio_splice', 'atMs': 0}])
        for cuts in cases:
            with self.subTest(cuts=cuts):
                self.assertTrue(self.check(cuts)['status'].startswith('HOLD'))


if __name__ == '__main__':
    unittest.main()
