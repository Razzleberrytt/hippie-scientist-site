"""Actual source-pinned scene-six observations and negative/positive research contracts."""
import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import cue_focus_semantic_review as guard

ROOT=Path(__file__).parent
REAL=ROOT/'fixtures/gut-scene6-native-focus.json'
SRT=ROOT/'fixtures/gut-original-19cue.srt'
EXPECTED_REPORT_SHA='79a5fca1e830d77571630be2a85e6a2674a5ce01d774ed51f28cfe9e927c054c'

class CueFocusNegativeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report=json.loads(REAL.read_text())
        cls.srt=guard.parse_srt(SRT.read_text())

    def test_real_sha_pinned_physical_report_literal_warning_not_approval(self):
        self.assertEqual(guard.sha256_file(REAL),EXPECTED_REPORT_SHA)
        result=guard.evaluate(self.report,self.srt)
        self.assertEqual([(x['cueId'],x['kind'],x['visualRole']) for x in result['findings']], [
            (17,'SPOKEN_LITERAL_CARD_NOT_FOCUSED_IN_CAPTION_WINDOW','FOOD'),
            (18,'MAJORITY_FOCUS_WITHOUT_LITERAL_CARD_WORD','FOOD'),
            (19,'MAJORITY_FOCUS_WITHOUT_LITERAL_CARD_WORD','OTHER MEDS')])
        self.assertTrue(result['needsVerifiedOriginalWordOnsets'])
        self.assertFalse(result['mayPublish'])
        self.assertFalse(result['excellentCertified'])
        self.assertEqual(result['atomicCreditAwarded'],0)

    def test_shuffled_caption_literal_role_order_is_not_semantic_change(self):
        data=copy.deepcopy(self.report)
        data['cueEvidence'][0]['explicitVerbatimCardWordsInPhrase'].reverse()
        self.assertEqual(len(guard.evaluate(data,self.srt)['findings']),3)

    def test_no_automatic_scientific_synonym_inference(self):
        result=guard.evaluate(self.report,self.srt)
        target=[x for x in result['findings'] if x['cueId']==19]
        self.assertEqual(target[0]['visualRole'],'OTHER MEDS')
        self.assertTrue(result['needsEditorialSourceMapping'])
        self.assertFalse(result['scienceApproved'])

    def test_reject_authenticated_but_truncated_cue_evidence(self):
        # Even if the producer deliberately SHA-pinned a truncated report,
        # omissions of overlapping original SRT cues cannot pass silently.
        data=copy.deepcopy(self.report)
        data['cueEvidence']=[ref for ref in data['cueEvidence'] if ref['cueId']!=17]
        with self.assertRaisesRegex(guard.FocusHold,'SOURCE_CUE_EVIDENCE_INCOMPLETE_OR_EXTRA'):
            guard.evaluate(data,self.srt)

    def test_reject_extra_cue_not_overlapping_scene(self):
        data=copy.deepcopy(self.report)
        extra=copy.deepcopy(data['cueEvidence'][-1])
        src=next(c for c in self.srt if c['cueId']==1)
        extra.update({'cueId':1,'originalText':src['text'],
                      'declaredStartMs':src['startMs'],'declaredEndMs':src['endMs']})
        data['cueEvidence'].append(extra)
        with self.assertRaisesRegex(guard.FocusHold,'SOURCE_CUE_EVIDENCE_INCOMPLETE_OR_EXTRA'):
            guard.evaluate(data,self.srt)

    def test_output_create_is_exclusive_when_other_process_wins_race(self):
        with tempfile.TemporaryDirectory() as d:
            out=Path(d)/'fresh-report.json'
            def competitor(**_kwargs):
                out.write_bytes(b'original-data-owned-by-other-process')
                return {'status':'RESEARCH_SEMANTIC_FOCUS_REVIEW_HOLD','findings':[]}
            args=['cue_focus_semantic_review.py','--report',str(REAL),
                  '--report-sha256',EXPECTED_REPORT_SHA,
                  '--film',str(REAL),'--original-srt',str(SRT),'--out',str(out)]
            with patch('sys.argv',args), patch.object(guard,'audit',side_effect=competitor):
                with self.assertRaisesRegex(guard.FocusHold,'REPORT_OUTPUT_ALIASES_SOURCE_OR_ALREADY_EXISTS'):
                    guard.main()
            self.assertEqual(out.read_bytes(),b'original-data-owned-by-other-process')

    def test_reject_report_with_falsified_source_phrase(self):
        data=copy.deepcopy(self.report)
        data['cueEvidence'][1]['originalText']='Food is always absorbed'
        with self.assertRaisesRegex(guard.FocusHold,'SOURCE_CAPTION_CUE_IDENTITY_MISMATCH'):
            guard.evaluate(data,self.srt)

    def test_reject_forged_focus_counts_even_if_runs_still_unchanged(self):
        data=copy.deepcopy(self.report)
        data['cueEvidence'][1]['physicalFocusFrames']['FOOD']=51
        with self.assertRaisesRegex(guard.FocusHold,'SOURCE_CUE_RECORDED_PHYSICAL_COUNTS_DISAGREE'):
            guard.evaluate(data,self.srt)

    def test_reject_missing_focus_frame_and_off_by_one(self):
        data=copy.deepcopy(self.report)
        data['focusRuns'][1]['firstFrame']+=1
        data['focusRuns'][1]['inclusiveFrames']-=1
        with self.assertRaisesRegex(guard.FocusHold,'SOURCE_FOCUS_RUN_GAP_OVERLAP_OR_COUNT'):
            guard.evaluate(data,self.srt)
        data=copy.deepcopy(self.report)
        data['cueEvidence'][0]['frameSpanInclusive']=[719,751]
        with self.assertRaisesRegex(guard.FocusHold,'SOURCE_CUE_FRAME_BOUNDARY_DISAGREES'):
            guard.evaluate(data,self.srt)

    def test_external_sha_required_and_bad_film_bytes_not_sufficient(self):
        with tempfile.TemporaryDirectory() as directory:
            film=Path(directory)/'fake-film.mp4'
            film.write_bytes(b'wrong film')
            with self.assertRaisesRegex(guard.FocusHold,'EXTERNALLY_PINNED_REPORT_SHA_REQUIRED'):
                guard.audit(report_path=REAL,expected_report_sha='',film_path=film,srt_path=SRT)
            with self.assertRaisesRegex(guard.FocusHold,'PINNED_FILM_OR_SRT_BYTES_CHANGED'):
                guard.audit(report_path=REAL,expected_report_sha=EXPECTED_REPORT_SHA,film_path=film,srt_path=SRT)

    def test_reject_report_sha_modified_without_external_repin(self):
        with tempfile.TemporaryDirectory() as directory:
            clone=Path(directory)/'altered.json'
            v=copy.deepcopy(self.report)
            v['cueEvidence'][1]['physicalFocusFrames']['FOOD']=52
            clone.write_text(json.dumps(v))
            with self.assertRaisesRegex(guard.FocusHold,'PINNED_AUDIT_REPORT_CHANGED'):
                guard.audit(report_path=clone,expected_report_sha=EXPECTED_REPORT_SHA,film_path=SRT,srt_path=SRT)

    def test_positive_literal_group_is_only_absence_of_one_warning(self):
        # Synthetic positive fixture with physically attributed focus each cue;
        # no implication that the audience learned or the original audio matches.
        data=copy.deepcopy(self.report)
        data['schema']=guard.GENERAL_SCHEMA
        data['framesPerSecond']=30
        data['sceneFrameRangeInclusive']=[0,59]
        data['decodedSceneFrames']=60
        data['focusRuns']=[{'focus':'FORM','firstFrame':0,'lastFrame':59,'inclusiveFrames':60}]
        data['cueEvidence']=[{'cueId':1,'originalText':'Form', 'declaredStartMs':0,
                'declaredEndMs':2000,'frameSpanInclusive':[0,59],
                'physicalFocusFrames':{'FORM':60,'AMBIGUOUS':0},
                'explicitVerbatimCardWordsInPhrase':['FORM']}]
        cues=[{'cueId':1,'startMs':0,'endMs':2000,'text':'Form'}]
        result=guard.evaluate(data,cues)
        self.assertEqual(result['findings'],[])
        self.assertEqual(result['status'],'RESEARCH_SEMANTIC_FOCUS_REVIEW_HOLD')
        self.assertFalse(result['productionEligible'])

    def test_reject_transient_read_bytes_despite_unchanged_pinned_paths(self):
        # Simulate a swapped pathname visible to the read while the on-disk
        # pinned report/SRT bytes remain unchanged before and after audit.
        with tempfile.TemporaryDirectory() as directory:
            folder=Path(directory)
            film=folder/'fixture-film.mp4'
            film.write_bytes(b'exact-research-only-film-identity')
            report=copy.deepcopy(self.report)
            report['exactFilmSha256']=hashlib.sha256(film.read_bytes()).hexdigest()
            report['exactSrtSha256']=hashlib.sha256(SRT.read_bytes()).hexdigest()
            path=folder/'pinned-report.json'
            path.write_text(json.dumps(report),encoding='utf8')
            pin=hashlib.sha256(path.read_bytes()).hexdigest()
            original=guard.read_bounded_bytes

            def swapped_report(source,limit):
                if Path(source)==path:
                    return b'{"swapped":true}'
                return original(source,limit)
            with patch.object(guard,'read_bounded_bytes',side_effect=swapped_report):
                with self.assertRaisesRegex(guard.FocusHold,'PINNED_AUDIT_REPORT_CHANGED'):
                    guard.audit(report_path=path,expected_report_sha=pin,
                                film_path=film,srt_path=SRT)

            def swapped_srt(source,limit):
                raw=original(source,limit)
                if Path(source)==SRT:
                    return raw.replace(b'Taking',b'Faking',1)
                return raw
            with patch.object(guard,'read_bounded_bytes',side_effect=swapped_srt):
                with self.assertRaisesRegex(guard.FocusHold,'PINNED_FILM_OR_SRT_BYTES_CHANGED'):
                    guard.audit(report_path=path,expected_report_sha=pin,
                                film_path=film,srt_path=SRT)
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(),pin)
            self.assertEqual(hashlib.sha256(SRT.read_bytes()).hexdigest(),report['exactSrtSha256'])

    def test_reject_file_growing_between_hash_preflight_and_source_read(self):
        with tempfile.TemporaryDirectory() as directory:
            p=Path(directory)/'grown.json'
            p.write_bytes(b'x'*16)
            with self.assertRaisesRegex(guard.FocusHold,'SOURCE_EXCEEDS_BYTE_LIMIT'):
                guard.read_bounded_utf8(p,8)
            p.write_bytes(b'\xff\xfe')
            with self.assertRaisesRegex(guard.FocusHold,'SOURCE_DOCUMENT_INVALID'):
                guard.read_bounded_utf8(p,8)

    def test_reject_invalid_cue_timing_and_bad_input_shape(self):
        with self.assertRaisesRegex(guard.FocusHold,'SRT_TIMECODE_INVALID'):
            guard.parse_srt('1\n00:61:00,000 --> 00:00:02,000\nFORM')
        with self.assertRaisesRegex(guard.FocusHold,'SRT_TIMELINE_INVALID'):
            guard.parse_srt('1\n00:00:00,000 --> 00:00:02,000\nFORM\n\n2\n00:00:01,000 --> 00:00:03,000\nFOOD')
        with self.assertRaisesRegex(guard.FocusHold,'SOURCE_AUDIT_SCHEMA_INVALID'):
            guard.evaluate({'schema':'other'},self.srt)

if __name__=='__main__':unittest.main()
