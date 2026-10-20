#!/usr/bin/env python3
"""Original-film research ONLY: exact-H264 decoded caption-band change gate.

A frame transition proves pixel change in the band, NOT that words are readable,
correctly identified, spoken at that moment, or approved for release.
"""
import argparse
import hashlib
import json
import math
import re
import subprocess
from pathlib import Path

import numpy as np

SCHEMA = 'ths-encoded-caption-band-transition-research-v1'
WIDTH, HEIGHT, FPS, FRAMES = 1080, 1920, 30, 1031
ROI = (40, 1260, 1000, 130)
BAND_WIDTH, BAND_HEIGHT = 500, 65
MIN_EVENT_MAE = 1.0  # original-source candidate only; not a legibility threshold
MIN_FOREGROUND_MASK_CHANGED_PIXELS = 180  # source-bound color triage, not OCR
MAX_MOVIE_BYTES = 50_000_000


def sha(value):
    return hashlib.sha256(value).hexdigest()


def valid_sha(value):
    return isinstance(value, str) and bool(re.fullmatch('[a-f0-9]{64}', value))


def hold(reason):
    return {'schema': SCHEMA, 'status': 'HOLD', 'errors': [reason], 'mayPublish': False,
            'encodedCaptionTextVerified': False, 'acousticWordBoundariesCalibrated': False,
            'humanPhoneComprehensionApproved': False}


def caption_text(frame):
    annotations = frame.get('annotations') if isinstance(frame, dict) else None
    if not isinstance(annotations, list):
        raise ValueError('FRAME_ANNOTATIONS_MISSING')
    words = []
    for pair in annotations:
        if not isinstance(pair, list) or len(pair) != 2 or any(not isinstance(v, str) for v in pair):
            raise ValueError('FRAME_ANNOTATIONS_INVALID')
        if pair[0] == 'caption':
            if not pair[1].strip():
                raise ValueError('EMPTY_CAPTION_EMISSION')
            words.append(pair[1])
    return tuple(words)


def validate_ledger(ledger, pinned_film_sha, pinned_voice_sha):
    if not isinstance(ledger, dict) or ledger.get('schema') != 'ths-evidencemotion-temporal-caption-emission-v1':
        raise ValueError('SOURCE_FRAME_LEDGER_SCHEMA_INVALID')
    if ledger.get('videoSha256') != pinned_film_sha or ledger.get('sourceWavSha256') != pinned_voice_sha:
        raise ValueError('FILM_AND_VOICE_IDENTITIES_MUST_MATCH_SOURCE_LEDGER')
    if ((ledger.get('width'), ledger.get('height'), ledger.get('fps')) != (WIDTH, HEIGHT, FPS)
            or any(ledger.get(x) is not False for x in
                   ('encodedFilmOCRIndependentlyChecked', 'humanComprehensionObserved', 'mayPublish'))):
        raise ValueError('PINNED_RESEARCH_FRAME_LEDGER_REQUIRED')
    frames = ledger.get('frames')
    if not isinstance(frames, list) or len(frames) != FRAMES:
        raise ValueError('COMPLETE_1031_FRAME_LEDGER_REQUIRED')
    transitions = []
    previous = ()
    for i, frame in enumerate(frames):
        if (not isinstance(frame, dict) or frame.get('index') != i or
            not valid_sha(frame.get('rgbSha256')) or
            isinstance(frame.get('second'), bool) or
            not isinstance(frame.get('second'), (float, int)) or
            not math.isfinite(frame['second']) or abs(frame['second'] - i / FPS) > .00001):
            raise ValueError('FRAME_NUMBER_OR_SOURCE_IDENTITY_INVALID')
        words = caption_text(frame)
        if i > 0 and words != previous:
            transitions.append({'frame': i, 'previousCaption': list(previous), 'currentCaption': list(words)})
        previous = words
    if len(transitions) < 1:
        raise ValueError('NO_CAPTION_CHANGES_TO_AUDIT')
    return transitions


def evaluate_decoded_band(decoded_frames, transitions):
    if (not isinstance(decoded_frames, np.ndarray) or decoded_frames.dtype != np.uint8 or
        decoded_frames.shape != (FRAMES, BAND_HEIGHT, BAND_WIDTH, 3)):
        raise ValueError('EXACT_DECODED_CAPTION_BAND_REQUIRED')
    # Background motion alone cannot stand in for the source's white/teal
    # caption foreground. Thresholds belong ONLY to this archived film.
    green = decoded_frames[..., 1].astype(np.int16)
    red = decoded_frames[..., 0].astype(np.int16)
    blue = decoded_frames[..., 2].astype(np.int16)
    foreground = (green > 150) & (
        ((green - red) > 10) | ((red > 175) & (green > 175) & (blue > 170)))
    rows = []
    for tr in transitions:
        index = tr['frame']
        diff = np.abs(decoded_frames[index].astype(np.int16) - decoded_frames[index-1].astype(np.int16))
        mae = float(diff.mean())
        foreground_changed = int(np.count_nonzero(foreground[index] ^ foreground[index-1]))
        foreground_signal = foreground_changed >= MIN_FOREGROUND_MASK_CHANGED_PIXELS
        rows.append({**tr, 'decodedBandMeanAbsoluteRGB': round(mae, 4),
                     'foregroundColorMaskChangedPixels': foreground_changed,
                     'foregroundColorChangeDetected': foreground_signal,
                     'pixelChangeDetected': mae >= MIN_EVENT_MAE and foreground_signal})
    return rows


