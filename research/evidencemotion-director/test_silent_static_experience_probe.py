"""Physical FFmpeg positive/negative tests for research-only concurrent quiet/static detection."""
import hashlib
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

from silent_static_experience_probe import inspect


def file_sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


class ExperienceProbeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.root = Path(cls.temp.name)

        def encode(label, picture, audio, *, cut=False):
            out = cls.root / (label + ".mp4")
            if cut:
                args = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-f", "lavfi",
                        "-i", "color=c=black:s=96x170:r=30:d=1.8", "-f", "lavfi",
                        "-i", "color=c=white:s=96x170:r=30:d=1.8", "-f", "lavfi", "-i",
                        "anullsrc=channel_layout=mono:sample_rate=24000",
                        "-filter_complex", "[0:v][1:v]concat=n=2:v=1:a=0[v]",
                        "-map", "[v]", "-map", "2:a:0"]
            else:
                args = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-f", "lavfi",
                        "-i", picture, "-f", "lavfi", "-i", audio, "-map", "0:v:0", "-map", "1:a:0"]
            subprocess.run(args + ["-t", "3.6", "-c:v", "libx264", "-pix_fmt", "yuv420p",
                                   "-c:a", "aac", "-ar", "24000", "-ac", "1", "-y", str(out)],
                           check=True, stdout=subprocess.DEVNULL)
            return out
        quiet = "anullsrc=channel_layout=mono:sample_rate=24000"
        cls.static_quiet = encode("still-and-silent", "color=c=black:s=96x170:r=30", quiet)
        cls.moving_quiet = encode("motion-not-silent", "testsrc2=s=96x170:r=30", quiet)
        cls.static_talking = encode("still-with-voice-proxy", "color=c=black:s=96x170:r=30",
                                    "sine=frequency=440:sample_rate=24000")
        cls.scene_cut = encode("silent-scene-cut", "", quiet, cut=True)
        cls.noaudio = cls.root / "noaudio.mp4"
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(cls.static_quiet),
                        "-an", "-c:v", "copy", "-y", str(cls.noaudio)], check=True)

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def analyze(self, file):
        return inspect(movie=file, movie_sha=file_sha(file))

    def test_full_static_silent_film_is_flagged_but_never_published(self):
        report = self.analyze(self.static_quiet)
        self.assertEqual(report["videoFrames"], 108)
        self.assertTrue(report["needsExperienceReview"])
        self.assertEqual(len(report["silentAndNearStaticSpans"]), 1)
        self.assertGreaterEqual(report["silentAndNearStaticSpans"][0]["durationSec"], 3.5)
        self.assertFalse(report["mayPublish"])
        self.assertFalse(report["firstExcellentMasterAccepted"])
        self.assertFalse(report["fiveRenderStreakAccepted"])

    def test_fully_silent_but_visibly_moving_film_is_not_flagged(self):
        report = self.analyze(self.moving_quiet)
        self.assertFalse(report["needsExperienceReview"])
        self.assertEqual(report["silentAndNearStaticSpans"], [])
        self.assertFalse(report["mayPublish"])

    def test_static_picture_with_audible_track_is_not_flagged(self):
        report = self.analyze(self.static_talking)
        self.assertFalse(report["needsExperienceReview"])
        self.assertFalse(report["mayPublish"])

    def test_scene_change_breaks_long_static_pause_into_short_holds(self):
        report = self.analyze(self.scene_cut)
        self.assertFalse(report["needsExperienceReview"])
        self.assertEqual(report["silentAndNearStaticSpans"], [])

    def make_pinned_story(self, tmp, film, *, correct=True, declared=True):
        story = {"schema": "ths-lane3-research-visual-treatment-story-v1",
                 "encodedH264Sha256": file_sha(film) if correct else file_sha(self.moving_quiet),
                 "mayPublish": False, "scienceApproved": False,
                 "realPhonePlaybackVerified": False,
                 "independentCraftCalibrationPassed": False,
                 "shots": [{"shot": "source_hold", "startSec": 0, "endSec": 3.6,
                            "directedComposition": "silent full-resolution source card" if declared else "animated explanation",
                            "spokenOriginalLine": "", "onscreenAnnotationRoles": ["source"]}]}
        f = Path(tmp) / "story.json"
        f.write_text(json.dumps(story, sort_keys=True))
        return f, story

    def test_actual_static_source_shot_intent_is_documented_but_not_approved(self):
        with tempfile.TemporaryDirectory() as td:
            f,_ = self.make_pinned_story(td, self.static_quiet)
            receipt = inspect(movie=self.static_quiet, movie_sha=file_sha(self.static_quiet),
                              story_path=f, story_sha=file_sha(f))
            gap = receipt["silentAndNearStaticSpans"][0]
            self.assertEqual(gap["storyIntent"], "DECLARED_SILENT_SOURCE_READING_HOLD")
            self.assertEqual(gap["declaredShot"], "source_hold")
            self.assertFalse(receipt["sourceCardReadTimeAndComprehensionIndependentlyValidated"])
            self.assertFalse(receipt["mayPublish"])

    def test_voicefree_scene_not_assumed_source_reading_without_authored_intent(self):
        with tempfile.TemporaryDirectory() as td:
            f,_ = self.make_pinned_story(td, self.static_quiet, declared=False)
            receipt = inspect(movie=self.static_quiet, movie_sha=file_sha(self.static_quiet),
                              story_path=f, story_sha=file_sha(f))
            self.assertEqual(receipt["silentAndNearStaticSpans"][0]["storyIntent"],
                             "SHOT_DOES_NOT_DECLARE_SILENT_SOURCE_READING")

    def test_cross_film_and_rewritten_story_are_refused(self):
        with tempfile.TemporaryDirectory() as td:
            f,original = self.make_pinned_story(td, self.static_quiet, correct=False)
            with self.assertRaisesRegex(ValueError,"STORY_WRONG_FILM_OR_APPROVAL_SCOPE"):
                inspect(movie=self.static_quiet, movie_sha=file_sha(self.static_quiet),
                        story_path=f, story_sha=file_sha(f))
            f.write_text(json.dumps({**original,"encodedH264Sha256":file_sha(self.static_quiet),
                                      "mayPublish":True}))
            with self.assertRaisesRegex(ValueError,"STORY_WRONG_FILM_OR_APPROVAL_SCOPE"):
                inspect(movie=self.static_quiet, movie_sha=file_sha(self.static_quiet),
                        story_path=f, story_sha=file_sha(f))
            f.write_text(json.dumps({**original,"encodedH264Sha256":file_sha(self.static_quiet),
                                      "shots": [{**original["shots"][0],"endSec":3.2}]}))
            with self.assertRaisesRegex(ValueError,"STORY_DOES_NOT_COVER_COMPLETE_FILM"):
                inspect(movie=self.static_quiet, movie_sha=file_sha(self.static_quiet),
                        story_path=f, story_sha=file_sha(f))

    def test_externally_pinned_story_cannot_be_mutated_or_omitted(self):
        with tempfile.TemporaryDirectory() as td:
            f,_ = self.make_pinned_story(td, self.static_quiet)
            with self.assertRaisesRegex(ValueError,"EXTERNAL_STORY_SHA_MISMATCH"):
                inspect(movie=self.static_quiet, movie_sha=file_sha(self.static_quiet),
                        story_path=f, story_sha=hashlib.sha256(b"foreign").hexdigest())
            with self.assertRaisesRegex(ValueError,"STORY_AND_EXTERNAL_SHA_REQUIRED_TOGETHER"):
                inspect(movie=self.static_quiet, movie_sha=file_sha(self.static_quiet),story_path=f)
            f.write_text('{"schema":"a","schema":"b"}')
            with self.assertRaisesRegex(ValueError,"DUPLICATE_STORY_JSON_KEY"):
                inspect(movie=self.static_quiet, movie_sha=file_sha(self.static_quiet),
                        story_path=f,story_sha=file_sha(f))

    def test_requires_external_hash_of_real_movie(self):
        with self.assertRaisesRegex(ValueError, "EXTERNAL_MOVIE_SHA_MISMATCH"):
            inspect(movie=self.static_quiet, movie_sha=file_sha(self.moving_quiet))
        with self.assertRaisesRegex(ValueError, "EXTERNAL_MOVIE_SHA_REQUIRED"):
            inspect(movie=self.static_quiet, movie_sha="not a sha")

    def test_rejects_missing_audio_track_instead_of_approving_silent_movie(self):
        with self.assertRaisesRegex(ValueError, "REQUIRES_EXACTLY_ONE_VIDEO_AND_ONE_AUDIO"):
            self.analyze(self.noaudio)


if __name__ == "__main__":
    unittest.main()
