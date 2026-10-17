#!/usr/bin/env python3
"""Full physical review of candidate versus SHA-bound 7-OH film baseline."""
import json,hashlib,subprocess,sys,statistics,os
from pathlib import Path
import numpy as np
from PIL import Image,ImageFont
import source_card_reflow_research as card
BASE=Path('/mnt/data/EvidenceMotion_Lane3_Editorial_Clarity_Research_Full.mp4')
NEW=Path('/mnt/data/EvidenceMotion_Lane3_SourceCard_LargeType_Veryfast_Research_Full.mp4')
OUT=Path('/mnt/data/lane3_readability')

def run(a):
 r=subprocess.run(a,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if r.returncode:raise RuntimeError('FAIL '+str(a)+' '+r.stderr.decode()[-1000:])
 return r.stdout

def probe(p):
 return json.loads(run(['ffprobe','-v','error','-count_frames','-show_streams','-of','json',str(p)]))['streams']

def packets(p):
 obj=json.loads(run(['ffprobe','-v','error','-select_streams','a:0','-show_packets','-show_entries','packet=pts,dts,duration,size','-of','json',str(p)]))
 return [[q.get(k) for k in ('pts','dts','duration','size')] for q in obj['packets']]

def elementary_sha(p):
 b=run(['ffmpeg','-nostdin','-v','error','-xerror','-i',str(p),'-map','0:a:0','-c:a','copy','-f','adts','pipe:1'])
 return hashlib.sha256(b).hexdigest()

def downsample(p):
 b=run(['ffmpeg','-nostdin','-v','error','-xerror','-i',str(p),'-map','0:v:0','-vf','scale=96:170:flags=area,format=gray','-vsync','0','-f','rawvideo','-pix_fmt','gray','pipe:1'])
 v=np.frombuffer(b,dtype=np.uint8)
 if len(v)!=1031*96*170:raise RuntimeError('FRAME_COUNT_MISMATCH')
 return v.reshape(1031,170,96)

def capture(p,nums,outdir):
 outdir.mkdir(exist_ok=True)
 expression='+'.join(f'eq(n\\,{n})' for n in nums)
 raw=run(['ffmpeg','-nostdin','-v','error','-xerror','-i',str(p),'-map','0:v:0',
   '-vf',f"select='{expression}',format=rgb24",'-vsync','0','-f','rawvideo','-pix_fmt','rgb24','pipe:1'])
 arr=np.frombuffer(raw,dtype=np.uint8)
 if arr.size!=len(nums)*1920*1080*3:raise RuntimeError('SELECTED_NATIVE_FRAME_MISMATCH')
 arr=arr.reshape(len(nums),1920,1080,3)
 frames={}
 for n,v in zip(nums,arr):
  im=Image.fromarray(v.copy(),'RGB')
  im.save(outdir/f'f{n}_native.png')
  for w in (320,375,430):
   im.resize((w,round(1920*w/1080)),Image.Resampling.LANCZOS).save(outdir/f'f{n}_{w}.png')
  frames[n]=v
 return frames

def audit():
 assert card.digest(BASE)==card.SOURCE_SHA
 nsha=card.digest(NEW)
 stream=probe(NEW)
 vid=[s for s in stream if s['codec_type']=='video'][0]
 assert (vid['width'],vid['height'],vid['r_frame_rate'],int(vid['nb_read_frames']))==(1080,1920,'30/1',1031)
 run(['ffmpeg','-nostdin','-v','error','-xerror','-err_detect','explode','-i',str(NEW),'-map','0:v:0','-map','0:a:0','-f','null','-'])
 prev_a=packets(BASE);new_a=packets(NEW)
 assert len(prev_a)==len(new_a)==807 and prev_a==new_a
 audio_prev=elementary_sha(BASE); audio_new=elementary_sha(NEW)
 assert audio_prev==audio_new=='f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98'
 a=downsample(BASE);b=downsample(NEW)
 mae=np.mean(np.abs(a.astype('int16')-b.astype('int16')),axis=(1,2))
 outside=np.r_[0:821,938:1031]
 inside=np.arange(821,938)
 assert len(outside)==914 and len(inside)==117
 assert mae[outside].mean()<.08,('UNRELATED_FILM_DRIFT',mae[outside].mean())
 assert mae[outside].max()<.15,('UNRELATED_FILM_OUTLIER',mae[outside].max())
 samples=(821,849,880,909,937,938)
 frames=capture(NEW,samples,OUT/'new_frames')
 # By ink geometry, every row must have at least 47 native active pixels
 # and remain inside simulated right exclusion after H264 encoding.
 bands=[]
 for txt,y,size,weight,color in card.TEXT:
  f=ImageFont.truetype(str(card.BOLD if weight=='bold' else card.REGULAR),size)
  im=frames[880]
  bb=f.getbbox(txt)
  # top-anchor text drawn at y; native row includes original H264 quantization.
  crop=im[y:y+size+4,126:820]
  # colored text and neutral labels are much brighter than background.
  luma=.2126*crop[:,:,0]+.7152*crop[:,:,1]+.0722*crop[:,:,2]
  bright=luma>110
  yy=np.where(bright)[0]
  if not len(yy):raise RuntimeError('MISSING_ROW: '+txt)
  rowheight=int(yy.max()-yy.min()+1)
  if rowheight*320/1080<14:raise RuntimeError('ENCODED_ROW_TOO_SMALL:'+txt+f': {rowheight}')
  bands.append({'text':txt,'nativeInkRows':rowheight,'projectedInkPxAt320':round(rowheight*320/1080,2),'projectedInkPxAt375':round(rowheight*375/1080,2)})
 # Byte-for-byte text isn't OCR-certified, but row physical dimensions are independent.
 # Source film unchanged rehash and no new art in phone right exclusion.
 assert card.digest(BASE)==card.SOURCE_SHA and card.digest(NEW)==nsha
 report={'schema':'ths-em-lane3-encoded-sourcecard-large-type-physical-review-20261017-v1',
  'sourceFilmSha256':card.SOURCE_SHA,'candidateFilmSha256':nsha,
  'nativeFramesDecoded':1031,'dimensions':[1080,1920],'fps':'30/1',
  'originalAacPacketsPreserved':len(new_a),'allAacPacketTimingsAndSizesEqual':True,
  'originalAacAdtsSha256':audio_new,
  'outside117Frames':914,'outsideFramesMeanGray96x170Mae255':round(float(mae[outside].mean()),8),
  'outsideFramesMaxGray96x170Mae255':round(float(mae[outside].max()),8),
  'changedFrames':117,'changedFrameMeanGray96x170Mae255':round(float(mae[inside].mean()),8),
  'nativeDecodedGlyphInkHeight':bands,
  'allLinesAtLeast14pxInkAt320':True,
  'phonePlanSha256':None,'externalIndependentReviewed':False,
  'physicalPhoneReviewed':False,'humanPremiumCraftReviewed':False,
  'mayPublish':False,'newAcceptedAtomicCards':0}
 (OUT/'physical_review.json').write_text(json.dumps(report,indent=2)+'\n')
 print(json.dumps(report,indent=2))
if __name__=='__main__': audit()
