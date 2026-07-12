from pathlib import Path
import subprocess
import sys


def run(args, *, check=True):
    result = subprocess.run(args, text=True, capture_output=True)
    if result.stdout:
        print(result.stdout, end='')
    if result.stderr:
        print(result.stderr, end='', file=sys.stderr)
    if check and result.returncode != 0:
        raise SystemExit(result.returncode)
    return result


branch = run(['git', 'branch', '--show-current']).stdout.strip()
if branch != 'workbook-patch-pilot-citicoline-20260710':
    raise SystemExit(f'Unexpected branch: {branch}')

run(['git', 'config', 'user.name', 'github-actions[bot]'])
run(['git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'])

path = Path('scripts/data/apply-workbook-patch.mjs')
text = path.read_text()
text = text.replace('\n// TEMP_MERGE_RESOLVER_CHECKPOINT\n', '\n')
text = text.replace('\n// TEMP_DATA_REBUILD_CHECKPOINT\n', '\n')
path.write_text(text)

run(['git', 'rm', '.github/scripts/repair-workbook-patch.py'])
run(['git', 'add', 'scripts/data/apply-workbook-patch.mjs'])
run(['git', 'commit', '-m', 'chore: remove conflict-resolution checkpoint'])
run(['git', 'push', 'origin', f'HEAD:{branch}'])

# Stop the historical repair workflow before its obsolete final step.
raise SystemExit(1)
