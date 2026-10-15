#!/usr/bin/env python3
"""Objective critical-text legibility and persistence in actual decoded native frames.

Never performs OCR, fabricates viewership, awards independent science/creative
certification, or changes publication status. Every media check is exact-sha
bound and repeatable. Two independent 1-point readability measurements are
eligible toward the current EvidenceMotion B-gate research percentage.
"""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path
import numpy as np
from muted_review_research import reject_untrusted
from phone_ui_audit import probe_movie, validate_manifest

SCHEMA="ths-actual-native-teaching-ink-audit-v1"
REQUIRED={
    "sentence_1_part0": ("MITRAGYNINE • CID 3034396","CID = compound record number"),
    "sentence_1_part1": ("7-OH • CID 44301524","CID = compound record number"),
    "sentence_2": ("–OH group: oxygen + hydrogen",),
    "sentence_3": ("Dots mark atoms. Lines mark bonds.",),
    "sentence_4": ("A possible\n3D shape.","Computed 3D illustration • not filmed"),
    "sentence_5_part0": ("What the shape\nshows.",),
    "sentence_5_part1": ("What it cannot\ntell us.","HUMAN EXPERIENCE"),
    "source_hold": ("CID 44301524","Chemical structure database"),
}
MIN_INK_DYNAMIC_RANGE=130.0
MAX_INK_DRIFT=16.0
MIN_HOLD_SEC=1.50


