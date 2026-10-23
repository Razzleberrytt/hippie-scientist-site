#!/usr/bin/env python3
"""R8.18 physical native-30fps 3D/2.5D producer. No hosted AI or fake depth.
Supported beats deliberately limited; unsupported art direction fails closed.
Native object telemetry originates from the same projected/drawn frames.
"""
import argparse,hashlib,json,math
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import numpy as np
W,H,FPS=1080,1920,30
PALETTE={'reveals-hidden-action':(28,101,163),'ligand-enters-pocket':(38,133,208),'count-up-then-settle':(196,142,69),
 'bottle-rotates-to-reveal-label':(179,98,70),'reveal-emergency-guidance':(218,72,90),
 'evidence-boundary-panel-settles':(39,102,108),
 'botanical-versus-concentrate-reveal':(38,97,112),
 'source-bound-scaffold-assembles':(37,94,109)}
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def digest(b):return hashlib.sha256(b).hexdigest()
def ease(v):v=max(0,min(1,v));return v*v*(3-2*v)
def lerp(a,b,t):return a+(b-a)*ease(t)
def font(n):return ImageFont.truetype(FONT,n)
def back(color):
 y=np.linspace(0,1,H)[:,None];x=np.linspace(0,1,W)[None,:]
 bloom=np.exp(-((x-.51)**2/.21+(y-.49)**2/.12))
 a=np.zeros((H,W,3),np.uint8)
 for i,c in enumerate(color):a[:,:,i]=np.clip(5+c*(.09+.31*bloom)+5*y,0,255)
 return Image.fromarray(a,'RGB').convert('RGBA')
def make_vtk():
 import vtk
 from vtk.util.numpy_support import vtk_to_numpy
 ren=vtk.vtkRenderer();ren.SetBackground(.02,.04,.075)
 win=vtk.vtkRenderWindow();win.SetOffScreenRendering(1);win.SetSize(1080,1200);win.AddRenderer(ren)
 cam=ren.GetActiveCamera();cam.SetPosition(0,-11,5);cam.SetFocalPoint(0,0,0);cam.SetViewUp(0,0,1);cam.SetViewAngle(35)
 light=vtk.vtkLight();light.SetPosition(-4,-5,7);light.SetIntensity(1.25);ren.AddLight(light)
 for helix in range(7):
  angle=helix*math.tau/7;pts=vtk.vtkPoints();line=vtk.vtkPolyLine();line.GetPointIds().SetNumberOfIds(62)
  for j in range(62):
   z=-2.05+j*4.1/61
   idx=pts.InsertNextPoint(math.cos(angle)+.2*math.cos(j*.52+helix),
      math.sin(angle)+.2*math.sin(j*.52+helix),z)
   line.GetPointIds().SetId(j,idx)
  cells=vtk.vtkCellArray();cells.InsertNextCell(line)
  poly=vtk.vtkPolyData();poly.SetPoints(pts);poly.SetLines(cells)
  tube=vtk.vtkTubeFilter();tube.SetInputData(poly);tube.SetRadius(.23);tube.SetNumberOfSides(14);tube.CappingOn()
  mapper=vtk.vtkPolyDataMapper();mapper.SetInputConnection(tube.GetOutputPort())
  actor=vtk.vtkActor();actor.SetMapper(mapper)
  actor.GetProperty().SetColor(.18+.02*helix,.49+.035*helix,.84)
  actor.GetProperty().SetSpecular(.7);actor.GetProperty().SetSpecularPower(45)
  ren.AddActor(actor)
 spheres=[]
 for i,(size,off) in enumerate([(.24,(-.2,0,0)),(.19,(.18,.06,.05)),(.15,(0,.2,-.12))]):
  ball=vtk.vtkSphereSource();ball.SetRadius(size);ball.SetPhiResolution(20);ball.SetThetaResolution(20)
  mapper=vtk.vtkPolyDataMapper();mapper.SetInputConnection(ball.GetOutputPort())
  actor=vtk.vtkActor();actor.SetMapper(mapper)
  actor.GetProperty().SetColor(1,.63+.08*i,.54+.07*i)
  actor.GetProperty().SetSpecular(.75);actor.GetProperty().SetSpecularPower(50)
  ren.AddActor(actor);spheres.append((actor,off))
 return ren,win,spheres,vtk,vtk_to_numpy
