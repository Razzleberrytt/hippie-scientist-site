"""Real decoded-film plus negative mobile overlay contract tests."""
import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).parent))
from phone_ui_audit import audit, validate_manifest

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

    def test_good_research_metadata_does_not_publish(self):
        receipt = self.check(fixture())
        self.assertEqual(receipt["status"], "OVERLAY_PREFLIGHT_PASS_REVIEW_REQUIRED")
        for key in ("mayPublish", "realHandsetPlaybackVerified", "mutedComprehensionVerified",
                    "visualCraftApproved", "nativeSourceResolutionVerified"):
            self.assertFalse(receipt[key])

    def test_bad_hash(self):
        with self.assertRaisesRegex(ValueError, "EXACT_VIDEO_SHA_MISMATCH"):
            self.check(fixture(), sha="b" * 64)

    def test_incomplete_timeline(self):
        m = fixture()
        m["shots"][0]["endSec"] = 2.6
        with self.assertRaisesRegex(ValueError, "INCOMPLETE_FILM_COVERAGE"):
            self.check(m)

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
            self.assertEqual(len(receipt["decodedOverlayFrames"]), 3)
            self.assertEqual([x["timeSec"] for x in receipt["decodedOverlayFrames"] if x.get("openingHookProbe")], [.25, 1.5])
            png = root / "frames" / receipt["decodedOverlayFrames"][0]["file"]
            self.assertGreater(png.stat().st_size, 1000)
            self.assertEqual(receipt["decodedOverlayFrames"][0]["frameSha256"], hashlib.sha256(png.read_bytes()).hexdigest())
            self.assertFalse(json.loads((root / "frames" / "research-report.json").read_text())["mayPublish"])

if __name__ == "__main__":
    unittest.main()
