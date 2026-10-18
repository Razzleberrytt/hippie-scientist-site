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
from contextlib import contextmanager
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


def _hash_file(path, *, max_bytes=None):
    """Fail closed on oversized reviewer inputs, including post-stat growth.

    Every source film/PNG rehash is streamed with the same movie ceiling used
    by the encoded source-credit audit. A mutable pathname can grow after a
    size check; never hash an unbounded replacement as a review source.
    """
    from encoded_source_credit_guard import MAX_VIDEO_BYTES
    limit=MAX_VIDEO_BYTES if max_bytes is None else max_bytes
    if type(limit) is not int or limit<0:
        hold("SCIENCE_REVIEW_HASH_LIMIT_INVALID")
    h=hashlib.sha256()
    remaining=limit
    try:
        with open(path,"rb") as source:
            while True:
                block=source.read(min(1024*1024,remaining+1))
                if not block:
                    break
                if len(block)>remaining:
                    hold("SCIENCE_REVIEW_SOURCE_EXCEEDS_BYTE_LIMIT")
                remaining-=len(block)
                h.update(block)
    except OSError as error:
        hold("SCIENCE_REVIEW_SOURCE_READ_FAILED:"+type(error).__name__)
    return h.hexdigest()


@contextmanager
def _pinned_review_movie(movie, expected_sha256):
    """Decode only an immutable independently pinned copy of source H264.

    Reuses the bounded copy guard used by encoded-source credit OCR. A second
    original-path check on exit detects swaps during FFmpeg execution. This
    establishes file identity, never a scientific or editorial approval.
    """
    from encoded_source_credit_guard import _frozen_source
    movie=Path(movie)
    with tempfile.TemporaryDirectory(prefix="em00707-pinned-h264-") as folder:
        frozen=Path(folder)/"pinned-input.mp4"
        _frozen_source(movie,frozen,expected_sha256)
        if _hash_file(frozen)!=expected_sha256:
            hold("SCIENCE_REVIEW_FROZEN_SOURCE_SHA_CHANGED")
        try:
            yield frozen
        finally:
            # Recheck the actual bytes FFmpeg consumed: a same-user process can
            # modify the frozen copy after the entry SHA check. Never label
            # resulting frames with the original film SHA when this changes.
            if (not frozen.is_file() or frozen.is_symlink()
                or _hash_file(frozen)!=expected_sha256):
                hold("SCIENCE_REVIEW_FROZEN_CHANGED_DURING_DECODE")
            if (not movie.is_file() or movie.is_symlink()
                or _hash_file(movie)!=expected_sha256):
                hold("SCIENCE_REVIEW_ORIGINAL_CHANGED_DURING_DECODE")


