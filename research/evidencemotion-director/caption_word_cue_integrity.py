#!/usr/bin/env python3
"""Read-only, SHA-pinned caption-window reconciliation for original-WAV research.

Compares actual candidate caption grouping against every original MFA word.
This is NOT acoustic calibration, rendered-pixel checking or release approval.
"""
import argparse
import hashlib
import json
import math
import re
from pathlib import Path

from asr_mfa_disagreement_gate import read_pcm, normalize, valid_hash

SCHEMA = 'ths-evidencemotion-caption-word-cue-source-audit-v1'
MAX_BYTES = 20_000_000


def _hold(reason):
    return {'schema': SCHEMA, 'status': 'HOLD', 'errors': [reason],
            'frameReviewTargets': [], 'mayPublish': False,
            'wordTimingCalibrated': False, 'encodedCaptionPixelsVerified': False}


def _hash(raw):
    return hashlib.sha256(raw).hexdigest()


def audit_caption_windows(wav_bytes, frozen_wav_sha256, alignment_bytes,
                          frozen_alignment_sha256, captions_bytes, frozen_caption_sha256,
                          fps=30):
    """A grouped caption can never silently lose/reword/re-time original MFA tokens."""
    if not all(valid_hash(x) for x in
               (frozen_wav_sha256, frozen_alignment_sha256, frozen_caption_sha256)):
        return _hold('INDEPENDENT_FILE_HASH_PINS_REQUIRED')
    if any(not isinstance(x, bytes) or len(x) > MAX_BYTES for x in
           (wav_bytes, alignment_bytes, captions_bytes)):
        return _hold('INPUT_BYTES_MISSING_OR_UNBOUNDED')
    if (_hash(wav_bytes) != frozen_wav_sha256 or
        _hash(alignment_bytes) != frozen_alignment_sha256 or
        _hash(captions_bytes) != frozen_caption_sha256):
        return _hold('SOURCE_ALIGNMENT_OR_CAPTIONS_CHANGED')
    if fps != 30 or isinstance(fps, bool):
        return _hold('PINNED_NATIVE_30FPS_REQUIRED')
    decoded = read_pcm(wav_bytes)
    if decoded is None:
        return _hold('ACTUAL_ORIGINAL_PCM16_WAV_REQUIRED')
    frame_count, _ = decoded
    try:
        alignment, captions = json.loads(alignment_bytes), json.loads(captions_bytes)
    except (ValueError, UnicodeError, TypeError):
        return _hold('SOURCE_REPORT_JSON_INVALID')
    if not isinstance(alignment, dict) or not isinstance(captions, dict):
        return _hold('SOURCE_REPORT_STRUCTURES_INVALID')
    if (alignment.get('schema') != 'ths-exact-wav-alignment-candidate-v1' or
        alignment.get('status') != 'BYTE_BOUND_WORD_TIMING_CANDIDATE_REVIEW_REQUIRED' or
        alignment.get('sampleRate') != 24000 or alignment.get('sampleCount') != frame_count or
        not isinstance(alignment.get('inputSha256'), dict) or
        alignment['inputSha256'].get('wav') != frozen_wav_sha256 or
        not valid_hash(alignment.get('revisionSha256')) or
        alignment.get('mayPublish') is not False or
        alignment.get('timingAccuracyCalibrated') is not False or
        alignment.get('pronunciationVerified') is not False):
        return _hold('FROZEN_UNCALIBRATED_SOURCE_ALIGNMENT_REQUIRED')
    if (captions.get('schema') != 'ths-evidencemotion-timed-caption-windows-v1' or
        captions.get('status') not in ('CANDIDATE_ONLY_NOT_RENDERED', 'TIMED_RESEARCH_FILM_REQUIRES_FRAME_REVIEW') or
        captions.get('sourceWavSha256') != frozen_wav_sha256 or
        captions.get('alignmentRevisionSha256') != alignment['revisionSha256'] or
        captions.get('mayPublish') is not False or
        captions.get('actualEncodedCaptionPixelsRechecked') is not False or
        captions.get('independentMutedComprehensionApproved') is not False or
        captions.get('rendererUsesProposal') is not
          (captions.get('status') == 'TIMED_RESEARCH_FILM_REQUIRES_FRAME_REVIEW') or
        captions.get('maxWordsPerGroup') != 3):
        return _hold('CAPTION_CANDIDATE_SOURCE_OR_RELEASE_BOUNDARY_INVALID')
    words, scenes = alignment.get('wordAlignment'), captions.get('scenes')
    if not isinstance(words, list) or not words or not isinstance(scenes, list) or not scenes:
        return _hold('MFA_WORDS_OR_CAPTION_SCENES_MISSING')
    end_ms = frame_count / 24.0
    previous = -1.0
    for word in words:
        if not isinstance(word, dict) or not normalize(word.get('word', '')):
            return _hold('MFA_WORD_INVALID')
        start, end = word.get('startMs'), word.get('endMs')
        if any(isinstance(x, bool) or not isinstance(x, (int, float)) or
               not math.isfinite(x) for x in (start, end)):
            return _hold('MFA_WORD_TIME_NONFINITE')
        if start < previous or end <= start or end > end_ms + 2:
            return _hold('MFA_WORD_ORDER_OR_DURATION_INVALID')
        previous = end
    cursor = 0
    visible_tokens = 0
    sentence_index = 0
    seen_hold = False
    targets = []
    for scene in scenes:
        if not isinstance(scene, dict) or not isinstance(scene.get('groups'), list):
            return _hold('CAPTION_SCENE_INVALID')
        if scene.get('scene') == 'source_hold':
            if seen_hold or not sentence_index or scene['groups'] or scene.get('spokenWords') != 0:
                return _hold('CAPTION_SOURCE_HOLD_INVALID')
            seen_hold = True
            continue
        sentence_index += 1
        if scene.get('scene') != 'sentence_' + str(sentence_index) or not scene['groups']:
            return _hold('CAPTION_SCENE_SEQUENCE_INVALID')
        local_cursor = 0
        for group in scene['groups']:
            if not isinstance(group, dict) or not isinstance(group.get('words'), list):
                return _hold('CAPTION_GROUP_INVALID')
            token_words = group['words']
            if not 1 <= len(token_words) <= 3 or any(
                 not isinstance(w, str) or not normalize(w) for w in token_words):
                return _hold('CAPTION_VISIBLE_WORD_INVALID')
            if (group.get('firstCue') != local_cursor or
                group.get('afterLastCue') != local_cursor + len(token_words)):
                return _hold('CAPTION_CUE_GAP_DUPLICATION_OR_BAD_ORDER')
            local_cursor += len(token_words)
            visible_tokens += len(token_words)
            # A concatenated character match can conceal incorrect visible
            # word boundaries: e.g. MFA "pose" rewritten as caption "po se"
            # or MFA "pose is" rewritten as "poseis". Match each authored
            # display token separately. Only a visible contraction or
            # hyphenated term can legitimately join multiple MFA tokens.
            start_word = cursor
            for visible_word in token_words:
                expected = normalize(visible_word)
                if cursor >= len(words):
                    return _hold('CAPTION_LEXICAL_DRIFT_OR_SPLIT_MFA_TOKEN')
                if normalize(words[cursor]['word']) == expected:
                    cursor += 1
                    continue
                if not any(mark in visible_word for mark in ("'", "’", "-")):
                    return _hold('CAPTION_LEXICAL_DRIFT_OR_SPLIT_MFA_TOKEN')
                combined = ''
                while cursor < len(words) and len(combined) < len(expected):
                    combined += normalize(words[cursor]['word'])
                    cursor += 1
                if combined != expected:
                    return _hold('CAPTION_LEXICAL_DRIFT_OR_SPLIT_MFA_TOKEN')
            start, end = group.get('startSec'), group.get('endSec')
            if any(isinstance(x, bool) or not isinstance(x, (int, float)) or
                   not math.isfinite(x) for x in (start, end)):
                return _hold('CAPTION_TIMING_NONFINITE')
            if (start < 0 or end <= start or end > end_ms/1000 + .004 or
                abs(start * 1000 - words[start_word]['startMs']) > 4 or
                abs(end * 1000 - words[cursor-1]['endMs']) > 4):
                return _hold('CAPTION_TIME_DIFFERS_FROM_EXACT_MFA_WORDS')
            targets.append({'scene': scene['scene'], 'firstCue': group['firstCue'],
                            'mfaWordRange': [start_word, cursor],
                            'startFrameCandidate': math.floor(start * fps),
                            'endFrameExclusiveCandidate': math.ceil(end * fps),
                            'sampledFrameScope': 'PREVIZ_ONLY_NOT_PIXEL_VERIFIED'})
        if scene.get('spokenWords') != local_cursor:
            return _hold('CAPTION_SCENE_MISSING_OR_DUPLICATE_WORDS')
    if sentence_index < 1 or cursor != len(words):
        return _hold('CAPTION_WORD_INVENTORY_INCOMPLETE')
    return {
        'schema': SCHEMA,
        'status': 'RESEARCH_CAPTION_FRAME_REVIEW_REQUIRED',
        'originalWavSha256': frozen_wav_sha256,
        'alignmentCandidateSha256': frozen_alignment_sha256,
        'captionWindowsSha256': frozen_caption_sha256,
        'alignmentRevisionSha256': alignment['revisionSha256'],
        'counts': {'mfaWordsCovered': cursor, 'visibleCaptionWords': visible_tokens,
                   'captionGroups': len(targets), 'spokenScenes': sentence_index},
        'frameReviewTargets': targets,
        'originalNarrationModified': False, 'wordTimingCalibrated': False,
        'encodedCaptionPixelsVerified': False, 'pronunciationVerified': False,
        'mayPublish': False,
        'caution': 'Exact-word and candidate-time match only; no proof of acoustic boundary correctness or actual rendered caption pixels.'
    }


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('wav', 'wav-sha256', 'alignment', 'alignment-sha256',
                 'captions', 'captions-sha256'):
        parser.add_argument('--'+name, required=True)
    options = parser.parse_args(argv)
    try:
        paths = [Path(options.wav), Path(options.alignment), Path(options.captions)]
        if any(p.is_symlink() or not p.is_file() or p.stat().st_size > MAX_BYTES for p in paths):
            result = _hold('INPUT_FILE_SIZE_OR_TYPE_INVALID')
        else:
            result = audit_caption_windows(paths[0].read_bytes(), options.wav_sha256,
                      paths[1].read_bytes(), options.alignment_sha256,
                      paths[2].read_bytes(), options.captions_sha256)
    except (OSError, ValueError, TypeError, UnicodeError):
        result = _hold('INPUT_FILE_UNREADABLE')
    print(json.dumps(result, indent=2, allow_nan=False))
    # A structurally valid preview is still NOT a production acceptance gate.
    return 2 if result['status'] == 'HOLD' else 3


if __name__ == '__main__':
    raise SystemExit(main())
