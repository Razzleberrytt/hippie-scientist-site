"""Real decoded-film plus negative mobile overlay contract tests."""
import copy
import hashlib
import json
from decimal import Decimal
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parent))
from phone_ui_audit import (audit, probe_movie, validate_manifest,
                            verify_decoded_shot_coverage, choose_decoded_sample,
                            decoded_overlay, validate_critical_ink_receipt_join,
                            OCR_SOURCE_LABELS, ocr_words, validate_exact_film_ocr_join,
                            mute_story_negative_screen,
                            verify_claimed_ink_frames_belong_to_decoded_shots)

H = "a" * 64

def fixture():
    return {"status": "RESEARCH_ONLY", "releaseApproved": False,
            "expectedVideoSha256": H, "platforms": ["tiktok", "shorts"],
            "hook": {"textVisibleAtSec": .2, "spokenOpeningAtSec": .3, "heroVisualStartsAtSec": .1},
            "shots": [{"id": "opening", "startSec": 0., "endSec": 3.,
                       "assetKind": "deterministic_science",
                       "annotations": [
                         {"role": "hook", "text": "Why is this molecule different?",
                          "fontPx": 48, "boxPx": [100, 250, 750, 350]},
                         {"role": "science", "text": "Computer model, not measured pose",
                          "fontPx": 32, "boxPx": [100, 1100, 700, 1200]}
                       ]}]}

