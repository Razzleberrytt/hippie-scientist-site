"""Exact pinned revised-script semantics and bad-ASR negative fixtures.

These are synthetic transcripts, not claims of model accuracy on the real WAV.
"""
import importlib.util
import unittest
from pathlib import Path

spec=importlib.util.spec_from_file_location("autonomous_script_asr_research",
 Path(__file__).with_name("autonomous_script_asr_research.py"))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)


def fixture(tokens=None):
    ts=tokens if tokens is not None else m.tokens(" ".join(m.LINES))
    return [{"word":x,"start":i*.25,"end":i*.25+.21,
             "probability":.97} for i,x in enumerate(ts)]

class ASRSourceScriptTests(unittest.TestCase):
    def test_good_recognized_word_timeline_is_not_pronunciation_pass(self):
        result=m.comparison(fixture(),34.35,model={"id":"fixture","revisionSha":"f"*40})
        self.assertEqual(result["exactScriptTokenAgreement"],1)
        self.assertEqual(result["decision"],"SCRIPT_MATCH_CANDIDATE_ONLY")
        self.assertFalse(result["phoneticPronunciationVerified"])
        self.assertFalse(result["naturalnessVerified"])
        self.assertFalse(result["wordLevelASRIsAcousticGroundTruth"])
        self.assertFalse(result["mayPublish"])
    def test_missing_hydroxyl_is_named_revise(self):
        bad=[w for w in m.tokens(" ".join(m.LINES)) if w!="hydroxyl"]
        result=m.comparison(fixture(bad),34.35)
        self.assertIn("hydroxyl",result["possiblyMisrecognizedScientificTerms"])
        self.assertEqual(result["decision"],"AUTO_REVISE_SCRIPT_MISMATCH")
    def test_replacing_mitragynine_with_unrecognized_word_rejects(self):
        bad=["margin" if w=="mitragynine" else w for w in m.tokens(" ".join(m.LINES))]
        result=m.comparison(fixture(bad),34.35)
        self.assertIn("mitragynine",result["possiblyMisrecognizedScientificTerms"])
        self.assertEqual(result["decision"],"AUTO_REVISE_SCRIPT_MISMATCH")
    def test_missing_negation_or_computed_pose_caveat_is_always_revise(self):
        for deleted in ("not","computed","pose","effects"):
            script=m.tokens(" ".join(m.LINES))
            script.remove(deleted)
            result=m.comparison(fixture(script),34.35)
            self.assertEqual(result["decision"],"AUTO_REVISE_SCRIPT_MISMATCH",deleted)
            self.assertIn(deleted,result["missingSafetyOrScienceBoundaryWords"])

    def test_asr_hallucination_does_not_certify_science(self):
        words=fixture(m.tokens(" ".join(m.LINES))+
                      ["it","definitely","cures","opioid","withdrawal"])
        result=m.comparison(words,34.35)
        self.assertEqual(result["decision"],"AUTO_REVISE_SCRIPT_MISMATCH")
        self.assertIn("cures",result["unexpectedWords"])
        self.assertFalse(result["scienceApproved"])
    def test_model_recognizing_name_does_not_establish_correct_stress(self):
        good=m.comparison(fixture(),34.35)
        self.assertFalse(good["phoneticPronunciationVerified"])
        self.assertFalse(good["craftApproved"])
    def test_bad_temporal_record_fails_closed(self):
        rec=fixture()
        rec[3]["start"]=-1
        with self.assertRaisesRegex(ValueError,"UNTRUSTED_ASR_TIMELINE"):
            m.comparison(rec,34.35)
    def test_reordered_utterances_cannot_be_accepted(self):
        rec=fixture()
        rec[15]["start"]=1.0
        with self.assertRaisesRegex(ValueError,"UNTRUSTED_ASR_TIMELINE"):
            m.comparison(rec,34.35)
    def test_empty_unanchored_results_rejected(self):
        with self.assertRaisesRegex(ValueError,"ACTUAL_ASR_WORDS_REQUIRED"):
            m.comparison([],34.35)
    def test_7oh_forms_normalize_but_source_must_remain_revised(self):
        self.assertEqual(m.tokens("7-OH"),["seven","o","h"])
        self.assertEqual(m.tokens("seven O H"),["seven","o","h"])
        self.assertIn("different from mitragynine",m.LINES[0])
        self.assertNotIn("position seven", " ".join(m.LINES).lower())
    def test_actual_model_is_immutable_after_real_asr_execution(self):
        self.assertEqual(m.MODEL_ID,"Systran/faster-whisper-tiny.en")
        self.assertEqual(m.MODEL_REV,"0d3d19a32d3338f10357c0889762bd8d64bbdeba")
        self.assertEqual(m.MODEL_BIN_SHA,"1a5afae06a4db91c975c9a9d78be5cc110ee4ea022ad57d55492e4550e936b2a")
        self.assertNotEqual(m.MODEL_REV,"main")

    def test_precomputed_receipt_cannot_claim_independent_recognition(self):
        x=m.comparison(fixture(),34.35,model=None)
        self.assertIsNone(x["speechRecognizer"])
        self.assertFalse(x["wordLevelASRIsAcousticGroundTruth"])

if __name__=="__main__":
    unittest.main()
