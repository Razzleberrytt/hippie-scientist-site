import unittest
from timed_caption_windows import schedule, shown_at


def fixture(words):
    return [dict(text=w,startSec=float(i)/4,endSec=(float(i)+.8)/4)
            for i,w in enumerate(words)]

class CaptionWindowsTests(unittest.TestCase):
    def test_one_original_word_per_cue_survives_some_window(self):
        cues=fixture('So the picture explains its structure not what its effects feel like'.split())
        groups=schedule(cues,max_words=3)
        self.assertEqual([w for g in groups for w in g['words']],[c['text'] for c in cues])
        self.assertLessEqual(max(len(g['words']) for g in groups),3)
        self.assertEqual(next(g['words'][0] for g in groups if 'not' in g['words']),'not')
        self.assertNotIn('not',shown_at(groups,cues[5]['startSec']+.01))
        for cue in cues:
            t=(cue['startSec']+cue['endSec'])/2
            self.assertIn(cue['text'],shown_at(groups,t))
        self.assertEqual(shown_at(groups,-.1),[])
        self.assertEqual(shown_at(groups,cues[-1]['endSec']),[])

    def test_group_does_not_pre_display_future_words_or_qualifiers(self):
        cues=fixture('This source is computed only'.split())
        groups=schedule(cues,max_words=3)
        self.assertEqual(shown_at(groups,.01),['This'])
        self.assertEqual(shown_at(groups,.26),['This','source'])
        self.assertNotIn('computed',shown_at(groups,.51))
        self.assertNotIn('only',shown_at(groups,.76))
        self.assertEqual([w for g in groups for w in g['words']],
                         [c['text'] for c in cues])
        self.assertEqual(len(groups[0]['wordCues']),3)
        self.assertEqual(shown_at(groups,cues[-1]['endSec']),[])

    def test_identical_repeated_words_do_not_appear_as_future_instances(self):
        # "no" is a protected negation and correctly starts its own group;
        # use identical ordinary words to exercise cue-occurrence identity.
        cues=fixture(['look','look','look'])
        groups=schedule(cues,max_words=3)
        self.assertEqual(shown_at(groups,.01),['look'])
        self.assertEqual(shown_at(groups,.26),['look','look'])
        self.assertEqual(shown_at(groups,.51),['look','look','look'])

    def test_malformed_sample_time_fails_closed(self):
        groups=schedule(fixture(['fact']))
        for sample in (None,float('nan'),float('inf'),True,'0'):
            with self.assertRaisesRegex(ValueError,'INVALID_SAMPLE_TIME'):
                shown_at(groups,sample)

    def test_an_early_frame_never_reveals_a_future_negation(self):
        cues=fixture('It is not footage of a real molecule'.split())
        groups=schedule(cues)
        self.assertNotIn('not',shown_at(groups,.26))
        self.assertIn('not',shown_at(groups,cues[2]['startSec']))

    def test_reject_modified_bad_missing_and_overlapping_cues(self):
        for cues,pattern in [
            ([{'text':'word','startSec':1,'endSec':.5}],'INVALID_TIME'),
            ([{'text':'two words','startSec':1,'endSec':2}],'WORD_CUE'),
            ([{'text':'ok','startSec':0,'endSec':1},
              {'text':'bad','startSec':.9,'endSec':2}],'OVERLAPPING'),
            ([{'text':'','startSec':0,'endSec':1}],'MISSING_SPOKEN')]:
            with self.assertRaisesRegex(ValueError,pattern): schedule(cues)
        with self.assertRaisesRegex(ValueError,'INVALID_MAX_WORDS'): schedule(fixture(['yes']),max_words=0)

    def test_silent_source_hold_contains_no_captions(self):
        self.assertEqual(schedule([]),[])
        self.assertEqual(shown_at([],.5),[])

if __name__=='__main__': unittest.main()
