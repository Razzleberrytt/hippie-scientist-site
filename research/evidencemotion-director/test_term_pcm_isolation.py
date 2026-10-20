import copy
import unittest
from autonomous_script_asr_research import LINES, WAV_SHA, tokens
from term_pcm_isolation import EXPECTED_COUNTS, pcm_slice, targets


class OriginalTermIsolationTests(unittest.TestCase):
    def setUp(self):
        self.words = tokens(" ".join(LINES))
        self.alignment = {
            "inputSha256": {"wav": WAV_SHA}, "revisionSha256": "a"*64,
            "wordAlignment": [
                {"word": word, "startMs": i*300.0 + 10.0,
                 "endMs": i*300.0 + 240.0} for i, word in enumerate(self.words)
            ]
        }

    def test_all_instances_and_no_overlapping_term_word_ownership(self):
        items = targets(self.alignment)
        self.assertEqual(len(items), 5)
        self.assertEqual([x["term"] for x in items],
                         ["7-OH", "mitragynine", "hydroxyl",
                          "7-hydroxymitragynine", "mitragynine"])
        from collections import Counter
        self.assertEqual(Counter(x["term"] for x in items), Counter(EXPECTED_COUNTS))
        word_indices = [i for row in items for i in row["wordIndices"]]
        self.assertEqual(len(word_indices), len(set(word_indices)))
        self.assertTrue(all(x["pronunciationVerified"] is False for x in items))

    def test_missing_duplicate_or_changed_term_is_not_accepted(self):
        for idx, word in ((7, "other"), (9, "nothing"), (17, "else")):
            altered = copy.deepcopy(self.alignment)
            altered["wordAlignment"][idx]["word"] = word
            with self.assertRaisesRegex(ValueError, "LOCKED_TRANSCRIPT"):
                targets(altered)
        altered = copy.deepcopy(self.alignment)
        altered["wordAlignment"].pop(7)
        with self.assertRaisesRegex(ValueError, "LOCKED_TRANSCRIPT"):
            targets(altered)

    def test_changed_source_identity_and_timing_cannot_be_credited(self):
        altered = copy.deepcopy(self.alignment)
        altered["inputSha256"]["wav"] = "0"*64
        with self.assertRaisesRegex(ValueError, "ORIGINAL_WAV"):
            targets(altered)
        altered = copy.deepcopy(self.alignment)
        altered["wordAlignment"][4]["startMs"] = altered["wordAlignment"][3]["startMs"]
        with self.assertRaisesRegex(ValueError, "WORD_TIME"):
            targets(altered)

    def test_pcm_slice_exact_source_samples_without_dsp(self):
        pcm = bytes(range(256)) * 3000
        start, end, fragment = pcm_slice(pcm, 100.13, 202.72)
        self.assertEqual(start, 2403)
        self.assertEqual(end, 4866)
        self.assertEqual(fragment, pcm[start*2:end*2])
        self.assertEqual(len(fragment), (end-start)*2)

    def test_bad_pcm_window_and_truncation_hold(self):
        pcm = bytes(range(256)) * 10
        for args in ((pcm, -1, 4), (pcm, 4, 4), (pcm, float("nan"), 4),
                     (pcm, 0, 3000), (pcm[:-1], 0, 1)):
            with self.subTest(args=args[1:]):
                with self.assertRaisesRegex(ValueError, "EM01401_PCM_HOLD"):
                    pcm_slice(*args)


if __name__ == "__main__":
    unittest.main()
