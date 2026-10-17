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
import zlib

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






def audit_research_gain_only_envelope(source_pcm, candidate_pcm, proposed_gain,
                                      silence_intervals=()):
    """Fail closed before an audio encode; sample envelope only, not loudness.

    Never grants audio craft, phoneme, decoded-film, real true-peak or release
    approval. Source/candidate PCM provenance must be checked by the caller.
    """
    base = {"schema": SCHEMA, "mayPublish": False,
            "productionAudioApproved": False, "wordTimingCalibrated": False,
            "phonemeIdentityVerified": False, "filmEncodedAndDecoded": False,
            "ebuTruePeakMeasured": False, "integratedLoudnessMeasured": False,
            "sourceHashesVerifiedByThisHelper": False}
    def reject(why):
        return {**base, "status": "HOLD", "errors": [why]}
    try:
        a = np.asarray(source_pcm, dtype=np.float64)
        b = np.asarray(candidate_pcm, dtype=np.float64)
    except (ValueError, TypeError, OverflowError):
        return reject("GAIN_ENVELOPE_PCM_INVALID")
    if (a.ndim != 1 or b.ndim != 1 or a.shape != b.shape
            or len(a) < 2400 or len(a) > 24000*600
            or not np.isfinite(a).all() or not np.isfinite(b).all()
            or np.max(np.abs(a)) > 1 or np.max(np.abs(b)) > 1
            or np.max(np.abs(a)) <= 0.001 or np.max(np.abs(b)) <= 0.001):
        return reject("GAIN_ENVELOPE_PCM_INVALID")
    try:
        g = float(proposed_gain)
    except (TypeError, ValueError, OverflowError):
        return reject("GAIN_ENVELOPE_GAIN_INVALID")
    if not np.isfinite(g) or not 0 < g <= 16:
        return reject("GAIN_ENVELOPE_GAIN_INVALID")
    if not isinstance(silence_intervals, (tuple, list)):
        return reject("GAIN_ENVELOPE_SILENCE_INTERVAL_INVALID")
    for item in silence_intervals:
        if (not isinstance(item, (tuple, list)) or len(item) != 2
                or any(isinstance(i, bool) or not isinstance(i, (int, np.integer)) for i in item)):
            return reject("GAIN_ENVELOPE_SILENCE_INTERVAL_INVALID")
        lo, hi = item
        if not 0 <= lo < hi <= len(a):
            return reject("GAIN_ENVELOPE_SILENCE_INTERVAL_INVALID")
        if np.any(a[lo:hi] != 0) or np.any(b[lo:hi] != 0):
            return reject("GAIN_ENVELOPE_SOURCE_SILENCE_CHANGED")
    max_absolute_input = float(np.max(np.abs(b)))
    projected_peak = max_absolute_input*g
    projected_over_count = int(np.count_nonzero(np.abs(b)*g >= 1.0))
    peak_dbfs = float(20*np.log10(max(projected_peak, 1e-15)))
    target_sample_peak = float(10**(-3.0/20))
    sample_guard = projected_peak <= target_sample_peak
    return {**base,
        "status": "RESEARCH_SAMPLE_HEADROOM_ONLY_HOLD" if sample_guard else "HOLD",
        "errors": [] if sample_guard else ["GAIN_ENVELOPE_PREENCODE_HEADROOM_UNSAFE"],
        "previewSamplePeakFullScale": round(max_absolute_input, 8),
        "proposedLinearGain": round(g, 7),
        "projectedPreEncodeSamplePeakDbfs": round(peak_dbfs, 5),
        "projectedPreEncodeSamplesAtOrAboveFullScale": projected_over_count,
        "fixedSamplePeakHeadroomTargetDbfs": -3.0,
        "maximumSampleSafeLinearGain": round(target_sample_peak/max_absolute_input, 7),
        "sampleOnlyHeadroomScreenPass": bool(sample_guard),
        "encodedTruePeakAndPerceptualQualityStillUnknown": True,
        "caution": "Sample headroom never replaces true peak after actual AAC encode, "
                   "integrated loudness, PCM/audio source pins, decoded-film sync, "
                   "phoneme calibration or listening-quality checks."}


def audit_research_dynamic_gain_slew(source_pcm, preencode_pcm,
                                    silence_intervals=()):
    """Physical PCM 10ms gain-motion screen; NEVER a perceptual/release approval.

    Source and candidate *file hashes*, encoded AAC EBU true peak, LUFS,
    speech phonemes, source-to-film binding and real listening need separate
    verification. Threshold is a conservative research heuristic only.
    """
    base = {"schema": SCHEMA, "mayPublish": False,
            "productionAudioApproved": False,
            "phonemeIdentityVerified": False, "wordTimingCalibrated": False,
            "originalSourceShaVerifiedByThisHelper": False,
            "decodedAACTruePeakVerifiedByThisHelper": False,
            "perceptualPumpingOrVoiceQualityProven": False}
    def refuse(reason):
        return {**base, "status": "HOLD", "errors": [reason]}
    try:
        source = np.asarray(source_pcm, dtype=np.float64)
        candidate = np.asarray(preencode_pcm, dtype=np.float64)
    except (ValueError, TypeError, OverflowError):
        return refuse("DYNAMIC_PCM_INVALID")
    if (source.ndim != 1 or candidate.ndim != 1
            or source.shape != candidate.shape
            or not 2400 <= len(source) <= 24000*600
            or not np.isfinite(source).all()
            or not np.isfinite(candidate).all()
            or np.max(np.abs(source)) > 1.0
            or np.max(np.abs(candidate)) > 1.0
            or np.max(np.abs(source)) < .01):
        return refuse("DYNAMIC_PCM_INVALID")
    if not isinstance(silence_intervals, (tuple, list)):
        return refuse("DYNAMIC_ZERO_SPANS_INVALID")
    for item in silence_intervals:
        if (not isinstance(item, (list, tuple)) or len(item) != 2
                or any(isinstance(i, bool)
                       or not isinstance(i, (int, np.integer)) for i in item)):
            return refuse("DYNAMIC_ZERO_SPANS_INVALID")
        lo, hi = item
        if not 0 <= lo < hi <= len(source):
            return refuse("DYNAMIC_ZERO_SPANS_INVALID")
        if np.any(source[lo:hi] != 0) or np.any(candidate[lo:hi] != 0):
            return refuse("DYNAMIC_ZERO_SPANS_CHANGED")
    sample_peak = float(np.max(np.abs(candidate)))
    if sample_peak > 10**(-3.0/20):
        return refuse("DYNAMIC_PREENCODE_HEADROOM_EXCEEDED")
    signal_mask = (np.abs(source) > .002)
    if np.any(np.signbit(candidate[signal_mask])
              != np.signbit(source[signal_mask])):
        return refuse("DYNAMIC_POLARITY_FLIP_OR_SOURCE_SUBSTITUTION")
    if float(np.std(candidate)) < .005:
        return refuse("DYNAMIC_CANDIDATE_AUDIO_DROPPED")
    corr = float(np.corrcoef(source, candidate)[0, 1])
    if not np.isfinite(corr) or corr < .98:
        return refuse("DYNAMIC_SOURCE_CORRELATION_LOW")
    n = len(source)//240
    active, gain_db = [], []
    for i in range(n):
        lo, hi = i*240, (i+1)*240
        a, b = source[lo:hi], candidate[lo:hi]
        rms = float(np.sqrt(np.mean(a*a)))
        mask = np.abs(a) > .002
        is_active = rms >= .01 and np.count_nonzero(mask) >= 30
        active.append(is_active)
        if is_active:
            ratios = np.abs(b[mask]/a[mask])
            gain = float(np.median(ratios))
            if not np.isfinite(gain) or not .1 < gain <= 16:
                return refuse("DYNAMIC_ACTIVE_GAIN_INVALID")
            gain_db.append(20*np.log10(gain))
        else:
            gain_db.append(float("nan"))
    is_active = np.asarray(active, dtype=bool)
    gains = np.asarray(gain_db)
    valid = is_active[:-1] & is_active[1:]
    if int(valid.sum()) < 10:
        return refuse("DYNAMIC_ACTIVE_AUDIO_COVERAGE_INSUFFICIENT")
    diffs = np.abs(np.diff(gains)[valid])
    max_jump = float(np.max(diffs))
    report = {**base, "status": "RESEARCH_DYNAMIC_SLEW_SCREEN_HOLD",
              "errors": [], "sampleRateHz": 24000,
              "samplePeakDbfs": round(20*np.log10(sample_peak), 4),
              "active10msPairsCompared": int(valid.sum()),
              "sourceToCandidateCorrelation": round(corr, 6),
              "maxAdjacentActive10msGainDbJump": round(max_jump, 5),
              "allowedAdjacentGainJumpDb": 1.2,
              "maxJumpBelowResearchScreen": bool(max_jump <= 1.2),
              "notPsychoacousticallyCalibrated": True}
    if max_jump > 1.2:
        report.update(status="HOLD",
                      errors=["DYNAMIC_ABRUPT_GAIN_ENVELOPE"])
    return report



def audit_research_quiet_speech_preservation(source_pcm, preencode_pcm):
    """Research-only 24kHz physical quiet-speech 10ms preservation screen.

    The caller must verify immutable audio hashes. This measures gain and
    signal preservation, NOT correct phonemes, listening or any film approval.
    """
    base = {"schema": SCHEMA, "mayPublish": False,
            "productionAudioApproved": False, "phonemeIdentityVerified": False,
            "wordTimingCalibrated": False, "qualifiedListenerReviewed": False,
            "physicalFilmAudioVerified": False,
            "sourceHashesVerifiedByThisHelper": False}
    def reject(reason, **diagnostics):
        return {**base, "status": "HOLD", "errors": [reason], **diagnostics}
    try:
        original = np.asarray(source_pcm, dtype=np.float64)
        processed = np.asarray(preencode_pcm, dtype=np.float64)
    except (ValueError, TypeError, OverflowError):
        return reject("QUIET_PCM_INVALID")
    if (original.ndim != 1 or processed.ndim != 1 or
            original.shape != processed.shape or
            not 2400 <= len(original) <= 24000*600 or
            not np.isfinite(original).all() or
            not np.isfinite(processed).all() or
            np.max(np.abs(original)) > 1 or np.max(np.abs(processed)) > 1 or
            np.max(np.abs(original)) < .01):
        return reject("QUIET_PCM_INVALID")
    window_size = 240
    count = len(original)//window_size
    a = original[:count*window_size].reshape(count, window_size)
    b = processed[:count*window_size].reshape(count, window_size)
    source_rms = np.sqrt(np.mean(a*a, axis=1))
    rendered_rms = np.sqrt(np.mean(b*b, axis=1))
    quiet = (source_rms >= .0001) & (source_rms < .01)
    empty = source_rms == 0
    if int(quiet.sum()) < 10:
        return reject("QUIET_PCM_COVERAGE_INSUFFICIENT",
                      quietWindows=int(quiet.sum()))
    if np.any(rendered_rms[empty] > 0):
        return reject("QUIET_SOURCE_ZERO_WINDOW_FILLED")
    tail = original[count*window_size:]
    tail_processed = processed[count*window_size:]
    if len(tail):
        if not np.any(tail):
            if np.any(tail_processed):
                return reject("QUIET_UNMEASURED_TAIL_SILENCE_CHANGED")
        else:
            tail_rms = float(np.sqrt(np.mean(tail*tail)))
            altered_rms = float(np.sqrt(np.mean(tail_processed*tail_processed)))
            if tail_rms < .0001:
                return reject("QUIET_UNMEASURED_TAIL_TOO_FAINT_TO_CALIBRATE")
            ratio_tail = altered_rms/tail_rms
            if not .5 <= ratio_tail <= 8:
                return reject("QUIET_UNMEASURED_TAIL_GAIN_INVALID")
            a_tail = tail-tail.mean()
            b_tail = tail_processed-tail_processed.mean()
            corr_tail = float(np.dot(a_tail, b_tail)/max(
                np.linalg.norm(a_tail)*np.linalg.norm(b_tail), 1e-20))
            if corr_tail < .98:
                return reject("QUIET_UNMEASURED_TAIL_SIGNAL_CHANGED")
    a_q = a[quiet]
    b_q = b[quiet]
    ratio = rendered_rms[quiet]/source_rms[quiet]
    aa = a_q-a_q.mean(axis=1, keepdims=True)
    bb = b_q-b_q.mean(axis=1, keepdims=True)
    correlation = np.sum(aa*bb, axis=1)/np.maximum(
        np.linalg.norm(aa, axis=1)*np.linalg.norm(bb, axis=1), 1e-20)
    bad = (ratio < .5) | (ratio > 8) | (correlation < .98)
    failures = np.flatnonzero(quiet)[bad]
    measurements = {
        "sampleRateHz": 24000, "windowDurationMs": 10,
        "quietSourceWindows": int(quiet.sum()),
        "exactSourceZeroWindows": int(empty.sum()),
        "quietSourceRmsRange": [.0001, .01],
        "allowedResearchGainRatio": [.5, 8],
        "minimumResearchWindowCorrelation": .98,
        "lowestObservedQuietWindowRatio": round(float(ratio.min()), 6),
        "lowestObservedQuietWindowCorrelation":
            round(float(correlation.min()), 6),
        "failingQuietWindowCount": int(len(failures)),
        "firstFailingQuietWindowStartSeconds":
            [round(float(i)/100, 2) for i in failures[:16]],
        "truePhonemeOrPerceptualPreservationStillUnknown": True,
    }
    if len(failures):
        return reject("QUIET_SPEECH_DROP_OR_SUBSTITUTION", **measurements)
    return {**base, "status": "RESEARCH_QUIET_SIGNAL_SCREEN_HOLD",
            "errors": [], **measurements}



