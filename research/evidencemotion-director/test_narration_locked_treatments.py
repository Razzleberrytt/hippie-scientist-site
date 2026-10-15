import unittest
from narration_locked_treatments import LINES, tokens, timeline, wrapped, chemistry_assets


class NarrationTreatments(unittest.TestCase):
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
        assets=chemistry_assets()
        self.assertEqual(assets['mitragynine']['oh'],[])
        self.assertEqual(len(assets['7_hydroxymitragynine']['oh']),1)
        self.assertNotEqual(assets['mitragynine']['source'].inchi_key,
                            assets['7_hydroxymitragynine']['source'].inchi_key)
        self.assertEqual(assets['7_hydroxymitragynine']['xyz'].shape,(30,3))

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

    def test_native_emitted_text_fits_existing_phone_ui_rules(self):
        import os
        from pathlib import Path
        from narration_locked_treatments import fonts,render_frame
        from phone_ui_audit import validate_manifest
        path=Path(os.environ.get('THS_TEST_FONT_DIR','/usr/share/fonts/truetype/dejavu'))
        if not path.is_dir():
            self.skipTest('Set THS_TEST_FONT_DIR to the actual DejaVu directory')
        font,_=fonts(path)
        assets=chemistry_assets();assets['dark_diagram']=assets['7_hydroxymitragynine']['diagram']
        scenes=timeline(self.alignment())
        shots=[]
        for scene in scenes:
            annotations=[]
            t=(scene['startSec']+scene['endSec'])/2
            render_frame(t,scenes,assets,'specimen',(1080,1920),font,annotations=annotations)
            self.assertTrue(annotations)
            shots.append({'id':scene['id'],'startSec':scene['startSec'],'endSec':scene['endSec'],
                          'assetKind':'deterministic_science','annotations':annotations})
        m={'status':'RESEARCH_ONLY','releaseApproved':False,'expectedVideoSha256':'a'*64,
           'platforms':['tiktok','shorts'],'hook':{'textVisibleAtSec':0,'spokenOpeningAtSec':.1,'heroVisualStartsAtSec':0},'shots':shots}
        result=validate_manifest(m,width=1080,height=1920,duration=824336/24000,actual_sha='a'*64)
        self.assertFalse(result['realHandsetPlaybackVerified'])


if __name__=='__main__': unittest.main()
