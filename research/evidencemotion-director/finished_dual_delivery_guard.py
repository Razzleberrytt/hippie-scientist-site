#!/usr/bin/env python3
"""Lane5 research-only dual-format delivery and missing-current-caption proof gate.

Physically decodes both exact files, checks display timestamps and source-audio
continuity, and refuses to transfer an old caption-review result to new encodes.
It cannot certify scientific, phonetic, phone UX, originality or publication.
"""
import argparse
import hashlib
import json
import math
import re
import subprocess
import zipfile
from array import array
from pathlib import Path

HEX = re.compile(r'[0-9a-f]{64}\Z')
QA = 'LAYOUT_AND_ENCODED_QA.json'
SRT = 'Phenibut_REAL_MFA_WORD_CAPTIONS.srt'
PROVENANCE = 'ORIGINAL_VOICE_PROVENANCE.json'
SOURCES = ('REPRODUCIBLE_SOURCE/fix_phenibut_visuals.py',
           'REPRODUCIBLE_SOURCE/build_phenibut_evidencemotion.py')
WIDTH, HEIGHT = 48, 86

def hold(reason):
    raise ValueError('DUAL_DELIVERY_RESEARCH_HOLD:' + reason)

def sha_file(path):
    p = Path(path)
    if p.is_symlink() or any(q.is_symlink() for q in p.parents) or not p.is_file():
        hold('INPUT_MISSING_OR_UNSAFE_ALIAS')
    h = hashlib.sha256()
    with p.open('rb') as f:
        for part in iter(lambda:f.read(1024*1024),b''):
            h.update(part)
    return h.hexdigest()

def parse(raw):
    def unique(pairs):
        d = {}
        for k, v in pairs:
            if k in d: hold('DUPLICATE_JSON_FIELD')
            d[k] = v
        return d
    try:
        return json.loads(raw.decode('utf-8'), object_pairs_hook=unique,
                          parse_constant=lambda c: hold('NONFINITE_QA_NUMBER'))
    except (UnicodeError, json.JSONDecodeError):
        hold('MALFORMED_JSON')

def run(args):
    try:
        return subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,
                              timeout=90,check=True).stdout
    except (OSError,subprocess.SubprocessError) as e:
        hold('PHYSICAL_DECODE_FAILED:'+type(e).__name__)

def metadata(path):
    m = parse(run(['ffprobe','-v','error','-show_streams','-of','json',str(path)]))
    streams = m.get('streams')
    if (not isinstance(streams,list) or len(streams)!=2 or
            [s.get('codec_type') for s in streams] != ['video','audio']):
        hold('UNEXPECTED_VIDEO_AUDIO_STREAMS')
    video,audio=streams
    if video.get('codec_name') != 'h264' or audio.get('codec_name') != 'aac':
        hold('UNSUPPORTED_CODEC')
    if video.get('avg_frame_rate') != '30/1' or video.get('r_frame_rate')!='30/1':
        hold('UNEXPECTED_CFR')
    n=int(video.get('nb_frames',0))
    if n<30 or n>2700: hold('UNBOUNDED_FRAME_COUNT')
    return video,audio,n

def presentation(path):
    a=run(['ffprobe','-v','error','-select_streams','v:0','-show_entries',
           'frame=best_effort_timestamp_time','-of','csv=p=0',str(path)])
    return [float(row.split(',')[0]) for row in a.decode().splitlines() if row.strip()]

def pixels(path, n):
    raw=run(['ffmpeg','-nostdin','-v','error','-xerror','-err_detect','explode',
             '-i',str(path),'-map','0:v:0','-vf',
             f'scale={WIDTH}:{HEIGHT}:flags=bicubic,format=gray',
             '-an','-vsync','0','-f','rawvideo','-pix_fmt','gray','-'])
    length=WIDTH*HEIGHT
    if len(raw) != n*length: hold('INCOMPLETE_FULL_FILM_PIXEL_DECODE')
    return raw

def pcm(path):
    raw=run(['ffmpeg','-nostdin','-v','error','-xerror','-err_detect','explode',
             '-i',str(path),'-map','0:a:0','-vn',
             '-ac','1','-ar','24000','-f','f32le','-'])
    if len(raw)%4:hold('MALFORMED_DECODED_AUDIO')
    a=array('f');a.frombytes(raw)
    return a

