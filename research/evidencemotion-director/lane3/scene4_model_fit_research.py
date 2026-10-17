#!/usr/bin/env python3
"""Research-only repair of cropped calculated-3D panel from actual pinned H264.

No molecule, chemistry, narration, caption, title, shot timing or release changed.
Reframe 3D pixels copied from SAME-frame archived model, not a new simulation.
Outputs a SILENT scene for an independently manifested source-locked splice.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
from PIL import Image

REVISED_SHA='e79e44746e8a8581ecc592e41de20bb67ded7e999042234902ed30b0142a0c9a'
ORIGINAL_SHA='2851c9ce6bbac6c5bd396c28cb4ab3c59caf5a4f5baaa1ffddc77f05bfd6988a'
STORY_SHA='70e6bb416bc79c59ebb0d8590801df4494d0112c2fc30b6821506068a3b143f7'
MOL_SHA='150ccd331963beab2481ad47c36e1e171db6bdd37e4d50746a3d6b4b5be60bcb'
NARRATION_SHA='9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435'
W,H,FPS,N=1080,1920,30,1031
FIRST,LAST=498,702
COMPUTED=555
TARGET=(507,650,997,932)
# Erase the entire lower tail of the originally clipped molecule, stopping
# ABOVE the immutable 'Not a receptor recording' footer glyphs.
ERASE=(507,650,997,960)
FOOTER_START=960
ORIGINAL_MODEL=(35,650,800,1080)

class CraftHold(ValueError):pass

def sha(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
    return h.hexdigest()

def preflight(revised,archived,story,mol):
    for path,expected,label in ((revised,REVISED_SHA,'REVISED_FILM'),(archived,ORIGINAL_SHA,'ARCHIVED_FILM'),(story,STORY_SHA,'STORY'),(mol,MOL_SHA,'MOL')):
        if not Path(path).is_file() or sha(path)!=expected:raise CraftHold(label+'_SHA_MISMATCH')
    data=json.loads(Path(story).read_text('utf8'))
    if (data.get('encodedH264Sha256')!=REVISED_SHA or data.get('mayPublish') is not False or
        len(data.get('shots',[]))!=9 or data['shots'][4].get('shot')!='sentence_4'):
        raise CraftHold('STORY_REVISED_FILM_OR_SCENE_MISMATCH')
    from rdkit import Chem
    m=Chem.MolFromMolBlock(Path(mol).read_text(),removeHs=False)
    if m is None or Chem.MolToInchiKey(Chem.RemoveHs(m))!='RYENLSMHLCNXJT-CYXFISRXSA-N':
        raise CraftHold('MOLECULE_STEREO_IDENTITY_MISMATCH')
    for movie in (revised,archived):
        x=subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=codec_name,width,height,r_frame_rate,nb_frames','-of','json',str(movie)],capture_output=True,check=True)
        v=json.loads(x.stdout)['streams'][0]
        if (v['codec_name'],v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))!=('h264',W,H,'30/1',N):raise CraftHold('NON_NATIVE_SOURCE_FILM')

def reframe(revised_frame,archived_frame,n):
    if not FIRST<=n<LAST:raise CraftHold('SCENE_FRAME_OUT_OF_BOUNDS')
    if revised_frame.size!=(W,H) or archived_frame.size!=(W,H):raise CraftHold('NATIVE_FRAME_REQUIRED')
    if n<COMPUTED:return revised_frame.copy()
    result=revised_frame.copy()
    # The original archived movie preserves the COMPLETE rigid calculated pose;
    # crop a full model, not the older truncating y=572..953 image.
    src=archived_frame.crop(ORIGINAL_MODEL)
    dest_w,dest_h=TARGET[2]-TARGET[0],TARGET[3]-TARGET[1]
    contained=Image.new('RGB',(dest_w,dest_h),(14,36,48))
    src.thumbnail((dest_w-4,dest_h-4),Image.Resampling.LANCZOS)
    left=(dest_w-src.width)//2;top=(dest_h-src.height)//2
    contained.paste(src,(left,top))
    # Feather source-background boundaries, but erase the old clipped model
    # FIRST or partial legacy atoms will remain behind the enlarged model.
    mask=Image.new('L',(dest_w,dest_h),0)
    pixels=mask.load()
    for y in range(dest_h):
        for x in range(dest_w):
            d=min(x,y,dest_w-1-x,dest_h-1-y)
            pixels[x,y]=max(0,min(255,round(255*d/16)))
    result.paste((14,36,48),ERASE)
    result.paste(contained,(TARGET[0],TARGET[1]),mask)
    return result

def selected_frames(film):
    command=['ffmpeg','-nostdin','-v','error','-xerror','-i',str(film),'-map','0:v:0',
             '-vf',f'select=between(n\\,{FIRST}\\,{LAST-1})','-vsync','0',
             '-f','rawvideo','-pix_fmt','rgb24','-']
    return subprocess.Popen(command,stdout=subprocess.PIPE,stderr=subprocess.PIPE)

def render(revised,archived,story,mol,output):
    paths=(Path(revised),Path(archived),Path(story),Path(mol))
    out=Path(output)
    if out.exists() or out.is_symlink() or out.resolve() in [p.resolve() for p in paths]:
        raise CraftHold('FRESH_NON_SOURCE_OUTPUT_REQUIRED')
    preflight(*paths)
    out.parent.mkdir(parents=True,exist_ok=True)
    enc_cmd=['ffmpeg','-nostdin','-v','error','-xerror','-n','-f','rawvideo','-pix_fmt','rgb24',
             '-s',f'{W}x{H}','-r',str(FPS),'-i','-', '-an','-c:v','libx264','-preset','veryfast',
             '-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(out)]
    deca=selected_frames(revised);decb=selected_frames(archived)
    enc=subprocess.Popen(enc_cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    size=W*H*3
    try:
        for n in range(FIRST,LAST):
            a=deca.stdout.read(size);b=decb.stdout.read(size)
            if len(a)!=size or len(b)!=size:raise CraftHold('SOURCE_SCENE_DECODE_SHORT')
            edited=reframe(Image.frombytes('RGB',(W,H),a),Image.frombytes('RGB',(W,H),b),n)
            enc.stdin.write(edited.tobytes())
        if deca.stdout.read(1) or decb.stdout.read(1):raise CraftHold('SOURCE_SCENE_DECODE_EXTRA')
        for proc in (deca,decb):
            if proc.wait()!=0:raise CraftHold('SOURCE_SCENE_DECODER_FAILED')
        enc.stdin.close()
        if enc.wait()!=0:raise CraftHold('SILENT_REPAIR_ENCODER_FAILED')
        if any(sha(p)!=digest for p,digest in zip(paths,(REVISED_SHA,ORIGINAL_SHA,STORY_SHA,MOL_SHA))):
            raise CraftHold('SOURCE_CHANGED_DURING_RENDER')
    except BaseException:
        for proc in (deca,decb,enc):
            if proc.poll() is None:proc.kill()
            proc.wait()
        if out.exists():out.unlink()
        raise
    finally:
        for proc in (deca,decb):
            proc.stdout.close();proc.stderr.close()
        enc.stderr.close()
    return {'schema':'ths-lane3-original-source-model-fit-research-v2',
            'sourceFilmSha256':REVISED_SHA,'archivedModelFilmSha256':ORIGINAL_SHA,
            'originalNarrationSha256':NARRATION_SHA,'moleculeSha256':MOL_SHA,
            'silentSceneSha256':sha(out),'startFrame':FIRST,'endFrameExclusive':LAST,
            'computedFirstFrame':COMPUTED,'frameSize':[W,H],'fps':FPS,
            'scienceApproved':False,'craftApproved':False,'phonePlaybackApproved':False,
            'excellentCertified':False,'mayPublish':False}

if __name__=='__main__':
    p=argparse.ArgumentParser()
    for name in ('revised','archived','story','mol','output'):p.add_argument('--'+name,required=True)
    a=vars(p.parse_args())
    print(json.dumps(render(**a),indent=2))
