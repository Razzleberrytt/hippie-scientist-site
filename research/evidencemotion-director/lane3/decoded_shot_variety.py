#!/usr/bin/env python3
"""EvidenceMotion Lane 3: read-only decoded cross-shot composition watch.

For research only: exact SHA of the real encoded film must equal the nine-shot
storyboard source pin. Detect similar science-area framing *despite* changing
caption/header text. Human reviewers decide whether repetition teaches or looks
cheap. Not a source-chemistry, voice, quality, mobile or publication approval.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
import subprocess
import wave
import struct

THUMB_W, THUMB_H = 96, 170
# Body-science field intentionally excludes the title and narration bands.
SCIENCE_BOX = (.04, .27, .96, .70)
MIN_ROI_MAE = 6.0
MIN_EDGE_IOU = .55
ORIGINAL_WAV_SHA256 = '9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435'
ORIGINAL_WAV_FRAMES = 824336
ORIGINAL_SILENCE = (663600, 746160)  # independently identified by Lane 2


class CraftHold(ValueError):
    pass


def file_sha256(path):
    sha = hashlib.sha256()
    with open(path, 'rb') as handle:
        for part in iter(lambda: handle.read(1 << 20), b''):
            sha.update(part)
    return sha.hexdigest()


def read_metadata(film):
    cmd = ['ffprobe', '-v', 'error', '-select_streams', 'v:0',
           '-show_entries', 'stream=codec_name,width,height,avg_frame_rate,nb_frames',
           '-of', 'json', str(film)]
    try:
        raw = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                             check=True).stdout
        streams = json.loads(raw).get('streams', [])
    except (subprocess.CalledProcessError, ValueError, OSError) as exc:
        raise CraftHold('FILM_PROBE_FAILED') from exc
    if len(streams) != 1:
        raise CraftHold('FILM_VIDEO_STREAM_REQUIRED')
    s = streams[0]
    try:
        n, d = [int(v) for v in s['avg_frame_rate'].split('/')]
        count = int(s['nb_frames'])
        width, height = int(s['width']), int(s['height'])
    except (KeyError, ValueError, ZeroDivisionError) as exc:
        raise CraftHold('FILM_CONSTANT_FRAME_GRID_REQUIRED') from exc
    if s.get('codec_name') != 'h264' or count <= 0 or (n, d) != (30, 1):
        raise CraftHold('FILM_CODEC_OR_FRAME_GRID_MISMATCH')
    if width != 1080 or height != 1920:
        raise CraftHold('FILM_NATIVE_PORTRAIT_REQUIRED')
    return count


def validate_story(story, *, digest, frame_count):
    if not isinstance(story, dict) or story.get('encodedH264Sha256') != digest:
        raise CraftHold('STORY_ENCODED_FILM_SHA_MISMATCH')
    if story.get('nineShotsMapped') != 9:
        raise CraftHold('NINE_REAL_SHOTS_REQUIRED')
    shots = story.get('shots')
    if not isinstance(shots, list) or len(shots) != 9:
        raise CraftHold('NINE_REAL_SHOTS_REQUIRED')
    if story.get('mayPublish') is not False:
        raise CraftHold('STORY_MAY_PUBLISH_MUST_REMAIN_FALSE')
    prior_end = 0
    seen = set()
    for shot in shots:
        if not isinstance(shot, dict) or not isinstance(shot.get('shot'), str) or not shot['shot'].strip() or shot['shot'] in seen:
            raise CraftHold('DUPLICATE_OR_MISSING_SHOT_ID')
        seen.add(shot['shot'])
        start, end = shot.get('startSec'), shot.get('endSec')
        if any(not isinstance(x, (int,float)) or isinstance(x,bool) or not math.isfinite(x) for x in (start, end)):
            raise CraftHold('SHOT_TIME_INVALID')
        start_frame, end_frame = round(start * 30), round(end * 30)
        if abs(start - start_frame / 30) > .017 or abs(end - end_frame / 30) > .017:
            # Source word boundaries need not be frame multiples, but the
            # uniquely rounded frame bins must be unambiguous.
            raise CraftHold('SHOT_BOUNDARY_UNMAPPABLE')
        if start_frame != prior_end or end_frame <= start_frame:
            raise CraftHold('SHOT_FRAME_COVERAGE_GAP_OR_OVERLAP')
        prior_end = end_frame
    if prior_end != frame_count:
        raise CraftHold('STORY_FILM_FRAME_COUNT_MISMATCH')
    return shots


def body_pixels(frame):
    xa, ya, xb, yb = SCIENCE_BOX
    x0, x1 = round(THUMB_W * xa), round(THUMB_W * xb)
    y0, y1 = round(THUMB_H * ya), round(THUMB_H * yb)
    return [frame[y * THUMB_W + x0:y * THUMB_W + x1]
            for y in range(y0, y1)]


def fingerprint(frame):
    rows = body_pixels(frame)
    values = bytes(v for row in rows for v in row)
    # Edge structure is comparatively robust to captions, camera backgrounds,
    # smooth fades and simple palette changes. It is NOT a molecule matcher.
    edges = set()
    width = len(rows[0])
    for y in range(1, len(rows) - 1):
        for x in range(1, width - 1):
            if abs(rows[y][x + 1] - rows[y][x - 1]) + abs(rows[y + 1][x] - rows[y - 1][x]) > 24:
                edges.add(y * width + x)
    return values, edges


def compare(left, right):
    pix_a, edge_a = left
    pix_b, edge_b = right
    mae = sum(abs(a - b) for a, b in zip(pix_a, pix_b)) / len(pix_a)
    union = len(edge_a | edge_b)
    iou = len(edge_a & edge_b) / union if union else 1.0
    return round(mae, 4), round(iou, 4)


def decode_samples(film, sample_frames, frame_count):
    command = ['ffmpeg', '-nostdin', '-hide_banner', '-loglevel', 'error', '-xerror',
               '-i', str(film), '-map', '0:v:0', '-vf',
               f'scale={THUMB_W}:{THUMB_H}:flags=area',
               '-vsync', '0', '-f', 'rawvideo', '-pix_fmt', 'gray', '-']
    try:
        process = subprocess.Popen(command, stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE)
    except OSError as exc:
        raise CraftHold('FILM_DECODER_UNAVAILABLE') from exc
    size = THUMB_W * THUMB_H
    wanted = set(sample_frames)
    samples = {}
    count = 0
    try:
        while True:
            buf = process.stdout.read(size)
            if not buf:
                break
            if len(buf) != size:
                raise CraftHold('TRUNCATED_DECODED_FRAME')
            if count in wanted:
                samples[count] = fingerprint(buf)
            count += 1
        result = process.wait()
        if result:
            raise CraftHold('FILM_DECODER_FAILURE')
        if count != frame_count or len(samples) != len(wanted):
            raise CraftHold('DECODE_FRAME_COUNT_OR_SAMPLE_MISMATCH')
        return samples
    except BaseException:
        process.kill()
        process.wait()
        raise
    finally:
        process.stdout.close()
        process.stderr.close()


def sample_frame_triplet(start_frame, end_frame):
    """Early, middle, late *real frame numbers* strictly within one shot.

    Three temporal samples avoid a false sense of motion/diversity when a
    transient appears only at the midpoint. Short shots remain fail-closed:
    requiring three distinct frames prevents fabricated independent evidence.
    """
    duration = end_frame - start_frame
    if duration < 3:
        raise CraftHold('SHOT_TOO_SHORT_FOR_TEMPORAL_REVIEW')
    positions = [start_frame + (duration - 1) * num // 4 for num in (1, 2, 3)]
    if len(set(positions)) != 3 or not all(start_frame <= x < end_frame for x in positions):
        raise CraftHold('SHOT_TEMPORAL_SAMPLE_COLLISION')
    return positions


def similar(left, right):
    mae, iou = compare(left, right)
    return {'scienceRoiMeanAbsoluteGrayDifference':mae,
            'scienceRoiEdgeIoU':iou,
            'nearDuplicateReviewCandidate':mae <= MIN_ROI_MAE and iou >= MIN_EDGE_IOU}



def frame_midpoint_lattice_in_zero_run(start_sample, end_sample, *, fps=30, sample_rate=24000, total_frames=1031):
    """Physical PCM sample-bin to film frame centers, entirely integral math."""
    if (type(start_sample) is not int or type(end_sample) is not int or
            type(fps) is not int or type(sample_rate) is not int or
            type(total_frames) is not int or
            fps<=0 or sample_rate<=0 or not 0<=start_sample<end_sample or
            not 0<total_frames<=5400):
        raise CraftHold('SOURCE_SILENCE_FRAME_GRID_INVALID')
    # Evaluate (n+0.5)/fps in [start/sample_rate,end/sample_rate),
    # without lossy floating-point rounding at the exact 27.65s boundary.
    selected=[n for n in range(total_frames)
              if 2*start_sample*fps <= (2*n+1)*sample_rate <
                 2*end_sample*fps]
    if len(selected)<2 or len(selected)>5400 or (
            selected[-1]-selected[0]+1!=len(selected)):
        raise CraftHold('SOURCE_SILENCE_FRAME_GRID_UNAVAILABLE')
    return selected


def measure_source_hold_motion(film, frame_count, silence_frames):
    """EVERY visually decoded frame centered in source zero speech samples.

    Heuristic body-ROI grayscale MAE: a scientific source card intentionally
    remains readable, so pixel similarity is a review cue, never an automatic
    artistic failure, let alone release permission.
    """
    if (type(frame_count) is not int or frame_count<=0 or frame_count>5400 or
            not isinstance(silence_frames,list) or len(silence_frames)<2 or
            any(type(v) is not int or not 0<=v<frame_count for v in silence_frames)
            or silence_frames!=list(range(silence_frames[0],silence_frames[-1]+1))):
        raise CraftHold('SILENCE_VISUAL_FRAME_INTERVAL_INVALID')
    decoded=decode_samples(film,silence_frames,frame_count)
    threshold=.5  # grayscale mean abs/255; diagnostic, NOT a hard publish gate.
    transitions=[]
    low_start=None
    longest=(0,None,None)
    for previous,current in zip(silence_frames,silence_frames[1:]):
        left=decoded[previous][0]
        right=decoded[current][0]
        if len(left)!=len(right) or not left:
            raise CraftHold('SOURCE_HOLD_DECODED_ROI_MISSING')
        diff=sum(abs(a-b) for a,b in zip(left,right))/len(left)
        transitions.append(diff)
        if diff<=threshold:
            if low_start is None:low_start=previous
            length=current-low_start+1
            if length>longest[0]:
                longest=(length,low_start,current+1)
        else:
            low_start=None
    return {
        'metric':'full-linear-H264-decode-every-silent-frame-center-science-body-gray-MAE',
        'firstSilentFrame':silence_frames[0],
        'lastSilentFrameInclusive':silence_frames[-1],
        'silentFramesCompared':len(silence_frames),
        'adjacentFrameTransitionsCompared':len(transitions),
        'lowMotionTransitionThresholdGrayMae255':threshold,
        'meanAdjacentGrayMae255':round(sum(transitions)/len(transitions),6),
        'maxAdjacentGrayMae255':round(max(transitions),6),
        'lowMotionTransitions':sum(1 for v in transitions if v<=threshold),
        'longestConsecutiveLowMotionFrames':longest[0],
        'longestLowMotionFrameRangeExclusive':[longest[1],longest[2]] if longest[1] is not None else None,
        'limits':'Every decoded silence-frame ROI, not captions/title; compression, gentle drift or static educational reading card may be valid; creative reviewer required',
        'excellentCertified':False,'mayPublish':False
    }


def audit(film, story_file, *, original_wav=None):
    film = Path(film)
    digest = file_sha256(film)
    source = Path(story_file)
    # Capture the storyboard identity BEFORE decoding. A late first hash
    # would accidentally endorse changed bytes read during the audit.
    story_sha = file_sha256(source)
    story = json.loads(source.read_text())
    if file_sha256(source) != story_sha:
        raise CraftHold('STORY_BYTES_CHANGED_DURING_CRAFT_AUDIT')
    frame_count = read_metadata(film)
    shots = validate_story(story, digest=digest, frame_count=frame_count)
    frame_bins = [(round(s['startSec'] * 30), round(s['endSec'] * 30)) for s in shots]
    samples = [sample_frame_triplet(a, b) for a, b in frame_bins]
    # Previous near-boundary comparisons sampled the last QUARTER of one
    # shot and first QUARTER of the next, not the actual editorial cut.
    # Pin both physically adjacent frames at all eight storyboard cuts.
    actual_cut_frames = [(frame_bins[i][1]-1, frame_bins[i+1][0])
                         for i in range(len(frame_bins)-1)]
    requested = ([n for shot in samples for n in shot] +
                 [n for pair in actual_cut_frames for n in pair])
    frames = decode_samples(film, requested, frame_count)
    comparisons = []
    near = []
    boundary_risk = []
    exact_cut_review = []
    within_shot = []
    for i, shot in enumerate(shots):
        early, mid, late = samples[i]
        intra = {'shot':shot['shot'], 'sourceSceneIndex':i,
                 'sampleFrameNumbers':[early, mid, late],
                 **similar(frames[early], frames[late])}
        # A source card may intentionally be static. Treat this as a review
        # candidate, NEVER an automatically invalidated artistic decision.
        intra['nearStaticBodyReviewCandidate'] = intra.pop('nearDuplicateReviewCandidate')
        within_shot.append(intra)
        if i + 1 == len(shots):
            continue
        next_early, next_mid, _ = samples[i + 1]
        # Preserve V1's backwards-comparable midpoint comparison exactly.
        result = {'from':shot['shot'], 'to':shots[i + 1]['shot'],
                  'sourceSceneIndex':i, 'toSceneIndex':i+1,
                  **similar(frames[mid], frames[next_mid])}
        comparisons.append(result)
        if result['nearDuplicateReviewCandidate']:
            near.append(result)
        # Additionally inspect the *actual exit and entrance*, to catch a
        # hold recycled across the cut but hidden by midpoint-only checking.
        transition = {'from':shot['shot'], 'to':shots[i + 1]['shot'],
                      'exitFrame':late, 'entryFrame':next_early,
                      **similar(frames[late], frames[next_early])}
        boundary_risk.append(transition)
        # Match the true encoded cut itself, not two late/early proxy frames.
        # Keeping both measurements exposes a cut that seems different
        # at quarter positions but repeats the same body at the splice.
        cut_exit, cut_entry = actual_cut_frames[i]
        cut_similarity = similar(frames[cut_exit], frames[cut_entry])
        exact_cut_review.append({
            'from':shot['shot'], 'to':shots[i+1]['shot'],
            'exitFrame':cut_exit, 'entryFrame':cut_entry,
            'adjacentEncodedFrames':cut_entry==cut_exit+1,
            **cut_similarity,
        })
    result = {'schema':'ths-lane3-decoded-visual-variety-negative-filter-v2',
            'status':'DECODED_VISUAL_REVIEW_REQUIRED',
            'filmSha256':digest, 'storySha256':story_sha,
            'fullDecodedFrames':frame_count, 'scienceArea':list(SCIENCE_BOX),
            'framesIndependentlyDecoded':True,
            'sampling':'three early/middle/late frames per shot PLUS both actual adjacent encoded cut frames at all 8 cuts; full linear H264 decode',
            'uniqueDecodedFramesSampled':len(frames),
            'methodLimit':'Small center-body grayscale and edge similarity are only visual risk proxies; they cannot tell purposeful scientific continuity from cheap repetition, or prove audience comprehension.',
            'comparisons':comparisons, 'nearDuplicateReviewCount':len(near),
            'withinShotTemporalReview':within_shot,
            'nearStaticShotCount':sum(1 for item in within_shot if item['nearStaticBodyReviewCandidate']),
            'boundaryExitEntranceReview':boundary_risk,
            'nearDuplicateBoundaryCount':sum(1 for item in boundary_risk if item['nearDuplicateReviewCandidate']),
            'boundaryActualCutAdjacentReview':exact_cut_review,
            'nearDuplicateActualCutCount':sum(1 for item in exact_cut_review
                                               if item['nearDuplicateReviewCandidate']),
            'actualCutProbeLimit':'Consecutive 96x170 gray science-body H264 frames only; a deliberate matched cut/fade is possible and human creative review is required',
            'creativeExceptionsAutomaticallyGranted':False,
            'sourceScienceVerified':False, 'voiceApproved':False,
            'phonePlaybackApproved':False, 'excellentCertified':False,
            'mayPublish':False}
    if original_wav is not None:
        pacing=audit_source_hold_silence(original_wav, story, result)
        silence_frames=frame_midpoint_lattice_in_zero_run(*ORIGINAL_SILENCE,
            total_frames=frame_count)
        pacing['everySilentFrameMotionReview']=measure_source_hold_motion(
            film,frame_count,silence_frames)
        result['originalVoiceSourceHoldPacing']=pacing
    # A decoded-film review must be tied to the bytes that were decoded, not
    # only the same filenames checked before launching external FFmpeg.
    # Another writer changing film/story/WAV during either decode cannot
    # inherit the original hash in this research receipt.
    if file_sha256(film) != digest:
        raise CraftHold('FILM_BYTES_CHANGED_DURING_CRAFT_AUDIT')
    if file_sha256(source) != result['storySha256']:
        raise CraftHold('STORY_BYTES_CHANGED_DURING_CRAFT_AUDIT')
    if original_wav is not None and file_sha256(original_wav) != ORIGINAL_WAV_SHA256:
        raise CraftHold('ORIGINAL_WAV_BYTES_CHANGED_DURING_CRAFT_AUDIT')
    return result



def audit_source_hold_silence(original_wav, story, decoded):
    """Re-read exact original PCM, correlate its silent hold with decoded shots.

    The source card can intentionally use silence. This is a director review
    and *never* a permission to alter original narration or captions.
    """
    wav = Path(original_wav)
    if not wav.is_file() or wav.is_symlink() or file_sha256(wav)!=ORIGINAL_WAV_SHA256:
        raise CraftHold('ORIGINAL_WAV_HASH_OR_FILE_MISMATCH')
    if (story.get('sourceWavSha256')!=ORIGINAL_WAV_SHA256 or
            story.get('mayPublish') is not False or
            decoded.get('filmSha256')!=story.get('encodedH264Sha256') or
            decoded.get('fullDecodedFrames')!=1031 or
            decoded.get('mayPublish') is not False):
        raise CraftHold('ORIGINAL_SILENCE_FILM_AND_STORY_IDENTITY_REQUIRED')
    try:
        with wave.open(str(wav),'rb') as w:
            if (w.getnchannels(),w.getsampwidth(),w.getframerate(),
                    w.getnframes(),w.getcomptype())!=(1,2,24000,ORIGINAL_WAV_FRAMES,'NONE'):
                raise CraftHold('ORIGINAL_WAV_PCM_FORMAT_CHANGED')
            data=w.readframes(ORIGINAL_WAV_FRAMES)
    except (OSError,wave.Error,EOFError) as exc:
        raise CraftHold('ORIGINAL_WAV_DECODE_FAILED') from exc
    if len(data)!=ORIGINAL_WAV_FRAMES*2:
        raise CraftHold('ORIGINAL_WAV_TRUNCATED')
    runs=[]
    beginning=None
    for i,(value,) in enumerate(struct.iter_unpack('<h',data)):
        if value==0 and beginning is None: beginning=i
        if value!=0 and beginning is not None:
            if i-beginning>=28800: runs.append((beginning,i))
            beginning=None
    if beginning is not None and ORIGINAL_WAV_FRAMES-beginning>=28800:
        runs.append((beginning,ORIGINAL_WAV_FRAMES))
    if runs!=[ORIGINAL_SILENCE]:
        raise CraftHold('SOURCE_DIGITAL_ZERO_INTERVAL_CHANGED')
    a,z=ORIGINAL_SILENCE
    if (struct.unpack_from('<h',data,2*(a-1))[0]==0 or
            struct.unpack_from('<h',data,2*z)[0]==0):
        raise CraftHold('SOURCE_SILENCE_BOUNDARY_SIGNAL_MISSING')
    shots=story.get('shots')
    if not isinstance(shots,list) or len(shots)!=9:
        raise CraftHold('NINE_SOURCE_SHOTS_REQUIRED')
    matching=[x for x in shots if isinstance(x,dict) and x.get('shot')=='source_hold']
    if len(matching)!=1: raise CraftHold('SILENT_SOURCE_HOLD_NOT_UNIQUE')
    try:
        left=float(matching[0]['startSec'])
        right=float(matching[0]['endSec'])
    except (TypeError,ValueError,KeyError) as exc:
        raise CraftHold('SILENT_HOLD_TIMING_INVALID') from exc
    if not 27.30<=left<=27.40 or not 31.20<=right<=31.30 or not left<=a/24000<z/24000<=right:
        raise CraftHold('SILENT_SOURCE_HOLD_TIMELINE_CHANGED')
    visual=decoded.get('withinShotTemporalReview')
    if not isinstance(visual,list): raise CraftHold('SILENT_HOLD_VISUAL_EVIDENCE_REQUIRED')
    similar=[v for v in visual if isinstance(v,dict) and v.get('shot')=='source_hold']
    if len(similar)!=1 or type(similar[0].get('nearStaticBodyReviewCandidate')) is not bool:
        raise CraftHold('SILENT_HOLD_VISUAL_EVIDENCE_REQUIRED')
    samples=similar[0].get('sampleFrameNumbers')
    if (not isinstance(samples,list) or len(samples)!=3 or
            any(type(x) is not int or not left<=x/30<right for x in samples)):
        raise CraftHold('SILENT_HOLD_SAMPLE_GRID_MISMATCH')
    return {
        'schema':'ths-lane3-source-locked-silence-craft-review-v1',
        'status':'ORIGINAL_SOURCE_HOLD_DIRECTOR_AUDITION_REQUIRED',
        'sourceWavSha256':ORIGINAL_WAV_SHA256,
        'encodedFilmSha256':decoded['filmSha256'],
        'exactZeroSampleInterval':list(ORIGINAL_SILENCE),
        'sampleRate':24000,'silenceDurationSec':(z-a)/24000,
        'sourceHoldShotId':'source_hold',
        'sourceHoldSec':[left,right],
        'sourceHoldSilenceFraction':round(((z-a)/24000)/(right-left),6),
        'wholeMovieSilenceFraction':round(((z-a)/24000)/(1031/30),6),
        'decodedSourceHoldSampleFrames':samples,
        'visualSamplesDuringSilence':all(a/24000<=v/30<z/24000 for v in samples),
        'nearStaticBodyDuringSourceHold':similar[0]['nearStaticBodyReviewCandidate'],
        'choicesForOwner':['KEEP_EXPLICIT_SOURCE_READ_PAUSE_AFTER_AUDITION',
                           'REDIRECT_VISUALS_TO_LEGIBLE_SOURCE_CARDS_WITH_UNCHANGED_AUDIO',
                           'SEPARATE_OWNER_APPROVAL_REQUIRED_FOR_AUDIO_OR_CAPTION_EDIT'],
        'humanPacingApproved':False,
        'automaticAudioTrimAllowed':False,
        'automaticCaptionShiftAllowed':False,
        'excellentCertified':False,'mayPublish':False,
        'limits':'Original WAV zero run, 3 shot samples and optional full-silence-frame ROI audit; no captions, phone comprehension or human creative approval'
    }


def write_new_report_safely(output, payload, protected_inputs):
    """Write to a fresh path only, never overwrite source media/proof.

    Exclusive creation also closes the exists-check -> concurrent-writer race.
    """
    target = Path(output)
    for src in protected_inputs:
        if src is None:
            continue
        source = Path(src)
        if target.resolve() == source.resolve() or (
                target.exists() and source.exists() and target.samefile(source)):
            raise CraftHold('REPORT_OUTPUT_ALIASES_AUDITED_INPUT')
    try:
        with target.open('x', encoding='utf-8') as stream:
            stream.write(payload)
    except FileExistsError as exc:
        raise CraftHold('REPORT_OUTPUT_NOT_FRESH') from exc


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--film', type=Path, required=True)
    parser.add_argument('--story', type=Path, required=True)
    parser.add_argument('--original-wav', type=Path, help='Optional original SHA-pinned PCM research pacing review')
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    try:
        result = audit(args.film, args.story, original_wav=args.original_wav)
    except (CraftHold, OSError, ValueError, json.JSONDecodeError) as exc:
        result = {'schema':'ths-lane3-decoded-visual-variety-negative-filter-v1',
                  'status':'HOLD', 'reason':str(exc), 'mayPublish':False}
        code = 3
    else:
        code = 0
    payload = json.dumps(result, indent=2, sort_keys=True) + '\n'
    if args.output:
        try:
            write_new_report_safely(args.output, payload,
                                    (args.film, args.story, args.original_wav))
        except (CraftHold, OSError) as exc:
            print(json.dumps({'schema':'ths-lane3-report-output-hold-v1',
                              'status':'HOLD','reason':str(exc),
                              'mayPublish':False}))
            return 3
    else:
        print(payload, end='')
    return code


if __name__ == '__main__':
    raise SystemExit(main())
