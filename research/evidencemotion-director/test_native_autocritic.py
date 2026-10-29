"""Actual-decoded-media autonomy negative tests. No artistic or science approval."""
import importlib.util
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
import numpy as np

s=importlib.util.spec_from_file_location(
    'native_autocritic',Path(__file__).with_name('native_autocritic.py'))
m=importlib.util.module_from_spec(s)
s.loader.exec_module(m)

def _center_static_peripheral_kinetic_frames():
    """Changing side ornamentation conceals a completely frozen core hero."""
    from PIL import Image, ImageDraw
    frames = []
    for i in range(9):
        im = Image.new("L", (m.FRAME_W, m.FRAME_H), 12)
        d = ImageDraw.Draw(im)
        d.rounded_rectangle((67, 102, 115, 155), radius=12,
                            fill=205, outline=240, width=4)
        for k in range(9):
            y = 38 + ((i * 19 + k * 13) % 108)
            d.line((9 + (k % 2) * 2, y, 50, y + k % 3),
                   fill=130 + (k % 2) * 80, width=3)
            d.line((129, y, 168, y + (k % 2) * 3),
                   fill=220, width=3)
        frames.append(np.asarray(im).copy())
    return np.asarray(frames)


def _two_state_layout_frames(count=9):
    from PIL import Image, ImageDraw
    frames = []
    for i in range(count):
        im = Image.new("L", (m.FRAME_W, m.FRAME_H), 15)
        d = ImageDraw.Draw(im)
        if i % 2 == 0:
            d.rounded_rectangle((22, 80, 67, 158), radius=8,
                                fill=210, outline=235, width=3)
        else:
            d.ellipse((104, 100, 158, 168), fill=210, outline=240, width=3)
        frames.append(np.asarray(im).copy())
    return np.asarray(frames)


