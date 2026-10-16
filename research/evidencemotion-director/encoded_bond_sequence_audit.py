#!/usr/bin/env python3
"""Check six source-verified molecular connections in ACTUAL encoded H264 pixels.

This verifies visible progressive teaching marks on original-WAV native frames,
not merely planned overlays. Motion, scientific effects, reader comprehension,
professional craft and publishing decisions remain independently unapproved.
"""
import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path
import numpy as np

from autonomous_script_asr_research import LINES,WAV_SHA
from narration_locked_treatments import chemistry_assets
from source_bond_trace_direction import (
    verified_bond_path,mapped_atom_point,MAX_BONDS)
from encoded_science_motion_audit import digest

SCHEMA="ths-original-voice-encoded-six-bond-pixel-sequence-v1"
FPS=30
H,W=1920,1080
# Source-verified amber annotation, not molecule oxygen color/white UI ink.
MIN_VISIBLE_AMBER=60
MAX_UNSHOWN_AMBER=12

def hold(reason):
    raise ValueError("ENCODED_BOND_SEQUENCE_HOLD:"+reason)

def frame_at_index(movie,index):
    if type(index) is not int or index<0 or index>=1031:
        hold("ENCODED_FRAME_INDEX_INVALID")
    cmd=["ffmpeg","-nostdin","-v","error","-i",str(movie),
         "-vf",f"select=eq(n\\,{index}),format=rgb24",
         "-frames:v","1","-pix_fmt","rgb24","-f","rawvideo","pipe:1"]
    try:
        b=subprocess.check_output(cmd,stderr=subprocess.PIPE,timeout=60)
    except (subprocess.CalledProcessError,subprocess.TimeoutExpired,OSError):
        hold("REAL_ENCODED_FRAME_DECODING_FAILED")
    if len(b)!=W*H*3:
        hold("INCORRECT_ACTUAL_H264_FRAME_PIXELS")
    return np.frombuffer(b,dtype=np.uint8).reshape(H,W,3)

def amber_pixels_near(frame,x,y):
    if (not isinstance(frame,np.ndarray) or
        frame.dtype!=np.uint8 or frame.shape!=(H,W,3)):
        hold("UNTRUSTED_DECODED_SOURCE_FRAME")
    if not (20<x<W-20 and 580<y<1260):
        hold("SOURCE_MARKER_OFF_FILM")
    crop=frame[y-18:y+19,x-18:x+19]
    rgb=crop.astype(np.int16)
    # Limited to the exact orange of the real renderer's stationary circles.
    orange=(rgb[:,:,0]>180)&(rgb[:,:,1]>125)&(rgb[:,:,1]<220)&(rgb[:,:,2]<145)
    return int(orange.sum())

def expected_cue_counts(samples):
    if len(samples)!=MAX_BONDS+1:
        hold("WRONG_SPEECH_BOUND_PIXEL_COUNT")
    if samples[0]["active"]!=0 or samples[0]["visible"]!=0:
        hold("MOLECULAR_BONDS_VISIBLE_BEFORE_SPOKEN_CUE")
    for k,row in enumerate(samples[1:],1):
        if row["active"]!=k:
            hold("SIX_REAL_SOURCE_BONDS_NOT_SEQUENCED")
        if row["visible"]!=k:
            hold("UNEXPECTED_SOURCE_PIXEL_MARKER_ORDER")
    return True

