"""Offline, source-locked computed 7-OH camera shot for the R8.18 native producer.

A molecular *structure* illustration, not observed receptor action, a reaction,
a clinical outcome, or experimental docking. Native VTK image and projected
object telemetry originate from the same verified RDKit computed conformer.
"""
import math, hashlib
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from rdkit import Chem
from rdkit.Chem import AllChem, rdMolDescriptors
import vtk
from vtk.util.numpy_support import vtk_to_numpy

SOURCE={
 'pubchemCid':44301524,
 'inchiKey':'RYENLSMHLCNXJT-CYXFISRXSA-N',
 'formula':'C23H30N2O5',
 'smiles':r'CC[C@@H]1CN2CC[C@]3(C(=NC4=C3C(=CC=C4)OC)[C@@H]2C[C@@H]1/C(=C\OC)/C(=O)OC)O',
 'url':'https://pubchem.ncbi.nlm.nih.gov/compound/44301524',
}
ID_KEYS=('pubchemCid','inchiKey','formula','url')
CLAIM='STRUCTURE-PUBCHEM-44301524'

def source_identity(beat):
 if hashlib.sha256(Path(__file__).read_bytes()).hexdigest()!=beat.get('molecularRuntimeSha256'):
  raise ValueError('R8.18 molecular original geometry renderer SHA mismatch')
 if beat.get('molecularIdentity')!={k:SOURCE[k] for k in ID_KEYS}:
  raise ValueError('R8.18 computed molecular shot requires exact PubChem identity')
 p=beat.get('telemetryProof') or {}
 if (beat.get('semanticAction')!='source-locked-molecular-focus'
     or beat.get('artMethod')!='rendered-3d'
     or p.get('sourceClaimId')!=CLAIM
     or CLAIM not in beat.get('claimIds',[])
     or 'PubChem:44301524' not in beat.get('onScreenSourceIds',[])
     or p.get('primaryObjectId')!=p.get('subjectObjectId')
     or p.get('primaryObjectId')==p.get('targetObjectId')
     or beat.get('visualObject',{}).get('kind')!='source-verified-molecule'
     or p.get('beforeLabel')!='Computed 7-OH conformer'
     or p.get('afterLabel')!='Source-verified hydroxyl oxygen'):
  raise ValueError('R8.18 molecular shot missing exact structural source/telemetry binding')
 mol=Chem.MolFromSmiles(SOURCE['smiles'])
 if mol is None or Chem.MolToInchiKey(mol)!=SOURCE['inchiKey'] or rdMolDescriptors.CalcMolFormula(mol)!=SOURCE['formula']:
  raise ValueError('R8.18 source-bound 7-OH graph does not match PubChem')
 site=[a.GetIdx() for a in mol.GetAtoms() if a.GetSymbol()=='O' and a.GetTotalNumHs()>0]
 if len(site)!=1 or mol.GetNumAtoms()!=30:
  raise ValueError('R8.18 source-verified hydroxyl site is ambiguous')
 return mol,site[0]

def sphere(ren,radius,color,position):
 source=vtk.vtkSphereSource();source.SetRadius(radius);source.SetThetaResolution(20);source.SetPhiResolution(18)
 mapper=vtk.vtkPolyDataMapper();mapper.SetInputConnection(source.GetOutputPort())
 actor=vtk.vtkActor();actor.SetMapper(mapper);actor.SetPosition(*[float(v) for v in position])
 actor.GetProperty().SetColor(*color);actor.GetProperty().SetSpecular(.68);actor.GetProperty().SetSpecularPower(40)
 ren.AddActor(actor)
 return actor

