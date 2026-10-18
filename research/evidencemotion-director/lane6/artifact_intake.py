"""Offline research handoff. PASS means pinned-byte intake only, never approval.

The operator supplies a separately reviewed pin and its independently obtained
SHA. Neither a bundle's own manifest nor a SHA generated from it is authority.
"""
import argparse
import json
import lzma
import os
from pathlib import Path
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import zipfile
import zlib

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from native_source_provenance import digest, validate as provenance
from native_master_audit import verify as media_verify
from phone_ui_audit import verify_shots, verify_decoded_shot_coverage
from native_master_audit import frame_timestamps

ROLES = {'video', 'wav', 'captions', 'shotPlan', 'sourceManifest', 'lineage', 'reviewEvidence'}
LIMIT = 512 * 1024 * 1024
MAX_FILES = 256
FLAGS = ('mayPublish', 'craftApproved', 'scienceApproved', 'voiceApproved',
         'phonePlaybackApproved', 'releaseApproved', 'ownerApproved')


class IntakeError(ValueError):
    pass


def require(ok, code):
    if not ok:
        raise IntakeError(code)


def sha(value):
    return isinstance(value, str) and re.fullmatch('[0-9a-f]{64}', value) is not None


def relative(name):
    # Portable allow-list also excludes Windows ADS, devices and trailing-dot aliases.
    require(isinstance(name, str) and 0 < len(name) <= 240, 'UNSAFE_PATH')
    parts = name.split('/')
    for part in parts:
        require(re.fullmatch(r'[A-Za-z0-9_][A-Za-z0-9_.-]*', part) is not None
                and not part.endswith(('.', ' '))
                and part.upper().split('.')[0] not in
                {'CON', 'PRN', 'AUX', 'NUL', *('COM'+str(i) for i in range(10)),
                 *('LPT'+str(i) for i in range(10))}, 'UNSAFE_PATH')
    return name


def regular(path):
    info = path.lstat()
    require(stat.S_ISREG(info.st_mode) and not path.is_symlink()
            and not getattr(path, 'is_junction', lambda: False)()
            and not (getattr(info, 'st_file_attributes', 0) & 0x400), 'LINK_OR_SPECIAL_FILE')


def no_links(path):
    for item in (path, *path.parents):
        if item.exists() or item.is_symlink():
            info = item.lstat()
            require(not item.is_symlink()
                    and not (getattr(info, 'st_file_attributes', 0) & 0x400), 'LINK_OR_REPARSE_PATH')


def read_json(path, expected_sha=None):
    def unique(pairs):
        out = {}
        for key, value in pairs:
            require(key not in out, 'DUPLICATE_JSON_KEY')
            out[key] = value
        return out
    require(path.stat().st_size <= 4 * 1024 * 1024, 'JSON_TOO_LARGE')
    raw = path.read_bytes()
    if expected_sha is not None:
        import hashlib
        require(hashlib.sha256(raw).hexdigest() == expected_sha, 'PIN_HASH_MISMATCH')
    return json.loads(raw.decode('utf-8'), object_pairs_hook=unique,
                      parse_constant=lambda _: require(False, 'NONFINITE_JSON'))


def reject_approvals(value):
    if isinstance(value, dict):
        for key, item in value.items():
            if re.search(r'approved|approval|maypublish|accepted|auditioned', key, re.I):
                require(item is False, 'FORGED_APPROVAL:'+key)
            reject_approvals(item)
    elif isinstance(value, list):
        for item in value:
            reject_approvals(item)


def snapshot(source, stage):
    """Copy bytes to private staging; never extract ZIP entries by their paths."""
    no_links(source)
    names, total = set(), 0
    components = {}

    def register_path(name, is_directory):
        # Windows folds every path component, not only complete filenames.
        # Record implicit parent directories as well as explicit ZIP entries.
        parts = relative(name).split('/')
        for end in range(1, len(parts)+1):
            prefix = '/'.join(parts[:end])
            kind = 'directory' if end < len(parts) or is_directory else 'file'
            prior = components.get(prefix.casefold())
            if prior is not None:
                require(prior[0] == prefix, 'PATH_COMPONENT_CASE_ALIAS')
                require(prior[1] == kind, 'PATH_COMPONENT_KIND_CONFLICT')
            else:
                components[prefix.casefold()] = (prefix, kind)

    def copy(name, size, stream):
        nonlocal total
        name = relative(name)
        require(name.casefold() not in names, 'DUPLICATE_OR_CASE_ALIAS')
        register_path(name, False)
        names.add(name.casefold())
        total += size
        require(len(names) <= MAX_FILES and total <= LIMIT, 'BUNDLE_LIMIT')
        dest = stage / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        with dest.open('xb') as out:
            copied = 0
            while block := stream.read(1024 * 1024):
                copied += len(block)
                require(copied <= size, 'SIZE_MISMATCH')
                out.write(block)
        require(copied == size, 'SIZE_MISMATCH')

    if source.is_dir():
        def walk_error(error):
            raise error
        for base, dirs, files in os.walk(source, followlinks=False, onerror=walk_error):
            for directory in dirs:
                item = Path(base) / directory
                no_links(item)
                register_path(item.relative_to(source).as_posix(), True)
            for name in files:
                item = Path(base) / name
                regular(item)
                with item.open('rb') as stream:
                    copy(item.relative_to(source).as_posix(), item.stat().st_size, stream)
    else:
        regular(source)
        with zipfile.ZipFile(source) as archive:
            require(len(archive.infolist()) <= MAX_FILES, 'BUNDLE_LIMIT')
            for member in archive.infolist():
                name = relative(member.filename[:-1] if member.is_dir() else member.filename)
                mode = member.external_attr >> 16
                require(not mode or stat.S_IFMT(mode) in (0, stat.S_IFREG, stat.S_IFDIR),
                        'ZIP_LINK_OR_SPECIAL_FILE')
                require(not member.flag_bits & 1, 'ENCRYPTED_ZIP')
                if member.is_dir():
                    register_path(name, True)
                else:
                    with archive.open(member) as stream:
                        copy(name, member.file_size, stream)


