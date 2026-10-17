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
from test_mobile_delivery_guard import MobileDeliveryGuardTests  # execute real FFmpeg mobile transcode negatives in existing Lane4 CI
from test_caption_variant_review import CaptionCounterfactualTests  # hosted actual-H264 synthetic and exact-cue negative checks
from test_bottom_caption_screen import BottomCaptionScreenTests  # ensure hosted CI executes new full-frame phone-bottom negative controls
from test_phone_glyph_receipt_guard import ReceiptGuardTests  # reuse Lane4 CI entrypoint for negative-control suite
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


def create_directory_alias_for_test(alias, target, *, platform=None):
    """Exercise the real alias guard on Windows without symlink privilege.

    Native directory symlinks remain the primary case. Hosted Windows
    accounts can lack SeCreateSymbolicLinkPrivilege (WinError 1314), even
    though the equivalent NTFS directory junction can be created without it.
    Never skip the safety assertion: a fallback must resolve to the SAME
    directory or the test fails before invoking the audited operation.
    """
    if platform is None:
        platform = sys.platform
    try:
        alias.symlink_to(target, target_is_directory=True)
    except OSError as exc:
        if (platform != "win32" or
                getattr(exc, "winerror", None) not in (5, 1314)):
            raise
        subprocess.run(
            ["cmd", "/c", "mklink", "/J", str(alias), str(target)],
            capture_output=True, text=True, timeout=20, check=True)
    if not alias.is_dir() or alias.resolve() != target.resolve():
        raise AssertionError("DIRECTORY_ALIAS_SETUP_FAILED")



