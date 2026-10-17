"""EvidenceMotion Lane 2: source-specific repeat-pattern research ONLY.

Two similarly spoken terms can both be wrong. Neither spectral matching nor a
confident speech recognizer proves phonemes, stress, intelligibility or release.
"""
import argparse
from difflib import SequenceMatcher
import hashlib
import io
import json
import re
from pathlib import Path
import wave
import zipfile

import numpy as np

SOURCE_ARCHIVE_SHA = "e5c28e40e1c8c424f0ec6924e79a6d9b10b68f91ab038bd026734c858411cbf1"
SOURCE_WAV_REFERENCE = "9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435"
ORIGINAL_CLIP_HASHES = {
    1: "3c4eddcf5e4d9a61797e4a2785a01713bb78d41749374ad62760c0f5fcf99a3b",
    2: "4f02cf1a42ef6ee2a306f6ee0b669d837fc2602c43cf37cc26545c90469d9429",
    3: "c470eb126766ed42bf5fc4e6d3797b489efb6679c928d69ee41d99df592dbfae",
    4: "7e6887d28f9b96aa61db09865449c299c6a14a0c141165574b6c1f6f004476d3",
}
MFA_SOURCE_RECEIPT_SHA = "1b27276bfed4134ad8d2becd9b782fb7072ff2e88943da1776c8b1c99094e371"
MFA_SOURCE_ALIGNMENT_SHA = "a034f00c4fdffaa3574058093e506f184c6b347a5b5561556005c28ec86db626"
# Source-order window indices in the first-party original MFA research receipt.
ORIGINAL_MFA_WINDOWS = {
    1: ("7-OH", (2, 3, 4)),
    2: ("mitragynine", (7,)),
    3: ("7-hydroxymitragynine", (16, 17)),
    4: ("mitragynine", (19,)),
}
POSE_ASR_RECEIPT_SHA = "87a9c5fd757f269967dfc751ea322f8b33e774b9c0a41016f94e90b6b829cdaa"
POSE_SOURCE_CLIP_SHA = "43c010d2d0cc1a400e05423abebfb917562b2cd51ed70eb02b73b84f3493e149"
# Independently re-extracted from exact full original 24 kHz PCM16 WAV SHA
# 9dca049e... using immutable MFA candidate SHA a034f00c....
# Nine whole candidate-word excerpts: four term windows and five same-narrator
# pose/poles comparison windows. These PCM SHA-256 pins detect BYTE-EXACT
# source contamination even when WAV headers/chunks are repackaged.
# They are NOT phoneme, timing, stress or speaker-verification ground truth.
ORIGINAL_PCM_EXCERPT_SHA256 = frozenset({
    "57bbe1ee1e1818b122e708fac7fee16b8dd0dfb673c31102a469c67e84f44ab2",  # 7-OH
    "1886f62741cc8ac440af625b094724b6ca5b5d27b531d565678ff17c3d44f136",  # mitragynine #1
    "54228088b5de668bb2a25a7cc1581430e3c9b3d48f56c025ca94d14f1a0b34cd",  # 7-hydroxy..
    "ba336fe42a479b9b7fbbec5a30ac7fdaa685be97795be47c1d433f9e430bc10c",  # mitragynine #2
    "62cb67bac7c1c0cecc28bfd9f8c83d2fddfc7412cf788085b17b6ad621090389",  # pose/poles
    "f58a3b67a7869904ddda1ac152e25f03f031925edf3617bda3e61085e19d60b3",  # is
    "3439698ba61501c49e81b3c14d17e0d61d6ab88cf9641a0a78c6a26bd0f21c35",  # feel
    "1fa3f5925ff0215e015ae39efb50bb901385caa1a1c6f8d6369f71910e62183d",  # detail
    "d9fd5511396ef1e113c95805faed195c0806fc7fe54a83375170a9391710db29",  # closer
})
SCHEMA = "ths-lane2-source-repeated-term-research-v1"


def digest(data):
    return hashlib.sha256(data).hexdigest()


def hold(reason):
    return {"schema": SCHEMA, "status": "HOLD", "errors": [reason],
            "mayPublish": False, "pronunciationVerified": False,
            "wordTimingCalibrated": False, "sourceWavIndependentlyRehashed": False}



def source_clip_sample_offsets(master_raw, clip_raws, expected_sha):
    """Prove each raw excerpt is one exact PCM slice of the pinned full WAV.

    This establishes file provenance, not a phoneme, word boundary or speaker
    quality.  Reject fabricated, edited, or multiply-reused source excerpts.
    """
    if digest(master_raw) != expected_sha:
        raise ValueError("ORIGINAL_MASTER_WAV_SHA_CHANGED")
    with wave.open(io.BytesIO(master_raw), "rb") as source:
        if (source.getnchannels(), source.getsampwidth(), source.getframerate(),
                source.getcomptype()) != (1, 2, 24000, "NONE"):
            raise ValueError("ORIGINAL_MASTER_WAV_FORMAT_INVALID")
        full_pcm = source.readframes(source.getnframes())
    offsets = {}
    for index, raw in sorted(clip_raws.items()):
        with wave.open(io.BytesIO(raw), "rb") as excerpt:
            if (excerpt.getnchannels(), excerpt.getsampwidth(),
                    excerpt.getframerate(), excerpt.getcomptype()) != (1, 2, 24000, "NONE"):
                raise ValueError("ORIGINAL_CLIP_FORMAT_INVALID")
            clip_pcm = excerpt.readframes(excerpt.getnframes())
        if len(clip_pcm) < 2 or len(clip_pcm) % 2:
            raise ValueError("ORIGINAL_CLIP_PCM_INVALID")
        byte_start = full_pcm.find(clip_pcm)
        if (byte_start < 0 or byte_start % 2
                or full_pcm.find(clip_pcm, byte_start + 2) != -1):
            raise ValueError("ORIGINAL_CLIP_NOT_UNIQUELY_EXTRACTED_FROM_MASTER")
        offsets[index] = byte_start // 2
    return offsets

def decode_pcm(raw):
    if not isinstance(raw, bytes) or not 44 <= len(raw) <= 300000:
        raise ValueError("SOURCE_CLIP_SIZE_INVALID")
    try:
        with wave.open(io.BytesIO(raw), "rb") as src:
            if (src.getnchannels(), src.getsampwidth(), src.getframerate(),
                    src.getcomptype()) != (1, 2, 24000, "NONE"):
                raise ValueError("MONO_PCM16_24KHZ_REQUIRED")
            n = src.getnframes()
            data = src.readframes(n)
    except (OSError, EOFError, wave.Error) as exc:
        raise ValueError("SOURCE_CLIP_WAV_INVALID") from exc
    if not 2400 <= n <= 120000 or len(data) != 2*n:
        raise ValueError("SOURCE_CLIP_SAMPLES_INVALID")
    output = np.frombuffer(data, dtype="<i2").astype(np.float64)/32768
    if float(np.sqrt(np.mean(output**2))) < .002:
        raise ValueError("SILENT_CLIP_NOT_SPEECH")
    return output


def trajectory(signal):
    """Auditable 25ms/10ms log-spectrum+DCT, with low-energy frames excluded."""
    x = np.asarray(signal, dtype=float)
    if x.ndim != 1 or not 2400 <= len(x) <= 120000 or not np.isfinite(x).all():
        raise ValueError("SPEECH_SIGNAL_INVALID")
    frames = np.lib.stride_tricks.sliding_window_view(x, 600)[::240].copy()
    frames -= frames.mean(axis=1, keepdims=True)
    energy = np.mean(frames*frames, axis=1)
    if energy.max() < 1e-6:
        raise ValueError("SPEECH_ENERGY_MISSING")
    active = energy >= max(energy.max()*.025, 1e-7)
    if active.sum() < 5:
        raise ValueError("ACTIVE_SPEECH_FRAMES_MISSING")
    psd = abs(np.fft.rfft(frames[active]*np.hanning(600), n=1024))**2
    freq = np.fft.rfftfreq(1024, d=1/24000)
    limits = np.geomspace(110, 6000, 33)
    bands = np.array([
        np.log1p(psd[:, (freq >= a) & (freq < b)].sum(axis=1)*200)
        for a,b in zip(limits[:-1], limits[1:])
    ]).T
    c = np.cos(np.pi*(np.arange(32)[None,:]+.5)*np.arange(1,14)[:,None]/32)
    f = bands @ c.T
    f /= np.linalg.norm(f, axis=0)[None,:]+1e-6
    return f-f.mean(axis=0)[None,:]


def distance(a, b):
    a=np.asarray(a, dtype=float); b=np.asarray(b,dtype=float)
    if (a.ndim != 2 or b.ndim != 2 or a.shape[1] != 13 or b.shape[1] != 13
            or not 5 <= len(a) <= 1000 or not 5 <= len(b) <= 1000
            or not np.isfinite(a).all() or not np.isfinite(b).all()
            or (np.linalg.norm(a, axis=1) < 1e-8).any()
            or (np.linalg.norm(b, axis=1) < 1e-8).any()):
        raise ValueError("SPECTRAL_FEATURES_INVALID")
    a=a/(np.linalg.norm(a, axis=1, keepdims=True)+1e-8)
    b=b/(np.linalg.norm(b, axis=1, keepdims=True)+1e-8)
    cost=np.maximum(0,1-a@b.T)
    prev=np.full(len(b)+1, np.inf)
    prev[0]=0
    for i in range(len(a)):
        row=np.full(len(b)+1, np.inf)
        for j in range(len(b)):
            row[j+1]=cost[i,j]+min(prev[j], row[j], prev[j+1])
        prev=row
    return float(prev[-1]/max(len(a),len(b)))


