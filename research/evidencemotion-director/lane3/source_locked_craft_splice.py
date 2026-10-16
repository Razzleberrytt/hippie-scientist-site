#!/usr/bin/env python3
"""Opt-in source-bound *research* splice of an independently supplied craft scene.

No dependency on a TTS/video generator. The manifest's SHA must be supplied by
an independent caller; a manifest cannot bless itself. Source/video bytes are
verified before execution, archived AAC remains stream-copied, and no artistic,
scientific, phone or publication approval is ever produced by this script.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess

SCHEMA='ths-lane3-exact-film-splice-research-v1'
SHA=re.compile(r'^[0-9a-f]{64}$')

class CraftHold(ValueError):
    pass

def digest(p):
    h=hashlib.sha256()
    with open(p,'rb') as f:
        for chunk in iter(lambda: f.read(1<<20),b''):h.update(chunk)
    return h.hexdigest()

def run(args, *, binary=False):
    x=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if x.returncode:
        raise CraftHold('FFMPEG_HOLD: '+x.stderr.decode(errors='replace')[:500])
    return x.stdout if binary else x.stdout.decode()

def media_info(path):
    raw=run(['ffprobe','-v','error','-show_entries',
      'stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,sample_rate',
      '-of','json',str(path)])
    streams=json.loads(raw).get('streams',[])
    video=[s for s in streams if s.get('codec_type')=='video']
    audio=[s for s in streams if s.get('codec_type')=='audio']
    if len(video)!=1 or len(audio)>1:
        raise CraftHold('AMBIGUOUS_TRACK_LAYOUT')
    return video[0],audio

def trusted_manifest(path,expected_sha):
    if not isinstance(expected_sha,str) or not SHA.fullmatch(expected_sha):
        raise CraftHold('EXTERNAL_MANIFEST_SHA_REQUIRED')
    if digest(path)!=expected_sha:
        raise CraftHold('EXTERNAL_MANIFEST_SHA_MISMATCH')
    try:
        m=json.loads(Path(path).read_text('utf-8'))
    except (ValueError,UnicodeError) as exc:
        raise CraftHold('INVALID_MANIFEST_JSON') from exc
    needed={
      'schema':SCHEMA,'researchOnly':True,'mayPublish':False,
      'scienceApproved':False,'craftApproved':False,'phonePlaybackApproved':False,
      'sourceFilmSha256':str,'craftSceneSha256':str,
      'frames':int,'width':int,'height':int,'fps':int,
      'startFrame':int,'endFrameExclusive':int,
      'computedSpokenOnsetSec':float,'negationSpokenOnsetSec':float,
      'originalNarrationSha256':str
    }
    if not isinstance(m,dict):raise CraftHold('INVALID_MANIFEST_SHAPE')
    for key,expected in needed.items():
        value=m.get(key)
        if type(expected) is type and expected in (int,float,str):
            if type(value) is not expected:raise CraftHold('INVALID_FIELD_'+key)
        elif value!=expected:raise CraftHold('INVALID_FIELD_'+key)
    for key in ('sourceFilmSha256','craftSceneSha256','originalNarrationSha256'):
        if not SHA.fullmatch(m[key]):raise CraftHold('INVALID_SHA_'+key)
    start,end,count=m['startFrame'],m['endFrameExclusive'],m['frames']
    if not (m['fps']==30 and m['width']==1080 and m['height']==1920 and
            0<=start<end<=count and end-start>=2 and count<=5400):
        raise CraftHold('INVALID_FILM_GEOMETRY')
    # Manifest assertions are intent only, NEVER evidence of what the film shows.
    if not(start/30 <= m['computedSpokenOnsetSec'] < m['negationSpokenOnsetSec'] < end/30):
        raise CraftHold('CUE_OUTSIDE_OWNED_SHOT')
    return m

def preflight(source,scene,manifest):
    if digest(source)!=manifest['sourceFilmSha256']:
        raise CraftHold('SOURCE_FILM_REVISION_MISMATCH')
    if digest(scene)!=manifest['craftSceneSha256']:
        raise CraftHold('REPLACEMENT_SCENE_REVISION_MISMATCH')
    a,aa=media_info(source);b,bb=media_info(scene)
    props=(manifest['width'],manifest['height'],f"{manifest['fps']}/1")
    for name,v,frames in [('SOURCE',a,manifest['frames']),
                          ('CRAFT_SCENE',b,manifest['endFrameExclusive']-manifest['startFrame'])]:
        if (v.get('codec_name')!='h264' or
          (v.get('width'),v.get('height'),v.get('r_frame_rate'))!=props or
          str(v.get('nb_frames'))!=str(frames)):
            raise CraftHold(name+'_CODEC_FRAME_OR_SIZE_MISMATCH')
    if len(aa)!=1 or aa[0].get('codec_name')!='aac' or aa[0].get('sample_rate')!='24000':
        raise CraftHold('SOURCE_ORIGINAL_AAC_REQUIRED')
    if bb:raise CraftHold('REPLACEMENT_MUST_BE_SILENT')
    return True

def aac_sha(path):
    data=run(['ffmpeg','-v','error','-i',str(path),'-map','0:a:0',
              '-c:a','copy','-f','adts','-'],binary=True)
    return hashlib.sha256(data).hexdigest()

def verify_result(source,output,manifest):
    v,a=media_info(output)
    if (v.get('codec_name')!='h264' or v.get('width')!=manifest['width'] or
        v.get('height')!=manifest['height'] or v.get('r_frame_rate')!='30/1' or
        str(v.get('nb_frames'))!=str(manifest['frames']) or
        len(a)!=1 or a[0].get('codec_name')!='aac'):
        raise CraftHold('SPLICED_OUTPUT_TECHNICAL_MISMATCH')
    original,updated=aac_sha(source),aac_sha(output)
    if original!=updated:raise CraftHold('ORIGINAL_AAC_BYTES_CHANGED')
    return {'schema':SCHEMA,'status':'RESEARCH_ONLY_AAC_COPY_VERIFIED',
      'sourceFilmSha256':digest(source),'sceneSha256':manifest['craftSceneSha256'],
      'outputFilmSha256':digest(output),'aacAdtsSha256':original,
      'frames':manifest['frames'],'startFrame':manifest['startFrame'],
      'endFrameExclusive':manifest['endFrameExclusive'],
      'scienceApproved':False,'craftApproved':False,
      'phonePlaybackApproved':False,'mayPublish':False,
      'limits':['AUDIO_ONLY_AND_TECHNICAL_CHECKS: not independent source-science or mobile QA',
                'No actual spoken-onset pixel/word audit; manifest times are not proof',
                'No external craft reference shelf or viewer-comprehension authority',
                'Video outside inserted scene was re-encoded, not byte-identical']}

def splice(source,scene,output,manifest):
    preflight(source,scene,manifest)
    output=Path(output);output.parent.mkdir(parents=True,exist_ok=True)
    if output.resolve() in (Path(source).resolve(),Path(scene).resolve()):
        raise CraftHold('REFUSE_OVERWRITE_INPUT')
    temp=output.with_name(output.stem+'.tmp'+output.suffix)
    start,end=manifest['startFrame'],manifest['endFrameExclusive']
    graph=(f'[0:v]trim=end_frame={start},setpts=PTS-STARTPTS,setsar=1[a];'
           '[1:v]setpts=PTS-STARTPTS,setsar=1[b];'
           f'[0:v]trim=start_frame={end},setpts=PTS-STARTPTS,setsar=1[c];'
           '[a][b][c]concat=n=3:v=1:a=0,format=yuv420p[out]')
    try:
        run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(source),
           '-i',str(scene),'-filter_complex',graph,'-map','[out]','-map','0:a:0',
           '-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',
           '-c:a','copy','-movflags','+faststart',str(temp)])
        receipt=verify_result(source,temp,manifest)
        os.replace(temp,output)
        output.with_suffix('.receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
        return receipt
    finally:
        if temp.exists():temp.unlink()

if __name__=='__main__':
    ap=argparse.ArgumentParser()
    ap.add_argument('--source',type=Path,required=True)
    ap.add_argument('--scene',type=Path,required=True)
    ap.add_argument('--output',type=Path,required=True)
    ap.add_argument('--manifest',type=Path,required=True)
    ap.add_argument('--external-manifest-sha256',required=True)
    args=ap.parse_args()
    print(json.dumps(splice(args.source,args.scene,args.output,
         trusted_manifest(args.manifest,args.external_manifest_sha256)),indent=2))
