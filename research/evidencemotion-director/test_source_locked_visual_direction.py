"""Negative-controlled research directional spotlight, never an efficacy claim."""
import math
import unittest
from dataclasses import dataclass
from PIL import Image

from source_locked_visual_direction import (
    CID_7OH, hydroxyl_ring_location, ring_radii, draw_verified_oxygen_locus)


@dataclass
class Source:
    pubchem_cid: int


class Atom:
    def __init__(self, symbol="O", h=1):
        self.symbol,self.h=symbol,h
    def GetSymbol(self):
        return self.symbol
    def GetTotalNumHs(self):
        return self.h


class Molecule:
    def GetNumAtoms(self):
        return 1
    def GetAtomWithIdx(self,index):
        assert index==0
        return Atom()


class SourceLockedDirectionTests(unittest.TestCase):
    def fixture(self):
        return {"source":Source(CID_7OH),"oh":[0],
                "mol":Molecule(),"diagramAtomXY":[[620,320]]}

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
        for change,code in [
            ({"source":Source(3034396)},"WRONG_CHEMICAL"),
            ({"oh":[]},"UNVERIFIED_HYDROXYL"),
            ({"oh":[0,1]},"UNVERIFIED_HYDROXYL"),
            ({"diagramAtomXY":[[1800,320]]},"GRAPH_COORDS_OFF"),
            ({"diagramAtomXY":[[620,float('nan')]]},"INVALID_GRAPH"),
        ]:
            with self.subTest(code=code):
                with self.assertRaisesRegex(ValueError,code):
                    hydroxyl_ring_location({**asset,**change})

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
