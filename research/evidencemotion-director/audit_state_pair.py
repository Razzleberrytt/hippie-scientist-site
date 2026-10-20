#!/usr/bin/env python3
"""Research-only decoded before/after negative filter; never grants quality approval."""
import argparse,hashlib,json
from pathlib import Path
import cv2
import numpy as np

def audit(video,before_sec,after_sec,subject_roi,block=24,difference_threshold=25):
    path=Path(video)
    if not path.is_file():raise FileNotFoundError(path)
    cap=cv2.VideoCapture(str(path))
    if not cap.isOpened():raise ValueError('Cannot decode video')
    fps=cap.get(cv2.CAP_PROP_FPS)
    length=int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width=int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height=int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    x0,y0,x1,y1=subject_roi
    if (len(subject_roi)!=4 or not all(isinstance(k,int) for k in subject_roi) or
        x0<0 or y0<0 or x1>width or y1>height or
        x1-x0<block*3 or y1-y0<block*3):
        raise ValueError('Invalid subject ROI')
    if not(1<=fps<=60 and 0<=before_sec<after_sec<=length/fps and length<=900):
        raise ValueError('Invalid preview time range')
    def get(sec):
        frame_idx=min(length-1,int(sec*fps))
        cap.set(cv2.CAP_PROP_POS_FRAMES,frame_idx)
        ok,frame=cap.read()
        if not ok:raise ValueError('Could not decode requested frame')
        return frame[y0:y1,x0:x1].astype(np.float32),frame_idx
    try:
        before,index_a=get(before_sec)
        after,index_b=get(after_sec)
    finally:cap.release()
    bh,bw=(y1-y0)//block,(x1-x0)//block
    def coarse(a):
        return a[:bh*block,:bw*block].reshape(bh,block,bw,block,3).mean(axis=(1,3))
    changed=np.max(np.abs(coarse(after)-coarse(before)),axis=2)
    fraction=float((changed>=difference_threshold).mean())
    return {'schemaVersion':'ths-director-state-pair-v1',
        'origin':'independently-decoded-video',
        'videoSha256':hashlib.sha256(path.read_bytes()).hexdigest(),
        'size':[width,height],'fps':round(fps,3),
        'decodedFrameIndices':[index_a,index_b],'subjectROI':list(subject_roi),
        'blockSize':block,'colorDifferenceThreshold':difference_threshold,
        'changedSubjectBlocksFraction':round(fraction,4),
        'advisory':('NO_SUBSTANTIVE_STATE_CHANGE_DETECTED' if fraction<.25
                    else 'STATE_DIFFERENCE_PRESENT_NOT_CRAFT_APPROVAL'),
        'scientificApproval':False,'craftApproved':False,
        'limitations':('A color wipe or hard cut can score high even if the hero is unchanged. '
                       'Semantic meaning, identity continuity and artistry require human review.')}

if __name__=='__main__':
    ap=argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('--before',type=float,required=True)
    ap.add_argument('--after',type=float,required=True)
    ap.add_argument('--subject-roi',nargs=4,type=int,required=True)
    args=ap.parse_args()
    print(json.dumps(audit(args.video,args.before,args.after,args.subject_roi),indent=2))
