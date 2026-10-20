"""RESEARCH ONLY: two-source structural comparison for EvidenceMotion.

Deterministic RDKit chemical identities. Source data from PubChem CIDs 3034396
and 44301524. This module cannot generate effects, receptor geometry, or
biological claims; chemical views are not a molecular-conversion animation.
"""
from dataclasses import dataclass
from rdkit import Chem
from rdkit.Chem import rdMolDescriptors

@dataclass(frozen=True)
class SourceCompound:
    name: str
    pubchem_cid: int
    formula: str
    inchi_key: str
    isomeric_smiles: str
    source_url: str

MITRAGYNINE = SourceCompound(
    name="Mitragynine",
    pubchem_cid=3034396,
    formula="C23H30N2O4",
    inchi_key="LELBFTMXCIIKKX-QVRQZEMUSA-N",
    isomeric_smiles=r"CC[C@@H]1CN2CCC3=C([C@@H]2C[C@@H]1/C(=C\OC)/C(=O)OC)NC4=C3C(=CC=C4)OC",
    source_url="https://pubchem.ncbi.nlm.nih.gov/compound/3034396",
)
HYDROXYMITRAGYNINE = SourceCompound(
    name="7-Hydroxymitragynine",
    pubchem_cid=44301524,
    formula="C23H30N2O5",
    inchi_key="RYENLSMHLCNXJT-CYXFISRXSA-N",
    isomeric_smiles=r"CC[C@@H]1CN2CC[C@]3(C(=NC4=C3C(=CC=C4)OC)[C@@H]2C[C@@H]1/C(=C\OC)/C(=O)OC)O",
    source_url="https://pubchem.ncbi.nlm.nih.gov/compound/44301524",
)

def verified_molecule(item: SourceCompound):
    mol = Chem.MolFromSmiles(item.isomeric_smiles)
    if mol is None or Chem.MolToInchiKey(mol) != item.inchi_key:
        raise ValueError("Pinned PubChem chemical identity mismatch: " + item.name)
    if rdMolDescriptors.CalcMolFormula(mol) != item.formula:
        raise ValueError("Pinned PubChem formula mismatch: " + item.name)
    if len(Chem.GetMolFrags(mol)) != 1:
        raise ValueError("Disconnected chemical graph: " + item.name)
    return mol

def approved_comparison():
    """Return distinct validated structures, not a putative chemical reaction."""
    a, b = verified_molecule(MITRAGYNINE), verified_molecule(HYDROXYMITRAGYNINE)
    if a.GetNumAtoms() != 29 or b.GetNumAtoms() != 30:
        raise ValueError("Unexpected atom count")
    a_oh = [v.GetIdx() for v in a.GetAtoms() if v.GetSymbol() == 'O' and v.GetTotalNumHs() > 0]
    b_oh = [v.GetIdx() for v in b.GetAtoms() if v.GetSymbol() == 'O' and v.GetTotalNumHs() > 0]
    if a_oh or len(b_oh) != 1:
        raise ValueError("Hydroxyl annotation cannot be verified")
    return {
        "mitragynine": {"source": MITRAGYNINE, "mol": a, "free_oh_indices": a_oh},
        "7_hydroxymitragynine": {"source": HYDROXYMITRAGYNINE, "mol": b, "free_oh_indices": b_oh},
        "approved_visual_semantics": "SIDE_BY_SIDE_DISTINCT_STRUCTURES_ONLY",
        "scientific_effects_or_conversion_inferred": False,
        "publication_approved": False,
    }
