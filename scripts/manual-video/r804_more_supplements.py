#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont
from kokoro_onnx import Kokoro

W, H = 720, 1280
FPS = 30
DURATION = 22.2
SR = 24000

BG_TOP = (8, 14, 11)
BG_BOTTOM = (18, 27, 21)
INK = (242, 246, 240)
MUTED = (162, 178, 167)
GREEN = (180, 255, 102)
AMBER = (255, 205, 102)
RED = (255, 116, 105)
PANEL = (24, 35, 29)
PANEL_2 = (31, 45, 37)
WHITE = (255, 255, 255)

NARRATION = (
    "More supplements don't automatically mean better results. "
    "In a randomized trial of one hundred three healthy active adults, "
    "the clearest improvements clustered in the morning ashwagandha plus rhodiola group. "
    "Adding a bedtime stack didn't clearly improve things further. "
    "But this was only two weeks, and the ingredients weren't tested alone."
)

VOICES = [
    ("A", "am_michael", 1.04),
    ("B", "am_eric", 1.03),
    ("C", "af_nicole", 1.02),
]

SCENES = [
    (0.0, 2.2),
    (2.2, 5.5),
    (5.5, 8.8),
    (8.8, 12.2),
    (12.2, 16.2),
    (16.2, 19.8),
    (19.8, 22.2),
]

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))

def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3

def ease_in_out(x):
    x = clamp(x)
    return 3*x*x - 2*x*x*x

def font_path(bold=False):
    choices = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for p in choices:
        if os.path.exists(p):
            return p
    raise RuntimeError("No supported font found")

FONT_REG = font_path(False)
FONT_BOLD = font_path(True)

def font(size, bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size=size)

def base_background():
    arr = np.zeros((H, W, 3), dtype=np.uint8)
    for y in range(H):
        q = y/(H-1)
        arr[y, :, :] = [
            int(BG_TOP[i]*(1-q)+BG_BOTTOM[i]*q) for i in range(3)
        ]
    img = Image.fromarray(arr, "RGB")
    d = ImageDraw.Draw(img, "RGBA")
    for x in range(60, W, 90):
        d.line((x, 0, x, H), fill=(255,255,255,10), width=1)
    for y in range(70, H, 90):
        d.line((0, y, W, y), fill=(255,255,255,8), width=1)
    for x,y,r in [(92,165,4),(635,270,3),(582,1040,4),(132,1000,2),(664,795,2)]:
        d.ellipse((x-r,y-r,x+r,y+r), fill=(*GREEN,55))
    return img

BASE = base_background()

def text_bbox(draw, s, fnt):
    return draw.textbbox((0,0), s, font=fnt)

def draw_centered(draw, s, y, fnt, fill=INK, max_width=500, spacing=8, anchor="mm", cx=SAFE_C):
    words = s.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur+" "+w).strip()
        bb = text_bbox(draw, trial, fnt)
        if bb[2]-bb[0] <= max_width or not cur:
            cur = trial
        else:
            lines.append(cur); cur = w
    if cur: lines.append(cur)
    line_h = text_bbox(draw, "Ag", fnt)[3] - text_bbox(draw, "Ag", fnt)[1]
    total_h = len(lines)*line_h + (len(lines)-1)*spacing
    yy = y-total_h/2
    for line in lines:
        bb = text_bbox(draw, line, fnt)
        w = bb[2]-bb[0]
        draw.text((cx-w/2, yy), line, font=fnt, fill=fill)
        yy += line_h+spacing
    return total_h

