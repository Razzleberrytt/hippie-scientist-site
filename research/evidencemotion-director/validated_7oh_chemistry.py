"""Pinned scientific identity for deterministic 7-OH render research (not clinical validation)."""
from rdkit import Chem
from rdkit.Chem import rdMolDescriptors

PUBCHEM_CID = 44301524
PUBCHEM_URL = "https://pubchem.ncbi.nlm.nih.gov/compound/44301524"
FDA_GSRS_URL = "https://precision.fda.gov/ginas/app/ui/substances/c50748a1-8231-42ad-a263-6abc6bc49005"
INCHIKEY = "RYENLSMHLCNXJT-CYXFISRXSA-N"
FORMULA = "C23H30N2O5"
SMILES = r"CC[C@@H]1CN2CC[C@]3(C(=NC4=C3C(=CC=C4)OC)[C@@H]2C[C@@H]1/C(=C\OC)/C(=O)OC)O"


def verified_graph():
    mol = Chem.MolFromSmiles(SMILES)
    if mol is None:
        raise ValueError("Pinned PubChem SMILES could not be parsed")
    if Chem.MolToInchiKey(mol) != INCHIKEY or rdMolDescriptors.CalcMolFormula(mol) != FORMULA:
        raise ValueError("Chemical identity mismatch")
    if mol.GetNumAtoms() != 30 or len(Chem.GetMolFrags(mol)) != 1:
        raise ValueError("Incomplete molecular graph")
    hydroxyl = [a.GetIdx() for a in mol.GetAtoms()
                if a.GetSymbol() == "O" and a.GetTotalNumHs() > 0]
    if len(hydroxyl) != 1:
        raise ValueError("Expected one explicitly free hydroxyl group")
    if sum(1 for a in mol.GetAtoms() if a.HasProp("_CIPCode")) != 4:
        raise ValueError("Unexpected stereochemistry")
    return mol, hydroxyl[0]
