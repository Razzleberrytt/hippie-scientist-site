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
            # A downstream consumer must not persist apparently-approved
            # results just by mutating this report after its physical checks.
            baseline = json.loads(json.dumps(report))
            authority_forgeries = {
                "mayPublish": True,
                "externalIndependentReviewed": True,
                "physicalPhoneReviewed": True,
                "firstFinalRenderProven": True,
                "firstExcellentMasterAccepted": True,
                "fiveRenderStreakAccepted": True,
                "atomicCardsNewlyAccepted": 1,
                "calibratedPremiumCraftScore": 100,
                "machineReviewed": False,
                "status": "PRODUCTION_APPROVED",
            }
            for field, invalid_value in authority_forgeries.items():
                with self.subTest(forged=field):
                    forged = dict(baseline)
                    forged[field] = invalid_value
                    with self.assertRaisesRegex(ValueError, "UNSAFE_SCORECARD"):
                        write_once(root / ("forged-" + field + ".json"), forged)
            forged = dict(baseline)
            forged["hardAndReviewHolds"] = []
            with self.assertRaisesRegex(ValueError, "UNSAFE_SCORECARD"):
                write_once(root / "no-required-holds.json", forged)
            forged = dict(baseline)
            forged.pop("physicalPhoneReviewed")
            with self.assertRaisesRegex(ValueError, "UNSAFE_SCORECARD"):
                write_once(root / "missing-approval-field.json", forged)
            forged = dict(baseline)
            forged["atomicCardsNewlyAccepted"] = False  # bool is NOT zero cards
            with self.assertRaisesRegex(ValueError, "UNSAFE_SCORECARD"):
                write_once(root / "boolean-atom-credit.json", forged)
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



class PhysicalStatSurfaceTests(unittest.TestCase):
    def check_surfaces(self, *, path_after_ctime=10, fd_after_ctime=20,
                       path_after_inode=7):
        from types import SimpleNamespace
        from lane5_candidate_scorecard import _physical_sha
        def signature(ctime, inode=7):
            return SimpleNamespace(st_dev=1, st_ino=inode, st_size=7,
                                   st_mtime_ns=30, st_ctime_ns=ctime)
        with tempfile.TemporaryDirectory() as td:
            candidate = Path(td) / 'unchanged.bin'
            candidate.write_bytes(b'payload')
            with patch('lane5_candidate_scorecard._safe_file', side_effect=[
                    signature(10), signature(path_after_ctime, path_after_inode)]), \
                 patch('lane5_candidate_scorecard.os.fstat', side_effect=[
                    signature(20), signature(fd_after_ctime)]):
                return _physical_sha(candidate)

    def test_stable_path_birthtime_and_descriptor_changetime_may_differ(self):
        self.assertEqual(self.check_surfaces(), h(b'payload'))

    def test_descriptor_ctime_change_rejected_with_stable_path(self):
        with self.assertRaisesRegex(ValueError, 'FILE_CHANGED_DURING_REVIEW'):
            self.check_surfaces(fd_after_ctime=21)

    def test_path_ctime_change_rejected_with_stable_descriptor(self):
        with self.assertRaisesRegex(ValueError, 'FILE_CHANGED_DURING_REVIEW'):
            self.check_surfaces(path_after_ctime=11)

    def test_path_replacement_after_open_rejected(self):
        with self.assertRaisesRegex(ValueError, 'FILE_CHANGED_DURING_REVIEW'):
            self.check_surfaces(path_after_inode=8)


