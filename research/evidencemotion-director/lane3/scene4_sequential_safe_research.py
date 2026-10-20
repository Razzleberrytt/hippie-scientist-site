#!/usr/bin/env python3
"""Research-only source-pinned Scene 4 sequential 2D->3D recomposition.

No novel chemical geometry: both animated art sources are extracted from the exact
input H.264 source at the same frame. Keeps all narration and timecode unchanged.
FAIL CLOSED; negative pixel screens are not phone, science or craft acceptance.
"""
from __future__ import annotations
from hashlib import sha256
from pathlib import Path
import argparse, json, subprocess
from PIL import Image, ImageDraw, ImageFont

SOURCE_SHA='fdece1d9bbd021d514c2510c5bf1e787a2555712f0fd48af8807994ed1816725'
FONT_SHA='a4c5bc453ca281d90ea079e596da7ae0dfeb5777497c29ec254e76d97ff6f890'
FIRST,LAST=498,701
THREED_START=555
CAVEAT_START=595
FRAME_SIZE=(1080,1920)
ROI_TOP,ROI_HEIGHT=550,450
SAFE_LIMIT=864
FRAME_BYTES=1080*450*3
ART_2D=(105,728,445,918)  # original 2D data in same-frame source
ART_3D=(518,704,1010,924)  # original moving 3D pixels in same-frame source
NO_RELEASE={'scienceApproved':False,'voiceApproved':False,'phoneApproved':False,'craftApproved':False,'mayPublish':False}
class ResearchHold(ValueError): pass

def digest(p):
    h=sha256()
    with open(p,'rb') as stream:
        for data in iter(lambda:stream.read(1024*1024),b''):h.update(data)
    return h.hexdigest()

def run(args,**kw):
    r=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,**kw)
    if r.returncode:raise ResearchHold('ENCODE_OR_PROBE_FAILURE '+r.stderr[-800:].decode(errors='replace'))
    return r.stdout

def make_overlay(crop:Image.Image,frame_index:int,font:Path, camera_study:bool=False,padding_study:bool=False)->Image.Image:
    if crop.size!=(1080,450) or not FIRST<=frame_index<=LAST:
        raise ResearchHold('BAD_REAL_FRAME_INPUT')
    work=Image.new('RGBA',(1080,450),(0,0,0,0))
    out=ImageDraw.Draw(work)
    # Full old two-column card is suppressed; boundary rows fade to original.
    # A new ONE-column card stays within the reviewer-prequalified x<864 zone.
    out.rectangle((0,0,1079,449),fill=(5,24,37,255))
    out.rounded_rectangle((65,15,835,443 if padding_study else 428),radius=22,fill=(9,33,47),outline=(64,150,158),width=4)
    regular=ImageFont.truetype(str(font),42)
    bold=ImageFont.truetype(str(font),48)
    color=(88,220,199,255)
    stage_3d=frame_index>=THREED_START
    label='CALCULATED 3D VIEW' if stage_3d else 'VERIFIED 2D RECORD'
    out.text((103,29),label,font=regular,fill=color)
    out.line((98,96,810,96),fill=(60,126,140,255),width=3)
    # Copy real same-frame pixels only. Aspect ratio is preserved.
    bb=ART_3D if stage_3d else ART_2D
    source_crop=crop.crop((bb[0],bb[1]-ROI_TOP,bb[2],bb[3]-ROI_TOP)).convert('RGBA')
    target=(600,268) if stage_3d else (480,268)
    if camera_study and stage_3d:
        # Deliberate slow flat camera push, NOT new or altered molecular coordinates.
        # Smoothstep eases zero velocity at the first and last original cue frames.
        t=(frame_index-THREED_START)/(LAST-THREED_START)
        eased=t*t*(3-2*t)
        width=600+round(40*eased)
        target=(width,round(width*268/600))
        x=137+round(26*eased)
        y=106-round((target[1]-268)/2)
        # Source art remains entirely inside science card x65..835 and below header.
        if x<105 or x+target[0]>835 or y<96 or y+target[1]>388:
            raise ResearchHold('CAMERA_ART_EXITS_SAFE_SCIENCE_CARD')
    else:
        x=(65+835-target[0])//2
        y=106
    source_crop=source_crop.resize(target,Image.Resampling.LANCZOS)
    work.alpha_composite(source_crop,(x,y))
    out=ImageDraw.Draw(work)
    if stage_3d:
        # Exact existing scientific disclaimer, unveiled at original f595.
        if frame_index>=CAVEAT_START:
            out.text((110,366) if padding_study else (127,354),'Not a receptor recording',font=bold,fill=(238,246,241,255))
    else:
        out.text((150,366) if padding_study else (157,354),'RDKit / source-linked',font=bold,fill=(238,246,241,255))
    # Critical art never enters x>=864. Other source text is NOT edited.
    for y in list(range(0,8))+list(range(446 if padding_study else 442,450)):
        alpha=min(255,int(255*(min(y,449-y)/7)))
        out.line((0,y,1079,y),fill=(5,24,37,alpha))
    return work

