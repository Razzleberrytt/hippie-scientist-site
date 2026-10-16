"""EM-008.01 exact-film metadata negative controls; no fictional media fixture PASS."""
import copy
import unittest
from em00801_actual_botanical_frame_inventory import (
    FILM_SHA,WAV_SHA,SHOT_IDS,FRAME_COUNT,FPS,SourceHold,contract
)

ENDS=[1.61,3.47,10.85,16.58,23.379999,25.709999,27.35,31.25,FRAME_COUNT/FPS]

def fixture():
    start=0
    shots=[]
    for name,end in zip(SHOT_IDS,ENDS):
        shots.append({"id":name,"startSec":start,"endSec":end,"assetKind":"deterministic_science"})
        start=end
    plan={"expectedVideoSha256":FILM_SHA,"status":"RESEARCH_ONLY",
          "releaseApproved":False,"shots":shots}
    receipt={"videoSha256":FILM_SHA,"sourceWavSha256":WAV_SHA,
             "resolution":[1080,1920],"fps":30,"frames":1031,"mayPublish":False}
    inv={"filmSha256":FILM_SHA,"sourceWavSha256":WAV_SHA,
         "shotsInspected":9,"rows":[{"shot":x,"declaredAssetKind":"deterministic_science"} for x in SHOT_IDS],
         "declaredBotanicalArtShotCount":0,"botanicalFrameContentIndependentlyClassified":False,
         "allFrameIndependentOCR":False,"mayPublish":False}
    return plan,receipt,inv

class RealFilmBotanicalInventoryContractTests(unittest.TestCase):
    def test_declared_nine_shots_have_nine_bounded_frame_indices(self):
        p,r,i=fixture()
        result=contract(p,r,i,FILM_SHA)
        self.assertEqual(len(result),9)
        self.assertEqual(len(set(result)),9)
        self.assertTrue(all(0<=x<FRAME_COUNT for x in result))

    def test_modified_movie_identity_denied(self):
        p,r,i=fixture()
        with self.assertRaisesRegex(SourceHold,"SWAPPED"):
            contract(p,r,i,"1"*64)

    def test_foreign_audio_identity_denied(self):
        p,r,i=fixture();r["sourceWavSha256"]="0"*64
        with self.assertRaisesRegex(SourceHold,"FOREIGN"):
            contract(p,r,i,FILM_SHA)

    def test_false_botanical_shot_requires_different_proof(self):
        p,r,i=fixture();p["shots"][4]["assetKind"]="generated_botanical"
        with self.assertRaisesRegex(SourceHold,"BOTANICAL_SHOT"):
            contract(p,r,i,FILM_SHA)

    def test_botanical_count_cannot_be_zeroed_over_conflicting_inventory(self):
        p,r,i=fixture();i["declaredBotanicalArtShotCount"]=1
        with self.assertRaisesRegex(SourceHold,"INCOMPATIBLE_BOTANICAL"):
            contract(p,r,i,FILM_SHA)

    def test_fake_comprehensive_botanical_pixel_clearance_rejected(self):
        p,r,i=fixture();i["botanicalFrameContentIndependentlyClassified"]=True
        with self.assertRaisesRegex(SourceHold,"INCOMPATIBLE_BOTANICAL"):
            contract(p,r,i,FILM_SHA)

    def test_fake_all_frame_ocr_rejected(self):
        p,r,i=fixture();i["allFrameIndependentOCR"]=True
        with self.assertRaisesRegex(SourceHold,"MISLEADING_FULL_FRAME"):
            contract(p,r,i,FILM_SHA)

    def test_unauthorized_publication_is_rejected(self):
        p,r,i=fixture();p["releaseApproved"]=True
        with self.assertRaisesRegex(SourceHold,"PLATFORM_RELEASE"):
            contract(p,r,i,FILM_SHA)

    def test_inaccurate_scene_timing_is_rejected(self):
        p,r,i=fixture();p["shots"][5]["startSec"]+=0.5
        with self.assertRaisesRegex(SourceHold,"TIMELINE_GAP"):
            contract(p,r,i,FILM_SHA)

    def test_incomplete_shot_inventory_is_rejected(self):
        p,r,i=fixture();p["shots"].pop()
        with self.assertRaisesRegex(SourceHold,"NINE_SHOT"):
            contract(p,r,i,FILM_SHA)

    def test_strict_video_size_resolution(self):
        p,r,i=fixture();r["resolution"]=[540,960]
        with self.assertRaisesRegex(SourceHold,"NOT_EXPECTED_NATIVE"):
            contract(p,r,i,FILM_SHA)

if __name__=="__main__":
    unittest.main()