def compare(first, second, unrelated):
    """Self-contained physical negative controls, no ASR or lexical decoding."""
    if len(unrelated) != 2:
        raise ValueError("EXACT_TWO_ORIGINAL_TERM_CONTROLS_REQUIRED")
    f=[trajectory(x) for x in (first, second, *unrelated)]
    repeated=distance(f[0],f[1])
    nulls=[distance(f[i],f[j]) for i,j in ((0,2),(0,3),(1,2),(1,3))]
    nearest=min(nulls)
    consistent=repeated <= .30 and repeated <= nearest*.50
    return {"repeatNormalizedSpectralDistance":round(repeated,6),
            "closestOtherOriginalTermDistance":round(nearest,6),
            "ratioVsClosestControl":round(repeated/nearest,6) if nearest else None,
            "controlDistances":[round(n,6) for n in nulls],
            "repeatPatternConsistent":bool(consistent),
            "heuristicIsSourceSpecific":True,
            "phonesOrWordIdentityProven":False}





def audit_original_asr_digital_zero_onsets(source_raw, asr_raw):
    """Negative-only source-WAV proof: ASR cannot start speech in 150ms of zeros.

    Audible signal does NOT certify a phone, lexical identity or accurate boundary.
    This never corrects or edits the original waveform or caption timings.
    """
    if not isinstance(source_raw, bytes) or not isinstance(asr_raw, bytes):
        return hold("DIGITAL_ZERO_SOURCE_BYTES_REQUIRED")
    if digest(source_raw) != SOURCE_WAV_REFERENCE:
        return hold("DIGITAL_ZERO_ORIGINAL_WAV_SHA_CHANGED")
    if digest(asr_raw) != POSE_ASR_RECEIPT_SHA:
        return hold("DIGITAL_ZERO_ORIGINAL_ASR_SHA_CHANGED")
    try:
        asr = json.loads(asr_raw)
        words = asr.get("recognizedWords")
        if (asr.get("sourceWavSha256") != SOURCE_WAV_REFERENCE
                or asr.get("mayPublish") is not False
                or not isinstance(words, list) or len(words) != 70):
            return hold("DIGITAL_ZERO_ASR_AUTHORITY_OR_INVENTORY_CHANGED")
        with wave.open(io.BytesIO(source_raw), "rb") as audio:
            if (audio.getnchannels(), audio.getsampwidth(),
                    audio.getframerate(), audio.getcomptype(),
                    audio.getnframes()) != (1, 2, 24000, "NONE", 824336):
                return hold("DIGITAL_ZERO_MASTER_FORMAT_CHANGED")
            pcm_raw = audio.readframes(audio.getnframes())
        if len(pcm_raw) != 824336*2:
            return hold("DIGITAL_ZERO_MASTER_SAMPLES_TRUNCATED")
        pcm = np.frombuffer(pcm_raw, dtype="<i2")
        failures = []
        prev = -1.0
        for i, row in enumerate(words):
            if not isinstance(row, dict):
                return hold("DIGITAL_ZERO_ASR_WORD_INVALID")
            start, end, spelling = row.get("start"), row.get("end"), row.get("word")
            if (not isinstance(start, (int, float)) or isinstance(start, bool)
                    or not isinstance(end, (int, float)) or isinstance(end, bool)
                    or not np.isfinite(start) or not np.isfinite(end)
                    or not 0 <= prev <= start < end <= 824336/24000
                    or not isinstance(spelling, str) or not spelling.strip()):
                # Previous sentinel -1 is handled separately for the first row.
                if not (i == 0 and isinstance(start, (int, float))
                        and not isinstance(start, bool)
                        and isinstance(end, (int, float)) and not isinstance(end, bool)
                        and np.isfinite(start) and np.isfinite(end)
                        and 0 <= start < end <= 824336/24000
                        and isinstance(spelling, str) and spelling.strip()):
                    return hold("DIGITAL_ZERO_ASR_BOUNDARY_OR_ORDER_INVALID")
            prev = start
            start_sample = round(start*24000)
            end_sample = round(end*24000)
            if start_sample >= len(pcm):
                return hold("DIGITAL_ZERO_ASR_START_SAMPLE_OUTSIDE_MASTER")
            if end_sample <= start_sample:
                return hold("DIGITAL_ZERO_ASR_WORD_INTERVAL_COLLAPSES_TO_ZERO_SAMPLES")
            scan = pcm[start_sample:min(start_sample+24000, len(pcm))]
            active = np.flatnonzero(scan)
            gap_samples = int(active[0]) if len(active) else len(scan)
            # A short ASR token completely inside genuine digital zeros
            # must also HOLD even when its duration is below the 150ms
            # onset screening window. This is a physical negative only.
            fully_silent_word = not bool(np.any(pcm[start_sample:end_sample]))
            if gap_samples >= 3600 or fully_silent_word:
                failures.append({
                    "wordIndex": i, "asrWordHypothesis": spelling,
                    "claimedStartSeconds": start,
                    "claimedStartSample": start_sample,
                    "claimedEndSample": end_sample,
                    "entireClaimedWordIntervalIsDigitalZero": fully_silent_word,
                    "contradictionType": ("FULL_WORD_DIGITAL_ZERO" if fully_silent_word
                                          else "ONSET_150MS_BEFORE_ANY_NONZERO"),
                    "firstNonzeroSampleOrOneSecondLimit": start_sample + gap_samples,
                    "provenDigitalZeroAfterOnsetMs": round(gap_samples/24, 3),
                    "firstNonzeroFoundWithinOneSecond": bool(len(active)),
                })
        return {"schema": SCHEMA,
                "status": ("RESEARCH_IMPOSSIBLE_ASR_ZERO_ONSET_HOLD" if failures
                           else "RESEARCH_NO_ZERO_ONSET_CONTRADICTION_HOLD"),
                "originalWavSha256": SOURCE_WAV_REFERENCE,
                "originalAsrReceiptSha256": POSE_ASR_RECEIPT_SHA,
                "sourceWavIndependentlyRehashed": True,
                "wordCountScreened": len(words),
                "zeroOnsetContradictionThresholdMs": 150,
                "contradictionCount": len(failures),
                "contradictions": failures,
                "mayPublish": False, "pronunciationVerified": False,
                "phonemeIdentityVerified": False, "wordTimingCalibrated": False,
                "wordOnsetsApproved": False,
                "caution": "Digital zeros reject only impossible ASR onset hypotheses; "
                           "other boundaries and phones remain uncalibrated."}
    except (ValueError, TypeError, OSError, wave.Error, EOFError):
        return hold("DIGITAL_ZERO_ORIGINAL_ASR_PARSE_FAILED")


def audit_original_mfa_word_signal_windows(source_raw, alignment_raw):
    """SHA-pinned original narration versus 73 forced word intervals, negative-only.

    An active waveform cannot validate any lexical phone or actual word boundary.
    """
    if not isinstance(source_raw, bytes) or not isinstance(alignment_raw, bytes):
        return hold("MFA_SIGNAL_SOURCE_BYTES_REQUIRED")
    if digest(source_raw) != SOURCE_WAV_REFERENCE:
        return hold("MFA_SIGNAL_ORIGINAL_WAV_SHA_CHANGED")
    if digest(alignment_raw) != MFA_SOURCE_ALIGNMENT_SHA:
        return hold("MFA_SIGNAL_ALIGNMENT_SHA_CHANGED")
    try:
        report = json.loads(alignment_raw)
        words = report.get("wordAlignment")
        if (report.get("inputSha256", {}).get("wav") != SOURCE_WAV_REFERENCE
                or report.get("sampleRate") != 24000
                or report.get("sampleCount") != 824336
                or report.get("mayPublish") is not False
                or report.get("pronunciationVerified") is not False
                or report.get("timingAccuracyCalibrated") is not False
                or not isinstance(words, list) or len(words) != 73):
            return hold("MFA_SIGNAL_ALIGNMENT_AUTHORITY_OR_INVENTORY_INVALID")
        with wave.open(io.BytesIO(source_raw), "rb") as w:
            if (w.getnchannels(), w.getsampwidth(), w.getframerate(),
                    w.getcomptype(), w.getnframes()) != (1, 2, 24000, "NONE", 824336):
                return hold("MFA_SIGNAL_ORIGINAL_WAV_FORMAT_INVALID")
            pcm = w.readframes(w.getnframes())
        if len(pcm) != 824336 * 2:
            return hold("MFA_SIGNAL_ORIGINAL_PCM_TRUNCATED")
        samples = np.frombuffer(pcm, dtype="<i2")
        prior_start = -1
        conflicts = []
        for i, word in enumerate(words):
            if not isinstance(word, dict):
                return hold("MFA_SIGNAL_WORD_SCHEMA_INVALID")
            begin, end, spelling = (word.get("startMs"), word.get("endMs"),
                                    word.get("word"))
            if (not isinstance(begin, (int, float)) or isinstance(begin, bool)
                    or not isinstance(end, (int, float)) or isinstance(end, bool)
                    or not np.isfinite(begin) or not np.isfinite(end)
                    or not isinstance(spelling, str) or not spelling.strip()
                    or not 0 <= begin < end <= 824336 / 24
                    or begin < prior_start):
                return hold("MFA_SIGNAL_WORD_BOUNDS_OR_ORDER_INVALID")
            prior_start = begin
            first, last = round(begin * 24), round(end * 24)
            if first >= len(samples) or last <= first:
                return hold("MFA_SIGNAL_ZERO_SAMPLE_WORD_INTERVAL_INVALID")
            if not np.any(samples[first:last]):
                conflicts.append({"wordIndex": i, "forcedWordHypothesis": spelling,
                                  "startSample": first, "endSample": last,
                                  "wholeCandidateWindowIsExactDigitalZero": True})
        return {"schema": SCHEMA,
                "status": ("RESEARCH_MFA_WHOLE_WORD_ZERO_HOLD" if conflicts
                           else "RESEARCH_MFA_NO_FULL_ZERO_WORD_HOLD"),
                "sourceWavSha256": SOURCE_WAV_REFERENCE,
                "mfaAlignmentSha256": MFA_SOURCE_ALIGNMENT_SHA,
                "sourceWavIndependentlyRehashed": True,
                "mfaWordWindowsScreened": 73,
                "wholeWordDigitalZeroCount": len(conflicts),
                "wholeWordDigitalZeroContradictions": conflicts,
                "digitalNonzeroNotLexicalOrTimingProof": True,
                "wordOnsetsApproved": False, "wordOffsetsApproved": False,
                "phonemeIdentityVerified": False, "pronunciationVerified": False,
                "wordTimingCalibrated": False, "mayPublish": False,
                "caution": "Nonzero sound within a forced word window never "
                           "proves the uttered word, phones, onset or offset."}
    except (ValueError, TypeError, OSError, EOFError, wave.Error):
        return hold("MFA_SIGNAL_ORIGINAL_SOURCE_PARSE_FAILED")


