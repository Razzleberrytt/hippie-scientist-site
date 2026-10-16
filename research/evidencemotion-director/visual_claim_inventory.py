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

from autonomous_script_asr_research import WAV_SHA
from encoded_science_pixel_audit import CRITICAL, EXACT_SHOTS, pixel_criterion
from narration_first_story_map import STORY

SCHEMA = "ths-em00702-exact-film-visual-claim-inventory-v1"
EFFECT_CLAIMS = re.compile(
    r"\b(?:cures?|treats?|relieves?|analgesic|euphoria|high|"
    r"receptor binding (?:observed|proven)|shown to bind|"
    r"clinically proven|safe to take|withdrawal relief)\b", re.I)
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
        rows.append({
            "shot":sid,"startSec":start,"endSec":end,"act":act["act"],
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
    if not 34.3<=previous_end<=34.5:
        hold("FULL_ORIGINAL_TIMELINE_REQUIRED")
    if any(len(row["emittedSourceAnnotations"]["source"]) for row in rows
           if row["shot"]!="source_hold"):
        hold("SOURCE_IDENTITY_CARD_OFF_SCENE")
    if len(rows[7]["emittedSourceAnnotations"]["source"])!=6:
        hold("SOURCE_CARD_TEXT_NOT_EXHAUSTIVE")
    return {"schema":SCHEMA,"task":"EM-007.02","filmSha256":film,
            "sourceWavSha256":WAV_SHA,"receiptSha256":receipt_hash,
            "phonePlanSha256":phone_hash,"encodedScienceOcrSha256":sha(science_path),
            "encodedCaptionOcrSha256":caption_hash,"storyMapSha256":sha(story_path),
            "shotsInspected":len(rows),"rows":rows,
            "captionCoverage":"SOURCE_EMISSION_SAMPLES_AND_CRITICAL_OCR_NOT_ALL_FRAMES",
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
