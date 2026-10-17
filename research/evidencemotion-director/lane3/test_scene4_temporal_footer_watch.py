"""Always-on negative fixtures; physical H264 source replay is opt-in."""
import unittest
from unittest.mock import patch
import scene4_temporal_footer_watch as T

class TemporalFooterTests(unittest.TestCase):
    def make(self,*,real_ink=False,ghost=False):
        result=bytearray(T.PIXELS_PER_FRAME)
        def ink(x,y,r,g,b):
            i=(y*T.CROP_W+x)*3
            result[i:i+3]=bytes((r,g,b))
        if ghost: ink(50,4,220,180,160)
        if real_ink:
            for y in range(18,23):
                for x in range(60): ink(x,y,180,200,210)
        return bytes(result)

    def rows(self,ghost_count=20):
        start=T.DISCLOSURE_FIRST-T.FIRST
        before=[{'ghostBrightPixels':1 if i<ghost_count else 0,
                 'disclosureInkPixels':300 if i>=start else 0}
                for i in range(T.LAST-T.FIRST+1)]
        after=[{'ghostBrightPixels':0,
                'disclosureInkPixels':297 if i>=start else 0}
               for i in range(T.LAST-T.FIRST+1)]
        return before,after

    def test_pixel_predicate_separates_stray_molecule_from_footer(self):
        self.assertEqual(T.classify(self.make()),{'ghostBrightPixels':0,'disclosureInkPixels':0})
        self.assertEqual(T.classify(self.make(ghost=True))['ghostBrightPixels'],1)
        self.assertEqual(T.classify(self.make(real_ink=True))['disclosureInkPixels'],300)
        self.assertEqual(T.classify(self.make(ghost=True,real_ink=True)),
                         {'ghostBrightPixels':1,'disclosureInkPixels':300})
        with self.assertRaisesRegex(T.FooterHold,'FRAME_SIZE'):
            T.classify(self.make()[:-1])

    def test_every_frame_pass_preserves_disclosure_and_keeps_publish_hold(self):
        before,after=self.rows()
        result=T.evaluate(before,after)
        self.assertEqual(result['realEncodedFramesCompared'],147)
        self.assertEqual(result['beforeFramesWithGhostBrightPixels'],20)
        self.assertEqual(result['afterFramesWithGhostBrightPixels'],0)
        self.assertEqual(result['disclosureFramesPreserved'],107)
        self.assertFalse(result['mayPublish'])
        self.assertFalse(result['excellentCertified'])

    def test_single_late_ghost_cannot_hide_behind_630_preview(self):
        before,after=self.rows()
        after[130]['ghostBrightPixels']=1
        with self.assertRaisesRegex(T.FooterHold,'RESIDUAL_GHOST_BRIGHT_PIXEL_FRAME_685'):
            T.evaluate(before,after)

    def test_single_late_disclosure_dropout_is_rejected(self):
        before,after=self.rows()
        after[-1]['disclosureInkPixels']=0
        with self.assertRaisesRegex(T.FooterHold,'VISIBLE_DISCLOSURE_PIXEL_ABSENT_FRAME_701'):
            T.evaluate(before,after)

    def test_disclosure_inaccuracy_and_early_text_rejected(self):
        before,after=self.rows()
        after[60]['disclosureInkPixels']=250
        with self.assertRaisesRegex(T.FooterHold,'DISCLOSURE_INK_DRIFT_FRAME_615'):
            T.evaluate(before,after)
        before,after=self.rows()
        after[0]['disclosureInkPixels']=190
        with self.assertRaisesRegex(T.FooterHold,'EARLY_DISCLOSURE_PIXEL_CHANGE_FRAME_555'):
            T.evaluate(before,after)

    def test_truncated_negative_evidence_and_missing_old_defect_refused(self):
        before,after=self.rows()
        with self.assertRaisesRegex(T.FooterHold,'INCOMPLETE'):
            T.evaluate(before[:-1],after)
        for row in before:row['ghostBrightPixels']=0
        with self.assertRaisesRegex(T.FooterHold,'NO_PHYSICAL_SOURCE_GHOST'):
            T.evaluate(before,after)

    def test_source_byte_identity_and_source_mutation_fail_closed(self):
        with patch.object(T,'sha',side_effect=['untrusted']):
            with self.assertRaisesRegex(T.FooterHold,'PREVIOUS_FILM_SHA_MISMATCH'):
                T.audit('source.mp4','repaired.mp4')
        with patch.object(T,'sha',side_effect=[T.SOURCE_SHA,T.CLEAN_SHA,'changed']), \
             patch.object(T,'decoded_crops',side_effect=self.rows()):
            with self.assertRaisesRegex(T.FooterHold,'FILM_BYTES_CHANGED_DURING_TEMPORAL_AUDIT'):
                T.audit('source.mp4','repaired.mp4')

if __name__=='__main__': unittest.main()
