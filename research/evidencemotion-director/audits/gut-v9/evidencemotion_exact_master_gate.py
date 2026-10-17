#!/usr/bin/env python3
"""Fail-closed, source-hash-locked EvidenceMotion exact-MP4 technical triage.

Research-only: observations are NOT independent science, subjective craft, native phone,
external speech, or release consent. Needs ffmpeg and ffprobe on PATH; stdlib only.
Never rewrites the input, generates audio, awards publication, or grades originality.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone

MAX_LUFS = -11.0  # internal conservative spoken-program flag, NOT TikTok's target
MAX_TRUE_PEAK = -1.0
MOTION_DIFF = 10
MOTION_MIN_CHANGED = 0.015 # heuristic; creative review, never certified pass


def command(cmd, *, binary=False):
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    stdout = p.stdout if binary else p.stdout.decode('utf-8','replace')
    stderr = p.stderr.decode('utf-8','replace')
    return p.returncode, stdout, stderr


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for part in iter(lambda: f.read(1024*1024), b''):
            h.update(part)
    return h.hexdigest()


def parse_srt(text):
    if not isinstance(text,str) or not text.strip():
        raise ValueError('Empty SRT captions')
    cues=[]
    ts=re.compile(r'(\d\d):(\d\d):(\d\d)[,.](\d\d\d)')
    def seconds(m):
        a=list(map(int, m.groups()))
        return a[0]*3600+a[1]*60+a[2]+a[3]/1000
    for chunk in re.split(r'\r?\n\s*\r?\n', text.strip()):
        lines=chunk.splitlines()
        timing=next((line for line in lines if '-->' in line),None)
        if not timing: raise ValueError('Untimed SRT cue block')
        l,r=(x.strip() for x in timing.split('-->',1))
        a,b=ts.fullmatch(l),ts.fullmatch(r)
        if not a or not b: raise ValueError('Malformed SRT timing: '+timing)
        idx=lines.index(timing)
        caption=' '.join(lines[idx+1:]).strip()
        if not caption: raise ValueError('Blank SRT caption text')
        cues.append({'start':seconds(a),'end':seconds(b),'text':caption})
    return cues


def extract_ebur128(output):
    section=output.rsplit('Summary:',1)[-1]
    def read(pattern):
        m=re.search(pattern,section)
        return float(m.group(1)) if m else None
    return {
        'integrated_lufs':read(r'Integrated loudness:\s*I:\s*([-\d.]+)\s*LUFS'),
        'loudness_range_lu':read(r'Loudness range:\s*LRA:\s*([-\d.]+)\s*LU'),
        'true_peak_dbtp':read(r'True peak:\s*Peak:\s*([-\d.]+)\s*dBFS'),
    }


def scene_motion(video,duration,boundaries):
    # READ real decoded frames at regular points (not metadata-only checks).
    frame_size=160*284
    rc,raw,err=command(['ffmpeg','-hide_banner','-loglevel','error','-i',str(video),'-vf','fps=2,scale=160:284,format=gray','-an','-f','rawvideo','-'],binary=True)
    if rc or len(raw)%frame_size: raise RuntimeError('Motion sampling failed: '+err[:200])
    scenes=[]; previous=None; samples=[]
    for k in range(len(raw)//frame_size):
        fr=raw[k*frame_size:(k+1)*frame_size]
        if previous is not None:
            diff=sum(abs(x-y)>MOTION_DIFF for x,y in zip(fr,previous))/frame_size
            samples.append((k/2,round(diff,5)))
        previous=fr
    for a,b in zip(boundaries,boundaries[1:]):
        vals=[s for t,s in samples if a+0.7<=t<b-0.2]  # exclude hard cuts and transition-adjacent samples
        avg=sum(vals)/len(vals) if vals else None
        scenes.append({'start_s':round(a,3),'end_s':round(b,3),'mean_global_change_fraction':round(avg,5) if avg is not None else None,'sampled_intervals':len(vals),'low_motion_heuristic':bool(avg is not None and avg<MOTION_MIN_CHANGED)})
    return {'sampling_fps':2,'diff_threshold_gray_levels':MOTION_DIFF,'method':'160x284 grayscale frame absolute difference; excludes ±transition intervals; NOT semantic motion/authorial evaluation','scenes':scenes}


def audit(video, expected, captions, caption_sha, boundaries):
    evidence=[]
    def add(code,status,detail): evidence.append({'code':code,'status':status,'detail':detail})
    result={'schema':'ths.exact-master-technical-triage.v1','tool_scope':'INTERNAL_MACHINE_TRIAGE_ONLY','mayPublish':False,'independently_verified':False,'owner_phone_verified':False,'film':str(video),'expected_sha256':expected,'checks':evidence,'status':'FAIL'}
    if not video.is_file():
        add('MEDIA_MISSING','FAIL',str(video));return result
    actual=sha256(video); result['actual_sha256']=actual
    if not re.fullmatch('[0-9a-f]{64}',expected or '') or actual!=expected:
        add('EXACT_MASTER_HASH','FAIL','Input hash mismatch or missing; no reassignment to newer output');return result
    add('EXACT_MASTER_HASH','PASS','SHA-256 matched provided immutable film identity')
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
        add('DECODER_TOOLS','FAIL','ffmpeg/ffprobe unavailable');return result
    rc,meta,err=command(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)])
    if rc: add('FFPROBE','FAIL',err[:500]);return result
    try: info=json.loads(meta)
    except json.JSONDecodeError: add('FFPROBE_JSON','FAIL','Invalid probe output');return result
    try:
        streams=info['streams']
        duration=float(info['format']['duration'])
    except (KeyError, TypeError, ValueError) as exc:
        add('FFPROBE_INCOMPLETE','FAIL',f'Malformed or missing video metadata: {type(exc).__name__}'); return result
    v=next((x for x in streams if x.get('codec_type')=='video'),None); a=next((x for x in streams if x.get('codec_type')=='audio'),None)
    result['duration_s']=duration
    result['video_stream']={k:v.get(k) for k in ('codec_name','width','height','r_frame_rate','nb_frames','bit_rate')} if v else None
    result['audio_stream']={k:a.get(k) for k in ('codec_name','sample_rate','channels')} if a else None
    if not v or not a: add('AV_STREAMS','FAIL','Missing H264 video or audio stream');return result
    if v['codec_name']!='h264' or a['codec_name']!='aac': add('CODEC','REVIEW','Unexpected video/audio codec')
    else: add('CODEC','PASS','H264 + AAC confirmed')
    rc,out,err=command(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-xerror','-i',str(video),'-map','0:v:0','-map','0:a:0','-f','null','-'])
    add('FULL_AV_DECODE','PASS' if rc==0 else 'FAIL','Full H264/AAC streams decoded to null' if rc==0 else err[-500:])
    rc,out,err=command(['ffmpeg','-nostdin','-hide_banner','-nostats','-i',str(video),'-map','0:a:0','-af','ebur128=peak=true','-f','null','-'])
    loud=extract_ebur128(err);result['loudness']=loud
    if rc or None in loud.values(): add('LOUDNESS_METRICS','FAIL','Failed EBU R128 analysis')
    else:
        add('LOUDNESS_HOT','FAIL' if loud['integrated_lufs']>MAX_LUFS else 'PASS',f"Measured {loud['integrated_lufs']} LUFS; internal ceiling {MAX_LUFS} LUFS (not platform loudness target)")
        add('TRUE_PEAK_MARGIN','FAIL' if loud['true_peak_dbtp']>MAX_TRUE_PEAK else 'PASS',f"Measured {loud['true_peak_dbtp']} dBTP; conservative ceiling {MAX_TRUE_PEAK} dBTP")
        add('VERY_LOW_DYNAMIC_RANGE','REVIEW' if loud['loudness_range_lu']<2.5 else 'PASS',f"Measured LRA {loud['loudness_range_lu']} LU; qualitative speech audition required")
    if int(v.get('bit_rate') or 0)<500000 and v.get('width')==1080 and v.get('height')==1920:
        add('VIDEO_BITRATE','REVIEW','1080x1920 video below 500 kb/s; inspect exact frames for codec/edge artifacts')
    if captions:
        if not captions.is_file() or not caption_sha or sha256(captions)!=caption_sha:
            add('CAPTION_SOURCE_SHA','FAIL','Sidecar caption file missing or unexpected hash')
        else:
            add('CAPTION_SOURCE_SHA','PASS','Exact SRT hash matched')
            try:
                cues=parse_srt(captions.read_text(encoding='utf-8'))
                overlap=[i for i,x in enumerate(cues) if x['end']<=x['start'] or x['start']<0 or x['end']>duration+.1 or (i and x['start']<cues[i-1]['end']-.03)]
                result['caption_cues']=len(cues)
                add('SRT_TIMING_SANITY','FAIL' if overlap else 'PASS',f'{len(cues)} cues; invalid/overlapping cue indexes: {overlap}')
                add('CAPTION_PHONEME_TRUTH','HOLD','SRT is acoustic draft; no verified independent ASR/forced-alignment/phoneme receipt in supplied package')
            except ValueError as exc: add('SRT_PARSE','FAIL',str(exc))
    else: add('CAPTION_SOURCE_SHA','HOLD','No SHA-locked SRT provided')
    if len(boundaries)<2 or boundaries[0]!=0 or abs(boundaries[-1]-duration)>.16 or sorted(set(boundaries))!=boundaries:
        add('SCENE_BOUNDARIES','FAIL','Boundaries must start at 0, be monotonic, end at source duration')
    else:
        try:
            result['motion_proxy']=scene_motion(video,duration,boundaries)
            for idx,sc in enumerate(result['motion_proxy']['scenes'],1):
                if sc['low_motion_heuristic']: add(f'SCENE_{idx:02}_MOTION','REVIEW',f"Only {100*sc['mean_global_change_fraction']:.2f}% of sampled grayscale pixels changed per 0.5s; does not prove poor craft")
        except RuntimeError as exc: add('ACTUAL_FRAME_MOTION','FAIL',str(exc))
    add('ONSCREEN_TEXT_DENSITY','HOLD','Decoded pixels need an approved full overlay+caption text inventory; text detection from source authoring not supplied')
    add('VISUAL_ARTIFACT_AND_CRAFT','HOLD','Not certified by codec decode, numerical motion, or internal self-score; require adversarial exact-frame visual review')
    add('REAL_HANDSET_PLAYBACK','HOLD','No actual device/UI playback receipt in package; do not ask owner to provide routine engineering critique')
    add('SOURCE_PCM_AND_MIX_PROVENANCE','HOLD','Original untampered voice WAV/source PCM is absent from supplied package; video AAC and README cannot prove preservation of performance or mix quality')
    add('INDEPENDENT_SCIENCE_AND_SPEECH','HOLD','Assistant source check is not qualified independent human review or phonetic verification')
    result['status']='FAIL' if any(c['status']=='FAIL' for c in evidence) else 'HOLD' if any(c['status']=='HOLD' for c in evidence) else 'REVIEW'
    return result


def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--video',type=Path,required=True)
    p.add_argument('--expected-sha256',required=True)
    p.add_argument('--captions',type=Path)
    p.add_argument('--caption-sha256')
    p.add_argument('--scenes',default='',help='comma separated scene start times in seconds; finish at exact film duration')
    p.add_argument('--output',type=Path,required=True)
    args=p.parse_args(argv)
    if args.scenes:
        starts=[float(x) for x in args.scenes.split(',')]
        # last boundary must include exact film duration; if unknown, probe below in audit would reject.
        bounds=starts
    else: bounds=[]
    # Prevent a read-only QA job from destroying its own immutable source by
    # targeting either input as the report (including via a symlink/alias).
    source_paths=[args.video.resolve()]
    if args.captions is not None: source_paths.append(args.captions.resolve())
    if args.output.resolve() in source_paths:
        print('REFUSED: report output aliases original video or captions',file=sys.stderr)
        return 1
    r=audit(args.video,args.expected_sha256,args.captions,args.caption_sha256,bounds)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
    print(f"Exact-film triage {r.get('status','FAIL')}: {args.output} sha={r.get('actual_sha256','MISSING')}")
    return 1 if r.get('status')=='FAIL' else 2 # zero is reserved for a future independently verified release controller, NOT THIS TOOL


if __name__=='__main__':sys.exit(main())