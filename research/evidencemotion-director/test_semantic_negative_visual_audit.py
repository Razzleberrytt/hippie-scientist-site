import tempfile,unittest
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
from semantic_negative_visual_audit import frame_guard,run_audit,build_model

class ResearchVisualNegativeTests(unittest.TestCase):
    def setUp(self):
        im=Image.new('RGB',(320,320),(17,26,34));d=ImageDraw.Draw(im)
        d.line([(115,100),(140,110),(165,145),(200,155),(220,179)],fill=(224,238,243),width=6)
        d.ellipse((120,115,182,177),outline=(253,195,106),width=5)
        self.expected=np.asarray(im).copy()
        self.actual=self.expected.copy()

    def verdict(self,changed=None,highlight=False):
        return frame_guard(self.expected,self.actual if changed is None else changed,
                           hydroxyl_roi=(151,146) if highlight else None)

    def test_unchanged_source_does_not_self_certify_craft(self):
        r=self.verdict(highlight=True)
        self.assertEqual(r['status'],'SOURCE_FRAME_MATCH')
        self.assertFalse(r['craftApproved'])
        self.assertFalse(r['releaseApproved'])

    def test_wrong_scene_identity_is_rejected(self):
        x=self.actual.copy();x[90:190,105:230,:]=[12,23,37]
        self.assertIn('SCENE_CROP_SOURCE_DRIFT_OR_UNEXPECTED_OVERLAY',self.verdict(x)['errors'])

    def test_crop_triggers_hold(self):
        x=self.actual.copy();x[75:185,145:239,:]=[17,26,34]
        self.assertEqual(self.verdict(x)['status'],'HOLD')

    def test_displaced_hydroxyl_highlight_is_rejected(self):
        x=Image.fromarray(self.actual);d=ImageDraw.Draw(x)
        d.ellipse((120,115,182,177),fill=(17,26,34),outline=(17,26,34),width=6)
        d.ellipse((200,195,262,257),outline=(253,195,106),width=5)
        self.assertIn('OH_MARKER_MISSING_OR_MISPLACED',self.verdict(np.asarray(x),True)['errors'])

    def test_reference_without_hydroxyl_marker_is_rejected(self):
        x=np.full((320,320,3),20,dtype=np.uint8)
        self.assertIn('EXPECTED_OH_MARKER_NOT_FOUND',frame_guard(x,x,hydroxyl_roi=(151,146))['errors'])

    def test_unsourced_particles_do_not_count_as_hero_motion(self):
        x=self.actual.copy()
        for y,z in [(85,72),(90,80),(94,87),(110,82),(105,69),(117,73)]:x[y,z,:]=[255,255,251]
        self.assertIn('UNSOURCED_BRIGHT_PARTICLE_OR_INSERT',self.verdict(x)['errors'])

    def test_obstructed_chemical_diagram_is_rejected(self):
        x=self.actual.copy();x[112:155,125:220,:]=[250,246,243]
        self.assertIn('SCENE_CROP_SOURCE_DRIFT_OR_UNEXPECTED_OVERLAY',self.verdict(x)['errors'])

    def test_bad_decoded_frame_geometry_is_rejected(self):
        self.assertEqual(frame_guard(self.expected,self.actual[:310,:,:])['status'],'HOLD')
        self.assertEqual(frame_guard(self.expected,np.zeros((320,320),dtype=np.uint8))['status'],'HOLD')

    def test_manifest_cannot_self_authenticate_coordinated_source_tampering(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            (root/'source_input_manifest.json').write_text('{"sourceInputs":{}}')
            with self.assertRaisesRegex(RuntimeError,'SOURCE_MANIFEST_SHA_DRIFT'):
                build_model(root)

    def test_wrong_video_byte_hash_rejected_before_any_source_claim(self):
        with tempfile.TemporaryDirectory() as d:
            wrong=Path(d)/'movie.mp4';wrong.write_bytes(b'fake')
            with self.assertRaisesRegex(RuntimeError,'EXACT_FINAL_MP4_SHA_MISMATCH'):
                run_audit(d,wrong)
