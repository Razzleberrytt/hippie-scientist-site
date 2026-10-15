#!/usr/bin/env python3
"""New research candidates from recovered WAV and existing verified graphs.

Two CPU treatments share narration-first timing, not a claim of V5 recovery or
premium acceptance. Native pixels are drawn at output size, never upscaled.
"""
import argparse
from functools import lru_cache
import hashlib
import io
import json
import math
from pathlib import Path
import subprocess
import time

from autonomous_script_asr_research import LINES, WAV_SHA, tokens, source_check
from exact_wav_alignment import inspect_alignment
from editorial_2d_cpu_research import smooth

FPS = 30
TREATMENTS = {'atlas', 'specimen'}
AUDIO_FILTER = 'volume=10dB,alimiter=limit=0.80:attack=5:release=50:level=false:latency=true'


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def timeline(alignment):
    words = alignment['wordAlignment']
    if [w['word'] for w in words] != tokens(' '.join(LINES)):
        raise ValueError('TREATMENT_HOLD:SCRIPT_DRIFT')
    scenes, cursor = [], 0
    for i, line in enumerate(LINES):
        count = len(tokens(line))
        caption_words, token_cursor = [], cursor
        for word in line.split():
            n = len(tokens(word))
            caption_words.append({'text':word,'startSec':words[token_cursor]['startMs']/1000,
                                  'endSec':words[token_cursor+n-1]['endMs']/1000})
            token_cursor += n
        scenes.append({'id': f'sentence_{i+1}', 'line': line,
                       'startSec': words[cursor]['startMs']/1000,
                       'speechEndSec': words[cursor+count-1]['endMs']/1000,
                       'wordStart': cursor, 'wordEnd': cursor+count-1,
                       'captionWords':caption_words})
        cursor += count
    # Preserve the real long source-reading pause; do not move sentence six.
    scenes.insert(5, {'id': 'source_hold', 'line': '',
                     'startSec': scenes[4]['speechEndSec'],
                     'speechEndSec': scenes[5]['startSec']})
    scenes[0]['startSec'] = 0
    for i, scene in enumerate(scenes):
        scene['endSec'] = scenes[i+1]['startSec'] if i+1 < len(scenes) else alignment['sampleCount']/24000
    return scenes


def fonts(root):
    from PIL import ImageFont
    base = Path(root)
    paths = [base/'DejaVuSans.ttf', base/'DejaVuSans-Bold.ttf']
    if not all(p.is_file() for p in paths):
        raise ValueError('TREATMENT_HOLD:PINNABLE_FONTS_REQUIRED')
    return lambda size, bold=False: ImageFont.truetype(str(paths[int(bold)]), size), {p.name: sha(p) for p in paths}


