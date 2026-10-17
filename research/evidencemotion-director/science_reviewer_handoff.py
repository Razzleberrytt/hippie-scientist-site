#!/usr/bin/env python3
"""EM-007.07 source-locked independent-science review *intake*, never approval.

Prepare a portable packet from the already verified EM-007.08 HOLD receipt.
The packet contains no reviewer testimony, signature, external study review,
scientific acceptance, device verdict, or release authority.
"""
import argparse
import hashlib
import json
import math
import os
import re
import subprocess
import tempfile
from pathlib import Path

from scientific_uncertainty_ledger import frozen_claim_spans, FROZEN_SPOKEN_LEDGER
from science_gate_process_attestation import (
    GATE, canonical, hold, prepare_report_destination, read_record,
    strict_json, verify_attestation, write_report_atomically,
)

SCHEMA = "ths-em00707-qualified-review-intake-v2"
PACKET_DOMAIN = b"THS/EM00707/REVIEW_INTAKE_NOT_APPROVAL/v2\x00"
SOURCES = {
    "pubchem:3034396": "https://pubchem.ncbi.nlm.nih.gov/compound/3034396",
    "pubchem:44301524": "https://pubchem.ncbi.nlm.nih.gov/compound/44301524",
    "media:render": None,
    "media:story": None,
}
# Fixed archive: original 34.3667s, 1080x1920 @ 30fps / 1031 frames.
# Frozen MFA word-boundary observations, not certified phonetic accuracy.
FILM_FRAME_COUNT = 1031
FILM_FPS = 30
# Separate expected oracle for eight claim boundary pairs; if somebody edits
# the frozen JSON and simply rehashes its own report, this review handoff HOLDS.
SOURCE_CLAIM_BOUNDS_MS = (
    (160.0,2920.0), (3470.0,10270.0),
    (10850.0,15990.0), (16580.0,19150.0),
    (19590.0,22860.001), (23379.999,25389.999),
    (25709.999,27350.0), (31250.0,33889.999),
)
SOURCE_WAV_SHA = "9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435"
SOURCE_ALIGNMENT_REVISION_SHA = "2414833bfd35c18ad6c629c3d10cbfab8501b09e296cc1963db01638b854bbaf"
FILM_SHA = "4a36305c08e422d85a006332c4e83d39dac4a8f12c87502ad842cb99b8f874e3"


