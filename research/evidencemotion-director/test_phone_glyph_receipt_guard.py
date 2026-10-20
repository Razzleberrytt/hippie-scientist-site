"""Self-contained synthetic negative controls for exact-film decoded mobile receipt."""
import copy
import hashlib
import unittest
from phone_glyph_receipt_guard import validate, Hold, AUTHORED_ROIS

FILM='a'*64
SRT=b'1\n00:00:00,000 --> 00:00:00,150\nRead the source\n'
H=hashlib.sha256(SRT).hexdigest()

def frame(i):
    # RGB pixel scan was performed elsewhere; this verifies only structure,
    # pinned film/cue identity and does not claim to re-authenticate pixels.
    def band(name, y):
        return [{'y0':y,'y1':y+12,'halfres_rows':13,
                 'pixelsAt320':round(13*320/540,2)}]
    return {'frame':i, 'bands':{
       'explanation':band('explanation',700),
       'source_credit':band('source_credit',760),
       'voice_caption':band('voice_caption',800)}}

def fixture():
    return {'movieSha256':FILM,'native':{'width':1080,'height':1920,'fps':30,
               'fullPhysicallyDecodedFrames':6},
        'regionsHalfSizePx':copy.deepcopy(AUTHORED_ROIS),
        'frameObservations':[frame(i) for i in range(6)],
        'mayPublish':False,'humanPhoneVerified':False,
        'filmSemanticApproved':False,'qualifiedScienceApproved':False,
        'exactWordOCRApproved':False}

def run(report=None,srt=SRT,film=FILM,srt_sha=H,frames=6):
    return validate(fixture() if report is None else report, srt,
            expected_film_sha=film, expected_srt_sha=srt_sha,
            expected_frames=frames)

class ReceiptGuardTests(unittest.TestCase):
    def reject(self, code, **kwargs):
        with self.assertRaisesRegex(Hold,code):run(**kwargs)
    def test_positive_receipt_never_certifies_phone_or_release(self):
        v=run();self.assertEqual(v['verdict'],'HOLD_RESEARCH_ONLY')
        self.assertEqual(v['actualFrameCountClaimedByReceipt'],6)
        self.assertEqual(v['cueFrames'],4)
        self.assertFalse(v['mayPublish'])
        self.assertFalse(v['sourceFramePixelDecodeReplayedByThisJoin'])
    def test_wrong_movie_rejected(self):self.reject('WRONG_FILM',film='b'*64)
    def test_changed_srt_rejected(self):self.reject('WRONG_SRT_BYTES',srt=SRT+b' ')
    def test_truncated_video_receipt_rejected(self):
        v=fixture();v['frameObservations'].pop()
        self.reject('INCOMPLETE_FRAME_COUNT',report=v)
    def test_duplicate_frame_rejected(self):
        v=fixture();v['frameObservations'][1]['frame']=0
        self.reject('MISSING_DUPLICATE_OR_SHUFFLED_FRAME',report=v)
    def test_forged_publish_rejected(self):
        v=fixture();v['mayPublish']=True
        self.reject('FORGED_AUTHORITY',report=v)
    def test_swapped_roi_rejected(self):
        v=fixture();v['regionsHalfSizePx']['voice_caption']['y']=[700,760]
        self.reject('UNFROZEN_OR_CHANGED_ROIS',report=v)
    def test_forged_glyph_height_rejected(self):
        v=fixture();v['frameObservations'][0]['bands']['voice_caption'][0]['pixelsAt320']=100
        self.reject('FORGED_PROJECTED_HEIGHT',report=v)
    def test_missing_region_rejected(self):
        v=fixture();del v['frameObservations'][0]['bands']['source_credit']
        self.reject('INCOMPLETE_REGIONS',report=v)
    def test_unsafe_overlap_rejected_even_with_matching_new_hash(self):
        raw=b'1\n00:00:00,000 --> 00:00:00,100\nOne\n\n2\n00:00:00,050 --> 00:00:00,150\nTwo\n'
        self.reject('OVERLAP_OR_REVERSE_CUE',srt=raw,srt_sha=hashlib.sha256(raw).hexdigest())

if __name__=='__main__':unittest.main()