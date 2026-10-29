#!/usr/bin/env python3
"""EvidenceMotion research-only actual-MP4 autonomous visual negative critic.

This is a deterministic, reproducible *screening* tool, not a learned aesthetic
model or proof of accessible/beautiful cinematography. It autonomously raises
actionable visual REVISE signals, with SHA-bound decoded media and time windows,
without requiring a human to detect repeated frames. No release authority.
"""
import argparse
import hashlib
import json
import os
import stat
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

SAMPLE_STEP_SECONDS = 2
FRAME_W, FRAME_H = 180, 320
EDGE_MATCH_LIMIT = 0.95
HIGH_REPETITION_FRAC = 0.45
MIN_SUSTAINED_REPEATED_PAIRS = 3  # 3 * 2s = 6s, even if global fraction stays below .45
MIN_VISIBLE_SUBJECT_STD = 4.5
# Separate the teaching subject from decorative motion INSIDE the broad body.
# These fixed coordinates are a provisional negative-screen for centered hero
# art, not a universal composition requirement (off-center stages may be valid).
CENTER_HERO_BOX = (58, 86, 122, 190)  # x0,y0,x1,y1 at 180x320
CENTER_HERO_MATCH_LIMIT = 0.985
MIN_MASKED_HERO_REPEAT_PAIRS = 3  # 6s at the existing 2s cadence
TWO_STATE_MATCH_LIMIT = 0.985  # sampled A/B/A/B loop advisory
MIN_TWO_STATE_MATCHED_PAIRS = 4  # needs six sampled layouts
MIN_SEC, MAX_SEC = 12, 90


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def similarity(p, q):
    np_norm = float(np.linalg.norm(p) * np.linalg.norm(q))
    if np_norm <= 1.e-12:
        return 1.0 if np.array_equal(p, q) else 0.0
    return float(np.dot(p, q) / np_norm)