def frozen_claim_review_windows(gate, frozen_spans):
    """Bind known source-WAV-aligned claims to actual film frame *indices*.

    Indices are deterministic timing prompts for a qualified reviewer,
    NOT proof a caption or biological claim is visible in each frame.
    """
    ledger, ledger_file_sha = read_record(FROZEN_SPOKEN_LEDGER)
    if (ledger.get("schema")!="ths-frozen-spoken-claim-ledger-v1"
        or ledger.get("sourceWavSha256")!=SOURCE_WAV_SHA
        or ledger.get("alignmentRevisionSha256")!=SOURCE_ALIGNMENT_REVISION_SHA
        or ledger.get("wordCount")!=73 or ledger.get("assertionCount")!=8
        or ledger.get("mayPublish") is not False
        or ledger.get("timingAccuracyCalibrated") is not False
        or ledger.get("inputSha256",{}).get("wav")!=SOURCE_WAV_SHA
        or ledger.get("scienceApproved") is not False
        or gate.get("sourceWavSha256")!=SOURCE_WAV_SHA
        or gate.get("filmSha256")!=FILM_SHA):
        hold("ORIGINAL_WAV_FILM_OR_FROZEN_ALIGNMENT_IDENTITY_DRIFT")
    words,claims=ledger.get("words"),ledger.get("assertions")
    if not isinstance(words,list) or len(words)!=73 or not isinstance(claims,list) or len(claims)!=8:
        hold("FROZEN_SOURCE_WORDS_OR_CLAIMS_MISSING")
    windows=[]
    previous_end=-1.0
    for n,(indices,verbatim) in enumerate(frozen_spans):
        cid=f"spoken-{n+1:03d}"
        claim=claims[n]
        if (claim.get("id")!=cid or claim.get("wordIndices")!=indices
            or claim.get("text")!=verbatim):
            hold("FROZEN_WORD_TO_CLAIM_BINDING_CHANGED:"+cid)
        t=[]
        for idx in indices:
            word=words[idx]
            if word.get("index")!=idx or word.get("assertionId")!=cid or (
                not isinstance(word.get("word"),str) or not word["word"]
            ) or (not isinstance(word.get("startMs"),(int,float))
                or isinstance(word.get("startMs"),bool)
                or not isinstance(word.get("endMs"),(int,float))
                or isinstance(word.get("endMs"),bool)):
                hold("FROZEN_WORD_RECORD_BAD:"+cid)
            a,b=word["startMs"],word["endMs"]
            if not (math.isfinite(a) and math.isfinite(b)
                and previous_end-0.02 <= a < b <= 1000*FILM_FRAME_COUNT/FILM_FPS):
                hold("ORIGINAL_WAV_CUE_TIME_INVALID:"+cid)
            previous_end=b
            t.append((a,b))
        a,b=t[0][0],t[-1][1]
        expected_a,expected_b=SOURCE_CLAIM_BOUNDS_MS[n]
        if abs(a-expected_a)>0.005 or abs(b-expected_b)>0.005:
            hold("CLAIM_TIME_BOUNDS_DIFFER_FROM_PINNED_WAV:"+cid)
        first=int(math.floor(a*FILM_FPS/1000))
        last=int(math.ceil(b*FILM_FPS/1000)-1)
        if not 0<=first<=last<FILM_FRAME_COUNT:
            hold("CLAIM_TIME_POINTS_OUTSIDE_ORIGINAL_FILM:"+cid)
        windows.append({
            "sourceAlignment":"FROZEN_MFA_RESEARCH_OBSERVATION_NOT_HUMAN_AUDITION",
            "spokenStartMs":a,"spokenEndMs":b,
            "firstPotentiallyOverlappingFrame":first,
            "lastPotentiallyOverlappingFrame":last,
            "actualFilmPixelsIndependentlyReviewedForClaim":False,
            "independentQualifiedReviewerApproved":False,
        })
    return ledger_file_sha,windows


REVIEWER_QUESTIONS = (
    "Compare each frozen spoken claim and qualifier against the exact audio and encoded film.",
    "Independently verify source identity and distinguish computed structure from observed biological effects.",
    "Check whether the claim suggests plant quantity, receptor behavior, human benefit, or absence of effects not supported by these records.",
    "Document corrections or abstention with independently retrievable source citations and exact asset SHA.",
)
HUMAN_QUESTIONS = (
    "Independently search and appraise relevant human outcome literature, reporting population, outcome, dose, exposure duration and follow-up.",
    "Distinguish positive, null, conflicting and absent-from-this-source-pack results; do not infer that no studies exist.",
)