def audit_mfa_signal_files(source_path, alignment_path):
    """Read-only audit; exact input SHA and format checked in core function."""
    try:
        paths = ((Path(source_path), 3000000), (Path(alignment_path), 100000))
        if any(p.is_symlink() or not p.is_file()
               or not 0 < p.stat().st_size <= cap for p, cap in paths):
            return hold("MFA_SIGNAL_FILES_MISSING_OR_UNSAFE")
        return audit_original_mfa_word_signal_windows(
            *(p.read_bytes() for p, _ in paths))
    except (OSError, TypeError, ValueError):
        return hold("MFA_SIGNAL_FILES_UNREADABLE")


def audit_asr_zero_onsets_files(source_path, asr_path):
    """Read only the two exact original first-party assets. Never substitute."""
    try:
        paths = ((Path(source_path), 3000000), (Path(asr_path), 20000))
        if any(p.is_symlink() or not p.is_file() or not 0 < p.stat().st_size <= max_size
               for p, max_size in paths):
            return hold("DIGITAL_ZERO_ORIGINAL_SOURCE_FILES_UNAVAILABLE")
        return audit_original_asr_digital_zero_onsets(
            *(p.read_bytes() for p, _ in paths))
    except (OSError, TypeError, ValueError):
        return hold("DIGITAL_ZERO_ORIGINAL_SOURCE_FILES_UNREADABLE")


def audit_original_cross_model_word_timing(source_raw, alignment_raw, asr_raw):
    """Rank first-party, word-level MFA/ASR disagreements for human audition.

    Both tools can be wrong together. The original waveform authenticates
    review windows, NOT script words, phonemes, or true boundary placement.
    No result of this method can authorize captions or voice publication.
    """
    base = {"schema": SCHEMA, "mayPublish": False,
            "pronunciationVerified": False, "phonemeIdentityVerified": False,
            "wordTimingCalibrated": False, "captionTimingApproved": False,
            "independentHumanAnnotationPresent": False,
            "lexicalWinner": None}
    def fail(reason):
        return {**base, "status": "HOLD", "errors": [reason]}
    if not all(isinstance(x, bytes) for x in (source_raw, alignment_raw, asr_raw)):
        return fail("CROSS_MODEL_SOURCE_BYTES_REQUIRED")
    if digest(source_raw) != SOURCE_WAV_REFERENCE:
        return fail("CROSS_MODEL_WAV_SHA_MISMATCH")
    if digest(alignment_raw) != MFA_SOURCE_ALIGNMENT_SHA:
        return fail("CROSS_MODEL_MFA_SHA_MISMATCH")
    if digest(asr_raw) != POSE_ASR_RECEIPT_SHA:
        return fail("CROSS_MODEL_ASR_SHA_MISMATCH")
    try:
        mfa, asr = json.loads(alignment_raw), json.loads(asr_raw)
        original_words, recognized_words = mfa.get("wordAlignment"), asr.get("recognizedWords")
        if (mfa.get("inputSha256", {}).get("wav") != SOURCE_WAV_REFERENCE
                or mfa.get("sampleRate") != 24000
                or mfa.get("sampleCount") != 824336
                or mfa.get("mayPublish") is not False
                or mfa.get("pronunciationVerified") is not False
                or mfa.get("timingAccuracyCalibrated") is not False
                or asr.get("sourceWavSha256") != SOURCE_WAV_REFERENCE
                or asr.get("mayPublish") is not False
                or not isinstance(original_words, list) or len(original_words) != 73
                or not isinstance(recognized_words, list) or len(recognized_words) != 70):
            return fail("CROSS_MODEL_SOURCE_OR_AUTHORITY_INCONSISTENT")
        with wave.open(io.BytesIO(source_raw), "rb") as source:
            if (source.getnchannels(), source.getsampwidth(),
                    source.getframerate(), source.getcomptype(),
                    source.getnframes()) != (1, 2, 24000, "NONE", 824336):
                return fail("CROSS_MODEL_ORIGINAL_WAV_FORMAT_INVALID")
            pcm = source.readframes(source.getnframes())
        if len(pcm) != 824336 * 2:
            return fail("CROSS_MODEL_ORIGINAL_PCM_TRUNCATED")
        for rows, scale in ((original_words, 1), (recognized_words, 1000)):
            previous = -1.0
            for word in rows:
                if not isinstance(word, dict):
                    return fail("CROSS_MODEL_WORD_ROW_INVALID")
                spelling = word.get("word")
                start = word.get("startMs") if scale == 1 else word.get("start")
                end = word.get("endMs") if scale == 1 else word.get("end")
                if (not isinstance(spelling, str) or not spelling.strip()
                        or not re.sub(r"[^a-z0-9]", "", spelling.casefold())
                        or not isinstance(start, (float, int)) or isinstance(start, bool)
                        or not isinstance(end, (float, int)) or isinstance(end, bool)
                        or not np.isfinite(start) or not np.isfinite(end)
                        or not 0 <= start < end <= (824336/24)/scale
                        or start < previous):
                    return fail("CROSS_MODEL_WORD_TIMES_OR_TEXT_INVALID")
                previous = start

        normalize = lambda row: re.sub(r"[^a-z0-9]", "", row["word"].casefold())
        mfa_terms = [normalize(w) for w in original_words]
        asr_terms = [normalize(w) for w in recognized_words]
        opcodes = SequenceMatcher(
            None, mfa_terms, asr_terms, autojunk=False).get_opcodes()
        lexical_blocks, timing_reviews = [], []
        threshold_ms = 150
        duration_ms = 824336 / 24

        def review_window(mfa_slice, asr_slice):
            times = [(w["startMs"], w["endMs"]) for w in mfa_slice] + [
                (w["start"]*1000, w["end"]*1000) for w in asr_slice]
            first_ms = max(0, min(s for s, _ in times) - 200)
            last_ms = min(duration_ms, max(e for _, e in times) + 200)
            first_sample = max(0, round(first_ms * 24))
            last_sample = min(824336, round(last_ms * 24))
            if last_sample <= first_sample:
                raise ValueError("ZERO_AUDIO_REVIEW_WINDOW")
            raw = pcm[first_sample*2:last_sample*2]
            return {"sourceStartSample": first_sample,
                    "sourceEndSample": last_sample,
                    "sourcePcmSha256": digest(raw),
                    "sourceWindowMs": [round(first_sample/24, 3),
                                       round(last_sample/24, 3)]}

        matched_count = 0
        onset_flags, offset_flags = 0, 0
        for kind, i0, i1, j0, j1 in opcodes:
            left = original_words[i0:i1]
            right = recognized_words[j0:j1]
            if kind != "equal":
                lexical_blocks.append({
                    "reason": "UNRESOLVED_ASR_VS_FORCED_SCRIPT_SPELLING",
                    "mfaWordIndices": list(range(i0, i1)),
                    "asrWordIndices": list(range(j0, j1)),
                    "mfaAuthoredHypotheses": [w["word"] for w in left],
                    "asrRecognizerHypotheses": [w["word"].strip() for w in right],
                    **review_window(left, right),
                })
                continue
            for mi, ai in zip(range(i0, i1), range(j0, j1)):
                matched_count += 1
                m, a = original_words[mi], recognized_words[ai]
                onset = round(abs(m["startMs"] - 1000*a["start"]), 3)
                offset = round(abs(m["endMs"] - 1000*a["end"]), 3)
                onset_alert = onset > threshold_ms
                offset_alert = offset > threshold_ms
                onset_flags += onset_alert
                offset_flags += offset_alert
                if onset_alert or offset_alert:
                    timing_reviews.append({
                        "reason": "UNVERIFIED_CROSS_MODEL_BOUNDARY_DISAGREEMENT",
                        "mfaWordIndex": mi, "asrWordIndex": ai,
                        "matchingTextHypothesis": m["word"],
                        "onsetDisagreementMs": onset,
                        "offsetDisagreementMs": offset,
                        "onsetAbove150ms": bool(onset_alert),
                        "offsetAbove150ms": bool(offset_alert),
                        **review_window([m], [a]),
                    })
        return {**base, "status": "RESEARCH_ORIGINAL_WORD_REVIEW_QUEUE_HOLD",
                "sourceWavSha256": SOURCE_WAV_REFERENCE,
                "mfaAlignmentSha256": MFA_SOURCE_ALIGNMENT_SHA,
                "asrReceiptSha256": POSE_ASR_RECEIPT_SHA,
                "sourceWavIndependentlyRehashed": True,
                "frozenMfaWordCount": 73, "frozenAsrWordCount": 70,
                "matchedWordPairCount": matched_count,
                "lexicalDisagreementBlockCount": len(lexical_blocks),
                "lexicalDisagreements": lexical_blocks,
                "wordBoundaryResearchThresholdMs": threshold_ms,
                "onsetDisagreementOverThresholdCount": onset_flags,
                "offsetDisagreementOverThresholdCount": offset_flags,
                "distinctMatchedWordTimingReviewCount": len(timing_reviews),
                "timingReviews": timing_reviews,
                "reviewQueueCaseCount": len(lexical_blocks) + len(timing_reviews),
                "reviewPriorityRule": "6 lexical conflicts plus each matched word "
                                      "with MFA-v-ASR onset/end discrepancy >150ms",
                "caution": "Recognizer text and forced script labels are hypotheses. "
                           "Sample-pinned listening context and disagreement alone "
                           "never validate a word, phones, onset, offset or caption."}
    except (ValueError, TypeError, KeyError, IndexError, OSError,
            EOFError, wave.Error, UnicodeError):
        return fail("CROSS_MODEL_REVIEW_INPUT_PARSE_FAILED")


