"""Source-locked connection-by-connection visual teaching cue (research only).

The glowing markers identify existing verified RDKit bond midpoints from the
actual PubChem 7-hydroxymitragynine graph. They are not moving atoms, reactions,
physical motion, new chemical bonds, a biological mechanism or claims of effect.
"""
from collections import deque
import math

CID_7OH=44301524
MAX_BONDS=6
ORIGINAL_DIAGRAM=(1200,900)


def _validate(asset):
    if getattr(asset.get("source"),"pubchem_cid",None)!=CID_7OH:
        raise ValueError("BOND_STORY_HOLD:WRONG_SOURCE_ID")
    mol=asset.get("mol")
    nodes=asset.get("diagramAtomXY")
    free=asset.get("oh")
    if mol is None or not isinstance(nodes,list) or len(nodes)!=mol.GetNumAtoms():
        raise ValueError("BOND_STORY_HOLD:MISSING_VERIFIED_DIAGRAM")
    if not isinstance(free,list) or len(free)!=1:
        raise ValueError("BOND_STORY_HOLD:FREE_OH_NOT_VERIFIED")
    root=free[0]
    atom=mol.GetAtomWithIdx(root)
    if atom.GetSymbol()!="O" or atom.GetTotalNumHs()!=1:
        raise ValueError("BOND_STORY_HOLD:WRONG_HYDROXYL_ROOT")
    for xy in nodes:
        if (not isinstance(xy,(tuple,list)) or len(xy)!=2
            or not all(isinstance(v,(int,float)) and math.isfinite(v) for v in xy)
            or not (0<=xy[0]<=ORIGINAL_DIAGRAM[0] and 0<=xy[1]<=ORIGINAL_DIAGRAM[1])):
            raise ValueError("BOND_STORY_HOLD:UNSAFE_PINNED_ATOM_COORDINATES")
    return mol,nodes,root


def verified_bond_path(asset):
    """A reproducible connected six-bond walk from the added hydroxyl.

    Breadth-first paths are derived from *actual* RDKit heavy-atom edges, with
    indices used solely for deterministic tie-breaking. No hypothetical edge.
    """
    mol,points,start=_validate(asset)
    parents={start:None}
    queue=deque([start])
    while queue:
        current=queue.popleft()
        neighbours=sorted(n.GetIdx() for n in mol.GetAtomWithIdx(current).GetNeighbors())
        for n in neighbours:
            if n not in parents:
                parents[n]=current
                queue.append(n)
    if len(parents)!=mol.GetNumAtoms():
        raise ValueError("BOND_STORY_HOLD:DISCONNECTED_GRAPH")
    def route(node):
        path=[node]
        while parents[path[-1]] is not None:
            path.append(parents[path[-1]])
        return path[::-1]
    candidates=[route(n) for n in parents]
    longest=max(candidates,key=lambda p:(len(p),-p[-1]))
    if len(longest)<MAX_BONDS+1:
        raise ValueError("BOND_STORY_HOLD:INSUFFICIENT_VERIFIED_ATOM_PATH")
    selected=longest[:MAX_BONDS+1]
    for a,b in zip(selected,selected[1:]):
        if mol.GetBondBetweenAtoms(a,b) is None:
            raise ValueError("BOND_STORY_HOLD:PATH_HAS_UNVERIFIED_BOND")
    return tuple(zip(selected,selected[1:]))


def research_science_camera(progress):
    """One science-safe digital pullback for the *existing* full RDKit drawing.

    Complete source graph remains in view at every time. The same geometry
    drives both the actual diagram pixels and every atom/bond annotation.
    Camera reframing does not change bond order, chemistry or source claims.
    """
    if (not isinstance(progress,(int,float)) or not math.isfinite(progress)
        or not 0<=progress<=1):
        raise ValueError("BOND_STORY_HOLD:INVALID_SHOT_PROGRESS")
    x=25+80*progress
    y=590+40*progress
    width=880-160*progress
    height=660-120*progress
    if not (20<=x and x+width<=950 and 570<=y and y+height<=1260):
        raise ValueError("BOND_STORY_HOLD:UNSAFE_PORTRAIT_CAMERA")
    if abs(width/height-4/3)>1e-7:
        raise ValueError("BOND_STORY_HOLD:CHEMICAL_DIAGRAM_ASPECT_CHANGED")
    return x,y,width,height


