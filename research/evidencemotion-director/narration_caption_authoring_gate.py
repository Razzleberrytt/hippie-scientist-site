"""Research-only authored narration vs authored caption token/scene parity.

This cannot prove that recorded audio *speaks* the script, true phonemes,
word onsets, voice naturalness, on-screen pixels, or release approval.
"""
import math
import re
import unicodedata

TOKEN = re.compile(r"[a-z0-9]+(?:'[a-z0-9]+)?")
# Fail closed instead of silently stripping unknown characters or markup.
ALLOWED = re.compile(r"[a-z0-9\s.,;:!?()\[\]\-–—\"'/&%+]+", re.I)


def hold(reason, **details):
    return {
        "status": "HOLD", "errors": [reason], "mayPublish": False,
        "spokenWordsConfirmedAgainstCaptions": False,
        "wordTimingCalibrated": False, "phonemeIdentityVerified": False,
        "pronunciationVerified": False, "humanVoiceQualityVerified": False,
        **details,
    }


def words(value):
    if not isinstance(value, str) or not value.strip():
        raise ValueError("EMPTY_AUTHORING_TEXT")
    text = unicodedata.normalize("NFKC", value).replace("’", "'").lower()
    # Confusables, zero-width control chars, emoji and HTML do not disappear.
    if not ALLOWED.fullmatch(text):
        raise ValueError("UNRECOGNIZED_AUTHORING_CHARACTER")
    tokens = TOKEN.findall(text)
    if not tokens:
        raise ValueError("EMPTY_AUTHORING_TOKENS")
    return tokens


def check_authoring(provenance, cues):
    """Inspect trusted metadata and parsed SRT tuples; no fake ASR verdict."""
    try:
        if not isinstance(provenance, dict) or not isinstance(cues, list) or not cues:
            return hold("AUTHORING_INVENTORY_INVALID")
        scenes = provenance.get("scenes")
        if not isinstance(scenes, list) or not scenes:
            return hold("NARRATION_SCENES_MISSING")
        if provenance.get("mayPublish") is not False:
            return hold("SOURCE_PROVENANCE_UNSAFE")
        if provenance.get("word_alignment") != "NOT_PERFORMED" or provenance.get("phonetic_qa") != "NOT_PERFORMED":
            return hold("SOURCE_ALIGNMENT_UNVERIFIED_OR_MISREPRESENTED")
        original_tokens, caption_tokens, scene_words, cue_by_scene = [], [], [], []
        prev_end = 0.0
        ids = set()
        for index, scene in enumerate(scenes):
            if not isinstance(scene, dict):
                return hold("NARRATION_SCENE_INVALID", scene=index+1)
            ident = scene.get("id")
            start, end = scene.get("voice_start_s"), scene.get("voice_end_s")
            if (not isinstance(ident, str) or not ident.strip() or ident in ids
                    or type(start) not in (float, int) or type(end) not in (float, int)
                    or not math.isfinite(start) or not math.isfinite(end)
                    or start < prev_end - .003 or start < 0 or end <= start):
                return hold("NARRATION_SCENE_TIMING_OR_ID_INVALID", scene=index+1)
            ids.add(ident)
            scene_words.append(words(scene.get("text")))
            original_tokens.extend(scene_words[-1]); cue_by_scene.append([])
            prev_end = end
        prev_end = 0.0
        for index, cue in enumerate(cues):
            if not isinstance(cue, (tuple, list)) or len(cue) != 4:
                return hold("CAPTION_CUE_INVALID", cue=index+1)
            number, start, end, text = cue
            if (type(number) is not int or number != index+1
                    or type(start) not in (float, int) or type(end) not in (float, int)
                    or not math.isfinite(start) or not math.isfinite(end)
                    or not prev_end <= start < end):
                return hold("CAPTION_CUE_TIMING_INVALID", cue=index+1)
            tokens = words(text)
            caption_tokens.extend(tokens); prev_end = end
            # Every caption must lie wholly within exactly one authored voice scene.
            owners = [i for i, sc in enumerate(scenes)
                      if sc["voice_start_s"]-.003 <= start and end <= sc["voice_end_s"]+.003]
            if len(owners) != 1:
                return hold("CAPTION_CROSSES_NARRATION_SCENE", cue=index+1)
            cue_by_scene[owners[0]].extend(tokens)
        for index, (expected, observed) in enumerate(zip(scene_words, cue_by_scene), 1):
            if expected != observed:
                difference = next((j for j, pair in enumerate(zip(expected, observed))
                                   if pair[0] != pair[1]), min(len(expected), len(observed)))
                return hold("SCENE_CAPTION_SCRIPT_WORD_MISMATCH", scene=index,
                            firstDifferingTokenIndex=difference+1,
                            scriptTokenCount=len(expected), captionTokenCount=len(observed))
        if original_tokens != caption_tokens:
            return hold("FULL_CAPTION_SCRIPT_WORD_MISMATCH")
        return {**hold("SOURCE_AUTHORING_PARITY_IS_NOT_SPOKEN_PROOF"),
                "status": "RESEARCH_AUTHORING_PARITY_HOLD", "errors": [],
                "matchedScriptTokens": len(original_tokens), "matchedCueCount": len(cues),
                "matchedSceneCount": len(scenes),
                "thisOnlyProvesDeclaredScriptMatchesAuthoredCaptions": True}
    except (ValueError, TypeError, KeyError, OverflowError) as exc:
        return hold("AUTHORING_INPUT_INVALID", detail=str(exc)[:160])