class MobileAuditContract(unittest.TestCase):
    def check(self, plan, *, sha=H, size=(1080, 1920), duration=3.):
        return validate_manifest(plan, width=size[0], height=size[1], duration=duration, actual_sha=sha)

    def test_sample_selection_uses_presented_frame_inside_shot(self):
        stamps = [Decimal("0"), Decimal("0.033333"), Decimal("0.066667"), Decimal("0.1")]
        first = {"id": "opening", "startSec": 0., "endSec": .05}
        second = {"id": "following", "startSec": .05, "endSec": .125}
        self.assertEqual(choose_decoded_sample(stamps, first, .049),
                         (1, Decimal("0.033333")))
        self.assertEqual(choose_decoded_sample(stamps, second, .05),
                         (2, Decimal("0.066667")))
        with self.assertRaisesRegex(ValueError, "SAMPLE_TIME_OUTSIDE_DECLARED_SHOT"):
            choose_decoded_sample(stamps, first, .051)
        with self.assertRaisesRegex(ValueError, "NO_PRESENTED_FRAME_IN_SAMPLE_SHOT"):
            choose_decoded_sample(stamps, {"id": "micro",
                                            "startSec": .044, "endSec": .045}, .0445)

    def test_single_actual_frame_can_cover_a_short_shot(self):
        # Only the actual frame being claimed is in this tiny synthetic
        # probe; other presented frames would need their own shot coverage.
        stamps = [Decimal("1.0")]
        shots = [{"id": "short", "startSec": 1.0, "endSec": 1.008}]
        result = verify_decoded_shot_coverage(stamps, shots)
        self.assertEqual(result["actualPresentedFramesChecked"], 1)
        self.assertEqual(result["framesAssignedExactlyOnce"], 1)
        self.assertFalse(result["mayPublish"])

    def test_presented_frame_inside_tolerated_micro_gap_fails_closed(self):
        # Every shot owns >=1 frame and the last frame is covered, but a
        # 0.8ms boundary gap silently loses frame 1 at t=0.033333s.
        stamps = [Decimal("0"), Decimal("0.033333"), Decimal("0.066667")]
        shots = [
            {"id": "first", "startSec": 0.0, "endSec": 0.033},
            {"id": "second", "startSec": 0.0338, "endSec": 0.1},
        ]
        with self.assertRaisesRegex(ValueError, "PRESENTED_FRAME_UNASSIGNED:1"):
            verify_decoded_shot_coverage(stamps, shots)

    def test_presented_frame_inside_tolerated_overlap_fails_closed(self):
        stamps = [Decimal("0"), Decimal("0.033333"), Decimal("0.066667")]
        shots = [
            {"id": "first", "startSec": 0.0, "endSec": 0.034},
            {"id": "second", "startSec": 0.0333, "endSec": 0.1},
        ]
        with self.assertRaisesRegex(ValueError, "PRESENTED_FRAME_MULTIPLY_ASSIGNED:1"):
            verify_decoded_shot_coverage(stamps, shots)

    def test_full_exact_frame_ownership_returns_research_only_receipt(self):
        stamps = [Decimal("0"), Decimal("0.033333"), Decimal("0.066667")]
        shots = [
            {"id": "first", "startSec": 0.0, "endSec": 0.033333},
            {"id": "second", "startSec": 0.033333, "endSec": 0.1},
        ]
        result = verify_decoded_shot_coverage(stamps, shots)
        self.assertEqual(result["framesAssignedExactlyOnce"], 3)
        self.assertEqual(result["framesWithoutShot"], 0)
        self.assertEqual(result["framesAssignedToMultipleShots"], 0)
        self.assertFalse(result["mayPublish"])

    def test_reordered_decoded_pts_cannot_prove_shot_ownership(self):
        stamps = [Decimal("0"), Decimal("0.066667"), Decimal("0.033333")]
        shots = [{"id": "one", "startSec": 0, "endSec": 0.1}]
        with self.assertRaisesRegex(ValueError, "NONMONOTONIC_DECODED_FRAME_PTS:2"):
            verify_decoded_shot_coverage(stamps, shots)

    def test_duplicate_decoded_pts_cannot_prove_shot_ownership(self):
        stamps = [Decimal("0"), Decimal("0.033333"), Decimal("0.033333")]
        shots = [{"id": "one", "startSec": 0, "endSec": 0.1}]
        with self.assertRaisesRegex(ValueError, "NONMONOTONIC_DECODED_FRAME_PTS:2"):
            verify_decoded_shot_coverage(stamps, shots)

    def test_nan_and_infinite_decoded_pts_cannot_prove_shot_ownership(self):
        shots = [{"id": "one", "startSec": 0, "endSec": 0.1}]
        for invalid in (Decimal("NaN"), Decimal("Infinity"), Decimal("-Infinity")):
            with self.subTest(invalid=str(invalid)):
                with self.assertRaisesRegex(ValueError, "INVALID_DECODED_FRAME_PTS:1"):
                    verify_decoded_shot_coverage([Decimal(0), invalid], shots)

    def test_monotonic_nonuniform_pts_only_prove_coverage_not_constant_fps(self):
        stamps = [Decimal("0"), Decimal("0.030"), Decimal("0.066667")]
        shots = [{"id": "one", "startSec": 0, "endSec": 0.1}]
        result = verify_decoded_shot_coverage(stamps, shots)
        self.assertTrue(result["decodedPTSStrictlyIncreasingAndFinite"])
        self.assertFalse(result["mayPublish"])


    def test_last_presented_frame_must_belong_to_a_shot(self):
        stamps = [Decimal("0"), Decimal("0.033333")]
        shots = [{"id": "short", "startSec": 0.0, "endSec": 0.02}]
        with self.assertRaisesRegex(ValueError, "UNCLAIMED_FINAL_PRESENTED_FRAME"):
            verify_decoded_shot_coverage(stamps, shots)

    def test_final_partial_frame_padding_is_bounded_not_false_gap(self):
        m = fixture()
        m["shots"][0]["endSec"] = 2.98  # < 1 frame of non-content closing pad.
        self.assertEqual(self.check(m)["status"], "OVERLAY_PREFLIGHT_PASS_REVIEW_REQUIRED")

    def test_good_research_metadata_does_not_publish(self):
        receipt = self.check(fixture())
        self.assertEqual(receipt["status"], "OVERLAY_PREFLIGHT_PASS_REVIEW_REQUIRED")
        for key in ("mayPublish", "realHandsetPlaybackVerified", "mutedComprehensionVerified",
                    "visualCraftApproved", "nativeSourceResolutionVerified"):
            self.assertFalse(receipt[key])

    def test_phone_width_type_risk_flags_declared_small_text(self):
        m = fixture()
        report = self.check(m)["projectedMobileTypeReview"]
        self.assertEqual(report["referenceScreenWidthPx"], 375)
        self.assertEqual(report["reviewThresholdPx"], 14)
        self.assertEqual(report["smallDeclaredTextCount"], 1)
        self.assertEqual(report["smallDeclaredText"][0]["projectedAt375Px"], 11.11)
        self.assertEqual(report["smallDeclaredText"][0]["role"], "science")
        self.assertEqual(report["status"], "SMALL_DECLARED_TEXT_REQUIRES_REVIEW")
        self.assertFalse(report["actualRenderedGlyphsMeasured"])
        self.assertFalse(report["realHandsetReadabilityVerified"])
        self.assertFalse(report["mayPublish"])

    def test_phone_type_review_catches_source_and_disclosure_together(self):
        m = fixture()
        m["shots"][0]["annotations"][1]["fontPx"] = 48
        m["shots"][0]["annotations"].extend([
            {"role": "source", "text": "PMID 12345678", "fontPx": 30,
             "boxPx": [100, 450, 700, 500]},
            {"role": "disclosure", "text": "Illustration; not proof",
             "fontPx": 36, "boxPx": [100, 850, 700, 950]},
        ])
        report = self.check(m)["projectedMobileTypeReview"]
        self.assertEqual(report["annotatedTextElements"], 4)
        self.assertEqual(report["smallDeclaredTextCount"], 2)
        self.assertEqual({r["role"] for r in report["smallDeclaredText"]},
                         {"source", "disclosure"})
        self.assertTrue(all(r["projectedAt375Px"] < 14
                            for r in report["smallDeclaredText"]))

    def test_phone_type_review_without_warnings_is_still_not_handset_approval(self):
        m = fixture()
        m["shots"][0]["annotations"][1]["fontPx"] = 48
        report = self.check(m)["projectedMobileTypeReview"]
        self.assertEqual(report["smallDeclaredTextCount"], 0)
        self.assertFalse(report["realHandsetReadabilityVerified"])
        self.assertFalse(report["mayPublish"])

    def test_same_shot_caption_covering_source_fails_closed(self):
        m = fixture()
        m["shots"][0]["annotations"].append({
            "role": "source", "text": "PubChem CID 44301524",
            "fontPx": 34, "boxPx": [250, 270, 650, 330],
        })
        with self.assertRaisesRegex(ValueError, "OVERLAPPING_CRITICAL_TEXT:opening:hook:source"):
            self.check(m)

    def test_same_shot_disclosure_covered_by_science_fails_closed(self):
        m = fixture()
        m["shots"][0]["annotations"].append({
            "role": "disclosure", "text": "Illustration; not proof",
            "fontPx": 38, "boxPx": [150, 1120, 690, 1230],
        })
        with self.assertRaisesRegex(ValueError, "OVERLAPPING_CRITICAL_TEXT:opening:science:disclosure"):
            self.check(m)

    def test_tiny_box_edge_touch_does_not_fake_collision(self):
        m = fixture()
        m["shots"][0]["annotations"].append({
            "role": "source", "text": "Reference",
            "fontPx": 38, "boxPx": [200, 349, 600, 420],
        })
        receipt = self.check(m)
        self.assertEqual(receipt["declaredTextSeparation"]["annotationPairsChecked"], 3)
        self.assertEqual(receipt["declaredTextSeparation"]["significantDeclaredTextCollisions"], 0)
        self.assertFalse(receipt["declaredTextSeparation"]["actualEncodedPixelSeparationVerified"])
        self.assertFalse(receipt["declaredTextSeparation"]["mayPublish"])

    def test_overlapping_boxes_across_different_shots_are_valid(self):
        m = fixture()
        m["shots"][0]["endSec"] = 1.0
        following = copy.deepcopy(m["shots"][0])
        following["id"] = "followup"
        following["startSec"] = 1.0
        following["endSec"] = 3.0
        m["shots"].append(following)
        receipt = self.check(m)
        self.assertEqual(receipt["declaredTextSeparation"]["significantDeclaredTextCollisions"], 0)

    def test_bad_hash(self):
        with self.assertRaisesRegex(ValueError, "EXACT_VIDEO_SHA_MISMATCH"):
            self.check(fixture(), sha="b" * 64)

    def test_incomplete_timeline(self):
        m = fixture()
        m["shots"][0]["endSec"] = 2.6
        with self.assertRaisesRegex(ValueError, "INCOMPLETE_FILM_COVERAGE"):
            self.check(m)

    def test_missing_native_frame_between_shots_is_rejected(self):
        m = fixture()
        m["shots"][0]["endSec"] = 1.0
        m["shots"].append({
            "id": "followup", "startSec": 1.04, "endSec": 3.0,
            "assetKind": "editorial",
            "annotations": [{"role": "caption", "text": "Follow-up explanation",
                             "fontPx": 40, "boxPx": [100, 250, 700, 350]}],
        })
        # Prior 50-ms tolerance accepted a >1-frame gap at native 30 fps.
        with self.assertRaisesRegex(ValueError, "NONCONTIGUOUS_SHOT_TIMELINE"):
            self.check(m)

    def test_short_tail_or_overrun_is_not_complete_movie_coverage(self):
        for end, expected in [(2.92, "INCOMPLETE_FILM_COVERAGE"),
                              (3.04, "NONCONTIGUOUS_SHOT_TIMELINE")]:
            with self.subTest(endSec=end):
                m = fixture()
                m["shots"][0]["endSec"] = end
                # Prior 100-ms tail slack or 50-ms overrun slack falsely passed.
                with self.assertRaisesRegex(ValueError, expected):
                    self.check(m)

    def test_sub_millisecond_annotation_rounding_is_tolerated(self):
        m = fixture()
        m["shots"][0]["endSec"] = 1.0
        m["shots"].append({
            "id": "followup", "startSec": 1.0005, "endSec": 3.0,
            "assetKind": "editorial",
            "annotations": [{"role": "caption", "text": "Continues on time",
                             "fontPx": 40, "boxPx": [100, 250, 700, 350]}],
        })
        self.assertEqual(self.check(m)["status"], "OVERLAY_PREFLIGHT_PASS_REVIEW_REQUIRED")

    def test_duplicate_and_unsafe_shot_id(self):
        m = fixture()
        m["shots"].append(copy.deepcopy(m["shots"][0]))
        with self.assertRaisesRegex(ValueError, "INVALID_OR_DUPLICATE_SHOT_ID"):
            self.check(m)
        m = fixture()
        m["shots"][0]["id"] = "../escape"
        with self.assertRaisesRegex(ValueError, "INVALID_OR_DUPLICATE_SHOT_ID"):
            self.check(m)

    def test_top_right_bottom_occlusions(self):
        for bbox in ([20, 1, 300, 100], [850, 500, 1000, 550], [60, 1580, 400, 1690]):
            with self.subTest(bbox=bbox):
                m = fixture()
                m["shots"][0]["annotations"][0]["boxPx"] = bbox
                with self.assertRaisesRegex(ValueError, "CRITICAL_CONTENT_TOUCHES_PLATFORM_UI_ZONE"):
                    self.check(m)

    def test_tiny_type(self):
        m = fixture()
        m["shots"][0]["annotations"][0]["fontPx"] = 18
        with self.assertRaisesRegex(ValueError, "TINY_CRITICAL_TYPE"):
            self.check(m)

    def test_nan_and_out_of_bounds(self):
        for bbox in ([float("nan"), 250, 300, 350], [10, 250, 2000, 350]):
            m = fixture()
            m["shots"][0]["annotations"][0]["boxPx"] = bbox
            with self.assertRaisesRegex(ValueError, "INVALID_ANNOTATION_GEOMETRY"):
                self.check(m)

    def test_missing_second_platform(self):
        m = fixture()
        m["platforms"] = ["tiktok"]
        with self.assertRaisesRegex(ValueError, "BOTH_PLATFORM_OVERLAYS_REQUIRED"):
            self.check(m)

    def test_missing_first_two_seconds(self):
        m = fixture()
        m["hook"]["spokenOpeningAtSec"] = 2.3
        with self.assertRaisesRegex(ValueError, "FIRST_TWO_SECOND_HOOK_TIMING_REQUIRED"):
            self.check(m)

    def test_hook_timestamp_must_belong_to_the_annotated_shot(self):
        m = fixture()
        m["shots"][0]["endSec"] = .5
        m["shots"].append({
            "id": "followup", "startSec": .5, "endSec": 3.,
            "assetKind": "editorial",
            "annotations": [{
                "role": "caption", "text": "A different scene",
                "fontPx": 40, "boxPx": [100, 250, 700, 350]
            }]
        })
        m["hook"]["textVisibleAtSec"] = 1.5
        with self.assertRaisesRegex(ValueError, "HOOK_TIMESTAMP_NOT_IN_ANNOTATED_SHOT"):
            self.check(m)
        m["shots"][1]["annotations"][0]["role"] = "hook"
        self.assertEqual(self.check(m)["status"], "OVERLAY_PREFLIGHT_PASS_REVIEW_REQUIRED")

    def test_nonfactual_botanical_requires_visible_disclosure_annotation(self):
        m = fixture()
        m["shots"][0]["assetKind"] = "nonfactual_illustration"
        with self.assertRaisesRegex(ValueError, "NONFACTUAL_BOTANICAL_DISCLOSURE_REQUIRED"):
            self.check(m)
        m["shots"][0]["annotations"].append({
            "role": "disclosure", "text": "Illustration; not proof of 7-OH content",
            "fontPx": 36, "boxPx": [90, 1320, 780, 1410]})
        self.assertEqual(self.check(m)["status"], "OVERLAY_PREFLIGHT_PASS_REVIEW_REQUIRED")

    def test_no_publication_forgery(self):
        m = fixture()
        m["releaseApproved"] = True
        with self.assertRaisesRegex(ValueError, "RESEARCH_ONLY_AND_EXPLICIT_RELEASE_HOLD_REQUIRED"):
            self.check(m)

    def test_native_geometry_required(self):
        with self.assertRaisesRegex(ValueError, "NATIVE_PORTRAIT_FRAME_REQUIRED"):
            self.check(fixture(), size=(540, 960))

