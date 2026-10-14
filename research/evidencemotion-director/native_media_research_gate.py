#!/usr/bin/env python3
"""Fail-closed 7-OH native research review relying on EXISTING native_master_audit.

This is a fixed media-review identity, NOT a generic publication certificate.
Exact full-film/AAC fingerprints are frozen outside the caller's manifest.
No user-supplied hash can endorse changed media. The canonical native master
auditor performs real decoded frame timestamp grid and AAC ADTS byte checks.
"""
import argparse
import hashlib
import json
from pathlib import Path
from native_master_audit import verify as strict_native_master_verify

MASTER_SHA="18e7084040daf6c029bbce7fae0521ae7233660a4ad1a4475d3baf84e22edfd8"
AAC_ADTS_SHA="2792538a0a8cd1263d6790ea05a2e084db68a4026a94c4c7ce0294bcf4e2fd2d"
WAV_SHA="9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435"
INCHIKEY="RYENLSMHLCNXJT-CYXFISRXSA-N"
W,H,FPS,FRAMES=1080,1920,30,1031

def hold(reason):
    raise ValueError("NATIVE_MEDIA_HOLD: "+reason)

def digest(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for block in iter(lambda:f.read(1024*1024),b""):
            h.update(block)
    return h.hexdigest()

def validate_receipt(r):
    if not isinstance(r,dict) or r.get("status")!="RESEARCH_NOT_FINAL":
        hold("RESEARCH_STATUS_REQUIRED")
    for flag in ("mayPublish","craftApproved","ownerApproved","scienceApproved",
                 "voiceAuditioned","phonePlaybackApproved"):
        if r.get(flag) is not False:
            hold("NO_SELF_APPROVAL_"+flag)
    if r.get("nativeCanvas") is not True or r.get("fullFilm") is not True:
        hold("NATIVE_SOURCE_AND_FULL_FILM_REQUIRED")
    if r.get("resolution")!=[W,H] or r.get("fps")!=FPS or r.get("frames")!=FRAMES:
        hold("EXPECTED_NATIVE_FILM_BOUNDS")
    if r.get("sourceInchiKey")!=INCHIKEY or r.get("sourceWavSha256")!=WAV_SHA:
        hold("PINNED_SCIENCE_OR_VOICE_IDENTITY_DRIFT")
    if r.get("reviewVideoSha256")!=MASTER_SHA:
        hold("UNREVIEWED_NEW_MASTER_SHA")
    if not isinstance(r.get("note"),str) or "lower-resolution" not in r["note"] or "inset" not in r["note"]:
        hold("COMPUTED_3D_INSET_DISCLOSURE_REQUIRED")
    return {"status":"RESEARCH_RECEIPT_PREFLIGHT_ONLY",
            "requiresActualTimestampAndAdtsDecode":True,"mayPublish":False}

def audit(video,wav,receipt_path):
    receipt=json.loads(Path(receipt_path).read_text())
    validate_receipt(receipt)
    if digest(wav)!=WAV_SHA:
        hold("WRONG_LOCKED_ORIGINAL_PCM")
    if digest(video)!=MASTER_SHA:
        hold("REVIEWED_MASTER_BYTES_CHANGED")
    # Reuse strict, already tested audit. Audio is separately pinned to a
    # reviewer-fixed elementary ADTS fingerprint. Passing the movie itself as
    # 'reference audio' does NOT assert an independent audio-master export;
    # the immutable expected ADTS SHA is the independent audio identity gate.
    result=strict_native_master_verify(
        video,video,MASTER_SHA,AAC_ADTS_SHA,FRAMES,
        width=W,height=H,fps=FPS,decode_all=True)
    if result.get("technical")!="PASS" or result.get("frameTimingVerified") is not True or result.get("fullDecodePerformed") is not True:
        hold("EXISTING_STRICT_NATIVE_AUDIT_REJECTED_"+",".join(result.get("problems",[])))
    if result.get("audioAdtsSha256")!=AAC_ADTS_SHA:
        hold("PINNED_AAC_NARRATION_CHANGED")
    return {"status":"PINNED_NATIVE_RESEARCH_TECHNICAL_PASS_NOT_RELEASE",
            "reviewMovieSha256":MASTER_SHA,"voiceOriginalPcmSha256":WAV_SHA,
            "encodedAacAdtsSha256":AAC_ADTS_SHA,
            "actualFrameTimestampsVerified":True,"entireAvDecoded":True,
            "scienceApproved":False,"voiceEarCheck":"OWNER_PENDING",
            "wordLevelAcousticAlignment":"NOT_PROVEN",
            "craftApproved":False,"phoneUiReviewed":False,
            "sourceNativeOfEveryInset":"LOW_RES_COMPUTED_INSET_NOT_NATIVE",
            "mayPublish":False}

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--video",required=True);p.add_argument("--wav",required=True)
    p.add_argument("--receipt",required=True);p.add_argument("--report")
    args=p.parse_args()
    r=audit(args.video,args.wav,args.receipt)
    if args.report:Path(args.report).write_text(json.dumps(r,indent=2)+"\n")
    print(json.dumps(r,indent=2))
