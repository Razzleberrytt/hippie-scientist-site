#!/usr/bin/env python3
"""Lane4 research-only real encoded phone-caption variant reviewer.

Fails closed on wrong source SHA, non-30fps portrait streams, incomplete frames or
caption timeline; full H264 RGB data is decoded for each candidate. Does NOT
provide OCR, platform UI, native phone, sound/medical truth, or publish approval.
320px optical model; 14px is an experimental NEGATIVE screen only.
"""
import argparse,hashlib,json,math,re,subprocess
from pathlib import Path
try: import numpy as np
except ImportError: np=None
W,H=270,48; X,Y=25,466; FULL=320; T=195; MIN_PIXELS=8; FLOOR=14

def fail(msg):raise ValueError('LANE4_CAPTION_REVIEW_HOLD:'+msg)
def sha(p):
    h=hashlib.sha256()
    with open(p,'rb') as f:
        for b in iter(lambda:f.read(1<<20),b''):h.update(b)
    return h.hexdigest()

def to_s(stamp):
    m=re.fullmatch(r'(\d\d):(\d\d):(\d\d),(\d{3})',stamp)
    if not m:fail('INVALID_SRT_TIMESTAMP')
    h,mi,s,ms=map(int,m.groups())
    if mi>59 or s>59:fail('INVALID_SRT_TIMESTAMP')
    return h*3600+mi*60+s+ms/1000

def parse_srt(raw):
    if not isinstance(raw,bytes):fail('SRT_BYTES_REQUIRED')
    try: s=raw.decode('utf-8-sig').replace('\r\n','\n').strip()
    except UnicodeDecodeError:fail('INVALID_SRT_ENCODING')
    blocks=re.split(r'\n\s*\n',s);cues=[]
    for expected,bl in enumerate(blocks,1):
        lines=bl.splitlines()
        if len(lines)<3 or lines[0]!=str(expected) or ' --> ' not in lines[1]:fail('SRT_SEQUENCE_OR_TEXT_REQUIRED')
        left,right=lines[1].split(' --> ')
        a,b=to_s(left),to_s(right)
        if not 0<=a<b<=120 or (cues and a<cues[-1]['end']):fail('SRT_TIMING_OR_OVERLAP')
        text=' '.join(lines[2:]).strip()
        if not text:fail('SRT_WORDS_REQUIRED')
        cues.append({'cue':expected,'start':a,'end':b,'text':text})
    return cues

def full_video_probe(video,n):
    if type(n) is not int or not 1<=n<=10000:fail('INVALID_FRAMES')
    try:
        p=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-count_frames','-show_entries','stream=width,height,r_frame_rate,nb_read_frames','-of','json',str(video)],stderr=subprocess.PIPE))['streams'][0]
    except (subprocess.CalledProcessError,KeyError,IndexError,ValueError):fail('FFPROBE_ERROR')
    if (p.get('width'),p.get('height'),p.get('r_frame_rate'),p.get('nb_read_frames'))!=(1080,1920,'30/1',str(n)):
        fail('INCORRECT_PORTRAIT_ENCODE_OR_FRAMECOUNT')

def row_stats(b):
    if len(b)!=W*H*3:fail('TRUNCATED_RGB_FRAME')
    if np is not None:
        a=np.frombuffer(b,dtype=np.uint8).reshape(H,W,3)
        mn=a.min(axis=2).astype(np.int16);mx=a.max(axis=2).astype(np.int16)
        counts=((mn>=T)&((mx-mn)<=90)).sum(axis=1).tolist()
    else:
        counts=[];buf=memoryview(b)
        for y in range(H):
            n=0
            for x in range(W):
                k=(y*W+x)*3;r,g,bb=buf[k],buf[k+1],buf[k+2]
                if min(r,g,bb)>=T and max(r,g,bb)-min(r,g,bb)<=90:n+=1
            counts.append(n)
    ys=[i for i,c in enumerate(counts) if c>=2]
    runs=[]
    for y in ys:
        if not runs or y!=runs[-1][-1]+1:runs.append([y])
        else:runs[-1].append(y)
    return {'brightPixels':int(sum(counts)),'largestInkLinePx320':max((len(r) for r in runs if len(r)>=3),default=0),
            'inkEnvelopeY320':([min(ys)+Y,max(ys)+Y] if ys else None)}

