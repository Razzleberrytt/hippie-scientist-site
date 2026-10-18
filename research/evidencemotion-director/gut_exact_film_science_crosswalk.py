#!/usr/bin/env python3
"""Exact H264 gut science crosswalk, research HOLD only; no auto scientific verdict."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

from research_receipt_io import prepare_research_output, emit_research_output

SCHEMA="ths-gut-exact-film-science-crosswalk-v1"
MOVIE_SHA="044c1f0573f01d3fe850cbd74f270c90019cc3e37b364a0fa627d56e7ecb39f2"
SRT_SHA="40622b677cd6db8c493eff55727904c5017c4a3d7803b22d4c361e84a1ff9bee"
SCENES=(
 ("hook",45,"NIDDK_GENERAL_DIGESTION","NIDDK digestive-system description cannot quantify a supplement absorbed dose",True),
 ("release",165,"USP2040_DIETARY_SUPPLEMENT_DOSAGE_TESTS_ONLY","USP chapter 2040 provides dietary-supplement disintegration/dissolution tests only where individual monographs specify; it does not establish in-vivo absorption, universal stomach release, or a visible film source credit",False),
 ("small_intestine",320,"NIDDK_NUTRIENTS_FROM_FOOD","most dietary nutrients from food are absorbed in small intestine; some lipids/vitamins use lymph",True),
 ("vitamin_d",480,"NIH_ODS_VITAMIN_D","fat can enhance vitamin D absorption but dietary fat is not always required; no percent-effect claim",True),
 ("iron",615,"NIH_ODS_IRON_AND_CONDITIONED_TEA_TRIALS","vitamin C can enhance nonheme iron; certain tea polyphenols may inhibit meal-bound nonheme iron; no population-independent clinical endpoint",True),
 ("takeaway",785,"NIDDK_AND_NIH_ODS","food/formulation and medication contexts differ; check label; no personal medication direction",True),
)
SOURCES={
 "niddk":"https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works",
 "ods_vitamin_d":"https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/",
 "ods_iron":"https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/",
 "tea_trial_2017":"https://pubmed.ncbi.nlm.nih.gov/29046302/",
 "polyphenol_trial_1999":"https://pubmed.ncbi.nlm.nih.gov/10999016/",
 "usp_supplement_2040":"https://doi.usp.org/USPNF/USPNF_M99970_04_01.html",
}

def digest(path):
 return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def mandatory(ok,code):
 if not ok:raise ValueError("GUT_SCIENCE_FILM_HOLD:"+code)

def parse_manifest(path):
 def unique(pairs):
  d={}
  for k,v in pairs:
   mandatory(k not in d,"DUPLICATE_MANIFEST_KEY")
   d[k]=v
  return d
 d=json.loads(Path(path).read_text(encoding="utf8"),object_pairs_hook=unique)
 mandatory(type(d) is dict and set(d)=={"schema","movieSha256","srtSha256","encodedFrameCount","scenes","primarySources","mayPublish","qualifiedIndependentSciencePassed","realPhonePassed","overallScienceDisposition"},"CONTRACT_KEYS")
 mandatory(d["schema"]==SCHEMA and d["movieSha256"]==MOVIE_SHA and d["srtSha256"]==SRT_SHA and type(d["encodedFrameCount"]) is int and d["encodedFrameCount"]==845,"SOURCE_IDENTITY")
 mandatory(d["primarySources"]==SOURCES,"SOURCE_URLS_NOT_CANONICAL")
 mandatory(d["mayPublish"] is False and d["qualifiedIndependentSciencePassed"] is False and d["realPhonePassed"] is False and d["overallScienceDisposition"]=="RESEARCH_SOURCE_SCOPES_REVIEWED_RELEASE_HOLD","FORGED_APPROVAL")
 scenes=d["scenes"]
 mandatory(type(scenes) is list and len(scenes)==len(SCENES),"EXACT_SIX_SCENES")
 for row,expected in zip(scenes,SCENES):
  mandatory(type(row) is dict and set(row)=={"id","sampleFrame","sourceScope","limitation","inFrameSourceLabel","sampleRgb540Sha256","sourceReviewState"},"SCENE_SCHEMA")
  mandatory(tuple(row[k] for k in ("id","sampleFrame","sourceScope","limitation","inFrameSourceLabel"))==expected,"SCENE_SOURCE_SCOPE_MISMATCH")
  mandatory(row["sourceReviewState"]=="MACHINE_VISUAL_INTAKE_HOLD","CLAIM_PREMATURELY_SCIENCE_APPROVED")
  sha=row["sampleRgb540Sha256"]
  mandatory(type(sha) is str and len(sha)==64 and all(ch in "0123456789abcdef" for ch in sha),"INVALID_FRAME_RGB_DIGEST")
 return d

def run(args):
 return subprocess.run(args,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=75).stdout

def frame_rgb(movie,number):
 return run(["ffmpeg","-v","error","-xerror","-err_detect","explode","-i",str(movie),
             "-vf",f"select=eq(n\\,{number}),scale=540:960:flags=bicubic",
             "-vsync","0","-frames:v","1","-pix_fmt","rgb24","-f","rawvideo","-"])

def audit(manifest_path,movie,srt):
 manifest=parse_manifest(manifest_path)
 mandatory(digest(movie)==MOVIE_SHA and digest(srt)==SRT_SHA,"WRONG_ENCODED_MOVIE_OR_SRT")
 probe=json.loads(run(["ffprobe","-v","error","-select_streams","v:0",
   "-show_entries","stream=width,height,avg_frame_rate,nb_frames,codec_name",
   "-of","json",str(movie)]))
 streams=probe.get("streams",[])
 mandatory(len(streams)==1 and all(str(streams[0].get(k))==v for k,v in (
  ("width","1080"),("height","1920"),("avg_frame_rate","30/1"),("nb_frames","845"),("codec_name","h264"))),
  "WRONG_FRAME_GEOMETRY_TIMING_OR_CODEC")
 run(["ffmpeg","-v","error","-xerror","-err_detect","explode","-i",str(movie),
      "-map","0:v:0","-f","null","-"])
 samples=[]
 for row in manifest["scenes"]:
  data=frame_rgb(movie,row["sampleFrame"])
  mandatory(len(data)==540*960*3,"FRAME_MISSING_OR_WRONG_DIMENSIONS")
  observed=hashlib.sha256(data).hexdigest()
  mandatory(observed==row["sampleRgb540Sha256"],
            "FRAME_PIXELS_DIFFERENT_FROM_SOURCE_BOUND_REVIEW:"+row["id"])
  samples.append({"scene":row["id"],"sampleFrame":row["sampleFrame"],
   "rawRgb540Sha256":observed,"sourceScope":row["sourceScope"],
   "sourceOnFilm":row["inFrameSourceLabel"]})
 return {"schema":SCHEMA,"exactFilmSha256":MOVIE_SHA,"srtSha256":SRT_SHA,
   "physicalFull845VideoDecodePassed":True,"sixSourceScopedFramesReplayed":samples,
   "unqualifiedFormulationClaimRemainsReleaseHold":True,
   "inFramePrimaryFormulationSourceCitationPresent":False,
   "independentSciencePassed":False,"realPhonePassed":False,"mayPublish":False,
   "decision":"EXACT_FILM_SCIENCE_CROSSWALK_TECHNICAL_PASS_EDITORIAL_HOLD"}

def main():
 p=argparse.ArgumentParser()
 for key in ("manifest","movie","srt","output"):p.add_argument("--"+key,required=True)
 a=p.parse_args()
 # Guard immutable inputs before running science checks. A stale positive
 # receipt must not survive a failed replay or overwrite original evidence.
 target=prepare_research_output(a.output,(a.manifest,a.movie,a.srt))
 result=audit(a.manifest,a.movie,a.srt)
 emit_research_output(target,result)
 print(json.dumps(result,indent=2))

if __name__=="__main__":main()
