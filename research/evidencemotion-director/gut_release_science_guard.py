#!/usr/bin/env python3
"""L1-GUT-01: research-only source/voice/editorial gate for a first-party gut film.

Checks an owner-pinned reproducible archive without running embedded code.
A passing *source proposal* NEVER proves edited encoded pixels or publication.
"""
import argparse
import ast
import hashlib
import json
import re
import stat
import zipfile
from pathlib import Path, PurePosixPath

SCHEMA = 'ths-lane1-gut-visual-voice-science-hold-v1'
SOURCE_RECORD = 'REPRODUCE_SOURCE_RENDERER.py'
VOICE_RECORD = 'ORIGINAL_KOKORO_VOICE_RECEIPT.json'
MANIFEST_RECORD = 'DELIVERY_SHA_MANIFEST.json'
SCIENCE_RECORD = 'SCIENCE_CLAIM_REVIEW.md'
BUILD_RECORD = 'REPRODUCE_VOICE_LOCKED_VIDEO.py'
FILM_RECORD = 'THS_Gut_Absorption_V8.mp4'
FDA_GUIDANCE = ('https://www.fda.gov/files/drugs/published/'
                'Dissolution-Testing-and-Acceptance-Criteria-for-Immediate-Release-'
                'Solid-Oral-Dosage-Form-Drug-Products-Containing-High-Solubility-'
                'Drug-Substances-Guidance-for-Industry.pdf')
USP_SUPPLEMENT_CHAPTER = 'https://doi.usp.org/USPNF/USPNF_M99970_04_01.html'
ORIGINAL_NARRATION = 'A capsule can open in your gut, but release is not absorption.'

# Archive ingestion is untrusted even with a matching pinned SHA.
# Reject bombs and malicious ZIP entries before decompressing any member.
MAX_PACKAGE_BYTES = 75 * 1024 * 1024
MAX_ARCHIVE_MEMBERS = 128
MAX_MEMBER_BYTES = 45 * 1024 * 1024
MAX_TOTAL_UNCOMPRESSED_BYTES = 96 * 1024 * 1024
MAX_MANIFEST_BYTES = 1024 * 1024


def sha256(raw):
    return hashlib.sha256(raw).hexdigest()


def hold(reason):
    raise ValueError('L1_GUT_SOURCE_HOLD:' + reason)


def read_pinned_package(path, expected_sha):
    """Read first-party packaged evidence bytes; never extract or execute code.

    Bound advertised payloads before decompressing even an exactly pinned ZIP.
    An independent SHA proves identity, not safety.
    """
    path = Path(path)
    if not isinstance(expected_sha, str) or not re.fullmatch(r'[a-f0-9]{64}', expected_sha):
        hold('EXACT_ARCHIVE_SHA_REQUIRED')
    if (not path.is_file() or path.is_symlink() or
            path.stat().st_size > MAX_PACKAGE_BYTES):
        hold('ARCHIVE_IDENTITY_OR_SIZE_INVALID')
    if sha256(path.read_bytes()) != expected_sha:
        hold('ARCHIVE_IDENTITY_MISMATCH')
    with zipfile.ZipFile(path) as z:
        infos = z.infolist()
        names = [i.filename for i in infos]
        if (len(names) != len(set(names)) or not infos or
            len(infos) > MAX_ARCHIVE_MEMBERS or
            any(i.is_dir() or len(PurePosixPath(n).parts) != 1 or
                n.startswith('.') or '\\' in n or n in ('', '..') or
                (i.create_system == 3 and
                 stat.S_IFMT(i.external_attr >> 16) == stat.S_IFLNK)
                for i, n in zip(infos, names))):
            hold('UNTRUSTED_ARCHIVE_STRUCTURE')
        if (any(i.file_size <= 0 or i.file_size > MAX_MEMBER_BYTES or
                i.flag_bits & 1 for i in infos) or
                sum(i.file_size for i in infos) > MAX_TOTAL_UNCOMPRESSED_BYTES):
            hold('ARCHIVE_RESOURCE_LIMIT_OR_ENCRYPTION')
        if MANIFEST_RECORD not in names:
            hold('DELIVERY_MANIFEST_MISSING')
        if z.getinfo(MANIFEST_RECORD).file_size > MAX_MANIFEST_BYTES:
            hold('MANIFEST_RESOURCE_LIMIT')
        try:
            manifest = json.loads(z.read(MANIFEST_RECORD), object_pairs_hook=_unique)
        except (UnicodeError, json.JSONDecodeError) as exc:
            hold('MANIFEST_NOT_STRICT_JSON:' + type(exc).__name__)
        if not isinstance(manifest, dict):
            hold('MANIFEST_NOT_OBJECT')
        files = manifest.get('files')
        required = {SOURCE_RECORD, VOICE_RECORD, SCIENCE_RECORD, FILM_RECORD, BUILD_RECORD}
        if (manifest.get('schema') != 'ths.gut_absorption.delivery_review.v8' or
            manifest.get('mayPublish') is not False or not isinstance(files, dict) or
            set(files) != set(names) - {MANIFEST_RECORD} or not required <= set(files)):
            hold('SOURCE_MANIFEST_SCOPE_OR_RELEASE_DRIFT')
        saved = {}
        for name in files:
            rec = files[name]
            if (not isinstance(rec, dict) or set(rec) != {'sha256', 'bytes'} or
                not isinstance(rec['bytes'], int) or isinstance(rec['bytes'], bool) or
                rec['bytes'] < 1 or rec['bytes'] != z.getinfo(name).file_size or
                not isinstance(rec['sha256'], str) or
                not re.fullmatch('[a-f0-9]{64}', rec['sha256'])):
                hold('MALFORMED_FILE_IDENTITY:' + name)
            data = z.read(name)
            if len(data) != rec['bytes'] or sha256(data) != rec['sha256']:
                hold('MEMBER_HASH_OR_LENGTH_MISMATCH:' + name)
            if name in required:
                saved[name] = data
        return saved, files[FILM_RECORD]['sha256']


