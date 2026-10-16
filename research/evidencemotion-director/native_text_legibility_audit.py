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
import os
import subprocess
import tempfile
from pathlib import Path
import numpy as np
from muted_review_research import reject_untrusted
from phone_ui_audit import probe_movie, validate_manifest, choose_decoded_sample
from native_master_audit import frame_timestamps

SCHEMA="ths-actual-native-teaching-ink-audit-v1"
REQUIRED={
    "sentence_1_part0": ("MITRAGYNINE","No reaction"),
    "sentence_1_part1": ("7-OH","No reaction"),
    "sentence_2": ("–OH group: oxygen + hydrogen",),
    "sentence_3": ("Dots mark atoms. Lines mark bonds.",),
    "sentence_4": ("A possible\n3D shape.","Computed 3D illustration • not filmed"),
    "sentence_5_part0": ("STRUCTURE",),
    "sentence_5_part1": ("HUMAN EXPERIENCE",),
    "source_hold": ("7-OH • CID 44301524","Mitragynine • CID 3034396","CID = compound record number"),
    "sentence_6": ("Look closer.","Computed detail","Hydrogens omitted"),
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


def exact_gray_samples(movie, requests, stamps):
    """Extract all source-locked teaching frames by decoded index in one pass.

    Time seeking alone can collect a neighboring shot's pixels at a cut. All
    reported contrast measurements must instead be tied to their real PTS
    and a declared shot, without multiplying full decodes for 27 samples.
    This is still a pixel-contrast proxy: no OCR or handset certification.
    """
    if not requests or not stamps:
        hold("EXACT_NATIVE_SAMPLE_REQUESTS_REQUIRED")
    picks = []
    for key, shot, time in requests:
        idx, pts = choose_decoded_sample(stamps, shot, time)
        picks.append((key, shot["id"], idx, pts))
    indices = sorted({item[2] for item in picks})
    # A Python source escape becomes one literal FFmpeg filtergraph escape.
    selection = "select=" + "+".join(f"eq(n\\,{index})" for index in indices)
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin",
           "-i", str(movie), "-an", "-vf", selection + ",format=gray",
           "-fps_mode", "passthrough", "-frames:v", str(len(indices)),
           "-pix_fmt", "gray", "-f", "rawvideo", "pipe:1"]
    try:
        raw = subprocess.run(cmd, capture_output=True, timeout=120,
                             check=True).stdout
    except subprocess.CalledProcessError as exc:
        # Preserve bounded FFmpeg diagnostics so a true decoder/filter failure
        # is not misattributed to missing narration or scientific labels.
        detail = (exc.stderr or b"").decode("utf-8", errors="replace")[-900:]
        hold("EXACT_PRESENTED_FRAME_EXTRACTION_FAILED:exit=" +
             str(exc.returncode) + ":" + detail)
    except (subprocess.TimeoutExpired, OSError):
        hold("EXACT_PRESENTED_FRAME_EXTRACTION_FAILED:IO_OR_TIMEOUT")
    frame_bytes = 1080 * 1920
    if len(raw) != frame_bytes * len(indices):
        hold("EXACT_PRESENTED_FRAME_COUNT_OR_SIZE_MISMATCH")
    batch = np.frombuffer(raw, dtype=np.uint8).reshape(len(indices), 1920, 1080)
    by_index = {idx: batch[pos] for pos, idx in enumerate(indices)}
    frames = {key: by_index[idx] for key, _, idx, _ in picks}
    proof = [{"sampleKey": list(key), "shotId": scene, "frameIndex": idx,
              "actualFramePtsSec": float(pts)}
             for key, scene, idx, pts in picks]
    return frames, proof


