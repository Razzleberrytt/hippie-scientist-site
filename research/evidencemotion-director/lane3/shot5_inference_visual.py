#!/usr/bin/env python3
"""Research-only source-bound structure-vs-effect craft treatment.

Native 1080x1920 H.264, no narration/claim/caption editing. Source film
SHA and exact 2D chemical record frame are pinned before any art is drawn.
Modifies only the science-body stage in sentence_5 [702,821). No publishing.
"""
from __future__ import annotations
import argparse, hashlib, io, json, math, os, subprocess, tempfile
from fractions import Fraction
from pathlib import Path

SOURCE_SHA = '53bf75bfcd9752917f7f666afdb86fda493b78ecdc3c94e005a62da70ef39642'
MOL_SHA = '150ccd331963beab2481ad47c36e1e171db6bdd37e4d50746a3d6b4b5be60bcb'
INCHIKEY = 'RYENLSMHLCNXJT-CYXFISRXSA-N'
ORIGINAL_WAV_SHA = '9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435'
W,H,FPS,N = 1080,1920,30,1031
START,END,NEGATION = 702,821,772
FULL_SILENT_NEGATION = 'STRUCTURE ≠ HUMAN EXPERIENCE'
FULL_NEGATION_FONT_SIZE = 44  # projects to 15.28px at 375px phone width
FRAME_SIZE = W*H*3
SCHEMA = 'ths-lane3-structure-vs-experience-optin-research-v1'

class ResearchHold(ValueError):pass

def digest(p):
    h=hashlib.sha256()
    with open(p,'rb') as f:
        for b in iter(lambda:f.read(1<<20),b''):h.update(b)
    return h.hexdigest()

def freeze(source):
    source=Path(source)
    if not source.is_file() or digest(source)!=SOURCE_SHA:
        raise ResearchHold('SOURCE_FILM_SHA_CHANGED')
    p=subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-count_frames',
        '-show_entries','stream=codec_name,width,height,avg_frame_rate,nb_read_frames',
        '-of','json',str(source)],capture_output=True,text=True,check=True)
    data=json.loads(p.stdout)['streams'][0]
    if (data['codec_name'],data['width'],data['height'],data['avg_frame_rate'],int(data['nb_read_frames']))!=('h264',W,H,'30/1',N):
        raise ResearchHold('SOURCE_FRAME_GRID_CHANGED')
    return True

def one_source_frame(source,number):
    # Single exact source frame obtained by sequential decode, not inaccurate
    # random seeks into H.264 P-/B-frame GOPs.
    cmd=['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-xerror','-i',str(source),
         '-map','0:v:0','-vf',f'select=eq(n\\,{number})',
         '-vsync','0','-f','rawvideo','-pix_fmt','rgb24','-']
    raw=subprocess.run(cmd,capture_output=True,check=True).stdout
    if len(raw)!=FRAME_SIZE:raise ResearchHold('SOURCE_GRAPH_FRAME_DECODE_FAILURE')
    from PIL import Image
    return Image.frombytes('RGB',(W,H),raw)

def palette_background():
    import numpy as np
    from PIL import Image
    xx,yy=np.meshgrid(np.arange(W),np.arange(390,1120))
    glow=np.exp(-(((xx-530)/735)**2+((yy-690)/600)**2))
    rgb=np.stack([3+8*glow,13+20*glow,22+28*glow],axis=-1).clip(0,255).astype('uint8')
    return Image.fromarray(rgb,'RGB')

def smoothstep(x):
    x=max(0.,min(1.,x));return x*x*(3-2*x)

def pinned_diagram(molecule):
    p=Path(molecule)
    if not p.is_file() or digest(p)!=MOL_SHA:
        raise ResearchHold('SOURCE_MOLECULE_SHA_CHANGED')
    from PIL import Image
    from rdkit import Chem
    from rdkit.Chem import AllChem
    from rdkit.Chem.Draw import rdMolDraw2D
    mol=Chem.MolFromMolBlock(p.read_text('utf-8'),removeHs=False)
    if mol is None or not mol.GetConformer().Is3D() or Chem.MolToInchiKey(Chem.RemoveHs(mol))!=INCHIKEY:
        raise ResearchHold('SOURCE_CHEMISTRY_STEREO_CHANGED')
    heavy=Chem.RemoveHs(Chem.Mol(mol))
    AllChem.Compute2DCoords(heavy)
    canvas=rdMolDraw2D.MolDraw2DCairo(650,400)
    opts=canvas.drawOptions()
    opts.clearBackground=False
    opts.bondLineWidth=4
    opts.minFontSize=19
    opts.maxFontSize=28
    opts.padding=.09
    opts.setAtomPalette({6:(.8,.87,.89),7:(.08,.47,.78),8:(.92,.33,.12)})
    rdMolDraw2D.PrepareAndDrawMolecule(canvas,heavy)
    canvas.FinishDrawing()
    return Image.open(io.BytesIO(canvas.GetDrawingText())).convert('RGBA')


