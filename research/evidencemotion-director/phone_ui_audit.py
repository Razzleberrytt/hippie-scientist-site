#!/usr/bin/env python3
"""Research-only decoded-frame TikTok/Shorts UI exclusion audit.

Never certifies handset playback, source truth, scientific accuracy, comprehension or craft.
Annotation rectangles are supplied by the caller, not detected by OCR.
"""
import argparse
import hashlib
import json
import math
import re
import os
import tempfile
from decimal import Decimal, InvalidOperation
from bisect import bisect_left
from pathlib import Path
import subprocess
from native_master_audit import frame_timestamps

TOP, RIGHT, BOTTOM = .10, .20, .18
MAX_SHOTS = 24
# Sub-frame authoring precision; old 50/100-ms slack hid real missing frames.
TIMELINE_TOLERANCE_SEC = 0.001
# Audio-bearing containers and ceil-to-full-frame encoding cannot define shot endpoints.
# Permit at most one encoded frame of closing pad, never multi-frame missing shots.
FRAME_END_TOLERANCE_SEC = (1 / 30) + TIMELINE_TOLERANCE_SEC
# Explicit width-fit research model only; phone CSS scale and readability vary.
REFERENCE_PHONE_WIDTH_PX = 375
REVIEW_SMALL_TYPE_PX = 14
ROLES = {"hook", "caption", "source", "science", "disclosure"}
# These filenames are removed or overwritten when publishing decoded review PNGs.
# An input at one of these paths must be rejected before output mutation.
GENERATED_OVERLAY_NAME = re.compile(
    r"(?:[0-9]{2}-[a-z][a-z0-9_-]{0,49}|opening-(?:0_25|1_5))\.png"
)

