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


if __name__=='__main__': unittest.main()
