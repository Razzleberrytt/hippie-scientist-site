#!/usr/bin/env python3
"""EvidenceMotion Lane4: exact-film decoded-mobile receipt reconciliation.

Use only after a *separate physical FFmpeg full video decode* has produced the
frameObservations. Checks frozen source hashes, every frame/region, and exact
authored cue intervals. It cannot authenticate physical pixels or grant release.
All outcomes remain research HOLD; 14px is only a provisional negative screen.
"""
import hashlib
import json
import math
import re
from pathlib import Path

REGIONS = ('explanation', 'source_credit', 'voice_caption')
AUTHORED_ROIS = {
 'explanation': {'x': [40,515], 'y':[685,735]},
 'source_credit': {'x':[40,480], 'y':[750,779]},
 'voice_caption': {'x':[65,510], 'y':[789,841]},
}
EXPECTED = {'native_width':1080,'native_height':1920,'fps':30}

class Hold(ValueError): pass

def require(ok, why):
    if not ok: raise Hold('MOBILE_RECEIPT_HOLD:' + why)

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def parse_srt(raw):
    txt=raw.decode('utf-8-sig')
    cues=[]; lastend=0.
    for block in re.split(r'\n\s*\n',txt.strip()):
        lines=block.splitlines()
        require(len(lines)>=3 and lines[0].isdigit(), 'INVALID_SRT_BLOCK')
        require(int(lines[0])==len(cues)+1,'NONSEQUENTIAL_SRT_INDEX')
        m=re.fullmatch(r'(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})',lines[1])
        require(m is not None, 'INVALID_SRT_TIME')
        v=list(map(int,m.groups()))
        require(v[1]<60 and v[2]<60 and v[5]<60 and v[6]<60, 'INVALID_SRT_CLOCK')
        start=v[0]*3600+v[1]*60+v[2]+v[3]/1000
        end=v[4]*3600+v[5]*60+v[6]+v[7]/1000
        require(end>start and start>=lastend-0.000001,'OVERLAP_OR_REVERSE_CUE')
        require(any(x.strip() for x in lines[2:]),'EMPTY_CUE')
        cues.append({'index':len(cues)+1,'start':start,'end':end,'text':' '.join(lines[2:])})
        lastend=end
    require(cues,'EMPTY_SRT')
    return cues