def audit_research_pcm_aac_delivery(preencode_pcm, decoded_aac_pcm):
    """Screen PCM->AAC signal/timing across 250ms source-clock windows.

    Preencode source lineage and actual FFmpeg decode are independently
    checked by the file-based wrapper. This is NEVER phoneme or listening
    proof, a genuine phone check, word-boundary calibration or release.
    """
    base = {"schema": SCHEMA, "mayPublish": False,
            "wordTimingCalibrated": False, "pronunciationVerified": False,
            "finishedFilmVerified": False,
            "decodedAACProvenanceVerifiedBySignalFunction": False}
    def refuse(reason, **extras):
        return {**base, "status": "HOLD", "errors": [reason], **extras}
    try:
        a = np.asarray(preencode_pcm, dtype=np.float64)
        b = np.asarray(decoded_aac_pcm, dtype=np.float64)
    except (ValueError, TypeError, OverflowError):
        return refuse("PCM_AAC_AUDIO_INVALID")
    if (a.ndim != 1 or b.ndim != 1
            or not 12000 <= len(a) <= 24000*600
            or not 0 <= len(b)-len(a) <= 1024
            or not np.isfinite(a).all() or not np.isfinite(b).all()
            or np.max(np.abs(a)) > 1 or np.max(np.abs(b)) > 1.5
            or np.max(np.abs(a)) < .01):
        return refuse("PCM_AAC_AUDIO_INVALID")
    pad = b[len(a):]
    if len(pad) and np.max(np.abs(pad)) > .001:
        return refuse("AAC_TRAILING_PADDING_CONTAINS_AUDIO",
                      paddingSamples=len(pad))
    def corr(x, y):
        x = x-x.mean()
        y = y-y.mean()
        denom = np.linalg.norm(x)*np.linalg.norm(y)
        return float(np.dot(x, y)/denom) if denom > 1e-12 else None
    count = active = exact_zero = low_level = 0
    worst = (1.0, None)
    failures, silence_leaks, lag_warnings = [], [], []
    for lo in range(0, len(a), 6000):
        hi = min(lo+6000, len(a))
        src, enc = a[lo:hi], b[lo:hi]
        if len(src) < 1200:
            if not np.any(src):
                if np.max(np.abs(enc)) > .001:
                    silence_leaks.append(round(lo/24000, 6))
            else:
                return refuse("AAC_SOURCE_TAIL_TOO_SHORT_TO_CALIBRATE",
                              startSecond=round(lo/24000, 6))
            continue
        count += 1
        rms = float(np.sqrt(np.mean(src*src)))
        if rms == 0:
            exact_zero += 1
            if float(np.sqrt(np.mean(enc*enc))) > .0005:
                silence_leaks.append(round(lo/24000, 6))
            continue
        if rms < .001:
            low_level += 1
            if np.sqrt(np.mean(enc*enc)) < rms*.4:
                failures.append((round(lo/24000, 6),
                                 "AAC_FAINT_AUDIO_DROPPED"))
            continue
        active += 1
        same = corr(src, enc)
        if same is None:
            failures.append((round(lo/24000, 6),
                             "AAC_SPEECH_VARIANCE_MISSING"))
            continue
        if same < worst[0]:
            worst = (same, round(lo/24000, 6))
        if same < .98:
            failures.append((round(lo/24000, 6), round(same, 5)))
            continue
        for delta in (-240, -120, -48, -24, 24, 48, 120, 240):
            shifted = (corr(src[:-delta], enc[delta:]) if delta > 0
                       else corr(src[-delta:], enc[:delta]))
            if shifted is not None and shifted > same+.005:
                lag_warnings.append((round(lo/24000, 6), delta,
                                     round(shifted-same, 6)))
                break
    result = {
        "preencodeSamples": len(a),
        "decodedAACSamples": len(b),
        "trailingCodecPaddingSamples": len(pad),
        "screened250msWindows": count,
        "activeSpeechWindows": active,
        "exactZeroWindows": exact_zero,
        "faintUncalibratedWindows": low_level,
        "lowestMeasuredSourceAACCorrelation": round(worst[0], 6),
        "lowestCorrelationWindowSecond": worst[1],
        "signalFailures": failures[:16],
        "sourceSilenceLeaks": silence_leaks[:16],
        "possibleTimingShifts": lag_warnings[:16],
        "sourceClockAlignedSignalOnlyNotPhonemes": True,
        "platformAACPrimingOrFilmMuxVerified": False,
    }
    if active < 4:
        return refuse("AAC_ACTIVE_SIGNAL_COVERAGE_INSUFFICIENT", **result)
    if failures or silence_leaks or lag_warnings:
        return refuse("AAC_SIGNAL_OR_TIMING_DISCREPANCY", **result)
    return {**base, "status": "RESEARCH_AAC_SOURCE_CLOCK_HOLD",
            "errors": [], **result}


def audit_research_pinned_aac_files(preencode_wav_path, encoded_aac_path,
                                    expected_wav_sha, expected_aac_sha):
    """Physically decode SHA-pinned standalone AAC; not an H264/AAC film."""
    import subprocess
    base = {"schema": SCHEMA, "mayPublish": False,
            "wordTimingCalibrated": False, "finishedFilmVerified": False,
            "phonemeIdentityVerified": False}
    def refuse(reason):
        return {**base, "status": "HOLD", "errors": [reason]}
    try:
        wav = Path(preencode_wav_path).read_bytes()
        aac = Path(encoded_aac_path).read_bytes()
        if digest(wav) != expected_wav_sha:
            return refuse("PREENCODE_WAV_SHA_MISMATCH")
        if digest(aac) != expected_aac_sha:
            return refuse("ENCODED_AAC_SHA_MISMATCH")
        with wave.open(io.BytesIO(wav), "rb") as source:
            if (source.getnchannels(), source.getsampwidth(),
                    source.getframerate(), source.getcomptype()) != (
                    1, 2, 24000, "NONE"):
                return refuse("PREENCODE_WAV_FORMAT_INVALID")
            pcm = np.frombuffer(source.readframes(source.getnframes()),
                                dtype="<i2").astype(np.float64)/32768
        probe = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries",
             "stream=codec_name,sample_rate,channels", "-of", "csv=p=0",
             str(encoded_aac_path)],
            capture_output=True, text=True, check=True, timeout=15)
        if probe.stdout.strip().split(",") != ["aac", "24000", "1"]:
            return refuse("ENCODED_AAC_FORMAT_INVALID")
        decoded = subprocess.run(
            ["ffmpeg", "-nostdin", "-v", "error", "-xerror", "-i",
             str(encoded_aac_path), "-ar", "24000", "-ac", "1", "-f",
             "f32le", "pipe:1"],
            capture_output=True, check=True, timeout=30).stdout
        if len(decoded) % 4:
            return refuse("AAC_DECODE_LENGTH_INVALID")
        signal = np.frombuffer(decoded, dtype="<f4").astype(np.float64)
        result = audit_research_pcm_aac_delivery(pcm, signal)
        return {**result, "preencodeWavSha256": expected_wav_sha,
                "standaloneAacSha256": expected_aac_sha,
                "decodedF32leSha256": digest(decoded),
                "standaloneAACBytesPhysicallyDecoded": True,
                "exactFinishedFilmVerified": False}
    except (OSError, ValueError, TypeError, EOFError,
            wave.Error, subprocess.SubprocessError):
        return refuse("PINNED_AAC_PHYSICAL_DECODE_UNAVAILABLE")



def audit_research_pinned_mux_identity(archived_film_path, candidate_aac_path,
                                      muxed_film_path, expected_archived_sha,
                                      expected_aac_sha, expected_muxed_sha):
    """Inspect physical stream-copy H264/AAC source and receiver; research HOLD.

    The expected SHA values MUST come from independent trusted receipts.
    Caller-chosen SHA pins prove only internal transport consistency, not
    trustworthy scientific content or production-film authorisation.
    """
    import subprocess
    base = {"schema": SCHEMA, "mayPublish": False,
            "productionAudioApproved": False, "phonemeIdentityVerified": False,
            "wordTimingCalibrated": False, "captionTimingApproved": False,
            "qualifiedListenerApproved": False, "phonePlaybackVerified": False,
            "sourceHashesIndependentlyTrustedByThisHelper": False,
            "newFilmRenderedWithProductionPipeline": False}
    def refuse(reason):
        return {**base, "status": "HOLD", "errors": [reason]}
    try:
        paths = tuple(Path(p) for p in (
            archived_film_path, candidate_aac_path, muxed_film_path))
        expected = (expected_archived_sha, expected_aac_sha, expected_muxed_sha)
        if any(not isinstance(x, str) or
               re.fullmatch(r"[0-9a-f]{64}", x) is None for x in expected):
            return refuse("NATIVE_MUX_EXPECTED_SHA_INVALID")
        for p, sha in zip(paths, expected):
            if digest(p.read_bytes()) != sha:
                return refuse("NATIVE_MUX_SOURCE_OR_OUTPUT_SHA_CHANGED")

        def packets(path, stream):
            raw = subprocess.run(
                ["ffprobe", "-v", "error", "-select_streams", stream,
                 "-show_packets", "-show_data_hash", "sha256",
                 "-show_entries",
                 "packet=pts_time,dts_time,duration_time,size,data_hash",
                 "-of", "json", str(path)], check=True,
                capture_output=True, timeout=60).stdout
            rows = json.loads(raw)["packets"]
            if (not isinstance(rows, list) or len(rows) < 10 or
                    any(not isinstance(p.get("data_hash"), str) or
                        re.fullmatch(r"SHA256:[0-9a-f]{64}", p["data_hash"])
                        is None for p in rows)):
                raise ValueError("NATIVE_MUX_PACKET_PROOF_MISSING")
            return rows

        def decoded(path, video):
            args = (["-map", "0:v:0", "-vf",
                     "scale=96:170:flags=bicubic,format=gray",
                     "-f", "rawvideo"] if video else
                    ["-map", "0:a:0", "-ac", "1", "-ar", "24000",
                     "-f", "f32le"])
            return subprocess.run(
                ["ffmpeg", "-nostdin", "-v", "error", "-xerror",
                 "-err_detect", "explode", "-i", str(path),
                 *args, "pipe:1"], capture_output=True, check=True,
                timeout=120).stdout

        old_video = packets(paths[0], "v:0")
        new_video = packets(paths[2], "v:0")
        aac = packets(paths[1], "a:0")
        new_audio = packets(paths[2], "a:0")
        if old_video != new_video:
            return refuse("NATIVE_MUX_VIDEO_PACKET_OR_TIMELINE_CHANGED")
        if aac != new_audio:
            return refuse("NATIVE_MUX_AAC_PACKET_OR_PTS_CHANGED")
        old_frames = decoded(paths[0], True)
        new_frames = decoded(paths[2], True)
        if (not old_frames or len(old_frames) != len(old_video)*96*170
                or old_frames != new_frames):
            return refuse("NATIVE_MUX_DECODED_VIDEO_FRAMES_CHANGED")
        old_pcm = decoded(paths[1], False)
        new_pcm = decoded(paths[2], False)
        if not old_pcm or len(old_pcm) % 4 or old_pcm != new_pcm:
            return refuse("NATIVE_MUX_DECODED_AUDIO_CHANGED")
        return {**base, "status": "RESEARCH_NATIVE_MUX_IDENTITY_HOLD",
                "errors": [], "researchPacketAndDecodedSignalIdentical": True,
                "archivedFilmSha256": expected_archived_sha,
                "candidateStandaloneAacSha256": expected_aac_sha,
                "researchMuxSha256": expected_muxed_sha,
                "h264PacketsCompared": len(old_video),
                "aacPacketsCompared": len(aac),
                "decodedVideoGraySequenceSha256": digest(new_frames),
                "decodedAacF32leSha256": digest(new_pcm),
                "decodedAacSampleCount": len(new_pcm)//4,
                "warning": "Mux identity does not prove phones, true peaks, "
                           "captions, science, creative quality or release."}
    except (OSError, KeyError, TypeError, ValueError, json.JSONDecodeError,
            subprocess.SubprocessError):
        return refuse("NATIVE_MUX_PHYSICAL_PROBE_OR_DECODE_UNAVAILABLE")


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


