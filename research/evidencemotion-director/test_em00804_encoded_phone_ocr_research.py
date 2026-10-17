"""True H264, 3-width, 2-layout OCR scientific-disclosure research-only tests."""
import os
import subprocess
from pathlib import Path
import tempfile
import unittest
from em00804_encoded_phone_ocr_research import (
    EXPECTED,WIDTHS,TIMES,PSM,EXPECTED_PICTOGRAM_SHA,SCHEMA,
    run,check_recognition,has_contradictory_plant_assay_claim,norm,ocr_png,width_frame,
    scan_all_original_encoded_frames
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

    def test_actual_encoded_both_disclaimers_plus_fake_measurement_holds(self):
        bad=[x for x in self.receipt["negativeCases"]
             if x["mode"]=="disclosed_but_fabricated_plant_measurement"]
        self.assertEqual(len(bad),2)
        self.assertEqual({x["tesseractPSM"] for x in bad},set(PSM))
        self.assertEqual(len({x["encodedH264Sha256"] for x in bad}),1)
        for case in bad:
            text=case["ocrRawOutput"]
            seen=norm(text)
            self.assertTrue(all(norm(line) in seen for line in EXPECTED),text)
            self.assertTrue(has_contradictory_plant_assay_claim(text),text)
            self.assertFalse(check_recognition(text),text)
            self.assertTrue(case["unsafeApprovalRejected"])
            self.assertTrue(case["bothExpectedDisclosureLinesRecognized"])
            self.assertTrue(case["contradictoryAssayTextRecognized"])

    def test_actual_encoded_safe_disclosure_plus_present_7oh_holds(self):
        bad=[x for x in self.receipt["negativeCases"]
             if x["mode"]=="disclosed_but_fabricated_plant_presence"]
        self.assertEqual(len(bad),2)
        self.assertEqual({x["tesseractPSM"] for x in bad},set(PSM))
        self.assertEqual(len({x["encodedH264Sha256"] for x in bad}),1)
        for case in bad:
            raw=case["ocrRawOutput"]
            self.assertTrue(all(norm(line) in norm(raw) for line in EXPECTED),raw)
            self.assertTrue("7OHPRESENT" in norm(raw),raw)
            self.assertTrue(has_contradictory_plant_assay_claim(raw),raw)
            self.assertFalse(check_recognition(raw),raw)
            self.assertTrue(case["unsafeApprovalRejected"])
            self.assertTrue(case["bothExpectedDisclosureLinesRecognized"])

    def test_semantic_veto_even_if_both_required_lines_are_present(self):
        safe="AI-ILLUSTRATED BOTANICAL\nNOT A 7-OH PLANT ASSAY"
        self.assertTrue(check_recognition(safe))
        for claim in ("MEASURED 7-OH IN THIS PLANT",
                      "7-OH DETECTED IN LEAVES",
                      "THIS PLANT HAS 7-OH",
                      "LAB CONFIRMED 7-OH CONTENT",
                      "ASSAY CONFIRMS 7-OH",
                      "7-OH PRESENT IN THIS PLANT",
                      "IDENTIFIED 7-OH IN THE LEAF"):
            with self.subTest(claim=claim):
                self.assertTrue(has_contradictory_plant_assay_claim(safe+"\n"+claim))
                self.assertFalse(check_recognition(safe+"\n"+claim))
        self.assertFalse(has_contradictory_plant_assay_claim(
            "AI-ILLUSTRATED BOTANICAL NOT A 7-OH PLANT ASSAY"))

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

    def test_all_actual_encoded_frames_catch_transient_unsafe_caption(self):
        scan=self.receipt["temporalFullFrameResearchProbe"]
        self.assertTrue(scan["researchFixtureOnly"])
        self.assertTrue(scan["researchFixtureFullScanVerified"])
        self.assertEqual(scan["originalStaticFilmFramesOCRed"],60)
        self.assertEqual(scan["transientFilmFramesOCRed"],60)
        self.assertEqual(scan["injectedAdversarialFrameIndices"],list(range(10,20)))
        self.assertEqual(scan["verifiedUnsafeFrameIndices"],list(range(10,20)))
        self.assertEqual(
            [x["frameIndex"] for x in scan["sparseCheckpointsWronglyAppearSafe"]],
            list(TIMES))
        self.assertTrue(all(x["unsafeClaimMissed"]
                            for x in scan["sparseCheckpointsWronglyAppearSafe"]))
        good=scan["originalStaticFilmReadings"]
        bad=scan["transientFilmReadings"]
        self.assertEqual([x["frameIndex"] for x in good],list(range(60)))
        self.assertEqual([x["frameIndex"] for x in bad],list(range(60)))
        self.assertTrue(all(x["twoSafeDisclaimersAndNoVeto"] for x in good))
        for x in bad:
            index=x["frameIndex"]
            if 10<=index<20:
                self.assertTrue(x["contradictoryAssayRecognized"],x)
                self.assertFalse(x["twoSafeDisclaimersAndNoVeto"],x)
                self.assertTrue(all(norm(line) in norm(x["ocrRawOutput"])
                                    for line in EXPECTED),x)
            else:
                self.assertTrue(x["twoSafeDisclaimersAndNoVeto"],x)
        self.assertFalse(scan["actualHandsetApproved"])
        self.assertFalse(scan["originalNarratedFilmApproved"])
        self.assertFalse(scan["mayPublish"])

    def test_all_frame_decoder_refuses_truncated_encoded_movie(self):
        # A 10-frame H264 cannot pretend to be the full 60-frame fixture.
        original=self.path/"clips/legible.mp4"
        cut=self.path/"truncated-temporal-guard.mp4"
        subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y",
                        "-i",str(original),"-frames:v","10","-an",
                        "-c:v","libx264","-preset","ultrafast",str(cut)],
                       check=True,capture_output=True,timeout=60)
        with self.assertRaisesRegex(ValueError,
                                    "ENCODED_TEMPORAL_FRAME_MISSING_HOLD"):
            scan_all_original_encoded_frames(cut)

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
