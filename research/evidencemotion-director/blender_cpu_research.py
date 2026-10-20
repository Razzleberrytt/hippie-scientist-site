#!/usr/bin/env python3
"""EvidenceMotion research-only CPU Blender molecular still adapter.

Export: ordinary Python with RDKit and the repository's verified_7oh_chemistry.
Render: headless Blender Python, NO RDKit install inside Blender.
No production import, publication authority, new R-version or paid service.
"""
import argparse
import hashlib
import json
import math
import sys
import time
from pathlib import Path

CID = 44301524
INCHIKEY = "RYENLSMHLCNXJT-CYXFISRXSA-N"
SCHEMA = "ths-blender-cpu-7oh-research-v1"
DIRECTIONS = ("whole", "hydroxyl-detail")
LIMIT_ATOMS = 80

def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def fail(message):
    raise ValueError("BLENDER_RESEARCH_HOLD: " + message)

def export_verified_packet(destination):
    # This exact repo validator, not Blender or generative art, owns atom identity.
    from rdkit import Chem
    from rdkit.Chem import AllChem
    from validated_7oh_chemistry import verified_graph, INCHIKEY as verified_key, PUBCHEM_CID
    if verified_key != INCHIKEY or PUBCHEM_CID != CID:
        fail("VERIFIED_SOURCE_IDENTITY_CHANGED")
    graph, hydroxyl = verified_graph()
    if graph.GetNumAtoms() != 30 or Chem.MolToInchiKey(graph) != INCHIKEY:
        fail("VERIFIED_GRAPH_MISMATCH")
    molecule = Chem.AddHs(graph)
    params = AllChem.ETKDGv3()
    params.randomSeed = 708315
    params.numThreads = 1
    if AllChem.EmbedMolecule(molecule, params) != 0:
        fail("RDKIT_EMBED_FAILED")
    if AllChem.MMFFOptimizeMolecule(molecule, maxIters=240) < 0:
        fail("RDKIT_MMFF_FAILED")
    if Chem.MolToInchiKey(Chem.RemoveHs(molecule)) != INCHIKEY:
        fail("CONFORMER_IDENTITY_DRIFT")
    coordinates = molecule.GetConformer().GetPositions()
    heavy = graph.GetNumAtoms()
    centers = [sum(float(coordinates[i][k]) for i in range(heavy))/heavy for k in range(3)]
    atoms = [{"id":i,"element":graph.GetAtomWithIdx(i).GetSymbol(),
              "xyz":[round(float(coordinates[i][k])-centers[k],7) for k in range(3)]}
             for i in range(heavy)]
    bonds = [{"a":int(b.GetBeginAtomIdx()),"b":int(b.GetEndAtomIdx()),
              "kind":"AROMATIC" if b.GetIsAromatic() else str(b.GetBondType())} for b in graph.GetBonds()]
    packet = {
        "schema":SCHEMA, "pubchemCID":CID,"inchiKey":INCHIKEY,
        "geometryKind":"COMPUTED_RDKIT_ETKDG_MMFF_NOT_OBSERVED",
        "graphAuthority":"validated_7oh_chemistry.verified_graph",
        "scientificClaims":[],"assertsHumanEffect":False,"assertsDocking":False,
        "highlightAtomIndex":int(hydroxyl),"atoms":atoms,"bonds":bonds,
    }
    validate(packet)
    destination = Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(packet, sort_keys=True, separators=(",",":"))+"\n")
    return {"packet":str(destination),"sha256":sha256(destination),
            "atoms":len(atoms),"bonds":len(bonds),"scienceApproved":False}

