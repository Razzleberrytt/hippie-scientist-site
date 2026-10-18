#!/usr/bin/env python3
"""Opt-in actual H264 phone-size label enlargement. Research, not publisher.

Only replaces two already-present identical source labels inside the two
science-card footer bands. First appearance of right-hand 'not' is exact
source frame 595. Never changes speech, timed word captions or molecular art.
"""
from __future__ import annotations
import argparse,hashlib,json,subprocess
from pathlib import Path

SOURCE_SHA='3c4e91b37958f1e86b6a04486933bbfc719bf6a196203711d6421eca58b70d31'
FONT_SHA='57f73e11f51999432bf7ab22ce55b6f945d5eca1bf824404cfa9ec2e3718c84e'
FIRST,LAST,RIGHT_FIRST=498,701,595
ORIGINAL_AAC_SHA='f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98'
W,H,FPS,FRAMES=1080,1920,30,1031

class ResearchHold(ValueError): pass

def sha(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for part in iter(lambda:f.read(1<<20),b''):h.update(part)
 return h.hexdigest()

def graph(font):
 f=str(font).replace('\\','\\\\').replace(':','\\:').replace("'", "\\'")
 # Treat existing card-footer backgrounds as flat within narrow 40px bands.
 # No new captions; these are EXACT already-present source phrases.
 # The lower panel border starts at y~=988 and must never be painted over.
 parts=[
  "drawbox=x=65:y=944:w=392:h=40:color=0x0b212f:t=fill:enable='between(n,498,701)'",
  "drawbox=x=505:y=944:w=474:h=44:color=0x0c2230:t=fill:enable='between(n,595,701)'",
  f"drawtext=fontfile='{f}':text='RDKit / source-linked':fontsize=34:fontcolor=0xc2d9de:x=77:y=940:enable='between(n,498,701)'",
  f"drawtext=fontfile='{f}':text='Not a receptor recording':fontsize=34:fontcolor=0xc2d9de:x=505:y=940:enable='between(n,595,701)'",
 ]
 return ','.join(parts)

def render(source,font,output):
 source,font,output=map(Path,(source,font,output))
 if source.resolve()==output.resolve() or output.exists() or output.is_symlink():
  raise ResearchHold('FRESH_DISTINCT_OUTPUT_REQUIRED')
 if sha(source)!=SOURCE_SHA:raise ResearchHold('EXACT_CLEAN_FILM_SHA_REQUIRED')
 if sha(font)!=FONT_SHA:raise ResearchHold('REVIEWED_FONT_SHA_REQUIRED')
 output.parent.mkdir(parents=True,exist_ok=True)
 command=['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-xerror','-n',
          '-i',str(source),'-map','0:v:0','-map','0:a:0',
          '-vf',graph(font),'-r','30','-fps_mode','cfr','-frames:v','1031',
          '-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',
          '-c:a','copy','-video_track_timescale','15360','-movflags','+faststart',str(output)]
 proc=subprocess.run(command,capture_output=True)
 if proc.returncode:
  if output.exists():output.unlink()
  raise ResearchHold('FFMPEG_RENDER_HOLD: '+proc.stderr.decode(errors='replace')[-500:])
 if sha(source)!=SOURCE_SHA or sha(font)!=FONT_SHA:
  output.unlink(missing_ok=True)
  raise ResearchHold('INPUT_BYTES_CHANGED_DURING_REPLAY')
 return {'schema':'ths-lane3-phone-footnotes-optin-research-v1',
         'sourceFilmSha256':SOURCE_SHA,'candidateFilmSha256':sha(output),
         'originalAacElementarySha256Expected':ORIGINAL_AAC_SHA,
         'sourceWordsUnchanged':['RDKit / source-linked','Not a receptor recording'],
         'onlyEditedFrames':[FIRST,LAST],'rightNegationFirstFrame':RIGHT_FIRST,
         'scienceApproved':False,'creativeApproved':False,'phonePlaybackApproved':False,
         'excellentCertified':False,'mayPublish':False}

if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__)
 p.add_argument('--source',type=Path,required=True)
 p.add_argument('--font',type=Path,required=True)
 p.add_argument('--output',type=Path,required=True)
 args=p.parse_args()
 print(json.dumps(render(args.source,args.font,args.output),indent=2))
