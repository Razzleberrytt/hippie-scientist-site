#!/usr/bin/env python3
"""EM-007.02: exact-native-film visual-claim inventory; no science approval.

Reuses the existing source-locked render story, actual H.264 nine-shot OCR and
caption auditor. This inventories images/labels and implied-effect review risks,
not clinical truth, independent audience understanding, or pixel-perfect OCR.
"""
import argparse
import hashlib
import json
import math
import re
from pathlib import Path

from autonomous_script_asr_research import WAV_SHA, LINES
from encoded_science_pixel_audit import CRITICAL, EXACT_SHOTS, pixel_criterion
from narration_first_story_map import STORY

SCHEMA = "ths-em00702-exact-film-visual-claim-inventory-v1"
# A PubChem graph or an animated scene is not evidence of human outcome,
# receptor pharmacology or safety. Include claims that evade the original
# narrow treatment/euphoria vocabulary via synonyms and receptor language.
EFFECT_CLAIMS = re.compile(
    r"\b(?:cures?|treats?|relieves?|analgesic|euphoria|high|"
    r"receptor binding (?:observed|proven)|shown to bind|"
    r"clinically proven|safe to take|withdrawal relief|"
    r"(?:reduces?|decreases?|eases?|alleviates?|prevents?|eliminates?)"
    r"\s+(?:[a-z-]+\s+){0,3}(?:pain|withdrawal|cravings?|anxiety|depression|insomnia|symptoms?)|"
    r"(?:binds?|activates?|stimulates?)\s+(?:the\s+)?"
    r"(?:(?:mu|μ|opioid|mor|kappa|delta)\s+){0,3}"
    r"(?:receptors?|mor)\b|"
    r"(?:mu[- ]?opioid|opioid|mor)\s+agonis(?:t|m)|"
    r"(?:non[- ]?addictive|addiction[- ]?free|proven\s+safe))\b", re.I)
# Question marks are explicit reviewer prompts, NOT a machine approval.
INTERPRETATION_RISKS = {
    "sentence_1_part0": "Identity comparison may be mistaken for a reaction",
    "sentence_1_part1": "Oxygen spotlight must not imply observed biology",
    "sentence_2": "Highlighted hydroxyl and computed model do not establish an effect",
    "sentence_3": "Atom-bond connectivity does not establish efficacy or binding",
    "sentence_4": "Computed three-dimensional pose is not receptor-binding footage",
    "sentence_5_part0": "Structure image alone cannot predict human experience",
    "sentence_5_part1": "Contrast is not itself a study of human outcomes",
    "source_hold": "PubChem structure identifiers are not clinical-effect studies",
    "sentence_6": "Computed detail does not demonstrate effects or treatment",
}

SOURCE_CARD_LABELS = (
    "PubChem","Mitragynine • CID 3034396","7-OH • CID 44301524",
    "CID = compound record number","C23H30N2O5","pubchem.ncbi.nlm.nih.gov"
)

def hold(reason):
    raise ValueError("EM00702_VISUAL_HOLD:" + reason)

