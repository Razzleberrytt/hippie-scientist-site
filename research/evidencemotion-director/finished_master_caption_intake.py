#!/usr/bin/env python3
"""Lane5 research-only real-file master/caption proof intake; never publishes.

Checks package integrity and SAME FILM provenance. A source caption report may
be sound as a prior receipt but must NOT attest a different current master.
"""
import hashlib
import json
import re
import subprocess
import zipfile
from pathlib import Path

HEX = re.compile(r'[a-f0-9]{64}\Z')
MEMBERS = ('MASTER_AUTOMATED_QA.json', 'REAL_CAPTION_QA.json',
           'INDEPENDENT_SOURCE_ASR.json', 'Phenibut_REAL_MFA_WORD_CAPTIONS.srt',
           'ORIGINAL_NARRATOR_PROVENANCE/Phenibut_ORIGINAL_KOKORO.wav')


def hold(reason):
    raise ValueError('MASTER_CAPTION_INTAKE_HOLD:' + reason)


def physical_sha(file):
    p = Path(file)
    if p.is_symlink() or any(x.is_symlink() for x in p.parents) or not p.is_file():
        hold('MISSING_OR_UNSAFE_FILE')
    h = hashlib.sha256()
    with p.open('rb') as fh:
        for c in iter(lambda: fh.read(1024*1024), b''):
            h.update(c)
    return h.hexdigest()


def sha_data(data):
    return hashlib.sha256(data).hexdigest()


def read_json_bytes(data):
    def no_dupes(items):
        o = {}
        for k, v in items:
            if k in o: hold('DUPLICATE_JSON_KEY')
            o[k] = v
        return o
    try:
        return json.loads(data.decode('utf8'), object_pairs_hook=no_dupes,
                          parse_constant=lambda _:hold('NONFINITE_JSON_VALUE'))
    except (UnicodeError, json.JSONDecodeError):
        hold('INVALID_JSON')


def srt_cues(raw):
    try:
        text = raw.decode('utf8').replace('\r\n','\n')
    except UnicodeError:
        hold('BAD_SRT_ENCODING')
    chunks = [x.strip().splitlines() for x in re.split(r'\n\s*\n',text.strip()) if x.strip()]
    answer = []
    for i, lines in enumerate(chunks, 1):
        if len(lines) < 3 or lines[0] != str(i):
            hold('SRT_SEQUENCE_OR_MISSING_TEXT')
        m = re.fullmatch(r'(\d\d):(\d\d):(\d\d),(\d\d\d) --> (\d\d):(\d\d):(\d\d),(\d\d\d)',lines[1])
        if not m: hold('SRT_TIMECODE_INVALID')
        a = list(map(int,m.groups()))
        st = a[0]*3600+a[1]*60+a[2]+a[3]/1000
        en = a[4]*3600+a[5]*60+a[6]+a[7]/1000
        if not 0 <= st < en <= 90 or (answer and st < answer[-1][1]):
            hold('SRT_TIMELINE_INVALID')
        answer.append((st,en,' '.join(lines[2:]).strip()))
    if not answer: hold('EMPTY_SRT')
    return answer


