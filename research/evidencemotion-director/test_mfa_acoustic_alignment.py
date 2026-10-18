import unittest

from mfa_acoustic_alignment import LINES, select_dictionary, merge_candidates, term_windows, verify_brief_script, compare_mfa_phone_hypotheses


class AcousticPreparationTests(unittest.TestCase):
    def test_brief_and_canonical_script_must_match_exactly(self):
        brief = {'beats': [{'narration': line} for line in LINES] + [{'narration': ''}]}
        verify_brief_script(brief)
        for bad in ({}, {'beats': []}, {'beats': [{'narration': 'changed claim'}]}):
            with self.assertRaisesRegex(ValueError, 'BRIEF_SCRIPT'):
                verify_brief_script(bad)

    def test_reuses_dictionary_phones_and_reports_scientific_oovs(self):
        lines = 'seven\t0.99\t0.29\t0.91\t1.01\tS EH1 V AH0 N\ngroup G R UW1 P\n'
        selected, missing = select_dictionary(lines, ['seven', 'hydroxyl', 'group'])
        self.assertEqual(selected['seven'], [('S', 'EH1', 'V', 'AH0', 'N')])
        self.assertEqual(missing, ['hydroxyl'])

    def test_generated_phones_are_candidates_never_approval(self):
        base, missing = select_dictionary('group G R UW1 P\n', ['group', 'hydroxyl'])
        merged = merge_candidates(base, missing, 'hydroxyl HH AY0 D R AA1 K S AH0 L\n')
        self.assertIn('hydroxyl', merged)
        self.assertEqual(base, {'group': [('G', 'R', 'UW1', 'P')]})

    def test_wrong_or_missing_generated_word_and_invalid_phone_hold(self):
        for generated in ('wrong HH AY0\n', '', 'hydroxyl spn\n', 'hydroxyl NaN\n', 'hydroxyl HH AY0\nmedical spn\n'):
            with self.subTest(generated=generated), self.assertRaises(ValueError):
                merge_candidates({}, ['hydroxyl'], generated)

    def test_dictionary_cannot_introduce_extra_undocumented_words(self):
        with self.assertRaises(ValueError):
            merge_candidates({}, ['hydroxyl'], 'hydroxyl HH AY0\nmedical M EH1 D\n')

    def test_term_windows_keep_compound_spelling_separate_from_spoken_words(self):
        words = [dict(word=w, startMs=i*100, endMs=(i+1)*100) for i,w in enumerate(['seven','o','h','hydroxyl','mitragynine','seven','hydroxymitragynine'])]
        windows = term_windows(words)
        self.assertEqual([x['term'] for x in windows], ['7-OH','hydroxyl','mitragynine','7-hydroxymitragynine'])
        self.assertEqual(windows[0]['endMs'], 300)
        self.assertTrue(all(x['pronunciationVerified'] is False for x in windows))

    def test_missing_scientific_word_never_creates_a_window(self):
        with self.assertRaisesRegex(ValueError, 'TERM_COVERAGE'):
            term_windows([{'word':'computed','startMs':0,'endMs':100}])



class MfaPhoneticLabelComparisonTests(unittest.TestCase):
    def test_actual_two_mitragynine_candidates_one_segmental_vowel_label(self):
        # Actual first-party alignment-candidate.json, frozen revision
        # 2414833bfd35c18ad6c629c3d10cbfab8501b09e296cc1963db01638b854bbaf.
        # This test freezes candidate labels, NOT how speech really sounded.
        first = ['M','IH1','T','R','AH0','JH','AH0','N','AY2','N']
        second = ['M','IH1','T','R','AH0','JH','IH0','N','AY2','N']
        x = compare_mfa_phone_hypotheses(first, second)
        self.assertEqual((x['rawTokenEditDistance'], x['segmentalSymbolEditDistance'],
                          x['stressMarkerDifferencesOnAlignedIdenticalVowels']), (1, 1, 0))
        self.assertFalse(x['phoneticPronunciationVerified'])
        self.assertFalse(x['mayPublish'])

    def test_stress_only_is_not_a_different_segment(self):
        x = compare_mfa_phone_hypotheses(['M','IH1','T'], ['M','IH0','T'])
        self.assertEqual((x['rawTokenEditDistance'],x['segmentalSymbolEditDistance'],
                          x['stressMarkerDifferencesOnAlignedIdenticalVowels']), (1,0,1))

    def test_stress_shift_marks_both_vowels_without_phone_substitution(self):
        x = compare_mfa_phone_hypotheses(['HH','AY1','D','R','AA0'],
                                         ['HH','AY0','D','R','AA1'])
        self.assertEqual((x['rawTokenEditDistance'],x['segmentalSymbolEditDistance'],
                          x['stressMarkerDifferencesOnAlignedIdenticalVowels']), (2,0,2))

    def test_phoneme_insertions_remain_segmental(self):
        x = compare_mfa_phone_hypotheses(['M','IH1','T'],['M','IH1','T','R'])
        self.assertEqual((x['rawTokenEditDistance'],x['segmentalSymbolEditDistance']), (1,1))

    def test_invalid_phone_or_unbounded_candidates_hold(self):
        for bad in ([], ['AH3'], ['not_a_phone'], ['IH1'] * 101, 'IH1'):
            with self.subTest(bad=str(bad)[:25]), self.assertRaises(ValueError):
                compare_mfa_phone_hypotheses(['M','IH1'], bad)

    def test_unchanged_sequence_is_zero_and_still_unapproved(self):
        x = compare_mfa_phone_hypotheses(('M','IH1','T'), ('M','IH1','T'))
        self.assertEqual((x['rawTokenEditDistance'],x['segmentalSymbolEditDistance'],
                          x['stressMarkerDifferencesOnAlignedIdenticalVowels']), (0,0,0))
        self.assertTrue(x['differencesAreModelLabelHypothesesNotAcousticTruth'])
        self.assertFalse(x['independentOriginalAudioPhonemeReferenceAvailable'])
        self.assertFalse(x['mayPublish'])


if __name__ == '__main__':
    unittest.main()