def sha(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for block in iter(lambda: f.read(1024*1024), b""):
            h.update(block)
    return h.hexdigest()

def read(path):
    p=Path(path)
    if not p.is_file() or p.is_symlink():
        hold("IMMUTABLE_SOURCE_FILES_REQUIRED")
    return json.loads(p.read_text(encoding="utf-8"))

def inventory(movie, receipt_path, phone_path, science_path, story_path,
              captions_path):
    paths=(movie,receipt_path,phone_path,science_path,story_path,captions_path)
    if any(not Path(p).is_file() or Path(p).is_symlink() for p in paths):
        hold("EXACT_SOURCE_FILE_MISSING")
    receipt,phone,science,story,captions=map(read,paths[1:])
    film=sha(movie)
    receipt_hash,phone_hash,caption_hash=map(sha,(receipt_path,phone_path,captions_path))
    if (film!=receipt.get("videoSha256") or film!=phone.get("expectedVideoSha256")
        or film!=science.get("encodedH264Sha256")
        or film!=story.get("encodedH264Sha256")
        or film!=captions.get("exactH264Sha256")
        or WAV_SHA!=receipt.get("sourceWavSha256")
        or WAV_SHA!=science.get("originalWavSha256")
        or WAV_SHA!=story.get("sourceWavSha256")
        or receipt_hash!=science.get("receiptSha256")
        or receipt_hash!=story.get("renderReceiptSha256")
        or receipt_hash!=captions.get("exactReceiptSha256")
        or phone_hash!=science.get("phonePlanSha256")
        or phone_hash!=story.get("phonePlanSha256")
        or caption_hash!=science.get("priorCaptionOcrSha256")):
        hold("VIDEO_WAV_RECEIPT_OR_AUDIT_HASH_DRIFT")
    if (receipt.get("frames")!=1031 or receipt.get("fps")!=30
        or receipt.get("resolution")!=[1080,1920]
        or receipt.get("mayPublish") is not False
        or phone.get("status")!="RESEARCH_ONLY"
        or phone.get("releaseApproved") is not False
        or science.get("mayPublish") is not False
        or science.get("allNineShotInksIndependentlyRecovered") is not True
        or science.get("fullMotionFrameByFrameOcr") is not False
        or story.get("mayPublish") is not False
        or story.get("nineShotsMapped")!=9
        or captions.get("mayPublish") is not False
        or captions.get("encodedSourceCardPairingRecovered") is not True):
        hold("RESEARCH_ONLY_ACTUAL_ENCODED_PROVENANCE_REQUIRED")
    shots=phone.get("shots")
    pixel_rows=science.get("rows")
    mapped=story.get("shots")
    if (not isinstance(shots,list) or not isinstance(pixel_rows,list)
        or not isinstance(mapped,list) or len(shots)!=9
        or len(pixel_rows)!=9 or len(mapped)!=9
        or [x.get("id") for x in shots]!=list(EXACT_SHOTS)
        or [x.get("shot") for x in pixel_rows]!=list(EXACT_SHOTS)
        or [x.get("shot") for x in mapped]!=list(EXACT_SHOTS)
        or [x[0] for x in STORY]!=list(EXACT_SHOTS)):
        hold("EXACT_NINE_SHOT_ORDER_OR_ROWS_CHANGED")
    scenes=receipt.get("scenes")
    expected_scene_ids=[f"sentence_{i}" for i in range(1,6)]+["source_hold","sentence_6"]
    expected_lines=list(LINES[:5])+["",LINES[5]]
    if (not isinstance(scenes,list) or len(scenes)!=7
        or [v.get("id") for v in scenes]!=expected_scene_ids
        or [v.get("line") for v in scenes]!=expected_lines):
        hold("FROZEN_NARRATION_SCENES_MISSING_OR_CHANGED")
    full_cues=[]
    for sc in scenes:
        cues=sc.get("captionWords",[])
        if (not isinstance(cues,list)
            or [v.get("text") for v in cues]!=sc["line"].split()):
            hold("CAPTION_CUE_INVENTORY_NOT_EXHAUSTIVE")
        full_cues.extend(cues)
    if len(full_cues)!=71:
        hold("EXPECTED_71_FULL_SPOKEN_CAPTION_CUES")
    previous_end=0
    rows=[]
    for shot,observed,act,template in zip(shots,pixel_rows,mapped,STORY):
        sid=shot["id"]
        start,end=shot.get("startSec"),shot.get("endSec")
        if (not all(isinstance(x,(int,float)) and not isinstance(x,bool)
                    and math.isfinite(x) for x in (start,end))
            or abs(start-previous_end)>0.00001 or end<=start
            or abs(start-act.get("startSec",-100))>0.00001
            or abs(end-act.get("endSec",-100))>0.00001
            or not start<=observed.get("timeSec",-1)<=end):
            hold("VIDEO_SHOT_TIMING_AND_STORY_DRIFT:" + sid)
        previous_end=end
        if (act.get("act")!=template[1]
            or act.get("learningObjective")!=template[2]
            or act.get("directedComposition")!=template[3]
            or act.get("scientificMeaningRestriction")!=template[4]):
            hold("VISUAL_STORY_SEMANTIC_DRIFT:" + sid)
        # EM-008 exact-film scope gate: all nine source-locked native V5
        # shots are deterministic chemical diagrams. An asset-kind reclassification
        # (including an illustrative botanical shot) invalidates this candidate
        # and requires a fresh source/film and disclosure review. This checks
        # author-declared provenance, never the actual presence of plant pixels.
        if shot.get("assetKind") != "deterministic_science":
            hold("SOURCE_LOCKED_SCIENCE_ASSET_KIND:" + sid)
        annotations=shot.get("annotations")
        if (not isinstance(annotations,list) or any(
            not isinstance(a,dict) or a.get("role") not in
            ("hook","science","source","disclosure","caption")
            or not isinstance(a.get("text"),str) or not a["text"].strip()
            for a in annotations)):
            hold("NON_EXHAUSTIVE_OR_UNLABELED_ANNOTATIONS:" + sid)
        if EFFECT_CLAIMS.search(" ".join(a["text"] for a in annotations)):
            hold("UNSUPPORTED_TREATMENT_OR_EFFECT_TEXT:" + sid)
        # Recheck the previous auditor against its own raw H.264 OCR output;
        # an auditor's claim of PASS is not trusted without the recovered ink.
        if not isinstance(observed.get("rawPixelOcrText"),str):
            hold("MISSING_DECODED_PIXEL_TEXT:" + sid)
        pixel_criterion(sid,observed["rawPixelOcrText"])
        if (sorted(observed.get("verifiedExactPhrases",[]))!=sorted(CRITICAL[sid])
            or not re.fullmatch(r"[a-f0-9]{64}",
                                str(observed.get("decodedImageSha256","")))):
            hold("UNBOUND_OR_INCOMPLETE_DECODED_FRAME_PROOF:" + sid)
        if not set(a.get("role") for a in annotations).issubset(
                set(act.get("onscreenAnnotationRoles",[]))):
            hold("UNDOCUMENTED_VISUAL_ROLE:" + sid)
        roles={k: [a["text"] for a in annotations if a["role"]==k]
               for k in ("hook","science","source","disclosure","caption")}
        all_caption_cues=[{"text":c["text"],"startSec":c["startSec"],
                            "endSec":c["endSec"]} for c in full_cues
                           if start<=c.get("startSec",-1)<end]
        if any(not (isinstance(c["endSec"],(int,float))
                     and c["endSec"]>c["startSec"]
                     and c["endSec"]<=end+0.05)
               for c in all_caption_cues):
            hold("TIMED_FULL_CAPTION_CUES_OFF_SHOT")
        rows.append({
            "all71SourceCaptionCuesForThisShot":all_caption_cues,
            "shot":sid,"startSec":start,"endSec":end,"act":act["act"],
            "declaredAssetKind":"deterministic_science",
            "diagramOrComposition":act["directedComposition"],
            "learningObjective":act["learningObjective"],
            "scientificMeaningRestriction":act["scientificMeaningRestriction"],
            "emittedSourceAnnotations":roles,
            "actualDecodedPixelOcrSha256":sha_text(observed["rawPixelOcrText"]),
            "actualDecodedFrameSha256":observed["decodedImageSha256"],
            "decodedPixelProofTimeSec":observed["timeSec"],
            "sampledCriticalPhrasesRecovered":list(CRITICAL[sid]),
            "impliedEffectOrMisreadingToReview":INTERPRETATION_RISKS[sid],
            "clinicalEffectSupportedByThisVisual":False,
            "humanInterpretationReviewed":False})
    if sum(len(r["all71SourceCaptionCuesForThisShot"]) for r in rows)!=71:
        hold("SPOKEN_CAPTIONS_NOT_FULLY_ASSIGNED_TO_SHOTS")
    if not 34.3<=previous_end<=34.5:
        hold("FULL_ORIGINAL_TIMELINE_REQUIRED")
    # Scene 2 may identify the TWO already-verified molecule drawings
    # directly on its side-by-side comparison. Every other non-source-card
    # source label remains forbidden, and the full silent source card is
    # still mandatory, separately source/decoded-pixel verified below.
    comparison_sources=("CID 3034396", "CID 44301524")
    for row in rows:
        declared=tuple(row["emittedSourceAnnotations"]["source"])
        if row["shot"]=="sentence_2":
            if declared!=comparison_sources:
                hold("SOURCE_COMPARISON_CID_PAIR_CHANGED")
            # Both exact IDs must be independently legible in encoded pixels,
            # not merely present in caller-generated annotations.
            raw=next(v["rawPixelOcrText"] for v in pixel_rows
                     if v["shot"]=="sentence_2")
            for identifier in comparison_sources:
                if identifier.casefold() not in re.sub(r"\\s+"," ",raw.casefold()):
                    hold("SOURCE_COMPARISON_CID_INK_MISSING")
        elif row["shot"]!="source_hold" and declared:
            hold("SOURCE_IDENTITY_CARD_OFF_SCENE")
    if tuple(rows[7]["emittedSourceAnnotations"]["source"])!=SOURCE_CARD_LABELS:
        hold("SOURCE_CARD_TEXT_IDENTITY_OR_CID_ASSOCIATION_CHANGED")
    return {"schema":SCHEMA,"task":"EM-007.02","filmSha256":film,
            "sourceWavSha256":WAV_SHA,"receiptSha256":receipt_hash,
            "phonePlanSha256":phone_hash,"encodedScienceOcrSha256":sha(science_path),
            "encodedCaptionOcrSha256":caption_hash,"storyMapSha256":sha(story_path),
            "shotsInspected":len(rows),"sourceCaptionCuesAssigned":71,"rows":rows,
            "declaredBotanicalArtShotCount":0,
            "botanicalFrameContentIndependentlyClassified":False,
            "captionCoverage":"ALL_71_SOURCE_EMISSION_CUES_PLUS_12_ENCODED_SAMPLES_NOT_ALL_FRAMES",
            "allFrameIndependentOCR":False,
            "scienceClaimsApproved":False,"impliedEffectRisksHumanReviewed":False,
            "audienceUnderstood":False,"mayPublish":False}

def sha_text(s):
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def main():
    p=argparse.ArgumentParser()
    for arg in ("movie","receipt","phone","science","story","captions","out"):
        p.add_argument("--"+arg,required=True)
    a=p.parse_args()
    result=inventory(a.movie,a.receipt,a.phone,a.science,a.story,a.captions)
    Path(a.out).write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"status":"VISUAL_CLAIM_INVENTORY_SOURCE_BOUND_REVIEW_ONLY",
                      "shots":len(result["rows"]),"filmSha256":result["filmSha256"],
                      "scienceClaimsApproved":False,"mayPublish":False}))

if __name__=="__main__":
    main()