def image_vtk(vtk_scene,t):
 ren,win,spheres,vtk,to_numpy=vtk_scene
 cx=lerp(2.15,0,t);cy=lerp(-.2,0,t);cz=lerp(1.4,0,t)
 for actor,off in spheres:actor.SetPosition(cx+off[0],cy+off[1],cz+off[2])
 win.Render()
 capture=vtk.vtkWindowToImageFilter();capture.SetInput(win);capture.SetInputBufferTypeToRGB()
 capture.ReadFrontBufferOff();capture.Update()
 raw=to_numpy(capture.GetOutput().GetPointData().GetScalars()).reshape(1200,1080,3)
 def project(x,y,z):
  ren.SetWorldPoint(x,y,z,1);ren.WorldToDisplay()
  a,b,_=ren.GetDisplayPoint();return (a,1500-b)
 return Image.fromarray(np.flipud(raw).copy(),'RGB').convert('RGBA'),project(cx,cy,cz),project(0,0,0),project(.7,0,0)
def bottle(img,p,label):
 d=ImageDraw.Draw(img,'RGBA');x=lerp(620,540,p);a,b=int(x-175),int(x+175)
 d.rounded_rectangle((a,620,b,1240),radius=85,fill=(119,65,32,250),outline=(247,187,115,190),width=9)
 for k in range(18):
  xx=a+18+k*17;val=int(40+70*math.exp(-((k-5)/4)**2))
  d.line((xx,770,xx,1110),fill=(250,194,122,val),width=6)
 d.rounded_rectangle((a+50,532,b-50,660),radius=23,fill=(30,34,49,255),outline=(150,174,190,220),width=6)
 d.rounded_rectangle((a+30,820,b-30,1100),radius=25,fill=(229,234,226,255))
 d.text((int(x),906),label,font=font(34),fill=(19,34,51),anchor='mm')
 d.text((int(x),960),'ILLUSTRATIVE',font=font(20),fill=(45,64,77),anchor='mm')
 return [a,532,b-a,708]

def pinned_art(root,ref,source_plate=False):
 """Use actual RGBA pixels exported by an original artist or offline 3D tool."""
 p=(root/ref['file']).resolve()
 if not p.is_relative_to(root.resolve()) or not p.is_file():
  raise ValueError('R8.18 physical art path escapes package or is missing')
 data=p.read_bytes()
 if digest(data)!=ref['sha256']:
  raise ValueError('R8.18 art identity differs from staged source SHA')
 with Image.open(p) as source:
  source.load()
  if source.format!='PNG' or source.mode!='RGBA' or (
   source.size!=(W,H) if source_plate else (max(source.size)>1200 or min(source.size)<64)):
   raise ValueError('R8.18 physical layer is not bounded source RGBA')
  return source.copy()
def draw_original(canvas,art,box,crop_original=False):
 """Blend a REAL independent art object and record its actual nontransparent bbox."""
 x,y,w,h=map(int,box)
 if crop_original:
  shape=art.getchannel('A').getbbox()
  if not shape:raise ValueError('R8.18 source art is entirely invisible')
  art=art.crop(shape)
 layer=art.resize((w,h),Image.Resampling.LANCZOS)
 bbox=layer.getchannel('A').getbbox()
 if not bbox:raise ValueError('R8.18 invisible art cannot count as semantic motion')
 canvas.alpha_composite(layer,(x,y))
 return [x+bbox[0],y+bbox[1],bbox[2]-bbox[0],bbox[3]-bbox[1]]