def verify(stage, pin):
    require(isinstance(pin, dict), 'PIN_SCHEMA')
    reject_approvals(pin)
    require(pin.get('schema') == 'em-lane6-trusted-pin-1', 'PIN_SCHEMA')
    require(pin.get('state') == 'COMPLETE', 'PIN_INCOMPLETE')
    roles = pin.get('roles')
    require(isinstance(roles, dict) and set(roles) == ROLES, 'MISSING_ROLES')
    paths, hashes = {}, {}
    for role, record in roles.items():
        require(isinstance(record, dict) and set(record) == {'path', 'sha256'}, 'ROLE_RECORD')
        name = relative(record['path'])
        require(sha(record['sha256']), 'INVALID_HASH')
        item = stage / name
        require(item.is_file(), 'MISSING_INPUT:'+role)
        regular(item)
        require(digest(item) == record['sha256'], 'HASH_MISMATCH:'+role)
        paths[role], hashes[role] = item, record['sha256']
    require(len(set(p.relative_to(stage).as_posix().casefold() for p in paths.values())) == len(ROLES),
            'ALIASED_ROLES')
    source = read_json(paths['sourceManifest'])
    require(isinstance(source, dict) and isinstance(source.get('sourceInputs'), dict), 'SOURCE_SCHEMA')
    for name in source['sourceInputs']:
        relative(name)
    require(source.get('finalNativeMasterPath') == roles['video']['path']
            and source.get('originalFinalSha256') == hashes['video'], 'STALE_SOURCE_MANIFEST')
    for role in ('wav', 'captions', 'shotPlan', 'lineage', 'reviewEvidence'):
        require(source.get('sourceInputs', {}).get(roles[role]['path']) == hashes[role],
                'UNBOUND_SOURCE:'+role)
    proof = provenance(stage, source)
    require(proof['status'] == 'PASS', 'SOURCE_PROVENANCE:'+','.join(proof['errors']))
    for record in proof['checkedFiles']:
        relative(record['path'])
    lineage = read_json(paths['lineage'])
    require(isinstance(lineage, dict) and lineage.get('schema') == 'em-lane6-lineage-1', 'LINEAGE_SCHEMA')
    for role in ('video', 'wav', 'captions', 'shotPlan'):
        require(lineage.get(role+'Sha256') == hashes[role], 'STALE_LINEAGE:'+role)
    require(lineage.get('voiceIdentity') == 'original-kokoro', 'VOICE_IDENTITY')
    for flag in FLAGS:
        require(lineage.get(flag) is False, 'APPROVAL_FLAG_REQUIRED:'+flag)
    review = read_json(paths['reviewEvidence'])
    require(isinstance(review, dict) and review.get('schema') == 'em-lane6-review-handoff-1'
            and review.get('videoSha256') == hashes['video']
            and review.get('shotPlanSha256') == hashes['shotPlan']
            and review.get('scope') == 'pending-lane4-exact-film-review'
            and review.get('status') == 'HOLD', 'STALE_OR_FORGED_REVIEW')
    # Reject hidden/nested approval attempts in every delivered JSON, too.
    for document in (source, lineage, review):
        reject_approvals(document)
    for item in stage.rglob('*'):
        if item.is_file() and item.suffix.lower() == '.json':
            reject_approvals(read_json(item))
    # The externally pinned manifest binds additional sources; never promote
    # unlisted payloads to verified status merely by hashing them on arrival.
    bound = {record['path']: record['sha256'] for record in proof['checkedFiles']}
    bound[roles['sourceManifest']['path']] = hashes['sourceManifest']
    for item in stage.rglob('*'):
        if item.is_file():
            name = item.relative_to(stage).as_posix()
            require(name in bound, 'UNPINNED_BUNDLE_FILE:'+name)
    plan = read_json(paths['shotPlan'])
    require(isinstance(plan, dict) and plan.get('expectedVideoSha256') == hashes['video'], 'STALE_SHOT_PLAN')
    reject_approvals(plan)
    g = pin.get('media', {})
    require(isinstance(g, dict) and set(g) == {'width', 'height', 'fps', 'frames', 'audioAdtsSha256'}, 'MEDIA_CONTRACT')
    require(all(type(g[k]) is int and g[k] > 0 for k in ('width', 'height', 'fps', 'frames'))
            and sha(g['audioAdtsSha256']), 'MEDIA_CONTRACT')
    verify_shots(plan.get('shots'), g['frames'] / g['fps'])
    media = media_verify(paths['video'], paths['video'], hashes['video'], g['audioAdtsSha256'],
                         g['frames'], width=g['width'], height=g['height'], fps=g['fps'], decode_all=True)
    require(media['technical'] == 'PASS', 'DECODED_MEDIA:'+','.join(media['problems']))
    verify_decoded_shot_coverage(frame_timestamps(paths['video']), plan['shots'])
    # Rehash after decode, then after transfer. No claim that pinned AAC proves
    # acoustic equivalence to the WAV: that mapping is separately reviewed trust.
    checked = {p.relative_to(stage).as_posix(): digest(p) for p in stage.rglob('*') if p.is_file()}
    require(set(checked) == set(bound), 'INPUT_CHANGED_DURING_AUDIT')
    for name, wanted in bound.items():
        require(checked[name].lower() == wanted.lower(), 'INPUT_CHANGED_DURING_AUDIT')
    return {'roles': roles, 'files': checked, 'media': media,
            'sourceProvenance': proof, 'captionLineage': 'PINNED_BYTES_ONLY',
            'voiceLineage': 'PINNED_WAV_AND_AAC_NOT_NEW_ACOUSTIC_PROOF'}


