"""Run: cd research/evidencemotion-director && python -m unittest test_verified_molecular_comparison.py -v"""
import unittest
from rdkit import Chem
from rdkit.Chem import rdMolDescriptors
from verified_molecular_comparison import (
    MITRAGYNINE, HYDROXYMITRAGYNINE, approved_comparison, verified_molecule,
    SourceCompound,
)

class VerifiedComparisonTests(unittest.TestCase):
    def test_sources_are_distinct_and_exact(self):
        result = approved_comparison()
        self.assertNotEqual(MITRAGYNINE.pubchem_cid, HYDROXYMITRAGYNINE.pubchem_cid)
        self.assertEqual(result["mitragynine"]["source"].inchi_key, "LELBFTMXCIIKKX-QVRQZEMUSA-N")
        self.assertEqual(result["7_hydroxymitragynine"]["source"].inchi_key, "RYENLSMHLCNXJT-CYXFISRXSA-N")
        for k in ("mitragynine", "7_hydroxymitragynine"):
            s, m = result[k]["source"], result[k]["mol"]
            self.assertEqual(Chem.MolToInchiKey(m), s.inchi_key)
            self.assertEqual(rdMolDescriptors.CalcMolFormula(m), s.formula)

    def test_real_hydroxyl_group_is_not_guessed_from_pixels(self):
        result = approved_comparison()
        self.assertEqual(result["mitragynine"]["free_oh_indices"], [])
        indexes = result["7_hydroxymitragynine"]["free_oh_indices"]
        self.assertEqual(len(indexes), 1)
        atom = result["7_hydroxymitragynine"]["mol"].GetAtomWithIdx(indexes[0])
        self.assertEqual(atom.GetSymbol(), "O")
        self.assertGreater(atom.GetTotalNumHs(), 0)

    def test_false_inchi_key_is_rejected(self):
        fake = SourceCompound(**{**vars(MITRAGYNINE), "inchi_key": "0" * 27})
        with self.assertRaises(ValueError):
            verified_molecule(fake)

    def test_false_formula_is_rejected(self):
        fake = SourceCompound(**{**vars(HYDROXYMITRAGYNINE), "formula": "C23H30N2O4"})
        with self.assertRaises(ValueError):
            verified_molecule(fake)

    def test_not_a_molecule_morph_or_release_approval(self):
        x = approved_comparison()
        self.assertEqual(x["approved_visual_semantics"], "SIDE_BY_SIDE_DISTINCT_STRUCTURES_ONLY")
        self.assertIs(x["scientific_effects_or_conversion_inferred"], False)
        self.assertIs(x["publication_approved"], False)

if __name__ == "__main__":
    unittest.main()
