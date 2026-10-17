"""Research-only optical-layout test; not a test of an encoded MP4."""
import unittest
from pathlib import Path
from phone_first_caption_composition import CraftHold,plan_caption,source_words,Image
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

@unittest.skipUnless(Image is not None and Path(FONT).is_file(),
                     'Pillow and local test font needed for raster-only tests')
class RasterLayoutContracts(unittest.TestCase):
    def test_real_gut_hook_reflow_preserves_exact_words_and_14px_at_320(self):
        source="Taking a supplement isn't the same as absorbing it."
        result=plan_caption(source,FONT)
        self.assertEqual(source_words(' '.join(result['rows'])),source_words(source))
        self.assertGreaterEqual(result['minProjectedInkPx320'],14)
        self.assertGreaterEqual(result['positions'][0][1],1150+24)
        self.assertEqual(result['sourceCreditStartsAtNativeY'],1519)
        self.assertLessEqual(result['positions'][-1][1]+result['minNativeGlyphInkPx'],1495)
        self.assertIs(result['sceneBoundsExternallyCalibrated'],False)
        self.assertLessEqual(len(result['rows']),3)
        self.assertIs(result['actualMovieDecoded'],False)
        self.assertIs(result['mayPublish'],False)
    def test_too_short_area_holds_not_tiny_font(self):
        with self.assertRaisesRegex(CraftHold,'CAPTION_NEEDS_RECOMPOSITION'):
            plan_caption('Taking a supplement is not the same as absorbing it.',
                         FONT,area=(100,1285,844,1330))
    def test_source_credit_overlap_holds(self):
        with self.assertRaisesRegex(CraftHold,'SOURCE_OR_PHONE_SAFE_ZONE_CONFLICT'):
            plan_caption('Some caption',FONT,source_top=1200)
    def test_long_single_word_holds(self):
        with self.assertRaisesRegex(CraftHold,'CAPTION_NEEDS_RECOMPOSITION'):
            plan_caption('Supercalifragilisticexpialidocious'*8,FONT)
    def test_multiline_source_must_not_be_accepted_as_authored(self):
        with self.assertRaisesRegex(CraftHold,'CAPTION_SOURCE_INVALID'):
            plan_caption('Source\naltered',FONT)
    def test_missing_font_holds(self):
        with self.assertRaisesRegex(CraftHold,'PINNED_FONT_REQUIRED'):
            plan_caption('Hello','/nonexistent.ttf')
    def test_oversize_source_holds(self):
        with self.assertRaisesRegex(CraftHold,'CAPTION_NEEDS_RECOMPOSITION|CAPTION_SOURCE_TOO_LONG'):
            plan_caption(' '.join(['Absorption']*60),FONT)
    def test_old_generic_layout_would_overlap_actual_gut_artwork(self):
        with self.assertRaisesRegex(CraftHold,'SOURCE_OR_PHONE_SAFE_ZONE_CONFLICT'):
            plan_caption('Taking a supplement is not the same as absorbing it.',
                         FONT,area=(100,1080,844,1376))
    def test_scene_specific_art_boundary_rejects_wrong_template(self):
        with self.assertRaisesRegex(CraftHold,'SOURCE_OR_PHONE_SAFE_ZONE_CONFLICT'):
            plan_caption('Taking a supplement is not the same as absorbing it.',
                         FONT,protected_art_bottom=1300)
    def test_scene_credit_threshold_rejects_overlapping_text_region(self):
        with self.assertRaisesRegex(CraftHold,'SOURCE_OR_PHONE_SAFE_ZONE_CONFLICT'):
            plan_caption('Taking a supplement is not the same as absorbing it.',
                         FONT,source_top=1470)
    def test_right_platform_safe_area_holds(self):
        with self.assertRaisesRegex(CraftHold,'SOURCE_OR_PHONE_SAFE_ZONE_CONFLICT'):
            plan_caption('Hello',FONT,area=(80,1080,1050,1376))

class PortableCaptionContracts(unittest.TestCase):
    def test_exact_token_order(self):
        self.assertEqual(source_words('A  scientific  claim.'),['A','scientific','claim.'])
    def test_blank_and_multiline_are_fatal(self):
        for src in ('',' ','Claim\nchanged'):
            with self.assertRaisesRegex(CraftHold,'CAPTION_SOURCE_INVALID'):
                source_words(src)
    def test_massive_source_fails_closed(self):
        with self.assertRaisesRegex(CraftHold,'CAPTION_SOURCE_TOO_LONG'):
            source_words('word '*200)
    def test_observed_gut_caption_ink_is_not_14px_at_320(self):
        # From Lane4's separately decoded 1008-frame source-bound preview.
        self.assertTrue(all(n*320/1080<14 for n in (32,41)))

if __name__=='__main__':
    unittest.main()
