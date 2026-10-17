"""Research-only Lane5 decoded candidate scorecard contracts."""
import hashlib
import json
import os
from pathlib import Path
import tempfile
import unittest
import wave
from unittest.mock import patch

from lane5_candidate_scorecard import (
    _screen_stats, _windows, score_candidate, write_once, hold
)


def h(v):
    return hashlib.sha256(v).hexdigest()


def screen(film, story, frames=12, bright=(), colored=()):
    rows = [{"frameIndex": i,
             "rightStripBrightNeutralPixels": 10 if i in bright else 0,
             "rightStripHighlightedPixels": 3 if i in colored else 0}
            for i in range(frames)]
    return {
        "schema": "ths-em-lane4-full-film-right-strip-negative-screen-v1",
        "filmSha256": film, "storyboardSha256": story,
        "decodedVideoFrames": frames,
        "strictFullH264AndAACDecodePassed": True,
        "mayPublish": False, "rightBoundaryX": 864,
        "verticalReviewWindow": [192, 1573],
        "brightNeutralPositiveFrameCount": len(bright),
        "highlightedPositiveFrameCount": len(colored),
        "perFrame": rows
    }


class Lane5ScorecardTests(unittest.TestCase):
    def test_groups_report_contiguous_native_times_without_hiding_gaps(self):
        self.assertEqual(_windows([5, 6, 9]), [
            {"firstFrame": 5, "lastFrame": 6, "firstSecond": 0.167,
             "endSecondExclusive": 0.233, "frames": 2},
            {"firstFrame": 9, "lastFrame": 9, "firstSecond": 0.3,
             "endSecondExclusive": 0.333, "frames": 1}])

    def test_screen_rejects_mixed_candidate_identity_and_rewritten_counts(self):
        film, story = h(b"movie"), h(b"story")
        obj = screen(film, story, bright=[5], colored=[6])
        a, b = _screen_stats(obj, film, story, 12)
        self.assertEqual((a, b), ([5], [6]))
        with self.assertRaisesRegex(ValueError, "CROSS_FILM"):
            _screen_stats(obj, h(b"other"), story, 12)
        obj["brightNeutralPositiveFrameCount"] = 0
        with self.assertRaisesRegex(ValueError, "SCREEN_SUMMARY"):
            _screen_stats(obj, film, story, 12)
        obj["brightNeutralPositiveFrameCount"] = 1
        obj["perFrame"][5]["frameIndex"] = 7
        with self.assertRaisesRegex(ValueError, "SCREEN_FRAME_SEQUENCE"):
            _screen_stats(obj, film, story, 12)

    def test_all_research_flags_stay_false_even_when_screen_is_clear(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            film = root / "film.mp4"
            wav = root / "narrator.wav"
            story = root / "story.json"
            screenpath = root / "screen.json"
            film.write_bytes(b"media fixture, decoded independently in media tests")
            with wave.open(str(wav), "wb") as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000)
                w.writeframes(b"\x00\x00" * 12000)
            movie_sha, wav_sha = h(film.read_bytes()), h(wav.read_bytes())
            story.write_text(json.dumps({
                "schema": "ths-lane3-research-visual-treatment-story-v1",
                "encodedH264Sha256": movie_sha, "shots": [{"shot":str(i)} for i in range(9)],
                "mayPublish": False, "realPhonePlaybackVerified": False,
                "independentCraftCalibrationPassed": False,
                "phonePlanSha256": None
            }))
            story_sha = h(story.read_bytes())
            screenpath.write_text(json.dumps(screen(movie_sha, story_sha, colored=[7])))
            screen_sha = h(screenpath.read_bytes())
            physical = {"fullVideoAudioPhysicalDecode": True, "nativeFrames": 12,
                        "width": 64, "height": 64, "fps": 30, "audioCodec":"aac"}
            with patch("lane5_candidate_scorecard._physical_av", return_value=physical):
                report = score_candidate(
                    film=film, wav=wav, story_path=story, screen_path=screenpath,
                    expected_film_sha=movie_sha, expected_wav_sha=wav_sha,
                    expected_story_sha=story_sha, expected_screen_sha=screen_sha,
                    dimensions=(64, 64, 12))
            self.assertTrue(report["machineReviewed"])
            self.assertFalse(report["externalIndependentReviewed"])
            self.assertFalse(report["physicalPhoneReviewed"])
            self.assertFalse(report["firstExcellentMasterAccepted"])
            self.assertFalse(report["mayPublish"])
            self.assertIsNone(report["calibratedPremiumCraftScore"])
            self.assertEqual(report["rightExclusionProxy"]["coloredHighlightFrames"], 1)
            self.assertIn("AUTHENTICATED_CURRENT_PHONE_PLAN_MISSING",
                          report["hardAndReviewHolds"])
            out = root / "scorecard.json"
            write_once(out, report)
            self.assertEqual(json.loads(out.read_text()), report)
            original = out.read_bytes()
            with self.assertRaisesRegex(ValueError, "SCORECARD_OUTPUT_UNSAFE"):
                write_once(out, report)
            self.assertEqual(out.read_bytes(), original)
            report["mayPublish"] = True
            with self.assertRaisesRegex(ValueError, "UNSAFE_SCORECARD"):
                write_once(root / "forged.json", report)

    def test_duplicate_json_keys_and_cross_film_screen_are_never_accepted(self):
        from lane5_candidate_scorecard import _read_json
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "screen.json"
            p.write_bytes(b'{"filmSha256":"a","filmSha256":"b"}')
            with self.assertRaisesRegex(ValueError, "INVALID_JSON"):
                _read_json(p)
            with self.assertRaisesRegex(ValueError, "JSON_PIN_MISMATCH"):
                _read_json(p, h(b"different"))

    def test_external_original_wav_pin_required(self):
        from lane5_candidate_scorecard import _same_pin
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "narrator.wav"
            p.write_bytes(b"fixed WAV identity")
            self.assertEqual(_same_pin(p, h(p.read_bytes())), h(p.read_bytes()))
            with self.assertRaisesRegex(ValueError, "SOURCE_BYTES_DO_NOT_MATCH_EXTERNAL_PIN"):
                _same_pin(p, h(b"foreign WAV"))
            with self.assertRaisesRegex(ValueError, "MISSING_INDEPENDENT_EXPECTED_SHA"):
                _same_pin(p, True)


if __name__ == "__main__":
    unittest.main()
