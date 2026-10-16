#!/usr/bin/env python3
"""Make a blind silent-viewer research packet from the exact timed H264 film.

Always keep the questions/stimulus separate from the reviewer answer key.
No invented participants or human comprehension/craft/publishing approval.
"""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

from autonomous_script_asr_research import WAV_SHA
from narration_first_story_map import STORY

SCHEMA="ths-timed-native-soundoff-questionnaire-v1"
QUESTIONS=(
    ("Q1","Which two chemical structures does the video compare?",
     ("THC and CBD","Mitragynine and 7-hydroxymitragynine",
      "Oxygen and hydrogen as two substances","A molecule and a brain receptor"),
     "B","two distinct source-record chemical identities"),
    ("Q2","In the highlighted hydroxyl group, what is the OH made of?",
     ("Only nitrogen","Only carbon","Two oxygen atoms","Oxygen and hydrogen"),
     "D","the plain-language explanation of the hydroxyl group"),
    ("Q3","What does the moving three-dimensional picture actually show?",
     ("A computer-generated illustration, not filmed receptor binding",
      "Direct footage of a molecule binding to a receptor",
      "A measurement of effects in human volunteers",
      "Proof that the brain releases dopamine"),
     "A","computed illustration versus observed physical process"),
    ("Q4","Can the structure picture establish what 7-OH feels like to a person?",
     ("Yes, structure alone proves the experienced effect",
      "Yes, because a PubChem ID establishes human effects",
      "No, structure alone does not establish a person's experience",
      "Yes, because the chemical drawing is moving"),
     "C","the explicit limit on interpreting chemical structure"),
    ("Q5","Which record identifies 7-OH in the source card?",
     ("PubChem CID 3034396","PubChem CID 44301524",
      "Clinical trial NCT44301524","No source is shown"),
     "B","source provenance and exact identifier"),
)

def hold(reason):
    raise ValueError("MUTED_VIEWER_PACKET_HOLD:"+reason)

def digest(path):
    h=hashlib.sha256()
    with Path(path).open("rb") as f:
        for chunk in iter(lambda:f.read(1<<20),b""):
            h.update(chunk)
    return h.hexdigest()

def invoke(args):
    try:
        return subprocess.check_output(args,stderr=subprocess.PIPE,timeout=100)
    except (OSError,subprocess.CalledProcessError,subprocess.TimeoutExpired):
        hold("EXACT_VIDEO_VERIFICATION_OR_REMUX_FAILED")

def verify_sources(movie,receipt,plan,science,story):
    paths=list(map(Path,(movie,receipt,plan,science,story)))
    if any(not p.is_file() or p.is_symlink() for p in paths):
        hold("REAL_REGULAR_INPUT_FILES_REQUIRED")
    filmsha=digest(movie)
    r,p,x,st=[json.loads(path.read_text(encoding="utf8")) for path in paths[1:]]
    if (r.get("videoSha256")!=filmsha
        or p.get("expectedVideoSha256")!=filmsha
        or x.get("encodedH264Sha256")!=filmsha
        or st.get("encodedH264Sha256")!=filmsha
        or r.get("sourceWavSha256")!=WAV_SHA
        or st.get("sourceWavSha256")!=WAV_SHA
        or x.get("receiptSha256")!=digest(receipt)
        or st.get("renderReceiptSha256")!=digest(receipt)
        or x.get("phonePlanSha256")!=digest(plan)
        or st.get("phonePlanSha256")!=digest(plan)
        or r.get("experimentCaptionMode")!="TIMED_RESEARCH"
        or r.get("fps")!=30 or r.get("frames")!=1031
        or r.get("resolution")!=[1080,1920]
        or r.get("mayPublish") is not False
        or p.get("releaseApproved") is not False
        or p.get("status")!="RESEARCH_ONLY"
        or x.get("allNineShotInksIndependentlyRecovered") is not True
        or st.get("nineShotsMapped")!=9
        or st.get("fourActs")!=["QUESTION","EVIDENCE","LIMITS","TAKEAWAY"]
        or st.get("mayPublish") is not False
        or x.get("mayPublish") is not False):
        hold("EXACT_TIMED_FILM_OR_RESEARCH_PROOF_MISMATCH")
    # Matching hashes and matching lists do not establish an exhaustive stimulus.
    # Reuse the original-WAV story contract instead of accepting two forged lists.
    expected_shots=[row[0] for row in STORY]
    for document,field in ((st,"shot"),(p,"id")):
        shots=document.get("shots")
        if (not isinstance(shots,list)
            or any(not isinstance(shot,dict) for shot in shots)
            or [shot.get(field) for shot in shots]!=expected_shots):
            hold("BLIND_STIMULUS_SHOT_ORDER_CHANGED")
    return {"video":filmsha,"receipt":digest(receipt),"phone":digest(plan),
            "science":digest(science),"story":digest(story)}