class ReportOutputAliasSafety(unittest.TestCase):
    def test_manifest_with_report_filename_is_never_deleted(self):
        # Before this guard the phone audit erased its own input plan while
        # trying to clear a stale successful report, then failed on read.
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            movie = root / "original.mp4"
            movie.write_bytes(b"keep movie")
            output = root / "review"
            output.mkdir()
            plan = output / "research-report.json"
            source = b'{"status":"RESEARCH_ONLY","releaseApproved":false}'
            plan.write_bytes(source)
            with self.assertRaisesRegex(ValueError, "REPORT_OUTPUT_ALIASES_SOURCE_INPUT"):
                audit(movie, plan, output)
            self.assertEqual(plan.read_bytes(), source)
            self.assertEqual(movie.read_bytes(), b"keep movie")

    def test_movie_with_report_filename_is_never_deleted(self):
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            output = root / "review"
            output.mkdir()
            movie = output / "research-report.json"
            original = b"untouched source movie bytes"
            movie.write_bytes(original)
            plan = root / "plan.json"
            plan.write_text("{}")
            with self.assertRaisesRegex(ValueError, "REPORT_OUTPUT_ALIASES_SOURCE_INPUT"):
                audit(movie, plan, output)
            self.assertEqual(movie.read_bytes(), original)

    def test_generated_overlay_filename_cannot_destroy_source_manifest(self):
        for name in ("00-opening.png", "opening-1_5.png", "23-source_hold.png"):
            with self.subTest(name=name), tempfile.TemporaryDirectory() as root:
                root = Path(root)
                output = root / "review"
                output.mkdir()
                movie = root / "movie.mp4"
                movie.write_bytes(b"original movie bytes")
                manifest = output / name
                original = b'{"status":"RESEARCH_ONLY","releaseApproved":false}'
                manifest.write_bytes(original)
                with self.assertRaisesRegex(
                    ValueError, "GENERATED_OUTPUT_ALIASES_SOURCE_INPUT"
                ):
                    audit(movie, manifest, output)
                self.assertEqual(manifest.read_bytes(), original)
                self.assertEqual(movie.read_bytes(), b"original movie bytes")

    def test_generated_overlay_filename_cannot_destroy_source_movie(self):
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            output = root / "review"
            output.mkdir()
            movie = output / "opening-0_25.png"
            original = b"encoded-video-source"
            movie.write_bytes(original)
            manifest = root / "plan.json"
            manifest.write_text("{}")
            with self.assertRaisesRegex(
                ValueError, "GENERATED_OUTPUT_ALIASES_SOURCE_INPUT"
            ):
                audit(movie, manifest, output)
            self.assertEqual(movie.read_bytes(), original)

    def test_symlinked_output_dir_cannot_hide_generated_input_path(self):
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            source_dir = root / "originals"
            source_dir.mkdir()
            manifest = source_dir / "00-opening.png"
            original = b"immutable plan source"
            manifest.write_bytes(original)
            (root / "review-link").symlink_to(source_dir, target_is_directory=True)
            movie = root / "movie.mp4"
            movie.write_bytes(b"video bytes")
            with self.assertRaisesRegex(
                ValueError, "GENERATED_OUTPUT_ALIASES_SOURCE_INPUT"
            ):
                audit(movie, manifest, root / "review-link")
            self.assertEqual(manifest.read_bytes(), original)

    def test_symlinked_output_directory_cannot_bypass_alias_guard(self):
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            source_dir = root / "original-inputs"
            source_dir.mkdir()
            plan = source_dir / "research-report.json"
            original = b"original scientific source plan"
            plan.write_bytes(original)
            (root / "output-alias").symlink_to(source_dir, target_is_directory=True)
            movie = root / "movie.mp4"
            movie.write_bytes(b"movie")
            with self.assertRaisesRegex(ValueError, "REPORT_OUTPUT_ALIASES_SOURCE_INPUT"):
                audit(movie, plan, root / "output-alias")
            self.assertEqual(plan.read_bytes(), original)


class ExactVariantCriticalInkJoinTests(unittest.TestCase):
    FILM_SHA = "a" * 64
    PLAN_SHA = "b" * 64

    @classmethod
    def timed_receipt(cls):
        scenes = [
            "sentence_1_part0", "sentence_1_part1", "sentence_2",
            "sentence_3", "sentence_4", "sentence_5_part0",
            "sentence_5_part1", "source_hold", "sentence_6",
        ]
        return {
            "schema": "ths-lane4-timed-variant-ink-probe-research-v1",
            "filmSha256": cls.FILM_SHA,
            "phonePlanSha256": cls.PLAN_SHA,
            "previousVariantScoreEligible": False,
            "actualCriticalLabels": 16,
            "contrastProxyPass": True,
            "persistenceProxyPass": True,
            "actualEncodedSamples": [
                {"shot": shot, "phase": phase, "index": i}
                for i, (shot, phase) in enumerate(
                    (shot, phase) for shot in scenes
                    for phase in ("early", "middle", "late")
                )
            ],
            "mayPublish": False,
            "realHandsetApproved": False,
            "viewerComprehensionApproved": False,
        }

    def join(self, receipt):
        return validate_critical_ink_receipt_join(
            receipt, film_sha=self.FILM_SHA, plan_sha=self.PLAN_SHA
        )

    def test_exact_timed_variant_receipt_only_joins_as_proxy(self):
        joined = self.join(self.timed_receipt())
        self.assertEqual(joined["sourceFramesClaimed"], 27)
        self.assertEqual(joined["criticalLabelsClaimed"], 16)
        self.assertFalse(joined["receiptMeasurementsIndependentlyReplayedHere"])
        self.assertFalse(joined["actualGlyphsVerifiedByThisJoin"])
        self.assertFalse(joined["actualPhoneComprehensionVerified"])
        self.assertFalse(joined["mayPublish"])

    def test_other_film_positive_receipt_cannot_certify_timed_variant(self):
        receipt = self.timed_receipt()
        receipt["filmSha256"] = "c" * 64
        with self.assertRaisesRegex(ValueError, "CRITICAL_INK_RECEIPT_DIFFERENT_FILM"):
            self.join(receipt)

    def test_other_phone_plan_receipt_cannot_cross_treatment(self):
        receipt = self.timed_receipt()
        receipt["phonePlanSha256"] = "c" * 64
        with self.assertRaisesRegex(ValueError, "CRITICAL_INK_RECEIPT_DIFFERENT_PHONE_PLAN"):
            self.join(receipt)

    def test_false_publication_claim_and_wrong_count_rejected(self):
        for key, bad, code in (
            ("mayPublish", True, "FORGED_APPROVAL"),
            ("realHandsetApproved", True, "FORGED_APPROVAL"),
            ("viewerComprehensionApproved", True, "FORGED_APPROVAL"),
            ("actualCriticalLabels", 15, "SIXTEEN_ACTUAL"),
            ("persistenceProxyPass", False, "TIMED_CRITICAL"),
            ("previousVariantScoreEligible", True, "TIMED_CRITICAL"),
        ):
            with self.subTest(key=key):
                receipt = self.timed_receipt()
                receipt[key] = bad
                with self.assertRaisesRegex(ValueError, code):
                    self.join(receipt)

    def test_missing_or_duplicate_real_sample_proof_rejected(self):
        receipt = self.timed_receipt()
        receipt["actualEncodedSamples"].pop()
        with self.assertRaisesRegex(ValueError, "TWENTY_SEVEN_EXACT"):
            self.join(receipt)
        receipt = self.timed_receipt()
        receipt["actualEncodedSamples"][-1] = copy.deepcopy(receipt["actualEncodedSamples"][0])
        with self.assertRaisesRegex(ValueError, "DUPLICATE_CRITICAL_INK_SAMPLE"):
            self.join(receipt)

    def test_unsupported_or_forged_schema_rejected(self):
        r = self.timed_receipt()
        r["schema"] = "ths-superhuman-approval"
        with self.assertRaisesRegex(ValueError, "UNSUPPORTED_CRITICAL_INK_RECEIPT_SCHEMA"):
            self.join(r)

    def test_previous_native_variant_requires_exact_source_proof(self):
        old = self.timed_receipt()
        old["schema"] = "ths-actual-native-teaching-ink-audit-v1"
        old["actualFilmSha256"] = old.pop("filmSha256")
        old["actualPhonePlanSha256"] = old.pop("phonePlanSha256")
        old["testedCriticalVisibleLabels"] = 16
        old["additionalObjectivePoints"] = 2
        old["exactSourceFrameSamplingVerified"] = True
        old["criteria"] = [
            {"code": "actual_full_hd_text_ink_contrast", "passed": True},
            {"code": "meaningful_instruction_text_persistence", "passed": True},
        ]
        old["exactDecodedSampleFrames"] = [
            {"sampleKey": [v["shot"], v["phase"]], "frameIndex": v["index"]}
            for v in old["actualEncodedSamples"]
        ]
        self.assertFalse(self.join(old)["mayPublish"])
        old["criteria"][0]["passed"] = False
        with self.assertRaisesRegex(ValueError, "CRITICAL_INK_PROXY_CRITERIA_NOT_PROVEN"):
            self.join(old)

    def test_failed_new_variant_join_clears_old_success_before_decoder(self):
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            movie = root / "actual-timed.mp4"
            movie.write_bytes(b"not a media test; preflight only")
            plan = root / "phone-plan.json"
            plan.write_text("{}")
            ink = root / "stale-ink.json"
            receipt = self.timed_receipt()
            receipt["filmSha256"] = "c" * 64
            ink.write_text(json.dumps(receipt))
            output = root / "frames"
            output.mkdir()
            prior = output / "research-report.json"
            prior.write_text('{"old_success":true}')
            with self.assertRaisesRegex(ValueError, "CRITICAL_INK_RECEIPT_DIFFERENT_FILM"):
                audit(movie, plan, output, ink_receipt=ink)
            self.assertFalse(prior.exists())
            self.assertTrue(ink.is_file())

    def test_optional_ink_receipt_cannot_be_a_generated_image_or_report(self):
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            output = root / "frames"
            output.mkdir()
            for name in ("research-report.json", "opening-0_25.png"):
                candidate = output / name
                original = b"protected ink audit source receipt"
                candidate.write_bytes(original)
                with self.subTest(name=name):
                    with self.assertRaisesRegex(
                        ValueError,
                        "REPORT_OUTPUT_ALIASES_SOURCE_INPUT" if name.endswith(".json")
                        else "GENERATED_OUTPUT_ALIASES_SOURCE_INPUT"
                    ):
                        audit(root / "movie.mp4", root / "plan.json",
                              output, ink_receipt=candidate)
                self.assertEqual(candidate.read_bytes(), original)