class ActualFileMutationTests(unittest.TestCase):
    def test_mutation_with_restored_mtime_is_rejected(self):
        from lane5_candidate_scorecard import _physical_sha
        with tempfile.TemporaryDirectory() as td:
            candidate = Path(td) / 'actual.bin'
            candidate.write_bytes(b'payload')
            before = candidate.stat()
            original_open = open
            class MutatingReader:
                def __init__(self, stream):
                    self.stream, self.changed = stream, False
                def __enter__(self): return self
                def __exit__(self, *args): return self.stream.__exit__(*args)
                def fileno(self): return self.stream.fileno()
                def seek(self, *args): return self.stream.seek(*args)
                def read(self, size):
                    data = self.stream.read(size)
                    if not self.changed:
                        candidate.write_bytes(b'changed')
                        os.utime(candidate, ns=(before.st_atime_ns, before.st_mtime_ns))
                        self.changed = True
                    return data
            def mutate_on_read(*args, **kwargs):
                return MutatingReader(original_open(*args, **kwargs))
            with patch('lane5_candidate_scorecard.open', side_effect=mutate_on_read,
                       create=True):
                with self.assertRaisesRegex(ValueError, 'FILE_CHANGED_DURING_REVIEW'):
                    _physical_sha(candidate)
            self.assertEqual(candidate.read_bytes(), b'changed')
            self.assertEqual(candidate.stat().st_mtime_ns, before.st_mtime_ns)

    def test_prior_screen_rehashed_but_false_baseline_is_rejected(self):
        """An internally inconsistent rehashed predecessor cannot fake improvement."""
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            film, wav, story, current, prior = [root / name for name in (
                "film.mp4", "narrator.wav", "story.json", "current.json", "prior.json")]
            film.write_bytes(b"real video physically validated by separate media suite")
            with wave.open(str(wav), "wb") as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(24000)
                w.writeframes(b"\x00\x00" * 12000)
            film_sha = h(film.read_bytes())
            old_film_sha = h(b"distinct previously encoded video")
            prior_story_sha = h(b"previous storyboard")
            story.write_text(json.dumps({
                "schema": "ths-lane3-research-visual-treatment-story-v1",
                "encodedH264Sha256": film_sha,
                "shots": [{"shot": str(i)} for i in range(9)],
                "mayPublish": False, "realPhonePlaybackVerified": False,
                "independentCraftCalibrationPassed": False,
                "phonePlanSha256": None
            }))
            story_sha = h(story.read_bytes())
            current.write_text(json.dumps(screen(film_sha, story_sha, bright=[7])))
            old = screen(old_film_sha, prior_story_sha, bright=[1, 2], colored=[4])
            fake_av = {"fullVideoAudioPhysicalDecode": True, "nativeFrames": 12,
                       "width": 64, "height": 64, "fps": 30, "audioCodec": "aac"}
            def run(old_screen):
                prior.write_text(json.dumps(old_screen))
                with patch("lane5_candidate_scorecard._physical_av", return_value=fake_av):
                    return score_candidate(
                        film=film, wav=wav, story_path=story, screen_path=current,
                        expected_film_sha=film_sha,
                        expected_wav_sha=h(wav.read_bytes()),
                        expected_story_sha=story_sha,
                        expected_screen_sha=h(current.read_bytes()),
                        previous_screen_path=prior,
                        expected_previous_screen_sha=h(prior.read_bytes()),
                        dimensions=(64, 64, 12))
            good = run(old)
            self.assertEqual(good["priorCandidateComparison"]["priorReportedBrightFrames"], 2)
            self.assertEqual(good["priorCandidateComparison"]["priorReportedHighlightFrames"], 1)
            self.assertEqual(good["priorCandidateComparison"]["brightFrameDelta"], -1)
            self.assertIs(good["priorCandidateComparison"]["priorPhysicalDecodeReplayedHere"], False)
            self.assertIs(good["mayPublish"], False)
            inconsistent = json.loads(json.dumps(old))
            inconsistent["brightNeutralPositiveFrameCount"] = 0
            with self.assertRaisesRegex(ValueError, "SCREEN_SUMMARY_CONTRADICTS_FRAMES"):
                run(inconsistent)
            duplicate = json.loads(json.dumps(old))
            duplicate["perFrame"][2]["frameIndex"] = 1
            with self.assertRaisesRegex(ValueError, "SCREEN_FRAME_SEQUENCE_DRIFT"):
                run(duplicate)
            wrong_scope = json.loads(json.dumps(old))
            wrong_scope["rightBoundaryX"] = 777
            with self.assertRaisesRegex(ValueError, "CROSS_FILM_OR_UNSCOPED_MOBILE_SCREEN"):
                run(wrong_scope)
            no_story = json.loads(json.dumps(old))
            no_story["storyboardSha256"] = None
            with self.assertRaisesRegex(ValueError, "PRIOR_STORYBOARD_SHA_INVALID"):
                run(no_story)



