#!/usr/bin/env python3
"""Research-only editorial motion proof, source-bound RDKit -> Pillow -> FFmpeg.

A small renderer-neutral competitor to the Blender research lane, NOT a video
release. No narration, effects/dose/efficacy claims, production imports,
inference credits, schedule, owner laptop, or artistic self-approval.
"""
import argparse
import hashlib
import io
import json
import math
import subprocess
import time
from pathlib import Path

W,H,FPS,N=540,960,16,48
SRC_CID=44301524
SRC_KEY="RYENLSMHLCNXJT-CYXFISRXSA-N"
INK=(8,19,29)
PALE=(240,242,232)
MUTED=(140,163,165)
TEAL=(95,205,199)
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
MONO="/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def hold(reason):
    raise ValueError("EDITORIAL_RESEARCH_HOLD: "+reason)

def smooth(t):
    x=min(1.,max(0.,t))
    return x*x*(3-2*x)

def preflight(spec):
    if not isinstance(spec,dict) or spec.get("track")!="RESEARCH_ONLY" or spec.get("mayPublish") is not False:
        hold("FREEZE_OR_RESEARCH_IDENTITY")
    if spec.get("sourceCID")!=SRC_CID or spec.get("inchiKey")!=SRC_KEY:
        hold("PINNED_CHEMISTRY_DRIFT")
    if spec.get("scientificClaims")!=[] or spec.get("narraWav") is not None:
        hold("UNREVIEWED_SCIENCE_OR_UNAUDITIONED_VOICE")
    if spec.get("width")!=W or spec.get("height")!=H or spec.get("fps")!=FPS or spec.get("frames")!=N:
        hold("UNBOUNDED_COMPUTE")
    return {"status":"RESEARCH_ONLY_ALLOWED","mayRenderFinal":False,"mayPublish":False}

def config():
    return {"track":"RESEARCH_ONLY","mayPublish":False,"sourceCID":SRC_CID,
            "inchiKey":SRC_KEY,"scientificClaims":[],"narraWav":None,
            "width":W,"height":H,"fps":FPS,"frames":N}

def source_chemistry():
    from rdkit import Chem
    from rdkit.Chem.Draw import rdMolDraw2D
    from validated_7oh_chemistry import verified_graph,PUBCHEM_CID,INCHIKEY
    if PUBCHEM_CID!=SRC_CID or INCHIKEY!=SRC_KEY:
        hold("SOURCE_AUTHORITY_CHANGED")
    graph,oh=verified_graph()
    if graph.GetNumAtoms()!=30 or Chem.MolToInchiKey(graph)!=SRC_KEY:
        hold("MOL_GRAPH_IDENTITY_INVALID")
    if graph.GetAtomWithIdx(oh).GetSymbol()!="O":
        hold("OH_HIGHLIGHT_NOT_OXYGEN")
    canvas=rdMolDraw2D.MolDraw2DCairo(920,780)
    options=canvas.drawOptions()
    options.clearBackground=False
    options.bondLineWidth=3.5
    options.setBackgroundColour((0,0,0,0))
    options.setAtomPalette({6:(.8,.89,.89),7:(.3,.8,1.),8:(1.,.66,.36)})
    rdMolDraw2D.PrepareAndDrawMolecule(
        canvas,graph,highlightAtoms=[oh],
        highlightAtomColors={oh:(1.,.55,.14,.55)},highlightAtomRadii={oh:.43})
    canvas.FinishDrawing()
    from PIL import Image
    chem=Image.open(io.BytesIO(canvas.GetDrawingText())).convert("RGBA")
    return chem,oh