def validate(packet):
    if not isinstance(packet, dict):
        fail("INVALID_PACKET")
    if packet.get("schema") != SCHEMA or packet.get("pubchemCID") != CID or packet.get("inchiKey") != INCHIKEY:
        fail("SOURCE_IDENTITY_MISMATCH")
    if packet.get("graphAuthority") != "validated_7oh_chemistry.verified_graph" or packet.get("geometryKind") != "COMPUTED_RDKIT_ETKDG_MMFF_NOT_OBSERVED":
        fail("MODEL_DISCLOSURE_MISSING")
    if packet.get("scientificClaims") != [] or packet.get("assertsHumanEffect") is not False or packet.get("assertsDocking") is not False:
        fail("UNSUPPORTED_SCIENTIFIC_CLAIM")
    atoms, bonds = packet.get("atoms"), packet.get("bonds")
    if not isinstance(atoms,list) or len(atoms)!=30 or len(atoms)>LIMIT_ATOMS or not isinstance(bonds,list) or not bonds:
        fail("INVALID_GRAPH_SIZE")
    for i,atom in enumerate(atoms):
        if not isinstance(atom,dict) or atom.get("id")!=i or atom.get("element") not in ("C","N","O"):
            fail("BAD_ATOM")
        xyz=atom.get("xyz")
        if not isinstance(xyz,list) or len(xyz)!=3 or any(type(v) not in (float,int) or not math.isfinite(v) or abs(v)>30 for v in xyz):
            fail("INVALID_COORDINATES")
    used=set()
    for b in bonds:
        if not isinstance(b,dict) or type(b.get("a")) is not int or type(b.get("b")) is not int or b.get("kind") not in ("SINGLE","DOUBLE","TRIPLE","AROMATIC"):
            fail("BAD_BOND")
        a,z=b["a"],b["b"]
        if not (0<=a<30 and 0<=z<30 and a!=z):
            fail("UNSUPPORTED_BOND")
        edge=tuple(sorted((a,z)))
        if edge in used:
            fail("DUPLICATE_BOND")
        used.add(edge)
    h=packet.get("highlightAtomIndex")
    if type(h) is not int or not 0<=h<30 or atoms[h]["element"]!="O":
        fail("INVALID_HYDROXYL_ANCHOR")
    # Scientific truth requires regenerating from the repo's verified graph, not just passing this schema.
    return {"status":"SCHEMA_PREFLIGHT_ONLY","atoms":len(atoms),"bonds":len(bonds),
            "scienceApproved":False,"mayPublish":False}