class SourceCardGainTests(unittest.TestCase):
    def create_ink(self, film, *, difference=0):
        names = ("mitragynine_cid_line", "pubchem_heading",
                 "seven_oh_cid_line", "cid_definition_line",
                 "molecular_formula", "pubchem_source_url")
        bands = [(717, 750), (775, 840), (890, 928),
                 (947, 973), (1019, 1055), (1127, 1163)]
        rows = []
        for name, (start, end) in zip(names, bands):
            if name == "mitragynine_cid_line":
                end += difference
            height = end - start + 1
            projection = {str(w): round(height * w / 1080, 2)
                          for w in (320, 375, 430)}
            rows.append({
                "lineIdentifier": name,
                "rowBandsInFirstFrame": [start, end],
                "observedHeightPxRange": [height, height],
                "sourceCardFramesObserved": 116,
                "nativePixelHeight": float(height),
                "projectedGlyphInkHeightsPx": projection,
                "sub14pxAt320": projection["320"] < 14,
                "sub14pxAt375": projection["375"] < 14,
            })
        return {
            "schema": "ths-lane4-source-card-native-ink-proxy-v1",
            "filmSha256": film, "decodedFrameWindow": [822, 937],
            "physicallyInspectedFrames": 116,
            "nativeRegion": [60, 680, 750, 1200],
            "pixelThreshold": "max(R,G,B)>=90; >=7 candidate columns per row; >=8 consecutive rows",
            "criterionIsCalibratedHumanReadability": False,
            "phoneViewportWidths": [320, 375, 430],
            "reviewThresholdPx": 14, "lines": rows,
            "sub14pxAt320Lines": sum(r["sub14pxAt320"] for r in rows),
            "sub14pxAt375Lines": sum(r["sub14pxAt375"] for r in rows),
            "physicalPhoneReviewed": False,
            "independentHumanComprehensionReviewed": False,
            "mayPublish": False
        }

    def test_focus_animation_cannot_pose_as_text_size_gain_and_scope_is_held(self):
        from lane5_candidate_scorecard import assess_source_card_glyph_gain
        first, second = h(b"real prior film"), h(b"new focus video")
        with tempfile.TemporaryDirectory() as td:
            old, new = Path(td) / "old.json", Path(td) / "new.json"
            old.write_text(json.dumps(self.create_ink(first)))
            new.write_text(json.dumps(self.create_ink(second)))
            def check():
                return assess_source_card_glyph_gain(
                    previous_path=old, current_path=new,
                    previous_sha=h(old.read_bytes()), current_sha=h(new.read_bytes()),
                    previous_film_sha=first, current_film_sha=second)
            result = check()
            self.assertTrue(result["noMeasuredTypeSizeGain"])
            self.assertEqual(result["researchDecision"],
                             "STOP_NO_MEASURABLE_SOURCE_TEXT_SIZE_GAIN")
            self.assertEqual(len(result["currentLinesBelow320px14pxProxy"]), 5)
            self.assertFalse(result["mayPublish"])
            self.assertFalse(result["actualMediaDecodedByThisFunction"])
            self.assertFalse(result["firstExcellentMasterAccepted"])
            changed = self.create_ink(second, difference=15)
            new.write_text(json.dumps(changed))
            result = check()
            self.assertFalse(result["noMeasuredTypeSizeGain"])
            self.assertEqual(result["researchDecision"],
                             "REVIEW_SOURCE_CARD_SIZE_CHANGE_INDEPENDENTLY")
            self.assertIn("mitragynine_cid_line", result["newLinesAbove320px14pxProxy"])
            self.assertFalse(result["mayPublish"])

    def test_source_card_gain_guards_rehashed_forgery_and_partial_scene(self):
        from lane5_candidate_scorecard import assess_source_card_glyph_gain
        a, b = h(b"candidate A"), h(b"candidate B")
        with tempfile.TemporaryDirectory() as td:
            old, new = Path(td) / "old.json", Path(td) / "new.json"
            old.write_text(json.dumps(self.create_ink(a)))
            def reject(report, code):
                new.write_text(json.dumps(report))
                with self.assertRaisesRegex(ValueError, code):
                    assess_source_card_glyph_gain(
                        previous_path=old, current_path=new,
                        previous_sha=h(old.read_bytes()),
                        current_sha=h(new.read_bytes()),
                        previous_film_sha=a, current_film_sha=b)
            value = self.create_ink(b)
            value["lines"][0]["projectedGlyphInkHeightsPx"]["320"] = 99.0
            reject(value, "SOURCE_CARD_FORGED_PROJECTED_SIZE")
            value = self.create_ink(b)
            value["sub14pxAt320Lines"] = 0
            reject(value, "SOURCE_CARD_FORGED_SUMMARY_COUNT")
            value = self.create_ink(b)
            value["physicallyInspectedFrames"] = 115
            reject(value, "SOURCE_CARD_REVIEW_SCOPE_OR_AUTHORITY_INVALID")
            value = self.create_ink(b)
            value["lines"][0]["lineIdentifier"] = "pubchem_heading"
            reject(value, "SOURCE_CARD_LINE_IDENTITY_DUPLICATE_OR_UNKNOWN")
            value = self.create_ink(b)
            value["physicalPhoneReviewed"] = True
            reject(value, "SOURCE_CARD_REVIEW_SCOPE_OR_AUTHORITY_INVALID")
            value = self.create_ink(b)
            value["filmSha256"] = a
            reject(value, "SOURCE_CARD_REVIEW_SCOPE_OR_AUTHORITY_INVALID")


if __name__ == "__main__":
    unittest.main()
