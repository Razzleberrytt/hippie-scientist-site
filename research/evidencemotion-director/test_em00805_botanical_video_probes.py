"""EM-008.05: real encoded 1080p botanical footage and adversarial disclosure controls."""
import tempfile
import os
import unittest
from pathlib import Path
from PIL import Image
from em00805_botanical_video_probes import (
    RECT,LABEL,QUALIFIER,sha,font,fixture_art,draw_variant,
    assert_text_fits,decode_frame,run,audit_clip
)
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

class EncodedBotanicalVideoSafetyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp=tempfile.TemporaryDirectory()
        cls.out=Path(cls.tmp.name)
        cls.source=fixture_art(cls.out/'source.png')
        cls.report=run(cls.out,cls.source,FONT)

    @classmethod
    def tearDownClass(cls):
        # Persist ONLY an immutable research receipt, not the negative-example
        # MP4s that knowingly contain a fabricated assay claim.
        destination=os.environ.get('THS_EM00805_RECEIPT')
        if destination:
            out=Path(destination)
            out.parent.mkdir(parents=True,exist_ok=True)
            out.write_bytes((cls.out/'receipt.json').read_bytes())
        cls.tmp.cleanup()

    def test_real_encoded_native_frames_and_source_sha(self):
        self.assertEqual([p['mode'] for p in self.report['probes']],
                         ['disclosed','missing','fabricated_measurement'])
        self.assertEqual(self.report['sourceAssetSha256'],sha(self.source))
        for p in self.report['probes']:
            self.assertEqual(p['sampleFrameIndex'],30)
            self.assertTrue(p['actualEncodedPixelsInspected'])
            self.assertEqual(len(p['decodedRgbSha256']),64)
            self.assertEqual(len(p['decodedDisclosureRegionSha256']),64)
            self.assertLess(p['decodedToAuthoredCaptionRoiMeanPixelError'],10)

    def test_visible_disclosure_has_pixels_but_not_phone_science_or_release_authority(self):
        p=self.report['probes'][0]
        self.assertEqual(p['decision'],'CAPTION_REGION_OBSERVED_RESEARCH_ONLY')
        self.assertTrue(p['disclosureInkCandidatePresent'])
        self.assertGreater(p['disclosureRegionChangedPixelFraction'],.25)
        self.assertGreaterEqual(p['projectedTitlePixelsAt375Width'],14)
        self.assertTrue(p['textClippingRuleChecked'])
        for gate in ('independentTextOCRVerified','botanicalSpeciesVerified',
                     'plantAlkaloidAssayVerified','humanScienceApproved',
                     'realHandsetPlaybackVerified','publicationApproved','mayPublish'):
            self.assertFalse(p[gate],gate)

    def test_removed_disclosure_real_h264_is_a_hold(self):
        p=self.report['probes'][1]
        self.assertEqual(p['decision'],'HOLD_MISSING_OR_DECEPTIVE_BOTANICAL_DISCLOSURE')
        self.assertTrue(p['negativeControlRejected'])
        self.assertEqual(p['disclosureRegionChangedPixelFraction'],0)

    def test_false_measured_7oh_caption_is_hold_even_when_visibly_rendered(self):
        p=self.report['probes'][2]
        self.assertEqual(p['decision'],'HOLD_MISSING_OR_DECEPTIVE_BOTANICAL_DISCLOSURE')
        self.assertTrue(p['disclosureInkCandidatePresent'])
        self.assertTrue(p['negativeControlRejected'])
        self.assertFalse(p['plantAlkaloidAssayVerified'])

    def test_three_distinct_h264_and_decoded_banner_regions(self):
        ps=self.report['probes']
        for field in ('encodedFilmSha256','decodedRgbSha256','decodedDisclosureRegionSha256'):
            self.assertEqual(len({p[field] for p in ps}),3)

    def test_swapped_film_hash_cannot_borrow_disclosure_proof(self):
        p=self.report['probes'][0]
        with Image.open(self.out/'disclosed.png') as still:
            with self.assertRaisesRegex(ValueError,'FILM_SHA_DRIFT_HOLD'):
                audit_clip(self.out/'disclosed.mp4','0'*64,'disclosed',
                  decode_frame(self.out/'missing.mp4'),p['sourceSha256'],still.convert('RGB'))

    def test_forged_caption_approval_cannot_replace_real_encoded_ink(self):
        p=self.report['probes'][1]
        with Image.open(self.out/'disclosed.png') as still:
            with self.assertRaisesRegex(ValueError,'ENCODED_CAPTION_PIXELS_DIFFER'):
                audit_clip(self.out/'missing.mp4',p['encodedFilmSha256'],'disclosed',
                    decode_frame(self.out/'missing.mp4'),p['sourceSha256'],still.convert('RGB'))

    def test_glyph_fits_with_mobile_threshold_and_rejects_clipping(self):
        f=font(FONT,41)
        self.assertLess(130+f.getlength(LABEL),RECT[2]-24)
        self.assertLess(130+f.getlength(QUALIFIER),RECT[2]-24)
        with self.assertRaisesRegex(ValueError,'MOBILE_DISCLOSURE_GLYPHS_CLIPPED'):
            assert_text_fits('CLAIMED MEASURED QUANTITATIVE LAB BIOASSAY',f)
        with self.assertRaisesRegex(ValueError,'DECLARED_MOBILE_TYPE_TOO_SMALL'):
            assert_text_fits('SMALL',font(FONT,25))

    def test_unknown_mode_not_admitted(self):
        with Image.open(self.source) as im:
            with self.assertRaisesRegex(ValueError,'UNKNOWN_PROBE_MODE'):
                draw_variant(im,FONT,'therapeutic_recommendation')

    def test_fixture_never_authenticates_species_or_measured_botanical_7oh(self):
        self.assertEqual(self.report['artProvenance'],
          'UNAUTHENTICATED_ILLUSTRATION_NOT_BOTANICAL_SCIENCE')
        self.assertFalse(self.report['sourceIsScientificImage'])
        self.assertFalse(self.report['mayPublish'])

if __name__=='__main__':unittest.main()
