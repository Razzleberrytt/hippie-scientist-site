"""One motivated comparison annotation: point to a verified oxygen, not a reaction.

Research-only. The geometry is derived from the exact existing PubChem-backed
7-hydroxymitragynine RDKit graph and its rendered 2-D atom coordinates.
Never invent atoms, labels, pharmacology or clinical inference.
"""
import math

from rdkit import Chem
from verified_molecular_comparison import HYDROXYMITRAGYNINE, verified_molecule

CID_7OH=44301524
DIAGRAM_BASE=(1200,900)
DIAGRAM_DEST=(35,545,800,600)
SPOKEN_CUT_WORD="different"


def hydroxyl_ring_location(asset,*,canvas=(1080,1920)):
    """Return (x, y, radius) in the *original native* output pixel geometry."""
    source=asset.get("source")
    if getattr(source,"pubchem_cid",None)!=CID_7OH:
        raise ValueError("DIRECTION_HOLD:WRONG_CHEMICAL_IDENTITY")
    # CID on an untrusted asset is only a label. Before annotating the source
    # oxygen, verify the *whole supplied graph* and the canonical source record.
    # This is chemical identity research, not pixel or clinical approval.
    if source != HYDROXYMITRAGYNINE:
        raise ValueError("DIRECTION_HOLD:SOURCE_RECORD_NOT_PINNED")
    mol=asset.get("mol")
    if not isinstance(mol,Chem.Mol):
        raise ValueError("DIRECTION_HOLD:ACTUAL_RDKIT_SOURCE_GRAPH_REQUIRED")
    canonical=verified_molecule(HYDROXYMITRAGYNINE)
    if (mol.GetNumAtoms()!=canonical.GetNumAtoms() or
        len(Chem.GetMolFrags(mol))!=1 or
        Chem.MolToSmiles(mol,isomericSmiles=True)!=
        Chem.MolToSmiles(canonical,isomericSmiles=True)):
        raise ValueError("DIRECTION_HOLD:PINNED_WHOLE_GRAPH_MISMATCH")
    indices=asset.get("oh")
    if (not isinstance(indices,list) or len(indices)!=1 or
        type(indices[0]) is not int or not 0<=indices[0]<mol.GetNumAtoms()):
        raise ValueError("DIRECTION_HOLD:UNVERIFIED_HYDROXYL")
    oxygen=mol.GetAtomWithIdx(indices[0])
    if oxygen.GetSymbol()!="O" or oxygen.GetTotalNumHs()!=1:
        raise ValueError("DIRECTION_HOLD:HIGHLIGHT_NOT_FREE_HYDROXYL_OXYGEN")
    coords=asset.get("diagramAtomXY")
    if not isinstance(coords,list) or len(coords)!=mol.GetNumAtoms():
        raise ValueError("DIRECTION_HOLD:UNPINNED_SOURCE_ATOM_SCREEN_COORDS")
    ox,oy=coords[indices[0]]
    if not all(isinstance(v,(int,float)) and math.isfinite(v) for v in (ox,oy)):
        raise ValueError("DIRECTION_HOLD:INVALID_GRAPH_COORDINATES")
    if not (0<=ox<=DIAGRAM_BASE[0] and 0<=oy<=DIAGRAM_BASE[1]):
        raise ValueError("DIRECTION_HOLD:CHEMICAL_GRAPH_COORDS_OFF_CANVAS")
    w,h=canvas
    if h*9!=w*16 or w<540:
        raise ValueError("DIRECTION_HOLD:NON_PORTRAIT_NATIVE_MASTER")
    scale=w/1080
    x=(DIAGRAM_DEST[0]+ox*DIAGRAM_DEST[2]/DIAGRAM_BASE[0])*scale
    y=(DIAGRAM_DEST[1]+oy*DIAGRAM_DEST[3]/DIAGRAM_BASE[1])*scale
    if not (50*scale<x<(w-60*scale) and 555*scale<y<1145*scale):
        raise ValueError("DIRECTION_HOLD:SOURCE_SPOTLIGHT_OUTSIDE_SCIENCE_STAGE")
    return (round(x),round(y),max(18,round(32*scale)))


def ring_radii(seconds_since_spoken_reveal,base_radius):
    """Two finite, concentric locus markers; no traveling/morphing atoms."""
    if not isinstance(seconds_since_spoken_reveal,(int,float)) or not math.isfinite(seconds_since_spoken_reveal):
        raise ValueError("DIRECTION_HOLD:INVALID_REVEAL_TIME")
    if seconds_since_spoken_reveal < 0:
        return ()
    elapsed=min(seconds_since_spoken_reveal,4.0)
    return (base_radius+round(4*math.sin(elapsed*4.0)),
            base_radius+14+round(3*math.sin(elapsed*3.1)))


def draw_verified_oxygen_locus(image, asset, *, t, spoken_boundary):
    """Modify only experimental candidate pixels, with zero new text/claims."""
    from PIL import ImageDraw
    if not (math.isfinite(t) and math.isfinite(spoken_boundary)):
        raise ValueError("DIRECTION_HOLD:INVALID_ACOUSTIC_TIME")
    if t < spoken_boundary:
        return False
    x,y,r=hydroxyl_ring_location(asset,canvas=image.size)
    radii=ring_radii(t-spoken_boundary,r)
    d=ImageDraw.Draw(image,"RGBA")
    scale=image.width/1080
    for k,radius in enumerate(radii):
        d.ellipse((x-radius,y-radius,x+radius,y+radius),
                  outline=(255,188,98,230 if k==0 else 116),
                  width=max(2,round((4 if k==0 else 2)*scale)))
    return True