def sha256_file(path):
    digest = hashlib.sha256()
    with open(path, "rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()

def hold(code):
    raise ValueError("PHONE_UI_HOLD:" + code)

def strict_json_bytes(raw):
    """Reject ambiguous/non-standard claim-bearing research JSON at intake.

    The default json.loads silently keeps the LAST duplicate key and accepts
    NaN/Infinity as Python floats. Neither behavior may authorize source,
    OCR, publication or prior-image cleanup receipts. This checks nested
    objects too, before any decoded-media preflight or output promotion.
    """
    def unique_pairs(pairs):
        seen = {}
        for key, value in pairs:
            if key in seen:
                hold("DUPLICATE_EVIDENCE_JSON_KEY:" + key)
            seen[key] = value
        return seen

    def invalid_constant(value):
        hold("NONFINITE_EVIDENCE_JSON_VALUE:" + value)

    def checked_float(token):
        # Exponent overflow (1e999) becomes infinity even with
        # parse_constant disabled. Reject before a science/geometry reader
        # can receive a non-finite float hidden behind valid JSON syntax.
        value = float(token)
        if not math.isfinite(value):
            hold("NONFINITE_EVIDENCE_JSON_VALUE:" + token)
        return value

    return json.loads(raw.decode("utf-8"), object_pairs_hook=unique_pairs,
                      parse_constant=invalid_constant, parse_float=checked_float)


def is_hash(value):
    return isinstance(value, str) and re.fullmatch(r"[0-9a-f]{64}", value) is not None

def number(value):
    return type(value) in (int, float) and math.isfinite(value)

def valid_box(b, w, h):
    return (isinstance(b, list) and len(b) == 4 and all(number(v) for v in b)
            and 0 <= b[0] < b[2] <= w and 0 <= b[1] < b[3] <= h)

def verify_shots(shots, duration):
    if not isinstance(shots, list) or not 1 <= len(shots) <= MAX_SHOTS:
        hold("SHOT_COUNT_REQUIRED")
    cursor, seen = 0.0, set()
    for shot in shots:
        if not isinstance(shot, dict) or not isinstance(shot.get("id"), str) or not re.fullmatch(r"[a-z][a-z0-9_-]{0,49}", shot["id"]) or shot["id"] in seen:
            hold("INVALID_OR_DUPLICATE_SHOT_ID")
        seen.add(shot["id"])
        begin, end = shot.get("startSec"), shot.get("endSec")
        if not number(begin) or not number(end) or abs(begin - cursor) > TIMELINE_TOLERANCE_SEC or end <= begin or end > duration + FRAME_END_TOLERANCE_SEC:
            hold("NONCONTIGUOUS_SHOT_TIMELINE")
        cursor = end
    if abs(cursor - duration) > FRAME_END_TOLERANCE_SEC:
        hold("INCOMPLETE_FILM_COVERAGE")

def verify_decoded_shot_coverage(stamps, shots):
    """Every declared shot must own at least one actual presented frame.

    Timestamp-grid correctness alone does not catch a subframe 'phantom shot'
    inserted between otherwise valid 30fps frames. This is only a technical
    coverage oracle, not scientific, pixel-content, or handset approval.
    """
    if not stamps:
        hold("NO_DECODED_FRAMES_FOR_SHOT_COVERAGE")
    # bisect_left and the 9-shot ownership proof require actual presentation
    # order. A merely correctly sized or source-hashed PTS array can still
    # conceal reordered or duplicated decoded presentation timestamps.
    for i, stamp in enumerate(stamps):
        if not isinstance(stamp, Decimal) or not stamp.is_finite():
            hold("INVALID_DECODED_FRAME_PTS:" + str(i))
        if i and stamp <= stamps[i - 1]:
            hold("NONMONOTONIC_DECODED_FRAME_PTS:" + str(i))
    if stamps[-1] >= Decimal(str(shots[-1]["endSec"])) + Decimal(str(TIMELINE_TOLERANCE_SEC)):
        hold("UNCLAIMED_FINAL_PRESENTED_FRAME")
    spans = []
    for shot in shots:
        start = Decimal(str(shot["startSec"]))
        end = Decimal(str(shot["endSec"]))
        index = bisect_left(stamps, start)
        if index == len(stamps) or stamps[index] >= end:
            hold("SHOT_WITHOUT_PRESENTED_FRAME:" + shot["id"])
        spans.append((start, end))
    # Even a sub-1ms authored gap or overlap can conceal a real presented
    # frame at the exact boundary; shot-has-a-frame alone misses this defect.
    for index, stamp in enumerate(stamps):
        ownership = sum(start <= stamp < end for start, end in spans)
        if ownership == 0:
            hold("PRESENTED_FRAME_UNASSIGNED:" + str(index))
        if ownership != 1:
            hold("PRESENTED_FRAME_MULTIPLY_ASSIGNED:" + str(index))
    return {
        "actualPresentedFramesChecked": len(stamps),
        "framesAssignedExactlyOnce": len(stamps),
        "framesWithoutShot": 0,
        "framesAssignedToMultipleShots": 0,
        "decodedPTSStrictlyIncreasingAndFinite": True,
        "verification": "EXACT_DECODED_PTS_TO_DECLARED_SHOT_COVERAGE_RESEARCH_ONLY",
        "mayPublish": False,
    }


def verify_annotation_separation(shots):
    """Reject significant source/caption/disclosure collision in one shot.

    Annotation boxes are generated by render draw calls and are still only
    author declarations: this is NOT OCR, a visibility guarantee, or a
    replacement for inspecting actual encoded text on a real phone.
    Allow <=2 native px per axis of harmless box-edge rounding.
    """
    checked_pairs = 0
    for shot in shots:
        annotations = shot["annotations"]
        for i, a in enumerate(annotations):
            x1, y1, x2, y2 = a["boxPx"]
            for b in annotations[i + 1:]:
                checked_pairs += 1
                u1, v1, u2, v2 = b["boxPx"]
                dx = min(x2, u2) - max(x1, u1)
                dy = min(y2, v2) - max(y1, v1)
                if dx > 2 and dy > 2:
                    hold("OVERLAPPING_CRITICAL_TEXT:" + shot["id"] +
                         ":" + a["role"] + ":" + b["role"])
    return {"annotationPairsChecked": checked_pairs,
            "significantDeclaredTextCollisions": 0,
            "actualEncodedPixelSeparationVerified": False,
            "realHandsetPlaybackVerified": False,
            "mayPublish": False}


def projected_type_review(shots, native_width):
    """Expose tiny authored labels at phone width without pretending to inspect pixels.

    These are font declarations from the renderer's annotations. They are NOT
    OCR, rendered glyph-height measurements, contrast, physical phone tests or
    independent comprehension verdicts. A missing warning is never a PASS.
    """
    small = []
    checked = 0
    for shot in shots:
        for a in shot["annotations"]:
            checked += 1
            projected = round(a["fontPx"] * REFERENCE_PHONE_WIDTH_PX / native_width, 2)
            if projected < REVIEW_SMALL_TYPE_PX:
                small.append({
                    "shotId": shot["id"], "role": a["role"],
                    "text": a["text"], "declaredNativeFontPx": a["fontPx"],
                    "projectedAt375Px": projected,
                })
    return {
        "model": "declaration-only proportional width fit; not physical handset proof",
        "referenceScreenWidthPx": REFERENCE_PHONE_WIDTH_PX,
        "reviewThresholdPx": REVIEW_SMALL_TYPE_PX,
        "annotatedTextElements": checked,
        "smallDeclaredTextCount": len(small),
        "smallDeclaredText": small,
        "status": ("SMALL_DECLARED_TEXT_REQUIRES_REVIEW" if small
                   else "NO_SMALL_DECLARED_TEXT_FOUND_HANDSET_REVIEW_STILL_REQUIRED"),
        "actualRenderedGlyphsMeasured": False,
        "realHandsetReadabilityVerified": False,
        "mayPublish": False,
    }


def validate_manifest(m, *, width, height, duration, actual_sha):
    if not isinstance(m, dict) or m.get("status") != "RESEARCH_ONLY" or m.get("releaseApproved") is not False:
        hold("RESEARCH_ONLY_AND_EXPLICIT_RELEASE_HOLD_REQUIRED")
    if not is_hash(m.get("expectedVideoSha256")) or actual_sha != m["expectedVideoSha256"]:
        hold("EXACT_VIDEO_SHA_MISMATCH")
    if not isinstance(m.get("platforms"), list) or set(m["platforms"]) != {"tiktok", "shorts"}:
        hold("BOTH_PLATFORM_OVERLAYS_REQUIRED")
    if (width, height) != (1080, 1920):
        hold("NATIVE_PORTRAIT_FRAME_REQUIRED")
    if not number(duration) or duration <= 2:
        hold("FULL_FILM_DURATION_REQUIRED")
    hook = m.get("hook")
    if not isinstance(hook, dict) or any(not number(hook.get(k)) or not 0 <= hook[k] <= 2
        for k in ("textVisibleAtSec", "spokenOpeningAtSec", "heroVisualStartsAtSec")):
        hold("FIRST_TWO_SECOND_HOOK_TIMING_REQUIRED")
    shots = m.get("shots")
    verify_shots(shots, duration)
    for shot in shots:
        if shot.get("assetKind") not in ("deterministic_science", "nonfactual_illustration", "source_document", "editorial"):
            hold("SOURCE_ASSET_KIND_REQUIRED")
        anns = shot.get("annotations")
        if not isinstance(anns, list) or not anns:
            hold("SHOT_ANNOTATIONS_REQUIRED")
        roles = set()
        for a in anns:
            if not isinstance(a, dict) or a.get("role") not in ROLES or not valid_box(a.get("boxPx"), width, height):
                hold("INVALID_ANNOTATION_GEOMETRY")
            if not isinstance(a.get("text"), str) or not a["text"].strip():
                hold("VISIBLE_WORDING_NOT_DOCUMENTED")
            role, px = a["role"], a.get("fontPx")
            if not number(px) or px < (36 if role in ("hook", "caption", "disclosure") else 28):
                hold("TINY_CRITICAL_TYPE")
            x1, y1, x2, y2 = a["boxPx"]
            if y1 < TOP * height or x2 > (1 - RIGHT) * width or y2 > (1 - BOTTOM) * height:
                hold("CRITICAL_CONTENT_TOUCHES_PLATFORM_UI_ZONE")
            roles.add(role)
        if shot["assetKind"] == "nonfactual_illustration" and not any(
            a["role"] == "disclosure" and "illustration" in a["text"].lower() and "not proof" in a["text"].lower()
            for a in anns):
            hold("NONFACTUAL_BOTANICAL_DISCLOSURE_REQUIRED")
    separation = verify_annotation_separation(shots)
    # A declared text appearance must land inside a shot that actually carries
    # its hook annotation, not merely within the film's first two seconds.
    hook_time = hook["textVisibleAtSec"]
    if not any(s["startSec"] <= hook_time < s["endSec"] and
               any(a["role"] == "hook" for a in s["annotations"]) for s in shots):
        hold("HOOK_TIMESTAMP_NOT_IN_ANNOTATED_SHOT")
    if not any(a["role"] == "hook" for a in shots[0]["annotations"]):
        hold("MISSING_OPENING_HOOK_ANNOTATION")
    return {
        "status": "OVERLAY_PREFLIGHT_PASS_REVIEW_REQUIRED",
        "mayPublish": False,
        "realHandsetPlaybackVerified": False,
        "actualDecodedFramesInspectedByIndependentReviewer": False,
        "mutedComprehensionVerified": False,
        "sourceClaimsApproved": False,
        "nativeSourceResolutionVerified": False,
        "visualCraftApproved": False,
        "projectedMobileTypeReview": projected_type_review(shots, width),
        "declaredTextSeparation": separation,
        "note": "Caller annotations do not prove visible pixels or actual app UI layouts."
    }


def validate_critical_ink_receipt_join(receipt, *, film_sha, plan_sha):
    """Join a three-point ink-proxy receipt ONLY to its exact encoded film.

    Research receipt identity is not fresh pixel replay, OCR, human science,
    true handset readability, or permission to publish.
    """
    if not isinstance(receipt, dict):
        hold("CRITICAL_INK_RECEIPT_OBJECT_REQUIRED")
    schema = receipt.get("schema")
    old = schema == "ths-actual-native-teaching-ink-audit-v1"
    timed = schema == "ths-lane4-timed-variant-ink-probe-research-v1"
    if not (old or timed):
        hold("UNSUPPORTED_CRITICAL_INK_RECEIPT_SCHEMA")
    joined_movie = receipt.get("actualFilmSha256" if old else "filmSha256")
    joined_plan = receipt.get("actualPhonePlanSha256" if old else "phonePlanSha256")
    if not is_hash(joined_movie) or joined_movie != film_sha:
        hold("CRITICAL_INK_RECEIPT_DIFFERENT_FILM")
    if not is_hash(joined_plan) or joined_plan != plan_sha:
        hold("CRITICAL_INK_RECEIPT_DIFFERENT_PHONE_PLAN")
    if (receipt.get("mayPublish") is not False or
        receipt.get("realHandsetApproved") is not False or
        receipt.get("viewerComprehensionApproved") is not False):
        hold("CRITICAL_INK_RECEIPT_FORGED_APPROVAL")
    count = receipt.get("testedCriticalVisibleLabels" if old else "actualCriticalLabels")
    if type(count) is not int or count != 16:
        hold("SIXTEEN_ACTUAL_CRITICAL_LABELS_REQUIRED")
    if old:
        criteria = receipt.get("criteria")
        expected = {"actual_full_hd_text_ink_contrast",
                    "meaningful_instruction_text_persistence"}
        if (not isinstance(criteria, list) or len(criteria) != 2 or
            {item.get("code") for item in criteria if isinstance(item, dict)} != expected or
            any(not isinstance(item, dict) or item.get("passed") is not True
                for item in criteria) or
            receipt.get("additionalObjectivePoints") != 2 or
            receipt.get("exactSourceFrameSamplingVerified") is not True):
            hold("CRITICAL_INK_PROXY_CRITERIA_NOT_PROVEN")
        frames = receipt.get("exactDecodedSampleFrames")
    else:
        if (receipt.get("contrastProxyPass") is not True or
            receipt.get("persistenceProxyPass") is not True or
            receipt.get("previousVariantScoreEligible") is not False):
            hold("TIMED_CRITICAL_INK_PROXY_NOT_PROVEN")
        frames = receipt.get("actualEncodedSamples")
    if not isinstance(frames, list) or len(frames) != 27:
        hold("TWENTY_SEVEN_EXACT_INK_SAMPLES_REQUIRED")
    phases = {}
    for sample in frames:
        if not isinstance(sample, dict):
            hold("INVALID_CRITICAL_INK_FRAME_IDENTITY")
        pair = sample.get("sampleKey") if old else [sample.get("shot"), sample.get("phase")]
        index = sample.get("frameIndex") if old else sample.get("index")
        if (not isinstance(pair, (list, tuple)) or len(pair) != 2 or
            not all(isinstance(v, str) and v for v in pair) or
            pair[1] not in ("early", "middle", "late") or
            type(index) is not int or index < 0):
            hold("INVALID_CRITICAL_INK_FRAME_IDENTITY")
        scene, phase = pair
        phases.setdefault(scene, set())
        if phase in phases[scene]:
            hold("DUPLICATE_CRITICAL_INK_SAMPLE")
        phases[scene].add(phase)
    if len(phases) != 9 or any(v != {"early", "middle", "late"} for v in phases.values()):
        hold("NINE_THREE_PHASE_SHOTS_REQUIRED")
    return {
        "status": "EXACT_FILM_AND_PHONE_PLAN_INK_PROXY_RECEIPT_JOINED_RESEARCH_ONLY",
        "filmSha256": film_sha,
        "phonePlanSha256": plan_sha,
        "receiptSchema": schema,
        "sourceFramesClaimed": 27,
        "criticalLabelsClaimed": 16,
        "receiptMeasurementsIndependentlyReplayedHere": False,
        "actualGlyphsVerifiedByThisJoin": False,
        "actualPhoneComprehensionVerified": False,
        "mayPublish": False,
    }



def verify_claimed_ink_frames_belong_to_decoded_shots(ink, stamps, shots):
    """Bind a claimed 27-sample receipt to ACTUAL decoded shot/PTS membership.

    The separate ink/OCR joins validate claimed identities and lexical receipts,
    but cannot establish that an index actually exists in this encoded movie,
    lands inside its named shot, or precedes the next phase. Read actual PTS
    here after full-media decode and fail closed before persisting any receipt.
    This never inspects ink pixels or grants OCR/phone/science approval.
    """
    if not isinstance(ink, dict) or not isinstance(stamps, list) or not stamps:
        hold("INK_DECODED_FRAME_MEMBERSHIP_INPUT_REQUIRED")
    if not isinstance(shots, list) or len(shots) != 9:
        hold("INK_NINE_ACTUAL_SHOTS_REQUIRED")
    schema = ink.get("schema")
    if schema == "ths-lane4-timed-variant-ink-probe-research-v1":
        samples, old = ink.get("actualEncodedSamples"), False
    elif schema == "ths-actual-native-teaching-ink-audit-v1":
        samples, old = ink.get("exactDecodedSampleFrames"), True
    else:
        hold("INK_FRAME_MEMBERSHIP_UNSUPPORTED_SCHEMA")
    if not isinstance(samples, list) or len(samples) != 27:
        hold("INK_FRAME_MEMBERSHIP_REQUIRES_27_SAMPLES")
    names = [shot.get("id") for shot in shots if isinstance(shot, dict)]
    if len(names) != 9 or len(set(names)) != 9:
        hold("INK_FRAME_MEMBERSHIP_INVALID_SHOT_IDS")
    by_name = {shot["id"]: shot for shot in shots}
    actual = {}
    for sample in samples:
        if not isinstance(sample, dict):
            hold("INK_FRAME_MEMBERSHIP_INVALID_SAMPLE")
        pair = sample.get("sampleKey") if old else [sample.get("shot"), sample.get("phase")]
        index = sample.get("frameIndex") if old else sample.get("index")
        if (not isinstance(pair, (list, tuple)) or len(pair) != 2
            or pair[0] not in by_name or pair[1] not in ("early", "middle", "late")
            or type(index) is not int or not 0 <= index < len(stamps)):
            hold("INK_FRAME_INDEX_OR_SHOT_NOT_PRESENT_IN_DECODED_FILM")
        name, phase = pair
        key = (name, phase)
        if key in actual:
            hold("INK_DUPLICATE_DECODED_SHOT_PHASE")
        start = Decimal(str(by_name[name]["startSec"]))
        end = Decimal(str(by_name[name]["endSec"]))
        stamp = stamps[index]
        if not isinstance(stamp, Decimal) or not stamp.is_finite() or not start <= stamp < end:
            hold("INK_DECODED_FRAME_BELONGS_TO_DIFFERENT_SHOT")
        actual[key] = (index, stamp)
    required = {(name, phase) for name in names for phase in ("early", "middle", "late")}
    if set(actual) != required:
        hold("INK_INCOMPLETE_DECODED_SHOT_PHASE_COVERAGE")
    for name in names:
        a, m, z = (actual[(name, phase)][0] for phase in ("early", "middle", "late"))
        if not a < m < z:
            hold("INK_DECODED_PHASE_INDICES_NOT_IN_TEMPORAL_ORDER")
        # Merely ascending early/middle/late indices can all be from the
        # same opening tenth of a shot: a false persistence receipt. Compute
        # fractional position using this movie's decoded presentation times,
        # not guessed nominal frame counts or self-declared sample phases.
        start = Decimal(str(by_name[name]["startSec"]))
        duration = Decimal(str(by_name[name]["endSec"])) - start
        if not duration.is_finite() or duration <= 0:
            hold("INK_INVALID_DECLARED_SHOT_DURATION")
        early = (actual[(name, "early")][1] - start) / duration
        middle = (actual[(name, "middle")][1] - start) / duration
        late = (actual[(name, "late")][1] - start) / duration
        # Research sampling windows intentionally tolerate source-bound
        # frame quantization. They are not reader/handset approval.
        if (early > Decimal("0.40") or
            not Decimal("0.25") <= middle <= Decimal("0.75") or
            late < Decimal("0.60") or
            late - early < Decimal("0.50")):
            hold("INK_EARLY_MIDDLE_LATE_NOT_SPREAD_ACROSS_SHOT:" + name)
    return {
        "status": "EXACT_DECODED_SHOT_FRAME_MEMBERSHIP_RESEARCH_ONLY",
        "sampleFramesChecked": 27,
        "nineShotsThreeDistinctOrderedSamplesEach": True,
        "nineShotsThreePhasesSpanActualPresentationTime": True,
        "allClaimedIndicesAreRealDecodedFrames": True,
        "allClaimedFramePTSBelongToDeclaredShots": True,
        "inkPixelsIndependentlyReplayed": False,
        "ocrRerun": False,
        "realHandsetPlaybackVerified": False,
        "mayPublish": False,
    }


# Fixed nine-scene factual text corpus for this research film. The OCR join
# must not trust a self-authored receipt to redefine the expected science.
OCR_SOURCE_LABELS = {
    "sentence_1_part0": ("MITRAGYNINE", "No reaction"),
    "sentence_1_part1": ("7-OH", "No reaction"),
    "sentence_2": ("\u2013OH group: oxygen + hydrogen",),
    "sentence_3": ("Dots mark atoms. Lines mark bonds.",),
    "sentence_4": ("A possible\n3D shape.", "Computed 3D illustration \u2022 not filmed"),
    "sentence_5_part0": ("STRUCTURE",),
    "sentence_5_part1": ("HUMAN EXPERIENCE",),
    "source_hold": ("7-OH \u2022 CID 44301524",
                    "Mitragynine \u2022 CID 3034396",
                    "CID = compound record number"),
    "sentence_6": ("Look closer.", "Computed detail", "Hydrogens omitted"),
}


# This is a NEW film-specific OCR contract, not an amendment of the original
# 48-row source receipt: all other original science/source labels stay frozen.
# The replacement's single complete claim must be shown in scene 5 part 1.
OCR_SOURCE_LABELS_REPAIRED = {
    **OCR_SOURCE_LABELS,
    "sentence_5_part1": ("STRUCTURE ≠ HUMAN EXPERIENCE",),
}
OCR_SCHEMA_ORIGINAL = "ths-lane4-actual-decoded-ocr-research-v1"
OCR_SCHEMA_REPAIRED = "ths-lane4-actual-decoded-ocr-research-v2"


def ocr_words(text):
    return re.findall(r"[a-z0-9]+", text.casefold()) if isinstance(text, str) else []


def validate_exact_film_ocr_join(proof, ink, plan, *, film_sha, plan_sha):
    """Reject falsely imported 48-sample OCR receipts for this exact film.

    The verdict is provenance + machine-readable lexical comparison only.
    It does NOT rerun Tesseract, inspect phone pixels, or approve publishing.
    """
    schema = proof.get("schema") if isinstance(proof, dict) else None
    if schema not in (OCR_SCHEMA_ORIGINAL, OCR_SCHEMA_REPAIRED):
        hold("UNSUPPORTED_ACTUAL_GLYPH_OCR_SCHEMA")
    source_labels = (OCR_SOURCE_LABELS_REPAIRED if schema == OCR_SCHEMA_REPAIRED
                     else OCR_SOURCE_LABELS)
    if proof.get("movieSha256") != film_sha or proof.get("phonePlanSha256") != plan_sha:
        hold("GLYPH_OCR_DIFFERENT_FILM_OR_PLAN")
    for k in ("mayPublish", "physicalHandsetApproved", "viewerComprehensionApproved",
              "scienceApproved", "filmExcellentApproved"):
        if proof.get(k) is not False:
            hold("GLYPH_OCR_FORGED_APPROVAL")
    if (type(proof.get("framesPhysicallyExtracted")) is not int or
        proof["framesPhysicallyExtracted"] != 27 or
        type(proof.get("labelInstancesTested")) is not int or
        proof["labelInstancesTested"] != 48 or
        type(proof.get("wordSequenceRecovered")) is not int or
        proof["wordSequenceRecovered"] != 48 or
        proof.get("allThreePhasesLexicallyRecovered") is not True or
        not isinstance(proof.get("ocrEngineVersion"), str) or
        not proof["ocrEngineVersion"].startswith("tesseract ")):
        hold("GLYPH_OCR_INCOMPLETE_MACHINE_PROOF")
    if (not isinstance(ink, dict) or
        ink.get("schema") != "ths-lane4-timed-variant-ink-probe-research-v1"):
        hold("TIMED_INK_PROOF_REQUIRED_FOR_OCR_JOIN")
    sample_list = ink.get("actualEncodedSamples")
    if not isinstance(sample_list, list) or len(sample_list) != 27:
        hold("TIMED_INK_PROOF_REQUIRED_FOR_OCR_JOIN")
    sample_indices = {}
    for item in sample_list:
        if not isinstance(item, dict) or type(item.get("index")) is not int:
            hold("INVALID_REAL_FRAME_SAMPLE_FOR_OCR")
        key = (item.get("shot"), item.get("phase"))
        if key in sample_indices:
            hold("DUPLICATE_REAL_FRAME_SAMPLE_FOR_OCR")
        sample_indices[key] = item["index"]
    if len(sample_indices) != 27:
        hold("TIMED_INK_PROOF_REQUIRED_FOR_OCR_JOIN")
    if not isinstance(plan, dict) or not isinstance(plan.get("shots"), list):
        hold("ACTUAL_OCR_PHONE_PLAN_REQUIRED")
    by_scene = {s.get("id"): s for s in plan["shots"] if isinstance(s, dict)}
    if set(by_scene) != set(source_labels) or len(plan["shots"]) != 9:
        hold("NINE_ACTUAL_OCR_SCENES_REQUIRED")
    if schema == OCR_SCHEMA_REPAIRED:
        # Repaired-v2 must be one real, complete science annotation, not a
        # token union from unrelated boxes or a metadata-only patch to v1.
        annotations = by_scene["sentence_5_part1"].get("annotations")
        if not isinstance(annotations, list):
            hold("REPAIRED_NEGATION_SINGLE_SCIENCE_ANNOTATION_REQUIRED")
        science = [a for a in annotations if isinstance(a, dict)
                   and a.get("role") == "science"]
        science_text = [re.sub(r"\s+", " ", a.get("text", "").strip())
                        for a in science if isinstance(a.get("text"), str)]
        if science_text != ["STRUCTURE ≠ HUMAN EXPERIENCE"]:
            hold("REPAIRED_NEGATION_SINGLE_SCIENCE_ANNOTATION_REQUIRED")
    expected = {}
    for scene, terms in source_labels.items():
        annotations = by_scene[scene].get("annotations")
        if not isinstance(annotations, list):
            hold("ACTUAL_OCR_SOURCE_ANNOTATIONS_REQUIRED")
        for term in terms:
            matches = [a for a in annotations if isinstance(a, dict) and
                       a.get("role") in ("hook", "science", "disclosure", "source")
                       and ocr_words(a.get("text")) == ocr_words(term)]
            if schema == OCR_SCHEMA_REPAIRED and scene == "sentence_5_part1":
                matches = [a for a in matches if isinstance(a.get("text"), str)
                           and "≠" in a["text"]]
            if len(matches) != 1:
                hold("GLYPH_OCR_RECORDED_SOURCE_WORDS_CHANGED")
            for phase in ("early", "middle", "late"):
                expected[(scene, term, phase)] = sample_indices.get((scene, phase))
    rows = proof.get("observations")
    if not isinstance(rows, list) or len(rows) != 48:
        hold("FORTY_EIGHT_REAL_OCR_ROWS_REQUIRED")
    seen = set()
    for row in rows:
        if not isinstance(row, dict) or not isinstance(row.get("expected"), str):
            hold("INVALID_ACTUAL_OCR_ROW")
        scene, term, phase = row.get("scene"), row.get("expected"), row.get("phase")
        key = (scene, term, phase)
        if key not in expected or key in seen:
            hold("GLYPH_OCR_UNKNOWN_OR_DUPLICATE_LABEL")
        seen.add(key)
        if (type(row.get("frameIndex")) is not int or
            row["frameIndex"] != expected[key]):
            hold("GLYPH_OCR_WRONG_DECODED_FRAME")
        if (row.get("wordSequenceRecovered") is not True or
            row.get("expectedTokens") != ocr_words(term) or
            row.get("recognizedTokens") != ocr_words(row.get("recognized")) or
            row["recognizedTokens"] != ocr_words(term)):
            hold("GLYPH_OCR_WORDS_NOT_RECOVERED")
        if schema == OCR_SCHEMA_REPAIRED and scene == "sentence_5_part1":
            raw = row.get("recognized")
            if not isinstance(raw, str) or "≠" not in raw:
                hold("GLYPH_OCR_NEGATION_OPERATOR_NOT_RECOVERED")
            # Word tokens deliberately omit mathematical operators. Never
            # allow an OCR receipt such as "≠ STRUCTURE HUMAN EXPERIENCE"
            # or "STRUCTURE HUMAN ≠ EXPERIENCE" to prove the assertion.
            if re.sub(r"\s+", " ", raw.strip()).casefold() != "structure ≠ human experience":
                hold("GLYPH_OCR_COMPLETE_NEGATION_SEQUENCE_NOT_RECOVERED")
        if not is_hash(row.get("cropSha256")):
            hold("GLYPH_OCR_CROP_PROVENANCE_MISSING")
    if set(expected) != seen:
        hold("GLYPH_OCR_INCOMPLETE_LABEL_PHASE_COVERAGE")
    return {
        "status": "EXACT_FILM_OCR_LEXICAL_PROVENANCE_RESEARCH_ONLY",
        "filmSha256": film_sha, "phonePlanSha256": plan_sha,
        "ocrContractSchema": schema,
        "observationsClaimed": 48, "labelsClaimed": 16, "scenesClaimed": 9,
        "ocrRerunByThisJoin": False, "exactPunctuationVerified": False,
        "physicalHandsetVerified": False, "viewerComprehensionApproved": False,
        "sourceScienceApproved": False, "mayPublish": False,
    }




def mute_story_negative_screen(plan, glyph_proof):
    """Screen source-bound mute-first teaching continuity, not understanding.

    Call ONLY after an independently pinned exact-film OCR receipt joined
    successfully. Detection finds semantic gaps; absence of a finding is
    never a real audience, handset, voice, science, or publishing approval.
    """
    if not isinstance(plan, dict) or not isinstance(plan.get("shots"), list):
        hold("MUTED_STORY_PLAN_REQUIRED")
    shots = plan["shots"]
    order = list(OCR_SOURCE_LABELS)
    if [s.get("id") if isinstance(s, dict) else None for s in shots] != order:
        hold("MUTED_STORY_EXACT_SHOT_ORDER_REQUIRED")
    if not isinstance(glyph_proof, dict) or not isinstance(glyph_proof.get("observations"), list):
        hold("MUTED_STORY_ACTUAL_OCR_OBSERVATIONS_REQUIRED")
    byid = {s["id"]: s for s in shots}
    raw_rows = glyph_proof["observations"]
    # The caller's join has already checked exact film+plan hashes, 48 rows,
    # decoded-frame indices, claim words, crop SHA shape and approval flags.
    required = {
        "comparison_named": (("sentence_1_part0", "MITRAGYNINE"),
                             ("sentence_1_part1", "7-OH")),
        "chemical_group_explained": (("sentence_2", "–OH group: oxygen + hydrogen"),),
        "computed_not_filmed": (("sentence_4", "Computed 3D illustration • not filmed"),),
        "two_source_cids": (("source_hold", "7-OH • CID 44301524"),
                            ("source_hold", "Mitragynine • CID 3034396")),
    }
    recognized = set()
    for row in raw_rows:
        if not isinstance(row, dict):
            hold("MUTED_STORY_INVALID_OCR_OBSERVATION")
        tokens = ocr_words(row.get("recognized"))
        if (row.get("recognizedTokens") != tokens or
            row.get("expectedTokens") != ocr_words(row.get("expected")) or
            row.get("wordSequenceRecovered") is not True):
            hold("MUTED_STORY_OCR_WORDS_MUST_MATCH_ACTUAL_RECOGNIZED_TEXT")
        recognized.add((row.get("scene"), row.get("phase"),
                        tuple(tokens)))
    facts = {key: all((scene, phase, tuple(ocr_words(term))) in recognized
                      for scene, term in pairs
                      for phase in ("early", "middle", "late"))
             for key, pairs in required.items()}
    findings = []
    for name, verified in facts.items():
        if not verified:
            findings.append("MISSING_MUTED_SCIENCE_FACT_" + name.upper())
    part = byid["sentence_5_part1"]
    annotations = part.get("annotations")
    if not isinstance(annotations, list):
        hold("MUTED_STORY_SHOT_5_ANNOTATIONS_REQUIRED")
    texts = [a.get("text", "") for a in annotations
             if isinstance(a, dict) and a.get("role") == "science"]
    words_in_shot = [ocr_words(t) for t in texts]
    subject = any("structure" in w for w in words_in_shot)
    human = any("human" in w and "experience" in w for w in words_in_shot)
    negate = any("≠" in t for t in texts)
    same_shot_declared = subject and human and negate
    if not same_shot_declared:
        findings.append("NEGATION_ANTECEDENT_SPLIT_ACROSS_CUT")
    # Require words within ONE independently decoded text crop, not one word
    # in each of two consecutive shots and not a union of distinct text crops.
    same_shot_ocr = all(
        any(row.get("scene") == "sentence_5_part1"
            and row.get("phase") == phase
            and "structure" in ocr_words(row.get("recognized"))
            and "human" in ocr_words(row.get("recognized"))
            and "experience" in ocr_words(row.get("recognized"))
            for row in raw_rows if isinstance(row, dict))
        for phase in ("early", "middle", "late"))
    if not same_shot_ocr:
        findings.append("NO_EXACT_ENCODED_SAME_SHOT_NEGATION_OCR_PROOF")
    # Even all three words plus a ≠ glyph in one crop can reverse or
    # destroy the relationship if the operator is positioned incorrectly.
    # Enforce the SAME ordered normalized sentence as the repaired-v2 OCR
    # intake, including a natural line wrap but not word reordering.
    # This is still self-reported OCR, not direct pixel/handset proof.
    same_shot_operator_ocr = all(
        any(row.get("scene") == "sentence_5_part1"
            and row.get("phase") == phase
            and isinstance(row.get("recognized"), str)
            and re.sub(r"\s+", " ", row["recognized"].strip()).casefold()
                == "structure ≠ human experience"
            for row in raw_rows if isinstance(row, dict))
        for phase in ("early", "middle", "late"))
    if not same_shot_operator_ocr:
        findings.append("NO_EXACT_ENCODED_NEGATION_OPERATOR_OCR_PROOF")
    review = any(a.get("text") == "No reaction"
                 for scene in ("sentence_1_part0", "sentence_1_part1")
                 for a in byid[scene].get("annotations", [])
                 if isinstance(a, dict))
    return {
        "schema": "ths-lane4-mute-continuity-negative-screen-v1",
        "verdict": "HOLD" if findings else "MECHANICAL_WORD_SCREEN_ONLY_REVIEW_REQUIRED",
        "actualOCRRequiredScienceFacts": facts,
        "negationSubjectObjectAndOperatorDeclaredSameShot": same_shot_declared,
        "subjectAndObjectOCRWithinSameShotAllThreeTimes": same_shot_ocr,
        "subjectObjectAndOperatorOCRInSameCropAllThreeTimes": same_shot_operator_ocr,
        "blockingFindings": findings,
        "advisoryFindings": (["NO_REACTION_WORDING_NEEDS_SEMANTIC_REVIEW"]
                             if review else []),
        "inequalitySymbolDecodedAndIndependentlyVerified": False,
        "mutedAudienceComprehensionApproved": False,
        "realHandsetPlaybackApproved": False,
        "qualifiedScienceApproved": False,
        "mayPublish": False,
    }



def probe_movie(movie):
    # Inspect ALL streams. Selecting only v:0 hid extra video tracks and
    # allowed a correctly timed non-H.264 stream to masquerade as a verified
    # source video. Muted H.264 films remain eligible for research inspection;
    # an audio-bearing film must have exactly one AAC track.
    cmd = ["ffprobe", "-v", "error", "-show_entries",
           "stream=codec_type,codec_name,profile,level,width,height,avg_frame_rate,pix_fmt,sample_aspect_ratio,color_transfer,color_primaries,color_space",
           "-show_entries", "stream_tags=rotate:stream_side_data=side_data_type,rotation,displaymatrix",
           "-show_entries", "format=duration,format_name:format_tags=major_brand",
           "-of", "json", str(movie)]
    data = json.loads(subprocess.run(cmd, capture_output=True, text=True, timeout=20, check=True).stdout)
    streams = data.get("streams")
    if not isinstance(streams, list):
        hold("MOVIE_STREAM_INVENTORY_MISSING")
    videos = [s for s in streams if s.get("codec_type") == "video"]
    audios = [s for s in streams if s.get("codec_type") == "audio"]
    if len(videos) != 1 or len(audios) > 1 or len(videos) + len(audios) != len(streams):
        hold("UNEXPECTED_MOVIE_STREAM_LAYOUT")
    track = videos[0]
    if track.get("codec_name") != "h264":
        hold("EXPECTED_H264_VIDEO_CODEC")
    if audios and audios[0].get("codec_name") != "aac":
        hold("EXPECTED_AAC_AUDIO_CODEC")
    # ffprobe stream codecs and a .mp4 filename are not a delivery-container
    # identity: actual Matroska can be renamed to .mp4, and QuickTime MOV
    # shares FFprobe's demuxer name with ISO BMFF MP4. Inspect both the
    # detected family and physical major-brand declaration. Fail closed on
    # absent/unsupported brands instead of calling those mobile MP4.
    container = data.get("format")
    if not isinstance(container, dict):
        hold("MOVIE_CONTAINER_INVENTORY_MISSING")
    if container.get("format_name") != "mov,mp4,m4a,3gp,3g2,mj2":
        hold("EXPECTED_MP4_CONTAINER")
    fmt_tags = container.get("tags")
    if not isinstance(fmt_tags, dict) or fmt_tags.get("major_brand") not in (
            "isom", "iso2", "iso4", "iso5", "iso6",
            "mp41", "mp42", "avc1", "M4V ", "MSNV", "dash"):
        hold("EXPECTED_ISO_MP4_MAJOR_BRAND")
    # Codec+dimensions alone do NOT guarantee an ordinary portrait phone
    # image. H.264 4:4:4 is poorly supported by typical mobile decoders,
    # while non-square sample pixels alter displayed dimensions and move
    # rendered text relative to the phone safe-area exclusion rectangles.
    # Reject unknown declarations instead of calling them 1:1/yuv420p.
    if track.get("pix_fmt") != "yuv420p":
        hold("EXPECTED_MOBILE_YUV420P_PIXEL_FORMAT")
    if track.get("sample_aspect_ratio") != "1:1":
        hold("EXPECTED_SQUARE_VIDEO_SAMPLE_PIXELS")
    # A native 8-bit H.264 stream can still declare HDR PQ/HLG transfer,
    # BT.2020 primaries or a non-SDR color matrix. A display pipeline may
    # then remap text contrast/hues relative to the decoded RGB phone
    # overlays, which are authored as SDR. Preserve the valid historical
    # x264 default (unspecified) and explicitly signaled BT.709 only;
    # neither case is a substitute for physical phone contrast review.
    for field in ("color_transfer", "color_primaries", "color_space"):
        if track.get(field) not in (None, "unknown", "bt709"):
            hold("NON_SDR_PHONE_COLOR_METADATA:" + field)
    # MP4's track-header display matrix may rotate, reflect or translate a
    # perfectly square-pixel H.264 stream *at display time*. Raw FFmpeg
    # screenshot coordinates are not proof of phone safe-area geometry when
    # the player applies this transformation. Check the full matrix, not
    # only the reported "rotation" angle: translations can have 0 degrees.
    tags = track.get("tags", {})
    if not isinstance(tags, dict):
        hold("INVALID_VIDEO_DISPLAY_METADATA")
    if "rotate" in tags:
        try:
            tagged_rotation = Decimal(str(tags["rotate"]))
        except (InvalidOperation, ValueError, TypeError):
            hold("INVALID_VIDEO_DISPLAY_METADATA")
        if not tagged_rotation.is_finite() or tagged_rotation != 0:
            hold("NONIDENTITY_VIDEO_DISPLAY_TRANSFORM")
    side_data = track.get("side_data_list", [])
    if not isinstance(side_data, list):
        hold("INVALID_VIDEO_DISPLAY_METADATA")
    for item in side_data:
        if not isinstance(item, dict):
            hold("INVALID_VIDEO_DISPLAY_METADATA")
        if item.get("side_data_type") != "Display Matrix":
            continue
        raw_matrix = item.get("displaymatrix")
        if not isinstance(raw_matrix, str):
            hold("INVALID_VIDEO_DISPLAY_METADATA")
        rows = re.findall(
            r"(?m)^\s*[0-9a-fA-F]{8}:\s*([+-]?\d+)\s+([+-]?\d+)\s+([+-]?\d+)\s*$",
            raw_matrix)
        if len(rows) != 3:
            hold("INVALID_VIDEO_DISPLAY_METADATA")
        coefficients = tuple(int(value) for row in rows for value in row)
        if coefficients != (65536, 0, 0, 0, 65536, 0, 0, 0, 1073741824):
            hold("NONIDENTITY_VIDEO_DISPLAY_TRANSFORM")
        if "rotation" in item:
            try:
                matrix_rotation = Decimal(str(item["rotation"]))
            except (InvalidOperation, ValueError, TypeError):
                hold("INVALID_VIDEO_DISPLAY_METADATA")
            if not matrix_rotation.is_finite() or matrix_rotation != 0:
                hold("NONIDENTITY_VIDEO_DISPLAY_TRANSFORM")
    numerator, denominator = map(int, track["avg_frame_rate"].split("/"))
    if denominator == 0 or abs(numerator / denominator - 30) > .6:
        hold("AVERAGE_RATE_NOT_30FPS")
    # Format duration includes AAC priming/padding and may overrun the video
    # timeline. Shot coverage must use the actual decoded video frame count.
    container_duration = float(data["format"]["duration"])
    # Reuse the already-tested native audit's *actual per-frame timestamps*:
    # avg_frame_rate alone can falsely certify a variable-frame-rate movie.
    try:
        stamps = frame_timestamps(movie)
        nominal_step = Decimal(1) / Decimal(30)
        tolerance = Decimal("0.001")
        if not stamps or len(stamps) > 18000 or any(not t.is_finite() for t in stamps):
            hold("DECODED_FRAME_TIMESTAMPS_MISSING")
        origin = stamps[0]
        # A regular 30fps grid may still begin a frame late. That silently
        # loses the first screen instant and weakens first-frame hook proof.
        # Bind display-frame zero to actual PTS zero, not just relative CFR.
        if abs(origin) > tolerance:
            hold("NONZERO_FIRST_DECODED_FRAME_PTS")
        if any(abs(stamp - nominal_step * index) > tolerance
               for index, stamp in enumerate(stamps)):
            hold("NONCONSTANT_DECODED_FRAME_TIMING")
        duration = len(stamps) / 30
        if not math.isfinite(container_duration) or abs(duration - container_duration) > .12:
            hold("VIDEO_FRAME_COUNT_DURATION_MISMATCH")
    except (subprocess.CalledProcessError, OSError, ValueError, InvalidOperation,
            UnicodeError, KeyError, IndexError) as exc:
        if isinstance(exc, ValueError) and str(exc).startswith("PHONE_UI_HOLD:"):
            raise
        hold("FRAME_TIMESTAMP_EXTRACTION_FAILED")
    # Keep earlier concrete semantic failures (4:4:4, wrong PTS cadence,
    # altered display geometry) visible instead of masking them with broad
    # codec compatibility. The profile/level screen is still mandatory
    # before returning an accepted movie inventory to the caller.
    # H.264 alone does not establish a portable mobile decoder target.
    # Reject advanced profiles and SPS levels above 4.2; at 1080x1920/30fps
    # the accepted ceiling has adequate macroblock capacity, while Level
    # 5.x/6.x may demand capabilities absent on older phone decoders.
    # Read the encoded stream profile/level, not the FFmpeg preset or extension.
    if track.get("profile") not in ("Constrained Baseline", "Baseline", "Main", "High"):
        hold("UNSUPPORTED_PHONE_H264_PROFILE")
    level = track.get("level")
    if type(level) is not int or not 9 <= level <= 42:
        hold("UNSUPPORTED_PHONE_H264_LEVEL")
    return int(track["width"]), int(track["height"]), duration, len(stamps)

def verify_complete_media_decode(movie):
    """Strictly decode every video frame and any audio track before review.

    A complete ffprobe PTS grid can coexist with bitstream corruption in an
    unsampled frame. -xerror and explode convert such decode failures to a
    nonzero FFmpeg exit. A successful decode is a *technical* negative filter,
    never a handset, science, narration-identity or release acceptance.
    """
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin",
           "-xerror", "-err_detect", "explode", "-i", str(movie),
           "-map", "0", "-f", "null", "-"]
    try:
        subprocess.run(cmd, capture_output=True, timeout=120, check=True)
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, OSError):
        hold("FULL_ENCODED_MEDIA_DECODE_FAILED")
    return {
        "allMappedStreamsDecodedWithoutFatalErrors": True,
        "decoder": "FFMPEG_XERROR_EXPLODE_NULL_OUTPUT",
        "rawDecodedFramesIndependentlyComparedToRenderer": False,
        "originalNarratorIdentityVerified": False,
        "scientificContentVerified": False,
        "realHandsetPlaybackApproved": False,
        "mayPublish": False,
    }