def produce(job):
 out=Path(job['outputDir']);out.mkdir(parents=True,exist_ok=True)
 plan=job['plan'];scenes=job['scenes']
 if len(plan['beats'])!=len(scenes):raise ValueError('R8.18 missing beat inventory')
 vt=make_vtk() if any(b['semanticAction'] in ('ligand-enters-pocket','reveals-hidden-action') for b in plan['beats']) else None
 telemetry_beats=[];native_beats=[];total=0
 art_root=out.resolve();art_map=job.get('physicalArt',{})
 for beat,scene in zip(plan['beats'],scenes):
  action=beat['semanticAction'];bid=beat['id']
  if action not in PALETTE:raise ValueError('R8.18 unsupported actual drawing action '+action)
  count=round((scene['end']-scene['start'])*FPS)
  directory=out/'r818-frames'/bid;directory.mkdir(parents=True,exist_ok=True)
  frames=[];samples=[];pocketStreak=0;maxPocketStreak=0
  approved_art=art_map.get(bid)
  if action in ('evidence-boundary-panel-settles','botanical-versus-concentrate-reveal','source-bound-scaffold-assembles'):
   if not approved_art:raise ValueError('R8.18 grounded physical action missing pinned art')
   primary_art=pinned_art(art_root,approved_art['primary'],source_plate=('art' in approved_art))
   target_art=pinned_art(art_root,approved_art['target'],source_plate=('art' in approved_art)) if action in ('botanical-versus-concentrate-reveal','source-bound-scaffold-assembles') else None
  elif approved_art:raise ValueError('R8.18 art must bind a supported physical semantic action')
  if action=='source-bound-scaffold-assembles' and approved_art.get('plate'):
   if approved_art['plate'].get('r819BackgroundEligible') is not False:
    raise ValueError('R8.18 factual source plate is not nonfactual R8.19 art')
   source_plate=pinned_art(art_root,approved_art['plate'],source_plate=True)
  else:source_plate=None
  separated=action=='source-bound-scaffold-assembles' and ('art' in approved_art or 'trust' in approved_art)
  if separated:
   if 'art' not in approved_art or 'trust' not in approved_art or source_plate is not None:
    raise ValueError('R8.19 separate artist layers must have ART + TRUST without flat source card')
   for role in ('art','trust'):
    expected='nonfactual-art' if role=='art' else 'factual-trust'
    if approved_art[role].get('r819Role')!=expected:
     raise ValueError('R8.19 original source-art roles changed')
    pinned_art(art_root,approved_art[role],source_plate=True)
   (out/'r819-layers'/bid).mkdir(parents=True,exist_ok=True)
  proof=beat['telemetryProof'];primary=proof['primaryObjectId'];subject=proof['subjectObjectId']
  for fi in range(count):
   t=fi/max(1,count-1);p=ease(t)
   img=Image.new('RGBA',(W,H),(0,0,0,0)) if separated else back(PALETTE[action])
   d=ImageDraw.Draw(img,'RGBA');objects=[]
   def ob(oid,kind,label,rect,value=None,**other):
    x,y,w,h=rect;objects.append({'objectId':oid,'kind':kind,'label':str(label),
      'bbox':[float(x),float(y),float(w),float(h)],'zIndex':2,'visible':True,
      'opacity':1,'value':value,**other})
   if action=='reveals-hidden-action':
    # Reveal the biological mechanism, not a literal bottle-to-molecule metamorphosis.
    reveal=ease((t-.16)/.64)
    generic=Image.new('RGBA',(W,H),(0,0,0,0))
    rect=bottle(generic,t,beat.get('bottleLabel','Tianeptine'))
    alpha=generic.getchannel('A').point(lambda v:int(v*(1-reveal)))
    generic.putalpha(alpha);img.alpha_composite(generic)
    if reveal>0:
     threed,center,pocket,edge=image_vtk(vt,ease((t-.22)/.78))
     threed.putalpha(threed.getchannel('A').point(lambda v:int(v*reveal)))
     img.alpha_composite(threed,(0,300))
    # Record the genuine rendered hidden -> visible transition.
    ob(primary,beat['visualObject']['kind'],proof['beforeLabel'],rect,
       visible=(reveal<.99),opacity=round(1-reveal,4))
    ob(proof['targetObjectId'],'receptor-binding',proof['afterLabel'],
       [275,505,530,650],visible=(reveal>.01),opacity=round(reveal,4),
       activationLevel=round(reveal,4))
    if reveal>.08:
     ob('hook-ligand','ligand','Symbolic tianeptine',[center[0]-28,center[1]-28,56,56],
        opacity=round(reveal,4))
    d=ImageDraw.Draw(img,'RGBA')
    d.text((540,1518),'PRODUCT TO RECEPTOR ACTION',font=font(29),
      fill=(226,239,249),anchor='mm')
    d.text((540,1556),'SYMBOLIC MODEL — NOT MEASURED DOCKING',font=font(23),
      fill=(171,197,218),anchor='mm')
   elif action=='ligand-enters-pocket':
    threed,center,pocket,edge=image_vtk(vt,p);img.alpha_composite(threed,(0,300))
    radius=math.dist(pocket,edge);pocket_bbox=[pocket[0]-radius,pocket[1]-radius,radius*2,radius*2]
    ob(subject,beat['visualObject']['kind'],'SYMBOLIC RECEPTOR',[275,505,530,650])
    ob(primary,'ligand','Illustrative ligand',[center[0]-28,center[1]-28,56,56])
    ob(proof['targetObjectId'],'binding-pocket','Illustrative pocket',pocket_bbox)
    inside=pocket_bbox[0]<=center[0]<=pocket_bbox[0]+pocket_bbox[2] and pocket_bbox[1]<=center[1]<=pocket_bbox[1]+pocket_bbox[3]
    pocketStreak=pocketStreak+1 if inside else 0;maxPocketStreak=max(maxPocketStreak,pocketStreak)
   elif action=='evidence-boundary-panel-settles':
    # Motion Canvas-style eased timeline, Manim-style source-bound explanation:
    # animate the INDEPENDENT foreground art, not an opaque screenshot.
    progress=ease(min(1,t/.42))
    rect=draw_original(img,primary_art,[170,565+125*progress,740,530])
    ob(primary,beat['visualObject']['kind'],proof['beforeLabel'],rect,
       visibilityProgress=progress,artSourceSha256=approved_art['primary']['sha256'])
   elif action=='source-bound-scaffold-assembles':
    if source_plate is not None:
     # Retain original authored typography/claims behind the moving layers.
     # Source plate is a FACTUAL review image, never an R8.19 art background.
     img=source_plate.copy()
     ob('source-plate','factual-source-plate','Source-authored factual plate',
        [0,0,W,H],artSourceSha256=approved_art['plate']['sha256'])
    # Actual source-authored artist layers assemble and settle independently.
    a=ease(min(1,t/.42));b=ease(max(0,min(1,(t-.16)/.46)))
    x,y,w,h=approved_art['primary']['targetBox']
    sx,sy,sw,sh=approved_art['target']['targetBox']
    subject=draw_original(img,primary_art,[x-90*(1-a),y+42*(1-a),w,h],crop_original=separated)
    alpha=max(.04,b);connector=target_art.copy()
    connector.putalpha(connector.getchannel('A').point(lambda v:int(v*alpha)))
    bridge=draw_original(img,connector,[sx+37*(1-b),sy-28*(1-b),sw*(.9+.1*b),sh*(.9+.1*b)],crop_original=separated)
    ob(primary,beat['visualObject']['kind'],proof['beforeLabel'],subject,
       artSourceSha256=approved_art['primary']['sha256'])
    ob(proof['targetObjectId'],proof['targetKind'],proof['afterLabel'],bridge,
       opacity=alpha,activationLevel=b,artSourceSha256=approved_art['target']['sha256'])
   elif action=='botanical-versus-concentrate-reveal':
    # Two truly independent layered objects with different motion/scale curves.
    progress=ease(min(1,t/.42))
    leaf=draw_original(img,primary_art,[140+100*progress,780,235,285])
    product=draw_original(img,target_art,[635,760,270+75*progress,360+110*progress])
    ob(primary,beat['visualObject']['kind'],proof['beforeLabel'],leaf,
       artSourceSha256=approved_art['primary']['sha256'])
    ob(proof['targetObjectId'],proof['targetKind'],proof['afterLabel'],product,
       artSourceSha256=approved_art['target']['sha256'])
   elif action=='count-up-then-settle':
    target=beat['numericVisual']['finalDisplay'];num=float(str(target).replace(',','').replace('+','').replace('%',''))
    value=num if t>=.6 else math.floor(num*ease(t/.6))
    display=target if t>=.6 else format(int(value),',')
    d.text((540,810),display,font=font(160),fill=(255,244,212),anchor='mm')
    d.text((540,960),'REPORTED EVIDENCE',font=font(42),fill=(188,211,222),anchor='mm')
    ob(primary,beat['visualObject']['kind'],display,[255,720,570,190],value=value)
   elif action=='bottle-rotates-to-reveal-label':
    rect=bottle(img,p,beat.get('bottleLabel','INGREDIENT'))
    ob(primary,beat['visualObject']['kind'],'Illustrative bottle',rect,visibilityProgress=p)
   else:
    d.rounded_rectangle((110,730,970,1060),radius=38,fill=(174,44,64,230),outline=(255,166,175),width=7)
    d.text((540,840),'CALL 911',font=font(108),fill='white',anchor='mm')
    d.text((540,940),'FOR AN EMERGENCY',font=font(38),fill=(255,229,235),anchor='mm')
    ob(primary,beat['visualObject']['kind'],'CALL 911',[110,730,860,330],visibilityProgress=p)
   d=ImageDraw.Draw(img,'RGBA')
   if action=='ligand-enters-pocket':
    d.text((540,1518),'SYMBOLIC 3D MODEL',font=font(34),fill=(222,238,251),anchor='mm')
    d.text((540,1560),'NOT ATOMISTIC DOCKING',font=font(25),fill=(176,201,222),anchor='mm')
   if not separated and beat.get('onScreenSourceIds'):
    d.text((540,1645),' · '.join(beat['onScreenSourceIds']),font=font(24),fill=(178,198,212),anchor='mm')
   file=directory/('f'+str(fi).zfill(5)+'.png')
   if separated:
    # R8.18 physical object pixels, not inferred image differences.
    mechanism=out/'r819-layers'/bid/('f'+str(fi).zfill(5)+'-mechanism.png')
    img.save(mechanism)
    frames.append({'frameIndex':fi,'file':str(file.relative_to(out)),'sha256':None})
   else:
    img.convert('RGB').save(file)
    frames.append({'frameIndex':fi,'file':str(file.relative_to(out)),'sha256':digest(file.read_bytes())})
   if fi%6==0:samples.append({'time':round(scene['start']+fi/30,6),'objects':objects})
  telemetry_beats.append({'beatId':bid,'producer':{'instrumentation':'native-vtk-projection' if action in ('ligand-enters-pocket','reveals-hidden-action') else 'native-2d-canvas-geometry'},
    'frames':samples,'metrics':{'longestNativePocketDwellFrames':maxPocketStreak}})
  native_beats.append({'beatId':bid,'frames':frames});total+=count
 frame_doc={'schemaVersion':'ths-r818-native-frames-v1','fps':30,'width':W,'height':H,'beats':native_beats}
 trace_doc={'schemaVersion':'ths-r818-renderer-telemetry-v1','origin':'render-instrumentation',
   'rendererCodeSha256':job['rendererCodeSha256'],'renderedSceneAssetsSha256':job['renderedSceneAssetsSha256'],
   'sourceManifestSha256':job['sourceManifestSha256'],
   'physicalArtManifestSha256':job.get('physicalArtManifestSha256'),'canvas':{'width':W,'height':H},
   'sampleFps':5,'nativeFps':30,'beats':telemetry_beats}
 (out/'r818-native-frames.json').write_text(json.dumps(frame_doc,indent=2)+'\n')
 (out/'r818-telemetry.json').write_text(json.dumps(trace_doc,indent=2)+'\n')
 print(json.dumps({'status':'REAL_NATIVE_RENDER_COMPLETE','frames':total,'beats':len(native_beats)}))
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--job',required=True)
 args=parser.parse_args()
 produce(json.loads(Path(args.job).read_text()))