def create_stage(beat):
 original,site=source_identity(beat)
 mol=Chem.AddHs(original)
 if AllChem.EmbedMolecule(mol,randomSeed=20261028,maxAttempts=100)!=0:
  raise ValueError('R8.18 molecular conformer embedding failed')
 if AllChem.MMFFOptimizeMolecule(mol,maxIters=300)!=0:
  raise ValueError('R8.18 source-molecule optimization failed')
 pos=np.asarray(mol.GetConformer().GetPositions(),dtype=float)
 pos-=pos.mean(axis=0);oh=pos[site].copy()
 ren=vtk.vtkRenderer();ren.SetBackground(.018,.032,.045)
 win=vtk.vtkRenderWindow();win.SetOffScreenRendering(1);win.SetSize(1080,1200);win.AddRenderer(ren)
 cam=ren.GetActiveCamera();cam.SetViewUp(0,0,1);cam.SetViewAngle(35)
 for xyz,intensity in [((-7,-9,12),1.25),((8,4,4),.55)]:
  light=vtk.vtkLight();light.SetPosition(*xyz);light.SetIntensity(intensity);ren.AddLight(light)
 palette={'C':(.59,.77,.82),'N':(.24,.63,.91),'O':(1,.46,.31),'H':(.91,.94,.94)}
 for atom in mol.GetAtoms():
  el=atom.GetSymbol();sphere(ren,{'C':.30,'N':.32,'O':.35,'H':.16}[el],palette[el],pos[atom.GetIdx()])
 for bond in mol.GetBonds():
  a=pos[bond.GetBeginAtomIdx()];b=pos[bond.GetEndAtomIdx()]
  line=vtk.vtkLineSource();line.SetPoint1(*[float(x) for x in a]);line.SetPoint2(*[float(x) for x in b])
  tube=vtk.vtkTubeFilter();tube.SetInputConnection(line.GetOutputPort());tube.SetRadius(.09);tube.SetNumberOfSides(12);tube.CappingOn()
  mapper=vtk.vtkPolyDataMapper();mapper.SetInputConnection(tube.GetOutputPort())
  actor=vtk.vtkActor();actor.SetMapper(mapper);actor.GetProperty().SetColor(.65,.73,.77);ren.AddActor(actor)
 halo=sphere(ren,.60,(1,.63,.34),oh);halo.GetProperty().SetOpacity(0)
 return {'win':win,'ren':ren,'cam':cam,'positions':pos,'oh':oh,'halo':halo,
         'font':ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',38),
         'small':ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',23)}

def frame(stage,t):
 t=max(0,min(1,float(t)));p=t*t*(3-2*t)
 ren=stage['ren'];cam=stage['cam'];win=stage['win'];oh=stage['oh']
 focus=min(.78,max(0,(p-.28)/.72))*oh
 distance=35-17*max(0,(p-.24)/.76)
 angle=math.radians(15+12*p)
 cam.SetFocalPoint(*[float(x) for x in focus])
 cam.SetPosition(float(focus[0]+distance*math.sin(angle)),
                 float(focus[1]-distance*math.cos(angle)),float(focus[2]+4.3-1.2*p))
 stage['halo'].GetProperty().SetOpacity(max(0,min(.22,(p-.46)*.55)))
 win.Render()
 capture=vtk.vtkWindowToImageFilter();capture.SetInput(win);capture.SetInputBufferTypeToRGB()
 capture.ReadFrontBufferOff();capture.Update()
 px=vtk_to_numpy(capture.GetOutput().GetPointData().GetScalars()).reshape(1200,1080,3)
 picture=Image.fromarray(np.flipud(px).copy(),'RGB')
 canvas=Image.new('RGBA',(1080,1920),(7,18,25,255));canvas.alpha_composite(picture.convert('RGBA'),(0,280))
 d=ImageDraw.Draw(canvas,'RGBA')
 d.text((74,310),'7-OH: THE HYDROXYL SITE',font=stage['font'],fill=(235,242,232,255))
 if p>.45:
  opacity=max(0,min(255,int((p-.45)*800)))
  d.rounded_rectangle((77,1540,865,1626),radius=20,fill=(11,33,43,opacity),outline=(96,172,162,opacity),width=3)
  d.text((103,1570),'SOURCE-VERIFIED OXYGEN SITE',font=stage['small'],fill=(240,177,111,opacity))
 d.text((76,1780),'COMPUTED CONFORMER  ·  PUBCHEM 44301524',font=stage['small'],fill=(161,189,192,255))
 def project(v):
  ren.SetWorldPoint(*[float(x) for x in v],1.0);ren.WorldToDisplay();x,y,_=ren.GetDisplayPoint()
  return (max(0,min(1079,float(x))),max(280,min(1479,1480-float(y))))
 points=[project(v) for v in stage['positions']]
 xs=[p[0] for p in points];ys=[p[1] for p in points]
 x0=max(0,min(xs)-16);y0=max(280,min(ys)-16);x1=min(1080,max(xs)+16);y1=min(1480,max(ys)+16)
 hx,hy=project(oh)
 return canvas,{'molecule':[x0,y0,max(1,x1-x0),max(1,y1-y0)],
                'hydroxyl':[max(0,hx-38),max(280,hy-38),76,76],
                'emphasisLevel':round(max(0,min(1,(p-.4)/.5)),4),
                'cameraDistance':round(float(distance),4)}
