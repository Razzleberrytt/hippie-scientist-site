"""Hermetic negative controls for source-bound all-frame caption emission.

These synthetic receipts only test the audit contract; they never certify
the real 7-OH film, actual decoded OCR or viewer understanding.
"""
import copy
import unittest
from temporal_caption_audit import audit, SCHEMA, partitioned_caption_groups, displayed_at
from timed_caption_windows import schedule,shown_at


class TemporalEmissionTests(unittest.TestCase):
    def setUp(self):
        names=['sentence_1','sentence_2','sentence_3','sentence_4',
               'sentence_5','source_hold','sentence_6']
        bounds=[0,5,10,15,20,25,30,34.4]
        words=['Compare','oxygen','Atoms','Computed','not',None,'Detail']
        scenes=[]
        for i,(name,word) in enumerate(zip(names,words)):
            cues=[] if word is None else [{'text':word,'startSec':bounds[i]+1,
                                              'endSec':bounds[i]+2}]
            scenes.append({'id':name,'startSec':bounds[i],'endSec':bounds[i+1],
                           'captionWords':cues,'line':word or ''})
        self.receipt={'experimentCaptionMode':'TIMED_RESEARCH',
                      'candidateCaptionWindowsAppliedToFilm':True,
                      'sourceWavSha256':'b'*64,'videoSha256':'a'*64,
                      'mayPublish':False,'frames':1031,'scenes':scenes}
        frames=[]
        for i in range(1031):
            t=i/30
            scene=next(s for s in scenes if s['startSec']<=t<s['endSec'])
            captions=shown_at(schedule(scene['captionWords']),t)
            frames.append({'index':i,'second':round(t,6),
                           'scene':scene['id'],'rgbSha256':'c'*64,
                           'annotations':[['caption',w] for w in captions]})
        self.ledger={'schema':SCHEMA,'videoSha256':'a'*64,
                     'sourceWavSha256':'b'*64,'fps':30,'width':1080,
                     'height':1920,'frames':frames}

    def test_all_frames_and_all_exact_spoken_cues_pass_research_contract(self):
        result=audit(self.ledger,self.receipt)
        self.assertEqual(result['preEncodedRgbFrameShaReceipts'],1031)
        self.assertTrue(result['allOriginalWordCuesVisibleAtLeastOnce'])
        self.assertFalse(result['mayPublish'])
        self.assertTrue(result['notActualEncodedFrameOCR'])

    def test_opening_comparison_restarts_caption_groups_at_spoken_different(self):
        cues=[{'text':w,'startSec':i*.25,'endSec':i*.25+.2}
              for i,w in enumerate('What makes seven different from mitragynine'.split())]
        groups=partitioned_caption_groups({'id':'sentence_1','captionWords':cues})
        self.assertEqual(len(groups),2)
        self.assertNotIn('different',displayed_at(groups,.62))
        self.assertIn('different',displayed_at(groups,.77))
        self.assertNotIn('What',displayed_at(groups,.77))

    def test_spoken_negation_restarts_caption_groups_without_early_not(self):
        cues=[{'text':w,'startSec':i*.25,'endSec':i*.25+.2}
              for i,w in enumerate('It is not proven'.split())]
        parts=partitioned_caption_groups({'id':'sentence_5','captionWords':cues})
        self.assertNotIn('not',displayed_at(parts,.26))
        self.assertIn('not',displayed_at(parts,.51))

    def test_source_locked_comparison_labels_are_exact_and_never_publish(self):
        # A single actual-shaped RGB-frame annotation can use ONLY the
        # first-party verified compound IDs and no inferred medical claims.
        frame=self.ledger['frames'][7*30+1]  # scene two, outside spoken cue
        intended=[
            ['science','MITRAGYNINE'],['source','CID 3034396'],
            ['science','7-OH'],['source','CID 44301524'],
            ['science','7-OH has one free hydroxyl'],
            ['disclosure','Not a chemical reaction'],
        ]
        self.assertEqual(frame['scene'],'sentence_2')
        frame['annotations']=copy.deepcopy(intended)
        approved=audit(self.ledger,self.receipt)
        self.assertFalse(approved['mayPublish'])
        self.assertTrue(approved['notActualEncodedFrameOCR'])
        for changed in (['source','CID 00000000'],
                        ['science','Opioid withdrawal cured'],
                        ['disclosure','Chemical conversion is proven']):
            with self.subTest(changed=changed):
                frame['annotations']=copy.deepcopy(intended)+[changed]
                with self.assertRaisesRegex(ValueError,
                                            'NEW_OR_UNSOURCED_SCIENCE_TEXT'):
                    audit(self.ledger,self.receipt)

    def test_missing_or_reordered_frame_never_passes(self):
        del self.ledger['frames'][42]
        with self.assertRaisesRegex(ValueError,'ALL_FRAMES_REQUIRED'):
            audit(self.ledger,self.receipt)
        self.ledger['frames'].insert(42,copy.deepcopy(self.ledger['frames'][41]))
        with self.assertRaisesRegex(ValueError,'MISSING_OR_TAMPERED_FRAME'):
            audit(self.ledger,self.receipt)

    def test_early_negation_or_source_claim_fails_even_between_nine_samples(self):
        target=self.ledger['frames'][605]  # sentence_5, before cue starts at 21
        target['annotations']=[['caption','not']]
        with self.assertRaisesRegex(ValueError,'SPOKEN_CAPTION_DRIFT'):
            audit(self.ledger,self.receipt)
        target['annotations']=[['science','Clinically proven to treat withdrawal']]
        with self.assertRaisesRegex(ValueError,'NEW_OR_UNSOURCED_SCIENCE_TEXT'):
            audit(self.ledger,self.receipt)

    def test_caption_missing_at_actual_spoken_cue_fails(self):
        self.ledger['frames'][31*30]['annotations']=[]  # scene 6 at 31 sec
        # One missing frame is itself an invalid emission, not a skipped caption.
        with self.assertRaisesRegex(ValueError,'SPOKEN_CAPTION_DRIFT'):
            audit(self.ledger,self.receipt)

    def test_tampered_identity_and_release_gate_fail(self):
        self.ledger['videoSha256']='d'*64
        with self.assertRaisesRegex(ValueError,'VIDEO_SOURCE_IDENTITY'):
            audit(self.ledger,self.receipt)
        self.ledger['videoSha256']='a'*64
        self.receipt['mayPublish']=True
        with self.assertRaisesRegex(ValueError,'TIMED_RESEARCH_ONLY'):
            audit(self.ledger,self.receipt)

    def test_actual_uncovered_spoken_word_fails_without_inventing_pass(self):
        # Cue too short for even a 30fps display frame is a real deficiency.
        self.receipt['scenes'][0]['captionWords'][0]['startSec']=1.001
        self.receipt['scenes'][0]['captionWords'][0]['endSec']=1.005
        for f in self.ledger['frames']:
            if f['scene']=='sentence_1':
                f['annotations']=[]
        with self.assertRaisesRegex(ValueError,'UNSHOWN_SPOKEN_CUES'):
            audit(self.ledger,self.receipt)


if __name__=='__main__':
    unittest.main()