def grade(responses,key,source_film_sha):
    """Deterministic answer comparison is NOT evidence a person watched film."""
    registered_key={qid:choice for qid,_,_,choice,_ in QUESTIONS}
    if not isinstance(key,dict) or key!=registered_key:
        hold("REGISTERED_FIVE_QUESTION_RUBRIC_REQUIRED")
    if not isinstance(responses,dict) or set(responses)!=set(key):
        hold("REAL_COMPLETE_BLIND_RESPONSE_REQUIRED")
    if (not isinstance(source_film_sha,str) or len(source_film_sha)!=64
        or any(c not in "0123456789abcdefABCDEF" for c in source_film_sha)):
        hold("NO_EXACT_REVIEWED_VIDEO_IDENTITY")
    if any(not isinstance(v,str) or v not in ("A","B","C","D")
           for v in responses.values()):
        hold("INVALID_OR_MISSING_BLIND_CHOICE")
    correct={q:responses[q]==key[q] for q in key}
    return {"sourceFilmSha256":source_film_sha,
            "answersEvaluated":len(correct),"correct":sum(correct.values()),
            "fractionCorrect":sum(correct.values())/len(correct),
            "allCriticalQuestionsCorrect":all(correct.values()),
            "perQuestionCorrect":correct,
            "notAnIndependentViewingProof":True,"mayPublish":False}

def build(movie,receipt,plan,science,story,out):
    paths=verify_sources(movie,receipt,plan,science,story)
    out=Path(out)
    if out.is_symlink() or (out.exists() and any(out.iterdir())):
        hold("FRESH_PACKET_DIRECTORY_REQUIRED")
    if len(QUESTIONS)!=5 or len({q[0] for q in QUESTIONS})!=5:
        hold("EXACT_FIVE_DISTINCT_BLIND_PROMPTS_REQUIRED")
    if any(len(x[2])!=4 or x[3] not in "ABCD" for x in QUESTIONS):
        hold("MISSING_DISTRACTOR_OR_CORRECT_CHOICE")
    out.mkdir(parents=True,exist_ok=True)
    viewer_dir=out/"viewer-only"
    sealed_dir=out/"reviewer-only"
    viewer_dir.mkdir()
    sealed_dir.mkdir()
    silent=viewer_dir/"film-sound-off.mp4"
    invoke(["ffmpeg","-v","error","-nostdin","-y","-i",str(movie),"-map","0:v:0",
            "-an","-c:v","copy","-movflags","+faststart",str(silent)])
    probe=json.loads(invoke(["ffprobe","-v","error","-show_entries",
                             "stream=codec_type,width,height","-of","json",str(silent)]))
    tracks=probe.get("streams",[])
    if (len(tracks)!=1 or tracks[0].get("codec_type")!="video"
        or tracks[0].get("width")!=1080 or tracks[0].get("height")!=1920):
        hold("MUTED_FILM_IS_NOT_ONE_NATIVE_VIDEO_STREAM")
    basehash=invoke(["ffmpeg","-v","error","-nostdin","-i",str(movie),
                     "-map","0:v:0","-f","streamhash","-hash","SHA256","-"])
    mutehash=invoke(["ffmpeg","-v","error","-nostdin","-i",str(silent),
                     "-map","0:v:0","-f","streamhash","-hash","SHA256","-"])
    if basehash!=mutehash:
        hold("MUTING_ALTERED_DECODED_VIDEO_STREAM")
    questions={
      "schema":SCHEMA,"condition":"BLIND_SOUND_OFF",
      "exactStimulusSha256":digest(silent),"originalVideoSha256":paths["video"],
      "instructions":"Watch the video once at normal speed without sound. Answer without consulting sources or the sealed rubric.",
      "questions":[{"id":qid,"prompt":prompt,"choices":dict(zip("ABCD",options)),"response":None}
                   for qid,prompt,options,_,_ in QUESTIONS],
      "viewerSessionsRecorded":0,"responseSubmissionPresent":False,"mayPublish":False}
    key={
      "schema":SCHEMA,"condition":"SEALED_DO_NOT_SHOW_VIEWERS",
      "sameStimulusSha256":digest(silent),"sameOriginalVideoSha256":paths["video"],
      "scoringRule":"Five critical questions, each with one keyed response. An individual pilot passes only at 5/5; group claims require real independently collected blinded sessions and later calibration.",
      "correctByQuestion":{qid:choice for qid,_,_,choice,_ in QUESTIONS},
      "assessedConcepts":{qid:concept for qid,_,_,_,concept in QUESTIONS},
      "minimumRealBlindViewerCountBeforePilotReview":5,
      "realBlindViewerCount":0,"automaticallyMeasuredComprehension":False,
      "notCalibratedHumanComprehensionEvidence":True,"mayPublish":False}
    proof={
      "schema":SCHEMA,"status":"BLIND_SOUND_OFF_PACKET_READY_NO_VIEWER_RESULT",
      "originalVideoSha256":paths["video"],"sourceReceiptsSha256":paths,
      "exactMutedStimulusSha256":digest(silent),
      "identicalDecodedVideoFramesAfterMute":True,
      "mutedAudioTrackCount":0,"questions":5,"realResponses":0,
      "viewerComprehensionVerified":False,"excellentCreativeQualityApproved":False,
      "originalVoicePronunciationReviewed":False,"actualHandsetPlaybackVerified":False,
      "mayPublish":False}
    for file,payload in [
        ("viewer-only/viewer-questions.json",questions),
        ("reviewer-only/sealed-scoring-key.json",key),
        ("research-receipt.json",proof)]:
        (out/file).write_text(json.dumps(payload,indent=2)+"\n",encoding="utf8")
    return proof

def main():
    p=argparse.ArgumentParser()
    for field in ("movie","receipt","phone","science","story","out"):
        p.add_argument("--"+field,required=True)
    a=p.parse_args()
    print(json.dumps(build(a.movie,a.receipt,a.phone,a.science,a.story,a.out),indent=2))

if __name__=="__main__":
    main()
