"""Actual-film science source integrity tests; owner film optional on CI runner."""
import copy
import json
import os
import tempfile
import unittest
import contextlib
import io
import os
import sys
from unittest import mock

import gut_exact_film_science_crosswalk as cli
from pathlib import Path

# Run reusable physical science-credit tests in the existing source-science CI.
# This does not waive scientific review or release gates.
from test_encoded_source_credit_guard import DecodedSourceCreditTests

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
 def test_usp_supplement_specific_chapter_is_explicit_and_does_not_clear_in_frame_source(self):
  d=self.check(valid())
  self.assertEqual(d["primarySources"]["usp_supplement_2040"],
      "https://doi.usp.org/USPNF/USPNF_M99970_04_01.html")
  self.assertEqual(d["scenes"][1]["sourceScope"],"USP2040_DIETARY_SUPPLEMENT_DOSAGE_TESTS_ONLY")
  self.assertIn("where individual monographs specify",d["scenes"][1]["limitation"])
  self.assertIn("does not establish in-vivo absorption",d["scenes"][1]["limitation"])
  self.assertFalse(d["scenes"][1]["inFrameSourceLabel"])
  self.assertFalse(d["mayPublish"])
 def test_disguised_fda_drug_source_cannot_replace_dietary_supplement_chapter(self):
  d=valid()
  d["primarySources"]["usp_supplement_2040"]="https://www.fda.gov/regulatory-information/search-fda-guidance-documents/dissolution-testing-immediate-release-solid-oral-dosage-forms"
  with self.assertRaisesRegex(ValueError,"SOURCE_URLS_NOT_CANONICAL"):self.check(d)
 def test_missing_supplement_source_refuses_science_proof(self):
  d=valid();del d["primarySources"]["usp_supplement_2040"]
  with self.assertRaisesRegex(ValueError,"SOURCE_URLS_NOT_CANONICAL"):self.check(d)
 def test_source_cannot_be_oversold_as_all_supplements_or_in_vivo_effect(self):
  for claim in ("All supplements fully dissolve in the stomach",
                "USP proves 100 percent nutrient absorption in humans",
                "Every tablet releases fully before being absorbed"):
   d=valid();d["scenes"][1]["limitation"]=claim
   with self.subTest(claim=claim),self.assertRaisesRegex(ValueError,"SCENE_SOURCE_SCOPE_MISMATCH"):
    self.check(d)
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


 def _run_science_cli(self, movie, srt, destination):
  arguments=["gut-science-crosswalk","--manifest",str(self.path),
   "--movie",str(movie),"--srt",str(srt),"--output",str(destination)]
  with mock.patch.object(sys,"argv",arguments),contextlib.redirect_stdout(io.StringIO()):
   cli.main()

 def test_cli_direct_source_aliases_hold_before_writing_any_evidence(self):
  self.check(valid())
  movie=self.path.parent/"original.mp4";movie.write_bytes(b"original-film")
  srt=self.path.parent/"original.srt";srt.write_bytes(b"original-caption")
  original={p:p.read_bytes() for p in (self.path,movie,srt)}
  for target in (self.path,movie,srt):
   with self.subTest(path=target.name):
    with mock.patch.object(cli,"audit",side_effect=AssertionError("audit must not run")):
     with self.assertRaisesRegex(ValueError,"OUTPUT_SYMLINK_OR_INPUT_ALIAS"):
      self._run_science_cli(movie,srt,target)
    self.assertEqual({p:p.read_bytes() for p in original},original)

 def test_cli_symlink_and_hardlink_aliases_hold_without_destroying_sources(self):
  self.check(valid())
  movie=self.path.parent/"original.mp4";movie.write_bytes(b"original-film")
  srt=self.path.parent/"original.srt";srt.write_bytes(b"original-caption")
  inputs=(self.path,movie,srt)
  original={p:p.read_bytes() for p in inputs}
  for source in inputs:
   for alias_type in ("symlink","hardlink"):
    alias=self.path.parent/("output-"+source.name+"-"+alias_type+".json")
    with self.subTest(source=source.name,alias=alias_type):
     if alias_type=="symlink":
      alias.symlink_to(source)
     else:
      os.link(source,alias)
     try:
      with mock.patch.object(cli,"audit",side_effect=AssertionError("audit must not run")):
       with self.assertRaisesRegex(ValueError,"OUTPUT_SYMLINK_OR_INPUT_ALIAS"):
        self._run_science_cli(movie,srt,alias)
      self.assertEqual({p:p.read_bytes() for p in inputs},original)
     finally:
      alias.unlink(missing_ok=True)

 def test_cli_failed_actual_input_removes_stale_prior_positive_receipt(self):
  self.check(valid())
  movie=self.path.parent/"not-original.mp4";movie.write_bytes(b"invalid film")
  srt=self.path.parent/"not-original.srt";srt.write_bytes(b"invalid captions")
  report=self.path.parent/"old-positive.json"
  report.write_text('{"mayPublish": true}',encoding="utf8")
  with self.assertRaisesRegex(ValueError,"WRONG_ENCODED_MOVIE_OR_SRT"):
   self._run_science_cli(movie,srt,report)
  self.assertFalse(report.exists())
  self.assertEqual(movie.read_bytes(),b"invalid film")
  self.assertEqual(srt.read_bytes(),b"invalid captions")

 def test_cli_unrelated_output_writes_only_research_hold_atomically(self):
  self.check(valid())
  movie=self.path.parent/"original.mp4";movie.write_bytes(b"frozen film")
  srt=self.path.parent/"original.srt";srt.write_bytes(b"frozen captions")
  report=self.path.parent/"research-only.json"
  expected={"schema":SCHEMA,"independentSciencePassed":False,"mayPublish":False,
   "decision":"MOCKED_RESEARCH_HOLD_FOR_RECEIPT_IO_TEST_ONLY"}
  # This mock proves file-output behavior ONLY; it is not a real movie science pass.
  with mock.patch.object(cli,"audit",return_value=expected) as audit:
   self._run_science_cli(movie,srt,report)
  audit.assert_called_once_with(str(self.path),str(movie),str(srt))
  self.assertEqual(json.loads(report.read_text()),expected)
  self.assertEqual(movie.read_bytes(),b"frozen film")
  self.assertEqual(srt.read_bytes(),b"frozen captions")

if __name__=="__main__":unittest.main()