class EncodedFrameMembershipTests(unittest.TestCase):
    """Receipt indices must belong to decoded shot PTS, not only a paper SHA."""

    def fixtures(self):
        receipt = ExactVariantCriticalInkJoinTests.timed_receipt()
        names = [shot for shot in OCR_SOURCE_LABELS]
        shots = [
            {"id": name, "startSec": i * 50 / 30, "endSec": (i + 1) * 50 / 30}
            for i, name in enumerate(names)
        ]
        stamps = [Decimal(n) / Decimal(30) for n in range(450)]
        for i, sample in enumerate(receipt["actualEncodedSamples"]):
            scene_idx = names.index(sample["shot"])
            sample["index"] = scene_idx * 50 + {"early": 2, "middle": 22, "late": 42}[sample["phase"]]
        return receipt, stamps, shots

    def verify(self, receipt, stamps, shots):
        return verify_claimed_ink_frames_belong_to_decoded_shots(receipt, stamps, shots)

    def test_27_actual_pts_are_shot_owned_and_nonpublishing(self):
        ink, frames, shots = self.fixtures()
        result = self.verify(ink, frames, shots)
        self.assertEqual(result["sampleFramesChecked"], 27)
        self.assertTrue(result["allClaimedFramePTSBelongToDeclaredShots"])
        self.assertTrue(result["nineShotsThreePhasesSpanActualPresentationTime"])
        self.assertFalse(result["ocrRerun"])
        self.assertFalse(result["inkPixelsIndependentlyReplayed"])
        self.assertFalse(result["mayPublish"])

    def test_out_of_range_frame_index_is_not_valid_ink_proof(self):
        ink, frames, shots = self.fixtures()
        ink["actualEncodedSamples"][0]["index"] = len(frames)
        with self.assertRaisesRegex(ValueError,
                                    "INK_FRAME_INDEX_OR_SHOT_NOT_PRESENT_IN_DECODED_FILM"):
            self.verify(ink, frames, shots)

    def test_actual_index_from_neighbor_shot_cannot_be_relabelled(self):
        ink, frames, shots = self.fixtures()
        ink["actualEncodedSamples"][0]["index"] = 52
        with self.assertRaisesRegex(ValueError,
                                    "INK_DECODED_FRAME_BELONGS_TO_DIFFERENT_SHOT"):
            self.verify(ink, frames, shots)

    def test_early_middle_late_must_cover_different_parts_of_shot(self):
        ink, frames, shots = self.fixtures()
        # 3 distinct increasing valid decoded indices; all still in first 15%.
        for position, ix in enumerate((3, 5, 7)):
            ink["actualEncodedSamples"][position]["index"] = ix
        with self.assertRaisesRegex(ValueError,
                                    "INK_EARLY_MIDDLE_LATE_NOT_SPREAD_ACROSS_SHOT"):
            self.verify(ink, frames, shots)

    def test_proximate_triplet_at_center_is_not_three_phase_persistence(self):
        ink, frames, shots = self.fixtures()
        for position, ix in enumerate((18, 21, 24)):
            ink["actualEncodedSamples"][position]["index"] = ix
        with self.assertRaisesRegex(ValueError,
                                    "INK_EARLY_MIDDLE_LATE_NOT_SPREAD_ACROSS_SHOT"):
            self.verify(ink, frames, shots)

    def test_last_observation_too_early_cannot_prove_tail_persistence(self):
        ink, frames, shots = self.fixtures()
        ink["actualEncodedSamples"][2]["index"] = 26
        with self.assertRaisesRegex(ValueError,
                                    "INK_EARLY_MIDDLE_LATE_NOT_SPREAD_ACROSS_SHOT"):
            self.verify(ink, frames, shots)

    def test_middle_observation_at_beginning_cannot_prove_midpoint(self):
        ink, frames, shots = self.fixtures()
        ink["actualEncodedSamples"][1]["index"] = 8
        with self.assertRaisesRegex(ValueError,
                                    "INK_EARLY_MIDDLE_LATE_NOT_SPREAD_ACROSS_SHOT"):
            self.verify(ink, frames, shots)

    def test_middle_observation_at_end_cannot_prove_midpoint(self):
        ink, frames, shots = self.fixtures()
        ink["actualEncodedSamples"][1]["index"] = 42
        ink["actualEncodedSamples"][2]["index"] = 46
        with self.assertRaisesRegex(ValueError,
                                    "INK_EARLY_MIDDLE_LATE_NOT_SPREAD_ACROSS_SHOT"):
            self.verify(ink, frames, shots)

    def test_insufficient_early_to_late_span_rejects_nominal_phases(self):
        ink, frames, shots = self.fixtures()
        for position, ix in enumerate((20, 25, 35)):
            ink["actualEncodedSamples"][position]["index"] = ix
        with self.assertRaisesRegex(ValueError,
                                    "INK_EARLY_MIDDLE_LATE_NOT_SPREAD_ACROSS_SHOT"):
            self.verify(ink, frames, shots)

    def test_phase_spread_is_decoded_pts_based_not_ordinal_frame_indices(self):
        ink, frames, shots = self.fixtures()
        # A nominally late encoded index is physically presented early.
        frames[42] = Decimal("0.25")
        with self.assertRaisesRegex(ValueError,
                                    "INK_EARLY_MIDDLE_LATE_NOT_SPREAD_ACROSS_SHOT"):
            self.verify(ink, frames, shots)


    def test_early_middle_late_must_be_in_presented_order(self):
        ink, frames, shots = self.fixtures()
        ink["actualEncodedSamples"][0]["index"] = 43
        ink["actualEncodedSamples"][2]["index"] = 2
        with self.assertRaisesRegex(ValueError,
                                    "INK_DECODED_PHASE_INDICES_NOT_IN_TEMPORAL_ORDER"):
            self.verify(ink, frames, shots)

    def test_duplicate_actual_frame_cannot_claim_two_phases(self):
        ink, frames, shots = self.fixtures()
        ink["actualEncodedSamples"][1]["index"] = ink["actualEncodedSamples"][0]["index"]
        with self.assertRaisesRegex(ValueError,
                                    "INK_DECODED_PHASE_INDICES_NOT_IN_TEMPORAL_ORDER"):
            self.verify(ink, frames, shots)

    def test_valid_index_but_invented_shot_is_rejected(self):
        ink, frames, shots = self.fixtures()
        ink["actualEncodedSamples"][0]["shot"] = "made_up"
        with self.assertRaisesRegex(ValueError,
                                    "INK_FRAME_INDEX_OR_SHOT_NOT_PRESENT_IN_DECODED_FILM"):
            self.verify(ink, frames, shots)

    def test_legacy_native_sample_keys_remain_source_bound(self):
        ink, frames, shots = self.fixtures()
        ink["schema"] = "ths-actual-native-teaching-ink-audit-v1"
        ink["exactDecodedSampleFrames"] = [
            {"sampleKey": [x["shot"], x["phase"]], "frameIndex": x["index"]}
            for x in ink["actualEncodedSamples"]]
        self.assertFalse(self.verify(ink, frames, shots)["mayPublish"])
        ink["exactDecodedSampleFrames"][0]["frameIndex"] = 55
        with self.assertRaisesRegex(ValueError,
                                    "INK_DECODED_FRAME_BELONGS_TO_DIFFERENT_SHOT"):
            self.verify(ink, frames, shots)

    def test_missing_or_malformed_phase_fails_closed(self):
        ink, frames, shots = self.fixtures()
        ink["actualEncodedSamples"].pop()
        with self.assertRaisesRegex(ValueError, "INK_FRAME_MEMBERSHIP_REQUIRES_27_SAMPLES"):
            self.verify(ink, frames, shots)
        ink, frames, shots = self.fixtures()
        ink["actualEncodedSamples"][0]["index"] = True
        with self.assertRaisesRegex(ValueError, "INK_FRAME_INDEX_OR_SHOT_NOT_PRESENT_IN_DECODED_FILM"):
            self.verify(ink, frames, shots)

    def test_full_audit_clears_old_report_before_misassigned_ink_receipt(self):
        # Integration wiring: patch expensive FFmpeg only. The real audit must
        # call the decoded-PTS membership gate BEFORE generating any image.
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            movie = root / "film.mp4"
            movie.write_bytes(b"source movie integrity sentinel")
            ink, frames, shots = self.fixtures()
            plan_path = root / "nine-shot-plan.json"
            plan_path.write_text(json.dumps({"shots": shots}))
            ink["filmSha256"] = hashlib.sha256(movie.read_bytes()).hexdigest()
            ink["phonePlanSha256"] = hashlib.sha256(plan_path.read_bytes()).hexdigest()
            ink["actualEncodedSamples"][0]["index"] = 52  # named shot 0, frame in shot 1
            ink_path = root / "ink.json"
            ink_path.write_text(json.dumps(ink))
            output = root / "screens"
            output.mkdir()
            report = output / "research-report.json"
            report.write_text('{"staleFalsePass": true}')
            source_bytes = (movie.read_bytes(), plan_path.read_bytes(), ink_path.read_bytes())
            with (patch("phone_ui_audit.probe_movie", return_value=(1080, 1920, 15., 450)),
                  patch("phone_ui_audit.validate_manifest", return_value={"mayPublish": False}),
                  patch("phone_ui_audit.frame_timestamps", return_value=frames),
                  patch("phone_ui_audit.verify_decoded_shot_coverage",
                        return_value={"mayPublish": False}),
                  patch("phone_ui_audit.decoded_overlay",
                        side_effect=AssertionError("must fail before image extraction"))):
                with self.assertRaisesRegex(
                    ValueError, "INK_DECODED_FRAME_BELONGS_TO_DIFFERENT_SHOT"
                ):
                    audit(movie, plan_path, output, ink_receipt=ink_path)
            self.assertFalse(report.exists(), "stale QA approval must be invalidated")
            self.assertEqual(
                (movie.read_bytes(), plan_path.read_bytes(), ink_path.read_bytes()),
                source_bytes, "input sources must remain immutable")


    def test_bad_timestamp_and_wrong_named_shot_boundary_hold(self):
        ink, frames, shots = self.fixtures()
        frames[2] = Decimal("NaN")
        with self.assertRaisesRegex(ValueError,
                                    "INK_DECODED_FRAME_BELONGS_TO_DIFFERENT_SHOT"):
            self.verify(ink, frames, shots)
        ink, frames, shots = self.fixtures()
        shots[0]["endSec"] = 0.05
        with self.assertRaisesRegex(ValueError,
                                    "INK_DECODED_FRAME_BELONGS_TO_DIFFERENT_SHOT"):
            self.verify(ink, frames, shots)