def bind_self_reported_listening_notes(source_report, notes_raw):
    """Bind previous OFFLINE player JSON to exact original-source audit cases.

    Important: JS-exported user choices prove neither the listener's identity
    nor the spoken phonemes. A successful join MUST remain research-only HOLD.
    """
    base = {"schema": SCHEMA, "mayPublish": False,
            "captionTimingApproved": False, "wordTimingCalibrated": False,
            "pronunciationVerified": False, "phonemeIdentityVerified": False,
            "independentHumanAnnotationVerified": False,
            "speakerIdentityVerified": False, "lexicalWinner": None}
    def reject(reason):
        return {**base, "status": "HOLD", "errors": [reason]}
    if (not isinstance(source_report, dict)
            or source_report.get("status") != "RESEARCH_ORIGINAL_WORD_REVIEW_QUEUE_HOLD"
            or source_report.get("sourceWavSha256") != SOURCE_WAV_REFERENCE
            or source_report.get("sourceWavIndependentlyRehashed") is not True
            or source_report.get("reviewQueueCaseCount") != 36
            or source_report.get("lexicalDisagreementBlockCount") != 6
            or source_report.get("distinctMatchedWordTimingReviewCount") != 30
            or source_report.get("mayPublish") is not False):
        return reject("LISTENING_NOTES_AUTHENTICATED_ORIGINAL_QUEUE_REQUIRED")
    if not isinstance(notes_raw, bytes) or not 0 < len(notes_raw) <= 50000:
        return reject("LISTENING_NOTES_JSON_BYTES_OR_SIZE_INVALID")
    try:
        # Deliberately refuse duplicate JSON keys, including nested approval
        # and decision fields; do not accept NaN/Infinity as JSON numbers.
        def unique_object(pairs):
            result = {}
            for key, value in pairs:
                if key in result:
                    raise ValueError("DUPLICATE_JSON_KEY")
                result[key] = value
            return result
        def no_constant(value):
            raise ValueError("NONFINITE_JSON_LITERAL")
        notes = json.loads(notes_raw, object_pairs_hook=unique_object,
                           parse_constant=no_constant)
        if (not isinstance(notes, dict)
                or set(notes) != {"schema", "originalWavSha256",
                                   "reviewerSelfReported",
                                   "phoneticGroundTruthIndependentlyValidated",
                                   "mayPublish", "reviewedAt", "decisions"}
                or notes.get("schema") != "ths-lane2-human-listening-notes-v1"
                or notes.get("originalWavSha256") != SOURCE_WAV_REFERENCE
                or notes.get("reviewerSelfReported") is not True
                or notes.get("phoneticGroundTruthIndependentlyValidated") is not False
                or notes.get("mayPublish") is not False
                or not isinstance(notes.get("reviewedAt"), str)
                or not re.fullmatch(
                    "[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:[.][0-9]{1,6})?Z",
                    notes["reviewedAt"])
                or not isinstance(notes.get("decisions"), list)
                or len(notes["decisions"]) != 36):
            return reject("LISTENING_NOTES_SCHEMA_SOURCE_OR_STATUS_INVALID")
        expected = {
            **{f"LEX-{i:02d}": row for i, row in
               enumerate(source_report["lexicalDisagreements"], 1)},
            **{f"TIME-{i:02d}": row for i, row in
               enumerate(source_report["timingReviews"], 1)},
        }
        if len(expected) != 36:
            return reject("LISTENING_NOTES_EXPECTED_SOURCE_CASES_INVALID")
        heard_options = {"unreviewed", "written_mfa", "asr", "neither", "unclear"}
        time_options = {"unreviewed", "mfa_closer", "asr_closer",
                        "both_bad", "unclear"}
        seen = set()
        decisions = []
        for row in notes["decisions"]:
            if not isinstance(row, dict) or set(row) != {
                    "id", "heard", "timing", "notes"}:
                return reject("LISTENING_NOTES_DECISION_SHAPE_INVALID")
            identity = row["id"]
            if (not isinstance(identity, str) or identity not in expected
                    or identity in seen):
                return reject("LISTENING_NOTES_UNKNOWN_OR_DUPLICATE_CASE")
            seen.add(identity)
            heard, timing, free_text = row["heard"], row["timing"], row["notes"]
            if (not isinstance(heard, str) or heard not in heard_options
                    or not isinstance(timing, str) or timing not in time_options
                    or not isinstance(free_text, str) or len(free_text) > 2000
                    or any(ord(ch) < 32 and ord(ch) not in (9, 10, 13)
                           for ch in free_text)):
                return reject("LISTENING_NOTES_DECISION_VALUE_INVALID")
            src = expected[identity]
            if (not isinstance(src["sourceStartSample"], int)
                    or not isinstance(src["sourceEndSample"], int)
                    or not 0 <= src["sourceStartSample"] <
                                src["sourceEndSample"] <= 824336
                    or not isinstance(src["sourcePcmSha256"], str)
                    or not re.fullmatch("[a-f0-9]{64}", src["sourcePcmSha256"])):
                return reject("LISTENING_NOTES_ORIGINAL_CASE_IDENTITY_INVALID")
            decisions.append({
                "caseId": identity,
                "originalSourcePcmSha256": src["sourcePcmSha256"],
                "originalStartSample": src["sourceStartSample"],
                "originalEndSample": src["sourceEndSample"],
                "selfReportedHeard": heard, "selfReportedTiming": timing,
                "selfReportedNotes": free_text,
                "hasAnySelfReportedInput": (heard != "unreviewed" or
                                            timing != "unreviewed" or
                                            bool(free_text.strip())),
            })
        if seen != set(expected):
            return reject("LISTENING_NOTES_MISSING_SOURCE_CASE")
        cases_with_input = sum(x["hasAnySelfReportedInput"] for x in decisions)
        return {**base, "status": "RESEARCH_SELF_REPORTED_LISTENING_HANDOFF_HOLD",
                "sourceWavSha256": SOURCE_WAV_REFERENCE,
                "untrustedNotesSha256": digest(notes_raw),
                "declaredReviewedAtUnverified": notes["reviewedAt"],
                "sourceCaseCount": len(expected),
                "selfReportedCaseCount": cases_with_input,
                "unreviewedCaseCount": len(expected) - cases_with_input,
                "selfReportValuesJoinedToPinnedSourceCases": True,
                "listenerIdentityNotAuthenticated": True,
                "caseNotes": sorted(decisions, key=lambda x: x["caseId"]),
                "caution": "Self-reported offline listening selections have "
                           "NOT been independently authenticated, evaluated "
                           "against phonetic gold, or approved for captions."}
    except (ValueError, TypeError, KeyError, UnicodeDecodeError):
        return reject("LISTENING_NOTES_JSON_OR_CASES_UNREADABLE")


def audit_cross_model_files(source_path, alignment_path, asr_path,
                            listening_notes_path=None):
    """Read-only original-source reviewer handoff, no caption approvals."""
    try:
        paths = ((Path(source_path), 3000000),
                 (Path(alignment_path), 100000), (Path(asr_path), 30000))
        if any(p.is_symlink() or not p.is_file()
               or not 0 < p.stat().st_size <= cap for p, cap in paths):
            return hold("CROSS_MODEL_REVIEW_FILES_MISSING_OR_UNSAFE")
        report = audit_original_cross_model_word_timing(
            *(p.read_bytes() for p, _ in paths))
        if listening_notes_path is None or report["status"] == "HOLD":
            return report
        notes_path = Path(listening_notes_path)
        if (notes_path.is_symlink() or not notes_path.is_file()
                or not 0 < notes_path.stat().st_size <= 50000):
            return hold("LISTENING_NOTES_FILE_MISSING_OR_UNSAFE")
        return bind_self_reported_listening_notes(report, notes_path.read_bytes())
    except (OSError, TypeError, ValueError):
        return hold("CROSS_MODEL_REVIEW_FILES_UNREADABLE")


def audit_pose_poles_conflict(source_raw, alignment_raw, asr_raw):
    """Pin real pose/poles source disagreement; never select a phonetic winner."""
    base = {"mayPublish": False, "pronunciationVerified": False,
            "phonemeIdentityVerified": False, "wordTimingCalibrated": False,
            "lexicalWinner": None}
    def fail(reason):
        return {**base, "status": "HOLD", "errors": [reason]}
    if not all(isinstance(x, bytes) for x in (source_raw, alignment_raw, asr_raw)):
        return fail("POSE_SOURCE_BYTES_REQUIRED")
    if digest(source_raw) != SOURCE_WAV_REFERENCE:
        return fail("POSE_ORIGINAL_WAV_CHANGED")
    if digest(alignment_raw) != MFA_SOURCE_ALIGNMENT_SHA:
        return fail("POSE_MFA_ALIGNMENT_CHANGED")
    if digest(asr_raw) != POSE_ASR_RECEIPT_SHA:
        return fail("POSE_ASR_RESEARCH_RECEIPT_CHANGED")
    try:
        alignment, asr = json.loads(alignment_raw), json.loads(asr_raw)
        if (asr.get("sourceWavSha256") != SOURCE_WAV_REFERENCE
                or asr.get("mayPublish") is not False
                or alignment.get("inputSha256", {}).get("wav") != SOURCE_WAV_REFERENCE
                or alignment.get("pronunciationVerified") is not False
                or alignment.get("mayPublish") is not False):
            return fail("POSE_SOURCE_OR_AUTHORITY_INCONSISTENT")
        forced, guessed = alignment["wordAlignment"][37], asr["recognizedWords"][35]
        if (forced["word"] != "pose"
                or guessed["word"].strip().casefold() != "poles"
                or [p["phone"] for p in forced["phones"]] != ["P", "OW1", "Z"]
                or abs(forced["startMs"] - 17870.001) > .01
                or abs(forced["endMs"] - 18340) > .01
                or abs(guessed["start"] - 17.8) > .001
                or abs(guessed["end"] - 18.34) > .001
                or abs(guessed["probability"] - .9489) > .00001):
            return fail("POSE_MFA_ASR_CANDIDATES_CHANGED")
        with wave.open(io.BytesIO(source_raw), "rb") as src:
            if (src.getnchannels(), src.getsampwidth(), src.getframerate(),
                    src.getcomptype()) != (1, 2, 24000, "NONE"):
                return fail("POSE_SOURCE_WAV_FORMAT_INVALID")
            pcm = src.readframes(src.getnframes())
        clip = pcm[round(forced["startMs"]*24)*2:round(forced["endMs"]*24)*2]
        buf = io.BytesIO()
        with wave.open(buf, "wb") as out:
            out.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            out.writeframes(clip)
        if len(clip) != 22560 or digest(buf.getvalue()) != POSE_SOURCE_CLIP_SHA:
            return fail("POSE_EXACT_SOURCE_PCM_CHANGED")
        return {**base, "schema": SCHEMA,
                "status": "RESEARCH_LEXICAL_DISAGREEMENT_REVIEW_HOLD",
                "sourceWavSha256": SOURCE_WAV_REFERENCE,
                "alignmentSha256": MFA_SOURCE_ALIGNMENT_SHA,
                "asrReceiptSha256": POSE_ASR_RECEIPT_SHA,
                "sourcePoseClipSha256": POSE_SOURCE_CLIP_SHA,
                "forcedAlignmentWordHypothesis": "pose",
                "asrWordHypothesis": "poles",
                "asrProbabilityNotPhoneticProof": guessed["probability"],
                "forcedPhoneLabelsNotObservedPhoneticTruth": ["P", "OW1", "Z"],
                "frozenSourceWindowMs": [forced["startMs"], forced["endMs"]],
                "originalSourceSamples": 11280,
                "caution": "Both spellings remain unverified: forced phones assume script, and ASR confidence is not ground truth."}
    except (ValueError, TypeError, IndexError, KeyError, EOFError, OSError, wave.Error):
        return fail("POSE_INPUT_PARSING_FAILED")



