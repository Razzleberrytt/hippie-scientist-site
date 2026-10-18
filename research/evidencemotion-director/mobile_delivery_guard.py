#!/usr/bin/env python3
"""Lane 4 independent native H264/AAC phone-delivery transcode negative gate.

No hardware or user-listening signoff. Research only; NEVER returns publishing authority.
FFmpeg, ffprobe and Python standard library are the only required dependencies.
"""
import argparse
import array
import hashlib
import json
import math
import re
import struct
import subprocess
import sys
from pathlib import Path

class Hold(ValueError):
    pass

def sha_file(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for x in iter(lambda:f.read(1<<20),b''):
            h.update(x)
    return h.hexdigest()

def cmd(args, *, cwd=None):
    q=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,cwd=cwd)
    if q.returncode: raise Hold('FFMPEG_OR_FFPROBE_FAILURE:'+q.stderr.decode('utf8','replace')[-200:])
    return q.stdout

def probe(path):
    obj=json.loads(cmd(['ffprobe','-v','error','-count_frames','-show_streams','-of','json',str(path)]))
    videos=[x for x in obj['streams'] if x['codec_type']=='video']
    audios=[x for x in obj['streams'] if x['codec_type']=='audio']
    if len(videos)!=1 or len(audios)!=1: raise Hold('ONE_VIDEO_AND_AUDIO_TRACK_REQUIRED')
    return videos[0],audios[0]

def require_undistorted_portrait(video, size):
    # Pixel-true portrait must preserve its declared exact geometry, not
    # force 9:16 onto deliberately smaller 40:71 physical-test fixtures.
    # A real 1080x1920 / 720x1280 delivery still requires 9:16.
    width,height=size
    common=math.gcd(width,height)
    expected_aspect=f'{width//common}:{height//common}'
    if (video.get('sample_aspect_ratio')!='1:1'
            or video.get('display_aspect_ratio')!=expected_aspect):
        raise Hold('NON_SQUARE_PIXEL_PORTRAIT')
    angles=[(video.get('tags') or {}).get('rotate',0)]
    angles += [side['rotation'] for side in (video.get('side_data_list') or [])
               if 'rotation' in side]
    try:
        readings=[float(v) for v in angles]
    except (ValueError, TypeError, OverflowError):
        raise Hold('INVALID_DISPLAY_ROTATION_METADATA')
    if any(not math.isfinite(v) or abs(v)>0.01 for v in readings):
        raise Hold('ROTATED_DISPLAY_METADATA_NOT_ALLOWED')


def frame_pts(path):
    b=cmd(['ffprobe','-v','error','-select_streams','v:0','-show_entries','frame=best_effort_timestamp_time','-of','csv=p=0',str(path)])
    try:
        lines=[x.strip().rstrip(',') for x in b.decode('utf-8').splitlines() if x.strip()]
        stamps=[round(float(value),6) for value in lines]
    except (ValueError, UnicodeDecodeError, OverflowError):
        raise Hold('INVALID_ACTUAL_FRAME_PTS')
    # NaN makes abs(a-b)>tolerance false; duplicate or reversed stamps
    # can also appear superficially plausible when streams agree with each
    # other. Require each actual presentation time on the 30fps clock.
    if (not stamps or any(not math.isfinite(t) or t<0 for t in stamps)
            or any(current<=previous for previous,current in zip(stamps,stamps[1:]))):
        raise Hold('INVALID_ACTUAL_FRAME_PTS')
    if any(abs(t - (index/30))>0.001
           for index,t in enumerate(stamps)):
        raise Hold('NON_30FPS_PRESENTATION_TIMESTAMP_GRID')
    return stamps

def faststart(path):
    boxes=[];total=Path(path).stat().st_size;at=0
    with open(path,'rb') as f:
        while at+8<=total and len(boxes)<15:
            f.seek(at);hdr=f.read(16)
            n=int.from_bytes(hdr[0:4],'big');typ=hdr[4:8].decode('latin1')
            if n==1:n=int.from_bytes(hdr[8:16],'big')
            if n==0:n=total-at
            if n<8 or at+n>total:raise Hold('INVALID_MP4_TOP_LEVEL_BOX')
            boxes.append((typ,at));at+=n
    if not any(k=='moov' for k,_ in boxes) or not any(k=='mdat' for k,_ in boxes):raise Hold('MOOV_AND_MDAT_REQUIRED')
    return next(i for i,(k,_) in enumerate(boxes) if k=='moov') < next(i for i,(k,_) in enumerate(boxes) if k=='mdat')

