"""Actual RDKit source-graph mutation regressions (not model effect claims).
Existing source validator remains scientific authority; never rewrite it.
"""
import unittest
from rdkit import Chem
from validated_7oh_chemistry import verified_graph,INCHIKEY

def source_identity(mol):
    return len(Chem.GetMolFrags(mol))==1 and Chem.MolToInchiKey(mol)==INCHIKEY

class AdversarialSourceGraphTests(unittest.TestCase):
    def test_detaching_a_real_terminal_atom_rejects_disconnected_bond(self):
        mol,oh=verified_graph()
        self.assertTrue(source_identity(mol))
        terminal=next(a for a in mol.GetAtoms() if a.GetDegree()==1 and a.GetSymbol()=='C')
        n=terminal.GetNeighbors()[0]
        adversary=Chem.RWMol(mol)
        adversary.RemoveBond(terminal.GetIdx(),n.GetIdx())
        broken=adversary.GetMol()
        Chem.SanitizeMol(broken)
        self.assertGreater(len(Chem.GetMolFrags(broken)),1)
        self.assertFalse(source_identity(broken))
        self.assertEqual(mol.GetAtomWithIdx(oh).GetSymbol(),'O')
    def test_deleting_actual_hydroxyl_connection_is_never_same_source(self):
        mol,oh=verified_graph()
        other=mol.GetAtomWithIdx(oh).GetNeighbors()[0].GetIdx()
        adversary=Chem.RWMol(mol)
        adversary.RemoveBond(oh,other)
        broken=adversary.GetMol()
        Chem.SanitizeMol(broken)
        self.assertFalse(source_identity(broken))
        self.assertGreater(len(Chem.GetMolFrags(broken)),1)

if __name__=="__main__":unittest.main()
