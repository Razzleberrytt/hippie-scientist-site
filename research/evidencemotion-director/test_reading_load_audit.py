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
                ("sentence_5_part1",25.71,27.35,[
                    ("science","What it cannot\ntell us."),
                    ("science","STRUCTURE"),
                    ("science","≠"),
                    ("science","HUMAN EXPERIENCE")]),
                ("source_hold",27.35,31.25,[
                    ("source","PubChem"),("source","Mitragynine • CID 3034396"),
                    ("source","7-OH • CID 44301524"),
                    ("source","CID = compound record number"),
                    ("source","pubchem.ncbi.nlm.nih.gov")]),
                ("sentence_6",31.25,34.347,[]),
            ]]}

    def test_exact_compact_two_shot_lesson_passes_with_record_provenance(self):
        result=assess(self.plan)
        self.assertTrue(result["allOpeningCutsPass"])
        self.assertTrue(result["allScenesReadingBudgetPass"])
        self.assertEqual(len(result["allSceneSpans"]),9)
        self.assertEqual(next(x for x in result["allSceneSpans"]
                              if x["scene"]=="sentence_5_part1")["visualWords"],8)
        self.assertEqual([x["visualWords"] for x in result["openingSpans"]],[8,8])
        self.assertEqual([round(x["visualWordsPerSecond"],2)
                          for x in result["openingSpans"]],[4.97,4.3])
        self.assertTrue(result["sourceRecordIdentitiesStillOnSilentHold"])
        self.assertFalse(result["audienceComprehensionVerified"])

    def test_actual_captions_count_as_visible_words_and_reject_false_readability(self):
        # Existing overlay-only test passes, but rendered narration captions
        # consume real visual attention. A green legacy gate cannot mean mute-ready.
        self.plan["shots"][0]["annotations"].append(
            {"role":"caption","text":"What makes seven O H different from mitragynine?"})
        self.plan["shots"][1]["annotations"].append(
            {"role":"caption","text":"What makes seven O H different from mitragynine?"})
        result=assess(self.plan)
        self.assertTrue(result["allOpeningCutsPass"])
        self.assertTrue(result["allScenesReadingBudgetPass"])
        self.assertEqual(result["captionWordsSampled"],16)
        self.assertTrue(result["combinedCaptionOverlayLoadRequiresReview"])
        self.assertFalse(result["allScenesCombinedVisibleTextBudgetPass"])
        self.assertFalse(result["fullMutedComprehensionApproved"])
        self.assertEqual(result["openingSpans"][0]["combinedVisibleWords"],16)
        self.assertFalse(result["openingSpans"][0]["passesCombinedVisibleTextBudget"])

    def test_overloaded_caption_scene_has_exact_sized_action_not_approval(self):
        self.plan["shots"][0]["annotations"].append({
            "role":"caption","text":"What makes seven O H different from mitragynine?"})
        result=assess(self.plan)
        first=result["allSceneSpans"][0]
        self.assertEqual(first["visualWords"],8)
        self.assertEqual(first["captionWords"],8)
        self.assertEqual(first["sampleFrameWordAllowance"],8)
        self.assertEqual(first["maxSampleFrameCaptionWordsAfterOverlays"],0)
        self.assertEqual(first["minimumSampleCaptionWordsToTimeWindow"],8)
        self.assertEqual(first["readingLoadRepairAction"],
                         "TIME_WINDOW_CAPTIONS_KEEP_COMPLETE_SPOKEN_TRANSCRIPT")
        self.assertEqual(result["readingLoadRepairCandidates"][0]["scene"],
                         "sentence_1_part0")
        self.assertEqual(result["readingLoadRepairCandidateCount"],1)
        self.assertFalse(result["readingLoadRepairPlanIsRenderedEvidence"])
        self.assertFalse(result["fullMutedComprehensionApproved"])
        self.assertFalse(result["mayPublish"])

    def test_overlay_only_overload_cannot_be_excused_by_subtitle_windows(self):
        self.plan["shots"][0]["annotations"].append({
            "role":"science","text":"Extra unsafe distracting label"})
        r=assess(self.plan)
        first=r["allSceneSpans"][0]
        self.assertEqual(first["maxSampleFrameCaptionWordsAfterOverlays"],0)
        self.assertEqual(first["minimumSampleCaptionWordsToTimeWindow"],0)
        self.assertEqual(first["readingLoadRepairAction"],
                         "REDESIGN_NONCAPTION_OVERLAYS_PRESERVE_SCIENCE")
        self.assertFalse(first["passesCombinedVisibleTextBudget"])
        self.assertFalse(r["audienceComprehensionVerified"])

    def test_exactly_fitting_source_faithful_scene_needs_no_repair(self):
        r=assess(self.plan)
        self.assertEqual(r["readingLoadRepairCandidateCount"],0)
        self.assertEqual(r["readingLoadRepairCandidates"],[])
        self.assertTrue(all(x["readingLoadRepairAction"]==
                            "NO_MECHANICAL_READING_LOAD_REPAIR_NEEDED"
                            for x in r["allSceneSpans"]))
        self.assertFalse(r["humanReadabilityCalibrated"])

    def test_one_extra_caption_word_can_fail_even_when_overlay_rate_passes(self):
        self.plan["shots"][0]["annotations"].append({"role":"caption","text":"Look"})
        result=assess(self.plan)
        self.assertTrue(result["openingSpans"][0]["passesOpeningReadingBudget"])
        self.assertEqual(result["openingSpans"][0]["visualWords"],8)
        self.assertEqual(result["openingSpans"][0]["combinedVisibleWords"],9)
        self.assertFalse(result["openingSpans"][0]["passesCombinedVisibleTextBudget"])

    def test_file_command_rejects_combined_overload_with_diagnostic_receipt(self):
        self.plan['shots'][0]['annotations'].append({'role':'caption','text':'Look'})
        with tempfile.TemporaryDirectory() as td:
            plan=Path(td)/'plan.json';out=Path(td)/'reading.json'
            plan.write_text(json.dumps(self.plan))
            with self.assertRaisesRegex(ValueError,'COMBINED_CAPTION_OVERLAY_OVERLOAD'):
                check_file(plan,out)
            diagnostic=json.loads(out.read_text())
            self.assertFalse(diagnostic['allScenesCombinedVisibleTextBudgetPass'])
            self.assertFalse(diagnostic['mayPublish'])

    def test_old_17_word_first_shot_is_rejected(self):
        orig=self.plan["shots"][0]["annotations"]
        orig[1]["text"]="MITRAGYNINE • CID 3034396"
        orig[2]["text"]="2D source structure • no reaction shown"
        orig.append({"role":"disclosure","text":"CID = compound record number"})
        self.assertFalse(assess(self.plan)["openingSpans"][0]["passesOpeningReadingBudget"])

    def test_nine_word_negation_payoff_is_objectively_overloaded(self):
        scene=next(x for x in self.plan["shots"] if x["id"]=="sentence_5_part1")
        scene["annotations"].append({"role":"science","text":"7-HYDROXYMITRAGYNINE"})
        result=assess(self.plan)
        self.assertTrue(result["allOpeningCutsPass"])
        self.assertFalse(result["allScenesReadingBudgetPass"])
        other=next(x for x in result["allSceneSpans"]
                   if x["scene"]=="sentence_5_part1")
        self.assertEqual(other["visualWords"],9)
        self.assertGreater(other["visualWordsPerSecond"],5)

    def test_first_use_source_card_cannot_be_made_too_fast(self):
        scene=next(x for x in self.plan["shots"] if x["id"]=="source_hold")
        scene["endSec"]=scene["startSec"]+1.8
        result=assess(self.plan)
        self.assertFalse(result["allScenesReadingBudgetPass"])
        self.assertTrue(result["sourceRecordIdentitiesStillOnSilentHold"])

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
