#!/usr/bin/env python3
"""Research-only direct-native 7-OH Scene 4 renderer, source-locked and voice-first.

It does not author claims, alter audio, imply docking, promote cinema approval,
or import into a publishing entrypoint. Output is SILENT for the separately
source-locked exact-AAC splicer. No 720p upscaling is ever used.
"""
from __future__ import annotations
import argparse
from functools import lru_cache
import hashlib
import io
import json
import math
from pathlib import Path
import subprocess

SAMPLE_FILM_SHA = '41807a178cb140d1753ca77d3d4eb097265ef8505d46d89c7b2eb0c8ae31ce1d'
ARCHIVED_FILM_SHA = 'bd5ee77b838d8598aa4a9c90b0f3a681d3554b1896fdba51fe1d86ef532e051a'
KNOWN_SOURCE_FILMS = frozenset((SAMPLE_FILM_SHA,ARCHIVED_FILM_SHA))
MOL_SHA = '150ccd331963beab2481ad47c36e1e171db6bdd37e4d50746a3d6b4b5be60bcb'
INCHIKEY = 'RYENLSMHLCNXJT-CYXFISRXSA-N'
NARRATION_SHA = '9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435'
W,H,FPS = 1080,1920,30
START_FRAME,END_FRAME = 498,702
COMPUTED_AT,NOT_AT = 18.48,19.83
CUES = [('But',16.58),('the',16.70),('three',16.79),('dimensional',17.25),('pose',17.87),('is',18.34),('computed.',18.48),('It',19.59),('is',19.70),('not',19.83),('footage',20.10),('of',20.58),('a',20.71),('molecule',20.76),('binding',21.44),('to',22.0),('a',22.19),('receptor.',22.23)]
COLORS={'C':(103,139,161),'N':(54,165,230),'O':(255,131,86)}

class SceneHold(ValueError):pass

def sha(path):
    d=hashlib.sha256()
    with open(path,'rb') as f:
        for b in iter(lambda:f.read(1<<20),b''):d.update(b)
    return d.hexdigest()

def material(source_film,mol_path,*,expected_film_sha=SAMPLE_FILM_SHA):
    if expected_film_sha not in KNOWN_SOURCE_FILMS:raise SceneHold('UNKNOWN_NARRATION_SOURCE_REVISION')
    if sha(source_film)!=expected_film_sha:raise SceneHold('SOURCE_FILM_SHA_MISMATCH')
    if sha(mol_path)!=MOL_SHA:raise SceneHold('SOURCE_MOL_SHA_MISMATCH')
    from rdkit import Chem
    from rdkit.Chem import AllChem
    from rdkit.Chem.Draw import rdMolDraw2D
    from PIL import Image
    mol=Chem.MolFromMolBlock(Path(mol_path).read_text(),removeHs=False)
    if mol is None or not mol.GetConformer().Is3D() or Chem.MolToInchiKey(Chem.RemoveHs(mol))!=INCHIKEY:
        raise SceneHold('STRUCTURE_OR_STEREO_MISMATCH')
    heavy=Chem.RemoveHs(Chem.Mol(mol)); AllChem.Compute2DCoords(heavy)
    canvas=rdMolDraw2D.MolDraw2DCairo(1340,800)
    o=canvas.drawOptions();o.clearBackground=False;o.bondLineWidth=5;o.padding=.12
    o.setAtomPalette({6:(.10,.16,.21),7:(.06,.37,.72),8:(.83,.29,.15)})
    rdMolDraw2D.PrepareAndDrawMolecule(canvas,heavy);canvas.FinishDrawing()
    return mol,Image.open(io.BytesIO(canvas.GetDrawingText())).convert('RGBA')

def state(time):
    return 'SOURCE' if time<COMPUTED_AT else 'COMPUTED' if time<NOT_AT else 'LIMIT'

