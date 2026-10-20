#!/usr/bin/env python3
"""Source-locked, CPU-only actual-narration ASR pilot. RESEARCH ONLY.

A Whisper transcript is not proof that a name sounds correct. The tool finds
likely script deviations, provides exact word windows, and always reserves
phonetic naturalness for a separately calibrated acoustic/phoneme evaluator.
No audio regeneration, word-stretching, release approval, or user laptop.
"""
import argparse
import difflib
import hashlib
import json
import re
import subprocess
import wave
from pathlib import Path

WAV_SHA="9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435"
MODEL_ID="Systran/faster-whisper-tiny.en"
MODEL_REV="0d3d19a32d3338f10357c0889762bd8d64bbdeba"
MODEL_BIN_SHA="1a5afae06a4db91c975c9a9d78be5cc110ee4ea022ad57d55492e4550e936b2a"
# This is the REVISED actual-source narration, NOT the obsolete R8.05 draft.
LINES=(
 "What makes seven O H different from mitragynine?",
 "This hydroxyl group is a structural difference between seven-hydroxymitragynine and mitragynine.",
 "This molecular structure is built from a verified chemical record, atom by atom.",
 "But the three dimensional pose is computed. It is not footage of a molecule binding to a receptor.",
 "So the picture explains its structure, not what its effects feel like.",
 "That's the kind of detail worth looking closer at."
)
MODEL_LICENCE="MIT"
TARGET_TERMS=("hydroxyl","mitragynine","hydroxymitragynine","receptor")
# Safety-negating words are material even when overall ASR agrees 95%+.
KEY_TERMS=set(TARGET_TERMS)
SAFETY_WORDS={"not","computed","pose","effects","structure"}

def hold(reason):
    raise ValueError("EVIDENCEMOTION_ASR_HOLD: "+reason)

