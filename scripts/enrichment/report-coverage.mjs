#!/usr/bin/env node
import { join } from 'node:path';
import { ensureDir, nowIso, REPO_ROOT } from './_shared.mjs';
import { writeFileSync } from 'node:fs';

const reportsDir = join(REPO_ROOT, 'ops', 'reports');
ensureDir(reportsDir);

const report = {
  generatedAt: nowIso(),
  mode: 'skeleton',
  summary: {
    patchesPending: 0,
    entitiesCovered: 0,
  },
  todo: 'Implement coverage aggregation from applied manifests and entity graph in M2.',
};

const target = join(reportsDir, 'coverage-latest.json');
writeFileSync(target, JSON.stringify(report, null, 2));
console.log(`[report-coverage] Wrote ${target}`);