def caption(time):
    arrived=[w for w,t in CUES if t<=time+1e-7]
    if not arrived:return ''
    words=[]
    for w in arrived:
        if words and words[-1].endswith(('.', '?', '!')):words=[]
        words.append(w)
    return ' '.join(words[((len(words)-1)//3)*3:])

@lru_cache(maxsize=3)
def font(size,bold=False):
    from PIL import ImageFont
    family='DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf'
    return ImageFont.truetype(f'/usr/share/fonts/truetype/dejavu/{family}',size)

@lru_cache(maxsize=128)
def sphere(radius,symbol):
    import numpy as np
    from PIL import Image
    yy,xx=np.mgrid[-radius:radius+1,-radius:radius+1].astype('float32')/radius
    q=1-xx*xx-yy*yy;z=np.sqrt(np.maximum(q,0))
    dif=np.maximum(0,-.46*xx-.48*yy+.75*z)
    spec=np.maximum(0,-.3*xx-.28*yy+.87*z)**21
    rgb=np.clip(np.array(COLORS[symbol])*(.3+.63*dif[...,None])+90*spec[...,None],0,255)
    alpha=np.clip(q*10,0,1)*255
    return Image.fromarray(np.uint8(np.dstack([rgb,alpha])),'RGBA')

@lru_cache(maxsize=2)
def background(light):
    import numpy as np
    from PIL import Image
    y,x=np.mgrid[0:H,0:W].astype('float32')
    if light:
        v=np.maximum(0,((x-W*.45)/W)**2+((y-H*.5)/H)**2)
        rgb=np.clip(np.array([235,237,225])-v[...,None]*60,0,255)
    else:
        glow=np.exp(-(((x-W*.54)/(W*.75))**2+((y-H*.46)/(H*.70))**2))
        rgb=np.stack([7+12*glow,21+30*glow,30+37*glow],axis=-1)
    return Image.fromarray(np.uint8(rgb),'RGB').convert('RGBA')

def model(mol,t,*,camera="baseline"):
    if camera not in ("baseline","depth_study"):raise SceneHold("UNKNOWN_CINEMATIC_CAMERA")
    import numpy as np
    from PIL import Image,ImageDraw
    from rdkit import Chem
    heavy=Chem.RemoveHs(mol)
    p=np.asarray(mol.GetConformer().GetPositions()[:heavy.GetNumAtoms()],dtype='float64')
    p-=p.mean(axis=0)
    alpha=max(0,min(1,(t-COMPUTED_AT)/(END_FRAME/FPS-COMPUTED_AT)))
    alpha=alpha*alpha*(3-2*alpha)
    if camera=="baseline":
        angle=.05+.24*alpha;c,s=math.cos(angle),math.sin(angle)
        rot=np.array([[c,0,s],[0,1,0],[-s,0,c]])
        wide,tall=930,585; margin=75; padding=90; slack=1.1
    elif camera=="depth_study":
        # A stronger but still rigid, right-handed authored camera motion.
        # Source atom and bond coordinates remain unchanged (no effect simulation).
        yaw=.17+.42*alpha; pitch=.12+.18*alpha
        cy,sy=math.cos(yaw),math.sin(yaw)
        cx,sx=math.cos(pitch),math.sin(pitch)
        ry=np.array([[cy,0,sy],[0,1,0],[-sy,0,cy]])
        rx=np.array([[1,0,0],[0,cx,-sx],[0,sx,cx]])
        rot=rx@ry
        wide,tall=1000,725; margin=65; padding=85; slack=1.0
    else:raise SceneHold('UNKNOWN_CINEMATIC_CAMERA')
    q=p@rot.T
    span=np.ptp(q[:,:2],axis=0)+slack
    scale=min((wide-margin)/span[0],(tall-padding)/span[1])
    xy=np.column_stack([wide/2+q[:,0]*scale,tall/2-q[:,1]*scale])
    img=Image.new('RGBA',(wide,tall));objects=[]
    for bond in heavy.GetBonds():
        a,b=bond.GetBeginAtomIdx(),bond.GetEndAtomIdx()
        objects.append(((q[a,2]+q[b,2])/2,0,a,b))
    for i in range(heavy.GetNumAtoms()):objects.append((q[i,2],1,i,i))
    for _,typ,a,b in sorted(objects):
        if typ==0:
            dr=ImageDraw.Draw(img)
            aa,bb=tuple(map(tuple,np.rint(xy[[a,b]]).astype(int)))
            dr.line((*aa,*bb),fill=(24,56,72,255),width=18)
            dr.line((*aa,*bb),fill=(177,194,205,255),width=11)
        else:
            sym=heavy.GetAtomWithIdx(a).GetSymbol()
            if sym not in COLORS:raise SceneHold('UNEXPECTED_ATOM')
            rad=20 if sym=='C' else 22
            point=tuple(np.rint(xy[a]).astype(int))
            img.alpha_composite(sphere(rad,sym),(point[0]-rad,point[1]-rad))
    return img

def render_frame(frame_no,mol,diagram,*,treatment="baseline"):
    if not START_FRAME<=frame_no<END_FRAME:raise SceneHold('FRAME_OUTSIDE_SCENE')
    if treatment not in ('baseline','depth_study'):raise SceneHold('UNKNOWN_CINEMATIC_TREATMENT')
    from PIL import Image,ImageDraw
    depth=(treatment=='depth_study')
    t=frame_no/FPS;phase=state(t);light=phase=='SOURCE'
    out=background(light).copy();d=ImageDraw.Draw(out)
    def line(x,y,v,sz,color,bold=False):d.text((x,y),v,font=font(sz,bold),fill=color)
    if light:
        d.rectangle((0,0,W,15),fill=(18,110,114))
        line(66,82,'THE HIPPIE SCIENTIST',27,(19,99,104),True)
        line(66,213,'A molecule',87,(20,45,52),True)
        line(66,322,'on the page.',87,(20,45,52),True)
        line(72,487,'1 / CHEMICAL RECORD',30,(45,101,104),True)
        line(72,541,'PubChem  •  CID 44301524',35,(45,75,79))
        d.rounded_rectangle((50,629,1035,1305),radius=25,fill=(249,248,239),outline=(205,211,200),width=3)
        source=diagram.resize((960,572),Image.Resampling.LANCZOS)
        out.alpha_composite(source,(63,676));d=ImageDraw.Draw(out)
        line(72,1335,'Verified atom + bond connectivity',34,(46,78,84))
        line(72,1485,'SOURCE-LOCKED / C23H30N2O5',26,(52,90,91),True)
    else:
        d.rectangle((0,0,W,14),fill=(83,220,200))
        line(68,84,'THE HIPPIE SCIENTIST',27,(100,231,216),True)
        line(68,189,'THE 3D VIEW',80,(239,247,238),True)
        line(69,294,'A mathematical illustration' if phase=='COMPUTED' else 'A calculated pose, not recorded footage',32,(158,193,199))
        d.line((69,378,1008,378),fill=(66,119,129),width=3)
        if depth:
            d.rounded_rectangle((65,422,410,666),radius=16,fill=(232,232,219))
            out.alpha_composite(diagram.resize((306,183),Image.Resampling.LANCZOS),(86,449));d=ImageDraw.Draw(out)
            line(86,619,'SOURCE-LOCKED',20,(22,78,87),True)
            line(475,476,'→',80,(107,218,203),True)
            line(610,464,'CALCULATED',38,(116,233,222),True)
            line(612,522,'3D STRUCTURE',31,(241,246,240),True)
            out.alpha_composite(model(mol,t,camera='depth_study'),(40,670));d=ImageDraw.Draw(out)
            line(78,1373,'COMPUTED CONFORMER  •  H OMITTED',28,(144,219,216),True)
        else:
            d.rounded_rectangle((65,420,512,742),radius=16,fill=(232,232,219))
            out.alpha_composite(diagram.resize((390,233),Image.Resampling.LANCZOS),(92,465));d=ImageDraw.Draw(out)
            line(91,680,'SOURCE DRAWING',21,(22,78,87),True)
            line(553,518,'→',68,(107,218,203),True)
            line(633,500,'COMPUTED',29,(116,233,222),True)
            line(633,553,'3D MODEL',32,(241,246,240),True)
            out.alpha_composite(model(mol,t),(75,738));d=ImageDraw.Draw(out)
            line(78,1323,'COMPUTED CONFORMER  •  H OMITTED',28,(144,219,216),True)
        if phase=='LIMIT':
            d.line((73,1425,73,1582),fill=(255,138,99),width=9)
            line(110,1434,'NOT FOOTAGE',70,(255,242,220),True)
            line(112,1530,'No receptor-binding video shown',29,(238,181,159))
        else:
            d.line((73,1438,1010,1438),fill=(84,148,150),width=3)
            line(80,1478,'Derived from verified structure',36,(207,229,226))
    d.rectangle((0,1650,W,H),fill=(30,59,64) if light else (7,17,26))
    d.rectangle((0,1643,W,1650),fill=(83,220,200))
    line(70,1700,'NARRATION',24,(139,215,207),True)
    line(70,1755,caption(t),48,(251,249,240),True)
    return out.convert('RGB')

def render(source,mol_path,output,*,expected_film_sha=SAMPLE_FILM_SHA,treatment="baseline"):
    mol,diagram=material(source,mol_path,expected_film_sha=expected_film_sha)
    if treatment not in ("baseline","depth_study"):raise SceneHold("UNKNOWN_CINEMATIC_TREATMENT")
    output=Path(output)
    if output.resolve() in (Path(source).resolve(),Path(mol_path).resolve()):
        raise SceneHold('OUTPUT_OVERWRITES_SOURCE')
    output.parent.mkdir(parents=True,exist_ok=True)
    args=['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24',
          '-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','veryfast',
          '-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(output)]
    pipe=subprocess.Popen(args,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    try:
        for n in range(START_FRAME,END_FRAME):pipe.stdin.write(render_frame(n,mol,diagram,treatment=treatment).tobytes())
        pipe.stdin.close();err=pipe.stderr.read();code=pipe.wait()
        if code:raise SceneHold('FFMPEG_RENDER_FAILED: '+err.decode(errors='replace')[:500])
    except BaseException:
        pipe.kill();pipe.wait()
        if output.exists():output.unlink()
        raise
    return {'schema':'ths-lane3-native-source-framepts-v1','status':'RESEARCH_ONLY_RENDERED',
            'originalFilmSha256':expected_film_sha,'sourceMoleculeSha256':MOL_SHA,
            'originalNarrationSha256':NARRATION_SHA,'clipSha256':sha(output),
            'frames':END_FRAME-START_FRAME,'width':W,'height':H,'fps':FPS,
            'firstFrame':START_FRAME,'lastFrame':END_FRAME-1,
            'computedFirstFrame':math.ceil(COMPUTED_AT*FPS),
            'notFootageFirstFrame':math.ceil(NOT_AT*FPS),
            'treatment':treatment,'containsAudio':False,'scienceApproved':False,'craftApproved':False,
            'phonePlaybackApproved':False,'mayPublish':False}

if __name__=='__main__':
    a=argparse.ArgumentParser()
    a.add_argument('--source-film',type=Path,required=True)
    a.add_argument('--mol',type=Path,required=True)
    a.add_argument('--output',type=Path,required=True)
    a.add_argument('--source-sha',required=True)
    a.add_argument('--treatment',choices=['baseline','depth_study'],default='baseline')
    x=a.parse_args()
    print(json.dumps(render(x.source_film,x.mol,x.output,expected_film_sha=x.source_sha,treatment=x.treatment),indent=2))
