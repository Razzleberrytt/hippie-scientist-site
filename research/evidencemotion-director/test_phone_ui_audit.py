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
                            decoded_overlay)

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

class ActualFilmSmoke(unittest.TestCase):
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
