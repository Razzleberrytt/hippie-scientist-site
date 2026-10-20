#!/usr/bin/env python3
"""Research-only actual-frame check: a science negation must not precede spoken 'not'.

Checks exactly pinned 1080x1920 30fps 1031-frame candidate. Visual thresholds
verify a specific bright-text render band and a model-stage onset; this does
NOT read letters or prove the caption's semantic content. No publishing rights.
"""
from __future__ import annotations
import argparse, hashlib, json, subprocess
from pathlib import Path

FILM_SHA = '53bf75bfcd9752917f7f666afdb86fda493b78ecdc3c94e005a62da70ef39642'
STORY_SHA = '2d0552ea3473e653b79cebe7def88c36c518d7b78364fb45b2a2e93e93c18aa2'
SOURCE_FILM_SHA = '2851c9ce6bbac6c5bd396c28cb4ab3c59caf5a4f5baaa1ffddc77f05bfd6988a'
ORIGINAL_WAV_SHA = '9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435'
CUES = {'scienceStart':498, 'firstComputed':555, 'firstNegation':595, 'scienceEnd':702}
DIMS = (1080,1920)
FRAME_COUNT = 1031
# Manually bounded on authentic native H264: overlay y1165:1225, x80:900,
# calculated-model stage y685:960, x507:995. Intro/captions are excluded.
DISCLOSURE = (80,1165,900,1225)
MODEL = (507,685,995,960)
CHANNEL_BRIGHT = 185
MAX_PREMATURE_DISCLOSURE = 50  # encoded compression/film noise tolerance
MIN_POST_DISCLAIMER = 1100
MAX_PREMATURE_MODEL = 70
MIN_POST_MODEL = 180

class VisualHold(ValueError): pass

def digest(path):
    sha=hashlib.sha256()
    with open(path,'rb') as f:
        for part in iter(lambda:f.read(1024*1024),b''):sha.update(part)
    return sha.hexdigest()

def pinned(film, story, receipt):
    if digest(film)!=FILM_SHA or digest(story)!=STORY_SHA:
        raise VisualHold('PINNED_SOURCE_OR_FILM_SHA_MISMATCH')
    s=json.loads(Path(story).read_text())
    r=json.loads(Path(receipt).read_text())
    if s.get('sourceWavSha256')!=ORIGINAL_WAV_SHA or s.get('encodedH264Sha256')!=SOURCE_FILM_SHA:
        raise VisualHold('ORIGINAL_SCIENCE_OR_NARRATION_SOURCE_MISMATCH')
    required={'filmSha256':FILM_SHA,'originalFilmSha256':SOURCE_FILM_SHA,'originalStorySha256':STORY_SHA,
              'originalNarrationWavSha256':ORIGINAL_WAV_SHA,'changedFrames':204,
              'spokenCueFirstComputedFrame':555,'spokenCueFirstNotFilmedFrame':595,'mayPublish':False,
              'excellentCertified':False}
    if any(type(r.get(k)) is not type(v) or r.get(k)!=v for k,v in required.items()):
        raise VisualHold('UNTRUSTED_DERIVATIVE_RECEIPT')
    if r.get('originalAacAdtsSha256')!=r.get('outputAacAdtsSha256'):
        raise VisualHold('NARRATION_AAC_DIGEST_DIFFERS')
    if s.get('mayPublish') is not False or len(s.get('shots',[]))!=9:
        raise VisualHold('INVALID_NINE_SHOT_REVIEW_STATE')
    shots=s['shots']
    if shots[4].get('shot')!='sentence_4': raise VisualHold('WRONG_SCIENTIFIC_SCENE')
    return r

def metadata(film):
    try:
        raw=subprocess.check_output(['ffprobe','-v','error','-show_entries',
          'stream=codec_name,width,height,r_frame_rate,nb_frames','-select_streams','v:0',
          '-of','json',str(film)],timeout=30)
        vs=json.loads(raw)['streams']
    except (OSError,subprocess.CalledProcessError,ValueError,KeyError) as e:
        raise VisualHold('INVALID_FILM_METADATA') from e
    if len(vs)!=1:raise VisualHold('VIDEO_STREAM_COUNT_MISMATCH')
    v=vs[0]
    if (v.get('codec_name'),v.get('width'),v.get('height'),v.get('r_frame_rate'),
        str(v.get('nb_frames')))!=('h264',1080,1920,'30/1',str(FRAME_COUNT)):
        raise VisualHold('WRONG_NATIVE_VIDEO_GRID')