def inspect(movie_path,receipt_path,story_path,output_path):
    movie,receipt_path,story_path,output_path=map(
        Path,(movie_path,receipt_path,story_path,output_path))
    if any(not p.is_file() or p.is_symlink() for p in (movie,receipt_path,story_path)):
        hold("REGULAR_REAL_MEDIA_FILES_REQUIRED")
    receipt=json.loads(receipt_path.read_text())
    story=json.loads(story_path.read_text())
    file_sha=digest(movie)
    if (receipt.get("videoSha256")!=file_sha
        or story.get("encodedH264Sha256")!=file_sha
        or receipt.get("sourceWavSha256")!=WAV_SHA
        or story.get("sourceWavSha256")!=WAV_SHA
        or receipt.get("experimentCaptionMode")!="TIMED_RESEARCH"
        or receipt.get("sourceGraphConnectionTeachingResearch") is not True
        or receipt.get("sourceLockedOxygenSpotlightResearch") is not True
        or receipt.get("frames")!=1031 or receipt.get("fps")!=FPS
        or receipt.get("resolution")!=[W,H]
        or story.get("nineShotsMapped")!=9
        or receipt.get("mayPublish") is not False
        or story.get("mayPublish") is not False):
        hold("IMMUTABLE_NATIVE_STORY_VOICE_IDENTITY_CHANGED")
    scenes=receipt.get("scenes",[])
    target=next((s for s in scenes if s.get("id")=="sentence_3"),None)
    if target is None or target.get("line")!=LINES[2]:
        hold("WRONG_FROZEN_CONNECTION_SCRIPT")
    word=[x for x in target.get("captionWords",[])
          if x.get("text","").casefold().strip(".,!?")=="molecular"]
    if len(word)!=1:
        hold("SPOKEN_MOLECULAR_CUE_NOT_UNIQUE")
    begin=float(word[0]["startSec"]);end=float(target["endSec"])
    if not (float(target["startSec"])<begin<end and
            end-begin>4.0):
        hold("ACTUAL_SOURCE_WORD_WINDOW_INVALID")
    asset=chemistry_assets()["7_hydroxymitragynine"]
    path=verified_bond_path(asset)
    if len(path)!=MAX_BONDS:
        hold("SOURCE_BOND_STORY_SIZE_CHANGED")
    points=asset["diagramAtomXY"]
    def sample_seconds(t,expected):
        idx=round(t*FPS)
        if idx<0 or idx>=1031:
            hold("INVALID_NATIVE_SAMPLE_TIMESTAMP")
        f=frame_at_index(movie,idx)
        exact_t=idx/FPS
        progress=(exact_t-target["startSec"])/(end-target["startSec"])
        progress=max(0,min(1,progress))
        # All atom positions derive from same native camera math as the
        # video; actual bright pixels come ONLY from freshly decoded H264.
        from editorial_2d_cpu_research import smooth
        coords=[]
        for a,b in path:
            x1,y1=mapped_atom_point(points[a],smooth(progress),(W,H))
            x2,y2=mapped_atom_point(points[b],smooth(progress),(W,H))
            x,y=round((x1+x2)/2),round((y1+y2)/2)
            coords.append({"at":[x,y],"amber":amber_pixels_near(f,x,y)})
        observed=[v["amber"]>=MIN_VISIBLE_AMBER for v in coords]
        # All future markers must be absent, including any premature hint.
        if any(v["amber"]>MAX_UNSHOWN_AMBER
               for v in coords[expected:]):
            hold("PREMATURE_FUTURE_CONNECTION_IN_ENCODED_PIXELS")
        if any(v["amber"]<MIN_VISIBLE_AMBER
               for v in coords[:expected]):
            hold("REQUIRED_SOURCE_BOND_MARKER_INVISIBLE")
        return {"t":round(exact_t,5),"frameIndex":idx,
                "active":expected,"visible":sum(observed),
                "sourceBondPixelScores":coords,
                "frameSha256":hashlib.sha256(f.tobytes()).hexdigest()}
    samples=[]
    # Pre-word frame selected safely inside the currently spoken "This".
    before_idx=math.floor(begin*FPS-1e-7)-1
    if before_idx/FPS<float(target["startSec"]):
        hold("PRE_WORD_SAMPLE_NOT_IN_CONNECTION_SCENE")
    samples.append(sample_seconds(before_idx/FPS,0))
    for step in range(1,MAX_BONDS+1):
        # A midpoint of each exact deterministic reveal interval keeps us
        # away from frame quantization, cue boundary and brief crossfades.
        t=begin+(end-begin)*(step-.5)/MAX_BONDS
        samples.append(sample_seconds(t,step))
    expected_cue_counts(samples)
    result={
        "schema":SCHEMA,"status":"SIX_ACTUAL_ENCODED_BOND_REVEALS_PASS_RESEARCH",
        "exactNativeVideoSha256":file_sha,
        "renderReceiptSha256":digest(receipt_path),
        "fourActStorySha256":digest(story_path),
        "originalWavSha256":WAV_SHA,
        "pubchemCid":44301524,"nativeFramesDecoded":len(samples),
        "spokenWord":"molecular","spokenWordStartSec":begin,
        "sixVerifiedRDKitEdges":[[a,b] for a,b in path],
        "allSixAppearInCorrectSpokenSequence":True,
        "noMarkersBeforeSpokenCue":True,
        "noFutureMarkersDuringPriorCueWindows":True,
        "completeFilmVisualQualityReviewed":False,
        "humanComprehensionVerified":False,
        "mayPublish":False,"rows":samples}
    output_path.parent.mkdir(parents=True,exist_ok=True)
    output_path.write_text(json.dumps(result,indent=2)+"\n")
    return result

def main():
    p=argparse.ArgumentParser()
    for n in ("movie","receipt","story","out"):
        p.add_argument("--"+n,required=True)
    a=p.parse_args()
    r=inspect(a.movie,a.receipt,a.story,a.out)
    print(json.dumps({k:v for k,v in r.items() if k!="rows"},indent=2))

if __name__=="__main__":
    main()
