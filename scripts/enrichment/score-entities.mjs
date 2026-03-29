#!/usr/bin/env node
/**
 * Usage: node scripts/enrichment/score-entities.mjs
 */
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { REPO_ROOT } from './_shared.mjs';

const graphConfig = JSON.parse(readFileSync(join(REPO_ROOT, 'config', 'entity-graph.json'), 'utf8'));

console.log(
  JSON.stringify(
    {
      mode: 'skeleton',
      scoringFormula: 'sources*3 + effects + mechanism*2 + description*2 + contraindications',
      entityTypes: graphConfig.entityTypes ?? [],
      todo: 'Wire to live data quality signals in M2.',
    },
    null,
    2,
  ),
);
