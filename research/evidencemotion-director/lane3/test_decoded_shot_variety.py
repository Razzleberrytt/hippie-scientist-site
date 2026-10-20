"""Lane 3 independent decoded-film similarity safety tests. No release approval."""
import copy
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
import wave
import decoded_shot_variety as D
from unittest.mock import patch

from decoded_shot_variety import CraftHold, audit, validate_story, sample_frame_triplet, THUMB_W, THUMB_H, fingerprint, compare, similar


class DecodedShotVarietyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
            raise unittest.SkipTest('FFmpeg + FFprobe required for actual decoded media')
        cls.tempdir = tempfile.TemporaryDirectory()
        cls.root = Path(cls.tempdir.name)
        cls.film = cls.root/'real-encoded-test.mp4'
        # A real H.264 encoded test with changing source-area rectangles but
        # near-identical science areas at shots 0→1 and 5→6. The header changes
        # during 0→1; it must NOT mask a repeated body composition.
        vf = []
        x_positions = [200,200,350,490,630,180,180,700,380]
        for i,x in enumerate(x_positions):
            a,b=i/3,(i+1)/3
            vf.append(f'drawbox=x={x}:y=800:w=130:h=190:color=white:t=fill:enable=between(t\\,{a:.6f}\\,{b:.6f})')
            vf.append(f'drawbox=x={x+60}:y=950:w=130:h=70:color=yellow:t=fill:enable=between(t\\,{a:.6f}\\,{b:.6f})')
        vf.append('drawbox=x=80:y=100:w=450:h=110:color=red:t=fill:enable=between(t\\,0\\,.33)')
        vf.append('drawbox=x=80:y=100:w=450:h=110:color=blue:t=fill:enable=between(t\\,.34\\,.67)')
        command=['ffmpeg','-hide_banner','-loglevel','error','-y',
                 '-f','lavfi','-i','color=c=0x07111b:s=1080x1920:r=30:d=3',
                 '-vf',','.join(vf),'-frames:v','90','-an','-c:v','libx264',
                 '-preset','ultrafast','-crf','26','-pix_fmt','yuv420p',str(cls.film)]
        subprocess.run(command,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        digest=hashlib.sha256(cls.film.read_bytes()).hexdigest()
        cls.story = {'nineShotsMapped':9,'encodedH264Sha256':digest,
                     'mayPublish':False,'shots':[
                         {'shot':f'scene-{i}','startSec':i/3,'endSec':(i+1)/3}
                         for i in range(9)]}
        cls.story_file=cls.root/'story.json'
        cls.story_file.write_text(json.dumps(cls.story))

    @classmethod
    def tearDownClass(cls):
        cls.tempdir.cleanup()

    def test_real_decoded_film_catches_same_science_body_despite_header_change(self):
        data=audit(self.film,self.story_file)
        self.assertEqual(data['fullDecodedFrames'],90)
        self.assertEqual(data['status'],'DECODED_VISUAL_REVIEW_REQUIRED')
        self.assertTrue(data['comparisons'][0]['nearDuplicateReviewCandidate'])
        self.assertTrue(data['comparisons'][5]['nearDuplicateReviewCandidate'])
        self.assertFalse(data['comparisons'][2]['nearDuplicateReviewCandidate'])
        self.assertEqual(data['nearDuplicateReviewCount'],2)
        self.assertEqual(data['schema'],'ths-lane3-decoded-visual-variety-negative-filter-v2')
        self.assertEqual(data['uniqueDecodedFramesSampled'],43)
        self.assertEqual(len(data['withinShotTemporalReview']),9)
        self.assertEqual(len(data['boundaryExitEntranceReview']),8)
        self.assertEqual(len(data['boundaryActualCutAdjacentReview']),8)
        self.assertTrue(all(c['adjacentEncodedFrames']
                            for c in data['boundaryActualCutAdjacentReview']))
        self.assertEqual([(c['exitFrame'],c['entryFrame'])
                          for c in data['boundaryActualCutAdjacentReview']],
                         [(10*n-1,10*n) for n in range(1,9)])
        self.assertTrue(data['withinShotTemporalReview'][0]['nearStaticBodyReviewCandidate'])
        self.assertTrue(data['withinShotTemporalReview'][5]['nearStaticBodyReviewCandidate'])
        self.assertTrue(data['boundaryExitEntranceReview'][5]['nearDuplicateReviewCandidate'])
        self.assertFalse(data['excellentCertified'])
        self.assertFalse(data['mayPublish'])
        self.assertFalse(data['creativeExceptionsAutomaticallyGranted'])

    def test_real_h264_exact_cut_duplicate_hidden_by_quarter_shot_samples(self):
        """Physical edited-cut adversary: repeated frames 9-10 across scene cut.

        The two surrounding quarter-shot positions look different. Source
        pixels are fabricated test art, not original clinical film evidence.
        """
        with tempfile.TemporaryDirectory() as tempdir:
            root=Path(tempdir)
            raw=root/'ninety-frames.gray'
            film=root/'encoded-edit.mp4'
            with raw.open('wb') as handle:
                for n in range(90):
                    x=38 if n in (9,10) else ([12,65][n//10]
                              if n<20 else (9+n//10*7))
                    frame=bytearray([14])*(96*170)
                    for y in range(75,103):
                        for xx in range(x,min(x+18,96)):
                            frame[y*96+xx]=224
                    handle.write(frame)
            subprocess.run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error',
                            '-f','rawvideo','-pix_fmt','gray','-s','96x170',
                            '-r','30','-i',str(raw),'-vf',
                            'scale=1080:1920:flags=neighbor','-frames:v','90',
                            '-an','-c:v','libx264','-preset','ultrafast',
                            '-crf','18','-pix_fmt','yuv420p',str(film)],
                           capture_output=True,check=True)
            story={'nineShotsMapped':9,'encodedH264Sha256':D.file_sha256(film),
                   'mayPublish':False,
                   'shots':[{'shot':f'beat-{i}','startSec':i/3,
                             'endSec':(i+1)/3} for i in range(9)]}
            story_path=root/'story.json'
            story_path.write_text(json.dumps(story))
            review=audit(film,story_path)
            self.assertEqual(review['uniqueDecodedFramesSampled'],43)
            self.assertEqual(review['fullDecodedFrames'],90)
            self.assertFalse(review['comparisons'][0]['nearDuplicateReviewCandidate'])
            self.assertFalse(review['boundaryExitEntranceReview'][0][
                'nearDuplicateReviewCandidate'])
            cut=review['boundaryActualCutAdjacentReview'][0]
            self.assertEqual((cut['exitFrame'],cut['entryFrame']),(9,10))
            self.assertTrue(cut['adjacentEncodedFrames'])
            self.assertTrue(cut['nearDuplicateReviewCandidate'])
            self.assertLessEqual(cut['scienceRoiMeanAbsoluteGrayDifference'],
                                 D.MIN_ROI_MAE)
            self.assertGreaterEqual(review['nearDuplicateActualCutCount'],1)
            self.assertFalse(review['creativeExceptionsAutomaticallyGranted'])
            self.assertFalse(review['excellentCertified'])
            self.assertFalse(review['mayPublish'])

    def test_single_midpoint_cannot_substitute_for_temporal_evidence(self):
        # This is an actual H264 film, not invented metadata. All three
        # samples have distinct frame IDs inside each nine-shot interval.
        data=audit(self.film,self.story_file)
        for shot in data['withinShotTemporalReview']:
            indices=shot['sampleFrameNumbers']
            self.assertEqual(len(set(indices)),3)
            self.assertTrue(all(0 <= i < data['fullDecodedFrames'] for i in indices))
        self.assertNotEqual(data['nearStaticShotCount'],0)
        self.assertFalse(data['creativeExceptionsAutomaticallyGranted'])

    def test_temporal_sample_lattice_rejects_short_ambiguous_shots(self):
        self.assertEqual(sample_frame_triplet(100,110),[102,104,106])
        self.assertEqual(sample_frame_triplet(0,4),[0,1,2])
        with self.assertRaisesRegex(CraftHold,'TOO_SHORT'):
            sample_frame_triplet(0,2)
        with self.assertRaisesRegex(CraftHold,'SAMPLE_COLLISION'):
            sample_frame_triplet(0,3)

    def test_temporal_change_does_not_erase_midpoint_repetition(self):
        # Designed synthetic pixel evidence in the exact science ROI:
        # early and late match, midpoint is transiently distinct. One
        # midpoint-only sample would incorrectly call the shot varied.
        def frame(x):
            # Pure Python bitmap: hosted FFmpeg lane deliberately does NOT
            # install Pillow. These test pixels are not a native film claim.
            data=bytearray([15])*(THUMB_W*THUMB_H)
            for y in range(65,102):
                for xx in range(x,min(x+23,THUMB_W)):
                    data[y*THUMB_W+xx]=221
            return fingerprint(bytes(data))
        e, m, l=frame(10),frame(52),frame(10)
        self.assertFalse(similar(e,m)['nearDuplicateReviewCandidate'])
        self.assertTrue(similar(e,l)['nearDuplicateReviewCandidate'])
        self.assertEqual(compare(e,l)[0],0)

    def test_repeated_science_layout_not_masked_by_header_typography(self):
        def frame(header):
            data=bytearray([15])*(THUMB_W*THUMB_H)
            for y in range(65,111):
                for xx in range(20,61):
                    data[y*THUMB_W+xx]=220
            for y in range(10,26):
                for xx in range(10,61):
                    data[y*THUMB_W+xx]=header
            return fingerprint(bytes(data))
        result=similar(frame(255),frame(0))
        self.assertTrue(result['nearDuplicateReviewCandidate'])
        self.assertEqual(result['scienceRoiMeanAbsoluteGrayDifference'],0)

    def test_swapped_encoded_movie_refused(self):
        stale=copy.deepcopy(self.story)
        stale['encodedH264Sha256']='a'*64
        out=self.root/'forged.json'
        out.write_text(json.dumps(stale))
        with self.assertRaisesRegex(CraftHold,'SHA_MISMATCH'):
            audit(self.film,out)

    def test_approval_claim_in_story_refused_even_if_movie_is_unchanged(self):
        tampered=copy.deepcopy(self.story)
        tampered['mayPublish']=True
        out=self.root/'claimed-release.json'
        out.write_text(json.dumps(tampered))
        with self.assertRaisesRegex(CraftHold,'MAY_PUBLISH'):
            audit(self.film,out)

    def test_gap_in_nine_shot_coverage_refused(self):
        modified=copy.deepcopy(self.story)
        modified['shots'][5]['startSec']+=1/30
        with self.assertRaisesRegex(CraftHold,'GAP_OR_OVERLAP'):
            validate_story(modified,digest=self.story['encodedH264Sha256'],frame_count=90)

    def test_duplicate_shot_identity_refused(self):
        modified=copy.deepcopy(self.story)
        modified['shots'][7]['shot']=modified['shots'][6]['shot']
        with self.assertRaisesRegex(CraftHold,'SHOT_ID'):
            validate_story(modified,digest=self.story['encodedH264Sha256'],frame_count=90)

    def test_real_movie_byte_tamper_is_not_certified(self):
        changed=self.root/'altered.mp4'
        altered=bytearray(self.film.read_bytes())
        altered[-10]^=3
        changed.write_bytes(altered)
        with self.assertRaisesRegex(CraftHold,'SHA_MISMATCH'):
            audit(changed,self.story_file)

    def test_truncated_shot_map_and_film_decoding_cannot_get_a_pass(self):
        invalid=copy.deepcopy(self.story)
        invalid['shots'][-1]['endSec']-=1/30
        with self.assertRaisesRegex(CraftHold,'FRAME_COUNT_MISMATCH'):
            validate_story(invalid,digest=self.story['encodedH264Sha256'],frame_count=90)



class OriginalSilenceSourceHoldTests(unittest.TestCase):
    """Physical fabricated PCM fixture, NOT the real original narrator."""
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path=Path(self.temp.name)/'fixture.wav'
        a,z=D.ORIGINAL_SILENCE
        self.frames=(b'\x02\x00'*a+
                     b'\x00\x00'*(z-a)+
                     b'\x02\x00'*(D.ORIGINAL_WAV_FRAMES-z))
        with wave.open(str(self.path),'wb') as w:
            w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000)
            w.writeframes(self.frames)
        self.sha=D.file_sha256(self.path)
        self.story={'encodedH264Sha256':'e'*64,'sourceWavSha256':self.sha,
                    'mayPublish':False,'shots':[
                       {'shot':f's{i}','startSec':0,'endSec':1} for i in range(8)
                    ]+[{'shot':'source_hold','startSec':27.35,'endSec':31.25}]}
        self.decoded={'filmSha256':'e'*64,'fullDecodedFrames':1031,
                      'mayPublish':False,
                      'withinShotTemporalReview':[{'shot':'source_hold',
                        'sampleFrameNumbers':[849,879,910],
                        'nearStaticBodyReviewCandidate':True}]}

    def test_physical_pcm_silence_maps_to_director_source_hold_without_auto_edit(self):
        with patch.object(D,'ORIGINAL_WAV_SHA256',self.sha):
            result=D.audit_source_hold_silence(self.path,self.story,self.decoded)
        self.assertEqual(result['silenceDurationSec'],3.44)
        self.assertEqual(result['sourceHoldShotId'],'source_hold')
        self.assertTrue(result['visualSamplesDuringSilence'])
        self.assertTrue(result['nearStaticBodyDuringSourceHold'])
        self.assertGreater(result['sourceHoldSilenceFraction'],.88)
        self.assertEqual(result['status'],'ORIGINAL_SOURCE_HOLD_DIRECTOR_AUDITION_REQUIRED')
        for name in ('humanPacingApproved','automaticAudioTrimAllowed',
                     'automaticCaptionShiftAllowed','excellentCertified','mayPublish'):
            self.assertIs(result[name],False)

    def test_same_pcm_nonstatic_card_still_needs_human_review(self):
        self.decoded['withinShotTemporalReview'][0]['nearStaticBodyReviewCandidate']=False
        with patch.object(D,'ORIGINAL_WAV_SHA256',self.sha):
            result=D.audit_source_hold_silence(self.path,self.story,self.decoded)
        self.assertFalse(result['nearStaticBodyDuringSourceHold'])
        self.assertFalse(result['humanPacingApproved'])
        self.assertFalse(result['mayPublish'])

    def test_source_honesty_and_shot_boundary_tampering_fail_closed(self):
        for kind in ('changed_wav','wrong_source','missing_source_hold','shift_shot',
                     'wrong_movie','no_pixels','fabricated_release'):
            story=copy.deepcopy(self.story)
            decoded=copy.deepcopy(self.decoded)
            wav=self.path
            if kind=='changed_wav':
                wav=Path(self.temp.name)/'changed.wav'
                wav.write_bytes(self.path.read_bytes()+b'TAMPER')
            if kind=='wrong_source':story['sourceWavSha256']='f'*64
            if kind=='missing_source_hold':story['shots'][-1]['shot']='not-a-hold'
            if kind=='shift_shot':story['shots'][-1]['startSec']=27.60
            if kind=='wrong_movie':decoded['filmSha256']='0'*64
            if kind=='no_pixels':decoded['withinShotTemporalReview']=[]
            if kind=='fabricated_release':story['mayPublish']=True
            with self.subTest(kind=kind),patch.object(D,'ORIGINAL_WAV_SHA256',self.sha):
                with self.assertRaises(D.CraftHold):
                    D.audit_source_hold_silence(wav,story,decoded)

    def test_added_speech_inside_original_zero_run_is_not_silent(self):
        damaged=bytearray(self.frames)
        sample=D.ORIGINAL_SILENCE[0]+30000
        damaged[sample*2:sample*2+2]=b'\x12\x00'
        wav=Path(self.temp.name)/'not-silent.wav'
        with wave.open(str(wav),'wb') as w:
            w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000)
            w.writeframes(damaged)
        updated_sha=D.file_sha256(wav)
        self.story['sourceWavSha256']=updated_sha
        with patch.object(D,'ORIGINAL_WAV_SHA256',updated_sha):
            with self.assertRaisesRegex(D.CraftHold,'SOURCE_DIGITAL_ZERO_INTERVAL_CHANGED'):
                D.audit_source_hold_silence(wav,self.story,self.decoded)




