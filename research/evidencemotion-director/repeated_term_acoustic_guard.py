"""EvidenceMotion Lane 2: source-specific repeat-pattern research ONLY.

Two similarly spoken terms can both be wrong. Neither spectral matching nor a
confident speech recognizer proves phonemes, stress, intelligibility or release.
"""
import argparse
import hashlib
import io
import json
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
    a=p.parse_args(argv)
    if a.mfa_receipt is not None or a.mfa_alignment is not None:
        if not (a.original_wav and a.mfa_receipt and a.mfa_alignment) or a.source_archive:
            result=hold("ORIGINAL_MFA_MODE_REQUIRES_EXACTLY_THREE_SOURCE_INPUTS")
        else:
            result=audit_original_source(a.original_wav, a.mfa_receipt, a.mfa_alignment)
    elif a.source_archive:
        result=audit(Path(a.source_archive), a.original_wav)
    else:
        result=hold("SOURCE_ARCHIVE_OR_ORIGINAL_WAV_MFA_INPUTS_REQUIRED")
    print(json.dumps(result, indent=2, sort_keys=True, allow_nan=False))
    return 3 if result["status"]=="RESEARCH_REPEATED_TERM_PATTERN_ONLY" else 2


if __name__=="__main__":
    raise SystemExit(main())