def chemistry_assets(light=False):
    from rdkit import Chem
    from rdkit.Chem import AllChem
    from rdkit.Chem.Draw import rdMolDraw2D
    from PIL import Image
    import numpy as np
    from verified_molecular_comparison import approved_comparison
    assets = {}
    for name, entry in approved_comparison().items():
        if not isinstance(entry, dict) or 'mol' not in entry:
            continue
        mol = entry['mol']
        source = entry['source']
        canvas = rdMolDraw2D.MolDraw2DCairo(1200, 900)
        opts = canvas.drawOptions()
        opts.clearBackground = False
        opts.bondLineWidth = 5
        opts.minFontSize = 48
        opts.maxFontSize = 64
        foreground=(.1,.17,.2) if light else (.8,.87,.89)
        opts.setAtomPalette({1:foreground,6:foreground,7:(.08,.47,.78),8:(.92,.33,.12)})
        rdMolDraw2D.PrepareAndDrawMolecule(canvas, mol, highlightAtoms=entry['free_oh_indices'],
            highlightAtomColors={i:(.98,.63,.27,.6) for i in entry['free_oh_indices']})
        canvas.FinishDrawing()
        diagram = Image.open(io.BytesIO(canvas.GetDrawingText())).convert('RGBA')
        diagram_points = [[canvas.GetDrawCoords(i).x,canvas.GetDrawCoords(i).y] for i in range(mol.GetNumAtoms())]
        model = Chem.AddHs(mol)
        params = AllChem.ETKDGv3()
        params.randomSeed = 6743
        if AllChem.EmbedMolecule(model, params) != 0:
            raise ValueError('TREATMENT_HOLD:COMPUTED_CONFORMER_FAILED')
        if AllChem.MMFFOptimizeMolecule(model, maxIters=1000) != 0:
            raise ValueError('TREATMENT_HOLD:CONFORMER_NOT_CONVERGED')
        coords = np.array(model.GetConformer().GetPositions())[:mol.GetNumAtoms()]
        coords -= coords.mean(axis=0)
        # Camera basis only: face the broad molecular plane without reflecting
        # stereochemistry or changing a bond length. Stable signs aid replay.
        _,_,basis = np.linalg.svd(coords,full_matrices=False)
        for axis in (0,1):
            if basis[axis,np.argmax(np.abs(basis[axis]))]<0:
                basis[axis]*=-1
        basis[2]=np.cross(basis[0],basis[1])
        if entry['free_oh_indices']:
            oh=entry['free_oh_indices'][0]
            parent=mol.GetAtomWithIdx(oh).GetNeighbors()[0].GetIdx()
            if np.dot(coords[oh]-coords[parent],basis[2])<0:
                # View the actual OH bond from its exposed side. Flip two
                # camera axes together, preserving chirality (determinant +1).
                basis[1]*=-1
                basis[2]*=-1
        assets[name] = {'mol':mol, 'xyz':coords@basis.T, 'viewBasis':basis.tolist(), 'diagram':diagram,
                        'oh': entry['free_oh_indices'], 'source':source, 'diagramAtomXY':diagram_points,
                        'conformerMolBlock': Chem.MolToMolBlock(model)}
    return assets


@lru_cache(maxsize=384)
def sphere(radius, element):
    """Diffuse key + broad specular lobe on a sphere; no fake free particles."""
    import numpy as np
    from PIL import Image
    r = radius
    y,x = np.mgrid[-r:r+1,-r:r+1]/r
    z = np.sqrt(np.maximum(0,1-x*x-y*y))
    diffuse = np.maximum(0, -.45*x-.55*y+.70*z)
    specular = np.maximum(0, -.25*x-.35*y+.90*z)**28
    colors = {'C':(82,113,130), 'N':(43,155,219), 'O':(240,108,66)}
    base = np.array(colors[element])
    rgb = np.clip(base[None,None,:]*(.18+.77*diffuse[:,:,None])+110*specular[:,:,None],0,255)
    alpha = np.clip((1-x*x-y*y)*r*2,0,1)*255
    return Image.fromarray(np.dstack((rgb,alpha)).astype('uint8'),'RGBA')


