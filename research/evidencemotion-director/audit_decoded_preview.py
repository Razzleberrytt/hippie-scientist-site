#!/usr/bin/env python3
"""RESEARCH ONLY: independently decode real MP4 pixels and flag static shots.
Motion is a NEGATIVE proxy, not artistic or scientific approval.
No storyboard "motion" boolean is accepted as independently measured data.
Usage: python audit_decoded_preview.py preview.mp4
"""
import argparse, hashlib, json, subprocess
from pathlib import Path
from fractions import Fraction
import numpy as np

def audit(filepath, pixel_threshold=8, change_floor=0.018):
    path=Path(filepath)
    if not path.is_file(): raise FileNotFoundError(path)
    probe=json.loads(subprocess.run(['ffprobe','-v','error','-select_streams','v:0',
      '-show_entries','stream=codec_name,width,height,r_frame_rate','-of','json',str(path)],
      check=True,capture_output=True,text=True).stdout)
    streams=probe.get('streams') or []
    if len(streams)!=1: raise ValueError('Exactly one video stream required')
    s=streams[0]; w,h=int(s['width']),int(s['height']);fps=float(Fraction(s['r_frame_rate']))
    if w<100 or h<100 or w*h>720*1280 or not 1<=fps<=60:
        raise ValueError('Research decoder supports only <=720p previews at 1-60fps')
    # Subject ROI excludes bottom captions and most header regions.
    # Animated text within the ROI requires independent mask verification.
    x1,y1,x2,y2=round(.11*w),round(.18*h),round(.89*w),round(.76*h)
    p=subprocess.Popen(['ffmpeg','-hide_banner','-v','error','-i',str(path),
      '-f','rawvideo','-pix_fmt','rgb24','pipe:1'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    chunk=w*h*3; last=None; changed=[]; frames=0
    # Spatially averaged blocks suppress tiny particles and subtitle flicker.
    # This cannot prove a semantic reveal, but catches micro-motion gaming.
    block_size=32; prev_blocks=None; structural_changed=[]
    try:
        while True:
            b=p.stdout.read(chunk)
            if not b:break
            if len(b)!=chunk:raise ValueError('Truncated decoded frame')
            frames+=1
            if frames>720:raise ValueError('Research-only 720-frame processing limit')
            roi=np.frombuffer(b,dtype=np.uint8).reshape(h,w,3)[y1:y2,x1:x2].astype(np.int16)
            if last is not None:
                d=np.max(np.abs(roi-last),axis=2)
                changed.append(float((d>=pixel_threshold).mean()))
            last=roi
            ph,pw=roi.shape[:2]
            bh,bw=ph//block_size,pw//block_size
            if bh<2 or bw<2:raise ValueError('ROI too small for structural audit')
            blocks=roi[:bh*block_size,:bw*block_size].astype(np.float32).reshape(
                bh,block_size,bw,block_size,3).mean(axis=(1,3))
            if prev_blocks is not None:
                broad=np.max(np.abs(blocks-prev_blocks),axis=2)
                structural_changed.append(float((broad>=6).mean()))
            prev_blocks=blocks
        stderr=p.stderr.read().decode(errors='replace'); code=p.wait(timeout=15)
        if code:raise RuntimeError('FFmpeg decode error: '+stderr[-250:])
    finally:
        if p.poll() is None:p.kill();p.wait()
        p.stdout.close();p.stderr.close()
    if frames<2:raise ValueError('Need at least two decoded frames')
    now=longest=0
    for frac in changed:
        now=now+1 if frac<change_floor else 0
        longest=max(now,longest)
    static_sec=round(longest/fps,3)
    return {'schemaVersion':'ths-director-decoded-pixels-v1',
       'origin':'independent-full-decode','previewSha256':hashlib.sha256(path.read_bytes()).hexdigest(),
       'width':w,'height':h,'fps':fps,'decodedFrameCount':frames,'roiPixels':[x1,y1,x2,y2],
       'maxCaptionExcludedStaticSec':static_sec,'hasSixSecondStaticKill':static_sec>6,
       'medianChangedFraction':round(float(np.median(changed)),5),
       'medianBroadStructureChangedFraction':round(float(np.median(structural_changed)),5),
       'structuralBlockSize':block_size,
       'changeFractionThreshold':change_floor,'pixelDifferenceThreshold':pixel_threshold,
       'excellentCertified':False,
       'limitations':'Pixel and 32-pixel block changes are negative proxies only; particles, camera drift and geometry may still fool them. Independent human visual/phone review mandatory.'}
if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('preview');a.add_argument('--change-floor',type=float,default=.018)
 v=a.parse_args();print(json.dumps(audit(v.preview,change_floor=v.change_floor),indent=2))