def verify_original_review_stills(folder, gate, packet):
    """Independently rehash exported PNGs against the exact science HOLD packet.

    This is file/package integrity, NOT review of image semantics or a
    scientific/publishing attestation. Rejects added files and forged flags.
    """
    verify_packet(packet,gate)
    folder=Path(folder)
    expected_names=["REVIEW-SAMPLES-RESEARCH-ONLY.json"]+[
        f"original-claim-{i:02d}.png" for i in range(8)]
    if (not folder.is_dir() or folder.is_symlink()
        or sorted(p.name for p in folder.iterdir())!=sorted(expected_names)):
        hold("REVIEW_STILL_ARCHIVE_MISSING_EXTRA_OR_SYMLINK")
    for name in expected_names:
        item=folder/name
        if not item.is_file() or item.is_symlink():
            hold("REVIEW_STILL_ARCHIVE_CONTAINS_NONFILE_OR_SYMLINK")
    manifest=strict_json((folder/expected_names[0]).read_bytes())
    keys={"schema","task","exactOriginalFilmSha256",
          "sourceReviewPacketDigest","originalWavSha256",
          "originalClaimFrameStills","imagesAreOnlyEightMomentarySamples",
          "allFilmFramesReviewedByHuman",
          "qualifiedIndependentScienceReviewCompleted",
          "mayPublish","approvalToMerge"}
    if (not isinstance(manifest,dict) or set(manifest)!=keys
        or manifest.get("schema")!="ths-em00707-original-film-review-thumbnails-v1"
        or manifest.get("task")!="EM-007.07"
        or manifest.get("exactOriginalFilmSha256")!=FILM_SHA
        or manifest.get("originalWavSha256")!=SOURCE_WAV_SHA
        or manifest.get("sourceReviewPacketDigest")!=packet["processPacketDigest"]
        or manifest.get("imagesAreOnlyEightMomentarySamples") is not True
        or any(manifest.get(field) is not False for field in (
            "allFilmFramesReviewedByHuman","qualifiedIndependentScienceReviewCompleted",
            "mayPublish","approvalToMerge"))):
        hold("REVIEW_STILL_ARCHIVE_MANIFEST_IDENTITY_OR_APPROVAL_DRIFT")
    frames=manifest["originalClaimFrameStills"]
    if not isinstance(frames,list) or len(frames)!=8:
        hold("REVIEW_STILL_ARCHIVE_EIGHT_IMAGES_REQUIRED")
    row_keys={"claimId","originalH264FrameIndex","originalH264TimeSec",
              "fileName","pngSha256","sourceFilmSha256","displayWidth",
              "displayHeight","frameSource",
              "qualifiedVisualOrScientificReviewCompleted","mayPublish"}
    for i,(row,claim) in enumerate(zip(frames,packet["eightClaimsToReview"])):
        span=claim["originalWavAlignedReviewWindow"]
        index=(span["firstPotentiallyOverlappingFrame"]+
               span["lastPotentiallyOverlappingFrame"])//2
        name=f"original-claim-{i:02d}.png"
        if (not isinstance(row,dict) or set(row)!=row_keys
            or row["claimId"]!=claim["claimId"]
            or row["originalH264FrameIndex"]!=index
            or row["originalH264TimeSec"]!=round(index/FILM_FPS,6)
            or row["fileName"]!=name
            or row["sourceFilmSha256"]!=FILM_SHA
            or row["displayWidth"]!=540 or row["displayHeight"]!=960
            or row["frameSource"]!="AUTHENTIC_ARCHIVED_H264_RESEARCH_SAMPLE"
            or row["qualifiedVisualOrScientificReviewCompleted"] is not False
            or row["mayPublish"] is not False):
            hold("REVIEW_STILL_ARCHIVE_CLAIM_OR_FRAME_DRIFT")
        raw=(folder/name).read_bytes()
        # Require a correctly dimensioned PNG IHDR as well as original
        # individual exported PNG byte SHA; a filename alone isn't evidence.
        if (len(raw)<100 or raw[:8]!=b"\x89PNG\r\n\x1a\n"
            or raw[12:16]!=b"IHDR"
            or int.from_bytes(raw[16:20],"big")!=540
            or int.from_bytes(raw[20:24],"big")!=960
            or hashlib.sha256(raw).hexdigest()!=row["pngSha256"]):
            hold("REVIEW_STILL_ARCHIVE_PNG_PIXELS_OR_DIMENSIONS_CHANGED")
    return True



# This *exact* first-party original H264 still was downloaded, visually
# inspected and independently OCR'd (PSM 6 and 11), not a synthetic fixture.
# SHA pins this known screenshot, never used to infer claims about other films.
NO_REACTION_FRAME = 45
NO_REACTION_STILL_SHA = "7129a6e676b450d57c47913c7790744db9a19d1903d2488daf3039dc331820c2"
NO_REACTION_RISK_SCHEMA = "ths-em00707-original-no-reaction-semantic-hold-v1"