def complete_negation_after_spoken_not(frame_no):
    """Full, same-shot silent proposition appears only after spoken 'not'.

    This proves source intent, never pixel OCR, human comprehension, or film QA.
    """
    if not START <= frame_no < END:
        raise ResearchHold('OUTSIDE_EDIT_INTERVAL')
    return FULL_SILENT_NEGATION if frame_no >= NEGATION else None


def sample_treatment(base_frame,graph_image,science_bg,frame_no):
    if not START<=frame_no<END:raise ResearchHold('OUTSIDE_EDIT_INTERVAL')
    from PIL import Image,ImageDraw,ImageFont
    frame=base_frame.copy()
    frame.paste(science_bg,(0,390))
    draw=ImageDraw.Draw(frame)
    fo='/usr/share/fonts/truetype/dejavu/'
    bold=lambda n:ImageFont.truetype(fo+'DejaVuSans-Bold.ttf',n)
    normal=lambda n:ImageFont.truetype(fo+'DejaVuSans.ttf',n)
    post=frame_no>=NEGATION
    advance=smoothstep((frame_no-START)/(END-START))
    reveal=smoothstep((frame_no-NEGATION)/15) if post else 0
    draw.rounded_rectangle((64,432,1016,1060),radius=29,fill=(9,32,45),outline=(48,104,117),width=3)
    draw.rectangle((88,459,994,463),fill=(77,196,181))
    draw.text((106,481),'STRUCTURE',font=bold(47),fill=(89,211,194))
    # Rigid chemically verified RDKit connectivity; the source graph moves
    # as ONE raster. No fake bond movement, ligand docking or transformation.
    mw=round(650-150*reveal);mh=round(400-90*reveal)
    mol=graph_image.resize((mw,mh),Image.Resampling.LANCZOS)
    mx=round(167-76*reveal+5*math.sin(math.pi*advance))
    my=round(570+45*reveal)
    draw.rounded_rectangle((mx-12,my-8,mx+mw+12,my+mh+12),radius=16,
                           fill=(10,34,49),outline=(48,106,117),width=2)
    frame.paste(mol,(mx,my),mol)
    draw=ImageDraw.Draw(frame)
    if post:
        alpha=smoothstep((frame_no-NEGATION)/9)
        if alpha>.01:
            draw.line((657,546,657,972),fill=(56,144,151),width=5)
            amber=(round(24+228*alpha),round(68+118*alpha),round(76+39*alpha))
            draw.text((753,616),'?',font=bold(180),fill=amber)
            draw.text((735,831),'NOT SHOWN',font=bold(41),fill=(232,242,235))
        # The original lower-caption zone is source-preserved, but its
        # "≠ HUMAN EXPERIENCE" omitted the subject within this shot.
        # Co-locate the COMPLETE assertion in the science-body panel;
        # do not make viewers carry a subject across the scene cut.
        proposition=complete_negation_after_spoken_not(frame_no)
        font=bold(FULL_NEGATION_FONT_SIZE)
        width=draw.textbbox((0,0),proposition,font=font)[2]
        if width>874:
            raise ResearchHold('FULL_NEGATION_EXCEEDS_SAFE_PHONE_WIDTH')
        draw.rounded_rectangle((92,963,1000,1041),radius=14,
                               fill=(12,40,48),outline=(90,184,169),width=2)
        draw.text((106,978),proposition,font=font,fill=(244,248,246))
        # Original source movie's lower caption-zone pixels remain unchanged.
    return frame


