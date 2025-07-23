const fs = require('fs');
const JSON5 = require('json5');

const src = fs.readFileSync('masterHerbsAndCompounds.ts', 'utf8');

const exportRegex = /export const\s+([\w$]+)(?:\s*:\s*[^=]+)?\s*=\s*(\[[\s\S]*?\]);/g;
let herbs = [];
let compounds = [];
let match;
while ((match = exportRegex.exec(src))) {
  const arrText = match[2];
  try {
    const arr = JSON5.parse(arrText);
    if (!Array.isArray(arr)) continue;
    if (arr.length === 0) continue;
    const isCompound = arr[0].foundIn && !arr[0].slug;
    if (isCompound) {
      compounds = compounds.concat(arr);
    } else {
      herbs = herbs.concat(arr);
    }
  } catch (err) {
    console.error('Failed to parse array', match[1], err.message);
  }
}

console.log(`Parsed ${herbs.length} herbs and ${compounds.length} compounds`);

if (!fs.existsSync('src/data')) fs.mkdirSync('src/data');
if (!fs.existsSync('src/data/herbs')) fs.mkdirSync('src/data/herbs', { recursive: true });
if (!fs.existsSync('src/data/compounds')) fs.mkdirSync('src/data/compounds', { recursive: true });

fs.writeFileSync(
  'src/data/herbs/herbsfull.ts',
  'import type { Herb } from "../../types";\n\nexport const herbs: Herb[] = ' +
    JSON.stringify(herbs, null, 2) +
    ' as Herb[];\n'
);

fs.writeFileSync(
  'src/data/compounds/compounds.ts',
  'export interface CompoundEntry {\n  name: string;\n  type: string;\n  description?: string;\n  foundIn: string[];\n  psychoactivity?: string;\n  mechanismOfAction?: string;\n}\n\nexport const compounds: CompoundEntry[] = ' +
    JSON.stringify(compounds, null, 2) +
    ';\n'
);