class PhysicalGlyphOCRReceiptJoinTests(unittest.TestCase):
    FILM = "a" * 64
    PLAN = "b" * 64

    def fixtures(self):
        shots = []
        observations = []
        decoded = []
        for i, (scene, labels) in enumerate(OCR_SOURCE_LABELS.items()):
            shots.append({"id": scene, "annotations": [
                {"role": "science", "text": label} for label in labels
            ]})
            for j, phase in enumerate(("early", "middle", "late")):
                idx = i * 50 + j * 9
                decoded.append({"shot": scene, "phase": phase, "index": idx})
                for label in labels:
                    observations.append({
                        "scene": scene, "phase": phase, "frameIndex": idx,
                        "expected": label, "recognized": label,
                        "expectedTokens": ocr_words(label),
                        "recognizedTokens": ocr_words(label),
                        "wordSequenceRecovered": True, "cropSha256": "c" * 64
                    })
        self.assertEqual(len(shots), 9)
        self.assertEqual(len(observations), 48)
        proof = {
            "schema": "ths-lane4-actual-decoded-ocr-research-v1",
            "movieSha256": self.FILM, "phonePlanSha256": self.PLAN,
            "framesPhysicallyExtracted": 27, "labelInstancesTested": 48,
            "wordSequenceRecovered": 48, "allThreePhasesLexicallyRecovered": True,
            "ocrEngineVersion": "tesseract 5.5.0",
            "observations": observations,
            "physicalHandsetApproved": False,
            "viewerComprehensionApproved": False,
            "scienceApproved": False, "filmExcellentApproved": False,
            "mayPublish": False
        }
        ink = {"schema": "ths-lane4-timed-variant-ink-probe-research-v1",
               "actualEncodedSamples": decoded}
        return proof, ink, {"shots": shots}

    def verify(self, proof, ink, plan):
        return validate_exact_film_ocr_join(
            proof, ink, plan, film_sha=self.FILM, plan_sha=self.PLAN
        )

    def test_matching_all_48_is_still_a_nonpublishing_research_join(self):
        proof, ink, plan = self.fixtures()
        report = self.verify(proof, ink, plan)
        self.assertEqual(report["observationsClaimed"], 48)
        self.assertFalse(report["ocrRerunByThisJoin"])
        self.assertFalse(report["exactPunctuationVerified"])
        self.assertFalse(report["physicalHandsetVerified"])
        self.assertFalse(report["mayPublish"])

    def test_one_wrong_pubchem_cid_fails_even_with_claimed_perfect_score(self):
        proof, ink, plan = self.fixtures()
        row = next(r for r in proof["observations"]
                   if r["expected"] == "7-OH \u2022 CID 44301524")
        row["recognized"] = "7-OH CID 3034396"
        row["recognizedTokens"] = ocr_words(row["recognized"])
        with self.assertRaisesRegex(ValueError, "GLYPH_OCR_WORDS_NOT_RECOVERED"):
            self.verify(proof, ink, plan)

    def test_missing_not_filmed_caveat_fails_even_with_claimed_perfect_score(self):
        proof, ink, plan = self.fixtures()
        row = next(r for r in proof["observations"]
                   if "Computed 3D illustration" in r["expected"])
        row["recognized"] = "Computed 3D illustration"
        row["recognizedTokens"] = ocr_words(row["recognized"])
        with self.assertRaisesRegex(ValueError, "GLYPH_OCR_WORDS_NOT_RECOVERED"):
            self.verify(proof, ink, plan)

    def test_self_forged_expected_words_cannot_change_immutable_corpus(self):
        proof, ink, plan = self.fixtures()
        row = next(r for r in proof["observations"]
                   if "CID 44301524" in r["expected"])
        row["expected"] = "7-OH CID 3034396"
        row["recognized"] = row["expected"]
        row["expectedTokens"] = ocr_words(row["expected"])
        row["recognizedTokens"] = ocr_words(row["expected"])
        with self.assertRaisesRegex(ValueError, "GLYPH_OCR_UNKNOWN_OR_DUPLICATE_LABEL"):
            self.verify(proof, ink, plan)

    def test_changed_film_or_phone_plan_hash_fails(self):
        for key in ("movieSha256", "phonePlanSha256"):
            with self.subTest(key=key):
                proof, ink, plan = self.fixtures()
                proof[key] = "d" * 64
                with self.assertRaisesRegex(ValueError, "GLYPH_OCR_DIFFERENT_FILM_OR_PLAN"):
                    self.verify(proof, ink, plan)

    def test_wrong_or_duplicate_sample_cannot_fake_three_phase_replay(self):
        proof, ink, plan = self.fixtures()
        proof["observations"][0]["frameIndex"] += 1
        with self.assertRaisesRegex(ValueError, "GLYPH_OCR_WRONG_DECODED_FRAME"):
            self.verify(proof, ink, plan)
        proof, ink, plan = self.fixtures()
        proof["observations"][0] = copy.deepcopy(proof["observations"][1])
        with self.assertRaisesRegex(ValueError, "GLYPH_OCR_UNKNOWN_OR_DUPLICATE_LABEL"):
            self.verify(proof, ink, plan)

    def test_missing_observation_or_invalid_crop_provenance_fails(self):
        proof, ink, plan = self.fixtures()
        proof["observations"].pop()
        with self.assertRaisesRegex(ValueError, "FORTY_EIGHT_REAL_OCR_ROWS_REQUIRED"):
            self.verify(proof, ink, plan)
        proof, ink, plan = self.fixtures()
        proof["observations"][0]["cropSha256"] = "garbage"
        with self.assertRaisesRegex(ValueError, "GLYPH_OCR_CROP_PROVENANCE_MISSING"):
            self.verify(proof, ink, plan)

    def test_unauthorized_publication_or_human_review_claims_rejected(self):
        for key in ("mayPublish", "physicalHandsetApproved",
                    "viewerComprehensionApproved", "scienceApproved",
                    "filmExcellentApproved"):
            with self.subTest(key=key):
                proof, ink, plan = self.fixtures()
                proof[key] = True
                with self.assertRaisesRegex(ValueError, "GLYPH_OCR_FORGED_APPROVAL"):
                    self.verify(proof, ink, plan)

    def test_missing_source_disclosure_in_plan_cannot_pass_stale_ocr(self):
        proof, ink, plan = self.fixtures()
        shot = next(s for s in plan["shots"] if s["id"] == "sentence_4")
        shot["annotations"] = [a for a in shot["annotations"]
                               if "not filmed" not in a["text"]]
        with self.assertRaisesRegex(ValueError, "GLYPH_OCR_RECORDED_SOURCE_WORDS_CHANGED"):
            self.verify(proof, ink, plan)

    def test_no_receipt_can_be_joined_without_same_film_ink_receipt(self):
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            with self.assertRaisesRegex(ValueError, "TIMED_INK_PROOF_REQUIRED_FOR_OCR_JOIN"):
                audit(root / "movie.mp4", root / "plan.json",
                      root / "output", glyph_receipt=root / "glyph.json")

    def test_glyph_receipt_alias_to_generated_file_cannot_destroy_input(self):
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            output = root / "output"
            output.mkdir()
            for name in ("research-report.json", "opening-1_5.png"):
                ink = root / "ink.json"
                ink.write_text("{}")
                source = output / name
                original = b"protected local glyph evidence"
                source.write_bytes(original)
                with self.subTest(name=name):
                    with self.assertRaisesRegex(ValueError,
                                                "ALIASES_SOURCE_INPUT"):
                        audit(root / "movie.mp4", root / "plan.json",
                              output, ink_receipt=ink, glyph_receipt=source)
                    self.assertEqual(source.read_bytes(), original)


