#!/usr/bin/env python3
"""Research-only FULL DECODE previz motion audit. Never certifies art quality.
Usage: python decoded-preview-audit.py clip.mp4
Sample each encoded frame; crop center science region, excluding captions.
"""
import json, subprocess, hashlib, sys
from pathlib import Path
import numpy as np

def audit(mp4, fraction_cutoff=0.018, pixel_delta=8):
    p=Path(mp4)
    if not p.is_file(): raise FileNotFoundError(p)
    meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=codec_name,width,height,r_frame_rate','-of','json',str(p)], text=True))
    streams=meta.get('streams',[])
    if len(streams)!=1:raise ValueError('exactly one video stream required')
    stream=streams[0];w=int(stream['width']);h=int(stream['height'])
    numerator,denominator=map(int,stream['r_frame_rate'].split('/'))
    if not denominator:raise ValueError('invalid FPS')
    fps=numerator/denominator
    if w<100 or h<100 or w>720 or h>1280 or fps<1 or fps>30:
        raise ValueError('previews only: 100..720x100..1280, 1..30fps')
    # Actual frame decode: storyboard motion flags do not count as proof.
    proc=subprocess.Popen(['ffmpeg','-v','error','-i',str(p),'-f','rawvideo','-pix_fmt','rgb24','-vsync','0','pipe:1'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    size=w*h*3
    x1,x2=round(w*.11),round(w*.89)
    y1,y2=round(h*.18),round(h*.76)
    prev=None;fractions=[];count=0;longest=current=0
    try:
        while True:
            chunks=[];remaining=size
            while remaining:
                chunk=proc.stdout.read(remaining)
                if not chunk:break
                chunks.append(chunk);remaining-=len(chunk)
            if remaining==size:break
            if remaining:raise ValueError('partial decoded frame')
            count+=1
            if count>900:raise ValueError('research preview exceeds 900 frames')
            frame=np.frombuffer(b''.join(chunks),dtype=np.uint8).reshape(h,w,3)
            roi=frame[y1:y2,x1:x2].astype(np.int16)
            if prev is not None:
                change=float((np.max(np.abs(roi-prev),axis=2)>=pixel_delta).mean())
                fractions.append(change)
                current=(current+1) if change<fraction_cutoff else 0
                longest=max(longest,current)
            prev=roi
        proc.stdout.close()
        error=proc.stderr.read().decode('utf8','replace')
        if proc.wait()!=0:raise RuntimeError('ffmpeg decode failed: '+error[-400:])
    except BaseException:
        proc.kill();proc.wait();raise
    if count<2:raise ValueError('need at least 2 real frames')
    longest_sec=round(longest/fps,3)
    return {'schemaVersion':'ths-director-decoded-pixels-v2','origin':'independent-full-decode',
        'previewSha256':hashlib.sha256(p.read_bytes()).hexdigest(),
        'width':w,'height':h,'fps':fps,'decodedFrameCount':count,
        'roiPixels':[x1,y1,x2,y2],
        'changedFractionThreshold':fraction_cutoff,'pixelDeltaRGB':pixel_delta,
        'maxCaptionExcludedStaticSec':longest_sec,
        'medianChangedFraction':round(float(np.median(fractions)),5),
        'staticKill':longest_sec>6,'creativeVerdict':'HUMAN_REVIEW_REQUIRED',
        'note':'Change outside captions is a proxy, not proof of recognizable hero, narrative meaning or cinematic taste.'}

if __name__=='__main__':
    if len(sys.argv)!=2:raise SystemExit('Usage: python decoded-preview-audit.py PREVIEW.mp4')
    print(json.dumps(audit(sys.argv[1]),indent=2))
