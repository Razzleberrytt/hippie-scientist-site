#!/usr/bin/env python3
"""Frozen narration inventory, not primary-science or pronunciation approval."""
import argparse
import hashlib
import json
import math
from pathlib import Path
from autonomous_script_asr_research import LINES,WAV_SHA,tokens,source_check
from exact_wav_alignment import inspect_alignment

# Exhaustive spans within the six locked sentences, including nonfactual speech.
SPANS=((0,0,8,"QUESTION"),(1,0,12,"STRUCTURAL_ASSERTION"),
       (2,0,13,"SOURCE_PROVENANCE_ASSERTION"),(3,0,7,"COMPUTED_POSE_LIMIT"),
       (3,7,18,"NOT_OBSERVED_BINDING"),(4,0,6,"STRUCTURE_EXPLANATION"),
       (4,6,12,"NO_EXPERIENCED_EFFECT_INFERENCE"),(5,0,10,"EDITORIAL_INVITATION"))

def hold(reason):
    raise ValueError("SPOKEN_LEDGER_HOLD:"+reason)

def load_original_alignment(root,manifest_path):
    root=Path(root)
    manifest=json.loads(Path(manifest_path).read_text(encoding="utf8"))
    # Existing byte-bound importer verifies all five real supplied inputs.
    alignment=inspect_alignment(root,manifest)
    source_check(root/manifest["wav"]["path"])
    return alignment,root/manifest["wav"]["path"]

def inventory(alignment):
    if alignment.get("inputSha256",{}).get("wav")!=WAV_SHA:
        hold("ORIGINAL_WAV_REQUIRED")
    expected=tokens(" ".join(LINES))
    aligned=alignment.get("wordAlignment",[])
    if [row.get("word") for row in aligned]!=expected:
        hold("LOCKED_TRANSCRIPT_WORD_COVERAGE_REQUIRED")
    last=0
    for row in aligned:
        a,b=row.get("startMs"),row.get("endMs")
        if (not isinstance(a,(int,float)) or not isinstance(b,(int,float))
            or not math.isfinite(a) or not math.isfinite(b) or not last<=a<b):
            hold("WORD_TIME_INVALID")
        last=b
    offsets=[]
    cursor=0
    for line in LINES:
        offsets.append(cursor)
        cursor+=len(tokens(line))
    words=[]
    assertions=[]
    for number,(sentence,start,end,kind) in enumerate(SPANS,1):
        indices=list(range(offsets[sentence]+start,offsets[sentence]+end))
        claim_id=f"spoken-{number:03}"
        assertions.append({"id":claim_id,"kind":kind,"sentence":sentence+1,
          "wordIndices":indices,"text":" ".join(expected[i] for i in indices),
          "scientificSupportStatus":"NOT_REVIEWED_IN_THIS_INVENTORY"})
        for index in indices:
            word=expected[index]
            roles=[]
            if word=="not": roles.append("NEGATION")
            if word=="computed": roles.append("COMPUTED_LIMIT")
            if word=="verified": roles.append("PROVENANCE_ASSERTION_REQUIRES_SOURCE_REVIEW")
            words.append({"index":index,"word":word,"assertionId":claim_id,
              "startMs":aligned[index]["startMs"],"endMs":aligned[index]["endMs"],"roles":roles})
    if [w["index"] for w in words]!=list(range(len(expected))):
        hold("ASSERTION_SPANS_NOT_EXHAUSTIVE_OR_DUPLICATED")
    return {"schema":"ths-frozen-spoken-claim-ledger-v1","task":"EM-007.01",
      "inputSha256":alignment["inputSha256"],"sourceWavSha256":WAV_SHA,"alignmentRevisionSha256":alignment["revisionSha256"],
      "authoredLines":list(LINES),"wordCount":len(words),"assertionCount":len(assertions),
      "assertions":assertions,"words":words,"wordCoverageVerified":True,
      "timingAccuracyCalibrated":False,"scienceApproved":False,"mayPublish":False}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--root",required=True)
    parser.add_argument("--manifest",required=True)
    parser.add_argument("--out",required=True)
    args=parser.parse_args()
    alignment,_=load_original_alignment(args.root,args.manifest)
    result=inventory(alignment)
    out=Path(args.out)
    out.write_text(json.dumps(result,indent=2)+"\n",encoding="utf8")
    print(json.dumps({"status":"PASS_INVENTORY_ONLY","words":result["wordCount"],
      "assertions":result["assertionCount"],"outputSha256":hashlib.sha256(out.read_bytes()).hexdigest(),
      "scienceApproved":False,"mayPublish":False}))

if __name__=="__main__": main()
