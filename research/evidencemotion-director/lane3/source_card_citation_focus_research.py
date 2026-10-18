#!/usr/bin/env python3
"""Bounded research-only citation-line focus for the verified 7-OH source hold.

No new words/claims, no narrator edits and no scientific pixels fabricated.
Strict input film SHA is part of its identity; not a production/publish gate.
"""
from __future__ import annotations
import argparse,hashlib,json,subprocess
from pathlib import Path
from PIL import Image,ImageDraw

SOURCE_SHA='1e336488d39c7e070b7edefbad9e3fead26c4ad9cd86e1e487e717113ca5e8a0'
FRAME_START,FRAME_END=821,937
WIDTH,HEIGHT,FPS=1080,1920,30
# Source-label ink starts x>=62 in the actual decoded native frame.
# Keep all added motion in the EMPTY left gutter x<=58 to prevent text overlap.
SOURCE_GUTTER_MAX_X=58
CITES=((821,849,730),(849,879,909),(879,909,1037),(909,938,1140))
NO_RELEASE={'mayPublish':False,'externalIndependentReviewed':False,
    'physicalPhoneReviewed':False,'excellentFirstRenderApproved':False,
    'newAcceptedAtomicCards':0}
class ResearchHold(ValueError): pass

def sha256(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda:f.read(1<<20),b''):h.update(chunk)
    return h.hexdigest()

def smooth(t):
    t=max(0.,min(1.,t));return t*t*(3-2*t)

def overlay(frame):
    if not FRAME_START<=frame<=FRAME_END:raise ResearchHold('FRAME_OUTSIDE_RESEARCH_HOLD')
    im=Image.new('RGBA',(WIDTH,HEIGHT),(0,0,0,0))
    drawer=ImageDraw.Draw(im)
    fade_in=smooth((frame-FRAME_START)/8)
    fade_out=smooth((FRAME_END-frame)/8)
    alpha=fade_in*fade_out
    if alpha<=0:return im
    # Research rejection: underlining citation lines crossed actual source ink.
    # All additive visual strokes now stay in a 58px maximum left gutter.
    drawer.rounded_rectangle((41,713,43,1160),radius=1,
        fill=(61,176,170,round(255*.19*alpha)))
    stage=0
    for i,(start,end,anchor) in enumerate(CITES):
        if frame>=start:stage=i
    start,_,end_anchor=CITES[stage]
    if stage==0:
        center=end_anchor
    else:
        previous=CITES[stage-1][2]
        center=round(previous+(end_anchor-previous)*smooth((frame-start)/12))
    drawer.rounded_rectangle((46,center-20,57,center+20),radius=5,
        fill=(80,215,200,round(255*.83*alpha)))
    return im

def make_overlays(directory):
    directory=Path(directory)
    if directory.exists():raise ResearchHold('FRESH_OVERLAY_DIRECTORY_REQUIRED')
    directory.mkdir(parents=True)
    for frame in range(FRAME_START,FRAME_END+1):
        overlay(frame).save(directory/f'overlay_{frame:04d}.png',optimize=True)
    return directory

def run(command):
    r=subprocess.run(command,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if r.returncode:raise ResearchHold('COMMAND_FAILED '+r.stderr[-700:].decode(errors='replace'))
    return r.stdout

def verify_video(path):
    data=json.loads(run(['ffprobe','-v','error','-select_streams','v:0',
        '-count_frames','-show_entries','stream=codec_name,width,height,avg_frame_rate,nb_read_frames',
        '-of','json',str(path)]))
    s=data['streams'][0]
    if (s.get('codec_name'),s.get('width'),s.get('height'),s.get('avg_frame_rate'),int(s.get('nb_read_frames',0)))!=('h264',WIDTH,HEIGHT,'30/1',1031):
        raise ResearchHold('SOURCE_VIDEO_NATIVE_GRID_MISMATCH')

def render(source,destination,work):
    source=Path(source);destination=Path(destination);work=Path(work)
    if not source.is_file() or source.is_symlink() or sha256(source)!=SOURCE_SHA:
        raise ResearchHold('CURRENT_FILM_SHA_MISMATCH')
    if destination.exists() or destination.resolve()==source.resolve() or work.exists() or work.is_symlink():
        raise ResearchHold('FRESH_DESTINATION_AND_WORK_REQUIRED')
    verify_video(source)
    make_overlays(work)
    # PNG samples start at t0; pin PNG times to ORIGINAL 821/30 sec timeline.
    # eof_action=pass makes the original video untouched outside 821..937.
    filter_complex=(f'[1:v]setpts=PTS+{FRAME_START}/({FPS}*TB),format=rgba[cues];'
        f"[0:v][cues]overlay=shortest=0:eof_action=pass:format=yuv420:enable='between(n,{FRAME_START},{FRAME_END})',format=yuv420p[out]")
    run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-xerror','-n',
       '-i',str(source),'-framerate','30','-start_number',str(FRAME_START),'-i',str(work/'overlay_%04d.png'),
       '-filter_complex',filter_complex,'-map','[out]','-map','0:a:0',
       '-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',
       '-fps_mode:v','cfr','-r','30','-frames:v','1031','-video_track_timescale','15360',
       '-c:a','copy','-movflags','+faststart',str(destination)])
    verify_video(destination)
    run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-xerror','-err_detect','explode',
          '-i',str(destination),'-map','0:v:0','-map','0:a:0','-f','null','-'])
    if sha256(source)!=SOURCE_SHA:raise ResearchHold('SOURCE_CHANGED_DURING_RENDER')
    return {'sourceFilmSHA256':SOURCE_SHA,'candidateFilmSHA256':sha256(destination),
       'focusFrameRangeInclusive':[FRAME_START,FRAME_END],
       'sourceCardTextAndNarrationIntentionallyUnchanged':True,
       'actualAACComparisonNeedsIndependentDecoder':True,**NO_RELEASE}

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--source',required=True);p.add_argument('--out',required=True);p.add_argument('--work',required=True)
    a=p.parse_args();print(json.dumps(render(a.source,a.out,a.work),indent=2))
