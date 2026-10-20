import math
import unittest
from narration_locked_treatments import LINES, tokens, timeline, wrapped, chemistry_assets


class NarrationTreatments(unittest.TestCase):
    def test_real_raw_rgb_encoder_declares_square_pixels_for_phone_audit(self):
        import json
        import subprocess
        import tempfile
        from pathlib import Path
        from narration_locked_treatments import encoder_command
        from phone_ui_audit import probe_movie
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            wav, movie = root/'synthetic.wav', root/'synthetic.mp4'
            subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i',
                            'sine=frequency=440:sample_rate=24000:duration=1',
                            str(wav)], check=True, capture_output=True)
            subprocess.run(encoder_command((64, 96), wav, 30, movie),
                           input=bytes([40, 80, 120]) * 64 * 96 * 30,
                           check=True, capture_output=True, timeout=30)
            # Use the real producer command, encoded bytes and independent FFprobe.
            # This tiny synthetic fixture grants no original-film approval.
            meta = json.loads(subprocess.check_output([
                'ffprobe', '-v', 'error', '-select_streams', 'v:0',
                '-show_entries', 'stream=sample_aspect_ratio,width,height',
                '-of', 'json', str(movie)]))['streams'][0]
            self.assertEqual(meta.get('sample_aspect_ratio'), '1:1')
            self.assertEqual((meta['width'], meta['height']), (64, 96))
            probe_movie(movie)

    def test_native_caption_plus_overlay_load_fits_observed_sentence_windows(self):
        # Scheduling regression from the observed source sentence windows.
        # This is not a new acoustic-alignment or audience calibration receipt.
        import os
        from pathlib import Path
        from narration_locked_treatments import fonts,native_phone_plan
        from reading_load_audit import assess
        path=Path(os.environ.get('THS_TEST_FONT_DIR','/usr/share/fonts/truetype/dejavu'))
        if not path.is_dir():
            self.skipTest('Pinned DejaVu font unavailable')
        font,_=fonts(path)
        assets=chemistry_assets();assets['dark_diagram']=assets['7_hydroxymitragynine']['diagram']
        scenes=timeline(self.alignment())
        bounds=[0,3.47,10.85,16.58,23.38,27.35,31.25,math.ceil(824336*30/24000)/30]
        for i,s in enumerate(scenes):
            s['startSec'],s['endSec']=bounds[i:i+2]
            cues=s.get('captionWords',[])
            for j,c in enumerate(cues):
                c['startSec']=bounds[i]+(bounds[i+1]-bounds[i])*j/len(cues)
                c['endSec']=bounds[i]+(bounds[i+1]-bounds[i])*(j+1)/len(cues)
        for scene,starts in [(scenes[0],[.16,.33,.56,.95,1.20,1.61,1.92,2.11]),
            (scenes[4],[23.38,23.53,23.62,24.06,24.64,24.77,25.71,25.96,26.12,26.23,26.57,26.99])]:
            for c,start in zip(scene['captionWords'],starts): c['startSec']=start
        plan=native_phone_plan('a'*64,scenes,assets,'specimen',font)
        result=assess(plan)
        failed=[s['scene'] for s in result['allSceneSpans'] if not s['passesCombinedVisibleTextBudget']]
        self.assertEqual(failed,[],'Actual emitted captions must count alongside every overlay')
        self.assertFalse(result['mayPublish'])

    def test_source_verified_side_by_side_is_native_and_safety_locked(self):
        # Source-grounded actual native-frame proof, not encoded OCR or
        # scientific/publication authorization.
        import os
        from pathlib import Path
        from PIL import Image, ImageChops
        from narration_locked_treatments import fonts, render_frame
        directory=Path(os.environ.get('THS_TEST_FONT_DIR',
                                      '/usr/share/fonts/truetype/dejavu'))
        if not directory.is_dir():
            self.skipTest('Pinned native font directory unavailable')
        font,_=fonts(directory)
        scenes=timeline(self.alignment())
        scene=scenes[1]
        assets=chemistry_assets()
        annotations=[]
        frame=render_frame((scene['startSec']+scene['endSec'])/2,
                           scenes,assets,'specimen',(1080,1920),font,
                           annotations=annotations,caption_mode='timed_research')
        self.assertEqual(frame.size,(1080,1920))
        labels={a['text']:a for a in annotations}
        for label in ('MITRAGYNINE','7-OH',
                      'Not a chemical reaction'):
            self.assertIn(label,labels)
            self.assertLessEqual(labels[label]['boxPx'][2],1020)
        self.assertFalse(any(a['role']=='source' for a in annotations),
                         'Full CID references belong on the source card')
        # Two physically distinct RDKit molecule images are visible, not an
        # invented transformation or duplicated hero rendered twice.
        left=frame.convert('RGB').crop((93,736,490,1024))
        right=frame.convert('RGB').crop((579,736,976,1024))
        self.assertIsNotNone(ImageChops.difference(left,right).getbbox())
        # The WHOLE molecule panels, not only text annotations, must avoid
        # the right-side platform controls (x > 0.8 * 1080). Compare against
        # the physical native background in the science-stage panel region.
        from narration_locked_treatments import background
        safe_x=round(1080*.80)
        graphic_region=(safe_x,640,1080,1090)
        self.assertIsNone(ImageChops.difference(
            frame.convert('RGB').crop(graphic_region),
            background((1080,1920)).convert('RGB').crop(graphic_region)
        ).getbbox())
        false_source=dict(assets)
        false_source['mitragynine']=dict(assets['mitragynine'],oh=[3])
        with self.assertRaisesRegex(ValueError,'MOLECULAR_COMPARISON_SOURCE_DRIFT'):
            render_frame((scene['startSec']+scene['endSec'])/2,
                         scenes,false_source,'specimen',(1080,1920),font,
                         caption_mode='timed_research')

    def alignment(self):
        # Scheduling fixture only; this is not acoustic acceptance evidence.
        return {'sampleCount':824336,'wordAlignment':[
            {'word':w,'startMs':i*300+100,'endMs':i*300+250}
            for i,w in enumerate(tokens(' '.join(LINES)))]}

    def test_all_original_words_and_real_pause_survive_sentence_schedule(self):
        a=self.alignment()
        scenes=timeline(a)
        self.assertEqual(len(scenes),7)
        self.assertEqual([s['line'] for s in scenes if s['line']],list(LINES))
        self.assertEqual(scenes[-1]['endSec'],math.ceil(824336*30/24000)/30)
        self.assertGreater(scenes[-1]['endSec'],824336/24000)
        self.assertLess(scenes[-1]['endSec']-824336/24000,1/30)
        self.assertLess(scenes[-1]['speechEndSec'],scenes[-1]['endSec'])
        self.assertEqual(scenes[5]['startSec'],scenes[4]['speechEndSec'])
        self.assertEqual(scenes[5]['endSec'],scenes[6]['startSec'])
        self.assertTrue(all(scenes[i]['endSec']==scenes[i+1]['startSec'] for i in range(6)))
        self.assertEqual(scenes[-1]['captionWords'][0]['text'], "That's")
        self.assertAlmostEqual(scenes[-1]['captionWords'][0]['endSec']-scenes[-1]['captionWords'][0]['startSec'],.45)
        compound=next(w for w in scenes[1]['captionWords'] if w['text']=='seven-hydroxymitragynine')
        self.assertGreater(compound['endSec']-compound['startSec'],.4)

    def test_film_tail_is_frame_locked_without_stretching_original_voice(self):
        for sample_count, expected in ((816000,34.0),(816001,1021/30),
                                       (824336,1031/30)):
            with self.subTest(sample_count=sample_count):
                a=self.alignment()
                a['sampleCount']=sample_count
                scenes=timeline(a)
                self.assertAlmostEqual(scenes[-1]['endSec'],expected)
                self.assertEqual(scenes[-1]['captionWords'][-1]['endSec'],
                                 a['wordAlignment'][-1]['endMs']/1000)
                self.assertTrue(scenes[-1]['startSec'] <=
                                (math.ceil(sample_count*30/24000)-1)/30
                                < scenes[-1]['endSec'])
                self.assertLess(scenes[-1]['endSec']-sample_count/24000,
                                1/30+1e-10)

    def test_misspelled_or_reordered_words_cannot_reuse_captions(self):
        a=self.alignment()
        a['wordAlignment'][7]['word']='mitrogenine'
        with self.assertRaisesRegex(ValueError,'SCRIPT_DRIFT'):
            timeline(a)

    def test_long_chemical_term_is_never_clipped_or_split_silently(self):
        class Font:
            def getlength(self,text): return len(text)*10
        self.assertEqual(wrapped('This hydroxyl group',Font(),130),['This hydroxyl','group'])
        with self.assertRaisesRegex(ValueError,'CAPTION_WORD_TOO_WIDE'):
            wrapped('hydroxymitragynine',Font(),100)

    def test_real_graphs_have_distinct_identities_and_one_verified_free_hydroxyl(self):
        import numpy as np
        assets=chemistry_assets()
        self.assertEqual(assets['mitragynine']['oh'],[])
        self.assertEqual(len(assets['7_hydroxymitragynine']['oh']),1)
        self.assertNotEqual(assets['mitragynine']['source'].inchi_key,
                            assets['7_hydroxymitragynine']['source'].inchi_key)
        self.assertEqual(assets['7_hydroxymitragynine']['xyz'].shape,(30,3))
        diagram=np.array(assets['7_hydroxymitragynine']['diagram'])
        # Catch the actual invisible black H glyph added during RDKit drawing.
        self.assertEqual(int(((diagram[:,:,3]>200)&(diagram[:,:,:3].max(axis=2)<60)).sum()),0)

    def test_teaching_view_is_rigid_right_handed_and_avoids_edge_on_plane(self):
        import numpy as np
        from rdkit import Chem
        assets=chemistry_assets()
        for name,asset in assets.items():
            with self.subTest(compound=name):
                original=np.array(Chem.MolFromMolBlock(asset['conformerMolBlock'],removeHs=False).GetConformer().GetPositions())[:len(asset['xyz'])]
                a=np.linalg.norm(original[:,None]-original[None,:],axis=2)
                b=np.linalg.norm(asset['xyz'][:,None]-asset['xyz'][None,:],axis=2)
                np.testing.assert_allclose(a,b,atol=.0002)
                self.assertAlmostEqual(np.linalg.det(asset['viewBasis']),1.0)
                variances=np.var(asset['xyz'],axis=0)
                self.assertLessEqual(variances[2],min(variances[:2]))
                if asset['oh']:
                    oh=asset['oh'][0]
                    parent=asset['mol'].GetAtomWithIdx(oh).GetNeighbors()[0].GetIdx()
                    self.assertGreater(asset['xyz'][oh,2],asset['xyz'][parent,2])

    def test_silent_source_pause_has_no_caption_cues(self):
        # The exact original source-reading hold is intentionally silent;
        # it must have a real scene/graphic but no manufactured words.
        import os
        from pathlib import Path
        from narration_locked_treatments import fonts, render_frame
        font_path=Path(os.environ.get('THS_TEST_FONT_DIR','/usr/share/fonts/truetype/dejavu'))
        if not font_path.is_dir():
            self.skipTest('Pinned DejaVu font unavailable on this runner')
        font,_=fonts(font_path)
        scenes=timeline(self.alignment())
        assets=chemistry_assets()
        ads=[]
        card=next(s for s in scenes if s['id']=='source_hold')
        frame=render_frame((card['startSec']+card['endSec'])/2,
                           scenes,assets,'specimen',(1080,1920),font,annotations=ads)
        self.assertEqual(frame.size,(1080,1920))
        self.assertEqual([a for a in ads if a['role']=='caption'],[])
        self.assertIn('7-OH • CID 44301524',[a['text'] for a in ads])

    def test_spoken_scene_missing_word_cues_holds(self):
        import os
        from pathlib import Path
        from narration_locked_treatments import fonts, render_frame
        font_path=Path(os.environ.get('THS_TEST_FONT_DIR','/usr/share/fonts/truetype/dejavu'))
        if not font_path.is_dir():
            self.skipTest('Pinned DejaVu font unavailable on this runner')
        font,_=fonts(font_path)
        scenes=timeline(self.alignment())
        assets=chemistry_assets()
        scenes[0].pop('captionWords')
        with self.assertRaisesRegex(ValueError,'MISSING_SPOKEN_WORD_CUES'):
            render_frame(.5,scenes,assets,'specimen',(1080,1920),font)

    def test_encoded_hydroxyl_ocr_repair_has_actual_source_locked_native_pixels(self):
        # A new decoded H264 + independent OCR pass remains mandatory. This
        # isolates the actual renderer pixel/font/cue design, not OCR success.
        import os
        from pathlib import Path
        from PIL import Image
        from narration_locked_treatments import fonts,render_frame
        folder=Path(os.environ.get('THS_TEST_FONT_DIR',
                                    '/usr/share/fonts/truetype/dejavu'))
        if not folder.is_dir():
            self.skipTest('Pinned font directory unavailable')
        font,_=fonts(folder)
        scenes=timeline(self.alignment())
        assets=chemistry_assets()
        assets['dark_diagram']=assets['7_hydroxymitragynine']['diagram']
        cue=next(c for c in scenes[1]['captionWords'] if c['text']=='hydroxyl')
        when=(cue['startSec']+cue['endSec'])/2
        rendered=[]
        frame=render_frame(when,scenes,assets,'specimen',(1080,1920),
                           font,annotations=rendered,caption_mode='timed_research')
        caption=[a for a in rendered if a['role']=='caption']
        words=[a['text'] for a in caption]
        self.assertIn('hydroxyl',words)
        self.assertEqual([c['text'] for c in scenes[1]['captionWords']],
                         scenes[1]['line'].split())
        self.assertTrue(all(a['fontPx']==48 for a in caption))
        self.assertTrue(all(0<=a['boxPx'][0]<a['boxPx'][2]<=864 and
                            1290<=a['boxPx'][1]<a['boxPx'][3]<=1574
                            for a in caption))
        self.assertEqual(frame.getpixel((64,1305)),(13,35,44))
        self.assertTrue(all(x['text']!='hydroxyl' or
                            x['role']=='caption' for x in caption))
        # The narration and the source science cue are not rewritten.
        self.assertEqual(cue['text'],'hydroxyl')
        self.assertEqual(cue['startSec'],next(c['startSec']
            for c in scenes[1]['captionWords'] if c['text']=='hydroxyl'))

    def test_computed_dual_view_is_real_source_and_camera_motion(self):
        # Craft research on actual rendered RGB, not a synthetic scene name:
        # verified 2D RDKit connectivity remains fixed while the calculated
        # 3D stage changes smoothly with original narration-driven time.
        import os
        import numpy as np
        from pathlib import Path
        from PIL import Image,ImageChops
        from narration_locked_treatments import fonts,render_frame
        base=Path(os.environ.get('THS_TEST_FONT_DIR',
                  '/usr/share/fonts/truetype/dejavu'))
        if not base.is_dir():
            self.skipTest('Pinned native font directory unavailable')
        font,_=fonts(base)
        scenes=timeline(self.alignment())
        assets=chemistry_assets()
        assets['dark_diagram']=assets['7_hydroxymitragynine']['diagram']
        target=scenes[3]
        t0=target['startSec']+.4
        t1=target['endSec']-.4
        self.assertGreater(t1,t0)
        before_ann=[]
        before=render_frame(t0,scenes,assets,'specimen',(1080,1920),font,
                            annotations=before_ann,caption_mode='timed_research')
        after=render_frame(t1,scenes,assets,'specimen',(1080,1920),font,
                           caption_mode='timed_research')
        # This left inset ends before the model stage begins, so its pixels
        # must stay still and trace back to the actual approved RDKit drawing.
        left=(88,480,415,640)
        self.assertIsNone(ImageChops.difference(before.crop(left),
                                                after.crop(left)).getbbox())
        no_source=dict(assets)
        erased=dict(assets['7_hydroxymitragynine'])
        erased['diagram']=Image.new('RGBA',(1200,900),(0,0,0,0))
        no_source['7_hydroxymitragynine']=erased
        absent=render_frame(t0,scenes,no_source,'specimen',(1080,1920),
                            font,caption_mode='timed_research')
        diff=np.abs(np.asarray(before.crop(left),dtype=np.int16)-
                    np.asarray(absent.crop(left),dtype=np.int16))
        self.assertGreater(float(diff.mean()),1.0,
                           'source thumbnail must be physically rendered')
        # Separately the computed 3D molecular stage should progress; the
        # frozen source thumbnail must never be mistaken for a reaction.
        model=(430,690,990,1055)
        change=np.abs(np.asarray(before.crop(model),dtype=np.int16)-
                      np.asarray(after.crop(model),dtype=np.int16))
        self.assertGreater(float(change.mean()),.20)
        words=[a['text'] for a in before_ann if a['role']!='caption']
        title=next(a for a in before_ann if a['text']=='A possible\n3D shape.')
        # Actual emitted native glyph bounds must leave visible whitespace
        # above the *physical* source-panel upper edge y=456; tiny 2px
        # collisions would otherwise pass the old semantic copy checks.
        self.assertGreaterEqual(title['boxPx'][1],192)
        self.assertGreaterEqual(456-title['boxPx'][3],30)
        self.assertIn('A possible\n3D shape.',words)
        self.assertIn('Computed 3D illustration • not filmed',words)
        self.assertIn('Hydrogen atoms omitted',words)
        self.assertNotIn('receptor binding proven',words)
        self.assertEqual(len([a for a in before_ann if a['role']=='disclosure']),2)

    def test_exact_visual_reflow_never_changes_source_claim(self):
        from narration_locked_treatments import exact_visual_reflow
        original='Computed 3D illustration • not filmed'
        lines=['Computed 3D illustration','• not filmed']
        self.assertEqual(exact_visual_reflow(original,lines),
                         'Computed 3D illustration\n• not filmed')
        for candidate in (['Computed illustration','• not filmed'],
                          ['• not filmed','Computed 3D illustration'],
                          ['Computed 3D illustration','• filming'],
                          ['Computed 3D illustration','']):
            with self.subTest(lines=candidate):
                with self.assertRaisesRegex(ValueError,'REFLOW'):
                    exact_visual_reflow(original,candidate)
        with self.assertRaisesRegex(ValueError,'INVALID_VISUAL_REFLOW'):
            exact_visual_reflow(original,['one line'])

    def test_specimen_native_labels_meet_phone_type_and_reflow_geometry(self):
        # Checks actual native draw-generated label bounds. They are still
        # authored geometry, NOT film OCR, handset or comprehension acceptance.
        import os
        from pathlib import Path
        from narration_locked_treatments import fonts,native_phone_plan
        from phone_ui_audit import projected_type_review
        directory=Path(os.environ.get('THS_TEST_FONT_DIR',
                          '/usr/share/fonts/truetype/dejavu'))
        if not directory.is_dir():
            self.skipTest('Pinned font directory unavailable')
        font,_=fonts(directory)
        assets=chemistry_assets()
        assets['dark_diagram']=assets['7_hydroxymitragynine']['diagram']
        plan=native_phone_plan('a'*64,timeline(self.alignment()),assets,'specimen',font)
        small=projected_type_review(plan['shots'],1080)
        self.assertEqual(small['smallDeclaredTextCount'],0,small['smallDeclaredText'])
        self.assertFalse(small['realHandsetReadabilityVerified'])
        labels={(shot['id'],a['text']):a for shot in plan['shots']
                for a in shot['annotations'] if a['role']!='caption'}
        checks={'sentence_3':'Dots mark atoms. Lines mark bonds.',
                'sentence_4':'Computed 3D illustration • not filmed'}
        for shot_id,label in checks.items():
            a=labels[shot_id,label]
            self.assertEqual(a['fontPx'],42)
            self.assertEqual(' '.join(a['renderedLineBreaks']),label)
            self.assertLessEqual(a['boxPx'][2],864)
            self.assertLessEqual(a['boxPx'][3],1574)
        disclosure=labels['sentence_4','Computed 3D illustration • not filmed']
        hydrogen=labels['sentence_4','Hydrogen atoms omitted']
        self.assertLess(disclosure['boxPx'][3],hydrogen['boxPx'][1])
        self.assertLess(hydrogen['boxPx'][3],1318)
        # The opening, nine scientific teaching/source shots, and ALL source
        # narration words remain source-locked; no new release permissions.
        self.assertEqual(len(plan['shots']),9)
        self.assertIs(plan['releaseApproved'],False)

    def test_native_emitted_text_fits_existing_phone_ui_rules(self):
        import os
        from pathlib import Path
        from narration_locked_treatments import fonts,native_phone_plan
        from phone_ui_audit import validate_manifest
        path=Path(os.environ.get('THS_TEST_FONT_DIR','/usr/share/fonts/truetype/dejavu'))
        if not path.is_dir():
            self.skipTest('Set THS_TEST_FONT_DIR to the actual DejaVu directory')
        font,_=fonts(path)
        assets=chemistry_assets();assets['dark_diagram']=assets['7_hydroxymitragynine']['diagram']
        scenes=timeline(self.alignment())
        m=native_phone_plan('a'*64,scenes,assets,'specimen',font)
        first=[s for s in m['shots'] if s['id'].startswith('sentence_1_')]
        self.assertEqual([s['id'] for s in first],['sentence_1_part0','sentence_1_part1'])
        pivot=next(w['startSec'] for w in scenes[0]['captionWords'] if w['text']=='different')
        self.assertEqual(first[0]['endSec'],pivot)
        self.assertEqual(first[1]['startSec'],pivot)
        self.assertIn('MITRAGYNINE', [a['text'] for a in first[0]['annotations']])
        self.assertIn('7-OH', [a['text'] for a in first[1]['annotations']])
        for opening in first:
            labels=[a['text'] for a in opening['annotations'] if a['role']!='caption']
            self.assertNotIn('7-OH vs\nmitragynine',labels)
            self.assertIn('No reaction',labels)
            self.assertFalse(any('CID' in label for label in labels))
        source=next(s for s in m['shots'] if s['id']=='source_hold')
        self.assertIn('Mitragynine • CID 3034396',[a['text'] for a in source['annotations']])
        self.assertIn('7-OH • CID 44301524',[a['text'] for a in source['annotations']])
        self.assertIn('CID = compound record number',[a['text'] for a in source['annotations']])

        self.assertEqual(len(m['shots']),9)
        three_d=next(s for s in m['shots'] if s['id']=='sentence_4')
        science=[a['text'] for a in three_d['annotations'] if a['role']=='science']
        self.assertIn('A possible\n3D shape.',science)
        self.assertNotIn('The pose\nis computed.',science)
        self.assertIn('Computed 3D illustration • not filmed',
                      [a['text'] for a in three_d['annotations']])
        self.assertEqual(
            ' '.join(a['text'] for a in three_d['annotations'] if a['role']=='caption'),
            LINES[3])
        payoff=[s for s in m['shots'] if s['id'].startswith('sentence_5_')]
        self.assertEqual(len(payoff),2)
        self.assertFalse(any(a['text']=='≠' for a in payoff[0]['annotations']))
        self.assertTrue(any(a['text']=='≠' for a in payoff[1]['annotations']))
        self.assertIn('STRUCTURE',
                      [a['text'] for a in payoff[0]['annotations']])
        self.assertIn('HUMAN EXPERIENCE',
                      [a['text'] for a in payoff[1]['annotations']])
        self.assertNotIn('not',[a['text'] for a in payoff[0]['annotations']])
        self.assertIn('not',[a['text'] for a in payoff[1]['annotations']])
        full=[w['text'] for w in scenes[4]['captionWords']]
        visible0=[a['text'] for a in payoff[0]['annotations'] if a['role']=='caption']
        visible1=[a['text'] for a in payoff[1]['annotations'] if a['role']=='caption']
        self.assertEqual(visible0+visible1,full)
        result=validate_manifest(m,width=1080,height=1920,duration=math.ceil(824336*30/24000)/30,actual_sha='a'*64)
        self.assertFalse(result['realHandsetPlaybackVerified'])

    def test_real_emitter_contract_covers_all_spoken_words_and_exact_split(self):
        # This independently catches stale renderer/test pairs that both drop
        # the acoustic opening split while unit fixtures continue to pass.
        from pathlib import Path
        import os
        from narration_locked_treatments import fonts,native_phone_plan
        root=Path(os.environ.get('THS_TEST_FONT_DIR','/usr/share/fonts/truetype/dejavu'))
        if not root.is_dir():
            self.skipTest('Pinned font directory unavailable')
        font,_=fonts(root)
        assets=chemistry_assets()
        assets['dark_diagram']=assets['7_hydroxymitragynine']['diagram']
        scenes=timeline(self.alignment())
        plan=native_phone_plan('a'*64,scenes,assets,'specimen',font)
        lookup={shot['id']:shot for shot in plan['shots']}
        self.assertEqual(len(lookup),9)
        self.assertEqual(len(plan['shots']),9)
        for scene in (part for part in scenes if part['id']!='source_hold'):
            name=scene['id']
            cues=[w['text'] for w in scene['captionWords']]
            related=[shot for shot in plan['shots'] if shot['id']==name
                     or shot['id'].startswith(name+'_part')]
            captions=[a['text'] for shot in related for a in shot['annotations']
                      if a.get('role')=='caption']
            self.assertEqual(captions,cues,f'{name} dropped or duplicated frozen narration')
        self.assertFalse(any(a.get('role')=='caption' for a in
                             lookup['source_hold']['annotations']))
        self.assertNotIn('different',[
            a['text'] for a in lookup['sentence_1_part0']['annotations']
            if a.get('role')=='caption'])
        self.assertIn('different',[
            a['text'] for a in lookup['sentence_1_part1']['annotations']
            if a.get('role')=='caption'])
        self.assertNotIn('not',[
            a['text'] for a in lookup['sentence_5_part0']['annotations']
            if a.get('role')=='caption'])
        self.assertIn('not',[
            a['text'] for a in lookup['sentence_5_part1']['annotations']
            if a.get('role')=='caption'])
        self.assertFalse(plan['releaseApproved'])

    def test_actual_source_words_can_be_scheduled_into_negation_safe_windows(self):
        # The proposed windowing method remains research-only until renderer,
        # encoded pixels, source reviewer and mute reviewer accept the same
        # immutable film. Exercise it against the real frozen six-line script.
        from timed_caption_windows import schedule,shown_at
        scenes=timeline(self.alignment())
        for scene in scenes:
            cues=scene.get('captionWords',[])
            groups=schedule(cues,max_words=3)
            self.assertEqual([w for group in groups for w in group['words']],
                             [cue['text'] for cue in cues])
            for cue in cues:
                mid=(cue['startSec']+cue['endSec'])/2
                self.assertIn(cue['text'],shown_at(groups,mid))
            self.assertTrue(all(len(group['words'])<=3 for group in groups))
        limitation=next(s for s in scenes if s['id']=='sentence_5')
        groups=schedule(limitation['captionWords'])
        neg=next(c['startSec'] for c in limitation['captionWords']
                 if c['text'].casefold()=='not')
        self.assertNotIn('not',shown_at(groups,neg-.01))
        self.assertIn('not',shown_at(groups,neg+.01))
        self.assertEqual(schedule(scenes[5].get('captionWords',[])),[])

    def test_opt_in_timed_caption_frame_matches_exact_original_word_cue(self):
        # Preview-level pixel+annotation contract only, never audience review.
        from pathlib import Path
        import os
        from narration_locked_treatments import fonts,render_frame,native_phone_plan
        font_path=Path(os.environ.get('THS_TEST_FONT_DIR','/usr/share/fonts/truetype/dejavu'))
        if not font_path.is_dir():
            self.skipTest('Pinned fonts unavailable')
        font,_=fonts(font_path)
        assets=chemistry_assets()
        assets['dark_diagram']=assets['7_hydroxymitragynine']['diagram']
        scenes=timeline(self.alignment())
        opening=scenes[0]['captionWords']
        cue=opening[3]
        t=(cue['startSec']+cue['endSec'])/2
        annotations=[]
        frame=render_frame(t,scenes,assets,'specimen',(1080,1920),font,
                           annotations=annotations,caption_mode='timed_research')
        rendered_words=[a['text'] for a in annotations if a['role']=='caption']
        self.assertIn(cue['text'],rendered_words)
        self.assertLessEqual(len(rendered_words),3)
        self.assertEqual(frame.size,(1080,1920))
        self.assertIn('MITRAGYNINE',[a['text'] for a in annotations])
        self.assertIn('No reaction',[a['text'] for a in annotations])
        self.assertFalse(any('CID' in a['text'] for a in annotations))
        legacy=native_phone_plan('a'*64,scenes,assets,'specimen',font)
        candidate=native_phone_plan('a'*64,scenes,assets,'specimen',font,
                                    caption_mode='timed_research')
        self.assertEqual(len(candidate['shots']),9)
        self.assertEqual(candidate['status'],'RESEARCH_ONLY')
        self.assertFalse(candidate['releaseApproved'])
        self.assertEqual(candidate['captionMode'],'TIMED_RESEARCH_NOT_FULL_FRAME_VERIFIED')
        # Only the deliberately reviewed source-locked scene-2 comparison
        # may change overlays. All remaining scenes retain exact source text.
        for original,updated in zip(legacy['shots'],candidate['shots']):
            before=[(a['role'],a['text']) for a in original['annotations']
                    if a['role']!='caption']
            after=[(a['role'],a['text']) for a in updated['annotations']
                   if a['role']!='caption']
            if original['id']=='sentence_2':
                self.assertEqual(before[:2],after[:2])
                self.assertEqual(after[2:],[
                    ('science','MITRAGYNINE'),
                    ('science','7-OH'),
                    ('science','7-OH has one free hydroxyl'),
                    ('disclosure','Not a chemical reaction')])
            else:
                self.assertEqual(before,after)
            self.assertLessEqual(len([a for a in updated['annotations']
                                      if a['role']=='caption']),3)
        self.assertFalse(any(a['role']=='caption' for a in
                             next(x for x in candidate['shots'] if
                                  x['id']=='source_hold')['annotations']))
        with self.assertRaisesRegex(ValueError,'UNKNOWN_CAPTION_MODE'):
            render_frame(t,scenes,assets,'specimen',(1080,1920),font,
                         caption_mode='unsupported')

    def test_native_oxygen_spotlight_is_source_locked_and_not_early(self):
        """Actual native pixels must change only after original 'different' cue."""
        from pathlib import Path
        import os
        from PIL import ImageChops
        from narration_locked_treatments import fonts,render_frame
        from source_locked_visual_direction import hydroxyl_ring_location
        path=Path(os.environ.get('THS_TEST_FONT_DIR','/usr/share/fonts/truetype/dejavu'))
        if not path.is_dir():
            self.skipTest('Pinned DejaVu fonts unavailable')
        font,_=fonts(path)
        assets=chemistry_assets()
        assets['dark_diagram']=assets['7_hydroxymitragynine']['diagram']
        scenes=timeline(self.alignment())
        boundary=next(w['startSec'] for w in scenes[0]['captionWords']
                      if w['text'].casefold().strip('?!.,')=='different')
        x,y,r=hydroxyl_ring_location(assets['7_hydroxymitragynine'])
        box=(x-r-22,y-r-22,x+r+22,y+r+22)
        for t,expect_change in ((boundary-.05,False),(boundary+.05,True)):
            with self.subTest(seconds=t):
                original=render_frame(t,scenes,assets,'specimen',(1080,1920),font,
                                      caption_mode='legacy')
                experiment=render_frame(t,scenes,assets,'specimen',(1080,1920),font,
                                        caption_mode='timed_research')
                difference=ImageChops.difference(original.crop(box),experiment.crop(box))
                self.assertEqual(difference.getbbox() is not None,expect_change)
        self.assertEqual(assets['mitragynine']['oh'],[])
        self.assertFalse(any('drug effects' in line for line in LINES))

    def test_actual_payoff_frames_use_sourced_graph_and_spoken_not_visual_reveal(self):
        # Render *real native RGB pixels*, not just synthetic annotation plans.
        import os
        import numpy as np
        from pathlib import Path
        from narration_locked_treatments import fonts, render_frame, native_phone_plan
        font_path=Path(os.environ.get('THS_TEST_FONT_DIR','/usr/share/fonts/truetype/dejavu'))
        if not font_path.is_dir():
            self.skipTest('Pinned DejaVu fonts unavailable on this runner')
        font,_=fonts(font_path)
        scenes=timeline(self.alignment())
        assets=chemistry_assets();assets['dark_diagram']=assets['7_hydroxymitragynine']['diagram']
        negation=next(w['startSec'] for w in scenes[4]['captionWords'] if w['text']=='not')
        before_ann,after_ann=[],[]
        before=render_frame(negation-.05,scenes,assets,'specimen',(1080,1920),font,
                            annotations=before_ann)
        after=render_frame(negation+.05,scenes,assets,'specimen',(1080,1920),font,
                           annotations=after_ann)
        # The explanatory graph is genuinely painted in the central science
        # field; empty dark slides fail regardless of passing text manifests.
        graph=np.asarray(before.crop((115,610,780,1050))).astype(np.float32)
        self.assertGreater(float(graph.std()),12)
        self.assertIn('STRUCTURE',[a['text'] for a in before_ann])
        self.assertIn('STRUCTURE',[a['text'] for a in before_ann])
        self.assertNotIn('not',[a['text'] for a in before_ann if a['role']=='caption'])
        self.assertNotIn('≠',[a['text'] for a in before_ann])
        self.assertIn('≠',[a['text'] for a in after_ann])
        self.assertIn('HUMAN EXPERIENCE',[a['text'] for a in after_ann])
        self.assertIn('HUMAN EXPERIENCE',[a['text'] for a in after_ann])
        self.assertIn('not',[a['text'] for a in after_ann if a['role']=='caption'])
        # On the spoken negation, the actual displayed pixels below the
        # bounded chemistry card must make a substantial, visible change.
        low_a=np.asarray(before.crop((72,1135,838,1250))).astype(np.int16)
        low_b=np.asarray(after.crop((72,1135,838,1250))).astype(np.int16)
        self.assertGreater(float(np.abs(low_a-low_b).mean()),6.0)
        # Native panels still must obey top/right/bottom platform safe zones.
        from phone_ui_audit import validate_manifest
        m=native_phone_plan('a'*64,scenes,assets,'specimen',font)
        result=validate_manifest(m,width=1080,height=1920,
                                 duration=824336/24000,actual_sha='a'*64)
        self.assertFalse(result['mayPublish'])



if __name__=='__main__': unittest.main()