def inspect(*, archive, archive_sha, movie, movie_sha):
    for pin in (archive_sha, movie_sha):
        if type(pin) is not str or not HEX.fullmatch(pin):
            hold('EXTERNAL_EXACT_SHA_REQUIRED')
    if physical_sha(archive) != archive_sha or physical_sha(movie) != movie_sha:
        hold('EXTERNAL_SHA_MISMATCH')
    with zipfile.ZipFile(archive) as z:
        names = z.namelist()
        if len(names) != len(set(names)) or any('/../' in '/'+n or n.startswith('/') for n in names):
            hold('DUPLICATE_OR_TRAVERSING_ZIP_MEMBER')
        if len(names)>64 or sum(i.file_size for i in z.infolist())>100*1024*1024:
            hold('UNBOUNDED_ARCHIVE')
        if z.testzip() is not None: hold('ZIP_CRC_FAILURE')
        if not set(MEMBERS).issubset(names): hold('MISSING_PROVENANCE_MEMBER')
        master = read_json_bytes(z.read('MASTER_AUTOMATED_QA.json'))
        caption = read_json_bytes(z.read('REAL_CAPTION_QA.json'))
        asr = read_json_bytes(z.read('INDEPENDENT_SOURCE_ASR.json'))
        if any(type(x) is not dict for x in (master,caption,asr)):
            hold('QA_JSON_WRONG_SHAPE')
        film_name=master.get('video')
        if (not isinstance(film_name,str) or '/' in film_name or '\\' in film_name
                or film_name not in names or master.get('sha256') != movie_sha):
            hold('MASTER_METADATA_NOT_BOUND_TO_CURRENT_MOVIE')
        if sha_data(z.read(film_name)) != movie_sha:
            hold('ARCHIVED_FILM_NOT_SAME_AS_STANDALONE')
        if master.get('postingApproval') is not False or master.get('published') is not False:
            hold('FORGED_PUBLICATION_APPROVAL')
        wavsha = sha_data(z.read('ORIGINAL_NARRATOR_PROVENANCE/Phenibut_ORIGINAL_KOKORO.wav'))
        if (wavsha != master.get('narrator_source_wav_sha256')
                or wavsha != caption.get('exact_wav_sha256')
                or wavsha != asr.get('source_wav_sha256')
                or caption.get('mayPublish') is not False
                or asr.get('mayPublish') is not False):
            hold('NARRATOR_PROVENANCE_OR_RELEASE_FLAG_INVALID')
        cues = srt_cues(z.read('Phenibut_REAL_MFA_WORD_CAPTIONS.srt'))
        rows=caption.get('cues')
        if (type(rows) is not list or len(rows)!=len(cues)
                or caption.get('caption_groups') != len(cues)
                or type(caption.get('word_count')) is not int):
            hold('CAPTION_QA_INCOMPLETE_OR_UNSCOPED')
        word_ids=[]
        for i, (line,row) in enumerate(zip(cues,rows)):
            if (not isinstance(row,dict) or type(row.get('words')) is not list
                    or any(type(w) is not int for w in row['words'])
                    or any(w<0 for w in row['words'])
                    or abs(row.get('start',-100)-line[0])>0.001
                    or abs(row.get('end',-100)-line[1])>0.001
                    or row.get('text')!=line[2]):
                hold('CAPTION_QA_AND_SRT_DISAGREE')
            word_ids+=row['words']
        if word_ids != list(range(caption['word_count'])):
            hold('CAPTION_WORD_INVENTORY_GAP_OR_DUPLICATE')
        stale = caption.get('final_mp4_sha256') != movie_sha or caption.get('final_file') != film_name
        if not isinstance(caption.get('final_mp4_sha256'),str) or not HEX.fullmatch(caption['final_mp4_sha256']):
            hold('CAPTION_FINAL_FILM_SHA_INVALID')
        # Physical codec/duration check, independent of the optimistic producer JSON.
        try:
            x=subprocess.run(['ffprobe','-v','error','-show_streams','-of','json',str(movie)],
                capture_output=True,text=True,check=True,timeout=30)
            streams=json.loads(x.stdout)['streams']
            if (len(streams)!=2 or streams[0].get('codec_name')!='h264'
                    or streams[1].get('codec_name')!='aac'
                    or (int(streams[0]['width']),int(streams[0]['height']),int(streams[0]['nb_frames']))
                    != (int(master['width']),int(master['height']),int(master['frame_count']))):
                hold('MASTER_AV_METADATA_MISMATCH')
            subprocess.run(['ffmpeg','-nostdin','-v','error','-xerror','-err_detect','explode',
                '-i',str(movie),'-map','0:v:0','-map','0:a:0','-f','null','-'],
                stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,check=True,timeout=120)
        except (OSError,subprocess.SubprocessError,KeyError,TypeError,ValueError) as exc:
            if str(exc).startswith('MASTER_CAPTION_INTAKE_HOLD:'): raise
            hold('FULL_PHYSICAL_AV_REVIEW_FAILED:'+type(exc).__name__)
    if physical_sha(archive)!=archive_sha or physical_sha(movie)!=movie_sha:
        hold('INPUT_MUTATED_DURING_REVIEW')
    return {'schema':'ths-em-lane5-full-master-caption-provenance-research-v1',
            'archiveSha256':archive_sha,'filmSha256':movie_sha,
            'filmPackageAndStandaloneExactBytesMatch':True,'fullOriginalMovieVideoAudioDecoded':True,
            'originalNarratorSourceSha256':wavsha,
            'captionGroupCount':len(cues),'wordCount':caption['word_count'],
            'originalCaptionSrtAndReportInternalConsistency':True,
            'captionProofReferencesCurrentFilm':not stale,
            'captionProofFilmSha256':caption['final_mp4_sha256'],
            'captionProofFilmName':caption['final_file'],
            'sourceAsrIsNotQualifiedPhonetics':True,
            'decision':'STALE_CAPTION_FILM_PROOF_RELEASE_HOLD' if stale else 'CURRENT_RECEIPT_TECHNICAL_ONLY_RELEASE_HOLD',
            'phoneAndIndependentPhoneticsCraftScienceApproved':False,
            'mayPublish':False,'firstExcellentMasterAccepted':False,'fiveRenderStreakAccepted':False}