def frame_pts_exact(video,n):
    """Use the encoded film's decoded presentation times, not frame index guesses."""
    try:
        raw=subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0',
            '-show_frames','-show_entries','frame=best_effort_timestamp_time',
            '-of','json',str(video)],stderr=subprocess.PIPE,timeout=60)
        frames=json.loads(raw)['frames']
        pts=[float(fr['best_effort_timestamp_time']) for fr in frames]
    except (subprocess.CalledProcessError,subprocess.TimeoutExpired,KeyError,ValueError,TypeError,IndexError):
        fail('ACTUAL_PRESENTATION_TIMESTAMPS_UNAVAILABLE')
    if len(pts)!=n or any(not math.isfinite(t) or t<0 or
            (i>0 and t<=pts[i-1]) or abs(t-i/30)>0.002
            for i,t in enumerate(pts)):
        fail('ACTUAL_PRESENTATION_TIMESTAMPS_NOT_ZERO_ORIGIN_CFR30')
    return pts

def physically_decode(video,expected_hash,n):
    if not re.fullmatch(r'[0-9a-f]{64}',str(expected_hash)) or sha(video)!=expected_hash:fail('EXACT_VIDEO_SHA_MISMATCH')
    full_video_probe(video,n)
    actual_pts=frame_pts_exact(video,n)
    cmd=['ffmpeg','-nostdin','-v','error','-xerror','-err_detect','explode','-i',str(video),'-map','0:v:0','-vf',f'scale=320:568:flags=bicubic,crop={W}:{H}:{X}:{Y}','-pix_fmt','rgb24','-f','rawvideo','-']
    p=subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    stats=[];z=W*H*3
    try:
        for i in range(n):
            b=p.stdout.read(z)
            if len(b)!=z:fail('MISSING_ACTUAL_FRAME_'+str(i))
            stats.append({'index':i,'pts':actual_pts[i],**row_stats(b)})
        if p.stdout.read(1):fail('EXTRA_DECODED_VIDEO_FRAME')
        if p.wait(timeout=20):fail('FULL_DECODE_FAILED_'+p.stderr.read().decode(errors='replace')[:120])
    finally:
        if p.poll() is None:p.kill();p.wait()
        p.stdout.close();p.stderr.close()
    return stats

def analyze(stats,cues,n,filmhash):
    if len(stats)!=n or any(not isinstance(x,dict) or type(x.get('index')) is not int or x['index']!=i or type(x.get('brightPixels')) is not int or not 0<=x['brightPixels']<=W*H or type(x.get('largestInkLinePx320')) is not int or not 0<=x['largestInkLinePx320']<=H or type(x.get('pts')) not in (float,int) or not math.isfinite(x['pts']) or abs(x['pts']-i/30)>0.002 for i,x in enumerate(stats)):
        fail('INVALID_FRAME_SEQUENCE_OR_ANNOTATION')
    owned=set();reports=[]
    for cue in cues:
        frame_ids=[i for i,x in enumerate(stats) if cue['start']<=x['pts']<cue['end']]
        if not frame_ids:fail('CUE_WITHOUT_PRESENTED_FRAME')
        if any(i in owned for i in frame_ids):fail('DUPLICATE_FRAME_CUE_OWNERSHIP')
        owned.update(frame_ids)
        observed=[stats[i] for i in frame_ids]
        envelopes=[x['inkEnvelopeY320'] for x in observed if x.get('inkEnvelopeY320') is not None]
        reports.append({'cue':cue['cue'],'text':cue['text'],'firstFrame':frame_ids[0],'lastFrame':frame_ids[-1],
          'inCueFrames':len(frame_ids),'framesWithBottomUIInk':sum(x['brightPixels']>=MIN_PIXELS for x in observed),
          'framesBelowProvisional14px':sum(x['largestInkLinePx320']<FLOOR for x in observed),
          'minTallestLinePx320':min(x['largestInkLinePx320'] for x in observed),
          'maxTallestLinePx320':max(x['largestInkLinePx320'] for x in observed),
          'minTopY320':min((r[0] for r in envelopes),default=None),
          'maxBottomY320':max((r[1] for r in envelopes),default=None),
          'noDetectedCaptionInk':not bool(envelopes)})
    off=[x for i,x in enumerate(stats) if i not in owned]
    return {'filmSha256':filmhash,'decodedFrames':n,'cues':len(cues),'inCueFrames':len(owned),
       'offCueFrames':len(off),'offCueBrightInkFrames':sum(x['brightPixels']>=MIN_PIXELS for x in off),
       'allCueBottomUIInkFrames':sum(x['framesWithBottomUIInk'] for x in reports),
       'allCueBelow14Frames':sum(x['framesBelowProvisional14px'] for x in reports),
       'cuesWithoutDetectedInk':[x['cue'] for x in reports if x['noDetectedCaptionInk']],
       'perCue':reports,'mayPublish':False,
       'actualNativePhoneVerified':False,'actualAppControlsVerified':False,'lexicalOCRVerified':False,
       'review':'DECODED_RGB_BOTTOM_SCREEN_ONLY_RELEASE_HOLD'}

