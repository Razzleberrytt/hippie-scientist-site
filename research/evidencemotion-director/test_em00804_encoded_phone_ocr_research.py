"""True H264, 3-width, 2-layout OCR scientific-disclosure research-only tests."""
import os
from pathlib import Path
import tempfile
import unittest
from em00804_encoded_phone_ocr_research import (
    EXPECTED,WIDTHS,TIMES,PSM,EXPECTED_PICTOGRAM_SHA,SCHEMA,
    run,check_recognition,norm,ocr_png,width_frame
)
from em00805_botanical_video_probes import sha

class ActualEncodedPhoneIndependentOCR(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.folder=tempfile.TemporaryDirectory()
        cls.path=Path(cls.folder.name)
        cls.receipt=run(cls.path)

    @classmethod
    def tearDownClass(cls):
        copy=os.environ.get("THS_EM00804_RECEIPT")
        if copy:
            p=Path(copy);p.parent.mkdir(parents=True,exist_ok=True)
            p.write_bytes((cls.path/"em00804-research-receipt.json").read_bytes())
        cls.folder.cleanup()

    def test_actual_source_and_two_untampered_disclosure_lines(self):
        self.assertEqual(self.receipt["schema"],SCHEMA)
        self.assertEqual(self.receipt["sourceArtSha256"],EXPECTED_PICTOGRAM_SHA)
        self.assertEqual(self.receipt["sourceArtSha256"],
                         sha(self.path/"clips/authored-leaf-fixture.png"))
        self.assertEqual(len(self.receipt["expectedText"]),2)
        self.assertEqual(tuple(self.receipt["expectedText"]),EXPECTED)

    def test_eighteen_ocr_results_from_real_encoded_h264_all_visible(self):
        v=self.receipt["positiveReadings"]
        self.assertEqual(len(v),len(TIMES)*len(WIDTHS)*len(PSM))
        self.assertEqual(
            {(x["frameIndex"],x["width"],x["tesseractPSM"]) for x in v},
            {(f,w,m) for f in TIMES for w in WIDTHS for m in PSM})
        for x in v:
            self.assertTrue(x["bothExpectedLinesRecovered"])
            self.assertTrue(x["simulatedPlatformOcclusion"])
            self.assertTrue(check_recognition(x["ocrRawOutput"]))
            self.assertEqual(len(x["decodedResizedMaskedRgbSha256"]),64)
            self.assertFalse(x["phonePhysicalPlaybackApproved"])
            self.assertFalse(x["mayPublish"])

    def test_both_missing_caption_layouts_are_rejected_on_three_real_frames(self):
        bad=[x for x in self.receipt["negativeCases"]
             if x["mode"]=="disclosure_deleted"]
        self.assertEqual(len(bad),6)
        self.assertTrue(all(x["unsafeApprovalRejected"] for x in bad))
        self.assertTrue(all(not check_recognition(x["ocrRawOutput"]) for x in bad))
        self.assertEqual({x["frame"] for x in bad},set(TIMES))

    def test_false_botanical_assay_ocr_visible_but_semantically_refused(self):
        bad=[x for x in self.receipt["negativeCases"]
             if x["mode"]=="false_measured_plant_7OH"]
        self.assertEqual(len(bad),2)
        for x in bad:
            seen=norm(x["ocrRawOutput"])
            self.assertTrue(all(y in seen for y in ("MEASURED","7OH","PLANT")))
            self.assertTrue(x["unsafeMeasuredAssayRecognized"])
            self.assertTrue(x["unsafeApprovalRejected"])
            self.assertFalse(check_recognition(x["ocrRawOutput"]))

    def test_normalization_accepts_hyphen_breaks_not_deleted_semantics(self):
        self.assertTrue(check_recognition(
           "AI—ILLUSTRATED BOTANICAL\nNOT A 7 OH PLANT ASSAY"))
        self.assertFalse(check_recognition(
           "AI ILLUSTRATED BOTANICAL\n7 OH PLANT ASSAY"))
        self.assertFalse(check_recognition(
           "MEASURED 7 OH IN THIS PLANT"))
        self.assertFalse(check_recognition(""))

    def test_bad_phone_scale_or_timestamp_not_misrepresented(self):
        target=self.path/"clips/legible.mp4"
        for frame,width in ((77,375),(30,500)):
            with self.subTest(frame=frame,width=width):
                with self.assertRaisesRegex(ValueError,
                                           "UNDECLARED_SAMPLE_WIDTH_OR_TIME"):
                    width_frame(target,frame,width)

    def test_bad_ocr_layout_fails_closed(self):
        image=width_frame(self.path/"clips/legible.mp4",30,375,overlay=True)
        with self.assertRaisesRegex(ValueError,"UNSUPPORTED_OCR_LAYOUT"):
            ocr_png(image,99)

    def test_never_inherits_real_human_handset_scientific_or_release_pass(self):
        for key in (
          "allPhysicalPhoneAndScienceGatesPassed",
          "actualHandsetReadabilityVerified",
          "validatedAsHumanReadabilityPredictor",
          "independentScientificClaimsApproved",
          "allVideoFramesReadByIndependentOCR",
          "mayPublish"):
            self.assertFalse(self.receipt[key],key)
        self.assertIn("tesseract",self.receipt["tesseractVersion"].lower())

if __name__=="__main__":
    unittest.main()
