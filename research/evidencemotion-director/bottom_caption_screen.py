#!/usr/bin/env python3
"""Lane 4 negative-only, exact-H264 full-frame bottom UI-caption ink screen.

This is an uncalibrated bright-ink screen of a fixed native 1080x1920 ROI.
It never verifies which words are shown, real platform UI, human readability,
science, voice, or publication. Never allow this module to approve a release.
"""
import hashlib
import json
import math
import re
import subprocess
from pathlib import Path
try:
    import numpy as np  # optional acceleration; hosted research CI uses portable fallback
except ImportError:
    np = None

CROP=(140,1576,800,160)    # actual pixels: start below 18% bottom UI baseline y=1574
BRIGHT_THRESHOLDS=(120,140,165,195)
MIN_BRIGHT_PIXELS=30

def source_sha(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
    return h.hexdigest()

def fail(reason):
    raise ValueError('BOTTOM_CAPTION_HOLD:'+reason)

def measure_bright_ink(rgb,*,threshold=140):
    """Pixel-accurate pale ink counter; works on raw RGB bytes without NumPy."""
    if type(threshold) is not int or not 0<=threshold<=255:
        fail('INVALID_BRIGHTNESS_THRESHOLD')
    if np is not None and isinstance(rgb,np.ndarray):
        if rgb.dtype!=np.uint8 or rgb.shape!=(160,800,3):
            fail('EXACT_PIXEL_CROP_REQUIRED')
        mn=rgb.min(axis=2);mx=rgb.max(axis=2)
        near_neutral=(mx.astype(np.int16)-mn.astype(np.int16))<=90
        mask=(mn>=threshold)&near_neutral
        count=int(mask.sum())
        if count:
            ys,xs=np.where(mask)
            bbox=[int(xs.min()+CROP[0]),int(ys.min()+CROP[1]),int(xs.max()+CROP[0]),int(ys.max()+CROP[1])]
        else:bbox=None
        return {'count':count,'nativeBBox':bbox,'flagged':count>=MIN_BRIGHT_PIXELS}
    if not isinstance(rgb,(bytes,bytearray,memoryview)) or len(rgb)!=160*800*3:
        fail('EXACT_PIXEL_CROP_REQUIRED')
    data=memoryview(rgb)
    count=0;minx=800;miny=160;maxx=-1;maxy=-1
    for y in range(160):
        row=y*800*3
        for x in range(800):
            k=row+x*3
            r,g,b=data[k],data[k+1],data[k+2]
            mn=min(r,g,b)
            if mn>=threshold and max(r,g,b)-mn<=90:
                count+=1
                minx=min(minx,x);maxx=max(maxx,x)
                miny=min(miny,y);maxy=max(maxy,y)
    bbox=[minx+CROP[0],miny+CROP[1],maxx+CROP[0],maxy+CROP[1]] if count else None
    return {'count':count,'nativeBBox':bbox,'flagged':count>=MIN_BRIGHT_PIXELS}

def check_frames(frame_observations,*,expected_frames,expected_movie_sha):
    if not isinstance(expected_frames,int) or isinstance(expected_frames,bool) or not 1<=expected_frames<=6000:
        fail('INVALID_FRAME_EXPECTATION')
    if not isinstance(expected_movie_sha,str) or re.fullmatch('[0-9a-f]{64}',expected_movie_sha) is None:
        fail('INVALID_SOURCE_HASH')
    if len(frame_observations)!=expected_frames or any(type(x.get('index')) is not int or x['index']!=i for i,x in enumerate(frame_observations)):
        fail('MISSING_DUPLICATED_OR_OUT_OF_ORDER_FRAMES')
    for record in frame_observations:
        if set(record.get('thresholds',{}))!={str(t) for t in BRIGHT_THRESHOLDS}:
            fail('THRESHOLD_SET_CHANGED')
        for value in record['thresholds'].values():
            if type(value) is not int or value<0 or value>CROP[2]*CROP[3]:
                fail('INVALID_PIXEL_COUNT')
    counts={str(t):sum(rec['thresholds'][str(t)]>=MIN_BRIGHT_PIXELS for rec in frame_observations) for t in BRIGHT_THRESHOLDS}
    return {'schema':'ths-lane4-physical-bottom-caption-screen-v1','filmSha256':expected_movie_sha,
        'framesPhysicallyDecodedAndScreened':expected_frames,'cropNative':{'x':CROP[0],'y':CROP[1],'width':CROP[2],'height':CROP[3]},
        'conservativeBottomUiStartY':1574,'frameCountsByInkThreshold':counts,
        'researchVerdict':'POTENTIAL_BOTTOM_UI_INK_COLLISION_HOLD' if any(counts.values()) else 'NEGATIVE_SCREEN_EMPTY_REVIEW_REQUIRED',
        'contentActuallyOCRVerified':False,'realPlatformUIOverlayVerified':False,'realHandsetApproved':False,'viewerComprehensionApproved':False,'scienceApproved':False,'mayPublish':False,
        'warning':'Uncalibrated pale-ink/near-neutral optical proxy only. Even empty screen is not a mobile-safe pass.'}

def run_movie(movie,sha,expected_frames):
    movie=Path(movie)
    if not movie.is_file() or source_sha(movie)!=sha:fail('EXACT_FILM_SHA_MISMATCH')
    try:
        raw=subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-count_frames',
            '-show_entries','stream=width,height,r_frame_rate,nb_read_frames','-of','json',str(movie)],stderr=subprocess.PIPE)
        probe=json.loads(raw)['streams'][0]
    except (subprocess.CalledProcessError,KeyError,IndexError,ValueError) as e:
        fail('FFPROBE_FAILED:'+str(e)[:100])
    if (probe.get('width'),probe.get('height'),probe.get('r_frame_rate'),probe.get('nb_read_frames'))!=(1080,1920,'30/1',str(expected_frames)):
        fail('NONMATCHING_NATIVE_GEOMETRY_OR_FRAMECOUNT')
    x,y,w,h=CROP
    proc=subprocess.Popen(['ffmpeg','-nostdin','-v','error','-xerror','-err_detect','explode','-i',str(movie),'-map','0:v:0',
         '-vf',f'crop={w}:{h}:{x}:{y}','-pix_fmt','rgb24','-f','rawvideo','-'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    observations=[];frame_bytes=w*h*3
    try:
        for i in range(expected_frames):
            b=proc.stdout.read(frame_bytes)
            if len(b)!=frame_bytes:fail('TRUNCATED_PHYSICAL_VIDEO_AT_FRAME:'+str(i))
            arr=np.frombuffer(b,dtype=np.uint8).reshape(h,w,3) if np is not None else b
            results={str(t):measure_bright_ink(arr,threshold=t)['count'] for t in BRIGHT_THRESHOLDS}
            observations.append({'index':i,'thresholds':results})
        if proc.stdout.read(1):fail('EXTRA_UNACCOUNTED_VIDEO_FRAMES')
        if proc.wait(timeout=20)!=0:fail('FFMPEG_DECODING_FAILED:'+proc.stderr.read().decode(errors='replace')[:160])
    finally:
        if proc.poll() is None:proc.kill()
        if proc.stdout:proc.stdout.close()
        if proc.stderr:proc.stderr.close()
    return check_frames(observations,expected_frames=expected_frames,expected_movie_sha=sha),observations

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('--movie',required=True);p.add_argument('--sha256',required=True)
    p.add_argument('--expected-frames',type=int,required=True);p.add_argument('--json',required=True);args=p.parse_args()
    receipt,frames=run_movie(args.movie,args.sha256,args.expected_frames)
    Path(args.json).write_text(json.dumps({'summary':receipt,'frames':frames},indent=2)+'\n')
    print(json.dumps(receipt,indent=2))