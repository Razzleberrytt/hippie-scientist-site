#!/usr/bin/env python3
"""EvidenceMotion Lane 4 research: exact-H264 full-frame one-zone OCR negative audit.

Every decoded frame in a declared, fully partitioned crop/word plan is OCR'd.
Research-only: no actual phone, comprehension, or publication approval.
"""
import argparse
import hashlib
import json
import math
import re
import subprocess
import tempfile
from pathlib import Path

SCHEMA = 'ths-em-lane4-fullframe-text-negative-v1'
TOKEN = re.compile(r'[a-z0-9]+(?:-[a-z0-9]+)*')


def fail(reason):
    raise ValueError('EM_L4_HOLD:' + reason)


def sha(path):
    digest = hashlib.sha256()
    with open(path, 'rb') as f:
        for piece in iter(lambda: f.read(1048576), b''):
            digest.update(piece)
    return digest.hexdigest()


def command(argv):
    try:
        return subprocess.run(argv, check=True, stdout=subprocess.PIPE,
                              stderr=subprocess.PIPE, timeout=180).stdout
    except (OSError, subprocess.SubprocessError):
        fail('ENCODED_FRAME_OR_OCR_EXECUTION_FAILED')


def strict_json(path):
    def pairs(items):
        obj = {}
        for key, value in items:
            if key in obj:
                fail('DUPLICATE_MANIFEST_FIELD')
            obj[key] = value
        return obj
    return json.loads(Path(path).read_text(encoding='utf-8'), object_pairs_hook=pairs,
                      parse_constant=lambda _: fail('NONFINITE_MANIFEST_VALUE'))


def words(value):
    return TOKEN.findall(value.casefold())


def preserves_required_order(observed, required):
    """Require critical scientific words in the declared visual reading order."""
    stream = iter(observed)
    return all(any(token == expected for token in stream) for expected in required)