def measure_targeted_encoded_right_ui_ink(movie, *, expected_film_sha, frame_indices, roi,
                                           pixel_mode="bright_neutral_caption"):
    """Produce a nonpublishing full-window physical-pixel research receipt.

    This is a narrow, manually targeted encoded-pixel negative screen for
    cases like the actual revised Shot5 NOT SHOWN UI-zone overflow. Supply
    either exactly 3 ordered sparse phase frames OR 4-150 consecutive indices
    for complete bounded-window coverage; no sparse result can prove that
    intervening frames are clear. It uses FFmpeg's true decoded display-order
    frames, NOT storyboard declarations or earlier movies' ink/word receipts.
    By default the ROI must be prequalified as critical light text. An
    explicitly requested "scientific_visual_highlights" mode screens
    strongly visible saturated or bright science-art details instead; its ROI
    must be independently identified as important scientific illustration.
    Decorative graphics can trigger false alarms. Neither mode recognizes
    words, dark artwork or meaning. Zero detections do NOT prove text position,
    phone legibility, complete scientific visuals or release fitness.
    """
    if pixel_mode not in ("bright_neutral_caption", "scientific_visual_highlights"):
        hold("TARGETED_UI_PROBE_EXPLICIT_SUPPORTED_PIXEL_MODE_REQUIRED")
    movie = Path(movie)
    if not is_hash(expected_film_sha) or sha256_file(movie) != expected_film_sha:
        hold("TARGETED_UI_PROBE_EXACT_FILM_SHA_MISMATCH")
    width, height, _, frames = probe_movie(movie)
    # Three sparse samples remain useful for fast triage, but can miss
    # a real transient caption crossing the UI zone between those samples.
    # A longer request MUST enumerate *every* index in a bounded contiguous
    # window, with no silently omitted in-between physical frames.
    if (not isinstance(frame_indices, list) or
        not 3 <= len(frame_indices) <= 150 or
        any(type(index) is not int or index < 0 or index >= frames
            for index in frame_indices) or
        frame_indices != sorted(set(frame_indices))):
        hold("TARGETED_UI_PROBE_BOUNDED_DISTINCT_PRESENTED_FRAMES_REQUIRED")
    full_window = len(frame_indices) > 3
    if full_window and frame_indices != list(range(frame_indices[0], frame_indices[-1] + 1)):
        hold("TARGETED_UI_PROBE_FULL_WINDOW_MUST_BE_CONTIGUOUS")
    if (not isinstance(roi, list) or len(roi) != 4 or
        any(type(value) is not int for value in roi)):
        hold("TARGETED_UI_PROBE_NATIVE_TEXT_ROI_REQUIRED")
    x0, y0, x1, y1 = roi
    right_start = int((1 - RIGHT) * width)
    if (not 0 <= x0 < right_start < x1 <= width or
        not int(TOP * height) <= y0 < y1 <= int((1 - BOTTOM) * height) or
        (x1 - x0) * (y1 - y0) > 150000):
        hold("TARGETED_UI_PROBE_ROI_MUST_CROSS_RIGHT_EXCLUSION")
    crop_width, crop_height = x1 - x0, y1 - y0
    select = (f"between(n\\,{frame_indices[0]}\\,{frame_indices[-1]})"
              if full_window else
              "+".join(f"eq(n\\,{index})" for index in frame_indices))
    # YUV420P's crop filter defaults to rounding odd native x/y positions
    # to the chroma grid. An ROI at x=861 can silently decode from x=860
    # while our exclusion math still believes x=861, falsely counting
    # safe x=863 text as forbidden x=864. Preserve requested coordinates.
    vf = (f"select={select},"
          f"crop={crop_width}:{crop_height}:{x0}:{y0}:exact=1,format=bgr24")
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin",
           "-xerror", "-err_detect", "explode", "-i", str(movie), "-an",
           "-vf", vf, "-fps_mode", "vfr",
           "-frames:v", str(len(frame_indices)),
           "-f", "rawvideo", "-pix_fmt", "bgr24", "pipe:1"]
    try:
        result = subprocess.run(cmd, capture_output=True, timeout=90, check=True)
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, OSError):
        hold("TARGETED_UI_PROBE_DECODE_FAILED")
    one_frame_bytes = crop_width * crop_height * 3
    if len(result.stdout) != one_frame_bytes * len(frame_indices):
        hold("TARGETED_UI_PROBE_INCOMPLETE_DECODED_FRAME_SELECTION")
    if sha256_file(movie) != expected_film_sha:
        hold("TARGETED_UI_PROBE_VIDEO_CHANGED_DURING_DECODE")
    observations = []
    for phase, index in enumerate(frame_indices):
        crop = memoryview(result.stdout)[
            phase * one_frame_bytes:(phase + 1) * one_frame_bytes]
        observed, xmax = 0, None
        for y in range(crop_height):
            for x in range(right_start - x0, crop_width):
                at = (y * crop_width + x) * 3
                blue, green, red = crop[at:at + 3]
                low, high = min(blue, green, red), max(blue, green, red)
                if pixel_mode == "bright_neutral_caption":
                    detected = low >= 160 and red - blue < 70
                else:
                    # Conservative science-art visibility proxy, not a
                    # molecule/atom segmentation model. Supports distinct
                    # colored atoms and light bonds on a prequalified dark
                    # panel. Purely dark content can still be missed.
                    detected = high >= 100 and (high - low >= 20 or low >= 75)
                if detected:
                    observed += 1
                    xmax = x0 + x
        row = {
            "decodedFrameIndex": index,
            "targetPixelsInRightExclusion": observed,
            "rightmostDetectedX": xmax,
        }
        if pixel_mode == "bright_neutral_caption":
            row["brightNeutralPixelsInRightExclusion"] = observed
        observations.append(row)
    violations = [row for row in observations
                  if row["targetPixelsInRightExclusion"]]
    code = ("TARGETED_CRITICAL_INK_RIGHT_UI_EXCLUSION"
            if pixel_mode == "bright_neutral_caption" else
            "TARGETED_CRITICAL_ART_RIGHT_UI_EXCLUSION")
    first = violations[0] if violations else None
    return {
        "status": (code + "_HOLD" if violations else
                   "NO_TARGETED_RIGHT_UI_HIGHLIGHTS_DETECTED_REVIEW_REQUIRED"),
        "publicationVerdict": "HOLD",
        "violationCode": (code + ":" + str(first["decodedFrameIndex"]) + ":" +
                          str(first["targetPixelsInRightExclusion"])) if first else None,
        "violatingFrameCount": len(violations),
        "firstViolatingFrameIndex": first["decodedFrameIndex"] if first else None,
        "lastViolatingFrameIndex": (violations[-1]["decodedFrameIndex"]
                                   if violations else None),
        "maxViolatingPixelCount": max(
            (v["targetPixelsInRightExclusion"] for v in violations), default=0),
        "pixelMode": pixel_mode,
        "filmSha256": expected_film_sha,
        "targetedRoiPx": roi,
        "rightUiExclusionBeginsNativeX": right_start,
        "actualDecodedPixelObservations": observations,
        "decodedFramesExamined": len(observations),
        "everyFrameInRequestedWindowChecked": full_window,
        "targetTextSemanticsVerified": False,
        "darkOrColoredInkExcluded": False,
        "scientificVisualContentIndependentlyIdentified": False,
        "actualPhoneLayoutVerified": False,
        "viewerReadabilityVerified": False,
        "mayPublish": False,
    }


