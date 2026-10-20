#!/usr/bin/env python3
"""Research-only SHA-bound source-WAV cut-edge QA for EvidenceMotion.

Picture cuts do not splice sound: an audible picture cut is telemetry only.
Actual audio-splice edits require review when source-edge energy is high.
This is not calibrated listening, pronunciation, mastering, or release approval.
"""
import array
import hashlib
import io
import json
import math
import re
import sys
import wave

SCHEMA = 'ths-evidencemotion-source-wav-cut-edge-v1'
WINDOW_MS = 20
QUIET_THRESHOLD_DBFS = -40.0  # Research proxy, not listener-calibrated.
MAX_AUDIO_SECONDS = 180
MAX_PCM_BYTES = 20_000_000


def hold(code):
    return {'schema': SCHEMA, 'status': 'HOLD', 'errors': [code],
            'edges': [], 'mayPublish': False, 'audioCertified': False}


def audit_cut_edges(wav_bytes, expected_sha256, cuts, *, threshold_dbfs=QUIET_THRESHOLD_DBFS):
    """Each cut: {id: unique string, kind: visual_cut|audio_splice, atMs: number}."""
    if not isinstance(expected_sha256, str) or not re.fullmatch('[a-f0-9]{64}', expected_sha256):
        return hold('FROZEN_SOURCE_SHA_REQUIRED')
    if not isinstance(wav_bytes, bytes) or not 44 <= len(wav_bytes) <= MAX_PCM_BYTES:
        return hold('SOURCE_WAV_SIZE_OR_TYPE_INVALID')
    actual_sha = hashlib.sha256(wav_bytes).hexdigest()
    if actual_sha != expected_sha256:
        return hold('SOURCE_WAV_SHA_MISMATCH')
    if (isinstance(threshold_dbfs, bool) or
            not isinstance(threshold_dbfs, (float, int)) or
            not math.isfinite(threshold_dbfs) or not -100 <= threshold_dbfs <= -10):
        return hold('INVALID_RESEARCH_EDGE_THRESHOLD')
    if not isinstance(cuts, list) or not 1 <= len(cuts) <= 500:
        return hold('CUT_INVENTORY_REQUIRED')
    seen = set()
    for cut in cuts:
        if not isinstance(cut, dict) or set(cut) != {'id', 'kind', 'atMs'}:
            return hold('INVALID_CUT_RECORD')
        key, kind, millis = cut['id'], cut['kind'], cut['atMs']
        if not isinstance(key, str) or not re.fullmatch('[a-z][a-z0-9_-]{1,60}', key) or key in seen:
            return hold('CUT_ID_INVALID_OR_DUPLICATE')
        seen.add(key)
        if kind not in ('visual_cut', 'audio_splice'):
            return hold('UNKNOWN_CUT_TYPE')
        if isinstance(millis, bool) or not isinstance(millis, (int, float)) or not math.isfinite(millis):
            return hold('INVALID_CUT_TIME')
    try:
        with wave.open(io.BytesIO(wav_bytes), 'rb') as w:
            if (w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getcomptype()) != (1, 2, 24000, 'NONE'):
                return hold('ORIGINAL_PCM_MONO24K16_REQUIRED')
            frames = w.getnframes()
            pcm = w.readframes(frames)
        if len(pcm) != frames * 2 or not 1 <= frames / 24000 <= MAX_AUDIO_SECONDS:
            return hold('SOURCE_WAV_TRUNCATED_OR_DURATION_INVALID')
    except (EOFError, ValueError, wave.Error, OSError):
        return hold('SOURCE_WAV_DECODE_FAILED')
    samples = array.array('h')
    samples.frombytes(pcm)
    if sys.byteorder != 'little':
        samples.byteswap()
    radius = int(24000 * WINDOW_MS / 2000)
    edges, last_ms, risk = [], -1.0, False
    for cut in cuts:
        millis = cut['atMs']
        center = round(millis * 24)
        if millis <= last_ms or center < radius or center + radius > frames:
            return hold('CUT_OUT_OF_RANGE_OR_NONMONOTONIC')
        last_ms = millis
        segment = samples[center-radius:center+radius]
        energy = sum(int(x) * int(x) for x in segment) / len(segment)
        rms = 20 * math.log10(max(math.sqrt(energy) / 32768, 1e-12))
        quiet = rms <= threshold_dbfs
        kind = cut['kind']
        state = ('VISUAL_CUT_TELEMETRY_ONLY' if kind == 'visual_cut'
                 else 'QUIET_SPLICE_CANDIDATE' if quiet else 'AUDIO_SPLICE_REQUIRES_REVIEW')
        risk |= kind == 'audio_splice' and not quiet
        edges.append({'id': cut['id'], 'kind': kind, 'atMs': millis,
                      'rmsDbfs': round(rms, 2), 'quietWindow': quiet, 'status': state})
    return {'schema': SCHEMA,
            'status': 'HOLD_AUDIO_SPLICE_REVIEW' if risk else 'RESEARCH_TELEMETRY_ONLY',
            'sourceWavSha256': actual_sha, 'durationSamples': frames,
            'windowMs': WINDOW_MS, 'thresholdDbfs': threshold_dbfs,
            'edges': edges,
            'errors': ['AUDIO_SPLICE_EDGE_ABOVE_RESEARCH_THRESHOLD'] if risk else [],
            'mayPublish': False, 'audioCertified': False,
            'caution': 'Acoustic-energy proxy only. Active-speech visual cuts are allowed. Quiet splices still require mastering and listening checks.'}


def main():
    import argparse
    from pathlib import Path
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--wav', required=True)
    parser.add_argument('--source-sha256', required=True)
    parser.add_argument('--cuts', required=True, help='JSON file: array of {id,kind,atMs}')
    args = parser.parse_args()
    try:
        wav_path, cuts_path = Path(args.wav), Path(args.cuts)
        if wav_path.is_symlink() or cuts_path.is_symlink():
            result = hold('LINKED_SOURCE_REJECTED')
        elif (not wav_path.is_file() or wav_path.stat().st_size > MAX_PCM_BYTES or
              not cuts_path.is_file() or cuts_path.stat().st_size > 100_000):
            result = hold('SOURCE_INPUT_SIZE_OR_TYPE_INVALID')
        else:
            wav = wav_path.read_bytes()
            cuts = json.loads(cuts_path.read_text(encoding='utf-8'))
            result = audit_cut_edges(wav, args.source_sha256, cuts)
    except (OSError, UnicodeError, ValueError, TypeError):
        result = hold('SOURCE_OR_CUTS_UNREADABLE')
    print(json.dumps(result, indent=2, ensure_ascii=False, allow_nan=False))
    return 2 if result['status'].startswith('HOLD') else 0


if __name__ == '__main__':
    raise SystemExit(main())
