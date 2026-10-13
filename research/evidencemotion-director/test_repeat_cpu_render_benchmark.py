import tempfile,unittest,zipfile
from pathlib import Path
from repeat_cpu_render_benchmark import valid_native_probe,research_receipt,extract_exact_original

def valid_video():
    return {'streams':[{'codec_type':'video','codec_name':'h264','width':1080,
        'height':1920,'r_frame_rate':'30/1','nb_frames':'1031'}]}

class RenderBenchmarkRegressions(unittest.TestCase):
    def test_correct_native_picture_metadata_only_not_release(self):
        self.assertTrue(valid_native_probe(valid_video()))
        receipt=research_receipt([{'status':'PASS_TECHNICAL_ONLY','totalCpuMinutes':1.6}])
        self.assertEqual(receipt['status'],'PASS_RESEARCH_ONLY')
        for k in ('scientificEditorialApproved','craftApproved','humanVoiceApproved','devicePlaybackApproved','releaseApproved'):
            self.assertFalse(receipt[k])

    def test_upscale_and_truncated_unsupported_picture_fails(self):
        for changed in [{'width':540},{'height':960},{'nb_frames':'1030'},{'r_frame_rate':'15/1'},{'codec_name':'mpeg4'}]:
            meta=valid_video()
            meta['streams'][0].update(changed)
            self.assertFalse(valid_native_probe(meta),changed)

    def test_missing_multiple_or_unreadable_streams_fail(self):
        self.assertFalse(valid_native_probe({'streams':[]}))
        meta=valid_video();meta['streams'].append(meta['streams'][0].copy())
        self.assertFalse(valid_native_probe(meta))
        meta=valid_video();meta['streams'][0]['nb_frames']='unreadable'
        self.assertFalse(valid_native_probe(meta))

    def test_failure_rate_uses_observed_denominator_and_holds_entire_benchmark(self):
        report=research_receipt([{'status':'PASS_TECHNICAL_ONLY'},{'status':'HOLD'}])
        self.assertEqual(report['attempts'],2)
        self.assertEqual(report['successes'],1)
        self.assertEqual(report['observedFailureCount'],1)
        self.assertEqual(report['observedFailureFraction'],.5)
        self.assertEqual(report['status'],'HOLD')
        self.assertFalse(report['longTermFailureRateEstablished'])

    def test_no_unbounded_success_without_runs(self):
        x=research_receipt([])
        self.assertEqual(x['status'],'HOLD')
        self.assertIsNone(x['observedFailureFraction'])

    def test_cost_does_not_invent_cloud_billing_rate(self):
        x=research_receipt([{'status':'PASS_TECHNICAL_ONLY'}])
        self.assertEqual(x['externalGenerationApiCostUsd'],0)
        self.assertIn('UNKNOWN',x['computePriceUsd'])
        self.assertIn('hourly_rate',x['renderCostFormula'])

    def test_self_provided_modified_archive_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive=Path(tmp)/'forged.zip'
            with zipfile.ZipFile(archive,'w') as z:
                z.writestr('original/build_fullhd_matchcut.py','print("forged")')
            with self.assertRaisesRegex(ValueError,'UNTRUSTED_SOURCE_ZIP'):
                extract_exact_original(archive,Path(tmp)/'destination')

if __name__=='__main__':unittest.main()