def sha256(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for block in iter(lambda:f.read(1024*1024),b""):
            h.update(block)
    return h.hexdigest()

def source_check(path,expected_sha=WAV_SHA):
    p=Path(path)
    if p.is_symlink() or not p.is_file() or expected_sha!=WAV_SHA or sha256(p)!=WAV_SHA:
        hold("ORIGINAL_WAV_IDENTITY_CHANGED")
    with wave.open(str(p),"rb") as w:
        if (w.getnchannels(),w.getsampwidth(),w.getframerate(),w.getcomptype())!=(1,2,24000,"NONE"):
            hold("SOURCE_AUDIO_FORMAT_DRIFT")
        duration=w.getnframes()/w.getframerate()
    if not 34.3<=duration<=34.4:
        hold("SOURCE_AUDIO_DURATION_DRIFT")
    return duration

def tokens(s):
    s=s.lower()
    s=re.sub(r"\b7\s*[-]?\s*oh\b","seven o h",s)
    s=re.sub(r"\b7\s*[-]?\s*hydroxy","seven hydroxy",s)
    s=re.sub(r"[^a-z0-9\s]"," ",s)
    return s.split()

def comparison(words,duration,model=None):
    if not isinstance(words,list) or not words:
        hold("ACTUAL_ASR_WORDS_REQUIRED")
    result=[]
    last=0.
    for idx,item in enumerate(words):
        if not isinstance(item,dict):
            hold("BAD_ASR_WORD_ITEM")
        try:
            a=float(item["start"]);b=float(item["end"])
        except (ValueError,TypeError,KeyError):
            hold("WORDS_WITHOUT_REAL_TIMESTAMPS")
        if not 0<=a<=b<=duration+.1 or a<last-.15:
            hold("UNTRUSTED_ASR_TIMELINE")
        last=max(last,b)
        text=str(item.get("word",""))
        if text.strip():
            result.append({"start":round(a,3),"end":round(b,3),"word":text,
                           "probability":item.get("probability")})
    emitted=tokens(" ".join(x["word"] for x in result))
    original=tokens(" ".join(LINES))
    if not emitted:
        hold("EMPTY_ASR_TRANSCRIPT")
    matcher=difflib.SequenceMatcher(a=original,b=emitted,autojunk=False)
    missing=[];unexpected=[]
    for op,a0,a1,b0,b1 in matcher.get_opcodes():
        if op in ("replace","delete"):
            missing+=original[a0:a1]
        if op in ("replace","insert"):
            unexpected+=emitted[b0:b1]
    ratio=matcher.ratio()
    suspect=sorted(set(word for word in missing if word in KEY_TERMS))
    safety_missing=sorted(set(word for word in missing if word in SAFETY_WORDS))
    introduced_clinical_words=sorted(set(unexpected)&
        {"cures","withdrawal","proven","safe","treats","opioid","relieves","pain"})
    # Recognition is not pronunciation. Even "hydroxyl" recognized correctly
    # might be audibly unnatural, robotic, or wrongly stressed.
    return {"schema":"ths-actual-source-asr-research-v1",
            "sourceWavSha256":WAV_SHA,
            "expectedScriptLines":list(LINES),
            "recognizedWords":result,
            "recognizedTranscript":" ".join(x["word"] for x in result),
            "expectedWordCount":len(original),
            "recognizedTokenCount":len(emitted),
            "exactScriptTokenAgreement":round(ratio,5),
            "missingOrChangedWords":missing[:50],
            "unexpectedWords":unexpected[:50],
            "atRiskScientificNames":list(TARGET_TERMS),
            "possiblyMisrecognizedScientificTerms":suspect,
            "missingSafetyOrScienceBoundaryWords":safety_missing,
            "unsupportedOrUnexpectedMedicalTerms":introduced_clinical_words,
            "speechRecognizer":model,
            "decision":"AUTO_REVISE_SCRIPT_MISMATCH" if ratio<.92 or suspect or safety_missing or introduced_clinical_words
                       else "SCRIPT_MATCH_CANDIDATE_ONLY",
            "phoneticPronunciationVerified":False,
            "naturalnessVerified":False,
            "wordLevelASRIsAcousticGroundTruth":False,
            "ownerApprovalRequiredForMechanicalReject":False,
            "scienceApproved":False,"craftApproved":False,"mayPublish":False}

def transcribe(audio,revision=None):
    duration=source_check(audio)
    try:
        from faster_whisper import WhisperModel
        from huggingface_hub import snapshot_download
    except ImportError as exc:
        hold("OFFLINE_ASR_DEPENDENCY_UNAVAILABLE: "+type(exc).__name__)
    if revision is not None and revision!=MODEL_REV:
        hold("UNREVIEWED_ASR_MODEL_REVISION")
    sha=MODEL_REV
    if not isinstance(sha,str) or not re.fullmatch(r"[0-9a-f]{40}",sha):
        hold("MUST_RESOLVE_IMMUTABLE_MODEL_COMMIT")
    path=Path(snapshot_download(repo_id=MODEL_ID,revision=sha,
        allow_patterns=["model.bin","config.json","tokenizer.json","vocabulary.*"],
        max_workers=2))
    if not (path/"model.bin").exists():
        hold("PINNED_MODEL_BYTES_MISSING")
    if sha256(path/"model.bin")!=MODEL_BIN_SHA:
        hold("ASR_MODEL_BINARY_HASH_CHANGED")
    model=WhisperModel(str(path),device="cpu",compute_type="int8",cpu_threads=2,
                       num_workers=1)
    # PyAV 19 removed a keyword consumed by faster-whisper 1.2.1. Decode
    # the exact locked WAV through FFmpeg to known 16kHz float32 mono instead
    # of allowing an unpinned decoder API to change the model's input.
    try:
        raw=subprocess.check_output(["ffmpeg","-nostdin","-v","error",
            "-i",str(audio),"-ac","1","-ar","16000",
            "-f","f32le","pipe:1"],timeout=50)
    except (OSError,subprocess.CalledProcessError,subprocess.TimeoutExpired) as exc:
        hold("PINNED_WAV_PCM_RESAMPLE_FAILED:"+type(exc).__name__)
    import numpy as np
    if len(raw)%4 or not raw:hold("INCOMPLETE_ASR_FLOAT_PCM")
    model_input=np.frombuffer(raw,dtype="<f4").copy()
    if not 16000*(duration-.1)<=len(model_input)<=16000*(duration+.1):
        hold("RESAMPLED_AUDIO_DURATION_DRIFT")
    segments,info=model.transcribe(model_input,beam_size=5,
        word_timestamps=True,language="en",vad_filter=False,
        condition_on_previous_text=False)
    words=[{"start":w.start,"end":w.end,"word":w.word,
            "probability":round(w.probability,4) if w.probability is not None else None}
           for seg in segments for w in (seg.words or [])]
    output=comparison(words,duration,model={"id":MODEL_ID,
        "revisionSha":sha,"modelBinarySha256":sha256(path/"model.bin"),
        "engine":"faster-whisper CTranslate2 CPU int8","language":info.language,
        "license":MODEL_LICENCE,
        "resampled16kFloatPcmSha256":hashlib.sha256(raw).hexdigest()})
    return output

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--wav",required=True)
    p.add_argument("--model-revision")
    p.add_argument("--precomputed-words",help="fixture comparison only, never a verified actual-ASR execution")
    p.add_argument("--out",required=True)
    args=p.parse_args()
    if args.precomputed_words:
        dur=source_check(args.wav)
        words=json.loads(Path(args.precomputed_words).read_text())
        result=comparison(words,dur,model=None)
        result["origin"]="PRECOMPUTED_NOT_INDEPENDENT_ASR"
    else:
        result=transcribe(args.wav,args.model_revision)
        result["origin"]="ACTUAL_PINNED_WAV_DECODED_ASR_CPU"
    Path(args.out).write_text(json.dumps(result,indent=2)+"\n")
    print(json.dumps({k:v for k,v in result.items()
         if k not in ("recognizedWords","expectedScriptLines")},indent=2))

if __name__=="__main__":
    main()
