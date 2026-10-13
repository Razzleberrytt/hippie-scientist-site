#!/usr/bin/env python3
"""Research-only source-locked 7OH molecular hero preview.
No claims about experimental conformations, binding pose, effects, or efficacy.
Python deps: rdkit, vtk, numpy, pillow, opencv-python; executable ffmpeg.
Manual execution only; production workflows never import this module.
"""
import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path

import cv2
import numpy as np
import vtk
from PIL import Image, ImageDraw, ImageFont
from rdkit import Chem
from rdkit.Chem import AllChem
from vtk.util.numpy_support import vtk_to_numpy
from validated_7oh_chemistry import (
    FORMULA, INCHIKEY, PUBCHEM_CID, PUBCHEM_URL,
    FDA_GSRS_URL, verified_graph,
)

ART_SHA256 = "4516b902806630ba97941636fbe11a5db8859b8c19a5089adaedbde6d497090e"
WIDTH, HEIGHT, FPS, FRAMES = 480, 854, 12, 72
CONFORMER_SEED = 708315

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def smooth(t):
    t = max(0, min(1, t))
    return t * t * (3 - 2 * t)

def mesh_sphere(ren, position, radius, color):
    src = vtk.vtkSphereSource()
    src.SetRadius(radius)
    src.SetThetaResolution(16)
    src.SetPhiResolution(16)
    mapper = vtk.vtkPolyDataMapper()
    mapper.SetInputConnection(src.GetOutputPort())
    actor = vtk.vtkActor()
    actor.SetMapper(mapper)
    actor.SetPosition(*map(float, position))
    prop = actor.GetProperty()
    prop.SetColor(*color)
    prop.SetSpecular(.94)
    prop.SetSpecularPower(96)
    prop.SetAmbient(.11)
    ren.AddActor(actor)
    return actor

def mesh_bond(ren, point_a, point_b, radius, color):
    # Tube endpoints are the RDKit conformer atom centres. NO free-handed chemistry.
    line = vtk.vtkLineSource()
    line.SetPoint1(*map(float, point_a))
    line.SetPoint2(*map(float, point_b))
    tube = vtk.vtkTubeFilter()
    tube.SetInputConnection(line.GetOutputPort())
    tube.SetNumberOfSides(10)
    tube.SetRadius(radius)
    tube.CappingOn()
    mapper = vtk.vtkPolyDataMapper()
    mapper.SetInputConnection(tube.GetOutputPort())
    actor = vtk.vtkActor()
    actor.SetMapper(mapper)
    prop = actor.GetProperty()
    prop.SetColor(*color)
    prop.SetSpecular(.84)
    prop.SetSpecularPower(66)
    ren.AddActor(actor)

