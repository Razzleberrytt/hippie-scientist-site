const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadArray(file, varName) {
  let code = fs.readFileSync(file, 'utf8');
  code = code
    .replace(/import[^\n]*\n/g, '')
    .replace(/export interface[\s\S]*?}\n/g, '')
    .replace(new RegExp(`export const ${varName}[^=]*=`), 'var ' + varName + '=')
    .replace(/as const;/g, ';')
    .replace(/export default.*\n/g, '');
  const script = new vm.Script(code + `\nmodule.exports = typeof ${varName} !== 'undefined' ? ${varName} : [];`);
  const ctx = { module: {} };
  script.runInNewContext(ctx);
  return ctx.module.exports;
}

function loadBatch(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code
    .replace(/import[^\n]*\n/g, '')
    .replace(/export const /g, 'var ')
    .replace(/as const;/g, ';');
  const script = new vm.Script(
    code +
      '\nmodule.exports = {\n' +
      '  newHerbs: typeof newHerbs !== "undefined" ? newHerbs : [],\n' +
      '  newCompounds: typeof newCompounds !== "undefined" ? newCompounds : []\n' +
      '};'
  );
  const ctx = { module: {} };
  script.runInNewContext(ctx);
  return ctx.module.exports;
}

const root = path.resolve(__dirname, '..');
const herbsPath = path.join(root, 'src/data/herbs/herbsfull.ts');
const compoundsPath = path.join(root, 'src/data/compounds/compounds.ts');
const batchDir = path.join(root, 'newHerbs');

let herbs = loadArray(herbsPath, 'herbs');
let compounds = loadArray(compoundsPath, 'compounds');

const herbKeySet = new Set(herbs.map(h => String(h.slug || h.name).toLowerCase()));
const compKeySet = new Set(compounds.map(c => String(c.name).toLowerCase()));

let addedHerbs = [];
let addedCompounds = [];

for (const file of fs.readdirSync(batchDir)) {
  if (!file.endsWith('.ts')) continue;
  const { newHerbs = [], newCompounds = [] } = loadBatch(path.join(batchDir, file));
  for (const herb of newHerbs) {
    const key = String(herb.slug || herb.name).toLowerCase();
    if (!herbKeySet.has(key)) {
      herbKeySet.add(key);
      herbs.push(herb);
      addedHerbs.push(herb);
    }
  }
  for (const cmp of newCompounds) {
    const key = String(cmp.name).toLowerCase();
    if (!compKeySet.has(key)) {
      compKeySet.add(key);
      compounds.push(cmp);
      addedCompounds.push(cmp);
    }
  }
}

herbs = herbs.sort((a, b) =>
  String(a.slug || a.name).localeCompare(String(b.slug || b.name))
);
compounds = compounds.sort((a, b) => a.name.localeCompare(b.name));

const herbHeader = `import type { Herb } from "../../types";\n\nexport const herbs: Herb[] = `;
const herbFooter = ` as const;\n`;
fs.writeFileSync(herbsPath, herbHeader + JSON.stringify(herbs, null, 2) + herbFooter);

const compHeader =
  `export interface CompoundEntry {\n  name: string\n  type: string\n  description: string\n  foundIn: string[]\n  psychoactivity: string\n  mechanismOfAction: string\n}\n\nexport const compounds: CompoundEntry[] = `;
const compFooter = `\n\nexport default compounds\n`;
fs.writeFileSync(compoundsPath, compHeader + JSON.stringify(compounds, null, 2) + compFooter);

console.log(`Added ${addedHerbs.length} herbs and ${addedCompounds.length} compounds.`);

const summary = [
  '# Merge Summary',
  '',
  `Herbs added: ${addedHerbs.length}`,
  ...addedHerbs.map(h => `- ${h.name}`),
  '',
  `Compounds added: ${addedCompounds.length}`,
  ...addedCompounds.map(c => `- ${c.name}`),
  ''
].join('\n');
fs.writeFileSync(path.join(batchDir, 'MERGE_SUMMARY.md'), summary);
