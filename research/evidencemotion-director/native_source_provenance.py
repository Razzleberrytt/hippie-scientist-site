#!/usr/bin/env python3
"""Fail-closed actual-byte provenance validator for inert EvidenceMotion media bundles.

This does not certify scientific claims, genuinely native pixels, voice artistry,
phone playback, publishing permission, or cinematic craft. No internet access.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
from pathlib import Path

_SHA = re.compile(r"[0-9a-fA-F]{64}\Z")


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024*1024), b''):
            h.update(block)
    return h.hexdigest()


def safe_file(root: Path, rel: str) -> Path:
    if not isinstance(rel, str) or not rel or rel.startswith(('/', '\\')) or '\\' in rel:
        raise ValueError('invalid relative path')
    item = Path(rel)
    if (item.is_absolute() or not item.parts or rel != item.as_posix()
            or any(part in ('', '.', '..') for part in rel.split('/'))):
        raise ValueError('path traversal or noncanonical path')
    base = root.resolve(strict=True)
    resolved = (base / item).resolve(strict=True)
    if not resolved.is_relative_to(base):
        raise ValueError('path escapes provenance root')
    if any((base / Path(*item.parts[:i])).is_symlink() for i in range(1,len(item.parts)+1)):
        raise ValueError('symlink source forbidden')
    if not resolved.is_file():
        raise ValueError('not a file')
    return resolved


def validate(root: Path, manifest: dict) -> dict:
    issues=[]
    facts=[]
    if not isinstance(manifest, dict):
        return {'status':'HOLD','errors':['INVALID_MANIFEST'],'releaseApproved':False}
    sources = manifest.get('sourceInputs')
    master = manifest.get('finalNativeMasterPath')
    expected = manifest.get('originalFinalSha256')
    if not isinstance(sources, dict) or len(sources)<4 or not isinstance(master,str) or not isinstance(expected,str):
        return {'status':'HOLD','errors':['INCOMPLETE_MANIFEST'],'releaseApproved':False}
    if not _SHA.fullmatch(expected): issues.append('INVALID_MASTER_SHA')
    if manifest.get('notReleasableWithoutFinalQualityReview') is not True:
        issues.append('MISSING_RELEASE_HOLD')
    for rel,want in sources.items():
        if not isinstance(want,str) or not _SHA.fullmatch(want):
            issues.append('INVALID_SOURCE_HASH:'+str(rel));continue
        try:
            actual=digest(safe_file(root,rel))
            facts.append({'path':rel,'sha256':actual,'matches':actual.lower()==want.lower()})
            if actual.lower()!=want.lower():issues.append('SOURCE_HASH_MISMATCH:'+rel)
        except (OSError,ValueError) as error:
            issues.append('SOURCE_UNAVAILABLE_OR_UNSAFE:'+str(rel)+':'+str(error))
    if master in sources: issues.append('MASTER_MUST_NOT_BE_OWN_SOURCE')
    try:
        actual=digest(safe_file(root,master))
        facts.append({'path':master,'sha256':actual,'matches':actual.lower()==expected.lower()})
        if actual.lower()!=expected.lower():issues.append('MASTER_HASH_MISMATCH')
    except (OSError,ValueError) as error:
        issues.append('MASTER_UNAVAILABLE_OR_UNSAFE:'+str(error))
    return {'status':'PASS' if not issues else 'HOLD','errors':issues,
            'checkedFiles':facts,'releaseApproved':False,'craftApproved':False,
            'scienceReviewApproved':False,'nativeSourceProof':False,
            'note':'Hash equality only. Verify real decoded media, source native renderer execution, editorial and device QA separately.'}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--root', type=Path,required=True)
    parser.add_argument('--manifest',type=Path,required=True)
    parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    try:
        result=validate(args.root,json.loads(args.manifest.read_text()))
    except (OSError,ValueError,json.JSONDecodeError) as e:
        result={'status':'HOLD','errors':['INVALID_MANIFEST:'+str(e)],'releaseApproved':False}
    rendered=json.dumps(result,indent=2)+'\n'
    if args.output:args.output.write_text(rendered)
    print(rendered,end='')
    raise SystemExit(0 if result['status']=='PASS' else 1)
if __name__=='__main__':main()
