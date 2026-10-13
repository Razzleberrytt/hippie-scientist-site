"""Research-only verified 7-OH graph regression. Run from this folder with python -m unittest."""
import unittest
from rdkit import Chem
from rdkit.Chem import rdMolDescriptors
from validated_7oh_chemistry import verified_graph, INCHIKEY, FORMULA, PUBCHEM_CID

class SourceIdentityTests(unittest.TestCase):
    def test_verified_source_graph(self):
        mol, hydroxyl = verified_graph()
        self.assertEqual(Chem.MolToInchiKey(mol), INCHIKEY)
        self.assertEqual(rdMolDescriptors.CalcMolFormula(mol), FORMULA)
        self.assertEqual(PUBCHEM_CID, 44301524)
        self.assertEqual(mol.GetAtomWithIdx(hydroxyl).GetSymbol(), 'O')

    def test_no_disconnects_or_invented_bonds(self):
        mol, _ = verified_graph()
        self.assertEqual(len(Chem.GetMolFrags(mol)), 1)
        self.assertEqual(len([b for b in mol.GetBonds() if b.GetBeginAtomIdx() == b.GetEndAtomIdx()]), 0)

    def test_pinned_stereochemistry(self):
        mol, _ = verified_graph()
        self.assertEqual(len(Chem.FindMolChiralCenters(mol, includeUnassigned=False)), 4)
        self.assertEqual(
            len([b for b in mol.GetBonds()
                 if b.GetStereo() not in (Chem.BondStereo.STEREONONE,)]), 1)

if __name__ == '__main__':
    unittest.main()
