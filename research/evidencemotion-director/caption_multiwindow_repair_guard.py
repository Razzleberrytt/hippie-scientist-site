#!/usr/bin/env python3
"""Research-only: SHA-bound SRT-cue multi-window visual repair A/B, full encoded films.

Derives authorized edit windows from original caption timing instead of trusting
producer-declared frame ranges. Optical/audio invariants are narrow research
screens, NOT human legibility, phonetic, science, premium, or release approval.
"""
import argparse
import hashlib
import json
import math
import re
import subprocess
from fractions import Fraction
from pathlib import Path
from visual_scene_repair_guard import (hold, shafile, probe, packets,
                                       presentation_pts, gray_frames, audio_sha)

SRT_TIME = re.compile(r'^(\d\d):(\d\d):(\d\d),(\d{3})$')
MAX_OUTSIDE_MAE = 0.15
MIN_INSIDE_MAE = 2.0
W, H = 96, 170


def _milliseconds(s):
    m = SRT_TIME.fullmatch(s)
    if not m:
        hold('SRT_TIME_FORMAT_INVALID')
    h, mm, ss, milli = map(int, m.groups())
    if mm >= 60 or ss >= 60 or h > 2:
        hold('SRT_TIME_OUT_OF_BOUNDS')
    return ((h*3600 + mm*60 + ss)*1000 + milli)


def _cues(text, video_frames, fps):
    chunks = re.split(r'\n\s*\n', text.strip())
    cues = []
    last_end = 0
    for ordinal, chunk in enumerate(chunks, 1):
        lines = chunk.splitlines()
        if (len(lines) < 3 or lines[0].strip() != str(ordinal)
                or ' --> ' not in lines[1] or not ''.join(lines[2:]).strip()):
            hold('INCOMPLETE_OR_REORDERED_SRT_CUES')
        times = lines[1].strip().split(' --> ')
        if len(times) != 2:
            hold('INVALID_SRT_ARROW')
        begin, end = map(_milliseconds, times)
        if begin < last_end or end <= begin or end > 90000:
            hold('SRT_CUES_OVERLAP_OR_BAD_DURATION')
        last_end = end
        # Frame whose presentation time first reaches cue start; end exclusive.
        start_frame = math.ceil(Fraction(begin * fps.numerator, 1000 * fps.denominator))
        last_frame = math.ceil(Fraction(end * fps.numerator, 1000 * fps.denominator)) - 1
        if (start_frame > last_frame or start_frame < 0 or last_frame >= video_frames):
            hold('SRT_CUE_OUTSIDE_DECODED_FRAME_TIMELINE')
        cues.append({'cue':ordinal, 'firstFrame':start_frame, 'lastFrame':last_frame,
                     'startMs':begin,'endMs':end, 'text':' '.join(x.strip() for x in lines[2:])})
    if not 2 <= len(cues) <= 100:
        hold('SRT_CUE_COUNT_OUTSIDE_BOUNDS')
    return cues



def _assert_authored_cfr_clock(path, frame_pts, fps):
    """Compare EVERY displayed H264 frame to SRT's zero-origin CFR clock.

    Identical source/revision PTS are insufficient: both can be offset or
    irregular. Authored SRT timestamps are movie-local seconds, not arbitrary
    display-order indexes. Refuse drift rather than misattribute edit windows.
    """
    try:
        result = subprocess.run([
            'ffprobe', '-v', 'error', '-select_streams', 'v:0',
            '-show_entries', 'stream=time_base', '-of', 'json', str(path)
        ], capture_output=True, text=True, check=True, timeout=30)
        streams = json.loads(result.stdout)['streams']
        if len(streams) != 1:
            hold('INVALID_CFR_STREAM_TIME_BASE')
        tick = Fraction(streams[0]['time_base'])
    except (OSError, subprocess.SubprocessError, ValueError, KeyError, TypeError, ZeroDivisionError):
        hold('INVALID_CFR_STREAM_TIME_BASE')
    if tick <= 0 or tick > Fraction(1, 10):
        hold('INVALID_CFR_STREAM_TIME_BASE')
    if not isinstance(frame_pts, list) or not frame_pts:
        hold('MISSING_FULL_FRAME_PTS')
    tolerance = Fraction(1, 1000)  # <= 1ms timebase rounding, not a shot frame
    for i, observed in enumerate(frame_pts):
        if type(observed) is not int or abs(observed*tick - Fraction(i, 1)/fps) > tolerance:
            hold('FRAME_PTS_NOT_AUTHORED_CFR_CLOCK_AT_' + str(i))
    return True


