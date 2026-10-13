#!/usr/bin/env python3
"""Opt-in research-only jargon-first-use screening. NOT a readability or science certificate."""
from __future__ import annotations
import argparse, json, re
from pathlib import Path

# Give specialist vocabulary its ordinary meaning within the nearby spoken context.
TERMS = {
    "hydroxyl": ("oxygen", "hydrogen"),
    "PubChem": ("chemistry", "database"),
    "receptor": ("cell",),
    "3d model": ("computer", "shape"),
    "computed conformer": ("computer", "shape"),
    "randomized controlled trial": ("chance", "group"),
    "statistically significant": ("unlikely", "difference"),
    "CID": ("record", "number"),
}
ADDITIONAL_TERMS = {
    "ETKDG": ("computer", "method"),
    "MMFF": ("computer", "model"),
    "locant": ("number", "position"),
    "conformer": ("possible", "shape"),
    "pharmacodynamics": ("effects", "body"),
}
OVERCLAIM_PATTERNS = (
    (r'(?i)\b(?:the|this) (?:molecule|molecular) (?:picture|diagram|drawing) proves\b',
     "diagram cannot by itself establish an effect on people"),
    (r'(?i)\bcomputer model (?:proves|shows exactly) what (?:you|people) feel\b',
     "computed model cannot establish a human experience"),
)

def normalise(text):
    text = re.sub(r'\*{1,2}|_{1,2}', '', text)
    text = re.sub(r'(?<!\w)3[ -]?d\b', '3d model', text, flags=re.IGNORECASE)
    return re.sub(r'\s+', ' ', text).strip()

def audit_public_text(text):
    text = normalise(text)
    failures = []
    for term, required in TERMS.items():
        found = re.search(r'(?i)\b'+re.escape(term)+r'\b', text)
        if not found:
            continue
        start, end = found.span()
        nearby = text[max(0,start-170):min(len(text),end+220)].casefold()
        absent = [t for t in required if t.casefold() not in nearby]
        if absent:
            failures.append({'term':term,'reason':'MISSING_NEARBY_PLAIN_LANGUAGE_EXPLANATION','missing':absent})
    for term, required in ADDITIONAL_TERMS.items():
        found = re.search(r'(?i)\b'+re.escape(term)+r'\b', text)
        if not found:
            continue
        start, end = found.span()
        nearby = text[max(0,start-170):min(len(text),end+220)].casefold()
        if not all(phrase.casefold() in nearby for phrase in required):
            failures.append({'term':term,'reason':'SPECIALIST_TERM_WITHOUT_PUBLIC_TEACHING','missing':list(required)})
    for pattern,description in OVERCLAIM_PATTERNS:
        if re.search(pattern,text):
            failures.append({'term':'scientific certainty','reason':'INFERRED_HUMAN_EFFECT_FROM_DIAGRAM','fix':description})
    return {
        'status':'NEEDS_EDITORIAL_REVIEW' if failures else 'SCREENED_FOR_NAMED_TERMS_ONLY',
        'flags':failures,
        'automaticApproval':False,'humanComprehensionReviewed':False,
        'qualifiedScienceReviewed':False,'videoCraftApproved':False,'releaseApproved':False,
        'limit':'Only named term patterns are checked; a person must still examine the full public-facing script.'
    }

def spoken_section(markdown):
    match=re.search(r'(?im)^## Suggested spoken script[^\n]*$',markdown)
    if not match:
        raise ValueError('PUBLIC_SPOKEN_SECTION_MISSING')
    rest=markdown[match.end():]
    boundary=re.search(r'(?m)^## ',rest)
    return rest[:boundary.start()] if boundary else rest

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('file',type=Path)
    parser.add_argument('--spoken-section-only',action='store_true')
    args=parser.parse_args()
    data=args.file.read_text()
    if args.spoken_section_only:data=spoken_section(data)
    report=audit_public_text(data)
    print(json.dumps(report,indent=2))
    raise SystemExit(1 if report['flags'] else 0)
