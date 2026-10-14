#!/usr/bin/env python3
"""EvidenceMotion native research media gate. Never certifies craft, science or posting.

This gate checks actual decoded file bytes and source-hash identity. It cannot
infer whether a raster layer was upscaled or whether voice sounds natural;
those require independently verified source pixels and human listening.
"""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

W,H,FPS,N=1080,1920,30,1031
PUBCHEM_CID=44301524
INCHIKEY="RYENLSMHLCNXJT-CYXFISRXSA-N"
ORIGINAL_WAV="9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435"
HEX=set("0123456789abcdef")

def hold(reason):
    raise ValueError("NATIVE_MEDIA_HOLD: "+reason)

def digest(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""):
            h.update(chunk)
    return h.hexdigest()

def validate_receipt(r):
    if not isinstance(r,dict) or r.get("status")!="RESEARCH_NOT_FINAL":
        hold("RESEARCH_STATUS_REQUIRED")
    for k in ("ownerApproved","voiceAuditioned","scienceApproved","craftApproved",
              "phonePlaybackApproved","mayPublish"):
        if r.get(k) is not False:
            hold("NO_SELF_APPROVAL_"+k)
    if r.get("nativeCanvas") is not True:
        hold("NATIVE_CANVAS_PROVENANCE_REQUIRED")
    if r.get("resolution")!=[W,H] or r.get("fps")!=FPS or r.get("frames")!=N or r.get("fullFilm") is not True:
        hold("INCOMPLETE_NATIVE_FILM")
    if r.get("sourceWavSha256")!=ORIGINAL_WAV or r.get("sourceInchiKey")!=INCHIKEY:
        hold("PINNED_SOURCE_IDENTITY_CHANGED")
    if not isinstance(r.get("note"),str) or "lower-resolution" not in r["note"] or "inset" not in r["note"]:
        hold("LOW_RES_COMPUTED_INSET_DISCLOSURE_REQUIRED")
    v=r.get("reviewVideoSha256")
    if not isinstance(v,str) or len(v)!=64 or not set(v)<=HEX:
        hold("EXACT_REVIEW_VIDEO_SHA_REQUIRED")
    return {"status":"RECEIPT_PREFLIGHT_REQUIRES_ACTUAL_FILE_DECODE","publishAllowed":False}

def validate_probe(probe):
    streams=probe.get("streams",[])
    video=[s for s in streams if s.get("codec_type")=="video"]
    audio=[s for s in streams if s.get("codec_type")=="audio"]
    if len(streams)!=2 or len(video)!=1 or len(audio)!=1:
        hold("EXACTLY_ONE_VIDEO_AND_AUDIO_STREAM")
    v,a=video[0],audio[0]
    if v.get("codec_name")!="h264" or (v.get("width"),v.get("height"))!=(W,H):
        hold("NOT_NATIVE_HD_H264_ENCODE")
    if v.get("avg_frame_rate")!="30/1" or int(v.get("nb_read_frames") or 0)!=N:
        hold("WRONG_FRAME_GRID_OR_TRUNCATED_FILM")
    if a.get("codec_name")!="aac":
        hold("LOCKED_AAC_MASTER_REQUIRED")
    movie_duration=float(probe.get("format",{}).get("duration",0))
    # Exact 1031 frames at 30fps, allow <1 frame for AAC tail/container rounding.
    if abs(movie_duration-N/FPS)>1/FPS+.005:
        hold("VIDEO_DURATION_DRIFT")
    a_dur=float(a.get("duration",0))
    if not (34.20<=a_dur<=34.45):
        hold("AUDIO_TOO_SHORT_OR_OVERLONG")
    return {"nativeEncodedFrames":N,"durationSeconds":movie_duration,
            "technicalMedia":"PASS_DECODE_STILL_REQUIRED",
            "correctnessApproved":False,"craftApproved":False,
            "mayPublish":False}

def probe_video(path):
    cmd=["ffprobe","-v","error","-count_frames","-show_streams","-show_format",
         "-of","json",str(path)]
    return json.loads(subprocess.check_output(cmd,timeout=90))

def decode_video(path):
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-nostdin",
                    "-xerror","-i",str(path),"-f","null","-"],
                   timeout=90,check=True)

def audit(video,wav,receipt_path):
    receipt=json.loads(Path(receipt_path).read_text())
    validate_receipt(receipt)
    if digest(video)!=receipt["reviewVideoSha256"]:
        hold("ACTUAL_MOVIE_SHA_MISMATCH")
    if digest(wav)!=ORIGINAL_WAV:
        hold("LOCKED_ORIGINAL_WAV_MISMATCH")
    report=validate_probe(probe_video(video))
    try:
        decode_video(video)
    except (subprocess.CalledProcessError,subprocess.TimeoutExpired):
        hold("ACTUAL_H264_AAC_DECODE_FAILURE")
    report.update({
        "status":"NATIVE_RESEARCH_TECHNICAL_PASS_NOT_CRAFT_OR_RELEASE",
        "exactMovieSha256":receipt["reviewVideoSha256"],
        "exactOriginalWavSha256":ORIGINAL_WAV,
        "lowResolution3dInsetDisclosed":True,
        "claimAudit":"NEEDS_INDEPENDENT_QUALIFIED_HUMAN",
        "wordLevelAcousticAlignment":"NOT_ESTABLISHED",
        "originalVoiceEarCheck":"OWNER_PENDING",
        "phonePlatformUiAndCraft":"OWNER_PENDING",
        "sourcePixelNativeGeometry":"NOT_PROVEN_BY_PROBE_ALONE",
        "mayPublish":False
    })
    return report

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--video",required=True)
    p.add_argument("--wav",required=True)
    p.add_argument("--receipt",required=True)
    p.add_argument("--report")
    a=p.parse_args()
    result=audit(a.video,a.wav,a.receipt)
    if a.report: Path(a.report).write_text(json.dumps(result,indent=2)+"\n")
    print(json.dumps(result,indent=2))
