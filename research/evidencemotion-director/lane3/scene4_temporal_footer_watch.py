#!/usr/bin/env python3
"""Lane 3 research-only frame-by-frame ghost/footer negative filter.

Reads exact archived original and clean-panel film; never edits either.
It cannot judge science validity, accessibility, creative quality or release.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

SOURCE_SHA = 'e79e44746e8a8581ecc592e41de20bb67ded7e999042234902ed30b0142a0c9a'
CLEAN_SHA = '3c4e91b37958f1e86b6a04486933bbfc719bf6a196203711d6421eca58b70d31'
FIRST, LAST = 555, 701
DISCLOSURE_FIRST = 595
CROP_X, CROP_Y = 515, 944
CROP_W, CROP_H = 434, 50  # even YUV420 source crop; 515..948, 944..993
PIXELS_PER_FRAME = CROP_W * CROP_H * 3

class FooterHold(ValueError):
    pass

def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for buf in iter(lambda: f.read(1 << 20), b''):
            h.update(buf)
    return h.hexdigest()

def classify(frame):
    """Negative-only native pixel predicates, NOT glyph OCR or artistic approval.

    Ghost: source-bright atom fragments in x565..948, y944..959.
    Footer: source glyph ink in x515..879, y960..986. The original legend
    begins at frame 595, so a blank earlier band is not a missing label.
    """
    if len(frame) != PIXELS_PER_FRAME:
        raise FooterHold('TEMPORAL_CROP_FRAME_SIZE_MISMATCH')
    view = memoryview(frame)
    ghost = footer = 0
    for y in range(16):
        for x in range(50, CROP_W):
            i = (y * CROP_W + x) * 3
            if view[i] > 110 and view[i+1] > 100 and view[i+2] > 95:
                ghost += 1
    for y in range(16, 43):
        for x in range(365):
            i = (y * CROP_W + x) * 3
            if view[i] > 125 and view[i+1] > 135 and view[i+2] > 138:
                footer += 1
    return {'ghostBrightPixels':ghost, 'disclosureInkPixels':footer}

def decoded_crops(path):
    filt = (f'select=between(n\\,{FIRST}\\,{LAST}),'
            f'crop={CROP_W}:{CROP_H}:{CROP_X}:{CROP_Y}:exact=1')
    cmd = ['ffmpeg','-nostdin','-v','error','-xerror','-i',str(path),
           '-map','0:v:0','-vf',filt,'-vsync','0',
           '-f','rawvideo','-pix_fmt','rgb24','-']
    try:
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except OSError as exc:
        raise FooterHold('FFMPEG_UNAVAILABLE') from exc
    frames = []
    try:
        for _ in range(LAST-FIRST+1):
            data = proc.stdout.read(PIXELS_PER_FRAME)
            if len(data) != PIXELS_PER_FRAME:
                raise FooterHold('REAL_FILM_SHORT_OR_TRUNCATED')
            frames.append(classify(data))
        if proc.stdout.read(1):
            raise FooterHold('REAL_FILM_EXTRA_SELECTED_FRAMES')
        if proc.wait() != 0:
            raise FooterHold('REAL_FILM_DECODE_FAILED')
    except BaseException:
        if proc.poll() is None: proc.kill()
        proc.wait()
        raise
    finally:
        proc.stdout.close()
        proc.stderr.close()
    return frames

def evaluate(before,after):
    expected = LAST-FIRST+1
    if (len(before) != expected or len(after) != expected or
        any(not isinstance(v,dict) or
            type(v.get('ghostBrightPixels')) is not int or
            type(v.get('disclosureInkPixels')) is not int or
            min(v['ghostBrightPixels'],v['disclosureInkPixels']) < 0
            for v in before+after)):
        raise FooterHold('TEMPORAL_FRAME_AUDIT_INCOMPLETE')
    removed=0
    max_retained_drift=0.0
    for i,(src,new) in enumerate(zip(before,after)):
        frame = FIRST+i
        if new['ghostBrightPixels'] != 0:
            raise FooterHold(f'RESIDUAL_GHOST_BRIGHT_PIXEL_FRAME_{frame}')
        if src['ghostBrightPixels']>0: removed+=1
        old_ink,new_ink=src['disclosureInkPixels'],new['disclosureInkPixels']
        if frame < DISCLOSURE_FIRST:
            if old_ink>150 or new_ink>150:
                raise FooterHold(f'EARLY_DISCLOSURE_PIXEL_CHANGE_FRAME_{frame}')
        elif old_ink<=150 or new_ink<=150:
            raise FooterHold(f'VISIBLE_DISCLOSURE_PIXEL_ABSENT_FRAME_{frame}')
        else:
            drift=abs(new_ink-old_ink)/old_ink
            if drift > .05:
                raise FooterHold(f'DISCLOSURE_INK_DRIFT_FRAME_{frame}')
            max_retained_drift=max(max_retained_drift,drift)
    if removed < 1:
        raise FooterHold('NO_PHYSICAL_SOURCE_GHOST_FOR_COMPARISON')
    return {
        'schema':'ths-lane3-temporal-footer-negative-audit-v1',
        'status':'TEMPORAL_PIXEL_NEGATIVE_SCREEN_PASSED',
        'beforeFilmSha256':SOURCE_SHA,'afterFilmSha256':CLEAN_SHA,
        'firstFrame':FIRST,'lastFrameInclusive':LAST,
        'realEncodedFramesCompared':expected,
        'beforeFramesWithGhostBrightPixels':removed,
        'afterFramesWithGhostBrightPixels':0,
        'disclosureFirstExpectedFrame':DISCLOSURE_FIRST,
        'disclosureFramesPreserved':LAST-DISCLOSURE_FIRST+1,
        'maxRelativeDisclosureInkCountDrift':round(max_retained_drift,6),
        'limits':'Fixed ROI RGB thresholds at original decoded native resolution. Not OCR, hearing, device playback, chemical, audience or art approval.',
        'scienceApproved':False,'craftApproved':False,
        'phonePlaybackApproved':False,'excellentCertified':False,
        'mayPublish':False,
    }

def audit(before,after):
    before,after=Path(before),Path(after)
    if before.resolve()==after.resolve():
        raise FooterHold('DISTINCT_SOURCE_MOVIES_REQUIRED')
    if sha(before)!=SOURCE_SHA:raise FooterHold('PREVIOUS_FILM_SHA_MISMATCH')
    if sha(after)!=CLEAN_SHA:raise FooterHold('CLEAN_FILM_SHA_MISMATCH')
    result=evaluate(decoded_crops(before),decoded_crops(after))
    if sha(before)!=SOURCE_SHA or sha(after)!=CLEAN_SHA:
        raise FooterHold('FILM_BYTES_CHANGED_DURING_TEMPORAL_AUDIT')
    return result

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--before',required=True,type=Path)
    p.add_argument('--after',required=True,type=Path)
    p.add_argument('--receipt',type=Path)
    args=p.parse_args()
    try:
        result=audit(args.before,args.after)
    except (FooterHold,OSError) as exc:
        result={'status':'HOLD','reason':str(exc),'mayPublish':False}
        code=3
    else:
        code=0
    payload=json.dumps(result,indent=2,sort_keys=True)+'\n'
    if args.receipt:
        if args.receipt.resolve() in (args.before.resolve(),args.after.resolve()):
            raise SystemExit('HOLD: RECEIPT_MUST_NOT_OVERWRITE_MOVIE')
        args.receipt.write_text(payload)
    else:
        print(payload,end='')
    return code

if __name__=='__main__':
    raise SystemExit(main())
