#!/usr/bin/env python3
"""Dense, source-pinned decoded-H264 visual rhythm screen (research-only).

Independent METHOD from sparse 2-second edge-similarity critic, not a substitute
for science review, phoneme truth, device testing or artistic acceptance.
"""
from __future__ import annotations
from hashlib import sha256
from pathlib import Path
import argparse,json,statistics,subprocess
from PIL import Image,ImageChops,ImageStat

W,H,FPS=120,214,30
HERO_BOX=(10,45,100,130)
INTENTIONAL_HOLD_BEATS={'source_card_821_937'}
BEATS={
 'intro_0_104':(0,104),
 'chemistry_105_325':(105,325),
 'record_326_497':(326,497),
 'scene4_2d_498_554':(498,554),
 'scene4_3d_555_701':(555,701),
 'shot5_702_820':(702,820),
 'source_card_821_937':(821,937),
 'outro_938_1030':(938,1030),
}
class Hold(ValueError):pass

def digest(path):
    h=sha256()
    with Path(path).open('rb') as f:
        for b in iter(lambda:f.read(1<<20),b''):h.update(b)
    return h.hexdigest()

def frame_delta(a:Image.Image,b:Image.Image,box=None):
    if box is not None:
        a=a.crop(box);b=b.crop(box)
    return ImageStat.Stat(ImageChops.difference(a,b)).mean[0]

def process_frames(frames:list[Image.Image],start=0,box=None):
    if any(f.size!=(W,H) or f.mode!='L' for f in frames):raise Hold('WRONG_GRAYSCALE_FRAME_GEOMETRY')
    if box is not None and (len(box)!=4 or not 0<=box[0]<box[2]<=W or not 0<=box[1]<box[3]<=H):
        raise Hold('INVALID_SUBJECT_ROI')
    return [(start+i,round(frame_delta(frames[i-1],frames[i],box),6)) for i in range(1,len(frames))]

def decode_stream(path,expected_sha):
    if digest(path)!=expected_sha:raise Hold('PINNED_FILM_BYTES_MISMATCH')
    cmd=['ffmpeg','-nostdin','-v','error','-xerror','-err_detect','explode','-i',str(path),'-map','0:v:0',
         '-an','-vf',f'scale={W}:{H},format=gray','-vsync','0','-f','rawvideo','-pix_fmt','gray','-']
    proc=subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if proc.stdout is None:raise Hold('DECODE_NOT_STARTED')
    prior=None;deltas=[];hero_deltas=[];count=0;size=W*H
    try:
        while True:
            block=proc.stdout.read(size)
            if not block:break
            if len(block)!=size:raise Hold('TRUNCATED_DECODED_FRAME')
            frame=Image.frombytes('L',(W,H),block)
            if prior is not None:
                deltas.append((count,round(frame_delta(prior,frame),6)))
                hero_deltas.append((count,round(frame_delta(prior,frame,HERO_BOX),6)))
            prior=frame;count+=1
            if count>1031:raise Hold('EXTRA_FILM_FRAMES')
        err=proc.stderr.read().decode('utf-8','replace')[-600:]
        if proc.wait()!=0:raise Hold('FFMPEG_STRICT_DECODE_ERROR: '+err)
    except BaseException:
        proc.kill();proc.wait();raise
    if count!=1031:raise Hold('WRONG_NUMBER_OF_DECODED_FRAMES')
    if digest(path)!=expected_sha:raise Hold('FILM_MUTATED_DURING_DECODE')
    return deltas,hero_deltas

def summarize(deltas,start,end,threshold=.12):
    # First frame of each beat is a cut, NOT within-beat motion.
    nums=[value for idx,value in deltas if start<idx<=end]
    if not nums:raise Hold('EMPTY_BEAT_WINDOW')
    median=statistics.median(nums)
    fraction=sum(d<threshold for d in nums)/len(nums)
    return {'startFrame':start,'endFrameInclusive':end,
        'startSeconds':round(start/FPS,3),'endSeconds':round((end+1)/FPS,3),
        'pairwiseFrames':len(nums),'meanGrayDelta255':round(statistics.mean(nums),6),
        'medianGrayDelta255':round(median,6),
        'p90GrayDelta255':round(sorted(nums)[min(len(nums)-1,int(.9*len(nums)))],6),
        'lowMotionFractionThreshold0p12':round(fraction,5),
        'staticCompositionReviewCandidate':((end-start)>=90 and fraction>.9 and median<.12)}

