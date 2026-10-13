#!/usr/bin/env python3
"""Bounded, fail-closed research CPU benchmark. Never a film release or craft certificate."""
from __future__ import annotations
import argparse, hashlib, json, math, os, signal, subprocess, sys, time, zipfile
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

def terminate_render_process_group(process):
    """Stop the /usr/bin/time wrapper AND any child renderer on deadline."""
    if process.poll() is not None:
        return
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    try:
        process.wait(timeout=3)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        process.wait()


def measured_resource_fields(path):
    """Only measured finite Linux /usr/bin/time data qualifies as a benchmark."""
    if not path.is_file():
        raise ValueError('RESOURCE_TIMING_MISSING')
    raw=path.read_text().strip().split(',')
    if len(raw)!=4:
        raise ValueError('RESOURCE_TIMING_MALFORMED')
    wall,user,system=map(float,raw[:3])
    rss_kib=int(raw[3])
    if not all(math.isfinite(x) for x in (wall,user,system)):
        raise ValueError('RESOURCE_TIMING_NONFINITE')
    if wall<=0 or user<0 or system<0 or rss_kib<=0:
        raise ValueError('RESOURCE_TIMING_INVALID')
    return dict(wallSeconds=wall,cpuUserSeconds=user,cpuSystemSeconds=system,
                totalCpuMinutes=round((user+system)/60,4),
                peakResidentMiB=round(rss_kib/1024,2))


def perform_run(archive,folder,number,timeout_seconds):
    target=folder/f'run_{number:02d}'
    extract_exact_original(archive,target)
    timing=target/'time.csv'
    env=os.environ.copy()
    env.update(VTK_DEFAULT_OPENGL_WINDOW='vtkEGLRenderWindow',LIBGL_ALWAYS_SOFTWARE='1',LC_ALL='C')
    command=['/usr/bin/time','-f','%e,%U,%S,%M','-o',str(timing),
             sys.executable,str(target/'build_fullhd_matchcut.py')]
    started=time.monotonic()
    with (target/'stdout.log').open('w') as output,(target/'stderr.log').open('w') as errors:
        process=subprocess.Popen(command,cwd=target,env=env,stdout=output,stderr=errors,
                                 start_new_session=True)
        try:code=process.wait(timeout=timeout_seconds)
        except subprocess.TimeoutExpired:
            terminate_render_process_group(process)
            code=124
    metrics={'run':number,'status':'HOLD','exitCode':code,
             'controllerWallSeconds':round(time.monotonic()-started,3)}
    try:
        metrics.update(measured_resource_fields(timing))
        timing_valid=True
    except (ValueError, OSError) as exc:
        metrics['timingDataInvalid']=str(exc)
        timing_valid=False
    movie=target/SILENT_OUTPUT
    if code==0 and movie.exists():
        metrics['silentMovieSha256']=file_hash(movie)
        metrics['outputBytes']=movie.stat().st_size
        probe=subprocess.run(['ffprobe','-v','error','-show_streams','-of','json',str(movie)],capture_output=True,text=True,timeout=120)
        try:metrics['nativeFramesCorrect']=probe.returncode==0 and valid_native_probe(json.loads(probe.stdout))
        except (ValueError,TypeError):metrics['nativeFramesCorrect']=False
        decoded=subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(movie),'-f','null','-'],capture_output=True,timeout=120)
        metrics['fullDecodePass']=decoded.returncode==0
        if timing_valid and metrics['nativeFramesCorrect'] and metrics['fullDecodePass']:
            metrics['status']='PASS_TECHNICAL_ONLY'
    return metrics

def research_receipt(runs, expected_attempts):
    """A partial or nondeterministic benchmark is never a passing artifact."""
    if not isinstance(expected_attempts,int) or not 1<=expected_attempts<=10:
        raise ValueError('EXPECTED_ATTEMPT_COUNT_REQUIRED')
    n=len(runs)
    successes=sum(x.get('status')=='PASS_TECHNICAL_ONLY' for x in runs)
    hashes=[x.get('silentMovieSha256') for x in runs]
    same_hash=(n>0 and all(isinstance(h,str) and len(h)==64
                              and all(c in '0123456789abcdef' for c in h.lower()) for h in hashes)
               and len(set(hashes))==1)
    complete=(n==expected_attempts and successes==expected_attempts and same_hash)
    return {'status':'PASS_RESEARCH_ONLY' if complete else 'HOLD',
            'expectedAttempts':expected_attempts,'attempts':n,'successes':successes,
            'matchingOutputHashes':same_hash,'identicalSilentMovieSha256':hashes[0] if same_hash else None,
            'observedFailureCount':n-successes,
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
        (args.root/'BENCHMARK_RECEIPT.json').write_text(
            json.dumps(research_receipt(runs,expected_attempts=args.repeats),indent=2)+'\n')
    return int(research_receipt(runs,expected_attempts=args.repeats)['status']!='PASS_RESEARCH_ONLY')

if __name__=='__main__':sys.exit(main())