def original_no_reaction_ocr_verdict(still, observations):
    """Never treat a real caption as certified chemical or clinical meaning.

    Real Tesseract reads are produced by screen_original_no_reaction_caption.
    Caller-supplied observations alone are NOT physical source verification.
    """
    if (not isinstance(still,dict)
        or still.get("claimId")!="spoken-001"
        or still.get("originalH264FrameIndex")!=NO_REACTION_FRAME
        or still.get("originalH264TimeSec")!=1.5
        or still.get("pngSha256")!=NO_REACTION_STILL_SHA
        or still.get("sourceFilmSha256")!=FILM_SHA
        or still.get("qualifiedVisualOrScientificReviewCompleted") is not False
        or still.get("mayPublish") is not False):
        hold("AMBIGUOUS_CAPTION_SOURCE_IMAGE_OR_REVIEWER_APPROVAL_DRIFT")
    if not isinstance(observations,dict) or set(observations)!={"psm6","psm11"}:
        hold("AMBIGUOUS_CAPTION_REQUIRES_TWO_INDEPENDENT_OCR_LAYOUT_READS")
    ocr=[]
    for mode in ("psm6","psm11"):
        words=observations[mode]
        if not isinstance(words,str) or not words.strip() or len(words)>30000:
            hold("AMBIGUOUS_CAPTION_REAL_OCR_TEXT_MISSING_OR_INVALID")
        flattened=" ".join(words.casefold().split())
        if re.search(r"(?<![a-z])no\s+reaction(?![a-z])",flattened) is None:
            hold("AMBIGUOUS_CAPTION_SOURCE_TEXT_NOT_RECOVERED:"+mode)
        ocr.append({"mode":mode,"recognizedNoReaction":True,
                    "originalOcrStdoutSha256":hashlib.sha256(
                        words.encode("utf8")).hexdigest(),
                    "excerpt":flattened[-500:]})
    return {
        "schema":NO_REACTION_RISK_SCHEMA,
        "task":"EM-007.07",
        "sourceFilmSha256":FILM_SHA,
        "sourceWavSha256":SOURCE_WAV_SHA,
        "claimId":"spoken-001",
        "actualOriginalEncodedFrameIndex":NO_REACTION_FRAME,
        "actualOriginalFrameTimeSec":1.5,
        "originalExportedPngSha256":NO_REACTION_STILL_SHA,
        "actualOriginalPngIndependentOCR":ocr,
        "sourceVisibleWording":"No reaction",
        "semanticRisk":"Could mean no molecular conversion in the graphic OR be misread as no physiological/drug reaction.",
        "reviewInstruction":"Qualified independent reviewer must inspect the full 0.16-2.92s original narrated interval and determine whether the image wording is scientifically and audience clear; record original-source citations and correction only if warranted.",
        "reviewedEntireOriginalScene":False,
        "clinicalOrPlantAssayMeaningEstablished":False,
        "qualifiedIndependentReviewerResolved":False,
        "requiresQualifiedReview":True,
        "mayPublish":False,
        "approvalToMerge":False,
    }


def screen_original_no_reaction_caption(folder, gate, packet):
    """Source-authenticated *original* PNG + real OCR → semantic-review HOLD.

    Technically verified ink != editorial/science interpretation. An absent
    OCR tool, swapped source PNG, new film or missing ink must fail CLOSED.
    """
    verify_original_review_stills(folder,gate,packet)
    original=Path(folder)/"original-claim-00.png"
    if _hash_file(original)!=NO_REACTION_STILL_SHA:
        hold("AMBIGUOUS_CAPTION_ORIGINAL_SOURCE_THUMBNAIL_SHA_CHANGED")
    observations={}
    for mode in (6,11):
        try:
            process=subprocess.run(
                ["tesseract",str(original),"stdout","--psm",str(mode)],
                capture_output=True,text=True,check=True,timeout=45)
        except (subprocess.CalledProcessError,subprocess.TimeoutExpired,
                FileNotFoundError) as error:
            hold("AMBIGUOUS_CAPTION_INDEPENDENT_OCR_NOT_AVAILABLE:"+
                 type(error).__name__)
        observations["psm"+str(mode)]=process.stdout
    saved=strict_json((Path(folder)/"REVIEW-SAMPLES-RESEARCH-ONLY.json").read_bytes())
    return original_no_reaction_ocr_verdict(
        saved["originalClaimFrameStills"][0],observations)




# Eight authentic original-film samples across spoken-001; four depict the
# MITRAGYNINE label and four depict 7-OH. Not a full 88-frame semantic audit.
FIRST_SCENE_ORIGINAL_FRAME_SAMPLES = (8,20,35,45,55,65,75,85)
FIRST_SCENE_SAMPLE_SCHEMA = "ths-em00707-original-no-reaction-temporal-ocr-HOLD-v1"


