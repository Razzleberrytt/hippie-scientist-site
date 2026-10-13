#!/usr/bin/env python3
"""Bounded, fail-closed research CPU benchmark. Never a film release or craft certificate."""
from __future__ import annotations
import argparse, hashlib, json, os, subprocess, sys, time, zipfile
from pathlib import Path

ARCHIVE_SHA='2c2d06028e86978ce6799f58c5476a881144cff623322c3339f2d9c83ffe0618'
RENDERER_SHA='7b3233673cb1d69fadd3abc7e98a659236895eeb1f582b1d3eb9cdb94c80de69'
NARRATION_SHA='9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435'
SOURCES=('original/build_fullhd_matchcut.py','original/original_creative_brief.json','original/original_beat_timeline.json','original/original_kokoro_narration.wav')
SILENT_OUTPUT='7OH_FULLHD_NEW_CINEMATIC_REVIEW_SILENT.mp4'

def file_hash(path):
    digest=hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda:f.read(1<<20),b''):digest.update(chunk)
    return digest.hexdigest()

def valid_native_probe(data):
    videos=[s for s in data.get('streams',[]) if s.get('codec_type')=='video']
    if len(videos)!=1:return False
    s=videos[0]
    try:
        return (s.get('codec_name'),s.get('width'),s.get('height'),s.get('r_frame_rate'),int(s.get('nb_frames','-1')))==('h264',1080,1920,'30/1',1031)
    except (ValueError,TypeError):return False

def extract_exact_original(zip_path,target):
    target.mkdir(parents=True,exist_ok=True)
    if file_hash(zip_path)!=ARCHIVE_SHA:raise ValueError('UNTRUSTED_SOURCE_ZIP')
    with zipfile.ZipFile(zip_path) as z:
        if z.testzip() is not None:raise ValueError('INVALID_ZIP_DATA')
        for filename in SOURCES:
            if filename not in z.namelist():raise ValueError('PINNED_SOURCE_MISSING')
            with (target/Path(filename).name).open('wb') as f:f.write(z.read(filename))
    if file_hash(target/'build_fullhd_matchcut.py')!=RENDERER_SHA:raise ValueError('RENDERER_SHA_MISMATCH')
    if file_hash(target/'original_kokoro_narration.wav')!=NARRATION_SHA:raise ValueError('ORIGINAL_VOICE_SHA_MISMATCH')

def perform_run(archive,folder,number,timeout_seconds):
    target=folder/f'run_{number:02d}'
    extract_exact_original(archive,target)
    timing=target/'time.csv'
    env=os.environ.copy()
    env.update(VTK_DEFAULT_OPENGL_WINDOW='vtkEGLRenderWindow',LIBGL_ALWAYS_SOFTWARE='1')
    command=['/usr/bin/time','-f','%e,%U,%S,%M','-o',str(timing),
             sys.executable,str(target/'build_fullhd_matchcut.py')]
    started=time.monotonic()
    with (target/'stdout.log').open('w') as output,(target/'stderr.log').open('w') as errors:
        process=subprocess.Popen(command,cwd=target,env=env,stdout=output,stderr=errors)
        try:code=process.wait(timeout=timeout_seconds)
        except subprocess.TimeoutExpired:
            process.kill();process.wait();code=124
    metrics={'run':number,'status':'HOLD','exitCode':code,
             'controllerWallSeconds':round(time.monotonic()-started,3)}
    if timing.exists():
        try:
            seconds,user_cpu,system_cpu,peak_kib=timing.read_text().strip().split(',')
            metrics.update(wallSeconds=float(seconds),cpuUserSeconds=float(user_cpu),
                           cpuSystemSeconds=float(system_cpu),
                           totalCpuMinutes=round((float(user_cpu)+float(system_cpu))/60,4),
                           peakResidentMiB=round(int(peak_kib)/1024,2))
        except (ValueError,TypeError):metrics['timingDataInvalid']=True
    movie=target/SILENT_OUTPUT
    if code==0 and movie.exists():
        metrics['silentMovieSha256']=file_hash(movie)
        metrics['outputBytes']=movie.stat().st_size
        probe=subprocess.run(['ffprobe','-v','error','-show_streams','-of','json',str(movie)],capture_output=True,text=True)
        try:metrics['nativeFramesCorrect']=probe.returncode==0 and valid_native_probe(json.loads(probe.stdout))
        except (ValueError,TypeError):metrics['nativeFramesCorrect']=False
        decoded=subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(movie),'-f','null','-'],capture_output=True)
        metrics['fullDecodePass']=decoded.returncode==0
        if metrics['nativeFramesCorrect'] and metrics['fullDecodePass']:
            metrics['status']='PASS_TECHNICAL_ONLY'
    return metrics

def research_receipt(runs):
    n=len(runs)
    successes=sum(x.get('status')=='PASS_TECHNICAL_ONLY' for x in runs)
    return {'status':'PASS_RESEARCH_ONLY' if n and n==successes else 'HOLD',
            'attempts':n,'successes':successes,'observedFailureCount':n-successes,
            'observedFailureFraction':(n-successes)/n if n else None,
            'longTermFailureRateEstablished':False,
            'scope':'this exact cloud CPU container, NOT production social publishing or GitHub Actions benchmark',
            'modelUsage':'pinned CPU RDKit/VTK, no generative API; no GPU prerequisite',
            'sourceZipSha256':ARCHIVE_SHA,'rendererSha256':RENDERER_SHA,
            'originalKokoroWavSha256':NARRATION_SHA,
            'externalGenerationApiCostUsd':0,
            'computePriceUsd':'UNKNOWN; cloud-provider billed rate not supplied',
            'renderCostFormula':'dedicated_machine_hourly_rate_USD * sum(render_wall_seconds) / 3600 (estimate only)',
            'humanVoiceApproved':False,'devicePlaybackApproved':False,
            'scientificEditorialApproved':False,'craftApproved':False,'releaseApproved':False,
            'runs':runs}

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--archive',required=True,type=Path)
    p.add_argument('--root',required=True,type=Path)
    p.add_argument('--repeats',type=int,default=3)
    p.add_argument('--timeout-seconds',type=int,default=240)
    args=p.parse_args()
    if not (1<=args.repeats<=10 and 60<=args.timeout_seconds<=1800):raise SystemExit('INVALID_BOUNDED_BENCHMARK_PARAMETERS')
    if not args.archive.is_file() or file_hash(args.archive)!=ARCHIVE_SHA:raise SystemExit('SOURCE_ARCHIVE_DIGEST_MISMATCH')
    args.root.mkdir(parents=True,exist_ok=True)
    runs=[]
    for i in range(1,args.repeats+1):
        try:receipt=perform_run(args.archive,args.root,i,args.timeout_seconds)
        except Exception as e:receipt={'run':i,'status':'HOLD','error':str(e)}
        runs.append(receipt)
        (args.root/'BENCHMARK_RECEIPT.json').write_text(json.dumps(research_receipt(runs),indent=2)+'\n')
    return int(not all(x['status']=='PASS_TECHNICAL_ONLY' for x in runs))

if __name__=='__main__':sys.exit(main())