def _unique(pairs):
    d = {}
    for k, v in pairs:
        if k in d:
            hold('DUPLICATE_JSON_KEY:' + k)
        d[k] = v
    return d


def static_scenes(source):
    """Parse only literal dict scene declarations, not code execution."""
    try:
        tree = ast.parse(source.decode('utf-8'))
    except (SyntaxError, UnicodeError) as exc:
        hold('RENDERER_NOT_PARSEABLE:' + type(exc).__name__)
    assignments = [n.value for n in tree.body if isinstance(n, ast.Assign)
                   and any(isinstance(t, ast.Name) and t.id == 'STAGES'
                           for t in n.targets)]
    if len(assignments) != 1 or not isinstance(assignments[0], (ast.List, ast.Tuple)):
        hold('STAGES_NOT_SINGLE_STATIC_LIST')
    scenes = []
    for item in assignments[0].elts:
        if (not isinstance(item, ast.Call) or not isinstance(item.func, ast.Name)
            or item.func.id != 'dict' or item.args or any(k.arg is None for k in item.keywords)):
            hold('DYNAMIC_SCENE_NOT_VERIFIABLE')
        try:
            scene = {kw.arg: ast.literal_eval(kw.value) for kw in item.keywords}
        except (ValueError, TypeError, RecursionError):
            hold('DYNAMIC_SCENE_NOT_VERIFIABLE')
        if len(scene) != len(item.keywords):
            hold('DUPLICATE_SCENE_FIELD')
        if not all(isinstance(scene.get(k), str) and scene[k].strip()
                   for k in ('id', 'title', 'subtitle', 'text', 'source')):
            hold('SCENE_IDENTITY_OR_WORDING_MISSING')
        scenes.append(scene)
    ids = [s['id'] for s in scenes]
    if len(set(ids)) != len(ids) or ids.count('dissolve') != 1:
        hold('DUPLICATE_OR_MISSING_RELEASE_SCENE')
    return scenes


