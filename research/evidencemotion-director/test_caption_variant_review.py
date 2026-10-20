"""Research-only optical caption counterfactual safety/negative regressions."""
import copy,hashlib,sys,tempfile,unittest,subprocess
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from caption_variant_review import parse_srt,row_stats,analyze,compare,physically_decode,frame_pts_exact,fail,W,H
HSH='a'*64;OTHER='b'*64

def stamp(sec):
    h=int(sec//3600);m=int((sec//60)%60);s=int(sec%60);ms=round((sec-int(sec))*1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'
def synthetic_srt():
    return ('\n\n'.join(f'{i}\n{stamp(i-1)} --> {stamp(i)}\nexample phrase {i}' for i in range(1,20))+'\n').encode()
def fixture():
    cues=parse_srt(synthetic_srt());n=570
    a=[{'index':i,'pts':i/30,'brightPixels':80,'largestInkLinePx320':12,'inkEnvelopeY320':[476,487]} for i in range(n)]
    return a,cues,n

class CaptionCounterfactualTests(unittest.TestCase):
    def test_strict_19_cue_positive_does_not_publish(self):
        a,c,n=fixture();b=copy.deepcopy(a)
        for i in range(30,60):b[i]['largestInkLinePx320']=18
        r=compare(a,b,c,n,HSH,OTHER)
        self.assertEqual(r['changedMeasuredCues'],[2]);self.assertEqual(r['after']['allCueBelow14Frames'],n-30)
        self.assertFalse(r['mayPublish']);self.assertFalse(r['realPhonePlaybackApproved'])
        self.assertIn('BIGGER_CAPTIONS_DO_NOT_CLOSE',r['verdict'])
    def test_all_glyphs_large_still_bottom_zone_hold(self):
        a,c,n=fixture();b=copy.deepcopy(a)
        for rec in b:rec['largestInkLinePx320']=22
        r=compare(a,b,c,n,HSH,OTHER)
        self.assertEqual(r['after']['allCueBelow14Frames'],0)
        self.assertEqual(r['after']['allCueBottomUIInkFrames'],570)
        self.assertFalse(r['allFrameMobileSafeApproved'])
    def test_safe_screen_is_still_not_phone_approval(self):
        a,c,n=fixture();b=copy.deepcopy(a)
        for rec in b:rec['brightPixels']=0;rec['largestInkLinePx320']=22
        r=compare(a,b,c,n,HSH,OTHER)
        self.assertEqual(r['verdict'],'NEGATIVE_SCREENS_EMPTY_EXTERNAL_QA_STILL_REQUIRED')
        self.assertFalse(r['mayPublish']);self.assertFalse(r['qualifiedScienceApproved'])
    def test_no_visible_caption_ink_yields_explicit_hold_instead_of_crash(self):
        a,c,n=fixture();b=copy.deepcopy(a)
        for record in b[:30]:
            record['brightPixels']=0
            record['largestInkLinePx320']=0
            record['inkEnvelopeY320']=None
        result=compare(a,b,c,n,HSH,OTHER)
        self.assertEqual(result['after']['cuesWithoutDetectedInk'],[1])
        self.assertIsNone(result['after']['perCue'][0]['minTopY320'])
        self.assertIsNone(result['after']['perCue'][0]['maxBottomY320'])
        self.assertEqual(result['verdict'],'NO_DETECTED_CAPTION_INK_RELEASE_HOLD')
        self.assertFalse(result['mayPublish'])

    def test_invalid_or_missing_actual_frame_pts_cannot_pass(self):
        a,c,n=fixture()
        for value in (None,float('nan'),0.25):
            with self.subTest(value=value):
                b=copy.deepcopy(a);b[0]['pts']=value
                with self.assertRaisesRegex(ValueError,'INVALID_FRAME_SEQUENCE_OR_ANNOTATION'):
                    compare(a,b,c,n,HSH,OTHER)

    def test_shifted_but_encoded_30fps_presentation_timestamp_fails_closed(self):
        # Real stream still declares 30 fps while every PTS is offset.
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'shifted.mp4'
            cmd=['ffmpeg','-nostdin','-v','error','-f','lavfi',
                 '-i','color=c=black:s=1080x1920:r=30:d=0.4',
                 '-vf','setpts=PTS+0.5/TB','-c:v','libx264','-preset','ultrafast',
                 '-pix_fmt','yuv420p','-an','-y',str(p)]
            subprocess.run(cmd,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=25)
            with self.assertRaisesRegex(ValueError,'ACTUAL_PRESENTATION_TIMESTAMPS_NOT_ZERO_ORIGIN_CFR30'):
                frame_pts_exact(p,12)

    def test_missing_duplicated_or_reordered_frame_holds(self):
        a,c,n=fixture()
        for invalid in (a[:-1],a+[dict(a[-1])],a[1:]+a[:1]):
            with self.assertRaisesRegex(ValueError,'INVALID_FRAME_SEQUENCE_OR_ANNOTATION'):
                compare(a,invalid,c,n,HSH,OTHER)
    def test_boolean_or_forged_pixel_count_rejected(self):
        a,c,n=fixture()
        for value in (True,1.5,'100',None):
            b=copy.deepcopy(a);b[0]['brightPixels']=value
            with self.assertRaisesRegex(ValueError,'INVALID_FRAME_SEQUENCE_OR_ANNOTATION'):
                compare(a,b,c,n,HSH,OTHER)
    def test_mismatched_same_film_never_pretends_comparison(self):
        a,c,n=fixture()
        with self.assertRaisesRegex(ValueError,'NONDISTINCT_FILM_IDENTITIES'):
            compare(a,a,c,n,HSH,HSH)
    def test_missing_19th_cue_or_bad_srt_rejected(self):
        a,c,n=fixture()
        with self.assertRaisesRegex(ValueError,'NINETEEN_SOURCE_CUES_REQUIRED'):
            compare(a,a,c[:-1],n,HSH,OTHER)
        with self.assertRaisesRegex(ValueError,'SRT_SEQUENCE_OR_TEXT_REQUIRED'):
            parse_srt(synthetic_srt().replace(b'2\n00:',b'1\n00:',1))
    def test_wrong_sha_fails_before_decode(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'film.mp4';p.write_bytes(b'mock')
            with self.assertRaisesRegex(ValueError,'EXACT_VIDEO_SHA_MISMATCH'):
                physically_decode(p,HSH,12)
    def test_pale_ink_row_geometry_holds_one_frame(self):
        b=bytearray(W*H*3)
        for y in range(20,36):
            for x in range(80,220):b[(y*W+x)*3:(y*W+x)*3+3]=b'\xff\xfe\xfd'
        a=row_stats(bytes(b))
        self.assertEqual(a['largestInkLinePx320'],16)
        self.assertEqual(a['inkEnvelopeY320'],[486,501])
    def test_synthetic_real_h264_one_frame_ui_ink_not_missed(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'synthetic_12f.mp4'
            cmd=['ffmpeg','-nostdin','-v','error','-f','lavfi','-i','color=c=black:s=1080x1920:r=30:d=0.4',
                 '-vf',"drawbox=x=250:y=1605:w=210:h=50:color=white:t=fill:enable='eq(n,5)'",
                 '-c:v','libx264','-preset','ultrafast','-crf','12','-pix_fmt','yuv420p','-an','-y',str(p)]
            try: subprocess.run(cmd,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=25)
            except FileNotFoundError:self.fail('FFmpeg unavailable; test must not silently skip')
            proof=physically_decode(p,hashlib.sha256(p.read_bytes()).hexdigest(),12)
            hits=[r['index'] for r in proof if r['brightPixels']>=8]
            self.assertEqual(hits,[5]);self.assertGreaterEqual(proof[5]['largestInkLinePx320'],14)
            self.assertEqual(len(proof),12)

if __name__=='__main__':unittest.main()