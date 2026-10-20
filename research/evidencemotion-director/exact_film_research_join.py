#!/usr/bin/env python3
"""Lane5 research-only: join physical QA receipts ONLY for the same exact movie.

A successful join proves narrow cross-report identity and internal consistency,
not the scientific, craft, mobile, phone or first-render release requirements.
"""
import argparse
import hashlib
import json
import os
import re
import stat
from pathlib import Path

HEX = re.compile(r'[0-9a-f]{64}\Z')
MAX_RECEIPT_BYTES = 128 * 1024


def hold(reason):
    raise ValueError('EXACT_FILM_RESEARCH_JOIN_HOLD:' + reason)


def physical_sha(path, *, max_bytes=None):
    p = Path(path)
    if p.is_symlink() or any(part.is_symlink() for part in p.parents):
        hold('UNSAFE_SYMLINK_PATH')
    try:
        s = p.stat()
    except OSError:
        hold('MISSING_RECEIPT_OR_FILM')
    if not stat.S_ISREG(s.st_mode) or s.st_size < 1:
        hold('EMPTY_OR_NONFILE_INPUT')
    if max_bytes is not None and s.st_size > max_bytes:
        hold('OVERSIZED_RECEIPT')
    h = hashlib.sha256()
    with p.open('rb') as f:
        pre = os.fstat(f.fileno())
        if (pre.st_dev, pre.st_ino) != (s.st_dev, s.st_ino):
            hold('RACE_BETWEEN_LOOKUP_AND_OPEN')
        for chunk in iter(lambda: f.read(1048576), b''):
            h.update(chunk)
        post = os.fstat(f.fileno())
    after = p.stat()
    signature = lambda x: (x.st_dev, x.st_ino, x.st_size, x.st_mtime_ns, x.st_ctime_ns)
    if signature(pre) != signature(post) or signature(s) != signature(after):
        hold('INPUT_CHANGED_DURING_HASH')
    return h.hexdigest()


def _no_duplicate_fields(items):
    result = {}
    for key, value in items:
        if key in result:
            hold('DUPLICATE_JSON_FIELDS')
        result[key] = value
    return result


def read_pinned(path, pin):
    if type(pin) is not str or not HEX.fullmatch(pin):
        hold('MISSING_EXTERNAL_RECEIPT_PIN')
    observed = physical_sha(path, max_bytes=MAX_RECEIPT_BYTES)
    if observed != pin:
        hold('RECEIPT_BYTES_MISMATCH_EXTERNAL_PIN')
    try:
        obj = json.loads(Path(path).read_text(encoding='utf-8'),
                         object_pairs_hook=_no_duplicate_fields,
                         parse_constant=lambda x: hold('NONFINITE_JSON_VALUE'))
    except (UnicodeError, json.JSONDecodeError):
        hold('INVALID_JSON_RECEIPT')
    if type(obj) is not dict:
        hold('JSON_OBJECT_REQUIRED')
    if physical_sha(path, max_bytes=MAX_RECEIPT_BYTES) != pin:
        hold('RECEIPT_CHANGED_AFTER_PARSING')
    return obj