def review_release_scene(scenes, voice, science_text):
    if (not isinstance(voice, dict) or voice.get('mayPublish') is not False
        or not isinstance(voice.get('scenes'), list) or
        not isinstance(voice.get('master_sha256'), str) or
        not re.fullmatch(r'[a-f0-9]{64}', voice['master_sha256'])):
        hold('ORIGINAL_NARRATION_RECEIPT_INVALID')
    # Filtering non-dict entries makes a forged seven-scene receipt look like
    # the six frozen records; require the exact count and complete text first.
    if len(voice['scenes']) != len(scenes) or any(
        not isinstance(s, dict) or not isinstance(s.get('id'), str) or
        not s['id'].strip() or not isinstance(s.get('text'), str) or
        not s['text'].strip() for s in voice['scenes']
    ):
        hold('ORIGINAL_NARRATION_RECEIPT_INVALID')
    source_ids = [s['id'] for s in scenes]
    spoken_ids = [s['id'] for s in voice['scenes']]
    if source_ids != spoken_ids or len(spoken_ids) != 6:
        hold('VISUAL_VOICE_SCENE_IDENTITY_DRIFT')
    narration = voice['scenes'][spoken_ids.index('dissolve')].get('text')
    if narration != ORIGINAL_NARRATION:
        hold('FROZEN_NARRATION_REWRITTEN_OR_UNVERIFIED')
    scene = next(s for s in scenes if s['id'] == 'dissolve')
    title = ' '.join((scene['title'] + ' ' + scene['subtitle']).upper().split())
    source = scene['source']
    flags = []
    if re.search(r'\bFIRST\s*:\s*DISSOLVE\b', title) or re.search(
        r'\b(?:ALL|EVERY)\b.*\b(?:CAPSULES?|SUPPLEMENTS?)\b.*\bDISSOLVE\b', title
    ):
        flags.append('UNQUALIFIED_FIRST_DISSOLVE_HEADLINE')
    if title not in ('RELEASE IS NOT ABSORPTION', 'SOME CAPSULES RELEASE IN THE GUT'):
        flags.append('RELEASE_VS_ABSORPTION_HEADLINE_NEEDS_EDITORIAL_APPROVAL')
    # Never infer source identity from a substring such as "not USP" or
    # "NIDDK/FDA". A source label is a provenance assertion, not a keyword.
    # These are research-only labels; the encoded film still needs a physical
    # legible attribution and qualified source/claim review.
    source_label = ' '.join(source.casefold().split())
    usp_labels = frozenset({
        'usp <2040>',
        'usp-nf <2040>',
        'usp–nf <2040>',
        'usp-nf <2040> supplement disintegration standard',
    })
    fda_labels = frozenset({'fda immediate-release oral dosage guidance'})
    if source_label in usp_labels:
        # Chapter <2040> describes supplement laboratory tests only *where
        # specified by an individual monograph*. Not direct human uptake proof.
        if USP_SUPPLEMENT_CHAPTER not in science_text:
            flags.append('USP_SUPPLEMENT_DISINTEGRATION_CHAPTER_NOT_CITED')
        if ('where individual monographs specify' not in science_text.lower() or
            'not in-vivo absorption' not in science_text.lower()):
            flags.append('USP_LAB_TEST_NOT_DISTINGUISHED_FROM_HUMAN_ABSORPTION')
    elif source_label in fda_labels:
        # FDA drug-dissolution guidance is only a bounded contrast; never
        # substitute it for human studies of a given supplement formulation.
        if FDA_GUIDANCE not in science_text:
            flags.append('FDA_DOSAGE_FORM_GUIDANCE_NOT_CITED')
        if ('immediate-release drug' not in science_text.lower() or
            'not universal' not in science_text.lower()):
            flags.append('DRUG_GUIDANCE_SCOPE_NOT_EXPLICITLY_LIMITED')
    else:
        flags.append('NIDDK_DIGESTION_SOURCE_INSUFFICIENT_FOR_DOSAGE_FORM_CLAIM')
    return title, source, flags


def inspect(path, expected_sha):
    evidence, film_sha = read_pinned_package(path, expected_sha)
    scenes = static_scenes(evidence[SOURCE_RECORD])
    try:
        voice = json.loads(evidence[VOICE_RECORD], object_pairs_hook=_unique)
        science = evidence[SCIENCE_RECORD].decode('utf-8')
    except (UnicodeError, json.JSONDecodeError) as exc:
        hold('SOURCE_VOICE_OR_SCIENCE_READ_FAILED:' + type(exc).__name__)
    title, source, flags = review_release_scene(scenes, voice, science)
    # The shipped V8 wrapper imports the final visual renderer from a separate
    # local file. A bundled V4 preview source alone is not a reproducible V8
    # source lineage. Assert the unresolved dependency without running imports.
    build_script = evidence[BUILD_RECORD].decode('utf-8')
    required_imports = re.findall(r"Path\(['\"](/mnt/data/[^'\"]+\.py)['\"]\)", build_script)
    lineage_issues = []
    for imported in required_imports:
        if PurePosixPath(imported).name not in evidence:
            lineage_issues.append('EXTERNAL_RENDERER_SOURCE_NOT_IN_ARCHIVE:' +
                                  PurePosixPath(imported).name)
    if not required_imports:
        lineage_issues.append('BUILD_SCRIPT_DEPENDENCY_NOT_INDEPENDENTLY_ESTABLISHED')
    return {'schema': SCHEMA, 'task': 'L1-GUT-01',
            'exactArchiveSha256': expected_sha, 'exactPackagedFilmSha256': film_sha,
            'originalNarrationSha256': voice.get('master_sha256'),
            'observedSourceHeadline': title, 'observedSourceCredit': source,
            'sourceContractIssues': flags,
            'reproducibilityIssues': lineage_issues,
            'result': ('SOURCE_CORRECTION_REQUIRED' if flags else
                       'SOURCE_PROPOSAL_RESEARCH_SCREEN_PASS_ENCODED_FILM_STILL_HOLD'),
            'encodedFilmPixelsIndependentlyCheckedByThisTool': False,
            'externalScientificReviewApproved': False,
            'physicalHandsetApproved': False,
            'mayPublish': False, 'approvalToMerge': False}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--zip', required=True)
    ap.add_argument('--expected-zip-sha256', required=True)
    args = ap.parse_args()
    result = inspect(args.zip, args.expected_zip_sha256)
    print(json.dumps(result, indent=2))
    return 0 if not result['sourceContractIssues'] and not result['reproducibilityIssues'] else 2

if __name__ == '__main__':
    raise SystemExit(main())