def mapped_atom_point(source_xy, scene_progress, image_size):
    if (not isinstance(scene_progress,(float,int)) or not math.isfinite(scene_progress)
        or not 0<=scene_progress<=1):
        raise ValueError("BOND_STORY_HOLD:INVALID_SHOT_PROGRESS")
    w,h=image_size
    if (w,h) not in ((1080,1920),(540,960)):
        raise ValueError("BOND_STORY_HOLD:UNSUPPORTED_FILM_GEOMETRY")
    x,y=source_xy
    scale=w/1080
    dx,dy,dw,dh=research_science_camera(scene_progress)
    mapped=((dx+x*dw/1200)*scale,
            (dy+y*dh/900)*scale)
    if not (20*scale<=mapped[0]<=940*scale and 580*scale<=mapped[1]<=1260*scale):
        raise ValueError("BOND_STORY_HOLD:MARKER_OUTSIDE_SCIENCE_STAGE")
    return mapped


def selected_bond_count(seconds, start_sec, end_sec, *, max_bonds=MAX_BONDS):
    if (not all(isinstance(t,(float,int)) and math.isfinite(t)
                for t in (seconds,start_sec,end_sec))
        or not start_sec<end_sec or max_bonds!=MAX_BONDS):
        raise ValueError("BOND_STORY_HOLD:INVALID_ACOUSTIC_TIMELINE")
    if seconds<start_sec:
        return 0
    phase=max(0.,min(1.,(seconds-start_sec)/(end_sec-start_sec)))
    # Exact spoken-step boundaries may evaluate to 1.0000000000000002
    # because of binary floating-point rounding. A premature +1 marker
    # would spoil the intended order. Tolerate only sub-frame epsilon.
    return min(max_bonds,max(0,math.ceil(phase*max_bonds-1e-9)))


def draw_existing_bond_connections(image, asset, *, seconds, scene,
                                    scene_progress):
    """Emit a cumulative sequence of bond-midpoint cues anchored to speech."""
    from PIL import ImageDraw
    if scene.get("id")!="sentence_3":
        raise ValueError("BOND_STORY_HOLD:WRONG_NARRATION_SCENE")
    words=[cue for cue in scene.get("captionWords",[])
           if cue.get("text","").casefold().strip(".,!?")=="molecular"]
    if len(words)!=1:
        raise ValueError("BOND_STORY_HOLD:MISSING_UNIQUE_SPOKEN_GRAPH_CUE")
    end=float(scene["endSec"])
    begin=float(words[0]["startSec"])
    count=selected_bond_count(seconds,begin,end)
    if not count:
        return 0
    path=verified_bond_path(asset)
    points=asset["diagramAtomXY"]
    draw=ImageDraw.Draw(image,"RGBA")
    scale=image.width/1080
    for a,b in path[:count]:
        ax,ay=mapped_atom_point(points[a],scene_progress,image.size)
        bx,by=mapped_atom_point(points[b],scene_progress,image.size)
        x,y=(ax+bx)/2,(ay+by)/2
        r=max(5,round(11*scale))
        draw.ellipse((x-r,y-r,x+r,y+r),outline=(255,193,100,225),
                     width=max(2,round(3*scale)))
        # The *newly reached real atom* becomes the only teal atom marker.
        # Generic scatter across unrelated atoms obscured the lesson; this
        # keeps a visible connected path with at most six cyan endpoints.
        px,py=mapped_atom_point(points[b],scene_progress,image.size)
        atom_radius=max(4,round(7*scale))
        draw.ellipse((px-atom_radius,py-atom_radius,
                      px+atom_radius,py+atom_radius),
                     outline=(96,216,199,215),
                     width=max(2,round(2*scale)))
        # Source-bound stationary bond and atom cues; never moving or
        # synthesizing atoms, forming new bonds or effect arrows.
    return count
