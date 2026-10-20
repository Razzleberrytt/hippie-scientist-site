#!/usr/bin/env python3
"""Lane 3 research-only negative screen for source-locked science artwork.

The exact 845-frame film and exact source are decoded in presentation order.
Science/art labels above the original body panel cannot be silently erased
to fit larger replacement text. This is pixel-change evidence, NOT OCR,
independent source approval, handset, craft acceptance or publish permission.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
from pathlib import Path
import subprocess

FRAME_COUNT = 845
SCENES = ((0,118),(119,257),(258,391),(392,546),(547,717),(718,844))
ORIGINAL_FILM_SHA = '044c1f0573f01d3fe850cbd74f270c90019cc3e37b364a0fa627d56e7ecb39f2'
PROTECTED_REGION = (150,1238,850,1306)
PREVIEW_SCALE = (350,34)
EXPERIMENTAL_MAX_REPAINT_MAE = 1.0

class ArtHold(ValueError):
    pass

def digest(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as handle:
        for part in iter(lambda: handle.read(1024*1024),b''):
            h.update(part)
    return h.hexdigest()

def validate_input(path,expected_sha):
    path=Path(path)
    if path.is_symlink() or not path.is_file() or not path.stat().st_size:
        raise ArtHold('ENCODED_MOVIE_NOT_REGULAR_SOURCE')
    if not isinstance(expected_sha,str) or len(expected_sha)!=64 or any(c not in '0123456789abcdef' for c in expected_sha):
        raise ArtHold('MOVIE_EXPECTED_SHA_MISSING')
    if digest(path)!=expected_sha:
        raise ArtHold('ENCODED_MOVIE_SHA_MISMATCH')
    return path

def frame_mae(a,b):
    if not isinstance(a,bytes) or not isinstance(b,bytes) or not a or len(a)!=len(b):
        raise ArtHold('DIFFERENT_OR_EMPTY_FRAME_BYTES')
    return sum(abs(x-y) for x,y in zip(a,b))/len(a)

def scene_report(per_scene,*,source_sha,candidate_sha,expected_count):
    if not isinstance(per_scene,list) or len(per_scene)!=len(SCENES) or type(expected_count) is not int or expected_count<1:
        raise ArtHold('SCENE_INVENTORY_INVALID')
    findings=[]
    for idx,((lo,hi),values) in enumerate(zip(SCENES,per_scene),1):
        if not isinstance(values,list) or len(values)!=hi-lo+1:
            raise ArtHold('PROTECTED_ART_FRAME_COVERAGE_INVALID')
        if any(type(v) not in (float,int) or not math.isfinite(v) or not 0<=v<=255 for v in values):
            raise ArtHold('PROTECTED_ART_METRIC_INVALID')
        offending=[lo+j for j,v in enumerate(values) if v>EXPERIMENTAL_MAX_REPAINT_MAE]
        findings.append({'scene':idx,'frameRangeInclusive':[lo,hi],
                         'nativeArea':list(PROTECTED_REGION),
                         'framesChecked':len(values),
                         'worstFrame':lo+max(range(len(values)),key=lambda j:values[j]),
                         'maxGrayMae255':round(max(values),5),
                         'minGrayMae255':round(min(values),5),
                         'violatingFrames':len(offending),
                         'firstViolatingFrame':offending[0] if offending else None})
    if sum(x['framesChecked'] for x in findings)!=expected_count:
        raise ArtHold('PROTECTED_ART_FRAME_TOTAL_MISMATCH')
    failed=sum(x['violatingFrames'] for x in findings)
    return {'schema':'ths-em-lane3-exact-film-protected-art-negative-screen-v1',
       'status':('FAIL_ENCODED_SCIENCE_ART_OVERPAINT' if failed else 'NO_PROTECTED_ART_REPAINT_DETECTED_ONLY'),
       'sourceSha256':source_sha,'candidateSha256':candidate_sha,'frameCount':expected_count,
       'scenes':findings,'badFrames':failed,
       'experimentalThresholdGrayMae255':EXPERIMENTAL_MAX_REPAINT_MAE,
       'everyPhysicalSourceAndCandidateFrameDecoded':True,
       'notOCR':True,'notScienceTruthApproval':True,'realPhoneApproved':False,
       'excellentCertified':False,'mayPublish':False,'newAcceptedAtomicCards':0}

def _open_decoder(path):
    xa,ya,xb,yb=PROTECTED_REGION
    w,h=PREVIEW_SCALE
    args=['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-xerror',
          '-err_detect','explode','-i',str(path),'-map','0:v:0',
          '-vf',f'crop={xb-xa}:{yb-ya}:{xa}:{ya},scale={w}:{h}:flags=area,format=gray',
          '-vsync','0','-f','rawvideo','-']
    try:
        return subprocess.Popen(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    except OSError as exc:
        raise ArtHold('NO_NATIVE_H264_DECODER') from exc

def _exact_read(stream,n):
    parts=[];remaining=n
    while remaining:
        part=stream.read(remaining)
        if not part:
            raise ArtHold('ENCODED_FRAME_MISSING_OR_TRUNCATED')
        parts.append(part);remaining-=len(part)
    return b''.join(parts)

def audit(source,candidate,candidate_sha):
    source=validate_input(source,ORIGINAL_FILM_SHA)
    candidate=validate_input(candidate,candidate_sha)
    if source.resolve()==candidate.resolve():
        raise ArtHold('SOURCE_AND_CANDIDATE_NOT_DISTINCT')
    a,b=_open_decoder(source),_open_decoder(candidate)
    size=PREVIEW_SCALE[0]*PREVIEW_SCALE[1]
    vals=[[] for _ in SCENES]
    try:
        for frame in range(FRAME_COUNT):
            old=_exact_read(a.stdout,size)
            new=_exact_read(b.stdout,size)
            i=next(i for i,(start,end) in enumerate(SCENES) if start<=frame<=end)
            vals[i].append(frame_mae(old,new))
        if a.stdout.read(1) or b.stdout.read(1):
            raise ArtHold('EXTRA_ENCODED_FRAMES')
        for proc in (a,b):
            if proc.wait(timeout=30)!=0:
                raise ArtHold('NATIVE_H264_DECODE_FAILED')
        if digest(source)!=ORIGINAL_FILM_SHA or digest(candidate)!=candidate_sha:
            raise ArtHold('FILM_BYTES_MUTATED_DURING_AUDIT')
        return scene_report(vals,source_sha=ORIGINAL_FILM_SHA,
                            candidate_sha=candidate_sha,expected_count=FRAME_COUNT)
    finally:
        for proc in (a,b):
            if proc.poll() is None:proc.kill();proc.wait()
            if proc.stdout:proc.stdout.close()
            if proc.stderr:proc.stderr.close()

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source',type=Path,required=True)
    parser.add_argument('--candidate',type=Path,required=True)
    parser.add_argument('--candidate-sha256',required=True)
    parser.add_argument('--out',type=Path,required=True)
    args=parser.parse_args()
    if args.out.exists() or args.out.resolve() in (args.source.resolve(),args.candidate.resolve()):
        raise ArtHold('FRESH_REPORT_PATH_REQUIRED')
    report=audit(args.source,args.candidate,args.candidate_sha256)
    args.out.write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
    print(json.dumps({'status':report['status'],'badFrames':report['badFrames'],'mayPublish':False}))
    if report['badFrames']:
        raise SystemExit(2)

if __name__=='__main__':main()