def audit_scientific_name_source_triage(source_raw, alignment_raw, asr_raw):
    """Investigate name transcription vs repeated ORIGINAL audio, no phone truth.

    Frozen first-party ASR may render mitragynine as "Mitrogenine" in all
    contexts. Spellcheck cannot determine whether source pronunciation is
    wrong; neither a forced phoneme ledger nor repeat similarity is a gold
    reference. This source-only negative/proxy report cannot approve release.
    """
    base = {"schema": SCHEMA, "mayPublish": False,
            "pronunciationVerified": False, "phonemeIdentityVerified": False,
            "wordTimingCalibrated": False, "captionTimingApproved": False,
            "correctSpokenScientificNameCertified": False,
            "narrationModified": False, "automaticVoiceCorrectionApproved": False,
            "externalReferenceCalibrated": False}
    def refuse(reason):
        return {**base, "status": "HOLD", "errors": [reason]}
    cross = audit_original_cross_model_word_timing(
        source_raw, alignment_raw, asr_raw)
    if cross["status"] != "RESEARCH_ORIGINAL_WORD_REVIEW_QUEUE_HOLD":
        return refuse("SCIENTIFIC_NAMES_REQUIRE_PINNED_SOURCE_MFA_ASR")
    try:
        mfa = json.loads(alignment_raw)["wordAlignment"]
        heard = json.loads(asr_raw)["recognizedWords"]
        expected = ((7, 5, "mitragynine"), (17, 15, "hydroxymitragynine"),
                    (19, 17, "mitragynine"))
        if (tuple(mfa[i]["word"].lower() for i in (7,9,16,17,19,28))
                != ("mitragynine", "hydroxyl", "seven",
                    "hydroxymitragynine", "mitragynine", "chemical")):
            return refuse("SCIENTIFIC_NAMES_AUTHORED_TERM_ANCHORS_CHANGED")
        phones = mfa[17]["phones"]
        # This is a forced-alignment segmentation hypothesis, NOT an
        # independently verified /m/ or phonetic spelling. The start is
        # locked to the received ledger and source file identity.
        m_starts = [p["startMs"] for p in phones
                    if isinstance(p, dict) and p.get("phone") == "M"]
        if (len(m_starts) != 1 or type(m_starts[0]) not in (int,float)
                or not np.isfinite(m_starts[0]) or not
                mfa[17]["startMs"] < m_starts[0] < mfa[17]["endMs"]-100):
            return refuse("SCIENTIFIC_NAMES_EMBEDDED_TAIL_NOT_LOCATABLE")
        with wave.open(io.BytesIO(source_raw), "rb") as w:
            if ((w.getnchannels(), w.getsampwidth(), w.getframerate(),
                 w.getnframes(), w.getcomptype())
                    != (1,2,24000,824336,"NONE")):
                return refuse("SCIENTIFIC_NAMES_WAV_FORMAT_INVALID")
            pcm = w.readframes(w.getnframes())
        if len(pcm) != 824336*2:
            return refuse("SCIENTIFIC_NAMES_WAV_PCM_TRUNCATED")
        orig = np.frombuffer(pcm,dtype="<i2").astype(np.float64)/32768
        bounds = {str(i): (round(mfa[i]["startMs"]*24),
                           round(mfa[i]["endMs"]*24))
                  for i in (7,9,17,19,28)}
        bounds["compoundTailMfaHypothesis"] = (
            round(m_starts[0]*24), bounds["17"][1])
        clips, hashes, rows = {}, {}, []
        for key, (lo,hi) in bounds.items():
            if not (0 <= lo < hi <= len(orig)
                    and 2400 <= hi-lo <= 120000):
                return refuse("SCIENTIFIC_NAMES_SAMPLE_RANGE_INVALID")
            clip = orig[lo:hi]
            if not np.all(np.isfinite(clip)) or np.sqrt(
                    np.mean(clip*clip)) < .002:
                return refuse("SCIENTIFIC_NAMES_SOURCE_SPEECH_MISSING")
            clips[key]=clip
            hashes[key]=digest(pcm[2*lo:2*hi])
        f={key:trajectory(clip) for key,clip in clips.items()}
        def score(a,b): return round(distance(f[a],f[b]),6)
        repeat=score("7","19")
        head=score("compoundTailMfaHypothesis","7")
        after=score("compoundTailMfaHypothesis","19")
        negative=[score("compoundTailMfaHypothesis",control)
                  for control in ("9","28")]
        # A forced-alignment /M/ timestamp is an ANNOTATION, not a detected
        # phoneme. Independently perturb that boundary at fixed 40ms steps
        # across +/-120ms. The real source changes its cosine-DTW score
        # materially under small edits; surface uncertainty rather than
        # implying a single score proves the chemical name was spoken right.
        # No synthetic syllables, source edits or phonetic gold references.
        tail_end = bounds["17"][1]
        base_start_ms = m_starts[0]
        boundary_sweep = []
        for shift_ms in (-120, -80, -40, 0, 40, 80, 120):
            start_ms = base_start_ms + shift_ms
            lo = round(start_ms*24)
            if (not bounds["17"][0] < lo < tail_end
                    or not 2400 <= tail_end-lo <= 120000):
                return refuse("SCIENTIFIC_NAMES_TAIL_SWEEP_OUTSIDE_SOURCE")
            candidate_pcm = orig[lo:tail_end]
            if float(np.sqrt(np.mean(candidate_pcm*candidate_pcm))) < .002:
                return refuse("SCIENTIFIC_NAMES_TAIL_SWEEP_SIGNAL_MISSING")
            features=trajectory(candidate_pcm)
            d1=round(distance(features,f["7"]),6)
            d2=round(distance(features,f["19"]),6)
            boundary_sweep.append({
                "startRelativeToForcedMfaMs":shift_ms,
                "startSec":round(lo/24000,6),
                "sourcePcmSha256":digest(pcm[2*lo:2*tail_end]),
                "distanceToStandalone1":d1,
                "distanceToStandalone2":d2,
                "validatedPhonemeOnset":False,
            })
        # At the unchanged forced M boundary, the re-measured window must
        # exactly reproduce the reported single-window score.
        center=boundary_sweep[3]
        if (center["sourcePcmSha256"]!=hashes["compoundTailMfaHypothesis"]
                or center["distanceToStandalone1"]!=head
                or center["distanceToStandalone2"]!=after):
            return refuse("SCIENTIFIC_NAMES_BOUNDARY_BASELINE_DISAGREES")
        ranges=[]
        for key in ("distanceToStandalone1","distanceToStandalone2"):
            values=[item[key] for item in boundary_sweep]
            ranges.append({
                "comparedWith":key,
                "minDistance":min(values),
                "maxDistance":max(values),
                "distanceRange":round(max(values)-min(values),6),
            })
        instability=any(x["distanceRange"]>=.05 for x in ranges)
        # Critical same-word negative control: how much would this exact
        # distance change if we nudged the annotated start of one of the TWO
        # standalone mitragynine utterances instead? Otherwise a compound-
        # only boundary sweep falsely makes its variability seem suspicious.
        control_sweeps = []
        control_ranges = []
        offsets = (-120,-80,-40,0,40,80,120)
        for source_word, other_word in (("7","19"),("19","7")):
            word_index = int(source_word)
            end_sample = bounds[source_word][1]
            control = []
            for offset_ms in offsets:
                lo = round((mfa[word_index]["startMs"]+offset_ms)*24)
                if (lo < 0 or not 2400 <= end_sample-lo <= 120000):
                    return refuse("SCIENTIFIC_NAMES_CONTROL_SWEEP_OUTSIDE_SOURCE")
                piece = orig[lo:end_sample]
                if float(np.sqrt(np.mean(piece*piece))) < .002:
                    return refuse("SCIENTIFIC_NAMES_CONTROL_SWEEP_NO_SPEECH")
                observed = round(distance(trajectory(piece),f[other_word]),6)
                control.append({
                    "sourceMfaWordIndex": word_index,
                    "againstOtherMfaWordIndex": int(other_word),
                    "shiftRelativeToMfaMs": offset_ms,
                    "sourcePcmSha256": digest(pcm[2*lo:2*end_sample]),
                    "distanceToOtherStandalone": observed,
                    "phoneticCalibration": False,
                })
            if (control[3]["distanceToOtherStandalone"]!=repeat
                    or control[3]["sourcePcmSha256"]!=hashes[source_word]):
                return refuse("SCIENTIFIC_NAMES_STANDALONE_CONTROL_BASELINE_DISAGREES")
            scores=[v["distanceToOtherStandalone"] for v in control]
            control_ranges.append({
                "movingMfaWordIndex":word_index,
                "fixedMfaWordIndex":int(other_word),
                "minimumDistance":min(scores),"maximumDistance":max(scores),
                "distanceRange":round(max(scores)-min(scores),6),
            })
            control_sweeps.append(control)
        norm=lambda s:re.sub(r"[^a-z0-9]","",s.lower())
        for position, asr_position, script in expected:
            item=mfa[position]
            recognized=heard[asr_position]
            if not isinstance(recognized["word"],str):
                return refuse("SCIENTIFIC_NAMES_ASR_TEXT_INVALID")
            lo,hi=bounds[str(position)]
            rows.append({
                "authoredChemicalNameHypothesis":script,
                "mfaWordIndex":position, "asrWordIndex":asr_position,
                "mfaAuthoredWindowSeconds":[round(lo/24000,6),
                                             round(hi/24000,6)],
                "asrHypothesizedWindowSeconds":[recognized["start"],
                                                 recognized["end"]],
                "sourceWordPcmSha256":hashes[str(position)],
                "asrTokenAsRecognized":recognized["word"].strip(),
                "asrLexicalDisagreement":norm(recognized["word"])!=norm(script),
                "speechContentCorrectByAcoustics":None,
                "lexicalWinner":None,
            })
        triage = {
            "method": "SOURCE_LOCKED_25MS_10MS_LOG_SPECTRAL_DCT_DTW",
            "standaloneRepeatDistance":repeat,
            "embeddedMfaTailVsStandaloneDistances":[head,after],
            "embeddedTailVsUnrelatedSameNarratorControls":negative,
            "forcedTailStartBoundarySweepMs":[-120,-80,-40,0,40,80,120],
            "boundarySensitivitySourceOnly":boundary_sweep,
            "boundarySensitivityDistanceRanges":ranges,
            "sameSpokenNameControlSweeps":control_sweeps,
            "sameSpokenNameControlRanges":control_ranges,
            "standaloneControlsAreAuthoredLabelsNotPhoneticGold":True,
            "compoundBoundaryInstabilityUniqueToCompound":None,
            "relativeBoundaryScoreNotACalibratedPhoneticTest":True,
            "sensitiveToHypothesizedOnset":bool(instability),
            "singleBestDistanceCannotEstablishPhonemeIdentity":True,
            "boundarySensitivitySpeechStartCalibrationAbsent":True,
            "embeddedTailMfaHypothesisStartSec":round(
                bounds["compoundTailMfaHypothesis"][0]/24000,6),
            "embeddedTailPcmSha256":hashes["compoundTailMfaHypothesis"],
            "embeddedSegmentIsAForcedAlignmentHypothesisOnly":True,
            "distanceThresholdCalibratedForPhoneticAccuracy":False,
            "withinOriginalPatternComparisonOnly":True,
            "numberOfPhoneLabelsActuallyHeardOrValidated":0,
        }
        return {**base, "status": "RESEARCH_SCIENTIFIC_NAMES_ACOUSTIC_TRIAGE_HOLD",
                "sourceWavSha256":SOURCE_WAV_REFERENCE,
                "mfaAlignmentSha256":MFA_SOURCE_ALIGNMENT_SHA,
                "asrReceiptSha256":POSE_ASR_RECEIPT_SHA,
                "sourceWordCount":len(mfa),
                "asrWordCount":len(heard),
                "nameCandidateCount":len(rows),
                "mismatchedAsrScientificNameTokens":sum(
                    r["asrLexicalDisagreement"] for r in rows),
                "timecodedWordReviews":rows,
                "spectralResearch":triage,
                "reportEvaluatesOriginalUnmodifiedNarration":True,
                "reviewerVerdict":None,
                "nextResearchAction": "Obtain independent phonetic reference "
                    "and compare repeated-name sound to that reference; "
                    "do not trust cross-model text or this spectral proxy.",
                "caution": "Consistent misrecognition may be an ASR vocabulary "
                    "failure or a real speech issue. Neither is established."}
    except (OSError, EOFError, wave.Error, KeyError, IndexError, ValueError,
            TypeError, FloatingPointError):
        return refuse("SCIENTIFIC_NAMES_SPECTRAL_OR_RECEIPT_PARSE_FAILED")


def audit_original_narration_dead_air(source_raw, alignment_raw, asr_raw):
    """Physically verify extended digital-zero pauses in original narration.

    A true digital-zero span can veto an impossible ASR word onset but cannot
    establish whether the pause is intended, whether nonzero audio is speech,
    or how a final film should be paced. No timecodes/audio are ever edited.
    """
    base = {"schema": SCHEMA, "mayPublish": False,
            "pronunciationVerified": False, "phonemeIdentityVerified": False,
            "wordTimingCalibrated": False, "captionTimingApproved": False,
            "pauseCraftApproved": False, "audioAltered": False}
    def fail(reason):
        return {**base, "status": "HOLD", "errors": [reason]}
    report = audit_original_cross_model_word_timing(
        source_raw, alignment_raw, asr_raw)
    if report["status"] != "RESEARCH_ORIGINAL_WORD_REVIEW_QUEUE_HOLD":
        return fail("DEAD_AIR_REQUIRES_AUTHENTICATED_CROSS_MODEL_SOURCES")
    try:
        with wave.open(io.BytesIO(source_raw), "rb") as source:
            if (source.getnchannels(), source.getsampwidth(),
                    source.getframerate(), source.getcomptype(),
                    source.getnframes()) != (1, 2, 24000, "NONE", 824336):
                return fail("DEAD_AIR_MASTER_WAV_FORMAT_INVALID")
            raw_pcm = source.readframes(source.getnframes())
        if len(raw_pcm) != 824336 * 2:
            return fail("DEAD_AIR_MASTER_PCM_TRUNCATED")
        signal = np.frombuffer(raw_pcm, dtype="<i2")
        zero = signal == 0
        changes = np.flatnonzero(np.diff(
            np.r_[False, zero, False].astype(np.int8)))
        # Deliberately strict: exactly 1.2 seconds of digital zeros is long
        # enough to require a creative/directorial review, not auto-silencing.
        min_samples = 28800
        original_words = json.loads(alignment_raw)["wordAlignment"]
        recognized_words = json.loads(asr_raw)["recognizedWords"]
        intervals = []
        for first, stop in zip(changes[::2], changes[1::2]):
            first, stop = int(first), int(stop)
            if stop - first < min_samples:
                continue
            begin_ms, end_ms = first/24, stop/24
            before = [(i, w) for i, w in enumerate(original_words)
                      if w["endMs"] <= begin_ms]
            after = [(i, w) for i, w in enumerate(original_words)
                     if w["startMs"] >= end_ms]
            prev = max(before, key=lambda v: v[1]["endMs"]) if before else None
            later = min(after, key=lambda v: v[1]["startMs"]) if after else None
            asr_onsets = []
            for i, w in enumerate(recognized_words):
                claimed_sample = round(w["start"] * 24000)
                if first <= claimed_sample < stop:
                    asr_onsets.append({
                        "wordIndex": i, "recognizerHypothesis": w["word"].strip(),
                        "hypothesizedOnsetSample": claimed_sample,
                        "provenZeroBeyondClaimedOnsetMs":
                            round((stop-claimed_sample)/24, 3)})
            intervals.append({
                "startSample": first, "endSample": stop,
                "startSeconds": round(first/24000, 6),
                "endSeconds": round(stop/24000, 6),
                "durationMs": round((stop-first)/24, 3),
                "allOriginalPcmSamplesAreZero": True,
                "zeroPcmSha256": digest(raw_pcm[first*2:stop*2]),
                "precedingAuthoredHypothesis": (
                    {"wordIndex": prev[0], "word": prev[1]["word"],
                     "endMs": prev[1]["endMs"]} if prev else None),
                "followingAuthoredHypothesis": (
                    {"wordIndex": later[0], "word": later[1]["word"],
                     "startMs": later[1]["startMs"]} if later else None),
                "asrOnsetsClaimedDuringDigitalZero": asr_onsets,
            })
        return {**base, "status": "RESEARCH_DEAD_AIR_CREATIVE_REVIEW_HOLD",
                "sourceWavSha256": SOURCE_WAV_REFERENCE,
                "mfaAlignmentSha256": MFA_SOURCE_ALIGNMENT_SHA,
                "asrReceiptSha256": POSE_ASR_RECEIPT_SHA,
                "originalAudioIndependentlyRehashed": True,
                "sourceFrameCount": 824336, "sampleRate": 24000,
                "exactDigitalZeroReviewThresholdMs": 1200,
                "longDigitalZeroIntervalCount": len(intervals),
                "longDigitalZeroIntervals": intervals,
                "automaticPauseRemovalAllowed": False,
                "automaticCaptionShiftAllowed": False,
                "caution": "Long exact digital silence requires an actual "
                           "director/ear-check decision. ASR onsets inside that "
                           "silence are physically impossible, but MFA/ASR "
                           "word boundaries and intended pause length remain "
                           "unverified. No narration or caption changes applied."}
    except (ValueError, TypeError, OSError, EOFError, wave.Error, KeyError):
        return fail("DEAD_AIR_ORIGINAL_SOURCE_PARSE_FAILED")


# Exact original archived H.264/AAC TIMED RESEARCH candidate, NOT current
# production and NOT independently approved for normal publication.
ARCHIVED_TIMED_NATIVE_VIDEO_SHA = "2851c9ce6bbac6c5bd396c28cb4ab3c59caf5a4f5baaa1ffddc77f05bfd6988a"
ARCHIVED_TIMED_NATIVE_RECEIPT_SHA = "1ca12f7d947b1558588ff67829e641d2a0e8b81fb6f649cee4161f6e5ecc0839"


