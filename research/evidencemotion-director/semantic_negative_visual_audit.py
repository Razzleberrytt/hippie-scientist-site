#!/usr/bin/env python3
"""Fail-closed research-only visual negative QA. No science/craft/device/release authority."""
from __future__ import annotations
import argparse, hashlib, importlib.util, io, json, subprocess, sys, tempfile
from pathlib import Path
import numpy as np

SOURCE_FILM_SHA='d2aff53b7a18c32eb6c4ee9d60fd3bb216593d897b730f5ebf58086dd2a71e51'
SOURCE_MANIFEST_SHA='fb0845ca439b689ccf1bef477ed5cd323a8e5f894c14dcbdb24ed3d03a72c789'
SOURCE_RENDERER_SHA='7b3233673cb1d69fadd3abc7e98a659236895eeb1f582b1d3eb9cdb94c80de69'
TIMES=[1.8,5.0,7.5,9.5,10.05,11.8,15.0,17.0,18.5,19.7,19.83,20.,22.3,24.5,26.2,29.5,32.2]
WINDOWS=[(0,3.4267),(3.4267,6.25),(6.25,8.85),(8.85,9.78),(9.78,10.694),
         (10.694,13.63),(13.63,16.496),(16.496,18.48),(18.48,19.76),
         (19.76,22.04),(22.04,23.298),(23.298,25.55),(25.55,27.89),
         (27.89,31.09),(31.09,34.3667)]