class RepairedSameShotOCRContractTests(unittest.TestCase):
    """A new exact-film source contract, without rewriting archived v1 proof."""

    def fixtures(self):
        proof, ink, plan = PhysicalGlyphOCRReceiptJoinTests().fixtures()
        proof["schema"] = "ths-lane4-actual-decoded-ocr-research-v2"
        scene = next(s for s in plan["shots"]
                     if s["id"] == "sentence_5_part1")
        scene["annotations"] = [
            {"role": "science", "text": "STRUCTURE ≠ HUMAN EXPERIENCE"},
        ]
        for row in proof["observations"]:
            if row["scene"] == "sentence_5_part1":
                row["expected"] = "STRUCTURE ≠ HUMAN EXPERIENCE"
                row["recognized"] = "STRUCTURE ≠ HUMAN EXPERIENCE"
                row["expectedTokens"] = ocr_words(row["expected"])
                row["recognizedTokens"] = ocr_words(row["recognized"])
        return proof, ink, plan

    def verify(self, proof, ink, plan):
        return validate_exact_film_ocr_join(
            proof, ink, plan, film_sha="a" * 64, plan_sha="b" * 64)

    def test_v2_exact_source_words_then_muted_screen_remain_research_only(self):
        proof, ink, plan = self.fixtures()
        receipt = self.verify(proof, ink, plan)
        self.assertEqual(receipt["ocrContractSchema"],
                         "ths-lane4-actual-decoded-ocr-research-v2")
        self.assertEqual(receipt["observationsClaimed"], 48)
        self.assertFalse(receipt["ocrRerunByThisJoin"])
        self.assertFalse(receipt["mayPublish"])
        screen = mute_story_negative_screen(plan, proof)
        self.assertEqual(screen["verdict"],
                         "MECHANICAL_WORD_SCREEN_ONLY_REVIEW_REQUIRED")
        self.assertTrue(screen["subjectObjectAndOperatorOCRInSameCropAllThreeTimes"])
        self.assertFalse(screen["inequalitySymbolDecodedAndIndependentlyVerified"])
        self.assertFalse(screen["mayPublish"])

    def test_v2_allows_realistic_line_wrap_but_not_missing_operator(self):
        proof, ink, plan = self.fixtures()
        scene = next(s for s in plan["shots"] if s["id"] == "sentence_5_part1")
        scene["annotations"][0]["text"] = "STRUCTURE\n≠ HUMAN EXPERIENCE"
        for row in proof["observations"]:
            if row["scene"] == "sentence_5_part1":
                row["recognized"] = "STRUCTURE\n≠ HUMAN EXPERIENCE"
                row["recognizedTokens"] = ocr_words(row["recognized"])
        self.assertFalse(self.verify(proof, ink, plan)["mayPublish"])

    def test_v2_rejects_missing_operator_in_middle_decoded_crop(self):
        proof, ink, plan = self.fixtures()
        row = next(r for r in proof["observations"]
                   if r["scene"] == "sentence_5_part1" and r["phase"] == "middle")
        row["recognized"] = "STRUCTURE HUMAN EXPERIENCE"
        # Lexical word check alone is not sufficient to prove negation.
        row["recognizedTokens"] = ocr_words(row["recognized"])
        with self.assertRaisesRegex(ValueError,
                                    "GLYPH_OCR_NEGATION_OPERATOR_NOT_RECOVERED"):
            self.verify(proof, ink, plan)

    def test_v2_operator_before_subject_cannot_fake_correct_relationship(self):
        proof, ink, plan = self.fixtures()
        row = next(r for r in proof["observations"]
                   if r["scene"] == "sentence_5_part1" and r["phase"] == "early")
        row["recognized"] = "≠ STRUCTURE HUMAN EXPERIENCE"
        row["recognizedTokens"] = ocr_words(row["recognized"])
        with self.assertRaisesRegex(
            ValueError, "GLYPH_OCR_COMPLETE_NEGATION_SEQUENCE_NOT_RECOVERED"
        ):
            self.verify(proof, ink, plan)

    def test_v2_operator_between_wrong_words_cannot_fake_comparison(self):
        proof, ink, plan = self.fixtures()
        row = next(r for r in proof["observations"]
                   if r["scene"] == "sentence_5_part1" and r["phase"] == "late")
        row["recognized"] = "STRUCTURE HUMAN ≠ EXPERIENCE"
        row["recognizedTokens"] = ocr_words(row["recognized"])
        with self.assertRaisesRegex(
            ValueError, "GLYPH_OCR_COMPLETE_NEGATION_SEQUENCE_NOT_RECOVERED"
        ):
            self.verify(proof, ink, plan)

    def test_v2_rejects_metadata_only_or_split_science_annotations(self):
        proof, ink, plan = self.fixtures()
        scene = next(s for s in plan["shots"] if s["id"] == "sentence_5_part1")
        scene["annotations"] = [
            {"role": "science", "text": "STRUCTURE"},
            {"role": "science", "text": "≠ HUMAN EXPERIENCE"},
        ]
        with self.assertRaisesRegex(ValueError,
                                    "REPAIRED_NEGATION_SINGLE_SCIENCE_ANNOTATION_REQUIRED"):
            self.verify(proof, ink, plan)
        scene["annotations"] = [{"role": "science", "text": "HUMAN EXPERIENCE"}]
        with self.assertRaisesRegex(ValueError,
                                    "REPAIRED_NEGATION_SINGLE_SCIENCE_ANNOTATION_REQUIRED"):
            self.verify(proof, ink, plan)

    def test_v2_cannot_be_passed_as_old_original_ocr_contract(self):
        proof, ink, plan = self.fixtures()
        proof["schema"] = "ths-lane4-actual-decoded-ocr-research-v1"
        with self.assertRaisesRegex(ValueError,
                                    "GLYPH_OCR_RECORDED_SOURCE_WORDS_CHANGED"):
            self.verify(proof, ink, plan)

    def test_v2_does_not_let_old_split_source_pretend_to_be_repaired(self):
        proof, ink, plan = self.fixtures()
        scene = next(s for s in plan["shots"] if s["id"] == "sentence_5_part1")
        scene["annotations"][0]["text"] = "HUMAN EXPERIENCE"
        with self.assertRaisesRegex(ValueError,
                                    "REPAIRED_NEGATION_SINGLE_SCIENCE_ANNOTATION_REQUIRED"):
            self.verify(proof, ink, plan)

    def test_v2_still_rejects_changed_pubchem_identity_and_computed_caveat(self):
        proof, ink, plan = self.fixtures()
        bad = next(r for r in proof["observations"]
                   if r["expected"] == "7-OH • CID 44301524")
        bad["recognized"] = "7-OH CID 3034396"
        bad["recognizedTokens"] = ocr_words(bad["recognized"])
        with self.assertRaisesRegex(ValueError, "GLYPH_OCR_WORDS_NOT_RECOVERED"):
            self.verify(proof, ink, plan)
        proof, ink, plan = self.fixtures()
        bad = next(r for r in proof["observations"]
                   if "not filmed" in r["expected"])
        bad["recognized"] = "Computed 3D illustration"
        bad["recognizedTokens"] = ocr_words(bad["recognized"])
        with self.assertRaisesRegex(ValueError, "GLYPH_OCR_WORDS_NOT_RECOVERED"):
            self.verify(proof, ink, plan)

    def test_v2_wrong_film_and_fake_approval_still_hold(self):
        proof, ink, plan = self.fixtures()
        proof["movieSha256"] = "c" * 64
        with self.assertRaisesRegex(ValueError, "GLYPH_OCR_DIFFERENT_FILM_OR_PLAN"):
            self.verify(proof, ink, plan)
        proof, ink, plan = self.fixtures()
        proof["viewerComprehensionApproved"] = True
        with self.assertRaisesRegex(ValueError, "GLYPH_OCR_FORGED_APPROVAL"):
            self.verify(proof, ink, plan)

    def test_original_v1_still_joins_with_unchanged_split_film_corpus(self):
        proof, ink, plan = PhysicalGlyphOCRReceiptJoinTests().fixtures()
        receipt = self.verify(proof, ink, plan)
        self.assertEqual(receipt["ocrContractSchema"],
                         "ths-lane4-actual-decoded-ocr-research-v1")
        self.assertFalse(receipt["mayPublish"])
        self.assertEqual(mute_story_negative_screen(plan, proof)["verdict"], "HOLD")


