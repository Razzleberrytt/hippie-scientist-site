"""Adversarial source/visual inventory checks; never science self-approval."""
import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from autonomous_script_asr_research import WAV_SHA
from encoded_science_pixel_audit import CRITICAL
from narration_first_story_map import STORY
from visual_claim_inventory import inventory


class VisualClaimInventoryTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root=Path(self.tmp.name)
        self.files={k:self.root/(k+".json") for k in
                    ("receipt","phone","science","story","captions")}
        self.movie=self.root/"film.mp4"
        self.movie.write_bytes(b"synthetic is never actual pixel proof")
        film=hashlib.sha256(self.movie.read_bytes()).hexdigest()
        template=[{"id":r[0],"startSec":i*3.5,
                   "endSec":(i+1)*3.5,
                   "annotations":[{"role":"science","text":"Sourced structure"}]}
                  for i,r in enumerate(STORY)]
        template[7]["annotations"]=[
            {"role":"source","text":t} for t in
            ("PubChem","Mitragynine • CID 3034396","7-OH • CID 44301524",
             "CID = compound record number","C23H30N2O5","pubchem.ncbi.nlm.nih.gov")]
        self.phone={"expectedVideoSha256":film,"status":"RESEARCH_ONLY",
                    "releaseApproved":False,"shots":template}
        self.receipt={"videoSha256":film,"sourceWavSha256":WAV_SHA,
                      "fps":30,"frames":1031,"resolution":[1080,1920],
                      "mayPublish":False}
        self.captions={"exactH264Sha256":film,"mayPublish":False,
                       "encodedSourceCardPairingRecovered":True}
        self.story={"encodedH264Sha256":film,"sourceWavSha256":WAV_SHA,
                    "mayPublish":False,"nineShotsMapped":9,
                    "shots":[{"shot":r[0],"startSec":i*3.5,
                              "endSec":(i+1)*3.5,"act":r[1],
                              "learningObjective":r[2],
                              "directedComposition":r[3],
                              "scientificMeaningRestriction":r[4],
                              "onscreenAnnotationRoles":
                                  ["source"] if i==7 else ["science"]}
                             for i,r in enumerate(STORY)]}
        self.science={"encodedH264Sha256":film,
                      "originalWavSha256":WAV_SHA,
                      "mayPublish":False,"fullMotionFrameByFrameOcr":False,
                      "allNineShotInksIndependentlyRecovered":True,
                      "rows":[{"shot":r[0],"timeSec":i*3.5+1,
                               "decodedImageSha256":"a"*64,
                               "rawPixelOcrText":"Synthetic sample, not actual pixels",
                               "verifiedExactPhrases":list(CRITICAL[r[0]])}
                              for i,r in enumerate(STORY)]}
        self.write()

    def write(self):
        for k in ("receipt","phone","captions","story"):
            self.files[k].write_text(json.dumps(getattr(self,k)),encoding="utf-8")
        sha=lambda k:hashlib.sha256(self.files[k].read_bytes()).hexdigest()
        self.captions["exactReceiptSha256"]=sha("receipt")
        self.files["captions"].write_text(json.dumps(self.captions),encoding="utf-8")
        self.science.update({"receiptSha256":sha("receipt"),
                             "phonePlanSha256":sha("phone"),
                             "priorCaptionOcrSha256":sha("captions")})
        self.story.update({"renderReceiptSha256":sha("receipt"),
                           "phonePlanSha256":sha("phone")})
        self.files["story"].write_text(json.dumps(self.story),encoding="utf-8")
        self.files["science"].write_text(json.dumps(self.science),encoding="utf-8")

    def check(self):
        with patch("visual_claim_inventory.pixel_criterion",return_value=True):
            return inventory(self.movie,*(self.files[k] for k in
                ("receipt","phone","science","story","captions")))

    def test_nine_scene_inventory_is_hash_bound_and_never_science_approved(self):
        x=self.check()
        self.assertEqual(x["shotsInspected"],9)
        self.assertEqual([r["shot"] for r in x["rows"]],[r[0] for r in STORY])
        self.assertEqual(x["rows"][7]["emittedSourceAnnotations"]["source"],
                         [t["text"] for t in self.phone["shots"][7]["annotations"]])
        self.assertTrue(all(not row["clinicalEffectSupportedByThisVisual"]
                            and not row["humanInterpretationReviewed"]
                            for row in x["rows"]))
        self.assertFalse(x["scienceClaimsApproved"])
        self.assertFalse(x["allFrameIndependentOCR"])
        self.assertFalse(x["mayPublish"])

    def test_foreign_media_and_rehashed_but_changed_story_are_rejected(self):
        self.movie.write_bytes(b"tampered film")
        with self.assertRaisesRegex(ValueError,"HASH_DRIFT"):
            self.check()
        self.movie.write_bytes(b"synthetic is never actual pixel proof")
        self.story["shots"][3]["scientificMeaningRestriction"]="proves receptor binding"
        self.write()
        with self.assertRaisesRegex(ValueError,"SEMANTIC_DRIFT"):
            self.check()

    def test_new_visual_treatment_claim_even_with_matching_hashes_is_rejected(self):
        self.phone["shots"][4]["annotations"].append(
            {"role":"science","text":"Clinically proven withdrawal relief"})
        self.write()
        with self.assertRaisesRegex(ValueError,"UNSUPPORTED_TREATMENT_OR_EFFECT_TEXT"):
            self.check()

    def test_missing_scene_and_swapped_source_card_are_rejected(self):
        self.phone["shots"].pop(2)
        self.write()
        with self.assertRaisesRegex(ValueError,"EXACT_NINE_SHOT"):
            self.check()
        self.setUp()
        self.phone["shots"][7]["annotations"][1]["text"]="7-OH • CID 3034396"
        self.write()
        with self.assertRaisesRegex(ValueError,"VIDEO_WAV_RECEIPT_OR_AUDIT_HASH_DRIFT|SOURCE_CARD_TEXT"):
            # Existing actual decoded pixel source checker also rejects wrong CID
            # when not patched; this fixture must at least expose digest drift.
            self.check()

    def test_timing_duplication_and_unapproved_release_hold(self):
        self.phone["shots"][1]["startSec"]+=0.5
        self.write()
        with self.assertRaisesRegex(ValueError,"TIMING_AND_STORY_DRIFT"):
            self.check()
        self.phone["shots"][1]["startSec"]-=0.5
        self.receipt["mayPublish"]=True
        self.write()
        with self.assertRaisesRegex(ValueError,"RESEARCH_ONLY"):
            self.check()


if __name__=="__main__":
    unittest.main()