def spatial(asset, angle, size, detail=False):
    import numpy as np
    from PIL import Image,ImageDraw
    w,h = size
    c,s = math.cos(angle),math.sin(angle)
    rot = np.array([[c,0,s],[0,1,0],[-s,0,c]])
    xyz = asset['xyz'] @ rot
    # Fit the projected complete heavy-atom graph, including atom radii. Detail
    # views deliberately crop and carry the explicit detail disclosure.
    perspective = 18/(18-xyz[:,2])
    projected = xyz[:,:2]*perspective[:,None]
    extent = np.ptp(projected,axis=0)+1.2
    detail=float(detail)
    if not 0<=detail<=1:
        raise ValueError('TREATMENT_HOLD:INVALID_CAMERA_DETAIL')
    scale = min((w-40)/extent[0],(h-40)/extent[1]) * (.90+.65*detail)
    if detail:
        xyz = xyz - xyz[asset['oh'][0]]*.65*detail
    points = np.column_stack((w/2+xyz[:,0]*scale*perspective,
                              h/2-xyz[:,1]*scale*perspective))
    image = Image.new('RGBA',(w,h),(0,0,0,0))
    draw = ImageDraw.Draw(image)
    objects = []
    for b in asset['mol'].GetBonds():
        a,z = b.GetBeginAtomIdx(),b.GetEndAtomIdx()
        objects.append(((xyz[a,2]+xyz[z,2])/2,'bond',a,z))
    for i in range(len(xyz)):
        objects.append((xyz[i,2],'atom',i,i))
    for _,kind,a,b in sorted(objects):
        if kind=='bond':
            p,q = tuple(points[a]),tuple(points[b])
            width = max(3,round(scale*.13))
            draw.line((p,q), fill=(35,61,76,255),width=width+4)
            draw.line((p,q), fill=(139,164,172,255),width=width)
        else:
            element = asset['mol'].GetAtomWithIdx(a).GetSymbol()
            r = max(4,round(scale*(.30 if element=='C' else .34)*perspective[a]))
            tile = sphere(r,element)
            x,y = points[a]
            image.alpha_composite(tile,(round(x)-r,round(y)-r))
    if detail:
        x,y = points[asset['oh'][0]]
        r = max(10,round(scale*.55))
        draw.ellipse((x-r,y-r,x+r,y+r),outline=(255,189,101,255),width=max(2,round(w/300)))
    return image


@lru_cache(maxsize=4)
def background(size):
    import numpy as np
    from PIL import Image
    w,h=size
    y,x=np.mgrid[0:h,0:w]
    illumination=np.exp(-((x-w*.43)/(w*.6))**2-((y-h*.45)/(h*.23))**2)
    rgb=np.stack([6+illumination*9,17+illumination*19,27+illumination*26],axis=-1)
    return Image.fromarray(rgb.astype('uint8'),'RGB').convert('RGBA')


def wrapped(text, font, width):
    lines, line = [], ''
    for word in text.split():
        candidate = (line+' '+word).strip()
        if font.getlength(candidate)>width:
            if not line or font.getlength(word)>width:
                raise ValueError('TREATMENT_HOLD:CAPTION_WORD_TOO_WIDE')
            lines.append(line)
            line=word
        else:
            line=candidate
    return lines+[line] if line else lines


