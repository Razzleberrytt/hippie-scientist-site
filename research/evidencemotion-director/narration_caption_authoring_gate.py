"""Research-only authored narration vs authored caption token/scene parity.

This cannot prove that recorded audio *speaks* the script, true phonemes,
word onsets, voice naturalness, on-screen pixels, or release approval.
"""
import hashlib
import io
import json
import math
import re
import unicodedata
import wave

# Retain percentages, decimals, hyphenated terms and ratios:
# 15% != 15, 1.5 != 1 5, 7-OH != 7 OH.
TOKEN = re.compile(r"[a-z0-9]+(?:'[a-z0-9]+)*(?:\.[0-9]+)*(?:[-/][a-z0-9]+(?:\.[0-9]+)*)*%?|[+&–—]")
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


def check_authoring(provenance_raw, frozen_provenance_sha256,
                    source_wav_raw, frozen_wav_sha256, cues):
    """Bind original authored JSON and WAV to two independently frozen SHA pins.

    The expected SHAs must come from trusted evidence, NOT be generated from
    the candidate bytes by the caller. PCM inspection is not a phonetic verdict.
    """
    try:
        pins = (frozen_provenance_sha256, frozen_wav_sha256)
        if not all(isinstance(x, str) and
                   re.fullmatch(r"[0-9a-f]{64}", x) for x in pins):
            return hold("INDEPENDENT_ORIGINAL_SOURCE_PINS_REQUIRED")
        if (not isinstance(provenance_raw, bytes) or
                not 2 <= len(provenance_raw) <= 100_000 or
                not isinstance(source_wav_raw, bytes) or
                not 44 <= len(source_wav_raw) <= 20_000_000):
            return hold("SOURCE_BYTES_MISSING_OR_UNBOUNDED")
        if hashlib.sha256(provenance_raw).hexdigest() != frozen_provenance_sha256:
            return hold("ORIGINAL_VOICE_PROVENANCE_CHANGED")
        if hashlib.sha256(source_wav_raw).hexdigest() != frozen_wav_sha256:
            return hold("ORIGINAL_NARRATION_WAV_CHANGED")
        try:
            with wave.open(io.BytesIO(source_wav_raw), 'rb') as audio:
                if (audio.getnchannels(), audio.getsampwidth(),
                        audio.getframerate(), audio.getcomptype()) != (1, 2, 24000, "NONE"):
                    return hold("PINNED_ORIGINAL_PCM16_WAV_FORMAT_REQUIRED")
                sample_count = audio.getnframes()
                pcm = audio.readframes(sample_count)
                if (sample_count < 2400 or sample_count * 2 != len(pcm)):
                    return hold("ORIGINAL_WAV_PCM_TRUNCATED_OR_TOO_SHORT")
        except (EOFError, OSError, wave.Error):
            return hold("ORIGINAL_NARRATION_WAV_UNREADABLE")
        provenance = json.loads(provenance_raw)
        if not isinstance(provenance, dict) or not isinstance(cues, list) or not cues:
            return hold("AUTHORING_INVENTORY_INVALID")
        if provenance.get("wav_sha256") != frozen_wav_sha256:
            return hold("PROVENANCE_AUDIO_SOURCE_BINDING_INVALID")
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
    except (ValueError, TypeError, KeyError, OverflowError, UnicodeError) as exc:
        return hold("AUTHORING_INPUT_INVALID", detail=str(exc)[:160])