def intake(source, pin_path, expected_pin_sha, destination=None):
    result = {'status': 'HOLD', 'scope': 'offline-artifact-intake-only', 'errors': [],
              **{flag: False for flag in FLAGS}, 'newAtomicCards': 0}
    try:
        require(sha(expected_pin_sha), 'TRUSTED_PIN_SHA_REQUIRED')
        no_links(pin_path)
        regular(pin_path)
        require(digest(pin_path) == expected_pin_sha, 'PIN_HASH_MISMATCH')
        pin = read_json(pin_path, expected_pin_sha)
        result['trustedPinSha256'] = expected_pin_sha
        # Missing real bytes are an explicit HOLD, never a synthetic fallback.
        if not source.exists():
            raise FileNotFoundError('BUNDLE_UNAVAILABLE')
        if destination is not None:
            no_links(destination.absolute())
            require(not destination.exists(), 'DESTINATION_EXISTS')
            # A handoff must never create new files inside the original evidence
            # directory. The source is an immutable input, not a destination root.
            if source.is_dir():
                require(not destination.resolve(strict=False).is_relative_to(source.resolve(strict=False)),
                        'DESTINATION_INSIDE_SOURCE')
            require(destination.parent.is_dir(), 'DESTINATION_PARENT_MISSING')
        with tempfile.TemporaryDirectory(prefix='em-lane6-') as tmp:
            stage = Path(tmp) / 'bundle'
            stage.mkdir()
            snapshot(source, stage)
            result.update(verify(stage, pin))
            if destination is not None:
                # mkdir fails if another process created it. Existing data is never replaced.
                destination.mkdir()
                for name, wanted in result['files'].items():
                    target = destination / name
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with (stage / name).open('rb') as inp, target.open('xb') as out:
                        shutil.copyfileobj(inp, out)
                    require(digest(target) == wanted, 'TRANSFER_HASH_MISMATCH')
                # A per-file copy check does not establish the final package.
                # Reconcile the complete destination before exposing a PASS path.
                delivered = {}
                for item in destination.rglob('*'):
                    no_links(item)
                    if not item.is_dir():
                        regular(item)
                        delivered[item.relative_to(destination).as_posix()] = item
                require(set(delivered) == set(result['files']), 'TRANSFER_FINAL_INVENTORY_MISMATCH')
                for name, item in delivered.items():
                    require(digest(item) == result['files'][name], 'TRANSFER_FINAL_HASH_MISMATCH:'+name)
                result['handoffDirectory'] = str(destination.absolute())
            result['status'] = 'PASS'
    except (zlib.error, lzma.LZMAError):
        result['status'] = 'FAIL'
        result['errors'].append('CORRUPT_ZIP_COMPRESSION')
    except FileNotFoundError as error:
        result['errors'].append('MISSING_INPUT:'+str(error))
    except (ValueError, KeyError, TypeError, OSError, RuntimeError,
            subprocess.SubprocessError, zipfile.BadZipFile) as error:
        result['status'] = 'FAIL'
        result['errors'].append(str(error))
    return result


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--bundle', type=Path, required=True)
    p.add_argument('--pin', type=Path, required=True)
    p.add_argument('--pin-sha256', required=True)
    p.add_argument('--handoff', type=Path)
    args = p.parse_args()
    result = intake(args.bundle, args.pin, args.pin_sha256, args.handoff)
    print(json.dumps(result, indent=2))
    return {'PASS': 0, 'FAIL': 1, 'HOLD': 2}[result['status']]


if __name__ == '__main__':
    sys.exit(main())
