#!/usr/bin/env python3
"""Lane 5 research-only independent exact-film localized visual change challenger.

An externally declared scene must change meaningfully while unedited scenes remain
near-identical after allowed lossy re-encode. Original AAC is kept byte-identical.
Never certifies lexical correction, source science, caption legibility, phone UX,
first excellent render, production-quality experience, or publication.
"""
import argparse
import hashlib
import json
import math
import re
import subprocess
from fractions import Fraction
from pathlib import Path

HEX = re.compile(r"[a-f0-9]{64}\Z")
WIDTH, HEIGHT = 96, 170
MAX_UNEDITED_MAE = 0.15
MIN_EDITED_MAE = 2.0
MIN_CHANGED_FRACTION = 0.9


def hold(reason):
    raise ValueError('SCENE_REPAIR_RESEARCH_HOLD:' + reason)


def shafile(path):
    path = Path(path)
    if path.is_symlink() or any(p.is_symlink() for p in path.parents):
        hold('UNSAFE_SOURCE_ALIAS')
    if not path.is_file() or not path.stat().st_size:
        hold('MISSING_SOURCE_FILM')
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(2**20), b''):
            h.update(chunk)
    return h.hexdigest()


def run(args):
    try:
        return subprocess.run(args, capture_output=True, check=True, timeout=100).stdout
    except (OSError, subprocess.SubprocessError) as e:
        hold('PHYSICAL_DECODE_FAILED:' + type(e).__name__)


def probe(path, stream):
    # Inventory the entire container; selecting v:0/a:0 hides unreviewed tracks.
    data = json.loads(run(['ffprobe', '-v', 'error',
                           '-show_entries', 'stream=codec_name,codec_type,nb_frames,width,height,avg_frame_rate,r_frame_rate',
                           '-of', 'json', str(path)]))
    tracks = data.get('streams', [])
    videos = [s for s in tracks if s.get('codec_type') == 'video']
    audios = [s for s in tracks if s.get('codec_type') == 'audio']
    if (len(tracks) != 2 or len(videos) != 1 or len(audios) != 1
            or videos[0].get('codec_name') != 'h264'
            or audios[0].get('codec_name') != 'aac'):
        hold('EXACTLY_ONE_H264_VIDEO_AND_AAC_AUDIO_REQUIRED')
    return videos[0] if stream == 'v:0' else audios[0]


def packets(path, stream):
    return json.loads(run(['ffprobe', '-v', 'error', '-select_streams', stream,
                           '-show_packets', '-show_entries', 'packet=pts,dts,duration,size,flags',
                           '-of', 'json', str(path)]))['packets']


def presentation_pts(path):
    data = json.loads(run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                           '-show_frames', '-show_entries', 'frame=best_effort_timestamp,media_type',
                           '-of', 'json', str(path)]))
    return [int(row['best_effort_timestamp']) for row in data['frames'] if row.get('media_type') == 'video']


def gray_frames(path):
    return run(['ffmpeg', '-nostdin', '-v', 'error', '-xerror', '-err_detect', 'explode',
                '-i', str(path), '-map', '0:v:0', '-vf',
                f'scale={WIDTH}:{HEIGHT}:flags=area,format=gray', '-an', '-vsync', '0',
                '-f', 'rawvideo', '-pix_fmt', 'gray', '-'])


def audio_sha(path):
    data = run(['ffmpeg', '-nostdin', '-v', 'error', '-xerror', '-err_detect', 'explode',
                '-i', str(path), '-map', '0:a:0', '-c:a', 'copy', '-f', 'adts', '-'])
    if not data:
        hold('MISSING_PHYSICAL_AAC')
    run(['ffmpeg', '-nostdin', '-v', 'error', '-xerror', '-err_detect', 'explode',
         '-i', str(path), '-map', '0:a:0', '-vn', '-f', 'null', '-'])
    return hashlib.sha256(data).hexdigest()


