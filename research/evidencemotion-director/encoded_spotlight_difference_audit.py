#!/usr/bin/env python3
"""Pixel-only check that the 7-OH source oxygen highlight is speech-locked.

Compare the EXACT same-scene original-WAV encoded research and legacy H.264
films in the science stage. Before spoken "different" they must agree. After,
only a small, source-verified region around the sole hydroxyl oxygen may change.

This is a bounded objective animation/science-scope test, not a complete
storytelling, premium-craft, device, comprehension or publication approval.
"""
import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path

import numpy as np

from autonomous_script_asr_research import WAV_SHA
from narration_locked_treatments import chemistry_assets
from source_locked_visual_direction import hydroxyl_ring_location

SCHEMA="ths-encoded-oxygen-locus-voice-transition-v1"
FPS=30
W,H=1080,1920
CHANNELS=3
DIFF_THRESHOLD=28
MIN_INSIDE_CHANGED_PIXELS=500
MAX_OUTSIDE_CHANGED_PIXELS=36
MAX_BEFORE_CHANGED_PIXELS=36


def hold(code):
    raise ValueError("ENCODED_SPOTLIGHT_HOLD:"+code)


def sha(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for chunk in iter(lambda:f.read(1<<20),b""):
            h.update(chunk)
    return h.hexdigest()


def actual_rgb_frame(movie,index):
    if type(index) is not int or index<0 or index>=1031:
        hold("OUT_OF_RANGE_ACTUAL_FRAME")
    cmd=["ffmpeg","-v","error","-nostdin","-i",str(movie),
         "-vf",f"select=eq(n\\,{index}),format=rgb24",
         "-frames:v","1","-f","rawvideo","-pix_fmt","rgb24","pipe:1"]
    try:
        raw=subprocess.check_output(cmd,stderr=subprocess.PIPE,timeout=50)
    except (subprocess.CalledProcessError,subprocess.TimeoutExpired,OSError):
        hold("CANNOT_DECODE_EXACT_H264_FRAME")
    if len(raw)!=W*H*CHANNELS:
        hold("ACTUAL_FRAME_GEOMETRY_NOT_VERIFIED")
    return np.frombuffer(raw,dtype=np.uint8).reshape(H,W,CHANNELS)


def measure_stage_difference(experimental,baseline,location,*,changed_threshold=DIFF_THRESHOLD):
    if (not isinstance(experimental,np.ndarray) or
        not isinstance(baseline,np.ndarray) or
        experimental.shape!=(H,W,CHANNELS) or
        baseline.shape!=(H,W,CHANNELS) or
        experimental.dtype!=np.uint8 or baseline.dtype!=np.uint8):
        hold("TWO_INDEPENDENT_ACTUAL_RGB_FRAMES_REQUIRED")
    if (not isinstance(location,(tuple,list)) or len(location)!=3 or
        not all(type(k) is int for k in location)):
        hold("SOURCE_GEOMETRY_REQUIRED")
    x,y,base_radius=location
    safe=base_radius+35
    if not (safe<=x<W-safe and 545+safe<=y<1145-safe):
        hold("SOURCE_LOCUS_NOT_SAFE_IN_STAGE")
    diff=np.max(np.abs(experimental.astype(np.int16)-
                       baseline.astype(np.int16)),axis=2)
    science_mask=diff[500:1260,:]>changed_threshold
    inside=science_mask[y-safe-500:y+safe-500,x-safe:x+safe]
    count_inside=int(np.count_nonzero(inside))
    total=int(np.count_nonzero(science_mask))
    return {"changedInsideSourceLocus":count_inside,
            "changedOutsideSourceLocus":total-count_inside,
            "scienceStageChanged":total}


def evaluate(pre,post,location):
    before=measure_stage_difference(pre[0],pre[1],location)
    after=[measure_stage_difference(a,b,location) for a,b in post]
    if (before["scienceStageChanged"]>MAX_BEFORE_CHANGED_PIXELS or
        before["changedInsideSourceLocus"]>MAX_BEFORE_CHANGED_PIXELS):
        hold("VISIBLE_SPOTLIGHT_BEFORE_FROZEN_SPOKEN_REVEAL")
    for result in after:
        if result["changedInsideSourceLocus"]<MIN_INSIDE_CHANGED_PIXELS:
            hold("SOURCE_OXYGEN_NOT_VISIBLY_HIGHLIGHTED_AFTER_REVEAL")
        if result["changedOutsideSourceLocus"]>MAX_OUTSIDE_CHANGED_PIXELS:
            hold("NON_SOURCE_CHEMISTRY_PIXELS_CHANGED")
    return {"before":before,"after":after,
            "spotlightOnlyAfterOriginalSpeech":True,
            "preRevealOriginalScienceDiagramUnchanged":True,
            "sourceGraphOutsideOxygenLocusPreserved":True}


def audit(experimental_mp4,legacy_mp4,experimental_receipt,
          legacy_receipt,output_path):
    paths=list(map(Path,(experimental_mp4,legacy_mp4,
                         experimental_receipt,legacy_receipt)))
    if any(not x.is_file() or x.is_symlink() for x in paths):
        hold("REGULAR_SOURCE_FILES_REQUIRED")
    film,legacy,report,baseline=paths
    a=json.loads(report.read_text(encoding="utf-8"))
    b=json.loads(baseline.read_text(encoding="utf-8"))
    if (a.get("experimentCaptionMode")!="TIMED_RESEARCH"
        or a.get("sourceLockedOxygenSpotlightResearch") is not True
        or a.get("researchSpotlightIsNotReactionOrEffectEvidence") is not True
        or a.get("candidateCaptionWindowsAppliedToFilm") is not True
        or b.get("experimentCaptionMode")!="LEGACY"
        or b.get("sourceLockedOxygenSpotlightResearch") is not False
        or a.get("sourceWavSha256")!=WAV_SHA
        or b.get("sourceWavSha256")!=WAV_SHA
        or any(r.get("mayPublish") is not False for r in (a,b))
        or a.get("videoSha256")!=sha(film)
        or b.get("videoSha256")!=sha(legacy)
        or any(r.get("frames")!=1031 or r.get("resolution")!=[W,H]
               or r.get("fps")!=FPS for r in (a,b))):
        hold("SOURCE_VIDEO_RECEIPT_IDENTITY_CHANGED")
    sa=a.get("scenes",[])
    sb=b.get("scenes",[])
    if sa!=sb or not sa or sa[0].get("id")!="sentence_1":
        hold("COMPARISON_SCENE_AUDIO_DRIFT")
    target=[w for w in sa[0].get("captionWords",[])
            if w["text"].casefold().strip(".,!?")=="different"]
    if len(target)!=1:
        hold("FROZEN_DIFFERENT_CUE_NOT_UNIQUE")
    boundary=float(target[0]["startSec"])
    pre=math.ceil(FPS*boundary-1e-7)-1
    post=pre+1
    second=post+max(1,round(.55*FPS))
    if (pre<0 or post/FPS<boundary-1e-7 or
        second/FPS>sa[0]["endSec"]-.10):
        hold("NO_ACOUSTIC_COMPARISON_SAMPLE_WINDOW")
    asset=chemistry_assets()["7_hydroxymitragynine"]
    location=hydroxyl_ring_location(asset,canvas=(W,H))
    frames=[(idx,(actual_rgb_frame(film,idx),
                  actual_rgb_frame(legacy,idx)))
            for idx in (pre,post,second)]
    score=evaluate(frames[0][1],[frames[1][1],frames[2][1]],location)
    result={
        "schema":SCHEMA,
        "status":"ENCODED_SCIENCE_FOCUS_MOTION_PASS_REVIEW_REQUIRED",
        "sourceWavSha256":WAV_SHA,"experimentalH264Sha256":sha(film),
        "legacyH264Sha256":sha(legacy),
        "experimentalReceiptSha256":sha(report),
        "legacyReceiptSha256":sha(baseline),
        "sourcePubChemCid":44301524,
        "actualOxygenCenterAndRadiusPx":list(location),
        "spokenComparisonStartsSec":boundary,
        "framesChecked":[pre,post,second],
        **score,
        "allDecodedFramesChecked":False,
        "premiumStoryQualityApproved":False,
        "humanComprehensionVerified":False,
        "realDeviceApproved":False,
        "mayPublish":False
    }
    out=Path(output_path)
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8")
    return result


def main():
    p=argparse.ArgumentParser()
    for arg in ("experimental","baseline","experimental-receipt",
                "baseline-receipt","out"):
        p.add_argument("--"+arg,required=True)
    v=p.parse_args()
    report=audit(v.experimental,v.baseline,v.experimental_receipt,
                 v.baseline_receipt,v.out)
    print(json.dumps(report,indent=2))


if __name__=="__main__":
    main()
