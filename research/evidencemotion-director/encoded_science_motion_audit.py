#!/usr/bin/env python3
"""Actual-decoded pixel-motion guard for source-locked molecular connection shot.

This bounded measurement ensures one previously nearly static teaching scene
now has intentional visible progression without strobing. It is explicitly
NOT a calibrated human visual-quality, comprehension or premium-craft verdict.
The entire original narration and all source/claim reviewers remain upstream.
"""
import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path
import numpy as np
from autonomous_script_asr_research import WAV_SHA

SCHEMA="ths-encoded-science-camera-motion-v1"
FRAME_W,FRAME_H=270,480
REGION=(10,150,235,310)  # source-only graphic area at 1/4 native resolution
PIXEL_DELTA=12
MIN_AVERAGE_MOTION_PCT=4.5
MAX_AVERAGE_MOTION_PCT=13.0
MIN_MOVING_INTERVALS=8
MIN_INDIVIDUAL_MOTION_PCT=3.5
MAX_INDIVIDUAL_MOTION_PCT=20.0

def hold(reason):
    raise ValueError("ENCODED_MOTION_HOLD:"+reason)

def digest(path):
    h=hashlib.sha256()
    with Path(path).open("rb") as f:
        for c in iter(lambda:f.read(1<<20),b""):
            h.update(c)
    return h.hexdigest()

def science_motion(frames):
    if (not isinstance(frames,np.ndarray) or frames.dtype!=np.uint8
        or frames.ndim!=3 or frames.shape[1:]!=(FRAME_H,FRAME_W)
        or not 11<=len(frames)<=13):
        hold("SOURCE_LOCKED_ACTUAL_DECODED_FRAMES_REQUIRED")
    x0,y0,x1,y1=REGION
    # Pixels stay grayscale UInt8 until converted to signed before subtraction;
    # otherwise wraparound would fabricate enormous motion from minor changes.
    small=frames[:,y0:y1,x0:x1].astype(np.int16)
    changes=np.abs(small[1:]-small[:-1])
    percentages=100*(changes>PIXEL_DELTA).mean(axis=(1,2))
    return {"decodedFrameCount":int(len(frames)),
            "halfSecondIntervals":int(len(percentages)),
            "scienceMotionPercentPerHalfSecond":[round(float(v),4) for v in percentages],
            "meanScienceMotionPercent":round(float(percentages.mean()),4),
            "movingHalfSecondIntervals":int((percentages>=MIN_INDIVIDUAL_MOTION_PCT).sum()),
            "maxSingleIntervalMotionPercent":round(float(percentages.max()),4),
            "meanAbsoluteGreyChange":round(float(changes.mean()),4)}

def apply_bounded_motion_gate(report):
    if (report["meanScienceMotionPercent"]<MIN_AVERAGE_MOTION_PCT
        or report["movingHalfSecondIntervals"]<MIN_MOVING_INTERVALS):
        hold("STATIC_CHEMISTRY_EXPLANATION")
    if (report["meanScienceMotionPercent"]>MAX_AVERAGE_MOTION_PCT
        or report["maxSingleIntervalMotionPercent"]>MAX_INDIVIDUAL_MOTION_PCT):
        hold("UNCONTROLLED_SCIENCE_STAGE_FLICKER")
    return True

def decode_actual_science_scene(movie,start,end):
    if not (0<=start<end<=34.4 and 5.6<end-start<5.9):
        hold("WRONG_FROZEN_SCENE_TIME")
    cmd=["ffmpeg","-nostdin","-v","error","-ss",f"{start:.6f}",
         "-i",str(movie),"-t",f"{end-start:.6f}",
         "-vf",f"fps=2,scale={FRAME_W}:{FRAME_H}:flags=bilinear,format=gray",
         "-pix_fmt","gray","-f","rawvideo","pipe:1"]
    try:
        raw=subprocess.check_output(cmd,stderr=subprocess.PIPE,timeout=85)
    except (OSError,subprocess.CalledProcessError,subprocess.TimeoutExpired):
        hold("ACTUAL_H264_FRAME_DECODE_FAILED")
    size=FRAME_W*FRAME_H
    if not raw or len(raw)%size:
        hold("UNEXPECTED_DECODED_FRAME_BYTES")
    return np.frombuffer(raw,dtype=np.uint8).reshape(-1,FRAME_H,FRAME_W)

