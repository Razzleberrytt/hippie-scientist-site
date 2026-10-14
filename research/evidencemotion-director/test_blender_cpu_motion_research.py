"""Research motion fail-closed tests; do NOT certify a cinematic video."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

path=Path(__file__).with_name("blender_cpu_motion_research.py")
spec=importlib.util.spec_from_file_location("blender_cpu_motion_research",path)
m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)

def fixture():
    return {"schema":"ths-blender-motion-research-v1","track":"RESEARCH_ONLY",
            "mayPublish":False,"sourceCID":m.base.CID,
            "sourceInchiKey":m.base.INCHIKEY,"narrationWav":None,
            "approvedClaimIDs":[],"fps":12,"frames":36,
            "dimensions":[270,480],"concept":"oxygen-to-whole",
            "packetSha256":"a"*64}
class MotionContractTests(unittest.TestCase):
    def test_admits_exact_bounded_silent_research_job(self):
        self.assertEqual(m.validate_job(fixture())["status"],"BOUNDED_PREVIEW_JOB")
        self.assertFalse(m.validate_job(fixture())["mayPublish"])
    def test_no_claimed_final_or_production(self):
        p=fixture();p["mayPublish"]=True
        with self.assertRaisesRegex(ValueError,"PRODUCTION_BOUNDARY"):m.validate_job(p)
    def test_no_audio_passthrough_without_exact_approved_voice(self):
        p=fixture();p["narrationWav"]="voice.wav"
        with self.assertRaisesRegex(ValueError,"NO_VOICE_OR_CLAIM_APPROVAL"):m.validate_job(p)
    def test_no_synthetic_claims(self):
        p=fixture();p["approvedClaimIDs"]=["invented"]
        with self.assertRaisesRegex(ValueError,"NO_VOICE_OR_CLAIM_APPROVAL"):m.validate_job(p)
    def test_reject_wrong_source(self):
        p=fixture();p["sourceCID"]=123
        with self.assertRaisesRegex(ValueError,"SOURCE_DRIFT"):m.validate_job(p)
    def test_reject_invalid_content_hash(self):
        p=fixture();p["packetSha256"]="fake"
        with self.assertRaisesRegex(ValueError,"MISSING_SOURCE_SHA"):m.validate_job(p)
    def test_reject_unbounded_frames_or_size(self):
        p=fixture();p["frames"]=10000
        with self.assertRaisesRegex(ValueError,"UNBOUNDED_COMPUTE"):m.validate_job(p)
        p=fixture();p["dimensions"]=[1920,1080]
        with self.assertRaisesRegex(ValueError,"UNBOUNDED_COMPUTE"):m.validate_job(p)
    def test_requires_known_semantic_camera_concept(self):
        p=fixture();p["concept"]="party-confetti"
        with self.assertRaisesRegex(ValueError,"UNSUPPORTED_CONCEPT"):m.validate_job(p)
    def test_timed_easing_bounds(self):
        self.assertEqual(m.smooth(-1),0)
        self.assertEqual(m.smooth(0),0)
        self.assertEqual(m.smooth(1),1)
        self.assertEqual(m.smooth(4),1)
        self.assertLess(m.smooth(.25),.25)
    def test_physical_orbit_never_exceeds_adopted_eight_degree_ceiling(self):
        angles=[m.orbit_degrees(i/35) for i in range(36)]
        self.assertAlmostEqual(angles[0],-4.0)
        self.assertAlmostEqual(angles[-1],4.0)
        self.assertLessEqual(max(angles)-min(angles),m.ORBIT_MAX_TRAVEL_DEGREES)
        self.assertEqual(m.ORBIT_MAX_TRAVEL_DEGREES,8.0)
        self.assertEqual(angles,sorted(angles))
    def test_wrong_hash_refused_prior_to_blender(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/"src.json";p.write_text('{"test":1}')
            with self.assertRaisesRegex(ValueError,"EXACT_PACKET_SHA_REQUIRED"):
                m.render_motion(p,"a"*64,d,"oxygen-to-whole")

if __name__=="__main__":unittest.main()