def screen_original_no_reaction_temporal(movie, gate, packet):
    """Decode source-authenticated original intro frames and OCR REAL pixels.

    Eight samples assess caption presence across TWO changing chemical
    diagram labels, not reactions, pharmacology, human interpretation or
    all 88 scene frames. Any dropped frame/OCR phrase/source identity HOLDS.
    """
    verify_packet(packet,gate)
    movie=Path(movie)
    if (not movie.is_file() or movie.is_symlink()
        or gate["filmSha256"]!=FILM_SHA or _hash_file(movie)!=FILM_SHA):
        hold("NO_REACTION_TIMELINE_REQUIRES_PINNED_ORIGINAL_H264")
    indexes=FIRST_SCENE_ORIGINAL_FRAME_SAMPLES
    if not all(0 <= x < FILM_FRAME_COUNT for x in indexes):
        hold("NO_REACTION_TIMELINE_INDEX_OUT_OF_FILM")
    original_window=packet["eightClaimsToReview"][0][
        "originalWavAlignedReviewWindow"]
    if not all(
        original_window["firstPotentiallyOverlappingFrame"]<=i<=
        original_window["lastPotentiallyOverlappingFrame"] for i in indexes
    ):
        hold("NO_REACTION_TIMELINE_NOT_WITHIN_FROZEN_SPOKEN_CLAIM")
    rows=[]
    with tempfile.TemporaryDirectory(prefix="em00707-source-film-") as temp:
        folder=Path(temp)
        expression="+".join("eq(n\\,"+str(index)+")" for index in indexes)
        command=["ffmpeg","-hide_banner","-loglevel","error","-y",
                 "-threads","1","-filter_threads","1","-i",str(movie),
                 "-an","-vf","select="+expression+",scale=540:960",
                 "-fps_mode","passthrough","-frames:v",str(len(indexes)),
                 "-start_number","0",str(folder/"intro-%02d.png")]
        try:
            with _pinned_review_movie(movie,FILM_SHA) as frozen:
                command[command.index("-i")+1]=str(frozen)
                subprocess.run(command,check=True,capture_output=True,timeout=100)
        except (subprocess.CalledProcessError,subprocess.TimeoutExpired,
                FileNotFoundError) as error:
            hold("NO_REACTION_TIMELINE_ARCHIVE_DECODE_FAILED:"+
                 type(error).__name__)
        if sorted(p.name for p in folder.iterdir())!=[
            f"intro-{i:02d}.png" for i in range(len(indexes))
        ]:
            hold("NO_REACTION_TIMELINE_EIGHT_REAL_FRAMES_REQUIRED")
        for i,frame_index in enumerate(indexes):
            image=folder/f"intro-{i:02d}.png"
            raw=image.read_bytes()
            if (len(raw)<100 or raw[:8]!=b"\x89PNG\r\n\x1a\n"
                or raw[12:16]!=b"IHDR"
                or int.from_bytes(raw[16:20],"big")!=540
                or int.from_bytes(raw[20:24],"big")!=960):
                hold("NO_REACTION_TIMELINE_EXTRACTED_FRAME_NOT_PNG")
            digest=hashlib.sha256(raw).hexdigest()
            if frame_index==NO_REACTION_FRAME and digest!=NO_REACTION_STILL_SHA:
                hold("NO_REACTION_TIMELINE_MIDPOINT_NOT_ORIGINAL_SOURCE")
            want="MITRAGYNINE" if i<4 else "7-OH"
            readings={}
            for mode in (6,11):
                try:
                    result=subprocess.run([
                        "tesseract",str(image),"stdout","--psm",str(mode)],
                        check=True,capture_output=True,text=True,timeout=45)
                except (subprocess.CalledProcessError,subprocess.TimeoutExpired,
                        FileNotFoundError) as error:
                    hold("NO_REACTION_TIMELINE_ORIGINAL_OCR_FAILED:"+
                         type(error).__name__)
                ocr=result.stdout
                visible=" ".join(ocr.casefold().split())
                if (re.search(r"(?<![a-z])no\s+reaction(?![a-z])",visible)
                    is None or want.casefold() not in visible):
                    hold("NO_REACTION_TIMELINE_VISIBLE_TEXT_NOT_RECOVERED:"
                         +str(frame_index)+":"+str(mode))
                readings["psm"+str(mode)]={
                    "recoverNoReaction":True,
                    "recoverChemicalLabel":want,
                    "ocrStdoutSha256":hashlib.sha256(ocr.encode()).hexdigest(),
                }
            rows.append({
                "frameIndex":frame_index,"timeSec":round(frame_index/FILM_FPS,6),
                "originalFilmSha256":FILM_SHA,"actualDecodedPngSha256":digest,
                "sourceChemicalLabelIndependentlyOCRed":want,
                "actualOcr":readings,
                "scienceMeaningOrHumanComprehensionApproved":False,
                "mayPublish":False,
            })
    if len(rows)!=8:
        hold("NO_REACTION_TIMELINE_8_OF_8_NOT_VERIFIED")
    return {
        "schema":FIRST_SCENE_SAMPLE_SCHEMA,
        "task":"EM-007.07","originalFilmSha256":FILM_SHA,
        "sourceWavSha256":SOURCE_WAV_SHA,
        "sourceReviewPacketDigest":packet["processPacketDigest"],
        "sampleCount":8,"selectedSampleFrameIndices":list(indexes),
        "physicallyRecoveredNoReactionSamples":len(rows),
        "pairedMitragynineSamples":4,"paired7OHSamples":4,
        "actualNativeH264Frames":rows,
        "limitation":"Only eight independent time-sampled frames from the opening claim were OCRed. Does not prove unbroken caption presence in all frames or how a person understands it.",
        "requiresQualifiedEditorialScientificInterpretation":True,
        "sceneSemanticsApproved":False,
        "realHumanUnderstandingMeasured":False,
        "firstExcellentRenderApproved":False,
        "mayPublish":False,
        "approvalToMerge":False,
    }




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
            with _pinned_review_movie(movie,FILM_SHA) as frozen:
                ffmpeg[ffmpeg.index("-i")+1]=str(frozen)
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
        verify_original_review_stills(temporary,gate,packet)
        os.rename(temporary,target)
    return result



