"""Adversarial visible-source tests; synthetic media never count as real footage."""
import shutil
import subprocess
import tempfile
import unittest
from unittest import mock
from pathlib import Path

import encoded_source_credit_guard as guard


class DecodedSourceCreditTests(unittest.TestCase):
    def test_formulations_vary_and_unpaired_source_identifiers_fail_closed(self):
        for s in (
            "FORMULATIONS VARY", "USP 2040", "SOURCE USP", "SOURCE USP 2041",
            "SOURCE USP\n2040", "SOURCE NIH 2040", "Source: USP 2040 BAD 2041",
            "NOT SOURCE USP 2040", "NO SOURCE USP 2040",
            "SOURCE N/A USP 2040", "SOURCE USP 2040 NOT APPLICABLE",
            "USP 2040 SOURCE", "SOURCE NOT USP 2040",
            "NOT\nSOURCE USP 2040", "NO\nSOURCE USP 2040",
            "SOURCE USP 2040\nNOT APPLICABLE",
            "SOURCE USP 2040\nUNVERIFIED",
            "SOURCE USP 2040\nSOURCE USP 2041",
            "SOURCE NIH 2040\nSOURCE USP 2040",
            "SOURCE USP 2040\nNOT SOURCE USP 2040",
        ):
            with self.subTest(text=s):
                self.assertFalse(guard.source_line_detected(s, "USP", "2040"))
        self.assertTrue(guard.source_line_detected(
            "SOURCE: USP <2040>\nFORMULATIONS VARY", "USP", "2040"))
        self.assertTrue(guard.source_line_detected(
            "SOURCE USP CHAPTER 2040", "USP", "2040"))

    def test_fake_source_ids_and_invalid_ocr_fail_closed(self):
        for authority,number in (("USP|NIDDK","2040"),("USP","04A0"),("USP","0")):
            with self.assertRaisesRegex(ValueError,"INVALID_SOURCE"):
                guard.source_line_detected("SOURCE USP 2040",authority,number)
        with self.assertRaisesRegex(ValueError,"INVALID_OCR"):
            guard.source_line_detected(None,"USP","2040")

    def test_source_recheck_reads_no_more_than_limit_plus_one_byte(self):
        # A sparse replacement simulates a source growing after the size
        # preflight; this must HOLD instead of hashing arbitrary-length data.
        with tempfile.TemporaryDirectory() as folder:
            movie = Path(folder) / "oversized-after-stat.mp4"
            movie.write_bytes(b"A" * 4096)
            self.assertEqual(guard.sha256_file(movie),
                             guard.sha256_file(movie, max_bytes=4096))
            with mock.patch.object(guard, "MAX_VIDEO_BYTES", 4096):
                movie.write_bytes(b"A" * 4097)
                with self.assertRaisesRegex(ValueError,
                                            "ENCODED_SOURCE_RECHECK_EXCEEDS_LIMIT"):
                    guard.sha256_file(movie, max_bytes=guard.MAX_VIDEO_BYTES)
                with movie.open("wb") as out:
                    out.truncate(16 * 1024 * 1024)
                with self.assertRaisesRegex(ValueError,
                                            "ENCODED_SOURCE_RECHECK_EXCEEDS_LIMIT"):
                    guard.sha256_file(movie, max_bytes=guard.MAX_VIDEO_BYTES)
                self.assertEqual(movie.stat().st_size, 16 * 1024 * 1024)

    @unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe") and
                         shutil.which("tesseract"), "physical H264 + OCR required")
    def test_actual_h264_pixels_not_manifest_can_prove_sampled_credit(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            font="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
            if not Path(font).is_file():
                self.skipTest("DejaVuSans font unavailable")
            def film(name,text):
                path=root/name
                command=["ffmpeg","-v","error","-y","-f","lavfi",
                         "-i","color=c=white:s=640x360:r=10:d=2",
                         "-vf",f"drawtext=fontfile={font}:text='{text}':fontcolor=black:fontsize=38:x=30:y=100",
                         "-c:v","libx264","-preset","ultrafast","-pix_fmt","yuv420p",str(path)]
                subprocess.run(command,capture_output=True,check=True,timeout=30)
                return path,guard.sha256_file(path)
            good,pin=film("credit.mp4","SOURCE USP 2040")
            result=guard.inspect(good,pin,frame_indices=[2,13],roi=[20,70,570,130],
                                 source_name="USP",source_number="2040")
            self.assertEqual(result["actualEncodedFramesSampled"],2)
            self.assertFalse(result["mayPublish"])
            self.assertFalse(result["scientificClaimApproved"])
            self.assertFalse(result["realPhoneLegibilityVerified"])
            with self.assertRaisesRegex(ValueError,"EXACT_INDEPENDENT"):
                guard.inspect(good,"f"*64,frame_indices=[2,13],roi=[20,70,570,130],
                              source_name="USP",source_number="2040")
            negated,negatedpin=film("negated-attribution.mp4","NOT SOURCE USP 2040")
            with self.assertRaisesRegex(ValueError,"IDENTIFIABLE_SCIENTIFIC_SOURCE"):
                guard.inspect(negated,negatedpin,frame_indices=[2,13],
                              roi=[20,70,570,130],source_name="USP",
                              source_number="2040")
            bad,badpin=film("qualifier-only.mp4","FORMULATIONS VARY")
            with self.assertRaisesRegex(ValueError,"IDENTIFIABLE_SCIENTIFIC_SOURCE"):
                guard.inspect(bad,badpin,frame_indices=[2,13],roi=[20,70,570,130],
                              source_name="USP",source_number="2040")
            with self.assertRaisesRegex(ValueError,"UNIQUE_ORDERED"):
                guard.inspect(good,pin,frame_indices=[2,2],roi=[20,70,570,130],
                              source_name="USP",source_number="2040")
            with self.assertRaisesRegex(ValueError,"SOURCE_REGION_OUTSIDE"):
                guard.inspect(good,pin,frame_indices=[2,13],roi=[20,360,570,130],
                              source_name="USP",source_number="2040")

            # Physically reproduce a check/use race. A second MP4 carries
            # the same readable credit, but different bytes from the pinned
            # one. The old implementation silently reported success under
            # the first movie SHA after FFprobe read the replacement.
            changed = root / "replaced-after-pin.mp4"
            subprocess.run([
                "ffmpeg", "-v", "error", "-y", "-i", str(good),
                "-map", "0:v:0", "-c:v", "copy", "-metadata",
                "comment=post-hash-replacement", str(changed)
            ], capture_output=True, check=True, timeout=30)
            self.assertNotEqual(pin, guard.sha256_file(changed))
            original_command = guard.command
            used = []
            swapped = {"done": False}

            def replace_on_probe(argv, timeout=45):
                if argv[0] == "ffprobe":
                    used.append(Path(argv[-1]).name)
                    if not swapped["done"]:
                        good.write_bytes(changed.read_bytes())
                        swapped["done"] = True
                elif argv[0] == "ffmpeg":
                    used.append(Path(argv[argv.index("-i") + 1]).name)
                return original_command(argv, timeout=timeout)

            with mock.patch.object(guard, "command", side_effect=replace_on_probe):
                with self.assertRaisesRegex(
                    ValueError, "ENCODED_SOURCE_CHANGED_DURING_REPLAY"
                ):
                    guard.inspect(good, pin, frame_indices=[2, 13],
                                  roi=[20, 70, 570, 130],
                                  source_name="USP", source_number="2040")
            self.assertTrue(swapped["done"])
            self.assertEqual(used, ["pinned-input.mp4"] * 3)
            self.assertEqual(good.read_bytes(), changed.read_bytes())

            # Same verified physical film, but a source replacement *grows*
            # after the frozen copy has been made. Recheck may read only
            # MAX_VIDEO_BYTES + 1 from the hostile mutable pathname.
            swapped["done"] = False
            current_pin = guard.sha256_file(good)
            original_movie_length = good.stat().st_size
            cap = max(256 * 1024, original_movie_length + 4096)

            def grow_on_probe(argv, timeout=45):
                if argv[0] == "ffprobe" and not swapped["done"]:
                    with good.open("wb") as changed_source:
                        changed_source.truncate(cap + 8192)
                    swapped["done"] = True
                return original_command(argv, timeout=timeout)

            with mock.patch.object(guard, "MAX_VIDEO_BYTES", cap), mock.patch.object(
                guard, "command", side_effect=grow_on_probe
            ):
                with self.assertRaisesRegex(
                    ValueError, "ENCODED_SOURCE_RECHECK_EXCEEDS_LIMIT"
                ):
                    guard.inspect(good, current_pin, frame_indices=[2, 13],
                                  roi=[20, 70, 570, 130],
                                  source_name="USP", source_number="2040")
            self.assertTrue(swapped["done"])
            self.assertEqual(good.stat().st_size, cap + 8192)


if __name__=="__main__": unittest.main()