def inspect(*, old, new, old_sha, new_sha, first_frame, last_frame):
    if (not isinstance(old_sha, str) or not HEX.fullmatch(old_sha)
            or not isinstance(new_sha, str) or not HEX.fullmatch(new_sha)):
        hold('EXTERNALLY_PIN_BOTH_FILM_SHA256')
    if shafile(old) != old_sha or shafile(new) != new_sha or old_sha == new_sha:
        hold('SOURCE_SHA_WRONG_OR_FILMS_UNCHANGED')
    v0, v1 = probe(old, 'v:0'), probe(new, 'v:0')
    a0, a1 = probe(old, 'a:0'), probe(new, 'a:0')
    for v in (v0, v1):
        if v['codec_name'] != 'h264':
            hold('REQUIRES_H264')
    for a in (a0, a1):
        if a['codec_name'] != 'aac':
            hold('REQUIRES_AAC')
    fields = ['width', 'height', 'nb_frames', 'avg_frame_rate', 'r_frame_rate']
    if any(v0.get(x) != v1.get(x) for x in fields):
        hold('VIDEO_SPEC_CHANGED')
    n = int(v0['nb_frames'])
    rate = Fraction(v0['avg_frame_rate'])
    if (rate != Fraction(v0['r_frame_rate']) or rate < 12 or rate > 60
            or n < 60 or n > 5400 or Fraction(n)/rate > 90):
        hold('VIDEO_FRAME_TIMELINE_UNCALIBRATED')
    if (type(first_frame) is not int or type(last_frame) is not int
            or not 1 <= first_frame < last_frame < n-1):
        hold('INVALID_EXTERNALLY_DECLARED_SCENE_WINDOW')
    if not 0.2 <= Fraction(last_frame-first_frame+1)/rate <= 15:
        hold('SCENE_WINDOW_OUT_OF_RESEARCH_BOUNDS')
    p0,p1 = presentation_pts(old),presentation_pts(new)
    if (len(p0) != n or len(p1) != n or p0 != p1
            or any(p0[i] <= p0[i-1] for i in range(1,n))):
        hold('DECODED_PRESENTATION_TIMING_CHANGED')
    # Packet PTS ordering may legitimately differ after H264 re-encode;
    # presentation frame PTS in display order MUST remain identical.
    ac0,ac1=packets(old, 'a:0'),packets(new, 'a:0')
    fields = ('pts','dts','duration','size','flags')
    if (len(ac0) != len(ac1) or not ac0
            or any(tuple(x.get(k) for k in fields) != tuple(y.get(k) for k in fields)
                   for x,y in zip(ac0,ac1))):
        hold('AUDIO_PACKET_TIMING_OR_SIZE_CHANGED')
    aud0,aud1=audio_sha(old),audio_sha(new)
    if aud0 != aud1:
        hold('SOURCE_NARRATION_AAC_CHANGED')
    o,c = gray_frames(old),gray_frames(new)
    fs = WIDTH*HEIGHT
    if len(o) != n*fs or len(c) != n*fs:
        hold('PHYSICAL_FRAMES_MISSING')
    outside = []
    inside = []
    for i in range(n):
        m0=memoryview(o)[fs*i:fs*(i+1)]
        m1=memoryview(c)[fs*i:fs*(i+1)]
        mae=sum(abs(a-b) for a,b in zip(m0,m1))/fs
        (inside if first_frame<=i<=last_frame else outside).append(mae)
    changed=sum(m>=MIN_EDITED_MAE for m in inside)
    if not outside or max(outside)>MAX_UNEDITED_MAE:
        hold('UNDECLARED_OUTSIDE_SCENE_DIFFERENCE')
    if changed/len(inside)<MIN_CHANGED_FRACTION:
        hold('DECLARED_SCENE_NOT_MEANINGFULLY_REPAIRED')
    if shafile(old)!=old_sha or shafile(new)!=new_sha:
        hold('FILM_CHANGED_WHILE_CHECKING')
    return {'schema':'ths-lane5-physical-visual-repair-boundary-v1',
            'sourceSha256':old_sha,'editedSha256':new_sha,'fullH264AndAacPhysicallyDecoded':True,
            'originalAacElementarySha256':aud0,'editedAacElementarySha256':aud1,
            'originalNarrationElementaryBytesIdentical':True,
            'videoFrameCount':n,'presentationFramePtsIdentical':True,
            'compressionPacketOrderMayChangeWithoutAffectingFramePresentation':True,
            'declaredSceneFramesInclusive':[first_frame,last_frame],
            'editedSceneFrames':len(inside),'framesChangedAboveScreen':changed,
            'changedScreenThresholdMae8bit':MIN_EDITED_MAE,
            'maxOutsideSceneMae8bit':round(max(outside),6),
            'meanOutsideSceneMae8bit':round(sum(outside)/len(outside),6),
            'meanEditedSceneMae8bit':round(sum(inside)/len(inside),6),
            'outsideSceneReencodeThresholdMae8bit':MAX_UNEDITED_MAE,
            'decision':'VISUAL_CHANGE_LOCALIZED_AUDIO_LOCKED_SCIENCE_QA_HOLD',
            'originalKnownSourceClaimCorrectionsIndependentlyCertified':False,
            'subtitleLexicalMobileAndScientificAcceptanceProven':False,
            'mayPublish':False,'firstExcellentMasterAccepted':False,
            'fiveRenderStreakAccepted':False}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source',required=True)
    p.add_argument('--edited',required=True)
    p.add_argument('--source-sha',required=True)
    p.add_argument('--edited-sha',required=True)
    p.add_argument('--first-frame',type=int,required=True)
    p.add_argument('--last-frame',type=int,required=True)
    p.add_argument('--out',required=True)
    x=p.parse_args()
    y=inspect(old=x.source,new=x.edited,old_sha=x.source_sha,new_sha=x.edited_sha,
              first_frame=x.first_frame,last_frame=x.last_frame)
    Path(x.out).write_text(json.dumps(y,indent=2,sort_keys=True)+'\n')
    print(y['decision'])
if __name__=='__main__':main()