def audit_archived_frame_native_pause_plan(source_raw, video_raw, receipt_raw):
    """Plan synchronized original-voice cuts ON 30fps boundaries; edit nothing.

    Archived real film includes a visual source card during the narration's
    3.44s exact silence. Offline 1200ms/650ms audio audition lengths are NOT
    whole-frame cuts, so provide nearby sample-exact 30fps-compatible options.
    """
    base = {"schema": SCHEMA, "mayPublish": False, "productionEditApproved": False,
            "captionTimingApproved": False, "wordTimingCalibrated": False,
            "voicePronunciationVerified": False, "creativePauseApproved": False,
            "originalVoiceOrFilmModified": False, "nativeVideoProduced": False,
            "sourceCardReadingTimeApproved": False}
    def reject(reason):
        return {**base, "status": "HOLD", "errors": [reason]}
    if not all(isinstance(x, bytes) for x in (source_raw, video_raw, receipt_raw)):
        return reject("FRAME_PLAN_ALL_ORIGINAL_SOURCE_BYTES_REQUIRED")
    if digest(source_raw) != SOURCE_WAV_REFERENCE:
        return reject("FRAME_PLAN_PINNED_ORIGINAL_WAV_SHA_CHANGED")
    if digest(video_raw) != ARCHIVED_TIMED_NATIVE_VIDEO_SHA:
        return reject("FRAME_PLAN_PINNED_NATIVE_FILM_SHA_CHANGED")
    if digest(receipt_raw) != ARCHIVED_TIMED_NATIVE_RECEIPT_SHA:
        return reject("FRAME_PLAN_PINNED_RENDER_RECEIPT_SHA_CHANGED")
    try:
        with wave.open(io.BytesIO(source_raw), "rb") as w:
            if (w.getnchannels(), w.getsampwidth(), w.getframerate(),
                    w.getcomptype(), w.getnframes()) != (1, 2, 24000,
                                                        "NONE", 824336):
                return reject("FRAME_PLAN_SOURCE_WAV_FORMAT_CHANGED")
            pcm = w.readframes(w.getnframes())
        if len(pcm) != 824336*2:
            return reject("FRAME_PLAN_SOURCE_PCM_TRUNCATED")
        start, end = 663600, 746160
        if pcm[start*2:end*2] != bytes((end-start)*2):
            return reject("FRAME_PLAN_ORIGINAL_ZERO_INTERVAL_MISSING")
        receipt = json.loads(receipt_raw)
        scenes = receipt.get("scenes")
        if (receipt.get("videoSha256") != ARCHIVED_TIMED_NATIVE_VIDEO_SHA
                or receipt.get("sourceWavSha256") != SOURCE_WAV_REFERENCE
                or receipt.get("frames") != 1031 or receipt.get("fps") != 30
                or receipt.get("isOriginalV5") is not False
                or receipt.get("mayPublish") is not False
                or receipt.get("pronunciationVerified") is not False
                or receipt.get("candidateCaptionWindowsAppliedToFilm") is not True
                or receipt.get("craftApproved") is not False
                or receipt.get("scienceApproved") is not False
                or not isinstance(scenes, list)
                or [s.get("id") for s in scenes][-3:] != [
                    "sentence_5", "source_hold", "sentence_6"]):
            return reject("FRAME_PLAN_ORIGINAL_RENDER_RECEIPT_AUTHORITY_CHANGED")
        hold_scene, post = scenes[-2], scenes[-1]
        if (hold_scene.get("startSec") != 27.35
                or hold_scene.get("endSec") != 31.25
                or hold_scene.get("line") != ""
                or post.get("startSec") != 31.25
                or not isinstance(post.get("captionWords"), list)
                or len(post["captionWords"]) != 9
                or post["captionWords"][0].get("text") != "That's"
                or post["captionWords"][0].get("startSec") != 31.25):
            return reject("FRAME_PLAN_FILM_SOURCE_CARD_OR_FOLLOWING_CUE_CHANGED")
        # Exactly 800 samples per frame at PCM 24kHz and film 30fps.
        samples_per_frame = 800
        cut_start = ((start + samples_per_frame - 1) //
                     samples_per_frame) * samples_per_frame
        variants = []
        for label, target_ms, removed_frames in [
                ("original", 3440, 0),
                ("near_1200ms", 1200, 67),
                ("near_650ms", 650, 84)]:
            removed = removed_frames*samples_per_frame
            cut_end = cut_start + removed
            if not (start <= cut_start <= cut_end <= end
                    and pcm[cut_start*2:cut_end*2] == bytes(removed*2)
                    and hold_scene["startSec"] <= cut_start/24000
                    and cut_end/24000 <= hold_scene["endSec"]):
                return reject("FRAME_PLAN_CUT_MAY_TOUCH_SOURCE_SPEECH_OR_CARD_BOUNDARY")
            remaining = (end-start-removed)
            shift = removed_frames/30
            suffix = []
            previous_end = None
            for cue in post["captionWords"]:
                if not isinstance(cue, dict):
                    return reject("FRAME_PLAN_FOLLOWING_CAPTION_CUE_INVALID")
                a, b = cue.get("startSec"), cue.get("endSec")
                text = cue.get("text")
                if (not isinstance(a, (float, int)) or isinstance(a, bool)
                        or not isinstance(b, (float, int)) or isinstance(b, bool)
                        or not isinstance(text, str) or not text.strip()
                        or not np.isfinite(a) or not np.isfinite(b)
                        or not cut_end/24000 <= a < b <= 1031/30
                        or (previous_end is not None and a < previous_end)):
                    return reject("FRAME_PLAN_FOLLOWING_CAPTION_CUE_INVALID")
                previous_end = b
                # Native 30fps cut != proof that word-cue transitions land
                # on film frame boundaries. The original 31.25s cue begins
                # HALF a frame off-grid; cutting N whole frames preserves
                # that phase. Quantization remains a decoded-film review.
                proposed_a, proposed_b = a-shift, b-shift
                def frame_rounding_ms(seconds):
                    frame_position = seconds * 30
                    fractional = frame_position % 1
                    return round(min(fractional, 1-fractional)*1000/30, 6)
                suffix.append({"word": text,
                               "sourceStartSec": a,
                               "proposalStartSec": round(proposed_a, 6),
                               "proposalEndSec": round(proposed_b, 6),
                               "proposedStartNearestFrameErrorMs":
                                   frame_rounding_ms(proposed_a),
                               "proposedEndNearestFrameErrorMs":
                                   frame_rounding_ms(proposed_b)})
            variants.append({
                "label": label, "auditionApproximateTargetPauseMs": target_ms,
                "audioAuditionExactDurationIsNotFrameAligned":
                    target_ms != round(remaining/24, 6),
                "cutStartOriginalSample": cut_start,
                "cutEndOriginalSample": cut_end,
                "removedExactDigitalZeroSamples": removed,
                "removedWhole30fpsFrames": removed_frames,
                "proposedRetainedOriginalPauseMs": round(remaining/24, 6),
                "postPauseTimeShiftMs": round(removed/24, 6),
                "sourceHoldProposedDurationMs": round(
                    (hold_scene["endSec"]-hold_scene["startSec"]-shift)*1000, 6),
                "sourceCardReadingTimeApproved": False,
                "researchProposedNativeFilmFrames": 1031-removed_frames,
                "researchProposedOriginalWavSamples": 824336-removed,
                "firstFollowingCaptionProposalStartSec": suffix[0]["proposalStartSec"],
                "lastFollowingCaptionProposalEndSec": suffix[-1]["proposalEndSec"],
                "followingNineCaptionsResearchOnly": suffix,
                "captionSubframeTransitionsStillRequireFilmQA": True})
        return {**base, "status": "RESEARCH_FRAME_NATIVE_PAUSE_PLAN_HOLD",
                "originalWavSha256": SOURCE_WAV_REFERENCE,
                "archivedResearchFilmSha256": ARCHIVED_TIMED_NATIVE_VIDEO_SHA,
                "archivedRenderReceiptSha256": ARCHIVED_TIMED_NATIVE_RECEIPT_SHA,
                "originalExactZeroSamples": [start, end],
                "originalSourceCardHoldSeconds": [
                    hold_scene["startSec"], hold_scene["endSec"]],
                "originalSourceCardHoldMs": 3900,
                "sourceSampleRate": 24000, "nativeVideoFrameRate": 30,
                "samplesPerVideoFrame": samples_per_frame,
                "researchPlans": variants,
                "nonzeroVoiceSamplesMustRemainBitExact": True,
                "captionCueRetimingRequiresIndependentRenderedFilmReview": True,
                "caution": "Old archived research film, not current final release. "
                           "These are mathematically frame-aligned edit PLANS "
                           "only. No master WAV, frames, AAC, captions or videos "
                           "were produced, accepted or changed."}
    except (ValueError, TypeError, EOFError, OSError, wave.Error, KeyError):
        return reject("FRAME_PLAN_ORIGINAL_RESEARCH_DATA_PARSE_FAILED")


def audit_archived_frame_native_pause_files(wav_path, video_path, receipt_path):
    """Read only three SHA-pinned first-party archived inputs; no writes."""
    try:
        paths = ((Path(wav_path), 3000000), (Path(video_path), 10000000),
                 (Path(receipt_path), 50000))
        if any(p.is_symlink() or not p.is_file()
               or not 0 < p.stat().st_size <= limit for p, limit in paths):
            return hold("FRAME_PLAN_ARCHIVED_FILES_MISSING_OR_UNSAFE")
        return audit_archived_frame_native_pause_plan(
            *(p.read_bytes() for p, _ in paths))
    except (OSError, TypeError, ValueError):
        return hold("FRAME_PLAN_ARCHIVED_FILES_UNREADABLE")


def audit_archived_suffix_cue_hypotheses(
        source_raw, alignment_raw, asr_raw, video_raw, receipt_raw):
    """Screen nine archived caption cues against source-pinned *hypotheses*.

    This does not read decoded frames. Caption starts are frozen render-receipt
    coordinates, not observed glyph transitions; ASR/MFA may both be wrong.
    Only a word onset wholly inside source digital zero is mechanically vetoed.
    """
    base = {"schema": SCHEMA, "mayPublish": False,
            "pronunciationVerified": False, "phonemeIdentityVerified": False,
            "wordTimingCalibrated": False, "captionTimingApproved": False,
            "independentHumanListeningVerified": False,
            "decodedCaptionPixelsVerifiedByThisAudit": False,
            "sourceVoiceModified": False, "nativeFilmModified": False}
    def refuse(reason):
        return {**base, "status": "HOLD", "errors": [reason]}
    cross = audit_original_cross_model_word_timing(
        source_raw, alignment_raw, asr_raw)
    plan = audit_archived_frame_native_pause_plan(
        source_raw, video_raw, receipt_raw)
    if (cross["status"] != "RESEARCH_ORIGINAL_WORD_REVIEW_QUEUE_HOLD"
            or plan["status"] != "RESEARCH_FRAME_NATIVE_PAUSE_PLAN_HOLD"):
        return refuse("SUFFIX_CUES_REQUIRE_PINNED_ORIGINAL_FIVE_SOURCES")
    try:
        words = json.loads(alignment_raw)["wordAlignment"]
        heard = json.loads(asr_raw)["recognizedWords"]
        receipt = json.loads(receipt_raw)
        cues = receipt["scenes"][-1]["captionWords"]
        expected = ("thats", "the", "kind", "of", "detail",
                    "worth", "looking", "closer", "at")
        norm = lambda text: re.sub(r"[^a-z0-9]", "", text.casefold())
        authored = [(words[63]["startMs"], words[64]["endMs"],
                     words[63]["word"] + words[64]["word"])]
        authored += [(word["startMs"], word["endMs"], word["word"])
                     for word in words[65:73]]
        if (len(authored) != 9 or len(cues) != 9 or len(heard) != 70
                or tuple(norm(x["text"]) for x in cues) != expected
                or tuple(norm(x[2]) for x in authored) != expected
                or tuple(norm(x["word"]) for x in heard[61:70]) != expected):
            return refuse("SUFFIX_CUES_SOURCE_LEXICAL_LAYOUT_CHANGED")
        with wave.open(io.BytesIO(source_raw), "rb") as w:
            pcm = w.readframes(w.getnframes())
        if (len(pcm) != 824336*2
                or any(pcm[i*2:i*2+2] != bytes(2)
                       for i in (663600, 700000, 746159))
                or pcm[663600*2:746160*2] != bytes((746160-663600)*2)):
            return refuse("SUFFIX_CUES_VERIFIED_ZERO_SPAN_MISSING")
        source_zero_start, source_zero_end = 663600, 746160
        # The original WAV has nonzero *low-level* material immediately
        # after 31.09s. Do NOT mistake the first nonzero sample for speech
        # onset, or mistake this fixed-level envelope screen for a phoneme.
        # Record a repeatable diagnostic only: two successive nonoverlapping
        # 10ms windows whose PCM16 normalized RMS is >=0.005.
        samples = np.frombuffer(pcm, dtype="<i2").astype(np.float64)/32768
        window_samples = 240
        search_end = min(len(samples), round(31.60*24000))
        rms_windows = []
        for lo in range(source_zero_end,
                        search_end-window_samples+1, window_samples):
            window = samples[lo:lo+window_samples]
            rms_windows.append((lo, float(np.sqrt(np.mean(window*window)))))
        first_rise = next((
            rms_windows[i][0]
            for i in range(len(rms_windows)-1)
            if rms_windows[i][1] >= 0.005 and rms_windows[i+1][1] >= 0.005
        ), None)
        if first_rise is None:
            return refuse("SUFFIX_CUES_POST_ZERO_SUSTAINED_SIGNAL_NOT_FOUND")
        rise_s = first_rise/24000
        first_cue_s = float(cues[0]["startSec"])
        first_frame_s = int(np.ceil(first_cue_s*30-1e-8))/30
        first_asr_s = float(heard[61]["start"])
        signal_rise = {
            "method": "FIRST_TWO_CONSECUTIVE_10MS_RMS_WINDOWS_ABOVE_0_005",
            "sourcePcmSha256": SOURCE_WAV_REFERENCE,
            "postZeroSearchStartSample": source_zero_end,
            "searchEndSec": round(search_end/24000, 6),
            "windowDurationMs": 10,
            "minimumConsecutiveWindows": 2,
            "normalizedPcm16RmsThreshold": 0.005,
            "firstQualifyingWindowSample": first_rise,
            "firstQualifyingWindowSec": round(rise_s, 6),
            "firstCaptionCueMinusSignalRiseMs":
                round((first_cue_s-rise_s)*1000, 3),
            "firstEligibleVideoFrameMinusSignalRiseMs":
                round((first_frame_s-rise_s)*1000, 3),
            "signalRiseMinusFirstAsrHypothesisMs":
                round((rise_s-first_asr_s)*1000, 3),
            "phonemeOrWordOnsetIdentified": False,
            "qualifiedSpeakerListeningProvided": False,
            "researchEnergyHeuristicOnly": True,
        }
        # Another model disagreement: 'kind' visible at 31.58s (MFA also
        # 31.58s), while ASR guesses 31.74s. Search a FIXED 10ms-grid
        # corridor for a low-energy TWO-window trough followed by TWO
        # consecutive >=0.012 RMS windows; an isolated spike cannot win.
        # This can identify a transition in sound, NEVER which phone/word.
        kind_cue_s = float(cues[2]["startSec"])
        kind_asr_s = float(heard[63]["start"])
        kind_search_start_bin, kind_search_end_bin = 3154, 3181
        kind_rms = []
        for grid_bin in range(kind_search_start_bin, kind_search_end_bin):
            a = grid_bin*240
            slice_10ms = samples[a:a+240]
            if len(slice_10ms) != 240:
                return refuse("SUFFIX_CUES_KIND_AUDIO_CONTEXT_TRUNCATED")
            kind_rms.append(float(np.sqrt(np.mean(slice_10ms**2))))
        candidate = None
        for i in range(len(kind_rms)-2):
            trough_s = (kind_search_start_bin+i)/100
            if (not kind_cue_s-0.04 <= trough_s <= kind_cue_s+0.07
                    or not (kind_rms[i] < 0.006
                            and kind_rms[i+1] < 0.006)):
                continue
            for j in range(i+2, min(i+11, len(kind_rms)-1)):
                rise_s = (kind_search_start_bin+j)/100
                if (rise_s < kind_asr_s
                        and kind_rms[j] >= 0.012
                        and kind_rms[j+1] >= 0.012):
                    candidate = (i, j, trough_s, rise_s)
                    break
            if candidate is not None:
                break
        kind_context_lo = kind_search_start_bin*240
        kind_context_hi = kind_search_end_bin*240
        kind_check = {
            "status": "RESEARCH_ENERGY_CORRIDOR_ONLY_HOLD"
                      if candidate is not None else
                      "NO_STABLE_TROUGH_THEN_RISE_REVIEW_HOLD",
            "captionToken": "kind",
            "originalPcmContextSha256": digest(
                pcm[kind_context_lo*2:kind_context_hi*2]),
            "originalPcmContextSamples": [
                kind_context_lo, kind_context_hi],
            "gridSeconds": [
                kind_search_start_bin/100, kind_search_end_bin/100],
            "gridStepMs": 10,
            "pairedTroughRmsThresholdExclusive": 0.006,
            "pairedRiseRmsThresholdInclusive": 0.012,
            "riseSearchMaxMsAfterTrough": 100,
            "captionCandidateStartSec": kind_cue_s,
            "asrCandidateStartSec": kind_asr_s,
            "observedEnergyTransition": candidate is not None,
            "originalPcmWordOrPhonemeIdentified": False,
            "newWordBoundaryCertified": False,
            "captionTimingApproved": False,
            "humanAuditionRequired": True,
        }
        if candidate is not None:
            i, j, trough_s, rise_s = candidate
            asr_bin = round(kind_asr_s*100)
            kind_check.update({
                "twoWindowTroughSec": [round(trough_s, 3),
                                       round(trough_s+0.02, 3)],
                "troughWindowRms": [
                    round(kind_rms[i], 7), round(kind_rms[i+1], 7)],
                "firstTwoWindowEnergyRiseSec": round(rise_s, 3),
                "riseWindowRms": [
                    round(kind_rms[j], 7), round(kind_rms[j+1], 7)],
                "riseMinusCaptionCandidateMs":
                    round((rise_s-kind_cue_s)*1000, 3),
                "asrCandidateMinusRiseMs":
                    round((kind_asr_s-rise_s)*1000, 3),
                "asrCandidate10msWindowRms":
                    round(kind_rms[asr_bin-kind_search_start_bin], 7)
                    if kind_search_start_bin <= asr_bin < kind_search_end_bin
                    else None,
            })
        rows = []
        for idx, (cue, m, asr) in enumerate(zip(cues, authored, heard[61:70])):
            start, end = float(cue["startSec"]), float(cue["endSec"])
            # Source receipt is timing hypothesis. First visible 30fps frame
            # is a mathematical eligibility index, not a decoded pixel check.
            first_frame = int(np.ceil(start*30-1e-8))
            first_eligible = first_frame/30
            if (idx and start < cues[idx-1]["endSec"]-1e-6):
                return refuse("SUFFIX_CUES_OVERLAPPING_OR_INVALID")
            mfa_start, mfa_end = m[:2]
            if not 0 <= mfa_start < mfa_end <= 824336/24:
                return refuse("SUFFIX_CUES_MFA_WINDOW_INVALID")
            asr_start, asr_end = float(asr["start"]), float(asr["end"])
            # A recognizer onset cannot be audible inside EXACT digital zero
            # unless it extends past its proposed start. That start is wrong,
            # but neither alternative is thereby independently verified.
            claimed_sample = round(asr_start*24000)
            impossible_asr_onset = (
                source_zero_start <= claimed_sample < source_zero_end)
            start_ms = max(0, min(mfa_start, asr_start*1000)-200)
            end_ms = min(824336/24,
                         max(mfa_end, asr_end*1000)+200)
            lo, hi = round(start_ms*24), round(end_ms*24)
            if not 0 <= lo < hi <= 824336:
                return refuse("SUFFIX_CUES_CONTEXT_RANGE_INVALID")
            delta_ms = round((first_eligible-asr_start)*1000, 3)
            rows.append({
                "cueIndex": idx, "captionWord": cue["text"],
                "renderReceiptStartSec": start,
                "firstMathematicallyEligibleVideoFrame": first_frame,
                "firstFrameTimeSec": round(first_eligible, 6),
                "frameQuantizationDelayMs":
                    round((first_eligible-start)*1000, 3),
                "authoredMfaCandidateWindowMs": [
                    round(mfa_start, 3), round(mfa_end, 3)],
                "asrCandidateWindowSec": [asr_start, asr_end],
                "frameStartMinusAsrStartMs": delta_ms,
                "asrClaimedOnsetDuringVerifiedPcmZero":
                    impossible_asr_onset,
                "absoluteModelDifferenceExceeds100ms":
                    abs(delta_ms)>100,
                "sourceReviewPcmRange": [lo, hi],
                "sourceReviewPcmSha256": digest(pcm[lo*2:hi*2]),
                "decision": (
                    "PHYSICALLY_IMPOSSIBLE_ASR_ONSET_REVIEW_HOLD"
                    if impossible_asr_onset else
                    "MODEL_BOUNDARY_DIFFERENCE_REVIEW_HOLD"),
            })
        return {**base, "status": "RESEARCH_ARCHIVED_SUFFIX_WORD_REVIEW_HOLD",
                "sourceWavSha256": SOURCE_WAV_REFERENCE,
                "mfaAlignmentSha256": MFA_SOURCE_ALIGNMENT_SHA,
                "asrReceiptSha256": POSE_ASR_RECEIPT_SHA,
                "archivedFilmSha256": ARCHIVED_TIMED_NATIVE_VIDEO_SHA,
                "renderReceiptSha256": ARCHIVED_TIMED_NATIVE_RECEIPT_SHA,
                "cueCount": len(rows),
                "impossibleAsrOnsetCount": sum(
                    r["asrClaimedOnsetDuringVerifiedPcmZero"] for r in rows),
                "modelDifferenceOver100MsCount": sum(
                    r["absoluteModelDifferenceExceeds100ms"] for r in rows),
                "sourceDigitalZeroSamples": [source_zero_start, source_zero_end],
                "postSilenceSustainedSignalRise": signal_rise,
                "kindSourceEnergyCorridor": kind_check,
                "cueReviewRows": rows,
                "reviewerDecisionRequired": True,
                "caution": "Do not infer correct word, phoneme, caption timing "
                           "or rendering from ASR/MFA agreement or frame "
                           "eligibility math. This is the historical film ONLY."}
    except (ValueError, TypeError, KeyError, IndexError, OSError, EOFError,
            wave.Error, UnicodeError):
        return refuse("SUFFIX_CUES_SOURCE_REPORT_PARSE_FAILED")