class SilentEveryFrameMotionTests(unittest.TestCase):
    def test_exact_source_sample_to_frame_center_lattice(self):
        frames=D.frame_midpoint_lattice_in_zero_run(*D.ORIGINAL_SILENCE)
        # 27.65 seconds is exactly halfway into frame 829 at 30fps.
        self.assertEqual((frames[0],frames[-1],len(frames)),(829,932,104))
        for n in frames:
            self.assertGreaterEqual((2*n+1)*24000,2*D.ORIGINAL_SILENCE[0]*30)
            self.assertLess((2*n+1)*24000,2*D.ORIGINAL_SILENCE[1]*30)
        with self.assertRaisesRegex(D.CraftHold,'FRAME_GRID_INVALID'):
            D.frame_midpoint_lattice_in_zero_run(True,746160)
        with self.assertRaisesRegex(D.CraftHold,'FRAME_GRID_UNAVAILABLE'):
            D.frame_midpoint_lattice_in_zero_run(0,5)

    def test_full_decode_physically_finds_freeze_between_moving_frames(self):
        if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
            self.skipTest('Native H264 encoder needed for physical frame-motion negative')
        with tempfile.TemporaryDirectory() as td:
            root=Path(td)
            raw=root/'scenes.rgb';movie=root/'scene.mp4'
            # 120 actual RGB frames. The subject moves near beginning/end
            # but remains fixed for 65 *intervening* frames (25..89).
            with raw.open('wb') as out:
                for n in range(120):
                    frame=bytearray(b'\x0c\x0c\x0c')*(96*170)
                    x=18 if 30<=n<95 else 6+(n%18)*3
                    for y in range(56,90):
                        for xx in range(x,x+16):
                            if xx>=96:continue
                            k=3*(y*96+xx)
                            frame[k:k+3]=b'\xe8\xe8\xe8'
                    out.write(frame)
            subprocess.run(['ffmpeg','-nostdin','-v','error','-f','rawvideo',
                '-pix_fmt','rgb24','-s','96x170','-r','30','-i',str(raw),
                '-frames:v','120','-c:v','libx264','-preset','ultrafast',
                '-crf','18','-pix_fmt','yuv420p',str(movie)],
                check=True,capture_output=True)
            # The OLD three-sample intra-shot proxy compares early vs late:
            # frame 29 is moving, frame 89 lies in the 65-frame freeze.
            # Those two distinct compositions look nonstatic to that proxy,
            # while the new contiguous scan must find the frozen middle.
            three=D.sample_frame_triplet(0,120)
            self.assertEqual(three,[29,59,89])
            old=D.decode_samples(movie,three,120)
            self.assertFalse(D.similar(old[three[0]],old[three[2]])[
                'nearDuplicateReviewCandidate'])
            full=D.measure_source_hold_motion(movie,120,list(range(120)))
            self.assertEqual(full['silentFramesCompared'],120)
            self.assertEqual(full['adjacentFrameTransitionsCompared'],119)
            self.assertGreaterEqual(full['longestConsecutiveLowMotionFrames'],60)
            self.assertLess(full['longestConsecutiveLowMotionFrames'],90)
            self.assertEqual(full['excellentCertified'],False)
            self.assertEqual(full['mayPublish'],False)
            moving=D.measure_source_hold_motion(movie,120,list(range(3,17)))
            self.assertLessEqual(moving['longestConsecutiveLowMotionFrames'],4)
            self.assertGreater(full['longestConsecutiveLowMotionFrames'],
                               moving['longestConsecutiveLowMotionFrames']+40)

    def test_full_decode_refuses_sparse_or_forged_silence_lattice(self):
        for frames in ([0],[0,2,3],[1,1,2],[False,1],[1,120],list(range(125))):
            with self.subTest(frames=frames[:5]),self.assertRaisesRegex(
                    D.CraftHold,'SILENCE_VISUAL_FRAME_INTERVAL_INVALID'):
                D.measure_source_hold_motion('must-not-open.mp4',120,frames)

    def test_full_scan_wired_only_to_explicit_original_wav_optin(self):
        # Use the previously verified nine-shot + exact story/film identity
        # before passing any source-hold review; never synthesize approval.
        with tempfile.TemporaryDirectory() as td:
            root=Path(td);movie=root/'movie.mp4'
            movie.write_bytes(b'NOT A REAL MOVIE')
            wav=root/'original.wav'
            wav.write_bytes(b'synthetic WAV fixture; no source content')
            mock_wav_sha=D.file_sha256(wav)
            story={'encodedH264Sha256':D.file_sha256(movie),
                   'sourceWavSha256':mock_wav_sha,
                   'nineShotsMapped':9,'mayPublish':False,
                   'shots':[{'shot':f's{i}','startSec':i*3.44,
                             'endSec':(i+1)*3.44} for i in range(8)]+[
                             {'shot':'source_hold','startSec':27.35,
                              'endSec':31.25}]}
            path=root/'story.json';path.write_text(json.dumps(story))
            fingerprints=(bytes([20])*7000,set())
            mock_review={'sourceHoldShotId':'source_hold','mayPublish':False}
            mock_motion={'silentFramesCompared':104,'mayPublish':False}
            with (patch.object(D,'read_metadata',return_value=1031),
                  patch.object(D,'validate_story',return_value=story['shots']),
                  patch.object(D,'decode_samples',return_value={n:fingerprints for n in range(1031)}),
                  patch.object(D,'audit_source_hold_silence',return_value=mock_review) as audit_pause,
                  patch.object(D,'measure_source_hold_motion',return_value=mock_motion) as allframes,
                  patch.object(D,'ORIGINAL_WAV_SHA256',mock_wav_sha)):
                without=D.audit(movie,path)
                self.assertNotIn('originalVoiceSourceHoldPacing',without)
                audit_pause.assert_not_called()
                with_audio=D.audit(movie,path,original_wav=wav)
                self.assertEqual(with_audio['originalVoiceSourceHoldPacing']['everySilentFrameMotionReview'],
                                 mock_motion)
                audit_pause.assert_called_once()
                self.assertEqual(allframes.call_args.args[1],1031)
                self.assertEqual(len(allframes.call_args.args[2]),104)
                self.assertFalse(with_audio['mayPublish'])



    def test_hash_pinned_craft_report_refuses_mid_audit_source_changes(self):
        """Adversarial file mutation after the initial SHA: never mislabel output.

        These are synthetic path-identity fixtures; exact native film review
        and actual source-WAV audition remain separate owner-media holds.
        """
        with tempfile.TemporaryDirectory() as td:
            root=Path(td)
            movie=root/'original.mp4'
            story_file=root/'story.json'
            wav=root/'original.wav'
            shots=[{'shot':f'unit{i}','startSec':i*3.5,
                    'endSec':(i+1)*3.5} for i in range(9)]
            story={'encodedH264Sha256':'placeholder','shots':shots,
                   'mayPublish':False}
            identical=(bytes([20])*7000,set())

            for target,reason in (
                ('film','FILM_BYTES_CHANGED_DURING_CRAFT_AUDIT'),
                ('story','STORY_BYTES_CHANGED_DURING_CRAFT_AUDIT'),
                ('wav','ORIGINAL_WAV_BYTES_CHANGED_DURING_CRAFT_AUDIT'),
            ):
                with self.subTest(target=target):
                    movie.write_bytes(b'pinned film bytes')
                    story_file.write_text(json.dumps(story))
                    wav.write_bytes(b'pinned WAV bytes')
                    expected_wav_sha=D.file_sha256(wav)

                    def decode_and_maybe_mutate(_film,indices,_count):
                        if target=='film':
                            movie.write_bytes(b'changed movie AFTER initial hash')
                        elif target=='story':
                            story_file.write_bytes(b'changed story AFTER initial hash')
                        return {n:identical for n in indices}

                    def read_silence_motion(*_args):
                        if target=='wav':
                            wav.write_bytes(b'changed PCM AFTER initial hash')
                        return {'mayPublish':False,'excellentCertified':False}

                    with (patch.object(D,'read_metadata',return_value=1031),
                          patch.object(D,'validate_story',return_value=shots),
                          patch.object(D,'decode_samples',side_effect=decode_and_maybe_mutate),
                          patch.object(D,'audit_source_hold_silence',
                                       return_value={'mayPublish':False}),
                          patch.object(D,'measure_source_hold_motion',
                                       side_effect=read_silence_motion),
                          patch.object(D,'ORIGINAL_WAV_SHA256',expected_wav_sha)):
                        with self.assertRaisesRegex(D.CraftHold,reason):
                            D.audit(movie,story_file,
                                    original_wav=wav if target=='wav' else None)

            # Unmodified inputs still yield a non-publishing research review.
            movie.write_bytes(b'pinned film bytes')
            story_file.write_text(json.dumps(story))
            with (patch.object(D,'read_metadata',return_value=1031),
                  patch.object(D,'validate_story',return_value=shots),
                  patch.object(D,'decode_samples',
                      side_effect=lambda _film,indices,_count:
                          {n:identical for n in indices})):
                audit=D.audit(movie,story_file)
            self.assertEqual(audit['filmSha256'],D.file_sha256(movie))
            self.assertEqual(audit['storySha256'],D.file_sha256(story_file))
            self.assertFalse(audit['mayPublish'])



