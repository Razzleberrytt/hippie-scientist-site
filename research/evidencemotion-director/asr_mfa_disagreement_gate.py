#!/usr/bin/env python3
"""Read-only, research-only comparison of actual source-WAV ASR vs MFA.

Neither word agreement nor recognizer probabilities verify pronunciation,
phoneme accuracy, acoustic word timing, craft or publication.
"""
import argparse
import difflib
import hashlib
import io
import json
import math
import re
import wave
from pathlib import Path

SCHEMA = 'ths-evidencemotion-asr-mfa-disagreement-v1'
MAX_BYTES = 20_000_000
BOUNDARY_MS = 150  # heuristic review triage, NOT a calibrated accuracy limit


def sha(data):
    return hashlib.sha256(data).hexdigest()


def valid_hash(value):
    return isinstance(value, str) and re.fullmatch(r'[a-f0-9]{64}', value) is not None


def hold(reason):
    return {'schema': SCHEMA, 'status': 'HOLD', 'errors': [reason],
            'disagreements': [], 'mayPublish': False,
            'pronunciationVerified': False, 'wordTimingCalibrated': False,
            'originalNarrationModified': False}


def normalize(word):
    return re.sub(r'[^a-z0-9]', '', str(word).casefold())


def read_pcm(wav_bytes):
    if not isinstance(wav_bytes, bytes) or not 44 <= len(wav_bytes) <= MAX_BYTES:
        return None
    try:
        with wave.open(io.BytesIO(wav_bytes), 'rb') as source:
            if (source.getnchannels(), source.getsampwidth(),
                source.getframerate(), source.getcomptype()) != (1, 2, 24000, 'NONE'):
                return None
            frames = source.getnframes()
            payload = source.readframes(frames)
        if not 24000 <= frames <= 24000*180 or len(payload) != frames*2:
            return None
        return frames, payload
    except (EOFError, ValueError, OSError, wave.Error):
        return None


def exact_digital_silence_runs(pcm, min_run_samples=4800):
    """Detect only consecutive literal zero PCM16 samples (not perceived silence)."""
    runs = []
    start = None
    samples = len(pcm) // 2
    for index in range(samples):
        if pcm[index*2:index*2+2] == b'\x00\x00':
            if start is None:
                start = index
        elif start is not None:
            if index-start >= min_run_samples:
                runs.append((start/24, index/24))
            start = None
    if start is not None and samples-start >= min_run_samples:
        runs.append((start/24, samples/24))
    return runs


def validate_words(words, start_key, end_key, scale, duration_ms, label):
    if not isinstance(words, list) or not 1 <= len(words) <= 1000:
        return label + '_WORDS_INVALID'
    last_end = -1.0
    for token in words:
        if not isinstance(token, dict) or not isinstance(token.get('word'), str) or not normalize(token['word']):
            return label + '_TOKEN_INVALID'
        a, b = token.get(start_key), token.get(end_key)
        if any(isinstance(x, bool) or not isinstance(x, (float, int)) or not math.isfinite(x) for x in (a, b)):
            return label + '_NONFINITE_TIMING'
        start_ms, end_ms = a*scale, b*scale
        if start_ms < 0 or end_ms <= start_ms or start_ms < last_end-5 or end_ms > duration_ms+5:
            return label + '_TIMING_OUTSIDE_ACTUAL_WAV'
        last_end = end_ms
        if label == 'ASR':
            probability = token.get('probability')
            if isinstance(probability, bool) or not isinstance(probability, (int, float)) or not math.isfinite(probability) or not 0 <= probability <= 1:
                return 'ASR_CONFIDENCE_INVALID'
    return None