# First-party Scene4 CleanPanel v2b film from the owner's archived library
# package, not an approved/published/recent-revision identity.
REVISED_SCENE4_V2B_FILM_SHA = "3c4e91b37958f1e86b6a04486933bbfc719bf6a196203711d6421eca58b70d31"
REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA = "f0057c19c9d06b8a2f3c6d8fec948ca4555966114579fd1a48b0bcfccc84aa98"
# Independently acquired from owner's actual first-party Oct 17 research ZIP,
# with original WAV, story, ZIP CRC and all SHA256SUMS verified. Not approved.
REVISED_SCENE4_SEQUENTIAL_FILM_SHA = "45f86dad98f82dbe0e7e21f831529a8bc4256a8a053bd74a94c5666d03a5e122"
REVISED_SCENE4_LEGIBLE_FILM_SHA = "07e808e35a82294fe8e1c0006b227f6d9435885dfd16daeb78d318edde027769"
REVISED_FULL_DECODED_AAC_PCM_SHA = "05ebaeeb3d6e9a7c933c2c8f0a67a94359592333a090414dac6085d1c60c08bc"
REVISED_AAC_PACKET_TUPLE_SHA = "421f007430fa50e82c9af793999551afbca0a5bcde7ca6fa9a18b2d7a510bb61"



def compare_revised_aac_packet_timeline(archived_packets, revised_packets,
                                        archived_adts_sha, revised_adts_sha):
    """One source-timeline comparison, not a voice/film release oracle.

    AAC payload bytes are a different assertion from container PTS/DTS/
    duration metadata. Require both; don't allow an audio-copy receipt to
    conceal one altered AAC packet's advertised presentation duration.
    """
    base = {"schema": SCHEMA, "mayPublish": False, "audioCraftApproved": False,
            "wordTimingCalibrated": False, "pronunciationVerified": False,
            "revisedFilmVerifiedForRelease": False,
            "originalAudioOrFilmModified": False}
    def reject(reason):
        return {**base, "status": "HOLD", "errors": [reason]}
    if (not isinstance(archived_adts_sha, str)
            or archived_adts_sha != REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA
            or not isinstance(revised_adts_sha, str)
            or revised_adts_sha != REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA):
        return reject("REVISED_AUDIO_ADTS_PAYLOAD_NOT_PINNED_OR_IDENTICAL")
    if (not isinstance(archived_packets, list)
            or not isinstance(revised_packets, list)
            or not 100 <= len(archived_packets) <= 10000
            or len(archived_packets) != len(revised_packets)):
        return reject("REVISED_AUDIO_PACKET_COUNT_INVALID")
    fields = ("pts", "dts", "duration", "size")
    def canonical(rows):
        clean = []
        prior = None
        for row in rows:
            if (not isinstance(row, dict)
                    or not set(fields).issubset(row)
                    or set(row) - set(fields) - {"side_data_list"}):
                raise ValueError("PACKET_FIELDS_INVALID")
            x = {}
            for f in fields:
                v = row[f]
                # ffprobe emits string-formatted packet size, integers for
                # most timestamp fields. Don't parse booleans or floats.
                if isinstance(v, bool) or isinstance(v, (list, dict)):
                    raise ValueError("PACKET_FIELDS_INVALID")
                if isinstance(v, str):
                    if not v.isdecimal():raise ValueError("PACKET_FIELDS_INVALID")
                    v = int(v)
                if not isinstance(v, int):
                    raise ValueError("PACKET_FIELDS_INVALID")
                x[f] = v
            # AAC priming/skip side data can change decoding without
            # changing encoded bytes or pts. FFprobe includes it even when
            # -show_entries specifies packet scalar fields: compare it too.
            side = row.get("side_data_list", [])
            if not isinstance(side, list) or len(side) > 4:
                raise ValueError("PACKET_SIDE_DATA_INVALID")
            x["sideData"] = []
            for item in side:
                expected = ("side_data_type", "skip_samples",
                            "discard_padding", "skip_reason", "discard_reason")
                if (not isinstance(item, dict)
                        or set(item) != set(expected)
                        or item["side_data_type"] != "Skip Samples"
                        or any(isinstance(item[k], bool)
                               or not isinstance(item[k], int)
                               or item[k] < 0 or item[k] > 1024
                               for k in expected[1:])):
                    raise ValueError("PACKET_SIDE_DATA_INVALID")
                x["sideData"].append({
                    "type": item["side_data_type"],
                    "skipSamples": item["skip_samples"],
                    "discardPadding": item["discard_padding"],
                    "skipReason": item["skip_reason"],
                    "discardReason": item["discard_reason"],
                })
            if (x["duration"] <= 0 or x["duration"] > 1024
                    or x["size"] <= 0 or x["size"] > 100000
                    or x["dts"] != x["pts"]
                    or (prior is not None and
                        x["pts"] != prior["pts"] + prior["duration"])):
                raise ValueError("PACKET_TIME_SEQUENCE_INVALID")
            clean.append(x)
            prior = x
        return clean
    try:
        a, b = canonical(archived_packets), canonical(revised_packets)
    except (TypeError, ValueError, OverflowError):
        return reject("REVISED_AUDIO_PACKET_TIMESTAMP_OR_SCHEMA_INVALID")
    differences = []
    for idx, (left, right) in enumerate(zip(a, b)):
        if left != right:
            differences.append({
                "packetIndex": idx,
                "archived": left,
                "revised": right,
                "revisedMinusArchivedDurationSamples":
                    right["duration"] - left["duration"],
                "revisedMinusArchivedDurationMs": round(
                    (right["duration"]-left["duration"])*1000/24000, 6),
            })
    return {
        **base, "status": ("RESEARCH_REVISED_AAC_METADATA_MISMATCH_HOLD"
                           if differences else
                           "RESEARCH_REVISED_AAC_BITSTREAM_TIMELINE_MATCH_HOLD"),
        "sourceArchivedFilmSha256": ARCHIVED_TIMED_NATIVE_VIDEO_SHA,
        "revisedFilmSha256": REVISED_SCENE4_V2B_FILM_SHA,
        "sourceAudioAdtsSha256": REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA,
        "revisedAudioAdtsSha256": revised_adts_sha,
        "bitExactAacPayloadPreserved": True,
        "audioPacketCount": len(a),
        "packetTimelineMetadataEqual": not bool(differences),
        "timelineMetadataDisagreementCount": len(differences),
        "packetTimelineDifferences": differences[:32],
        "nominalAudioSampleRateHz": 24000,
        "originalTotalPacketDurationSamplesIncludingPriming":
            sum(x["duration"] for x in a),
        "revisedTotalPacketDurationSamplesIncludingPriming":
            sum(x["duration"] for x in b),
        "archivedLastPacketPresentationEndSample":
            a[-1]["pts"] + a[-1]["duration"],
        "revisedLastPacketPresentationEndSample":
            b[-1]["pts"] + b[-1]["duration"],
        "decodedPcmSamplesNotInferredFromPacketDuration": True,
        "qualifiedListeningStillRequired": True,
        "caution": "Byte-identical AAC alone does not prove MP4 packet duration "
                   "or PTS identity. Metadata mismatch is not evidence of "
                   "audible loss or wrong phonemes. No release approval.",
    }


def audit_revised_aac_packet_timeline_files(archived_path, revised_path):
    """Opt-in SHA-pinned archived/revised packet and payload research screen."""
    import subprocess
    def reject(reason):
        return {"schema": SCHEMA, "status": "HOLD", "errors": [reason],
                "mayPublish": False, "pronunciationVerified": False,
                "wordTimingCalibrated": False}
    try:
        paths = (Path(archived_path), Path(revised_path))
        if any(p.is_symlink() or not p.is_file()
               or not 1000 <= p.stat().st_size <= 10000000 for p in paths):
            return reject("REVISED_AUDIO_PINNED_FILMS_NOT_PRESENT")
        raw = [p.read_bytes() for p in paths]
        if (digest(raw[0]) != ARCHIVED_TIMED_NATIVE_VIDEO_SHA
                or digest(raw[1]) != REVISED_SCENE4_V2B_FILM_SHA):
            return reject("REVISED_AUDIO_FILM_SHA_CHANGED")
        packet_lists, audio_hashes = [], []
        for p in paths:
            probe = subprocess.run([
                "ffprobe", "-v", "error", "-select_streams", "a:0",
                "-show_entries", "packet=pts,dts,duration,size:"
                                 "packet_side_data=side_data_type,skip_samples,"
                                 "discard_padding,skip_reason,discard_reason",
                "-of", "json", str(p)], capture_output=True,
                timeout=30, check=False)
            if probe.returncode or len(probe.stdout) > 2000000:
                return reject("REVISED_AUDIO_FFPROBE_FAILED")
            obj = json.loads(probe.stdout)
            packet_lists.append(obj["packets"])
            audio = subprocess.run([
                "ffmpeg", "-nostdin", "-v", "error", "-xerror", "-i", str(p),
                "-map", "0:a:0", "-c:a", "copy", "-f", "adts", "-"],
                capture_output=True, timeout=30, check=False)
            if audio.returncode or not 10000 < len(audio.stdout) <= 3000000:
                return reject("REVISED_AUDIO_FFMPEG_ADTS_EXTRACTION_FAILED")
            audio_hashes.append(digest(audio.stdout))
        if any(digest(p.read_bytes()) != expected
               for p, expected in zip(paths,
                   (ARCHIVED_TIMED_NATIVE_VIDEO_SHA, REVISED_SCENE4_V2B_FILM_SHA))):
            return reject("REVISED_AUDIO_FILM_CHANGED_DURING_READ")
        result = compare_revised_aac_packet_timeline(
            packet_lists[0], packet_lists[1], *audio_hashes)
        result["physicalFfprobeAndFfmpegBothExecuted"] = True
        result["originalAndRevisedSourceBytesRehashedAfterProbe"] = True
        return result
    except (OSError, UnicodeError, ValueError, TypeError, KeyError,
            subprocess.TimeoutExpired):
        return reject("REVISED_AUDIO_CONTAINER_PROBE_UNREADABLE")


# Newer Lane3 first-party opt-in phone-footnotes film: UNAPPROVED research.
REVISED_SCENE4_PHONE_FOOTNOTES_FILM_SHA = "7a3440aab731082233cb5f700fd40b030c1de0d4ee3d6b011b38e348a98f47c9"