def verify_decoded_presentation_grid(decoded, time_base, *, fps, expected_frames):
    """Fail closed if actual decoded presentation ticks deviate from native CFR.

    This checks only the short silent research clip; Lane 4 independently
    owns the complete audio-containing film PTS/shot/caption validations.
    """
    if not isinstance(decoded, list) or len(decoded)!=expected_frames:
        raise ResearchHold('ENCODED_SCENE_TIMESTAMP_COUNT_CHANGED')
    try:
        tick=Fraction(time_base)
    except (ValueError,TypeError,ZeroDivisionError) as exc:
        raise ResearchHold('ENCODED_SCENE_TIME_BASE_INVALID') from exc
    if tick<=0 or type(fps) is not int or fps<=0:
        raise ResearchHold('ENCODED_SCENE_TIME_BASE_INVALID')
    tolerance=tick/2  # exact rational nearest-tick quantization bound
    previous=None
    stamps=[]
    for frame in decoded:
        stamp=frame.get('best_effort_timestamp') if isinstance(frame,dict) else None
        if type(stamp) is not int:
            raise ResearchHold('ENCODED_SCENE_TIMESTAMP_MISSING_OR_INVALID')
        if previous is not None and stamp<=previous:
            raise ResearchHold('ENCODED_SCENE_TIMESTAMP_NOT_STRICTLY_INCREASING')
        stamps.append(stamp)
        previous=stamp
    for index, stamp in enumerate(stamps):
        if abs(Fraction(stamp)*tick-Fraction(index,fps))>tolerance:
            raise ResearchHold('ENCODED_SCENE_PRESENTATION_GRID_CHANGED')
    return True


def verify_native_silent_clip(path, *, width=W, height=H, fps=FPS, frames=END-START):
    """Read back the *encoded* preview, not just the writer's exit status.

    Width/height/frame overrides exist only for tiny physical negative fixtures.
    render() always uses the locked 1080x1920, 30fps, 119-frame contract.
    """
    path=Path(path)
    if not path.is_file() or path.stat().st_size==0:
        raise ResearchHold('ENCODED_SCENE_MISSING_OR_EMPTY')
    try:
        probe=subprocess.run(['ffprobe','-v','error','-count_frames','-show_entries',
          'stream=codec_name,codec_type,width,height,avg_frame_rate,nb_read_frames,time_base',
          '-of','json',str(path)],capture_output=True,text=True,check=True)
        all_streams=json.loads(probe.stdout)
        streams=all_streams['streams']
        if len(streams)!=1 or streams[0].get('codec_type')!='video':
            raise ResearchHold('SILENT_SCENE_STREAMS_CHANGED')
        stream=streams[0]
        actual=(stream.get('codec_name'),stream.get('width'),stream.get('height'),
                stream.get('avg_frame_rate'),int(stream.get('nb_read_frames',-1)))
        expected=('h264',width,height,f'{fps}/1',frames)
        if actual!=expected:
            raise ResearchHold('ENCODED_SCENE_FRAME_GRID_CHANGED')
        # A separate VIDEO-ONLY frame query is deliberate: filtering the
        # stream-inventory query to v:0 would hide unexpected AAC audio.
        ticks=subprocess.run(['ffprobe','-v','error','-select_streams','v:0',
          '-show_frames','-show_entries','frame=best_effort_timestamp',
          '-of','json',str(path)],capture_output=True,text=True,check=True)
        video_frames=json.loads(ticks.stdout).get('frames')
        verify_decoded_presentation_grid(video_frames,
            stream.get('time_base'),fps=fps,expected_frames=frames)
        subprocess.run(['ffmpeg','-nostdin','-v','error','-xerror','-i',str(path),
          '-map','0:v:0','-f','null','-'],capture_output=True,check=True)
    except ResearchHold:
        raise
    except (OSError,ValueError,KeyError,subprocess.CalledProcessError) as exc:
        raise ResearchHold('ENCODED_SCENE_DECODE_OR_PROBE_FAILED') from exc
    return True



def commit_verified_silent_scene(stage, output, *, width=W, height=H, fps=FPS, frames=END-START):
    """Verify staged encoded bytes and link to a *new* output without clobber.

    Failures NEVER unlink or rewrite the destination. render() creates the stage
    in a private same-filesystem temp directory, then removes that directory.
    Test-only expected-grid overrides permit tiny genuine FFmpeg fixtures.
    """
    stage,output=Path(stage),Path(output)
    if stage.resolve()==output.resolve():
        raise ResearchHold('STAGE_CANNOT_BE_OUTPUT')
    verify_native_silent_clip(stage,width=width,height=height,fps=fps,frames=frames)
    staged_sha=digest(stage)
    try:
        # Unlike os.replace()/ffmpeg -y, this is atomic no-clobber even if the
        # final name is created AFTER the original preflight.
        os.link(stage,output)
    except FileExistsError as exc:
        raise ResearchHold('OUTPUT_APPEARED_AFTER_PREFLIGHT') from exc
    except OSError as exc:
        raise ResearchHold('ATOMIC_OUTPUT_LINK_FAILED') from exc
    return staged_sha


