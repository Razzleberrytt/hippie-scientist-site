#!/usr/bin/env python3
"""Research-only still-first leaf -> digital edge trace.
AI botanical art is illustrative, not an authenticated leaf specimen.
Trace is computed from source pixels; NOT microscopy or molecular imaging.
Requires Pillow, OpenCV, NumPy and FFmpeg. Does not touch production.
"""
import argparse,math,hashlib,json,subprocess,time
from pathlib import Path
import cv2,numpy as np
from PIL import Image,ImageDraw,ImageFont
ap=argparse.ArgumentParser()
ap.add_argument('--source',type=Path,required=True)
ap.add_argument('--output',type=Path,required=True)
args=ap.parse_args()
SOURCE=args.source.resolve()
ROOT=args.output.resolve()
if not SOURCE.is_file():raise FileNotFoundError(SOURCE)
ROOT.mkdir(parents=True,exist_ok=True)
FRAMES=ROOT/'frames';FRAMES.mkdir(exist_ok=True)
W,H,FPS,N=540,960,15,90
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def font(n,bold=False):return ImageFont.truetype(BOLD if bold else FONT,n)
def ease(x):
 x=max(0,min(1,x))
 return x*x*(3-2*x)
def digest(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
original=np.asarray(Image.open(SOURCE).convert('RGB'))
if original.shape[1]<655 or original.shape[0]<510:
 raise ValueError('Research reference requires at least 655x510 source pixels')
hero=original[35:510,32:655]
base=cv2.resize(hero,(540,580),interpolation=cv2.INTER_CUBIC)
gray=cv2.cvtColor(base,cv2.COLOR_RGB2GRAY)
detail=cv2.createCLAHE(clipLimit=1.6,tileGridSize=(6,6)).apply(gray)
gx=cv2.Sobel(detail,cv2.CV_32F,1,0,ksize=3)
gy=cv2.Sobel(detail,cv2.CV_32F,0,1,ksize=3)
mag=np.clip((np.sqrt(gx**2+gy**2)-19)/110,0,1)**.8
traced=base.astype(np.float32)*np.array([.24,.39,.44])[None,None,:]
traced[:,:,0]+=mag*38
traced[:,:,1]+=mag*170
traced[:,:,2]+=mag*151
traced=np.uint8(np.clip(traced,0,255))
ambient=cv2.resize(original,(W,H),interpolation=cv2.INTER_LINEAR)
ambient=cv2.GaussianBlur(ambient,(0,0),48)
ambient=np.uint8(np.clip(ambient.astype(np.float32)*.22+np.array([4,14,22]),0,255))
y,x=np.mgrid[0:H,0:W]
vignette=np.clip(1-.31*((x-W/2)/(W*.66))**2-.19*((y-H/2)/(H*.66))**2,.55,1)
def draw(t):
 p=ease((t-1.6)/1.7)
 zoom=1+.04*ease(t/6)
 ww,hh=round(W*zoom),round(580*zoom)
 dx,dy=(ww-W)//2,(hh-580)//2
 shot=cv2.resize(base,(ww,hh),interpolation=cv2.INTER_CUBIC)[dy:dy+580,dx:dx+W]
 trace=cv2.resize(traced,(ww,hh),interpolation=cv2.INTER_CUBIC)[dy:dy+580,dx:dx+W]
 advance=(-.18+1.42*p)*W
 blend=np.clip((advance-(x[:580,:]-y[:580,:]*.16))/45+.5,0,1)[:,:,None]
 state=shot.astype(np.float32)*(1-blend)+trace.astype(np.float32)*blend
 edge=cv2.resize(mag.astype(np.float32),(ww,hh))[dy:dy+580,dx:dx+W]
 state+=(blend[:,:,0]*edge*22)[:,:,None]*np.array([.10,.62,.49])
 canvas=ambient.copy().astype(np.float32)
 canvas[210:790,:,:]=np.clip(state,0,255)
 frame=Image.fromarray(np.uint8(np.clip(canvas*vignette[:,:,None],0,255))).convert('RGB')
 d=ImageDraw.Draw(frame,'RGBA')
 if t<3.28:
  d.text((37,95),'BENEATH THE',font=font(36,True),fill=(235,249,242,255))
  d.text((37,139),'VISIBLE',font=font(42,True),fill=(231,251,245,255))
 else:
  d.text((37,95),'THE SAME IMAGE.',font=font(31,True),fill=(240,248,241,255))
  d.text((37,139),'A NEW VIEW.',font=font(36,True),fill=(140,243,222,255))
 if 1.55<t<3.5:
  px=int(np.clip(advance-515*.16,20,W-20))
  d.ellipse((px-5,510,px+5,520),fill=(170,255,230,220))
 d.text((37,H-119),'ILLUSTRATIVE IMAGE PROCESSING',font=font(15,True),fill=(233,243,228,229))
 d.text((37,H-90),'NOT MICROSCOPE OR BIOLOGICAL IMAGING',font=font(12),fill=(182,209,210,230))
 return frame
start=time.monotonic()
for i in range(N):draw(i/FPS).save(FRAMES/f'f{i:05d}.png')
sheet=Image.new('RGB',(648,768))
for j,i in enumerate([0,12,26,42,60,89]):
 sheet.paste(Image.open(FRAMES/f'f{i:05d}.png').resize((216,384)),((j%3)*216,(j//3)*384))
sheet.save(ROOT/'contact_sheet.jpg',quality=86)
mp4=ROOT/'leaf_edge_trace_RESEARCH_ONLY_SILENT.mp4'
subprocess.run(['ffmpeg','-hide_banner','-v','error','-y','-framerate',str(FPS),
 '-start_number','0','-i',str(FRAMES/'f%05d.png'),'-frames:v',str(N),
 '-c:v','libx264','-preset','fast','-crf','20','-profile:v','baseline','-level','3.1','-pix_fmt','yuv420p',
 '-movflags','+faststart','-an',str(mp4)],check=True)
receipt={'status':'RESEARCH_ONLY_REQUIRES_CRAFT_REVIEW',
 'source_sha256':digest(SOURCE),'video_sha256':digest(mp4),'frames':N,
 'size':[W,H],'fps':FPS,'duration':6.0,'visualAction':'pixel-derived photo to edge trace',
 'mechanism':'none','science':'not verified biological imaging','voice':'none',
 'ownerAccepted':False,'productionPermission':False,
 'render_seconds':round(time.monotonic()-start,2)}
(ROOT/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt,indent=2))
