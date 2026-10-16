#!/usr/bin/env python3
"""EM-008.01 exact-H264 botanical-shot inventory: zero declared, not zero proven."""
import argparse, hashlib, json, math, subprocess
from pathlib import Path

FILM_SHA="4a36305c08e422d85a006332c4e83d39dac4a8f12c87502ad842cb99b8f874e3"
WAV_SHA="9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435"
PLAN_SHA="2233605fdbfe92ef2923ae8d6785dbd18216e3b49eea0cf872b2c5b2c5fc0d1d"
RECEIPT_SHA="06f5be0414e2d7576ee7819ed085e5f4ecdbbe3e4fb5d3c71dcbb86080bb23e5"
INVENTORY_SHA="cdfe8295fce6fc73c42aea36897897b7b1a710d3e12fc92008cf74e0f71ea4b6"
SHOT_IDS=("sentence_1_part0","sentence_1_part1","sentence_2",
          "sentence_3","sentence_4","sentence_5_part0",
          "sentence_5_part1","source_hold","sentence_6")
FRAME_COUNT=1031
FPS=30
WIDTH=1080
HEIGHT=1920

class SourceHold(ValueError):
    pass

def digest(data):
    return hashlib.sha256(data).hexdigest()

def digest_file(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""):
            h.update(chunk)
    return h.hexdigest()

def contract(plan,receipt,inventory,film_sha):
    if film_sha!=FILM_SHA or receipt.get("videoSha256")!=FILM_SHA or plan.get("expectedVideoSha256")!=FILM_SHA or inventory.get("filmSha256")!=FILM_SHA:
        raise SourceHold("SWAPPED_OR_UNPINNED_FILM")
    if receipt.get("sourceWavSha256")!=WAV_SHA or inventory.get("sourceWavSha256")!=WAV_SHA:
        raise SourceHold("FOREIGN_ORIGINAL_VOICE")
    if receipt.get("resolution")!=[WIDTH,HEIGHT] or receipt.get("fps")!=FPS or receipt.get("frames")!=FRAME_COUNT:
        raise SourceHold("NOT_EXPECTED_NATIVE_FILM")
    if plan.get("status")!="RESEARCH_ONLY" or plan.get("releaseApproved") is not False:
        raise SourceHold("PLATFORM_RELEASE_CANNOT_PASS")
    if inventory.get("mayPublish") is not False or receipt.get("mayPublish") is not False:
        raise SourceHold("UNAUTHORIZED_PUBLISH_REQUEST")
    shots=plan.get("shots")
    rows=inventory.get("rows")
    if not isinstance(shots,list) or len(shots)!=len(SHOT_IDS) or not isinstance(rows,list) or len(rows)!=len(SHOT_IDS):
        raise SourceHold("NINE_SHOT_EXHAUSTIVENESS_MISSING")
    if tuple(x.get("id") for x in shots)!=SHOT_IDS or tuple(x.get("shot") for x in rows)!=SHOT_IDS:
        raise SourceHold("SHOTS_SWAPPED_OR_MISSING")
    if any(x.get("assetKind")!="deterministic_science" for x in shots):
        raise SourceHold("UNKNOWN_OR_BOTANICAL_SHOT_REQUIRES_REAUDIT")
    if any(x.get("declaredAssetKind")!="deterministic_science" for x in rows):
        raise SourceHold("CONFLICTING_CLAIM_ASSET_CLASSIFICATION")
    if inventory.get("declaredBotanicalArtShotCount")!=0 or inventory.get("botanicalFrameContentIndependentlyClassified") is not False:
        raise SourceHold("INCOMPATIBLE_BOTANICAL_CLASSIFICATION_CLAIM")
    if inventory.get("shotsInspected")!=9 or inventory.get("allFrameIndependentOCR") is not False:
        raise SourceHold("MISLEADING_FULL_FRAME_REVIEW_CLAIM")
    last=0.0
    for s in shots:
        start,end=s.get("startSec"),s.get("endSec")
        if not all(isinstance(x,(int,float)) and math.isfinite(x) for x in (start,end)):
            raise SourceHold("INVALID_SCENE_TIME")
        if abs(start-last)>0.001 or not start<end or end>FRAME_COUNT/FPS+0.001:
            raise SourceHold("TIMELINE_GAP_OVERLAP_OR_TRUNCATION")
        last=end
    if abs(last-FRAME_COUNT/FPS)>0.001:
        raise SourceHold("FILM_NOT_EXHAUSTIVELY_MAPPED")
    return [min(FRAME_COUNT-1,max(0,int(((s["startSec"]+s["endSec"])/2)*FPS)))
            for s in shots]

