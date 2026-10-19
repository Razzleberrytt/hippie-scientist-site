"""Physical FFmpeg/H.264 and Tesseract per-frame negative regressions (research)."""
import json
import os
import subprocess
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path
from fullframe_text_negative_probe import SCHEMA, MAX_MANIFEST_BYTES, sha, check

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'


class TransientEncodedTextTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.root = Path(cls.tmp.name)
        cls.clean = cls.encode('clean', None)
        # Real 1080x1920 H.264 bytes with a nontrivial MP4 display matrix:
        # normal players rotate to 1920x1080, unlike native -noautorotate OCR.
        cls.rotated = cls.root / 'display-rotated-h264.mp4'
        subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-loglevel', 'error',
            '-display_rotation', '90', '-i', str(cls.clean), '-map', '0:v:0',
            '-c:v', 'copy', '-y', str(cls.rotated)], check=True, timeout=45)
        cls.flash = cls.encode('single-frame-flash', 'flash')
        cls.repeated = cls.encode('single-frame-duplicated-negation', 'repeat')
        cls.unplanned_negation = cls.encode('single-frame-unplanned-negation', 'unplanned_negation')
        cls.omission = cls.encode('single-frame-omission', 'omission')
        cls.inversion = cls.encode('single-frame-word-inversion', 'inversion')
        cls.nonsquare = cls.encode('non-square-sample-pixels', 'non_square')
        cls.h264_444 = cls.encode('non-mobile-yuv444-h264', 'yuv444')
        cls.multi_video = cls.root / 'ambiguous-two-video-streams.mp4'
        subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-loglevel', 'error',
            '-i', str(cls.clean), '-i', str(cls.flash), '-map', '0:v:0',
            '-map', '1:v:0', '-c:v', 'copy', '-y', str(cls.multi_video)],
            check=True, timeout=45)

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
        if mutation == 'repeat':
            vf += f',drawtext=fontfile={FONT}:text=NOT:fontcolor=white:fontsize=60:x=500:y=860:enable=eq(n,9)'
        if mutation == 'unplanned_negation':
            vf += f',drawtext=fontfile={FONT}:text=NO:fontcolor=white:fontsize=60:x=500:y=860:enable=eq(n,9)'
        if mutation == 'inversion':
            # All words remain present, but their on-screen semantic order flips for one frame.
            vf = ','.join([
                f'drawtext=fontfile={FONT}:text=STRUCTURE:fontcolor=white:fontsize=60:x=100:y=780:enable=not(eq(n,9))',
                f'drawtext=fontfile={FONT}:text=EFFECTS:fontcolor=white:fontsize=60:x=700:y=780:enable=not(eq(n,9))',
                f'drawtext=fontfile={FONT}:text=NOT:fontcolor=white:fontsize=60:x=500:y=780',
                f'drawtext=fontfile={FONT}:text=EFFECTS:fontcolor=white:fontsize=60:x=100:y=780:enable=eq(n,9)',
                f'drawtext=fontfile={FONT}:text=STRUCTURE:fontcolor=white:fontsize=60:x=650:y=780:enable=eq(n,9)',
            ])
        if mutation == 'non_square':
            vf += ',setsar=4/3'
        vf = vf.replace('eq(n,9)', 'eq(n\,9)')
        subprocess.run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-f','lavfi',
            '-i','color=c=black:s=1080x1920:r=30:d=1', '-vf', vf, '-c:v','libx264',
            '-preset','ultrafast','-crf','19','-pix_fmt',
            'yuv444p' if mutation == 'yuv444' else 'yuv420p', '-y',str(dest)],
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

    def test_actual_h264_display_rotation_holds_before_ocr(self):
        from fullframe_text_negative_probe import command as native_command
        decoded = []

        def reject_other_decoders(argv):
            if argv[0] in ('ffmpeg', 'tesseract'):
                decoded.append(argv[0])
                raise AssertionError('rotated playback must not reach OCR')
            return native_command(argv)

        with patch('fullframe_text_negative_probe.command', side_effect=reject_other_decoders):
            with self.assertRaisesRegex(ValueError, 'DISPLAY_TRANSFORM_METADATA_PRESENT'):
                check(self.rotated, self.manifest(self.rotated))
        self.assertEqual(decoded, [])

    def test_legacy_rotate_tag_without_display_matrix_holds(self):
        from fullframe_text_negative_probe import command as native_command
        def inject_legacy_rotate_tag(argv):
            data = native_command(argv)
            if argv[0] == 'ffprobe' and '-show_frames' in argv:
                report = json.loads(data)
                report['streams'][0]['tags'] = {'rotate': '90'}
                return json.dumps(report).encode('utf-8')
            if argv[0] in ('ffmpeg', 'tesseract'):
                raise AssertionError('rotated playback must not reach OCR')
            return data

        with patch('fullframe_text_negative_probe.command', side_effect=inject_legacy_rotate_tag):
            with self.assertRaisesRegex(ValueError, 'DISPLAY_TRANSFORM_METADATA_PRESENT'):
                check(self.clean, self.manifest(self.clean))

    def test_frame_only_identity_matrix_holds_without_ocr(self):
        from fullframe_text_negative_probe import command as native_command
        def inject_frame_matrix(argv):
            data = native_command(argv)
            if argv[0] == 'ffprobe' and '-show_frames' in argv:
                report = json.loads(data)
                report['frames'][0]['side_data_list'] = [
                    {'side_data_type': '3x3 displaymatrix', 'rotation': 0,
                     'displaymatrix': 'native coordinates untrusted'}]
                return json.dumps(report).encode('utf-8')
            if argv[0] in ('ffmpeg', 'tesseract'):
                raise AssertionError('matrix-bearing frames must not reach OCR')
            return data

        with patch('fullframe_text_negative_probe.command', side_effect=inject_frame_matrix):
            with self.assertRaisesRegex(ValueError, 'DISPLAY_TRANSFORM_METADATA_PRESENT'):
                check(self.clean, self.manifest(self.clean))

    def test_one_frame_false_science_word_observed_outside_three_sample_indices(self):
        r=check(self.flash,self.manifest(self.flash))
        self.assertEqual(r['status'],'HOLD')
        self.assertEqual([x['frameIndex'] for x in r['defects']],[9])
        self.assertIn('wrong',r['defects'][0]['unexpectedWords'])
        self.assertNotIn(9,[7,15,22])

    def test_one_frame_duplicated_negation_is_hold_even_with_valid_subsequence(self):
        r = check(self.repeated, self.manifest(self.repeated))
        self.assertEqual(r['status'], 'HOLD')
        self.assertEqual([d['frameIndex'] for d in r['defects']], [9])
        self.assertEqual(r['defects'][0]['missingRequiredWords'], [])
        self.assertEqual(r['defects'][0]['unexpectedWords'], [])
        self.assertEqual(r['defects'][0]['repeatedRequiredWords'], ['not'])
        self.assertFalse(r['defects'][0]['requiredWordsOutOfOrder'])

    def test_one_frame_allowlisted_but_unplanned_negation_is_hold(self):
        def allow_no(data):
            data['windows'][0]['allowedWords'].append('NO')
        film = self.unplanned_negation
        r = check(film, self.manifest(film, allow_no))
        self.assertEqual(r['status'], 'HOLD')
        self.assertEqual([d['frameIndex'] for d in r['defects']], [9])
        self.assertEqual(r['defects'][0]['missingRequiredWords'], [])
        self.assertEqual(r['defects'][0]['unexpectedWords'], [])
        self.assertEqual(r['defects'][0]['repeatedRequiredWords'], [])
        self.assertEqual(r['defects'][0]['unplannedNegations'], ['no'])

    def test_one_frame_missing_required_word_is_hold(self):
        r=check(self.omission,self.manifest(self.omission))
        self.assertEqual(r['status'],'HOLD')
        self.assertEqual([x['frameIndex'] for x in r['defects']],[9])
        self.assertIn('not',r['defects'][0]['missingRequiredWords'])

    def test_one_frame_reversed_scientific_word_order_is_hold_even_with_all_words(self):
        r = check(self.inversion, self.manifest(self.inversion))
        self.assertEqual(r['status'], 'HOLD')
        self.assertEqual([d['frameIndex'] for d in r['defects']], [9])
        self.assertEqual(r['defects'][0]['missingRequiredWords'], [])
        self.assertEqual(r['defects'][0]['unexpectedWords'], [])
        self.assertTrue(r['defects'][0]['requiredWordsOutOfOrder'])

    def test_symlinked_video_is_rejected_before_audit(self):
        link = self.root / 'linked-film.mp4'
        link.symlink_to(self.clean)
        with self.assertRaisesRegex(ValueError, 'BOUNDED_REGULAR_ENCODED_MOVIE_REQUIRED'):
            check(link, self.manifest(self.clean))

    def test_oversized_manifest_holds_before_ffmpeg_and_ocr(self):
        manifest = self.root / 'oversized-manifest.json'
        manifest.write_bytes(b'{' + b' ' * MAX_MANIFEST_BYTES + b'}')
        with patch('fullframe_text_negative_probe.command',
                   side_effect=AssertionError('decoder must not run')):
            with self.assertRaisesRegex(ValueError, 'MANIFEST_EXCEEDS_LIMIT'):
                check(self.clean, manifest)

    def test_symlinked_manifest_holds_before_decoding(self):
        original = self.manifest(self.clean)
        link = self.root / 'linked-manifest.json'
        link.symlink_to(original)
        with patch('fullframe_text_negative_probe.command',
                   side_effect=AssertionError('decoder must not run')):
            with self.assertRaisesRegex(ValueError, 'REGULAR_MANIFEST_REQUIRED'):
                check(self.clean, link)

    def test_manifest_symlink_swap_between_check_and_open_fails_closed(self):
        manifest = self.manifest(self.clean)
        backup = self.root / 'manifest-before-symlink-swap.json'
        real_open = os.open
        swapped = []

        def swap_before_fd_open(path, flags, *args, **kwargs):
            if Path(path) == manifest and not swapped:
                swapped.append(True)
                manifest.rename(backup)
                manifest.symlink_to(backup)
            return real_open(path, flags, *args, **kwargs)

        try:
            with patch('fullframe_text_negative_probe.os.open', side_effect=swap_before_fd_open), \
                 patch('fullframe_text_negative_probe.command',
                       side_effect=AssertionError('untrusted manifest must not decode')):
                with self.assertRaisesRegex(ValueError, 'REGULAR_MANIFEST_REQUIRED'):
                    check(self.clean, manifest)
            self.assertTrue(swapped)
        finally:
            if manifest.is_symlink():
                manifest.unlink()
            if backup.exists():
                backup.rename(manifest)

    def test_same_content_manifest_inode_replacement_during_decode_holds(self):
        from fullframe_text_negative_probe import command as original_command
        manifest = self.manifest(self.clean)
        copied_bytes = manifest.read_bytes()
        prior_inode = self.root / 'prior-manifest-inode.json'
        replacements = []

        def rewrite_during_probe(argv):
            if argv[0] == 'ffprobe' and not replacements:
                replacements.append(True)
                # Keep the old inode allocated: unlink+rewrite could reuse it,
                # accidentally defeating the identity regression itself.
                manifest.rename(prior_inode)
                manifest.write_bytes(copied_bytes)
            return original_command(argv)

        try:
            with patch('fullframe_text_negative_probe.command', side_effect=rewrite_during_probe):
                with self.assertRaisesRegex(ValueError, 'SOURCE_CHANGED_DURING_AUDIT'):
                    check(self.clean, manifest)
            self.assertTrue(replacements)
            self.assertEqual(manifest.read_bytes(), copied_bytes)
        finally:
            prior_inode.unlink(missing_ok=True)

    def test_crop_disables_rotation_metadata_before_encoded_frame_decode(self):
        from fullframe_text_negative_probe import command as original_command
        checked = []

        def verify_crop_source(argv):
            if argv[0] == 'ffmpeg':
                self.assertIn('-noautorotate', argv)
                self.assertLess(argv.index('-noautorotate'), argv.index('-i'))
                checked.append(True)
            return original_command(argv)

        with patch('fullframe_text_negative_probe.command', side_effect=verify_crop_source):
            result = check(self.clean, self.manifest(self.clean))
        self.assertTrue(checked)
        self.assertEqual((result['framesOCRChecked'], result['defectFrames']), (30, 0))
        self.assertFalse(result['handsetReadabilityApproved'])

    def test_snapshot_rejects_source_replaced_between_pin_and_copy(self):
        from fullframe_text_negative_probe import _frozen_source as real_snapshot
        movie = self.root / 'swap-before-snapshot.mp4'
        original = self.clean.read_bytes()
        movie.write_bytes(original)
        manifest = self.manifest(movie)

        def swap_before_copy(source, snapshot, expected):
            source.write_bytes(self.flash.read_bytes())
            try:
                return real_snapshot(source, snapshot, expected)
            finally:
                source.write_bytes(original)

        with patch('fullframe_text_negative_probe._frozen_source', side_effect=swap_before_copy):
            with self.assertRaisesRegex(ValueError, 'ENCODED_SOURCE_SNAPSHOT_HOLD'):
                check(movie, manifest)
        self.assertEqual(movie.read_bytes(), original)

    def test_transient_source_swap_during_probe_cannot_change_decoded_frames(self):
        from fullframe_text_negative_probe import command as real_command
        movie = self.root / 'swap-during-probe.mp4'
        original = self.clean.read_bytes()
        altered = self.flash.read_bytes()
        movie.write_bytes(original)
        manifest = self.manifest(movie)
        swapped = []

        def mutate_during_probe(argv):
            if argv[0] == 'ffprobe':
                self.assertNotEqual(Path(argv[-1]), movie)
            if argv[0] == 'ffmpeg':
                self.assertNotEqual(Path(argv[argv.index('-i') + 1]), movie)
            if argv[0] == 'ffprobe' and not swapped:
                swapped.append(True)
                movie.write_bytes(altered)
                try:
                    return real_command(argv)
                finally:
                    movie.write_bytes(original)
            return real_command(argv)

        with patch('fullframe_text_negative_probe.command', side_effect=mutate_during_probe):
            result = check(movie, manifest)
        self.assertTrue(swapped)
        self.assertEqual((result['framesOCRChecked'], result['defectFrames']), (30, 0))
        self.assertFalse(result['mayPublish'])

    def test_nonsquare_h264_is_rejected_before_ocr_even_at_native_pixel_dimensions(self):
        with self.assertRaisesRegex(ValueError, 'NATIVE_H264_1080X1920_30FPS_SQUARE_PIXEL_REQUIRED'):
            check(self.nonsquare, self.manifest(self.nonsquare))

    def test_real_h264_444_is_held_before_crop_decode_or_ocr(self):
        # A valid 1080x1920/30fps square-pixel H.264 can still be High 4:4:4,
        # which cannot inherit the expected native mobile delivery receipt.
        from fullframe_text_negative_probe import command as native_command
        def reject_further_decode(argv):
            if argv[0] in ('ffmpeg', 'tesseract'):
                raise AssertionError('unsupported pixel format reached OCR')
            return native_command(argv)
        with patch('fullframe_text_negative_probe.command', side_effect=reject_further_decode):
            with self.assertRaisesRegex(ValueError, 'NATIVE_H264_8BIT_420_PIXEL_FORMAT_REQUIRED'):
                check(self.h264_444, self.manifest(self.h264_444))

    def test_missing_pixel_format_metadata_is_not_assumed_to_be_yuv420p(self):
        from fullframe_text_negative_probe import command as native_command
        def drop_probe_format(argv):
            raw = native_command(argv)
            if argv[0] == 'ffprobe' and '-show_frames' in argv:
                result = json.loads(raw)
                result['streams'][0].pop('pix_fmt', None)
                return json.dumps(result).encode('utf-8')
            if argv[0] in ('ffmpeg', 'tesseract'):
                raise AssertionError('unproven pixel format reached OCR')
            return raw
        with patch('fullframe_text_negative_probe.command', side_effect=drop_probe_format):
            with self.assertRaisesRegex(ValueError, 'NATIVE_H264_8BIT_420_PIXEL_FORMAT_REQUIRED'):
                check(self.clean, self.manifest(self.clean))

    def test_two_physical_video_streams_cannot_let_clean_first_track_hide_bad_second(self):
        # FFmpeg stream-copy keeps both authentic H.264 tracks. The v:0 OCR-only
        # screen formerly passed while ignoring the alternate video track.
        with self.assertRaisesRegex(ValueError, 'AMBIGUOUS_MULTIPLE_OR_MISSING_VIDEO_STREAMS'):
            check(self.multi_video, self.manifest(self.multi_video))

    def test_manifest_read_swap_cannot_hide_one_frame_unplanned_word(self):
        # The previous two-read hash/parse sequence let a temporary forged
        # allowlist hide frame 9's WRONG text, then report the original hash.
        film = self.flash
        manifest = self.manifest(film)
        original_sha = sha(manifest)
        forged = json.loads(manifest.read_text())
        forged['windows'][0]['allowedWords'].append('WRONG')
        original_read = Path.read_text

        def transient_manifest_override(path, *args, **kwargs):
            if path == manifest:
                return json.dumps(forged)
            return original_read(path, *args, **kwargs)

        with patch.object(Path, 'read_text', transient_manifest_override):
            report = check(film, manifest)
        self.assertEqual(sha(manifest), original_sha)
        self.assertEqual(report['manifestSha256'], original_sha)
        self.assertEqual(report['status'], 'HOLD')
        self.assertEqual([item['frameIndex'] for item in report['defects']], [9])
        self.assertIn('wrong', report['defects'][0]['unexpectedWords'])
        self.assertFalse(report['mayPublish'])

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
        # Manifest permits SOURCE but demands its actual presence in the encoded frame.
        def change(x):
            x['windows'][0]['requiredWords'] = ['SOURCE']
            x['windows'][0]['allowedWords'].append('SOURCE')
        result = check(self.clean, self.manifest(self.clean, change))
        self.assertEqual(result['status'], 'HOLD')
        self.assertEqual(result['defectFrames'], 30)
        self.assertIn('source', result['defects'][0]['missingRequiredWords'])


if __name__ == '__main__':
    unittest.main()
