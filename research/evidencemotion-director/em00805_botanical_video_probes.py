#!/usr/bin/env python3
"""EM-008.05: real-encoded botanical disclaimer negative probes, research-only.

Art is unauthenticated illustration. Never a botanical species, chemical assay,
clinical-outcome, handset, independent science, release or production reviewer.
"""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageChops, ImageStat

W,H,FPS,FRAMES=1080,1920,30,60
RECT=(110,900,824,1118)
LABEL='AI-ILLUSTRATED BOTANICAL ART'
QUALIFIER='NOT PROOF OF 7-OH CONTENT'
DECEPTIVE='MEASURED 7-OH IN THIS PLANT'
MODES=('disclosed','missing','fabricated_measurement')

def sha(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for piece in iter(lambda:f.read(1<<20),b''):
            h.update(piece)
    return h.hexdigest()

def font(path,size):
    return ImageFont.truetype(str(path),size=size)

def fixture_art(path):
    """Newly authored leaf pictogram; *not* authenticated species or science."""
    im=Image.new('RGB',(W,H),'#12251f')
    d=ImageDraw.Draw(im)
    d.ellipse((170,260,910,1510),fill='#163626',outline='#527a43',width=12)
    for x,y,w,h,angle in [(295,420,185,590,-25),(595,420,185,590,25),
                          (355,875,180,500,-18),(550,900,180,500,18)]:
        leaf=Image.new('RGBA',(w,h),(0,0,0,0))
        brush=ImageDraw.Draw(leaf)
        brush.ellipse((10,15,w-10,h-15),fill='#6b8c56',outline='#b4d08a',width=5)
        brush.line([(w//2,55),(w//2,h-60)],fill='#d8cda2',width=5)
        leaf=leaf.rotate(angle,expand=True)
        im.paste(leaf,(x-leaf.width//2,y),leaf)
    d.line([(540,400),(540,1520)],fill='#b7c896',width=18)
    Path(path).parent.mkdir(parents=True,exist_ok=True)
    im.save(path)
    return path

def assert_text_fits(text,typeface,left=130):
    if left+typeface.getlength(text)>RECT[2]-24:
        raise ValueError('MOBILE_DISCLOSURE_GLYPHS_CLIPPED_HOLD')
    if typeface.size*375/W<14:
        raise ValueError('DECLARED_MOBILE_TYPE_TOO_SMALL_HOLD')

def draw_variant(base,font_path,mode):
    if mode not in MODES:raise ValueError('UNKNOWN_PROBE_MODE')
    frame=base.copy().convert('RGB')
    if mode!='missing':
        d=ImageDraw.Draw(frame,'RGBA')
        d.rounded_rectangle(RECT,radius=25,fill=(8,18,19,238),
                            outline=(230,233,211,255),width=4)
        f1=font(font_path,41);f2=font(font_path,41)
        first=LABEL if mode=='disclosed' else DECEPTIVE
        assert_text_fits(first,f1)
        if mode=='disclosed':assert_text_fits(QUALIFIER,f2)
        d.text((130,941),first,font=f1,fill=(255,253,228,255))
        if mode=='disclosed':
            d.text((130,1029),QUALIFIER,font=f2,fill=(235,236,207,255))
    return frame

def encode(still,film):
    args=['ffmpeg','-hide_banner','-loglevel','error','-y','-threads','2',
          '-loop','1','-framerate',str(FPS),'-i',str(still),
          '-frames:v',str(FRAMES),'-an','-c:v','libx264','-preset','ultrafast',
          '-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',str(film)]
    subprocess.run(args,check=True,capture_output=True,timeout=80)

def decode_frame(film,frame_index=30):
    args=['ffmpeg','-hide_banner','-loglevel','error','-threads','1',
          '-filter_threads','1','-i',str(film),'-an',
          '-vf','select=eq(n\\,'+str(frame_index)+')',
          '-fps_mode','passthrough','-frames:v','1','-pix_fmt','rgb24',
          '-f','rawvideo','pipe:1']
    p=subprocess.run(args,check=True,capture_output=True,timeout=40)
    if len(p.stdout)!=W*H*3:raise ValueError('EXACT_DECODED_PIXEL_COUNT_HOLD')
    return Image.frombytes('RGB',(W,H),p.stdout)

def audit_clip(film,expected_sha,mode,undisclosed,source_sha,expected_frame):
    if mode not in MODES:raise ValueError('MODE_NOT_DECLARED')
    if sha(film)!=expected_sha:raise ValueError('FILM_SHA_DRIFT_HOLD')
    probe=json.loads(subprocess.run(['ffprobe','-v','error','-select_streams','v:0',
      '-show_entries','stream=codec_name,width,height,avg_frame_rate,nb_frames',
      '-of','json',str(film)],check=True,capture_output=True,text=True,
      timeout=20).stdout)['streams'][0]
    if (probe['codec_name']!='h264' or probe['width']!=W or probe['height']!=H
        or probe['avg_frame_rate']!='30/1' or int(probe['nb_frames'])!=FRAMES):
        raise ValueError('NATIVE_RESEARCH_FILM_IDENTITY_HOLD')
    frame=decode_frame(film)
    roi=frame.crop(RECT)
    diff=ImageChops.difference(roi,undisclosed.crop(RECT))
    changed=sum(v>30 for v in diff.convert('L').tobytes())
    share=changed/(roi.width*roi.height)
    values=ImageStat.Stat(roi.convert('L'))
    expected_delta=ImageChops.difference(roi,expected_frame.crop(RECT))
    expected_mean=sum(ImageStat.Stat(expected_delta).mean)/3
    if expected_mean>10:
        raise ValueError('ENCODED_CAPTION_PIXELS_DIFFER_FROM_DECLARED_TEXT_HOLD')
    enough_banner=share>0.25 and values.extrema[0][0]<35 and values.extrema[0][1]>170
    accepted=(mode=='disclosed' and enough_banner)
    rejected=(mode!='disclosed')
    if mode=='disclosed' and not enough_banner:
        raise ValueError('VISUALLY_ABSENT_DISCLOSURE_HOLD')
    if mode=='missing' and share>0.015:
        raise ValueError('MISSING_DISCLOSURE_FIXTURE_NOT_BARE_HOLD')
    if mode=='fabricated_measurement' and not enough_banner:
        raise ValueError('FALSE_MEASUREMENT_NEGATIVE_NOT_RENDERED_HOLD')
    return {'mode':mode,'sourceSha256':source_sha,'encodedFilmSha256':sha(film),
      'sampleFrameIndex':30,'sampleTimeSec':1.0,
      'decodedRgbSha256':hashlib.sha256(frame.tobytes()).hexdigest(),
      'decodedDisclosureRegionSha256':hashlib.sha256(roi.tobytes()).hexdigest(),
      'disclosureRegionChangedPixelFraction':round(share,6),
      'decodedToAuthoredCaptionRoiMeanPixelError':round(expected_mean,5),
      'textClippingRuleChecked':True,'projectedTitlePixelsAt375Width':round(41*375/W,2),
      'disclosureInkCandidatePresent':enough_banner,
      'decision':'CAPTION_REGION_OBSERVED_RESEARCH_ONLY' if accepted else 'HOLD_MISSING_OR_DECEPTIVE_BOTANICAL_DISCLOSURE',
      'negativeControlRejected':rejected,'actualEncodedPixelsInspected':True,
      'independentTextOCRVerified':False,'botanicalSpeciesVerified':False,
      'plantAlkaloidAssayVerified':False,'humanScienceApproved':False,
      'realHandsetPlaybackVerified':False,'publicationApproved':False,'mayPublish':False}

def run(out,source,font_path):
    out=Path(out);out.mkdir(parents=True,exist_ok=True)
    source=Path(source);font_path=Path(font_path)
    if not source.is_file() or source.is_symlink():
        raise ValueError('SOURCE_ART_MISSING_OR_SYMLINK_HOLD')
    source_sha=sha(source)
    with Image.open(source) as initial:
        im=ImageOps.fit(initial.convert('RGB'),(W,H),Image.Resampling.LANCZOS)
    report={'schema':'ths-em00805-real-encoded-botanical-probes-v1',
      'sourceAssetSha256':source_sha,
      'artProvenance':'UNAUTHENTICATED_ILLUSTRATION_NOT_BOTANICAL_SCIENCE',
      'sourceIsScientificImage':False,'scope':'RESEARCH_NEGATIVE_PROBES_ONLY',
      'probes':[],'mayPublish':False}
    for mode in MODES:
        still=out/(mode+'.png');film=out/(mode+'.mp4')
        draw_variant(im,font_path,mode).save(still)
        encode(still,film)
    baseline=decode_frame(out/'missing.mp4')
    for mode in MODES:
        with Image.open(out/(mode+'.png')) as expected:
            item=audit_clip(out/(mode+'.mp4'),sha(out/(mode+'.mp4')),mode,
                             baseline,source_sha,expected.convert('RGB'))
        report['probes'].append(item)
    if [x['decision'] for x in report['probes']]!=[
       'CAPTION_REGION_OBSERVED_RESEARCH_ONLY',
       'HOLD_MISSING_OR_DECEPTIVE_BOTANICAL_DISCLOSURE',
       'HOLD_MISSING_OR_DECEPTIVE_BOTANICAL_DISCLOSURE']:
        raise ValueError('NEGATIVE_CONTROL_DID_NOT_FAIL_CLOSED')
    (out/'receipt.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    return report

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--source')
    p.add_argument('--out',required=True)
    p.add_argument('--generate-fixture',action='store_true')
    p.add_argument('--font',default='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
    a=p.parse_args()
    if bool(a.source)==a.generate_fixture:
        raise ValueError('CHOOSE_ONE_SOURCE_OR_NONFACTUAL_FIXTURE')
    source=a.source or str(fixture_art(Path(a.out)/'own_generated_leaf_fixture.png'))
    result=run(a.out,source,a.font)
    print(json.dumps({'artSHA':result['sourceAssetSha256'],
      'decisions':[(x['mode'],x['decision'],x['disclosureRegionChangedPixelFraction']) for x in result['probes']],
      'mayPublish':result['mayPublish']},indent=2))
if __name__=='__main__':main()
