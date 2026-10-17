"""Actual-film science source integrity tests; owner film optional on CI runner."""
import copy
import json
import os
import tempfile
import unittest
from pathlib import Path

from gut_exact_film_science_crosswalk import (
 parse_manifest, audit, SCHEMA, MOVIE_SHA, SRT_SHA, SCENES, SOURCES)

def valid():
 return dict(schema=SCHEMA,movieSha256=MOVIE_SHA,srtSha256=SRT_SHA,encodedFrameCount=845,
  scenes=[dict(id=id,sampleFrame=n,sourceScope=scope,limitation=limit,
   inFrameSourceLabel=source,sampleRgb540Sha256="b"*64,
   sourceReviewState="MACHINE_VISUAL_INTAKE_HOLD")
   for id,n,scope,limit,source in SCENES],
  primarySources=dict(SOURCES),mayPublish=False,qualifiedIndependentSciencePassed=False,
  realPhonePassed=False,overallScienceDisposition="RESEARCH_SOURCE_SCOPES_REVIEWED_RELEASE_HOLD")

class ScienceCrosswalkTests(unittest.TestCase):
 def setUp(self):
  self.d=tempfile.TemporaryDirectory()
  self.path=Path(self.d.name)/"manifest.json"
 def tearDown(self):self.d.cleanup()
 def check(self,d):
  self.path.write_text(json.dumps(d),encoding="utf8")
  return parse_manifest(self.path)
 def test_six_original_source_scopes_structurally_valid_not_release(self):
  d=self.check(valid())
  self.assertEqual(len(d["scenes"]),6)
  self.assertIs(d["qualifiedIndependentSciencePassed"],False)
  self.assertIs(d["scenes"][1]["inFrameSourceLabel"],False)
 def test_release_scene_cannot_launder_niddk_digestion_as_formulation_study(self):
  d=valid();d["scenes"][1]["sourceScope"]="NIDDK_NUTRIENTS_FROM_FOOD"
  with self.assertRaisesRegex(ValueError,"SCENE_SOURCE_SCOPE"):self.check(d)
 def test_missing_in_scene2_source_must_not_be_forged(self):
  d=valid();d["scenes"][1]["inFrameSourceLabel"]=True
  with self.assertRaisesRegex(ValueError,"SCENE_SOURCE_SCOPE"):self.check(d)
 def test_vitamin_d_does_not_require_concurrent_fat(self):
  d=valid();d["scenes"][3]["limitation"]="Every vitamin D supplement requires fat"
  with self.assertRaisesRegex(ValueError,"SCENE_SOURCE_SCOPE"):self.check(d)
 def test_tea_polyphenols_cannot_be_universally_quantified(self):
  d=valid();d["scenes"][4]["limitation"]="Tea always blocks 90 percent of iron"
  with self.assertRaisesRegex(ValueError,"SCENE_SOURCE_SCOPE"):self.check(d)
 def test_primary_source_replacement_rejected(self):
  d=valid();d["primarySources"]["ods_vitamin_d"]="https://example.org/fictional"
  with self.assertRaisesRegex(ValueError,"SOURCE_URLS"):self.check(d)
 def test_wrong_movie_and_srt_identities_rejected_before_decode(self):
  for k in ("movieSha256","srtSha256"):
   d=valid();d[k]="0"*64
   with self.subTest(k=k),self.assertRaisesRegex(ValueError,"SOURCE_IDENTITY"):self.check(d)
 def test_claim_or_approval_forgery_refused(self):
  for k in ("mayPublish","qualifiedIndependentSciencePassed","realPhonePassed"):
   d=valid();d[k]=True
   with self.subTest(k=k),self.assertRaisesRegex(ValueError,"FORGED_APPROVAL"):self.check(d)
 def test_qualified_review_card_is_not_satisfied_by_technical_source_intake(self):
  d=valid();d["scenes"][0]["sourceReviewState"]="V_VERIFIED"
  with self.assertRaisesRegex(ValueError,"CLAIM_PREMATURELY_SCIENCE_APPROVED"):self.check(d)
 def test_changed_order_or_extra_source_scene_refused(self):
  d=valid();d["scenes"][1],d["scenes"][2]=d["scenes"][2],d["scenes"][1]
  with self.assertRaisesRegex(ValueError,"SCENE_SOURCE_SCOPE"):self.check(d)
  d=valid();d["scenes"].append(copy.deepcopy(d["scenes"][0]))
  with self.assertRaisesRegex(ValueError,"EXACT_SIX_SCENES"):self.check(d)
 def test_duplicate_json_keys_refused(self):
  s=json.dumps(valid()).replace('"mayPublish": false,','"mayPublish": false, "mayPublish": false,')
  self.path.write_text(s)
  with self.assertRaisesRegex(ValueError,"DUPLICATE_MANIFEST_KEY"):parse_manifest(self.path)
 def test_missing_or_non_hex_frame_pin_refused(self):
  d=valid();d["scenes"][3]["sampleRgb540Sha256"]="invalid"
  with self.assertRaisesRegex(ValueError,"INVALID_FRAME_RGB_DIGEST"):self.check(d)
 def test_bogus_owner_video_rejected_not_claimed_source_replay(self):
  with tempfile.TemporaryDirectory() as tmp:
   movie=Path(tmp)/"fake.mp4";srt=Path(tmp)/"fake.srt"
   movie.write_bytes(b"film");srt.write_bytes(b"srt")
   self.check(valid())
   with self.assertRaisesRegex(ValueError,"WRONG_ENCODED_MOVIE_OR_SRT"):
    audit(self.path,movie,srt)
 @unittest.skipUnless(os.getenv("THS_GUT_CURRENT_FILM") and os.getenv("THS_GUT_CURRENT_SRT")
  and os.getenv("THS_GUT_CURRENT_MANIFEST"),
  "Owner original actual 845-frame film is not mounted in hosted CI")
 def test_true_owner_845_frame_six_scene_replay(self):
  result=audit(os.environ["THS_GUT_CURRENT_MANIFEST"],
   os.environ["THS_GUT_CURRENT_FILM"],os.environ["THS_GUT_CURRENT_SRT"])
  self.assertTrue(result["physicalFull845VideoDecodePassed"])
  self.assertEqual(len(result["sixSourceScopedFramesReplayed"]),6)
  self.assertFalse(result["mayPublish"])

if __name__=="__main__":unittest.main()