def audit_kind_spectral_transition_research(source_raw):
    """Source-locked consonant-like broadband event; NOT a phone or word.

    The source at 31.59-31.60s falls into a short RMS trough. This distinct
    feature test measures two subsequent 10ms high-band FFT windows, then
    separately requires sustained voiced-amplitude continuation. It cannot
    determine whether the transient is /k/, another consonant, or an artifact.
    The first-party ASR's 'kind' 31.74s hypothesis is only a comparison.
    All possible outcomes remain research-only and publishing HOLD.
    """
    base = {"schema": SCHEMA, "mayPublish": False,
            "pronunciationVerified": False, "phonemeIdentityVerified": False,
            "wordTimingCalibrated": False, "captionTimingApproved": False,
            "independentListeningVerified": False,
            "originalAudioModified": False, "researchOnly": True}
    def refuse(why):
        return {**base, "status": "HOLD", "errors": [why]}
    if not isinstance(source_raw, bytes) or digest(source_raw) != SOURCE_WAV_REFERENCE:
        return refuse("KIND_BURST_ORIGINAL_WAV_SHA_CHANGED")
    try:
        with wave.open(io.BytesIO(source_raw), "rb") as audio:
            if (audio.getnchannels(), audio.getsampwidth(),
                    audio.getframerate(), audio.getnframes(),
                    audio.getcomptype()) != (1, 2, 24000, 824336, "NONE"):
                return refuse("KIND_BURST_ORIGINAL_WAV_FORMAT_INVALID")
            pcm = audio.readframes(audio.getnframes())
        if len(pcm) != 824336*2:
            return refuse("KIND_BURST_TRUNCATED_ORIGINAL_PCM")
        source = np.frombuffer(pcm, "<i2").astype(np.float64)/32768
        # Search is intentionally narrow and frozen to one source utterance,
        # not a generic learned phoneme detector or arbitrary speaker.
        bins = {}
        hann = np.hanning(240)
        fft_freq = np.fft.rfftfreq(240, d=1/24000)
        high_band = (fft_freq >= 1400) & (fft_freq <= 8000)
        for number in range(3154, 3181):
            chunk = source[number*240:(number+1)*240]
            if len(chunk) != 240:
                return refuse("KIND_BURST_CONTEXT_TRUNCATED")
            rms = float(np.sqrt(np.mean(chunk*chunk)))
            centered = chunk-np.mean(chunk)
            spectrum = np.abs(np.fft.rfft(centered*hann))**2
            denom = float(np.sum(spectrum))
            fraction = float(np.sum(spectrum[high_band])/denom) if denom>1e-18 else 0.0
            bins[number] = {"rms": rms, "highBandPowerFraction": fraction}
        event = None
        for j in range(3159, 3170):
            # Paired trough -> two broadband nonzero frames -> separate
            # sustained energy rise. A single injected spike cannot pass.
            trough = all(bins[k]["rms"] < 0.006 for k in (j-2,j-1))
            burst = all(bins[k]["rms"] >= 0.012 and
                        bins[k]["highBandPowerFraction"] >= 0.12
                        for k in (j,j+1))
            post = next((k for k in range(j+2,min(j+10,3180))
                         if bins[k]["rms"]>=0.06 and bins[k+1]["rms"]>=0.06),
                        None)
            if trough and burst and post is not None and j/100 < 31.67:
                event=(j,post)
                break
        selection = None if event is None else {
            "firstBroadbandWindowSec": event[0]/100,
            "sustainedEnergyContinuationSec": event[1]/100,
            "precedingTwoRms": [round(bins[x]["rms"],7)
                                for x in (event[0]-2,event[0]-1)],
            "twoBroadbandRms": [round(bins[x]["rms"],7)
                                for x in (event[0],event[0]+1)],
            "twoHighBandFractions": [round(bins[x]["highBandPowerFraction"],5)
                                     for x in (event[0],event[0]+1)],
            "asrHypothesisMinusEventMs": round((31.74-event[0]/100)*1000,3),
            "eligible30FpsFrameAfterEvent": int(np.ceil(event[0]*.3-1e-8)),
        }
        return {**base,
                "status": ("RESEARCH_BROADBAND_TRANSITION_CANDIDATE_HOLD"
                           if event is not None else
                           "RESEARCH_NO_CALIBRATED_BROADBAND_TRANSITION_HOLD"),
                "sourceWavSha256": SOURCE_WAV_REFERENCE,
                "windowSizeMs": 10, "bandHz": [1400,8000],
                "spectralPowerFractionThreshold": 0.12,
                "twoWindowRmsThreshold": 0.012,
                "pairedPrecedingTroughRmsMaxExclusive": 0.006,
                "twoWindowPostRmsThreshold": 0.06,
                "firstPartyAsrKindHypothesisSec": 31.74,
                "firstPartyMfaKindHypothesisSec": 31.58,
                "actualWordOrPhonemeVerified": False,
                "highFrequencyTransitionDetected": event is not None,
                "sourceContextPcmSha256": digest(pcm[3154*480:3181*480]),
                "sourceContextSec": [31.54,31.81],
                "candidate": selection,
                "caution": "A correlated broadband transient is not "
                           "proof of /k/, correct text, phonetic start or "
                           "the right caption cut; ASR/MFA remain hypotheses."}
    except (OSError, ValueError, TypeError, wave.Error, FloatingPointError):
        return refuse("KIND_BURST_ORIGINAL_AUDIO_PARSE_FAILED")


def audit_revised_caption_voice_gaps(source_raw, frame_ink_counts,
                                      revised_film_sha, adts_sha):
    """Screen actual frame caption presence against source voice energy.

    Frame counts are caller-supplied. To bind them to the *physical* MP4,
    use audit_revised_caption_voice_gaps_files, never the pure function alone.
    No OCR or word-level phonetics are inferred from bright pixels.
    """
    base = {"schema": SCHEMA, "mayPublish": False,
            "pronunciationVerified": False, "wordTimingCalibrated": False,
            "captionTimingApproved": False, "audioCraftApproved": False,
            "actualPhoneReviewApproved": False,
            "sourceMediaModified": False,
            "physicalVideoFrameDecodeVerifiedByThisFunction": False}
    def reject(reason):
        return {**base, "status": "HOLD", "errors": [reason]}
    permitted = (REVISED_SCENE4_V2B_FILM_SHA,
                 REVISED_SCENE4_PHONE_FOOTNOTES_FILM_SHA,
                 REVISED_SCENE4_SEQUENTIAL_FILM_SHA,
                 REVISED_SCENE4_LEGIBLE_FILM_SHA)
    if (not isinstance(revised_film_sha, str)
            or revised_film_sha not in permitted
            or adts_sha != REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA):
        return reject("CAPTION_GAP_REVISED_FILM_OR_AAC_NOT_SOURCE_PINNED")
    if (not isinstance(source_raw, bytes)
            or digest(source_raw) != SOURCE_WAV_REFERENCE):
        return reject("CAPTION_GAP_ORIGINAL_VOICE_SHA_MISMATCH")
    if (not isinstance(frame_ink_counts, (list, tuple))
            or len(frame_ink_counts) != 94
            or any(type(x) is not int or x < 0 or x > 79000
                   for x in frame_ink_counts)):
        return reject("CAPTION_GAP_FRAME_COUNT_OR_PIXEL_SCHEMA_INVALID")
    try:
        with wave.open(io.BytesIO(source_raw), "rb") as w:
            if ((w.getnchannels(), w.getsampwidth(), w.getframerate(),
                 w.getnframes()) != (1, 2, 24000, 824336)):
                return reject("CAPTION_GAP_SOURCE_FORMAT_INVALID")
            raw = w.readframes(w.getnframes())
        samples = np.frombuffer(raw, "<i2").astype(np.float64)/32768
        blank, voiced, ambiguous = [], [], []
        for idx, count in enumerate(frame_ink_counts):
            f = 937 + idx
            lo, hi = f*800, min((f+1)*800, len(samples))
            chunk = samples[lo:hi]
            if not len(chunk):
                return reject("CAPTION_GAP_SOURCE_FRAME_NOT_PRESENT")
            rms = float(np.sqrt(np.mean(chunk*chunk)))
            entry = {"frame": f, "startSec": round(f/30, 6),
                     "sourceVoiceFrameRms": round(rms, 7),
                     "captionRoiBrightPixels": count}
            if count <= 50:
                blank.append(entry)
                if rms >= .01:
                    voiced.append(entry)
            elif count < 700:
                ambiguous.append(entry)
        summary = {
            "filmSha256": revised_film_sha,
            "sourceWavSha256": SOURCE_WAV_REFERENCE,
            "encodedAudioAdtsSha256": adts_sha,
            "decodedRoi": {"x":60, "y":1290,"width":790, "height":100,
                           "pixelFormat":"gray8","brightThresholdInclusive":135},
            "frameStartInclusive":937,"frameEndInclusive":1030,
            "sourceSamplesPer30FpsFrame":800,
            "sourceRmsVoicedThresholdInclusive":.01,
            "captionConsideredAbsentMaxBrightPixels":50,
            "captionConsideredPresentMinBrightPixels":700,
            "totalFramesChecked":len(frame_ink_counts),
            "visuallyBlankFrames":len(blank),
            "captionPresentFrames":len(frame_ink_counts)-len(blank)-len(ambiguous),
            "ambiguousRoiFrames":ambiguous[:30],
            "blankFramesWithSourceSpeechEnergy":voiced[:30],
            "allVisualBlankFrameMeasurements":blank,
            "phonemeOrWordIdentityVerified":False,
            "audioAndCaptionWordBoundariesCalibrated":False,
            "realDecodedFramesRequiredForProductionClaim":True,
        }
        if ambiguous:
            return {**base, "status":"HOLD",
                    "errors":["CAPTION_GAP_ROI_INDETERMINATE"],
                    **summary}
        if voiced:
            return {**base, "status":"HOLD",
                    "errors":["CAPTION_GAP_VOICE_ACTIVE_WITHOUT_CAPTION"],
                    **summary}
        return {**base,
                "status":"RESEARCH_REVISED_CAPTION_VOICE_GAP_SCREEN_HOLD",
                "caution":"Sample-energy threshold is uncalibrated; true phones "
                          "and words cannot be inferred from brightness or RMS.",
                **summary}
    except (OSError, EOFError, wave.Error, ValueError, TypeError,
            FloatingPointError):
        return reject("CAPTION_GAP_AUDIO_OR_ROI_PARSE_FAILED")


def audit_revised_caption_voice_gaps_files(wav_path, film_path):
    """Physically decode 94 real native H264 frames; source and AAC SHA-gated."""
    import subprocess
    def reject(reason):
        return {"schema":SCHEMA, "status":"HOLD", "errors":[reason],
                "mayPublish":False, "wordTimingCalibrated":False,
                "captionTimingApproved":False}
    try:
        paths = (Path(wav_path), Path(film_path))
        if any(p.is_symlink() or not p.is_file()
               or not 1000 < p.stat().st_size <= lim
               for p,lim in zip(paths,(3000000,10000000))):
            return reject("CAPTION_GAP_REQUIRED_FILES_MISSING_OR_UNSAFE")
        wav_raw, film_raw = (p.read_bytes() for p in paths)
        film_sha = digest(film_raw)
        if (digest(wav_raw) != SOURCE_WAV_REFERENCE or
                film_sha not in (REVISED_SCENE4_V2B_FILM_SHA,
                    REVISED_SCENE4_PHONE_FOOTNOTES_FILM_SHA,
                    REVISED_SCENE4_SEQUENTIAL_FILM_SHA,
                    REVISED_SCENE4_LEGIBLE_FILM_SHA)):
            return reject("CAPTION_GAP_PINNED_SOURCES_CHANGED")
        adts_cmd=["ffmpeg","-nostdin","-v","error","-xerror",
                  "-i",str(paths[1]),"-map","0:a:0","-c:a","copy",
                  "-f","adts","-"]
        audio = subprocess.run(adts_cmd,capture_output=True,timeout=35)
        if audio.returncode != 0 or digest(audio.stdout) != REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA:
            return reject("CAPTION_GAP_ENCODED_AAC_SOURCE_CHANGED")
        # The same elementary AAC bytes can be remuxed with a different
        # presentation timeline. Independently inspect EVERY packet and the
        # complete decoded audio, not just the compressed stream fingerprint.
        full_cmd=["ffmpeg","-nostdin","-v","error","-xerror",
                  "-i",str(paths[1]),"-map","0:a:0","-vn",
                  "-ac","1","-ar","24000","-f","f32le","-"]
        decoded=subprocess.run(full_cmd,capture_output=True,timeout=35)
        if (decoded.returncode != 0 or len(decoded.stdout) != 825344*4
                or digest(decoded.stdout) != REVISED_FULL_DECODED_AAC_PCM_SHA):
            return reject("CAPTION_GAP_FULL_NATIVE_AAC_DECODE_CHANGED")
        packet_cmd=["ffprobe","-v","error","-select_streams","a:0",
                    "-show_packets","-show_entries",
                    "packet=pts,dts,duration,size","-of","json",str(paths[1])]
        packet_run=subprocess.run(packet_cmd,capture_output=True,timeout=35)
        if packet_run.returncode != 0:
            return reject("CAPTION_GAP_NATIVE_AAC_PACKET_PROBE_FAILED")
        raw_packets=json.loads(packet_run.stdout).get("packets")
        if not isinstance(raw_packets,list) or len(raw_packets)!=807:
            return reject("CAPTION_GAP_NATIVE_AAC_PACKET_COUNT_CHANGED")
        packet_tuples=[]
        for packet in raw_packets:
            if not isinstance(packet,dict):
                return reject("CAPTION_GAP_NATIVE_AAC_PACKET_SCHEMA_INVALID")
            try:
                tuple_row=[int(packet[k]) for k in ("pts","dts","duration","size")]
            except (KeyError,TypeError,ValueError,OverflowError):
                return reject("CAPTION_GAP_NATIVE_AAC_PACKET_SCHEMA_INVALID")
            packet_tuples.append(tuple_row)
        packet_sha=digest(json.dumps(packet_tuples,separators=(",",":")).encode())
        if packet_sha != REVISED_AAC_PACKET_TUPLE_SHA:
            return reject("CAPTION_GAP_FULL_NATIVE_AAC_PACKET_TIMELINE_CHANGED")
        cmd=["ffmpeg","-nostdin","-v","error","-xerror",
             "-i",str(paths[1]),"-map","0:v:0",
             "-vf","select='between(n,937,1030)',crop=790:100:60:1290,format=gray",
             "-fps_mode","passthrough","-f","rawvideo","-pix_fmt","gray","-"]
        rendered=subprocess.run(cmd,capture_output=True,timeout=45)
        if rendered.returncode != 0 or len(rendered.stdout)!=94*790*100:
            return reject("CAPTION_GAP_ACTUAL_FRAME_DECODE_FAILED")
        frames=np.frombuffer(rendered.stdout, np.uint8).reshape(94,100,790)
        ink=[int(np.count_nonzero(f>=135)) for f in frames]
        if digest(paths[0].read_bytes())!=SOURCE_WAV_REFERENCE or digest(paths[1].read_bytes())!=film_sha:
            return reject("CAPTION_GAP_MEDIA_CHANGED_DURING_DECODE")
        result=audit_revised_caption_voice_gaps(
            wav_raw, ink, film_sha, digest(audio.stdout))
        result["kindSourceBroadbandResearch"] = audit_kind_spectral_transition_research(wav_raw)
        result["nativeCompleteAacDecodedSha256"]=digest(decoded.stdout)
        result["nativeAacPacketTimelineSha256"]=packet_sha
        result["nativeFullAudioSampleCount"]=825344
        result["nativeAacPacketCount"]=len(packet_tuples)
        result["fullNativeAacBytesAndPacketTimelineVerified"]=True
        result["independentPhonemeOrWordTimingVerdict"]=False
        result["physicalVideoFrameDecodeVerifiedByThisFunction"]=True
        result["actualDecodedGrayscaleRoiSha256"]=digest(rendered.stdout)
        result["originalAndRevisedSourcesRehashedAfterDecode"]=True
        return result
    except (OSError, ValueError, TypeError, subprocess.TimeoutExpired):
        return reject("CAPTION_GAP_PHYSICAL_DECODE_UNAVAILABLE")


