"""Adversarial synthetic checks; hosted CI has no owner's 845-frame movie."""
import unittest
import protected_science_art_guard as q

class ArtNegativeControls(unittest.TestCase):
    def test_clean_fixture_never_becomes_publish_permission(self):
        v=[[0.0]*(hi-lo+1) for lo,hi in q.SCENES]
        d=q.scene_report(v,source_sha='a'*64,candidate_sha='b'*64,expected_count=845)
        self.assertEqual(d['badFrames'],0)
        self.assertEqual(d['status'],'NO_PROTECTED_ART_REPAINT_DETECTED_ONLY')
        self.assertIs(d['mayPublish'],False)
        self.assertIs(d['excellentCertified'],False)

    def test_single_factual_frame_overpaint_fails(self):
        v=[[0.0]*(hi-lo+1) for lo,hi in q.SCENES]
        v[3][470-392]=42.0
        d=q.scene_report(v,source_sha='a'*64,candidate_sha='b'*64,expected_count=845)
        self.assertEqual(d['badFrames'],1)
        self.assertEqual(d['scenes'][3]['firstViolatingFrame'],470)
        self.assertEqual(d['status'],'FAIL_ENCODED_SCIENCE_ART_OVERPAINT')

    def test_missing_frames_wrong_total_and_forged_metrics_fail_closed(self):
        original=[[0.0]*(hi-lo+1) for lo,hi in q.SCENES]
        for defect in ('missing','wrongtotal','nan','negative','wrongtype'):
            v=[list(x) for x in original]
            expected=845
            if defect=='missing':v[4].pop()
            elif defect=='wrongtotal':expected=844
            elif defect=='nan':v[2][0]=float('nan')
            elif defect=='negative':v[2][0]=-1.0
            else:v[2][0]='0'
            with self.subTest(defect=defect),self.assertRaises(q.ArtHold):
                q.scene_report(v,source_sha='a'*64,candidate_sha='b'*64,expected_count=expected)

    def test_frame_byte_length_mismatch_and_empty_rejected(self):
        for a,b in [(b'',b''),(b'xx',b'x'),(b'\x00',b'')]:
            with self.subTest(a=a,b=b),self.assertRaises(q.ArtHold):
                q.frame_mae(a,b)

    def test_exact_gray_difference(self):
        self.assertEqual(q.frame_mae(b'\x00\x0a\xff',b'\x00\x0b\xfe'),2/3)

    def test_expected_sha_must_match_real_file_bytes(self):
        with self.assertRaises(q.ArtHold):
            q.validate_input('/does/not/exist','a'*64)
        with self.assertRaises(q.ArtHold):
            q.validate_input(__file__,'not-a-sha')
        with self.assertRaises(q.ArtHold):
            q.validate_input(__file__,'a'*64)

if __name__=='__main__':unittest.main()
