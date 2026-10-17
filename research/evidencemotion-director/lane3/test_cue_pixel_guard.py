"""Zero paid-provider runtime; native real-media test requires local archived film."""
import copy, importlib.util, json, os, unittest
from pathlib import Path
s=importlib.util.spec_from_file_location('pixel_guard',Path(__file__).with_name('cue_pixel_guard.py'))
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
ROOT=Path(__file__).resolve().parent
class CuePixelNegativeTests(unittest.TestCase):
    def setUp(self):
        self.clean={k:{'disclosureBrightPixels':0 if k<595 else 4000,
                       'modelBrightPixels':0 if k<555 else 400}
                    for k in (498,554,555,566,594,595,660,701)}
    def test_expected_spoken_onset_stays_clean(self):
        self.assertEqual(m.decide_observations(self.clean),[])
    def test_early_disclosure_stops_release_even_with_correct_audio(self):
        tamper=copy.deepcopy(self.clean);tamper[594]['disclosureBrightPixels']=5000
        self.assertIn('PREMATURE_NEGATION_CANDIDATE_FRAME_594',m.decide_observations(tamper))
    def test_early_model_stops_source_first_reveal(self):
        tamper=copy.deepcopy(self.clean);tamper[554]['modelBrightPixels']=999
        self.assertIn('PREMATURE_CALCULATED_STAGE_FRAME_554',m.decide_observations(tamper))
    def test_hidden_disclaimer_after_cue_is_not_green(self):
        tamper=copy.deepcopy(self.clean);tamper[595]['disclosureBrightPixels']=0
        self.assertIn('MISSING_DISCLOSURE_RENDER_FRAME_595',m.decide_observations(tamper))
    def test_hidden_computed_stage_is_not_green(self):
        tamper=copy.deepcopy(self.clean);tamper[660]['modelBrightPixels']=0
        self.assertIn('MISSING_COMPUTED_STAGE_FRAME_660',m.decide_observations(tamper))
    def test_missing_actual_frame_is_not_green(self):
        tamper=copy.deepcopy(self.clean);tamper.pop(701)
        with self.assertRaisesRegex(m.VisualHold,'INCOMPLETE'):
            m.decide_observations(tamper)
    def test_untrusted_manifest_bails_before_decoding_video(self):
        import tempfile
        with tempfile.TemporaryDirectory() as td:
            a=Path(td);(a/'x.mp4').write_bytes(b'forged')
            (a/'story.json').write_text('{}');(a/'receipt.json').write_text('{}')
            with self.assertRaisesRegex(m.VisualHold,'SHA_MISMATCH'):
                m.pinned(a/'x.mp4',a/'story.json',a/'receipt.json')
    def test_research_flags_cannot_auto_pass(self):
        self.assertLess(m.CUES['firstComputed'],m.CUES['firstNegation'])
        self.assertFalse(any(name in ['publish','post'] for name in m.CUES))
    def test_actual_original_archived_cue_pixels(self):
        film=os.environ.get('LANE3_CUE_FILM')
        if not film:self.skipTest('Full native film not in hosted CI')
        story=os.environ.get('LANE3_CUE_STORY')
        receipt=os.environ.get('LANE3_CUE_RECEIPT')
        self.assertTrue(story and receipt)
        result=m.audit(film,story,receipt)
        self.assertEqual(result['issues'],[])
        self.assertEqual(result['fullFilmFramesDecoded'],1031)
        self.assertFalse(result['mayPublish'])
        self.assertEqual(result['measuredFrames'][594]['disclosureBrightPixels'],0)
        self.assertGreater(result['measuredFrames'][595]['disclosureBrightPixels'],1000)
if __name__=='__main__':unittest.main()