class MutedStoryNegativeScreenTests(unittest.TestCase):
    def build(self):
        proof, ink, plan = PhysicalGlyphOCRReceiptJoinTests().fixtures()
        # The real original plan has a standalone ≠ and HUMAN EXPERIENCE in
        # sentence_5_part1; STRUCTURE is in prior scene, not this one.
        shot = next(s for s in plan["shots"] if s["id"] == "sentence_5_part1")
        shot["annotations"].append({"role": "science", "text": "≠"})
        return proof, plan

    def test_split_negation_is_objective_hold_despite_48_positive_glyphs(self):
        proof, plan = self.build()
        result = mute_story_negative_screen(plan, proof)
        self.assertEqual(result["verdict"], "HOLD")
        self.assertEqual(len(result["actualOCRRequiredScienceFacts"]), 4)
        self.assertTrue(all(result["actualOCRRequiredScienceFacts"].values()))
        self.assertIn("NEGATION_ANTECEDENT_SPLIT_ACROSS_CUT", result["blockingFindings"])
        self.assertIn("NO_EXACT_ENCODED_SAME_SHOT_NEGATION_OCR_PROOF",
                      result["blockingFindings"])
        self.assertFalse(result["mayPublish"])

    def test_source_metadata_only_repair_does_not_fake_encoded_full_text(self):
        proof, plan = self.build()
        part = next(s for s in plan["shots"] if s["id"] == "sentence_5_part1")
        part["annotations"].append({"role": "science", "text": "STRUCTURE"})
        result = mute_story_negative_screen(plan, proof)
        self.assertTrue(result["negationSubjectObjectAndOperatorDeclaredSameShot"])
        self.assertFalse(result["subjectAndObjectOCRWithinSameShotAllThreeTimes"])
        self.assertEqual(result["verdict"], "HOLD")

    def test_two_different_crops_do_not_prove_same_crop_sentence(self):
        proof, plan = self.build()
        target = next(s for s in plan["shots"] if s["id"] == "sentence_5_part1")
        target["annotations"].append({"role": "science", "text": "STRUCTURE"})
        # The fact that STRUCTURE is in one crop and HUMAN EXPERIENCE another
        # does not establish that a viewer reads their relationship together.
        for phase in ("early", "middle", "late"):
            proof["observations"].append({
                "scene": "sentence_5_part1", "phase": phase,
                "recognized": "STRUCTURE", "recognizedTokens": ["structure"],
                "expectedTokens": ["structure"], "expected": "STRUCTURE",
                "wordSequenceRecovered": True,
            })
        result = mute_story_negative_screen(plan, proof)
        self.assertFalse(result["subjectAndObjectOCRWithinSameShotAllThreeTimes"])
        self.assertEqual(result["verdict"], "HOLD")

    def test_full_words_without_inequality_glyph_cannot_clear_muted_story(self):
        proof, plan = self.build()
        target = next(s for s in plan["shots"] if s["id"] == "sentence_5_part1")
        target["annotations"].append({"role": "science", "text": "STRUCTURE"})
        for phase in ("early", "middle", "late"):
            words = ["structure", "human", "experience"]
            proof["observations"].append({
                "scene": "sentence_5_part1", "phase": phase,
                "recognized": "STRUCTURE HUMAN EXPERIENCE",
                "recognizedTokens": words, "expectedTokens": words,
                "expected": "STRUCTURE HUMAN EXPERIENCE",
                "wordSequenceRecovered": True,
            })
        result = mute_story_negative_screen(plan, proof)
        self.assertTrue(result["subjectAndObjectOCRWithinSameShotAllThreeTimes"])
        self.assertFalse(result["subjectObjectAndOperatorOCRInSameCropAllThreeTimes"])
        self.assertIn("NO_EXACT_ENCODED_NEGATION_OPERATOR_OCR_PROOF",
                      result["blockingFindings"])
        self.assertEqual(result["verdict"], "HOLD")
        self.assertFalse(result["mayPublish"])

    def test_inequality_glyph_missing_only_at_midpoint_is_still_hold(self):
        proof, plan = self.build()
        target = next(s for s in plan["shots"] if s["id"] == "sentence_5_part1")
        target["annotations"].append({"role": "science", "text": "STRUCTURE"})
        for phase in ("early", "middle", "late"):
            words = ["structure", "human", "experience"]
            proof["observations"].append({
                "scene": "sentence_5_part1", "phase": phase,
                "recognized": ("STRUCTURE HUMAN EXPERIENCE" if phase == "middle"
                               else "STRUCTURE ≠ HUMAN EXPERIENCE"),
                "recognizedTokens": words, "expectedTokens": words,
                "expected": "STRUCTURE HUMAN EXPERIENCE",
                "wordSequenceRecovered": True,
            })
        result = mute_story_negative_screen(plan, proof)
        self.assertTrue(result["subjectAndObjectOCRWithinSameShotAllThreeTimes"])
        self.assertFalse(result["subjectObjectAndOperatorOCRInSameCropAllThreeTimes"])
        self.assertIn("NO_EXACT_ENCODED_NEGATION_OPERATOR_OCR_PROOF",
                      result["blockingFindings"])
        self.assertEqual(result["verdict"], "HOLD")

    def test_hypothetical_same_crop_word_proof_remains_nonpublishing(self):
        proof, plan = self.build()
        target = next(s for s in plan["shots"] if s["id"] == "sentence_5_part1")
        target["annotations"].append({"role": "science", "text": "STRUCTURE"})
        for phase in ("early", "middle", "late"):
            words = ["structure", "human", "experience"]
            proof["observations"].append({
                "scene": "sentence_5_part1", "phase": phase,
                "recognized": "STRUCTURE ≠ HUMAN EXPERIENCE",
                "recognizedTokens": words,
                "expectedTokens": words,
                "expected": "STRUCTURE HUMAN EXPERIENCE",
                "wordSequenceRecovered": True,
            })
        result = mute_story_negative_screen(plan, proof)
        self.assertEqual(result["verdict"], "MECHANICAL_WORD_SCREEN_ONLY_REVIEW_REQUIRED")
        self.assertTrue(result["subjectObjectAndOperatorOCRInSameCropAllThreeTimes"])
        self.assertFalse(result["inequalitySymbolDecodedAndIndependentlyVerified"])
        self.assertFalse(result["mutedAudienceComprehensionApproved"])
        self.assertFalse(result["realHandsetPlaybackApproved"])
        self.assertFalse(result["qualifiedScienceApproved"])
        self.assertFalse(result["mayPublish"])
        # A synthetic row would not pass the separately enforced 48-label
        # full-source OCR intake; no actual film is accepted by this unit.

    def test_missing_just_one_of_three_phases_stays_on_hold(self):
        proof, plan = self.build()
        shot = next(s for s in plan["shots"] if s["id"] == "sentence_5_part1")
        shot["annotations"].append({"role": "science", "text": "STRUCTURE"})
        for phase in ("early", "middle"):
            proof["observations"].append({
                "scene": "sentence_5_part1", "phase": phase,
                "recognized": "STRUCTURE HUMAN EXPERIENCE",
                "recognizedTokens": ["structure", "human", "experience"],
                "expected": "STRUCTURE HUMAN EXPERIENCE",
                "expectedTokens": ["structure", "human", "experience"],
                "wordSequenceRecovered": True,
            })
        self.assertIn("NO_EXACT_ENCODED_SAME_SHOT_NEGATION_OCR_PROOF",
                      mute_story_negative_screen(plan, proof)["blockingFindings"])

    def test_dropped_not_filmed_copy_is_independent_science_hold(self):
        proof, plan = self.build()
        row = next(r for r in proof["observations"]
                   if r["expected"] == "Computed 3D illustration • not filmed")
        row["recognized"] = "Computed 3D illustration"
        row["recognizedTokens"] = ["computed", "3d", "illustration"]
        result = mute_story_negative_screen(plan, proof)
        self.assertIn("MISSING_MUTED_SCIENCE_FACT_COMPUTED_NOT_FILMED",
                      result["blockingFindings"])

    def test_altered_cid_digits_are_missing_source_fact(self):
        proof, plan = self.build()
        row = next(r for r in proof["observations"] if r["expected"] == "7-OH • CID 44301524")
        row["recognized"] = "7-OH CID 3034396"
        row["recognizedTokens"] = ocr_words(row["recognized"])
        result = mute_story_negative_screen(plan, proof)
        self.assertIn("MISSING_MUTED_SCIENCE_FACT_TWO_SOURCE_CIDS",
                      result["blockingFindings"])

    def test_stale_recognized_token_list_does_not_override_raw_ocr(self):
        proof, plan = self.build()
        row = next(r for r in proof["observations"] if r["expected"] == "7-OH • CID 44301524")
        row["recognized"] = "7-QH CID 3034396"
        with self.assertRaisesRegex(ValueError,
                                    "MUTED_STORY_OCR_WORDS_MUST_MATCH_ACTUAL_RECOGNIZED_TEXT"):
            mute_story_negative_screen(plan, proof)

    def test_shot_reorder_is_rejected_before_claiming_continuity(self):
        proof, plan = self.build()
        plan["shots"][5], plan["shots"][6] = plan["shots"][6], plan["shots"][5]
        with self.assertRaisesRegex(ValueError,
                                    "MUTED_STORY_EXACT_SHOT_ORDER_REQUIRED"):
            mute_story_negative_screen(plan, proof)

    def test_silent_no_reaction_copy_remains_explicit_review_advisory(self):
        proof, plan = self.build()
        plan["shots"][0]["annotations"].append(
            {"role": "science", "text": "No reaction"})
        result = mute_story_negative_screen(plan, proof)
        self.assertIn("NO_REACTION_WORDING_NEEDS_SEMANTIC_REVIEW",
                      result["advisoryFindings"])
        self.assertFalse(result["mutedAudienceComprehensionApproved"])