def get_boxes(plan):
    shots=plan.get("shots",[])
    if not isinstance(shots,list) or len(shots)!=9:
        hold("NINE_REAL_SCENES_REQUIRED")
    byid={s["id"]:s for s in shots}
    if len(byid)!=len(shots) or any(key not in byid for key in REQUIRED):
        hold("EXACT_REQUIRED_SCENE_COVERAGE")
    # Preserve the exact scientific words and punctuation while accepting
    # explicit visual line breaks from a phone-safe typography reflow.
    # No paraphrases, dropped qualifiers or duplicated labels are permitted.
    canonical=lambda value:" ".join(value.split()) if isinstance(value,str) else None
    boxes={}
    for scene,terms in REQUIRED.items():
        shot=byid[scene]
        if not isinstance(shot.get("annotations"),list):
            hold("ACTUAL_RENDER_ANNOTATIONS_REQUIRED")
        # A source annotation can retain truthful metadata while its separate
        # renderer layout omits words. Reconcile actual declared visual lines
        # before sampling pixels: the computed/not-filmed caveat must survive.
        # This is metadata integrity, not encoded-pixel OCR.
        for ann in shot["annotations"]:
            if not isinstance(ann,dict):
                hold("INVALID_RENDERED_ANNOTATION")
            if "renderedLineBreaks" in ann:
                lines=ann["renderedLineBreaks"]
                if (not isinstance(lines,list) or len(lines)<2
                    or any(type(line) is not str or not line.strip()
                           or "\n" in line or "\r" in line for line in lines)
                    or canonical(" ".join(lines))!=canonical(ann.get("text"))):
                    hold("RENDERED_LINES_MISMATCH_DECLARED_TEXT:"+scene)
        for term in terms:
            found=[a for a in shot["annotations"]
                   if canonical(a.get("text"))==canonical(term)
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
        if not isinstance(seq,(tuple,list)) or len(seq)!=3:
            hold("EARLY_MIDDLE_LATE_NATIVE_FRAME_SAMPLES_REQUIRED")
        measured=[measure_gray_crop(f,box) for f in seq]
        duration=float(byid[scene]["endSec"]-byid[scene]["startSec"])
        observations.append({
            "scene":scene,"label":term,"durationSec":round(duration,4),
            "actualNativeBoxPx":box,"early":measured[0],
            "middle":measured[1],"late":measured[2],
            "minVisibleContrast":round(min(m["inkRange"] for m in measured),3),
            "contrastDrift":round(max(m["inkRange"] for m in measured)-
                                  min(m["inkRange"] for m in measured),3),
        })
    contrast=all(item["minVisibleContrast"]>=MIN_INK_DYNAMIC_RANGE
                 for item in observations)
    persistent=all(item["durationSec"]>=MIN_HOLD_SEC
                   and item["contrastDrift"]<=MAX_INK_DRIFT
                   and item["minVisibleContrast"]>=MIN_INK_DYNAMIC_RANGE
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
             "threshold":"all scenes >=1.50s; early/middle/late contrast >=130; max three-point drift <=16"},
        ],
        "additionalObjectivePoints":int(contrast)+int(persistent),
        "observations":observations,
        "scope":"three decoded instants per shot: luminance proxy only, not verified glyphs, audience comprehension or OCR",
        "viewerComprehensionApproved":False,
        "naturalVoiceApproved":False,
        "excellentFilmApproved":False,
        "realHandsetApproved":False,
        "mayPublish":False,
    }


def audit(movie,phone,receipt,claim,out):
    movie,phone,receipt,claim,out=map(Path,(movie,phone,receipt,claim,out))
    if out.resolve() in {p.resolve() for p in (movie,phone,receipt,claim)}:
        hold("OUTPUT_RECEIPT_MUST_NOT_OVERWRITE_INPUT")
    # A failed replacement audit must never leave an old positive JSON behind.
    # Reject input/output aliasing before touching the destination.
    out.unlink(missing_ok=True)
    width,height,duration,count=probe_movie(movie)
    plan,_,identity=reject_untrusted(movie,phone,receipt,claim,width,height,duration)
    approved=validate_manifest(plan,width=width,height=height,duration=duration,
                               actual_sha=identity)
    if approved["mayPublish"] is not False or count!=1031:
        hold("RESEARCH_ONLY_REAL_VIDEO_REQUIRED")
    byid,boxes=get_boxes(plan)
    stamps=frame_timestamps(movie)
    requests=[]
    for scene in REQUIRED:
        shot=byid[scene]
        start,end=float(shot["startSec"]),float(shot["endSec"])
        offset=min(.30,.20*(end-start))
        if end-start<MIN_HOLD_SEC or offset<=0:
            hold("CRITICAL_TEXT_DISPLAY_INTERVAL_TOO_SHORT")
        requests.extend([((scene,"early"),shot,start+offset),
                         ((scene,"middle"),shot,(start+end)/2),
                         ((scene,"late"),shot,end-offset)])
    encoded_frames, frame_proof=exact_gray_samples(movie,requests,stamps)
    samples={(scene,term):(encoded_frames[(scene,"early")],
                           encoded_frames[(scene,"middle")],
                           encoded_frames[(scene,"late")])
             for scene in REQUIRED for term in REQUIRED[scene]}
    result=score_samples(plan,samples)
    if sha(movie)!=identity:
        hold("SOURCE_MEDIA_CHANGED_DURING_FRAME_SAMPLING")
    result.update({
        "actualFilmSha256":sha(movie),"actualPhonePlanSha256":sha(phone),
        "actualClaimScreenSha256":sha(claim),
        "actualDecodedVideoFrameCount":count,
        "exactDecodedSampleFrames":frame_proof,
        "exactSourceFrameSamplingVerified":True,
        "fullNativeResolution":[width,height],
        "sourceVerifiedResearchScreen":True,
        "automaticPublicationApproval":False
    })
    out.parent.mkdir(parents=True,exist_ok=True)
    # Make a completed, exact-media receipt visible only after the whole JSON
    # is written. A crashed/failed attempt leaves no prior PASS or partial file.
    fd,tmp=tempfile.mkstemp(prefix="."+out.name+".",suffix=".tmp",dir=out.parent)
    try:
        with os.fdopen(fd,"w",encoding="utf-8") as stream:
            stream.write(json.dumps(result,indent=2)+"\n")
        os.replace(tmp,out)
    finally:
        Path(tmp).unlink(missing_ok=True)
    return result


if __name__=="__main__":
    p=argparse.ArgumentParser()
    for k in ("movie","phone","receipt","claim","out"):
        p.add_argument("--"+k,required=True)
    a=p.parse_args()
    print(json.dumps(audit(a.movie,a.phone,a.receipt,a.claim,a.out),indent=2))