def probe_count(movie):
    r=json.loads(run(['ffprobe','-v','error','-select_streams','v:0','-count_frames','-show_entries','stream=width,height,r_frame_rate,nb_read_frames','-of','json',str(movie)]))
    s=r['streams'][0]
    if (s['width'],s['height'],s['r_frame_rate'],int(s['nb_read_frames']))!=(1080,1920,'30/1',1031):
        raise ResearchHold('WRONG_SOURCE_H264_GRID')

def prepare(source,font,output_directory,camera_study:bool=False,padding_study:bool=False):
    source,font,output_directory=Path(source),Path(font),Path(output_directory)
    if output_directory.resolve()==source.resolve() or output_directory.is_symlink():raise ResearchHold('OUTPUT_ALIASES_SOURCE')
    if output_directory.exists(): raise ResearchHold('FRESH_OUTPUT_DIRECTORY_REQUIRED')
    if digest(source)!=SOURCE_SHA or digest(font)!=FONT_SHA:raise ResearchHold('SOURCE_OR_FONT_SHA_NOT_PINNED')
    probe_count(source)
    output_directory.mkdir(parents=True)
    overlays=output_directory/'overlays'; overlays.mkdir()
    proc=subprocess.Popen(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-xerror','-i',str(source),
          '-vf',f'select=between(n\\,{FIRST}\\,{LAST}),crop=1080:450:0:{ROI_TOP}:exact=1,format=rgb24',
          '-vsync','0','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if not proc.stdout:raise ResearchHold('DECODE_NOT_STARTED')
    try:
        for idx in range(FIRST,LAST+1):
            b=proc.stdout.read(FRAME_BYTES)
            if len(b)!=FRAME_BYTES:raise ResearchHold('TRUNCATED_SOURCE_FRAME_'+str(idx))
            roi=Image.frombytes('RGB',(1080,450),b)
            overlay=make_overlay(roi,idx,font,camera_study=camera_study,padding_study=padding_study)
            overlay.save(overlays/f'frame_{idx:04d}.png',compress_level=1)
        if proc.stdout.read(1):raise ResearchHold('EXTRA_SOURCE_FRAMES')
        if proc.wait()!=0:raise ResearchHold('SOURCE_FFMPEG_READ_FAILURE '+proc.stderr.read().decode(errors='replace')[-600:])
        if digest(source)!=SOURCE_SHA or digest(font)!=FONT_SHA:raise ResearchHold('SOURCE_CHANGED_DURING_READ')
    except BaseException:
        proc.kill();proc.wait();raise
    return overlays

def encode(source,overlays,output):
    # PNG index 498 timestamps start at 0; delay overlay clock by 498/30 sec.
    run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-xerror','-n',
       '-i',str(source),'-framerate','30','-start_number',str(FIRST),'-i',str(overlays/'frame_%04d.png'),
       '-filter_complex',f'[1:v]setpts=PTS+({FIRST}/30)/TB[ink];[0:v][ink]overlay=x=0:y={ROI_TOP}:format=yuv420:eof_action=pass:repeatlast=0[v]',
       '-map','[v]','-map','0:a:0','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',
       '-r','30','-fps_mode:v','cfr','-frames:v','1031','-video_track_timescale','15360','-c:a','copy','-movflags','+faststart',str(output)])
    probe_count(output)

def main():
    p=argparse.ArgumentParser();p.add_argument('--source',required=True);p.add_argument('--font',required=True)
    p.add_argument('--workdir',required=True);p.add_argument('--output',required=True);p.add_argument('--preview-only',action='store_true');p.add_argument('--camera-study',action='store_true');p.add_argument('--padding-study',action='store_true');a=p.parse_args()
    source=Path(a.source);font=Path(a.font);workdir=Path(a.workdir);output=Path(a.output)
    if output.resolve() in (source.resolve(),font.resolve()) or output.exists():raise ResearchHold('OUTPUT_NOT_FRESH')
    overlays=prepare(source,font,workdir,camera_study=a.camera_study,padding_study=a.padding_study)
    if not a.preview_only:encode(source,overlays,output)
    if digest(source)!=SOURCE_SHA:raise ResearchHold('SOURCE_CHANGED_DURING_REPLAY')
    result={'schema':'ths-em-lane3-scene4-sequential-source-pinned-research-v1','originalFilmSha256':SOURCE_SHA,
       'candidateFilmSha256':None if a.preview_only else digest(output),
       'originalScene4FirstFrame':FIRST,'last':LAST,'stage3DStart':THREED_START,'rightCaveatStart':CAVEAT_START,
       'rightSafeZoneStart':SAFE_LIMIT,'preservedSourceMoving3D':True,'cameraStudy':a.camera_study,'paddingStudy':a.padding_study,'originalAACNeedsIndependentPacketProof':True,
       **NO_RELEASE}
    print(json.dumps(result,indent=2))
if __name__=='__main__':main()
