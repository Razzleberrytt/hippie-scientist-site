"""Synthetic machine negatives, never original phonetic or phone verification."""
import copy
import unittest

from narration_caption_authoring_gate import check_authoring, words

SCENES = [
    {"id": "first", "text": "The FDA says it isn't a dietary ingredient.",
     "voice_start_s": 0.0, "voice_end_s": 3.0},
    {"id": "second", "text": "If you're dependent, get medical advice before stopping.",
     "voice_start_s": 3.2, "voice_end_s": 7.0},
]
PROVENANCE = {"scenes": SCENES, "word_alignment": "NOT_PERFORMED",
              "phonetic_qa": "NOT_PERFORMED", "mayPublish": False}
CUES = [(1, .2, 1.2, "The FDA says it isn't"),
        (2, 1.2, 2.6, "a dietary ingredient."),
        (3, 3.3, 4.5, "If you're dependent,"),
        (4, 4.5, 6.8, "get medical advice before stopping.")]

class NarrationCaptionAuthoringTests(unittest.TestCase):
    def review(self, cues=None, prov=None):
        return check_authoring(copy.deepcopy(PROVENANCE if prov is None else prov),
                               copy.deepcopy(CUES if cues is None else cues))

    def test_matching_declared_text_never_grants_spoken_or_publish_approval(self):
        r = self.review()
        self.assertEqual(r['status'], 'RESEARCH_AUTHORING_PARITY_HOLD', r)
        self.assertEqual(r['matchedScriptTokens'], 16)
        for key in ('mayPublish', 'spokenWordsConfirmedAgainstCaptions',
                    'wordTimingCalibrated', 'phonemeIdentityVerified',
                    'pronunciationVerified', 'humanVoiceQualityVerified'):
            self.assertIs(r[key], False)

    def test_inverted_negation_rejected(self):
        cues = copy.deepcopy(CUES)
        cues[0] = (1,.2,1.2,"The FDA says it IS")
        self.assertEqual(self.review(cues)['errors'], ['SCENE_CAPTION_SCRIPT_WORD_MISMATCH'])

    def test_unsafe_health_advice_substitution_rejected(self):
        cues = copy.deepcopy(CUES)
        cues[-1] = (4, 4.5, 6.8, 'stop immediately without medical advice.')
        self.assertEqual(self.review(cues)['status'], 'HOLD')

    def test_repeated_or_omitted_word_and_number_change_rejected(self):
        for text in ('The FDA says it is not', 'The FDA says it isnt',
                     'The FDA FDA says it isn\'t'):
            cues = copy.deepcopy(CUES); cues[0] = (1,.2,1.2,text)
            with self.subTest(text=text):
                self.assertEqual(self.review(cues)['status'], 'HOLD')
        prov = copy.deepcopy(PROVENANCE)
        prov['scenes'][0]['text'] = "The FDA counted 1320 events."
        cues = [(1,.2,2.6,"The FDA counted 1321 events."), CUES[2], CUES[3]]
        cues = [(i+1,a,b,t) for i,(_,a,b,t) in enumerate(cues)]
        self.assertEqual(self.review(cues, prov)['status'], 'HOLD')

    def test_word_preserving_wrong_scene_handoff_rejected(self):
        cues = copy.deepcopy(CUES); cues[1] = (2, 1.2, 3.3, CUES[1][3]); cues[2] = (3, 3.3, 4.5, CUES[2][3])
        self.assertEqual(self.review(cues)['errors'], ['CAPTION_CROSSES_NARRATION_SCENE'])

    def test_opaque_markup_invisible_character_and_homoglyph_rejected(self):
        for bad in ('before<silence>stopping', 'get\u200b medical', 'stоpping', 'stop🚩'):
            with self.subTest(bad=bad):
                self.assertRaises(ValueError, words, bad)

    def test_caption_indices_and_nonfinite_timing_rejected(self):
        cues = copy.deepcopy(CUES); cues[1] = (5,1.2,2.6,cues[1][3])
        self.assertEqual(self.review(cues)['status'],'HOLD')
        cues = copy.deepcopy(CUES); cues[0]=(1,float('nan'),1.2,cues[0][3])
        self.assertEqual(self.review(cues)['status'],'HOLD')

    def test_tampered_or_overlapping_narration_provenance_rejected(self):
        for mutation in ('missing', 'reordered', 'published', 'claimed_aligned'):
            prov=copy.deepcopy(PROVENANCE)
            if mutation=='missing':prov['scenes']=[prov['scenes'][0]]
            if mutation=='reordered':prov['scenes'][1]['voice_start_s']=2.5
            if mutation=='published':prov['mayPublish']=True
            if mutation=='claimed_aligned':prov['word_alignment']='VERIFIED'
            with self.subTest(mutation=mutation):
                self.assertEqual(self.review(prov=prov)['status'],'HOLD')

if __name__ == '__main__': unittest.main()
