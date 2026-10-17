#!/usr/bin/env python3
"""Research-only full native decoded 7-OH source-card temporal legibility screen.

Checks all 117 actual H264 frames, not only selected center samples. This is a
pixel-only negative screen (not OCR, phone hardware, semantics or release approval).
"""
import argparse,hashlib,json,subprocess
from pathlib import Path
try:
 import numpy as np
except ModuleNotFoundError:
 np=None  # Hosted portable contract tests run without this optional native-media dependency.

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
 if np is None:raise ReviewHold('NUMPY_REQUIRED_FOR_NATIVE_FILM_ANALYSIS')
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

def validate_row_stats(name,heights,frame_mae,rightmost_native_x,count):
 # Pure standard-Python safety rules also exercised by the hosted no-NumPy runner.
 if type(count) is not int or count!=END-START+1 or len(heights)!=count or any(type(h) is not int or h<=0 for h in heights):
  raise ReviewHold('FACTUAL_TEXT_FRAME_COVERAGE_INVALID:'+name)
 if min(heights)*320/1080<14:
  raise ReviewHold('TEXT_BELOW_MOBILE_320_IN_ANY_FRAME:'+name)
 if not isinstance(frame_mae,(int,float)) or not 0<=frame_mae<=1.0:
  raise ReviewHold('FACTUAL_TEXT_FLICKER_OR_MUTATION:'+name)
 if not isinstance(rightmost_native_x,int) or rightmost_native_x>=830 or rightmost_native_x<126:
  raise ReviewHold('TEXT_OUTSIDE_EDITED_SAFE_CARD:'+name)
 return True

def nonoverlapping_text_windows(lines=LINES):
 # Bound each real authored row by the NEXT row's start to avoid borrowing
 # its bright ink, even if the authored padding extends beyond that start.
 windows=[]
 for i,(name,y,size) in enumerate(lines):
  if not isinstance(name,str) or not name or type(y) is not int or type(size) is not int or size<=0:
   raise ReviewHold('FACTUAL_ROW_GEOMETRY_INVALID')
  following=lines[i+1][1] if i+1<len(lines) else Y0+H
  end=min(y+size+4,following,Y0+H)
  if not (Y0<=y<end and following>y):
   raise ReviewHold('FACTUAL_ROW_GEOMETRY_INVALID')
  windows.append((name,y,end))
 return windows

def temporal_report(frames):
 if np is None:raise ReviewHold('NUMPY_REQUIRED_FOR_NATIVE_FILM_ANALYSIS')
 if frames.shape!=(END-START+1,H,W) or frames.dtype!=np.uint8:raise ReviewHold('SCENE_FRAME_GRID_INVALID')
 result=[]
 for name,y,end_y in nonoverlapping_text_windows():
  # Half-open vertical isolation: never lend next row's pixels to this row.
  # This corrects the original 7-OH 80px report that borrowed next CID ink.
  crop=frames[:,y-Y0:end_y-Y0,126-X0:820-X0]
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
  report={'text':name,'nativeYWindowHalfOpen':[y,end_y],'minNativeInkRows':min(heights),'maxNativeInkRows':max(heights),
       'minProjectedInkPxAt320':round(min(heights)*320/1080,2),
       'framesVerified':len(heights),'minAboveThreshold14pxAt320':min(heights)*320/1080>=14,
       'medianDecodedInkPixelCount':int(np.median(ink)),
       'maxDecodedTextFrameMae255':round(float(stability.max()),5),
       'rightmostCandidateInkNativeX':126+max(xx)}
  validate_row_stats(name,heights,report['maxDecodedTextFrameMae255'],report['rightmostCandidateInkNativeX'],len(heights))
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