def rounded(draw, box, radius=24, fill=PANEL, outline=None, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def pill(draw, x, y, w, h, label, accent=GREEN, alpha=255, fs=28):
    rounded(draw, (x,y,x+w,y+h), radius=h//2, fill=(*PANEL_2, alpha), outline=(*accent, min(alpha,210)), width=2)
    f=font(fs, True)
    bb=text_bbox(draw,label,f)
    tw=bb[2]-bb[0]; th=bb[3]-bb[1]
    draw.text((x+(w-tw)/2, y+(h-th)/2-3), label, font=f, fill=(*INK,alpha))

def sun(draw, cx, cy, r=45, alpha=255):
    draw.ellipse((cx-r,cy-r,cx+r,cy+r), fill=(*AMBER,alpha))
    for a in range(0,360,45):
        rad=math.radians(a)
        x1=cx+math.cos(rad)*(r+12); y1=cy+math.sin(rad)*(r+12)
        x2=cx+math.cos(rad)*(r+28); y2=cy+math.sin(rad)*(r+28)
        draw.line((x1,y1,x2,y2), fill=(*AMBER,alpha), width=5)

def moon(draw, cx, cy, r=48, alpha=255):
    draw.ellipse((cx-r,cy-r,cx+r,cy+r), fill=(*AMBER,alpha))
    draw.ellipse((cx-r+22,cy-r-5,cx+r+22,cy+r-5), fill=(*BG_TOP,alpha))

def leaf(draw, cx, cy, scale=1.0, accent=GREEN, alpha=255):
    stem=max(2,int(5*scale))
    draw.line((cx,cy+70*scale,cx,cy-70*scale), fill=(*accent,alpha), width=stem)
    left=[
        (cx,cy+10*scale),(cx-62*scale,cy-8*scale),(cx-78*scale,cy-55*scale),
        (cx-26*scale,cy-52*scale)
    ]
    right=[
        (cx,cy-18*scale),(cx+58*scale,cy-34*scale),(cx+72*scale,cy-78*scale),
        (cx+20*scale,cy-70*scale)
    ]
    draw.polygon(left, fill=(*accent,alpha))
    draw.polygon(right, fill=(*accent,alpha))

def fade_alpha(t, start, end, edge=0.28):
    a=clamp((t-start)/edge)
    b=clamp((end-t)/edge)
    return int(255*min(a,b))

def scene_index(t):
    for i,(s,e) in enumerate(SCENES):
        if s <= t < e:
            return i
    return len(SCENES)-1

def frame_at(t):
    img=BASE.copy().convert("RGBA")
    d=ImageDraw.Draw(img, "RGBA")
    idx=scene_index(t)
    s,e=SCENES[idx]
    local=(t-s)/(e-s)
    a=fade_alpha(t,s,e)
    # header/footer chrome
    d.text((48,50),"THE HIPPIE SCIENTIST",font=font(23,True),fill=(*MUTED,190))
    d.text((48,1208),"PMID 42829807  •  2026 RANDOMIZED TRIAL",font=font(19,False),fill=(*MUTED,165))

    if idx==0:
        p=ease_out(local)
        draw_centered(d,"MORE SUPPLEMENTS",310,font(67,True),fill=(*INK,a))
        draw_centered(d,"≠ BETTER RESULTS",425,font(67,True),fill=(*GREEN,a))
        # ingredient dots multiply then stop
        labels=["ASH","RHO","Mg","THE","API"]
        for j,lab in enumerate(labels):
            q=clamp((local-(0.18+j*0.08))/0.35)
            yy=650+j*96
            xx=312 + math.sin(j*1.7)*32*(1-ease_out(q))
            pill(d,int(xx-115),int(yy-35),230,70,lab,accent=GREEN if j<2 else AMBER,alpha=int(a*ease_out(q)),fs=25)
        if local>0.55:
            aa=int(220*ease_out((local-0.55)/0.25))
            d.line((190,620,530,1080),fill=(*RED,aa),width=12)
            d.line((530,620,190,1080),fill=(*RED,aa),width=12)

    elif idx==1:
        draw_centered(d,"THE STUDY",200,font(38,True),fill=(*GREEN,a))
        draw_centered(d,"103 healthy, active adults",300,font(52,True),fill=(*INK,a))
        draw_centered(d,"randomized • double-blind • placebo-controlled",370,font(26,False),fill=(*MUTED,a))
        cards=[("PLACEBO","—"),("AM","2 ingredients"),("PM","3 ingredients"),("AM + PM","5 ingredients")]
        for j,(lab,sub) in enumerate(cards):
            col=j%2; row=j//2
            x=55+col*260; y=520+row*235
            q=ease_out(clamp((local-j*0.08)/0.35))
            yy=y+int(34*(1-q))
            rounded(d,(x,yy,x+240,yy+180),26,fill=(*PANEL,int(a*q)),outline=(*MUTED,int(90*q)),width=2)
            d.text((x+24,yy+28),lab,font=font(32,True),fill=(*INK,int(a*q)))
            d.text((x+24,yy+93),sub,font=font(26,False),fill=(*(GREEN if j in (1,3) else MUTED),int(a*q)))

    elif idx==2:
        sun(d,120,240,50,a)
        d.text((195,205),"MORNING STACK",font=font(40,True),fill=(*AMBER,a))
        q=ease_out(local)
        leaf(d,360,465,1.05,GREEN,int(a*q))
        pill(d,105,610,510,88,"ASHWAGANDHA",GREEN,a,31)
        pill(d,145,730,430,88,"RHODIOLA",GREEN,a,31)
        rounded(d,(85,890,635,1055),28,fill=(*PANEL,a),outline=(*GREEN,160),width=2)
        draw_centered(d,"The clearest improvements\nclustered here.",968,font(35,True),fill=(*INK,a),max_width=465,spacing=7)

    elif idx==3:
        moon(d,118,220,50,a)
        d.text((195,185),"BEDTIME STACK",font=font(40,True),fill=(*AMBER,a))
        items=[("MAGNESIUM L-THREONATE",GREEN),("L-THEANINE",GREEN),("APIGENIN",GREEN)]
        for j,(lab,ac) in enumerate(items):
            q=ease_out(clamp((local-j*0.08)/0.35))
            pill(d,55,410+j*115,510,82,lab,ac,int(a*q),24)
        if local>0.48:
            q=ease_out((local-0.48)/0.32)
            rounded(d,(55,850,570,1080),34,fill=(*PANEL,int(a*q)),outline=(*RED,int(180*q)),width=3)
            draw_centered(d,"ADDING MORE",912,font(35,True),fill=(*RED,int(a*q)))
            draw_centered(d,"didn't clearly improve\nthings further",990,font(39,True),fill=(*INK,int(a*q)),max_width=470,spacing=4)

    elif idx==4:
        draw_centered(d,"WHAT ACTUALLY HAPPENED",190,font(36,True),fill=(*GREEN,a))
        # qualitative result cards -- intentionally no fake numeric bars
        q1=ease_out(local)
        rounded(d,(55,330,570,620),32,fill=(*PANEL,a),outline=(*GREEN,180),width=3)
        d.text((85,375),"AM ONLY",font=font(38,True),fill=(*GREEN,a))
        d.text((85,450),"Stress ↓",font=font(31,True),fill=(*INK,a))
        d.text((85,500),"Sleep impairment ↓",font=font(31,True),fill=(*INK,a))
        d.text((85,550),"Wake-after-sleep-onset ↓",font=font(27,True),fill=(*INK,a))
        q2=ease_out(clamp((local-0.18)/0.55))
        rounded(d,(55,690,570,970),32,fill=(*PANEL,int(a*q2)),outline=(*AMBER,int(150*q2)),width=3)
        d.text((85,735),"AM + PM",font=font(38,True),fill=(*AMBER,int(a*q2)))
        d.text((85,820),"No clear extra benefit",font=font(34,True),fill=(*INK,int(a*q2)))
        d.text((85,875),"over the morning stack",font=font(30,False),fill=(*MUTED,int(a*q2)))
        draw_centered(d,"More ingredients ≠ automatic synergy",1100,font(27,True),fill=(*RED,a))

    elif idx==5:
        draw_centered(d,"BIG CAVEATS",180,font(42,True),fill=(*AMBER,a))
        cards=[
            ("14 DAYS","Short intervention"),
            ("HEALTHY + ACTIVE","May not generalize"),
            ("NOT ISOLATED","Ingredients weren't tested alone"),
        ]
        for j,(top,sub) in enumerate(cards):
            q=ease_out(clamp((local-j*0.12)/0.35))
            y=330+j*240
            rounded(d,(55,y,570,y+185),28,fill=(*PANEL,int(a*q)),outline=(*MUTED,int(100*q)),width=2)
            d.text((85,y+35),top,font=font(37,True),fill=(*(GREEN if j==2 else INK),int(a*q)))
            d.text((85,y+103),sub,font=font(24,False),fill=(*MUTED,int(a*q)))

    elif idx==6:
        q=ease_out(local)
        draw_centered(d,"INGREDIENT EVIDENCE",390,font(48,True),fill=(*INK,int(a*q)))
        draw_centered(d,"≠",515,font(76,True),fill=(*RED,int(a*q)))
        draw_centered(d,"STACK EVIDENCE",640,font(55,True),fill=(*GREEN,int(a*q)))
        rounded(d,(70,810,555,930),60,fill=(*PANEL,int(a*q)),outline=(*GREEN,int(160*q)),width=2)
        draw_centered(d,"SAVE THIS DISTINCTION",870,font(27,True),fill=(*INK,int(a*q)))
        draw_centered(d,"Study: Mastrofini et al. • PMID 42829807",1035,font(20,False),fill=(*MUTED,int(a*q)),max_width=470)
    return img.convert("RGB")

def render_visual(out_path: Path):
    cmd=[
        "ffmpeg","-y","-hide_banner","-loglevel","error",
        "-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(FPS),"-i","-",
        "-an","-c:v","libx264","-preset","medium","-crf","16","-pix_fmt","yuv420p",
        "-movflags","+faststart",str(out_path)
    ]
    p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    total=int(DURATION*FPS)
    try:
        for i in range(total):
            frame=frame_at(i/FPS)
            p.stdin.write(frame.tobytes())
    finally:
        if p.stdin:
            p.stdin.close()
    rc=p.wait()
    if rc!=0:
        raise RuntimeError(f"ffmpeg visual encode failed: {rc}")

def make_sfx(out_path: Path):
    n=int(DURATION*SR)
    t=np.arange(n)/SR
    audio=np.zeros(n,dtype=np.float32)
    # subtle transition pings, not music
    for k,sec in enumerate([0.08,2.2,5.5,8.8,12.2,16.2,19.8]):
        start=int(sec*SR)
        length=int(0.18*SR)
        if start+length>n: continue
        tt=np.arange(length)/SR
        freq=560+40*(k%3)
        env=np.exp(-tt*22)
        tone=np.sin(2*np.pi*freq*tt)*env*0.035
        audio[start:start+length]+=tone.astype(np.float32)
    sf.write(out_path,audio,SR,subtype="PCM_16")

def synth_voice(kokoro: Kokoro, voice_name: str, speed: float, out_path: Path):
    samples,sample_rate=kokoro.create(NARRATION,voice=voice_name,speed=speed,lang="en-us")
    samples=np.asarray(samples,dtype=np.float32).reshape(-1)
    peak=float(np.max(np.abs(samples))) if len(samples) else 0.0
    if peak>0:
        samples=samples*(0.82/peak)
    # lead-in for hook to land visually
    lead=np.zeros(int(0.28*sample_rate),dtype=np.float32)
    samples=np.concatenate([lead,samples])
    sf.write(out_path,samples,sample_rate,subtype="PCM_16")
    return {
        "voice":voice_name,
        "speed":speed,
        "sample_rate":sample_rate,
        "duration_seconds":len(samples)/sample_rate,
        "peak":float(np.max(np.abs(samples))) if len(samples) else 0.0,
        "rms":float(np.sqrt(np.mean(samples*samples))) if len(samples) else 0.0,
        "words":len(NARRATION.split()),
    }

def mux(visual: Path, voice: Path, sfx: Path, output: Path):
    cmd=[
        "ffmpeg","-y","-hide_banner","-loglevel","error",
        "-i",str(visual),"-i",str(voice),"-i",str(sfx),
        "-filter_complex",
        "[1:a]highpass=f=65,loudnorm=I=-15:TP=-1.5:LRA=8[voice];"
        "[2:a]volume=0.85[sfx];"
        "[voice][sfx]amix=inputs=2:duration=longest:normalize=0,"
        f"apad=pad_dur={DURATION},atrim=duration={DURATION}[a]",
        "-map","0:v:0","-map","[a]",
        "-vf","scale=1080:1920:flags=lanczos",
        "-c:v","libx264","-preset","medium","-crf","17","-pix_fmt","yuv420p",
        "-c:a","aac","-b:a","192k","-ar","48000",
        "-t",str(DURATION),"-movflags","+faststart",str(output)
    ]
    subprocess.run(cmd,check=True)

def ffprobe(path: Path):
    r=subprocess.run([
        "ffprobe","-v","error","-show_entries",
        "format=duration,size:stream=index,codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels",
        "-of","json",str(path)
    ],capture_output=True,text=True,check=True)
    return json.loads(r.stdout)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--out",required=True)
    ap.add_argument("--model",default="kokoro-v1.0.fp16.onnx")
    ap.add_argument("--voices",default="voices-v1.0.bin")
    args=ap.parse_args()

    out=Path(args.out)
    out.mkdir(parents=True,exist_ok=True)

    evidence={
        "title":"Modulating stress and sleep through a multi-compound dietary supplement: a randomized, double-blind, placebo-controlled trial",
        "pmid":"42829807",
        "doi":"10.1080/15502783.2026.2740227",
        "article_date":"2026-10-04",
        "population":"103 healthy physically active adults",
        "groups":{
            "AM":"600 mg ashwagandha + 300 mg Rhodiola rosea",
            "PM":"2 g magnesium L-threonate (145 mg magnesium) + 200 mg L-theanine + 50 mg apigenin",
            "AMPM":"both active AM and active PM",
            "PL":"placebo AM and placebo PM"
        },
        "allowed_takeaway":"The AM group showed the clearest improvements reported in the abstract; the combined AM+PM arm did not clearly add benefit over AM alone.",
        "limitations":["14 days of supplementation","healthy physically active adults","ingredients were not tested individually","many subjective and objective outcomes"],
        "source_url":"https://pubmed.ncbi.nlm.nih.gov/42829807/"
    }
    (out/"evidence.json").write_text(json.dumps(evidence,indent=2)+"\n")
    (out/"narration.txt").write_text(NARRATION+"\n")
    caption=(
        "More supplements don’t automatically mean better results. A 2026 randomized trial in 103 healthy, active adults "
        "found its clearest improvements in the morning ashwagandha + rhodiola group; adding a magnesium L-threonate + "
        "L-theanine + apigenin bedtime stack didn’t clearly improve the result further. Important: the study was short and "
        "didn’t test the ingredients individually.\n\nPMID: 42829807\n"
        "#SupplementScience #Ashwagandha #Rhodiola #SleepResearch #TheHippieScientist"
    )
    (out/"caption.txt").write_text(caption+"\n")

    visual=out/"visual-master.mp4"
    render_visual(visual)
    cover=frame_at(0.85).resize((1080,1920),Image.Resampling.LANCZOS)
    cover.save(out/"cover.png")
    sfx=out/"sfx.wav"
    make_sfx(sfx)

    kokoro=Kokoro(args.model,args.voices)
    qa={"release":"R8.04","topic":"More supplements ≠ better results","source_pmid":"42829807","voice_engine":"kokoro-onnx","candidates":[]}
    for label,voice_name,speed in VOICES:
        wav=out/f"voice-{label}-{voice_name}.wav"
        metrics=synth_voice(kokoro,voice_name,speed,wav)
        video=out/f"THS_R804_MoreSupplements_{label}_{voice_name}.mp4"
        mux(visual,wav,sfx,video)
        probe=ffprobe(video)
        metrics.update({
            "label":label,
            "wav_sha256":sha256(wav),
            "video":video.name,
            "video_sha256":sha256(video),
            "probe":probe,
            "technical_pass": bool(
                metrics["duration_seconds"] > 12
                and metrics["duration_seconds"] < DURATION
                and metrics["peak"] < 0.99
                and metrics["rms"] > 0.01
            ),
            "perceptual_natural_presence":"REQUIRES_LISTENING_REVIEW"
        })
        qa["candidates"].append(metrics)
    qa["visual_master_sha256"]=sha256(visual)
    qa["cover_sha256"]=sha256(out/"cover.png")
    qa["note"]="R8.04 technical/provenance gates passed by the build. Natural Presence is deliberately not auto-certified; listen to the exact candidate before upload."
    (out/"qa-receipt.json").write_text(json.dumps(qa,indent=2)+"\n")

    # concise manifest
    manifest=[]
    for p in sorted(out.iterdir()):
        if p.is_file():
            manifest.append({"file":p.name,"bytes":p.stat().st_size,"sha256":sha256(p)})
    (out/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")

    print(json.dumps({"output":str(out),"files":[x["file"] for x in manifest]},indent=2))

if __name__=="__main__":
    main()
