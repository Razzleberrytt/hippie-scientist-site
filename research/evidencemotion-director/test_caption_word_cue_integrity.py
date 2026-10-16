"""Caption word-cue source integrity: no assumption that MFA equals acoustic truth."""
import hashlib
import io
import json
import subprocess
import struct
import sys
import tempfile
import unittest
import wave
from pathlib import Path

from caption_word_cue_integrity import audit_caption_windows


def wav_fixture():
    f = io.BytesIO()
    with wave.open(f, 'wb') as w:
        w.setparams((1, 2, 24000, 0, 'NONE', 'not compressed'))
        w.writeframes(struct.pack('<'+'h'*24000, *([512]*24000)))
    return f.getvalue()


def digest(b):
    return hashlib.sha256(b).hexdigest()


class CaptionWordCueTests(unittest.TestCase):
    def setUp(self):
        self.wav = wav_fixture()
        self.wav_sha = digest(self.wav)
        self.alignment = {
            'schema': 'ths-exact-wav-alignment-candidate-v1',
            'status': 'BYTE_BOUND_WORD_TIMING_CANDIDATE_REVIEW_REQUIRED',
            'sampleRate': 24000, 'sampleCount': 24000,
            'inputSha256': {'wav': self.wav_sha}, 'revisionSha256': 'b'*64,
            'mayPublish': False, 'pronunciationVerified': False,
            'timingAccuracyCalibrated': False,
            'wordAlignment': [
                {'word': 'pose', 'startMs': 100.0, 'endMs': 300.0},
                {'word': 'is', 'startMs': 400.0, 'endMs': 600.0},
                {'word': 'computed', 'startMs': 700.0, 'endMs': 900.0},
            ],
        }
        self.captions = {
            'schema': 'ths-evidencemotion-timed-caption-windows-v1',
            'status': 'TIMED_RESEARCH_FILM_REQUIRES_FRAME_REVIEW',
            'sourceWavSha256': self.wav_sha,
            'alignmentRevisionSha256': 'b'*64,
            'maxWordsPerGroup': 3,
            'rendererUsesProposal': True,
            'actualEncodedCaptionPixelsRechecked': False,
            'independentMutedComprehensionApproved': False,
            'mayPublish': False,
            'scenes': [{
                'scene': 'sentence_1', 'spokenWords': 3,
                'groups': [
                    {'firstCue': 0, 'afterLastCue': 1, 'words': ['pose'],
                     'startSec': .1, 'endSec': .3},
                    {'firstCue': 1, 'afterLastCue': 2, 'words': ['is'],
                     'startSec': .4, 'endSec': .6},
                    {'firstCue': 2, 'afterLastCue': 3, 'words': ['computed'],
                     'startSec': .7, 'endSec': .9},
                ],
            }],
        }

    def audit(self, expected_wav=None, expected_alignment=None, expected_caption=None):
        align = json.dumps(self.alignment, sort_keys=True).encode()
        caps = json.dumps(self.captions, sort_keys=True).encode()
        return audit_caption_windows(self.wav, expected_wav or self.wav_sha,
                                     align, expected_alignment or digest(align),
                                     caps, expected_caption or digest(caps))

    def test_all_authored_words_and_exact_group_intervals_match_uncalibrated_mfa(self):
        r = self.audit()
        self.assertEqual(r['status'], 'RESEARCH_CAPTION_FRAME_REVIEW_REQUIRED')
        self.assertEqual(r['counts']['mfaWordsCovered'], 3)
        self.assertEqual(r['counts']['captionGroups'], 3)
        self.assertEqual(r['frameReviewTargets'][0]['startFrameCandidate'], 3)
        self.assertEqual(r['frameReviewTargets'][0]['endFrameExclusiveCandidate'], 9)
        self.assertFalse(r['mayPublish'])
        self.assertFalse(r['wordTimingCalibrated'])
        self.assertFalse(r['encodedCaptionPixelsVerified'])

    def test_missing_word_or_forged_scientific_word_rejected_even_if_rehashed(self):
        self.captions['scenes'][0]['groups'][1]['words'] = ['poles']
        self.assertEqual(self.audit()['errors'], ['CAPTION_LEXICAL_DRIFT_OR_SPLIT_MFA_TOKEN'])
        self.captions['scenes'][0]['groups'].pop()
        self.assertEqual(self.audit()['status'], 'HOLD')

    def test_scientific_word_split_across_display_tokens_fails_closed(self):
        # Previously "po" + "se" passed for the authored single word "pose".
        # Keep the visible cue inventory coherent: failure must be lexical,
        # not an unrelated cue-index or word-count mismatch.
        groups = self.captions['scenes'][0]['groups']
        groups[0]['words'] = ['po', 'se']
        groups[0]['afterLastCue'] = 2
        groups[1]['firstCue'], groups[1]['afterLastCue'] = 2, 3
        groups[2]['firstCue'], groups[2]['afterLastCue'] = 3, 4
        self.captions['scenes'][0]['spokenWords'] = 4
        result = self.audit()
        self.assertEqual(result['status'], 'HOLD')
        self.assertEqual(result['errors'], ['CAPTION_LEXICAL_DRIFT_OR_SPLIT_MFA_TOKEN'])

    def test_two_original_words_cannot_be_silently_fused_without_punctuation(self):
        # Previously "poseis" consumed the source words "pose is" and
        # appeared source-consistent, despite changing displayed segmentation.
        self.captions['scenes'][0]['groups'] = [
            {'firstCue': 0, 'afterLastCue': 1, 'words': ['poseis'],
             'startSec': .1, 'endSec': .6},
            {'firstCue': 1, 'afterLastCue': 2, 'words': ['computed'],
             'startSec': .7, 'endSec': .9},
        ]
        self.captions['scenes'][0]['spokenWords'] = 2
        result = self.audit()
        self.assertEqual(result['status'], 'HOLD')
        self.assertEqual(result['errors'], ['CAPTION_LEXICAL_DRIFT_OR_SPLIT_MFA_TOKEN'])

    def test_hyphenated_compound_may_join_two_mfa_tokens_without_release_approval(self):
        self.alignment['wordAlignment'][0]['word'] = '7'
        self.alignment['wordAlignment'][1]['word'] = 'OH'
        self.captions['scenes'][0]['groups'] = [
            {'firstCue': 0, 'afterLastCue': 1, 'words': ['7-OH'],
             'startSec': .1, 'endSec': .6},
            {'firstCue': 1, 'afterLastCue': 2, 'words': ['computed'],
             'startSec': .7, 'endSec': .9},
        ]
        self.captions['scenes'][0]['spokenWords'] = 2
        result = self.audit()
        self.assertEqual(result['status'], 'RESEARCH_CAPTION_FRAME_REVIEW_REQUIRED')
        self.assertEqual(result['counts']['mfaWordsCovered'], 3)
        self.assertEqual(result['counts']['visibleCaptionWords'], 2)
        self.assertFalse(result['mayPublish'])

    def test_changed_timing_even_if_rehashed_is_refused(self):
        self.captions['scenes'][0]['groups'][1]['startSec'] += .08
        self.assertEqual(self.audit()['errors'], ['CAPTION_TIME_DIFFERS_FROM_EXACT_MFA_WORDS'])

    def test_missing_duplicate_and_reordered_cues_are_refused(self):
        self.captions['scenes'][0]['groups'][1]['firstCue'] = 0
        self.assertIn('CAPTION_CUE_GAP_DUPLICATION_OR_BAD_ORDER', self.audit()['errors'])
        self.captions['scenes'][0]['groups'][1]['firstCue'] = 1
        self.captions['scenes'][0]['groups'].pop()
        self.assertEqual(self.audit()['status'], 'HOLD')

    def test_stale_wav_revision_alignment_or_candidate_pin_fails(self):
        self.assertEqual(self.audit(expected_wav='f'*64)['status'], 'HOLD')
        self.assertEqual(self.audit(expected_alignment='f'*64)['status'], 'HOLD')
        self.assertEqual(self.audit(expected_caption='f'*64)['status'], 'HOLD')
        self.captions['alignmentRevisionSha256'] = 'c'*64
        self.assertIn('CAPTION_CANDIDATE_SOURCE_OR_RELEASE_BOUNDARY_INVALID', self.audit()['errors'])

    def test_never_accept_forged_pixel_or_release_approvals(self):
        self.captions['actualEncodedCaptionPixelsRechecked'] = True
        self.assertEqual(self.audit()['status'], 'HOLD')
        self.captions['actualEncodedCaptionPixelsRechecked'] = False
        self.captions['mayPublish'] = True
        self.assertEqual(self.audit()['status'], 'HOLD')

    def test_contraction_splits_into_two_mfa_tokens_but_one_caption_word(self):
        self.alignment['wordAlignment'][0]['word'] = 'that'
        self.alignment['wordAlignment'][0]['endMs'] = 200.
        self.alignment['wordAlignment'][1]['word'] = 's'
        self.alignment['wordAlignment'][1]['startMs'] = 200.
        self.alignment['wordAlignment'][1]['endMs'] = 300.
        self.captions['scenes'][0]['groups'] = [
            {'firstCue':0, 'afterLastCue':1, 'words':["That's"], 'startSec':.1, 'endSec':.3},
            {'firstCue':1, 'afterLastCue':2, 'words':['computed'], 'startSec':.7, 'endSec':.9},
        ]
        self.captions['scenes'][0]['spokenWords'] = 2
        r = self.audit()
        self.assertEqual(r['status'], 'RESEARCH_CAPTION_FRAME_REVIEW_REQUIRED')
        self.assertEqual(r['counts']['visibleCaptionWords'], 2)
        self.assertEqual(r['counts']['mfaWordsCovered'], 3)

    def test_cli_research_candidate_returns_nonzero_and_same_coverage(self):
        with tempfile.TemporaryDirectory() as td:
            d = Path(td)
            inputs = [self.wav, json.dumps(self.alignment).encode(),
                      json.dumps(self.captions).encode()]
            paths = [d/'original.wav', d/'alignment.json', d/'captions.json']
            for p, raw in zip(paths, inputs):
                p.write_bytes(raw)
            cli = Path(__file__).with_name('caption_word_cue_integrity.py')
            command = [sys.executable, str(cli), '--wav', str(paths[0]),
                       '--wav-sha256', digest(inputs[0]), '--alignment', str(paths[1]),
                       '--alignment-sha256', digest(inputs[1]), '--captions', str(paths[2]),
                       '--captions-sha256', digest(inputs[2])]
            result = subprocess.run(command, capture_output=True, text=True, timeout=20)
            self.assertEqual(result.returncode, 3, result.stderr)
            self.assertEqual(json.loads(result.stdout)['counts']['captionGroups'], 3)
            paths[2].write_bytes(inputs[2] + b'changed')
            result = subprocess.run(command, capture_output=True, text=True, timeout=20)
            self.assertEqual(result.returncode, 2)
            self.assertEqual(json.loads(result.stdout)['status'], 'HOLD')


if __name__ == '__main__':
    unittest.main()
