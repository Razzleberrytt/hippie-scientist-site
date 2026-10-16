#!/usr/bin/env python3
"""EvidenceMotion research-only voice revision invalidation.

Read-only guard: old narration evidence never authorizes a changed WAV. It
neither regenerates speech nor certifies phonemes, quality, science or release.
"""
import argparse
import hashlib
import io
import json
import re
import wave
from pathlib import Path

SCHEMA = 'ths-evidencemotion-voice-revision-invalidation-v1'
REBUILD = (
    'word_alignment', 'caption_word_cues', 'audio_locked_shot_cuts',
    'encoded_audio_and_video', 'voice_pronunciation_and_earcheck',
    'science_caption_equivalence', 'phone_and_craft_approval',
)
MAX_SOURCE_BYTES = 20_000_000


def _hold(code):
    return {'schema': SCHEMA, 'status': 'HOLD', 'errors': [code],
            'invalidate': list(REBUILD), 'mayPublish': False,
            'sourceVoiceApproved': False, 'previousReceiptsReusable': False}


def _wav_frames(data):
    if not isinstance(data, bytes) or not 44 <= len(data) <= MAX_SOURCE_BYTES:
        raise ValueError('WAV_SIZE_OR_TYPE_INVALID')
    try:
        with wave.open(io.BytesIO(data), 'rb') as audio:
            if (audio.getnchannels(), audio.getsampwidth(),
                audio.getframerate(), audio.getcomptype()) != (1, 2, 24000, 'NONE'):
                raise ValueError('MONO_24K_PCM16_REQUIRED')
            n = audio.getnframes()
            pcm = audio.readframes(n)
        if not 24000 <= n <= 24000 * 180 or len(pcm) != n * 2:
            raise ValueError('TRUNCATED_OR_UNBOUNDED_WAV')
    except (EOFError, wave.Error, OSError) as exc:
        raise ValueError('UNDECODABLE_WAV') from exc
    return n


def check_voice_revision(original_bytes, proposed_bytes, frozen_original_sha256,
                         prior_receipts=None):
    if (not isinstance(frozen_original_sha256, str) or
        not re.fullmatch(r'[a-f0-9]{64}', frozen_original_sha256)):
        return _hold('FROZEN_ORIGINAL_SHA_REQUIRED')
    try:
        old_samples = _wav_frames(original_bytes)
        new_samples = _wav_frames(proposed_bytes)
    except ValueError as exc:
        return _hold(str(exc))
    actual_old = hashlib.sha256(original_bytes).hexdigest()
    if actual_old != frozen_original_sha256:
        return _hold('ORIGINAL_VAULT_SHA_MISMATCH')
    current = hashlib.sha256(proposed_bytes).hexdigest()
    changed = current != actual_old
    # Identity alone is never a craft, phoneme or scientific approval.
    if prior_receipts is not None:
        if not isinstance(prior_receipts, dict) or set(prior_receipts) != set(REBUILD):
            return _hold('COMPLETE_PRIOR_RECEIPT_INVENTORY_REQUIRED')
        for kind, receipt in prior_receipts.items():
            if (not isinstance(receipt, dict) or
                set(receipt) != {'narrationSha256', 'artifactSha256'} or
                receipt['narrationSha256'] != actual_old or
                not isinstance(receipt['artifactSha256'], str) or
                not re.fullmatch(r'[a-f0-9]{64}', receipt['artifactSha256'])):
                return _hold('PRIOR_RECEIPT_IDENTITY_INVALID:' + kind)
    return {
        'schema': SCHEMA,
        'status': 'HOLD_NARRATION_CHANGED_REBUILD_REQUIRED' if changed
                  else 'UNCHANGED_VOICE_RESEARCH_IDENTITY_ONLY',
        'originalWavSha256': actual_old,
        'currentWavSha256': current,
        'originalSamples': old_samples,
        'currentSamples': new_samples,
        'changed': changed,
        'invalidate': list(REBUILD) if changed else [],
        'oldReceiptsProvided': prior_receipts is not None,
        'priorReceiptIdentitiesMatchBaseline': not changed and prior_receipts is not None,
        'previousReceiptsReusable': False,
        'mayPublish': False,
        'sourceVoiceApproved': False,
        'errors': ['NARRATION_REVISION_REQUIRES_REVALIDATION'] if changed else [],
        'caution': 'Old checks cannot approve regenerated voice. Rebuild exact aligned and decoded media evidence; verify science, voice and device independently.',
    }


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--original', required=True)
    parser.add_argument('--candidate', required=True)
    parser.add_argument('--original-sha256', required=True)
    parser.add_argument('--prior-receipts', help='Optional strict seven-type old evidence JSON')
    opts = parser.parse_args(argv)
    try:
        paths = [Path(opts.original), Path(opts.candidate)]
        if opts.prior_receipts:
            paths.append(Path(opts.prior_receipts))
        if any(p.is_symlink() or not p.is_file() or p.stat().st_size > MAX_SOURCE_BYTES for p in paths):
            result = _hold('INPUT_FILE_SIZE_OR_TYPE_INVALID')
        else:
            prior = json.loads(paths[2].read_text(encoding='utf8')) if len(paths) == 3 else None
            result = check_voice_revision(paths[0].read_bytes(), paths[1].read_bytes(),
                                          opts.original_sha256, prior)
    except (OSError, UnicodeError, ValueError, TypeError):
        result = _hold('INPUT_FILE_UNREADABLE')
    print(json.dumps(result, indent=2, allow_nan=False))
    return 2 if result['status'].startswith('HOLD') else 0


if __name__ == '__main__':
    raise SystemExit(main())