# Each example is the exact source-aligned candidate audio of the SAME narrator.
# Spelling/forced phone labels are NOT acoustically confirmed phoneme labels.
POSE_INTERNAL_CONTRAST_WINDOWS = {
    "disputed_pose_poles": (37, "pose",
        "43c010d2d0cc1a400e05423abebfb917562b2cd51ed70eb02b73b84f3493e149"),
    "neighboring_is": (38, "is",
        "57ea78582b1bfb51e5ed1485a638754e2b2223be9d81cf9549aa8a588d3990a6"),
    "authored_feel": (61, "feel",
        "1820255c4478b99277eb1961de9771af7f363a4acb30c6c0e2b811af969292d8"),
    "authored_detail": (68, "detail",
        "0031be9ccdf1b067cb8d4b2d3c3526871dd53cedf569dd0e08c67f978f473fab"),
    "authored_closer": (71, "closer",
        "1f2696dc9493a0bc8eb3257d50475c3aecbfd355bdb7a6ae5d281d6481ae927b"),
}


def spectral_band_trace(pcm):
    """Signal-only measured spectral balance. NEVER /l/, phones, word or verdict.

    Every 25-ms source-excerpt window on a 10-ms hop: track signed PCM16 RMS
    and 300-1200 Hz / 1800-3300 Hz spectral-energy ratio. Original samples
    must be SHA-pinned by the calling provenance guard. A dark lateral, vowel,
    compression or a model artifact can produce overlapping spectral profiles.
    """
    if (not isinstance(pcm, bytes) or not 4800 <= len(pcm) <= 240000
            or len(pcm) % 2):
        raise ValueError("SPECTRAL_SOURCE_PCM_INVALID")
    sig = np.frombuffer(pcm, dtype="<i2").astype(np.float64) / 32768.0
    windows = np.lib.stride_tricks.sliding_window_view(sig, 600)[::240].copy()
    if len(windows) < 5:
        raise ValueError("SPECTRAL_TOO_FEW_WINDOWS")
    windows -= windows.mean(axis=1, keepdims=True)
    rms = np.sqrt(np.mean(windows**2, axis=1))
    if rms.max() < .002:
        raise ValueError("SPECTRAL_ENERGY_TOO_LOW")
    spectrum = abs(np.fft.rfft(windows*np.hanning(600), axis=1))**2
    freq = np.fft.rfftfreq(600, 1/24000)
    low = spectrum[:, (freq >= 300) & (freq <= 1200)].sum(axis=1)
    high = spectrum[:, (freq >= 1800) & (freq <= 3300)].sum(axis=1)
    floor = (low + high)*1e-10 + 1e-20
    ratio = 10*np.log10((low + floor)/(high + floor))
    active = rms >= max(float(rms.max())*.25, .002)
    if int(active.sum()) < 5:
        raise ValueError("SPECTRAL_ACTIVE_FRAMES_TOO_FEW")
    return {
        "analysisType": "RESEARCH_SPECTRAL_ENERGY_ONLY_NOT_PHONEMES",
        "frameMs": 25, "hopMs": 10,
        "lowHz": [300, 1200], "highHz": [1800, 3300],
        "totalFrames": int(len(rms)), "activeFrames": int(active.sum()),
        "activeRatioDbMedian": round(float(np.median(ratio[active])), 3),
        "activeRatioDbP10": round(float(np.percentile(ratio[active], 10)), 3),
        "activeRatioDbP90": round(float(np.percentile(ratio[active], 90)), 3),
        "trace": [
            {"centerMs": round((i*240 + 300)/24, 1),
             "bandRatioDb": round(float(db), 2),
             "relativeRms": round(float(rms[i]/rms.max()), 3)}
            for i, db in enumerate(ratio)
        ],
        "phonemeIdentityVerified": False,
        "lateralPresenceClassified": False,
    }