def bright_count(frame, region):
    x1,y1,x2,y2=region
    crop=frame[y1:y2,x1:x2]
    if crop.shape!=(y2-y1,x2-x1,3):raise VisualHold('NATIVE_FRAME_GEOMETRY_INVALID')
    return int((crop.max(axis=2)>CHANNEL_BRIGHT).sum())

def decide_observations(observations):
    """Deterministic negative control over independently obtained actual frames."""
    if set(observations)!={498,554,555,566,594,595,660,701}:
        raise VisualHold('CUE_FRAME_EVIDENCE_INCOMPLETE')
    problems=[]
    for n in (498,554,555,566,594):
        if observations[n]['disclosureBrightPixels']>MAX_PREMATURE_DISCLOSURE:
            problems.append(f'PREMATURE_NEGATION_CANDIDATE_FRAME_{n}')
    for n in (498,554):
        if observations[n]['modelBrightPixels']>MAX_PREMATURE_MODEL:
            problems.append(f'PREMATURE_CALCULATED_STAGE_FRAME_{n}')
    for n in (566,594,595,660,701):
        if observations[n]['modelBrightPixels']<MIN_POST_MODEL:
            problems.append(f'MISSING_COMPUTED_STAGE_FRAME_{n}')
    for n in (595,660,701):
        if observations[n]['disclosureBrightPixels']<MIN_POST_DISCLAIMER:
            problems.append(f'MISSING_DISCLOSURE_RENDER_FRAME_{n}')
    return problems

def audit(film,story,receipt):
    import cv2
    film,story,receipt=map(Path,(film,story,receipt))
    pinned(film,story,receipt)
    metadata(film)
    cap=cv2.VideoCapture(str(film))
    if not cap.isOpened():raise VisualHold('FILM_DECODER_OPEN_FAILED')
    wanted={498,554,555,566,594,595,660,701};observations={}
    count=0
    try:
        while True:
            ok,frame=cap.read()
            if not ok:break
            if count in wanted:
                if frame.shape!=(1920,1080,3):raise VisualHold('NATIVE_FRAME_GEOMETRY_INVALID')
                observations[count]={'disclosureBrightPixels':bright_count(frame,DISCLOSURE),
                                     'modelBrightPixels':bright_count(frame,MODEL)}
            count+=1
    finally:cap.release()
    if count!=FRAME_COUNT:raise VisualHold('ACTUAL_DECODE_FRAME_COUNT_MISMATCH')
    problems=decide_observations(observations)
    return {'schema':'ths-lane3-native-negation-timing-negative-screen-v1',
      'filmSha256':FILM_SHA,'storySha256':STORY_SHA,'fullFilmFramesDecoded':count,
      'cueFrames':CUES,'regions':{'brightDisclosure':DISCLOSURE,'calculatedStage':MODEL},
      'measuredFrames':observations,'issues':problems,
      'status':'VISUAL_CUE_NEGATIVE_SCREEN_HOLD' if problems else 'NO_SPECIFIED_VISUAL_CUE_FAILURE_DETECTED',
      'testLimit':'Pixel bright threshold is not OCR, semantic reading, acoustic perception, scientific approval or art acceptance.',
      'scienceApproved':False,'originalWavHumanAuditionApproved':False,'realPhoneApproved':False,
      'excellentCertified':False,'mayPublish':False}

if __name__=='__main__':
    a=argparse.ArgumentParser()
    a.add_argument('--film',required=True);a.add_argument('--story',required=True);a.add_argument('--receipt',required=True);a.add_argument('--out')
    x=a.parse_args()
    try:r=audit(x.film,x.story,x.receipt)
    except (VisualHold,OSError,ValueError) as e:
        r={'status':'HOLD','error':str(e),'mayPublish':False};code=3
    else:code=3 if r['issues'] else 0
    if x.out:Path(x.out).write_text(json.dumps(r,indent=2)+'\n')
    else:print(json.dumps(r,indent=2))
    raise SystemExit(code)
