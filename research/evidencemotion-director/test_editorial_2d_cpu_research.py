"""Simple style-neutral research compositor guards (no clinical or craft approval)."""
import importlib.util
import unittest
from pathlib import Path

spec=importlib.util.spec_from_file_location("editorial_2d_cpu_research",Path(__file__).with_name("editorial_2d_cpu_research.py"))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Editor2DResearch(unittest.TestCase):
    def test_research_only_scope(self):
        self.assertFalse(m.preflight(m.config())["mayPublish"])
        self.assertFalse(m.preflight(m.config())["mayRenderFinal"])
    def test_no_fake_source(self):
        c=m.config();c["sourceCID"]=17
        with self.assertRaisesRegex(ValueError,"PINNED_CHEMISTRY_DRIFT"):m.preflight(c)
    def test_no_voice_in_silent_visual_proof(self):
        c=m.config();c["narraWav"]="fake.wav"
        with self.assertRaisesRegex(ValueError,"UNREVIEWED_SCIENCE"):m.preflight(c)
    def test_no_unsupported_human_claim(self):
        c=m.config();c["scientificClaims"]=["cures insomnia"]
        with self.assertRaisesRegex(ValueError,"UNREVIEWED_SCIENCE"):m.preflight(c)
    def test_nonproduction_bounded_preview_size(self):
        c=m.config();c["width"]=1920
        with self.assertRaisesRegex(ValueError,"UNBOUNDED_COMPUTE"):m.preflight(c)
        c=m.config();c["frames"]=100000
        with self.assertRaisesRegex(ValueError,"UNBOUNDED_COMPUTE"):m.preflight(c)
    def test_source_sha_fixed_by_validator(self):
        self.assertEqual(m.SRC_CID,44301524)
        self.assertEqual(m.SRC_KEY,"RYENLSMHLCNXJT-CYXFISRXSA-N")
    def test_transition_continuity(self):
        self.assertEqual(m.smooth(0),0)
        self.assertEqual(m.smooth(1),1)
        self.assertTrue(all(m.smooth(x/20)<=m.smooth((x+1)/20) for x in range(20)))
    def test_no_placeholder_or_invalid_frame_index(self):
        from PIL import Image
        with self.assertRaisesRegex(ValueError,"INVALID_FRAME_INDEX"):
            m.frame(Image.new("RGBA",(20,20)),m.N)
    def test_atomic_pixel_output_shape_and_immutable_recipe(self):
        from PIL import Image
        c=Image.new("RGBA",(920,780),(0,0,0,0))
        for i in (0,24,47):
            p=m.frame(c,i)
            self.assertEqual(p.size,(540,960))
            self.assertEqual(p.mode,"RGB")
            # TikTok rightmost overlay reserve should contain no content text.
            self.assertEqual(p.getpixel((530,700)),m.INK)

if __name__=="__main__":unittest.main()
