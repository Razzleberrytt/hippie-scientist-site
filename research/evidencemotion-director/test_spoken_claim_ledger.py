import copy
import unittest
from autonomous_script_asr_research import LINES,WAV_SHA,tokens
from spoken_claim_ledger import inventory

class SpokenClaimLedgerTests(unittest.TestCase):
    def setUp(self):
        self.alignment={"inputSha256":{"wav":WAV_SHA},"revisionSha256":"a"*64,
          "wordAlignment":[{"word":word,"startMs":i*100,"endMs":i*100+80}
            for i,word in enumerate(tokens(" ".join(LINES)))]}

    def test_every_spoken_word_has_exactly_one_assertion_owner(self):
        result=inventory(self.alignment)
        words=result["words"]
        self.assertEqual([w["word"] for w in words],tokens(" ".join(LINES)))
        self.assertEqual([w["index"] for w in words],list(range(73)))
        self.assertEqual(len(result["assertions"]),8)
        self.assertEqual(sum(len(c["wordIndices"]) for c in result["assertions"]),73)
        self.assertEqual([w["word"] for w in words if "NEGATION" in w["roles"]],["not","not"])
        self.assertEqual([w["word"] for w in words if "COMPUTED_LIMIT" in w["roles"]],["computed"])
        self.assertFalse(result["scienceApproved"])
        self.assertFalse(result["mayPublish"])

    def test_missing_word_and_removed_qualifier_are_rejected(self):
        for index in (0,42,57):
            altered=copy.deepcopy(self.alignment)
            altered["wordAlignment"].pop(index)
            with self.assertRaisesRegex(ValueError,"LOCKED_TRANSCRIPT"):
                inventory(altered)
        altered=copy.deepcopy(self.alignment)
        altered["wordAlignment"][42]["word"]="actually"
        with self.assertRaisesRegex(ValueError,"LOCKED_TRANSCRIPT"):
            inventory(altered)

    def test_foreign_wav_and_overlapping_timing_are_rejected(self):
        altered=copy.deepcopy(self.alignment)
        altered["inputSha256"]["wav"]="b"*64
        with self.assertRaisesRegex(ValueError,"ORIGINAL_WAV"):
            inventory(altered)
        altered=copy.deepcopy(self.alignment)
        altered["wordAlignment"][1]["startMs"]=-1
        with self.assertRaisesRegex(ValueError,"WORD_TIME"):
            inventory(altered)

if __name__=="__main__": unittest.main()
