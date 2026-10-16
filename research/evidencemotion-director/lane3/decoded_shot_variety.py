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

THUMB_W, THUMB_H = 96, 170
# Body-science field intentionally excludes the title and narration bands.
SCIENCE_BOX = (.04, .27, .96, .70)
MIN_ROI_MAE = 6.0
MIN_EDGE_IOU = .55


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
    command = ['ffmpeg', '-nostdin', '-hide_banner', '-loglevel', 'error',
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


def audit(film, story_file):
    film = Path(film)
    digest = file_sha256(film)
    source = Path(story_file)
    story = json.loads(source.read_text())
    frame_count = read_metadata(film)
    shots = validate_story(story, digest=digest, frame_count=frame_count)
    frame_bins = [(round(s['startSec'] * 30), round(s['endSec'] * 30)) for s in shots]
    midpoints = [(a + b - 1) // 2 for a, b in frame_bins]
    frames = decode_samples(film, midpoints, frame_count)
    comparisons = []
    near = []
    for i in range(len(shots) - 1):
        mae, iou = compare(frames[midpoints[i]], frames[midpoints[i + 1]])
        candidate = mae <= MIN_ROI_MAE and iou >= MIN_EDGE_IOU
        result = {'from':shots[i]['shot'], 'to':shots[i+1]['shot'],
                  'sourceSceneIndex':i, 'toSceneIndex':i+1,
                  'scienceRoiMeanAbsoluteGrayDifference':mae,
                  'scienceRoiEdgeIoU':iou, 'nearDuplicateReviewCandidate':candidate}
        comparisons.append(result)
        if candidate: near.append(result)
    return {'schema':'ths-lane3-decoded-visual-variety-negative-filter-v1',
            'status':'DECODED_VISUAL_REVIEW_REQUIRED',
            'filmSha256':digest, 'storySha256':file_sha256(source),
            'fullDecodedFrames':frame_count, 'scienceArea':list(SCIENCE_BOX),
            'framesIndependentlyDecoded':True,
            'sampling':'one midpoint from each of nine mapped shots, full linear H264 decode',
            'methodLimit':'Center-body pixel similarity cannot distinguish intentional comparison from cheap repetition; requires qualified viewing of the full film.',
            'comparisons':comparisons, 'nearDuplicateReviewCount':len(near),
            'creativeExceptionsAutomaticallyGranted':False,
            'sourceScienceVerified':False, 'voiceApproved':False,
            'phonePlaybackApproved':False, 'excellentCertified':False,
            'mayPublish':False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--film', type=Path, required=True)
    parser.add_argument('--story', type=Path, required=True)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    try:
        result = audit(args.film, args.story)
    except (CraftHold, OSError, ValueError, json.JSONDecodeError) as exc:
        result = {'schema':'ths-lane3-decoded-visual-variety-negative-filter-v1',
                  'status':'HOLD', 'reason':str(exc), 'mayPublish':False}
        code = 3
    else:
        code = 0
    payload = json.dumps(result, indent=2, sort_keys=True) + '\n'
    if args.output:
        args.output.write_text(payload)
    else:
        print(payload, end='')
    return code


if __name__ == '__main__':
    raise SystemExit(main())