class StrictEvidenceJSONIntakeTests(unittest.TestCase):
    def test_duplicate_approval_in_nested_receipt_is_rejected_regardless_of_order(self):
        from phone_ui_audit import strict_json_bytes
        for values in (b'true,false', b'false,true'):
            with self.subTest(values=values):
                first, second = values.split(b',')
                text = (b'{"nested":{"mayPublish":' + first
                        + b',"mayPublish":' + second + b'}}')
                with self.assertRaisesRegex(ValueError,
                                            "DUPLICATE_EVIDENCE_JSON_KEY:mayPublish"):
                    strict_json_bytes(text)

    def test_nonfinite_json_number_is_rejected_in_nested_science_data(self):
        from phone_ui_audit import strict_json_bytes
        for token in (b'NaN', b'Infinity', b'-Infinity', b'1e999', b'-1e999'):
            with self.subTest(token=token):
                with self.assertRaisesRegex(ValueError,
                                            "NONFINITE_EVIDENCE_JSON_VALUE"):
                    strict_json_bytes(b'{"science":{"measurement":' + token + b'}}')
        self.assertEqual(strict_json_bytes(b'{"science":{"measurement":null}}'),
                         {"science": {"measurement": None}})
        self.assertEqual(strict_json_bytes(b'{"measurement":1.25e2}'),
                         {"measurement": 125.0})

    def test_ambiguous_prior_report_never_authorizes_image_deletion(self):
        from phone_ui_audit import verified_prior_review_images
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)
            original = b"unowned user image"
            (output / "00-opening.png").write_bytes(original)
            digest = hashlib.sha256(original).hexdigest()
            # Default last-wins JSON parser would accept the last false
            # permission. No ambiguous prior report may establish ownership.
            forged = (b'{"mayPublish":true,"mayPublish":false,'
                      b'"publicationVerdict":"HOLD",'
                      b'"decodedOverlayFrames":[{"file":"00-opening.png",'
                      b'"frameSha256":"' + digest.encode("ascii") + b'"}]}')
            self.assertEqual(verified_prior_review_images(output, forged), {})
            self.assertEqual((output / "00-opening.png").read_bytes(), original)

    def test_manifest_duplicate_claim_fails_without_generating_report(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = root / "source.mp4"
            movie.write_bytes(b"not required to be decoded")
            manifest = root / "manifest.json"
            manifest.write_bytes(b'{"releaseApproved":true,"releaseApproved":false}')
            output = root / "frames"
            output.mkdir()
            prior = output / "research-report.json"
            with self.assertRaisesRegex(ValueError,
                                        "DUPLICATE_EVIDENCE_JSON_KEY:releaseApproved"):
                audit(movie, manifest, output)
            self.assertFalse(prior.exists())
            self.assertEqual(movie.read_bytes(), b"not required to be decoded")

    def test_ink_duplicate_claim_fails_before_source_validation(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie, manifest, ink = (root / "movie.mp4", root / "manifest.json",
                                    root / "ink.json")
            movie.write_bytes(b"some source")
            manifest.write_bytes(b'{"status":"RESEARCH_ONLY"}')
            ink.write_bytes(b'{"mayPublish":true,"mayPublish":false}')
            with self.assertRaisesRegex(ValueError,
                                        "DUPLICATE_EVIDENCE_JSON_KEY:mayPublish"):
                audit(movie, manifest, root / "frames", ink_receipt=ink)

    def test_glyph_nonfinite_claim_fails_before_science_and_ocr_join(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie, manifest = root / "movie.mp4", root / "manifest.json"
            ink, glyph = root / "ink.json", root / "glyph.json"
            movie.write_bytes(b"unparsed film")
            manifest.write_bytes(b'{"status":"RESEARCH_ONLY"}')
            ink.write_bytes(b'{}')
            glyph.write_bytes(b'{"confidence":Infinity}')
            with patch("phone_ui_audit.validate_critical_ink_receipt_join",
                       return_value={"mayPublish": False}):
                with self.assertRaisesRegex(ValueError,
                                            "NONFINITE_EVIDENCE_JSON_VALUE"):
                    audit(movie, manifest, root / "frames",
                          ink_receipt=ink, glyph_receipt=glyph)


class DirectoryAliasSetupContract(unittest.TestCase):
    def test_windows_privilege_denial_invokes_junction_not_skip(self):
        # Control-flow test only; two following real path-alias tests must
        # exercise the actual junction on a Windows runner. Never call this
        # simulation real Windows junction or actual filesystem proof.
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target = root / "inputs"
            target.mkdir()
            alias = root / "alias"
            denied = PermissionError("symbolic-link privilege absent")
            denied.winerror = 1314
            with (patch.object(Path, "symlink_to", side_effect=denied),
                  patch("test_phone_ui_audit.subprocess.run") as mklink,
                  patch.object(Path, "is_dir", return_value=True),
                  patch.object(Path, "resolve", return_value=target)):
                create_directory_alias_for_test(alias, target, platform="win32")
            self.assertEqual(
                mklink.call_args.args[0],
                ["cmd", "/c", "mklink", "/J", str(alias), str(target)])
            self.assertTrue(mklink.call_args.kwargs["check"])

    def test_unrelated_symlink_error_is_not_bypassed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target = root / "inputs"
            target.mkdir()
            alias = root / "alias"
            error = OSError("not a permission denial")
            with (patch.object(Path, "symlink_to", side_effect=error),
                  patch("test_phone_ui_audit.subprocess.run") as mklink):
                with self.assertRaisesRegex(OSError, "not a permission denial"):
                    create_directory_alias_for_test(alias, target, platform="win32")
            mklink.assert_not_called()


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
            create_directory_alias_for_test(root / "review-link", source_dir)
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
            create_directory_alias_for_test(root / "output-alias", source_dir)
            movie = root / "movie.mp4"
            movie.write_bytes(b"movie")
            with self.assertRaisesRegex(ValueError, "REPORT_OUTPUT_ALIASES_SOURCE_INPUT"):
                audit(movie, plan, root / "output-alias")
            self.assertEqual(plan.read_bytes(), original)


class ReviewImageOwnershipSafety(unittest.TestCase):
    @staticmethod
    def sample_native_prior_receipt(rows):
        # Synthetic structural test data, not an actual encoded film verdict.
        return {
            "status": "OVERLAY_PREFLIGHT_PASS_REVIEW_REQUIRED",
            "mayPublish": False, "publicationVerdict": "HOLD",
            "videoSha256": H, "manifestSha256": H,
            "videoResolution": [1080, 1920], "decodedFrameCount": 90,
            "exact30FpsTimestampGridVerified": True,
            "frameToShotCoverage": {
                "actualPresentedFramesChecked": 90,
                "framesAssignedExactlyOnce": 90, "mayPublish": False,
            },
            "completeEncodedMediaDecode": {
                "allMappedStreamsDecodedWithoutFatalErrors": True,
                "mayPublish": False,
            },
            "decodedOverlayFrames": rows,
        }

    def test_hold_shaped_foreign_report_cannot_claim_image_ownership(self):
        from phone_ui_audit import verified_prior_review_images
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            output = root / "review"
            output.mkdir()
            saved_photo = output / "00-opening.png"
            original = b"unrelated file whose name resembles a screenshot"
            saved_photo.write_bytes(original)
            foreign = {
                "mayPublish": False, "publicationVerdict": "HOLD",
                "decodedOverlayFrames": [{"file": "00-opening.png",
                    "frameSha256": hashlib.sha256(original).hexdigest()}],
            }
            report = output / "research-report.json"
            report.write_text(json.dumps(foreign))
            self.assertEqual(verified_prior_review_images(
                output, report.read_bytes()), {})
            film = root / "film.mp4"
            film.write_bytes(b"unchanged film")
            manifest = root / "manifest.json"
            manifest.write_bytes(b"{}")
            with self.assertRaisesRegex(ValueError, "UNOWNED_PREVIOUS_REVIEW_REPORT"):
                audit(film, manifest, output)
            self.assertEqual(report.read_text(), json.dumps(foreign))
            self.assertEqual(saved_photo.read_bytes(), original)

    def test_hold_shaped_prior_report_without_decode_proof_is_not_owned(self):
        from phone_ui_audit import verified_prior_review_images
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)
            old = b"foreign image"
            (output / "00-opening.png").write_bytes(old)
            previous = self.sample_native_prior_receipt([{
                "file": "00-opening.png",
                "frameSha256": hashlib.sha256(old).hexdigest()}])
            previous["completeEncodedMediaDecode"]["allMappedStreamsDecodedWithoutFatalErrors"] = False
            self.assertEqual(verified_prior_review_images(
                output, json.dumps(previous).encode("utf-8")), {})
            self.assertEqual((output / "00-opening.png").read_bytes(), old)

    def test_foreign_prior_report_is_preserved_before_any_media_operation(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = root / "source.mp4"
            movie.write_bytes(b"media remains unchanged")
            plan = root / "plan.json"
            plan.write_bytes(b"{}")
            output = root / "review"
            output.mkdir()
            report = output / "research-report.json"
            foreign = b'{"ownedBy":"unrelated writer","mayPublish":false}'
            report.write_bytes(foreign)
            with self.assertRaisesRegex(ValueError, "UNOWNED_PREVIOUS_REVIEW_REPORT"):
                audit(movie, plan, output)
            self.assertEqual(report.read_bytes(), foreign)
            self.assertEqual(movie.read_bytes(), b"media remains unchanged")
            self.assertFalse(list(output.glob("*.png")))

    def test_foreign_prior_report_symlink_is_preserved(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = root / "source.mp4"
            movie.write_bytes(b"untouched movie")
            plan = root / "plan.json"
            plan.write_bytes(b"{}")
            output = root / "review"
            output.mkdir()
            foreign = root / "personal-report.json"
            original = b'{"memo":"not an EvidenceMotion receipt"}'
            foreign.write_bytes(original)
            alias = output / "research-report.json"
            alias.symlink_to(foreign)
            with self.assertRaisesRegex(ValueError, "UNOWNED_PREVIOUS_REVIEW_REPORT"):
                audit(movie, plan, output)
            self.assertTrue(alias.is_symlink())
            self.assertEqual(alias.resolve(), foreign.resolve())
            self.assertEqual(foreign.read_bytes(), original)

    def test_unowned_pattern_matching_png_is_never_deleted(self):
        from phone_ui_audit import verified_prior_review_images, commit_decoded_review_images
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            output, stage = root / "out", root / "stage"
            output.mkdir()
            stage.mkdir()
            stranger = output / "03-private-photo.png"
            stranger.write_bytes(b"not generated by phone audit")
            (stage / "00-opening.png").write_bytes(b"decoded new image")
            owned = verified_prior_review_images(output, None)
            commit_decoded_review_images(
                output, stage, [{"file": "00-opening.png",
                                "frameSha256": hashlib.sha256(b"decoded new image").hexdigest()}], owned)
            self.assertEqual(stranger.read_bytes(), b"not generated by phone audit")
            self.assertEqual((output / "00-opening.png").read_bytes(), b"decoded new image")

    def test_unowned_same_name_cannot_be_overwritten(self):
        from phone_ui_audit import verified_prior_review_images, commit_decoded_review_images
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            output, stage = root / "out", root / "stage"
            output.mkdir()
            stage.mkdir()
            original = b"user image, not a phone audit screenshot"
            (output / "00-opening.png").write_bytes(original)
            (stage / "00-opening.png").write_bytes(b"new")
            owned = verified_prior_review_images(output, None)
            with self.assertRaisesRegex(ValueError, "UNOWNED_REVIEW_IMAGE_COLLISION"):
                commit_decoded_review_images(output, stage, [{"file": "00-opening.png",
                                "frameSha256": hashlib.sha256(b"new").hexdigest()}], owned)
            self.assertEqual((output / "00-opening.png").read_bytes(), original)

    def test_hashed_previous_review_can_be_replaced_without_erasing_other_pngs(self):
        from phone_ui_audit import verified_prior_review_images, commit_decoded_review_images
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            output, stage = root / "out", root / "stage"
            output.mkdir()
            stage.mkdir()
            old = b"old approved-for-cleanup image"
            (output / "00-opening.png").write_bytes(old)
            (output / "03-private-photo.png").write_bytes(b"third party")
            previous = self.sample_native_prior_receipt([{
                "file": "00-opening.png",
                "frameSha256": hashlib.sha256(old).hexdigest()}])
            owned = verified_prior_review_images(
                output, json.dumps(previous).encode("utf-8"))
            self.assertEqual(set(owned), {"00-opening.png"})
            (stage / "00-opening.png").write_bytes(b"new proof")
            (stage / "opening-0_25.png").write_bytes(b"new hook proof")
            commit_decoded_review_images(
                output, stage, [
                    {"file": "00-opening.png", "frameSha256": hashlib.sha256(b"new proof").hexdigest()},
                    {"file": "opening-0_25.png", "frameSha256": hashlib.sha256(b"new hook proof").hexdigest()}],
                owned)
            self.assertEqual((output / "00-opening.png").read_bytes(), b"new proof")
            self.assertEqual((output / "opening-0_25.png").read_bytes(), b"new hook proof")
            self.assertEqual((output / "03-private-photo.png").read_bytes(), b"third party")

    def test_tampered_previous_image_revokes_cleaning_authority(self):
        from phone_ui_audit import verified_prior_review_images, commit_decoded_review_images
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            output, stage = root / "out", root / "stage"
            output.mkdir()
            stage.mkdir()
            old = b"older generated image"
            path = output / "00-opening.png"
            path.write_bytes(old)
            previous = self.sample_native_prior_receipt([{
                "file": "00-opening.png",
                "frameSha256": hashlib.sha256(old).hexdigest()}])
            owned = verified_prior_review_images(
                output, json.dumps(previous).encode("utf-8"))
            path.write_bytes(b"externally modified after inventory")
            (stage / "00-opening.png").write_bytes(b"replacement")
            with self.assertRaisesRegex(
                ValueError, "PREVIOUS_REVIEW_IMAGE_CHANGED_BEFORE_REPLACEMENT"
            ):
                commit_decoded_review_images(output, stage, [{"file": "00-opening.png",
                                "frameSha256": hashlib.sha256(b"replacement").hexdigest()}], owned)
            self.assertEqual(path.read_bytes(), b"externally modified after inventory")

    def test_forged_unsafe_previous_report_cannot_grant_cleanup_authority(self):
        from phone_ui_audit import verified_prior_review_images
        with tempfile.TemporaryDirectory() as root:
            output = Path(root)
            source = b"arbitrary person image"
            (output / "01-personal.png").write_bytes(source)
            receipt = {
                "mayPublish": True, "publicationVerdict": "PASS",
                "decodedOverlayFrames": [{"file": "01-personal.png",
                    "frameSha256": hashlib.sha256(source).hexdigest()}],
            }
            self.assertEqual(verified_prior_review_images(
                output, json.dumps(receipt).encode("utf-8")), {})


    def test_missing_staged_digest_fails_before_existing_review_is_erased(self):
        from phone_ui_audit import commit_decoded_review_images
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            output, stage = root / "out", root / "stage"
            output.mkdir()
            stage.mkdir()
            existing = output / "00-opening.png"
            existing.write_bytes(b"existing screenshot")
            (stage / "00-opening.png").write_bytes(b"new screenshot")
            with self.assertRaisesRegex(ValueError, "MISSING_GENERATED_IMAGE_DIGEST"):
                commit_decoded_review_images(
                    output, stage, [{"file": "00-opening.png"}],
                    {"00-opening.png": hashlib.sha256(b"existing screenshot").hexdigest()})
            self.assertEqual(existing.read_bytes(), b"existing screenshot")

    def test_modified_staged_bytes_hold_without_deleting_previous_owned_image(self):
        from phone_ui_audit import commit_decoded_review_images
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            output, stage = root / "out", root / "stage"
            output.mkdir()
            stage.mkdir()
            existing = output / "00-opening.png"
            existing.write_bytes(b"existing screenshot")
            (stage / "00-opening.png").write_bytes(b"tampered image")
            with self.assertRaisesRegex(ValueError, "STAGED_REVIEW_IMAGE_HASH_MISMATCH"):
                commit_decoded_review_images(
                    output, stage, [{"file": "00-opening.png",
                                    "frameSha256": hashlib.sha256(b"original staged image").hexdigest()}],
                    {"00-opening.png": hashlib.sha256(b"existing screenshot").hexdigest()})
            self.assertEqual(existing.read_bytes(), b"existing screenshot")

    def test_late_unowned_image_collision_is_preserved_not_overwritten(self):
        from phone_ui_audit import commit_decoded_review_images
        import os
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            output, stage = root / "out", root / "stage"
            output.mkdir()
            stage.mkdir()
            (stage / "00-opening.png").write_bytes(b"staged author-owned screenshot")
            foreign = b"another process's unrelated screenshot"
            real_link = os.link
            triggered = [False]

            def race_create_foreign(source, destination):
                dest = Path(destination)
                if dest.name == "00-opening.png" and not triggered[0]:
                    triggered[0] = True
                    dest.write_bytes(foreign)
                return real_link(source, destination)

            with patch("phone_ui_audit.os.link", side_effect=race_create_foreign):
                with self.assertRaisesRegex(
                    ValueError, "UNOWNED_REVIEW_IMAGE_COLLISION_AT_COMMIT"
                ):
                    commit_decoded_review_images(
                        output, stage,
                        [{"file": "00-opening.png",
                          "frameSha256": hashlib.sha256(
                              b"staged author-owned screenshot").hexdigest()}],
                        {})
            self.assertTrue(triggered[0])
            self.assertEqual((output / "00-opening.png").read_bytes(), foreign)
            self.assertFalse((output / "research-report.json").exists())

    def test_changed_committed_bytes_fail_before_report_can_be_published(self):
        from phone_ui_audit import commit_decoded_review_images
        import os
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            output, stage = root / "out", root / "stage"
            output.mkdir()
            stage.mkdir()
            (stage / "00-opening.png").write_bytes(b"exact source screenshot")
            real_link = os.link

            def corrupt_transfer(source, destination):
                real_link(source, destination)
                Path(destination).write_bytes(b"changed after link")

            with patch("phone_ui_audit.os.link", side_effect=corrupt_transfer):
                with self.assertRaisesRegex(ValueError, "COMMITTED_REVIEW_IMAGE_HASH_MISMATCH"):
                    commit_decoded_review_images(
                        output, stage, [{"file": "00-opening.png",
                                        "frameSha256": hashlib.sha256(b"exact source screenshot").hexdigest()}],
                        {})
            self.assertEqual((output / "00-opening.png").read_bytes(), b"changed after link")
            self.assertFalse((output / "research-report.json").exists())


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

    def test_failed_new_variant_join_cannot_generate_report(self):
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

    def test_full_audit_rejects_misassigned_ink_without_writing_report(self):
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
            self.assertFalse(report.exists(), "rejected ink must not generate an audit receipt")
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

    def test_misplaced_operator_in_one_crop_is_a_muted_story_hold(self):
        # This standalone guard previously returned a false mechanical
        # green for an inequality before STRUCTURE or after EXPERIENCE,
        # even though those tokens and the ≠ glyph were all present.
        for malformed in ("≠ STRUCTURE HUMAN EXPERIENCE",
                          "STRUCTURE HUMAN ≠ EXPERIENCE",
                          "STRUCTURE HUMAN EXPERIENCE ≠"):
            with self.subTest(malformed=malformed):
                proof, plan = self.build()
                target = next(s for s in plan["shots"]
                              if s["id"] == "sentence_5_part1")
                target["annotations"].append(
                    {"role": "science", "text": "STRUCTURE"})
                for phase in ("early", "middle", "late"):
                    words = ["structure", "human", "experience"]
                    proof["observations"].append({
                        "scene": "sentence_5_part1", "phase": phase,
                        "recognized": malformed,
                        "recognizedTokens": words,
                        "expectedTokens": words,
                        "expected": "STRUCTURE HUMAN EXPERIENCE",
                        "wordSequenceRecovered": True,
                    })
                screen = mute_story_negative_screen(plan, proof)
                self.assertTrue(screen["subjectAndObjectOCRWithinSameShotAllThreeTimes"])
                self.assertFalse(screen["subjectObjectAndOperatorOCRInSameCropAllThreeTimes"])
                self.assertIn("NO_EXACT_ENCODED_NEGATION_OPERATOR_OCR_PROOF",
                              screen["blockingFindings"])
                self.assertEqual(screen["verdict"], "HOLD")
                self.assertFalse(screen["mayPublish"])

    def test_linewrapped_correctly_ordered_operator_remains_nonpublishing(self):
        proof, plan = self.build()
        target = next(s for s in plan["shots"] if s["id"] == "sentence_5_part1")
        target["annotations"].append({"role": "science", "text": "STRUCTURE"})
        for phase in ("early", "middle", "late"):
            proof["observations"].append({
                "scene": "sentence_5_part1", "phase": phase,
                "recognized": "STRUCTURE\n≠ HUMAN EXPERIENCE",
                "recognizedTokens": ["structure", "human", "experience"],
                "expectedTokens": ["structure", "human", "experience"],
                "expected": "STRUCTURE HUMAN EXPERIENCE",
                "wordSequenceRecovered": True,
            })
        result = mute_story_negative_screen(plan, proof)
        self.assertEqual(result["verdict"], "MECHANICAL_WORD_SCREEN_ONLY_REVIEW_REQUIRED")
        self.assertTrue(result["subjectObjectAndOperatorOCRInSameCropAllThreeTimes"])
        self.assertFalse(result["mayPublish"])

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




class TargetedEncodedRightUiInkTests(unittest.TestCase):
    """Real H.264 pixel samples, NOT an OCR or physical-device endorsement."""

    @staticmethod
    def physical_caption_proxy(root, *, overflows):
        movie = root / ("overflow.mp4" if overflows else "inside.mp4")
        # Deliberately synthetic bright rectangular proxy, not the 7-OH film.
        # The actual revised-film ROI is separately replayed with source SHA.
        x, width = (800, 220) if overflows else (730, 100)
        subprocess.run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
            "-f", "lavfi", "-i", "color=c=black:s=1080x1920:r=30:d=1",
            "-vf", f"drawbox=x={x}:y=840:w={width}:h=35:color=white:t=fill",
            "-c:v", "libx264", "-preset", "ultrafast",
            "-pix_fmt", "yuv420p", "-an", str(movie),
        ], capture_output=True, timeout=50, check=True)
        return movie

    def test_actual_h264_right_ui_bright_caption_proxy_is_explicit_hold(self):
        from phone_ui_audit import screen_targeted_encoded_right_ui_ink
        with tempfile.TemporaryDirectory() as directory:
            movie = self.physical_caption_proxy(Path(directory), overflows=True)
            sha = hashlib.sha256(movie.read_bytes()).hexdigest()
            with self.assertRaisesRegex(
                ValueError, "TARGETED_CRITICAL_INK_RIGHT_UI_EXCLUSION:5:"
            ):
                screen_targeted_encoded_right_ui_ink(
                    movie, expected_film_sha=sha, frame_indices=[5, 15, 25],
                    roi=[720, 830, 1080, 880])

    def test_actual_h264_inside_zone_is_only_a_nonpublishing_negative_screen(self):
        from phone_ui_audit import screen_targeted_encoded_right_ui_ink
        with tempfile.TemporaryDirectory() as directory:
            movie = self.physical_caption_proxy(Path(directory), overflows=False)
            sha = hashlib.sha256(movie.read_bytes()).hexdigest()
            screen = screen_targeted_encoded_right_ui_ink(
                movie, expected_film_sha=sha, frame_indices=[5, 15, 25],
                roi=[720, 830, 1080, 880])
            self.assertEqual(len(screen["actualDecodedPixelObservations"]), 3)
            self.assertTrue(all(
                row["brightNeutralPixelsInRightExclusion"] == 0
                for row in screen["actualDecodedPixelObservations"]))
            self.assertFalse(screen["viewerReadabilityVerified"])
            self.assertFalse(screen["targetTextSemanticsVerified"])
            self.assertFalse(screen["mayPublish"])

    def test_actual_h264_brief_caption_flash_between_sparse_samples_fails_full_scan(self):
        from phone_ui_audit import screen_targeted_encoded_right_ui_ink
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = root / "brief_encoded_ui_intrusion.mp4"
            # Physically encode only frames 10-12 with a bright unsafe caption
            # proxy; three spaced frames 5/15/25 are clean. This proves that
            # an earlier 3-phase research screen cannot establish temporal
            # continuity or reject short intervening hazards.
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-f", "lavfi", "-i", "color=c=black:s=1080x1920:r=30:d=1",
                "-vf", "drawbox=x=800:y=840:w=220:h=35:color=white:t=fill:"
                       "enable='between(n,10,12)'",
                "-c:v", "libx264", "-preset", "ultrafast",
                "-pix_fmt", "yuv420p", "-an", str(movie),
            ], capture_output=True, timeout=50, check=True)
            args = {"expected_film_sha": hashlib.sha256(movie.read_bytes()).hexdigest(),
                    "roi": [720, 830, 1080, 880]}
            sparse = screen_targeted_encoded_right_ui_ink(
                movie, frame_indices=[5, 15, 25], **args)
            self.assertEqual(sparse["decodedFramesExamined"], 3)
            self.assertFalse(sparse["everyFrameInRequestedWindowChecked"])
            self.assertFalse(sparse["mayPublish"])
            with self.assertRaisesRegex(
                ValueError, "TARGETED_CRITICAL_INK_RIGHT_UI_EXCLUSION:10:"
            ):
                screen_targeted_encoded_right_ui_ink(
                    movie, frame_indices=list(range(5, 26)), **args)

    def test_contiguous_review_window_rejects_silent_omission(self):
        from phone_ui_audit import screen_targeted_encoded_right_ui_ink
        with tempfile.TemporaryDirectory() as directory:
            movie = self.physical_caption_proxy(Path(directory), overflows=False)
            args = {
                "expected_film_sha": hashlib.sha256(movie.read_bytes()).hexdigest(),
                "roi": [720, 830, 1080, 880],
            }
            full = screen_targeted_encoded_right_ui_ink(
                movie, frame_indices=list(range(5, 26)), **args)
            self.assertEqual(full["decodedFramesExamined"], 21)
            self.assertTrue(full["everyFrameInRequestedWindowChecked"])
            self.assertEqual([x["decodedFrameIndex"] for x in
                              full["actualDecodedPixelObservations"]],
                             list(range(5, 26)))
            self.assertFalse(full["viewerReadabilityVerified"])
            self.assertFalse(full["mayPublish"])
            with self.assertRaisesRegex(ValueError,
                                        "TARGETED_UI_PROBE_FULL_WINDOW_MUST_BE_CONTIGUOUS"):
                screen_targeted_encoded_right_ui_ink(
                    movie, frame_indices=[5, 6, 8, 9], **args)

    @staticmethod
    def physical_exact_edge_marker(root, x):
        # High-fidelity mobile-supported native YUV420P H264 at QP 1:
        # QP 0 would switch x264 into High 4:4:4 Predictive profile even
        # with yuv420p and correctly fail our mobile profile preflight.
        # Single-pixel edge distinguishes safe x=863 from unsafe x=864.
        movie = root / f"single_native_column_{x}.mp4"
        subprocess.run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
            "-f", "lavfi", "-i", "color=c=black:s=1080x1920:r=30:d=0.2",
            "-vf", f"drawbox=x={x}:y=840:w=1:h=35:color=white:t=fill",
            "-c:v", "libx264", "-preset", "ultrafast", "-qp", "1",
            "-pix_fmt", "yuv420p", "-an", str(movie),
        ], capture_output=True, timeout=50, check=True)
        return movie

    def test_odd_native_crop_does_not_move_safe_x863_into_right_exclusion(self):
        from phone_ui_audit import screen_targeted_encoded_right_ui_ink
        with tempfile.TemporaryDirectory() as directory:
            movie = self.physical_exact_edge_marker(Path(directory), 863)
            receipt = screen_targeted_encoded_right_ui_ink(
                movie,
                expected_film_sha=hashlib.sha256(movie.read_bytes()).hexdigest(),
                frame_indices=[0, 2, 5], roi=[861, 830, 961, 880])
            self.assertTrue(all(
                row["brightNeutralPixelsInRightExclusion"] == 0
                for row in receipt["actualDecodedPixelObservations"]))
            self.assertFalse(receipt["mayPublish"])

    def test_odd_native_crop_still_detects_real_unsafe_x864_pixel(self):
        from phone_ui_audit import screen_targeted_encoded_right_ui_ink
        with tempfile.TemporaryDirectory() as directory:
            movie = self.physical_exact_edge_marker(Path(directory), 864)
            with self.assertRaisesRegex(
                ValueError, "TARGETED_CRITICAL_INK_RIGHT_UI_EXCLUSION:0:"
            ):
                screen_targeted_encoded_right_ui_ink(
                    movie,
                    expected_film_sha=hashlib.sha256(movie.read_bytes()).hexdigest(),
                    frame_indices=[0, 2, 5], roi=[861, 830, 961, 880])

    @staticmethod
    def physical_colored_science_proxy(root, *, unsafe):
        movie = root / ("science_colored_unsafe.mp4" if unsafe
                        else "science_colored_safe.mp4")
        # One clearly identified, colored science-art proxy against a black
        # panel. It is NOT a molecular identity or legibility test.
        x = 900 if unsafe else 770
        subprocess.run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
            "-f", "lavfi", "-i", "color=c=black:s=1080x1920:r=30:d=1",
            "-vf", f"drawbox=x={x}:y=840:w=24:h=28:color=red:t=fill",
            "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt",
            "yuv420p", "-an", str(movie)
        ], capture_output=True, timeout=50, check=True)
        return movie

    def test_physical_colored_science_art_in_right_ui_is_hold(self):
        from phone_ui_audit import screen_targeted_encoded_right_ui_ink
        with tempfile.TemporaryDirectory() as directory:
            movie = self.physical_colored_science_proxy(
                Path(directory), unsafe=True)
            with self.assertRaisesRegex(
                    ValueError, "TARGETED_CRITICAL_ART_RIGHT_UI_EXCLUSION:5:"):
                screen_targeted_encoded_right_ui_ink(
                    movie,
                    expected_film_sha=hashlib.sha256(movie.read_bytes()).hexdigest(),
                    frame_indices=[5, 15, 25], roi=[720, 830, 1080, 880],
                    pixel_mode="scientific_visual_highlights")

    def test_physical_colored_art_inside_safe_area_is_research_only(self):
        from phone_ui_audit import screen_targeted_encoded_right_ui_ink
        with tempfile.TemporaryDirectory() as directory:
            movie = self.physical_colored_science_proxy(
                Path(directory), unsafe=False)
            args = {
                "expected_film_sha": hashlib.sha256(movie.read_bytes()).hexdigest(),
                "frame_indices": [5, 15, 25],
                "roi": [720, 830, 1080, 880],
            }
            receipt = screen_targeted_encoded_right_ui_ink(
                movie, **args, pixel_mode="scientific_visual_highlights")
            self.assertTrue(all(row["targetPixelsInRightExclusion"] == 0
                                for row in receipt["actualDecodedPixelObservations"]))
            self.assertFalse(receipt["mayPublish"])
            self.assertFalse(receipt["scientificVisualContentIndependentlyIdentified"])
            # A non-neutral colored object MUST not be silently reclassified
            # as valid critical white text, and invalid modes fail closed.
            with self.assertRaisesRegex(ValueError,
                                        "TARGETED_UI_PROBE_EXPLICIT_SUPPORTED_PIXEL_MODE_REQUIRED"):
                screen_targeted_encoded_right_ui_ink(
                    movie, **args, pixel_mode="anything-goes")

    @staticmethod
    def run_targeted_cli(movie, *, sha, first=5, last=25, kind="bright_neutral_caption",
                         extras=()):
        return subprocess.run([
            sys.executable, str(Path(__file__).with_name("phone_ui_audit.py")),
            "--targeted-right-ui-screen", "--movie", str(movie),
            "--expected-video-sha256", sha,
            "--start-frame", str(first), "--end-frame", str(last),
            "--roi", "720", "830", "1080", "880",
            "--pixel-mode", kind, *extras,
        ], capture_output=True, text=True, timeout=90)

    def test_cli_readonly_21_frame_actual_h264_science_art_overlap_holds(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = self.physical_colored_science_proxy(root, unsafe=True)
            sha = hashlib.sha256(movie.read_bytes()).hexdigest()
            before = sorted(p.name for p in root.iterdir())
            result = self.run_targeted_cli(
                movie, sha=sha, kind="scientific_visual_highlights")
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("TARGETED_CRITICAL_ART_RIGHT_UI_EXCLUSION", result.stderr)
            self.assertEqual(hashlib.sha256(movie.read_bytes()).hexdigest(), sha)
            self.assertEqual(sorted(p.name for p in root.iterdir()), before)

    def test_cli_readonly_21_frame_actual_h264_safe_control_stays_review_required(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = self.physical_colored_science_proxy(root, unsafe=False)
            sha = hashlib.sha256(movie.read_bytes()).hexdigest()
            result = self.run_targeted_cli(
                movie, sha=sha, kind="scientific_visual_highlights")
            self.assertEqual(result.returncode, 0, result.stderr)
            data = json.loads(result.stdout)
            self.assertEqual(data["decodedFramesExamined"], 21)
            self.assertTrue(data["everyFrameInRequestedWindowChecked"])
            self.assertFalse(data["mayPublish"])
            self.assertFalse(data["viewerReadabilityVerified"])
            self.assertEqual(sorted(p.name for p in root.iterdir()), [movie.name])

    def test_cli_requires_exact_sha_and_no_mixed_manifest_or_sparse_window(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = self.physical_colored_science_proxy(root, unsafe=False)
            sha = hashlib.sha256(movie.read_bytes()).hexdigest()
            for overrides, expected in [
                ({"sha": H}, "TARGETED_UI_PROBE_EXACT_FILM_SHA_MISMATCH"),
                ({"first": 5, "last": 7},
                 "TARGETED_UI_SCREEN_COMPLETE_BOUNDED_INPUT_REQUIRED"),
                ({"extras": ("--manifest", "other.json")},
                 "TARGETED_UI_SCREEN_MUST_NOT_MIX_FULL_AUDIT_FILES"),
                ({"extras": ("--output", "frames")},
                 "TARGETED_UI_SCREEN_MUST_NOT_MIX_FULL_AUDIT_FILES"),
            ]:
                with self.subTest(overrides=overrides):
                    result = self.run_targeted_cli(
                        movie, **{**{"sha": sha}, **overrides})
                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn(expected, result.stderr)
                    self.assertFalse((root / "frames").exists())
            self.assertEqual(hashlib.sha256(movie.read_bytes()).hexdigest(), sha)

    def test_cli_full_diagnostic_json_returns_all_unsafe_frames_and_exits_nonzero(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = self.physical_caption_proxy(root, overflows=True)
            sha = hashlib.sha256(movie.read_bytes()).hexdigest()
            result = self.run_targeted_cli(
                movie, sha=sha, extras=("--diagnostic-json",))
            self.assertEqual(result.returncode, 2, result.stderr)
            receipt = json.loads(result.stdout)
            self.assertEqual(receipt["publicationVerdict"], "HOLD")
            self.assertFalse(receipt["mayPublish"])
            self.assertEqual(receipt["decodedFramesExamined"], 21)
            self.assertTrue(receipt["everyFrameInRequestedWindowChecked"])
            self.assertEqual(receipt["violatingFrameCount"], 21)
            self.assertEqual(receipt["firstViolatingFrameIndex"], 5)
            self.assertEqual(receipt["lastViolatingFrameIndex"], 25)
            self.assertGreater(receipt["maxViolatingPixelCount"], 0)
            self.assertEqual(len(receipt["actualDecodedPixelObservations"]), 21)
            self.assertEqual(hashlib.sha256(movie.read_bytes()).hexdigest(), sha)
            self.assertEqual(sorted(p.name for p in root.iterdir()), [movie.name])
            # The ordinary strict caller must STILL raise, not return a
            # green-seeming result because diagnostics were introduced.
            from phone_ui_audit import screen_targeted_encoded_right_ui_ink
            with self.assertRaisesRegex(
                ValueError, "TARGETED_CRITICAL_INK_RIGHT_UI_EXCLUSION:5:"
            ):
                screen_targeted_encoded_right_ui_ink(
                    movie, expected_film_sha=sha,
                    frame_indices=list(range(5, 26)), roi=[720, 830, 1080, 880])

    def test_cli_full_diagnostic_json_zero_ink_is_nonpublishing_and_no_write(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = self.physical_caption_proxy(root, overflows=False)
            sha = hashlib.sha256(movie.read_bytes()).hexdigest()
            result = self.run_targeted_cli(
                movie, sha=sha, extras=("--diagnostic-json",))
            self.assertEqual(result.returncode, 0, result.stderr)
            receipt = json.loads(result.stdout)
            self.assertEqual(receipt["violationCode"], None)
            self.assertEqual(receipt["violatingFrameCount"], 0)
            self.assertEqual(receipt["maxViolatingPixelCount"], 0)
            self.assertEqual(receipt["publicationVerdict"], "HOLD")
            self.assertFalse(receipt["mayPublish"])
            self.assertFalse(receipt["viewerReadabilityVerified"])
            self.assertEqual(sorted(p.name for p in root.iterdir()), [movie.name])

    def test_cli_diagnostic_json_cannot_skip_exact_video_input_or_mix_full_audit(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = self.physical_caption_proxy(root, overflows=False)
            sha = hashlib.sha256(movie.read_bytes()).hexdigest()
            result = self.run_targeted_cli(
                movie, sha=H, extras=("--diagnostic-json",))
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("TARGETED_UI_PROBE_EXACT_FILM_SHA_MISMATCH", result.stderr)
            self.assertFalse(result.stdout.strip())
            result = self.run_targeted_cli(
                movie, sha=sha,
                extras=("--diagnostic-json", "--manifest", "foreign.json"))
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("TARGETED_UI_SCREEN_MUST_NOT_MIX_FULL_AUDIT_FILES", result.stderr)
            self.assertEqual(sorted(p.name for p in root.iterdir()), [movie.name])

    def test_wrong_movie_identity_and_fake_sample_and_roi_are_rejected(self):
        from phone_ui_audit import screen_targeted_encoded_right_ui_ink
        with tempfile.TemporaryDirectory() as directory:
            movie = self.physical_caption_proxy(Path(directory), overflows=True)
            sha = hashlib.sha256(movie.read_bytes()).hexdigest()
            kwargs = {"expected_film_sha": sha,
                      "frame_indices": [5, 15, 25],
                      "roi": [720, 830, 1080, 880]}
            with self.assertRaisesRegex(ValueError, "TARGETED_UI_PROBE_EXACT_FILM_SHA_MISMATCH"):
                screen_targeted_encoded_right_ui_ink(
                    movie, **{**kwargs, "expected_film_sha": H})
            for indices in ([5, 5, 25], [5, True, 25], [5, 15, 9999]):
                with self.subTest(indices=indices), self.assertRaisesRegex(
                    ValueError, "TARGETED_UI_PROBE_BOUNDED_DISTINCT_PRESENTED_FRAMES_REQUIRED"
                ):
                    screen_targeted_encoded_right_ui_ink(
                        movie, **{**kwargs, "frame_indices": indices})
            for region in ([720, 830, 863, 880], [864, 830, 1080, 880],
                           [720, 50, 1080, 880], [720, 830, 1080, True]):
                with self.subTest(roi=region), self.assertRaisesRegex(
                    ValueError, "TARGETED_UI_PROBE_ROI_MUST_CROSS_RIGHT_EXCLUSION|TARGETED_UI_PROBE_NATIVE_TEXT_ROI_REQUIRED"
                ):
                    screen_targeted_encoded_right_ui_ink(
                        movie, **{**kwargs, "roi": region})


class ActualMediaStreamIdentityTests(unittest.TestCase):
    """Real one-second FFmpeg fixtures, not mocked ffprobe metadata.

    These do not certify the original video science, narration or handset.
    They prove that alternate/multiple tracks cannot be named as the
    single expected H.264/AAC-or-silent mobile research film.
    """

    def make_h264(self, root):
        movie = root / "h264.mp4"
        subprocess.run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
            "-f", "lavfi", "-i", "color=c=blue:s=160x288:r=30:d=1",
            "-c:v", "libx264", "-preset", "ultrafast",
            "-pix_fmt", "yuv420p", "-an", str(movie)
        ], capture_output=True, timeout=50, check=True)
        return movie

    def test_one_real_h264_video_without_audio_is_valid_research_input(self):
        with tempfile.TemporaryDirectory() as directory:
            movie = self.make_h264(Path(directory))
            w, h, duration, frames = probe_movie(movie)
            self.assertEqual((w, h, frames), (160, 288, 30))
            self.assertAlmostEqual(duration, 1.0)

    def test_real_h264_level_4_0_is_accepted_for_portable_mobile_research(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = root / "level40.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-f", "lavfi", "-i", "color=c=blue:s=160x288:r=30:d=1",
                "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
                "-x264-params", "level=4.0", "-an", str(movie)
            ], capture_output=True, timeout=50, check=True)
            stream = json.loads(subprocess.run([
                "ffprobe", "-v", "error", "-select_streams", "v:0",
                "-show_entries", "stream=codec_name,profile,level,pix_fmt",
                "-of", "json", str(movie)
            ], capture_output=True, text=True, timeout=20, check=True).stdout)["streams"][0]
            self.assertEqual(stream["codec_name"], "h264")
            self.assertEqual(stream["profile"], "Constrained Baseline")
            self.assertEqual(stream["level"], 40)
            self.assertEqual(probe_movie(movie)[3], 30)

    def test_real_h264_level_5_2_is_rejected_for_phone_decoder_portability(self):
        # Same physical yuv420p/30fps H264 video as the compatible control,
        # but its encoded SPS declares a decoder level too high for our
        # conservative mobile playback research contract.
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = root / "level52.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-f", "lavfi", "-i", "color=c=blue:s=160x288:r=30:d=1",
                "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
                "-x264-params", "level=5.2", "-an", str(movie)
            ], capture_output=True, timeout=50, check=True)
            stream = json.loads(subprocess.run([
                "ffprobe", "-v", "error", "-select_streams", "v:0",
                "-show_entries", "stream=codec_name,profile,level,pix_fmt",
                "-of", "json", str(movie)
            ], capture_output=True, text=True, timeout=20, check=True).stdout)["streams"][0]
            self.assertEqual(stream["codec_name"], "h264")
            self.assertEqual(stream["profile"], "Constrained Baseline")
            self.assertEqual(stream["pix_fmt"], "yuv420p")
            self.assertEqual(stream["level"], 52)
            with self.assertRaisesRegex(ValueError, "UNSUPPORTED_PHONE_H264_LEVEL"):
                probe_movie(movie)

    def encoded_color_signaled_h264(self, root, name, parameters):
        # The actual x264 elementary bitstream carries these VUI flags.
        # Re-probe each emitted MP4: a command-line argument alone is NOT
        # evidence that the payload contains the intended transfer metadata.
        movie = root / (name + ".mp4")
        subprocess.run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
            "-f", "lavfi", "-i", "color=c=blue:s=160x288:r=30:d=1",
            "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
            "-x264-params", parameters, "-an", str(movie)
        ], capture_output=True, timeout=50, check=True)
        info = json.loads(subprocess.run([
            "ffprobe", "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=codec_name,pix_fmt,color_transfer,color_primaries,color_space",
            "-of", "json", str(movie)
        ], capture_output=True, text=True, timeout=20, check=True).stdout)
        self.assertEqual(info["streams"][0]["codec_name"], "h264")
        self.assertEqual(info["streams"][0]["pix_fmt"], "yuv420p")
        return movie, info["streams"][0]

    def test_real_bt709_signaled_sdr_h264_remains_valid_research_source(self):
        with tempfile.TemporaryDirectory() as directory:
            movie, info = self.encoded_color_signaled_h264(
                Path(directory), "bt709",
                "colorprim=bt709:transfer=bt709:colormatrix=bt709")
            for key in ("color_transfer", "color_primaries", "color_space"):
                self.assertEqual(info[key], "bt709")
            self.assertEqual(probe_movie(movie)[3], 30)

    def test_real_pq_hdr_transfer_is_not_accepted_as_sdr_phone_overlay(self):
        with tempfile.TemporaryDirectory() as directory:
            movie, info = self.encoded_color_signaled_h264(
                Path(directory), "pq",
                "colorprim=bt709:transfer=smpte2084:colormatrix=bt709")
            self.assertEqual(info["color_transfer"], "smpte2084")
            self.assertEqual(info["color_primaries"], "bt709")
            with self.assertRaisesRegex(ValueError,
                                        "NON_SDR_PHONE_COLOR_METADATA:color_transfer"):
                probe_movie(movie)

    def test_real_hlg_hdr_transfer_is_not_accepted_as_sdr_phone_overlay(self):
        with tempfile.TemporaryDirectory() as directory:
            movie, info = self.encoded_color_signaled_h264(
                Path(directory), "hlg",
                "colorprim=bt709:transfer=arib-std-b67:colormatrix=bt709")
            self.assertEqual(info["color_transfer"], "arib-std-b67")
            self.assertEqual(info["color_space"], "bt709")
            with self.assertRaisesRegex(ValueError,
                                        "NON_SDR_PHONE_COLOR_METADATA:color_transfer"):
                probe_movie(movie)

    def test_real_bt2020_primaries_cannot_masquerade_as_rec709(self):
        with tempfile.TemporaryDirectory() as directory:
            movie, info = self.encoded_color_signaled_h264(
                Path(directory), "bt2020",
                "colorprim=bt2020:transfer=bt709:colormatrix=bt709")
            self.assertEqual(info["color_primaries"], "bt2020")
            self.assertEqual(info["color_transfer"], "bt709")
            with self.assertRaisesRegex(ValueError,
                                        "NON_SDR_PHONE_COLOR_METADATA:color_primaries"):
                probe_movie(movie)

    def test_real_bt2020_color_matrix_cannot_hide_behind_bt709_primaries(self):
        with tempfile.TemporaryDirectory() as directory:
            movie, info = self.encoded_color_signaled_h264(
                Path(directory), "bt2020nc",
                "colorprim=bt709:transfer=bt709:colormatrix=bt2020nc")
            self.assertEqual(info["color_space"], "bt2020nc")
            self.assertEqual(info["color_primaries"], "bt709")
            self.assertEqual(info["color_transfer"], "bt709")
            with self.assertRaisesRegex(ValueError,
                                        "NON_SDR_PHONE_COLOR_METADATA:color_space"):
                probe_movie(movie)

    def test_actual_matroska_renamed_mp4_does_not_pass_container_gate(self):
        # The filename is deliberately .mp4 but the real multiplexed bytes
        # are Matroska. Codec, SAR, chroma and timestamps stay valid.
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = self.make_h264(root)
            disguised = root / "disguised.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-i", str(source), "-map", "0:v:0",
                "-c:v", "copy", "-an", "-f", "matroska", str(disguised)
            ], capture_output=True, timeout=50, check=True)
            metadata = json.loads(subprocess.run([
                "ffprobe", "-v", "error",
                "-show_entries", "format=format_name",
                "-of", "json", str(disguised)
            ], capture_output=True, text=True, timeout=20, check=True).stdout)
            self.assertEqual(metadata["format"]["format_name"], "matroska,webm")
            with self.assertRaisesRegex(ValueError, "EXPECTED_MP4_CONTAINER"):
                probe_movie(disguised)

    def test_actual_quicktime_brand_cannot_masquerade_as_iso_mp4(self):
        # FFprobe's demuxer name is the SAME as MP4: major_brand is needed
        # to distinguish a real QuickTime movie, even with a .mp4 suffix.
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = self.make_h264(root)
            disguised = root / "quicktime-as-mp4.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-i", str(source), "-map", "0:v:0",
                "-c:v", "copy", "-an", "-f", "mov", str(disguised)
            ], capture_output=True, timeout=50, check=True)
            metadata = json.loads(subprocess.run([
                "ffprobe", "-v", "error",
                "-show_entries", "format=format_name:format_tags=major_brand",
                "-of", "json", str(disguised)
            ], capture_output=True, text=True, timeout=20, check=True).stdout)
            self.assertEqual(metadata["format"]["format_name"],
                             "mov,mp4,m4a,3gp,3g2,mj2")
            self.assertEqual(metadata["format"]["tags"]["major_brand"], "qt  ")
            with self.assertRaisesRegex(ValueError, "EXPECTED_ISO_MP4_MAJOR_BRAND"):
                probe_movie(disguised)

    def test_real_h264_yuv444p_cannot_claim_mobile_420_compatibility(self):
        # H.264 as a codec is not enough: native high-444 chroma fails
        # common phone delivery constraints even with a clean 30fps grid.
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = root / "yuv444p.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-f", "lavfi", "-i", "color=c=blue:s=160x288:r=30:d=1",
                "-c:v", "libx264", "-preset", "ultrafast",
                "-pix_fmt", "yuv444p", "-an", str(movie)
            ], capture_output=True, timeout=50, check=True)
            metadata = json.loads(subprocess.run([
                "ffprobe", "-v", "error", "-select_streams", "v:0",
                "-show_entries", "stream=codec_name,pix_fmt", "-of", "json",
                str(movie)
            ], capture_output=True, text=True, timeout=20, check=True).stdout)
            self.assertEqual(metadata["streams"][0]["codec_name"], "h264")
            self.assertEqual(metadata["streams"][0]["pix_fmt"], "yuv444p")
            with self.assertRaisesRegex(ValueError, "EXPECTED_MOBILE_YUV420P_PIXEL_FORMAT"):
                probe_movie(movie)

    def test_actual_non_square_h264_samples_fail_phone_safe_area_assumptions(self):
        # Even a yuv420p portrait source can display wider or taller
        # than the authored pixel coordinates when SAR is not 1:1.
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = root / "sar-2-to-1.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-f", "lavfi", "-i", "color=c=blue:s=160x288:r=30:d=1",
                "-vf", "setsar=2/1", "-c:v", "libx264",
                "-preset", "ultrafast", "-pix_fmt", "yuv420p",
                "-an", str(movie)
            ], capture_output=True, timeout=50, check=True)
            metadata = json.loads(subprocess.run([
                "ffprobe", "-v", "error", "-select_streams", "v:0",
                "-show_entries", "stream=pix_fmt,sample_aspect_ratio",
                "-of", "json", str(movie)
            ], capture_output=True, text=True, timeout=20, check=True).stdout)
            self.assertEqual(metadata["streams"][0]["pix_fmt"], "yuv420p")
            self.assertEqual(metadata["streams"][0]["sample_aspect_ratio"], "2:1")
            with self.assertRaisesRegex(ValueError, "EXPECTED_SQUARE_VIDEO_SAMPLE_PIXELS"):
                probe_movie(movie)

    def with_mp4_display_matrix(self, movie, output, coefficients):
        # Write the real ISO-BMFF tkhd display matrix of an FFmpeg-encoded
        # physical H.264 clip. No dependence on version-specific FFmpeg
        # -metadata rotate / -display_rotation output behavior.
        import struct
        payload = bytearray(movie.read_bytes())
        marker = payload.find(b"tkhd")
        self.assertGreater(marker, 4, "Encoded MP4 track header required")
        self.assertIn(payload[marker + 4], (0, 1))
        offset = marker + (44 if payload[marker + 4] == 0 else 56)
        identity = (65536, 0, 0, 0, 65536, 0, 0, 0, 1073741824)
        self.assertEqual(struct.unpack_from(">9i", payload, offset), identity)
        struct.pack_into(">9i", payload, offset, *coefficients)
        output.write_bytes(payload)
        data = json.loads(subprocess.run([
            "ffprobe", "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream_side_data=side_data_type,rotation,displaymatrix",
            "-of", "json", str(output)
        ], capture_output=True, text=True, timeout=20, check=True).stdout)
        matrices = [x for x in data["streams"][0].get("side_data_list", [])
                    if x.get("side_data_type") == "Display Matrix"]
        self.assertEqual(len(matrices), 1, "Actual MP4 transform must be independently decoded")
        return matrices[0]

    def test_rotated_portrait_mp4_rejected_before_phone_overlay_analysis(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = self.make_h264(root)
            movie = root / "rotated90.mp4"
            info = self.with_mp4_display_matrix(
                source, movie,
                (0, -65536, 0, 65536, 0, 0, 0, 0, 1073741824))
            self.assertEqual(info["rotation"], 90)
            with self.assertRaisesRegex(ValueError, "NONIDENTITY_VIDEO_DISPLAY_TRANSFORM"):
                probe_movie(movie)

    def test_zero_rotation_translation_still_fails_full_display_matrix_check(self):
        # An angle-only detector falsely accepts this actual MP4 with
        # rotation=0 yet a nonzero horizontal translation.
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = self.make_h264(root)
            movie = root / "translated.mp4"
            info = self.with_mp4_display_matrix(
                source, movie,
                (65536, 0, 1310720, 0, 65536, 0, 0, 0, 1073741824))
            self.assertEqual(info["rotation"], 0)
            with self.assertRaisesRegex(ValueError, "NONIDENTITY_VIDEO_DISPLAY_TRANSFORM"):
                probe_movie(movie)

    def test_mp4_horizontal_reflection_rejected_before_safe_area_verdict(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = self.make_h264(root)
            movie = root / "mirrored.mp4"
            info = self.with_mp4_display_matrix(
                source, movie,
                (-65536, 0, 0, 0, 65536, 0, 0, 0, 1073741824))
            self.assertIn("displaymatrix", info)
            with self.assertRaisesRegex(ValueError, "NONIDENTITY_VIDEO_DISPLAY_TRANSFORM"):
                probe_movie(movie)

    def test_real_mpeg4_video_cannot_appear_as_h264_by_averaged_frame_rate(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = root / "mpeg4.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-f", "lavfi", "-i", "color=c=blue:s=160x288:r=30:d=1",
                "-c:v", "mpeg4", "-q:v", "3", "-an", str(movie)
            ], capture_output=True, timeout=50, check=True)
            with self.assertRaisesRegex(ValueError, "EXPECTED_H264_VIDEO_CODEC"):
                probe_movie(movie)

    def test_actual_second_video_track_cannot_hide_behind_v0_selection(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = self.make_h264(root)
            duplicate = root / "two-tracks.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-i", str(source), "-map", "0:v:0", "-map", "0:v:0",
                "-c:v", "copy", "-an", str(duplicate)
            ], capture_output=True, timeout=50, check=True)
            with self.assertRaisesRegex(ValueError, "UNEXPECTED_MOVIE_STREAM_LAYOUT"):
                probe_movie(duplicate)

    def test_real_non_aac_audio_cannot_claim_aac_research_soundtrack(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = self.make_h264(root)
            movie = root / "mpeg-audio.mkv"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-i", str(source), "-f", "lavfi",
                "-i", "sine=frequency=440:sample_rate=44100:duration=1",
                "-map", "0:v:0", "-map", "1:a:0",
                "-c:v", "copy", "-c:a", "libmp3lame", str(movie)
            ], capture_output=True, timeout=50, check=True)
            with self.assertRaisesRegex(ValueError, "EXPECTED_AAC_AUDIO_CODEC"):
                probe_movie(movie)