def read_decoded_caption_band(movie):
    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
            '-show_entries', 'stream=codec_name,pix_fmt,width,height,nb_frames,r_frame_rate',
            '-of', 'json', str(movie)], capture_output=True, text=True, check=True, timeout=15)
    info = json.loads(probe.stdout)
    streams = info.get('streams', [])
    if len(streams) != 1 or any(streams[0].get(k) != v for k, v in {
          'codec_name': 'h264', 'pix_fmt': 'yuv420p', 'width': WIDTH, 'height': HEIGHT,
          'r_frame_rate': '30/1', 'nb_frames': str(FRAMES)}.items()):
        raise ValueError('PINNED_1080P_30FPS_H264_SOURCE_REQUIRED')
    x, y, w, h = ROI
    command = ['ffmpeg', '-nostdin', '-v', 'error', '-i', str(movie), '-an',
               '-vf', f'crop={w}:{h}:{x}:{y},scale={BAND_WIDTH}:{BAND_HEIGHT}:flags=area,format=rgb24',
               '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    render = subprocess.run(command, capture_output=True, check=True, timeout=45)
    data = np.frombuffer(render.stdout, dtype=np.uint8)
    if data.size != FRAMES * BAND_HEIGHT * BAND_WIDTH * 3:
        raise ValueError('DECODED_FRAME_COUNT_TRUNCATED_OR_CHANGED')
    return data.reshape(FRAMES, BAND_HEIGHT, BAND_WIDTH, 3)


def audit(movie, frozen_movie_sha, frame_ledger, frozen_ledger_sha, frozen_wav_sha):
    if not all(map(valid_sha, (frozen_movie_sha, frozen_ledger_sha, frozen_wav_sha))):
        return hold('INDEPENDENT_SHA_PINS_REQUIRED')
    try:
        if (not movie.is_file() or movie.is_symlink() or movie.stat().st_size > MAX_MOVIE_BYTES
            or not isinstance(frame_ledger, bytes) or sha(frame_ledger) != frozen_ledger_sha):
            return hold('MEDIA_OR_LEDGER_CHANGED_OR_UNSAFE')
        if sha(movie.read_bytes()) != frozen_movie_sha:
            return hold('VIDEO_SOURCE_SHA_MISMATCH')
        ledger = json.loads(frame_ledger)
        transitions = validate_ledger(ledger, frozen_movie_sha, frozen_wav_sha)
        decoded = read_decoded_caption_band(movie)
        measured = evaluate_decoded_band(decoded, transitions)
    except (ValueError, OSError, TypeError, UnicodeError, subprocess.SubprocessError) as e:
        return hold('RESEARCH_FILM_DECODE_OR_LEDGER_HOLD:' + str(e)[:120])
    failures = [x['frame'] for x in measured if not x['pixelChangeDetected']]
    return {'schema': SCHEMA,
            'status': 'HOLD' if failures else 'RESEARCH_ENCODED_CAPTION_BAND_CHANGE_CONFIRMED_NOT_TEXT_PROOF',
            'errors': ['CAPTION_FRAME_TRANSITIONS_ABSENT'] if failures else [],
            'videoSha256': frozen_movie_sha, 'sourceWavSha256': frozen_wav_sha,
            'frameLedgerSha256': frozen_ledger_sha, 'fps': FPS, 'decodedFrames': FRAMES,
            'captionTransitionCount': len(measured), 'undetectedTransitions': failures,
            'minimumEventBandMae': round(min(x['decodedBandMeanAbsoluteRGB'] for x in measured), 4),
            'minimumEventForegroundColorChangedPixels': min(x['foregroundColorMaskChangedPixels'] for x in measured),
            'minimumRequiredForegroundColorChangedPixels': MIN_FOREGROUND_MASK_CHANGED_PIXELS,
            'sampledDecodedFrameTransitions': measured,
            'roi': {'x': ROI[0], 'y': ROI[1], 'width': ROI[2], 'height': ROI[3],
                    'downsampledWidth': BAND_WIDTH, 'downsampledHeight': BAND_HEIGHT},
            'mayPublish': False, 'encodedCaptionTextVerified': False,
            'acousticWordBoundariesCalibrated': False, 'humanPhoneComprehensionApproved': False,
            'caution': 'White/teal foreground-mask changes reject dark background-only animation, but are not text OCR, word identity, acoustic alignment, legibility or release QA.'}


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    for name in ('film', 'film-sha256', 'frame-ledger', 'frame-ledger-sha256', 'source-wav-sha256'):
        p.add_argument('--'+name, required=True)
    a = p.parse_args(argv)
    try:
        result = audit(Path(a.film), a.film_sha256, Path(a.frame_ledger).read_bytes(),
                       a.frame_ledger_sha256, a.source_wav_sha256)
    except (OSError, ValueError, TypeError):
        result = hold('INPUT_FILE_UNREADABLE')
    print(json.dumps(result, indent=2, allow_nan=False))
    return 2 if result['status'] == 'HOLD' else 3


if __name__ == '__main__':
    raise SystemExit(main())