def parse_framehash(output, indices):
    """Parse real RGB24 FFmpeg SHA-256 output, rejecting missing/extra frames."""
    if (not isinstance(output,str) or "#hash: SHA256" not in output
        or "#dimensions 0: 1080x1920" not in output
        or "#tb 0: 1/30" not in output
        or "#codec_id 0: rawvideo" not in output):
        raise SourceHold("FRAMEHASH_PROTOCOL_OR_VIDEO_IDENTITY_INVALID")
    rows=[row for row in output.splitlines() if row and not row.startswith("#")]
    if len(rows)!=len(indices):
        raise SourceHold("REAL_DECODED_SAMPLES_MISSING_OR_EXTRA")
    hashes=[]
    for row,wanted in zip(rows,indices):
        cells=[c.strip() for c in row.split(",")]
        try:
            stream,dts,pts,duration,size=map(int,cells[:5])
        except (TypeError,ValueError,IndexError) as error:
            raise SourceHold("INVALID_NATIVE_RGB_FRAMEHASH_ROW") from error
        if (len(cells)!=6 or stream!=0 or dts!=wanted or pts!=wanted
            or duration!=1 or size!=WIDTH*HEIGHT*3
            or len(cells[5])!=64
            or any(c not in "0123456789abcdef" for c in cells[5])):
            raise SourceHold("SWAPPED_TRUNCATED_OR_WRONG_NATIVE_RGB_FRAME")
        hashes.append(cells[5])
    return hashes

def audit(movie,plan_path,receipt_path,inventory_path):
    movie=Path(movie)
    if not movie.is_file() or movie.is_symlink():
        raise SourceHold("ACTUAL_MOVIE_BYTES_MISSING")
    film_sha=digest_file(movie)
    paths=[Path(x) for x in (plan_path,receipt_path,inventory_path)]
    if any(not p.is_file() or p.is_symlink() for p in paths):
        raise SourceHold("ORIGINAL_FILM_INPUT_JSON_MISSING")
    if tuple(digest_file(p) for p in paths)!=(PLAN_SHA,RECEIPT_SHA,INVENTORY_SHA):
        raise SourceHold("ARCHIVED_ORIGINAL_SOURCE_MANIFEST_SHA_DRIFT")
    plan,receipt,inventory=[json.loads(p.read_text(encoding="utf-8")) for p in paths]
    indices=contract(plan,receipt,inventory,film_sha)
    probe=json.loads(subprocess.run(
        ["ffprobe","-v","error","-select_streams","v:0",
         "-show_entries","stream=codec_name,width,height,avg_frame_rate,nb_frames",
         "-of","json",str(movie)],check=True,capture_output=True,text=True).stdout)
    video=probe["streams"][0]
    if (video.get("codec_name")!="h264" or
        [video.get("width"),video.get("height")]!=[WIDTH,HEIGHT] or
        video.get("avg_frame_rate")!="30/1" or int(video.get("nb_frames",0))!=FRAME_COUNT):
        raise SourceHold("ACTUAL_VIDEO_STREAM_IDENTITY_MISMATCH")
    expr="+".join("eq(n\\,"+str(i)+")" for i in indices)
    # FFmpeg's framehash muxer hashes native RGB24 pixel bytes without
    # capturing >55 MiB of rawvideo stdout in runner Python. Limit threads
    # to avoid FFmpeg EAGAIN on resource-constrained hosted CPU machines.
    try:
        decode=subprocess.run(
            ["ffmpeg","-hide_banner","-loglevel","error",
             "-threads","1","-filter_threads","1",
             "-i",str(movie),"-an","-vf","select="+expr,
             "-fps_mode","passthrough","-pix_fmt","rgb24",
             "-f","framehash","-hash","sha256","pipe:1"],
            capture_output=True,text=True,check=True)
    except subprocess.CalledProcessError as error:
        raise SourceHold("FFMPEG_FRAMEHASH_EXTRACTION_FAILED:"+str(error.returncode)
                         +":"+str(error.stderr or "")[-1500:]) from error
    hashes=parse_framehash(decode.stdout,indices)
    samples=[]
    for shot,index,pixel_sha in zip(plan["shots"],indices,hashes):
        samples.append({
            "shotId":shot["id"],"sourceClass":shot["assetKind"],
            "frameIndex":index,"timeSec":round(index/FPS,6),
            "decodedRgb24Sha256":pixel_sha})
    return {
        "status":"ACTUAL_NINE_SHOT_SAMPLES_VERIFIED_BOTANICAL_CONTENT_HOLD",
        "filmSha256":film_sha,
        "manifestSha256":{name:digest_file(path) for name,path in zip(
            ("phonePlan","renderReceipt","visualInventory"),paths)},
        "sourceWavSha256":WAV_SHA,
        "width":WIDTH,"height":HEIGHT,"fps":FPS,"encodedFrames":FRAME_COUNT,
        "declaredBotanicalArtShots":0,"declaredDeterministicScienceShots":9,
        "actualDecodedShotsSampled":len(samples),"sampledDecodedPixelHashes":samples,
        "actualFullFrameContentBotanicallyClassified":False,
        "actualBotanicalAbsenceFromAllFramesEstablished":False,
        "sourceArtPixelProvenanceIndependentlyEstablished":False,
        "qualifiedScienceApproved":False,"actualPhonePlaybackVerified":False,
        "firstExcellentRenderApproved":False,
        "publicationApproved":False,"mayPublish":False,
        "limitation":"No botanical art is declared in this selected native film; nine exact H264 frames were decoded and hashed. Human/model classification across ALL 1031 decoded frames, and future films containing botanical art, remain unverified."
    }

def main():
    p=argparse.ArgumentParser()
    for name in ("movie","plan","receipt","inventory","out"):
        p.add_argument("--"+name,required=True)
    a=p.parse_args()
    result=audit(a.movie,a.plan,a.receipt,a.inventory)
    path=Path(a.out);path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({k:v for k,v in result.items() if k not in ("sampledDecodedPixelHashes",)},indent=2))

if __name__=="__main__":
    main()
