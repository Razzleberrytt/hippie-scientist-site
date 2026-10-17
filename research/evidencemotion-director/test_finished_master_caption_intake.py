"""Actual FFmpeg-backed caption-receipt integrity/false-authority controls."""
import hashlib
import json
import subprocess
import tempfile
import unittest
import wave
import zipfile
from pathlib import Path
from finished_master_caption_intake import inspect


def sha(f):
    return hashlib.sha256(Path(f).read_bytes()).hexdigest()


class MasterCaptionIntakeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.root = Path(cls.temp.name)
        cls.film = cls.root/'synthetic_master.mp4'
        subprocess.run(['ffmpeg','-hide_banner','-v','error','-f','lavfi','-i','testsrc2=size=96x170:rate=30:duration=1.2',
                        '-f','lavfi','-i','sine=frequency=440:sample_rate=24000:duration=1.2',
                        '-map','0:v:0','-map','1:a:0','-c:v','libx264','-pix_fmt','yuv420p',
                        '-c:a','aac','-y',str(cls.film)],check=True)
        cls.wav=cls.root/'voice.wav'
        with wave.open(str(cls.wav),'wb') as w:
            w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000);w.writeframes(b'\x00\x00'*1000)
        cls.audio_sha=sha(cls.wav)
        cls.srt=('1\n00:00:00,100 --> 00:00:00,500\nHello there\n\n'
                 '2\n00:00:00,600 --> 00:00:01,000\nStay safe.\n')

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def package(self, *, stale=False, alter=None):
        master={'video':self.film.name,'sha256':sha(self.film),
                'width':96,'height':170,'frame_count':36,
                'postingApproval':False,'published':False,
                'narrator_source_wav_sha256':self.audio_sha}
        cap={'caption_groups':2,'word_count':4,'exact_wav_sha256':self.audio_sha,
             'mayPublish':False,'final_file':'old_V2.mp4' if stale else self.film.name,
             'final_mp4_sha256':hashlib.sha256(b'prior movie').hexdigest() if stale else sha(self.film),
             'cues':[{'start':0.1,'end':0.5,'text':'Hello there','words':[0,1]},
                     {'start':0.6,'end':1.0,'text':'Stay safe.','words':[2,3]}]}
        asr={'source_wav_sha256':self.audio_sha,'mayPublish':False}
        if alter:
            alter(master,cap,asr)
        z=self.root/('test_'+str(len(list(self.root.glob('test_*.zip'))))+'.zip')
        with zipfile.ZipFile(z,'w',compression=zipfile.ZIP_DEFLATED) as f:
            f.write(self.film,self.film.name)
            f.writestr('MASTER_AUTOMATED_QA.json',json.dumps(master))
            f.writestr('REAL_CAPTION_QA.json',json.dumps(cap))
            f.writestr('INDEPENDENT_SOURCE_ASR.json',json.dumps(asr))
            f.writestr('Phenibut_REAL_MFA_WORD_CAPTIONS.srt',self.srt)
            f.write(self.wav,'ORIGINAL_NARRATOR_PROVENANCE/Phenibut_ORIGINAL_KOKORO.wav')
        return z

    def intake(self,archive):
        return inspect(archive=archive,archive_sha=sha(archive),movie=self.film,movie_sha=sha(self.film))

    def test_stale_v2_caption_proof_is_held_not_carried_to_v3(self):
        result=self.intake(self.package(stale=True))
        self.assertFalse(result['captionProofReferencesCurrentFilm'])
        self.assertEqual(result['decision'],'STALE_CAPTION_FILM_PROOF_RELEASE_HOLD')
        self.assertTrue(result['originalCaptionSrtAndReportInternalConsistency'])
        self.assertFalse(result['mayPublish'])

    def test_current_film_receipt_still_not_a_phone_or_science_pass(self):
        result=self.intake(self.package())
        self.assertTrue(result['captionProofReferencesCurrentFilm'])
        self.assertEqual(result['decision'],'CURRENT_RECEIPT_TECHNICAL_ONLY_RELEASE_HOLD')
        self.assertFalse(result['phoneAndIndependentPhoneticsCraftScienceApproved'])
        self.assertFalse(result['firstExcellentMasterAccepted'])

    def test_externally_tampered_archive_or_film_pin_rejected(self):
        z=self.package()
        bad=hashlib.sha256(b'wrong').hexdigest()
        with self.assertRaisesRegex(ValueError,'EXTERNAL_SHA_MISMATCH'):
            inspect(archive=z,archive_sha=bad,movie=self.film,movie_sha=sha(self.film))
        with self.assertRaisesRegex(ValueError,'EXTERNAL_SHA_MISMATCH'):
            inspect(archive=z,archive_sha=sha(z),movie=self.film,movie_sha=bad)

    def test_forged_posting_approval_and_published_rejected(self):
        for field in ('postingApproval','published'):
            z=self.package(alter=lambda m,c,a: m.__setitem__(field,True))
            with self.subTest(field=field),self.assertRaisesRegex(ValueError,'FORGED_PUBLICATION_APPROVAL'):
                self.intake(z)

    def test_mismatched_source_wav_or_asr_or_caption_flag_rejected(self):
        for target in ('master','asr','caption'):
            def poison(m,c,a):
                if target=='master':m['narrator_source_wav_sha256']='0'*64
                elif target=='asr':a['source_wav_sha256']='0'*64
                else:c['mayPublish']=True
            z=self.package(alter=poison)
            with self.subTest(target=target),self.assertRaisesRegex(ValueError,'NARRATOR_PROVENANCE_OR_RELEASE_FLAG_INVALID'):
                self.intake(z)

    def test_srt_cue_mismatch_and_missing_word_rejected(self):
        for target in ('text','words'):
            def poison(m,c,a):
                c['cues'][0][target] = 'Wrong subtitle' if target=='text' else [0,2]
            z=self.package(alter=poison)
            with self.subTest(target=target),self.assertRaisesRegex(ValueError,'CAPTION_QA_AND_SRT_DISAGREE|CAPTION_WORD_INVENTORY_GAP_OR_DUPLICATE'):
                self.intake(z)

    def test_bad_qa_film_identity_does_not_become_positive(self):
        def poison(m,c,a):m['sha256']=hashlib.sha256(b'wrong movie').hexdigest()
        with self.assertRaisesRegex(ValueError,'MASTER_METADATA_NOT_BOUND_TO_CURRENT_MOVIE'):
            self.intake(self.package(alter=poison))

    def test_duplicate_qa_json_fields_are_rejected(self):
        z=self.package()
        replacement=self.root/'duped.zip'
        with zipfile.ZipFile(z) as src,zipfile.ZipFile(replacement,'w',compression=zipfile.ZIP_DEFLATED) as out:
            for filename in src.namelist():
                raw=src.read(filename)
                if filename=='REAL_CAPTION_QA.json':
                    raw=raw.replace(b'"caption_groups": 2',b'"caption_groups": 2, "caption_groups": 2')
                out.writestr(filename,raw)
        with self.assertRaisesRegex(ValueError,'DUPLICATE_JSON_KEY'):
            self.intake(replacement)


if __name__=='__main__':unittest.main()