class ActualFilmSmoke(unittest.TestCase):
    def test_first_presented_video_frame_must_start_at_zero(self):
        # Real encoded 30fps clips; setpts advances every decoded PTS by
        # one frame without changing their regular spacing or frame count.
        # Old grid-only code falsely accepted the delayed first-frame hook.
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            for delayed in (False, True):
                with self.subTest(delayed=delayed):
                    movie = root / ("delayed.mp4" if delayed else "zero.mp4")
                    cmd = [
                        "ffmpeg", "-hide_banner", "-loglevel", "error",
                        "-nostdin", "-y", "-f", "lavfi", "-i",
                        "color=c=blue:s=540x960:r=30:d=3",
                    ]
                    if delayed:
                        cmd += ["-vf", "setpts=PTS+1/(30*TB)"]
                    cmd += ["-c:v", "libx264", "-preset", "ultrafast",
                            "-pix_fmt", "yuv420p", "-an", str(movie)]
                    subprocess.run(cmd, capture_output=True, timeout=50, check=True)
                    if delayed:
                        with self.assertRaisesRegex(
                            ValueError, "NONZERO_FIRST_DECODED_FRAME_PTS"
                        ):
                            probe_movie(movie)
                    else:
                        width, height, duration, count = probe_movie(movie)
                        self.assertEqual((width, height, count), (540, 960, 90))
                        self.assertAlmostEqual(duration, 3.0)
    def test_actual_decoded_sample_is_from_requested_hard_cut(self):
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            movie = root / "two-colors.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-f", "lavfi", "-i", "color=c=red:s=1080x1920:r=30:d=1.5",
                "-f", "lavfi", "-i", "color=c=blue:s=1080x1920:r=30:d=1.5",
                "-filter_complex", "[0:v][1:v]concat=n=2:v=1:a=0[v]",
                "-map", "[v]", "-c:v", "libx264", "-preset", "ultrafast",
                "-pix_fmt", "yuv420p", "-an", str(movie)
            ], capture_output=True, timeout=50, check=True)
            # The second cut begins on decoded frame 45, not at a guessed
            # time-seek offset. The native center pixel must be blue.
            png = root / "frame45.png"
            decoded_overlay(movie, 45, fixture()["shots"][0], png, 1080, 1920)
            pixel = subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin",
                "-i", str(png), "-vf", "crop=1:1:540:960,format=rgb24",
                "-frames:v", "1", "-f", "rawvideo", "pipe:1"
            ], capture_output=True, timeout=30, check=True).stdout
            self.assertEqual(len(pixel), 3)
            self.assertLess(pixel[0], 40, "Captured wrong red-scene video frame")
            self.assertLess(pixel[1], 40)
            self.assertGreater(pixel[2], 205, "Expected blue scene at frame 45")

    def test_encoded_video_duration_not_extended_by_aac_tail(self):
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            picture = root / "picture.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-f", "lavfi", "-i", "color=c=blue:s=1080x1920:r=30:d=3",
                "-c:v", "libx264", "-preset", "ultrafast",
                "-pix_fmt", "yuv420p", "-an", str(picture)
            ], capture_output=True, timeout=50, check=True)
            for audio_duration, accepted in ((3.045, True), (3.30, False)):
                with self.subTest(audio_duration=audio_duration):
                    movie = root / f"tail-{audio_duration}.mp4"
                    subprocess.run([
                        "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                        "-i", str(picture), "-f", "lavfi",
                        "-i", f"sine=frequency=440:sample_rate=48000:duration={audio_duration}",
                        "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                        "-c:a", "aac", str(movie)
                    ], capture_output=True, timeout=50, check=True)
                    if accepted:
                        _, _, video_duration, frames = probe_movie(movie)
                        self.assertEqual(frames, 90)
                        self.assertAlmostEqual(video_duration, 3.0, places=4)
                        m = fixture()
                        m["expectedVideoSha256"] = hashlib.sha256(movie.read_bytes()).hexdigest()
                        plan = root / "plan.json"
                        plan.write_text(json.dumps(m))
                        receipt = audit(movie, plan, root / "frames")
                        self.assertEqual(receipt["publicationVerdict"], "HOLD")
                        self.assertAlmostEqual(receipt["durationSec"], 3.0, places=4)
                        self.assertFalse(receipt["mayPublish"])
                    else:
                        with self.assertRaisesRegex(ValueError, "VIDEO_FRAME_COUNT_DURATION_MISMATCH"):
                            probe_movie(movie)

    def test_vfr_video_rejected_by_decoded_timestamp_grid(self):
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            movie = root / "vfr.mp4"
            # 30 frames at 20fps + 60 at 40fps: 90 frames/3 seconds
            # => avg_frame_rate 30/1 while *real* frame intervals differ.
            # Unlike a 30fps setpts jitter, this survives encoder timebase
            # quantization across supported hosted FFmpeg versions.
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-f", "lavfi", "-i", "color=c=blue:s=1080x1920:r=20:d=1.5",
                "-f", "lavfi", "-i", "color=c=red:s=1080x1920:r=40:d=1.5",
                "-filter_complex", "[0:v][1:v]concat=n=2:v=1:a=0[v]",
                "-map", "[v]", "-fps_mode", "vfr", "-c:v", "libx264",
                "-preset", "ultrafast", "-pix_fmt", "yuv420p", "-an", str(movie)
            ], capture_output=True, timeout=50, check=True)
            measured = json.loads(subprocess.run(
                ["ffprobe", "-v", "error", "-select_streams", "v:0",
                 "-show_entries", "stream=avg_frame_rate,nb_frames", "-of", "json",
                 str(movie)], capture_output=True, text=True, check=True).stdout)
            self.assertEqual(measured["streams"][0]["avg_frame_rate"], "30/1")
            self.assertEqual(int(measured["streams"][0]["nb_frames"]), 90)
            m = fixture()
            m["expectedVideoSha256"] = hashlib.sha256(movie.read_bytes()).hexdigest()
            plan = root / "manifest.json"
            plan.write_text(json.dumps(m))
            with self.assertRaisesRegex(ValueError, "NONCONSTANT_DECODED_FRAME_TIMING"):
                audit(movie, plan, root / "frames")

    def test_mid_audit_source_mutation_cannot_issue_valid_receipt(self):
        # A real 90-frame H264 gets decoded before a deliberate late
        # in-place change. A prior success file may never survive.
        for mutation in ("movie", "manifest"):
            with self.subTest(mutation=mutation):
                with tempfile.TemporaryDirectory() as root:
                    root = Path(root)
                    movie = root / "real.mp4"
                    subprocess.run([
                        "ffmpeg", "-hide_banner", "-loglevel", "error",
                        "-nostdin", "-y", "-f", "lavfi", "-i",
                        "color=c=blue:s=1080x1920:r=30:d=3",
                        "-c:v", "libx264", "-preset", "ultrafast",
                        "-pix_fmt", "yuv420p", "-an", str(movie)
                    ], capture_output=True, timeout=50, check=True)
                    manifest = fixture()
                    manifest["expectedVideoSha256"] = hashlib.sha256(movie.read_bytes()).hexdigest()
                    plan = root / "plan.json"
                    plan.write_text(json.dumps(manifest))
                    output = root / "frames"
                    output.mkdir()
                    (output / "research-report.json").write_text('{"prior":"stale success"}')
                    import phone_ui_audit
                    original = phone_ui_audit.decoded_overlay
                    did_change = [False]

                    def tamper_after_last_sample(*args, **kwargs):
                        original(*args, **kwargs)
                        if args[3].name == "opening-1_5.png" and not did_change[0]:
                            did_change[0] = True
                            if mutation == "movie":
                                with movie.open("ab") as stream:
                                    stream.write(b"changed-after-final-frame")
                            else:
                                plan.write_text(plan.read_text() + " ")
                    with patch("phone_ui_audit.decoded_overlay", side_effect=tamper_after_last_sample):
                        with self.assertRaisesRegex(
                            ValueError,
                            "SOURCE_" + ("VIDEO" if mutation == "movie" else "MANIFEST")
                            + "_CHANGED_DURING_AUDIT"
                        ):
                            audit(movie, plan, output)
                    self.assertTrue(did_change[0])
                    self.assertFalse((output / "research-report.json").exists())

    def test_failed_rerun_erases_prior_success_receipt(self):
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            movie = root / "smoke.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-f", "lavfi", "-i", "color=c=blue:s=1080x1920:r=30:d=3",
                "-c:v", "libx264", "-preset", "ultrafast",
                "-pix_fmt", "yuv420p", "-an", str(movie)
            ], capture_output=True, timeout=50, check=True)
            m = fixture()
            m["expectedVideoSha256"] = hashlib.sha256(movie.read_bytes()).hexdigest()
            plan = root / "plan.json"
            plan.write_text(json.dumps(m))
            output = root / "frames"
            first = audit(movie, plan, output)
            self.assertTrue((output / "research-report.json").is_file())
            m["expectedVideoSha256"] = H
            plan.write_text(json.dumps(m))
            with self.assertRaisesRegex(ValueError, "EXACT_VIDEO_SHA_MISMATCH"):
                audit(movie, plan, output)
            self.assertFalse((output / "research-report.json").exists(),
                             "Failed rerun must invalidate prior PASS metadata")

    def test_ffmpeg_generated_actual_mp4_frame_and_sha_receipts(self):
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            movie = root / "smoke.mp4"
            subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                            "-f", "lavfi", "-i", "color=c=0x223344:s=1080x1920:r=30:d=3",
                            "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
                            "-an", str(movie)], capture_output=True, timeout=50, check=True)
            m = fixture()
            m["expectedVideoSha256"] = hashlib.sha256(movie.read_bytes()).hexdigest()
            plan = root / "plan.json"
            plan.write_text(json.dumps(m))
            receipt = audit(movie, plan, root / "frames")
            self.assertEqual(receipt["publicationVerdict"], "HOLD")
            self.assertEqual(receipt["frameToShotCoverage"]["actualPresentedFramesChecked"], 90)
            self.assertEqual(receipt["frameToShotCoverage"]["framesAssignedExactlyOnce"], 90)
            self.assertEqual(receipt["decodedOverlayFrames"][0]["actualFrameIndex"], 45)
            self.assertAlmostEqual(receipt["decodedOverlayFrames"][0]["actualFramePtsSec"], 1.5, places=3)
            self.assertIn(receipt["decodedOverlayFrames"][1]["actualFrameIndex"], (7, 8))
            self.assertEqual(receipt["decodedOverlayFrames"][2]["actualFrameIndex"], 45)
            self.assertEqual(receipt["declaredTextSeparation"]["significantDeclaredTextCollisions"], 0)
            self.assertFalse(receipt["frameToShotCoverage"]["mayPublish"])
            self.assertEqual(len(receipt["decodedOverlayFrames"]), 3)
            self.assertEqual([x["timeSec"] for x in receipt["decodedOverlayFrames"] if x.get("openingHookProbe")], [.25, 1.5])
            png = root / "frames" / receipt["decodedOverlayFrames"][0]["file"]
            self.assertGreater(png.stat().st_size, 1000)
            self.assertEqual(receipt["decodedOverlayFrames"][0]["frameSha256"], hashlib.sha256(png.read_bytes()).hexdigest())
            self.assertFalse(json.loads((root / "frames" / "research-report.json").read_text())["mayPublish"])
            # The full 30fps PTS grid can be valid while an authored micro-shot
            # (1.001–1.003s) contains ZERO actual presented video frames.
            # Previous metadata-only validation falsely accepted this scene.
            opening = m["shots"][0]
            opening["endSec"] = 1.001
            m["shots"] += [
                {"id": "phantom", "startSec": 1.001, "endSec": 1.003,
                 "assetKind": "editorial",
                 "annotations": [{"role": "caption", "text": "Unshown scientific claim",
                                  "fontPx": 40, "boxPx": [100, 250, 700, 350]}]},
                {"id": "ending", "startSec": 1.003, "endSec": 3.0,
                 "assetKind": "editorial",
                 "annotations": [{"role": "caption", "text": "Closing explanation",
                                  "fontPx": 40, "boxPx": [100, 250, 700, 350]}]},
            ]
            plan.write_text(json.dumps(m))
            with self.assertRaisesRegex(ValueError, "SHOT_WITHOUT_PRESENTED_FRAME:phantom"):
                audit(movie, plan, root / "frames")
            self.assertFalse((root / "frames" / "research-report.json").exists(),
                             "No stale PASS receipt may survive a phantom-shot rejection")

if __name__ == "__main__":
    unittest.main()
