#!/usr/bin/env python3
"""Research-only CPU Blender motion proof: source-locked geometry, actual decoded video.

DOES NOT certify a video or touch site publishing. Never re-time or synthesize
audio, invent molecule/receptor docking or treat an illustrative conformer as
observed experimental geometry. Two SHOT demonstrations, NOT two approved films.
"""
import argparse
import hashlib
import importlib.util
import json
import math
import subprocess
import sys
import time
from pathlib import Path

BASE=Path(__file__).with_name("blender_cpu_research.py")
spec=importlib.util.spec_from_file_location("blender_cpu_research",BASE)
base=importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)

CONCEPTS=("oxygen-to-whole","depth-orbit")
FPS=12
FRAMES=36
ORBIT_MAX_TRAVEL_DEGREES=8.0
W,H=270,480
SHA=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()

def hold(code):
    raise ValueError("MOTION_RESEARCH_HOLD: "+code)

def smooth(t):
    t=min(1.,max(0.,t))
    return t*t*(3-2*t)

def orbit_degrees(progress):
    return -ORBIT_MAX_TRAVEL_DEGREES/2 + ORBIT_MAX_TRAVEL_DEGREES*smooth(progress)

def validate_job(job):
    if not isinstance(job,dict) or job.get("schema")!="ths-blender-motion-research-v1":
        hold("MISSING_BOUNDED_RESEARCH_SCHEMA")
    if job.get("track")!="RESEARCH_ONLY" or job.get("mayPublish") is not False:
        hold("PRODUCTION_BOUNDARY")
    if job.get("sourceCID")!=base.CID or job.get("sourceInchiKey")!=base.INCHIKEY:
        hold("SOURCE_DRIFT")
    if job.get("narrationWav") is not None or job.get("approvedClaimIDs")!=[]:
        hold("NO_VOICE_OR_CLAIM_APPROVAL_IN_RESEARCH_SMOKE")
    if job.get("fps")!=FPS or job.get("frames")!=FRAMES or job.get("dimensions")!=[W,H]:
        hold("UNBOUNDED_COMPUTE")
    if job.get("concept") not in CONCEPTS:
        hold("UNSUPPORTED_CONCEPT")
    sh=job.get("packetSha256")
    if not isinstance(sh,str) or len(sh)!=64 or any(c not in "0123456789abcdef" for c in sh):
        hold("MISSING_SOURCE_SHA")
    return {"status":"BOUNDED_PREVIEW_JOB","mayRenderFinal":False,"mayPublish":False}

def make_job(packet_file,concept):
    if concept not in CONCEPTS:
        hold("UNSUPPORTED_CONCEPT")
    return {"schema":"ths-blender-motion-research-v1","track":"RESEARCH_ONLY",
            "mayPublish":False,"sourceCID":base.CID,"sourceInchiKey":base.INCHIKEY,
            "narrationWav":None,"approvedClaimIDs":[],"fps":FPS,"frames":FRAMES,
            "dimensions":[W,H],"concept":concept,"packetSha256":SHA(packet_file)}