def frame(chem,index):
    from PIL import Image,ImageDraw,ImageFont
    if type(index) is not int or not 0<=index<N:
        hold("INVALID_FRAME_INDEX")
    t=index/FPS
    image=Image.new("RGB",(W,H),INK)
    d=ImageDraw.Draw(image,"RGBA")
    bold=lambda size:ImageFont.truetype(BOLD,size)
    reg=lambda size:ImageFont.truetype(FONT,size)
    mono=lambda size:ImageFont.truetype(MONO,size)
    d.rectangle((0,0,7,H),fill=TEAL)
    d.line((39,94,434,94),fill=(81,113,119,180),width=2)
    d.text((42,55),"THE HIPPIE SCIENTIST",font=mono(17),fill=TEAL)
    d.text((42,115),"FIELD NOTE / 001",font=mono(14),fill=MUTED)
    d.text((39,163),"7-OH",font=bold(95),fill=PALE)
    d.text((43,278),"What the structure",font=bold(31),fill=PALE)
    d.text((43,318),"actually shows",font=bold(31),fill=PALE)
    d.rounded_rectangle((28,404,438,787),26,
                        fill=(21,41,51,255),outline=(72,102,109,255),width=2)
    d.rectangle((45,422,420,425),fill=(77,123,132,255))
    progress=smooth((t-.15)/1.5)
    scale=1.13-.13*progress
    body=chem.copy()
    body.thumbnail((int(392*scale),int(350*scale)))
    lx=47+(380-body.width)//2
    ly=427+(337-body.height)//2
    layer=Image.new("RGBA",(W,H),(0,0,0,0))
    layer.alpha_composite(body,(lx,ly))
    mask=Image.new("L",(W,H),0)
    ImageDraw.Draw(mask).rounded_rectangle((42,435,428,769),18,fill=255)
    layer.putalpha(Image.composite(layer.getchannel("A"),Image.new("L",(W,H),0),mask))
    reveal=smooth((t-.2)/1.15)
    shutter=Image.new("L",(W,H),0)
    ImageDraw.Draw(shutter).rectangle((42,435,42+int(387*reveal),769),fill=255)
    layer.putalpha(Image.composite(layer.getchannel("A"),Image.new("L",(W,H),0),shutter))
    image=Image.alpha_composite(image.convert("RGBA"),layer)
    d=ImageDraw.Draw(image,"RGBA")
    d.text((43,800),"Source: PubChem CID 44301524",font=mono(15),fill=TEAL)
    d.text((43,835),"2D chemical diagram",font=mono(16),fill=PALE)
    d.text((43,865),"Not evidence of effects in humans",font=reg(17),fill=MUTED)
    d.line((43,902,436,902),fill=(81,113,119,185),width=2)
    d.text((43,920),"VISUAL EXPLANATION  /  RESEARCH ONLY",font=mono(12),fill=MUTED)
    return image.convert("RGB")

def render(destination):
    preflight(config())
    start=time.monotonic()
    output=Path(destination).resolve()
    output.mkdir(parents=True,exist_ok=True)
    chem,oh=source_chemistry()
    pngs=[]
    for i in range(N):
        name=output/("frame_%04d.png"%i)
        frame(chem,i).save(name)
        pngs.append(sha(name))
    if len(set(pngs))<10:
        hold("STATIC_RESEARCH_GRAPHIC")
    video=output/"editorial_2d_source_locked_RESEARCH_ONLY_SILENT.mp4"
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-nostdin","-y",
                    "-framerate",str(FPS),"-i",str(output/"frame_%04d.png"),
                    "-frames:v",str(N),"-c:v","libx264","-pix_fmt","yuv420p",
                    "-crf","18","-an",str(video)],check=True,timeout=120)
    if not video.is_file() or video.stat().st_size<10000:
        hold("VIDEO_MISSING")
    receipt={"status":"RESEARCH_2D_MOTION_FOR_ACTUAL_CRAFT_REVIEW",
             "sourceCID":SRC_CID,"inChIKey":SRC_KEY,
             "sourceAuthority":"validated_7oh_chemistry.verified_graph",
             "OHAtomIndex":oh,"fps":FPS,"frames":N,"resolution":[W,H],
             "videoSha256":sha(video),"wallSeconds":round(time.monotonic()-start,3),
             "voice":"NONE_SILENT_TEST_ONLY","mayPublish":False,
             "craftApproved":False,"ownerPhoneApproved":False,
             "scientificEditorialApproved":False,"productionIntegrated":False,
             "costUSD":"UNKNOWN"}
    (output/"editorial_2d_RESEARCH_ONLY_receipt.json").write_text(json.dumps(receipt,indent=2)+"\n")
    return receipt

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--out",required=True)
    args=parser.parse_args()
    print(json.dumps(render(args.out),indent=2))
