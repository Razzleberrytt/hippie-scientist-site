import unittest

from mfa_acoustic_alignment import LINES, select_dictionary, merge_candidates, term_windows, verify_brief_script


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


if __name__ == '__main__':
    unittest.main()
