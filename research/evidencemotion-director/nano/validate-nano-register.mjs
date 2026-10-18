// Research-only EvidenceMotion nano-task structural validation.
// Run: node research/evidencemotion-director/nano/validate-nano-register.mjs
// Read-only. Does not change, verify completion of, or accept any workcard.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const atomicDir = path.resolve(here, '../atomic')
const spec = Object.freeze([
  ['01-operating-science.md', 38, 245, 735],
  ['02-narration-timing.md', 44, 289, 867],
  ['03-direction-craft.md', 52, 332, 996],
  ['04-trust-mobile.md', 55, 373, 1119],
  ['05-canonical-promotion.md', 54, 351, 1053],
])
const srcHeading = /^### (EM-\d{3}\.\d{2}) — (.+)$/gm
const srcCard = /^- \[[ x]\] \*\*(EM-\d{3}\.\d{2}\.[USOXTNR])\*\* — (.+)$/gm
const nanoHeading = /^### (EM-\d{3}\.\d{2}) — (.+)$/gm
const nanoCard = /^- \[[ x]\] `?(EM-\d{3}\.\d{2}\.[USOXTNR]\.0[123])`? — \*\*.+?:\*\* /gm
const nanoContract = /^\*\*(EM-\d{3}\.\d{2}\.[USOXTNR]) — Existing atomic contract:\*\* (.+)$/gm
const present = (s, re) => [...s.matchAll(new RegExp(re.source, 'gm'))]
const unique = (xs, label) => {
  const set = new Set(xs)
  assert.equal(set.size, xs.length, `Duplicate ${label}`)
}
let totalTasks = 0
let totalAtomic = 0
let totalNano = 0
let totalNegative = 0

for (const [file, wantTask, wantAtom, wantNano] of spec) {
  const original = fs.readFileSync(path.join(atomicDir, file), 'utf8')
  const nano = fs.readFileSync(path.join(here, file), 'utf8')
  assert.match(nano, /RESEARCH-ONLY NON-SCORING INSTRUCTION LAYER/)
  assert.match(nano, /mayPublish=false/)
  const originals = present(original, srcHeading).map(m => [m[1], m[2]])
  const nanoTasks = present(nano, nanoHeading).map(m => [m[1], m[2]])
  const sourceContracts = present(original, srcCard).map(m => [m[1], m[2]])
  const atoms = sourceContracts.map(([id]) => id)
  const nanos = present(nano, nanoCard).map(m => m[1])
  const copiedContracts = present(nano, nanoContract).map(m => [m[1], m[2]])
  assert.equal(originals.length, wantTask, `Source task count changed: ${file}`)
  assert.equal(atoms.length, wantAtom, `Source atom count changed: ${file}`)
  assert.equal(nanos.length, wantNano, `Nano count changed: ${file}`)
  assert.deepEqual(nanoTasks, originals, `Task title/order drift: ${file}`)
  unique(atoms, `original atomic IDs ${file}`)
  unique(nanos, `nano IDs ${file}`)
  const expected = atoms.flatMap(id => [`${id}.01`, `${id}.02`, `${id}.03`])
  assert.deepEqual(nanos, expected, `Nano ID/order/parent drift: ${file}`)
  assert.deepEqual(copiedContracts, sourceContracts, `Atomic contract wording/order drift: ${file}`)
  const threePerCard = nano.match(/^- \[[ x]\] `EM-\d{3}\.\d{2}\.[USOXTNR]\.0[123]`/gm) || []
  assert.equal(threePerCard.length, nanos.length)
  totalTasks += originals.length
  totalAtomic += atoms.length
  totalNano += nanos.length
  totalNegative += atoms.filter(id => id.endsWith('.N')).length
  process.stdout.write(`OK ${file}: ${originals.length} source tasks / ${atoms.length} atomic cards / ${nanos.length} nano instructions\n`)
}
assert.deepEqual([totalTasks, totalAtomic, totalNegative, totalNano], [243, 1590, 132, 4770])
process.stdout.write('PASS 46 canonical milestones / 243 subtasks / 1,590 atomic cards (132 N) / 4,770 nano instruction steps\n')
process.stdout.write('NOTICE: structural registry validation only; zero newly accepted atomic/canonical/film/phone/publishing credit\n')
