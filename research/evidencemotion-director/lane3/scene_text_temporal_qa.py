#!/usr/bin/env python3
"""Research-only full native decoded 7-OH source-card temporal legibility screen.

Checks all 117 actual H264 frames, not only selected center samples. This is a
pixel-only negative screen (not OCR, phone hardware, semantics or release approval).
"""
import argparse,hashlib,json,subprocess
from pathlib import Path
import numpy as np

FILM_SHA='c68a4bff5fd3c5b9af77127abfa441ccae3afc4d96c430d4c30cc51d9069fbf7'
START,END=821,937
FRAME_COUNT=1031
X0,Y0,W,H=120,575,720,860
LINES=[('PubChem',613,84),('Mitragynine',730,68),('CID 3034396',809,70),('7-OH',906,76),('CID 44301524',985,70),('C23H30N2O5',1078,70),('CID = compound',1160,68),('record number',1232,68),('pubchem.ncbi.nlm.nih.gov',1325,60)]
EXPECTED='f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98'

class ReviewHold(Exception):pass

def digest(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as f:
  for block in iter(lambda:f.read(1<<20),b''):h.update(block)
 return h.hexdigest()

def check_actual_frames(movie):
 movie=Path(movie)
 if movie.is_symlink() or not movie.is_file() or digest(movie)!=FILM_SHA:
  raise ReviewHold('WRONG_EXACT_FILM_SHA')
 cmd=['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-xerror','-err_detect','explode','-i',str(movie),'-map','0:v:0','-an','-vf',f"select='between(n,{START},{END})',crop={W}:{H}:{X0}:{Y0}:exact=1,format=gray",'-vsync','0','-pix_fmt','gray','-f','rawvideo','pipe:1']
 proc=subprocess.run(cmd,capture_output=True,timeout=120)
 if proc.returncode:raise ReviewHold('STRICT_H264_DECODE_FAILED '+proc.stderr[-300:].decode(errors='replace'))
 raw=proc.stdout
 if len(raw)!=W*H*(END-START+1):raise ReviewHold('SCENE_FRAME_COUNT_OR_GEOMETRY_MISMATCH')
 a=np.frombuffer(raw,dtype=np.uint8).reshape(END-START+1,H,W)
 if digest(movie)!=FILM_SHA:raise ReviewHold('FILM_MUTATED_DURING_REVIEW')
 return a

def temporal_report(frames):
 if frames.shape!=(END-START+1,H,W) or frames.dtype!=np.uint8:raise ReviewHold('SCENE_FRAME_GRID_INVALID')
 result=[]
 for name,y,size in LINES:
  # Native only, crop away marker/panel decoration before assessing line ink.
  # Corresponds to original source code anchored top of ink at y.
  crop=frames[:,y-Y0:y-Y0+size+4,126-X0:820-X0]
  mask=crop>110
  heights=[]; ink=[]; xx=[]
  for f in mask:
   ys,xs=np.where(f)
   if not len(ys):raise ReviewHold('FACTUAL_TEXT_DISAPPEARS:'+name)
   heights.append(int(ys.max()-ys.min()+1))
   ink.append(int(len(ys)))
   xx.append(int(xs.max()))
  # Silent card ought to keep all written facts in all frames even as marker moves.
  stability=np.mean(np.abs(crop.astype('int16')-crop[59:60].astype('int16')),axis=(1,2))
  report={'text':name,'minNativeInkRows':min(heights),'maxNativeInkRows':max(heights),
       'minProjectedInkPxAt320':round(min(heights)*320/1080,2),
       'framesVerified':len(heights),'minAboveThreshold14pxAt320':min(heights)*320/1080>=14,
       'medianDecodedInkPixelCount':int(np.median(ink)),
       'maxDecodedTextFrameMae255':round(float(stability.max()),5),
       'rightmostCandidateInkNativeX':126+max(xx)}
  if not report['minAboveThreshold14pxAt320']:
   raise ReviewHold('TEXT_BELOW_MOBILE_320_IN_ANY_FRAME:'+name)
  if report['maxDecodedTextFrameMae255']>1.0:
   raise ReviewHold('FACTUAL_TEXT_FLICKER_OR_MUTATION:'+name)
  if report['rightmostCandidateInkNativeX']>=830:
   raise ReviewHold('TEXT_OUTSIDE_EDITED_SAFE_CARD:'+name)
  result.append(report)
 return {'schema':'ths-em-lane3-source-card-every-frame-native-negative-screen-v1',
    'movieSha256':FILM_SHA,'decodedSceneFrames':END-START+1,
    'scopeFramesInclusive':[START,END],'rowsChecked':len(result),'textRows':result,
    'minAllRowsProjectedInkPxAt320':min(x['minProjectedInkPxAt320'] for x in result),
    'allSourceRowsEveryFramePass14pxResearchThreshold':all(x['minAboveThreshold14pxAt320'] for x in result),
    'textStaticStabilityResearchThresholdGrayMae255':1.0,
    'releaseApproved':False,'mayPublish':False,'phoneHardwareApproved':False,
    'externalIndependentReviewed':False,'newAcceptedAtomicCards':0,
    'limitations':'Actual native H264 pixel-only qualified NEGATIVE screen. Does not prove semantic OCR or smartphone/app obstruction, aesthetics or science truth.'}

def main():
 p=argparse.ArgumentParser();p.add_argument('--film',type=Path,required=True);p.add_argument('--out',type=Path,required=True)
 args=p.parse_args()
 if args.out.exists() or args.out.resolve()==args.film.resolve():raise ReviewHold('FRESH_REPORT_PATH_REQUIRED')
 report=temporal_report(check_actual_frames(args.film))
 args.out.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'status':'RESEARCH_NEGATIVE_SCREEN_PASS','minInkPx320':report['minAllRowsProjectedInkPxAt320'],'wholeSceneFrames':report['decodedSceneFrames'],'publish':False}))

if __name__=='__main__':main()
