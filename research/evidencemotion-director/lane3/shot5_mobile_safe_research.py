#!/usr/bin/env python3
"""Opt-in Shot5 7-OH phone-safe card research. Never a production approval.

Whole-film audio is copied unchanged, no narration/video speed adjustment.
Original molecule pixels are copied 1:1 from the source H264 frame.
"""
from __future__ import annotations
import argparse,hashlib,json,subprocess
from io import BytesIO
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont

SOURCE_SHA='53cbd9c4d35df96602280d713f6d2f2a1e2ba1bb57a3ec6af593c09d3e83f496'
FONT_SHA='a4c5bc453ca281d90ea079e596da7ae0dfeb5777497c29ec254e76d97ff6f890'
AUDIO_SHA='f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98'
SIZE=(1080,1920);FIRST,LAST,STILL=773,820,795
SAFE_RIGHT_START=864;PATCH=(45,412,1035,1070);CARD=(58,433,851,1049)
SOURCE_MOL=(105,637,558,934);MOL_DEST=(106,620)
class Shot5Hold(ValueError):pass

def digest(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda:f.read(1<<20),b''):h.update(chunk)
    return h.hexdigest()

def shell(cmd):
    r=subprocess.run(cmd,capture_output=True)
    if r.returncode:raise Shot5Hold('FFMPEG_REPLAY_FAILED: '+r.stderr.decode(errors='replace')[-350:])
    return r.stdout

def source_frame(source):
    png=shell(['ffmpeg','-nostdin','-v','error','-xerror','-i',str(source),
       '-map','0:v:0','-vf',f'select=eq(n\\,{STILL})',
       '-vsync','0','-frames:v','1','-f','image2pipe','-vcodec','png','-'])
    image=Image.open(BytesIO(png)).convert('RGB')
    if image.size!=SIZE:raise Shot5Hold('NON_NATIVE_FRAME')
    return image

def draw_overlay(im,font):
    if im.size!=SIZE:raise Shot5Hold('NON_NATIVE_FRAME')
    pixels=np.asarray(im).copy()
    x0,y0,x1,y1=PATCH
    # Smooth source background, derived from preserved original film margins.
    left=pixels[y0:y1,20:35,:].mean(axis=1)
    right=pixels[y0:y1,1042:1059,:].mean(axis=1)
    fraction=np.linspace(0,1,x1-x0)[None,:,None]
    pixels[y0:y1,x0:x1,:]=(left[:,None,:]*(1-fraction)+right[:,None,:]*fraction).astype('uint8')
    art=Image.fromarray(pixels,'RGB')
    pen=ImageDraw.Draw(art)
    pen.rounded_rectangle(CARD,radius=22,fill=(9,33,47),outline=(55,142,151),width=4)
    pen.rectangle((74,463,837,469),fill=(87,220,197))
    pen.text((90,491),'STRUCTURE',font=ImageFont.truetype(str(font),43),fill=(87,220,197))
    art.paste(im.crop(SOURCE_MOL),MOL_DEST)
    pen=ImageDraw.Draw(art)
    pen.line((595,565,595,982),fill=(55,142,151),width=4)
    for word,xy,size,col in (
        ('?',(679,620),134,(255,188,126)),
        ('NOT',(642,805),47,(239,247,240)),
        ('SHOWN',(620,871),43,(239,247,240))):
        pen.text(xy,word,font=ImageFont.truetype(str(font),size),fill=col)
    overlay=art.convert('RGBA')
    opacity=Image.new('L',SIZE,0);opacity.paste(255,PATCH)
    overlay.putalpha(opacity)
    return overlay

def replay(source,font,overlay_out,film_out):
    source,font,overlay_out,film_out=map(Path,(source,font,overlay_out,film_out))
    if len({p.resolve() for p in (source,font,overlay_out,film_out)})!=4:
        raise Shot5Hold('OVERLAPPING_SOURCE_OUTPUT')
    if overlay_out.exists() or film_out.exists():raise Shot5Hold('OUTPUT_MUST_BE_FRESH')
    if digest(source)!=SOURCE_SHA:raise Shot5Hold('SOURCE_H264_SHA_CHANGED')
    if digest(font)!=FONT_SHA:raise Shot5Hold('FONT_SHA_CHANGED')
    overlay_out.parent.mkdir(parents=True,exist_ok=True)
    film_out.parent.mkdir(parents=True,exist_ok=True)
    try:
        draw_overlay(source_frame(source),font).save(overlay_out)
        shell(['ffmpeg','-nostdin','-hide_banner','-v','error','-xerror','-n',
           '-i',str(source),'-loop','1','-framerate','30','-i',str(overlay_out),
           '-filter_complex',f"[0:v][1:v]overlay=x=0:y=0:format=yuv420:enable='between(n,{FIRST},{LAST})'[v]",
           '-map','[v]','-map','0:a:0','-c:v','libx264','-preset','veryfast',
           '-crf','18','-pix_fmt','yuv420p','-fps_mode:v','cfr','-r','30',
           '-frames:v','1031','-video_track_timescale','15360',
           '-c:a','copy','-movflags','+faststart',str(film_out)])
        if digest(source)!=SOURCE_SHA or digest(font)!=FONT_SHA:
            raise Shot5Hold('INPUT_BYTES_CHANGED_DURING_REPLAY')
        return {'schema':'ths-lane3-shot5-mobile-card-research-v1',
            'inputFilmSha256':SOURCE_SHA,'overlaySha256':digest(overlay_out),
            'outputFilmSha256':digest(film_out),'expectedOriginalAACSha256':AUDIO_SHA,
            'firstEditedFrame':FIRST,'lastEditedFrameInclusive':LAST,
            'criticalCardEndsBeforeX':SAFE_RIGHT_START,'source2DPixelsReused':True,
            'scienceApproved':False,'craftApproved':False,
            'phonePlaybackApproved':False,'mayPublish':False}
    except BaseException:
        overlay_out.unlink(missing_ok=True);film_out.unlink(missing_ok=True);raise

if __name__=='__main__':
    p=argparse.ArgumentParser()
    for name in ('source','font','overlay_out','film_out'):
        p.add_argument('--'+name.replace('_','-'),required=True)
    print(json.dumps(replay(**vars(p.parse_args())),indent=2))