def render(source,molecule,output):
    source=Path(source);output=Path(output);molecule=Path(molecule)
    if output.resolve() in (source.resolve(),molecule.resolve()):
        raise ResearchHold('OUTPUT_OVERWRITES_SOURCE')
    if output.exists() or output.is_symlink():
        raise ResearchHold('FRESH_OUTPUT_REQUIRED')
    freeze(source)
    from PIL import Image
    output.parent.mkdir(parents=True,exist_ok=True)
    crop=pinned_diagram(molecule)
    bg=palette_background()
    # A 0700-owned staging directory prevents final-name overwrites and
    # prevents a concurrent render from colliding with another's temporary MP4.
    with tempfile.TemporaryDirectory(dir=output.parent,prefix='.lane3-scene-') as temp:
        stage=Path(temp)/'silent-scene.mp4'
        args=['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-xerror','-i',str(source),
          '-map','0:v:0','-vf',f'select=between(n\\,{START}\\,{END-1})',
          '-vsync','0','-f','rawvideo','-pix_fmt','rgb24','-']
        # -n is an additional fail-closed guard; stage must never preexist.
        command=['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-n','-f','rawvideo',
          '-pix_fmt','rgb24','-s',f'{W}x{H}','-r','30','-i','-', '-an','-c:v','libx264',
          '-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(stage)]
        dec=enc=None
        # File sinks avoid deadlocking on an unconsumed stderr=PIPE buffer.
        with open(Path(temp)/'decode.log','wb') as decerr, open(Path(temp)/'encode.log','wb') as encerr:
            try:
                dec=subprocess.Popen(args,stdout=subprocess.PIPE,stderr=decerr)
                enc=subprocess.Popen(command,stdin=subprocess.PIPE,stderr=encerr)
                for f in range(START,END):
                    payload=dec.stdout.read(FRAME_SIZE)
                    if len(payload)!=FRAME_SIZE:raise ResearchHold('SOURCE_SCENE_DECODE_SHORT')
                    image=Image.frombytes('RGB',(W,H),payload)
                    changed=sample_treatment(image,crop,bg,f)
                    enc.stdin.write(changed.tobytes())
                if dec.stdout.read(1) or dec.wait()!=0:
                    raise ResearchHold('SOURCE_SCENE_DECODE_EXTRA_OR_FAILED')
                enc.stdin.close()
                if enc.wait()!=0:raise ResearchHold('SILENT_SCENE_ENCODING_FAILED')
            except BaseException:
                for process in (dec,enc):
                    if process is not None and process.poll() is None:process.kill()
                for process in (dec,enc):
                    if process is not None:process.wait()
                raise
            finally:
                for pipe in (dec.stdout if dec else None,enc.stdin if enc else None):
                    if pipe and not pipe.closed:pipe.close()
        # No output name has been touched yet. Reprove pinned source identities
        # before exposing a verified clip, then link atomically with NO overwrite.
        if digest(source)!=SOURCE_SHA or digest(molecule)!=MOL_SHA:
            raise ResearchHold('SOURCE_IDENTITY_CHANGED_DURING_RENDER')
        final_sha=commit_verified_silent_scene(stage,output,
            width=W,height=H,fps=FPS,frames=END-START)
    return {'schema':SCHEMA,'sourceFilmSha256':SOURCE_SHA,'silentSceneSha256':final_sha,
       'originalNarrationSha256':ORIGINAL_WAV_SHA,'moleculeSha256':MOL_SHA,'width':W,'height':H,'fps':FPS,
       'startFrame':START,'endFrameExclusive':END,'negationFirstFrame':NEGATION,
       'diagramDerivedFromPinnedMol':True,'scienceApproved':False,'craftApproved':False,
       'phonePlaybackApproved':False,'mayPublish':False,'excellentCertified':False}

if __name__=='__main__':
    ap=argparse.ArgumentParser()
    ap.add_argument('--source',type=Path,required=True);ap.add_argument('--molecule',type=Path,required=True);ap.add_argument('--output',type=Path,required=True)
    a=ap.parse_args()
    print(json.dumps(render(a.source,a.molecule,a.output),indent=2))
