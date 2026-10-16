#!/usr/bin/env python3
"""Research-only, byte-bound screen of an actually rendered 7-OH teaching film.

Matches emitted captions, frozen sentences, source labels and source identity.
This detects objective inconsistencies, never independently certifies clinical
claims, audible pronunciation, comprehension or artistic excellence.
"""
import argparse
import hashlib
import json
from pathlib import Path

from autonomous_script_asr_research import LINES, WAV_SHA
from verified_molecular_comparison import MITRAGYNINE, HYDROXYMITRAGYNINE

SOURCES = (MITRAGYNINE, HYDROXYMITRAGYNINE)
SCENES = tuple(f"sentence_{i}" for i in range(1, 6)) + ("source_hold", "sentence_6")
REVIEW_TOPICS = (
    "chemical_identity_and_structural_comparison",
    "hydroxyl_site_and_name",
    "record_backed_connectivity_not_measured_pose",
    "computed_conformer_not_observed_binding",
    "structure_cannot_establish_human_effects",
    "source_record_label_accuracy",
    "editorial_ending",
)
# Locked reference text is independent of the caller-provided phone manifest.
# This is an exact emitted-annotation CONTRACT, not OCR or clinical approval.
# Any new rendered science/source text must first receive its own source review.
EXPECTED_NON_CAPTION_ANNOTATIONS = {
    "sentence_1": (
        ("hook", "MITRAGYNINE"),
        ("disclosure", "No reaction"),
    ),
    "sentence_2": (
        ("science", "Look at the\nhydroxyl group."),
        ("science", "–OH group: oxygen + hydrogen"),
        ("disclosure", "DETAIL REVEAL • computed model"),
        ("disclosure", "Hydrogen atoms omitted"),
    ),
    "sentence_3": (
        ("science", "A record of\nconnected atoms."),
        ("science", "Dots mark atoms. Lines mark bonds."),
        ("science", "7-HYDROXYMITRAGYNINE"),
    ),
    "sentence_4": (
        ("science", "A possible\n3D shape."),
        ("disclosure", "Computed 3D illustration • not filmed"),
        ("disclosure", "Hydrogen atoms omitted"),
    ),
    "sentence_5": (
        ("science", "STRUCTURE"),
    ),
    "source_hold": (
        ("science", "SOURCE"),
        ("source", "PubChem"),
        ("source", "Mitragynine • CID 3034396"),
        ("source", "7-OH • CID 44301524"),
        ("source", "CID = compound record number"),
        ("source", "C23H30N2O5"),
        ("source", "pubchem.ncbi.nlm.nih.gov"),
    ),
    "sentence_6": (
        ("science", "Look closer."),
        ("disclosure", "Computed detail"),
        ("disclosure", "Hydrogens omitted"),
    ),
}


def hold(code):
    raise ValueError("CLAIM_SCREEN_HOLD:" + code)


