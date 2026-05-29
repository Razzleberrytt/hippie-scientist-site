import fs from 'fs';
import { getRuntimeVisibility } from '../lib/runtime-visibility.ts';

const compounds = JSON.parse(fs.readFileSync('public/data/compounds-summary.json', 'utf8'));

let canIndexCount = 0;
let canRenderCount = 0;

compounds.forEach(c => {
  const vis = getRuntimeVisibility(c);
  if (vis.canIndex) canIndexCount++;
  if (vis.canRender) canRenderCount++;
});

console.log(`Summary index compounds: ${compounds.length}
- canRender: ${canRenderCount}
- canIndex: ${canIndexCount}`);
