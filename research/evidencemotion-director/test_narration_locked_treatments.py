import unittest
from narration_locked_treatments import LINES, tokens, timeline, wrapped, chemistry_assets


class NarrationTreatments(unittest.TestCase):
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
        bounds=[0,3.47,10.85,16.58,23.38,27.35,31.25,824336/24000]
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
        self.assertEqual(scenes[-1]['endSec'],824336/24000)
        self.assertEqual(scenes[5]['startSec'],scenes[4]['speechEndSec'])
        self.assertEqual(scenes[5]['endSec'],scenes[6]['startSec'])
        self.assertTrue(all(scenes[i]['endSec']==scenes[i+1]['startSec'] for i in range(6)))
        self.assertEqual(scenes[-1]['captionWords'][0]['text'], "That's")
        self.assertAlmostEqual(scenes[-1]['captionWords'][0]['endSec']-scenes[-1]['captionWords'][0]['startSec'],.45)
        compound=next(w for w in scenes[1]['captionWords'] if w['text']=='seven-hydroxymitragynine')
        self.assertGreater(compound['endSec']-compound['startSec'],.4)

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
        result=validate_manifest(m,width=1080,height=1920,duration=824336/24000,actual_sha='a'*64)
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