def render_motion(packet_file, expected_sha,outdir,concept):
    job=make_job(packet_file,concept)
    validate_job(job)
    if SHA(packet_file)!=expected_sha or job["packetSha256"]!=expected_sha:
        hold("EXACT_PACKET_SHA_REQUIRED")
    outdir=Path(outdir).resolve()
    outdir.mkdir(parents=True,exist_ok=True)
    # b.render constructs *the same* RDKit source/graph from the verified packet
    # and forbids human-effect/docking claims and non-headless execution.
    b=base.render(packet_file,expected_sha,outdir,"whole")
    import bpy
    from mathutils import Vector,Quaternion
    scene=bpy.context.scene
    camera=scene.camera
    original_position=camera.location.copy()
    original_rotation=camera.rotation_quaternion.copy()
    original_scale=float(camera.data.ortho_scale)
    atom_positions={int(x.name.split("_")[-1]):x.location.copy() for x in bpy.data.objects
                    if x.name.startswith("RDKit_atom_")}
    if len(atom_positions)!=30:
        hold("INCOMPLETE_OR_EXTRA_MOLECULAR_SOURCE")
    packet=json.loads(Path(packet_file).read_text())
    oxygen=atom_positions[packet["highlightAtomIndex"]]
    frames_dir=outdir/("frames_"+concept)
    frames_dir.mkdir(exist_ok=True)
    frame_hashes=[]
    start=time.monotonic()
    for n in range(FRAMES):
        t=smooth(n/(FRAMES-1))
        if concept=="oxygen-to-whole":
            # A single motivated dolly-like reframe: tracked real oxygen
            # reveals the WHOLE verified structure; source geometry unchanged.
            camera.location=original_position + oxygen*(1-t)
            camera.rotation_quaternion=original_rotation
            camera.data.ortho_scale=original_scale*(.50+.50*t)
        else:
            # Distinct geometry-demonstration: a small true 3D orbit emphasizing
            # molecular depth, not a molecule undergoing a chemical reaction.
            angle=math.radians(orbit_degrees(n/(FRAMES-1)))
            radius=17.7
            camera.location=Vector((radius*math.sin(angle),-radius*math.cos(angle),5))
            camera.rotation_quaternion=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y') @ Quaternion((0,0,1),math.pi/2)
            camera.data.ortho_scale=original_scale
        frame=frames_dir/("frame_%04d.png"%n)
        scene.render.filepath=str(frame)
        bpy.ops.render.render(write_still=True)
        if not frame.is_file() or frame.stat().st_size<1000:
            hold("MISSING_ACTUAL_RENDER_FRAME")
        frame_hashes.append(SHA(frame))
    if len(set(frame_hashes))<FRAMES//3:
        hold("STATIC_CGI_NOT_MOTION")
    out=outdir/("blender_7oh_"+concept+"_RESEARCH_ONLY_SILENT.mp4")
    args=["ffmpeg","-hide_banner","-loglevel","error","-nostdin","-y",
          "-framerate",str(FPS),"-i",str(frames_dir/"frame_%04d.png"),
          "-vf","drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:"
                "text='COMPUTED 3D ILLUSTRATION - NOT MEASURED':"
                "fontsize=11:fontcolor=white:x=10:y=h-55:box=1:boxcolor=black@0.7:boxborderw=4",
          "-frames:v",str(FRAMES),"-c:v","libx264","-preset","veryfast",
          "-crf","20","-pix_fmt","yuv420p","-an","-movflags","+faststart",str(out)]
    subprocess.run(args,check=True,timeout=150)
    if not out.is_file() or out.stat().st_size<6000:
        hold("ENCODED_VIDEO_NOT_PRESENT")
    receipt={"status":"ACTUAL_SILENT_RESEARCH_MOTION_FOR_CRAFT_REVIEW",
             "mayPublish":False,"excellentCertified":False,
             "sourcePacketSha256":expected_sha,"sourceCID":base.CID,
             "sourceInchiKey":base.INCHIKEY,"conformer":"COMPUTED_NOT_OBSERVED",
             "concept":concept,"frames":FRAMES,"fps":FPS,"dimensions":[W,H],
             "renderEngine":"Blender Cycles CPU","frameSha256":frame_hashes,
             "videoSha256":SHA(out),"renderAndEncodeWallSeconds":round(time.monotonic()-start,3),
             "voice":"NONE_SILENT_TEST_ONLY","craftApproved":False,
             "scienceEditorialApproved":False,"ownerPhoneApproved":False,
             "productionIntegrated":False,"costUSD":"UNKNOWN",
             "sourceStillSha256":b["pngSha256"]}
    rp=outdir/("blender_7oh_"+concept+"_RESEARCH_ONLY_receipt.json")
    rp.write_text(json.dumps(receipt,indent=2)+"\n")
    return {k:v for k,v in receipt.items() if k!="frameSha256"}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--packet",required=True)
    parser.add_argument("--expected-sha",required=True)
    parser.add_argument("--out",required=True)
    parser.add_argument("--concept",choices=CONCEPTS,required=True)
    args=parser.parse_args(sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else sys.argv[1:])
    print(json.dumps(render_motion(args.packet,args.expected_sha,args.out,args.concept),indent=2))

if __name__=="__main__":main()
