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

apply_path = Path('scripts/data/apply-workbook-patch.mjs')
apply_text = apply_path.read_text()
apply_text = apply_text.replace('\n// TEMP_MERGE_RESOLVER_CHECKPOINT\n', '\n')
apply_text = apply_text.replace('\n// TEMP_DATA_REBUILD_CHECKPOINT\n', '\n')
apply_path.write_text(apply_text)

workflow = '''# Validates workbook patch records and applied values against the canonical workbook.
name: Workbook Patch Check

on:
  pull_request:
    branches:
      - main
    paths:
      - 'data-sources/workbook-patches/**'
      - 'data-sources/herb_monograph_master.xlsx'
      - 'scripts/data/apply-workbook-patch.mjs'
      - 'scripts/data/edit-entity-master-cell.mjs'
      - 'scripts/ci/validate-workbook-patches.mjs'
      - 'scripts/ci/validate-workbook-schema.mjs'
      - 'scripts/utils/read-workbook-exceljs.mjs'
      - '.github/workflows/workbook-patch-check.yml'
  workflow_dispatch:

concurrency:
  group: workbook-patch-check-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  validate:
    name: Validate workbook patches
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
          cache-dependency-path: package-lock.json

      - name: Install dependencies
        run: npm ci --silent

      - name: Verify Node engine
        run: npm run check:node --silent

      - name: Validate workbook schema
        run: npm run validate:workbook-schema --silent

      - name: Validate patch proposals against current workbook
        id: patch_check
        continue-on-error: true
        shell: bash
        run: |
          set +e
          node scripts/ci/validate-workbook-patches.mjs > workbook-patch-report.txt 2>&1
          status=$?
          cat workbook-patch-report.txt
          exit "$status"

      - name: Upload workbook patch report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: workbook-patch-report
          path: workbook-patch-report.txt
          if-no-files-found: error
          retention-days: 14

      - name: Upload workbook for approved application
        if: steps.patch_check.outcome == 'success'
        uses: actions/upload-artifact@v4
        with:
          name: workbook-source-for-application
          path: data-sources/herb_monograph_master.xlsx
          if-no-files-found: error
          retention-days: 1
          compression-level: 0

      - name: Enforce workbook patch result
        if: steps.patch_check.outcome != 'success'
        run: exit 1
'''
Path('.github/workflows/workbook-patch-check.yml').write_text(workflow)

run(['git', 'rm', '--ignore-unmatch', 'repair-diagnostic.txt'], check=False)
run(['git', 'rm', '.github/scripts/repair-workbook-patch.py'])
run(['git', 'add', 'scripts/data/apply-workbook-patch.mjs', '.github/workflows/workbook-patch-check.yml'])
run(['git', 'commit', '-m', 'chore: finalize PR conflict resolution'])
run(['git', 'push', 'origin', f'HEAD:{branch}'])

# Stop the historical repair workflow before its obsolete final commit step.
raise SystemExit(1)