def render_frame(t, scenes, assets, treatment, size, font, *, annotations=None):
    from PIL import Image,ImageDraw
    w,h = size
    scale = w/1080
    f = lambda n,b=False:font(max(1,round(n*scale)),b)
    def pos(x,y): return (round(x*scale),round(y*scale))
    scene = next(s for s in scenes if s['startSec']<=t<s['endSec'])
    # Validate spoken cues before any hook, label, phase-cut or caption uses
    # them; the genuine silent source-reading hold remains cue-free.
    if scene['line'] and not scene.get('captionWords'):
        raise ValueError('TREATMENT_HOLD:MISSING_SPOKEN_WORD_CUES')
    idx = scenes.index(scene)
    p = smooth((t-scene['startSec'])/max(.1,scene['endSec']-scene['startSec']))
    light = treatment=='atlas'
    bg,fg,muted,accent = ((243,239,226),(18,40,49),(65,86,88),(29,117,114)) if light else ((6,17,27),(236,241,233),(151,177,185),(96,216,199))
    image = Image.new('RGB',size,bg).convert('RGBA') if light else background(size).copy()
    draw = ImageDraw.Draw(image)

    def text(xy,wording,*,font,fill,role='science'):
        # Record the very same emitted text/font/bounds, not a separate hand-
        # authored rectangle. This still is not OCR or a comprehension verdict.
        if '\n' in wording:
            spacing=round(8*scale)
            draw.multiline_text(xy,wording,font=font,fill=fill,spacing=spacing)
            box=draw.multiline_textbbox(xy,wording,font=font,spacing=spacing)
        else:
            draw.text(xy,wording,font=font,fill=fill)
            box=draw.textbbox(xy,wording,font=font)
        if annotations is not None and role:
            annotations.append({'role':role,'text':wording,'fontPx':font.size,'boxPx':list(box)})

    text(pos(72,220),'THE HIPPIE SCIENTIST',font=f(27,True),fill=accent,role=None)
    titles = ['What makes\n7-OH different?', 'Look at the\nhydroxyl group.', 'A record of\nconnected atoms.', 'The pose\nis computed.', 'Structure\nis not an effect.', 'CHECK THE SOURCE', 'Look closer.']
    # A semantic reveal must not be spoiled by the header before the narrator
    # says the negation. Keep the original WAV and acoustic cue untouched.
    effect_boundary = None
    if not light and idx == 4:
        effect_boundary = next(w['startSec'] for w in scene['captionWords']
                               if w['text'].casefold() == 'not')
        title = 'What the shape\nshows.' if t < effect_boundary else 'What it cannot\ntell us.'
    else:
        title = titles[idx]
    text(pos(70,292),title,font=f(70 if idx==5 else 74,True),fill=fg,
         role='hook' if idx==0 else 'science')
    is_spatial = not light and idx not in (0,2,4,5)
    if idx==1 and is_spatial:
        text(pos(72,500),'–OH group: oxygen + hydrogen',font=f(36,True),fill=accent)
    hero = assets['7_hydroxymitragynine']
    hero_label = '7-HYDROXYMITRAGYNINE'
    if idx==0 and not light:
        # Answer the *spoken* comparison question with both real, distinct
        # PubChem-identity-locked 2D structures. Two hard-cut identities, never
        # a morph or alleged chemical reaction. Cut precisely on "different".
        boundary=next(w['startSec'] for w in scene['captionWords']
                      if w['text'].casefold().strip('?!.,')=='different')
        is_h=t>=boundary
        source=assets['7_hydroxymitragynine'] if is_h else assets['mitragynine']
        diagram=source['diagram'].resize((round(800*scale),round(600*scale)))
        image.alpha_composite(diagram,pos(35,545))
        draw=ImageDraw.Draw(image)
        text(pos(72,1150),'7-OH • CID 44301524' if is_h else 'MITRAGYNINE • CID 3034396',
             font=f(42,True),fill=accent)
        text(pos(72,1200),'2D source structure • no reaction shown',
             font=f(36),fill=muted,role='disclosure')
    elif idx==4 and not light:
        # The original ending was essentially an empty typographic slide. Put
        # the *actual* source-verified connectivity drawing back on screen,
        # then use one spoken-word-anchored limit-of-inference reveal. A 2D
        # molecular source record is NOT video of a physiological effect.
        boundary=next(w['startSec'] for w in scene['captionWords'] if w['text'].casefold()=='not')
        card=(pos(74,500),pos(838,1095))
        draw.rounded_rectangle((*card[0],*card[1]),radius=round(32*scale),
                               fill=(12,31,43,255),outline=(42,92,101,255),
                               width=max(2,round(3*scale)))
        # Immutable, chemically verified RDKit source, not a guessed brain,
        # receptor, metabolic conversion or generated factual illustration.
        diagram=assets['dark_diagram'].resize((round(688*scale),round(505*scale)))
        image.alpha_composite(diagram,pos(105,567))
        draw=ImageDraw.Draw(image)
        # The line is an inference boundary, not an invented process arrow.
        draw.line((pos(74,1118),pos(838,1118)),fill=accent,width=max(2,round(3*scale)))
        text(pos(108,525),'STRUCTURE',font=f(52,True),fill=accent)
        if t>=boundary:
            # Large distinct payoff precisely on the original narrator's
            # 'not'. Preserve the intact source graph above the boundary.
            text(pos(76,1135),'≠',font=f(98,True),fill=(255,195,126))
            text(pos(212,1170),'HUMAN EXPERIENCE',font=f(46,True),fill=fg)
    elif idx==5:
        text(pos(72,760),'PubChem',font=f(86,True),fill=fg,role='source')
        text(pos(72,710),'Chemical structure database',font=f(36),fill=muted,role='source')
        text(pos(72,880),'CID 44301524',font=f(51,True),fill=accent,role='source')
        text(pos(72,940),'CID = compound record number',font=f(36),fill=muted,role='source')
        text(pos(72,1010),'C23H30N2O5',font=f(48),fill=fg,role='source')
        text(pos(72,1120),'pubchem.ncbi.nlm.nih.gov',font=f(38),fill=muted,role='source')
    elif light and idx==0:
        for name,y,label in [('mitragynine',585,'MITRAGYNINE'),('7_hydroxymitragynine',935,'7-HYDROXYMITRAGYNINE')]:
            diagram=assets[name]['diagram'].resize((round(510*scale),round(383*scale)))
            image.alpha_composite(diagram,pos(105,y-15))
            draw=ImageDraw.Draw(image)
            text(pos(72,y-25),label,font=f(30,True),fill=accent)
    elif light or idx in (2,4):
        # Visible bond order/stereo comes from authoritative RDKit drawing.
        diagram = hero['diagram'].copy()
        # Both treatments require a palette matching the current background.
        if not light:
            diagram = assets['dark_diagram']
        diagram = diagram.resize((round((790-40*p)*scale),round((593-30*p)*scale)))
        image.alpha_composite(diagram,pos(45+20*p,620+15*p))
        if idx==2:
            draw=ImageDraw.Draw(image)
            text(pos(72,520),'Dots mark atoms. Lines mark bonds.',font=f(36,True),fill=accent)
            for x,y in hero['diagramAtomXY'][:round(p*len(hero['diagramAtomXY']))]:
                x=(45+20*p)*scale+x*diagram.width/1200
                y=(620+15*p)*scale+y*diagram.height/900
                radius=10*scale
                draw.ellipse((x-radius,y-radius,x+radius,y+radius),outline=accent,width=max(1,round(2*scale)))
        if idx==1:
            draw = ImageDraw.Draw(image)
            text(pos(72,1150),'–OH = oxygen + hydrogen',font=f(40,True),fill=accent)
        if idx==0:
            # Distinct structures are compared by cut, never morphed as reaction.
            draw = ImageDraw.Draw(image)
            text(pos(72,1160),'Distinct structures. A visible difference.',font=f(33),fill=muted)
    else:
        # One motivated camera action per shot: OH detail -> whole context,
        # computed depth orbit, then "look closer" returning to the real OH.
        detail=1-p if idx==1 else p*.65 if idx==6 else 0
        angle=(-.40+.85*p) if idx==3 else -.10
        model = spatial(hero, angle, (round(830*scale),round(730*scale)), detail=detail)
        image.alpha_composite(model,pos(20,540))
        draw = ImageDraw.Draw(image)
        disclosure = 'DETAIL REVEAL • computed model' if idx in (1,6) else 'Computed 3D illustration • not filmed'
        text(pos(72,1190),disclosure,font=f(38),fill=accent,role='disclosure')
        text(pos(72,1235),'Hydrogen atoms omitted',font=f(36),fill=muted,role='disclosure')
    draw = ImageDraw.Draw(image)
    if idx not in (0,5) and not is_spatial:
        text(pos(72,1260),hero_label,font=f(30,True),fill=muted)
    # In the limitation beat, present each exact, source-aligned phrase only
    # when its meaning is spoken. Whole-sentence previews gave away "not"
    # almost 2.3 seconds before the narrator did. No ASR text replacement.
    # The silent source-reading hold carries an empty narration line and no
    # word-cue array; render it as a source card with no caption, never raise.
    visible_words = scene.get('captionWords', [])
    if not visible_words and scene['line']:
        raise ValueError('TREATMENT_HOLD:MISSING_SPOKEN_WORD_CUES')
    if effect_boundary is not None:
        visible_words = [word for word in visible_words
                         if (word['startSec'] < effect_boundary) == (t < effect_boundary)]
    caption = wrapped(' '.join(w['text'] for w in visible_words),f(42,True),770*scale)
    if len(caption)>5:
        raise ValueError('TREATMENT_HOLD:CAPTION_TOO_DENSE')
    word_index=0
    for n,line in enumerate(caption):
        x,y=pos(72,1310+50*n)
        for word in line.split():
            cue=visible_words[word_index]
            text((x,y),word,font=f(42,True),fill=accent if cue['startSec']<=t<cue['endSec'] else fg,role='caption')
            x += f(42,True).getlength(word+' ')
            word_index+=1
    draw.line((pos(72,1640),pos(840,1640)),fill=accent,width=max(1,round(scale*2)))
    return image.convert('RGB')