def evaluate_blind_reference_pairs(rows, audio_by_id, excluded_source_hashes,
                                   target_original_wav=None):
    """Measure an UNATTESTED pose/poles reference benchmark, not pronunciation.

    No data supplied to this function can authenticate human labels, speakers,
    listening ground truth or target narration.  Honest perfect heldout scores
    therefore remain research reports. Never run a target lexical inference.
    """
    base = {
        "schema": SCHEMA, "mayPublish": False,
        "pronunciationVerified": False, "phonemeIdentityVerified": False,
        "wordTimingCalibrated": False, "lexicalWinner": None,
        "originalTargetInferred": False, "speakerIdentitiesAuthenticated": False,
        "referenceAnnotationsAuthenticated": False, "calibrationComplete": False,
        "originalMasterPcmContainmentScreened": False,
        "originalMasterSignTrajectoryScreened": False,
    }
    def refuse(reason, **extras):
        return {**base, "status": "HOLD", "errors": [reason], **extras}
    if (not isinstance(rows, list) or not isinstance(audio_by_id, dict)
            or not 32 <= len(rows) <= 256):
        return refuse("REFERENCE_PAIRED_BENCHMARK_INVENTORY_REQUIRED")
    if (not isinstance(excluded_source_hashes, (set, frozenset))
            or any(not isinstance(v, str) for v in excluded_source_hashes)):
        return refuse("REFERENCE_EXCLUDED_TARGET_SOURCES_REQUIRED")
    prohibited = set(excluded_source_hashes) | {
        SOURCE_WAV_REFERENCE, POSE_SOURCE_CLIP_SHA,
        *ORIGINAL_CLIP_HASHES.values(),
        *(sha for _, _, sha in POSE_INTERNAL_CONTRAST_WINDOWS.values()),
    }
    # WAV-container identity is insufficient: the same PCM can be repackaged
    # with different chunk metadata or trailing bytes and cross the split.
    seen_ids, seen_hashes, seen_pcm_hashes, seen_polarity_signatures = set(), set(), set(), set()
    seen_sign_trajectories = []
    target_pcm = None
    target_sign_trajectory = None
    if target_original_wav is not None:
        if (not isinstance(target_original_wav, bytes)
                or digest(target_original_wav) != SOURCE_WAV_REFERENCE):
            return refuse("REFERENCE_TARGET_ORIGINAL_WAV_HASH_INVALID")
        try:
            with wave.open(io.BytesIO(target_original_wav), "rb") as original:
                if ((original.getnchannels(), original.getsampwidth(),
                     original.getframerate(), original.getcomptype(),
                     original.getnframes()) != (1, 2, 24000, "NONE", 824336)):
                    return refuse("REFERENCE_TARGET_ORIGINAL_WAV_FORMAT_INVALID")
                target_pcm = original.readframes(original.getnframes())
            if len(target_pcm) != 824336 * 2:
                return refuse("REFERENCE_TARGET_ORIGINAL_WAV_TRUNCATED")
        except (OSError, ValueError, EOFError, wave.Error):
            return refuse("REFERENCE_TARGET_ORIGINAL_WAV_UNREADABLE")
        base["originalMasterPcmContainmentScreened"] = True
        # Conservative negative-only gain/polarity containment across the
        # ENTIRE authenticated original narrator: one signed symbol/sample.
        # A matching sign trajectory can also be an unrelated recording;
        # REVIEW HOLD is deliberately not a definitive duplicate verdict.
        target_sign_trajectory = np.sign(np.frombuffer(
            target_pcm, dtype="<i2")).astype(np.int8).tobytes()
        base["originalMasterSignTrajectoryScreened"] = True
    groups = {"train": {}, "test": {}}
    samples = []
    try:
        for row in rows:
            if not isinstance(row, dict):
                return refuse("REFERENCE_ROW_INVALID")
            identity, split, speaker, label, claimed_sha = (
                row["sampleId"], row["split"], row["speakerId"],
                row["word"], row["wavSha256"])
            if (not isinstance(identity, str) or not 1 <= len(identity) <= 64
                    or identity in seen_ids or split not in groups
                    or not isinstance(speaker, str) or not 1 <= len(speaker) <= 64
                    or label not in ("pose", "poles")
                    or not isinstance(claimed_sha, str) or len(claimed_sha) != 64
                    or claimed_sha in seen_hashes or claimed_sha in prohibited):
                return refuse("REFERENCE_SOURCE_ID_LABEL_OR_DUPLICATE_INVALID")
            raw = audio_by_id.get(identity)
            if not isinstance(raw, bytes) or digest(raw) != claimed_sha:
                return refuse("REFERENCE_EXACT_WAV_SHA_MISMATCH")
            if not 44 <= len(raw) <= 300000:
                return refuse("REFERENCE_WAV_SIZE_INVALID")
            with wave.open(io.BytesIO(raw), "rb") as audio:
                if (audio.getnchannels(), audio.getsampwidth(), audio.getframerate(),
                        audio.getcomptype()) != (1, 2, 24000, "NONE"):
                    return refuse("REFERENCE_AUDIO_FORMAT_INVALID")
                num = audio.getnframes()
                pcm = audio.readframes(num)
            if not 2400 <= num <= 120000 or len(pcm) != num*2:
                return refuse("REFERENCE_WAV_DURATION_OR_BYTES_INVALID")
            pcm_sha = digest(pcm)
            if pcm_sha in ORIGINAL_PCM_EXCERPT_SHA256:
                return refuse("REFERENCE_ORIGINAL_TARGET_PCM_REUSE")
            if pcm_sha in seen_pcm_hashes:
                return refuse("REFERENCE_PCM_DUPLICATE_DESPITE_DIFFERENT_WAV_SHA")
            # Different PCM hashes can still contain the SAME recorded waveform
            # after gain/polarity changes. Reject exact same-length sample-sign
            # trajectories as conservative leakage screening; this is not voice
            # identity, speaker authentication or general near-duplicate detection.
            signed_pcm = np.frombuffer(pcm, dtype="<i2")
            polarity_identity = (num, min(
                digest(np.packbits(signed_pcm > 0).tobytes()),
                digest(np.packbits(signed_pcm < 0).tobytes()),
            ))
            if polarity_identity in seen_polarity_signatures:
                return refuse("REFERENCE_GAIN_OR_POLARITY_REUSED_ACROSS_RECORDINGS")
            # Different-duration clips can contain the *same* source speech
            # after a crop. Whole-file/PCM SHA and same-length fingerprints
            # do not protect the held-out split from that leakage.
            # Exact sample-sign containment (both polarities) is a conservative
            # REVIEW HOLD, not proof of speaker or word identity.
            signed_trace = np.sign(signed_pcm).astype(np.int8).tobytes()
            inverted_trace = (-np.sign(signed_pcm)).astype(np.int8).tobytes()
            if any(
                (other.find(signed_trace) != -1
                 or signed_trace.find(other) != -1
                 or other.find(inverted_trace) != -1
                 or inverted_trace.find(other) != -1)
                for other in seen_sign_trajectories
            ):
                return refuse("REFERENCE_CROPPED_OR_POLARITY_REUSED_ACROSS_RECORDINGS")
            if target_pcm is not None and target_pcm.find(pcm) != -1:
                return refuse("REFERENCE_EXCERPT_REUSED_FROM_ORIGINAL_MASTER")
            if target_sign_trajectory is not None:
                symbols = np.sign(signed_pcm).astype(np.int8)
                if (target_sign_trajectory.find(symbols.tobytes()) != -1
                        or target_sign_trajectory.find((-symbols).tobytes()) != -1):
                    return refuse("REFERENCE_GAIN_OR_POLARITY_EXCERPT_FROM_ORIGINAL_MASTER")
            spectral = spectral_band_trace(pcm)
            observed = groups[split].setdefault(speaker, set())
            observed.add(label)
            samples.append((split, label, spectral["activeRatioDbMedian"]))
            seen_ids.add(identity)
            seen_hashes.add(claimed_sha)
            seen_pcm_hashes.add(pcm_sha)
            seen_polarity_signatures.add(polarity_identity)
            seen_sign_trajectories.append(signed_trace)
    except (KeyError, TypeError, ValueError, OSError, wave.Error, EOFError) as exc:
        return refuse("REFERENCE_WAV_OR_SCHEMA_PARSE_FAILED:" + str(exc)[:80])
    if set(audio_by_id) != seen_ids:
        return refuse("REFERENCE_UNDECLARED_WAV_INVENTORY")
    train_speakers, heldout_speakers = set(groups["train"]), set(groups["test"])
    if (len(train_speakers) < 8 or len(heldout_speakers) < 8
            or train_speakers.intersection(heldout_speakers)
            or any(labels != {"pose", "poles"} for split in groups.values()
                   for labels in split.values())):
        return refuse("REFERENCE_BALANCED_DISJOINT_SPEAKER_PAIRS_REQUIRED")
    train = [(word, val) for split, word, val in samples if split == "train"]
    heldout = [(word, val) for split, word, val in samples if split == "test"]
    candidate_values = sorted({value for _, value in train})
    if len(candidate_values) < 2:
        return refuse("REFERENCE_TRAINING_FEATURES_INDISTINGUISHABLE")

    def recall(data, threshold, pose_high):
        count = {"pose": 0, "poles": 0}
        correct = {"pose": 0, "poles": 0}
        for actual, feature in data:
            inferred = "pose" if (feature > threshold) == pose_high else "poles"
            count[actual] += 1
            correct[actual] += int(inferred == actual)
        return [correct[word]/count[word] if count[word] else 0.0
                for word in ("pose", "poles")]

    candidates = []
    for a, b in zip(candidate_values, candidate_values[1:]):
        threshold = (a+b)/2
        for direction in (True, False):
            metrics = recall(train, threshold, direction)
            candidates.append((sum(metrics)/2, -abs(threshold),
                               direction, threshold, metrics))
    selected = max(candidates, key=lambda v: (v[0], v[1], v[2]))
    test_recall = recall(heldout, selected[3], selected[2])
    metrics = {
        "benchmarkMethod": "UNATTESTED_SAME_CONTRAST_BAND_RATIO_TRAIN_TEST",
        "declaredTrainSpeakerCount": len(train_speakers),
        "declaredHeldoutSpeakerCount": len(heldout_speakers),
        "trainingExampleCount": len(train),
        "heldoutExampleCount": len(heldout),
        "candidateThresholdDb": round(selected[3], 3),
        "poseHasHigherBandRatio": selected[2],
        "trainPerClassRecall": dict(zip(("pose", "poles"),
                                        [round(v, 4) for v in selected[4]])),
        "heldoutPerClassRecall": dict(zip(("pose", "poles"),
                                          [round(v, 4) for v in test_recall])),
        "heldoutBalancedAccuracy": round(sum(test_recall)/2, 4),
        "heldoutPhonemeGroundTruthVerified": False,
        "declaredSpeakerSplitVerifiedByRecordingIdentity": False,
        "originalNarrationJudged": False,
        "phonemeConfidenceCalibrated": False,
    }
    if min(*selected[4], *test_recall) < .90:
        return refuse("REFERENCE_HELDOUT_CLASS_RECALL_BELOW_90_PERCENT", **metrics)
    return {**base, **metrics,
            "status": "RESEARCH_UNATTESTED_REFERENCE_BENCHMARK_ONLY",
            "caution": "Self-declared labels and speaker IDs are NOT independent "
                       "ground truth. Even a perfect heldout result does not "
                       "approve the original voice or its /l/ pronunciation."}



def audit_reference_archive(archive_file, target_original_wav_path=None):
    """Research-only case ZIP, optionally screened against the pinned full target WAV."""
    def fail(reason):
        return {**hold(reason), "calibrationComplete": False,
                "referenceAnnotationsAuthenticated": False,
                "speakerIdentitiesAuthenticated": False,
                "lexicalWinner": None}
    try:
        path = Path(archive_file)
        if (path.is_symlink() or not path.is_file()
                or not 0 < path.stat().st_size <= 40000000):
            return fail("REFERENCE_BENCHMARK_ZIP_UNAVAILABLE_OR_UNSAFE")
        target_raw = None
        if target_original_wav_path is not None:
            target_path = Path(target_original_wav_path)
            if (target_path.is_symlink() or not target_path.is_file()
                    or not 0 < target_path.stat().st_size <= 3000000):
                return fail("REFERENCE_TARGET_ORIGINAL_WAV_UNSAFE_OR_MISSING")
            target_raw = target_path.read_bytes()
        with zipfile.ZipFile(path, "r") as archive:
            infos = archive.infolist()
            names = [part.filename for part in infos]
            if (not 33 <= len(infos) <= 257
                    or len(set(names)) != len(names)
                    or any(part.is_dir() or part.file_size > 300000
                           or part.filename.startswith("/")
                           or ".." in Path(part.filename).parts
                           for part in infos)
                    or sum(part.file_size for part in infos) > 32000000
                    or "manifest.json" not in names):
                return fail("REFERENCE_ZIP_INVENTORY_OR_FILE_SIZE_UNSAFE")
            if archive.getinfo("manifest.json").file_size > 100000:
                return fail("REFERENCE_ZIP_MANIFEST_OVERSIZE")
            manifest = json.loads(archive.read("manifest.json"))
            if (not isinstance(manifest, dict)
                    or manifest.get("schema") != "ths-lane2-blind-contrast-benchmark-v1"
                    or manifest.get("mayPublish") is not False
                    or not isinstance(manifest.get("cases"), list)):
                return fail("REFERENCE_BENCHMARK_SCHEMA_OR_RELEASE_INVALID")
            rows = manifest["cases"]
            sample_names = []
            for case in rows:
                if not isinstance(case, dict):
                    return fail("REFERENCE_BENCHMARK_CASE_SCHEMA_INVALID")
                identity = case.get("sampleId")
                if (not isinstance(identity, str) or not 1 <= len(identity) <= 64
                        or not identity.isascii()
                        or not all(x.isalnum() or x in "_-" for x in identity)):
                    return fail("REFERENCE_CASE_FILENAME_INVALID")
                sample_names.append(f"clips/{identity}.wav")
            if set(names) != (set(sample_names) | {"manifest.json"}):
                return fail("REFERENCE_ZIP_UNDECLARED_OR_MISSING_CLIPS")
            samples = {case["sampleId"]: archive.read(name)
                       for case, name in zip(rows, sample_names)}
        return evaluate_blind_reference_pairs(rows, samples, set(), target_raw)
    except (OSError, ValueError, TypeError, KeyError, EOFError,
            zipfile.BadZipFile, UnicodeError) as exc:
        return fail("REFERENCE_BENCHMARK_ZIP_READ_FAILED:" + str(exc)[:80])


