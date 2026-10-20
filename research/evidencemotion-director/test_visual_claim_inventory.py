"""Adversarial source/visual inventory checks; never science self-approval."""
import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from autonomous_script_asr_research import WAV_SHA, LINES
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
        cuts=[0,1.61,3.47,10.85,16.58,23.38,25.71,27.35,31.25,34.34733333333333]
        template=[{"id":r[0],"startSec":cuts[i],
                   "endSec":cuts[i+1],
                   "annotations":[{"role":"science","text":"Sourced structure"}]}
                  for i,r in enumerate(STORY)]
        # Full seven-scene frozen original narrator emission (71 screen cues).
        scene_ids=[f"sentence_{i}" for i in range(1,6)]+["source_hold","sentence_6"]
        scene_boundaries=[(cuts[0],cuts[2]),(cuts[2],cuts[3]),
                          (cuts[3],cuts[4]),(cuts[4],cuts[5]),
                          (cuts[5],cuts[7]),(cuts[7],cuts[8]),
                          (cuts[8],cuts[9])]
        self.scenes=[]
        for i,(name,(start,end)) in enumerate(zip(scene_ids,scene_boundaries)):
            line=LINES[i] if i<5 else ("" if i==5 else LINES[5])
            words=line.split()
            # The original editor's two narrative beats cut inside sentence 1
            # (before "different") and sentence 5 (before "not"). A generic
            # uniform whole-sentence fixture wrongly spans these real cuts.
            spans=([(start,cuts[1],words[:5]),(cuts[1],end,words[5:])]
                   if i==0 else
                   [(start,cuts[6],words[:6]),(cuts[6],end,words[6:])]
                   if i==4 else [(start,end,words)])
            cues=[]
            for a,b,segment in spans:
                duration=(b-a)/max(1,len(segment))
                cues.extend({"text":word,
                             "startSec":round(a+j*duration+0.01,5),
                             "endSec":round(a+(j+1)*duration-0.01,5)}
                            for j,word in enumerate(segment))
            self.scenes.append({"id":name,"line":line,"captionWords":cues})
        # This exact original native film declares chemical diagram assets only.
        # Source declarations never establish absence of an image by themselves.
        for shot in template:
            shot["assetKind"]="deterministic_science"
        template[7]["annotations"]=[
            {"role":"source","text":t} for t in
            ("PubChem","Mitragynine • CID 3034396","7-OH • CID 44301524",
             "CID = compound record number","C23H30N2O5","pubchem.ncbi.nlm.nih.gov")]
        self.phone={"expectedVideoSha256":film,"status":"RESEARCH_ONLY",
                    "releaseApproved":False,"shots":template}
        self.receipt={"videoSha256":film,"sourceWavSha256":WAV_SHA,
                      "fps":30,"frames":1031,"resolution":[1080,1920],
                      "scenes":self.scenes,"mayPublish":False}
        self.captions={"exactH264Sha256":film,"mayPublish":False,
                       "encodedSourceCardPairingRecovered":True}
        self.story={"encodedH264Sha256":film,"sourceWavSha256":WAV_SHA,
                    "mayPublish":False,"nineShotsMapped":9,
                    "shots":[{"shot":r[0],"startSec":cuts[i],
                              "endSec":cuts[i+1],"act":r[1],
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
                      "rows":[{"shot":r[0],"timeSec":(cuts[i]+cuts[i+1])/2,
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
        self.assertEqual([row["declaredAssetKind"] for row in x["rows"]],
                         ["deterministic_science"]*9)
        self.assertEqual(x["declaredBotanicalArtShotCount"],0)
        self.assertFalse(x["botanicalFrameContentIndependentlyClassified"])
        self.assertEqual(x["sourceCaptionCuesAssigned"],71)
        self.assertEqual(sum(len(r["all71SourceCaptionCuesForThisShot"]) for r in x["rows"]),71)
        self.assertEqual([r["shot"] for r in x["rows"]],[r[0] for r in STORY])
        self.assertEqual(x["rows"][7]["emittedSourceAnnotations"]["source"],
                         [t["text"] for t in self.phone["shots"][7]["annotations"]])
        self.assertTrue(all(not row["clinicalEffectSupportedByThisVisual"]
                            and not row["humanInterpretationReviewed"]
                            for row in x["rows"]))
        self.assertFalse(x["scienceClaimsApproved"])
        self.assertFalse(x["allFrameIndependentOCR"])
        self.assertFalse(x["mayPublish"])

    def test_exact_native_scene_two_source_cids_require_real_ink(self):
        self.phone["shots"][2]["annotations"].extend([
            {"role":"source","text":"CID 3034396"},
            {"role":"source","text":"CID 44301524"},
        ])
        self.story["shots"][2]["onscreenAnnotationRoles"].append("source")
        self.science["rows"][2]["rawPixelOcrText"]=(
            "MITRAGYNINE CID 3034396 7-OH CID 44301524")
        self.write()
        inspected=self.check()
        self.assertEqual(
            inspected["rows"][2]["emittedSourceAnnotations"]["source"],
            ["CID 3034396","CID 44301524"])
        self.assertFalse(inspected["mayPublish"])
        # Even a completely re-hashed forged inventory cannot substitute
        # compound IDs or claim the IDs were visible when they were not.
        self.phone["shots"][2]["annotations"][1]["text"]="CID 3034397"
        self.write()
        with self.assertRaisesRegex(ValueError,"SOURCE_COMPARISON_CID_PAIR_CHANGED"):
            self.check()
        self.phone["shots"][2]["annotations"][1]["text"]="CID 3034396"
        self.science["rows"][2]["rawPixelOcrText"]="CID 3034396 only"
        self.write()
        with self.assertRaisesRegex(ValueError,"SOURCE_COMPARISON_CID_INK_MISSING"):
            self.check()

    def test_cids_elsewhere_except_exact_comparison_and_source_card_hold(self):
        self.phone["shots"][3]["annotations"].append(
            {"role":"source","text":"CID 3034396"})
        self.story["shots"][3]["onscreenAnnotationRoles"].append("source")
        self.write()
        with self.assertRaisesRegex(ValueError,"SOURCE_IDENTITY_CARD_OFF_SCENE"):
            self.check()

    def test_unreviewed_botanical_or_missing_asset_kind_rejected_after_rehash(self):
        # A caller may regenerate all linked manifest hashes. That still cannot
        # relabel a chemistry-only original film as botanical or untyped art.
        for variant in ("nonfactual_illustration", "generative_botanical", None):
            self.setUp()
            shot=self.phone["shots"][2]
            if variant is None:
                del shot["assetKind"]
            else:
                shot["assetKind"]=variant
            self.write()
            with self.subTest(assetKind=variant), self.assertRaisesRegex(
                    ValueError, "SOURCE_LOCKED_SCIENCE_ASSET_KIND"):
                self.check()

    def test_missing_or_misleading_caption_cues_rejected_even_if_rehashed(self):
        self.receipt["scenes"][3]["captionWords"].pop()
        self.write()
        with self.assertRaisesRegex(ValueError,"CAPTION_CUE_INVENTORY"):
            self.check()
        self.receipt["scenes"][3]["captionWords"].append(
            {"text":"cures","startSec":17.1,"endSec":17.2})
        self.write()
        with self.assertRaisesRegex(ValueError,"CAPTION_CUE_INVENTORY"):
            self.check()

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