def decoded_audio(path):
    pcm=cmd(['ffmpeg','-nostdin','-v','error','-xerror','-i',str(path),'-map','0:a:0','-ac','2','-ar','48000','-f','f32le','-acodec','pcm_f32le','-'])
    if len(pcm)%4:raise Hold('CORRUPTED_AUDIO_PCM')
    samples=array.array('f');samples.frombytes(pcm)
    if sys.byteorder!='little':samples.byteswap()
    return samples

# Deliberately conservative research screen, not phoneme or listening QA.
# Check short source-active windows: whole-track SNR can bury 6ms dropouts.
LOCAL_AUDIO_WINDOW_STEREO_FRAMES = 120       # 2.5ms at 48 kHz
LOCAL_AUDIO_SOURCE_RMS_FLOOR = 0.025         # exclude background/noise windows
LOCAL_AUDIO_MIN_ENERGY_RATIO = 0.25          # target/source squared-energy floor

def screen_local_audio_energy(source, mobile, compared_samples):
    window = LOCAL_AUDIO_WINDOW_STEREO_FRAMES * 2  # interleaved stereo samples
    checked = 0
    minimum = None
    # Four phase offsets catch complete 2.5ms dropouts straddling fixed bins.
    # This is still a provisional PCM-energy screen, never phonetic proof.
    stride = window // 4
    for start in range(0, compared_samples, stride):
        stop = min(start + window, compared_samples)
        if stop - start < window // 2:
            continue  # tiny trailing fragment: insufficient window
        source_energy = mobile_energy = 0.0
        for i in range(start, stop):
            x = float(source[i])
            y = float(mobile[i])
            source_energy += x * x
            mobile_energy += y * y
        if source_energy / (stop - start) < LOCAL_AUDIO_SOURCE_RMS_FLOOR ** 2:
            continue
        checked += 1
        ratio = mobile_energy / source_energy
        minimum = ratio if minimum is None else min(minimum, ratio)
        if ratio < LOCAL_AUDIO_MIN_ENERGY_RATIO:
            raise Hold('LOCAL_AUDIO_ENERGY_DROPOUT')
    if checked == 0:
        raise Hold('LOCAL_AUDIO_MATERIAL_SOURCE_ENERGY_NOT_OBSERVED')
    return {
        'scope': 'PAIRED_PCM_2_5MS_SOURCE_ACTIVE_ENERGY_NEGATIVE_SCREEN_ONLY',
        'windowDurationMs': 2.5, 'windowStrideMs': 0.625,
        'materialSourceWindowCount': checked,
        'sourceRmsFloor': LOCAL_AUDIO_SOURCE_RMS_FLOOR,
        'minimumMobileToSourceWindowEnergyRatio': round(minimum, 6),
        'dropoutRatioFloor': LOCAL_AUDIO_MIN_ENERGY_RATIO,
        'phonemeIdentityVerified': False, 'humanAudibilityVerified': False,
    }

def audio_compare(before,after):
    a=decoded_audio(before);b=decoded_audio(after)
    # AAC encoder/44.1->48k resampling may add a few milliseconds of inaudible
    # tail. NEVER accept a shorter/missing audible word or an arbitrary drift.
    # Both channels are interleaved. A 6ms ceiling is 288 stereo frames.
    delta=abs(len(a)-len(b))
    if min(len(a),len(b))<4000 or len(a)%2 or len(b)%2 or delta>2*round(0.006*48000):
        raise Hold('DECODED_AUDIO_SAMPLE_COUNT_DIFFERENT')
    # Correlation/SNR comparisons against NaN are always False; a non-finite
    # decoded PCM float could otherwise produce a misleading positive receipt.
    # Check BOTH complete tracks, including the optional AAC tail.
    if any(not math.isfinite(value) for value in a) or any(not math.isfinite(value) for value in b):
        raise Hold('NONFINITE_DECODED_AUDIO_SAMPLES')
    if delta:
        longer=a if len(a)>len(b) else b
        shorter=b if len(a)>len(b) else a
        extra=longer[-delta:]
        tail=shorter[-delta:]
        for segment in (extra,tail):
            peak=max(abs(float(x)) for x in segment)
            rms=math.sqrt(sum(float(x)**2 for x in segment)/len(segment))
            if peak>0.01 or rms>0.001:
                raise Hold('AUDIBLE_AUDIO_TAIL_MISMATCH')
    n=min(len(a),len(b));sa=sb=aa=bb=ab=err=0.
    # Accumulate 48k stereo source/target PCM without optional numpy.
    for x,y in zip(a[:n],b[:n]):
        x=float(x);y=float(y);sa+=x;sb+=y;aa+=x*x;bb+=y*y;ab+=x*y;err+=(x-y)**2
    ca=aa-sa*sa/n;cb=bb-sb*sb/n
    if ca<=0 or cb<=0:raise Hold('EMPTY_OR_SILENT_AUDIO')
    corr=(ab-sa*sb/n)/math.sqrt(ca*cb)
    snr=(10*math.log10(aa/err)) if err else 120.
    if corr<0.995 or snr<25.:raise Hold('AUDIO_REENCODE_NOT_SOURCE_EQUIVALENT')
    local = screen_local_audio_energy(a, b, n)
    return {'decodedChannels':2,'decodedSamples':n,'totalSourceSamples':len(a),
            'totalMobileSamples':len(b),'codecTailDeltaStereoFrames':delta//2,
            'codecTailAmplitudeScreened':bool(delta),
            'codecTailSpeechIdentityVerified':False,
            'rate':48000,'normalizedCorrelation':round(corr,7),
            'snrDb':round(snr,3),'localAudioEnergyScreen':local,
            'bitwiseAACCopyRequired':False}