class ArchivedFilmOptIn(unittest.TestCase):
    def test_full_archived_timed_movie_when_supplied(self):
        film=os.getenv('LANE3_ACTUAL_FILM')
        story=os.getenv('LANE3_ACTUAL_STORY')
        if not film or not story:
            self.skipTest('Exact archived film+story not bundled in GitHub CI')
        data=audit(film,story)
        self.assertEqual(data['fullDecodedFrames'],1031)
        self.assertEqual(len(data['comparisons']),8)
        self.assertEqual(data['nearDuplicateReviewCount'],2)
        self.assertEqual(data['uniqueDecodedFramesSampled'],43)
        self.assertEqual(data['nearStaticShotCount'],6)
        self.assertEqual(data['nearDuplicateBoundaryCount'],1)
        self.assertEqual([(c['from'],c['to']) for c in data['comparisons'] if c['nearDuplicateReviewCandidate']],
                         [('sentence_1_part0','sentence_1_part1'),('sentence_5_part0','sentence_5_part1')])
        self.assertFalse(data['mayPublish'])



class ReportOutputSafetyTests(unittest.TestCase):
    def test_original_media_and_story_cannot_be_overwritten(self):
        with tempfile.TemporaryDirectory() as temp:
            folder = Path(temp)
            film = folder / 'film.mp4'
            story = folder / 'story.json'
            wav = folder / 'original.wav'
            for source in (film, story, wav):
                source.write_bytes(b'original-pinned-evidence-' + source.name.encode())
            before = {p: p.read_bytes() for p in (film, story, wav)}
            for source in before:
                with self.subTest(path=source):
                    with self.assertRaisesRegex(CraftHold, 'REPORT_OUTPUT_ALIASES_AUDITED_INPUT'):
                        D.write_new_report_safely(source, '{}', before)
                symlink = folder / ('symbolic-' + source.name)
                symlink.symlink_to(source)
                with self.assertRaisesRegex(CraftHold, 'REPORT_OUTPUT_ALIASES_AUDITED_INPUT'):
                    D.write_new_report_safely(symlink, '{}', before)
                symlink.unlink()
                hardlink = folder / ('hard-' + source.name)
                hardlink.hardlink_to(source)
                with self.assertRaisesRegex(CraftHold, 'REPORT_OUTPUT_ALIASES_AUDITED_INPUT'):
                    D.write_new_report_safely(hardlink, '{}', before)
                hardlink.unlink()
            self.assertEqual({p: p.read_bytes() for p in before}, before)

    def test_concurrent_existing_report_is_never_overwritten(self):
        with tempfile.TemporaryDirectory() as temp:
            folder=Path(temp)
            source=folder/'film.mp4'; source.write_bytes(b'immutable-source')
            output=folder/'result.json'
            output.write_text('written-by-another-process')
            with self.assertRaisesRegex(CraftHold, 'REPORT_OUTPUT_NOT_FRESH'):
                D.write_new_report_safely(output, 'forged overwrite', [source])
            self.assertEqual(output.read_text(), 'written-by-another-process')
            fresh=folder/'new-result.json'
            D.write_new_report_safely(fresh, '{"mayPublish": false}', [source])
            self.assertEqual(fresh.read_text(), '{"mayPublish": false}')
            self.assertEqual(source.read_bytes(), b'immutable-source')


if __name__=='__main__':
    unittest.main()