def sha256_file(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for part in iter(lambda: f.read(1024 * 1024), b""):
            h.update(part)
    return h.hexdigest()


def inspect(movie, wav, receipt_path, phone_plan_path):
    movie, wav = Path(movie), Path(wav)
    if any(not f.is_file() or f.is_symlink() for f in (movie, wav, Path(receipt_path), Path(phone_plan_path))):
        hold("REGULAR_IMMUTABLE_INPUT_FILES_REQUIRED")
    receipt = json.loads(Path(receipt_path).read_text(encoding="utf-8"))
    plan = json.loads(Path(phone_plan_path).read_text(encoding="utf-8"))
    video_sha = sha256_file(movie)
    wav_sha = sha256_file(wav)
    if (receipt.get("videoSha256") != video_sha or plan.get("expectedVideoSha256") != video_sha
            or receipt.get("sourceWavSha256") != WAV_SHA or wav_sha != WAV_SHA):
        hold("REAL_VIDEO_OR_SOURCE_AUDIO_IDENTITY_DRIFT")
    if (receipt.get("status") != "NEW_RENDERED_RESEARCH_CANDIDATE_REQUIRES_INDEPENDENT_REVIEW"
            or receipt.get("isOriginalV5") is not False or receipt.get("treatment") != "specimen"
            or receipt.get("resolution") != [1080, 1920]
            or receipt.get("nativePixelsDrawnAtOutputResolution") is not True
            or receipt.get("scienceApproved") is not False or receipt.get("mayPublish") is not False):
        hold("NATIVE_RESEARCH_RELEASE_BOUNDARY_REQUIRED")
    if plan.get("status") != "RESEARCH_ONLY" or plan.get("releaseApproved") is not False:
        hold("PHONE_PLAN_NOT_RESEARCH_ONLY")
    chemistry = receipt.get("chemistry")
    if not isinstance(chemistry, list) or len(chemistry) != 2:
        hold("EXACT_TWO_SOURCE_CHEMISTRY_REQUIRED")
    identities = {(v.get("cid"), v.get("inchiKey"), v.get("url")) for v in chemistry if isinstance(v, dict)}
    expected = {(s.pubchem_cid, s.inchi_key, s.source_url) for s in SOURCES}
    if identities != expected:
        hold("COMPOUND_SOURCE_IDENTITY_DRIFT")
    scenes = receipt.get("scenes")
    if not isinstance(scenes, list) or tuple(s.get("id") for s in scenes if isinstance(s, dict)) != SCENES:
        hold("EXACT_NARRATION_SCENES_REQUIRED")
    lines = list(LINES[:5]) + [""] + [LINES[5]]
    for scene, line in zip(scenes, lines):
        if scene.get("line") != line:
            hold("FROZEN_SPOKEN_SCRIPT_DRIFT")
        cues = scene.get("captionWords", [])
        if [c.get("text") for c in cues] != line.split():
            hold("AUDIO_LOCKED_WORD_CAPTION_DRIFT")
        if not (isinstance(scene.get("startSec"), (float, int))
                and isinstance(scene.get("endSec"), (float, int))
                and scene["endSec"] > scene["startSec"]):
            hold("INVALID_NARRATION_TIME_BOUNDS")
    shots = plan.get("shots")
    if not isinstance(shots, list) or not shots:
        hold("SOURCE_BOUND_FRAME_ANNOTATIONS_REQUIRED")
    grouped = {name: [] for name in SCENES}
    for shot in shots:
        name = shot.get("id", "")
        base = name.rsplit("_part", 1)[0] if "_part" in name else name
        if base not in grouped:
            hold("UNEXPECTED_FILM_SHOT_OR_CLAIM")
        matching = scenes[SCENES.index(base)]
        if not (matching["startSec"] - .001 <= shot.get("startSec", -1)
                < shot.get("endSec", -1) <= matching["endSec"] + .001):
            hold("SHOTS_NOT_BOUND_TO_NARRATION")
        annotations = shot.get("annotations")
        if not isinstance(annotations, list) or any(not isinstance(a, dict) or not isinstance(a.get("text"), str) for a in annotations):
            hold("EMITTED_FRAME_TEXT_MISSING")
        captions = " ".join(a["text"] for a in annotations if a.get("role") == "caption")
        expected_captions = matching["line"]
        if base == "sentence_1" and name in ("sentence_1_part0", "sentence_1_part1"):
            original_words = matching["line"].split()
            pivot = original_words.index("different")
            expected_captions = " ".join(original_words[:pivot] if name.endswith("part0")
                                         else original_words[pivot:])
        if base == "sentence_5" and name in ("sentence_5_part0", "sentence_5_part1"):
            # Exact acoustic negation divides *one immutable sentence* into
            # two non-overlapping caption phrases. Do not let the first shot
            # display the not-yet-spoken effect claim or any rewritten words.
            original_words = matching["line"].split()
            pivot = original_words.index("not")
            expected_captions = " ".join(original_words[:pivot] if name.endswith("part0")
                                         else original_words[pivot:])
        if captions != expected_captions:
            hold("VISIBLE_CAPTIONS_MISMATCH_FROZEN_NARRATION")
        if shot.get("assetKind") == "nonfactual_illustration" and not any(
                a.get("role") == "disclosure" and "illustration" in a.get("text", "").lower()
                and "not proof" in a.get("text", "").lower() for a in annotations):
            hold("BOTANICAL_ILLUSTRATION_LACKS_DISCLOSURE")
        grouped[base].append((shot, annotations))
    if any(not entries for entries in grouped.values()):
        hold("MISSING_NARRATED_SCENE")
    # Real emitter marks spatial models as computed and says hydrogen was omitted.
    # The opening now uses sourced 2D diagrams, not an inferred 3D model.
    for base in ("sentence_2", "sentence_4", "sentence_6"):
        for shot, annotations in grouped[base]:
            disclosures = " ".join(a["text"] for a in annotations if a.get("role") == "disclosure").lower()
            hydrogen_disclosure = "hydrogens omitted" if base == "sentence_6" else "hydrogen atoms omitted"
            if "computed" not in disclosures or hydrogen_disclosure not in disclosures:
                hold("COMPUTED_MODEL_UNDISCLOSED")
    source_labels = {a["text"] for _, ann in grouped["source_hold"] for a in ann if a.get("role") == "source"}
    if not {"PubChem", "Mitragynine • CID 3034396", "7-OH • CID 44301524", "C23H30N2O5", "pubchem.ncbi.nlm.nih.gov"} <= source_labels:
        hold("VISIBLE_PRIMARY_SOURCE_LABEL_DRIFT")
    comparison = grouped["sentence_1"]
    diff_word = next((c for c in scenes[0]["captionWords"]
                      if c["text"].casefold().strip("?!.,") == "different"), None)
    if diff_word is None or len(comparison) != 2:
        hold("TWO_SOURCE_HOOK_HARD_CUT_REQUIRED")
    first, second = sorted(comparison, key=lambda pair: pair[0]["startSec"])
    if (first[0]["id"] != "sentence_1_part0" or second[0]["id"] != "sentence_1_part1"
            or abs(second[0]["startSec"] - diff_word["startSec"]) > .001):
        hold("COMPARISON_MUST_CUT_AT_SPOKEN_DIFFERENT")
    payoff = grouped["sentence_5"]
    not_word = next((c for c in scenes[4]["captionWords"] if c["text"].casefold() == "not"), None)
    if not not_word or len(payoff) != 2:
        hold("SPOKEN_NEGATION_PAYOFF_TIMING_REQUIRED")
    earlier, later = sorted(payoff, key=lambda v: v[0]["startSec"])
    if (earlier[0].get("id") != "sentence_5_part0"
            or later[0].get("id") != "sentence_5_part1"
            or abs(later[0]["startSec"] - not_word["startSec"]) > .001
            or abs(earlier[0]["endSec"] - not_word["startSec"]) > .001):
        hold("PAYOFF_MUST_START_AT_SPOKEN_NOT")
    if (any(a["text"] == "≠" for a in earlier[1])
            or not any(a["text"] == "≠" for a in later[1])):
        hold("STRUCTURE_EFFECTS_NEGATION_INVERTED")
    # Explicit scene-specific allowlist rejects ANY unknown science/source/hook
    # wording, including harmless-sounding synonyms, added claims, duplicated
    # source labels, reordered labels and role swaps. The manifest is still a
    # renderer declaration; real decoded pixel/OCR checks remain separate.
    for base, entries in grouped.items():
        expected = EXPECTED_NON_CAPTION_ANNOTATIONS[base]
        for shot, annotations in entries:
            observed = tuple((a.get("role"), a["text"]) for a in annotations
                             if a.get("role") != "caption")
            # The negative visual payoff is the only intentionally variable
            # science text, and is allowed strictly after the spoken "not".
            if base == "sentence_1" and shot is second[0]:
                expected_shot = (
                    ("hook", "7-OH"), ("disclosure", "No reaction"),
                )
            elif base == "sentence_5" and shot is later[0]:
                expected_shot = (
                    ("science", "≠"), ("science", "HUMAN EXPERIENCE"),
                )
            else:
                expected_shot = expected
            if observed != expected_shot:
                hold("VISUAL_CLAIM_UNSUPPORTED_OR_CONTRADICTORY")
    reviews = []
    for scene, topic in zip(scenes, REVIEW_TOPICS):
        reviews.append({"scene": scene["id"], "timeStartSec": scene["startSec"],
                        "timeEndSec": scene["endSec"], "topic": topic,
                        "exactSpokenScript": scene["line"],
                        "sourceUrls": [s.source_url for s in SOURCES] if topic != "editorial_ending" else [],
                        "independentlyVerifiedPrimarySourceSemantics": False,
                        "reviewDecision": "INDEPENDENT_SCIENCE_AND_LISTENING_REVIEW_REQUIRED"})
    return {"schema": "ths-narrated-claims-actual-media-screen-v1",
            "status": "MECHANICAL_SOURCE_CAPTION_SCREEN_PASS_INDEPENDENT_REVIEW_REQUIRED",
            "actualVideoSha256": video_sha, "actualWavSha256": wav_sha,
            "receiptSha256": sha256_file(receipt_path), "phonePlanSha256": sha256_file(phone_plan_path),
            "narratedScenesInspected": len(scenes), "emittedShotIntervalsInspected": len(shots),
            "reviewRows": reviews, "independentScientificReviewApproved": False,
            "emittedWordsProvenAudible": False, "naturalPronunciationApproved": False,
            "mutedComprehensionApproved": False, "craftApproved": False,
            "realHandsetPlaybackVerified": False, "mayPublish": False,
            "excellentFirstRenderCredited": False}


def main():
    p = argparse.ArgumentParser()
    for name in ("movie", "wav", "receipt", "phone-plan", "out"):
        p.add_argument("--" + name, required=True)
    args = p.parse_args()
    destination = Path(args.out)
    destination.unlink(missing_ok=True)
    result = inspect(args.movie, args.wav, args.receipt, args.phone_plan)
    destination.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in result.items() if k != "reviewRows"}, indent=2))


if __name__ == "__main__":
    main()
