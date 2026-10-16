"""Source-bound ASR/MFA safety tests; synthetic PCM does NOT prove speech quality."""
import hashlib
import io
import json
import struct
import unittest
import wave
from asr_mfa_disagreement_gate import assess_original_asr_mfa


def make_wav():
    output = io.BytesIO()
    with wave.open(output, 'wb') as w:
        w.setparams((1, 2, 24000, 0, 'NONE', 'not compressed'))
        w.writeframes(struct.pack('<' + 'h'*24000, *([0]*24000)))
    return output.getvalue()


class CrossModelResearchTests(unittest.TestCase):
    def setUp(self):
        self.wav = make_wav()
        self.sha = hashlib.sha256(self.wav).hexdigest()
        self.transcript = b'pose is computed\n'
        self.words = [{'word':word,'startMs':i*300+100.,'endMs':i*300+300.}
                      for i, word in enumerate(('pose', 'is', 'computed'))]
        self.asr = {'schema':'ths-actual-source-asr-research-v1',
                    'sourceWavSha256':self.sha, 'mayPublish':False,
                    'speechRecognizer':{'modelBinarySha256':'b'*64},
                    'recognizedWords':[{'word':w['word'],'start':w['startMs']/1000,
                        'end':w['endMs']/1000,'probability':.99} for w in self.words]}
        self.alignment = {'schema':'ths-exact-wav-alignment-candidate-v1',
                         'inputSha256':{'wav':self.sha,'transcript':hashlib.sha256(self.transcript).hexdigest()},
                         'sampleRate':24000,'sampleCount':24000,'durationMs':1000,
                         'revisionSha256':'c'*64,'wordAlignment':self.words,
                         'mayPublish':False,'pronunciationVerified':False,'timingAccuracyCalibrated':False}
        self.mfa = {'schema':'ths-actual-mfa-acoustic-research-v1',
                    'originalWavSha256':self.sha,'alignedWordCount':3,'scriptTokenCount':3,
                    'alignmentRevisionSha256':'c'*64,'mayPublish':False}

    def result(self, wav=None, transcript=None):
        candidate = json.dumps(self.alignment,sort_keys=True).encode()
        self.mfa['alignmentCandidateSha256']=hashlib.sha256(candidate).hexdigest()
        return assess_original_asr_mfa(self.wav if wav is None else wav,self.sha,
                         self.asr,self.mfa,candidate,self.transcript if transcript is None else transcript)

    def test_matching_hypotheses_do_not_grant_pronunciation(self):
        report=self.result()
        self.assertEqual(report['status'],'RESEARCH_MODEL_CONSENSUS_ONLY')
        self.assertFalse(report['mayPublish'])
        self.assertFalse(report['pronunciationVerified'])

    def test_confident_poles_substitution_never_overrides_pose(self):
        self.asr['recognizedWords'][0]['word']='poles'
        self.asr['recognizedWords'][0]['probability']=.9999
        report=self.result()
        self.assertEqual(report['status'],'RESEARCH_REVIEW_HOLD')
        self.assertEqual(report['counts']['reviewBlocks'],1)
        self.assertEqual(report['disagreements'][0]['asrMaxProbabilityNotProof'],.9999)
        self.assertEqual(report['disagreements'][0]['authoredWords'],['pose'])

    def test_changed_original_wav_invalidates_both_reports(self):
        changed=bytearray(self.wav);changed[-5]^=3
        self.assertIn('ORIGINAL_SOURCE_WAV_CHANGED',self.result(wav=bytes(changed))['errors'])

    def test_wrong_asr_mfa_or_candidate_source_pins_hold(self):
        for receipt,field in ((self.asr,'sourceWavSha256'),(self.mfa,'originalWavSha256'),
                              (self.alignment['inputSha256'],'wav')):
            previous=receipt[field]
            receipt[field]='f'*64
            self.assertEqual(self.result()['status'],'HOLD')
            receipt[field]=previous

    def test_changed_transcript_or_mfa_revision_fails(self):
        self.assertEqual(self.result(transcript=b'changed')['status'],'HOLD')
        self.alignment['revisionSha256']='d'*64
        self.assertIn('ALIGNMENT_OR_TRANSCRIPT_NOT_PINNED',self.result()['errors'])

    def test_nonfinite_windows_and_missing_asr_model_identity_fail(self):
        self.asr['recognizedWords'][1]['start']=float('nan')
        self.assertIn('ASR_NONFINITE_TIMING',self.result()['errors'])
        self.asr['recognizedWords'][1]['start']=.4
        self.alignment['wordAlignment'][2]['startMs']=250
        self.assertIn('MFA_TIMING_OUTSIDE_ACTUAL_WAV',self.result()['errors'])
        self.alignment['wordAlignment'][2]['startMs']=700
        self.asr['speechRecognizer']['modelBinarySha256']='unverified'
        self.assertIn('FROZEN_ASR_MODEL_REQUIRED',self.result()['errors'])

    def test_over_150ms_model_disagreement_is_review_not_word_certification(self):
        self.asr['recognizedWords'][0]['start']=.299
        report=self.result()
        self.assertEqual(report['status'],'RESEARCH_REVIEW_HOLD')
        self.assertEqual(report['counts']['matchedStartsOver150ms'],1)
        self.assertFalse(report['wordTimingCalibrated'])

    def test_split_contraction_is_orthographic_not_pronunciation_failure(self):
        self.words[:]=[{'word':'that','startMs':100.,'endMs':200.},
                       {'word':'s','startMs':200.,'endMs':300.},
                       {'word':'computed','startMs':500.,'endMs':700.}]
        self.asr['recognizedWords']=[{'word':"That's",'start':.1,'end':.3,'probability':.95},
                                     {'word':'computed','start':.5,'end':.7,'probability':.99}]
        report=self.result()
        self.assertEqual(report['counts']['reviewBlocks'],0)
        self.assertEqual(report['counts']['orthographicOnlyBlocks'],1)
        self.assertEqual(report['status'],'RESEARCH_MODEL_CONSENSUS_ONLY')

    def test_fabricated_publish_pass_refused(self):
        self.asr['mayPublish']=True
        self.assertIn('RESEARCH_ONLY_RELEASE_BOUNDARY_REQUIRED',self.result()['errors'])


if __name__ == '__main__':
    unittest.main()