def audit_pose_internal_reference_set(source_raw, alignment_raw, asr_raw):
    """Exact source-linked auditory comparators; no inferred /l/ classification."""
    prior = audit_pose_poles_conflict(source_raw, alignment_raw, asr_raw)
    if prior["status"] != "RESEARCH_LEXICAL_DISAGREEMENT_REVIEW_HOLD":
        return prior
    try:
        alignment = json.loads(alignment_raw)
        words = alignment["wordAlignment"]
        with wave.open(io.BytesIO(source_raw), "rb") as source:
            full_pcm = source.readframes(source.getnframes())
        reviews = []
        for role, (index, authored_word, expected_digest) in POSE_INTERNAL_CONTRAST_WINDOWS.items():
            row = words[index]
            if row["word"] != authored_word:
                return hold("POSE_INTERNAL_AUTHORED_EXAMPLE_CHANGED")
            start_ms, end_ms = row["startMs"], row["endMs"]
            if (not all(isinstance(v, (int, float)) and not isinstance(v, bool)
                        and np.isfinite(v) for v in (start_ms, end_ms))
                    or not 0 <= start_ms < end_ms <= 34348):
                return hold("POSE_INTERNAL_REFERENCE_BOUNDS_INVALID")
            a, b = round(start_ms*24), round(end_ms*24)
            if b > len(full_pcm)//2:
                return hold("POSE_INTERNAL_REFERENCE_OUTSIDE_MASTER")
            segment = full_pcm[a*2:b*2]
            stream = io.BytesIO()
            with wave.open(stream, "wb") as out:
                out.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
                out.writeframes(segment)
            if digest(stream.getvalue()) != expected_digest:
                return hold("POSE_INTERNAL_REFERENCE_EXACT_PCM_CHANGED")
            reviews.append({
                "role": role, "mfaAuthoredWordOnly": authored_word,
                "mfaWordIndex": index,
                "sourceStartSample": a, "sourceEndSample": b,
                "clipWavSha256": expected_digest,
                "signalOnlySpectralTrace": spectral_band_trace(segment),
                "physicalSameNarrationSourceVerified": True,
                "authoredLabelIsCalibratedPhoneticTruth": False,
            })
        return {
            **prior,
            "status": "RESEARCH_POSE_INTERNAL_CONTRAST_REVIEW_ONLY",
            "sameNarratorSourceBoundControls": reviews,
            "comparisonCount": len(reviews),
            "speakerMatchedRecordingVerified": True,
            "phonemeReferenceCalibrated": False,
            "lateralPresenceClassified": False,
            "lexicalWinner": None,
            "mayPublish": False,
            "pronunciationVerified": False,
            "phonemeIdentityVerified": False,
            "wordTimingCalibrated": False,
            "caution": "Same-original-WAV comparison words are authored-text hypotheses; "
                       "the data do not verify an /l/ or calibrate phones.",
        }
    except (KeyError, IndexError, TypeError, ValueError, OSError, wave.Error):
        return hold("POSE_INTERNAL_REFERENCE_EXTRACTION_FAILED")


def audit_pose_files(source_path, alignment_path, asr_path, include_internal_controls=False):
    try:
        files = [(Path(source_path), 3000000), (Path(alignment_path), 100000),
                 (Path(asr_path), 20000)]
        if any(p.is_symlink() or not p.is_file() or not 0 < p.stat().st_size <= cap
               for p, cap in files):
            return hold("POSE_FILES_MISSING_OR_UNSAFE")
        source_input = [p.read_bytes() for p, _ in files]
        if include_internal_controls:
            return audit_pose_internal_reference_set(*source_input)
        return audit_pose_poles_conflict(*source_input)
    except (OSError, TypeError, ValueError):
        return hold("POSE_FILES_UNREADABLE")


def audit_original_source(original_wav, mfa_receipt, mfa_alignment):
    """Re-extract four SHA-pinned research excerpts from full first-party WAV.

    This is physical sample identity and within-narration similarity only.
    MFA boundaries are source-pinned but not acoustically calibrated.
    No private prior review ZIP is required in this mode.
    """
    try:
        paths = [(Path(original_wav), 3000000), (Path(mfa_receipt), 20000),
                 (Path(mfa_alignment), 100000)]
        raw_files = []
        for path, limit in paths:
            if (not path.is_file() or path.is_symlink()
                    or not 0 < path.stat().st_size <= limit):
                return hold("ORIGINAL_SOURCE_INPUT_UNAVAILABLE_OR_UNSAFE")
            raw_files.append(path.read_bytes())
        source_raw, receipt_raw, alignment_raw = raw_files
        if digest(source_raw) != SOURCE_WAV_REFERENCE:
            return hold("ORIGINAL_MASTER_WAV_SHA_CHANGED")
        if digest(receipt_raw) != MFA_SOURCE_RECEIPT_SHA:
            return hold("ORIGINAL_MFA_RECEIPT_SHA_CHANGED")
        if digest(alignment_raw) != MFA_SOURCE_ALIGNMENT_SHA:
            return hold("ORIGINAL_MFA_ALIGNMENT_SHA_CHANGED")
        receipt = json.loads(receipt_raw)
        candidate = json.loads(alignment_raw)
        if (receipt.get("originalWavSha256") != SOURCE_WAV_REFERENCE
                or receipt.get("alignmentCandidateSha256") != MFA_SOURCE_ALIGNMENT_SHA
                or receipt.get("alignedWordCount") != 73
                or receipt.get("phoneticPronunciationVerified") is not False
                or receipt.get("timingAccuracyCalibrated") is not False
                or receipt.get("mayPublish") is not False
                or candidate.get("inputSha256", {}).get("wav") != SOURCE_WAV_REFERENCE
                or candidate.get("sampleRate") != 24000
                or candidate.get("sampleCount") != 824336
                or candidate.get("pronunciationVerified") is not False
                or candidate.get("timingAccuracyCalibrated") is not False
                or candidate.get("mayPublish") is not False):
            return hold("ORIGINAL_MFA_SOURCE_OR_AUTHORITY_INCONSISTENT")
        windows = receipt.get("termReviewWindows")
        words = candidate.get("wordAlignment")
        if not isinstance(windows, list) or len(windows) != 5 or not isinstance(words, list) or len(words) != 73:
            return hold("ORIGINAL_MFA_WINDOW_INVENTORY_INCONSISTENT")
        with wave.open(io.BytesIO(source_raw), "rb") as source:
            if (source.getnchannels(), source.getsampwidth(), source.getframerate(),
                    source.getcomptype(), source.getnframes()) != (1, 2, 24000, "NONE", 824336):
                return hold("ORIGINAL_MASTER_FORMAT_OR_FRAME_COUNT_CHANGED")
            full_pcm = source.readframes(source.getnframes())
        if len(full_pcm) != 824336 * 2:
            return hold("ORIGINAL_MASTER_PCM_TRUNCATED")
        clips, offsets = {}, {}
        for clip_id, (expected_term, expected_indices) in ORIGINAL_MFA_WINDOWS.items():
            # Original MFA receipt has five windows: 7-OH, hydroxyl,
            # mitragynine, mitragynine, 7-hydroxymitragynine.
            lookup = {1: 0, 2: 2, 3: 4, 4: 3}[clip_id]
            window = windows[lookup]
            if (window.get("term") != expected_term
                    or window.get("wordIndices") != list(expected_indices)
                    or window.get("pronunciationVerified") is not False):
                return hold("ORIGINAL_MFA_TERM_WINDOW_CHANGED")
            rows = [words[i] for i in expected_indices]
            start_ms = rows[0]["startMs"]
            end_ms = rows[-1]["endMs"]
            if (window.get("startMs") != start_ms
                    or window.get("endMs") != end_ms
                    or not isinstance(start_ms, (int, float))
                    or not isinstance(end_ms, (int, float))
                    or not 0 <= start_ms < end_ms <= 34348):
                return hold("ORIGINAL_MFA_WINDOW_BOUNDS_CHANGED")
            start_sample, end_sample = round(start_ms * 24), round(end_ms * 24)
            audio = full_pcm[start_sample * 2:end_sample * 2]
            excerpt = io.BytesIO()
            with wave.open(excerpt, "wb") as out:
                out.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
                out.writeframes(audio)
            clip_raw = excerpt.getvalue()
            if digest(clip_raw) != ORIGINAL_CLIP_HASHES[clip_id]:
                return hold("ORIGINAL_MFA_EXCERPT_PCM_HASH_CHANGED")
            clips[clip_id] = decode_pcm(clip_raw)
            offsets[clip_id] = start_sample
        measured = compare(clips[2], clips[4], [clips[1], clips[3]])
        if not measured["repeatPatternConsistent"]:
            return {**hold("ORIGINAL_WAV_REPEATED_TERM_NEGATIVE_CONTROL_FAILED"), **measured}
        return {"schema": SCHEMA, "status": "RESEARCH_REPEATED_TERM_PATTERN_ONLY",
                "sourceMode": "PINNED_ORIGINAL_WAV_MFA_EXCERPTS",
                "originalWavSha256": SOURCE_WAV_REFERENCE,
                "sourceMfaReceiptSha256": MFA_SOURCE_RECEIPT_SHA,
                "sourceMfaAlignmentSha256": MFA_SOURCE_ALIGNMENT_SHA,
                "originalClipHashes": ORIGINAL_CLIP_HASHES,
                "sourceClipSampleOffsetsInOriginalWav": offsets,
                **measured, "sourceWavIndependentlyRehashed": True,
                "mayPublish": False, "pronunciationVerified": False,
                "phonemeIdentityVerified": False, "wordTimingCalibrated": False,
                "caution": "This validates source clips and within-voice acoustic patterns; "
                           "both repeated terms may still be incorrectly pronounced."}
    except (ValueError, TypeError, IndexError, KeyError, OSError,
            EOFError, UnicodeError, wave.Error, json.JSONDecodeError) as exc:
        return hold("ORIGINAL_SOURCE_AUDIT_ERROR:" + str(exc)[:120])


