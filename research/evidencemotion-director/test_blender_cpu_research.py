"""Contract-only tests; synthetic fixture is NOT genuine 7-OH science."""
import copy
import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

MODULE_PATH=Path(__file__).with_name("blender_cpu_research.py")
spec=importlib.util.spec_from_file_location("blender_cpu_research",MODULE_PATH)
b=importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)

def mock_packet():
    atoms=[{"id":i,"element":"O" if i==0 else "C",
            "xyz":[float(i%5),float(i//5),0.0]} for i in range(30)]
    return {"schema":b.SCHEMA,"pubchemCID":b.CID,"inchiKey":b.INCHIKEY,
            "graphAuthority":"validated_7oh_chemistry.verified_graph",
            "geometryKind":"COMPUTED_RDKIT_ETKDG_MMFF_NOT_OBSERVED",
            "scientificClaims":[],"assertsHumanEffect":False,
            "assertsDocking":False,"highlightAtomIndex":0,
            "atoms":atoms,
            "bonds":[{"a":i,"b":i+1,"kind":"SINGLE"} for i in range(29)]}

class BlenderResearchContractTests(unittest.TestCase):
    def test_synthetic_contract_does_not_authorize_science_or_release(self):
        result=b.validate(mock_packet())
        self.assertEqual(result["status"],"SCHEMA_PREFLIGHT_ONLY")
        self.assertFalse(result["scienceApproved"])
        self.assertFalse(result["mayPublish"])

    def test_wrong_pubchem_identity_rejected(self):
        p=mock_packet();p["pubchemCID"]=123
        with self.assertRaisesRegex(ValueError,"SOURCE_IDENTITY_MISMATCH"): b.validate(p)

    def test_wrong_inchikey_rejected(self):
        p=mock_packet();p["inchiKey"]="FAKE"
        with self.assertRaisesRegex(ValueError,"SOURCE_IDENTITY_MISMATCH"): b.validate(p)

    def test_disclosed_computed_not_measured_model_required(self):
        p=mock_packet();p["geometryKind"]="MEASURED"
        with self.assertRaisesRegex(ValueError,"MODEL_DISCLOSURE_MISSING"): b.validate(p)

    def test_unverified_graph_authority_rejected(self):
        p=mock_packet();p["graphAuthority"]="user-supplied"
        with self.assertRaisesRegex(ValueError,"MODEL_DISCLOSURE_MISSING"): b.validate(p)

    def test_human_effects_prohibited(self):
        p=mock_packet();p["assertsHumanEffect"]=True
        with self.assertRaisesRegex(ValueError,"UNSUPPORTED_SCIENTIFIC_CLAIM"): b.validate(p)

    def test_docking_claim_prohibited(self):
        p=mock_packet();p["assertsDocking"]=True
        with self.assertRaisesRegex(ValueError,"UNSUPPORTED_SCIENTIFIC_CLAIM"): b.validate(p)

    def test_fabricated_claim_rejected(self):
        p=mock_packet();p["scientificClaims"]=["treats disease"]
        with self.assertRaisesRegex(ValueError,"UNSUPPORTED_SCIENTIFIC_CLAIM"): b.validate(p)

    def test_wrong_atom_count_rejected(self):
        p=mock_packet();p["atoms"].pop()
        with self.assertRaisesRegex(ValueError,"INVALID_GRAPH_SIZE"): b.validate(p)

    def test_unknown_atom_element_rejected(self):
        p=mock_packet();p["atoms"][5]["element"]="X"
        with self.assertRaisesRegex(ValueError,"BAD_ATOM"): b.validate(p)

    def test_nonfinite_coordinates_rejected(self):
        p=mock_packet();p["atoms"][5]["xyz"][2]=float('nan')
        with self.assertRaisesRegex(ValueError,"INVALID_COORDINATES"): b.validate(p)

    def test_duplicate_bonds_rejected(self):
        p=mock_packet();p["bonds"].append({"a":1,"b":0,"kind":"SINGLE"})
        with self.assertRaisesRegex(ValueError,"DUPLICATE_BOND"): b.validate(p)

    def test_unknown_bond_kind_rejected(self):
        p=mock_packet();p["bonds"][0]["kind"]="IMPOSSIBLE"
        with self.assertRaisesRegex(ValueError,"BAD_BOND"): b.validate(p)

    def test_highlight_must_point_to_oxygen(self):
        p=mock_packet();p["highlightAtomIndex"]=1
        with self.assertRaisesRegex(ValueError,"INVALID_HYDROXYL_ANCHOR"): b.validate(p)

    def test_hash_rejects_modified_packet_before_blender_import(self):
        p=mock_packet()
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/"packet.json"
            path.write_text(json.dumps(p))
            sha=b.sha256(path)
            path.write_text(json.dumps({**p,"pubchemCID":999}))
            with self.assertRaisesRegex(ValueError,"PACKET_SHA_MISMATCH"):
                b.render(path,sha,tmp,"whole")

    def test_unrecognized_render_direction_fails_before_loading_blender(self):
        with self.assertRaisesRegex(ValueError,"UNSUPPORTED_DIRECTION"):
            b.render("not-used","no-sha",".","poster-only")

if __name__=="__main__":
    unittest.main()