def inspect(movie,render_receipt,story_report,output):
    movie,render_receipt,story_report,output=map(
        Path,(movie,render_receipt,story_report,output))
    if any(not p.is_file() or p.is_symlink()
           for p in (movie,render_receipt,story_report)):
        hold("REAL_SOURCE_LOCKED_MEDIA_FILES_REQUIRED")
    receipt=json.loads(render_receipt.read_text())
    story=json.loads(story_report.read_text())
    filmsha=digest(movie)
    if (receipt.get("videoSha256")!=filmsha
        or story.get("encodedH264Sha256")!=filmsha
        or receipt.get("sourceWavSha256")!=WAV_SHA
        or story.get("sourceWavSha256")!=WAV_SHA
        or receipt.get("resolution")!=[1080,1920]
        or receipt.get("fps")!=30 or receipt.get("frames")!=1031
        or receipt.get("experimentCaptionMode")!="TIMED_RESEARCH"
        or receipt.get("sourceGraphConnectionTeachingResearch") is not True
        or story.get("nineShotsMapped")!=9
        or story.get("sourceWordCutBoundariesVerified") is not True
        or receipt.get("mayPublish") is not False
        or story.get("mayPublish") is not False):
        hold("EXACT_NARRATION_MOVIE_STORY_HASHES_CHANGED")
    scenes=receipt.get("scenes",[])
    third=next((s for s in scenes if s.get("id")=="sentence_3"),None)
    if not third or third.get("line")!=(
            "This molecular structure is built from a verified chemical record, atom by atom."):
        hold("NOT_THE_FROZEN_CHEMICAL_CONNECTION_SCENE")
    start,end=float(third["startSec"]),float(third["endSec"])
    if not any(s.get("shot")=="sentence_3" and
               abs(s.get("startSec",-1)-start)<1e-5 and
               abs(s.get("endSec",-1)-end)<1e-5
               for s in story.get("shots",[])):
        hold("STORY_BOUNDARIES_NOT_SOURCE_LOCKED")
    frames=decode_actual_science_scene(movie,start,end)
    motion=science_motion(frames)
    apply_bounded_motion_gate(motion)
    result={"schema":SCHEMA,
            "status":"ENCODED_SCIENCE_VISUAL_PROGRESS_PASS_RESEARCH_ONLY",
            "filmSha256":filmsha,
            "renderReceiptSha256":digest(render_receipt),
            "fourActStorySha256":digest(story_report),
            "sourceWavSha256":WAV_SHA,
            "inspectedOriginalWavShot":"sentence_3",
            "sourceSceneStartSec":start,"sourceSceneEndSec":end,
            "visualRegionFractionOfNative":{"x0":REGION[0]/FRAME_W,
                                            "y0":REGION[1]/FRAME_H,
                                            "x1":REGION[2]/FRAME_W,
                                            "y1":REGION[3]/FRAME_H},
            "sourceGraphRegionMotion":motion,
            "allNativeFramesInspected":False,
            "premiumVisualQualityApproved":False,
            "viewerComprehensionVerified":False,
            "actualHandsetApproved":False,
            "mayPublish":False}
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(result,indent=2)+"\n")
    return result

def main():
    p=argparse.ArgumentParser()
    for flag in ("movie","receipt","story","out"):
        p.add_argument("--"+flag,required=True)
    args=p.parse_args()
    result=inspect(args.movie,args.receipt,args.story,args.out)
    print(json.dumps(result,indent=2))

if __name__=="__main__":
    main()