def inspect(*,archive,archive_sha,master,master_sha,mobile,mobile_sha):
    for v in (archive_sha,master_sha,mobile_sha):
        if type(v) is not str or not HEX.fullmatch(v): hold('EXTERNAL_SHA256_REQUIRED')
    if len({archive_sha,master_sha,mobile_sha})!=3:
        hold('INPUT_IDENTITY_NOT_INDEPENDENT')
    for p,pin in ((archive,archive_sha),(master,master_sha),(mobile,mobile_sha)):
        if sha_file(p)!=pin: hold('EXTERNAL_INPUT_SHA_MISMATCH')
    with zipfile.ZipFile(archive) as z:
        infos=z.infolist()
        names=[i.filename for i in infos]
        if len(names)>64 or len(names)!=len(set(names)) or any(
             i.file_size>32*1024*1024 or i.filename.startswith('/') or
             '..' in Path(i.filename).parts for i in infos):
            hold('UNBOUNDED_OR_UNSAFE_ARCHIVE')
        if z.testzip() is not None: hold('ZIP_CRC_INVALID')
        if not {QA,SRT,PROVENANCE,*SOURCES}.issubset(names):
            hold('REQUIRED_SOURCE_OR_QA_MEMBERS_MISSING')
        q=parse(z.read(QA)); voice=parse(z.read(PROVENANCE))
        if type(q) is not dict or type(voice) is not dict:
            hold('WRONG_QA_SHAPE')
        if (q.get('schema') != 'ths.phenibut.physical_layout_patch.v1' or
            q.get('mayPublish') is not False or
            q.get('videoSHA256')!=master_sha or q.get('mobileSHA256')!=mobile_sha or
            type(q.get('frames')) is not int or not 30 <= q['frames'] <= 2700 or
            q.get('fps') != 30 or q.get('canvas') != [1080,1920] or
            q.get('sourceWavSHA256')!=voice.get('wav_sha256') or
            voice.get('mayPublish') is not False or
            voice.get('schema') != 'ths.phenibut.original_voice.r1' or
            type(voice.get('wav_sha256')) is not str or
            HEX.fullmatch(voice['wav_sha256']) is None):
            hold('WRONG_CURRENT_FILM_QA_OR_FALSE_APPROVAL')
        master_name='THS_Phenibut_EvidenceMotion_CLEAN_V4.mp4'
        mobile_name='THS_Phenibut_CLEAN_V4_iPhone.mp4'
        if master_name not in names or mobile_name not in names:
            hold('CURRENT_FILM_NOT_IN_SOURCE_PACKAGE')
        if (hashlib.sha256(z.read(master_name)).hexdigest()!=master_sha or
            hashlib.sha256(z.read(mobile_name)).hexdigest()!=mobile_sha):
            hold('PACKAGE_HAS_DIFFERENT_MOVIE_BYTES')
        srt=z.read(SRT)
        if len(srt)>200000 or len([x for x in re.split(r'\r?\n\s*\r?\n',srt.decode('utf-8').strip()) if x])<1:
            hold('MISSING_OR_EMPTY_CAPTION_ASSET')
        qa_caption_files=[n for n in names if n.endswith('REAL_CAPTION_QA.json')
                          or n.endswith('CURRENT_ENCODED_CAPTION_QA.json')]
        has_master_current_caption_proof=False
        has_mobile_current_caption_proof=False
        # A self-written QA claim cannot validate its own physical caption pixels.
        has_voice_raw=any(n.endswith('/'+voice.get('master_name','ZZZ')) or
                          n==voice.get('master_name','ZZZ') for n in names)
        contains_voice_receipt=any(n.endswith('/voice_receipt.json') or n=='voice_receipt.json' for n in names)
        contains_scene_manifest=any(n.endswith('/scene_manifest.json') or n=='scene_manifest.json' for n in names)
        source_self_contained=bool(has_voice_raw and contains_voice_receipt and contains_scene_manifest)
    v0,a0,n0=metadata(master);v1,a1,n1=metadata(mobile)
    if (n0!=n1 or n0!=q['frames'] or
            (int(v0['width']),int(v0['height'])) != (1080,1920) or
            (int(v1['width']),int(v1['height'])) != (720,1280)):
        hold('ACTUAL_MEDIA_GEOMETRY_OR_FRAME_COUNT_DRIFT')
    pts0,pts1=presentation(master),presentation(mobile)
    if (len(pts0)!=n0 or len(pts1)!=n1 or
        any(abs(a-b)>0.001 for a,b in zip(pts0,pts1)) or
        any(abs(a-i/30)>0.001 for i,a in enumerate(pts0))):
        hold('ACTUAL_DISPLAY_FRAME_TIMING_MISMATCH')
    pix0,pix1=pixels(master,n0),pixels(mobile,n1)
    step=WIDTH*HEIGHT
    mae=[]
    for i in range(n0):
        st=i*step;en=st+step
        mae.append(sum(abs(x-y) for x,y in zip(pix0[st:en],pix1[st:en]))/step)
    if max(mae)>3.0: hold('DUAL_DISTRIBUTION_VISUAL_DRIFT')
    a,b=pcm(master),pcm(mobile)
    # Pairwise agreement alone lets the same truncated track pass twice.
    # Independently require each 24 kHz decode to cover its CFR video timeline.
    for audio, frames in ((a,n0),(b,n1)):
        if abs(len(audio) - frames*800) > 2400:
            hold('AUDIO_TRACK_DOES_NOT_COVER_VIDEO')
    if abs(len(a)-len(b)) > 2400:
        hold('AUDIO_LENGTH_DIFFERENCE_GT100MS')
    n=min(len(a),len(b))
    asum=bsum=dot=0.
    for x,y in zip(a[:n],b[:n]):
        asum+=x*x;bsum+=y*y;dot+=x*y
    similarity=dot/math.sqrt(asum*bsum) if asum and bsum else 0
    if similarity<0.98: hold('DISTRIBUTION_AUDIO_CORRELATION_TOO_LOW')
    for p,pin in ((archive,archive_sha),(master,master_sha),(mobile,mobile_sha)):
        if sha_file(p)!=pin: hold('INPUT_CHANGED_DURING_REVIEW')
    return {'schema':'ths-em-lane5-dual-finished-delivery-research-v1',
            'archiveSha256':archive_sha,'fullMasterSha256':master_sha,
            'mobileSha256':mobile_sha,'fullEncodedTracksDecoded':True,
            'fullVideoFramesEach':n0,'identicalPresentedFrameClock':True,
            'allFrameProxyGrayMeanMae8bit':round(sum(mae)/len(mae),6),
            'allFrameProxyGrayMaxMae8bit':round(max(mae),6),
            'decodedAudioCosineSimilarity':round(similarity,7),
            'decodedAudioSamplesAt24000Hz':[len(a),len(b)],
            'audioVideoCoverageToleranceSeconds':0.1,
            'currentMasterEncodedCaptionQAPhysicallyVerified':has_master_current_caption_proof,
            'currentMobileEncodedCaptionQAPhysicallyVerified':has_mobile_current_caption_proof,
            'captionQAFilesPresentInPackage':qa_caption_files,
            'originalVoiceWavPresent':has_voice_raw,
            'voiceReceiptPresent':contains_voice_receipt,
            'sceneManifestPresent':contains_scene_manifest,
            'standaloneOriginalSourceBundleComplete':source_self_contained,
            'decision':'TWO_MOVIES_STRUCTURALLY_VERIFIED_MISSING_CAPTION_AND_SOURCE_HOLD',
            'independentSourceSciencePhoneticsAndActualHandsetApproved':False,
            'firstExcellentMasterAccepted':False,'fiveRenderStreakAccepted':False,
            'mayPublish':False}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    for name in ('archive','archive-sha','master','master-sha','mobile','mobile-sha','out'):
        p.add_argument('--'+name,required=True)
    x=p.parse_args()
    result=inspect(archive=x.archive,archive_sha=x.archive_sha,
                   master=x.master,master_sha=x.master_sha,
                   mobile=x.mobile,mobile_sha=x.mobile_sha)
    Path(x.out).write_text(json.dumps(result,indent=2,sort_keys=True)+'\n')
    print(result['decision'])

if __name__=='__main__': main()