def reviewer_packet(gate):
    """Emit a completely unapproved, hash-bound review request."""
    verify_attestation(gate)
    if gate["scienceGate"] != GATE:
        hold("SOURCE_GATE_NOT_A_RESEARCH_HOLD")
    rows = []
    frozen_spans = frozen_claim_spans()
    if len(frozen_spans) != 8:
        hold("EIGHT_FROZEN_SPOKEN_SPANS_REQUIRED")
    frozen_ledger_sha, time_windows = frozen_claim_review_windows(gate, frozen_spans)
    for index, claim in enumerate(gate["claims"]):
        indices, verbatim = frozen_spans[index]
        refs = []
        for ident in claim["sourceIds"]:
            if ident not in SOURCES:
                hold("UNKNOWN_PRIMARY_SOURCE_ID")
            refs.append({"id": ident, "primaryRecordUrl": SOURCES[ident]})
        questions = list(REVIEWER_QUESTIONS)
        if claim["material"]:
            questions.extend(HUMAN_QUESTIONS)
        rows.append({
            "claimId": claim["claimId"],
            "verbatimFrozenSpokenClaim": verbatim,
            "sourceWordIndices": list(indices),
            "originalWavAlignedReviewWindow": time_windows[index],
            "material": claim["material"],
            "originalSupportedMeaningScope": claim["sourceScope"],
            "exactSourceIdentifiers": refs,
            "unresolvedSourceGateHolds": list(claim["unresolvedHoldReasons"]),
            "requiredIndependentChecks": questions,
            "submittedReviewerFinding": None,
            "submittedEvidenceLinks": [],
            "claimApproved": False,
        })
    data = {
        "schema": SCHEMA, "task": "EM-007.07",
        "sourceScienceGateProcessDigest": gate["processAttestation"]["domainSeparatedDigest"],
        "exactFilmSha256": gate["filmSha256"],
        "exactOriginalWavSha256": gate["sourceWavSha256"],
        "frozenAlignedWordLedgerSha256": frozen_ledger_sha,
        "exactClaimSourceJoinSha256": gate["sourceJoinSha256"],
        "eightClaimsToReview": rows,
        "reviewer": {
            "identity": None,
            "qualifications": None,
            "independenceDeclaration": None,
            "actualFilmAndAudioReviewed": False,
            "evidenceExternallyVerified": False,
            "receiptAuthenticated": False,
        },
        "externalHumanOutcomeSearchCompleted": False,
        "independentQualifiedReviewReceived": False,
        "independentScientificReviewPassed": False,
        "scientificGate": GATE,
        "machinePacketOnly": True,
        "mayPublish": False,
        "approvalToMerge": False,
    }
    data["processPacketDigest"] = hashlib.sha256(PACKET_DOMAIN + canonical(data)).hexdigest()
    return data


def verify_packet(packet, gate):
    """Reconstruct independently; even a rehashed forged reviewer cannot pass."""
    expected = reviewer_packet(gate)
    if packet != expected:
        hold("REVIEW_INTAKE_MUTATED_OR_FABRICATED_APPROVAL")
    return True


def _hash_file(path):
    h=hashlib.sha256()
    with open(path,"rb") as source:
        for block in iter(lambda:source.read(1024*1024),b""):
            h.update(block)
    return h.hexdigest()


