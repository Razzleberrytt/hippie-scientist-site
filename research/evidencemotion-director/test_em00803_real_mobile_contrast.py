"""EM-008.03: actual H264 decoded 375px phone-width text contrast research."""
import hashlib
import json
import os
from pathlib import Path
import tempfile
import unittest
from PIL import Image
from em00803_real_mobile_contrast import (
    execute,audit,measure,render,contrast,BOX,LINES,THRESHOLD,VARIANTS,FONT
)
from em00805_botanical_video_probes import sha,fixture_art,decode_frame,font

class NativePhoneWidthPixelResearch(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp=tempfile.TemporaryDirectory()
        cls.out=Path(cls.tmp.name)
        cls.report=execute(cls.out)

    @classmethod
    def tearDownClass(cls):
        receipt=os.environ.get('THS_EM00803_RECEIPT')
        if receipt:
            target=Path(receipt)
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_bytes((cls.out/'research-receipt.json').read_bytes())
        cls.tmp.cleanup()

    def test_exact_four_actual_h264_2s_source_shas(self):
        self.assertEqual(self.report['schema'],
            'ths-em00803-decoded-375px-contrast-research-v1')
        self.assertEqual(self.report['sourceSha256'],
            sha(self.out/'authored-leaf-fixture.png'))
        self.assertEqual(self.report['simulatedPhonePx'],(375,667))
        self.assertEqual(self.report['thresholdRatio'],7.0)
        self.assertFalse(self.report['realPhoneScaleValidated'])
        self.assertEqual([c['mode'] for c in self.report['cases']],list(VARIANTS))
        for c in self.report['cases']:
            self.assertEqual(c['encodedH264Sha256'],sha(self.out/(c['mode']+'.mp4')))
            self.assertEqual(len(c['sampledDecodedFrames']),3)
            self.assertTrue(all(len(t['actualDecodedRgbSha256'])==64 for t
                                in c['sampledDecodedFrames']))

    def test_high_contrast_decoded_first_mid_and_final_frame(self):
        c=self.report['cases'][0]
        self.assertEqual(c['decision'],'DECODED_PHONE_WIDTH_PIXEL_RESEARCH_ONLY')
        self.assertEqual([x['frame'] for x in c['sampledDecodedFrames']],[0,30,59])
        for frame in c['sampledDecodedFrames']:
            self.assertTrue(frame['researchCandidatePixelCheckPassed'])
            self.assertFalse(frame['mayPublish'])
            for row in frame['textPixelContrast']:
                self.assertGreaterEqual(row['measuredDecodedPhoneRgbContrast'],THRESHOLD)
                self.assertGreaterEqual(row['projectedAuthoredFontPxAt375'],16)
                self.assertGreater(row['letterInteriorPixelsMeasured'],50)

    def test_both_faint_and_missing_h264_are_holds_on_actual_decoded_pixels(self):
        for c in self.report['cases'][1:3]:
            self.assertEqual(c['decision'],'HOLD_MOBILE_DISCLOSURE_UNREADABLE_OR_MISSING')
            for f in c['sampledDecodedFrames']:
                self.assertTrue(f['negativeControlRejected'])
                self.assertFalse(f['researchCandidatePixelCheckPassed'])
                self.assertTrue(all(not x['passConservativeResearchThreshold'] for x
                                    in f['textPixelContrast']))

    def test_tiny_caption_proven_too_small_even_if_video_ink_is_bright(self):
        c=self.report['cases'][3]
        self.assertEqual(c['decision'],'HOLD_MOBILE_DISCLOSURE_UNREADABLE_OR_MISSING')
        self.assertTrue(all(x['negativeControlRejected'] and not
                            x['researchCandidatePixelCheckPassed']
                            for x in c['sampledDecodedFrames']))
        self.assertLess(25*375/1080,16)

    def test_swapped_film_sha_never_carries_review_result(self):
        with self.assertRaisesRegex(ValueError,'WRONG_ENCODED_MOVIE_SHA'):
            audit(self.out/'legible.mp4','0'*64,'legible')

    def test_unrecognized_mode_and_oversized_content_fail(self):
        with Image.open(self.out/'authored-leaf-fixture.png') as im:
            with self.assertRaisesRegex(ValueError,'UNRECOGNIZED_REAL_FRAME_VARIANT'):
                render(im,'measured_real_7oh')
        with self.assertRaisesRegex(ValueError,'INVALID_VARIANT'):
            audit(self.out/'legible.mp4',sha(self.out/'legible.mp4'),'approved')

    def test_external_art_cannot_inherit_disclosure_proof_without_sha_pin(self):
        with self.assertRaisesRegex(ValueError,'UNPINNED_EXTERNAL_BOTANICAL_ART_HOLD'):
            execute(self.out/'unauthenticated-art',self.out/'authored-leaf-fixture.png')
        with self.assertRaisesRegex(ValueError,'BINARY_SOURCE_ART_SHA_MISMATCH_HOLD'):
            execute(self.out/'source-swap',self.out/'authored-leaf-fixture.png',
                    expected_source_sha='0'*64)

    def test_source_hash_without_supplied_source_cannot_pretend_to_validate_art(self):
        with self.assertRaisesRegex(ValueError,'SOURCE_HASH_PROVIDED_WITHOUT_EXTERNAL_SOURCE_HOLD'):
            execute(self.out/'no-external',expected_source_sha='0'*64)

    def test_font_is_inside_short_safe_area_at_375(self):
        self.assertTrue(BOX[0]>=0 and BOX[2]<864 and BOX[3]<1574)
        self.assertEqual(len(LINES),2)
        self.assertTrue(all(size*375/1080>=16 for _,size,_,_ in LINES))
        self.assertTrue(all(x+font(FONT,size).getlength(line)<=BOX[2]-8
                            for line,size,x,y in LINES))

    def test_wcag_linear_luminance_ratio_not_linear_255_simple_math(self):
        self.assertAlmostEqual(contrast((255,255,255),(0,0,0)),21.0)
        self.assertEqual(contrast((20,20,20),(20,20,20)),1.0)
        self.assertGreater(contrast((240,240,240),(10,18,18)),7)

    def test_exact_scientific_and_release_gates_stay_false(self):
        self.assertFalse(self.report['mayPublish'])
        self.assertFalse(self.report['sourceApproval'])
        self.assertFalse(self.report['fixtureScientificPhoto'])
        for c in self.report['cases']:
            for key in ('actualPhonePlayback','botanicalContentAssayVerified',
                        'sourceAssetIdentifiedAsSpecies',
                        'independentHumanReadabilityValidated','mayPublish'):
                self.assertFalse(c[key])
            for f in c['sampledDecodedFrames']:
                for key in ('realHandsetTested','independentOcrOrSemanticTruthVerified',
                            'publicationApproved','mayPublish'):
                    self.assertFalse(f[key])

if __name__=="__main__":unittest.main()