def inspect(*, movie, expected_movie_sha,
            visual_receipt, visual_receipt_sha,
            experience_receipt, experience_receipt_sha):
    if type(expected_movie_sha) is not str or not HEX.fullmatch(expected_movie_sha):
        hold('EXTERNALLY_PIN_CURRENT_MOVIE_SHA')
    if physical_sha(movie) != expected_movie_sha:
        hold('CURRENT_FILM_NOT_EXTERNALLY_PINNED')
    if Path(visual_receipt).resolve() == Path(experience_receipt).resolve():
        hold('DUPLICATE_RESEARCH_INPUT')
    visual = read_pinned(visual_receipt, visual_receipt_sha)
    experience = read_pinned(experience_receipt, experience_receipt_sha)

    if (visual.get('schema') != 'ths-lane5-physical-visual-repair-boundary-v1'
            or visual.get('editedSha256') != expected_movie_sha
            or not isinstance(visual.get('sourceSha256'), str)
            or not HEX.fullmatch(visual['sourceSha256'])
            or visual['sourceSha256'] == expected_movie_sha
            or visual.get('fullH264AndAacPhysicallyDecoded') is not True
            or visual.get('originalNarrationElementaryBytesIdentical') is not True
            or visual.get('presentationFramePtsIdentical') is not True
            or visual.get('originalAacElementarySha256') != visual.get('editedAacElementarySha256')
            or visual.get('decision') != 'VISUAL_CHANGE_LOCALIZED_AUDIO_LOCKED_SCIENCE_QA_HOLD'
            or visual.get('mayPublish') is not False
            or visual.get('firstExcellentMasterAccepted') is not False
            or visual.get('fiveRenderStreakAccepted') is not False
            or visual.get('originalKnownSourceClaimCorrectionsIndependentlyCertified') is not False
            or visual.get('subtitleLexicalMobileAndScientificAcceptanceProven') is not False):
        hold('VISUAL_RECEIPT_DIFFERENT_FILM_OR_FALSE_APPROVAL')
    n = visual.get('videoFrameCount')
    window = visual.get('declaredSceneFramesInclusive')
    if (type(n) is not int or not 60 <= n <= 5400
            or type(window) is not list or len(window) != 2
            or any(type(v) is not int for v in window)
            or not 0 <= window[0] < window[1] < n
            or type(visual.get('editedSceneFrames')) is not int
            or visual['editedSceneFrames'] != window[1]-window[0]+1
            or type(visual.get('framesChangedAboveScreen')) is not int
            or not 0 < visual['framesChangedAboveScreen'] <= visual['editedSceneFrames']):
        hold('INVALID_OR_FORGED_EDITED_FRAME_COUNTS')
    if (experience.get('schema') != 'ths-em-lane5-decoded-experience-research-v1'
            or experience.get('movieSha256') != expected_movie_sha
            or experience.get('videoFrames') != n
            or experience.get('physicalAudioAndVideoFramesDecoded') is not True
            or experience.get('mayPublish') is not False
            or experience.get('firstExcellentMasterAccepted') is not False
            or experience.get('fiveRenderStreakAccepted') is not False
            or experience.get('probeIsNotSceneIntentOrCraftJudgment') is not True
            or experience.get('qualifiedScienceAndNativeHandsetReviewComplete') is not False):
        hold('EXPERIENCE_RECEIPT_WRONG_FILM_OR_FALSE_APPROVAL')
    spans = experience.get('silentAndNearStaticSpans')
    flag = experience.get('needsExperienceReview')
    if (type(flag) is not bool or not isinstance(spans, list)
            or flag != bool(spans)
            or experience.get('decision') != ('RESEARCH_REVIEW_REQUIRED' if flag
                                              else 'NO_LONG_COINCIDENT_GAP_AT_THIS_PROXY')):
        hold('INCONSISTENT_EXPERIENCE_HOLD_STATE')
    for span in spans:
        if (not isinstance(span, dict)
                or any(type(span.get(k)) is not int for k in ('firstFrame', 'lastFrameInclusive'))
                or not 0 <= span['firstFrame'] <= span['lastFrameInclusive'] < n):
            hold('INVALID_EXPERIENCE_WINDOW')
    if physical_sha(movie) != expected_movie_sha:
        hold('CURRENT_MOVIE_CHANGED_DURING_REVIEW')
    if (physical_sha(visual_receipt, max_bytes=MAX_RECEIPT_BYTES) != visual_receipt_sha
            or physical_sha(experience_receipt, max_bytes=MAX_RECEIPT_BYTES) != experience_receipt_sha):
        hold('RESEARCH_RECEIPTS_CHANGED_DURING_REVIEW')
    return {
        'schema': 'ths-em-lane5-current-film-research-two-domain-join-v1',
        'candidateMovieSha256': expected_movie_sha,
        'sourceMovieSha256': visual['sourceSha256'],
        'videoFrames': n,
        'visualBoundaryReceiptSha256': visual_receipt_sha,
        'fullFilmExperienceReceiptSha256': experience_receipt_sha,
        'visualRepairFrameWindow': window,
        'pictureChangedOnlyWithinDeclaredWindowAtResearchProxy': True,
        'narrationAacElementaryUnchanged': True,
        'experienceProxyNeedsReview': flag,
        'experienceReviewIntervals': spans,
        'staleCrossFilmEvidenceRejected': True,
        'scientificSourceAndLexicalCorrectionReview': 'NOT_CLAIMED_BY_THIS_RESEARCH_JOIN',
        'currentFilmMobileAndNativePhoneAcceptance': 'NOT_CLAIMED_BY_THIS_RESEARCH_JOIN',
        'humanCalibratedCraftAndNarrationReview': 'NOT_CLAIMED_BY_THIS_RESEARCH_JOIN',
        'renderSourceReproducibilityAndExternalReview': 'NOT_CLAIMED_BY_THIS_RESEARCH_JOIN',
        'status': 'TWO_RESEARCH_DOMAINS_CONSISTENT_RELEASE_HOLD',
        'mayPublish': False,
        'firstExcellentMasterAccepted': False,
        'fiveRenderStreakAccepted': False,
        'acceptedAtomicCards': 0,
    }


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--movie', required=True)
    p.add_argument('--movie-sha', required=True)
    p.add_argument('--visual-receipt', required=True)
    p.add_argument('--visual-receipt-sha', required=True)
    p.add_argument('--experience-receipt', required=True)
    p.add_argument('--experience-receipt-sha', required=True)
    p.add_argument('--out', required=True)
    x = p.parse_args()
    result = inspect(movie=x.movie, expected_movie_sha=x.movie_sha,
                     visual_receipt=x.visual_receipt, visual_receipt_sha=x.visual_receipt_sha,
                     experience_receipt=x.experience_receipt, experience_receipt_sha=x.experience_receipt_sha)
    Path(x.out).write_text(json.dumps(result, indent=2, sort_keys=True)+'\n')
    print(result['status'])


if __name__ == '__main__':
    main()
