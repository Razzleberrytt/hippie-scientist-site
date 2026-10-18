#!/usr/bin/env python3
"""Research-only negative review of exact-film observed visual focus vs source SRT.

Requires externally pinned input report bytes, original film bytes and source SRT.
Does NOT independently remeasure pixels: producer's physical decoded-frame auditor
must be separately replayed. Literal cue/label correspondence is only a REVIEW
heuristic; never implies semantic falsehood, timing truth or artistic approval.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
from pathlib import Path

SCHEMA='ths-lane3-source-pinned-caption-focus-negative-v1'
SOURCE_SCHEMA='ths-lane3-scene6-decoded-focus-narration-negative-v1'
GENERAL_SCHEMA='ths-lane3-decoded-focus-sequence-v1'
FPS=30
HASH=re.compile(r'[0-9a-f]{64}\Z')
SRT_TIME=re.compile(r'(\d\d):(\d\d):(\d\d),(\d{3})\Z')
TOKEN=re.compile(r'[^\W_]+',re.UNICODE)

class FocusHold(ValueError):pass

def sha256_file(path,*,limit=600_000_000):
    # Bound reads even when an input grows after its initial filesystem stat.
    h=hashlib.sha256();total=0
    with Path(path).open('rb') as f:
        while True:
            block=f.read(min(1<<20,limit-total+1))
            if not block:break
            total+=len(block)
            if total>limit:raise FocusHold('SOURCE_EXCEEDS_BYTE_LIMIT')
            h.update(block)
    return h.hexdigest()

def read_bounded_bytes(path,limit):
    # Open once and retain the exact bounded bytes that will be evaluated.
    # Never hash a pathname separately and then parse different pathname bytes.
    with Path(path).open('rb') as f:
        raw=f.read(limit+1)
    if len(raw)>limit:raise FocusHold('SOURCE_EXCEEDS_BYTE_LIMIT')
    return raw

def decode_source_utf8(raw):
    try:
        return raw.decode('utf8')
    except UnicodeDecodeError as e:
        raise FocusHold('SOURCE_DOCUMENT_INVALID') from e

def read_bounded_utf8(path,limit):
    return decode_source_utf8(read_bounded_bytes(path,limit))

def ms(t):
    m=SRT_TIME.fullmatch(t)
    if not m:raise FocusHold('SRT_TIMECODE_INVALID')
    h,mn,sec,millis=map(int,m.groups())
    if mn>59 or sec>59:raise FocusHold('SRT_TIMECODE_INVALID')
    return 1000*(h*3600+mn*60+sec)+millis

def parse_srt(text):
    out=[]
    for block in re.split(r'\n\s*\n',text.replace('\r\n','\n').strip()):
        rows=block.split('\n')
        if len(rows)<3 or not rows[0].strip().isdigit():raise FocusHold('SRT_BLOCK_INVALID')
        match=re.fullmatch(r'(\S+) --> (\S+)',rows[1])
        if not match:raise FocusHold('SRT_BLOCK_INVALID')
        start,end=ms(match[1]),ms(match[2])
        if end<=start or (out and start<out[-1]['endMs']):raise FocusHold('SRT_TIMELINE_INVALID')
        cue={'cueId':int(rows[0]),'startMs':start,'endMs':end,'text':' '.join(rows[2:])}
        if out and cue['cueId']<=out[-1]['cueId']:raise FocusHold('SRT_CUE_ID_INVALID')
        out.append(cue)
    if not out:raise FocusHold('NO_ORIGINAL_SRT_CUES')
    return out

def exact_words(label,phrase):
    phrase_tokens=[x.casefold() for x in TOKEN.findall(phrase)]
    label_tokens=[x.casefold() for x in TOKEN.findall(label)]
    return bool(label_tokens) and any(phrase_tokens[i:i+len(label_tokens)]==label_tokens for i in range(len(phrase_tokens)-len(label_tokens)+1))

def validate_report(report, source_cues):
    if not isinstance(report,dict) or report.get('schema') not in (SOURCE_SCHEMA,GENERAL_SCHEMA):
        raise FocusHold('SOURCE_AUDIT_SCHEMA_INVALID')
    span=report.get('sceneFrameRangeInclusive')
    if (not isinstance(span,list) or len(span)!=2 or
            any(type(x) is not int for x in span) or not 0<=span[0]<=span[1]<5400):
        raise FocusHold('SOURCE_AUDIT_FRAME_INTERVAL_INVALID')
    f0,f1=span
    if (report.get('mayPublish') is not False or
            type(report.get('decodedSceneFrames')) is not int or
            report['decodedSceneFrames']!=f1-f0+1):
        raise FocusHold('SOURCE_AUDIT_RESEARCH_OR_FRAME_CONTRACT_INVALID')
    if report['schema']==SOURCE_SCHEMA and span!=[718,844]:
        raise FocusHold('SOURCE_AUDIT_LEGACY_SCENE6_RANGE_CHANGED')
    if report['schema']==GENERAL_SCHEMA and report.get('framesPerSecond')!=FPS:
        raise FocusHold('SOURCE_AUDIT_FRAME_RATE_UNSUPPORTED')
    runs=report.get('focusRuns')
    if not isinstance(runs,list) or not runs:raise FocusHold('SOURCE_FOCUS_RUNS_MISSING')
    labels=set()
    prev=f0-1
    for run in runs:
        if not isinstance(run,dict) or type(run.get('firstFrame')) is not int or type(run.get('lastFrame')) is not int:
            raise FocusHold('SOURCE_FOCUS_RUN_INVALID')
        a,b=run['firstFrame'],run['lastFrame']
        if a!=prev+1 or b<a or run.get('inclusiveFrames')!=b-a+1:
            raise FocusHold('SOURCE_FOCUS_RUN_GAP_OVERLAP_OR_COUNT')
        label=run.get('focus')
        if label is not None:
            if not isinstance(label,str) or not label.strip() or len(label)>80 or label=='AMBIGUOUS':
                raise FocusHold('SOURCE_FOCUS_LABEL_INVALID')
            labels.add(label)
        prev=b
    if prev!=f1:raise FocusHold('SOURCE_FOCUS_RUN_GAP_OVERLAP_OR_COUNT')
    refs=report.get('cueEvidence')
    if not isinstance(refs,list) or not refs:
        raise FocusHold('SOURCE_CUE_EVIDENCE_MISSING')
    source_map={c['cueId']:c for c in source_cues}
    if any(not isinstance(c,dict) or type(c.get('cueId')) is not int for c in refs):
        raise FocusHold('SOURCE_CUE_ID_INVALID')
    if len(refs)!=len({c['cueId'] for c in refs}):
        raise FocusHold('SOURCE_CUE_DUPLICATE')
    # A report hash authenticates the report's bytes, not its completeness.
    # Require precisely every original SRT cue containing at least one actual
    # scene-frame center; a pinned but truncated report must not pass review.
    overlapping_ids={c['cueId'] for c in source_cues if any(
        (2*n+1)*1000>=2*FPS*c['startMs'] and
        (2*n+1)*1000<2*FPS*c['endMs'] for n in range(f0,f1+1))}
    if {c['cueId'] for c in refs}!=overlapping_ids:
        raise FocusHold('SOURCE_CUE_EVIDENCE_INCOMPLETE_OR_EXTRA')
    for ref in refs:
        if not isinstance(ref,dict):raise FocusHold('SOURCE_CUE_EVIDENCE_MISSING')
        src=source_map.get(ref.get('cueId'))
        if not src or (ref.get('originalText'),ref.get('declaredStartMs'),ref.get('declaredEndMs'))!=(src['text'],src['startMs'],src['endMs']):
            raise FocusHold('SOURCE_CAPTION_CUE_IDENTITY_MISMATCH')
    return runs,refs,labels

def evaluate(report, source_cues):
    runs,refs,labels=validate_report(report,source_cues)
    findings=[]
    per_cue=[]
    # Require actual frame-center membership in the originally declared SRT
    # time group, not float rounding, not invented word-level onset estimates.
    f0,f1=report['sceneFrameRangeInclusive']
    for ref in refs:
        start,end=ref['declaredStartMs'],ref['declaredEndMs']
        frames=[n for n in range(f0,f1+1) if (2*n+1)*1000>=2*FPS*start and (2*n+1)*1000<2*FPS*end]
        if not frames or ref.get('frameSpanInclusive')!=[frames[0],frames[-1]]:
            raise FocusHold('SOURCE_CUE_FRAME_BOUNDARY_DISAGREES')
        focus={label:0 for label in labels};focus['AMBIGUOUS']=0
        for run in runs:
            lo=max(run['firstFrame'],frames[0]);hi=min(run['lastFrame'],frames[-1])
            if hi>=lo:focus[run['focus'] if run['focus'] is not None else 'AMBIGUOUS']+=hi-lo+1
        if sum(focus.values())!=len(frames):raise FocusHold('SOURCE_CUE_FRAME_COVERAGE_DISAGREES')
        recorded=ref.get('physicalFocusFrames')
        if recorded!=focus:raise FocusHold('SOURCE_CUE_RECORDED_PHYSICAL_COUNTS_DISAGREE')
        present=sorted(label for label in labels if exact_words(label,ref['originalText']))
        if not isinstance(ref.get('explicitVerbatimCardWordsInPhrase'),list) or sorted(ref['explicitVerbatimCardWordsInPhrase'])!=present:
            raise FocusHold('SOURCE_CUE_LITERAL_WORDS_DISAGREE')
        # Warn but NEVER declare the source science or visual metaphor wrong.
        for label in present:
            if focus[label]==0:
                findings.append({'cueId':ref['cueId'],'kind':'SPOKEN_LITERAL_CARD_NOT_FOCUSED_IN_CAPTION_WINDOW','visualRole':label,'frames':len(frames)})
        for label in labels:
            if label not in present and focus[label]*2>len(frames):
                findings.append({'cueId':ref['cueId'],'kind':'MAJORITY_FOCUS_WITHOUT_LITERAL_CARD_WORD','visualRole':label,'focusedFrames':focus[label],'cueFrames':len(frames)})
        per_cue.append({'cueId':ref['cueId'],'captionText':ref['originalText'],
            'frames':len(frames),'literalLabelsInCue':present,'recomputedFocusFrames':focus})
    return {'schema':SCHEMA,'status':'RESEARCH_SEMANTIC_FOCUS_REVIEW_HOLD',
        'exactFilmSha256':report['exactFilmSha256'],
        'exactSrtSha256':report['exactSrtSha256'],
        'cueResults':per_cue,'findings':findings,
        'findingsAreOnlyLexicalReviewCandidates':True,
        'observationsNotIndependentlyReDecodedByThisTool':True,
        'needsVerifiedOriginalWordOnsets':True,'needsEditorialSourceMapping':True,
        'scienceApproved':False,'phoneApproved':False,'excellentCertified':False,
        'productionEligible':False,'mayPublish':False,'atomicCreditAwarded':0}

def audit(*,report_path,expected_report_sha,film_path,srt_path):
    for x in (report_path,film_path,srt_path):
        if not Path(x).is_file() or Path(x).is_symlink():raise FocusHold('SOURCE_FILE_MISSING_OR_SYMLINK')
    if not isinstance(expected_report_sha,str) or not HASH.fullmatch(expected_report_sha):
        raise FocusHold('EXTERNALLY_PINNED_REPORT_SHA_REQUIRED')
    # Hash the precise buffer consumed by JSON parsing, not a previous read.
    report_bytes=read_bounded_bytes(report_path,1_000_000)
    if hashlib.sha256(report_bytes).hexdigest()!=expected_report_sha:
        raise FocusHold('PINNED_AUDIT_REPORT_CHANGED')
    try:
        report=json.loads(decode_source_utf8(report_bytes))
    except (ValueError,UnicodeError) as e:
        raise FocusHold('SOURCE_DOCUMENT_INVALID') from e
    if not isinstance(report,dict):
        raise FocusHold('SOURCE_DOCUMENT_INVALID')
    # Read and digest the exact SRT bytes BEFORE parsing them; a separate
    # pathname hash could refer to different transient bytes.
    srt_bytes=read_bounded_bytes(srt_path,100_000)
    if (not HASH.fullmatch(str(report.get('exactSrtSha256',''))) or
            hashlib.sha256(srt_bytes).hexdigest()!=report['exactSrtSha256']):
        raise FocusHold('PINNED_FILM_OR_SRT_BYTES_CHANGED')
    try:
        source_cues=parse_srt(decode_source_utf8(srt_bytes))
    except (ValueError,UnicodeError) as e:
        raise FocusHold('SOURCE_DOCUMENT_INVALID') from e
    # The film is not decoded by this lexical review; still pin its actual
    # source hash and check later for any on-disk mutation during the review.
    if (not HASH.fullmatch(str(report.get('exactFilmSha256',''))) or
            sha256_file(film_path,limit=600_000_000)!=report['exactFilmSha256']):
        raise FocusHold('PINNED_FILM_OR_SRT_BYTES_CHANGED')
    result=evaluate(report,source_cues)
    for path, expected, limit in ((report_path,expected_report_sha,1_000_000),
                                  (film_path,result['exactFilmSha256'],600_000_000),
                                  (srt_path,result['exactSrtSha256'],100_000)):
        if sha256_file(path,limit=limit)!=expected:
            raise FocusHold('SOURCE_CHANGED_DURING_REVIEW')
    result['sourceAuditReportSha256']=expected_report_sha
    return result

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--report',type=Path,required=True)
    p.add_argument('--report-sha256',required=True)
    p.add_argument('--film',type=Path,required=True)
    p.add_argument('--original-srt',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    a=p.parse_args()
    if a.out.exists() or a.out.resolve() in {a.report.resolve(),a.film.resolve(),a.original_srt.resolve()}:
        raise FocusHold('REPORT_OUTPUT_ALIASES_SOURCE_OR_ALREADY_EXISTS')
    v=audit(report_path=a.report,expected_report_sha=a.report_sha256,film_path=a.film,srt_path=a.original_srt)
    # Open exclusively *after* the potentially long film hash/decode review.
    # A preflight exists() check alone has a TOCTOU overwrite race.
    try:
        with a.out.open('x',encoding='utf8') as output:
            output.write(json.dumps(v,indent=2)+'\n')
    except FileExistsError as e:
        raise FocusHold('REPORT_OUTPUT_ALIASES_SOURCE_OR_ALREADY_EXISTS') from e
    print(json.dumps({'status':v['status'],'reviewFindings':len(v['findings']),'mayPublish':False}))
if __name__=='__main__':main()