def review_decoded_samples(samples):
    """Actual decoded grayscale frame samples; callers may construct test frames.

    Exclude persistent header, lower subtitle/UI region, and outer 5 pixels so
    repeating brand chrome cannot constitute subject movement/hero progression.
    A content-static film can be REVISE even with an animated logo or captions.
    """
    frames = np.asarray(samples, dtype=np.uint8)
    if frames.ndim != 3 or frames.shape[1:] != (FRAME_H, FRAME_W) or len(frames) < 4:
        raise ValueError("ACTUAL_DECODED_SAMPLES_REQUIRED")
    vectors, visible_stds, center_vectors, center_stds = [], [], [], []
    stage_medians, stage_bright_coverage = [], []
    for arr in frames:
        subject = arr[33:226, 6:174]
        visible_stds.append(float(subject.std()))
        stage_medians.append(float(np.median(subject)))
        stage_bright_coverage.append(float(np.mean(subject >= 195)))
        x0, y0, x1, y1 = CENTER_HERO_BOX
        center_stds.append(float(arr[y0:y1, x0:x1].std()))
        edge = np.asarray(Image.fromarray(arr).filter(ImageFilter.FIND_EDGES)).copy()
        edge[:33, :] = 0
        edge[226:, :] = 0
        edge[:, :5] = 0
        edge[:, 175:] = 0
        vectors.append(edge.reshape(32, 10, 18, 10).mean(axis=(1, 3)).ravel().astype(np.float64))
        # 104x64 -> 13x8 bins of 8x8 pixels. Core motion is measured
        # separately so moving peripheral lines cannot certify hero progress.
        core = edge[y0:y1, x0:x1]
        center_vectors.append(core.reshape(13, 8, 8, 8).mean(axis=(1, 3)).ravel().astype(np.float64))
    similarities = [similarity(a, b) for a, b in zip(vectors, vectors[1:])]
    repeated = [i for i, sim in enumerate(similarities) if sim > EDGE_MATCH_LIMIT]
    repetition_fraction = len(repeated) / len(similarities)
    # A long local visual plateau is unacceptable even when fast cuts elsewhere
    # dilute the whole-film repeat fraction. Preserve contiguous pair windows.
    def consecutive_runs(indices):
        result, current = [], []
        for i in indices:
            if current and i != current[-1] + 1:
                result.append(current)
                current = []
            current.append(i)
        if current:
            result.append(current)
        return result

    runs = consecutive_runs(repeated)
    sustained = [run for run in runs if len(run) >= MIN_SUSTAINED_REPEATED_PAIRS]
    center_matches = [similarity(a, b) for a, b in zip(center_vectors, center_vectors[1:])]
    masked_core_pairs = [
        i for i, (broad, core) in enumerate(zip(similarities, center_matches))
        if broad <= EDGE_MATCH_LIMIT and core >= CENTER_HERO_MATCH_LIMIT
        and min(center_stds[i], center_stds[i + 1]) >= MIN_VISIBLE_SUBJECT_STD
    ]
    # Advisory, not an automatic artistic veto: a deliberately held source
    # card or a focal subject located elsewhere can be good direction.
    masked_core_runs = [run for run in consecutive_runs(masked_core_pairs)
                        if len(run) >= MIN_MASKED_HERO_REPEAT_PAIRS]
    # A/B/A/B cycles can evade consecutive-pair screening despite static ideas.
    # This is advisory: deliberate comparisons can be appropriate teaching.
    two_state_pairs = [
        i for i in range(len(vectors) - 2)
        if min(visible_stds[i:i + 3]) >= MIN_VISIBLE_SUBJECT_STD
        and similarities[i] <= EDGE_MATCH_LIMIT
        and similarities[i + 1] <= EDGE_MATCH_LIMIT
        and similarity(vectors[i], vectors[i + 2]) >= TWO_STATE_MATCH_LIMIT
    ]
    two_state_runs = [run for run in consecutive_runs(two_state_pairs)
                      if len(run) >= MIN_TWO_STATE_MATCHED_PAIRS]
    longest_run_sec = max((len(run) for run in runs), default=0) * SAMPLE_STEP_SECONDS
    empty_subject = float(np.median(visible_stds)) < MIN_VISIBLE_SUBJECT_STD
    # A repeated full-stage ivory/dark inversion is visible even when
    # moving captions or particles change edge histograms. A single deliberate
    # day/night transition should not be rejected by this 2s negative probe.
    full_stage_light_dark_flips = [
        i for i in range(len(frames) - 1)
        if abs(stage_medians[i + 1] - stage_medians[i]) >= 115
        and min(stage_bright_coverage[i], stage_bright_coverage[i + 1]) <= .18
        and max(stage_bright_coverage[i], stage_bright_coverage[i + 1]) >= .67
    ]
    issues = []
    if len(full_stage_light_dark_flips) >= 3:
        issues.append("REPEATED_FULL_STAGE_LIGHT_DARK_FLIPS_REQUIRE_ART_DIRECTION_REPAIR")
    if empty_subject:
        issues.append("MISSING_RECOGNIZABLE_SUBJECT_OR_NEAR_BLANK_CENTRAL_STAGE")
    if repetition_fraction >= HIGH_REPETITION_FRAC:
        issues.append("REPETITIVE_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR")
    if sustained:
        issues.append("SUSTAINED_REPEATED_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR")
    return {
        "samples": len(frames),
        "fullStageLightDarkFlipCount": len(full_stage_light_dark_flips),
        "fullStageLightDarkFlipWindowsSec": [
            {"startSec": i * SAMPLE_STEP_SECONDS,
             "endSec": (i + 1) * SAMPLE_STEP_SECONDS}
            for i in full_stage_light_dark_flips
        ],
        "fullStageLightDarkScope": "Two-second decoded frame negative screen; three or more wholesale light/dark reversals require art-direction repair, never confer premium approval.",
        "sampleEverySeconds": SAMPLE_STEP_SECONDS,
        "repeatedSamplePairsStartSec": [i * SAMPLE_STEP_SECONDS for i in repeated],
        "highEdgeSimilarityFraction": round(repetition_fraction, 4),
        "medianSubjectLayoutSimilarity": round(float(np.median(similarities)), 4),
        "medianSubjectGrayscaleStd": round(float(np.median(visible_stds)), 3),
        "layoutRepetitionThreshold": HIGH_REPETITION_FRAC,
        "longestRepeatedLayoutRunSec": longest_run_sec,
        "sustainedLayoutThresholdSec": MIN_SUSTAINED_REPEATED_PAIRS * SAMPLE_STEP_SECONDS,
        "sustainedRepeatWindowsSec": [
            {"startSec": run[0] * SAMPLE_STEP_SECONDS,
             "endSec": (run[-1] + 1) * SAMPLE_STEP_SECONDS,
             "repeatedPairCount": len(run)} for run in sustained
        ],
        "centerHeroProbeBoxPixels": list(CENTER_HERO_BOX),
        "centerHeroStasisPeripheralMotionWindowsSec": [
            {"startSec": run[0] * SAMPLE_STEP_SECONDS,
             "endSec": (run[-1] + 1) * SAMPLE_STEP_SECONDS,
             "repeatedPairCount": len(run)} for run in masked_core_runs
        ],
        "twoStateAlternationWindowsSec": [
            {"startSec": run[0] * SAMPLE_STEP_SECONDS,
             "endSec": (run[-1] + 2) * SAMPLE_STEP_SECONDS,
             "lagTwoMatchedPairs": len(run)} for run in two_state_runs
        ],
        "reviewCandidates": (
            (["CENTERED_TEACHING_HERO_STASIS_MASKED_BY_PERIPHERAL_MOTION"]
             if masked_core_runs else []) +
            (["TWO_STATE_LAYOUT_OSCILLATION_WITHOUT_VISUAL_PROGRESSION"]
             if two_state_runs else [])),
        "twoStateScope": "2s-sampled lag-two negative advisory; deliberate A/B teaching may be valid and intermediate frames are not exhaustively judged. Never quality approval.",
        "centerHeroScope": "A centered-hero 2s-sampled negative advisory; intentional holds and off-center subjects require separate source-bound craft reasoning. Never a quality PASS.",
        "issues": issues,
        "critiqueScope": "AUTONOMOUS_ACTUAL_PIXELS_NEGATIVE_SCREENING_NOT_HUMAN_QUALITY",
    }