def assess_original_asr_mfa(wav_bytes, approved_source_sha256, asr, mfa,
                            alignment_bytes, transcript_bytes):
    """Frozen source + actual MFA candidate bytes + two original-source receipts."""
    if not valid_hash(approved_source_sha256):
        return hold('FROZEN_ORIGINAL_SHA_REQUIRED')
    decoded = read_pcm(wav_bytes)
    if decoded is None:
        return hold('ACTUAL_SOURCE_WAV_REQUIRED')
    frames, pcm = decoded
    if sha(wav_bytes) != approved_source_sha256:
        return hold('ORIGINAL_SOURCE_WAV_CHANGED')
    if not isinstance(alignment_bytes, bytes) or len(alignment_bytes) > MAX_BYTES:
        return hold('ALIGNMENT_BYTES_INVALID')
    if not isinstance(transcript_bytes, bytes) or len(transcript_bytes) > 100000:
        return hold('TRANSCRIPT_BYTES_INVALID')
    try:
        alignment = json.loads(alignment_bytes)
    except (ValueError, UnicodeError, TypeError):
        return hold('ALIGNMENT_JSON_UNREADABLE')
    if not all(isinstance(item, dict) for item in (asr, mfa, alignment)) or not isinstance(alignment.get('inputSha256'), dict):
        return hold('RECEIPT_STRUCTURES_INVALID')
    if (asr.get('schema') != 'ths-actual-source-asr-research-v1' or
        mfa.get('schema') != 'ths-actual-mfa-acoustic-research-v1' or
        alignment.get('schema') != 'ths-exact-wav-alignment-candidate-v1'):
        return hold('RESEARCH_SOURCE_SCHEMAS_REQUIRED')
    if (asr.get('sourceWavSha256') != approved_source_sha256 or
        mfa.get('originalWavSha256') != approved_source_sha256 or
        alignment['inputSha256'].get('wav') != approved_source_sha256):
        return hold('ASR_MFA_SOURCE_IDENTITIES_MISMATCH')
    if (alignment['inputSha256'].get('transcript') != sha(transcript_bytes) or
        mfa.get('alignmentCandidateSha256') != sha(alignment_bytes) or
        mfa.get('alignmentRevisionSha256') != alignment.get('revisionSha256')):
        return hold('ALIGNMENT_OR_TRANSCRIPT_NOT_PINNED')
    if (asr.get('mayPublish') is not False or mfa.get('mayPublish') is not False or
        alignment.get('mayPublish') is not False or
        alignment.get('pronunciationVerified') is not False or
        alignment.get('timingAccuracyCalibrated') is not False):
        return hold('RESEARCH_ONLY_RELEASE_BOUNDARY_REQUIRED')
    model = asr.get('speechRecognizer')
    if not isinstance(model, dict) or not valid_hash(model.get('modelBinarySha256')):
        return hold('FROZEN_ASR_MODEL_REQUIRED')
    duration_ms = frames / 24
    if (alignment.get('sampleRate') != 24000 or alignment.get('sampleCount') != frames or
        isinstance(alignment.get('durationMs'), bool) or
        not isinstance(alignment.get('durationMs'), (int, float)) or
        not math.isfinite(alignment['durationMs']) or abs(alignment['durationMs']-duration_ms) > 2):
        return hold('ALIGNMENT_DURATION_NOT_ACTUAL_SOURCE')
    words, recognized = alignment.get('wordAlignment'), asr.get('recognizedWords')
    for arr, start, end, scale, label in ((words, 'startMs', 'endMs', 1, 'MFA'),
                                          (recognized, 'start', 'end', 1000, 'ASR')):
        issue = validate_words(arr, start, end, scale, duration_ms, label)
        if issue:
            return hold(issue)
    if mfa.get('alignedWordCount') != len(words) or mfa.get('scriptTokenCount') != len(words):
        return hold('MFA_SOURCE_WORD_INVENTORY_CHANGED')
    # An ASR word cannot audibly start 100+ ms inside literal zero PCM samples.
    # This is a physical timing contradiction, not a pronunciation verdict.
    digital_silence_runs = exact_digital_silence_runs(pcm)
    physically_impossible_asr_onsets = []
    for index, token in enumerate(recognized):
        onset = token['start']*1000
        for silent_start, silent_end in digital_silence_runs:
            if silent_start <= onset and silent_end-onset >= 100:
                physically_impossible_asr_onsets.append({
                    'asrIndex': index, 'hypothesis': token['word'].strip(),
                    'onsetMs': round(onset, 3),
                    'zeroPcmIntervalMs': [round(silent_start, 3), round(silent_end, 3)],
                    'onsetPrecedesAnyNonzeroSourceSampleMs': round(silent_end-onset, 3)})
                break
    # Check original TextGrid/MFA candidates independently as well: model
    # agreement within 150 ms must not override impossible source timing.
    physically_impossible_mfa_onsets = []
    for index, token in enumerate(words):
        onset = token['startMs']
        for silent_start, silent_end in digital_silence_runs:
            if silent_start <= onset and silent_end-onset >= 100:
                physically_impossible_mfa_onsets.append({
                    'mfaIndex': index, 'authoredWord': token['word'],
                    'onsetMs': round(onset, 3),
                    'zeroPcmIntervalMs': [round(silent_start, 3), round(silent_end, 3)],
                    'onsetPrecedesAnyNonzeroSourceSampleMs': round(silent_end-onset, 3)})
                break
    matches, disagreements = [], []
    matcher = difflib.SequenceMatcher(None, [normalize(w['word']) for w in words],
                                      [normalize(w['word']) for w in recognized], autojunk=False)
    for operation, i, j, k, l in matcher.get_opcodes():
        if operation == 'equal':
            for mi, ai in zip(range(i, j), range(k, l)):
                m, a = words[mi], recognized[ai]
                start_delta = a['start']*1000-m['startMs']
                end_delta = a['end']*1000-m['endMs']
                matches.append({'mfaIndex': mi, 'asrIndex': ai, 'word': m['word'],
                                'startDeltaMs': round(start_delta, 3), 'endDeltaMs': round(end_delta, 3),
                                'timingDisagreementOver150Ms': max(abs(start_delta), abs(end_delta)) > BOUNDARY_MS})
        else:
            authored = [w['word'] for w in words[i:j]]
            guessed = [w['word'].strip() for w in recognized[k:l]]
            orthographic = ''.join(map(normalize, authored)) == ''.join(map(normalize, guessed))
            disagreements.append({
                'authoredWords': authored, 'asrHypotheses': guessed,
                'mfaWordIndices': [i, j], 'asrWordIndices': [k, l],
                'mfaWindowMs': [words[i]['startMs'], words[j-1]['endMs']] if i < j else [],
                'asrWindowMs': [round(recognized[k]['start']*1000, 3),
                                round(recognized[l-1]['end']*1000, 3)] if k < l else [],
                'orthographicOnly': orthographic,
                'requiresAcousticReview': not orthographic,
                'asrMaxProbabilityNotProof': max((w['probability'] for w in recognized[k:l]), default=None),
            })
    first_count = sum(abs(m['startDeltaMs']) > BOUNDARY_MS for m in matches)
    last_count = sum(abs(m['endDeltaMs']) > BOUNDARY_MS for m in matches)
    review_count = sum(d['requiresAcousticReview'] for d in disagreements)
    return {
        'schema': SCHEMA,
        'status': 'RESEARCH_REVIEW_HOLD' if review_count or first_count or last_count or physically_impossible_asr_onsets or physically_impossible_mfa_onsets else 'RESEARCH_MODEL_CONSENSUS_ONLY',
        'sourceWavSha256': approved_source_sha256, 'alignmentCandidateSha256': sha(alignment_bytes),
        'transcriptSha256': sha(transcript_bytes), 'asrModelSha256': model['modelBinarySha256'],
        'counts': {'mfaWords': len(words), 'asrEntries': len(recognized),
                   'matchedWords': len(matches), 'disagreementBlocks': len(disagreements),
                   'reviewBlocks': review_count, 'orthographicOnlyBlocks': len(disagreements)-review_count,
                   'matchedStartsOver150ms': first_count, 'matchedEndsOver150ms': last_count,
                   'asrOnsetsInsideProvenDigitalSilence': len(physically_impossible_asr_onsets),
                   'mfaOnsetsInsideProvenDigitalSilence': len(physically_impossible_mfa_onsets)},
        'digitalSilenceOnsetContradictions': physically_impossible_asr_onsets,
        'mfaDigitalSilenceOnsetContradictions': physically_impossible_mfa_onsets,
        'disagreements': disagreements, 'matchedWordTiming': matches,
        'originalNarrationModified': False, 'mayPublish': False,
        'pronunciationVerified': False, 'wordTimingCalibrated': False,
        'caution': 'Even high-confidence ASR substitutions are hypotheses; calibrated phonetic and actual spoken-word checks remain necessary.'
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('original', 'original-sha256', 'asr', 'mfa', 'alignment', 'transcript'):
        parser.add_argument('--'+name, required=True)
    args = parser.parse_args()
    try:
        paths = [Path(x) for x in (args.original, args.asr, args.mfa, args.alignment, args.transcript)]
        if any(p.is_symlink() or not p.is_file() or p.stat().st_size > MAX_BYTES for p in paths):
            result = hold('INPUT_FILE_SIZE_OR_TYPE_INVALID')
        else:
            result = assess_original_asr_mfa(paths[0].read_bytes(), args.original_sha256,
                     json.loads(paths[1].read_bytes()), json.loads(paths[2].read_bytes()),
                     paths[3].read_bytes(), paths[4].read_bytes())
    except (OSError, ValueError, UnicodeError, TypeError):
        result = hold('INPUT_FILE_UNREADABLE')
    print(json.dumps(result, indent=2, allow_nan=False))
    # A review-only result is NOT a passing automated caption-alignment check.
    # Distinguish malformed/stale inputs (2) from a valid but disputed take (3).
    # Even exit 0 confirms research-model agreement ONLY, never publish clearance.
    return {'HOLD': 2, 'RESEARCH_REVIEW_HOLD': 3,
            'RESEARCH_MODEL_CONSENSUS_ONLY': 0}.get(result['status'], 2)


if __name__ == '__main__':
    raise SystemExit(main())