class ActualFilmSmoke(unittest.TestCase):
    def test_truncated_physical_h264_bitstream_fails_strict_full_decode(self):
        # A physically truncated H.264 elementary payload, not an invented
        # ffprobe object. Full metadata/index parsing and one sampled PNG
        # are insufficient to declare complete data payload integrity.
        # A random bit flip can be decoder-tolerated across FFmpeg builds;
        # partial length-delimited NAL units must fail closed.
        from phone_ui_audit import verify_complete_media_decode
        from native_master_audit import frame_timestamps
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = root / "source.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin",
                "-y", "-f", "lavfi", "-i",
                "testsrc2=size=160x288:rate=30:duration=1.5",
                "-c:v", "libx264", "-preset", "ultrafast",
                "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                "-an", str(movie)
            ], capture_output=True, timeout=50, check=True)
            self.assertEqual(len(frame_timestamps(movie)), 45)
            receipt = verify_complete_media_decode(movie)
            self.assertTrue(receipt["allMappedStreamsDecodedWithoutFatalErrors"])
            self.assertFalse(receipt["mayPublish"])
            encoded = movie.read_bytes()
            # Keep the fast-start MP4 headers but cut compressed media data.
            # The 25/50/75% samples account for encoder GOP and packet
            # placement differences across runner/FFmpeg versions; every
            # attempted negative is a genuinely truncated real H.264 film.
            rejected = False
            for fraction in (0.25, 0.50, 0.75):
                truncated = root / "truncated.mp4"
                truncated.write_bytes(encoded[:int(len(encoded) * fraction)])
                try:
                    verify_complete_media_decode(truncated)
                except ValueError as error:
                    self.assertIn("FULL_ENCODED_MEDIA_DECODE_FAILED", str(error))
                    rejected = True
                    break
            self.assertTrue(rejected,
                            "A real length-delimited truncated H.264 payload must not pass full decode")

    def test_full_decode_failure_invalidates_prior_report_before_success_claim(self):
        from phone_ui_audit import verify_complete_media_decode
        with tempfile.TemporaryDirectory() as root:
            root = Path(root)
            movie = root / "source.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin",
                "-y", "-f", "lavfi", "-i",
                "color=c=blue:s=1080x1920:r=30:d=3",
                "-c:v", "libx264", "-preset", "ultrafast",
                "-pix_fmt", "yuv420p", "-an", str(movie)
            ], capture_output=True, timeout=50, check=True)
            plan_data = fixture()
            plan_data["expectedVideoSha256"] = hashlib.sha256(movie.read_bytes()).hexdigest()
            plan = root / "plan.json"
            plan.write_text(json.dumps(plan_data))
            output = root / "frames"
            output.mkdir()
            old_report = output / "research-report.json"
            audit(movie, plan, output)
            self.assertTrue(old_report.is_file())
            with patch("phone_ui_audit.verify_complete_media_decode",
                       side_effect=ValueError("PHONE_UI_HOLD:FULL_ENCODED_MEDIA_DECODE_FAILED")):
                with self.assertRaisesRegex(ValueError, "FULL_ENCODED_MEDIA_DECODE_FAILED"):
                    audit(movie, plan, output)
            self.assertFalse(old_report.exists())
            self.assertFalse(list(output.glob("*.png")))

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
            self.assertFalse(list(output.glob("*.png")),
                             "Failed rerun must not leave orphaned old QA screenshots")
            # A corrected retry must work without manually deleting old
            # generated images: only verified prior receipts authorize cleanup.
            m["expectedVideoSha256"] = hashlib.sha256(movie.read_bytes()).hexdigest()
            plan.write_text(json.dumps(m))
            recovered = audit(movie, plan, output)
            self.assertEqual(recovered["publicationVerdict"], "HOLD")
            self.assertTrue((output / "research-report.json").exists())
            self.assertEqual(len(recovered["decodedOverlayFrames"]), 3)

    def test_late_report_collision_preserves_other_writer_on_real_h264_audit(self):
        # Real 1080x1920 H264 source and normal decoded screenshot pipeline.
        # Inject an unrelated receipt at the exact final hard-link commit.
        import os
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            movie = root / "source.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                "-f", "lavfi", "-i", "color=c=blue:s=1080x1920:r=30:d=3",
                "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
                "-an", str(movie)
            ], capture_output=True, timeout=50, check=True)
            plan = root / "plan.json"
            spec = fixture()
            spec["expectedVideoSha256"] = hashlib.sha256(movie.read_bytes()).hexdigest()
            plan.write_text(json.dumps(spec))
            output = root / "review"
            foreign_report = b'{"ownedBy":"independent writer","mayPublish":false}'
            original_link = os.link
            collision = [False]

            def competing_report(source, destination):
                dest = Path(destination)
                if dest.name == "research-report.json" and not collision[0]:
                    collision[0] = True
                    dest.write_bytes(foreign_report)
                return original_link(source, destination)

            with patch("phone_ui_audit.os.link", side_effect=competing_report):
                with self.assertRaisesRegex(ValueError,
                                            "REVIEW_REPORT_COLLISION_AT_COMMIT"):
                    audit(movie, plan, output)
            self.assertTrue(collision[0])
            self.assertEqual((output / "research-report.json").read_bytes(),
                             foreign_report)
            self.assertEqual(hashlib.sha256(movie.read_bytes()).hexdigest(),
                             spec["expectedVideoSha256"])
            self.assertFalse((output / ".phone-ui-stage").exists())

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
            self.assertTrue(receipt["completeEncodedMediaDecode"]["allMappedStreamsDecodedWithoutFatalErrors"])
            self.assertFalse(receipt["completeEncodedMediaDecode"]["mayPublish"])
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