def screen_targeted_encoded_right_ui_ink(movie, *, expected_film_sha, frame_indices, roi,
                                          pixel_mode="bright_neutral_caption"):
    """Strict default: reject ANY violating encoded pixel, never return green.

    Diagnostics may report every detected frame, but cannot silently convert
    a failed negative-screen review into an acceptable film verdict.
    """
    receipt = measure_targeted_encoded_right_ui_ink(
        movie, expected_film_sha=expected_film_sha,
        frame_indices=frame_indices, roi=roi, pixel_mode=pixel_mode)
    if receipt["violationCode"] is not None:
        hold(receipt["violationCode"])
    return receipt


def measure_whole_encoded_right_ui_ink(movie, *, expected_film_sha,
                                      expected_frames, roi,
                                      pixel_mode="bright_neutral_caption",
                                      window_frames=120):
    """Research-only exhaustive right UI ink screen, including every frame.

    Reuse the already-tested 4..150-frame physical decoder in bounded windows,
    then verify a contiguous, once-only complete-film observation series.
    Three-frame sparse probes cannot substitute for this whole-film receipt.
    No scene semantics, real platform layout, handset or publication approval.
    """
    if (type(expected_frames) is not int or not 10 <= expected_frames <= 1800 or
            type(window_frames) is not int or not 8 <= window_frames <= 150):
        hold("WHOLE_UI_SCREEN_BOUNDED_FRAME_COUNTS_REQUIRED")
    movie = Path(movie)
    if not is_hash(expected_film_sha) or sha256_file(movie) != expected_film_sha:
        hold("WHOLE_UI_SCREEN_EXACT_FILM_SHA_MISMATCH")
    width, height, _, n = probe_movie(movie)
    if n != expected_frames:
        hold("WHOLE_UI_SCREEN_EXACT_FRAME_COUNT_MISMATCH")
    observations = []
    windows = []
    cursor = 0
    while cursor < n:
        count = min(window_frames, n - cursor)
        remaining = n - cursor - count
        # The existing decoder's 3-frame mode is explicitly SPARSE.
        # Never let a final 1..3 frames be silently treated as a full window.
        if 0 < remaining < 4:
            count -= 4 - remaining
        if count < 4:
            hold("WHOLE_UI_SCREEN_CANNOT_COVER_FINAL_WINDOW")
        indices = list(range(cursor, cursor + count))
        receipt = measure_targeted_encoded_right_ui_ink(
            movie, expected_film_sha=expected_film_sha,
            frame_indices=indices, roi=roi, pixel_mode=pixel_mode)
        rows = receipt.get("actualDecodedPixelObservations")
        # A window counted under another optical rule or a displaced crop
        # is not evidence for this exact film-wide screen. Verify returned
        # scope and the window's internal counter before accepting its rows.
        # The child remains a negative research screen, never release proof.
        forbidden_width = roi[2] - int((1 - RIGHT) * width)
        max_forbidden_pixels = forbidden_width * (roi[3] - roi[1])
        if (receipt.get("filmSha256") != expected_film_sha or
                receipt.get("targetedRoiPx") != roi or
                receipt.get("pixelMode") != pixel_mode or
                receipt.get("rightUiExclusionBeginsNativeX") !=
                    int((1 - RIGHT) * width) or
                receipt.get("decodedFramesExamined") != count or
                receipt.get("publicationVerdict") != "HOLD" or
                receipt.get("mayPublish") is not False or
                receipt.get("actualPhoneLayoutVerified") is not False or
                receipt.get("everyFrameInRequestedWindowChecked") is not True or
                not isinstance(rows, list) or len(rows) != count or
                any(not isinstance(row, dict) or
                    type(row.get("decodedFrameIndex")) is not int or
                    row["decodedFrameIndex"] != index or
                    type(row.get("targetPixelsInRightExclusion")) is not int or
                    not 0 <= row["targetPixelsInRightExclusion"] <= max_forbidden_pixels or
                    (row.get("rightmostDetectedX") is None) !=
                        (row["targetPixelsInRightExclusion"] == 0) or
                    (row["targetPixelsInRightExclusion"] > 0 and
                     (type(row["rightmostDetectedX"]) is not int or
                      not int((1 - RIGHT) * width) <=
                          row["rightmostDetectedX"] < roi[2]))
                    for index, row in zip(indices, rows)) or
                receipt.get("violatingFrameCount") != sum(
                    row["targetPixelsInRightExclusion"] > 0 for row in rows) or
                receipt.get("firstViolatingFrameIndex") != next(
                    (row["decodedFrameIndex"] for row in rows
                     if row["targetPixelsInRightExclusion"] > 0), None)):
            hold("WHOLE_UI_SCREEN_INVALID_WINDOW_RECEIPT")
        observations.extend(rows)
        windows.append({"firstFrame": cursor, "lastFrame": cursor + count - 1})
        cursor += count
    if (len(observations) != n or
            any(row["decodedFrameIndex"] != i
                for i, row in enumerate(observations))):
        hold("WHOLE_UI_SCREEN_MISSING_DUPLICATE_OR_UNORDERED_FRAME")
    if sha256_file(movie) != expected_film_sha:
        hold("WHOLE_UI_SCREEN_FILM_CHANGED_DURING_REVIEW")
    unsafe = [row for row in observations
              if row["targetPixelsInRightExclusion"] > 0]
    first = unsafe[0] if unsafe else None
    return {
        "schema": "ths-lane4-exhaustive-encoded-right-ui-negative-v1",
        "filmSha256": expected_film_sha,
        "expectedFrames": expected_frames,
        "decodedFramesExamined": n,
        "wholeFilmFramesCoveredExactlyOnce": True,
        "windowCount": len(windows),
        "windows": windows,
        "targetedRoiPx": list(roi),
        "pixelMode": pixel_mode,
        "rightUiExclusionBeginsNativeX": int((1 - RIGHT) * width),
        "violationCount": len(unsafe),
        "firstViolatingFrameIndex": first["decodedFrameIndex"] if first else None,
        "lastViolatingFrameIndex": unsafe[-1]["decodedFrameIndex"] if unsafe else None,
        "maxViolatingPixelCount": max(
            (row["targetPixelsInRightExclusion"] for row in unsafe), default=0),
        "actualDecodedPixelObservations": observations,
        "status": ("WHOLE_FILM_RIGHT_UI_EXCLUSION_REVIEW_HOLD" if unsafe else
                   "WHOLE_FILM_NEGATIVE_SCREEN_EMPTY_REVIEW_STILL_REQUIRED"),
        "publicationVerdict": "HOLD",
        "contentActuallyOCRVerified": False,
        "realPlatformUiMaskVerified": False,
        "handsetApproved": False,
        "scienceApproved": False,
        "mayPublish": False,
    }


