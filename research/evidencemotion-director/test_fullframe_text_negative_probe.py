"""Physical FFmpeg/H.264 and Tesseract per-frame negative regressions (research)."""
import json
import subprocess
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path
from fullframe_text_negative_probe import SCHEMA, sha, check

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'


class TransientEncodedTextTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.root = Path(cls.tmp.name)
        cls.clean = cls.encode('clean', None)
        cls.flash = cls.encode('single-frame-flash', 'flash')
        cls.omission = cls.encode('single-frame-omission', 'omission')

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    @classmethod
    def encode(cls, name, mutation):
        dest = cls.root / (name + '.mp4')
        constant = f'drawtext=fontfile={FONT}:text=STRUCTURE:fontcolor=white:fontsize=60:x=100:y=780'
        tail = f'drawtext=fontfile={FONT}:text=EFFECTS:fontcolor=white:fontsize=60:x=700:y=780'
        enabled = 'not(eq(n,9))' if mutation == 'omission' else '1'
        middle = f'drawtext=fontfile={FONT}:text=NOT:fontcolor=white:fontsize=60:x=500:y=780:enable={enabled}'
        vf = f'{constant},{middle},{tail}'
        if mutation == 'flash':
            vf += f',drawtext=fontfile={FONT}:text=WRONG:fontcolor=white:fontsize=60:x=100:y=860:enable=eq(n\,9)'
        vf = vf.replace('eq(n,9)', 'eq(n\,9)')
        subprocess.run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-f','lavfi',
            '-i','color=c=black:s=1080x1920:r=30:d=1', '-vf', vf, '-c:v','libx264',
            '-preset','ultrafast','-crf','19','-pix_fmt','yuv420p','-y',str(dest)],
            check=True, timeout=45)
        return dest

    def manifest(self, film, changes=None):
        data = {'schema': SCHEMA, 'status':'RESEARCH_ONLY', 'mayPublish':False,
            'filmSha256':sha(film), 'cropPx':[0,700,1080,300],
            'windows':[{'start':0,'end':30,'requiredWords':['STRUCTURE','NOT','EFFECTS'],
                         'allowedWords':['STRUCTURE','NOT','EFFECTS']}]}
        if changes:
            changes(data)
        path = self.root / 'manifest.json'
        path.write_text(json.dumps(data))
        return path

    def test_all_thirty_real_cfr_frames_pass_but_never_approve_viewers(self):
        r=check(self.clean,self.manifest(self.clean))
        self.assertEqual((r['framesOCRChecked'],r['defectFrames']), (30,0))
        self.assertFalse(r['mayPublish'])
        self.assertFalse(r['handsetReadabilityApproved'])

    def test_one_frame_false_science_word_observed_outside_three_sample_indices(self):
        r=check(self.flash,self.manifest(self.flash))
        self.assertEqual(r['status'],'HOLD')
        self.assertEqual([x['frameIndex'] for x in r['defects']],[9])
        self.assertIn('wrong',r['defects'][0]['unexpectedWords'])
        self.assertNotIn(9,[7,15,22])

    def test_one_frame_missing_required_word_is_hold(self):
        r=check(self.omission,self.manifest(self.omission))
        self.assertEqual(r['status'],'HOLD')
        self.assertEqual([x['frameIndex'] for x in r['defects']],[9])
        self.assertIn('not',r['defects'][0]['missingRequiredWords'])

    def test_modified_film_hash_cannot_inherit_ocr_receipt(self):
        def change(x): x['filmSha256']='0'*64
        with self.assertRaisesRegex(ValueError,'ENCODED_SHA_MISMATCH'):
            check(self.clean,self.manifest(self.clean,change))

    def test_uncovered_plan_cannot_claim_full_frame(self):
        def change(x): x['windows'][0]['end']=29
        with self.assertRaisesRegex(ValueError,'FULL_FRAME_WORD_PLAN_REQUIRED'):
            check(self.clean,self.manifest(self.clean,change))

    def test_raw_pts_omission_does_not_pass_from_inferred_timestamp(self):
        from fullframe_text_negative_probe import command as real_command
        def mutate_probe(argv):
            output=real_command(argv)
            if argv[0]=='ffprobe':
                data=json.loads(output)
                del data['frames'][9]['pts_time']
                return json.dumps(data).encode()
            return output
        with patch('fullframe_text_negative_probe.command', side_effect=mutate_probe):
            with self.assertRaisesRegex(ValueError,'PHYSICAL_FRAME_RAW_PTS_MISSING'):
                check(self.clean,self.manifest(self.clean))

    def test_raw_pts_jump_does_not_pass_from_good_inferred_timestamp(self):
        from fullframe_text_negative_probe import command as real_command
        def mutate_probe(argv):
            output=real_command(argv)
            if argv[0]=='ffprobe':
                data=json.loads(output)
                data['frames'][9]['pts_time']='0.400000'
                return json.dumps(data).encode()
            return output
        with patch('fullframe_text_negative_probe.command', side_effect=mutate_probe):
            with self.assertRaisesRegex(ValueError,'PHYSICAL_FRAME_PTS_DISCONTINUITY:9'):
                check(self.clean,self.manifest(self.clean))

    def test_duplicate_expected_words_invalid(self):
        def change(x): x['windows'][0]['requiredWords'].append('STRUCTURE')
        with self.assertRaisesRegex(ValueError,'INVALID_WINDOW_WORD_ORACLE'):
            check(self.clean,self.manifest(self.clean,change))

    def test_vacuous_required_words_invalid(self):
        def change(x): x['windows'][0]['requiredWords']=[]
        with self.assertRaisesRegex(ValueError,'INVALID_WINDOW_WORD_ORACLE'):
            check(self.clean,self.manifest(self.clean,change))

    def test_duplicate_manifest_fields_invalid(self):
        from fullframe_text_negative_probe import strict_json
        path=self.root/'duplicated.json'
        path.write_text('{"schema":"research","schema":"forged"}')
        with self.assertRaisesRegex(ValueError,'DUPLICATE_MANIFEST_FIELD'):
            strict_json(path)

    def test_output_alias_to_source_rejected_before_decode(self):
        import sys
        from fullframe_text_negative_probe import __file__ as script
        movie=self.clean
        manifest=self.manifest(movie)
        digest_before=sha(movie)
        result=subprocess.run([sys.executable,script,'--film',str(movie),
                               '--manifest',str(manifest),'--out',str(movie)],
                              capture_output=True, text=True)
        self.assertNotEqual(result.returncode,0)
        self.assertIn('OUTPUT_ALIASES_SOURCE',result.stderr)
        self.assertEqual(sha(movie),digest_before)

    def test_existing_receipt_never_overwritten(self):
        import sys
        from fullframe_text_negative_probe import __file__ as script
        output=self.root/'existing-report.json'
        output.write_text('{"owner":"independent"}')
        result=subprocess.run([sys.executable,script,'--film',str(self.clean),
                               '--manifest',str(self.manifest(self.clean)),
                               '--out',str(output)],capture_output=True,text=True)
        self.assertNotEqual(result.returncode,0)
        self.assertIn('DO_NOT_OVERWRITE_PRIOR_RECEIPT',result.stderr)
        self.assertEqual(output.read_text(),'{"owner":"independent"}')

    def test_missing_source_word_requires_negative_hold_not_silence(self):
        def change(x): x['windows'][0]['requiredWords']=['SOURCE']
        with self.assertRaisesRegex(ValueError,'INVALID_WINDOW_WORD_ORACLE'):
            check(self.clean,self.manifest(self.clean,change))


if __name__ == '__main__':
    unittest.main()
