"""Research-only Lane5 decoded candidate scorecard contracts."""
import hashlib
import json
import os
import subprocess
from types import SimpleNamespace
from pathlib import Path
import tempfile
import unittest
import wave
from unittest.mock import patch

from lane5_candidate_scorecard import (
    _screen_stats, _windows, _physical_av, _decoded_audio_coverage, score_candidate, write_once, _verified_original_pcm_samples, _receive_phone_plan, _receive_decoded_visual_critic, hold
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
    def test_json_intake_growth_after_preflight_is_bounded_and_held(self):
        from lane5_candidate_scorecard import _read_json, MAX_JSON
        with tempfile.TemporaryDirectory() as td:
            candidate = Path(td) / "input.json"
            candidate.write_text('{"status":"RESEARCH_ONLY"}')
            original_open = os.open
            intercepted = []
            def grow_at_open(path, flags, *args, **kwargs):
                if os.fspath(path) == os.fspath(candidate):
                    intercepted.append(True)
                    with candidate.open("ab") as writer:
                        writer.write(b" " * (MAX_JSON + 1))
                return original_open(path, flags, *args, **kwargs)
            with patch("lane5_candidate_scorecard.os.open",
                       side_effect=grow_at_open):
                with self.assertRaisesRegex(ValueError, "UNBOUNDED_JSON"):
                    _read_json(candidate)
            self.assertEqual(len(intercepted), 1)
            self.assertTrue(candidate.exists())

    def test_json_intake_windows_path_descriptor_ctime_surfaces(self):
        from lane5_candidate_scorecard import _read_json, _safe_file
        with tempfile.TemporaryDirectory() as td:
            candidate = Path(td) / "input.json"
            candidate.write_text('{"status":"RESEARCH_ONLY"}')
            actual_safe_file = _safe_file

            def windows_path_stat_surface(path, *, maximum=None):
                original = actual_safe_file(path, maximum=maximum)
                # Windows may expose creation time via stat(path) but
                # a different change time via fstat(fd).
                return SimpleNamespace(
                    st_mode=original.st_mode,
                    st_dev=original.st_dev,
                    st_ino=original.st_ino,
                    st_size=original.st_size,
                    st_mtime_ns=original.st_mtime_ns,
                    st_ctime_ns=original.st_ctime_ns + 86400000000000,
                )

            with patch("lane5_candidate_scorecard._safe_file",
                       side_effect=windows_path_stat_surface):
                record, digest = _read_json(candidate)
            self.assertEqual(record["status"], "RESEARCH_ONLY")
            self.assertEqual(digest, h(candidate.read_bytes()))

    def test_json_intake_detects_same_descriptor_midread_mutation(self):
        from lane5_candidate_scorecard import _read_json
        with tempfile.TemporaryDirectory() as td:
            candidate = Path(td) / "input.json"
            before = b'{"status":"RESEARCH_A"}'
            after = b'{"status":"RESEARCH_B"}'
            self.assertEqual(len(before), len(after))
            candidate.write_bytes(before)
            original_fdopen = os.fdopen

            class SwapAfterFirstRead:
                def __init__(self, stream):
                    self.stream = stream
                    self.once = True

                def __enter__(self):
                    self.stream.__enter__()
                    return self

                def __exit__(self, *args):
                    return self.stream.__exit__(*args)

                def fileno(self):
                    return self.stream.fileno()

                def seek(self, *args):
                    return self.stream.seek(*args)

                def read(self, *args):
                    observed = self.stream.read(*args)
                    if self.once:
                        self.once = False
                        with candidate.open("r+b") as writer:
                            writer.write(after)
                            writer.flush()
                            os.fsync(writer.fileno())
                    return observed

            with patch("lane5_candidate_scorecard.os.fdopen",
                       side_effect=lambda fd, mode:
                           SwapAfterFirstRead(original_fdopen(fd, mode))):
                with self.assertRaisesRegex(ValueError, "JSON_CHANGED_DURING_READ"):
                    _read_json(candidate)
            self.assertEqual(candidate.read_bytes(), after)

    def test_visual_critic_exact_film_negative_receipt_and_adversarial_holds(self):
        movie = h(b"exact-current-encoded-film")
        dims = (1080, 1920, 360)
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "actual-visual-critic.json"
            base = {
                "schemaVersion": "ths-autonomous-film-critic-research-v1",
                "actualVideoSha256": movie,
                "actualSourceResolution": [1080, 1920],
                "actualDurationSeconds": 12,
                "oneHzOpticalScreenSamples": 12,
                "samples": 6,
                "sampleEverySeconds": 2,
                "critiqueScope": "AUTONOMOUS_ACTUAL_PIXELS_NEGATIVE_SCREENING_NOT_HUMAN_QUALITY",
                "mayPublish": False,
                "excellentFirstRenderCredited": False,
                "automaticallyApprovedScientificClaims": False,
                "automaticallyApprovedNaturalVoice": False,
                "automaticallyApprovedPremiumCraft": False,
                "issues": [],
                "reviewCandidates": [],
                "decision": "AWAIT_MULTIMODAL_SCIENCE_VOICE_CRAFT_EVIDENCE",
                "sustainedRepeatWindowsSec": [],
                "centerHeroStasisPeripheralMotionWindowsSec": [],
                "twoStateAlternationWindowsSec": [],
                "interleavedBlankPhaseWindowsSec": [],
            }

            def inspect(changes=None):
                data = json.loads(json.dumps(base))
                if changes:
                    changes(data)
                path.write_text(json.dumps(data))
                sha = h(path.read_bytes())
                return _receive_decoded_visual_critic(
                    movie, dims, critic_path=path, expected_critic_sha=sha)

            receipt, reason = inspect()
            self.assertEqual(
                reason, "DECODED_VISUAL_NEGATIVE_SCREEN_CLEAN_NOT_QUALITY_APPROVAL")
            self.assertEqual(receipt["filmSha256"], movie)
            self.assertEqual(receipt["reportSha256"], h(path.read_bytes()))
            self.assertFalse(receipt["independentCraftReviewed"])
            self.assertFalse(receipt["mayPublish"])

            def red(data):
                data["issues"] = ["SUSTAINED_REPEATED_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR"]
                data["decision"] = "AUTO_REVISE"
                data["sustainedRepeatWindowsSec"] = [
                    {"startSec": 2, "endSec": 8, "repeatedPairCount": 3}]
            result, reason = inspect(red)
            self.assertEqual(reason, "DECODED_VISUAL_REVISE_REPORTED")
            self.assertEqual(result["issues"], [
                "SUSTAINED_REPEATED_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR"])

            def advisory(data):
                data["reviewCandidates"] = [
                    "CENTERED_TEACHING_HERO_STASIS_MASKED_BY_PERIPHERAL_MOTION"]
                data["decision"] = "CRAFT_REVIEW_HOLD"
                data["centerHeroStasisPeripheralMotionWindowsSec"] = [
                    {"startSec": 2, "endSec": 8, "repeatedPairCount": 3}]
            self.assertEqual(inspect(advisory)[1],
                             "DECODED_VISUAL_CRAFT_REVIEW_CANDIDATES")
            no_receipt, reason = _receive_decoded_visual_critic(movie, dims)
            self.assertIsNone(no_receipt)
            self.assertEqual(reason, "SAME_FILM_DECODED_VISUAL_CRITIC_NOT_RECEIVED")
            with self.assertRaisesRegex(ValueError, "REQUIRED_TOGETHER"):
                _receive_decoded_visual_critic(
                    movie, dims, critic_path=path)
            with self.assertRaisesRegex(ValueError, "JSON_PIN_MISMATCH"):
                _receive_decoded_visual_critic(
                    movie, dims, critic_path=path, expected_critic_sha=h(b"stale"))
            with self.assertRaisesRegex(ValueError, "DIFFERENT_FILM_OR_GEOMETRY"):
                inspect(lambda d: d.update(actualVideoSha256=h(b"different-film")))
            with self.assertRaisesRegex(ValueError, "FORGED_RELEASE_OR_SCOPE"):
                inspect(lambda d: d.update(automaticallyApprovedPremiumCraft=True))
            with self.assertRaisesRegex(ValueError, "SAMPLE_OR_DURATION_MISMATCH"):
                inspect(lambda d: d.update(oneHzOpticalScreenSamples=30))
            with self.assertRaisesRegex(ValueError, "DECISION_FINDINGS_CONFLICT"):
                inspect(lambda d: d.update(decision="AUTO_REVISE"))
            with self.assertRaisesRegex(ValueError, "TIMECODE_INVALID"):
                inspect(lambda d: d.update(sustainedRepeatWindowsSec=[
                    {"startSec": 95, "endSec": 100, "repeatedPairCount": 2}]))
            with self.assertRaisesRegex(ValueError, "FINDING_TIMELINE_CONFLICT"):
                inspect(lambda d: d.update(sustainedRepeatWindowsSec=[
                    {"startSec": 2, "endSec": 8, "repeatedPairCount": 3}]))
            with self.assertRaisesRegex(ValueError, "FINDING_TIMELINE_CONFLICT"):
                inspect(lambda d: d.update(
                    reviewCandidates=[
                        "TWO_STATE_LAYOUT_OSCILLATION_WITHOUT_VISUAL_PROGRESSION"],
                    decision="CRAFT_REVIEW_HOLD"))
            with self.assertRaisesRegex(ValueError, "FINDINGS_INVALID"):
                inspect(lambda d: d.update(issues=["UNSUPPORTED_NEW_CODE"]))
            with self.assertRaisesRegex(ValueError, "FINDINGS_INVALID"):
                inspect(lambda d: d.update(reviewCandidates=[
                    "TWO_STATE_LAYOUT_OSCILLATION_WITHOUT_VISUAL_PROGRESSION"] * 2))

    def test_scorecard_same_film_visual_critic_veto_cannot_be_erased(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            film, wav = root / "film.mp4", root / "voice.wav"
            story_path = root / "story.json"
            screen_path = root / "screen.json"
            visual_path = root / "visual.json"
            film.write_bytes(b"mocked decoded film media research fixture")
            with wave.open(str(wav), "wb") as wavefile:
                wavefile.setnchannels(1)
                wavefile.setsampwidth(2)
                wavefile.setframerate(24000)
                wavefile.writeframes(b"\x00\x00" * 24000)
            movie_sha, wav_sha = h(film.read_bytes()), h(wav.read_bytes())
            story_path.write_text(json.dumps({
                "schema": "ths-lane3-research-visual-treatment-story-v1",
                "encodedH264Sha256": movie_sha,
                "shots": [{"shot": str(i)} for i in range(9)],
                "mayPublish": False,
                "realPhonePlaybackVerified": False,
                "independentCraftCalibrationPassed": False,
                "phonePlanSha256": None,
            }))
            story_sha = h(story_path.read_bytes())
            screen_path.write_text(json.dumps(screen(movie_sha, story_sha, frames=360)))
            visual_path.write_text(json.dumps({
                "schemaVersion": "ths-autonomous-film-critic-research-v1",
                "actualVideoSha256": movie_sha,
                "actualSourceResolution": [1080, 1920],
                "actualDurationSeconds": 12,
                "oneHzOpticalScreenSamples": 12,
                "samples": 6,
                "sampleEverySeconds": 2,
                "critiqueScope": "AUTONOMOUS_ACTUAL_PIXELS_NEGATIVE_SCREENING_NOT_HUMAN_QUALITY",
                "mayPublish": False,
                "excellentFirstRenderCredited": False,
                "automaticallyApprovedScientificClaims": False,
                "automaticallyApprovedNaturalVoice": False,
                "automaticallyApprovedPremiumCraft": False,
                "issues": ["MISSING_RECOGNIZABLE_SUBJECT_OR_NEAR_BLANK_CENTRAL_STAGE"],
                "reviewCandidates": [],
                "decision": "AUTO_REVISE",
                "sustainedRepeatWindowsSec": [],
                "centerHeroStasisPeripheralMotionWindowsSec": [],
                "twoStateAlternationWindowsSec": [],
                "interleavedBlankPhaseWindowsSec": [],
            }))
            with patch("lane5_candidate_scorecard._physical_av", return_value={
                "fullVideoAudioPhysicalDecode": True,
                "nativeFrames": 360, "width": 1080,
                "height": 1920, "fps": 30, "audioCodec": "aac",
            }):
                result = score_candidate(
                    film=film, wav=wav, story_path=story_path,
                    screen_path=screen_path, expected_film_sha=movie_sha,
                    expected_wav_sha=wav_sha, expected_story_sha=story_sha,
                    expected_screen_sha=h(screen_path.read_bytes()),
                    critic_path=visual_path,
                    expected_critic_sha=h(visual_path.read_bytes()),
                    dimensions=(1080, 1920, 360))
            self.assertIn("DECODED_VISUAL_REVISE_REPORTED",
                          result["hardAndReviewHolds"])
            self.assertEqual(result["decodedVisualNegativeScreenReceipt"]["decision"],
                             "AUTO_REVISE")
            self.assertFalse(result["mayPublish"])
            write_once(root / "valid.json", result)
            altered = json.loads(json.dumps(result))
            altered["hardAndReviewHolds"].remove("DECODED_VISUAL_REVISE_REPORTED")
            with self.assertRaisesRegex(ValueError, "RECEIPT_AND_HOLD_INCONSISTENT"):
                write_once(root / "erased.json", altered)
            altered = json.loads(json.dumps(result))
            altered["decodedVisualNegativeScreenReceipt"]["independentCraftReviewed"] = True
            with self.assertRaisesRegex(ValueError, "RESEARCH_RECEIPT_FORGED"):
                write_once(root / "forged.json", altered)

    def test_exact_phone_plan_bytes_join_keeps_all_actual_phone_gates_held(self):
        movie = h(b"current exact film")
        with tempfile.TemporaryDirectory() as td:
            plan_file = Path(td) / "phone.json"
            plan = {
                "status": "RESEARCH_ONLY", "releaseApproved": False,
                "expectedVideoSha256": movie,
                "platforms": ["tiktok", "shorts"],
                "shots": [{"id": "scene_" + str(i),
                           "startSec": i / 3, "endSec": (i + 1) / 3}
                          for i in range(9)],
            }
            plan_file.write_text(json.dumps(plan))
            plan_sha = h(plan_file.read_bytes())
            story = {"phonePlanSha256": plan_sha}
            receipt, reason = _receive_phone_plan(
                story, movie, phone_plan_path=plan_file,
                expected_phone_plan_sha=plan_sha, native_frames=90)
            self.assertEqual(receipt["planSha256"], plan_sha)
            self.assertEqual(receipt["filmSha256"], movie)
            self.assertFalse(receipt["actualRenderedSafeZonesValidated"])
            self.assertFalse(receipt["physicalHandsetReviewed"])
            self.assertFalse(receipt["mayPublish"])
            self.assertEqual(
                reason, "PHONE_PLAN_BYTES_JOINED_RESEARCH_ONLY_PHONE_QA_UNVERIFIED")
            none_received, missing = _receive_phone_plan(story, movie)
            self.assertIsNone(none_received)
            self.assertEqual(
                missing, "PHONE_PLAN_DIGEST_CLAIM_WITHOUT_INDEPENDENT_PLAN_BYTES")
            with self.assertRaisesRegex(ValueError, "REQUIRED_TOGETHER"):
                _receive_phone_plan(story, movie, phone_plan_path=plan_file)
            with self.assertRaisesRegex(ValueError, "STORY_PHONE_PLAN_BYTES_MISMATCH"):
                _receive_phone_plan({"phonePlanSha256": h(b"unrelated")}, movie,
                    phone_plan_path=plan_file, expected_phone_plan_sha=plan_sha)
            with self.assertRaisesRegex(ValueError, "JSON_PIN_MISMATCH"):
                _receive_phone_plan(story, movie, phone_plan_path=plan_file,
                    expected_phone_plan_sha=h(b"changed external pin"))
            plan["expectedVideoSha256"] = h(b"different film")
            plan_file.write_text(json.dumps(plan))
            bad_sha = h(plan_file.read_bytes())
            with self.assertRaisesRegex(ValueError, "PHONE_PLAN_DIFFERENT_EXACT_FILM"):
                _receive_phone_plan({"phonePlanSha256": bad_sha}, movie,
                    phone_plan_path=plan_file, expected_phone_plan_sha=bad_sha)
            plan["expectedVideoSha256"] = movie
            plan["realHandsetApproved"] = True
            plan_file.write_text(json.dumps(plan))
            bad_sha = h(plan_file.read_bytes())
            with self.assertRaisesRegex(ValueError, "PHONE_PLAN_PRODUCER_APPROVAL"):
                _receive_phone_plan({"phonePlanSha256": bad_sha}, movie,
                    phone_plan_path=plan_file, expected_phone_plan_sha=bad_sha)
            plan["realHandsetApproved"] = False
            plan["shots"].pop()
            plan_file.write_text(json.dumps(plan))
            bad_sha = h(plan_file.read_bytes())
            with self.assertRaisesRegex(ValueError, "PHONE_PLAN_SHOT_INVENTORY"):
                _receive_phone_plan({"phonePlanSha256": bad_sha}, movie,
                    phone_plan_path=plan_file, expected_phone_plan_sha=bad_sha)

    def test_phone_plan_duplicate_gapped_and_short_timelines_hold(self):
        movie = h(b"actual film with bad declared shots")
        shots = [{"id": "scene_" + str(i),
                  "startSec": i / 3, "endSec": (i + 1) / 3}
                 for i in range(9)]
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "plan.json"
            base = {"status": "RESEARCH_ONLY", "releaseApproved": False,
                    "expectedVideoSha256": movie,
                    "platforms": ["tiktok", "shorts"], "shots": shots}

            def run(mutate, *, frame_count=90):
                plan = json.loads(json.dumps(base))
                mutate(plan["shots"])
                path.write_text(json.dumps(plan))
                sha = h(path.read_bytes())
                return _receive_phone_plan(
                    {"phonePlanSha256": sha}, movie, phone_plan_path=path,
                    expected_phone_plan_sha=sha, native_frames=frame_count)

            with self.assertRaisesRegex(ValueError, "INVALID_OR_DUPLICATE_SHOT_ID"):
                run(lambda shots: shots[3].update(id=shots[0]["id"]))
            with self.assertRaisesRegex(ValueError, "NONCONTIGUOUS_SHOT_TIMELINE"):
                run(lambda shots: shots[4].update(
                    startSec=shots[4]["startSec"] + 0.15))
            with self.assertRaisesRegex(ValueError, "INCOMPLETE_FILM_COVERAGE"):
                run(lambda shots: shots[8].update(
                    endSec=shots[8]["endSec"] - 0.20))
            with self.assertRaisesRegex(ValueError, "NONCONTIGUOUS_SHOT_TIMELINE"):
                run(lambda shots: shots[2].update(
                    endSec=shots[2]["startSec"]))
            with self.assertRaisesRegex(ValueError, "PHONE_PLAN_PHYSICAL_FRAME_DURATION_REQUIRED"):
                run(lambda shots: None, frame_count=None)
            valid, hold_reason = run(lambda shots: None)
            self.assertEqual(valid["declaredShots"], 9)
            self.assertEqual(hold_reason,
                             "PHONE_PLAN_BYTES_JOINED_RESEARCH_ONLY_PHONE_QA_UNVERIFIED")
            self.assertFalse(valid["physicalHandsetReviewed"])

    def test_scorecard_physically_receives_same_film_phone_plan_without_phone_approval(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            film, wav = root / "film.mp4", root / "voice.wav"
            story_path, screen_path = root / "story.json", root / "screen.json"
            plan_path = root / "plan.json"
            film.write_bytes(b"research-film-placeholder-mocked-for-AV-only")
            with wave.open(str(wav), "wb") as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000)
                w.writeframes(b"\x01\x00" * 12000)
            movie_sha, wav_sha = h(film.read_bytes()), h(wav.read_bytes())
            plan_path.write_text(json.dumps({
                "status": "RESEARCH_ONLY", "releaseApproved": False,
                "expectedVideoSha256": movie_sha,
                "platforms": ["tiktok", "shorts"],
                "shots": [{"id": "scene_" + str(i),
                           "startSec": i / 3, "endSec": (i + 1) / 3}
                          for i in range(9)],
            }))
            plan_sha = h(plan_path.read_bytes())
            story_path.write_text(json.dumps({
                "schema": "ths-lane3-research-visual-treatment-story-v1",
                "encodedH264Sha256": movie_sha,
                "shots": [{"id": "scene_" + str(i),
                           "startSec": i / 3, "endSec": (i + 1) / 3}
                          for i in range(9)],
                "mayPublish": False, "realPhonePlaybackVerified": False,
                "independentCraftCalibrationPassed": False,
                "phonePlanSha256": plan_sha,
            }))
            story_sha = h(story_path.read_bytes())
            screen_path.write_text(json.dumps(screen(movie_sha, story_sha, frames=90)))
            av = {"fullVideoAudioPhysicalDecode": True, "nativeFrames": 90,
                  "width": 64, "height": 64, "fps": 30, "audioCodec": "aac"}
            with patch("lane5_candidate_scorecard._physical_av", return_value=av):
                result = score_candidate(
                    film=film, wav=wav, story_path=story_path,
                    screen_path=screen_path, expected_film_sha=movie_sha,
                    expected_wav_sha=wav_sha, expected_story_sha=story_sha,
                    expected_screen_sha=h(screen_path.read_bytes()),
                    phone_plan_path=plan_path, expected_phone_plan_sha=plan_sha,
                    dimensions=(64, 64, 90))
            self.assertEqual(result["phonePlanResearchReceipt"]["planSha256"], plan_sha)
            self.assertIn("PHONE_PLAN_BYTES_JOINED_RESEARCH_ONLY_PHONE_QA_UNVERIFIED",
                          result["hardAndReviewHolds"])
            self.assertIn("REAL_HANDSET_REVIEW_MISSING", result["hardAndReviewHolds"])
            self.assertFalse(result["physicalPhoneReviewed"])
            self.assertFalse(result["mayPublish"])
            self.assertFalse(result["firstExcellentMasterAccepted"])
            write_once(root / "scorecard.json", result)
            forged = json.loads(json.dumps(result))
            forged["phonePlanResearchReceipt"]["physicalHandsetReviewed"] = True
            with self.assertRaisesRegex(ValueError, "PHONE_PLAN_RESEARCH_RECEIPT_FORGED"):
                write_once(root / "forged.json", forged)
            no_hold = json.loads(json.dumps(result))
            no_hold["hardAndReviewHolds"].remove(
                "PHONE_PLAN_BYTES_JOINED_RESEARCH_ONLY_PHONE_QA_UNVERIFIED")
            with self.assertRaisesRegex(ValueError, "PHONE_PLAN_RECEIPT_AND_HOLD_INCONSISTENT"):
                write_once(root / "no-hold.json", no_hold)

    def test_original_pcm_header_cannot_hide_a_physically_truncated_source(self):
        # An intact WAV header can claim one second of PCM while the file
        # contains only 5 ms. The legacy scorecard trusted getnframes alone.
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            full = root / "complete.wav"
            partial = root / "truncated.wav"
            empty = root / "empty.wav"
            with wave.open(str(full), "wb") as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000)
                w.writeframes(b"\x01\x00" * 24000)
            with wave.open(str(empty), "wb") as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000)
                w.writeframes(b"")
            partial.write_bytes(full.read_bytes()[:44 + 240])
            with wave.open(str(partial), "rb") as w:
                self.assertEqual(w.getnframes(), 24000)
                self.assertEqual(len(w.readframes(24000)), 240)
            self.assertEqual(_verified_original_pcm_samples(full, h(full.read_bytes())), 24000)
            with self.assertRaisesRegex(ValueError, "ORIGINAL_WAV_PCM_TRUNCATED"):
                _verified_original_pcm_samples(partial, h(partial.read_bytes()))
            with self.assertRaisesRegex(ValueError, "EMPTY_ORIGINAL_WAV_PCM"):
                _verified_original_pcm_samples(empty, h(empty.read_bytes()))
            with self.assertRaisesRegex(ValueError, "ORIGINAL_WAV_CHANGED_DURING_PCM_READ"):
                _verified_original_pcm_samples(full, h(b"wrong-original"))

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
            # The five-lane development plan folds former Lane 6 receipt
            # intake into Lane 5, without allowing self-issued quality proof.
            self.assertIn("FIVE_LANE_INDEPENDENT_EXACT_BYTE_RECEIPTS_INCOMPLETE",
                          report["hardAndReviewHolds"])
            self.assertEqual(report["nextDependency"],
                             "LANE5_SAME_FILM_AUTHENTICATED_PHONE_PLAN_AND_CROSS_LANE_RECEIPTS")
            self.assertNotIn("SIX_LANE_INDEPENDENT_EXACT_BYTE_RECEIPTS_INCOMPLETE",
                             report["hardAndReviewHolds"])
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
            # A bounded decoded AAC timeline anomaly is still a real review
            # dependency, even when overall media decode is technically good.
            physical_gap = {**physical,
                            "audioPtsAnomalyCount": 1,
                            "audioPtsAnomaliesNeedSourceReview": True,
                            "audioPtsAnomalies": [
                                {"audioFrameIndex": 1186,
                                 "startSeconds": 25.334667,
                                 "signedGapMs": 33.334}]}
            with patch("lane5_candidate_scorecard._physical_av",
                       return_value=physical_gap):
                gap_report = score_candidate(
                    film=film, wav=wav, story_path=story, screen_path=screenpath,
                    expected_film_sha=movie_sha, expected_wav_sha=wav_sha,
                    expected_story_sha=story_sha,
                    expected_screen_sha=screen_sha, dimensions=(64, 64, 12))
            gap_hold = "AUDIO_PTS_ANOMALY_REQUIRES_ORIGINAL_PCM_COMPARISON"
            self.assertIn(gap_hold, gap_report["hardAndReviewHolds"])
            self.assertFalse(gap_report["mayPublish"])
            write_once(root / "audio-anomaly-intact.json", gap_report)
            tampered = json.loads(json.dumps(gap_report))
            tampered["hardAndReviewHolds"].remove(gap_hold)
            with self.assertRaisesRegex(ValueError,
                                        "AUDIO_PTS_REVIEW_HOLD_MISSING_OR_FORGED"):
                write_once(root / "audio-anomaly-drop-hold.json", tampered)
            tampered = json.loads(json.dumps(gap_report))
            tampered["observedTechnicalMedia"]["audioPtsAnomalyCount"] = 0
            with self.assertRaisesRegex(ValueError,
                                        "AUDIO_PTS_REVIEW_HOLD_MISSING_OR_FORGED"):
                write_once(root / "audio-anomaly-forged-count.json", tampered)
            tampered = json.loads(json.dumps(gap_report))
            tampered["observedTechnicalMedia"]["audioPtsAnomaliesNeedSourceReview"] = False
            with self.assertRaisesRegex(ValueError,
                                        "AUDIO_PTS_REVIEW_HOLD_MISSING_OR_FORGED"):
                write_once(root / "audio-anomaly-forged-review.json", tampered)
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



    def test_actual_six_shot_h264_aac_intake_uses_explicit_shot_and_frame_count(self):
        """Small real FFmpeg fixture tests shot/frame contract, not premium film."""
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            film, wav = root / "six_shot.mp4", root / "narrator.wav"
            story, screenpath = root / "story.json", root / "screen.json"
            subprocess.run([
                "/usr/bin/ffmpeg", "-nostdin", "-hide_banner", "-v", "error",
                "-f", "lavfi", "-i", "color=c=navy:s=96x170:r=30:d=3",
                "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=24000:duration=3",
                "-map", "0:v:0", "-map", "1:a:0",
                "-c:v", "libx264", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-ar", "24000", "-ac", "1",
                "-frames:v", "90", "-y", str(film)
            ], check=True, timeout=40, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
            with wave.open(str(wav), "wb") as output:
                output.setnchannels(1)
                output.setsampwidth(2)
                output.setframerate(24000)
                output.writeframes(bytes([1, 0]) * 72000)
            fsha, wsha = h(film.read_bytes()), h(wav.read_bytes())
            story.write_text(json.dumps({
                "schema": "ths-lane3-research-visual-treatment-story-v1",
                "encodedH264Sha256": fsha,
                "shots": [{"shot": str(i)} for i in range(6)],
                "mayPublish": False, "realPhonePlaybackVerified": False,
                "independentCraftCalibrationPassed": False, "phonePlanSha256": None
            }))
            story_sha = h(story.read_bytes())
            screenpath.write_text(json.dumps(screen(fsha, story_sha, frames=90)))
            kwargs = dict(
                film=film, wav=wav, story_path=story, screen_path=screenpath,
                expected_film_sha=fsha, expected_wav_sha=wsha,
                expected_story_sha=story_sha,
                expected_screen_sha=h(screenpath.read_bytes()),
                dimensions=(96, 170, 90)
            )
            result = score_candidate(**kwargs, expected_shot_count=6)
            self.assertTrue(result["observedTechnicalMedia"]["fullVideoAudioPhysicalDecode"])
            self.assertEqual(result["observedTechnicalMedia"]["nativeFrames"], 90)
            self.assertEqual(result["declaredStoryShotCount"], 6)
            self.assertEqual(result["observedStoryShotCount"], 6)
            self.assertEqual(result["status"], "RESEARCH_HOLD_NO_PROMOTION")
            self.assertFalse(result["mayPublish"])
            self.assertFalse(result["firstExcellentMasterAccepted"])
            self.assertFalse(result["fiveRenderStreakAccepted"])
            self.assertEqual(result["atomicCardsNewlyAccepted"], 0)
            with self.assertRaisesRegex(ValueError, "STORY_SHOT_INVENTORY_DRIFT"):
                score_candidate(**kwargs)
            for invalid_shots in (True, 0, 31):
                with self.assertRaisesRegex(ValueError, "INVALID_EXPECTED_SHOT_COUNT"):
                    score_candidate(**kwargs, expected_shot_count=invalid_shots)
            with self.assertRaisesRegex(ValueError, "PHYSICAL_AV_GEOMETRY_OR_CODEC_DRIFT"):
                score_candidate(**{**kwargs, "dimensions": (96, 170, 91)},
                                expected_shot_count=6)



    def test_valid_video_with_truncated_aac_must_not_claim_full_audio_coverage(self):
        """Both MP4s fully decode; only the continuous 3s AAC covers 90 video frames."""
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            def encode(name, audio_seconds):
                output = root / name
                subprocess.run([
                    "/usr/bin/ffmpeg", "-nostdin", "-hide_banner", "-v", "error",
                    "-f", "lavfi", "-i", "color=c=navy:s=96x170:r=30:d=3",
                    "-f", "lavfi", "-i",
                    f"sine=frequency=440:sample_rate=24000:duration={audio_seconds}",
                    "-map", "0:v:0", "-map", "1:a:0",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-frames:v", "90",
                    "-c:a", "aac", "-ar", "24000", "-ac", "1",
                    "-y", str(output),
                ], check=True, capture_output=True, timeout=40)
                return output
            good = encode("complete.mp4", "3")
            short = encode("valid-but-short-aac.mp4", "1.75")
            complete = _physical_av(good, (96, 170, 90))
            self.assertTrue(complete["fullVideoAudioPhysicalDecode"])
            self.assertTrue(complete["audioCoverageTechnicallyComplete"])
            self.assertEqual(complete["audioPtsAnomalyCount"], 0)
            self.assertGreaterEqual(complete["decodedAudioSamples"], 72000)
            self.assertGreaterEqual(complete["audioDecodedEndSeconds"], 2.9)
            # A successful FFmpeg decode used to incorrectly certify this.
            with self.assertRaisesRegex(ValueError, "DECODED_AUDIO_EARLY_EOF"):
                _physical_av(short, (96, 170, 90))




    def test_midfilm_audio_pts_gap_even_if_audio_ends_on_time(self):
        """Do not conflate last AAC timestamp with uninterrupted narration.

        A 50ms timestamp discontinuity is real even when both AAC and video
        decode cleanly and the audio track almost reaches the picture end.
        """
        with tempfile.TemporaryDirectory() as td:
            film = Path(td) / "midfilm-gap.mp4"
            subprocess.run([
                "/usr/bin/ffmpeg", "-nostdin", "-hide_banner", "-v", "error",
                "-f", "lavfi", "-i", "color=c=navy:s=96x170:r=30:d=3",
                "-f", "lavfi", "-i",
                "sine=frequency=440:sample_rate=24000:duration=3",
                "-map", "0:v:0", "-map", "1:a:0",
                "-af", "asetpts=PTS+0.05/TB*gte(T\\,1)",
                "-c:v", "libx264", "-pix_fmt", "yuv420p",
                "-frames:v", "90", "-c:a", "aac", "-ar", "24000",
                "-ac", "1", "-y", str(film)
            ], check=True, capture_output=True, timeout=40)
            # This real 90f/3s movie has valid AAC beginning and ending near
            # the proper times, but a missing timestamp span in the middle.
            with self.assertRaisesRegex(
                ValueError, "DECODED_AUDIO_TIMELINE_GAP_OR_OVERLAP"
            ):
                _physical_av(film, (96, 170, 90))




    def test_short_aac_pts_anomaly_is_reported_but_not_mistaken_for_truncation(self):
        """Source-inherited <50ms AAC timing quirks require voice review; >50ms HOLD."""
        first = {"best_effort_timestamp_time": "0.000000", "nb_samples": 1024}
        second = {"best_effort_timestamp_time": "0.076000", "nb_samples": 1024}
        def assess(rows):
            with patch("lane5_candidate_scorecard.subprocess.run",
                       return_value=SimpleNamespace(stdout=json.dumps({"frames": rows}))):
                return _decoded_audio_coverage("synthetic-reference-not-a-film.mp4",
                                               24000, 2)
        r = assess([first, second])
        self.assertTrue(r["audioCoverageTechnicallyComplete"])
        self.assertTrue(r["audioPtsAnomaliesNeedSourceReview"])
        self.assertEqual(r["audioPtsAnomalyCount"], 1)
        self.assertAlmostEqual(r["audioPtsAnomalies"][0]["signedGapMs"], 33.333, places=2)
        self.assertEqual(r["audioPtsAnomalies"][0]["audioFrameIndex"], 1)
        with self.assertRaisesRegex(ValueError, "DECODED_AUDIO_TIMELINE_GAP_OR_OVERLAP"):
            assess([first, {"best_effort_timestamp_time": "0.143000",
                            "nb_samples": 1024}])




    def test_repeated_small_pts_jumps_accumulate_and_cannot_hide(self):
        """Ten alternating 11ms AAC PTS jumps are worse than a one-off glitch.

        Earlier logic only counted >12ms gaps; individual 11ms shifts stayed
        invisible even when cumulative absolute drift exceeded 80ms.
        ffprobe's <1us decimal rounding must not trigger anomaly warnings.
        """
        from decimal import Decimal
        n = Decimal(1024) / Decimal(24000)
        def run(jitter_seconds, count, expected_video_frames):
            rows = []
            for i in range(count):
                jitter = jitter_seconds if i % 2 else Decimal(0)
                rows.append({
                    "best_effort_timestamp_time":
                        format(i*n+jitter, ".6f"),
                    "nb_samples": 1024,
                })
            with patch("lane5_candidate_scorecard.subprocess.run",
                       return_value=SimpleNamespace(stdout=json.dumps({"frames":rows}))):
                return _decoded_audio_coverage("synthetic-not-a-film.mp4",
                                               24000, expected_video_frames)
        with self.assertRaisesRegex(ValueError,
                                    "EXCESS_CUMULATIVE_DECODED_AUDIO_PTS_DRIFT"):
            run(Decimal("0.011"), 12, 15)
        one = run(Decimal("0.003"), 4, 5)
        self.assertGreater(one["audioPtsAnomalyCount"], 0)
        self.assertTrue(one["audioPtsAnomaliesNeedSourceReview"])
        clean = run(Decimal("0.0000003"), 4, 5)
        self.assertEqual(clean["audioPtsAnomalyCount"], 0)
        self.assertFalse(clean["audioPtsAnomaliesNeedSourceReview"])




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


class ExactFrameScopeAndPhonePlanClaimTests(unittest.TestCase):
    """Regression: changing film length or claiming a plan SHA cannot fake QA."""

    def test_missing_or_self_reported_phone_plan_still_holds(self):
        from lane5_candidate_scorecard import _phone_plan_claim_hold
        self.assertEqual(_phone_plan_claim_hold({"phonePlanSha256": None}),
                         "AUTHENTICATED_CURRENT_PHONE_PLAN_MISSING")
        self.assertEqual(_phone_plan_claim_hold(
            {"phonePlanSha256": h(b"plan bytes never received")}),
            "PHONE_PLAN_DIGEST_CLAIM_WITHOUT_INDEPENDENT_PLAN_BYTES")
        for bad in ("yes", True, 123, "", "A" * 64, "0" * 63):
            with self.subTest(bad=bad):
                with self.assertRaisesRegex(ValueError,
                                            "INVALID_UNVERIFIED_PHONE_PLAN_DIGEST"):
                    _phone_plan_claim_hold({"phonePlanSha256": bad})

    def test_direct_call_must_not_inherit_the_historical_1031_frame_default(self):
        from lane5_candidate_scorecard import score_candidate
        with self.assertRaisesRegex(ValueError,
                                    "EXPLICIT_EXPECTED_NATIVE_DIMENSIONS_REQUIRED"):
            score_candidate(film="not-read.mp4", wav="not-read.wav",
                            story_path="not-read.json", screen_path="not-read.json",
                            expected_film_sha=h(b"film"),
                            expected_wav_sha=h(b"wav"),
                            expected_story_sha=h(b"story"),
                            expected_screen_sha=h(b"screen"))

    def test_cli_externally_scopes_all_current_native_film_lengths(self):
        import lane5_candidate_scorecard as unit
        from unittest.mock import patch
        required = []
        for name in ("film", "wav", "story-path", "screen-path",
                     "expected-film-sha", "expected-wav-sha",
                     "expected-story-sha", "expected-screen-sha"):
            required.extend(("--" + name, "test-source"))
        required.extend(("--out", "report.json"))
        for frames in (845, 1031, 1112):
            with self.subTest(frames=frames):
                with patch("sys.argv", ["lane5_candidate_scorecard.py", *required,
                                        "--expected-frames", str(frames)]), \
                     patch.object(unit, "score_candidate", return_value={
                         "status": "RESEARCH_HOLD_NO_PROMOTION",
                         "filmSha256": "a" * 64}) as scorer, \
                     patch.object(unit, "write_once") as writer:
                    unit.main()
                self.assertEqual(scorer.call_args.kwargs["dimensions"],
                                 (1080, 1920, frames))
                self.assertEqual(writer.call_count, 1)
        for count in (0, -1, 5401):
            with self.subTest(bad_frames=count):
                with patch("sys.argv", ["lane5_candidate_scorecard.py", *required,
                                        "--expected-frames", str(count)]), \
                     patch.object(unit, "score_candidate") as scorer:
                    with self.assertRaisesRegex(ValueError,
                                                "EXPECTED_FRAMES_OUT_OF_RANGE"):
                        unit.main()
                scorer.assert_not_called()


if __name__ == "__main__":
    unittest.main()
