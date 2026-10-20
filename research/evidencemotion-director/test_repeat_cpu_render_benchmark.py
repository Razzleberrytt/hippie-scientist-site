import signal
import subprocess
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import Mock, patch
from repeat_cpu_render_benchmark import (
    valid_native_probe, research_receipt, extract_exact_original,
    measured_resource_fields, terminate_render_process_group
)

SHA_A = 'a'*64
SHA_B = 'b'*64

def good(hashvalue=SHA_A):
    return {'status':'PASS_TECHNICAL_ONLY','silentMovieSha256':hashvalue,
            'totalCpuMinutes':1.6,'wallSeconds':61.3,'peakResidentMiB':658.45}

def valid_video():
    return {'streams':[{'codec_type':'video','codec_name':'h264','width':1080,
        'height':1920,'r_frame_rate':'30/1','nb_frames':'1031'}]}

class RenderBenchmarkRegressions(unittest.TestCase):
    def test_correct_native_picture_metadata_only_not_release(self):
        self.assertTrue(valid_native_probe(valid_video()))
        receipt=research_receipt([good(),good()],expected_attempts=2)
        self.assertEqual(receipt['status'],'PASS_RESEARCH_ONLY')
        self.assertEqual(receipt['identicalSilentMovieSha256'],SHA_A)
        for k in ('scientificEditorialApproved','craftApproved','humanVoiceApproved','devicePlaybackApproved','releaseApproved'):
            self.assertFalse(receipt[k])

    def test_upscale_and_truncated_unsupported_picture_fails(self):
        for changed in [{'width':540},{'height':960},{'nb_frames':'1030'},
                        {'r_frame_rate':'15/1'},{'codec_name':'mpeg4'}]:
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
        report=research_receipt([good(),{'status':'HOLD'}],expected_attempts=2)
        self.assertEqual(report['attempts'],2)
        self.assertEqual(report['successes'],1)
        self.assertEqual(report['observedFailureCount'],1)
        self.assertEqual(report['observedFailureFraction'],.5)
        self.assertEqual(report['status'],'HOLD')
        self.assertFalse(report['longTermFailureRateEstablished'])

    def test_no_unbounded_success_without_runs(self):
        x=research_receipt([],expected_attempts=3)
        self.assertEqual(x['status'],'HOLD')
        self.assertIsNone(x['observedFailureFraction'])

    def test_partial_successful_receipts_never_pass(self):
        for n in [1,2]:
            r=research_receipt([good() for _ in range(n)],expected_attempts=3)
            self.assertEqual(r['status'],'HOLD')
            self.assertEqual(r['expectedAttempts'],3)
        self.assertEqual(research_receipt([good()]*3,expected_attempts=3)['status'],'PASS_RESEARCH_ONLY')

    def test_different_film_hashes_fail_repeatability_even_when_both_decode(self):
        x=research_receipt([good(SHA_A),good(SHA_B)],expected_attempts=2)
        self.assertEqual(x['status'],'HOLD')
        self.assertFalse(x['matchingOutputHashes'])

    def test_missing_or_invalid_film_hashes_fail_closed(self):
        for bad in ['',None,'not-a-hash']:
            x=research_receipt([good(SHA_A),good(bad)],expected_attempts=2)
            self.assertEqual(x['status'],'HOLD')
        with self.assertRaisesRegex(ValueError,'EXPECTED_ATTEMPT_COUNT_REQUIRED'):
            research_receipt([good()],expected_attempts=0)

    def test_missing_malformed_and_nonfinite_resource_timing_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'time.csv'
            with self.assertRaisesRegex(ValueError,'RESOURCE_TIMING_MISSING'):
                measured_resource_fields(path)
            for text in ['abc','12,4,2','nan,1,1,670000','1,-3,1,670000','4,2,1,0']:
                path.write_text(text)
                with self.assertRaises(ValueError,msg=text):
                    measured_resource_fields(path)
            path.write_text('61.30,77.3,26.4,674252')
            actual=measured_resource_fields(path)
            self.assertAlmostEqual(actual['totalCpuMinutes'],(77.3+26.4)/60,3)
            self.assertGreater(actual['peakResidentMiB'],600)

    def test_timeout_kills_entire_render_process_group(self):
        p=Mock()
        p.pid=12345
        p.poll.return_value=None
        p.wait.side_effect=[subprocess.TimeoutExpired('test',3),-9]
        with patch('repeat_cpu_render_benchmark.os.killpg') as kill:
            terminate_render_process_group(p)
        self.assertEqual(kill.call_count,2)
        self.assertEqual(kill.call_args_list[0].args,(p.pid,signal.SIGTERM))
        self.assertEqual(kill.call_args_list[1].args,(p.pid,signal.SIGKILL))

    def test_no_kill_when_renderer_already_finished(self):
        p=Mock();p.poll.return_value=0
        with patch('repeat_cpu_render_benchmark.os.killpg') as kill:
            terminate_render_process_group(p)
        kill.assert_not_called()

    def test_cost_does_not_invent_cloud_billing_rate(self):
        x=research_receipt([good()],expected_attempts=1)
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