# Current renderer output is a different H264 file.  It is *not* the pinned
# archival movie; the archived v2 intake must not accept its film hash.
CURRENT_SCHEMA = "ths-em00707-current-render-science-review-INTAKE-v1"
CURRENT_DOMAIN = b"THS/EM00707/CURRENT_RENDER_REVIEW_INTAKE_HOLD/v1\x00"


def current_candidate_reviewer_packet(gate, current_movie):
    """Issue an independently checkable CURRENT-movie science-review request.

    The original-WAV spoken claims/speech cue bounds are inherited as acoustic
    source prompts ONLY. Never inherit old film pixel/OCR verification, viewer
    conclusions, or release approval from the earlier archived candidate.
    """
    verify_attestation(gate)
    movie=Path(current_movie)
    if not movie.is_file() or movie.is_symlink():
        hold("CURRENT_FILM_REQUIRED_FOR_DISTINCT_REVIEW_PACKET")
    film_sha=_hash_file(movie)
    if (film_sha != gate["filmSha256"] or
        gate["sourceWavSha256"]!=SOURCE_WAV_SHA or
        gate["scienceGate"]!=GATE or
        gate["mayPublish"] is not False or
        gate["approvalToMerge"] is not False):
        hold("CURRENT_RENDER_NOT_BOUND_TO_ITS_EXACT_SCIENCE_GATE")
    ledger,ledger_sha=read_record(FROZEN_SPOKEN_LEDGER)
    if (ledger.get("schema")!="ths-frozen-spoken-claim-ledger-v1" or
        ledger.get("sourceWavSha256")!=SOURCE_WAV_SHA or
        ledger.get("alignmentRevisionSha256")!=SOURCE_ALIGNMENT_REVISION_SHA or
        ledger.get("wordCount")!=73 or
        ledger.get("assertionCount")!=8 or
        ledger.get("wordCoverageVerified") is not True or
        ledger.get("mayPublish") is not False or
        ledger.get("scienceApproved") is not False):
        hold("CURRENT_RENDER_FROZEN_NARRATION_NOT_RECONCILED")
    spans=frozen_claim_spans()
    if len(spans)!=8 or len(gate["claims"])!=8 or len(ledger.get("assertions",[]))!=8:
        hold("CURRENT_RENDER_REVIEW_REQUIRES_EIGHT_LOCKED_SPOKEN_CLAIMS")
    items=[]
    for i,(claim,(indices,spoken)) in enumerate(zip(gate["claims"],spans)):
        original=ledger["assertions"][i]
        if (claim["claimId"]!=f"spoken-{i+1:03d}" or
            original["id"]!=claim["claimId"] or
            original["text"]!=spoken or original["wordIndices"]!=indices or
            claim["qualifiedIndependentScienceVerdict"]!="NOT_RECEIVED" or
            claim["scientificAcceptance"]!=GATE):
            hold("CURRENT_RENDER_AUDIO_SCIENCE_CLAIM_DRIFT")
        start,end=SOURCE_CLAIM_BOUNDS_MS[i]
        refs=[]
        for identifier in claim["sourceIds"]:
            if identifier not in SOURCES:
                hold("CURRENT_RENDER_UNSUPPORTED_SOURCE_ID")
            refs.append({"id":identifier,"url":SOURCES[identifier]})
        items.append({
            "claimId":claim["claimId"],
            "frozenOriginalWavSpokenWords":spoken,
            "sourceWordIndices":indices,
            "originalWavAlignedStartMs":start,
            "originalWavAlignedEndMs":end,
            "timingScope":"ORIGINAL_WAV_SOURCE_CUE_NOT_INDEPENDENT_CURRENT_FILM_PIXEL_SYNC",
            "currentH264FrameContentInspectedForThisClaim":False,
            "sourceScope":claim["sourceScope"],
            "material":claim["material"],
            "sourceIds":refs,
            "independentQualifiedReviewerRequired":True,
            "unresolvedHolds":list(claim["unresolvedHoldReasons"]),
            "submittedReviewerFinding":None,
            "scientificApproval":False,
        })
    report={
        "schema":CURRENT_SCHEMA, "task":"EM-007.07",
        "exactCurrentEncodedH264Sha256":film_sha,
        "exactOriginalSourceWavSha256":SOURCE_WAV_SHA,
        "frozenWordLedgerSha256":ledger_sha,
        "sourceScienceGateProcessDigest":gate["processAttestation"]["domainSeparatedDigest"],
        "scienceGate":GATE,
        "eightClaimsToReview":items,
        "independentQualifiedReviewReceived":False,
        "independentScientificReviewPassed":False,
        "sourceOnlyTimecodesNotCurrentFilmVerified":True,
        "pastArchivedPixelAndOcrPassNotInherited":True,
        "currentFilmPixelReviewCompleted":False,
        "currentFilmHumanReviewCompleted":False,
        "mayPublish":False,
        "approvalToMerge":False,
    }
    report["currentFilmReviewRequestDigest"]=hashlib.sha256(
        CURRENT_DOMAIN+canonical(report)).hexdigest()
    return report