def screen_whole_encoded_right_ui_ink(movie, *, expected_film_sha,
                                     expected_frames, roi,
                                     pixel_mode="bright_neutral_caption",
                                     window_frames=120):
    """Strict whole-film negative screen: no positive release verdict."""
    receipt = measure_whole_encoded_right_ui_ink(
        movie, expected_film_sha=expected_film_sha,
        expected_frames=expected_frames, roi=roi,
        pixel_mode=pixel_mode, window_frames=window_frames)
    if receipt["violationCount"]:
        hold("WHOLE_FILM_RIGHT_UI_EXCLUSION:" +
             str(receipt["firstViolatingFrameIndex"]) + ":" +
             str(receipt["violationCount"]))
    return receipt


def choose_decoded_sample(stamps, shot, requested_sec):
    """Select the closest actual presentation timestamp *within* the shot.

    A time seek alone may decode the preceding/following cut's frame, so the
    audit must preserve exact presented-frame identity with each screenshot.
    """
    if not stamps:
        hold("NO_DECODED_FRAMES_FOR_SAMPLE")
    start = Decimal(str(shot["startSec"]))
    end = Decimal(str(shot["endSec"]))
    target = Decimal(str(requested_sec))
    if target < start or target >= end:
        hold("SAMPLE_TIME_OUTSIDE_DECLARED_SHOT")
    lo = bisect_left(stamps, start)
    hi = bisect_left(stamps, end)
    if lo >= hi:
        hold("NO_PRESENTED_FRAME_IN_SAMPLE_SHOT")
    idx = bisect_left(stamps, target, lo, hi)
    if idx >= hi:
        idx = hi - 1
    elif idx > lo and abs(stamps[idx - 1] - target) <= abs(stamps[idx] - target):
        idx -= 1
    return idx, stamps[idx]