def audit_archived_encoded_audio_sync(source_raw, video_raw, receipt_raw, decoded_pcm_f32le):
    """Screen *original* WAV versus lossy encoded AAC signal, never phonemes.

    Caller supplies physically decoded mono 24kHz float32 PCM; the file-based
    entrypoint below obtains those bytes from SHA-pinned original MP4 using
    FFmpeg. This standalone function does NOT itself prove decode provenance.
    """
    base = {"schema": SCHEMA, "mayPublish": False,
            "pronunciationVerified": False, "phonemeIdentityVerified": False,
            "wordTimingCalibrated": False, "captionTimingApproved": False,
            "audioCraftApproved": False, "actualRevisedFilmReviewed": False,
            "sourceOrEncodedMediaModified": False,
            "decoderRunBoundToNativeFilm": False}
    def refuse(reason):
        return {**base, "status": "HOLD", "errors": [reason]}
    preflight = audit_archived_frame_native_pause_plan(
        source_raw, video_raw, receipt_raw)
    if preflight["status"] != "RESEARCH_FRAME_NATIVE_PAUSE_PLAN_HOLD":
        return refuse("ENCODED_AUDIO_PINNED_SOURCE_PREFLIGHT_FAILED")
    # This is one immutable historical H264/AAC film, not an arbitrary AAC
    # stream. Independent full FFmpeg decode measured EXACTLY 825344 PCM
    # samples; accepting generic encoder padding would conceal truncation.
    if (not isinstance(decoded_pcm_f32le, bytes)
            or len(decoded_pcm_f32le) != 825344*4):
        return refuse("ENCODED_AUDIO_DECODE_LENGTH_INVALID")
    try:
        with wave.open(io.BytesIO(source_raw), "rb") as w:
            original = np.frombuffer(w.readframes(w.getnframes()),
                                     dtype="<i2").astype(np.float64)/32768
        decoded = np.frombuffer(decoded_pcm_f32le,
                                dtype="<f4").astype(np.float64)
        if (not np.all(np.isfinite(decoded))
                or np.max(np.abs(decoded)) > 2.0):
            return refuse("ENCODED_AUDIO_NONFINITE_OR_UNSAFE_PCM")
        if np.std(decoded[:824336]) < 0.005:
            return refuse("ENCODED_AUDIO_ACTIVE_SIGNAL_MISSING")
        # A waveform can have excellent zero-lag correlation and still be
        # dangerously hard-clipped after encoder gain staging. AAC float32
        # samples at/above full-scale are physically unsafe even if unchanged
        # word timing is demonstrated. True/inter-sample peaks need separate
        # ITU/EBU loudness tooling; these figures are SAMPLE peaks only.
        decoded_peak = float(np.max(np.abs(decoded)))
        original_peak = float(np.max(np.abs(original)))
        if decoded_peak >= 1.0:
            return refuse("ENCODED_AUDIO_FULL_SCALE_PCM_PEAK_HOLD")
        original_rms = float(np.sqrt(np.mean(original*original)))
        decoded_rms = float(np.sqrt(np.mean(decoded[:len(original)]**2)))
        if not (np.isfinite(original_rms) and original_rms > 0
                and np.isfinite(decoded_rms) and decoded_rms > 0):
            return refuse("ENCODED_AUDIO_GLOBAL_RMS_INVALID")
        gain_db = float(20*np.log10(decoded_rms/original_rms))
        # Correlation cannot detect DC injection: Pearson correlation of a
        # voiced waveform and that same waveform plus 0.05 is still ~1.0.
        # Inspect one-second PCM means from the PHYSICALLY decoded soundtrack.
        # These are source/encoded headroom diagnostics, NOT acoustic phoneme
        # verification, perceptual sound judgments, or automatic filter consent.
        dc_bins = []
        for lo in range(0, len(original), 24000):
            hi = min(lo+24000, len(original))
            a, b = original[lo:hi], decoded[lo:hi]
            source_bin_rms = float(np.sqrt(np.mean(a*a)))
            encoded_bin_rms = float(np.sqrt(np.mean(b*b)))
            active = source_bin_rms >= .01
            src_mean = float(np.mean(a))
            enc_mean = float(np.mean(b))
            source_bias = (active and abs(src_mean) >= .005
                           and abs(src_mean)/source_bin_rms >= .2)
            encoded_bias = (active and abs(enc_mean) >= .02
                            and abs(enc_mean)/max(encoded_bin_rms, 1e-12) >= .2)
            dc_bins.append({
                "startSec": round(lo/24000, 6),
                "endSec": round(hi/24000, 6),
                "activeBySourceRmsOnly": bool(active),
                "sourceMeanFullScale": round(src_mean, 7),
                "encodedMeanFullScale": round(enc_mean, 7),
                "sourceDcOverRms": round(
                    abs(src_mean)/max(source_bin_rms, 1e-12), 5),
                "encodedDcOverRms": round(
                    abs(enc_mean)/max(encoded_bin_rms, 1e-12), 5),
                "sourcePositiveOrNegativeBiasFlag": bool(source_bias),
                "encodedPositiveOrNegativeBiasFlag": bool(encoded_bias),
            })
        biased = [x for x in dc_bins if x["encodedPositiveOrNegativeBiasFlag"]]
        source_biased = [x for x in dc_bins
                         if x["sourcePositiveOrNegativeBiasFlag"]]
        dc_research = {
            "method": "SOURCE_PINNED_WAV_VS_ACTUALLY_DECODED_AAC_ONE_SECOND_MEANS",
            "researchOnlyThresholdsNotCalibrated": True,
            "intervalCount": len(dc_bins),
            "activeSourceIntervals": sum(x["activeBySourceRmsOnly"] for x in dc_bins),
            "sourceBiasedIntervals": len(source_biased),
            "encodedBiasedIntervals": len(biased),
            "dcBiasRequiresReview": len(biased) >= 3,
            "sourceMayAlreadyCarryBias": len(source_biased) >= 3,
            "encodedDcOverRmsReviewThreshold": .2,
            "encodedAbsoluteMeanReviewThreshold": .02,
            "originalVoiceOrFilmModified": False,
            "automaticHighpassOrGainChangeApproved": False,
            "phonemeOrListeningQualityProven": False,
            "oneSecondIntervals": dc_bins,
        }
        gain_diagnostics = {
            "dcOffsetResearch": dc_research,
            "method": "SOURCE_PCM16_VS_DECODED_AAC_F32LE_SAMPLE_PEAK_AND_GLOBAL_RMS",
            "sampleRateHz": 24000,
            "comparedSourceSamples": len(original),
            "sourceSamplePeakDbFS": round(
                20*np.log10(max(original_peak, 1e-15)), 3),
            "encodedDecodedSamplePeakDbFS": round(
                20*np.log10(max(decoded_peak, 1e-15)), 3),
            "sourceGlobalRms": round(original_rms, 7),
            "decodedGlobalRms": round(decoded_rms, 7),
            "encodedVsSourceRmsGainDb": round(gain_db, 3),
            "encodedSamplePeakBelowFullScale": True,
            "ebuR128TruePeakMeasuredByThisAudit": False,
            "ebuR128IntegratedLoudnessMeasuredByThisAudit": False,
            "gainIntentIndependentlyApproved": False,
            "creativeLoudnessOrNaturalnessApproved": False,
        }
        # Distinct source-active windows spanning the whole original take,
        # avoiding the documented 3.44s all-digital-zero source-card hold.
        # A high PCM correlation checks signal/time identity; it cannot
        # identify chemical phones or prove a word's first audible sample.
        anchors = ((1.0, 3.0), (6.0, 9.0), (12.0, 15.0),
                   (20.0, 24.0), (25.5, 27.3), (31.25, 33.7))
        records = []
        for start, end in anchors:
            lo, hi = round(start*24000), round(end*24000)
            a, b = original[lo:hi], decoded[lo:hi]
            if (len(a) != hi-lo or len(b) != hi-lo
                    or np.std(a) < 0.005 or np.std(b) < 0.005):
                return refuse("ENCODED_AUDIO_ANCHOR_SPEECH_SIGNAL_MISSING")
            zero_lag_corr = float(np.corrcoef(a, b)[0, 1])
            # Small, fixed ±40ms 10ms-hop RMS-envelope lag screen.
            # Do not turn its coarse lag into per-word boundary accuracy.
            def envelope(x):
                n = len(x)//240
                return np.sqrt(np.mean(x[:n*240].reshape(n, 240)**2,
                                       axis=1))
            ea, eb = envelope(a), envelope(b)
            lag_scores = []
            for lag in range(-4, 5):
                if lag < 0:
                    x, y = ea[-lag:], eb[:lag]
                elif lag > 0:
                    x, y = ea[:-lag], eb[lag:]
                else:
                    x, y = ea, eb
                score = (float(np.corrcoef(x, y)[0, 1])
                         if np.std(x)>1e-8 and np.std(y)>1e-8
                         else -1.0)
                lag_scores.append((score, lag))
            peak_score, best_lag = max(lag_scores)
            records.append({
                "windowSeconds": [start, end],
                "originalSourcePcmSha256": digest(
                    np.asarray(np.rint(a*32768), dtype="<i2").tobytes()),
                "zeroLagDecodedPcmCorrelation": round(zero_lag_corr, 6),
                "bestEnvelopeLagMs": best_lag*10,
                "bestEnvelopeCorrelation": round(peak_score, 6),
                "signalSyncScreenPass":
                    zero_lag_corr >= 0.95 and abs(best_lag) <= 1,
            })
        # The six anchor checks can miss a substitution in the intervening
        # untested time. Overlapping 500ms windows at 250ms hops now screen
        # the original source end-to-end; silence windows are NOT counted as
        # speech proof, and exact source zero must not acquire fake AAC audio.
        frame_len, hop = 12000, 6000
        rolling_total = rolling_active = rolling_silent = 0
        rolling_quiet = 0
        rolling_worst = (1.0, None)
        rolling_failures, silence_leaks = [], []
        quiet_failures, unresolved_faint = [], []
        for lo in range(0, len(original)-frame_len+1, hop):
            hi = lo+frame_len
            a, b = original[lo:hi], decoded[lo:hi]
            rolling_total += 1
            source_rms = float(np.sqrt(np.mean(a*a)))
            decoded_rms = float(np.sqrt(np.mean(b*b)))
            if source_rms >= 0.01:
                rolling_active += 1
                corr = float(np.corrcoef(a, b)[0, 1])
                if not np.isfinite(corr):
                    return refuse("ENCODED_AUDIO_ROLLING_CORRELATION_NONFINITE")
                if corr < rolling_worst[0]:
                    rolling_worst = (corr, lo/24000)
                if corr < 0.95:
                    rolling_failures.append({
                        "startSeconds": round(lo/24000, 3),
                        "zeroLagCorrelation": round(corr, 6)})
            elif source_rms == 0.0:
                rolling_silent += 1
                if decoded_rms > 0.001:
                    silence_leaks.append({
                        "startSeconds": round(lo/24000, 3),
                        "decodedRms": round(decoded_rms, 6)})
            else:
                # Actual AAC has ten non-silent source windows beneath the
                # old speech threshold. A dropped quiet consonant/word ending
                # could previously pass the six loud anchors and rolling scan.
                # Inaudibly faint/undercalibrated comparisons must HOLD, not
                # turn into synthetic proof of a word or clean narration.
                rolling_quiet += 1
                entry = {"startSeconds": round(lo/24000, 3),
                         "sourceRms": round(source_rms, 8),
                         "decodedRms": round(decoded_rms, 8)}
                if source_rms < 0.00005:
                    unresolved_faint.append({
                        **entry, "reason": "SOURCE_TOO_FAINT_TO_CALIBRATE"})
                elif np.std(b) < 1e-8:
                    quiet_failures.append({
                        **entry, "reason": "QUIET_SOURCE_AUDIO_DROPPED"})
                else:
                    corr = float(np.corrcoef(a, b)[0, 1])
                    if not np.isfinite(corr) or corr < 0.95:
                        quiet_failures.append({
                            **entry, "reason": "QUIET_SOURCE_PCM_MISMATCH",
                            "zeroLagCorrelation": (
                                round(corr, 6) if np.isfinite(corr) else None)})
                    elif corr < rolling_worst[0]:
                        rolling_worst = (corr, lo/24000)
        # A hop grid does not necessarily divide the WAV's final sample
        # exactly. Explicitly check the otherwise unmeasured trailing samples;
        # never let an added tail burst hide behind AAC encoder padding.
        last_covered = ((len(original)-frame_len)//hop)*hop + frame_len
        tail_start = min(len(original), last_covered)
        tail_original = original[tail_start:]
        tail_encoded = decoded[tail_start:len(original)]
        tail_source_rms = (float(np.sqrt(np.mean(tail_original**2)))
                           if len(tail_original) else 0.0)
        tail_decoded_rms = (float(np.sqrt(np.mean(tail_encoded**2)))
                            if len(tail_encoded) else 0.0)
        tail_correlation = None
        tail_pass = True
        if tail_source_rms >= 0.01:
            tail_correlation = float(np.corrcoef(
                tail_original, tail_encoded)[0, 1])
            tail_pass = np.isfinite(tail_correlation) and tail_correlation >= 0.95
        elif tail_source_rms == 0.0:
            tail_pass = tail_decoded_rms <= 0.001
        else:
            tail_pass = tail_decoded_rms <= max(0.001, tail_source_rms*6)
        tail_scan = {
            "sourceStartSample": tail_start,
            "sampleCount": len(tail_original),
            "sourceRms": round(tail_source_rms, 7),
            "decodedRms": round(tail_decoded_rms, 7),
            "zeroLagCorrelation": (
                round(tail_correlation, 6)
                if tail_correlation is not None else None),
            "unmeasuredSourceTailRejected": not bool(tail_pass),
        }
        scan = {
            "sourceWavEverySampleScreened": True,
            "finalSourceTailScreen": tail_scan,
            "overlappingWindowDurationMs": 500,
            "overlappingWindowHopMs": 250,
            "minimumActiveSourceRms": 0.01,
            "minimumActiveSignalCorrelation": 0.95,
            "screenedWindowCount": rolling_total,
            "speechActiveWindowCount": rolling_active,
            "quietNonzeroSourceWindowCount": rolling_quiet,
            "quietNonzeroScreenThresholdRms": 0.00005,
            "quietWindowCorrelationThreshold": 0.95,
            "quietWindowFailures": quiet_failures,
            "unresolvedUltraFaintSourceWindows": unresolved_faint,
            "totalWindowsAccountedFor": (rolling_active+rolling_quiet+
                                         rolling_silent),
            "exactDigitalSilenceWindowCount": rolling_silent,
            "lowestActiveZeroLagPcmCorrelation":
                round(rolling_worst[0], 6),
            "lowestActiveCorrelationWindowStartSec":
                rolling_worst[1],
            "belowThresholdWindows": rolling_failures,
            "unexpectedAudioDuringExactSourceSilence": silence_leaks,
        }
        if rolling_active < 80 or rolling_silent < 6:
            return {**base, "status": "HOLD",
                    "errors": ["ENCODED_AUDIO_ROLLING_SOURCE_COVERAGE_INSUFFICIENT"],
                    "rollingSignalScreen": scan}
        if rolling_failures or silence_leaks or quiet_failures or unresolved_faint or not tail_pass:
            return {**base, "status": "HOLD",
                    "errors": ["ENCODED_AUDIO_LOCALIZED_SIGNAL_OR_SILENCE_HOLD"],
                    "sourceWavSha256": SOURCE_WAV_REFERENCE,
                    "filmSha256": ARCHIVED_TIMED_NATIVE_VIDEO_SHA,
                    "rollingSignalScreen": scan}
        if not all(row["signalSyncScreenPass"] for row in records):
            return {**base, "status": "HOLD",
                    "errors": ["ENCODED_AUDIO_SIGNAL_LAG_OR_CORRELATION_HOLD"],
                    "sourceWavSha256": SOURCE_WAV_REFERENCE,
                    "filmSha256": ARCHIVED_TIMED_NATIVE_VIDEO_SHA,
                    "diagnosticWindows": records,
                    "rollingSignalScreen": scan}
        return {**base, "status": "RESEARCH_ARCHIVED_ENCODED_AUDIO_SYNC_HOLD",
                "sourceWavSha256": SOURCE_WAV_REFERENCE,
                "filmSha256": ARCHIVED_TIMED_NATIVE_VIDEO_SHA,
                "renderReceiptSha256": ARCHIVED_TIMED_NATIVE_RECEIPT_SHA,
                "decodedF32leSha256": digest(decoded_pcm_f32le),
                "sourceSampleCount": 824336,
                "decodedAacSampleCount": len(decoded),
                "sampleRateHz": 24000,
                "gainAndHeadroomResearch": gain_diagnostics,
                "testedRealSignalWindows": len(records),
                "diagnosticWindows": records,
                "rollingSignalScreen": scan,
                "decodedSignalOnlyTimedContinuity": True,
                "independentlyVerifiedPhoneticContent": False,
                "caution": "Signal correlation is NOT source phoneme identity, "
                           "caption/word alignment, craft, AAC sample identity "
                           "or revised-final-film verification."}
    except (ValueError, TypeError, OSError, EOFError, wave.Error,
            FloatingPointError):
        return refuse("ENCODED_AUDIO_SIGNAL_REVIEW_PARSE_FAILED")


def audit_archived_encoded_audio_sync_files(wav_path, video_path, receipt_path):
    """Decode actual pinned original MP4 audio in a bounded read-only mode."""
    import subprocess
    base = {"schema": SCHEMA, "status": "HOLD", "mayPublish": False,
            "decoderRunBoundToNativeFilm": False}
    try:
        wav, film, receipt = map(Path, (wav_path, video_path, receipt_path))
        sources = ((wav, 3000000), (film, 10000000), (receipt, 50000))
        if any(p.is_symlink() or not p.is_file()
               or not 0 < p.stat().st_size <= cap for p, cap in sources):
            return {**base, "errors": ["ENCODED_AUDIO_FILES_MISSING_OR_UNSAFE"]}
        source_raw, video_raw, receipt_raw = (p.read_bytes() for p, _ in sources)
        if (audit_archived_frame_native_pause_plan(
                source_raw, video_raw, receipt_raw)["status"]
                != "RESEARCH_FRAME_NATIVE_PAUSE_PLAN_HOLD"):
            return {**base, "errors": ["ENCODED_AUDIO_PINNED_SOURCE_PREFLIGHT_FAILED"]}
        command = ["ffmpeg", "-nostdin", "-v", "error", "-xerror",
                   "-i", str(film), "-map", "0:a:0", "-vn", "-ac", "1",
                   "-ar", "24000", "-f", "f32le", "-"]
        run = subprocess.run(command, capture_output=True, timeout=45,
                             check=False)
        if run.returncode != 0:
            return {**base, "errors": ["ENCODED_AUDIO_FFMPEG_DECODE_FAILED"]}
        # Catch mutation between initial digest and decoder file-open.
        if digest(film.read_bytes()) != ARCHIVED_TIMED_NATIVE_VIDEO_SHA:
            return {**base, "errors": ["ENCODED_AUDIO_MOVIE_CHANGED_DURING_DECODE"]}
        result = audit_archived_encoded_audio_sync(
            source_raw, video_raw, receipt_raw, run.stdout)
        result["decoderRunBoundToNativeFilm"] = True
        result["decoderInvocation"] = "ffmpeg -xerror mono 24000Hz float32le"
        return result
    except (OSError, ValueError, subprocess.TimeoutExpired):
        return {**base, "errors": ["ENCODED_AUDIO_FFMPEG_OR_FILES_UNREADABLE"]}


def audit_original_pause_audition_pcm(source_raw, candidate_raw, retained_pause_ms):
    """Verify a research-only preview removed ONLY source-proven digital zeros.

    A candidate audio WAV is an offline listening aid, never a production
    edit. Any change to one speech PCM sample, source offset, WAV format or
    pause-cut size rejects it. All downstream captions remain uncalibrated.
    """
    base = {"schema": SCHEMA, "mayPublish": False,
            "captionTimingApproved": False, "wordTimingCalibrated": False,
            "pronunciationVerified": False, "phonemeIdentityVerified": False,
            "sourceMasterModified": False, "videoModified": False,
            "previewApprovedForProduction": False,
            "humanListeningDecisionRecorded": False}
    def refuse(reason):
        return {**base, "status": "HOLD", "errors": [reason]}
    if not isinstance(source_raw, bytes) or not isinstance(candidate_raw, bytes):
        return refuse("PAUSE_PREVIEW_AUDIO_BYTES_REQUIRED")
    if digest(source_raw) != SOURCE_WAV_REFERENCE:
        return refuse("PAUSE_PREVIEW_ORIGINAL_WAV_SHA_CHANGED")
    if (type(retained_pause_ms) is not int
            or retained_pause_ms not in (650, 1200, 3440)):
        return refuse("PAUSE_PREVIEW_RETAINED_DURATION_NOT_IN_RESEARCH_SET")
    try:
        with wave.open(io.BytesIO(source_raw), "rb") as original:
            if (original.getnchannels(), original.getsampwidth(),
                    original.getframerate(), original.getcomptype(),
                    original.getnframes()) != (1, 2, 24000, "NONE", 824336):
                return refuse("PAUSE_PREVIEW_ORIGINAL_FORMAT_INVALID")
            full_pcm = original.readframes(original.getnframes())
        if len(full_pcm) != 824336*2:
            return refuse("PAUSE_PREVIEW_ORIGINAL_PCM_TRUNCATED")
        pause_start, pause_end = 663600, 746160
        context_start, context_end = 628800, 775200
        if full_pcm[pause_start*2:pause_end*2] != bytes(
                (pause_end-pause_start)*2):
            return refuse("PAUSE_PREVIEW_EXPECTED_PHYSICAL_SOURCE_SILENCE_MISSING")
        keep_samples = retained_pause_ms * 24
        # The WHOLE cut lies inside authenticated exact-zero PCM, not in
        # speech. Byte identity on both sides rejects pitch, gain, word edits,
        # timing stretch, smoothing that touches nonzero samples, etc.
        cut_start = pause_start + keep_samples
        expected = (full_pcm[context_start*2:cut_start*2]
                    + full_pcm[pause_end*2:context_end*2])
        with wave.open(io.BytesIO(candidate_raw), "rb") as preview:
            if (preview.getnchannels(), preview.getsampwidth(),
                    preview.getframerate(), preview.getcomptype()) != (
                        1, 2, 24000, "NONE"):
                return refuse("PAUSE_PREVIEW_CANDIDATE_FORMAT_INVALID")
            candidate_frames = preview.getnframes()
            actual = preview.readframes(candidate_frames)
        if (candidate_frames != len(expected)//2
                or len(actual) != len(expected)):
            return refuse("PAUSE_PREVIEW_FRAME_COUNT_OR_LENGTH_INVALID")
        if actual != expected:
            return refuse("PAUSE_PREVIEW_NONZERO_VOICE_OR_CUT_OFFSET_CHANGED")
        removed_samples = pause_end-cut_start
        return {**base, "status": "RESEARCH_EXACT_ZERO_PAUSE_AUDITION_HOLD",
                "originalWavSha256": SOURCE_WAV_REFERENCE,
                "candidateWavSha256": digest(candidate_raw),
                "candidatePcmSha256": digest(actual),
                "voicePcmSamplesPreservedExactly": True,
                "sourceOriginalFrameCount": 824336,
                "originalReviewWindowSourceSamples": [context_start, context_end],
                "originalDigitalZeroSourceSamples": [pause_start, pause_end],
                "retainedPauseMs": retained_pause_ms,
                "removedOnlyExactZeroSamples": True,
                "removedZeroSampleCount": removed_samples,
                "removedPauseMs": removed_samples / 24,
                "previewSampleCount": candidate_frames,
                "allPostPauseCaptionOffsetsRemainUnapproved": True,
                "caution": "This validates only exact sample-preserving offline "
                           "audition audio; it DOES NOT authorize pause removal, "
                           "voice phonemes, new word timings, finished film or captions."}
    except (OSError, EOFError, ValueError, wave.Error, TypeError):
        return refuse("PAUSE_PREVIEW_WAV_PARSE_FAILED")


def audit_original_pause_audition_files(original_wav_path, preview_wav_path,
                                        retained_pause_ms):
    """Read-only strict path checks for a source-pinned original audio audition."""
    try:
        paths = ((Path(original_wav_path), 3000000),
                 (Path(preview_wav_path), 1000000))
        if any(p.is_symlink() or not p.is_file()
               or not 0 < p.stat().st_size <= limit for p, limit in paths):
            return hold("PAUSE_PREVIEW_FILES_MISSING_OR_UNSAFE")
        return audit_original_pause_audition_pcm(
            paths[0][0].read_bytes(), paths[1][0].read_bytes(),
            retained_pause_ms)
    except (OSError, TypeError, ValueError):
        return hold("PAUSE_PREVIEW_FILES_UNREADABLE")


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
        if report["status"] == "RESEARCH_ORIGINAL_WORD_REVIEW_QUEUE_HOLD":
            report["scientificNamesAcousticTriage"] = (
                audit_scientific_name_source_triage(
                    *(p.read_bytes() for p, _ in paths)))
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
            zipfile.BadZipFile, zlib.error, UnicodeError) as exc:
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
    p.add_argument("--revised-caption-voice-gap", action="store_true",
                   help="Physically decode pinned revised film subtitle ROI vs original source RMS")
    p.add_argument("--revised-aac-packet-timeline", action="store_true",
                   help="Research only: SHA-pinned archived vs revised AAC packets, not release")
    p.add_argument("--revised-research-film", help="SHA-pinned Scene4 v2b encoded film")
    p.add_argument("--archived-aac-sync-review", action="store_true",
                   help="Original source vs actual decoded archived AAC research screen only")
    p.add_argument("--frame-native-pause-plan", action="store_true",
                   help="Original archived H264/AAC film and 30fps-compatible silence-cut PLAN only")
    p.add_argument("--native-research-film", help="Exact archived unapproved native research MP4")
    p.add_argument("--native-render-receipt", help="Exact corresponding archived render receipt")
    p.add_argument("--original-pause-audition-audit", action="store_true",
                   help="Verify exact-zero offline preview sample preservation; never publish")
    p.add_argument("--pause-preview-wav", help="Source-only sample-preserving audition candidate")
    p.add_argument("--pause-retained-ms", type=int, help="Research-only 650, 1200 or 3440 ms")
    p.add_argument("--original-dead-air-review", action="store_true",
                   help="SHA-pinned 73/70 source-audio 1.2s exact-silence creative review, never auto-cut")
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
    if a.revised_caption_voice_gap:
        if (not a.original_wav or not a.revised_research_film
                or any((a.native_research_film, a.native_render_receipt,
                        a.revised_aac_packet_timeline, a.mfa_receipt,
                        a.mfa_alignment, a.archived_aac_sync_review,
                        a.frame_native_pause_plan, a.original_pause_audition_audit,
                        a.pause_preview_wav, a.pause_retained_ms,
                        a.original_dead_air_review, a.cross_model_timing_review,
                        a.human_review_json, a.mfa_zero_interval_audit,
                        a.asr_zero_onset_audit, a.pose_asr_receipt,
                        a.reference_benchmark_zip, a.reference_target_wav,
                        a.pose_internal_contrasts, a.source_archive))):
            result=hold("CAPTION_GAP_REQUIRES_EXCLUSIVE_ORIGINAL_WAV_AND_REVISED_FILM")
        else:
            result=audit_revised_caption_voice_gaps_files(
                a.original_wav,a.revised_research_film)
    elif a.revised_aac_packet_timeline:
        if (not a.native_research_film or not a.revised_research_film
                or any((a.original_wav, a.mfa_receipt, a.mfa_alignment,
                        a.native_render_receipt, a.archived_aac_sync_review,
                        a.frame_native_pause_plan, a.original_pause_audition_audit,
                        a.pause_preview_wav, a.pause_retained_ms,
                        a.original_dead_air_review, a.cross_model_timing_review,
                        a.human_review_json, a.mfa_zero_interval_audit,
                        a.asr_zero_onset_audit, a.pose_asr_receipt,
                        a.reference_benchmark_zip, a.reference_target_wav,
                        a.pose_internal_contrasts, a.source_archive))):
            result = hold("REVISED_AAC_TIMELINE_REQUIRES_EXCLUSIVE_TWO_FILMS")
        else:
            result = audit_revised_aac_packet_timeline_files(
                a.native_research_film, a.revised_research_film)
    elif a.revised_research_film is not None:
        result = hold("REVISED_AAC_FILM_REQUIRES_EXPLICIT_RESEARCH_MODE")
    elif a.archived_aac_sync_review:
        if (not a.original_wav or not a.native_research_film
                or not a.native_render_receipt
                or any((a.frame_native_pause_plan, a.original_pause_audition_audit,
                        a.original_dead_air_review, a.cross_model_timing_review,
                        a.human_review_json, a.mfa_zero_interval_audit,
                        a.asr_zero_onset_audit, a.pause_preview_wav,
                        a.pause_retained_ms, a.pose_asr_receipt, a.mfa_alignment,
                        a.mfa_receipt, a.source_archive, a.reference_target_wav,
                        a.reference_benchmark_zip, a.pose_internal_contrasts))):
            result = hold("ENCODED_AUDIO_REQUIRES_EXCLUSIVE_ARCHIVED_THREE_INPUTS")
        else:
            result = audit_archived_encoded_audio_sync_files(
                a.original_wav, a.native_research_film, a.native_render_receipt)
    elif a.frame_native_pause_plan:
        if (not a.original_wav or not a.native_research_film
                or not a.native_render_receipt
                or any((a.original_pause_audition_audit, a.original_dead_air_review,
                        a.cross_model_timing_review, a.human_review_json,
                        a.mfa_zero_interval_audit, a.asr_zero_onset_audit,
                        a.pause_preview_wav, a.pause_retained_ms,
                        a.pose_asr_receipt, a.mfa_alignment, a.mfa_receipt,
                        a.source_archive, a.reference_target_wav,
                        a.reference_benchmark_zip, a.pose_internal_contrasts))):
            result = hold("FRAME_PLAN_REQUIRES_THREE_EXCLUSIVE_SOURCE_INPUTS")
        else:
            result = audit_archived_frame_native_pause_files(
                a.original_wav, a.native_research_film, a.native_render_receipt)
    elif a.native_research_film is not None or a.native_render_receipt is not None:
        result = hold("FRAME_PLAN_FILM_RECEIPT_REQUIRE_EXPLICIT_RESEARCH_MODE")
    elif a.original_pause_audition_audit:
        if (not a.original_wav or not a.pause_preview_wav
                or a.pause_retained_ms is None
                or any((a.original_dead_air_review, a.cross_model_timing_review,
                        a.human_review_json, a.asr_zero_onset_audit,
                        a.mfa_zero_interval_audit, a.mfa_alignment,
                        a.pose_asr_receipt, a.mfa_receipt, a.source_archive,
                        a.reference_target_wav, a.reference_benchmark_zip,
                        a.pose_internal_contrasts))):
            result = hold("PAUSE_PREVIEW_REQUIRES_EXCLUSIVE_SOURCE_AND_CANDIDATE")
        else:
            result = audit_original_pause_audition_files(
                a.original_wav, a.pause_preview_wav, a.pause_retained_ms)
    elif a.pause_preview_wav is not None or a.pause_retained_ms is not None:
        result = hold("PAUSE_PREVIEW_ARGUMENTS_REQUIRE_EXPLICIT_AUDIT_MODE")
    elif a.original_dead_air_review:
        if (not a.original_wav or not a.mfa_alignment or not a.pose_asr_receipt
                or any((a.cross_model_timing_review, a.human_review_json,
                        a.mfa_zero_interval_audit, a.asr_zero_onset_audit,
                        a.mfa_receipt, a.source_archive, a.reference_target_wav,
                        a.reference_benchmark_zip, a.pose_internal_contrasts))):
            result = hold("DEAD_AIR_REQUIRES_EXCLUSIVE_ORIGINAL_THREE_SOURCE_MODE")
        else:
            try:
                items = ((Path(a.original_wav), 3000000),
                         (Path(a.mfa_alignment), 100000),
                         (Path(a.pose_asr_receipt), 30000))
                if any(p.is_symlink() or not p.is_file()
                       or not 0 < p.stat().st_size <= cap for p, cap in items):
                    result = hold("DEAD_AIR_ORIGINAL_FILES_MISSING_OR_UNSAFE")
                else:
                    result = audit_original_narration_dead_air(
                        *(p.read_bytes() for p, _ in items))
            except (OSError, TypeError, ValueError):
                result = hold("DEAD_AIR_ORIGINAL_FILES_UNREADABLE")
    elif a.cross_model_timing_review:
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