def review_one_hz_hero_cadence(one_hz_frames):
    """Find sustained unchanged center-hero silhouettes in independently decoded frames.

    One-second sampling detects negative examples; it does NOT prove the visual
    action is educational, find off-center subjects, or establish 3s exactness.
    Any bright particles inside this probe or intentional source-reading holds
    require separate scene-ROI and semantic review, not automatic acceptance.
    """
    frames = np.asarray(one_hz_frames, dtype=np.uint8)
    if frames.ndim != 3 or frames.shape[1:] != (FRAME_H, FRAME_W) or len(frames) < 4:
        raise ValueError("ACTUAL_ONE_HZ_HERO_SAMPLES_REQUIRED")
    x0, y0, x1, y1 = CENTER_HERO_BOX
    vectors, visible = [], []
    for frame in frames:
        core = frame[y0:y1, x0:x1]
        visible.append(float(core.std()) >= MIN_VISIBLE_SUBJECT_STD)
        edges = np.asarray(Image.fromarray(frame).filter(ImageFilter.FIND_EDGES))
        vectors.append(edges[y0:y1, x0:x1].reshape(13, 8, 8, 8)
                       .mean(axis=(1, 3)).ravel().astype(np.float64))
    static_pairs = [
        i for i in range(len(vectors)-1)
        if visible[i] and visible[i+1] and
        similarity(vectors[i], vectors[i+1]) >= CENTER_HERO_MATCH_LIMIT
    ]
    windows = []
    if static_pairs:
        start = end = static_pairs[0]
        for i in static_pairs[1:] + [None]:
            if i is not None and i == end + 1:
                end = i
                continue
            seconds = end - start + 1
            if seconds >= 3:
                windows.append({
                    "startSec": start, "endSec": end+1,
                    "stagnantSecondsAtOneHz": seconds,
                    "severity": "REVISE_CANDIDATE" if seconds > 6 else "CRAFT_HOLD_CANDIDATE",
                })
            if i is not None:
                start = end = i
    worst = max((w["stagnantSecondsAtOneHz"] for w in windows), default=0)
    return {
        "probe": "SHA_PINNED_ACTUAL_FRAME_CENTER_HERO_1HZ_RESEARCH_NEGATIVE_ONLY",
        "sampleCount": len(frames),
        "centerHeroBoxPixels": list(CENTER_HERO_BOX),
        "visibleCenterHeroSamples": sum(visible),
        "thresholdSec": 3,
        "stagnationWindows": windows,
        "longestFlaggedStagnationSec": worst,
        "creativeScreenVerdict": "CRAFT_HOLD" if windows else "NO_NEGATIVE_FOUND_NOT_CRAFT_PASS",
        "sceneSpecificHeroAndMeaningVerified": False,
        "offCenterAndIntentionalReadingHoldNotAdjudicated": True,
        "automaticallyApprovedArt": False,
    }



class _PinnedVisualCuePlan(dict):
    """Loader-attested scene plan with exact original bytes retained for rechecking."""

    def __init__(self, data, raw, expected_sha):
        super().__init__(data)
        self._pinned_raw = raw
        self._pinned_sha256 = expected_sha