def decoded_overlay(movie, frame_index, shot, destination, width, height):
    x = int((1 - RIGHT) * width)
    y = int((1 - BOTTOM) * height)
    top = int(TOP * height)
    overlays = [
        f"drawbox=x=0:y=0:w={width}:h={top}:color=red@0.42:t=fill",
        f"drawbox=x={x}:y=0:w={width-x}:h={height}:color=red@0.42:t=fill",
        f"drawbox=x=0:y={y}:w={width}:h={height-y}:color=red@0.42:t=fill",
    ]
    for a in shot["annotations"]:
        x1, y1, x2, y2 = (int(v) for v in a["boxPx"])
        overlays.append(f"drawbox=x={x1}:y={y1}:w={x2-x1}:h={y2-y1}:color=green@0.9:t=3")
    if type(frame_index) is not int or frame_index < 0:
        hold("INVALID_DECODED_SAMPLE_INDEX")
    # Select by real decoded display-order index, not approximate input seeking.
    # Input -ss could silently return a neighbor across a hard scientific cut.
    select = f"select=eq(n\\,{frame_index})"
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
           "-i", str(movie), "-an", "-vf", ",".join([select, *overlays]),
           "-frames:v", "1", str(destination)]
    subprocess.run(cmd, capture_output=True, timeout=30, check=True)
    if not destination.is_file() or destination.stat().st_size == 0:
        hold("REAL_FRAME_EXTRACTION_FAILED")


def verified_prior_review_images(output, previous_report_bytes):
    """Identify ONLY images actually listed and hashed by the prior report.

    A filename pattern by itself is not ownership: a caller may keep an
    unrelated 03-notes.png in the output directory. No old report, malformed
    receipt, missing frame or changed bytes grants cleanup authority.
    """
    if previous_report_bytes is None:
        return {}
    try:
        report = strict_json_bytes(previous_report_bytes)
    except (ValueError, UnicodeError):
        return {}
    if (not isinstance(report, dict) or report.get("mayPublish") is not False or
        report.get("publicationVerdict") != "HOLD" or
        not isinstance(report.get("decodedOverlayFrames"), list)):
        return {}
    # A report containing only generic HOLD flags and hashes could belong to
    # an unrelated writer. Require the native provenance shape before using
    # its self-declared image inventory to authorize destructive cleanup.
    # This prevents accidental collisions; it is NOT cryptographic proof
    # of origin, or a defense against an active hostile writer.
    coverage = report.get("frameToShotCoverage")
    decoded = report.get("completeEncodedMediaDecode")
    nframes = report.get("decodedFrameCount")
    if (report.get("status") != "OVERLAY_PREFLIGHT_PASS_REVIEW_REQUIRED" or
        not is_hash(report.get("videoSha256")) or
        not is_hash(report.get("manifestSha256")) or
        report.get("videoResolution") != [1080, 1920] or
        type(nframes) is not int or nframes <= 0 or
        report.get("exact30FpsTimestampGridVerified") is not True or
        not isinstance(coverage, dict) or
        coverage.get("actualPresentedFramesChecked") != nframes or
        coverage.get("framesAssignedExactlyOnce") != nframes or
        coverage.get("mayPublish") is not False or
        not isinstance(decoded, dict) or
        decoded.get("allMappedStreamsDecodedWithoutFatalErrors") is not True or
        decoded.get("mayPublish") is not False):
        return {}
    owned = {}
    for row in report["decodedOverlayFrames"]:
        if not isinstance(row, dict):
            return {}
        name, digest = row.get("file"), row.get("frameSha256")
        if (not isinstance(name, str) or not GENERATED_OVERLAY_NAME.fullmatch(name)
            or not is_hash(digest) or name in owned):
            return {}
        path = output / name
        if path.is_symlink() or not path.is_file() or sha256_file(path) != digest:
            return {}
        owned[name] = digest
    return owned


def commit_decoded_review_images(output, stage, frame_receipts, previously_owned):
    """Never delete or overwrite unowned outputs, even if their names match.

    A stale old report is invalidated earlier. Old images are deleted only
    after verifying the exact previous report and rechecking on-disk hashes.
    """
    names = [entry.get("file") if isinstance(entry, dict) else None
             for entry in frame_receipts]
    if (len(names) != len(set(names)) or
        any(not isinstance(name, str) or not GENERATED_OVERLAY_NAME.fullmatch(name)
            for name in names)):
        hold("INVALID_GENERATED_IMAGE_NAMES")
    # The report already hashes every decoded overlay immediately after FFmpeg.
    # Do not publish it if a screenshot was removed, replaced or corrupted
    # between that measurement and the final on-disk commit. Check every
    # staged file BEFORE deleting a previously owned review image.
    expected_hashes = {}
    for entry in frame_receipts:
        name, digest = entry["file"], entry.get("frameSha256")
        if not is_hash(digest):
            hold("MISSING_GENERATED_IMAGE_DIGEST:" + name)
        staged = stage / name
        if staged.is_symlink() or not staged.is_file() or sha256_file(staged) != digest:
            hold("STAGED_REVIEW_IMAGE_HASH_MISMATCH:" + name)
        expected_hashes[name] = digest
    for name, digest in previously_owned.items():
        path = output / name
        if path.is_symlink() or not path.is_file() or sha256_file(path) != digest:
            hold("PREVIOUS_REVIEW_IMAGE_CHANGED_BEFORE_REPLACEMENT")
    for name in names:
        dest = output / name
        if (dest.exists() or dest.is_symlink()) and name not in previously_owned:
            hold("UNOWNED_REVIEW_IMAGE_COLLISION:" + name)
    for name in previously_owned:
        (output / name).unlink()
    for name in names:
        dest = output / name
        # A different process can create an unowned same-name file AFTER
        # the earlier collision preflight. os.replace would silently clobber
        # it. The stage is a child of output (same filesystem), so a hard
        # link provides an atomic *create-if-absent* for this research output.
        # Leave the staged link in the temporary directory for automatic
        # cleanup and never overwrite an existing destination.
        try:
            os.link(stage / name, dest)
        except FileExistsError:
            hold("UNOWNED_REVIEW_IMAGE_COLLISION_AT_COMMIT:" + name)
        # A success report is written *after* this function. Recheck the
        # physically committed bytes rather than trusting an earlier hash
        # of a temporary file. A failed transfer stays HOLD, not a stale PASS.
        if dest.is_symlink() or not dest.is_file() or sha256_file(dest) != expected_hashes[name]:
            hold("COMMITTED_REVIEW_IMAGE_HASH_MISMATCH:" + name)


