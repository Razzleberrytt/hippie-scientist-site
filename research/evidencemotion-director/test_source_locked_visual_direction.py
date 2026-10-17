"""Negative-controlled research directional spotlight, never an efficacy claim."""
import math
import unittest
from dataclasses import replace
from PIL import Image
from rdkit import Chem

from source_locked_visual_direction import (
    CID_7OH, hydroxyl_ring_location, ring_radii, draw_verified_oxygen_locus)
from verified_molecular_comparison import HYDROXYMITRAGYNINE, verified_molecule


class SourceLockedDirectionTests(unittest.TestCase):
    def fixture(self):
        mol=verified_molecule(HYDROXYMITRAGYNINE)
        free_oh=[a.GetIdx() for a in mol.GetAtoms()
                 if a.GetSymbol()=="O" and a.GetTotalNumHs()==1]
        self.assertEqual(len(free_oh),1)
        return {"source":HYDROXYMITRAGYNINE,"oh":free_oh,
                "mol":mol,"diagramAtomXY":[[620,320] for _ in range(mol.GetNumAtoms())]}

    def test_source_locked_locator_scales_at_real_native_pixels(self):
        asset=self.fixture()
        x,y,r=hydroxyl_ring_location(asset)
        self.assertTrue(35<x<850)
        self.assertTrue(545<y<1145)
        self.assertGreaterEqual(r,24)
        half=hydroxyl_ring_location(asset,canvas=(540,960))
        self.assertAlmostEqual(half[0],x/2,delta=1)
        self.assertAlmostEqual(half[1],y/2,delta=1)

    def test_locus_is_added_only_after_original_spoken_comparison_reveal(self):
        image=Image.new("RGBA",(1080,1920),(4,14,22,255))
        before=image.copy()
        asset=self.fixture()
        self.assertFalse(draw_verified_oxygen_locus(image,asset,t=1.6,spoken_boundary=1.61))
        self.assertEqual(image.tobytes(),before.tobytes())
        self.assertTrue(draw_verified_oxygen_locus(image,asset,t=1.61,spoken_boundary=1.61))
        self.assertNotEqual(image.tobytes(),before.tobytes())
        self.assertEqual(image.getpixel((0,0)),before.getpixel((0,0)))
        self.assertEqual(image.getpixel((800,1450)),before.getpixel((800,1450)))
        self.assertEqual(len(ring_radii(0,32)),2)

    def test_wrong_molecule_or_invented_hydroxyl_cannot_be_highlighted(self):
        asset=self.fixture()
        # Preserve the exact 30-atom coordinate inventory when testing just
        # the selected OH position. A one-atom coordinate fixture rightfully
        # fails the earlier inventory guard, not the intended geometry gate.
        oxygen=asset["oh"][0]
        offscreen=[list(xy) for xy in asset["diagramAtomXY"]]
        offscreen[oxygen]=[1800,320]
        nonfinite=[list(xy) for xy in asset["diagramAtomXY"]]
        nonfinite[oxygen]=[620,float("nan")]
        for change,code in [
            ({"source":replace(HYDROXYMITRAGYNINE,pubchem_cid=3034396)},"WRONG_CHEMICAL"),
            ({"oh":[]},"UNVERIFIED_HYDROXYL"),
            ({"oh":[0,1]},"UNVERIFIED_HYDROXYL"),
            ({"diagramAtomXY":offscreen},"GRAPH_COORDS_OFF"),
            ({"diagramAtomXY":nonfinite},"INVALID_GRAPH"),
        ]:
            with self.subTest(code=code):
                with self.assertRaisesRegex(ValueError,code):
                    hydroxyl_ring_location({**asset,**change})

    def test_em00404_substituted_and_disconnected_graphs_cannot_hide_under_right_cid(self):
        asset=self.fixture()
        actual=asset["mol"]
        # Deliberate substitutions preserve the claimed CID and free OH index.
        # The original CID string is insufficient to authenticate an RDKit graph.
        replacement=Chem.RWMol(actual)
        terminal_carbon=next(a.GetIdx() for a in replacement.GetAtoms()
                             if a.GetSymbol()=="C" and a.GetDegree()==1)
        replacement.GetAtomWithIdx(terminal_carbon).SetAtomicNum(7)
        substituted=replacement.GetMol()
        Chem.SanitizeMol(substituted)
        self.assertNotEqual(
            Chem.MolToSmiles(substituted),Chem.MolToSmiles(actual))
        with self.assertRaisesRegex(ValueError,"PINNED_WHOLE_GRAPH_MISMATCH"):
            hydroxyl_ring_location({**asset,"mol":substituted})

        # Detach one terminal atom from the source molecular graph.
        detached=Chem.RWMol(actual)
        end=next(a.GetIdx() for a in detached.GetAtoms()
                 if a.GetSymbol()=="C" and a.GetDegree()==1)
        neighbour=detached.GetAtomWithIdx(end).GetNeighbors()[0].GetIdx()
        detached.RemoveBond(end,neighbour)
        disconnected=detached.GetMol()
        self.assertGreater(len(Chem.GetMolFrags(disconnected)),1)
        with self.assertRaisesRegex(ValueError,"PINNED_WHOLE_GRAPH_MISMATCH"):
            hydroxyl_ring_location({**asset,"mol":disconnected})

    def test_em00404_cid_only_forgeries_and_wrong_hydroxyl_refused(self):
        asset=self.fixture()
        # A counterfeit source may display the right CID but wrong chemistry.
        forged=replace(HYDROXYMITRAGYNINE,formula="C23H30N2O4")
        with self.assertRaisesRegex(ValueError,"SOURCE_RECORD_NOT_PINNED"):
            hydroxyl_ring_location({**asset,"source":forged})
        with self.assertRaisesRegex(ValueError,"ACTUAL_RDKIT_SOURCE_GRAPH_REQUIRED"):
            hydroxyl_ring_location({**asset,"mol":object()})
        wrong_oxygen=next(a.GetIdx() for a in asset["mol"].GetAtoms()
                          if a.GetSymbol()=="O" and a.GetTotalNumHs()==0)
        with self.assertRaisesRegex(ValueError,"HIGHLIGHT_NOT_FREE_HYDROXYL"):
            hydroxyl_ring_location({**asset,"oh":[wrong_oxygen]})
        with self.assertRaisesRegex(ValueError,"UNVERIFIED_HYDROXYL"):
            hydroxyl_ring_location({**asset,"oh":[True]})

    def test_non_native_aspect_or_unsafe_acoustic_timestamps_are_holds(self):
        asset=self.fixture()
        with self.assertRaisesRegex(ValueError,"NON_PORTRAIT"):
            hydroxyl_ring_location(asset,canvas=(1080,1080))
        with self.assertRaisesRegex(ValueError,"INVALID_REVEAL_TIME"):
            ring_radii(float("nan"),32)
        with self.assertRaisesRegex(ValueError,"INVALID_ACOUSTIC_TIME"):
            draw_verified_oxygen_locus(Image.new("RGBA",(1080,1920)),asset,
                                       t=float("nan"),spoken_boundary=1.61)

    def test_actual_pubchem_rdkit_asset_oxygen_is_the_target(self):
        from narration_locked_treatments import chemistry_assets
        all_assets=chemistry_assets()
        self.assertEqual(all_assets["mitragynine"]["oh"],[])
        self.assertEqual(len(all_assets["7_hydroxymitragynine"]["oh"]),1)
        x,y,r=hydroxyl_ring_location(all_assets["7_hydroxymitragynine"])
        self.assertTrue(60<x<1020)
        self.assertTrue(550<y<1145)
        self.assertGreater(r,0)


if __name__=="__main__":
    unittest.main()
