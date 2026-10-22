#!/usr/bin/env python3
"""Validate project-local instruction skills (not runtime functionality)."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent
EXPECTED = {
    'ths-operating-system', 'em-build-repair', 'em-verify-ship',
    'em-tiktok-producer', 'ths-evidence-integrity', 'ths-publishing-seo-qa',
    'ths-growth-economics', 'ths-scheduler-reliability',
    'firstcert-regulatory-gate', 'ths-skill-maintainer',
}
found = {p.parent.name: p for p in ROOT.glob('*/SKILL.md')}
errors = []
if set(found) != EXPECTED:
    errors.append(f'inventory mismatch: missing={sorted(EXPECTED - set(found))}, extra={sorted(set(found) - EXPECTED)}')
for name, path in sorted(found.items()):
    data = path.read_text(encoding='utf-8')
    if not data.startswith('---\n'):
        errors.append(f'{name}: missing YAML frontmatter')
        continue
    parts = data.split('---', 2)
    if len(parts) < 3:
        errors.append(f'{name}: unclosed frontmatter')
        continue
    fm = parts[1]
    for field in ('name', 'version', 'description', 'owner'):
        if not re.search(rf'(?m)^{field}:\s*\S+', fm):
            errors.append(f'{name}: missing frontmatter field {field}')
    value = re.search(r'(?m)^name:\s*(\S+)', fm)
    if value and value.group(1) != name:
        errors.append(f'{name}: frontmatter name mismatch ({value.group(1)})')
    if len(data.splitlines()) < 10:
        errors.append(f'{name}: too short')
    if not re.search(r'(?i)\b(block|blocked|hold|fail|stop|unknown)\b', data):
        errors.append(f'{name}: no stop/fail-closed guidance')
    for ref in re.findall(r'\x60(\.\./[^\x60]+?SKILL\.md)\x60', data):
        if not (path.parent / ref).resolve().is_file():
            errors.append(f'{name}: broken sibling skill reference {ref}')
if errors:
    for error in errors:
        print('FAIL:', error)
    sys.exit(1)
print(f'PASS — {len(found)} skills, version headers, names and relative references validated (instructions only).')