def audit(movie, manifest, output, ink_receipt=None, glyph_receipt=None):
    movie, manifest, output = Path(movie), Path(manifest), Path(output)
    ink_receipt = Path(ink_receipt) if ink_receipt is not None else None
    glyph_receipt = Path(glyph_receipt) if glyph_receipt is not None else None
    if glyph_receipt is not None and ink_receipt is None:
        hold("TIMED_INK_PROOF_REQUIRED_FOR_OCR_JOIN")
    sources = (movie, manifest) + ((ink_receipt,) if ink_receipt is not None else ()) + ((glyph_receipt,) if glyph_receipt is not None else ())
    report_path = output / "research-report.json"
    # A caller can put its input manifest/movie at this same path, including
    # through a symlink or .. alias. Never unlink a source while invalidating
    # the previous verdict. Check BEFORE creating or mutating output files.
    if report_path.resolve() in {source.resolve() for source in sources}:
        hold("REPORT_OUTPUT_ALIASES_SOURCE_INPUT")
    # Old generated images are removed and replaced later in this audit.
    # A source masquerading as an overlay PNG would be deleted after a valid
    # media preflight, even though its bytes were just successfully checked.
    # Compare supplied and resolved paths (including symlinked directories).
    output_dir = output.resolve()
    if any(GENERATED_OVERLAY_NAME.fullmatch(candidate.name) and
           candidate.parent.resolve() == output_dir
           for source in sources
           for candidate in (source, source.resolve())):
        hold("GENERATED_OUTPUT_ALIASES_SOURCE_INPUT")
    # The report name is not proof of ownership: a foreign JSON file (or a
    # symlink to another writer's report) must never be silently unlinked.
    # A prior self-described HOLD report grants retirement only if its actual
    # enumerated screenshot bytes are still present and SHA-verified. This is
    # a narrow cleanup authorization, not authentication of a reviewer.
    if report_path.is_symlink():
        hold("UNOWNED_PREVIOUS_REVIEW_REPORT")
    previous_report_bytes = report_path.read_bytes() if report_path.is_file() else None
    if report_path.exists() and not verified_prior_review_images(output, previous_report_bytes):
        hold("UNOWNED_PREVIOUS_REVIEW_REPORT")
    output.mkdir(parents=True, exist_ok=True)
    # Fail closed BEFORE probing / validation: a prior successful report must
    # never survive a new failed attempt against changed inputs.
    report_path.unlink(missing_ok=True)
    previously_owned = verified_prior_review_images(output, previous_report_bytes)
    # Once the old report is invalidated, its generated images must not
    # survive a failed rerun as misleading orphaned evidence. Retire only
    # byte-verified owned images. All unrelated files remain untouched.
    for name, digest in previously_owned.items():
        image = output / name
        if image.is_symlink() or not image.is_file() or sha256_file(image) != digest:
            hold("PREVIOUS_REVIEW_IMAGE_CHANGED_BEFORE_RETIREMENT")
    for name in previously_owned:
        (output / name).unlink()
    previously_owned = {}
    # Bind both input identities to the exact bytes actually parsed/decoded.
    # Recheck them after FFmpeg completes so mid-audit edits cannot yield a
    # successful receipt for media or annotations that were never reviewed.
    manifest_bytes = manifest.read_bytes()
    plan = strict_json_bytes(manifest_bytes)
    manifest_hash = hashlib.sha256(manifest_bytes).hexdigest()
    movie_hash = sha256_file(movie)
    linked_ink = None
    linked_glyph = None
    muted_screen = None
    ink_hash = None
    glyph_hash = None
    ink_data = None
    if ink_receipt is not None:
        ink_bytes = ink_receipt.read_bytes()
        ink_hash = hashlib.sha256(ink_bytes).hexdigest()
        ink_data = strict_json_bytes(ink_bytes)
        linked_ink = validate_critical_ink_receipt_join(
            ink_data, film_sha=movie_hash, plan_sha=manifest_hash)
    if glyph_receipt is not None:
        glyph_bytes = glyph_receipt.read_bytes()
        glyph_hash = hashlib.sha256(glyph_bytes).hexdigest()
        glyph_data = strict_json_bytes(glyph_bytes)
        linked_glyph = validate_exact_film_ocr_join(
            glyph_data, ink_data, plan,
            film_sha=movie_hash, plan_sha=manifest_hash)
        muted_screen = mute_story_negative_screen(plan, glyph_data)
    width, height, duration, decoded_count = probe_movie(movie)
    receipt = validate_manifest(plan, width=width, height=height,
                                duration=duration, actual_sha=movie_hash)
    # The grid checked by probe_movie() must also intersect every authored shot.
    # An entirely empty subframe shot is not video coverage even if its times
    # are contiguous and its annotation boxes are otherwise valid.
    stamps = frame_timestamps(movie)
    coverage = verify_decoded_shot_coverage(stamps, plan["shots"])
    # Receipt strings alone are not frame provenance. Bind each claimed
    # early/middle/late film index to this movie's actually decoded PTS.
    linked_frame_membership = (
        verify_claimed_ink_frames_belong_to_decoded_shots(ink_data, stamps, plan["shots"])
        if ink_data is not None else None
    )
    # Reject invalid shot/frame ownership first. A valid timestamp inventory
    # alone is not an error-free compressed bitstream, so additionally decode
    # every physical frame and (when present) the AAC track before creating
    # screenshots or a success-shaped review receipt.
    full_decode = verify_complete_media_decode(movie)
    frame_receipts = []
    # Emit all decoded artifacts into an isolated staging folder, not into the
    # previous run's public review directory. Publish receipt *last*.
    with tempfile.TemporaryDirectory(prefix=".phone-ui-stage-", dir=output) as stage:
        stage = Path(stage)
        for index, shot in enumerate(plan["shots"]):
            t = (shot["startSec"] + shot["endSec"]) / 2
            name = f"{index:02d}-{shot['id']}.png"
            destination = stage / name
            index_pt, actual_pts = choose_decoded_sample(stamps, shot, t)
            decoded_overlay(movie, index_pt, shot, destination, width, height)
            frame_receipts.append({"shotId": shot["id"], "timeSec": t,
                                   "actualFrameIndex": index_pt,
                                   "actualFramePtsSec": float(actual_pts),
                                   "file": name, "frameSha256": sha256_file(destination)})
        # The opening deserves two additional *actual* pixel samples.
        for t in (.25, 1.50):
            opening_shot = next((s for s in plan["shots"]
                                 if s["startSec"] <= t < s["endSec"]), None)
            if opening_shot is None:
                hold("NO_SHOT_FOR_OPENING_SAMPLE")
            name = f"opening-{str(t).replace('.', '_')}.png"
            destination = stage / name
            index_pt, actual_pts = choose_decoded_sample(stamps, opening_shot, t)
            decoded_overlay(movie, index_pt, opening_shot, destination, width, height)
            frame_receipts.append({"shotId": opening_shot["id"], "timeSec": t,
                                   "actualFrameIndex": index_pt,
                                   "actualFramePtsSec": float(actual_pts),
                                   "openingHookProbe": True, "file": name,
                                   "frameSha256": sha256_file(destination)})
        if sha256_file(movie) != movie_hash:
            hold("SOURCE_VIDEO_CHANGED_DURING_AUDIT")
        if sha256_file(manifest) != manifest_hash:
            hold("SOURCE_MANIFEST_CHANGED_DURING_AUDIT")
        if ink_receipt is not None and sha256_file(ink_receipt) != ink_hash:
            hold("SOURCE_INK_RECEIPT_CHANGED_DURING_AUDIT")
        if glyph_receipt is not None and sha256_file(glyph_receipt) != glyph_hash:
            hold("SOURCE_GLYPH_RECEIPT_CHANGED_DURING_AUDIT")
        if linked_ink is not None:
            receipt["linkedCriticalTextProxy"] = linked_ink
            receipt["linkedCriticalTextDecodedFrameMembership"] = linked_frame_membership
        if linked_glyph is not None:
            receipt["linkedCriticalTextOCR"] = linked_glyph
            receipt["muteStoryNegativeScreen"] = muted_screen
        receipt.update({"videoSha256": movie_hash, "manifestSha256": manifest_hash,
                        "videoResolution": [width, height], "durationSec": duration,
                        "decodedFrameCount": decoded_count,
                        "frameToShotCoverage": coverage,
                        "completeEncodedMediaDecode": full_decode,
                        "exact30FpsTimestampGridVerified": True,
                        "platformExclusions": {"top": TOP, "right": RIGHT, "bottom": BOTTOM},
                        "decodedOverlayFrames": frame_receipts, "publicationVerdict": "HOLD"})
        # Filename patterns are NOT proof of ownership. A previous same-name
        # file may be a user's unrelated work; preserve it or HOLD.
        commit_decoded_review_images(output, stage, frame_receipts, previously_owned)
        staged_report = stage / "research-report.json"
        staged_report.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
        # A competing writer might have created a new report AFTER we
        # invalidated the old one. Never overwrite that unrelated receipt:
        # publish an exact staged file only if destination is still absent.
        report_digest = sha256_file(staged_report)
        try:
            os.link(staged_report, report_path)
        except FileExistsError:
            hold("REVIEW_REPORT_COLLISION_AT_COMMIT")
        if (report_path.is_symlink() or not report_path.is_file() or
                sha256_file(report_path) != report_digest):
            hold("COMMITTED_REVIEW_REPORT_HASH_MISMATCH")
    return receipt