def native_phone_plan(video_sha,scenes,assets,treatment,font):
    from phone_ui_audit import validate_manifest
    shots=[]
    for scene in scenes:
        boundaries=[scene['startSec'],scene['endSec']]
        if treatment=='specimen' and scene['id']=='sentence_1':
            boundaries.insert(1,next(w['startSec'] for w in scene['captionWords']
                if w['text'].casefold().strip('?!.,')=='different'))
        if treatment=='specimen' and scene['id']=='sentence_5':
            boundaries.insert(1,next(w['startSec'] for w in scene['captionWords'] if w['text'].casefold()=='not'))
        for i,(start,end) in enumerate(zip(boundaries,boundaries[1:])):
            annotations=[]
            render_frame((start+end)/2,scenes,assets,treatment,(1080,1920),font,annotations=annotations)
            shots.append({'id':scene['id']+(f'_part{i}' if len(boundaries)>2 else ''),'startSec':start,'endSec':end,
                          'assetKind':'deterministic_science','annotations':annotations})
    plan={'status':'RESEARCH_ONLY','releaseApproved':False,'expectedVideoSha256':video_sha,
          'platforms':['tiktok','shorts'],'hook':{'textVisibleAtSec':0,'spokenOpeningAtSec':.16,'heroVisualStartsAtSec':0},'shots':shots}
    validate_manifest(plan,width=1080,height=1920,duration=scenes[-1]['endSec'],actual_sha=video_sha)
    return plan