def audit(packet, original_wav=None):
    try:
        packet=Path(packet)
        if not packet.is_file() or packet.is_symlink() or packet.stat().st_size > 1000000:
            return hold("SOURCE_ARCHIVE_UNAVAILABLE_OR_UNSAFE")
        if digest(packet.read_bytes()) != SOURCE_ARCHIVE_SHA:
            return hold("SOURCE_ARCHIVE_HASH_CHANGED")
        with zipfile.ZipFile(packet) as archive:
            if len(archive.infolist()) > 30 or any(
                member.file_size > 500000 or member.filename.startswith("/")
                or ".." in Path(member.filename).parts for member in archive.infolist()
            ):
                return hold("SOURCE_ARCHIVE_MEMBERS_UNSAFE")
            report=json.loads(archive.read("review/disagreement_review.json"))
            if (report.get("sourceWavReferenceSha256") != SOURCE_WAV_REFERENCE
                    or report.get("totalMismatchBlocks") != 6
                    or report.get("mayPublish") is not False):
                return hold("ORIGINAL_DISAGREEMENT_RECEIPT_REQUIRED")
            clips={}
            raw_clips={}
            for index,pinned in ORIGINAL_CLIP_HASHES.items():
                raw=archive.read(f"review/clips/review-{index:02}.wav")
                row=report["dispositions"][index-1]
                if (digest(raw)!=pinned or row.get("reviewClipSha256")!=pinned
                        or row.get("sourceClipKind")!="IMMUTABLE_ORIGINAL_PCM16_TERM_CLIP"
                        or row.get("mayPublish") is not False
                        or row.get("pronunciationVerified") is not False):
                    return hold("ORIGINAL_CLIP_SOURCE_OR_AUTHORITY_CHANGED")
                clips[index]=decode_pcm(raw)
                raw_clips[index]=raw
            if (report["dispositions"][1]["authoredWords"] != ["mitragynine"]
                or report["dispositions"][3]["authoredWords"] != ["mitragynine"]):
                return hold("REPEATED_TERM_SOURCE_LABEL_CHANGED")
            result=compare(clips[2],clips[4],[clips[1],clips[3]])
            source_offsets = None
            if original_wav is not None:
                original = Path(original_wav)
                if (not original.is_file() or original.is_symlink()
                        or original.stat().st_size > 3000000):
                    return hold("ORIGINAL_MASTER_WAV_UNAVAILABLE_OR_UNSAFE")
                source_offsets = source_clip_sample_offsets(
                    original.read_bytes(), raw_clips, SOURCE_WAV_REFERENCE)
    except (ValueError, TypeError, IndexError, KeyError, OSError,
            EOFError, UnicodeError, zipfile.BadZipFile, wave.Error) as exc:
        return hold("ORIGINAL_RESEARCH_READ_OR_MEASURE_ERROR:"+str(exc)[:120])
    if not result["repeatPatternConsistent"]:
        return {**hold("SOURCE_REPEAT_PATTERN_CONTROL_REJECTED"),**result}
    return {"schema":SCHEMA,
            "status":"RESEARCH_REPEATED_TERM_PATTERN_ONLY",
            "sourceArchiveSha256":SOURCE_ARCHIVE_SHA,
            "originalWavShaReferencedButNotRehashed":(
                SOURCE_WAV_REFERENCE if source_offsets is None else None),
            "originalWavShaIndependentlyVerified":(
                SOURCE_WAV_REFERENCE if source_offsets is not None else None),
            "sourceClipSampleOffsetsInOriginalWav":source_offsets,
            "originalClips":[ORIGINAL_CLIP_HASHES[2],ORIGINAL_CLIP_HASHES[4]],
            "originalNegativeControls":[ORIGINAL_CLIP_HASHES[1],ORIGINAL_CLIP_HASHES[3]],
            "method":"25ms_10ms_hop_32_log_bands_13_DCT_cosine_DTW",
            **result,
            "mayPublish":False,"pronunciationVerified":False,
            "phonemeIdentityVerified":False,"wordTimingCalibrated":False,
            "sourceWavIndependentlyRehashed":source_offsets is not None,
            "caution":"Both occurrences can sound alike and BOTH still be mispronounced; not phone or release approval."}


def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--source-archive", help="Pinned earlier review ZIP (optional legacy mode)")
    p.add_argument("--original-wav", help="Pinned original full 24 kHz source WAV")
    p.add_argument("--mfa-receipt", help="Pinned first-party original MFA run receipt")
    p.add_argument("--mfa-alignment", help="Pinned original MFA word alignment candidate")
    p.add_argument("--cross-model-timing-review", action="store_true",
                   help="Original WAV + 73 MFA / 70 ASR candidate word review queue, never approval")
    p.add_argument("--human-review-json",
                   help="Self-reported offline original-voice listening choices (research HOLD only)")
    p.add_argument("--mfa-zero-interval-audit", action="store_true",
                   help="Screen all 73 frozen original MFA word windows for whole digital zeros")
    p.add_argument("--asr-zero-onset-audit", action="store_true",
                   help="Negative-only: detect original ASR starts inside digital zeros")
    p.add_argument("--pose-asr-receipt", help="Research-only frozen original ASR receipt, pose/poles contrast")
    p.add_argument("--reference-benchmark-zip",
                   help="Optional external source-WAV reference minimal-pair ZIP (research ONLY)")
    p.add_argument("--reference-target-wav",
                   help="Screen every benchmark PCM clip against the exact original full narrator WAV")
    p.add_argument("--pose-internal-contrasts", action="store_true",
                   help="Produce source-pinned same-narrator comparisons; NEVER a phoneme verdict")
    a=p.parse_args(argv)
    if a.cross_model_timing_review:
        if (not a.original_wav or not a.mfa_alignment or not a.pose_asr_receipt
                or any((a.mfa_zero_interval_audit, a.asr_zero_onset_audit,
                        a.mfa_receipt, a.source_archive, a.reference_target_wav,
                        a.reference_benchmark_zip, a.pose_internal_contrasts))):
            result = hold("CROSS_MODEL_REVIEW_REQUIRES_EXACT_THREE_SOURCE_INPUTS")
        else:
            result = audit_cross_model_files(
                a.original_wav, a.mfa_alignment, a.pose_asr_receipt,
                listening_notes_path=a.human_review_json)
    elif a.human_review_json is not None:
        result = hold("LISTENING_NOTES_REQUIRES_EXCLUSIVE_CROSS_MODEL_SOURCE_MODE")
    elif a.mfa_zero_interval_audit:
        if (not a.original_wav or not a.mfa_alignment
                or any((a.cross_model_timing_review, a.asr_zero_onset_audit,
                        a.pose_asr_receipt,
                        a.mfa_receipt, a.source_archive, a.reference_target_wav,
                        a.reference_benchmark_zip, a.pose_internal_contrasts))):
            result = hold("MFA_SIGNAL_MODE_REQUIRES_EXACT_WAV_AND_ALIGNMENT_ONLY")
        else:
            result = audit_mfa_signal_files(a.original_wav, a.mfa_alignment)
    elif a.asr_zero_onset_audit:
        if (not a.original_wav or not a.pose_asr_receipt
                or any((a.mfa_zero_interval_audit, a.mfa_alignment,
                        a.mfa_receipt, a.source_archive,
                        a.reference_target_wav, a.reference_benchmark_zip,
                        a.pose_internal_contrasts))):
            result=hold("DIGITAL_ZERO_MODE_REQUIRES_EXACT_WAV_AND_ASR_ONLY")
        else:
            result=audit_asr_zero_onsets_files(a.original_wav, a.pose_asr_receipt)
    elif a.reference_benchmark_zip is not None:
        if any((a.original_wav, a.mfa_receipt, a.mfa_alignment,
                a.pose_asr_receipt, a.source_archive, a.pose_internal_contrasts)):
            result=hold("REFERENCE_BENCHMARK_MUST_RUN_IN_EXCLUSIVE_NON_TARGET_MODE")
        else:
            result=audit_reference_archive(a.reference_benchmark_zip,
                                           a.reference_target_wav)
    elif a.reference_target_wav is not None:
        result=hold("REFERENCE_TARGET_WAV_REQUIRES_REFERENCE_BENCHMARK_ZIP")
    elif a.pose_internal_contrasts and a.pose_asr_receipt is None:
        result=hold("POSE_INTERNAL_CONTRAST_REQUIRES_ASR_SOURCE")
    elif a.pose_asr_receipt is not None:
        if not (a.original_wav and a.mfa_alignment) or a.mfa_receipt or a.source_archive:
            result=hold("POSE_MODE_REQUIRES_EXACTLY_SOURCE_ALIGNMENT_ASR")
        else:
            result=audit_pose_files(a.original_wav, a.mfa_alignment, a.pose_asr_receipt,
                                    include_internal_controls=a.pose_internal_contrasts)
    elif a.mfa_receipt is not None or a.mfa_alignment is not None:
        if not (a.original_wav and a.mfa_receipt and a.mfa_alignment) or a.source_archive:
            result=hold("ORIGINAL_MFA_MODE_REQUIRES_EXACTLY_THREE_SOURCE_INPUTS")
        else:
            result=audit_original_source(a.original_wav, a.mfa_receipt, a.mfa_alignment)
    elif a.source_archive:
        result=audit(Path(a.source_archive), a.original_wav)
    else:
        result=hold("SOURCE_ARCHIVE_OR_ORIGINAL_WAV_MFA_INPUTS_REQUIRED")
    print(json.dumps(result, indent=2, sort_keys=True, allow_nan=False))
    return 3 if result["status"].startswith("RESEARCH_") else 2


if __name__=="__main__":
    raise SystemExit(main())
