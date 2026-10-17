"""Synthetic machine negatives, never original phonetic or phone verification."""
import copy
import hashlib
import io
import json
import wave
import unittest

from narration_caption_authoring_gate import check_authoring, words

SCENES = [
    {"id": "first", "text": "The FDA says it isn't a dietary ingredient.",
     "voice_start_s": 0.0, "voice_end_s": 3.0},
    {"id": "second", "text": "If you're dependent, get medical advice before stopping.",
     "voice_start_s": 3.2, "voice_end_s": 7.0},
]
SOURCE_WAV = io.BytesIO()
with wave.open(SOURCE_WAV, 'wb') as stream:
    stream.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
    stream.writeframes(b"\x00\x00" * 24000)
SOURCE_WAV = SOURCE_WAV.getvalue()
WAV_SHA = hashlib.sha256(SOURCE_WAV).hexdigest()
PROVENANCE = {"scenes": SCENES, "word_alignment": "NOT_PERFORMED",
              "phonetic_qa": "NOT_PERFORMED", "mayPublish": False,
              "wav_sha256": WAV_SHA}
PROVENANCE_RAW = json.dumps(PROVENANCE, sort_keys=True).encode()
SOURCE_PROVENANCE_SHA = hashlib.sha256(PROVENANCE_RAW).hexdigest()
CUES = [(1, .2, 1.2, "The FDA says it isn't"),
        (2, 1.2, 2.6, "a dietary ingredient."),
        (3, 3.3, 4.5, "If you're dependent,"),
        (4, 4.5, 6.8, "get medical advice before stopping.")]

class NarrationCaptionAuthoringTests(unittest.TestCase):
    def review(self, cues=None, prov=None, pin=None, wav=None, wav_pin=None):
        source = (PROVENANCE_RAW if prov is None
                  else json.dumps(prov, sort_keys=True).encode())
        return check_authoring(source, SOURCE_PROVENANCE_SHA if pin is None else pin,
                               SOURCE_WAV if wav is None else wav,
                               WAV_SHA if wav_pin is None else wav_pin,
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


    def test_realistic_joint_negation_change_cannot_repin_original_source(self):
        changed = copy.deepcopy(PROVENANCE)
        changed['scenes'][0]['text'] = changed['scenes'][0]['text'].replace("isn't", "is")
        captions = copy.deepcopy(CUES)
        captions[0] = (1, .2, 1.2, "The FDA says it is")
        self.assertEqual(self.review(captions, changed)['errors'],
                         ['ORIGINAL_VOICE_PROVENANCE_CHANGED'])

    def test_semantic_quantities_and_ratios_not_erased_by_normalization(self):
        from narration_caption_authoring_gate import words
        for a, b in [('15%', '15'), ('1.5', '1 5'),
                     ('1/2', '1 2'), ('7-OH', '7 OH')]:
            with self.subTest(a=a, b=b):
                self.assertNotEqual(words(a), words(b))

    def test_changed_original_audio_bytes_and_wrong_external_pin_rejected(self):
        changed = bytearray(SOURCE_WAV)
        changed[-2:] = b'\x33\x12'
        self.assertEqual(self.review(wav=bytes(changed))['errors'],
                         ['ORIGINAL_NARRATION_WAV_CHANGED'])
        self.assertEqual(self.review(pin='0'*64)['errors'],
                         ['ORIGINAL_VOICE_PROVENANCE_CHANGED'])
        self.assertEqual(self.review(wav_pin='not-a-sha')['errors'],
                         ['INDEPENDENT_ORIGINAL_SOURCE_PINS_REQUIRED'])

    def test_provenance_references_wrong_wav_even_if_provenance_rehashed(self):
        changed = copy.deepcopy(PROVENANCE)
        changed['wav_sha256'] = 'f'*64
        pinned = hashlib.sha256(json.dumps(changed, sort_keys=True).encode()).hexdigest()
        self.assertEqual(self.review(prov=changed, pin=pinned)['errors'],
                         ['PROVENANCE_AUDIO_SOURCE_BINDING_INVALID'])

    def test_truncated_or_nonnative_voice_file_does_not_certify_provenance(self):
        for invalid in (b'not wav', SOURCE_WAV[:50]):
            with self.subTest(size=len(invalid)):
                pinned = hashlib.sha256(invalid).hexdigest()
                self.assertEqual(self.review(wav=invalid, wav_pin=pinned)['status'], 'HOLD')


    def test_plus_ampersand_and_quantity_bounds_are_not_erased(self):
        for original, changed in (
                ('15+', '15'), ('15%+', '15%'),
                ('Caffeine + alcohol', 'Caffeine alcohol'),
                ('A&B', 'A B'), ('drug A & B', 'drug A B')):
            with self.subTest(original=original, changed=changed):
                self.assertNotEqual(words(original), words(changed))

    def test_operator_deleted_from_pinned_authoring_caption_is_rejected(self):
        source_provenance = copy.deepcopy(PROVENANCE)
        source_provenance['scenes'][0]['text'] = (
            "The FDA says it isn't a dietary ingredient at 15+.")
        frozen_raw = json.dumps(source_provenance, sort_keys=True).encode()
        frozen_sha = hashlib.sha256(frozen_raw).hexdigest()
        caption = copy.deepcopy(CUES)
        caption[1] = (2, 1.2, 2.6, "a dietary ingredient at 15+.")
        self.assertEqual(
            self.review(caption, source_provenance, frozen_sha)['status'],
            'RESEARCH_AUTHORING_PARITY_HOLD')
        caption[1] = (2, 1.2, 2.6, "a dietary ingredient at 15.")
        self.assertEqual(
            self.review(caption, source_provenance, frozen_sha)['errors'],
            ['SCENE_CAPTION_SCRIPT_WORD_MISMATCH'])

    def test_unicode_range_dash_preserved_against_numeric_corruption(self):
        for original, changed in (
                ('5–10', '5 10'), ('5—10', '5 10'),
                ('7–OH', '7 OH'), ('20–40%', '20 40%'),
                ('5–10', '5-10')):
            with self.subTest(original=original, changed=changed):
                self.assertNotEqual(words(original), words(changed))

        original = copy.deepcopy(PROVENANCE)
        original['scenes'][0]['text'] = (
            "The FDA says it isn't a dietary ingredient at 5–10 mg.")
        frozen = hashlib.sha256(
            json.dumps(original, sort_keys=True).encode()).hexdigest()
        cues = copy.deepcopy(CUES)
        cues[1] = (2, 1.2, 2.6, "a dietary ingredient at 5–10 mg.")
        self.assertEqual(
            self.review(cues, original, frozen)['status'],
            'RESEARCH_AUTHORING_PARITY_HOLD')
        cues[1] = (2, 1.2, 2.6, "a dietary ingredient at 5 10 mg.")
        self.assertEqual(
            self.review(cues, original, frozen)['errors'],
            ['SCENE_CAPTION_SCRIPT_WORD_MISMATCH'])

if __name__ == '__main__': unittest.main()