def compare(before,after,cues,expected_n,before_hash,after_hash):
    if before_hash==after_hash:fail('NONDISTINCT_FILM_IDENTITIES')
    if len(cues)!=19:fail('NINETEEN_SOURCE_CUES_REQUIRED')
    b=analyze(before,cues,expected_n,before_hash);a=analyze(after,cues,expected_n,after_hash)
    changed=[]
    for p,q in zip(b['perCue'],a['perCue']):
        if p['cue']!=q['cue'] or p['text']!=q['text']:fail('SRT_CUE_REARRANGED')
        if p['minTallestLinePx320']!=q['minTallestLinePx320'] or p['framesBelowProvisional14px']!=q['framesBelowProvisional14px']:
            changed.append(q['cue'])
    return {'schema':'ths-lane4-independent-actual-h264-caption-counterfactual-v1','before':b,'after':a,
      'changedMeasuredCues':changed,'bodyAndSourceTextVerified':False,
      'allFrameMobileSafeApproved':False,'realPhonePlaybackApproved':False,'qualifiedScienceApproved':False,
      'mayPublish':False,'verdict':'NO_DETECTED_CAPTION_INK_RELEASE_HOLD' if a['cuesWithoutDetectedInk'] else 'BIGGER_CAPTIONS_DO_NOT_CLOSE_BOTTOM_UI_OR_WHOLE_FILM_READABILITY' if a['allCueBottomUIInkFrames'] or a['allCueBelow14Frames'] else 'NEGATIVE_SCREENS_EMPTY_EXTERNAL_QA_STILL_REQUIRED'}

def main():
    p=argparse.ArgumentParser();p.add_argument('--before',required=True);p.add_argument('--after',required=True);p.add_argument('--srt',required=True)
    p.add_argument('--before-sha',required=True);p.add_argument('--after-sha',required=True);p.add_argument('--frames',type=int,required=True);p.add_argument('--out',required=True)
    x=p.parse_args();raw=Path(x.srt).read_bytes();c=parse_srt(raw)
    b=physically_decode(x.before,x.before_sha,x.frames);a=physically_decode(x.after,x.after_sha,x.frames)
    z=compare(b,a,c,x.frames,x.before_sha,x.after_sha)
    z['sourceSrtSha256']=hashlib.sha256(raw).hexdigest();z['opticalSettings']={'refWidth':320,'refHeight':568,'crop':[X,Y,W,H], 'minRgbChannel':T,'maxChannelSpread':90,'minBrightPixels':MIN_PIXELS,'provisionalFontInkFloorPx':FLOOR}
    Path(x.out).write_text(json.dumps(z,indent=2)+'\n');print(json.dumps({'before':{k:z['before'][k] for k in ['allCueBottomUIInkFrames','allCueBelow14Frames']},'after':{k:z['after'][k] for k in ['allCueBottomUIInkFrames','allCueBelow14Frames']},'changedMeasuredCues':z['changedMeasuredCues'],'verdict':z['verdict']},indent=2))
if __name__=='__main__':main()