def _copy_verified_pinned_visual_plan(plan, expected_sha):
    """Reject unbound/mutated in-memory plans; analyze a private raw-byte copy."""
    if (type(plan) is not _PinnedVisualCuePlan or
            not isinstance(expected_sha, str) or
            expected_sha != plan._pinned_sha256 or
            hashlib.sha256(plan._pinned_raw).hexdigest() != expected_sha):
        raise ValueError("VISUAL_PLAN_SOURCE_SHA_MISMATCH")
    try:
        detached = json.loads(plan._pinned_raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError("VISUAL_PLAN_SOURCE_SHA_MISMATCH") from exc
    if detached != dict(plan):
        raise ValueError("VISUAL_PLAN_MUTATED_AFTER_LOAD")
    # A caller cannot mutate this detached object during FFmpeg review.
    return detached


def load_pinned_visual_cue_plan(path, expected_sha):
    """Read an exact, externally pinned JSON plan. PIN!=pre-render registration."""
    p = Path(path)
    if not isinstance(expected_sha, str) or len(expected_sha) != 64 or any(
            c not in "0123456789abcdef" for c in expected_sha):
        raise ValueError("INDEPENDENT_VISUAL_PLAN_SHA_REQUIRED")
    if not p.is_file() or p.is_symlink() or p.stat().st_size < 1 or p.stat().st_size > 200000:
        raise ValueError("BOUNDED_REGULAR_VISUAL_PLAN_REQUIRED")
    raw = p.read_bytes()
    if len(raw) > 200000 or hashlib.sha256(raw).hexdigest() != expected_sha:
        raise ValueError("VISUAL_PLAN_SOURCE_SHA_MISMATCH")

    def no_duplicates(pairs):
        out = {}
        for key, value in pairs:
            if key in out:
                raise ValueError("DUPLICATED_VISUAL_PLAN_KEY")
            out[key] = value
        return out
    try:
        parsed = json.loads(raw.decode("utf-8"), object_pairs_hook=no_duplicates)
        if not isinstance(parsed, dict):
            raise ValueError("INVALID_VISUAL_CUE_JSON")
        return _PinnedVisualCuePlan(parsed, raw, expected_sha)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError("INVALID_VISUAL_CUE_JSON") from exc


def review_actual_visual_action_cues(four_hz_frames, plan):
    """Negative frame evidence for predeclared narration-cued hero state changes.

    Frames MUST come from an independent FFmpeg decoded stream. This function
    cannot infer a correct scientific cause or award premium artistic quality.
    Even visible differences can be caption/effect noise INSIDE an inaccurate ROI.
    """
    frames = np.asarray(four_hz_frames, dtype=np.uint8)
    if frames.ndim != 3 or frames.shape[1:] != (FRAME_H, FRAME_W) or len(frames) < 8:
        raise ValueError("ACTUAL_4HZ_FRAME_STREAM_REQUIRED")
    def shahex(value):
        return isinstance(value, str) and len(value) == 64 and all(
            c in "0123456789abcdef" for c in value)
    def ident(value):
        return isinstance(value, str) and 2 <= len(value) <= 90 and all(
            c.isascii() and (c.isalnum() or c in "_-.") for c in value)
    if (not isinstance(plan, dict) or plan.get("schemaVersion") !=
            "ths-em-visual-cue-plan-research-v1" or
            not shahex(plan.get("sourceManifestSha256")) or
            not shahex(plan.get("lockedNarrationWavSha256")) or
            not isinstance(plan.get("scenes"), list) or
            not 1 <= len(plan["scenes"]) <= 80):
        raise ValueError("INCOMPLETE_EXACT_SCIENCE_VOICE_VISUAL_CUE_PLAN")
    findings = []
    observed = []
    scene_ids = set()
    previous_end = 0.0
    total_actions = 0
    max_time = len(frames) / 4
    verbs = {
        "OPENS_TO_REVEAL", "FOLDS_TO_REVEAL", "MOVES_INTO_BOUND_SPACE",
        "ASSEMBLES_FROM_PARTS", "SEPARATES_INTO_PARTS", "PHYSICAL_SCALE_REVEAL",
        "REVEAL", "TRACE", "COMPARE_ACTIVE", "FOCUS_TO_NEW_EVIDENCE",
        "TRANSFORM_SOURCE_BOUND",
    }
    for scene in plan["scenes"]:
        if not isinstance(scene, dict):
            raise ValueError("INVALID_CUE_SCENE")
        sid = scene.get("beatId")
        start, end = scene.get("startSec"), scene.get("endSec")
        wav = scene.get("lockedNarrationWavSha256")
        claims, assets = scene.get("sourceClaimIds"), scene.get("sourceAssetIds")
        box, actions = scene.get("heroBox"), scene.get("actions")
        if (not ident(sid) or sid in scene_ids or wav != plan["lockedNarrationWavSha256"]
                or type(start) not in (float, int) or type(end) not in (float, int)
                or not np.isfinite(start) or not np.isfinite(end)
                or abs(start - previous_end) > .005 or end <= start
                or end > max_time + .75
                or not isinstance(claims, list) or not claims or not all(map(ident, claims))
                or not isinstance(assets, list) or not assets or not all(map(ident, assets))
                or not isinstance(box, dict) or
                not all(type(box.get(k)) in (float, int) and np.isfinite(box[k])
                        for k in ("x1", "y1", "x2", "y2")) or
                not (.04 <= box["x1"] < box["x2"] <= .82 and
                     .11 <= box["y1"] < box["y2"] <= .78 and
                     box["x2"] - box["x1"] >= .1 and box["y2"] - box["y1"] >= .1)
                or not isinstance(actions, list)
                or len(set(claims)) != len(claims)
                or len(set(assets)) != len(assets)):
            raise ValueError("UNBOUND_OR_UNSAFE_HERO_REGION_OR_SCENE_TIMELINE")
        # Pre-render already rejects duplicate source IDs and contradictory
        # action/source-read states. Independent decoded-media QA must agree.
        if actions and scene.get("staticHold") is not None:
            raise ValueError("ACTION_AND_SOURCE_READ_HOLD_MUTUALLY_EXCLUSIVE")
        scene_ids.add(sid)
        previous_end = end
        x1, x2 = int(box["x1"] * FRAME_W), int(box["x2"] * FRAME_W)
        y1, y2 = int(box["y1"] * FRAME_H), int(box["y2"] * FRAME_H)
        if not actions:
            hold = scene.get("staticHold")
            if not isinstance(hold, dict):
                raise ValueError("ACTIONLESS_SCENE_WITHOUT_SOURCE_READ_HOLD")
            if (hold.get("kind") != "SOURCE_EVIDENCE_READ"
                    or not ident(hold.get("sourceId"))
                    or hold["sourceId"] not in assets
                    or not isinstance(hold.get("reason"), str)
                    or len(hold["reason"].strip()) < 12):
                raise ValueError("UNJUSTIFIED_STATIC_SOURCE_READ_HOLD")
            if end - start > 3.205:
                raise ValueError("VISUAL_CUE_UNBOUNDED_SOURCE_READ_HOLD")
            continue
        for event in actions:
            if not isinstance(event, dict) or event.get("visualVerb") not in verbs:
                raise ValueError("MISSING_OR_DECORATIVE_VISUAL_VERB")
            cue = event.get("atSec")
            if (type(cue) not in (int, float) or not np.isfinite(cue)
                    or cue < start or cue > end
                    or not ident(event.get("heroObjectId"))
                    or not ident(event.get("beforeStateId"))
                    or not ident(event.get("afterStateId"))
                    or event["beforeStateId"] == event["afterStateId"]):
                raise ValueError("UNPINNED_CUE_OR_UNCHANGED_DECLARED_HERO")
            total_actions += 1
            if total_actions > 120:
                raise ValueError("UNBOUNDED_VISUAL_CUE_COUNT")
            # 4Hz evidence: nominal 0.5s on either side of spoken cue.
            # Insufficient observations trigger HOLD rather than false PASS.
            before_index = int(round((cue - .5) * 4))
            after_index = int(round((cue + .5) * 4))
            if (before_index < int(round(start * 4)) or
                    after_index >= int(round(end * 4)) or
                    before_index < 0 or after_index >= len(frames)):
                findings.append({"beatId": sid, "heroObjectId": event["heroObjectId"],
                                 "cueSec": cue, "reason": "CUE_BOUNDARY_PIXEL_WINDOW_MISSING"})
                continue
            before = frames[before_index, y1:y2, x1:x2]
            after = frames[after_index, y1:y2, x1:x2]
            if before.size < 256 or before.shape != after.shape:
                findings.append({"beatId": sid, "heroObjectId": event["heroObjectId"],
                                 "cueSec": cue, "reason": "HERO_REGION_TOO_SMALL"})
                continue
            a = np.asarray(Image.fromarray(before).resize((8, 8), Image.Resampling.BOX),
                           dtype=np.float32)
            b = np.asarray(Image.fromarray(after).resize((8, 8), Image.Resampling.BOX),
                           dtype=np.float32)
            diff = np.abs(a - b)
            change_frac = float((diff >= 10).mean())
            mean_diff = float(diff.mean())
            item = {"beatId": sid, "heroObjectId": event["heroObjectId"],
                    "cueSec": cue, "pixelBeforeSec": before_index / 4,
                    "pixelAfterSec": after_index / 4,
                    "broadPixelChangeFraction": round(change_frac, 4),
                    "meanBroadLumaDifference": round(mean_diff, 3)}
            if change_frac < .06 and mean_diff < 2.5:
                findings.append(dict(item, reason="DECLARED_HERO_ACTION_NOT_OBSERVABLE"))
            else:
                observed.append(dict(item, reason="PIXEL_CHANGE_OBSERVED_MEANING_NOT_VERIFIED"))
    if abs(previous_end - max_time) > .75:
        raise ValueError("VISUAL_SCENES_DO_NOT_COVER_ACTUAL_DECODE")
    if total_actions == 0:
        raise ValueError("SOURCE_CARDS_ALONE_DO_NOT_PROVE_VISUAL_STORY")
    return {
        "schemaVersion": "ths-em-pinned-visual-cue-negative-audit-v1",
        "sampleHz": 4, "independentFullDecodeRequired": True,
        "declaredActionsExamined": total_actions,
        "unobservedOrUnreviewable": findings,
        "observedPixelChangesNotApproved": observed,
        "decision": ("CRAFT_HOLD_SCENE_CUES" if findings
                     else "PIXEL_CHANGE_PROXY_ONLY_NEEDS_SEMANTIC_CRAFT_REVIEW"),
        "semanticAnimationVerified": False, "scientificClaimVerified": False,
        "premiumCraftCertified": False, "mayPublish": False
    }



def interleaved_blank_phase_windows(one_hz_frames):
    """Provisional negative craft screen for phase-aliased blank interruptions.

    A 2-second sample may miss every odd-second interruption. Detect only
    >=4 contiguous pairs with an almost featureless 1-second phase while
    its opposite phase contains conspicuous art. Intentional dark beats can
    be valid: these are review advisories, never artistic/release vetoes.
    """
    frames = np.asarray(one_hz_frames, dtype=np.uint8)
    if frames.ndim != 3 or frames.shape[1:] != (FRAME_H, FRAME_W) or len(frames) < 12:
        return []
    stds = [float(frame[33:226, 6:174].std()) for frame in frames]
    findings = []
    for phase in (0, 1):
        consecutive = []
        for i in range(len(stds) // 2):
            blank = stds[2 * i + phase] < MIN_VISIBLE_SUBJECT_STD
            other = stds[2 * i + 1 - phase] >= 2 * MIN_VISIBLE_SUBJECT_STD
            if blank and other:
                consecutive.append(i)
            else:
                if len(consecutive) >= 4:
                    findings.append({
                        "startSec": 2 * consecutive[0] + phase,
                        "endSec": 2 * consecutive[-1] + phase + 1,
                        "blankSamples": len(consecutive),
                        "blankPhase": phase
                    })
                consecutive = []
        if len(consecutive) >= 4:
            findings.append({
                "startSec": 2 * consecutive[0] + phase,
                "endSec": 2 * consecutive[-1] + phase + 1,
                "blankSamples": len(consecutive),
                "blankPhase": phase
            })
    return findings


MAX_VIDEO_BYTES = 1024 * 1024 * 1024  # bounded CPU research artifact only


def _freeze_pinned_video(source_path, destination, expected_sha=None):
    """Copy bytes once from an opened regular-file descriptor into private scratch.

    Every decoder runs only on the immutable, private, digest-checked copy.
    An attacker swapping a public pathname after the copy cannot substitute
    frames between our original source identity check and the second FFmpeg run.
    """
    path = Path(source_path)
    if (path.is_symlink() or any(p.is_symlink() for p in path.parents)
            or not path.is_file()):
        raise ValueError("ACTUAL_REGULAR_VIDEO_REQUIRED")
    before = path.stat()
    if not stat.S_ISREG(before.st_mode) or not 0 < before.st_size <= MAX_VIDEO_BYTES:
        raise ValueError("UNBOUNDED_OR_EMPTY_SOURCE_VIDEO")
    flags = os.O_RDONLY | getattr(os, "O_BINARY", 0)
    flags |= getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_NONBLOCK", 0)
    try:
        fd = os.open(path, flags)
    except OSError as exc:
        raise ValueError("SOURCE_VIDEO_CHANGED_BEFORE_OPEN") from exc
    digest = hashlib.sha256()
    with os.fdopen(fd, "rb") as handle, open(destination, "xb") as frozen:
        opened = os.fstat(handle.fileno())
        if (not stat.S_ISREG(opened.st_mode) or
                (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino)):
            raise ValueError("SOURCE_VIDEO_CHANGED_BEFORE_OPEN")
        total = 0
        while True:
            chunk = handle.read(1024 * 1024)
            if not chunk:
                break
            total += len(chunk)
            if total > MAX_VIDEO_BYTES:
                raise ValueError("SOURCE_VIDEO_EXCEEDS_BOUNDED_RESEARCH_LIMIT")
            digest.update(chunk)
            frozen.write(chunk)
        end_fd = os.fstat(handle.fileno())
    if (not 0 < total == opened.st_size or
            (opened.st_dev, opened.st_ino, opened.st_size,
             opened.st_mtime_ns, opened.st_ctime_ns) !=
            (end_fd.st_dev, end_fd.st_ino, end_fd.st_size,
             end_fd.st_mtime_ns, end_fd.st_ctime_ns)):
        raise ValueError("SOURCE_VIDEO_MUTATED_DURING_FREEZE")
    source_sha = digest.hexdigest()
    if expected_sha is not None and expected_sha != source_sha:
        raise ValueError("VIDEO_IDENTITY_CHANGED")
    # Verify the *actual decoded input* bytes, not a stale external path hash.
    if sha256(destination) != source_sha:
        raise ValueError("FROZEN_VIDEO_COPY_CHANGED")
    return source_sha


def analyze_video(path, expected_sha=None, scene_plan=None, scene_plan_sha=None):
    """Analyze an immutable, independently SHA-pinned snapshot of real media."""
    # Do not turn an internally computed convenience hash into proof that an
    # external producer precommitted the source/film for a declared visual cue.
    if scene_plan is not None and expected_sha is None:
        raise ValueError("EXACT_VIDEO_AND_PLAN_EXTERNAL_PINS_REQUIRED")
    if scene_plan is None and scene_plan_sha is not None:
        raise ValueError("VISUAL_PLAN_ORPHAN_SHA")
    if scene_plan is not None:
        scene_plan = _copy_verified_pinned_visual_plan(scene_plan, scene_plan_sha)
    # Previous callers without an external SHA can still run research-only
    # negative screening. They cannot claim independently pinned provenance.
    with tempfile.TemporaryDirectory(prefix="ths-em-frozen-video-") as scratch:
        movie = Path(scratch) / "source-pinned-h264.mp4"
        frozen_sha = _freeze_pinned_video(path, movie, expected_sha)
        return _analyze_frozen_video(movie, frozen_sha, scene_plan, scene_plan_sha)


def _analyze_frozen_video(path, expected_sha, scene_plan=None, scene_plan_sha=None):

    """Measure actual MP4; abort on decoder errors or a wrong pinned file."""
    path = Path(path)
    if not path.is_file() or path.is_symlink():
        raise ValueError("ACTUAL_REGULAR_VIDEO_REQUIRED")
    source_sha = sha256(path)
    if expected_sha is not None and source_sha != expected_sha:
        raise ValueError("VIDEO_IDENTITY_CHANGED")
    probe = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_streams", "-show_format",
        "-of", "json", str(path)], timeout=30))
    videos = [s for s in probe.get("streams", []) if s.get("codec_type") == "video"]
    if len(videos) != 1:
        raise ValueError("EXACTLY_ONE_VIDEO_STREAM_REQUIRED")
    v = videos[0]
    duration = float(probe.get("format", {}).get("duration", 0))
    if not MIN_SEC <= duration <= MAX_SEC:
        raise ValueError("BOUND_VIDEO_DURATION_REQUIRED")
    if int(v.get("width", 0)) < 180 or int(v.get("height", 0)) < 320:
        raise ValueError("ACTUAL_VIDEO_TOO_SMALL")
    # Sampling is a craft negative-screen; this separately decodes the WHOLE
    # media stream, not just sample points, to reject damaged or incomplete A/V.
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin",
        "-xerror", "-i", str(path), "-f", "null", "-"],
        check=True, capture_output=True, timeout=90)
    raw = subprocess.check_output([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin",
        "-xerror", "-i", str(path), "-vf",
        f"fps=1,scale={FRAME_W}:{FRAME_H},format=gray",
        "-f", "rawvideo", "-pix_fmt", "gray", "pipe:1"], timeout=90)
    size = FRAME_W * FRAME_H
    if not raw or len(raw) % size:
        raise ValueError("INCOMPLETE_DECODED_SAMPLE_GRID")
    frames = np.frombuffer(raw, dtype=np.uint8).reshape(-1, FRAME_H, FRAME_W)
    result = review_decoded_samples(frames[::SAMPLE_STEP_SECONDS])
    result["oneHzHeroCadence"] = review_one_hz_hero_cadence(frames)
    if scene_plan is not None:
        if expected_sha is None or not isinstance(scene_plan_sha, str) or len(scene_plan_sha) != 64:
            raise ValueError("EXACT_VIDEO_AND_PLAN_EXTERNAL_PINS_REQUIRED")
        raw4 = subprocess.check_output([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin",
            "-xerror", "-i", str(path), "-vf",
            f"fps=4,scale={FRAME_W}:{FRAME_H},format=gray",
            "-f", "rawvideo", "-pix_fmt", "gray", "pipe:1"], timeout=90)
        if not raw4 or len(raw4) % size:
            raise ValueError("INCOMPLETE_4HZ_DECODED_HERO_FRAMES")
        four = np.frombuffer(raw4, dtype=np.uint8).reshape(-1, FRAME_H, FRAME_W)
        result["renderedVisualCueReview"] = review_actual_visual_action_cues(four, scene_plan)
        result["renderedVisualCueReview"]["scenePlanSha256"] = scene_plan_sha
        result["renderedVisualCueReview"]["videoSha256"] = source_sha
        # Make real-film negative cue proof actionable to the EXISTING arbiter.
        # Merely attaching a buried nested report leaves the root decision green.
        # Rejected pixel windows or static named heroes require research revision;
        # a detectable change is still NOT an artistic or scientific PASS.
        for finding in result["renderedVisualCueReview"]["unobservedOrUnreviewable"]:
            reason = finding["reason"]
            code = {
                "DECLARED_HERO_ACTION_NOT_OBSERVABLE":
                    "DECODED_HERO_VISUAL_VERB_NOT_OBSERVABLE",
                "CUE_BOUNDARY_PIXEL_WINDOW_MISSING":
                    "DECODED_VISUAL_VERB_CUE_WINDOW_MISSING",
                "HERO_REGION_TOO_SMALL":
                    "DECODED_VISUAL_VERB_HERO_REGION_INSUFFICIENT",
            }.get(reason)
            if code is None:
                raise ValueError("UNRECOGNIZED_DECODED_VISUAL_CUE_FINDING")
            if code not in result["issues"]:
                result["issues"].append(code)
    phase_windows = interleaved_blank_phase_windows(frames)
    result["interleavedBlankPhaseWindowsSec"] = phase_windows
    result["oneHzOpticalScreenSamples"] = len(frames)
    if phase_windows:
        result["reviewCandidates"].append("INTERLEAVED_NEAR_BLANK_VISUAL_PHASE")
    result.update({
        "schemaVersion": "ths-autonomous-film-critic-research-v1",
        "actualVideoSha256": source_sha,
        "actualDurationSeconds": round(duration, 5),
        "actualSourceResolution": [int(v["width"]), int(v["height"])],
        "decision": ("AUTO_REVISE" if result["issues"]
                     else "CRAFT_REVIEW_HOLD" if result["reviewCandidates"]
                     else "AWAIT_MULTIMODAL_SCIENCE_VOICE_CRAFT_EVIDENCE"),
        "negativeFindingsDoNotRequireOwnerVerdict": True,
        "automaticallyApprovedScientificClaims": False,
        "automaticallyApprovedNaturalVoice": False,
        "automaticallyApprovedPremiumCraft": False,
        "mayPublish": False,
        "excellentFirstRenderCredited": False,
    })
    # An independently submitted path is mutable: refuse even accidental changes
    # between the initial exact pin and the completed physical decode/probes.
    if sha256(path) != source_sha:
        raise ValueError("VIDEO_CHANGED_DURING_PHYSICAL_REVIEW")
    return result


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("video")
    p.add_argument("--expected-sha")
    p.add_argument("--visual-cue-plan")
    p.add_argument("--expected-plan-sha")
    p.add_argument("--out")
    args = p.parse_args()
    if (args.visual_cue_plan is None) != (args.expected_plan_sha is None):
        raise ValueError("EXACT_VISUAL_PLAN_AND_EXTERNAL_PIN_BOTH_REQUIRED")
    cue_plan = (load_pinned_visual_cue_plan(args.visual_cue_plan, args.expected_plan_sha)
                if args.visual_cue_plan is not None else None)
    report = analyze_video(args.video, args.expected_sha, cue_plan, args.expected_plan_sha)
    if args.out:
        Path(args.out).write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))