def check(movie, manifest):
    movie, manifest = Path(movie), Path(manifest)
    if movie.resolve() == manifest.resolve():
        fail('FILM_AND_MANIFEST_ALIAS')
    manifest_sha = sha(manifest)
    data = strict_json(manifest)
    if (not isinstance(data, dict) or set(data) !=
        {'schema', 'status', 'mayPublish', 'filmSha256', 'cropPx', 'windows'} or
        data['schema'] != SCHEMA or data['status'] != 'RESEARCH_ONLY' or
        data['mayPublish'] is not False):
        fail('EXACT_RESEARCH_MANIFEST_REQUIRED')
    initial_sha = sha(movie)
    if not isinstance(data['filmSha256'], str) or data['filmSha256'] != initial_sha:
        fail('ENCODED_SHA_MISMATCH')
    # ffprobe reports *all actual decoded frame PTS*, not header frame rate alone.
    probe = json.loads(command(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-show_streams', '-show_frames', '-show_entries',
        'stream=codec_name,width,height,r_frame_rate,sample_aspect_ratio:frame=pts_time,best_effort_timestamp_time',
        '-of', 'json', str(movie)]))
    streams, frames = probe.get('streams', []), probe.get('frames', [])
    if (len(streams) != 1 or streams[0].get('codec_name') != 'h264' or
        (streams[0].get('width'), streams[0].get('height')) != (1080, 1920) or
        streams[0].get('r_frame_rate') != '30/1' or
        streams[0].get('sample_aspect_ratio') != '1:1' or
        not 12 <= len(frames) <= 1800):
        fail('NATIVE_H264_1080X1920_30FPS_SQUARE_PIXEL_REQUIRED')
    for index, frame in enumerate(frames):
        try:
            pts = float(frame['pts_time'])
            inferred = float(frame['best_effort_timestamp_time'])
        except (KeyError, TypeError, ValueError):
            fail('PHYSICAL_FRAME_RAW_PTS_MISSING')
        if (not math.isfinite(pts) or not math.isfinite(inferred)
            or abs(pts - index / 30) > .001 or abs(pts - inferred) > .001):
            fail('PHYSICAL_FRAME_PTS_DISCONTINUITY:' + str(index))
    # Audit the entire container stream inventory as well as the validated v:0
    # sequence: a second video track could otherwise be selected by a player.
    inventory = json.loads(command(['ffprobe', '-v', 'error',
        '-show_streams', '-show_entries', 'stream=index,codec_type',
        '-of', 'json', str(movie)]))
    all_streams = inventory.get('streams')
    if (not isinstance(all_streams, list) or
        sum(isinstance(track, dict) and track.get('codec_type') == 'video'
            for track in all_streams) != 1):
        fail('AMBIGUOUS_MULTIPLE_OR_MISSING_VIDEO_STREAMS')
    crop = data['cropPx']
    if (not isinstance(crop, list) or len(crop) != 4 or
        any(type(n) is not int for n in crop)):
        fail('INVALID_CROP')
    x, y, width, height = crop
    if x < 0 or y < 0 or width < 100 or height < 50 or x + width > 1080 or y + height > 1920:
        fail('INVALID_CROP')
    windows = data['windows']
    if not isinstance(windows, list) or not 1 <= len(windows) <= 1800:
        fail('WINDOWS_REQUIRED')
    expected, cursor = [], 0
    for item in windows:
        if not isinstance(item, dict) or set(item) != {'start', 'end', 'requiredWords', 'allowedWords'}:
            fail('EXACT_WINDOW_FIELDS_REQUIRED')
        start, end = item['start'], item['end']
        if type(start) is not int or type(end) is not int or start != cursor or end <= start or end > len(frames):
            fail('UNCOVERED_OR_OVERLAPPING_WINDOW')
        required, allowed = item['requiredWords'], item['allowedWords']
        if (not isinstance(required, list) or not isinstance(allowed, list) or
            not 1 <= len(required) <= 8 or not 1 <= len(allowed) <= 24 or
            any(type(t) is not str or not re.fullmatch(r'[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*', t)
                for t in required + allowed) or
            len({t.casefold() for t in required}) != len(required) or
            len({t.casefold() for t in allowed}) != len(allowed) or
            not set(t.casefold() for t in required).issubset(t.casefold() for t in allowed)):
            fail('INVALID_WINDOW_WORD_ORACLE')
        expected.extend([(tuple(t.casefold() for t in required),
                          set(t.casefold() for t in required),
                          set(t.casefold() for t in allowed))] * (end - start))
        cursor = end
    if cursor != len(frames):
        fail('FULL_FRAME_WORD_PLAN_REQUIRED')
    defects = []
    with tempfile.TemporaryDirectory(prefix='em-l4-frames-') as d:
        folder = Path(d)
        command(['ffmpeg', '-nostdin', '-v', 'error', '-xerror', '-i', str(movie),
                 '-map', '0:v:0', '-vf', f'crop={width}:{height}:{x}:{y}', '-fps_mode', 'passthrough',
                 '-start_number', '0', '-y', str(folder / 'frame-%06d.png')])
        actual_files = sorted(folder.glob('frame-*.png'))
        if len(actual_files) != len(frames):
            fail('DECODED_FRAME_OUTPUT_COUNT_MISMATCH')
        for n, path in enumerate(actual_files):
            if path.name != f'frame-{n:06d}.png':
                fail('DECODED_FRAME_SEQUENCE_GAP')
            observed = words(command(['tesseract', str(path), 'stdout', '--psm', '6']).decode('utf-8', 'replace'))
            required_order, required, allowed = expected[n]
            missing = sorted(required - set(observed))
            unexpected = sorted(set(observed) - allowed)
            out_of_order = not missing and not preserves_required_order(observed, required_order)
            # Duplicate required words can invert a negation (e.g. NOT NOT).
            # Hold instead of treating an in-order subsequence as sufficient.
            repeated = sorted(token for token in required if observed.count(token) > 1)
            if missing or unexpected or out_of_order or repeated:
                defects.append({'frameIndex': n, 'timestampSec': round(n/30, 6),
                                'cropSha256': sha(path), 'observedWords': observed,
                                'missingRequiredWords': missing, 'unexpectedWords': unexpected,
                                'repeatedRequiredWords': repeated,
                                'requiredWordsOutOfOrder': out_of_order})
    if sha(movie) != initial_sha or sha(manifest) != manifest_sha:
        fail('SOURCE_CHANGED_DURING_AUDIT')
    return {'schema': SCHEMA, 'status': 'HOLD' if defects else 'MECHANICAL_OCR_NO_HOLD_REVIEW_REQUIRED',
            'filmSha256': initial_sha, 'manifestSha256': manifest_sha,
            'actualDecodedFrames': len(frames), 'framesOCRChecked': len(frames),
            'allFramesOfDeclaredCropAudited': True, 'allPixelRegionsAudited': False,
            'defects': defects, 'defectFrames': len(defects),
            'tesseractIsIndependentQualifiedViewer': False,
            'handsetReadabilityApproved': False, 'scientificClaimsApproved': False,
            'mutedAudienceComprehensionApproved': False, 'mayPublish': False}


if __name__ == '__main__':
    a = argparse.ArgumentParser()
    a.add_argument('--film', required=True)
    a.add_argument('--manifest', required=True)
    a.add_argument('--out', required=True)
    opt = a.parse_args()
    if Path(opt.out).resolve() in [Path(opt.film).resolve(), Path(opt.manifest).resolve()] or Path(opt.out).is_symlink():
        fail('OUTPUT_ALIASES_SOURCE')
    output = Path(opt.out)
    # New run-unique file: never delete or overwrite a stale/unrelated receipt.
    if output.exists():
        fail('DO_NOT_OVERWRITE_PRIOR_RECEIPT')
    report = check(opt.film, opt.manifest)
    output.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive creation closes the preflight-to-write overwrite race.
    with output.open('x', encoding='utf-8') as handle:
        handle.write(json.dumps(report, indent=2) + '\n')
    print(json.dumps({'status': report['status'], 'framesOCRChecked': report['framesOCRChecked'],
                      'defectFrames': report['defectFrames']}, indent=2))
    if report['status'] == 'HOLD':
        raise SystemExit(2)
