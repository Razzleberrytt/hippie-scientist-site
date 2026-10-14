#!/usr/bin/env python3
"""EvidenceMotion independent CPU decoded-pixel auto-critic (RESEARCH ONLY).

It can issue autonomous *negative* cinematic findings by examining the actual
MP4. It cannot certify premium beauty, expert clinical science, nuanced ear
pronunciation, or posting authority. No owner interaction needed to REJECT.
"""
import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

SAMPLE_STEP_SECONDS=2
FRAME_W, FRAME_H=180,320
EDGE_MATCH_LIMIT=.95
HIGH_REPETITION_FRAC=.45
FULL_REVIEW_MIN_SEC=12
FULL_REVIEW_MAX_SEC=90

def _sha(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for data in iter(lambda:f.read(1024*1024),b""):
            h.update(data)
    return h.hexdigest()

def cosine(p,q):
    d=float(np.linalg.norm(p)*np.linalg.norm(q))
    return float(np.dot(p,q)/d) if d>0 else 0.

def analyze_grayscale_frames(frames):
    frames=np.asarray(frames,dtype=np.uint8)
    if frames.ndim!=3 or frames.shape[1:]!=(FRAME_H,FRAME_W) or len(frames)<4:
        raise ValueError("INSUFFICIENT_OR_BAD_ACTUAL_FRAME_SAMPLES")
    vectors=[]
    for arr in frames:
        # Actual decoded subject-layout features, suppress persistent header,
        # bottom platform UI and narration captions. This isn't an aesthetic AI.
        edge=np.asarray(Image.fromarray(arr).filter(ImageFilter.FIND_EDGES)).copy()
        edge[:30,:]=0
        edge[230:,:]=0
        feat=edge.reshape(32,10,18,10).mean(axis=(1,3)).ravel()
        vectors.append(feat.astype(np.float64))
    similarities=[cosine(a,b) for a,b in zip(vectors,vectors[1:])]
    high=sum(x>EDGE_MATCH_LIMIT for x in similarities)
    repetition=round(high/len(similarities),4)
    issues=[]
    if repetition>=HIGH_REPETITION_FRAC:
        issues.append("REPETITIVE_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR")
    return {"samples":len(frames),"sampleEverySeconds":SAMPLE_STEP_SECONDS,
        "highEdgeSimilarityFraction":repetition,
        "medianSubjectLayoutSimilarity":round(float(np.median(similarities)),4),
        "threshold":HIGH_REPETITION_FRAC,
        "issues":issues,
        "scope":"DECODED_LAYOUT_NEGATIVE_FILTER_NOT_AESTHETIC_CERTIFICATION"}

def analyze_video(path):
    path=Path(path)
    if not path.is_file():
        raise ValueError("ACTUAL_VIDEO_REQUIRED")
    info=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_streams",
      "-show_format","-of","json",str(path)],timeout=30))
    videos=[s for s in info["streams"] if s.get("codec_type")=="video"]
    if len(videos)!=1:raise ValueError("EXACTLY_ONE_ACTUAL_VIDEO_STREAM")
    dur=float(info.get("format",{}).get("duration",0))
    if not FULL_REVIEW_MIN_SEC<=dur<=FULL_REVIEW_MAX_SEC:
        raise ValueError("FULL_REVIEW_DURATION_LIMIT")
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-nostdin",
         "-i",str(path),"-vf",
         f"fps=1/{SAMPLE_STEP_SECONDS},scale={FRAME_W}:{FRAME_H},format=gray",
         "-f","rawvideo","-pix_fmt","gray","pipe:1"]
    raw=subprocess.check_output(cmd,timeout=90)
    size=FRAME_W*FRAME_H
    if not raw or len(raw)%size:raise ValueError("TRUNCATED_RAW_FRAME_DATA")
    f=np.frombuffer(raw,dtype=np.uint8).reshape(-1,FRAME_H,FRAME_W)
    result=analyze_grayscale_frames(f)
    result.update({"actualVideoSha256":_sha(path),
       "actualDurationSeconds":round(dur,4),
       "resolution":[int(videos[0]["width"]),int(videos[0]["height"])],
       "decision":"AUTO_REVISE" if result["issues"] else "CONTINUE_TO_INDEPENDENT_SCIENCE_VOICE_AND_CRAFT_CHECKS",
       "ownerReviewRequiredForThisNegativeDecision":False,
       "automaticPositiveCraftApproval":False,
       "automaticClinicalApproval":False,"publishingAllowed":False})
    return result

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--out")
    args=ap.parse_args()
    output=analyze_video(args.video)
    if args.out:Path(args.out).write_text(json.dumps(output,indent=2)+"\n")
    print(json.dumps(output,indent=2))
