"""Negative-controlled mechanical story-map checks; no viewer or craft grading.

The mock codec probe is used ONLY by unit fixtures; the hosted workflow
probes and decodes a genuinely source-locked original-WAV full-HD H264 film.
"""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from autonomous_script_asr_research import LINES,WAV_SHA
from narration_first_story_map import audit_story,STORY


class FourActNarrationFirstTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        base=Path(self.tmp.name)
        self.movie=base/"movie.mp4"
        self.movie.write_bytes(b"fake-fixture-only-no-video-approval")
        self.receipt=base/"receipt.json"
        self.phone=base/"phone.json"
        self.out=base/"story-map.json"
        filmsha=hashlib.sha256(self.movie.read_bytes()).hexdigest()
        bound=[(0,3.47),(3.47,10.85),(10.85,16.58),
               (16.58,23.38),(23.38,27.35),(27.35,31.25),
               (31.25,34.347)]
        ids=("sentence_1","sentence_2","sentence_3","sentence_4",
             "sentence_5","source_hold","sentence_6")
        self.scenes=[]
        for i,(sid,(start,end)) in enumerate(zip(ids,bound)):
            line=LINES[i] if i<5 else ("" if i==5 else LINES[5])
            cues=[{"text":word,"startSec":start+.1+j*.012,
                   "endSec":start+.15+j*.012}
                  for j,word in enumerate(line.split())]
            if i==0:
                next(c for c in cues if c["text"]=="different")["startSec"]=1.61
            if i==4:
                next(c for c in cues if c["text"]=="not")["startSec"]=25.71
            self.scenes.append({"id":sid,"line":line,
                                "startSec":start,"endSec":end,
                                "captionWords":cues if line else []})
        self.shots=[]
        for sid,_,_,_,_ in STORY:
            index={"sentence_1_part0":0,"sentence_1_part1":0,
                   "sentence_5_part0":4,"sentence_5_part1":4}.get(sid)
            scene=self.scenes[index] if index is not None else next(
                s for s in self.scenes if s["id"]==sid)
            start,end=scene["startSec"],scene["endSec"]
            if sid=="sentence_1_part0":end=1.61
            if sid=="sentence_1_part1":start=1.61
            if sid=="sentence_5_part0":end=25.71
            if sid=="sentence_5_part1":start=25.71
            self.shots.append({"id":sid,"startSec":start,"endSec":end,
                               "annotations":[]})
        self.data={
            "sourceWavSha256":WAV_SHA,"videoSha256":filmsha,
            "resolution":[1080,1920],"fps":30,"frames":1031,
            "experimentCaptionMode":"TIMED_RESEARCH",
            "candidateCaptionWindowsAppliedToFilm":True,
            "sourceGraphConnectionTeachingResearch":True,
            "sourceLockedOxygenSpotlightResearch":True,
            "mayPublish":False,"scenes":self.scenes}
        self.plan={"status":"RESEARCH_ONLY","releaseApproved":False,
                   "expectedVideoSha256":filmsha,"shots":self.shots}

    def tearDown(self):
        self.tmp.cleanup()

    def run_map(self):
        self.receipt.write_text(json.dumps(self.data))
        self.phone.write_text(json.dumps(self.plan))
        with patch("narration_first_story_map.probe_movie",
                   return_value=(1080,1920,34.347,1031)):
            return audit_story(self.movie,self.receipt,self.phone,self.out)

    def test_four_act_source_bound_timeline_and_no_fake_quality(self):
        result=self.run_map()
        self.assertEqual(result["nineShotsMapped"],9)
        self.assertEqual(result["fourActs"],
                         ["QUESTION","EVIDENCE","LIMITS","TAKEAWAY"])
        self.assertEqual(len(result["shots"]),9)
        self.assertFalse(result["independentCraftCalibrationPassed"])
        self.assertFalse(result["mayPublish"])

    def test_no_fake_h264_codec(self):
        self.receipt.write_text(json.dumps(self.data))
        self.phone.write_text(json.dumps(self.plan))
        with self.assertRaisesRegex(ValueError,"ACTUAL_ENCODED_VIDEO_NOT_DECODABLE"):
            audit_story(self.movie,self.receipt,self.phone,self.out)

    def test_wrong_spoken_narration_or_spoken_cut_fails(self):
        self.data["scenes"][2]["line"]="A made-up medical claim."
        with self.assertRaisesRegex(ValueError,"ORIGINAL_NARRATION"):
            self.run_map()
        self.data["scenes"][2]["line"]=LINES[2]
        self.data["scenes"][0]["captionWords"]=[c for c in self.scenes[0]["captionWords"]
                                               if c["text"]!="different"]
        with self.assertRaisesRegex(ValueError,"SPOKEN_REVEAL_CUES"):
            self.run_map()

    def test_shot_swap_or_unjustified_reveal_cut_fails(self):
        self.shots[3],self.shots[4]=self.shots[4],self.shots[3]
        with self.assertRaisesRegex(ValueError,"NINE_SCENES_OUT_OF_ORDER"):
            self.run_map()
        self.shots[3],self.shots[4]=self.shots[4],self.shots[3]
        self.shots[1]["startSec"]=1.3
        with self.assertRaisesRegex(ValueError,"UNJUSTIFIED_SHOT_CUT"):
            self.run_map()

    def test_film_sha_or_release_and_oxygen_research_identity_fails(self):
        self.data["videoSha256"]="f"*64
        with self.assertRaisesRegex(ValueError,"SPOKEN_SOURCE_OR_EXACT_MP4"):
            self.run_map()
        self.data["videoSha256"]=self.plan["expectedVideoSha256"]
        self.data["mayPublish"]=True
        with self.assertRaisesRegex(ValueError,"SPOKEN_SOURCE_OR_EXACT_MP4"):
            self.run_map()
        self.data["mayPublish"]=False
        self.data["sourceGraphConnectionTeachingResearch"]=False
        with self.assertRaisesRegex(ValueError,"SPOKEN_SOURCE_OR_EXACT_MP4"):
            self.run_map()


if __name__=="__main__":
    unittest.main()