def validate(report, raw_srt, *, expected_film_sha, expected_srt_sha, expected_frames):
    """Inspect every declared frame and recompute cue-scoped negative counts."""
    require(re.fullmatch('[0-9a-f]{64}',expected_film_sha) is not None,'PIN_REQUIRED')
    require(re.fullmatch('[0-9a-f]{64}',expected_srt_sha) is not None,'SRT_PIN_REQUIRED')
    require(hashlib.sha256(raw_srt).hexdigest()==expected_srt_sha,'WRONG_SRT_BYTES')
    require(isinstance(report,dict) and report.get('movieSha256')==expected_film_sha,'WRONG_FILM')
    native=report.get('native') or {}
    require(native.get('width')==1080 and native.get('height')==1920 and native.get('fps')==30,'WRONG_NATIVE_STREAM')
    frames=report.get('frameObservations')
    require(type(expected_frames) is int and expected_frames>=2, 'PINNED_FRAME_COUNT_REQUIRED')
    require(native.get('fullPhysicallyDecodedFrames')==expected_frames and isinstance(frames,list) and len(frames)==expected_frames,'INCOMPLETE_FRAME_COUNT')
    require(report.get('mayPublish') is False and report.get('humanPhoneVerified') is False and report.get('filmSemanticApproved') is False and report.get('qualifiedScienceApproved') is False and report.get('exactWordOCRApproved') is False,'FORGED_AUTHORITY')
    require(report.get('regionsHalfSizePx')==AUTHORED_ROIS,'UNFROZEN_OR_CHANGED_ROIS')
    cues=parse_srt(raw_srt)
    require(cues[-1]['end']<=(len(frames)/30)+0.05,'CUES_EXCEED_DECODED_FILM')
    profiles={k:[] for k in REGIONS}
    for i,fr in enumerate(frames):
        require(type(fr) is dict and type(fr.get('frame')) is int and fr['frame']==i,'MISSING_DUPLICATE_OR_SHUFFLED_FRAME')
        bands=fr.get('bands')
        require(type(bands) is dict and set(bands)==set(REGIONS),'INCOMPLETE_REGIONS')
        for name in REGIONS:
            b=bands[name]
            require(isinstance(b,list),'INVALID_INK_BANDS')
            last=-1; tallest=0.
            for z in b:
                require(isinstance(z,dict),'INVALID_INK_BAND')
                y0,y1=z.get('y0'),z.get('y1'); h=z.get('halfres_rows'); px=z.get('pixelsAt320')
                require(all(type(t) is int for t in (y0,y1,h)) and y0>last and y0<=y1 and h==y1-y0+1,'INVALID_OR_OVERLAPPING_BAND')
                require(AUTHORED_ROIS[name]['y'][0]<=y0 and y1<AUTHORED_ROIS[name]['y'][1],'BAND_OUTSIDE_ROI')
                require(type(px) in (float,int) and math.isfinite(px) and abs(px-round(h*320/540,2))<=.001,'FORGED_PROJECTED_HEIGHT')
                last=y1;tallest=max(tallest,px)
            profiles[name].append(tallest)
    # Treat legitimate caption-free gaps separately from frames inside authored cues.
    rows=[]
    for cue in cues:
        idx=[i for i in range(expected_frames) if cue['start']<= (i+.5)/30 <cue['end']]
        require(bool(idx),'CUE_WITHOUT_PRESENTED_FRAME')
        vals=[profiles['voice_caption'][i] for i in idx]
        rows.append({**cue,'frames':len(idx),'below14':sum(x<14 for x in vals),'zeroInk':sum(x==0 for x in vals),'minPx':min(vals),'maxPx':max(vals)})
    totals={name:{'below14':sum(v<14 for v in values),'zeroInk':sum(v==0 for v in values),
                  'minPx':min(values),'maxPx':max(values)} for name,values in profiles.items()}
    return {'schema':'em.lane4.decoded-mobile-join.v1','filmSha256':expected_film_sha,
      'srtSha256':expected_srt_sha,'actualFrameCountClaimedByReceipt':expected_frames,
      'sourceFramePixelDecodeReplayedByThisJoin':False,'receiptRowsIndividuallyValidated':expected_frames,
      'thresholdPxAt320':14,'thresholdStatus':'EXPLORATORY_NEGATIVE_SCREEN_NOT_HUMAN_STANDARD',
      'regions':totals,'cueCount':len(rows),'cueFrames':sum(r['frames'] for r in rows),
      'cueFramesBelow14':sum(r['below14'] for r in rows),
      'fullyLowCues':[r for r in rows if r['below14']==r['frames']],
      'cues':rows,'verdict':'HOLD_RESEARCH_ONLY','humanPhoneVerified':False,
      'scienceApproved':False,'independentlyQualifiedReviewed':False,'mayPublish':False}

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser()
    for a in ('report','srt','expected-film-sha','expected-srt-sha','expected-frames','output'):
        p.add_argument('--'+a,required=True)
    x=p.parse_args()
    res=validate(json.loads(Path(x.report).read_text()),Path(x.srt).read_bytes(),expected_film_sha=x.expected_film_sha,expected_srt_sha=x.expected_srt_sha,expected_frames=int(x.expected_frames))
    out=Path(x.output)
    require(not out.exists() and not out.is_symlink(),'REFUSE_OUTPUT_OVERWRITE_OR_ALIAS')
    out.write_text(json.dumps(res,indent=2,sort_keys=True)+'\n')
    print(json.dumps({k:res[k] for k in ('verdict','actualFrameCountClaimedByReceipt','cueCount','cueFrames','cueFramesBelow14','fullyLowCues')},indent=2))