class AutonomousFilmCriticTests(unittest.TestCase):
    def test_repeated_whole_stage_theme_flips_are_detected(self):
        # Oct 28 alcohol v7 alternated ivory and charcoal stages eight times.
        frames = np.full((10, m.FRAME_H, m.FRAME_W), 25, dtype=np.uint8)
        frames[2:4] = 235
        frames[6:8] = 235
        result = m.review_decoded_samples(frames)
        self.assertEqual(result["fullStageLightDarkFlipCount"], 4)
        self.assertEqual([w["startSec"] for w in result["fullStageLightDarkFlipWindowsSec"]],
                         [2, 6, 10, 14])
        self.assertIn("REPEATED_FULL_STAGE_LIGHT_DARK_FLIPS_REQUIRE_ART_DIRECTION_REPAIR",
                      result["issues"])

    def test_one_light_scene_or_bright_object_on_dark_is_not_a_theme_flip(self):
        frames = np.full((10, m.FRAME_H, m.FRAME_W), 25, dtype=np.uint8)
        frames[4:6] = 235
        report = m.review_decoded_samples(frames)
        self.assertEqual(report["fullStageLightDarkFlipCount"], 2)
        self.assertNotIn("REPEATED_FULL_STAGE_LIGHT_DARK_FLIPS_REQUIRE_ART_DIRECTION_REPAIR",
                         report["issues"])
        moving = np.full((10, m.FRAME_H, m.FRAME_W), 25, dtype=np.uint8)
        for i in range(10):
            moving[i, 95:125, 28+i*8:48+i*8] = 235
        report = m.review_decoded_samples(moving)
        self.assertEqual(report["fullStageLightDarkFlipCount"], 0)

    def test_invalid_decoded_samples_are_rejected(self):
        with self.assertRaisesRegex(ValueError,'ACTUAL_DECODED_SAMPLES_REQUIRED'):
            m.review_decoded_samples(np.zeros((2,320,180),dtype=np.uint8))
        with self.assertRaisesRegex(ValueError,'ACTUAL_DECODED_SAMPLES_REQUIRED'):
            m.review_decoded_samples(np.zeros((9,320,180,3),dtype=np.uint8))
    def test_static_source_is_autonomously_flagged(self):
        f=np.zeros((9,320,180),dtype=np.uint8)
        f[:,60:213,30:160]=185
        report=m.review_decoded_samples(f)
        self.assertIn('REPETITIVE_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR',report['issues'])
        self.assertGreater(report['highEdgeSimilarityFraction'],.9)
    def test_contiguous_six_second_plateau_is_caught_below_global_threshold(self):
        from PIL import Image,ImageDraw
        frames=[]
        for i in range(9):
            im=Image.new('L',(180,320),15)
            d=ImageDraw.Draw(im)
            # Four distinct-time frames deliberately share one exact subject layout.
            # Later scenes move enough that only 3/8 pairs repeat.
            x=40 if i<4 else 10+(i-3)*22
            y=90 if i<4 else 52+(i-4)*32
            d.rounded_rectangle((x,y,x+45,y+65),radius=10,fill=220)
            frames.append(np.asarray(im))
        report=m.review_decoded_samples(np.asarray(frames))
        self.assertLess(report['highEdgeSimilarityFraction'],m.HIGH_REPETITION_FRAC)
        self.assertEqual(report['longestRepeatedLayoutRunSec'],6)
        self.assertIn('SUSTAINED_REPEATED_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR',report['issues'])
        self.assertEqual(report['sustainedRepeatWindowsSec'][0]['startSec'],0)
        self.assertEqual(report['sustainedRepeatWindowsSec'][0]['endSec'],6)
    def test_two_second_isolated_plateau_does_not_trigger_sustained_veto(self):
        from PIL import Image,ImageDraw
        frames=[]
        for i in range(9):
            im=Image.new('L',(180,320),15)
            d=ImageDraw.Draw(im)
            k=i-1 if i==2 else i
            x=10+(k%5)*24
            y=60+(k%3)*32
            d.rounded_rectangle((x,y,x+42,y+65),radius=8,fill=220)
            frames.append(np.asarray(im))
        report=m.review_decoded_samples(np.asarray(frames))
        self.assertEqual(report['sustainedRepeatWindowsSec'],[])
        self.assertNotIn('SUSTAINED_REPEATED_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR',report['issues'])

    def test_blank_subject_is_not_accepted(self):
        report=m.review_decoded_samples(np.zeros((9,320,180),dtype=np.uint8))
        self.assertIn('MISSING_RECOGNIZABLE_SUBJECT_OR_NEAR_BLANK_CENTRAL_STAGE',report['issues'])
        self.assertIn('REPETITIVE_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR',report['issues'])
    def test_varied_subjects_are_not_certified_as_premium(self):
        from PIL import Image,ImageDraw
        f=[]
        for i in range(9):
            # Actual moving *subject silhouette*; pure random noise is not
            # semantic movement, and its averaged edge histogram can remain
            # identical even when every pixel changes.
            im=Image.new('L',(180,320),15)
            d=ImageDraw.Draw(im)
            x=10+(i%5)*24
            y=60+(i%3)*32
            d.rounded_rectangle((x,y,x+45,y+65),radius=10,fill=220,outline=245,width=4)
            f.append(np.asarray(im))
        r=m.review_decoded_samples(np.asarray(f))
        self.assertLess(r['highEdgeSimilarityFraction'],.45)
        self.assertFalse(r['issues'])
        self.assertIn('NOT_HUMAN_QUALITY',r['critiqueScope'])
    def test_masked_center_hero_stasis_is_reviewed_without_artistic_veto(self):
        frames = _center_static_peripheral_kinetic_frames()
        report = m.review_decoded_samples(frames)
        # RED BEFORE FIX: moving peripheral graphics tricked whole-body edges.
        self.assertLess(report["highEdgeSimilarityFraction"], .45)
        self.assertNotIn("REPETITIVE_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR",
                         report["issues"])
        self.assertIn("CENTERED_TEACHING_HERO_STASIS_MASKED_BY_PERIPHERAL_MOTION",
                      report["reviewCandidates"])
        self.assertEqual(report["centerHeroStasisPeripheralMotionWindowsSec"],
                         [{"startSec": 0, "endSec": 16, "repeatedPairCount": 8}])

    def test_peripheral_subject_only_is_not_assumed_centered_static_hero(self):
        frames = _center_static_peripheral_kinetic_frames()
        # Remove the central teaching subject: empty core is not a hidden hero.
        frames[:, 86:190, 58:122] = 12
        report = m.review_decoded_samples(frames)
        self.assertEqual(report["centerHeroStasisPeripheralMotionWindowsSec"], [])
        self.assertEqual(report["reviewCandidates"], [])

    def test_moving_centered_hero_is_not_called_masked_stasis(self):
        from PIL import Image, ImageDraw
        frames = _center_static_peripheral_kinetic_frames()
        for i, original in enumerate(frames):
            im = Image.fromarray(original)
            d = ImageDraw.Draw(im)
            d.rectangle((58, 86, 122, 190), fill=12)
            x, y = 58 + (i % 5) * 7, 91 + (i % 3) * 9
            d.rounded_rectangle((x, y, x + 37, y + 42),
                                radius=7, fill=215, outline=240, width=3)
            frames[i] = np.asarray(im)
        report = m.review_decoded_samples(frames)
        self.assertEqual(report["centerHeroStasisPeripheralMotionWindowsSec"], [])
        self.assertEqual(report["reviewCandidates"], [])

    def test_abab_detected_without_automatic_creative_veto(self):
        report = m.review_decoded_samples(_two_state_layout_frames())
        self.assertEqual(report["repeatedSamplePairsStartSec"], [])
        self.assertEqual(report["issues"], [])
        self.assertEqual(report["twoStateAlternationWindowsSec"],
                         [{"startSec": 0, "endSec": 16, "lagTwoMatchedPairs": 7}])
        self.assertIn("TWO_STATE_LAYOUT_OSCILLATION_WITHOUT_VISUAL_PROGRESSION",
                      report["reviewCandidates"])

    def test_short_intentional_two_way_comparison_not_auto_flagged(self):
        report = m.review_decoded_samples(_two_state_layout_frames(5))
        self.assertEqual(report["twoStateAlternationWindowsSec"], [])

    def test_progressive_subject_positions_not_two_state(self):
        from PIL import Image, ImageDraw
        frames = []
        for i in range(9):
            im = Image.new("L", (180, 320), 15)
            d = ImageDraw.Draw(im)
            x = 10 + i * 15
            d.rounded_rectangle((x, 75, x + 36, 145), radius=6,
                                fill=210, outline=235, width=3)
            frames.append(np.asarray(im).copy())
        report = m.review_decoded_samples(np.asarray(frames))
        self.assertEqual(report["twoStateAlternationWindowsSec"], [])

    def test_actual_h264_abab_sample_is_sha_bound_and_cannot_publish(self):
        if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
            self.skipTest("Native FFmpeg required")
        from PIL import Image
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            for i, frame in enumerate(_two_state_layout_frames()):
                Image.fromarray(frame).save(root / f"frame-{i:02d}.png")
            video = root / "two-state-h264.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin",
                "-framerate", "1/2", "-i", str(root / "frame-%02d.png"),
                "-vf", "fps=12", "-c:v", "libx264", "-pix_fmt", "yuv420p",
                "-y", str(video)], check=True, capture_output=True, timeout=40)
            pinned = m.sha256(video)
            actual = m.analyze_video(video, pinned)
            self.assertEqual(actual["actualVideoSha256"], pinned)
            self.assertEqual(actual["decision"], "CRAFT_REVIEW_HOLD")
            self.assertIn("TWO_STATE_LAYOUT_OSCILLATION_WITHOUT_VISUAL_PROGRESSION",
                          actual["reviewCandidates"])
            self.assertFalse(actual["mayPublish"])

    def test_real_encoded_kinetic_chrome_static_hero_generates_sha_bound_hold(self):
        if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
            self.skipTest("Native FFmpeg required")
        from PIL import Image
        frames = _center_static_peripheral_kinetic_frames()
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            for i, frame in enumerate(frames):
                Image.fromarray(frame).save(root / f"frame-{i:02d}.png")
            clip = root / "actual-h264.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin",
                "-framerate", "1/2", "-i", str(root / "frame-%02d.png"),
                "-vf", "fps=12", "-c:v", "libx264", "-pix_fmt", "yuv420p",
                "-y", str(clip)
            ], check=True, capture_output=True, timeout=40)
            pinned = m.sha256(clip)
            verdict = m.analyze_video(clip, pinned)
            self.assertEqual(verdict["actualVideoSha256"], pinned)
            self.assertEqual(verdict["decision"], "CRAFT_REVIEW_HOLD")
            self.assertIn("CENTERED_TEACHING_HERO_STASIS_MASKED_BY_PERIPHERAL_MOTION",
                          verdict["reviewCandidates"])
            self.assertFalse(verdict["automaticallyApprovedPremiumCraft"])
            self.assertFalse(verdict["mayPublish"])
            # No legacy hard-negative existed for this moving-chrome/still-hero
            # film. When a source-locked visual action was PROMISED, it must
            # graduate from an advisory to the root negative revision verdict.
            import json
            import hashlib
            pinned_plan = root / "cue-plan.json"
            plan = {"schemaVersion":"ths-em-visual-cue-plan-research-v1",
                    "sourceManifestSha256":"a"*64,
                    "lockedNarrationWavSha256":"b"*64,
                    "scenes":[{"beatId":"hero-1","startSec":0,"endSec":18,
                               "lockedNarrationWavSha256":"b"*64,
                               "sourceClaimIds":["claim-1"],
                               "sourceAssetIds":["source-1"],
                               "heroBox":{"x1":.32,"y1":.28,"x2":.68,"y2":.6},
                               "actions":[{"atSec":6.0,"visualVerb":"REVEAL",
                                          "heroObjectId":"source-hero",
                                          "beforeStateId":"closed",
                                          "afterStateId":"revealed"}]}]}
            pinned_plan.write_text(json.dumps(plan,sort_keys=True))
            plan_sha=hashlib.sha256(pinned_plan.read_bytes()).hexdigest()
            valid=m.load_pinned_visual_cue_plan(pinned_plan,plan_sha)
            negative=m.analyze_video(clip,pinned,valid,plan_sha)
            self.assertIn("DECODED_HERO_VISUAL_VERB_NOT_OBSERVABLE",
                          negative["issues"])
            self.assertEqual(negative["decision"],"AUTO_REVISE")
            self.assertEqual(negative["actualVideoSha256"],pinned)
            self.assertFalse(negative["mayPublish"])

    def test_source_locked_cue_checks_real_4hz_subject_not_moving_chrome(self):
        from PIL import Image, ImageDraw
        import json
        import hashlib
        plan = {
            "schemaVersion":"ths-em-visual-cue-plan-research-v1",
            "sourceManifestSha256":"a"*64,
            "lockedNarrationWavSha256":"b"*64,
            "scenes":[{
                "beatId":"beat-1", "startSec":0, "endSec":12,
                "lockedNarrationWavSha256":"b"*64,
                "sourceClaimIds":["claim-1"],"sourceAssetIds":["source-1"],
                "heroBox":{"x1":.25,"y1":.25,"x2":.72,"y2":.65},
                "actions":[{"atSec":5.0,"visualVerb":"REVEAL",
                            "heroObjectId":"physical-hero",
                            "beforeStateId":"state-1","afterStateId":"state-2"}]
            }]
        }
        def create_frames(move_hero):
            generated=[]
            for i in range(48):
                im=Image.new("L", (180,320), 14)
                d=ImageDraw.Draw(im)
                x=70+(23 if move_hero and i>=20 else 0)
                d.rounded_rectangle((x,95,x+42,145),radius=8,fill=210,outline=245,width=3)
                # Vary OUTSIDE the declared hero and inside the broad screen body.
                d.rectangle((8,44+i%21,35,49+i%21),fill=180)
                generated.append(np.asarray(im).copy())
            return np.asarray(generated)
        unchanged=m.review_actual_visual_action_cues(create_frames(False),plan)
        self.assertEqual(unchanged["decision"],"CRAFT_HOLD_SCENE_CUES")
        self.assertEqual(unchanged["unobservedOrUnreviewable"][0]["reason"],
                         "DECLARED_HERO_ACTION_NOT_OBSERVABLE")
        changed=m.review_actual_visual_action_cues(create_frames(True),plan)
        self.assertEqual(changed["decision"],
                         "PIXEL_CHANGE_PROXY_ONLY_NEEDS_SEMANTIC_CRAFT_REVIEW")
        self.assertEqual(len(changed["observedPixelChangesNotApproved"]),1)
        self.assertFalse(changed["semanticAnimationVerified"])
        self.assertFalse(changed["mayPublish"])
        if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
            self.skipTest("ffmpeg required for actual H264 coverage")
        with tempfile.TemporaryDirectory() as td:
            root=Path(td)
            for i, image in enumerate(create_frames(False)):
                Image.fromarray(image).save(root/f"frame-{i:03d}.png")
            clip=root/"static-source-animated-chrome.mp4"
            subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-nostdin",
                            "-framerate","4","-i",str(root/"frame-%03d.png"),
                            "-c:v","libx264","-pix_fmt","yuv420p","-y",str(clip)],
                           check=True,capture_output=True,timeout=40)
            locked=root/"cue-plan.json"
            locked.write_text(json.dumps(plan,sort_keys=True))
            pinned_plan=hashlib.sha256(locked.read_bytes()).hexdigest()
            validated=m.load_pinned_visual_cue_plan(locked,pinned_plan)
            movie=m.analyze_video(clip,m.sha256(clip),validated,pinned_plan)
            audit=movie["renderedVisualCueReview"]
            self.assertEqual(audit["decision"],"CRAFT_HOLD_SCENE_CUES")
            # A nested JSON alert without a root arbiter verdict was silently
            # skippable. The real encoded-film negative must force revision.
            self.assertIn("DECODED_HERO_VISUAL_VERB_NOT_OBSERVABLE",movie["issues"])
            self.assertEqual(movie["decision"],"AUTO_REVISE")
            self.assertEqual(audit["videoSha256"],m.sha256(clip))
            self.assertEqual(audit["scenePlanSha256"],pinned_plan)
            self.assertFalse(movie["mayPublish"])
            # The in-memory-library entry cannot attach any old source SHA
            # to an arbitrary dict or to a loader result changed afterward.
            with self.assertRaisesRegex(ValueError, "VISUAL_PLAN_SOURCE_SHA_MISMATCH"):
                m.analyze_video(clip,m.sha256(clip),dict(validated),pinned_plan)
            with self.assertRaisesRegex(ValueError, "VISUAL_PLAN_SOURCE_SHA_MISMATCH"):
                m.analyze_video(clip,m.sha256(clip),validated,"f"*64)
            validated["scenes"][0]["actions"][0]["visualVerb"]="TRACE"
            with self.assertRaisesRegex(ValueError, "VISUAL_PLAN_MUTATED_AFTER_LOAD"):
                m.analyze_video(clip,m.sha256(clip),validated,pinned_plan)
            with self.assertRaisesRegex(ValueError,"VISUAL_PLAN_SOURCE_SHA_MISMATCH"):
                m.load_pinned_visual_cue_plan(locked,"f"*64)
            with self.assertRaisesRegex(ValueError,"EXACT_VIDEO_AND_PLAN_EXTERNAL_PINS_REQUIRED"):
                m.analyze_video(clip,None,validated,pinned_plan)

    def test_visual_cue_rejects_fake_actions_unbounded_rois_and_missing_held_sources(self):
        frame=np.full((48,320,180),12,dtype=np.uint8)
        plan={"schemaVersion":"ths-em-visual-cue-plan-research-v1",
              "sourceManifestSha256":"a"*64,"lockedNarrationWavSha256":"b"*64,
              "scenes":[{"beatId":"beat-1","startSec":0,"endSec":12,
                         "lockedNarrationWavSha256":"b"*64,
                         "sourceClaimIds":["claim-1"],"sourceAssetIds":["source-1"],
                         "heroBox":{"x1":.2,"y1":.2,"x2":.72,"y2":.6},
                         "actions":[{"atSec":5,"visualVerb":"PARTICLES_ONLY",
                                     "heroObjectId":"hero-1",
                                     "beforeStateId":"before","afterStateId":"after"}]}]}
        with self.assertRaisesRegex(ValueError,"MISSING_OR_DECORATIVE_VISUAL_VERB"):
            m.review_actual_visual_action_cues(frame,plan)
        plan["scenes"][0]["actions"][0]["visualVerb"]="TRACE"
        plan["scenes"][0]["sourceClaimIds"]=["claim-1","claim-1"]
        with self.assertRaisesRegex(ValueError,"UNBOUND_OR_UNSAFE_HERO_REGION_OR_SCENE_TIMELINE"):
            m.review_actual_visual_action_cues(frame,plan)
        plan["scenes"][0]["sourceClaimIds"]=["claim-1"]
        plan["scenes"][0]["sourceAssetIds"]=["source-1","source-1"]
        with self.assertRaisesRegex(ValueError,"UNBOUND_OR_UNSAFE_HERO_REGION_OR_SCENE_TIMELINE"):
            m.review_actual_visual_action_cues(frame,plan)
        plan["scenes"][0]["sourceAssetIds"]=["source-1"]
        plan["scenes"][0]["staticHold"]={"kind":"SOURCE_EVIDENCE_READ",
                                          "sourceId":"source-1",
                                          "reason":"Read the actual primary source"}
        with self.assertRaisesRegex(ValueError,"ACTION_AND_SOURCE_READ_HOLD_MUTUALLY_EXCLUSIVE"):
            m.review_actual_visual_action_cues(frame,plan)
        del plan["scenes"][0]["staticHold"]
        plan["scenes"][0]["heroBox"]["x2"]=.99
        with self.assertRaisesRegex(ValueError,"UNBOUND_OR_UNSAFE_HERO_REGION_OR_SCENE_TIMELINE"):
            m.review_actual_visual_action_cues(frame,plan)
        plan["scenes"][0]["heroBox"]["x2"]=.72
        plan["scenes"][0]["actions"]=[]
        with self.assertRaisesRegex(ValueError,"ACTIONLESS_SCENE_WITHOUT_SOURCE_READ_HOLD"):
            m.review_actual_visual_action_cues(frame,plan)
        # A fabricated 'staticHold':{} used to hide a whole failed lesson.
        plan["scenes"][0]["staticHold"]={}
        with self.assertRaisesRegex(ValueError,"UNJUSTIFIED_STATIC_SOURCE_READ_HOLD"):
            m.review_actual_visual_action_cues(frame,plan)
        plan["scenes"][0]["staticHold"]={
            "kind":"SOURCE_EVIDENCE_READ","sourceId":"invented-source",
            "reason":"Read the exact cited paper footer"}
        with self.assertRaisesRegex(ValueError,"UNJUSTIFIED_STATIC_SOURCE_READ_HOLD"):
            m.review_actual_visual_action_cues(frame,plan)
        # Even a perfectly declared source read cannot replace the entire film.
        plan["scenes"][0]["staticHold"]["sourceId"]="source-1"
        plan["scenes"][0]["endSec"]=3
        with self.assertRaisesRegex(ValueError,"VISUAL_SCENES_DO_NOT_COVER_ACTUAL_DECODE"):
            m.review_actual_visual_action_cues(frame,plan)
        plan["scenes"][0]["endSec"]=12
        with self.assertRaisesRegex(ValueError,"VISUAL_CUE_UNBOUNDED_SOURCE_READ_HOLD"):
            m.review_actual_visual_action_cues(frame,plan)

    def test_valid_bounded_source_hold_does_not_hide_an_unobserved_action(self):
        from PIL import Image,ImageDraw
        frames=[]
        for i in range(48):
            im=Image.new("L",(180,320),13)
            d=ImageDraw.Draw(im)
            d.rectangle((74,99,116,146),fill=221)
            frames.append(np.asarray(im).copy())
        plan={"schemaVersion":"ths-em-visual-cue-plan-research-v1",
              "sourceManifestSha256":"a"*64,"lockedNarrationWavSha256":"b"*64,
              "scenes":[
                {"beatId":"evidence-1","startSec":0,"endSec":2,
                 "lockedNarrationWavSha256":"b"*64,
                 "sourceClaimIds":["claim-1"],"sourceAssetIds":["source-1"],
                 "heroBox":{"x1":.25,"y1":.25,"x2":.72,"y2":.65},
                 "actions":[],"staticHold":{"kind":"SOURCE_EVIDENCE_READ",
                 "sourceId":"source-1","reason":"Read the exact source evidence"}},
                {"beatId":"scene-2","startSec":2,"endSec":12,
                 "lockedNarrationWavSha256":"b"*64,
                 "sourceClaimIds":["claim-1"],"sourceAssetIds":["source-1"],
                 "heroBox":{"x1":.25,"y1":.25,"x2":.72,"y2":.65},
                 "actions":[{"atSec":6,"visualVerb":"TRACE",
                  "heroObjectId":"physical-hero","beforeStateId":"initial",
                  "afterStateId":"changed"}]}]}
        verdict=m.review_actual_visual_action_cues(np.asarray(frames),plan)
        self.assertEqual(verdict["declaredActionsExamined"],1)
        self.assertEqual(verdict["decision"],"CRAFT_HOLD_SCENE_CUES")
        self.assertIn("DECLARED_HERO_ACTION_NOT_OBSERVABLE",
                      [f["reason"] for f in verdict["unobservedOrUnreviewable"]])
        self.assertFalse(verdict["mayPublish"])

    def test_one_hz_center_cadence_detects_three_seconds_despite_kinetic_chrome(self):
        frames = _center_static_peripheral_kinetic_frames()
        report = m.review_one_hz_hero_cadence(frames)
        self.assertEqual(report["stagnationWindows"],
                         [{"startSec":0,"endSec":8,"stagnantSecondsAtOneHz":8,
                           "severity":"REVISE_CANDIDATE"}])
        self.assertEqual(report["creativeScreenVerdict"], "CRAFT_HOLD")
        self.assertFalse(report["automaticallyApprovedArt"])
        self.assertFalse(report["sceneSpecificHeroAndMeaningVerified"])

    def test_one_hz_center_cadence_three_second_floor_and_real_hero_motion(self):
        from PIL import Image, ImageDraw
        frames = []
        for i in range(9):
            image = Image.new("L", (180, 320), 12)
            draw = ImageDraw.Draw(image)
            x = 69 if i <= 3 else 69 + (i-3)*8
            draw.rounded_rectangle((x,105,x+30,147), radius=5,
                                   fill=215, outline=245, width=3)
            frames.append(np.asarray(image).copy())
        report = m.review_one_hz_hero_cadence(np.asarray(frames))
        self.assertEqual(report["stagnationWindows"][0]["startSec"], 0)
        self.assertEqual(report["stagnationWindows"][0]["endSec"], 3)
        self.assertEqual(report["stagnationWindows"][0]["severity"],
                         "CRAFT_HOLD_CANDIDATE")
        self.assertFalse(any(x["startSec"]>=3 for x in report["stagnationWindows"]))

    def test_one_hz_center_cadence_blank_or_invalid_cannot_certify_craft(self):
        empty = m.review_one_hz_hero_cadence(np.zeros((9,320,180),dtype=np.uint8))
        self.assertEqual(empty["visibleCenterHeroSamples"],0)
        self.assertEqual(empty["creativeScreenVerdict"],
                         "NO_NEGATIVE_FOUND_NOT_CRAFT_PASS")
        self.assertFalse(empty["automaticallyApprovedArt"])
        with self.assertRaisesRegex(ValueError,"ACTUAL_ONE_HZ_HERO_SAMPLES_REQUIRED"):
            m.review_one_hz_hero_cadence(np.zeros((2,320,180),dtype=np.uint8))

    def test_interleaved_blank_phase_probe_is_negative_only(self):
        from PIL import Image, ImageDraw
        frames = []
        for i in range(16):
            image = Image.new("L", (180, 320), 0 if i % 2 else 12)
            if i % 2 == 0:
                draw = ImageDraw.Draw(image)
                x = 8 + (i // 2 % 5) * 24
                draw.rectangle((x, 74, x + 46, 165), fill=230)
            frames.append(np.asarray(image))
        windows = m.interleaved_blank_phase_windows(np.asarray(frames))
        self.assertEqual(windows, [{"startSec": 1, "endSec": 16,
                                    "blankSamples": 8, "blankPhase": 1}])
        self.assertEqual(m.interleaved_blank_phase_windows(np.asarray(frames)[::2]), [])
        self.assertEqual(m.interleaved_blank_phase_windows(np.asarray(frames)[::2].repeat(2,axis=0)), [])

    def test_actual_h264_interleaved_blank_phase_not_invisible_to_critic(self):
        if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
            self.skipTest("Native FFmpeg required")
        from PIL import Image, ImageDraw
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            for i in range(16):
                image = Image.new("L", (180, 320), 0 if i % 2 else 12)
                if i % 2 == 0:
                    draw = ImageDraw.Draw(image)
                    x = 8 + (i // 2 % 5) * 24
                    draw.rectangle((x, 74, x + 46, 165), fill=230)
                image.save(root / f"sample-{i:02d}.png")
            movie = root / "aliased-blank-visual.mp4"
            subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error",
                            "-nostdin", "-framerate", "1",
                            "-i", str(root / "sample-%02d.png"),
                            "-vf", "fps=12", "-c:v", "libx264",
                            "-pix_fmt", "yuv420p", "-y", str(movie)],
                           check=True, capture_output=True, timeout=40)
            pinned = m.sha256(movie)
            report = m.analyze_video(movie, pinned)
            self.assertEqual(report["actualVideoSha256"], pinned)
            self.assertIn("INTERLEAVED_NEAR_BLANK_VISUAL_PHASE",
                          report["reviewCandidates"])
            self.assertEqual(report["interleavedBlankPhaseWindowsSec"][0],
                             {"startSec": 1, "endSec": 16,
                              "blankSamples": 8, "blankPhase": 1})
            self.assertFalse(report["mayPublish"])
            self.assertFalse(report["automaticallyApprovedPremiumCraft"])

    def test_actual_input_swap_between_source_pin_and_decoders_uses_frozen_bytes(self):
        """Real black/white H264 swap: every decoded pixel comes from the first pin."""
        if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
            self.skipTest("FFmpeg required")
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as td:
            root=Path(td)
            source=root/"mutable.mp4"
            swapped=root/"replacement.mp4"
            for clip,color in ((source,"black"),(swapped,"white")):
                subprocess.run(["ffmpeg","-hide_banner","-loglevel","error",
                                "-nostdin","-f","lavfi","-i",
                                f"color=c={color}:s=180x320:r=12:d=14",
                                "-c:v","libx264","-pix_fmt","yuv420p",
                                "-y",str(clip)],check=True,capture_output=True,timeout=40)
            original_sha=m.sha256(source)
            replacement_bytes=swapped.read_bytes()
            replacement_sha=m.sha256(swapped)
            self.assertNotEqual(original_sha,replacement_sha)
            original_helper=m._analyze_frozen_video

            def swap_before_any_decode(frozen, pinned, *extra_args):
                # This hook fires AFTER snapshot SHA identity is established,
                # but BEFORE ffprobe and both FFmpeg frame-sampling passes.
                self.assertNotEqual(Path(frozen),source)
                self.assertEqual(m.sha256(frozen),original_sha)
                source.write_bytes(replacement_bytes)
                return original_helper(frozen,pinned,*extra_args)

            with patch.object(m,"_analyze_frozen_video",side_effect=swap_before_any_decode):
                result=m.analyze_video(source,original_sha)
            self.assertEqual(m.sha256(source),replacement_sha)
            self.assertEqual(result["actualVideoSha256"],original_sha)
            self.assertEqual(result["decision"],"AUTO_REVISE")
            self.assertFalse(result["mayPublish"])
            # No source swapping can manufacture the original pin from new
            # content in a *new invocation*.
            with self.assertRaisesRegex(ValueError,"VIDEO_IDENTITY_CHANGED"):
                m.analyze_video(source,original_sha)

    def test_unpinned_visual_cue_cannot_promote_internal_snapshot_hash(self):
        plan={"schemaVersion":"ths-em-visual-cue-plan-research-v1","scenes":[]}
        with self.assertRaisesRegex(ValueError,"EXACT_VIDEO_AND_PLAN_EXTERNAL_PINS_REQUIRED"):
            m.analyze_video("absent.mp4",scene_plan=plan,scene_plan_sha="f"*64)

    def test_real_decode_pins_sha_and_blocks_static_mp4(self):
        if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
            self.skipTest('FFmpeg required for actual media test')
        with tempfile.TemporaryDirectory() as td:
            clip=Path(td)/'actual.mp4'
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error',
                '-nostdin','-y','-f','lavfi','-i','color=c=black:s=180x320:r=12:d=14',
                '-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p',str(clip)],
                check=True,timeout=30)
            original=m.sha256(clip)
            verdict=m.analyze_video(clip,original)
            self.assertEqual(verdict['decision'],'AUTO_REVISE')
            self.assertEqual(verdict['actualVideoSha256'],original)
            self.assertFalse(verdict['automaticallyApprovedPremiumCraft'])
            self.assertFalse(verdict['automaticallyApprovedScientificClaims'])
            self.assertFalse(verdict['mayPublish'])
            clip.write_bytes(clip.read_bytes()+b'changed')
            with self.assertRaisesRegex(ValueError,'VIDEO_IDENTITY_CHANGED'):
                m.analyze_video(clip,original)
    def test_missing_media_is_not_a_source_receipt(self):
        with self.assertRaisesRegex(ValueError,'ACTUAL_REGULAR_VIDEO_REQUIRED'):
            m.analyze_video('does-not-exist.mp4')

if __name__=='__main__':
    unittest.main()