def sha(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for chunk in iter(lambda:f.read(1048576),b""):
            h.update(chunk)
    return h.hexdigest()


def hold(reason):
    raise ValueError("NATIVE_TEXT_LEGIBILITY_HOLD:"+reason)


def native_gray_frame(movie,t):
    raw=subprocess.check_output([
        "ffmpeg","-v","error","-nostdin","-ss",f"{t:.5f}",
        "-i",str(movie),"-frames:v","1","-vf","format=gray",
        "-pix_fmt","gray","-f","rawvideo","pipe:1"
    ],timeout=35)
    if len(raw)!=1080*1920:
        hold("EXACT_NATIVE_FRAME_NOT_DECODED")
    return np.frombuffer(raw,dtype=np.uint8).reshape(1920,1080)


def get_boxes(plan):
    shots=plan.get("shots",[])
    if not isinstance(shots,list) or len(shots)!=9:
        hold("NINE_REAL_SCENES_REQUIRED")
    byid={s["id"]:s for s in shots}
    if len(byid)!=len(shots) or any(key not in byid for key in REQUIRED):
        hold("EXACT_REQUIRED_SCENE_COVERAGE")
    boxes={}
    for scene,terms in REQUIRED.items():
        shot=byid[scene]
        if not isinstance(shot.get("annotations"),list):
            hold("ACTUAL_RENDER_ANNOTATIONS_REQUIRED")
        for term in terms:
            found=[a for a in shot["annotations"] if a.get("text")==term
                   and a.get("role") in ("hook","science","disclosure","source")]
            if len(found)!=1:
                hold("MISSING_OR_DUPLICATE_CRITICAL_LABEL_"+scene)
            a=found[0]
            box=a.get("boxPx")
            if not isinstance(box,list) or len(box)!=4:
                hold("BOX_REQUIRED_FOR_"+scene)
            vals=[int(v) for v in box]
            x1,y1,x2,y2=vals
            if not (0<=x1<x2<=1080 and 0<=y1<y2<=1920):
                hold("INVALID_TEXT_BOUNDS")
            boxes[(scene,term)]=vals
    return byid,boxes


def measure_gray_crop(frame,box):
    if frame.shape!=(1920,1080) or frame.dtype!=np.uint8:
        hold("ACTUAL_DECODED_GRAYSCALE_REQUIRED")
    x1,y1,x2,y2=box
    region=frame[y1:y2,x1:x2]
    if region.size<200:
        hold("TEXT_REGION_TOO_SMALL")
    fifth=float(np.percentile(region,5))
    ninety_fifth=float(np.percentile(region,95))
    return {"p05":round(fifth,3),
            "p95":round(ninety_fifth,3),
            "inkRange":round(ninety_fifth-fifth,3)}


def score_samples(plan,samples):
    """Pure fault-injectable pre-defined criteria; never assumes OCR accuracy."""
    byid,boxes=get_boxes(plan)
    observations=[]
    for (scene,term),box in boxes.items():
        key=(scene,term)
        seq=samples.get(key)
        if not isinstance(seq,(tuple,list)) or len(seq)!=2:
            hold("EARLY_LATE_NATIVE_FRAME_SAMPLES_REQUIRED")
        measured=[measure_gray_crop(f,box) for f in seq]
        duration=float(byid[scene]["endSec"]-byid[scene]["startSec"])
        observations.append({
            "scene":scene,"label":term,"durationSec":round(duration,4),
            "actualNativeBoxPx":box,"early":measured[0],"late":measured[1],
            "minVisibleContrast":round(min(m["inkRange"] for m in measured),3),
            "contrastDrift":round(abs(measured[0]["inkRange"]-
                                      measured[1]["inkRange"]),3),
        })
    contrast=all(item["minVisibleContrast"]>=MIN_INK_DYNAMIC_RANGE
                 for item in observations)
    persistent=all(item["durationSec"]>=MIN_HOLD_SEC
                   and item["contrastDrift"]<=MAX_INK_DRIFT
                   and item["late"]["inkRange"]>=MIN_INK_DYNAMIC_RANGE
                   for item in observations)
    return {
        "schema":SCHEMA,
        "testedCriticalVisibleLabels":len(observations),
        "criteria":[
            {"code":"actual_full_hd_text_ink_contrast",
             "passed":contrast,"weightPct":1,
             "threshold":"minimum p95-p05 luminance across both samples >=130/255"},
            {"code":"meaningful_instruction_text_persistence",
             "passed":persistent,"weightPct":1,
             "threshold":"all scenes >=1.50s; late text contrast >=130; early/late contrast drift <=16"},
        ],
        "additionalObjectivePoints":int(contrast)+int(persistent),
        "observations":observations,
        "scope":"actual frame text-ink/readability proxies, not audience understanding or OCR",
        "viewerComprehensionApproved":False,
        "naturalVoiceApproved":False,
        "excellentFilmApproved":False,
        "realHandsetApproved":False,
        "mayPublish":False,
    }


def audit(movie,phone,receipt,claim,out):
    movie,phone,receipt,claim,out=map(Path,(movie,phone,receipt,claim,out))
    width,height,duration,count=probe_movie(movie)
    plan,_,identity=reject_untrusted(movie,phone,receipt,claim,width,height,duration)
    approved=validate_manifest(plan,width=width,height=height,duration=duration,
                               actual_sha=identity)
    if approved["mayPublish"] is not False or count!=1031:
        hold("RESEARCH_ONLY_REAL_VIDEO_REQUIRED")
    byid,boxes=get_boxes(plan)
    samples={}
    for scene in REQUIRED:
        shot=byid[scene]
        start,end=float(shot["startSec"]),float(shot["endSec"])
        offset=min(.30,.20*(end-start))
        if end-start<MIN_HOLD_SEC or offset<=0:
            hold("CRITICAL_TEXT_DISPLAY_INTERVAL_TOO_SHORT")
        early=native_gray_frame(movie,start+offset)
        late=native_gray_frame(movie,end-offset)
        for term in REQUIRED[scene]:
            samples[(scene,term)]=(early,late)
    result=score_samples(plan,samples)
    result.update({
        "actualFilmSha256":sha(movie),"actualPhonePlanSha256":sha(phone),
        "actualClaimScreenSha256":sha(claim),
        "actualDecodedVideoFrameCount":count,
        "fullNativeResolution":[width,height],
        "sourceVerifiedResearchScreen":True,
        "automaticPublicationApproval":False
    })
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(result,indent=2)+"\n")
    return result


if __name__=="__main__":
    p=argparse.ArgumentParser()
    for k in ("movie","phone","receipt","claim","out"):
        p.add_argument("--"+k,required=True)
    a=p.parse_args()
    print(json.dumps(audit(a.movie,a.phone,a.receipt,a.claim,a.out),indent=2))
