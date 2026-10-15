"""Negative controls for short-shot literacy without claim or provenance loss."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from reading_load_audit import assess,check_file


class ReadingLoadGateTests(unittest.TestCase):
    def setUp(self):
        self.plan={"shots":[
            {"id":name,"startSec":begin,"endSec":end,
             "annotations":[{"role":role,"text":txt} for role,txt in lines]}
            for name,begin,end,lines in [
                ("sentence_1_part0",0,1.61,[
                    ("hook","7-OH vs\nmitragynine"),
                    ("science","MITRAGYNINE"),
                    ("disclosure","Separate structures • no reaction")]),
                ("sentence_1_part1",1.61,3.47,[
                    ("hook","7-OH vs\nmitragynine"),
                    ("science","7-OH"),
                    ("disclosure","Separate structures • no reaction")]),
                ("sentence_2",3.47,10.85,[]),("sentence_3",10.85,16.58,[]),
                ("sentence_4",16.58,23.38,[]),
                ("sentence_5_part0",23.38,25.71,[]),
                ("sentence_5_part1",25.71,27.35,[]),
                ("source_hold",27.35,31.25,[
                    ("source","PubChem"),("source","Mitragynine • CID 3034396"),
                    ("source","CID 44301524"),
                    ("source","CID = compound record number"),
                    ("source","pubchem.ncbi.nlm.nih.gov")]),
                ("sentence_6",31.25,34.347,[]),
            ]]}

    def test_exact_compact_two_shot_lesson_passes_with_record_provenance(self):
        result=assess(self.plan)
        self.assertTrue(result["allOpeningCutsPass"])
        self.assertEqual([x["visualWords"] for x in result["openingSpans"]],[8,8])
        self.assertEqual([round(x["visualWordsPerSecond"],2)
                          for x in result["openingSpans"]],[4.97,4.3])
        self.assertTrue(result["sourceRecordIdentitiesStillOnSilentHold"])
        self.assertFalse(result["audienceComprehensionVerified"])

    def test_old_17_word_first_shot_is_rejected(self):
        orig=self.plan["shots"][0]["annotations"]
        orig[1]["text"]="MITRAGYNINE • CID 3034396"
        orig[2]["text"]="2D source structure • no reaction shown"
        orig.append({"role":"disclosure","text":"CID = compound record number"})
        self.assertFalse(assess(self.plan)["openingSpans"][0]["passesOpeningReadingBudget"])

    def test_cid_in_first_scene_fails_even_at_low_word_count(self):
        self.plan["shots"][0]["annotations"][1]["text"]="MITRAGYNINE CID"
        self.assertFalse(assess(self.plan)["openingSpans"][0]["passesOpeningReadingBudget"])

    def test_cannot_hide_no_reaction_disclaimer(self):
        self.plan["shots"][1]["annotations"][2]["text"]="Pretty animated chemical reaction"
        self.assertFalse(assess(self.plan)["openingSpans"][1]["passesOpeningReadingBudget"])

    def test_altered_chemical_label_fails(self):
        self.plan["shots"][1]["annotations"][1]["text"]="mitragynine"
        self.assertFalse(assess(self.plan)["openingSpans"][1]["passesOpeningReadingBudget"])

    def test_shortening_source_hold_cannot_drop_any_compound_record(self):
        s=self.plan["shots"][7]["annotations"]
        s[:]=[a for a in s if a["text"]!="Mitragynine • CID 3034396"]
        with self.assertRaisesRegex(ValueError,"BOTH_CID_SOURCES"):
            assess(self.plan)

    def test_invalid_or_missing_cid_definition_rejected(self):
        s=self.plan["shots"][7]["annotations"]
        s[:]=[a for a in s if a["text"]!="CID = compound record number"]
        with self.assertRaisesRegex(ValueError,"BOTH_CID_SOURCES"):
            assess(self.plan)

    def test_missing_scene_refused(self):
        self.plan["shots"].pop(1)
        with self.assertRaisesRegex(ValueError,"NINE_EXACT_REAL_SHOTS"):
            assess(self.plan)

    def test_half_second_title_violates_reading_budget(self):
        self.plan["shots"][0]["endSec"]=.6
        self.assertFalse(assess(self.plan)["allOpeningCutsPass"])

    def test_file_receipt_does_not_mint_human_understanding(self):
        with tempfile.TemporaryDirectory() as td:
            phone=Path(td)/"plan.json";out=Path(td)/"reading.json"
            phone.write_text(json.dumps(self.plan))
            verified=check_file(phone,out)
            saved=json.loads(out.read_text())
            self.assertEqual(saved["exactPhonePlanSha256"],
                             verified["exactPhonePlanSha256"])
            self.assertTrue(saved["allOpeningCutsPass"])
            self.assertFalse(saved["mayPublish"])
            self.assertFalse(saved["humanReadabilityCalibrated"])


if __name__=="__main__":
    unittest.main()
