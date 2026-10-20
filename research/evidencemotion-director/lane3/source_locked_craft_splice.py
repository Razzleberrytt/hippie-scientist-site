#!/usr/bin/env python3
"""Opt-in source-bound *research* splice of an independently supplied craft scene.

No dependency on a TTS/video generator. The manifest's SHA must be supplied by
an independent caller; a manifest cannot bless itself. Source/video bytes are
verified before execution, archived AAC remains stream-copied, and no artistic,
scientific, phone or publication approval is ever produced by this script.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
from decimal import Decimal, InvalidOperation

SCHEMA='ths-lane3-exact-film-splice-research-v1'
SHA=re.compile(r'^[0-9a-f]{64}$')

class CraftHold(ValueError):
    pass

def digest(p):
    h=hashlib.sha256()
    with open(p,'rb') as f:
        for chunk in iter(lambda: f.read(1<<20),b''):h.update(chunk)
    return h.hexdigest()

def run(args, *, binary=False):
    x=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if x.returncode:
        raise CraftHold('FFMPEG_HOLD: '+x.stderr.decode(errors='replace')[:500])
    return x.stdout if binary else x.stdout.decode()

def media_info(path):
    raw=run(['ffprobe','-v','error','-show_entries',
      'stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,sample_rate,pix_fmt,sample_aspect_ratio',
      '-of','json',str(path)])
    streams=json.loads(raw).get('streams',[])
    video=[s for s in streams if s.get('codec_type')=='video']
    audio=[s for s in streams if s.get('codec_type')=='audio']
    # Reject unrecognized subtitle, data, attachment or secondary tracks:
    # the editor maps only video+original AAC, so otherwise they are lost.
    if len(video)!=1 or len(audio)>1 or len(streams)!=len(video)+len(audio):
        raise CraftHold('AMBIGUOUS_TRACK_LAYOUT')
    return video[0],audio


def require_square_yuv420_video(stream,label):
    """No silent color-depth or display-aspect rewrite during craft splice."""
    if (stream.get('pix_fmt')!='yuv420p' or
            stream.get('sample_aspect_ratio')!='1:1'):
        raise CraftHold(label+'_PIXEL_FORMAT_OR_ASPECT_MISMATCH')
    return True

def trusted_manifest(path,expected_sha):
    if not isinstance(expected_sha,str) or not SHA.fullmatch(expected_sha):
        raise CraftHold('EXTERNAL_MANIFEST_SHA_REQUIRED')
    if digest(path)!=expected_sha:
        raise CraftHold('EXTERNAL_MANIFEST_SHA_MISMATCH')
    try:
        m=json.loads(Path(path).read_text('utf-8'))
    except (ValueError,UnicodeError) as exc:
        raise CraftHold('INVALID_MANIFEST_JSON') from exc
    needed={
      'schema':SCHEMA,'researchOnly':True,'mayPublish':False,
      'scienceApproved':False,'craftApproved':False,'phonePlaybackApproved':False,
      'sourceFilmSha256':str,'craftSceneSha256':str,
      'frames':int,'width':int,'height':int,'fps':int,
      'startFrame':int,'endFrameExclusive':int,
      'computedSpokenOnsetSec':float,'negationSpokenOnsetSec':float,
      'originalNarrationSha256':str
    }
    if not isinstance(m,dict):raise CraftHold('INVALID_MANIFEST_SHAPE')
    for key,expected in needed.items():
        value=m.get(key)
        if type(expected) is type and expected in (int,float,str):
            if type(value) is not expected:raise CraftHold('INVALID_FIELD_'+key)
        elif value!=expected:raise CraftHold('INVALID_FIELD_'+key)
    for key in ('sourceFilmSha256','craftSceneSha256','originalNarrationSha256'):
        if not SHA.fullmatch(m[key]):raise CraftHold('INVALID_SHA_'+key)
    start,end,count=m['startFrame'],m['endFrameExclusive'],m['frames']
    if not (m['fps']==30 and m['width']==1080 and m['height']==1920 and
            0<=start<end<=count and end-start>=2 and count<=5400):
        raise CraftHold('INVALID_FILM_GEOMETRY')
    # Manifest assertions are intent only, NEVER evidence of what the film shows.
    if not(start/30 <= m['computedSpokenOnsetSec'] < m['negationSpokenOnsetSec'] < end/30):
        raise CraftHold('CUE_OUTSIDE_OWNED_SHOT')
    return m

def require_exact_cfr_frame_grid(path,expected_frames):
    """Decode frame presentation timestamps, not a nominal r_frame_rate label.

    A VFR input can advertise 30/1 and still silently delay a scientific
    reveal relative to the unchanged narration. This is a negative admission
    test only; it cannot certify the semantics of decoded pixels or speech.
    """
    try:
        raw=run(['ffprobe','-v','error','-select_streams','v:0',
                 '-show_frames','-show_entries','frame=best_effort_timestamp_time',
                 '-of','json',str(path)])
        rows=json.loads(raw).get('frames')
    except (ValueError,TypeError,OSError) as exc:
        raise CraftHold('DECODED_FRAME_TIMESTAMPS_UNAVAILABLE') from exc
    if not isinstance(rows,list) or len(rows)!=expected_frames:
        raise CraftHold('DECODED_FRAME_TIMESTAMP_COUNT_MISMATCH')
    # Actual 30fps native film uses a 1/15360 timescale. Allow <=1.5ms
    # rounding across different legal MP4 timescales, never a whole frame.
    for index,row in enumerate(rows):
        try:
            observed=Decimal(str(row['best_effort_timestamp_time']))
        except (KeyError,ValueError,TypeError,InvalidOperation) as exc:
            raise CraftHold('DECODED_FRAME_TIMESTAMPS_UNAVAILABLE') from exc
        expected=Decimal(index)/Decimal(30)
        if not observed.is_finite() or abs(observed-expected)>Decimal('0.0015'):
            raise CraftHold('NON_CFR_OR_SHIFTED_FRAME_PTS')
    return expected_frames

def preflight(source,scene,manifest):
    if digest(source)!=manifest['sourceFilmSha256']:
        raise CraftHold('SOURCE_FILM_REVISION_MISMATCH')
    if digest(scene)!=manifest['craftSceneSha256']:
        raise CraftHold('REPLACEMENT_SCENE_REVISION_MISMATCH')
    a,aa=media_info(source);b,bb=media_info(scene)
    props=(manifest['width'],manifest['height'],f"{manifest['fps']}/1")
    for name,v,frames in [('SOURCE',a,manifest['frames']),
                          ('CRAFT_SCENE',b,manifest['endFrameExclusive']-manifest['startFrame'])]:
        if (v.get('codec_name')!='h264' or
          (v.get('width'),v.get('height'),v.get('r_frame_rate'))!=props or
          str(v.get('nb_frames'))!=str(frames)):
            raise CraftHold(name+'_CODEC_FRAME_OR_SIZE_MISMATCH')
    require_square_yuv420_video(a,'SOURCE')
    require_square_yuv420_video(b,'CRAFT_SCENE')
    if len(aa)!=1 or aa[0].get('codec_name')!='aac' or aa[0].get('sample_rate')!='24000':
        raise CraftHold('SOURCE_ORIGINAL_AAC_REQUIRED')
    if bb:raise CraftHold('REPLACEMENT_MUST_BE_SILENT')
    require_exact_cfr_frame_grid(source,manifest['frames'])
    require_exact_cfr_frame_grid(scene,manifest['endFrameExclusive']-manifest['startFrame'])
    return True

def aac_sha(path):
    data=run(['ffmpeg','-v','error','-i',str(path),'-map','0:a:0',
              '-c:a','copy','-f','adts','-'],binary=True)
    return hashlib.sha256(data).hexdigest()


def original_aac_packet_timeline(path):
    """Actual stream-copied AAC packet timestamps, not elementary audio bytes."""
    try:
        raw=run(['ffprobe','-v','error','-select_streams','a:0',
                 '-show_packets','-show_entries',
                 'packet=pts_time,dts_time,duration_time',
                 '-of','json',str(path)])
        rows=json.loads(raw).get('packets')
    except (OSError,ValueError,TypeError) as exc:
        raise CraftHold('AAC_PACKET_TIMELINE_UNAVAILABLE') from exc
    if not isinstance(rows,list) or not rows:
        raise CraftHold('AAC_PACKET_TIMELINE_UNAVAILABLE')
    timeline=[]
    for packet in rows:
        if not isinstance(packet,dict):
            raise CraftHold('AAC_PACKET_TIMELINE_UNAVAILABLE')
        fields=[]
        for key in ('pts_time','dts_time','duration_time'):
            try:
                value=Decimal(str(packet[key]))
            except (KeyError,InvalidOperation,TypeError,ValueError) as exc:
                raise CraftHold('AAC_PACKET_TIMELINE_UNAVAILABLE') from exc
            if not value.is_finite():
                raise CraftHold('AAC_PACKET_TIMELINE_UNAVAILABLE')
            # Max research film is 5400/30 = 180s. Leave generous room
            # for AAC encoder priming / container offsets, never centuries.
            if abs(value)>Decimal('240'):
                raise CraftHold('AAC_PACKET_TIMESTAMP_OUT_OF_BOUNDS')
            fields.append(value)
        if fields[2]<=0 or fields[2]>Decimal('1'):
            raise CraftHold('AAC_PACKET_DURATION_INVALID')
        timeline.append(tuple(fields))
    return timeline


def audit_original_aac_timing(source,output):
    """Reject soundtrack offset/drift even when AAC payload hashes match.

    This compares actual AAC packet PTS, DTS and duration on the source and
    rewrapped output; finite 1.5ms tolerance handles legal MP4 tick rounding.
    It is not word-level forced alignment or human listening approval.
    """
    original=original_aac_packet_timeline(source)
    finished=original_aac_packet_timeline(output)
    if len(original)!=len(finished):
        raise CraftHold('ORIGINAL_AAC_PACKET_COUNT_CHANGED')
    maximum=Decimal(0)
    for src_pkt,out_pkt in zip(original,finished):
        for a,b in zip(src_pkt,out_pkt):
            maximum=max(maximum,abs(a-b))
            if abs(a-b)>Decimal('0.0015'):
                raise CraftHold('ORIGINAL_AAC_PACKET_TIMING_CHANGED')
    return {
      'packetsCompared':len(original),
      'firstPacketPtsSec':str(original[0][0]),
      'lastPacketPtsSec':str(original[-1][0]),
      'maxTimestampOrDurationDriftMs':float(maximum*1000),
      'toleranceMs':1.5,
      'metric':'independent-ffprobe-AAC-packet-PTS-DTS-duration',
      'limits':'AAC timeline preserved relative to source; not independent speech timing or audible sync approval'
    }


def _decoded_rgb_frames(path,width=96,height=170):
    """Read each independently decoded original-resolution frame through RGB downscale.

    Strict FFmpeg -xerror means concealed damaged H264 macroblocks cannot
    pass merely because an ordinary decoder exits 0 after printing warnings.
    This is a conservative negative filter, NOT pixel-identical proof or a
    creative/clinical approval. Frame count and order are still checked.
    """
    command=['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-xerror','-i',str(path),
             '-map','0:v:0','-vf',f'scale={width}:{height}:flags=area,format=rgb24',
             '-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgb24','-']
    process=subprocess.Popen(command,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
    frame_size=width*height*3
    try:
        while True:
            payload=process.stdout.read(frame_size)
            if not payload:break
            if len(payload)!=frame_size:
                raise CraftHold('INCOMPLETE_DECODED_FRAME')
            yield payload
        if process.wait()!=0:
            raise CraftHold('DECODED_VIDEO_STREAM_FAILED')
    finally:
        if process.poll() is None:
            process.kill()
            process.wait()
        if process.stdout:process.stdout.close()

def audit_outside_scene_frames(source,output,manifest,*,decoder=_decoded_rgb_frames):
    """Fail closed if ANY out-of-edit frame changes beyond measured tolerance.

    Downsampled RGB is intentionally used only as a negative filter; a pass
    cannot establish no semantic/caption change at native resolution.
    """
    start,end,count=(manifest[k] for k in ('startFrame','endFrameExclusive','frames'))
    if not(0<=start<end<=count):raise CraftHold('UNTRUSTED_FRAME_INTERVAL')
    originals=decoder(source)
    result_frames=decoder(output)
    outside_count=0;worst=0.0;sum_mean=0.0
    try:
        for frame_no in range(count):
            original=next(originals,None);updated=next(result_frames,None)
            if not isinstance(original,bytes) or not isinstance(updated,bytes) or len(original)!=len(updated) or len(original)==0:
                raise CraftHold('INCOMPLETE_DECODED_FRAME_SEQUENCE')
            if start<=frame_no<end:continue
            diff=sum(abs(o-u) for o,u in zip(original,updated))/len(original)
            outside_count+=1;sum_mean+=diff;worst=max(worst,diff)
            if diff>0.5:
                raise CraftHold('OUTSIDE_CRAFT_SCENE_VISUAL_DRIFT')
        if next(originals,None) is not None or next(result_frames,None) is not None:
            raise CraftHold('UNEXPECTED_EXTRA_DECODED_FRAMES')
    finally:
        for stream in (originals,result_frames):
            if hasattr(stream,'close'):stream.close()
    if outside_count!=count-(end-start):
        raise CraftHold('INCOMPLETE_OUTSIDE_FRAME_COVERAGE')
    mean=sum_mean/outside_count if outside_count else 0
    if mean>0.25:
        raise CraftHold('OUTSIDE_CRAFT_SCENE_MEAN_VISUAL_DRIFT')
    return {'framesComparedOutsideScene':outside_count,
      'decodedFramesEachFilm':count,'outsideFrameMeanAbsRgb255':round(mean,6),
      'outsideFrameMaxMeanAbsRgb255':round(worst,6),
      'metric':'sequential-full-decode-RGB24-area-resample-96x170',
      'limits':'Low-resolution conservative visual change detector, not pixel identity or artistic approval'}


def audit_inserted_scene_frames(source,scene,output,manifest,*,decoder=_decoded_rgb_frames):
    """Negative-screen the *actual encoded* insertion against its scene asset.

    Independently sequential-decode all three streams at 96x170. Re-encoding
    imposes loss, so this is conservative sampled-RGB evidence, not native
    pixel identity, chemical accuracy, OCR, or a viewer's art approval.
    """
    start,end,count=(manifest[k] for k in ('startFrame','endFrameExclusive','frames'))
    if not (0<=start<end<=count):
        raise CraftHold('UNTRUSTED_INSERTION_INTERVAL')
    original_frames=decoder(source)
    replacement_frames=decoder(scene)
    finished_frames=decoder(output)
    changed=0
    scene_count=0
    max_mismatch=0.0
    sum_mismatch=0.0
    max_edit_difference=0.0
    try:
        for frame_index in range(count):
            original=next(original_frames,None)
            rendered=next(finished_frames,None)
            if (not isinstance(original,bytes) or not isinstance(rendered,bytes) or
                    not original or len(original)!=len(rendered)):
                raise CraftHold('INCOMPLETE_INSERTED_SCENE_DECODE')
            if not start<=frame_index<end:
                continue
            expected=next(replacement_frames,None)
            if (not isinstance(expected,bytes) or len(expected)!=len(rendered)):
                raise CraftHold('INCOMPLETE_REPLACEMENT_SCENE_DECODE')
            mismatch=sum(abs(a-b) for a,b in zip(expected,rendered))/len(rendered)
            max_mismatch=max(max_mismatch,mismatch)
            sum_mismatch+=mismatch
            # Up to two lossy H264 generations at 96x170 area-sampled RGB.
            # This only detects gross substitution/omission/reordering.
            if mismatch>12:
                raise CraftHold('INSERTED_SCENE_DOES_NOT_MATCH_ENCODED_MOVIE')
            change=sum(abs(a-b) for a,b in zip(original,rendered))/len(rendered)
            max_edit_difference=max(max_edit_difference,change)
            if change>1:
                changed+=1
            scene_count+=1
        if (next(replacement_frames,None) is not None or
                next(original_frames,None) is not None or
                next(finished_frames,None) is not None):
            raise CraftHold('EXTRA_INSERTED_SCENE_DECODED_FRAMES')
    finally:
        for stream in (original_frames,replacement_frames,finished_frames):
            if hasattr(stream,'close'):
                stream.close()
    if scene_count!=end-start:
        raise CraftHold('INCOMPLETE_INSERTED_SCENE_COVERAGE')
    if changed==0:
        raise CraftHold('NO_VISIBLE_CRAFT_EDIT_IN_INSERTION_INTERVAL')
    return {
      'insertedFramesCompared':scene_count,
      'visiblyChangedEditedFrames':changed,
      'maxSceneToOutputMeanAbsRgb255':round(max_mismatch,6),
      'meanSceneToOutputMeanAbsRgb255':round(sum_mismatch/scene_count,6),
      'maxEditedSourceToOutputMeanAbsRgb255':round(max_edit_difference,6),
      'metric':'sequential-full-decode-RGB24-area-resample-96x170',
      'limits':'Gross substitution/omission screen; lossy downsampling can hide text and scientific errors; no art approval'
    }


def verify_result(source,output,manifest,*,scene=None):
    v,a=media_info(output)
    if (v.get('codec_name')!='h264' or v.get('width')!=manifest['width'] or
        v.get('height')!=manifest['height'] or v.get('r_frame_rate')!='30/1' or
        str(v.get('nb_frames'))!=str(manifest['frames']) or
        len(a)!=1 or a[0].get('codec_name')!='aac'):
        raise CraftHold('SPLICED_OUTPUT_TECHNICAL_MISMATCH')
    require_square_yuv420_video(v,'SPLICED_OUTPUT')
    require_exact_cfr_frame_grid(output,manifest['frames'])
    original,updated=aac_sha(source),aac_sha(output)
    if original!=updated:raise CraftHold('ORIGINAL_AAC_BYTES_CHANGED')
    audio_timing=audit_original_aac_timing(source,output)
    visual=audit_outside_scene_frames(source,output,manifest)
    inserted=(audit_inserted_scene_frames(source,scene,output,manifest)
              if scene is not None else None)
    return {'schema':SCHEMA,'status':'RESEARCH_ONLY_AUDIO_AND_OUTSIDE_SCENE_VERIFIED',
      'sourceFilmSha256':digest(source),'sceneSha256':manifest['craftSceneSha256'],
      'outputFilmSha256':digest(output),'aacAdtsSha256':original,
      'aacPacketTimelineAudit':audio_timing,
      'frames':manifest['frames'],'startFrame':manifest['startFrame'],
      'endFrameExclusive':manifest['endFrameExclusive'],'outsideSceneVisualAudit':visual,
      'insertedSceneVisualAudit':inserted,
      'scienceApproved':False,'craftApproved':False,
      'phonePlaybackApproved':False,'mayPublish':False,
      'limits':['SAMPLED_SCENE_INSERTION_AND_OUTSIDE_QA_ONLY: not native-pixel identity or source-science/mobile QA',
                'No actual spoken-onset pixel/word audit; manifest times are not proof',
                'No external craft reference shelf or viewer-comprehension authority',
                'Video outside inserted scene was re-encoded, not byte-identical']}


def publish_verified_pair_no_clobber(stage_film,stage_receipt,output,receipt_path,*,trusted_receipt=None):
    """Publish research film+receipt only to fresh names, retaining old files.

    Two files are not an atomic transaction. If receipt publication conflicts
    after the film link, retract only OUR unmodified hard link. A modified or
    replaced film is never deleted, and the failure is reported as a HOLD.
    """
    stage_film,stage_receipt,output,receipt_path=map(Path,
        (stage_film,stage_receipt,output,receipt_path))
    if output.resolve()==stage_film.resolve() or receipt_path.resolve()==stage_receipt.resolve():
        raise CraftHold('REFUSE_STAGING_OUTPUT_ALIAS')
    if output.exists() or output.is_symlink() or receipt_path.exists() or receipt_path.is_symlink():
        raise CraftHold('FRESH_OUTPUT_AND_RECEIPT_REQUIRED')
    staged_sha=digest(stage_film)
    if trusted_receipt is not None:
        # Bind the exact verified movie bytes to the exact research-only
        # receipt before making EITHER publicly named file visible. A valid
        # earlier QA result is not transferable to later-mutated stage bytes.
        if type(trusted_receipt) is not dict:
            raise CraftHold('UNTRUSTED_STAGED_RECEIPT')
        expected_sha=trusted_receipt.get('outputFilmSha256')
        if type(expected_sha) is not str or not SHA.fullmatch(expected_sha) or expected_sha!=staged_sha:
            raise CraftHold('STAGED_FILM_RECEIPT_SHA_MISMATCH')
        for field in ('mayPublish','scienceApproved','craftApproved','phonePlaybackApproved'):
            if trusted_receipt.get(field) is not False:
                raise CraftHold('STAGED_RESEARCH_RELEASE_HOLD_CHANGED')
        try:
            expected_bytes=(json.dumps(trusted_receipt,indent=2,allow_nan=False)+'\n').encode('utf-8')
            receipt_bytes=stage_receipt.read_bytes()
        except (OSError,ValueError,TypeError) as exc:
            raise CraftHold('UNTRUSTED_STAGED_RECEIPT') from exc
        if receipt_bytes!=expected_bytes:
            raise CraftHold('STAGED_RECEIPT_CONTENT_CHANGED')
    linked_film=False
    try:
        os.link(stage_film,output)
        linked_film=True
        os.link(stage_receipt,receipt_path)
    except OSError as exc:
        reason=('OUTPUT_OR_RECEIPT_APPEARED_AFTER_PREFLIGHT'
                if isinstance(exc,FileExistsError) else 'ATOMIC_PAIR_LINK_FAILED')
        if linked_film:
            try:
                a=stage_film.stat()
                b=output.lstat()
                if (a.st_dev,a.st_ino)!=(b.st_dev,b.st_ino) or digest(output)!=staged_sha:
                    raise CraftHold('PARTIAL_FILM_CHANGED_CANNOT_ROLL_BACK') from exc
                output.unlink()
            except OSError as rollback_exc:
                raise CraftHold('PARTIAL_FILM_ROLLBACK_FAILED') from rollback_exc
        raise CraftHold(reason) from exc
    return True


def splice(source,scene,output,manifest):
    preflight(source,scene,manifest)
    output=Path(output)
    protected={Path(source).resolve(),Path(scene).resolve()}
    receipt_path=output.with_suffix('.receipt.json')
    if output.resolve() in protected or receipt_path.resolve() in protected:
        raise CraftHold('REFUSE_OVERWRITE_INPUT')
    if output.exists() or output.is_symlink() or receipt_path.exists() or receipt_path.is_symlink():
        raise CraftHold('FRESH_OUTPUT_AND_RECEIPT_REQUIRED')
    output.parent.mkdir(parents=True,exist_ok=True)
    start,end=manifest['startFrame'],manifest['endFrameExclusive']
    graph=(f'[0:v]trim=end_frame={start},setpts=PTS-STARTPTS,setsar=1[a];'
           '[1:v]setpts=PTS-STARTPTS,setsar=1[b];'
           f'[0:v]trim=start_frame={end},setpts=PTS-STARTPTS,setsar=1[c];'
           '[a][b][c]concat=n=3:v=1:a=0,format=yuv420p[out]')
    # The old deterministic output.stem + '.tmp' path could be an existing
    # source movie. Use a private, same-filesystem directory instead: FFmpeg's
    # -y flag must never be allowed to clobber the externally pinned inputs.
    with tempfile.TemporaryDirectory(prefix='.lane3-splice-',dir=output.parent) as staging:
        temp=Path(staging)/('candidate'+output.suffix)
        staged_receipt=Path(staging)/'candidate.receipt.json'
        run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-xerror','-y','-i',str(source),
           '-i',str(scene),'-filter_complex',graph,'-map','[out]','-map','0:a:0',
           '-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',
           '-c:a','copy','-movflags','+faststart',str(temp)])
        # Source/scene/output are independently decoded; a legitimate
        # outside-frame pass is insufficient if the scene was omitted.
        receipt=verify_result(source,temp,manifest,scene=scene)
        # Recheck both exact external inputs AFTER encoding and verification.
        if (digest(source)!=manifest['sourceFilmSha256'] or
                digest(scene)!=manifest['craftSceneSha256']):
            raise CraftHold('PINNED_SOURCE_CHANGED_DURING_SPLICE')
        staged_receipt.write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8')
        publish_verified_pair_no_clobber(temp,staged_receipt,output,receipt_path,
            trusted_receipt=receipt)
        return receipt

if __name__=='__main__':
    ap=argparse.ArgumentParser()
    ap.add_argument('--source',type=Path,required=True)
    ap.add_argument('--scene',type=Path,required=True)
    ap.add_argument('--output',type=Path,required=True)
    ap.add_argument('--manifest',type=Path,required=True)
    ap.add_argument('--external-manifest-sha256',required=True)
    args=ap.parse_args()
    print(json.dumps(splice(args.source,args.scene,args.output,
         trusted_manifest(args.manifest,args.external_manifest_sha256)),indent=2))
