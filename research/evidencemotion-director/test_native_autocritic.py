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


class AutonomousFilmCriticTests(unittest.TestCase):
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
