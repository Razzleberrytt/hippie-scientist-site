"""No fictional viewers, movie-source drift or disclosed blind answer keys."""
import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from autonomous_script_asr_research import WAV_SHA
from timed_soundoff_review_packet import QUESTIONS,verify_sources,grade

class SoundOffBlindPacketTests(unittest.TestCase):
    def setUp(self):
        self.dir=tempfile.TemporaryDirectory()
        self.root=Path(self.dir.name)
        self.movie=self.root/"film.mp4"
        self.movie.write_bytes(b"UNIT TEST ONLY - NONVIDEO")
        self.sha=hashlib.sha256(self.movie.read_bytes()).hexdigest()
        self.r=self.root/"render.json"
        self.p=self.root/"phone.json"
        self.s=self.root/"science.json"
        self.t=self.root/"story.json"
        self.render={"videoSha256":self.sha,"sourceWavSha256":WAV_SHA,
          "experimentCaptionMode":"TIMED_RESEARCH","fps":30,"frames":1031,
          "resolution":[1080,1920],"mayPublish":False}
        self.phone={"expectedVideoSha256":self.sha,
          "status":"RESEARCH_ONLY","releaseApproved":False,
          "shots":[{"id":x} for x in [
            "sentence_1_part0","sentence_1_part1","sentence_2",
            "sentence_3","sentence_4","sentence_5_part0",
            "sentence_5_part1","source_hold","sentence_6"]]}
        self.science={"encodedH264Sha256":self.sha,
          "allNineShotInksIndependentlyRecovered":True,"mayPublish":False}
        self.story={"encodedH264Sha256":self.sha,"sourceWavSha256":WAV_SHA,
          "nineShotsMapped":9,
          "fourActs":["QUESTION","EVIDENCE","LIMITS","TAKEAWAY"],
          "mayPublish":False,
          "shots":[{"shot":x["id"]} for x in self.phone["shots"]]}
        self.write_all()

    def write_all(self):
        self.r.write_text(json.dumps(self.render))
        self.p.write_text(json.dumps(self.phone))
        self.science["receiptSha256"]=hashlib.sha256(self.r.read_bytes()).hexdigest()
        self.science["phonePlanSha256"]=hashlib.sha256(self.p.read_bytes()).hexdigest()
        self.story["renderReceiptSha256"]=hashlib.sha256(self.r.read_bytes()).hexdigest()
        self.story["phonePlanSha256"]=hashlib.sha256(self.p.read_bytes()).hexdigest()
        self.s.write_text(json.dumps(self.science))
        self.t.write_text(json.dumps(self.story))

    def tearDown(self):
        self.dir.cleanup()

    def verify(self):
        return verify_sources(self.movie,self.r,self.p,self.s,self.t)

    def test_exact_hash_pinning_and_five_distinct_questions(self):
        self.assertEqual(self.verify()["video"],self.sha)
        self.assertEqual([x[0] for x in QUESTIONS],[f"Q{i}" for i in range(1,6)])
        self.assertEqual(len({q[1] for q in QUESTIONS}),5)
        self.assertEqual(set(q[3] for q in QUESTIONS),set("ABCD"))
        self.assertTrue(all(len(q[2])==4 for q in QUESTIONS))

    def test_real_response_is_required_no_dummy_participants(self):
        key={q[0]:q[3] for q in QUESTIONS}
        with self.assertRaisesRegex(ValueError,"REAL_COMPLETE_BLIND_RESPONSE"):
            grade({},key,self.sha)
        with self.assertRaisesRegex(ValueError,"INVALID_OR_MISSING_BLIND_CHOICE"):
            grade({**key,"Q1":None},key,self.sha)

    def test_deterministic_grader_is_not_an_independent_viewing_claim(self):
        answers={q[0]:q[3] for q in QUESTIONS}
        r=grade(answers,answers,self.sha)
        self.assertEqual(r["correct"],5)
        self.assertTrue(r["allCriticalQuestionsCorrect"])
        self.assertTrue(r["notAnIndependentViewingProof"])
        self.assertFalse(r["mayPublish"])
        wrong={**answers,"Q4":"A"}
        r=grade(wrong,answers,self.sha)
        self.assertEqual(r["correct"],4)
        self.assertFalse(r["allCriticalQuestionsCorrect"])

    def test_incomplete_or_altered_rubric_cannot_report_critical_pass(self):
        canonical={q[0]:q[3] for q in QUESTIONS}
        for key in ({"Q1":"A"},{**canonical,"Q4":"A"},
                    {**canonical,"Q6":"A"},{}):
            with self.subTest(key=key):
                with self.assertRaisesRegex(ValueError,"REGISTERED_FIVE_QUESTION_RUBRIC_REQUIRED"):
                    grade(key,key,self.sha)

    def test_reviewed_video_identity_must_be_sha256_hex(self):
        key={q[0]:q[3] for q in QUESTIONS}
        for identity in ("z"*64," "*64,"a"*63,None):
            with self.subTest(identity=identity):
                with self.assertRaisesRegex(ValueError,"NO_EXACT_REVIEWED_VIDEO_IDENTITY"):
                    grade(key,key,identity)

    def test_source_media_mutation_is_rejected(self):
        self.movie.write_bytes(b"UNTRUSTED CHANGE")
        with self.assertRaisesRegex(ValueError,"EXACT_TIMED_FILM"):
            self.verify()

    def test_wrong_science_sha_and_modified_storyboard_fail_closed(self):
        self.science["encodedH264Sha256"]="a"*64
        self.write_all()
        with self.assertRaisesRegex(ValueError,"EXACT_TIMED_FILM"):
            self.verify()
        self.science["encodedH264Sha256"]=self.sha
        self.story["shots"][1]["shot"]="source_hold"
        self.write_all()
        with self.assertRaisesRegex(ValueError,"BLIND_STIMULUS_SHOT_ORDER_CHANGED"):
            self.verify()

    def test_matching_but_invalid_shot_lists_fail_closed(self):
        original=copy.deepcopy(self.phone["shots"])
        variants=[[],original[:-1],
                  [original[0]]*9,
                  list(reversed(original)),
                  [{"id":"unknown_shot"}]+original[1:],
                  [{} for _ in range(9)]]
        for shots in variants:
            with self.subTest(shots=shots):
                self.phone["shots"]=shots
                self.story["shots"]=[{"shot":shot.get("id")} for shot in shots]
                self.write_all()  # Rehash inputs: hashes alone cannot prove shot identity.
                with self.assertRaisesRegex(ValueError,"BLIND_STIMULUS_SHOT_ORDER_CHANGED"):
                    self.verify()

    def test_malformed_shot_containers_fail_with_explicit_hold(self):
        for document in (self.phone,self.story):
            original=copy.deepcopy(document["shots"])
            for shots in (None,{},"nine shots",[None]*9):
                with self.subTest(shots=shots):
                    document["shots"]=shots
                    self.write_all()
                    with self.assertRaisesRegex(ValueError,"BLIND_STIMULUS_SHOT_ORDER_CHANGED"):
                        self.verify()
            document["shots"]=original

    def test_no_publishing_or_fabricated_review_flags(self):
        self.render["mayPublish"]=True
        self.write_all()
        with self.assertRaisesRegex(ValueError,"EXACT_TIMED_FILM"):
            self.verify()
        self.render["mayPublish"]=False
        self.phone["releaseApproved"]=True
        self.write_all()
        with self.assertRaisesRegex(ValueError,"EXACT_TIMED_FILM"):
            self.verify()

if __name__=="__main__":
    unittest.main()