class DecodedCaptionInkPhoneScreenTests(unittest.TestCase):
    """No metadata-only typography approval: inspect exact decoded BGR rows."""

    @staticmethod
    def two_lines(*, first=(8, 26), second=(35, 53), gap=False,
                  remove_second=False, dark=False, width=60, height=65):
        image = bytearray(width * height * 3)
        for index, (start, stop) in enumerate((first, second)):
            if index == 1 and remove_second:
                continue
            for y in range(start, stop + 1):
                if gap and y == 15:
                    continue
                for x in range(10, 30):
                    at = (y * width + x) * 3
                    image[at:at + 3] = bytes((90, 90, 90) if dark else (235, 235, 235))
        return bytes(image)

    def scan(self, raw=None, **kwargs):
        from phone_ui_audit import measure_decoded_caption_ink_rows
        params = {"crop_width": 60, "crop_height": 65, "native_video_width": 1080}
        params.update(kwargs)
        return measure_decoded_caption_ink_rows(
            self.two_lines() if raw is None else raw, **params)

    def test_actual_decoded_glyph_ink_small_on_320_phone_is_review_hold(self):
        r = self.scan()
        self.assertEqual(len(r["actualDecodedInkLines"]), 2)
        self.assertEqual([x["nativeGlyphInkHeightPx"] for x in r["actualDecodedInkLines"]], [19, 19])
        self.assertTrue(all(x["belowExperimentalReviewThreshold"]
                            for x in r["actualDecodedInkLines"]))
        self.assertFalse(r["mayPublish"])

    def test_physically_large_type_still_never_certifies_publishing(self):
        r = self.scan(native_video_width=60, phone_width_px=60)
        self.assertEqual(r["status"], "NO_SMALL_CAPTION_INK_DETECTED_REVIEW_REQUIRED")
        self.assertEqual(r["publicationVerdict"], "HOLD")
        self.assertFalse(r["semanticOCRVerified"])

    def test_a_missing_second_caption_line_is_not_a_green_pass(self):
        with self.assertRaisesRegex(ValueError, "EXPECTED_PHYSICAL_INK_LINES"):
            self.scan(self.two_lines(remove_second=True))

    def test_blank_or_too_dark_decoded_pixels_are_held_not_called_readable(self):
        for raw in (bytes(60 * 65 * 3), self.two_lines(dark=True)):
            with self.subTest(first=raw[:2]):
                with self.assertRaisesRegex(ValueError, "EXPECTED_PHYSICAL_INK_LINES"):
                    self.scan(raw)

    def test_incomplete_or_extra_decoded_bytes_cannot_claim_height(self):
        for raw in (self.two_lines()[:-1], self.two_lines() + b"x"):
            with self.assertRaisesRegex(ValueError, "COMPLETE_DECODED_BGR_CROP"):
                self.scan(raw)

    def test_true_antialias_gap_in_glyph_does_not_invent_third_line(self):
        r = self.scan(self.two_lines(gap=True))
        self.assertEqual([x["nativeGlyphInkHeightPx"] for x in r["actualDecodedInkLines"]], [19, 19])

    def test_forged_roi_or_nonfinite_review_threshold_is_rejected(self):
        for changed in (dict(phone_width_px=0), dict(expected_lines=0),
                        dict(min_ink_pixels_per_row=90),
                        dict(minimum_phone_glyph_px=float("nan"))):
            with self.subTest(changed=changed):
                with self.assertRaisesRegex(ValueError, "CAPTION_TYPE_SCREEN_"):
                    self.scan(**changed)

    def test_stale_exact_film_sha_rejected_before_any_ffmpeg(self):
        from phone_ui_audit import measure_targeted_encoded_caption_type
        with tempfile.TemporaryDirectory() as root:
            movie = Path(root) / "fake.mp4"
            movie.write_bytes(b"not real H264")
            with self.assertRaisesRegex(ValueError, "FILM_SHA_MISMATCH"):
                measure_targeted_encoded_caption_type(
                    movie, expected_film_sha=H, frame_indices=list(range(4)),
                    roi=[95, 1340, 780, 1475])

    def test_discontinuous_frames_cannot_hide_one_frame_small_type(self):
        from phone_ui_audit import measure_targeted_encoded_caption_type
        with tempfile.TemporaryDirectory() as root:
            movie = Path(root) / "source.bin"
            movie.write_bytes(b"verified sha before probe")
            identity = hashlib.sha256(movie.read_bytes()).hexdigest()
            with patch("phone_ui_audit.probe_movie", return_value=(1080, 1920, 33.6, 1008)):
                with self.assertRaisesRegex(ValueError, "COMPLETE_CONTIGUOUS_WINDOW"):
                    measure_targeted_encoded_caption_type(
                        movie, expected_film_sha=identity,
                        frame_indices=[0, 1, 3, 4], roi=[95, 1340, 780, 1475])

    def test_oversized_roi_rejected_before_decode(self):
        from phone_ui_audit import measure_targeted_encoded_caption_type
        with tempfile.TemporaryDirectory() as root:
            movie = Path(root) / "source.bin"
            movie.write_bytes(b"verified sha before roi")
            identity = hashlib.sha256(movie.read_bytes()).hexdigest()
            with patch("phone_ui_audit.probe_movie", return_value=(1080, 1920, 33.6, 1008)):
                with self.assertRaisesRegex(ValueError, "BOUNDED_NATIVE_ROI"):
                    measure_targeted_encoded_caption_type(
                        movie, expected_film_sha=identity,
                        frame_indices=list(range(4)), roi=[0, 0, 1080, 1920])

