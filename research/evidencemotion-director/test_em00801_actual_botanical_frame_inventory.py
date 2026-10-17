"""EM-008.01 exact-film metadata negative controls; no fictional media fixture PASS."""
import copy
import unittest
from types import SimpleNamespace
from unittest.mock import patch
from em00801_actual_botanical_frame_inventory import (
    FILM_SHA,WAV_SHA,SHOT_IDS,FRAME_COUNT,FPS,SourceHold,contract,parse_framehash,
    all_native_framehashes
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

class RealRgbFramehashProtocolTests(unittest.TestCase):
    HEADER=("\n".join(("#format: frame checksums",
        "#version: 2", "#hash: SHA256", "#tb 0: 1/30",
        "#media_type 0: video", "#codec_id 0: rawvideo",
        "#dimensions 0: 1080x1920", "#sar 0: 0/1",
        "#stream#, dts, pts, duration, size, hash"))+"\n")
    ORIGINAL_PIXEL_SHA="91b8ac6fe5d732d9c89f5c8d644575dad31769f6a5b56c13df677cc36485df32"

    def frame(self,number=24,hash_value=None,size=6220800):
        return f"0, {number}, {number}, 1, {size}, {hash_value or self.ORIGINAL_PIXEL_SHA}\n"

    def test_real_original_frame24_checksum_matches_previous_decoder(self):
        checksums=parse_framehash(self.HEADER+self.frame(),[24])
        self.assertEqual(checksums,[self.ORIGINAL_PIXEL_SHA])

    def test_swapped_frame_index_is_rejected(self):
        with self.assertRaisesRegex(SourceHold,"SWAPPED_TRUNCATED"):
            parse_framehash(self.HEADER+self.frame(number=25),[24])

    def test_missing_frame_is_rejected(self):
        with self.assertRaisesRegex(SourceHold,"MISSING_OR_EXTRA"):
            parse_framehash(self.HEADER, [24])

    def test_duplicate_frame_is_rejected(self):
        with self.assertRaisesRegex(SourceHold,"MISSING_OR_EXTRA"):
            parse_framehash(self.HEADER+self.frame()+self.frame(),[24])

    def test_framehash_metadata_cannot_use_different_pixel_size(self):
        with self.assertRaisesRegex(SourceHold,"SWAPPED_TRUNCATED"):
            parse_framehash(self.HEADER+self.frame(size=2073600),[24])

    def test_unsupported_or_missing_sha256_protocol_is_rejected(self):
        with self.assertRaisesRegex(SourceHold,"PROTOCOL"):
            parse_framehash(self.HEADER.replace("#hash: SHA256","#hash: MD5")+self.frame(),[24])

    def test_invalid_digest_is_rejected(self):
        with self.assertRaisesRegex(SourceHold,"SWAPPED_TRUNCATED"):
            parse_framehash(self.HEADER+self.frame(hash_value="z"*64),[24])


class CompleteOriginalH264FramehashContractTests(unittest.TestCase):
    """Mock parser negatives; real original 1031-frame decoding runs in hosted CI."""

    HEADER=("\n".join(("#format: frame checksums","#version: 2",
        "#hash: SHA256","#tb 0: 1/30","#media_type 0: video",
        "#codec_id 0: rawvideo","#dimensions 0: 1080x1920",
        "#stream#, dts, pts, duration, size, hash"))+"\n")

    def corpus(self, missing=None, duplicate=None, swapped=None):
        hashes=["a"*64 for _ in range(FRAME_COUNT)]
        if swapped is not None:
            hashes[swapped]="b"*64
        rows=[]
        for i,code in enumerate(hashes):
            if i==missing:
                continue
            rows.append(f"0, {i}, {i}, 1, 6220800, {code}\n")
            if i==duplicate:
                rows.append(f"0, {i}, {i}, 1, 6220800, {code}\n")
        return self.HEADER+"".join(rows)

    def invoke(self, text):
        p,_,_=fixture()
        idx=contract(*fixture(),FILM_SHA)
        samples=[{"frameIndex":i,"decodedRgb24Sha256":"a"*64} for i in idx]
        with patch("em00801_actual_botanical_frame_inventory.subprocess.run",
                   return_value=SimpleNamespace(stdout=text,returncode=0)) as run:
            actual=all_native_framehashes("pin.mp4",p["shots"],samples)
        self.assertEqual(run.call_count,1)
        command=run.call_args.args[0]
        self.assertIn("framehash",command)
        self.assertIn("rgb24",command)
        self.assertIn("sha256",command)
        return actual

    def test_every_frame_decoded_and_declared_shot_coverage_without_science_promotion(self):
        data=self.invoke(self.corpus())
        self.assertEqual(data["actualDecodedFrameCount"],1031)
        self.assertEqual(len(data["allActualDecodedFrameHashes"]),1031)
        self.assertEqual([v["frameIndex"] for v in data["allActualDecodedFrameHashes"]],
                         list(range(1031)))
        self.assertEqual(sum(data["authorDeclaredShotFrameCounts"].values()),1031)
        self.assertEqual(set(data["authorDeclaredShotFrameCounts"]),set(SHOT_IDS))
        self.assertEqual(len(data["decodedFrameHashSequenceSha256"]),64)
        self.assertFalse(data["allFramesBotanicallyClassified"])
        self.assertFalse(data["allFramesIndependentlyScientificallyReviewed"])
        self.assertFalse(data["mayPublish"])

    def test_missing_mid_movie_frame_rejected_not_deemed_complete(self):
        with self.assertRaisesRegex(SourceHold,"MISSING_OR_EXTRA"):
            self.invoke(self.corpus(missing=500))

    def test_duplicate_mid_movie_frame_rejected_not_deemed_complete(self):
        with self.assertRaisesRegex(SourceHold,"MISSING_OR_EXTRA"):
            self.invoke(self.corpus(duplicate=500))

    def test_full_frame_scan_must_cross_match_nine_prior_real_midpoints(self):
        mid=contract(*fixture(),FILM_SHA)[3]
        with self.assertRaisesRegex(SourceHold,"MIDPOINTS_DISAGREE"):
            self.invoke(self.corpus(swapped=mid))

    def test_shifted_frame_index_rejected_even_if_total_count_matches(self):
        rows=self.corpus().splitlines(keepends=True)
        target=next(i for i,r in enumerate(rows) if r.startswith("0, 500,"))
        rows[target]=rows[target].replace("0, 500, 500,","0, 501, 501,")
        with self.assertRaisesRegex(SourceHold,"SWAPPED_TRUNCATED"):
            self.invoke("".join(rows))

if __name__=="__main__":
    unittest.main()