def _rgb_frames(path):
    try:
        return subprocess.run(['ffmpeg','-nostdin','-v','error','-xerror',
                               '-err_detect','explode','-i',str(path),'-map','0:v:0',
                               '-vf',f'scale={W}:{H}:flags=area,format=rgb24',
                               '-an','-vsync','0','-f','rawvideo','-pix_fmt','rgb24','-'],
                              capture_output=True,check=True,timeout=100).stdout
    except (OSError, subprocess.SubprocessError) as e:
        hold('FULL_RGB_PHYSICAL_DECODE_FAILED:'+type(e).__name__)


def _maes(old, new, n, channels):
    size = W*H*channels
    if len(old) != n*size or len(new) != n*size:
        hold('INCOMPLETE_PHYSICAL_VIDEO_DECODE')
    return [sum(abs(a-b) for a,b in zip(old[i*size:(i+1)*size],
                                       new[i*size:(i+1)*size])) / size
            for i in range(n)]


def inspect(*, source, edited, source_sha, edited_sha, srt, srt_sha, cue_ids):
    if source_sha == edited_sha:
        hold('SAME_FILM_NOT_A_NEW_RENDER')
    if shafile(source) != source_sha or shafile(edited) != edited_sha:
        hold('EXACT_MEDIA_SHA_MISMATCH')
    if shafile(srt) != srt_sha:
        hold('EXTERNAL_AUTHOR_SRT_SHA_MISMATCH')
    if (not isinstance(cue_ids, list) or not 1 <= len(cue_ids) <= 20
            or any(type(i) is not int or i < 1 for i in cue_ids)
            or cue_ids != sorted(set(cue_ids))):
        hold('CUE_SELECTION_DUPLICATE_OR_INVALID')
    v0, v1 = probe(source,'v:0'), probe(edited,'v:0')
    a0, a1 = probe(source,'a:0'), probe(edited,'a:0')
    if any(v.get('codec_name') != 'h264' for v in (v0,v1)) or any(a.get('codec_name')!='aac' for a in (a0,a1)):
        hold('VIDEO_AUDIO_FORMAT_UNSUPPORTED')
    keys=('width','height','nb_frames','avg_frame_rate','r_frame_rate')
    if any(v0[k] != v1[k] for k in keys):
        hold('FILM_FRAME_FORMAT_CHANGED')
    n = int(v0['nb_frames']); fps=Fraction(v0['avg_frame_rate'])
    if fps != Fraction(v0['r_frame_rate']) or n < 60 or n > 5400 or fps<12 or fps>60 or Fraction(n)/fps>90:
        hold('FRAME_RATE_OUTSIDE_RESEARCH_BOUNDS')
    p0,p1=presentation_pts(source),presentation_pts(edited)
    if (len(p0)!=n or p0!=p1 or any(x>=y for x,y in zip(p0,p0[1:]))):
        hold('PRESENTATION_TIMELINE_CHANGED')
    _assert_authored_cfr_clock(source,p0,fps)
    _assert_authored_cfr_clock(edited,p1,fps)
    try:
        raw=Path(srt).read_bytes()
        if len(raw)>65536:
            hold('OVERSIZE_AUTHOR_SRT')
        src=raw.decode('utf-8-sig').replace('\r\n','\n')
    except UnicodeError:
        hold('SRT_NOT_UTF8')
    parsed=_cues(src,n,fps)
    if cue_ids[-1] > len(parsed):
        hold('SELECTED_CUE_NOT_AUTHORED')
    selected=[parsed[i-1] for i in cue_ids]
    allowed=set()
    for cue in selected:
        allowed.update(range(cue['firstFrame'],cue['lastFrame']+1))
    # Strict original AAC: preserve all packet timing AND original stream bytes.
    fields=('pts','dts','duration','size','flags')
    ap0,ap1=packets(source,'a:0'), packets(edited,'a:0')
    if (not ap0 or len(ap0)!=len(ap1)
            or any(tuple(x.get(k) for k in fields)!=tuple(y.get(k) for k in fields)
                   for x,y in zip(ap0,ap1))):
        hold('AAC_PACKET_TIMING_CHANGED')
    ah0,ah1=audio_sha(source),audio_sha(edited)
    if ah0!=ah1:
        hold('ORIGINAL_AAC_ELEMENTARY_CHANGED')
    gray0,gray1=gray_frames(source),gray_frames(edited)
    rgb0,rgb1=_rgb_frames(source),_rgb_frames(edited)
    g=_maes(gray0,gray1,n,1);rgb=_maes(rgb0,rgb1,n,3)
    outside=[i for i in range(n) if i not in allowed]
    if not outside or any(g[i]>MAX_OUTSIDE_MAE or rgb[i]>MAX_OUTSIDE_MAE for i in outside):
        hold('UNDECLARED_GRAY_OR_COLOR_CHANGE_OUTSIDE_AUTHORED_CUES')
    for cue in selected:
        indices=range(cue['firstFrame'],cue['lastFrame']+1)
        if any(g[i] < MIN_INSIDE_MAE or rgb[i] < MIN_INSIDE_MAE for i in indices):
            hold('SELECTED_CUE_DID_NOT_CHANGE_ON_EVERY_FRAME')
    if shafile(source)!=source_sha or shafile(edited)!=edited_sha or shafile(srt)!=srt_sha:
        hold('INPUT_MUTATED_DURING_REPLAY')
    return {'schema':'ths-lane5-srt-locked-disjoint-edit-research-v1',
            'sourceSha256':source_sha,'editedSha256':edited_sha,'originalSrtSha256':srt_sha,
            'fps':str(fps),'videoFrames':n,'authoredCueCount':len(parsed),
            'bothDecodedPresentationClocksMatchAuthoredZeroOriginCfr':True,
            'editedCueWindows':[{'cue':q['cue'],'firstFrame':q['firstFrame'],
                                 'lastFrame':q['lastFrame'], 'authoredText':q['text']}
                                for q in selected],
            'targetFrames':len(allowed),'otherFrames':len(outside),
            'outsideGrayscaleMeanMae':round(sum(g[i] for i in outside)/len(outside),6),
            'outsideGrayscaleMaxMae':round(max(g[i] for i in outside),6),
            'outsideRgbMeanMae':round(sum(rgb[i] for i in outside)/len(outside),6),
            'outsideRgbMaxMae':round(max(rgb[i] for i in outside),6),
            'smallestChangedTargetFrameGrayMae':round(min(g[i] for i in allowed),6),
            'smallestChangedTargetFrameRgbMae':round(min(rgb[i] for i in allowed),6),
            'screenThresholdsMae8bit':{'maxOutside':MAX_OUTSIDE_MAE,'minInside':MIN_INSIDE_MAE},
            'originalAacElementarySha256':ah0,'audioPacketsBitstreamAndTimingUnchanged':True,
            'bothCompleteH264AndAacStreamsPhysicallyDecoded':True,
            'originalCaptionTextAuthorshipPinnedNotIndependentOCR':True,
            'decision':'DISJOINT_CUE_REPAIR_LOCALIZED_AUDIO_LOCKED_RELEASE_HELD',
            'independentHumanMobileScientificCraftAcceptance':False,
            'mayPublish':False,'firstExcellentMasterAccepted':False,'fiveRenderStreakAccepted':False}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    for x in ('source','edited','source-sha','edited-sha','srt','srt-sha','out'):
        p.add_argument('--'+x,required=True)
    p.add_argument('--cues',required=True,help='Comma-separated 1-based authored SRT cue IDs')
    x=p.parse_args()
    try:
        cues=[int(v) for v in x.cues.split(',')]
    except ValueError:
        hold('MALFORMED_CUE_SELECTION')
    r=inspect(source=x.source,edited=x.edited,source_sha=x.source_sha,edited_sha=x.edited_sha,
              srt=x.srt,srt_sha=x.srt_sha,cue_ids=cues)
    Path(x.out).write_text(json.dumps(r,indent=2,sort_keys=True)+'\n')
    print(r['decision'])
if __name__=='__main__':main()