def video_psnr(before,after,expected_frames):
    # A complete FFmpeg frame-by-frame compare at the same phone reference width.
    # ffmpeg's psnr output is a relative codec/image fidelity metric, NOT an OCR result.
    from tempfile import TemporaryDirectory
    with TemporaryDirectory() as tmp:
        stats=Path(tmp)/'psnr.log'
        args=['ffmpeg','-nostdin','-v','error','-xerror','-i',str(Path(before).resolve()),'-i',str(Path(after).resolve()),
              '-filter_complex',f'[0:v]scale=320:568:flags=bicubic,format=yuv420p[ref];[1:v]scale=320:568:flags=bicubic,format=yuv420p[phone];[ref][phone]psnr=stats_file=psnr.log',
              '-an','-f','null','-']
        cmd(args,cwd=tmp)
        rows=stats.read_text().splitlines()
    vals=[]
    for i,row in enumerate(rows):
        m=re.search(r'psnr_avg:([^ ]+)',row)
        if not m:raise Hold('MALFORMED_PSNR_FRAME')
        v=float(m.group(1));vals.append(v)
    if len(vals)!=expected_frames:raise Hold('INCOMPLETE_FULL_VISUAL_COMPARISON')
    if any(math.isnan(v) or v<0 for v in vals):raise Hold('INVALID_PSNR_FRAME_VALUE')
    if min(vals)<40.:raise Hold('MATERIAL_VISUAL_DIFFERENCE_AT_PHONE_WIDTH')
    # True exactly identical decoded synthetic frames can yield psnr_avg:inf.
    # Cap infinity with an EXPLICIT numerical serialization proxy rather than
    # writing non-standard JSON Infinity/NaN in a source-bound QA receipt.
    perfect=sum(math.isinf(v) for v in vals)
    finite_representations=[min(v,120.) for v in vals]
    return {'decodedPairFrames':len(vals),'referenceWidthPx':320,
            'minimumPsnrDbCapped120':round(min(finite_representations),3),
            'averageFramePsnrDbCapped120':round(sum(finite_representations)/len(vals),3),
            'perfectFramePsNRCount':perfect,'infinitePsnrCappedAtDb':120,
            'visualEqualityNotClaimed':True}