def review(actual,expected_sha,source=None,source_sha=None):
    if bool(source)!=bool(source_sha):raise Hold('SOURCE_NEEDS_SHA_PIN')
    whole,hero=decode_stream(actual,expected_sha)
    beats={k:summarize(whole,a,b) for k,(a,b) in BEATS.items()}
    for k,(a,b) in BEATS.items():
        h=summarize(hero,a,b)
        beats[k]['scienceHeroRoi']=list(HERO_BOX)
        beats[k]['heroMedianGrayDelta255']=h['medianGrayDelta255']
        beats[k]['heroLowMotionFractionThreshold0p12']=h['lowMotionFractionThreshold0p12']
        beats[k]['longHoldIsPossiblyIntentional']=k in INTENTIONAL_HOLD_BEATS
        beats[k]['visualStasisReviewCandidate']=h['staticCompositionReviewCandidate'] or beats[k]['staticCompositionReviewCandidate']
    out={'schema':'ths-em-lane3-physical-visual-motion-research-v2','exactFilmSha256':expected_sha,
      'sourceFilmSha256':source_sha,'decodedFrames':1031,'fps':FPS,
      'method':f'FFmpeg strict sequential gray {W}x{H} frame and central science-area ROI; negative heuristic only',
      'perBeat':beats,'holdReasons':[],'machineReviewed':True,'externalIndependentReviewed':False,
      'physicalPhoneReviewed':False,'excellentFirstRenderApproved':False,'mayPublish':False,
      'atomicCreditAwarded':0}
    if source:
        old,old_hero=decode_stream(source,source_sha)
        out['sourceComparison']={k:{
          'priorMedianGrayDelta255':summarize(old,a,b)['medianGrayDelta255'],
          'currentMedianGrayDelta255':beats[k]['medianGrayDelta255'],
          'priorHeroMedianGrayDelta255':summarize(old_hero,a,b)['medianGrayDelta255'],
          'currentHeroMedianGrayDelta255':beats[k]['heroMedianGrayDelta255']}
          for k,(a,b) in BEATS.items()}
    for k,v in beats.items():
        if v['visualStasisReviewCandidate']:
            kind=('POSSIBLY_INTENTIONAL_SOURCE_CARD_READING_HOLD' if k in INTENTIONAL_HOLD_BEATS
                else 'LONG_LOW_MOTION_SEQUENCE_NEEDS_CRAFT_REVIEW')
            out['holdReasons'].append({'beat':k,'kind':kind,'startFrame':v['startFrame'],
                'endFrameInclusive':v['endFrameInclusive'],
                'notes':'Research screen only; source cards and purposefully held narration may need no animation'})
    out['reviewPriority']=[x['beat'] for x in out['holdReasons']
          if x['kind']=='LONG_LOW_MOTION_SEQUENCE_NEEDS_CRAFT_REVIEW']
    out['requiresHumanToDiagnoseRoutineVisualDefect']=False
    return out

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--film',type=Path,required=True);p.add_argument('--sha256',required=True)
    p.add_argument('--source-film',type=Path);p.add_argument('--source-sha256')
    p.add_argument('--out',type=Path,required=True)
    a=p.parse_args()
    if a.out.exists() or a.out.resolve() in (a.film.resolve(),a.source_film.resolve() if a.source_film else ''):
        raise Hold('REPORT_OUTPUT_MUST_BE_NEW_AND_DISTINCT')
    result=review(a.film,a.sha256,a.source_film,a.source_sha256)
    a.out.write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
    print(json.dumps({'film':result['exactFilmSha256'],'flags':result['holdReasons'],'publish':False}))
if __name__=='__main__':main()
