#!/usr/bin/env python3
"""A complete decoded-film research alternative for the undersized 7-OH source card.

Authoritative source is the unchanged 1031-frame previously corrected science master;
rewriting source strings is prohibited. Runtime default is HOLD, no publication.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from hashlib import sha256
import json,subprocess,argparse,os

SOURCE_SHA='1e336488d39c7e070b7edefbad9e3fead26c4ad9cd86e1e487e717113ca5e8a0'
START,END=821,937
FPS=30
SAFE_LEFT,SAFE_RIGHT=90,864
REGULAR=Path('/usr/share/fonts/truetype/lato/Lato-Regular.ttf')
BOLD=Path('/usr/share/fonts/truetype/lato/Lato-Bold.ttf')

EXACT_STRINGS=['PubChem','Mitragynine','CID 3034396','7-OH','CID 44301524','C23H30N2O5','CID = compound','record number','pubchem.ncbi.nlm.nih.gov']
TEXT=[
    ('PubChem',613,84,'bold','white'),
    ('Mitragynine',730,68,'bold','white'),
    ('CID 3034396',809,70,'regular','muted'),
    ('7-OH',906,76,'bold','aqua'),
    ('CID 44301524',985,70,'bold','aqua'),
    ('C23H30N2O5',1078,70,'regular','white'),
    ('CID = compound',1160,68,'regular','muted'),
    ('record number',1232,68,'regular','muted'),
    ('pubchem.ncbi.nlm.nih.gov',1325,60,'regular','muted'),
]
# Fixed source-bound positions preflighted for legible ink at 320-pixel phone width.
NO_RELEASE={'mayPublish':False,'externalIndependentReviewed':False,'physicalPhoneReviewed':False,'firstExcellentRenderAccepted':False,'newAcceptedAtomicCards':0}
PALETTE={'white':(241,249,249,255),'muted':(195,215,220,255),'aqua':(94,218,200,255)}

class Hold(ValueError):pass

def digest(f):
 h=sha256()
 with open(f,'rb') as fh:
  for block in iter(lambda:fh.read(1<<20),b''):h.update(block)
 return h.hexdigest()

def image(frame):
 if not START<=frame<=END:raise Hold('FRAME_OUTSIDE_SOURCE_HOLD')
 canvas=Image.new('RGBA',(1080,1920),(0,0,0,0));p=ImageDraw.Draw(canvas)
 # Structured reading card in scientific-visual safe region, replacing tiny source glyphs
 p.rounded_rectangle((50,550,835,1430),radius=23,fill=(13,35,47,255),outline=(62,137,148,255),width=3)
 p.rounded_rectangle((101,579,110,596),radius=4,fill=PALETTE['aqua'])
 p.line((125,708,796,708),fill=(67,137,150,255),width=2)
 for value,y,size,weight,color in TEXT:
  font=ImageFont.truetype(str(BOLD if weight=='bold' else REGULAR),size)
  # PIL anchors text at top of glyph bounding box, keeping row geometry explicit
  p.text((126,y),value,font=font,fill=PALETTE[color],anchor='lt')
 # frame-timed reading cue, only inside panel x=103..114 not screen edge;
 # 3.9s source hold, smooth 10-frame motion between semantic groups.
 cues=[(821,850,834),(850,881,1007),(881,910,1099),(910,938,1345)]
 stage=0
 for i,(start,_,_) in enumerate(cues):
  if frame>=start:stage=i
 start,_,cy=cues[stage]
 old=cues[max(0,stage-1)][2]
 t=max(0.,min(1.,(frame-start)/10.));t=t*t*(3-2*t)
 yy=round(old+(cy-old)*t)
 a=0.25+0.75*min(1.,(frame-START)/8.,(END-frame)/8.)
 p.rounded_rectangle((87,yy-25,99,yy+25),radius=5,fill=(94,218,200,round(240*a)))
 return canvas

def labels_fit_safe_region():
 for txt,y,sz,w,c in TEXT:
  font=ImageFont.truetype(str(BOLD if w=='bold' else REGULAR),sz)
  a,b,x1,y1=font.getbbox(txt)
  if 126+font.getlength(txt)>=830 or y+(y1-b)>=1400:raise Hold(f'UNSAFE_TEXT: {txt}: width={font.getlength(txt)} y={y} glyph={y1-b}')

EXPECTED_FONTS={
 'regular':'6f6940be0835c3ddec9199e5fc42be4cbc61ebcfd58c623fdf719366253f1780',
 'bold':'bf1b8130069b44b9148eeece35e5423bedac49777ba746615b826b8276574a7b',
}

def preflight(source, output, work):
 source,output,work=map(Path,(source,output,work))
 if (not source.is_file() or source.is_symlink() or digest(source)!=SOURCE_SHA):
  raise Hold('CURRENT_ORIGINAL_FILM_SHA_MISMATCH')
 if output.exists() or work.exists() or work.is_symlink():
  raise Hold('FRESH_DESTINATIONS_REQUIRED')
 if output.resolve()==source.resolve() or work.resolve()==source.resolve():
  raise Hold('OUTPUT_ALIASES_SOURCE')
 if digest(REGULAR)!=EXPECTED_FONTS['regular'] or digest(BOLD)!=EXPECTED_FONTS['bold']:
  raise Hold('FONT_BYTES_CHANGED')
 labels_fit_safe_region()
 for txt,y,sz,w,c in TEXT:
  f=ImageFont.truetype(str(BOLD if w=='bold' else REGULAR),sz)
  bb=f.getbbox(txt); native_ink=bb[3]-bb[1]
  if native_ink*320/1080<14:raise Hold('FONT_INK_BELOW_320PX_EXPERIMENT_THRESHOLD:'+txt)
  if 126+f.getlength(txt)>830:raise Hold('GLYPH_ENTERS_RIGHT_SAFE_REGION')
 p=json.loads(_run(['ffprobe','-v','error','-count_frames','-select_streams','v:0',
  '-show_entries','stream=width,height,codec_name,r_frame_rate,nb_read_frames',
  '-of','json',str(source)]))['streams'][0]
 if (p['width'],p['height'],p['codec_name'],p['r_frame_rate'],int(p['nb_read_frames']))!=(1080,1920,'h264','30/1',1031):
  raise Hold('SOURCE_FILM_GRID_MISMATCH')

def _run(args):
 result=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if result.returncode:raise Hold('MEDIA_TOOL_FAILED '+result.stderr.decode(errors='replace')[-500:])
 return result.stdout

def render(source,output,work):
 preflight(source,output,work)
 source,output,work=map(Path,(source,output,work))
 work.mkdir()
 try:
  for frame in range(START,END+1):
   image(frame).save(work/f'overlay_{frame:04d}.png',optimize=True)
  filt=(f'[1:v]setpts=PTS+{START}/({FPS}*TB),format=rgba[cues];'
   f"[0:v][cues]overlay=shortest=0:eof_action=pass:format=yuv420:enable='between(n,{START},{END})',format=yuv420p[out]")
  _run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-xerror','-n',
    '-i',str(source),'-framerate','30','-start_number',str(START),
    '-i',str(work/'overlay_%04d.png'),'-filter_complex',filt,
    '-map','[out]','-map','0:a:0','-c:v','libx264','-preset','veryfast',
    '-crf','18','-pix_fmt','yuv420p','-fps_mode:v','cfr','-r','30','-frames:v','1031',
    '-video_track_timescale','15360','-c:a','copy','-movflags','+faststart',str(output)])
  _run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-xerror','-err_detect','explode',
    '-i',str(output),'-map','0:v:0','-map','0:a:0','-f','null','-'])
  meta=json.loads(_run(['ffprobe','-v','error','-select_streams','v:0','-count_frames',
    '-show_entries','stream=width,height,r_frame_rate,nb_read_frames',
    '-of','json',str(output)]))['streams'][0]
  if (meta['width'],meta['height'],meta['r_frame_rate'],int(meta['nb_read_frames']))!=(1080,1920,'30/1',1031):
   raise Hold('OUTPUT_VIDEO_FRAME_GRID_MISMATCH')
  if digest(source)!=SOURCE_SHA:raise Hold('SOURCE_CHANGED_DURING_ENCODE')
  return {'sourceFilmSha256':SOURCE_SHA,'candidateFilmSha256':digest(output),
          'actualDecodedFrames':1031,'sourceCardFramesInclusive':[START,END],
          'fontSha256':EXPECTED_FONTS,'displayedTextExact':EXACT_STRINGS,
          'publicationApproved':False,'phoneApproved':False,'scienceApproved':False,
          'firstRenderExcellentApproved':False,'newAcceptedAtomicCards':0}
 except BaseException:
  if output.exists():output.unlink()
  raise

def cli():
 p=argparse.ArgumentParser(description='Research-only full-film 7-OH evidence card layout')
 p.add_argument('--film',type=Path,required=True);p.add_argument('--out',type=Path,required=True)
 p.add_argument('--work',type=Path,required=True)
 args=p.parse_args();print(json.dumps(render(args.film,args.out,args.work),indent=2))

if __name__=="__main__":cli()
