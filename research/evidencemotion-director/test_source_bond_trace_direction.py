"""Source-rejection controls for speech-locked six-bond teaching direction.

Real graph assay and graphics are intentionally research-only: test PASS
cannot certify whole-film craft, medical effectiveness or viewer literacy.
"""
import unittest
from dataclasses import dataclass
from PIL import Image
from source_bond_trace_direction import (
    MAX_BONDS,verified_bond_path,selected_bond_count,
    mapped_atom_point,draw_existing_bond_connections,research_science_camera
)

@dataclass
class WrongSource:
    pubchem_cid:int=3034396


class SourceBondDirectionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from narration_locked_treatments import chemistry_assets
        cls.asset=chemistry_assets()["7_hydroxymitragynine"]
        cls.scene={"id":"sentence_3","startSec":8.75,"endSec":14.5,
                   "captionWords":[{"text":"This","startSec":8.75,"endSec":9.1},
                                   {"text":"molecular","startSec":9.1,"endSec":9.6}]}

    def test_path_has_six_real_source_bonds_and_one_free_oh_root(self):
        graph=self.asset["mol"]
        path=verified_bond_path(self.asset)
        self.assertEqual(len(path),MAX_BONDS)
        self.assertEqual(path[0][0],self.asset["oh"][0])
        self.assertEqual(len(set(path)),len(path))
        for (a,b),(n,c) in zip(path,path[1:]):
            self.assertIsNotNone(graph.GetBondBetweenAtoms(a,b))
            self.assertEqual(b,n)
        self.assertIsNotNone(graph.GetBondBetweenAtoms(*path[-1]))

    def test_exact_spoken_onset_and_monotone_increment(self):
        start,end=9.1,14.5
        self.assertEqual(selected_bond_count(9.0,start,end),0)
        self.assertEqual(selected_bond_count(9.1,start,end),0)
        self.assertEqual(selected_bond_count(9.6,start,end),1)
        # Exact .9-second source-timed boundary must not round 1.0 to
        # 1.0000000000000002 and expose the next bond prematurely.
        self.assertEqual(selected_bond_count(10.,start,end),1)
        self.assertEqual(selected_bond_count(10.0001,start,end),2)
        self.assertEqual(selected_bond_count(14.5,start,end),MAX_BONDS)
        self.assertEqual([selected_bond_count(t,start,end)
                          for t in (9.,9.1,10.,11.,12.,13.,14.5)],
                         sorted(selected_bond_count(t,start,end)
                                for t in (9.,9.1,10.,11.,12.,13.,14.5)))

    def test_only_verified_bonds_are_marked_and_opening_is_unchanged(self):
        base=Image.new("RGBA",(1080,1920),(2,13,23,255))
        original=base.tobytes()
        count=draw_existing_bond_connections(
            base,self.asset,seconds=9.0,scene=self.scene,scene_progress=.12)
        self.assertEqual(count,0)
        self.assertEqual(base.tobytes(),original)
        count=draw_existing_bond_connections(
            base,self.asset,seconds=11.4,scene=self.scene,scene_progress=.55)
        self.assertGreater(count,0)
        self.assertNotEqual(base.tobytes(),original)
        self.assertEqual(base.getpixel((800,1500)),(2,13,23,255))
        self.assertEqual(base.getpixel((250,150)),(2,13,23,255))

    def test_only_newly_reached_source_atom_endpoints_are_teal(self):
        from source_bond_trace_direction import mapped_atom_point
        asset=self.asset
        image=Image.new("RGBA",(1080,1920),(2,13,23,255))
        path=verified_bond_path(asset)
        # Exactly one valid bond is active at this original spoken cue.
        count=draw_existing_bond_connections(
            image,asset,seconds=10.,scene=self.scene,scene_progress=.40)
        self.assertEqual(count,1)
        a,b=path[0]
        x,y=mapped_atom_point(asset["diagramAtomXY"][b],.40,image.size)
        x,y=round(x),round(y)
        visible=sum(image.getpixel((i,j))[:3]==(96,216,199)
                    for i in range(x-10,x+11)
                    for j in range(y-10,y+11))
        self.assertGreater(visible,10)
        # A disconnected/unreached distant atom must not get a cyan ring.
        far=next(i for i in range(asset["mol"].GetNumAtoms())
                 if i not in {a,b})
        ox,oy=mapped_atom_point(asset["diagramAtomXY"][far],.40,image.size)
        ox,oy=round(ox),round(oy)
        self.assertEqual(image.getpixel((ox,oy))[:3],(2,13,23))

    def test_wrong_source_cannot_hijack_molecule_story(self):
        wrong={**self.asset,"source":WrongSource()}
        with self.assertRaisesRegex(ValueError,"WRONG_SOURCE_ID"):
            verified_bond_path(wrong)
        for mutation,code in [
            ({"oh":[]},"FREE_OH_NOT_VERIFIED"),
            ({"oh":[0,1]},"FREE_OH_NOT_VERIFIED"),
            ({"diagramAtomXY":[[0,0]]},"MISSING_VERIFIED_DIAGRAM"),
        ]:
            with self.assertRaisesRegex(ValueError,code):
                verified_bond_path({**self.asset,**mutation})

    def test_pinned_chemical_graph_camera_is_a_complete_pullback(self):
        opening=research_science_camera(0.)
        halfway=research_science_camera(.5)
        closing=research_science_camera(1.)
        self.assertEqual(opening,(25.,590.,880.,660.))
        self.assertEqual(closing,(105.,630.,720.,540.))
        self.assertGreater(opening[2],halfway[2])
        self.assertGreater(halfway[2],closing[2])
        for p in (0,.25,.5,.75,1):
            dx,dy,dw,dh=research_science_camera(p)
            self.assertAlmostEqual(dx+dw/2,465.)
            self.assertAlmostEqual(dw/dh,4/3)
            self.assertLessEqual(dy+dh,1260)
            self.assertGreaterEqual(dy,580)
            for pt in self.asset["diagramAtomXY"]:
                x,y=mapped_atom_point(pt,p,(1080,1920))
                self.assertTrue(dx<=x<=dx+dw)
                self.assertTrue(dy<=y<=dy+dh)
        with self.assertRaisesRegex(ValueError,"INVALID_SHOT_PROGRESS"):
            research_science_camera(float("inf"))

    def test_bad_scene_timings_and_geometry_fail_closed(self):
        frame=Image.new("RGBA",(1080,1920),(0,0,0,255))
        with self.assertRaisesRegex(ValueError,"WRONG_NARRATION_SCENE"):
            draw_existing_bond_connections(
                frame,self.asset,seconds=10.,scene={**self.scene,"id":"sentence_2"},scene_progress=.5)
        with self.assertRaisesRegex(ValueError,"MISSING_UNIQUE_SPOKEN_GRAPH_CUE"):
            draw_existing_bond_connections(
                frame,self.asset,seconds=10.,scene={**self.scene,"captionWords":[]},scene_progress=.5)
        with self.assertRaisesRegex(ValueError,"INVALID_ACOUSTIC_TIMELINE"):
            selected_bond_count(10,11,9)
        with self.assertRaisesRegex(ValueError,"UNSUPPORTED_FILM_GEOMETRY"):
            mapped_atom_point([620,320],.5,(900,1600))
        with self.assertRaisesRegex(ValueError,"INVALID_SHOT_PROGRESS"):
            mapped_atom_point([620,320],float("nan"),(1080,1920))


if __name__=="__main__":
    unittest.main()
