"""Offline OCR content/identity negative controls. No fake media verdicts."""
import unittest
from encoded_science_pixel_audit import pixel_criterion,CRITICAL,EXACT_SHOTS

ACTUAL_OCR_SAMPLES={
  "sentence_1_part0":"MITRAGYNINE\nNo reaction\nWhat makes seven",
  "sentence_1_part1":"7-OH\nNo reaction\ndifferent from mitragynine?",
  "sentence_2":("Look at the\nhydroxyl group\n"
                "-OH group: oxygen + hydrogen\n"
                "7-OH has one free hydroxyl\nNot a chemical reaction"),
  "sentence_3":("A record of\nconnected atoms.\n"
                "Dots mark atoms. Lines mark bonds.\n"
                "7-HYDROXYMITRAGYNINE"),
  "sentence_4":("A possible\n3D shape.\n"
                "Computed 3D illustration ¢ not filmed\n"
                "Hydrogen atoms omitted"),
  "sentence_5_part0":"THE HIPPIE SCIENTIST\nSTRUCTURE",
  "sentence_5_part1":"HUMAN EXPERIENCE\neffects feel like.",
  "source_hold":("SOURCE\nMitragynine * CID 3034396\n"
                 "PubChem\n7-OH ¢ CID 44301524\n"
                 "CID = compound record number"),
  "sentence_6":"Look closer.\nComputed detail\nHydrogens omitted"
}


class EncodedSciencePixelsTests(unittest.TestCase):
    def test_all_nine_actual_decoded_sample_ocr_strings(self):
        # Fixtures transcribed from a real ffmpeg+Tesseract read of the
        # existing 7-OH research MP4; the live workflow re-extracts from MP4.
        self.assertEqual(set(ACTUAL_OCR_SAMPLES),set(EXACT_SHOTS))
        for shot,ocr in ACTUAL_OCR_SAMPLES.items():
            with self.subTest(shot=shot):
                self.assertTrue(pixel_criterion(shot,ocr))

    def test_missing_or_swapped_on_screen_source_pairing_rejected(self):
        source=ACTUAL_OCR_SAMPLES["source_hold"]
        tampered=source.replace("3034396","TEMP").replace(
            "44301524","3034396").replace("TEMP","44301524")
        for bad in (tampered,source.replace("7-OH ¢ CID 44301524","CID 44301524"),
                    source.replace("CID = compound record number","")):
            with self.assertRaises(ValueError):
                pixel_criterion("source_hold",bad)

    def test_missing_qualifier_and_unreadable_science_rejected(self):
        for scene,phrase in (("sentence_2","Not a chemical reaction"),
                             ("sentence_4","not filmed"),
                             ("sentence_1_part1","No reaction"),
                             ("sentence_5_part1","HUMAN EXPERIENCE"),
                             ("sentence_6","Computed detail")):
            with self.subTest(scene=scene,phrase=phrase):
                ocr=ACTUAL_OCR_SAMPLES[scene].replace(phrase,"")
                with self.assertRaisesRegex(ValueError,"REQUIRED_SCIENCE_INK"):
                    pixel_criterion(scene,ocr)

    def test_does_not_infer_publisher_or_viewer_from_ocr(self):
        self.assertEqual(len(CRITICAL),9)
        with self.assertRaisesRegex(ValueError,"UNEXPECTED_SHOT"):
            pixel_criterion("unknown_scene","look closer")


if __name__=="__main__":
    unittest.main()