class WholeEncodedRightUiFilmTests(unittest.TestCase):
    """Every actual FFmpeg frame, with no eligible sparse/omitted final chunk."""

    @staticmethod
    def movie_and_hash(root, *, overflows):
        movie = TargetedEncodedRightUiInkTests.physical_caption_proxy(
            root, overflows=overflows)
        return movie, hashlib.sha256(movie.read_bytes()).hexdigest()

    def test_physical_30_frame_full_movie_reports_no_missing_windows(self):
        from phone_ui_audit import measure_whole_encoded_right_ui_ink
        with tempfile.TemporaryDirectory() as tmp:
            movie, digest = self.movie_and_hash(Path(tmp), overflows=False)
            result = measure_whole_encoded_right_ui_ink(
                movie, expected_film_sha=digest, expected_frames=30,
                roi=[720, 830, 1080, 880], window_frames=12)
            self.assertEqual(result["decodedFramesExamined"], 30)
            self.assertEqual(result["violationCount"], 0)
            self.assertEqual(result["windows"], [
                {"firstFrame": 0, "lastFrame": 11},
                {"firstFrame": 12, "lastFrame": 23},
                {"firstFrame": 24, "lastFrame": 29}])
            self.assertEqual([row["decodedFrameIndex"] for row in
                              result["actualDecodedPixelObservations"]],
                             list(range(30)))
            self.assertTrue(result["wholeFilmFramesCoveredExactlyOnce"])
            self.assertEqual(result["publicationVerdict"], "HOLD")
            self.assertIs(result["mayPublish"], False)

    def test_physical_full_movie_detects_real_right_ui_ink(self):
        from phone_ui_audit import (measure_whole_encoded_right_ui_ink,
                                    screen_whole_encoded_right_ui_ink)
        with tempfile.TemporaryDirectory() as tmp:
            movie, digest = self.movie_and_hash(Path(tmp), overflows=True)
            inputs = dict(expected_film_sha=digest, expected_frames=30,
                          roi=[720, 830, 1080, 880], window_frames=12)
            result = measure_whole_encoded_right_ui_ink(movie, **inputs)
            self.assertEqual(result["violationCount"], 30)
            self.assertEqual(result["firstViolatingFrameIndex"], 0)
            with self.assertRaisesRegex(
                    ValueError, "WHOLE_FILM_RIGHT_UI_EXCLUSION:0:30"):
                screen_whole_encoded_right_ui_ink(movie, **inputs)

    def test_short_final_window_cannot_be_mislabeled_sparse(self):
        from phone_ui_audit import measure_whole_encoded_right_ui_ink
        with tempfile.TemporaryDirectory() as tmp:
            movie, digest = self.movie_and_hash(Path(tmp), overflows=False)
            result = measure_whole_encoded_right_ui_ink(
                movie, expected_film_sha=digest, expected_frames=30,
                roi=[720, 830, 1080, 880], window_frames=28)
            self.assertEqual(result["windows"], [
                {"firstFrame": 0, "lastFrame": 25},
                {"firstFrame": 26, "lastFrame": 29}])
            self.assertEqual(result["decodedFramesExamined"], 30)

    def test_stale_or_incorrect_total_frame_pin_rejected(self):
        from phone_ui_audit import measure_whole_encoded_right_ui_ink
        with tempfile.TemporaryDirectory() as tmp:
            movie, digest = self.movie_and_hash(Path(tmp), overflows=False)
            with self.assertRaisesRegex(ValueError, "EXACT_FRAME_COUNT_MISMATCH"):
                measure_whole_encoded_right_ui_ink(
                    movie, expected_film_sha=digest, expected_frames=29,
                    roi=[720, 830, 1080, 880])
            with self.assertRaisesRegex(ValueError, "EXACT_FILM_SHA_MISMATCH"):
                measure_whole_encoded_right_ui_ink(
                    movie, expected_film_sha="0" * 64, expected_frames=30,
                    roi=[720, 830, 1080, 880])

    def test_forged_partial_window_receipt_cannot_claim_whole_film(self):
        from phone_ui_audit import measure_whole_encoded_right_ui_ink
        with tempfile.TemporaryDirectory() as tmp:
            movie, digest = self.movie_and_hash(Path(tmp), overflows=False)
            forged = {"filmSha256": digest, "mayPublish": False,
                      "everyFrameInRequestedWindowChecked": True,
                      "actualDecodedPixelObservations": [
                          {"decodedFrameIndex": 0,
                           "targetPixelsInRightExclusion": 0}]}
            with patch("phone_ui_audit.measure_targeted_encoded_right_ui_ink",
                       return_value=forged):
                with self.assertRaisesRegex(ValueError, "INVALID_WINDOW_RECEIPT"):
                    measure_whole_encoded_right_ui_ink(
                        movie, expected_film_sha=digest, expected_frames=30,
                        roi=[720, 830, 1080, 880], window_frames=12)


    def test_forged_window_scope_and_counters_cannot_clear_entire_film(self):
        # Before this guard, a returned frame-window receipt produced with
        # the wrong pixel mode or crop could falsely clear a whole film.
        from phone_ui_audit import (measure_targeted_encoded_right_ui_ink,
                                    measure_whole_encoded_right_ui_ink)
        with tempfile.TemporaryDirectory() as tmp:
            movie, digest = self.movie_and_hash(Path(tmp), overflows=False)
            roi = [720, 830, 1080, 880]
            authentic = measure_targeted_encoded_right_ui_ink(
                movie, expected_film_sha=digest,
                frame_indices=list(range(12)), roi=roi)
            self.assertEqual(authentic["violationCount"] if
                             "violationCount" in authentic else
                             authentic["violatingFrameCount"], 0)
            bad_cases = [
                ("pixelMode", "scientific_visual_highlights"),
                ("targetedRoiPx", [718, 830, 1080, 880]),
                ("rightUiExclusionBeginsNativeX", 865),
                ("decodedFramesExamined", 11),
                ("publicationVerdict", "PASS"),
                ("actualPhoneLayoutVerified", True),
                ("violatingFrameCount", 3),
            ]
            for key, value in bad_cases:
                with self.subTest(forgery=key):
                    forged = copy.deepcopy(authentic)
                    forged[key] = value
                    with patch("phone_ui_audit.measure_targeted_encoded_right_ui_ink",
                               return_value=forged):
                        with self.assertRaisesRegex(
                                ValueError, "WHOLE_UI_SCREEN_INVALID_WINDOW_RECEIPT"):
                            measure_whole_encoded_right_ui_ink(
                                movie, expected_film_sha=digest,
                                expected_frames=30, roi=roi, window_frames=12)
            corrupt = copy.deepcopy(authentic)
            corrupt["actualDecodedPixelObservations"][0][
                "targetPixelsInRightExclusion"] = 1
            # One asserted positive pixel cannot have a null X coordinate.
            with patch("phone_ui_audit.measure_targeted_encoded_right_ui_ink",
                       return_value=corrupt):
                with self.assertRaisesRegex(
                        ValueError, "WHOLE_UI_SCREEN_INVALID_WINDOW_RECEIPT"):
                    measure_whole_encoded_right_ui_ink(
                        movie, expected_film_sha=digest,
                        expected_frames=30, roi=roi, window_frames=12)


if __name__ == "__main__":
    unittest.main()