def verify_current_candidate_reviewer_packet(packet, gate, current_movie):
    """Reject a mutated or rehashed pseudo-review even with matching digest."""
    expected=current_candidate_reviewer_packet(gate,current_movie)
    if packet!=expected:
        hold("CURRENT_FILM_REVIEW_REQUEST_MUTATED_OR_FABRICATED_APPROVAL")
    return True


def _same_output_as_source(source, output):
    """Reject source/output aliases before stale-receipt cleanup can unlink media.

    resolve() covers symlinked parent directories; samefile() also catches
    hard links, whose differing path spellings resolve to the same inode.
    """
    source, output = Path(source), Path(output)
    return (source.resolve() == output.resolve()
            or (source.exists() and output.exists()
                and os.path.samefile(source, output)))


def main():
    parser = argparse.ArgumentParser(description="Build science review intake (HOLD only)")
    parser.add_argument("--gate", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--candidate-movie", default=None,
                        help="Current rendered film to bind a distinct unapproved intake; never reuses the original H264 v2 packet")
    args = parser.parse_args()
    # An output alias must be rejected BEFORE prepare_report_destination()
    # unlinks a stale receipt. In particular never unlink the current movie.
    if _same_output_as_source(args.gate, args.out):
        hold("INPUT_OUTPUT_PATH_ALIAS_NOT_ALLOWED")
    if args.candidate_movie and _same_output_as_source(args.candidate_movie, args.out):
        hold("CURRENT_MOVIE_OUTPUT_PATH_ALIAS_NOT_ALLOWED")
    if _same_output_as_source(FROZEN_SPOKEN_LEDGER, args.out):
        hold("FROZEN_SOURCE_WORD_LEDGER_OUTPUT_PATH_ALIAS_NOT_ALLOWED")
    out = prepare_report_destination(args.out)
    gate, _ = read_record(args.gate)
    if args.candidate_movie:
        packet=current_candidate_reviewer_packet(gate,args.candidate_movie)
        verify_current_candidate_reviewer_packet(packet,gate,args.candidate_movie)
        write_report_atomically(out,packet)
        print("EM-007.07: CURRENT rendered H264 SHA bound; eight original spoken claims, no current pixel approval, qualified review MISSING, mayPublish=false")
    else:
        packet = reviewer_packet(gate)
        verify_packet(packet, gate)
        write_report_atomically(out, packet)
        print("EM-007.07: EXACT ARCHIVE review packet emitted; 8 claims, qualified review MISSING, mayPublish=false")


if __name__ == "__main__":
    main()