def digest(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as f:
        for part in iter(lambda:f.read(1024*1024),b''):h.update(part)
    return h.hexdigest()

def frame_guard(expected,actual,*,hydroxyl_roi=None):
    """Compare separately decoded source movie pixels against independently redrawn pinned chemistry.

    The reserved ASS-caption band is tested by a separate actual-text-bounds verifier.
    Thresholds were calibrated on 17 H.264 V3 frames: not universal film aesthetics.
    """
    expected=np.asarray(expected,dtype=np.int16)
    actual=np.asarray(actual,dtype=np.int16)
    if expected.ndim!=3 or expected.shape[-1]!=3 or actual.shape!=expected.shape:
        return {'status':'HOLD','errors':['INVALID_FRAME_DIMENSIONS'],'releaseApproved':False}
    h,w,_=expected.shape
    included=np.zeros((h,w),dtype=bool)
    included[round(.10*h):round(.60*h),round(.056*w):round(.94*w)]=True
    included[round(.76*h):round(.87*h),round(.056*w):round(.94*w)]=True
    absolute=np.abs(actual-expected)
    largest=absolute.max(axis=2)
    dark=included & (expected.max(axis=2)<60)
    extra_bright=int(np.sum(dark & (actual.max(axis=2)>150)))
    diff_rate=float(np.mean(largest[included]>32))
    error_mean=float(np.mean(absolute[included]))
    errors=[]
    if diff_rate>.007 or error_mean>5:errors.append('SCENE_CROP_SOURCE_DRIFT_OR_UNEXPECTED_OVERLAY')
    if extra_bright>=3:errors.append('UNSOURCED_BRIGHT_PARTICLE_OR_INSERT')
    hydroxyl_diff=None
    gold_mismatch=None
    if hydroxyl_roi is not None:
        x,y=map(int,hydroxyl_roi)
        if x<75 or x>w-75 or y<75 or y>h-75:errors.append('OH_MARKER_OFF_CANVAS')
        else:
            patch=absolute[y-74:y+74,x-74:x+74,:]
            hydroxyl_diff=float(patch.mean())
            target=expected[y-74:y+74,x-74:x+74,:]
            observed=actual[y-74:y+74,x-74:x+74,:]
            gold=(target[:,:,0]>190)&(target[:,:,1]>110)&(target[:,:,2]<190)&((target[:,:,0]-target[:,:,2])>45)
            if np.sum(gold)<30:errors.append('EXPECTED_OH_MARKER_NOT_FOUND')
            else:
                gold_mismatch=float(np.mean(np.max(np.abs(target-observed),axis=2)[gold]>55))
                if gold_mismatch>.30:errors.append('OH_MARKER_MISSING_OR_MISPLACED')
    return {'status':'HOLD' if errors else 'SOURCE_FRAME_MATCH','errors':errors,
            'pctPixelsOver32':round(diff_rate,6),'meanAbsoluteRgbDifference':round(error_mean,3),
            'unsourcedBrightPixels':extra_bright,
            'hydroxylLocalDifference':round(hydroxyl_diff,3) if hydroxyl_diff is not None else None,
            'goldHighlightMismatchFraction':round(gold_mismatch,4) if gold_mismatch is not None else None,
            'craftApproved':False,'releaseApproved':False}

def source_diagram_marker(m,t):
    if 6.25<=t<8.85:base_x,base_y=75,572
    elif 9.78<=t<10.694:base_x,base_y=75,542
    elif 10.694<=t<13.63:base_x,base_y=74,540
    elif 16.496<=t<18.48:base_x,base_y=74,558
    elif 18.48<=t<19.76:base_x,base_y=74,545
    else:return None
    x,y=m.CHEM['7oh']['oh_px']
    return (round(base_x+.78*x),round(base_y+.78*y))

def decode_frame(master,frame_number):
    from PIL import Image
    r=subprocess.run(['ffmpeg','-hide_banner','-loglevel','error',
                      '-ss',f'{frame_number/30:.9f}','-i',str(master),
                      '-frames:v','1','-f','image2pipe','-vcodec','png','-'],
                      check=True,capture_output=True)
    if not r.stdout:raise RuntimeError('NO_DECODED_FRAME')
    return Image.open(io.BytesIO(r.stdout)).convert('RGB')

def build_model(root):
    from PIL import Image
    root=Path(root)
    if digest(root/'source_input_manifest.json')!=SOURCE_MANIFEST_SHA:
        raise RuntimeError('SOURCE_MANIFEST_SHA_DRIFT')
    manifest=json.loads((root/'source_input_manifest.json').read_text())
    if manifest.get('releaseApproved') is not False or manifest.get('craftApproved') is not False:
        raise RuntimeError('RESEARCH_RELEASE_HOLD_MISSING')
    rel='original/build_fullhd_matchcut.py'
    if digest(root/rel)!=SOURCE_RENDERER_SHA or digest(root/rel)!=manifest['sourceInputs'][rel]:
        raise RuntimeError('SOURCE_RENDERER_HASH_DRIFT')
    for path,sha in manifest['sourceInputs'].items():
        if not (root/path).is_file() or digest(root/path)!=sha:
            raise RuntimeError('SOURCE_INPUT_HASH_DRIFT:'+path)
    spec=importlib.util.spec_from_file_location('pinned_seven_oh_renderer',root/rel)
    m=importlib.util.module_from_spec(spec)
    sys.modules['pinned_seven_oh_renderer']=m
    spec.loader.exec_module(m)
    with tempfile.TemporaryDirectory() as temp:
        m.HERE=Path(temp)
        for key,rec in m.CHEM.items():
            m.build_identity(rec)
            m.molecule_card(rec,key+'_pinned_structure.png')
            if digest(m.HERE/(key+'_pinned_structure.png'))!=digest(root/'intermediates'/(key+'_pinned_structure.png')):
                raise RuntimeError('INDEPENDENT_2D_DIAGRAM_MISMATCH:'+key)
    m.DIAGRAMS={key:Image.open(root/'intermediates'/(key+'_pinned_structure.png')).convert('RGBA') for key in m.CHEM}
    m.BACKDROP=Image.open(root/'intermediates/studio_bg.png').convert('RGBA')
    m.SPRITES_STICKS=[Image.open(root/f'intermediates/VTK_sticks_{i:03}.png').convert('RGBA') for i in range(42)]
    m.SPRITES_SPACE=[Image.open(root/f'intermediates/VTK_space_{i:03}.png').convert('RGBA') for i in range(18)]
    return m,manifest

def run_audit(package_root,master,out_path=None):
    root=Path(package_root)
    master=Path(master)
    if digest(master)!=SOURCE_FILM_SHA:raise RuntimeError('EXACT_FINAL_MP4_SHA_MISMATCH')
    m,manifest=build_model(root)
    if manifest.get('originalFinalSha256')!=SOURCE_FILM_SHA:
        raise RuntimeError('EXACT_FINAL_MP4_NOT_PINNED_BY_SOURCE_MANIFEST')
    samples=[]
    for t in TIMES:
        n=round(t*30);sec=n/30
        actual=decode_frame(master,n)
        expected=m.draw_scene(sec).convert('RGB')
        receipt=frame_guard(expected,actual,hydroxyl_roi=source_diagram_marker(m,sec))
        samples.append({'frame':n,'second':round(sec,6),**receipt})
    covered=all(any(a<=sample['second']<b for sample in samples) for a,b in WINDOWS)
    failed=[s for s in samples if s['status']!='SOURCE_FRAME_MATCH']
    result={
        'status':'HOLD' if failed or not covered else 'ACTUAL_SAMPLED_SOURCE_FIDELITY_PASS_ONLY',
        'exactMasterSha256':SOURCE_FILM_SHA,'actualFramesSampled':len(samples),
        'allProposedScenesRepresented':covered,'samples':samples,'failureCount':len(failed),
        'negativeFiltersChecked':['source identity/crop/overlay','7-OH highlight','unsourced bright confetti',
            '2D/3D scene drift','caption intrusion into molecule region','unexpected transition imagery'],
        'limits':['17 sampled frames, not all 1031','Caption band independently tested by ASS bounds',
            'Source fidelity does not prove scientific peer review, artistic excellence or real-device playback',
            'Flat-card aesthetics and cheap-looking transitions require human craft review'],
        'craftApproved':False,'scienceEditorialApproved':False,'phoneDeviceApproved':False,'releaseApproved':False
    }
    if out_path:Path(out_path).write_text(json.dumps(result,indent=2)+'\n')
    return result

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--package-root',required=True)
    parser.add_argument('--master',required=True)
    parser.add_argument('--out')
    opts=parser.parse_args()
    result=run_audit(opts.package_root,opts.master,opts.out)
    print(json.dumps({k:v for k,v in result.items() if k!='samples'},indent=2))
    sys.exit(1 if result['status']=='HOLD' else 0)
