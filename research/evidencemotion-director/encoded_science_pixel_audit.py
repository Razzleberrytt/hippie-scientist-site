#!/usr/bin/env python3
"""Independently read science/disclosure words from nine actual H.264 frames.

A decoded-pixel science text check, NOT independent clinical/source judgment,
calibrated audience understanding, all-frame OCR or publication permission.
The immutable WAV, 7 scene acoustic cues, film and receipts remain protected.
"""
import argparse
import hashlib
import json
import re
import tempfile
from pathlib import Path

from actual_pixel_text_recovery import extract_png, ocr_image, plain
from encoded_caption_cue_audit import (ensure_frozen_scenes,
                                       verify_source_record_pixels)
from autonomous_script_asr_research import WAV_SHA

SCHEMA = "ths-encoded-science-overlay-pixel-audit-v1"
CRITICAL = {
    "sentence_1_part0": ("mitragynine","no reaction"),
    "sentence_1_part1": ("7-oh","no reaction"),
    # New native structural comparison: require actual encoded hydroxyl
    # teaching, source identity, and the "no reaction" safety boundary. The
    # later source_hold card independently binds both full compound IDs.
    "sentence_2": ("hydroxyl group","oxygen + hydrogen",
                   "computed model","one free hydroxyl",
                   "not a chemical reaction"),
    "sentence_3": ("connected atoms","dots mark atoms",
                   "lines mark bonds","7-hydroxymitragynine"),
    "sentence_4": ("3d shape","computed 3d illustration",
                   "not filmed","hydrogen atoms omitted"),
    "sentence_5_part0": ("structure",),
    "sentence_5_part1": ("human experience",),
    "source_hold": ("pubchem","cid 3034396","cid 44301524",
                    "compound record number"),
    "sentence_6": ("look closer","computed detail",
                    "hydrogens omitted"),
}
EXACT_SHOTS = tuple(CRITICAL)


def hold(code):
    raise ValueError("ENCODED_SCIENCE_PIXELS_HOLD:"+code)


def sha(path):
    h=hashlib.sha256()
    with Path(path).open("rb") as f:
        for chunk in iter(lambda:f.read(1<<20),b""):
            h.update(chunk)
    return h.hexdigest()


def pixel_criterion(shot,raw_text):
    """Source facts must be recoverable from OCR pixels, never from the plan."""
    if shot not in CRITICAL:
        hold("UNEXPECTED_SHOT")
    normalized=re.sub(r"\s+"," ",plain(raw_text))
    missing=[phrase for phrase in CRITICAL[shot] if phrase not in normalized]
    if missing:
        hold("REQUIRED_SCIENCE_INK_UNREADABLE:"+shot+":"+",".join(missing))
    if shot=="source_hold":
        # Full compound -> correct PubChem CID mapping, not a bag of two IDs.
        verify_source_record_pixels(raw_text)
    return True


def inspect(movie,receipt_path,phone_path,caption_ocr_path,output):
    movie,receipt_path,phone_path,caption_ocr_path,output=map(
        Path,(movie,receipt_path,phone_path,caption_ocr_path,output))
    if any(not p.is_file() or p.is_symlink() for p in
           (movie,receipt_path,phone_path,caption_ocr_path)):
        hold("REGULAR_SOURCE_FILES_REQUIRED")
    receipt=json.loads(receipt_path.read_text())
    plan=json.loads(phone_path.read_text())
    previous=json.loads(caption_ocr_path.read_text())
    film=sha(movie)
    if (receipt.get("videoSha256")!=film
        or plan.get("expectedVideoSha256")!=film
        or previous.get("exactH264Sha256")!=film
        or previous.get("exactReceiptSha256")!=sha(receipt_path)
        or receipt.get("sourceWavSha256")!=WAV_SHA
        or receipt.get("resolution")!=[1080,1920]
        or receipt.get("frames")!=1031
        or receipt.get("fps")!=30
        or receipt.get("experimentCaptionMode")!="TIMED_RESEARCH"
        or receipt.get("mayPublish") is not False
        or plan.get("status")!="RESEARCH_ONLY"
        or plan.get("releaseApproved") is not False
        or previous.get("mayPublish") is not False
        or previous.get("encodedSourceCardPairingRecovered") is not True
        or previous.get("sampledDecodedEncodedFrames")!=12):
        hold("ORIGINAL_WAV_RESEARCH_FILM_RECEIPT_MISMATCH")
    scenes=ensure_frozen_scenes(receipt)
    shots=plan.get("shots")
    if (not isinstance(shots,list)
        or tuple(s.get("id") for s in shots)!=EXACT_SHOTS):
        hold("EXACT_NINE_SOURCE_LOCKED_SHOTS_REQUIRED")
    rows=[]
    with tempfile.TemporaryDirectory(prefix="ths-pixel-science-") as d:
        for shot in shots:
            sid=shot["id"]
            start,end=shot["startSec"],shot["endSec"]
            if not (0<=start<end<=receipt["scenes"][-1]["endSec"]+.002):
                hold("SHOT_TIME_BOUNDS")
            t=(start+end)/2
            if sid=="source_hold" and scenes["source_hold"]["line"]!="":
                hold("NON_SILENT_SOURCE_CARD")
            image=Path(d)/(sid+".png")
            extract_png(movie,t,image)
            ocr=ocr_image(image)
            pixel_criterion(sid,ocr)
            rows.append({"shot":sid,"timeSec":round(t,5),
                         "decodedImageSha256":sha(image),
                         "verifiedExactPhrases":list(CRITICAL[sid]),
                         "rawPixelOcrText":ocr})
    result={"schema":SCHEMA,"status":"PIXEL_SCIENCE_OVERLAYS_PASS_INDEPENDENT_REVIEW_REQUIRED",
            "originalWavSha256":WAV_SHA,"encodedH264Sha256":film,
            "receiptSha256":sha(receipt_path),
            "phonePlanSha256":sha(phone_path),
            "priorCaptionOcrSha256":sha(caption_ocr_path),
            "decodedShotCount":len(rows),"allNineShotInksIndependentlyRecovered":True,
            "fullMotionFrameByFrameOcr":False,
            "medicalExpertReviewed":False,"viewerComprehensionVerified":False,
            "realHandsetApproved":False,"premiumFilmApproved":False,
            "mayPublish":False,"rows":rows}
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8")
    return result


def main():
    p=argparse.ArgumentParser()
    for a in ("movie","receipt","phone","caption-ocr","out"):
        p.add_argument("--"+a,required=True)
    v=p.parse_args()
    result=inspect(v.movie,v.receipt,v.phone,v.caption_ocr,v.out)
    print(json.dumps({k:v for k,v in result.items() if k!="rows"},indent=2))


if __name__=="__main__":
    main()