def render(packet_file, expected_sha, outdir, direction):
    if direction not in DIRECTIONS:
        fail("UNSUPPORTED_DIRECTION")
    if not isinstance(expected_sha,str) or len(expected_sha)!=64 or sha256(packet_file)!=expected_sha.lower():
        fail("PACKET_SHA_MISMATCH")
    packet=json.loads(Path(packet_file).read_text())
    validate(packet)
    try:
        import bpy
        from mathutils import Vector, Quaternion
    except ImportError:
        fail("BLENDER_RUNTIME_REQUIRED")
    if bpy.app.background is not True:
        fail("HEADLESS_MODE_REQUIRED")
    start=time.monotonic()
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    scene=bpy.context.scene
    scene.render.engine='CYCLES'
    scene.cycles.device='CPU'
    scene.cycles.samples=32
    # The distro CPU build may not include OpenImageDenoiser; refuse implicit optional backends.
    if hasattr(scene.cycles,'use_denoising'):
        scene.cycles.use_denoising=False
    for view_layer in scene.view_layers:
        if hasattr(view_layer.cycles,'use_denoising'):
            view_layer.cycles.use_denoising=False
    scene.render.resolution_x=270
    scene.render.resolution_y=480
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG'
    scene.render.film_transparent=False
    scene.world.use_nodes=True
    background_node=scene.world.node_tree.nodes.get("Background")
    if background_node is not None:
        background_node.inputs["Color"].default_value=(.007,.015,.030,1)
        background_node.inputs["Strength"].default_value=.32
    scene.render.threads_mode='FIXED'
    scene.render.threads=2
    materials={}
    for element,rgba in {"C":(.29,.64,.72,1),"N":(.12,.50,1,1),"O":(1,.24,.13,1),
                         "OH":(1,.65,.22,1),"bond":(.56,.63,.68,1)}.items():
        mat=bpy.data.materials.new("source-element-"+element)
        mat.diffuse_color=rgba
        mat.use_nodes=True
        bsdf=mat.node_tree.nodes.get("Principled BSDF")
        bsdf.inputs["Base Color"].default_value=rgba
        bsdf.inputs["Roughness"].default_value=.32
        bsdf.inputs["Metallic"].default_value=.25
        materials[element]=mat
    positions=[Vector(a["xyz"]) for a in packet["atoms"]]
    for atom in packet["atoms"]:
        i=atom["id"]
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10,radius=.29,location=positions[i])
        obj=bpy.context.object
        obj.name="RDKit_atom_"+str(i)
        obj.data.materials.append(materials["OH" if i==packet["highlightAtomIndex"] else atom["element"]])
    for idx,bond in enumerate(packet["bonds"]):
        a,z=positions[bond["a"]],positions[bond["b"]]
        diff=z-a
        if diff.length<.001:
            fail("ZERO_LENGTH_BOND")
        transverse=diff.cross(Vector((0,0,1)))
        if transverse.length<.001:
            transverse=diff.cross(Vector((0,1,0)))
        transverse.normalize()
        kind=bond["kind"]
        count={"SINGLE":1,"DOUBLE":2,"TRIPLE":3,"AROMATIC":2}[kind]
        shift=[0.0] if count==1 else ([-.10,.10] if count==2 else [-.14,0.0,.14])
        for member,delta in enumerate(shift):
            bpy.ops.mesh.primitive_cylinder_add(vertices=10,radius=.051 if count>1 else .072,
                                               depth=diff.length,location=(a+z)/2+transverse*delta)
            obj=bpy.context.object
            obj.name="RDKit_"+kind+"_bond_"+str(idx)+"_"+str(member)
            obj.rotation_euler=diff.to_track_quat('Z','Y').to_euler()
            obj.data.materials.append(materials["bond"])
    focus=positions[packet["highlightAtomIndex"]] if direction=="hydroxyl-detail" else Vector((0,0,0))
    bpy.ops.object.camera_add(location=focus+Vector((6,-11,5)) if direction=="hydroxyl-detail" else (0,-17,5))
    camera=bpy.context.object
    camera.rotation_mode='QUATERNION'
    camera.rotation_quaternion=(focus-camera.location).to_track_quat('-Z','Y')
    if direction=="whole":
        # Roll the *camera*, never the chemistry: fit the long molecular axis to
        # the short-form portrait frame without tiny hero art or broken bonds.
        camera.rotation_quaternion=camera.rotation_quaternion @ Quaternion((0,0,1),math.pi/2)
    camera.data.type='ORTHO'
    camera.data.ortho_scale=7.5 if direction=="hydroxyl-detail" else 12.5
    scene.camera=camera
    if direction=="whole":
        # Portrait width is narrower than height: derive safe camera scale
        # from actual source-verified atom centers, not a decorative layout guess.
        bpy.context.view_layer.update()
        camera_inverse=camera.matrix_world.inverted()
        view_positions=[camera_inverse @ p for p in positions]
        span_x=max(p.x for p in view_positions)-min(p.x for p in view_positions)+.7
        span_y=max(p.y for p in view_positions)-min(p.y for p in view_positions)+.7
        aspect=scene.render.resolution_x/scene.render.resolution_y
        camera.data.ortho_scale=max(span_y/.77,span_x/(aspect*.74))
        bpy.context.view_layer.update()
    preview_scale=camera.data.ortho_scale
    for i,(pos,power,color,size) in enumerate([
        ((-4,-6,10),1100,(.60,.80,1),6),
        ((6,3,4),950,(1,.64,.42),5),
        ((-5,5,-2),700,(.56,.73,1),4),
    ]):
        bpy.ops.object.light_add(type='AREA',location=pos)
        obj=bpy.context.object
        obj.name="studio_light_"+str(i)
        obj.data.energy=power
        obj.data.color=color
        obj.data.shape='DISK'
        obj.data.size=size
        obj.rotation_euler=(focus-obj.location).to_track_quat('-Z','Y').to_euler()
    outdir=Path(outdir).resolve()
    outdir.mkdir(parents=True,exist_ok=True)
    output=outdir/("blender_7oh_"+direction+"_RESEARCH_ONLY.png")
    scene.render.filepath=str(output)
    bpy.ops.render.render(write_still=True)
    if not output.is_file():
        fail("RENDER_OUTPUT_MISSING")
    receipt={
        "status":"RESEARCH_STILL_RENDERED_NOT_CRAFT_APPROVED",
        "direction":direction,"renderEngine":"BLENDER_CYCLES_CPU",
        "resolution":[270,480],"samples":32,"cameraOrthoScale":round(preview_scale,4),
        "portraitRollDegrees":90 if direction=="whole" else 0,
        "isDeliberateDetailCrop":direction=="hydroxyl-detail",
        "packetSha256":expected_sha.lower(),"pngSha256":sha256(output),
        "renderWallSeconds":round(time.monotonic()-start,3),
        "costUSD":"UNKNOWN","scienceApproved":False,
        "craftApproved":False,"ownerPhoneApproved":False,
        "mayPublish":False,"productionIntegrated":False,
        "requiresExplicitSourceAndPixelReview":True
    }
    (outdir/("blender_7oh_"+direction+"_receipt.json")).write_text(json.dumps(receipt,indent=2)+"\n")
    return receipt

def main():
    ap=argparse.ArgumentParser()
    group=ap.add_mutually_exclusive_group(required=True)
    group.add_argument("--export",help="Export source-verified RDKit packet")
    group.add_argument("--validate-only",help="Check packet schema without Blender")
    group.add_argument("--render",help="Render exact-hash packet from headless Blender CPU")
    ap.add_argument("--expected-sha")
    ap.add_argument("--out")
    ap.add_argument("--direction",choices=DIRECTIONS)
    args=ap.parse_args(sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else sys.argv[1:])
    if args.export:
        result=export_verified_packet(args.export)
    elif args.validate_only:
        if not args.expected_sha or sha256(args.validate_only)!=args.expected_sha:
            fail("PACKET_SHA_MISMATCH")
        result=validate(json.loads(Path(args.validate_only).read_text()))
    else:
        if not args.out or not args.direction or not args.expected_sha:
            fail("MISSING_RENDER_ARGUMENT")
        result=render(args.render,args.expected_sha,args.out,args.direction)
    print(json.dumps(result,indent=2))

if __name__=="__main__":
    main()