def audit(before,after,sha_before,sha_after,*,source_size=(1080,1920),mobile_size=(720,1280),expected_frames=None,do_visual=True):
    for file,expected in ((before,sha_before),(after,sha_after)):
        if not isinstance(expected,str) or not re.fullmatch(r'[0-9a-f]{64}',expected) or sha_file(file)!=expected:
            raise Hold('FILM_SHA256_DOES_NOT_MATCH_PIN')
    v0,a0=probe(before);v1,a1=probe(after)
    if (v0['width'],v0['height'])!=source_size or (v1['width'],v1['height'])!=mobile_size:raise Hold('WRONG_SOURCE_OR_MOBILE_GEOMETRY')
    require_undistorted_portrait(v0,source_size)
    require_undistorted_portrait(v1,mobile_size)
    if (v0['codec_name'],v1['codec_name'])!=('h264','h264') or v1.get('profile') not in ('Constrained Baseline','Baseline','Main') or v1.get('pix_fmt')!='yuv420p':raise Hold('NOT_PHONE_COMPATIBLE_H264')
    if int(v1.get('level',999))>31:raise Hold('PHONE_H264_LEVEL_ABOVE_31')
    # Display geometry, not just coded pixel dimensions, must be portrait 9:16.
    # Non-square SAR silently stretches TikTok's presentation even when PSNR agrees.
    if v0.get('sample_aspect_ratio') not in ('1:1','1/1') or v1.get('sample_aspect_ratio') not in ('1:1','1/1'):
        raise Hold('NON_SQUARE_SAMPLE_ASPECT_RATIO')
    if v0.get('r_frame_rate')!='30/1' or v1.get('r_frame_rate')!='30/1':raise Hold('NOT_EXACT_30FPS')
    for a in (a0,a1):
        if a.get('codec_name')!='aac' or a.get('profile')!='LC' or a.get('sample_rate') not in ('48000','44100') or a.get('channels')!=2:
            raise Hold('NOT_STEREO_AAC_LC_44K1_OR_48K')
    n0=int(v0.get('nb_read_frames',-1));n1=int(v1.get('nb_read_frames',-1));
    if n0!=n1 or n0<10 or (expected_frames is not None and n0!=expected_frames):raise Hold('DROPPED_OR_MISMATCHED_VIDEO_FRAME_COUNT')
    stamps0=frame_pts(before);stamps1=frame_pts(after)
    if len(stamps0)!=n0 or len(stamps1)!=n0 or any(abs(a-b)>1e-5 for a,b in zip(stamps0,stamps1)):
        raise Hold('PHYSICAL_PRESENTATION_TIMESTAMPS_CHANGED')
    if not faststart(after):raise Hold('MOBILE_MP4_NOT_PROGRESSIVE_FASTSTART')
    sound=audio_compare(before,after)
    # This API's do_visual=False mode is useful for targeted negative tests,
    # but it must NEVER return a compatibility-positive research receipt.
    if not do_visual:
        raise Hold('FULL_VIDEO_COMPARISON_REQUIRED_FOR_POSITIVE_RECEIPT')
    img=video_psnr(before,after,n0)
    return {'schema':'ths-lane4-mobile-delivery-reencode-research-v1', 'sourceSha256':sha_before,'mobileSha256':sha_after,'framesChecked':n0,'fps':30,'sourceSize':list(source_size),'mobileSize':list(mobile_size),'h264TargetProfile':v1.get('profile'),'mobileAACSampleRateHz':int(a1['sample_rate']),'declaredCompatibilityScope':'H264_MAIN_OR_BASELINE_L31_YUV420P_AAC_LC_44K1_OR_48K_RESEARCH','mobileMoovBeforeMdat':True,'presentationTimestampsMatch':True,'decodedAudioComparison':sound,'decodedVisualComparison':img,'status':'REENCODE_COMPATIBILITY_RESEARCH_SCREEN_PASS','realIPhonePlaybackVerified':False,'captionOCRVerified':False,'scienceOrSourceReviewApproved':False,'fontReadabilityApproved':False,'independentPerceptualApproved':False,'mayPublish':False}

def validate_report_target(out, source, phone):
    """Never replace either original input through a report path alias.

    Both symlink-resolved paths and existing hard-link inode aliases are
    checked BEFORE reading / decoding any input or opening the output.
    """
    target=Path(out)
    for raw in (source,phone):
        video=Path(raw)
        if (target.resolve()==video.resolve()
                or (target.exists() and video.exists() and target.samefile(video))):
            raise Hold('REPORT_OUTPUT_ALIASES_SOURCE_MEDIA')


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--source',type=Path,required=True);p.add_argument('--phone',type=Path,required=True);p.add_argument('--source-sha',required=True);p.add_argument('--phone-sha',required=True);p.add_argument('--out',type=Path,required=True)
    args=p.parse_args()
    try:
        validate_report_target(args.out,args.source,args.phone)
        obj=audit(args.source,args.phone,args.source_sha,args.phone_sha)
        args.out.write_text(json.dumps(obj,indent=2)+'\n');print(json.dumps({'status':obj['status'],'publish':False,'frames':obj['framesChecked']}))
    except Hold as exc:print('PHONE_DELIVERY_HOLD:'+str(exc),file=sys.stderr);sys.exit(1)