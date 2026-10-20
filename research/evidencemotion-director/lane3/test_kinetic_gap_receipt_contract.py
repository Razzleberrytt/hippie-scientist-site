"""Portable adversarial controls; hosted CI DOES NOT have owner 845f movie."""
import copy
import unittest
from kinetic_gap_receipt_contract import FILM_SHA,SCENES,GapHold,classify_gap,validate_receipt,preflight_raised_credit_from_pinned_receipt

def fixture(ink_y=1600):
    px,passes=classify_gap(ink_y)
    frames=[]
    sc=[]
    for sid,(lo,hi) in enumerate(SCENES,1):
        for f in range(lo,hi+1):
            frames.append({'f':f,'scene':sid,'kineticTopNativeY':ink_y,
                           'gapProjectedPx320':px,'passesExperimentalGap':passes})
        sc.append({'scene':sid,'framesWithPhysicalWhiteKineticForeground':hi-lo+1,
                   'minObservedGapProjectedPx320':px,'worstFrame':lo,
                   'negativeGateFailures':0 if passes else hi-lo+1})
    return {'movieSha256':FILM_SHA,'mayPublish':False,'newAcceptedAtomicCards':0,
            'totalNativeFilmFramesVisited':845,'experimentMinClearancePx320':12.0,
            'sourceCreditInkBottomNativeY':1587,'kineticVisibleFrameSamples':845,
            'scenes':sc,'perFrame':frames,
            'status':'RESEARCH_GAP_NEGATIVE_SCREEN_ONLY' if passes else
                     'FAIL_RESEARCH_EDITORIAL_SPACING_NEGATIVE_GATE'}

class ReceiptFailClosedTests(unittest.TestCase):
    def test_full_scene_fail_receipt_stays_on_hold(self):
        result=validate_receipt(fixture())
        self.assertEqual(result['failedKineticFrames'],845)
        self.assertIs(result['mayPublish'],False)
    def test_even_clearance_pass_does_not_approve_publication(self):
        d=fixture(1650);self.assertEqual(validate_receipt(d)['failedKineticFrames'],0)
        self.assertIs(validate_receipt(d)['mayPublish'],False)
    def test_physical_width_conversion(self):
        self.assertEqual(classify_gap(1590),(0.889,False))
        self.assertTrue(classify_gap(1650)[1])
    def test_source_identity_and_gate_locked(self):
        for field,value in (('movieSha256','wrong'),('experimentMinClearancePx320',0),
              ('sourceCreditInkBottomNativeY',1500),('mayPublish',True),
              ('newAcceptedAtomicCards',1),('totalNativeFilmFramesVisited',844)):
            v=fixture();v[field]=value
            with self.subTest(field=field),self.assertRaises(GapHold):validate_receipt(v)
    def test_misordered_or_missing_frame_rejected(self):
        for action in ('pop','change','swap'):
            v=fixture()
            if action=='pop':v['perFrame'].pop()
            elif action=='change':v['perFrame'][119]['scene']=1
            else:v['perFrame'][4],v['perFrame'][5]=v['perFrame'][5],v['perFrame'][4]
            with self.subTest(action=action),self.assertRaises(GapHold):validate_receipt(v)
    def test_kinetic_gap_cannot_be_forged(self):
        for field,value in (('gapProjectedPx320',18.0),('passesExperimentalGap',True),
                            ('kineticTopNativeY','1600')):
            v=fixture();v['perFrame'][7][field]=value
            with self.subTest(field=field),self.assertRaises(GapHold):validate_receipt(v)
    def test_relabelled_green_status_not_accepted(self):
        v=fixture();v['status']='RESEARCH_GAP_NEGATIVE_SCREEN_ONLY'
        with self.assertRaisesRegex(GapHold,'FALSE_GREEN'):validate_receipt(v)
    def test_aggregate_claims_individually_checked(self):
        for field,value in (('negativeGateFailures',0),('minObservedGapProjectedPx320',12.3),
                            ('worstFrame',119)):
            v=fixture();v['scenes'][0][field]=value
            with self.subTest(field=field),self.assertRaises(GapHold):validate_receipt(v)
    def test_missing_real_visible_frames_rejected(self):
        v=fixture();v['perFrame'][10].update({'kineticTopNativeY':None,'gapProjectedPx320':None,'passesExperimentalGap':None})
        with self.assertRaises(GapHold):validate_receipt(v)
    def test_invalid_native_coordinates_fail_closed(self):
        for y in ('1600',1600.0,True,-1,1798):
            with self.subTest(y=y),self.assertRaises(GapHold):classify_gap(y)


    def test_raised_credit_geometry_predicted_from_exact_source_receipt(self):
        previous=fixture()
        baseline=preflight_raised_credit_from_pinned_receipt(previous,1587)
        self.assertEqual(baseline['status'],'HOLD_PROPOSED_CREDIT_TOO_CLOSE_TO_KINETIC')
        self.assertEqual(baseline['framesRecomputed'],845)
        raised=preflight_raised_credit_from_pinned_receipt(previous,1527)
        self.assertEqual(raised['status'],'PREFLIGHT_GAP_ONLY')
        self.assertTrue(all(x['predictedMinGapPx320']>=12 for x in raised['scenes']))
        self.assertIs(raised['newFilmIndependentlyDecoded'],False)
        self.assertIs(raised['mayPublish'],False)

    def test_proposed_reflow_does_not_override_forged_old_receipt(self):
        for key,value in [('movieSha256','fake'),('status','RESEARCH_GAP_NEGATIVE_SCREEN_ONLY'),
                          ('mayPublish',True),('totalNativeFilmFramesVisited',844)]:
            candidate=fixture();candidate[key]=value
            with self.subTest(key=key),self.assertRaises(GapHold):
                preflight_raised_credit_from_pinned_receipt(candidate,1527)

    def test_credit_preflight_rejects_nonphysical_anchor(self):
        for y in (True,1527.0,'1527',1199,1588,-30):
            with self.subTest(y=y),self.assertRaisesRegex(GapHold,'PROPOSED_CREDIT'):
                preflight_raised_credit_from_pinned_receipt(fixture(),y)

if __name__=='__main__':unittest.main()