def original_review_stills(movie, gate, packet, output_dir):
    """Eight actual encoded original-frame PNGs for a *human* science handoff.

    This only prepares a visual REVIEW REQUEST, not visually assesses pixels,
    voice, human perception, chemistry, studies or authorization to publish.
    Rehash exact archive MOVIE before running FFmpeg; no synthetic substitute.
    """
    verify_packet(packet,gate)
    if gate["filmSha256"]!=FILM_SHA:
        hold("ORIGINAL_ARCHIVED_FILM_GATE_REQUIRED")
    movie=Path(movie)
    target=Path(output_dir)
    if (not movie.is_file() or movie.is_symlink()
        or _hash_file(movie)!=FILM_SHA):
        hold("ACTUAL_ARCHIVED_H264_BYTES_REQUIRED")
    if (target.is_symlink() or target.exists()
        or target.resolve()==movie.resolve()
        or not target.parent.is_dir()):
        hold("REVIEW_STILL_OUTPUT_MUST_BE_NEW_SAFE_DIRECTORY")
    rows=packet["eightClaimsToReview"]
    if len(rows)!=8:
        hold("EIGHT_REVIEW_CLAIMS_REQUIRED")
    indexes=[]
    for row in rows:
        span=row["originalWavAlignedReviewWindow"]
        start,end=span["firstPotentiallyOverlappingFrame"],span["lastPotentiallyOverlappingFrame"]
        if (not isinstance(start,int) or isinstance(start,bool)
            or not isinstance(end,int) or isinstance(end,bool)
            or not 0<=start<=end<FILM_FRAME_COUNT):
            hold("ORIGINAL_REVIEW_FRAME_INDICES_INVALID")
        indexes.append((start+end)//2)
    if len(set(indexes))!=8 or indexes!=sorted(indexes):
        hold("REVIEW_IMAGES_REQUIRE_EIGHT_DISTINCT_ORIGINAL_TIMES")
    # FFmpeg reads one exact SHA-authenticated H264; only source frames selected
    # by ORIGINAL sequential frame index are scaled to research thumbnails.
    expr="+".join("eq(n\\,"+str(index)+")" for index in indexes)
    with tempfile.TemporaryDirectory(prefix=".em00707-frames-",dir=target.parent) as folder:
        temporary=Path(folder)
        output=str(temporary/"original-claim-%02d.png")
        ffmpeg=[
            "ffmpeg","-hide_banner","-loglevel","error","-y",
            "-threads","1","-filter_threads","1","-i",str(movie),
            "-an","-vf","select="+expr+",scale=540:960",
            "-fps_mode","passthrough","-frames:v","8",
            "-start_number","0",output,
        ]
        try:
            subprocess.run(ffmpeg,check=True,capture_output=True,timeout=100)
        except (subprocess.CalledProcessError,subprocess.TimeoutExpired) as error:
            hold("ORIGINAL_H264_FRAME_EXTRACTION_FAILED:"+type(error).__name__)
        captures=[]
        present=sorted(p.name for p in temporary.glob("original-claim-*.png"))
        expected=[f"original-claim-{n:02d}.png" for n in range(8)]
        if present!=expected:
            hold("ORIGINAL_REVIEW_STILL_COUNT_OR_SEQUENCE_WRONG")
        for n,(row,index) in enumerate(zip(rows,indexes)):
            name=expected[n]
            bytes_on_disk=(temporary/name).read_bytes()
            if not bytes_on_disk.startswith(b"\x89PNG\r\n\x1a\n") or len(bytes_on_disk)<100:
                hold("ORIGINAL_REVIEW_STILL_NOT_VALID_PNG_HEADER")
            captures.append({
                "claimId":row["claimId"],
                "originalH264FrameIndex":index,
                "originalH264TimeSec":round(index/FILM_FPS,6),
                "fileName":name,
                "pngSha256":hashlib.sha256(bytes_on_disk).hexdigest(),
                "sourceFilmSha256":FILM_SHA,
                "displayWidth":540,"displayHeight":960,
                "frameSource":"AUTHENTIC_ARCHIVED_H264_RESEARCH_SAMPLE",
                "qualifiedVisualOrScientificReviewCompleted":False,
                "mayPublish":False,
            })
        result={
            "schema":"ths-em00707-original-film-review-thumbnails-v1",
            "task":"EM-007.07",
            "exactOriginalFilmSha256":FILM_SHA,
            "sourceReviewPacketDigest":packet["processPacketDigest"],
            "originalWavSha256":SOURCE_WAV_SHA,
            "originalClaimFrameStills":captures,
            "imagesAreOnlyEightMomentarySamples":True,
            "allFilmFramesReviewedByHuman":False,
            "qualifiedIndependentScienceReviewCompleted":False,
            "mayPublish":False,
            "approvalToMerge":False,
        }
        (temporary/"REVIEW-SAMPLES-RESEARCH-ONLY.json").write_text(
            json.dumps(result,indent=2,sort_keys=True)+"\n",encoding="utf8")
        os.rename(temporary,target)
    return result


def main():
    parser = argparse.ArgumentParser(description="Build science review intake (HOLD only)")
    parser.add_argument("--gate", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    if Path(args.gate).resolve() == Path(args.out).resolve():
        hold("INPUT_OUTPUT_PATH_ALIAS_NOT_ALLOWED")
    out = prepare_report_destination(args.out)
    gate, _ = read_record(args.gate)
    packet = reviewer_packet(gate)
    verify_packet(packet, gate)
    write_report_atomically(out, packet)
    print("EM-007.07: review packet emitted; 8 claims, qualified review MISSING, mayPublish=false")


if __name__ == "__main__":
    main()
