"""Fail-closed actual-pixel motion evaluator with static and flicker controls."""
import unittest
import numpy as np
from encoded_science_motion_audit import (
    FRAME_W,FRAME_H,PIXEL_DELTA,REGION,
    science_motion,apply_bounded_motion_gate)

class ScienceStageMotionChecks(unittest.TestCase):
    def fixture(self,changed_percent=6.0):
        # Exactly 12 decoded frames (=11 half-second intervals), with a bounded
        # amount of changing matter confined to the real science-graphics ROI.
        frames=np.zeros((12,FRAME_H,FRAME_W),dtype=np.uint8)
        x0,y0,x1,y1=REGION
        height,width=y1-y0,x1-x0
        count=round(height*width*changed_percent/100)
        # The science ROI is a strided view. reshape(-1) would create a
        # detached COPY, accidentally fabricating a no-motion fixture.
        # Fill a contiguous 2-D tile then assign it back to actual frames.
        tile=np.zeros((height,width),dtype=np.uint8)
        tile.flat[:count]=200
        for i in range(1,12,2):
            frames[i,y0:y1,x0:x1]=tile
        return frames

    def test_modest_progressive_science_camera_passes(self):
        m=science_motion(self.fixture())
        self.assertEqual(m["halfSecondIntervals"],11)
        self.assertGreater(m["meanScienceMotionPercent"],5)
        self.assertLess(m["meanScienceMotionPercent"],7)
        self.assertTrue(apply_bounded_motion_gate(m))

    def test_still_frames_cannot_be_premium_by_proxy(self):
        with self.assertRaisesRegex(ValueError,"STATIC_CHEMISTRY"):
            apply_bounded_motion_gate(science_motion(self.fixture(0)))
        with self.assertRaisesRegex(ValueError,"STATIC_CHEMISTRY"):
            apply_bounded_motion_gate(science_motion(self.fixture(2)))

    def test_flicker_is_rejected_despite_high_activity(self):
        with self.assertRaisesRegex(ValueError,"UNCONTROLLED_SCIENCE_STAGE_FLICKER"):
            apply_bounded_motion_gate(science_motion(self.fixture(35)))

    def test_outside_graph_area_cannot_fake_progress(self):
        x=self.fixture(0)
        x[1::2,35:120,40:245]=255  # text/background, not source geometry
        with self.assertRaisesRegex(ValueError,"STATIC_CHEMISTRY"):
            apply_bounded_motion_gate(science_motion(x))

    def test_invalid_frame_dtype_count_and_sizes_do_not_score(self):
        for x in [np.zeros((11,FRAME_H,FRAME_W),dtype=np.float32),
                  np.zeros((10,FRAME_H,FRAME_W),dtype=np.uint8),
                  np.zeros((12,FRAME_H,FRAME_W-1),dtype=np.uint8)]:
            with self.assertRaisesRegex(ValueError,"DECODED_FRAMES_REQUIRED"):
                science_motion(x)

if __name__=="__main__":
    unittest.main()