def render(source, outdir):
    source = Path(source).resolve()
    outdir = Path(outdir).resolve()
    if not source.is_file() or sha(source) != ART_SHA256:
        raise ValueError("Source PNG is not the approved nonfactual botanical crop")
    outdir.mkdir(parents=True, exist_ok=True)
    folder = outdir / "frames"
    folder.mkdir(exist_ok=True)

    graph, hydroxyl = verified_graph()
    mol = Chem.AddHs(graph)
    embedding = AllChem.ETKDGv3()
    embedding.randomSeed = CONFORMER_SEED
    embedding.numThreads = 1
    if AllChem.EmbedMolecule(mol, embedding) != 0:
        raise ValueError("RDKit could not embed a deterministic conformer")
    if AllChem.MMFFOptimizeMolecule(mol, maxIters=240) < 0:
        raise ValueError("RDKit MMFF refinement failed")
    if Chem.MolToInchiKey(Chem.RemoveHs(mol)) != INCHIKEY:
        raise ValueError("Generated conformer no longer matches verified chemical identity")

    heavy = graph.GetNumAtoms()
    coords = np.array(mol.GetConformer().GetPositions(), dtype=np.float64)
    coords -= coords[:heavy].mean(axis=0)
    radians = math.radians(67)
    rotate = np.array([
        [math.cos(radians), -math.sin(radians), 0],
        [math.sin(radians), math.cos(radians), 0],
        [0, 0, 1],
    ])
    coords = coords @ rotate.T

    renderer = vtk.vtkRenderer()
    renderer.SetBackground(.016, .031, .055)
    window = vtk.vtkRenderWindow()
    window.SetOffScreenRendering(1)
    window.SetMultiSamples(0)
    window.SetSize(520, 630)
    window.AddRenderer(renderer)
    camera = renderer.GetActiveCamera()
    camera.SetViewAngle(31)
    camera.SetViewUp(0, 1, 0)
    for position, power, color in [
        ((-6, 6, 10), 1.35, (.48, .84, 1)),
        ((6, 4, -8), 1.35, (1, .53, .18)),
        ((1, -8, 3), .65, (.66, .86, 1)),
    ]:
        light = vtk.vtkLight()
        light.SetPosition(*position)
        light.SetFocalPoint(0, 0, 0)
        light.SetColor(*color)
        light.SetIntensity(power)
        renderer.AddLight(light)

    styles = {"C": ((.60, .74, .77), .305),
              "N": ((.18, .74, .99), .355),
              "O": ((1, .36, .22), .360)}
    for i in range(heavy):
        element = graph.GetAtomWithIdx(i).GetSymbol()
        color, radius = styles[element]
        mesh_sphere(renderer, coords[i], radius, color)
    for bond in graph.GetBonds():
        a, b = bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()
        mesh_bond(renderer, coords[a], coords[b], .106, (.57, .70, .73))
        if bond.GetBondTypeAsDouble() >= 1.9:
            direction = coords[b] - coords[a]
            offset = np.cross(direction, [0, 0, 1.])
            if np.linalg.norm(offset) < .001:
                offset = np.cross(direction, [0, 1., 0])
            offset = .16 * offset / np.linalg.norm(offset)
            mesh_bond(renderer, coords[a] + offset, coords[b] + offset,
                      .055, (.32, .54, .63))
    halo = mesh_sphere(renderer, coords[hydroxyl], .48, (1, .75, .2))
    halo.GetProperty().SetOpacity(0)

    background = np.asarray(Image.open(source).convert("RGB").resize((WIDTH, HEIGHT)))
    background = cv2.GaussianBlur(background, (0, 0), 42)
    background = np.uint8(np.clip(
        background.astype(np.float32)*.13 + np.array([4, 12, 21]), 0, 255))
    yy, xx = np.mgrid[0:HEIGHT, 0:WIDTH]
    vignette = np.clip(
        1 - .32 * (((xx-WIDTH/2)/(WIDTH*.6))**2 +
                   ((yy-HEIGHT/2)/(HEIGHT*.73))**2), .54, 1.)
    font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    bold_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    if not Path(font_path).exists():
        raise FileNotFoundError("This CPU research renderer needs DejaVu font")
    font = lambda size, strong=False: ImageFont.truetype(
        bold_path if strong else font_path, size)

    for n in range(FRAMES):
        t = n / FPS
        angle = math.radians(-4 + 8*smooth((t-.65)/4.5))
        # Two shots, each with ONE purpose-driven camera move:
        # wide establishing orbit then a hard cut to a real hydroxyl-site macro.
        # This is visual emphasis, not synthesis, reaction or receptor binding.
        if t < 2.75:
            radius = 31.0
            camera.SetPosition(math.sin(angle)*radius, 3.3,
                               math.cos(angle)*radius)
            camera.SetFocalPoint(0, 0, 0)
        else:
            progress = smooth((t-2.75)/2.4)
            radius = 20.0 - 5.0*progress
            focus = coords[hydroxyl]
            camera.SetPosition(float(focus[0] + math.sin(.08)*radius),
                               float(focus[1] + 2.5),
                               float(focus[2] + math.cos(.08)*radius))
            camera.SetFocalPoint(*map(float, focus))
        halo.GetProperty().SetOpacity(.15*smooth((t-2.75)/.70))
        window.Render()
        capture = vtk.vtkWindowToImageFilter()
        capture.SetInput(window)
        capture.SetInputBufferTypeToRGB()
        capture.ReadFrontBufferOff()
        capture.Update()
        pixels = vtk_to_numpy(capture.GetOutput().GetPointData().GetScalars())
        pixels = pixels.reshape(630, 520, 3)[::-1].copy()
        pixels = cv2.resize(pixels, (WIDTH, 565)).astype(np.float32)
        x_grid, y_grid = np.meshgrid(
            np.linspace(-1, 1, WIDTH), np.linspace(-1, 1, 565))
        mask = np.minimum(
            np.clip((1-np.abs(x_grid))/.23, 0, 1),
            np.clip((1-np.abs(y_grid))/.18, 0, 1))*.97
        frame = background.copy().astype(np.float32)
        frame[142:707] = (
            frame[142:707]*(1-mask[:, :, None]) + pixels*mask[:, :, None])
        image = Image.fromarray(np.uint8(np.clip(
            frame*vignette[:, :, None], 0, 255)))
        drawing = ImageDraw.Draw(image, "RGBA")
        drawing.text((30, 47), "7-HYDROXYMITRAGYNINE",
                     fill=(242, 244, 243, 255), font=font(22, True))
        drawing.text((30, 83), "A REAL MOLECULAR GRAPH",
                     fill=(129, 214, 211, 248), font=font(16, True))
        if t > 3.8:
            alpha = int(255*smooth((t-3.8)/.75))
            drawing.rounded_rectangle((22, 692, WIDTH-22, 750),
                                      radius=15, fill=(6, 28, 43, int(alpha*.8)))
            drawing.text((39, 704), "FREE HYDROXYL GROUP (–OH)",
                         fill=(253, 203, 123, alpha), font=font(16, True))
        drawing.text((29, 787), "COMPUTED 3D CONFORMER • NOT DOCKING",
                     fill=(207, 220, 222, 255), font=font(11, True))
        drawing.text((29, 812), "PUBCHEM CID 44301524 • ILLUSTRATIVE GEOMETRY",
                     fill=(153, 184, 192, 255), font=font(10))
        # Project the actual RDKit hydroxyl oxygen into portrait pixels.
        # The marker is deterministic annotation, never generated chemistry.
        if t > 3.1:
            world_to_display = vtk.vtkCoordinate()
            world_to_display.SetCoordinateSystemToWorld()
            world_to_display.SetValue(*map(float, coords[hydroxyl]))
            px, py = world_to_display.GetComputedDisplayValue(renderer)
            atom_x = int(px * WIDTH/520)
            atom_y = int(142 + (630-py) * 565/630)
            if 18 < atom_x < WIDTH-18 and 190 < atom_y < 680:
                opacity = int(240*smooth((t-3.1)/.45))
                drawing.ellipse((atom_x-20, atom_y-20,
                                 atom_x+20, atom_y+20),
                                outline=(255, 211, 115, opacity), width=3)
                drawing.line([(atom_x+17, atom_y+15), (WIDTH-40, 694)],
                             fill=(250, 198, 109, int(.72*opacity)), width=2)
        image.save(folder / f"f{n:04d}.png")

    output = outdir / "verified_7oh_model_RESEARCH_ONLY_SILENT.mp4"
    subprocess.run([
        "ffmpeg", "-hide_banner", "-v", "error", "-y",
        "-framerate", str(FPS), "-i", str(folder/"f%04d.png"),
        "-frames:v", str(FRAMES), "-c:v", "libx264", "-preset", "veryfast",
        "-crf", "20", "-profile:v", "baseline", "-level", "3.1",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", str(output),
    ], check=True)
    result = {
        "source": PUBCHEM_URL, "secondSource": FDA_GSRS_URL,
        "pubchemCID": PUBCHEM_CID, "formula": FORMULA, "inchiKey": INCHIKEY,
        "conformer": "RDKit ETKDGv3 fixed-seed / MMFF computed hypothesis",
        "botanicalArtworkSha256": sha(source), "videoSha256": sha(output),
        "dimensions": [WIDTH, HEIGHT], "fps": FPS, "frames": FRAMES,
        "craftApproved": False, "ownerPhoneTested": False,
        "scienceUse": "Molecular identity only. No docking, potency or kinetics depicted.",
        "productionEligible": False,
    }
    (outdir / "receipt.json").write_text(json.dumps(result, indent=2)+"\n")
    return result

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--out", required=True)
    options = parser.parse_args()
    print(json.dumps(render(options.source, options.out), indent=2))