def render(root, destination, font_dir, treatment, native=False):
    import PIL
    import rdkit
    source_files = [Path(__file__).with_name(name) for name in (
        'narration_locked_treatments.py','verified_molecular_comparison.py',
        'editorial_2d_cpu_research.py','exact_wav_alignment.py','autonomous_script_asr_research.py',
        'phone_ui_audit.py','native_master_audit.py')]
    renderer_sources = {p.name:sha(p) for p in source_files}
    if treatment not in TREATMENTS:
        raise ValueError('TREATMENT_HOLD:UNKNOWN_TREATMENT')
    root, out = Path(root).resolve(),Path(destination).resolve()
    if out.exists():
        raise ValueError('TREATMENT_HOLD:FRESH_OUTPUT_REQUIRED')
    manifest = json.loads((root/'alignment-manifest.json').read_text())
    alignment = inspect_alignment(root,manifest)
    wav = root/manifest['wav']['path']
    duration = source_check(wav)
    if alignment['inputSha256']['wav']!=WAV_SHA:
        raise ValueError('TREATMENT_HOLD:ORIGINAL_WAV_REQUIRED')
    scenes = timeline(alignment)
    size = (1080,1920) if native else (540,960)
    # Both previews are the same full timeline; no silent/different-audio proxy.
    count = math.ceil(duration*FPS)
    font, font_hashes = fonts(font_dir)
    assets = chemistry_assets(light=treatment=='atlas')
    assets['dark_diagram'] = chemistry_assets(light=False)['7_hydroxymitragynine']['diagram']
    out.mkdir(parents=True)
    start = time.monotonic()
    video = out/(treatment+'_NEW_RESEARCH_CANDIDATE.mp4')
    # Gain plus latency-compensated peak limiting preserves performance timing.
    # The original remains immutable; processed AAC has a declared new identity.
    command = ['ffmpeg','-v','error','-nostdin','-y','-f','rawvideo','-pixel_format','rgb24',
               '-video_size',f'{size[0]}x{size[1]}','-framerate',str(FPS),'-i','pipe:0',
               '-i',str(wav),'-map','0:v','-map','1:a','-c:v','libx264','-preset','fast',
               '-crf','18','-pix_fmt','yuv420p','-af',AUDIO_FILTER,'-c:a','aac','-b:a','192k',
               '-frames:v',str(count),'-movflags','+faststart',str(video)]
    snapshots = {0,60,120,360,540,750,870,1000}
    with (out/'encoder.log').open('wb') as log:
        process = subprocess.Popen(command,stdin=subprocess.PIPE,stderr=log)
        try:
            for i in range(count):
                image = render_frame(i/FPS,scenes,assets,treatment,size,font)
                if i in snapshots:
                    image.save(out/f'source_frame_{i:04d}.png')
                process.stdin.write(image.tobytes())
            process.stdin.close()
            if process.wait(timeout=90):
                raise ValueError('TREATMENT_HOLD:ENCODER_FAILED')
        except BaseException:
            process.kill()
            process.wait()
            raise
    # Identity revalidation after actual render, not merely before it.
    if inspect_alignment(root,manifest)['revisionSha256']!=alignment['revisionSha256']:
        raise ValueError('TREATMENT_HOLD:SOURCE_CHANGED_DURING_RENDER')
    source_check(wav)
    if {p.name:sha(p) for p in source_files}!=renderer_sources or fonts(font_dir)[1]!=font_hashes:
        raise ValueError('TREATMENT_HOLD:RENDERER_OR_FONTS_CHANGED_DURING_RENDER')
    sources = []
    for name,entry in assets.items():
        if not isinstance(entry,dict):
            continue
        path = out/(name+'_computed.mol')
        path.write_text(entry['conformerMolBlock'],encoding='utf-8')
        sources.append({'name':entry['source'].name,'cid':entry['source'].pubchem_cid,
                        'inchiKey':entry['source'].inchi_key,'url':entry['source'].source_url,
                        'cameraBasis':entry['viewBasis'],'cameraTransform':'right-handed principal axes; rigid, no reflection',
                        'computedConformerSha256':sha(path)})
    phone_status='NOT_RUN_PREVIEW_ONLY'
    if native:
        from phone_ui_audit import audit
        plan=native_phone_plan(sha(video),scenes,assets,treatment,font)
        plan_path=out/'phone-ui-plan.json'
        plan_path.write_text(json.dumps(plan,indent=2)+'\n',encoding='utf-8')
        phone_status=audit(video,plan_path,out/'phone-ui')['status']
    receipt = {'status':'NEW_RENDERED_RESEARCH_CANDIDATE_REQUIRES_INDEPENDENT_REVIEW',
               'isOriginalV5':False,'treatment':treatment,'videoSha256':sha(video),
               'resolution':list(size),'nativePixelsDrawnAtOutputResolution':True,
               'fps':FPS,'frames':count,'sourceWavSha256':WAV_SHA,
               'audioProcessing':AUDIO_FILTER+' then AAC; no stretch, trimming or resynthesis',
               'alignmentRevisionSha256':alignment['revisionSha256'], 'scenes':scenes,
               'fonts':font_hashes,'chemistry':sources,'wallSeconds':round(time.monotonic()-start,3),
               'rendererSourcesSha256':renderer_sources,'rdkitVersion':rdkit.__version__,
               'pillowVersion':PIL.__version__,'craftApproved':False,'scienceApproved':False,
               'phoneOverlayStatus':phone_status,
               'boundedStoryRepairCount':1,'maxMacroStoryRepairs':1,
               'pronunciationVerified':False,'deviceVerified':False,'mayPublish':False}
    (out/'render-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8')
    return receipt


if __name__=='__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--alignment-root',required=True)
    parser.add_argument('--out',required=True)
    parser.add_argument('--font-dir',required=True)
    parser.add_argument('--treatment',choices=sorted(TREATMENTS),required=True)
    parser.add_argument('--native',action='store_true')
    args=parser.parse_args()
    print(json.dumps(render(args.alignment_root,args.out,args.font_dir,args.treatment,args.native),indent=2))