def measure_decoded_caption_ink_rows(bgr, *, crop_width, crop_height,
                                     native_video_width, phone_width_px=320,
                                     expected_lines=2, min_ink_pixels_per_row=8,
                                     minimum_phone_glyph_px=REVIEW_SMALL_TYPE_PX):
    """Conservative physical *ink* height negative screen on an owned native crop.

    Caller supplies a prequalified text-only ROI and BGR24 bytes decoded from
    the exact encoded film, not an authored font size or self-reported text.
    Anti-aliasing, glyph descenders and line art can confound pixel bands.
    A small projected ink height triggers review, never publication success.
    """
    sizes = (crop_width, crop_height, native_video_width, phone_width_px,
             expected_lines, min_ink_pixels_per_row)
    if any(type(v) is not int or v <= 0 for v in sizes):
        hold("CAPTION_TYPE_SCREEN_POSITIVE_NATIVE_GEOMETRY_REQUIRED")
    if (crop_width > native_video_width or crop_height > 1920 or
            expected_lines > 12 or min_ink_pixels_per_row > crop_width or
            not math.isfinite(minimum_phone_glyph_px) or
            not 4 <= minimum_phone_glyph_px <= 60):
        hold("CAPTION_TYPE_SCREEN_BOUNDED_REVIEW_PARAMETERS_REQUIRED")
    if not isinstance(bgr, (bytes, bytearray, memoryview)) or len(bgr) != crop_width * crop_height * 3:
        hold("CAPTION_TYPE_SCREEN_COMPLETE_DECODED_BGR_CROP_REQUIRED")
    view = memoryview(bgr)
    active = []
    for y in range(crop_height):
        offset = y * crop_width * 3
        bright = 0
        for x in range(crop_width):
            i = offset + x * 3
            if min(view[i], view[i + 1], view[i + 2]) >= 155:
                bright += 1
        if bright >= min_ink_pixels_per_row:
            active.append(y)
    lines = []
    for y in active:
        if lines and y <= lines[-1][1] + 2:  # tolerate one antialiased gap row
            lines[-1][1] = y
        else:
            lines.append([y, y])
    lines = [pair for pair in lines if pair[1] - pair[0] + 1 >= 5]
    if len(lines) != expected_lines:
        hold("CAPTION_TYPE_SCREEN_EXPECTED_PHYSICAL_INK_LINES_NOT_FOUND")
    detail = []
    for begin, end in lines:
        ink_height = end - begin + 1
        projected = ink_height * phone_width_px / native_video_width
        detail.append({"nativeGlyphInkY0": begin, "nativeGlyphInkY1": end,
                       "nativeGlyphInkHeightPx": ink_height,
                       "projectedPhoneGlyphInkHeightPx": round(projected, 4),
                       "belowExperimentalReviewThreshold": projected < minimum_phone_glyph_px})
    return {
        "status": ("CAPTION_INK_PHONE_SIZE_REVIEW_HOLD"
                   if any(v["belowExperimentalReviewThreshold"] for v in detail)
                   else "NO_SMALL_CAPTION_INK_DETECTED_REVIEW_REQUIRED"),
        "actualDecodedInkLines": detail,
        "projectedPhoneWidthPx": phone_width_px,
        "minimumPhoneGlyphInkPx": minimum_phone_glyph_px,
        "nativeVideoWidthPx": native_video_width,
        "pixelThresholdLumaProxy": 155,
        "publicationVerdict": "HOLD",
        "semanticOCRVerified": False,
        "realPhoneReadingVerified": False,
        "mayPublish": False,
    }


def measure_targeted_encoded_caption_type(movie, *, expected_film_sha, frame_indices,
                                          roi, phone_width_px=320, expected_lines=2):
    """Native FFmpeg H264 actual-frame caption type probe; bounded read-only.

    Requires every frame in a 4..150 frame contiguous review window, exact
    current film SHA and a manually prequalified text-only crop rectangle.
    Repeated calls cover longer films. Returns HOLD-shaped evidence on green.
    """
    movie = Path(movie)
    if not is_hash(expected_film_sha) or sha256_file(movie) != expected_film_sha:
        hold("CAPTION_TYPE_SCREEN_FILM_SHA_MISMATCH")
    width, height, _, frame_count = probe_movie(movie)
    if (not isinstance(frame_indices, list) or not 4 <= len(frame_indices) <= 150 or
            any(type(i) is not int or i < 0 or i >= frame_count for i in frame_indices) or
            frame_indices != list(range(frame_indices[0], frame_indices[-1] + 1))):
        hold("CAPTION_TYPE_SCREEN_COMPLETE_CONTIGUOUS_WINDOW_REQUIRED")
    if (not isinstance(roi, (list, tuple)) or len(roi) != 4 or
            any(type(v) is not int for v in roi)):
        hold("CAPTION_TYPE_SCREEN_NATIVE_ROI_REQUIRED")
    x0, y0, x1, y1 = roi
    if (not 0 <= x0 < x1 <= width or not 0 <= y0 < y1 <= height or
            (x1 - x0) * (y1 - y0) > 100000):
        hold("CAPTION_TYPE_SCREEN_BOUNDED_NATIVE_ROI_REQUIRED")
    cw, ch = x1 - x0, y1 - y0
    vf = (f"select=between(n\\,{frame_indices[0]}\\,{frame_indices[-1]}),"
          f"crop={cw}:{ch}:{x0}:{y0}:exact=1,format=bgr24")
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-xerror",
           "-err_detect", "explode", "-i", str(movie), "-an", "-vf", vf,
           "-fps_mode", "vfr", "-frames:v", str(len(frame_indices)),
           "-f", "rawvideo", "-pix_fmt", "bgr24", "pipe:1"]
    try:
        output = subprocess.run(cmd, capture_output=True, timeout=90, check=True).stdout
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        hold("CAPTION_TYPE_SCREEN_DECODE_FAILED")
    size = cw * ch * 3
    if len(output) != size * len(frame_indices):
        hold("CAPTION_TYPE_SCREEN_INCOMPLETE_SELECTED_FRAMES")
    if sha256_file(movie) != expected_film_sha:
        hold("CAPTION_TYPE_SCREEN_FILM_CHANGED_DURING_DECODE")
    rows = []
    for j, idx in enumerate(frame_indices):
        evidence = measure_decoded_caption_ink_rows(
            memoryview(output)[j * size:(j + 1) * size],
            crop_width=cw, crop_height=ch, native_video_width=width,
            phone_width_px=phone_width_px, expected_lines=expected_lines)
        rows.append({"actualDecodedFrameIndex": idx,
                     "inkLines": evidence["actualDecodedInkLines"]})
    flagged = [entry for entry in rows if any(
        line["belowExperimentalReviewThreshold"] for line in entry["inkLines"])]
    return {"status": ("CAPTION_INK_PHONE_SIZE_REVIEW_HOLD" if flagged else
                       "NO_SMALL_CAPTION_INK_DETECTED_REVIEW_REQUIRED"),
            "filmSha256": expected_film_sha, "nativeCropRoi": list(roi),
            "phoneWidthPx": phone_width_px, "decodedFramesExamined": len(rows),
            "smallTypeFrameCount": len(flagged), "actualDecodedFrameRows": rows,
            "everyFrameInRequestedWindowChecked": True,
            "experimentalNotWCAGOrHandsetPass": True,
            "semanticOCRVerified": False, "physicalPhoneReviewed": False,
            "publicationVerdict": "HOLD", "mayPublish": False}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--movie", required=True)
    parser.add_argument("--manifest", default=None,
                        help="Full phone-plan audit only; required unless --targeted-right-ui-screen")
    parser.add_argument("--output", default=None,
                        help="Full phone-plan audit only; required unless --targeted-right-ui-screen")
    parser.add_argument("--ink-receipt", default=None,
                        help="Optional exact-film 27-sample research ink proxy; no approval")
    parser.add_argument("--glyph-receipt", default=None,
                        help="Optional exact-film 48-observation OCR receipt, requires ink; no approval")
    parser.add_argument("--targeted-right-ui-screen", action="store_true",
                        help="Read-only exact-film negative screen, no phone plan or publication approval")
    parser.add_argument("--whole-film-right-ui-screen", action="store_true",
                        help="Exhaustively screen every encoded frame in 4..150 frame bounded windows")
    parser.add_argument("--expected-frames", type=int, default=None,
                        help="Required independent full-film decoded-frame count for whole-film screen")
    parser.add_argument("--window-frames", type=int, default=120,
                        help="Bounded whole-film decode window (8..150; default 120)")
    parser.add_argument("--diagnostic-json", action="store_true",
                        help="Opt-in full frame-by-frame HOLD JSON; violations still exit nonzero")
    parser.add_argument("--expected-video-sha256", default=None,
                        help="Required immutable lowercase SHA-256 in targeted screen mode")
    parser.add_argument("--start-frame", type=int, default=None,
                        help="Inclusive start index of 4-150 contiguous decoded display-order frames")
    parser.add_argument("--end-frame", type=int, default=None,
                        help="Inclusive end index of 4-150 contiguous decoded display-order frames")
    parser.add_argument("--roi", type=int, nargs=4, metavar=("X0", "Y0", "X1", "Y1"),
                        default=None,
                        help="Prequalified native critical text/art viewport crossing right safe-area boundary")
    parser.add_argument("--pixel-mode",
                        choices=("bright_neutral_caption", "scientific_visual_highlights"),
                        default="bright_neutral_caption",
                        help="Choose critical white caption or visibly highlighted science-art screen")
    args = parser.parse_args()
    try:
        if args.targeted_right_ui_screen or args.whole_film_right_ui_screen:
            if (args.targeted_right_ui_screen and args.whole_film_right_ui_screen or
                    any(value is not None for value in (
                        args.manifest, args.output, args.ink_receipt, args.glyph_receipt))):
                hold("TARGETED_UI_SCREEN_MUST_NOT_MIX_FULL_AUDIT_FILES")
            if args.expected_video_sha256 is None or args.roi is None:
                hold("TARGETED_UI_SCREEN_SOURCE_AND_ROI_REQUIRED")
            if args.whole_film_right_ui_screen:
                if (args.start_frame is not None or args.end_frame is not None or
                        args.expected_frames is None):
                    hold("WHOLE_UI_SCREEN_COMPLETE_FILM_PARAMETERS_REQUIRED")
                screen = (measure_whole_encoded_right_ui_ink if args.diagnostic_json
                          else screen_whole_encoded_right_ui_ink)
                result = screen(
                    args.movie, expected_film_sha=args.expected_video_sha256,
                    expected_frames=args.expected_frames, roi=args.roi,
                    pixel_mode=args.pixel_mode, window_frames=args.window_frames)
            else:
                if (args.expected_frames is not None or
                        args.window_frames != 120 or
                        args.start_frame is None or args.end_frame is None or
                        not 4 <= args.end_frame - args.start_frame + 1 <= 150):
                    hold("TARGETED_UI_SCREEN_COMPLETE_BOUNDED_INPUT_REQUIRED")
                screen = (measure_targeted_encoded_right_ui_ink if args.diagnostic_json
                          else screen_targeted_encoded_right_ui_ink)
                result = screen(
                    args.movie,
                    expected_film_sha=args.expected_video_sha256,
                    frame_indices=list(range(args.start_frame, args.end_frame + 1)),
                    roi=args.roi, pixel_mode=args.pixel_mode)
        else:
            if (args.diagnostic_json or args.manifest is None or args.output is None or
                    args.expected_video_sha256 is not None or
                    args.start_frame is not None or args.end_frame is not None or
                    args.expected_frames is not None or args.window_frames != 120 or
                    args.roi is not None or args.pixel_mode != "bright_neutral_caption"):
                hold("FULL_PHONE_AUDIT_REQUIRES_ITS_OWN_MANIFEST_OUTPUT_ARGUMENTS")
            result = audit(args.movie, args.manifest, args.output,
                           ink_receipt=args.ink_receipt,
                           glyph_receipt=args.glyph_receipt)
        print(json.dumps(result, indent=2))
        if args.diagnostic_json and (
                args.targeted_right_ui_screen and result["violatingFrameCount"] or
                args.whole_film_right_ui_screen and result["violationCount"]):
            # JSON on stdout is durable evidence, NOT a successful zero exit.
            raise SystemExit(2)
    except (ValueError, OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired,
            KeyError, IndexError, TypeError) as error:
        raise SystemExit("PHONE_UI_HOLD:" + str(error)) from error
