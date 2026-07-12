import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizePatch, detectFormat } from '../patch-normalize.mjs'
import { normalizedPatchSchema } from '../schema.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const fixtures = path.join(here, 'fixtures')

function load(name) {
  const raw = fs.readFileSync(path.join(fixtures, name), 'utf8')
  return normalizePatch({ filename: name, raw })
}

// Every normalized patch must satisfy the schema.
function expectValid(patches) {
  for (const patch of patches) {
    const { _warnings, ...clean } = patch
    const result = normalizedPatchSchema.safeParse(clean)
    if (!result.success) {
      throw new Error(`schema failed for ${clean.patch_id}: ${JSON.stringify(result.error.issues)}`)
    }
    void _warnings
  }
}

describe('detectFormat', () => {
  it('uses extension then content', () => {
    expect(detectFormat('x.json', '{}')).toBe('json')
    expect(detectFormat('x.yaml', 'a: 1')).toBe('yaml')
    expect(detectFormat('x.csv', 'a,b')).toBe('csv')
    expect(detectFormat('x.md', '# hi')).toBe('markdown')
    expect(detectFormat('noext', '{"a":1}')).toBe('json')
    expect(detectFormat('noext', '| a | b |\n| - | - |')).toBe('markdown')
  })
})

describe('canonical JSON patch', () => {
  const res = load('canonical.json')
  it('normalizes and keeps explicit operations + target', () => {
    expect(res.ok).toBe(true)
    expect(res.patches).toHaveLength(1)
    const p = res.patches[0]
    expect(p.patch_id).toBe('gpt-canonical-001')
    expect(p.target.slug).toBe('ashwagandha')
    expect(p.operations.map((o) => o.op)).toContain('update_field')
    expect(p.operations.map((o) => o.op)).toContain('add_claim')
    expect(p.sources[0].pmid).toBe('23439798')
    expectValid(res.patches)
  })
})

describe('loose JSON object with aliased fields', () => {
  const res = load('loose-object.json')
  it('resolves benefits→effects, mechanism_of_action→mechanisms, references→sources', () => {
    expect(res.ok).toBe(true)
    const p = res.patches[0]
    const fields = p.operations.map((o) => o.field)
    expect(fields).toContain('effects')
    expect(fields).toContain('mechanisms')
    // aliases become add_alias ops
    expect(p.operations.filter((o) => o.op === 'add_alias').length).toBeGreaterThanOrEqual(2)
    expect(p.sources.length).toBe(2)
    expect(p.sources.some((s) => s.pmid === '22228617')).toBe(true)
    expect(p.sources.some((s) => s.url && s.url.includes('19016404'))).toBe(true)
    expectValid(res.patches)
  })
})

describe('JSON array + JSONL yield one patch per record', () => {
  it('array → 2 patches', () => {
    const res = load('array.json')
    expect(res.patches).toHaveLength(2)
    expect(res.patches[0].target.slug).toBe('kava')
    // side_effects → add_safety_warning
    expect(res.patches[0].operations.some((o) => o.op === 'add_safety_warning')).toBe(true)
    expectValid(res.patches)
  })
  it('jsonl → 2 patches', () => {
    const res = load('lines.jsonl')
    expect(res.format).toBe('jsonl')
    expect(res.patches).toHaveLength(2)
    expect(res.patches[1].target.slug).toBe('lions-mane')
    expectValid(res.patches)
  })
})

describe('YAML with nested target and citation objects', () => {
  const res = load('patch.yaml')
  it('parses target + common_name→canonical_name + citations', () => {
    expect(res.ok).toBe(true)
    const p = res.patches[0]
    expect(p.target.slug).toBe('ginkgo-biloba')
    expect(p.target.canonical_name).toBe('Ginkgo Biloba')
    expect(p.sources.some((s) => s.pmid === '12456123')).toBe(true)
    // side_effects → safety warning
    expect(p.operations.some((o) => o.op === 'add_safety_warning')).toBe(true)
    expectValid(res.patches)
  })
})

describe('CSV table → one patch per row', () => {
  const res = load('table.csv')
  it('produces 2 patches with resolved fields', () => {
    expect(res.format).toBe('csv')
    expect(res.patches).toHaveLength(2)
    expect(res.patches[0].target.slug).toBe('turmeric')
    expect(res.patches[0].target.canonical_name).toBe('Turmeric')
    expect(res.patches[0].sources.some((s) => s.pmid === '29065496')).toBe(true)
    expectValid(res.patches)
  })
})

describe('Markdown table + structured Markdown sections', () => {
  it('table → one patch per row', () => {
    const res = load('table.md')
    expect(res.format).toBe('markdown')
    expect(res.patches).toHaveLength(2)
    expect(res.patches[0].target.slug).toBe('ashwagandha')
    expect(res.patches.every((p) => p.operations.some((o) => o.field === 'effects'))).toBe(true)
    expectValid(res.patches)
  })
  it('frontmatter + sections → single patch', () => {
    const res = load('sections.md')
    expect(res.ok).toBe(true)
    expect(res.patches).toHaveLength(1)
    const p = res.patches[0]
    expect(p.target.slug).toBe('schisandra')
    expect(p.generator).toBe('gpt-sections')
    const fields = p.operations.map((o) => o.field)
    expect(fields).toContain('canonical_name')
    expect(fields).toContain('effects')
    expect(fields).toContain('mechanisms')
    expectValid(res.patches)
  })
})

describe('safeguards', () => {
  it('flags evidence-bearing ops without sources for review', () => {
    const raw = JSON.stringify({ slug: 'x', entity_type: 'herb', safety: 'liver toxicity' })
    const res = normalizePatch({ filename: 'nosrc.json', raw })
    const p = res.patches[0]
    expect(p.operations.some((o) => o.op === 'add_safety_warning')).toBe(true)
    expect(p.requires_review).toBe(true)
    expect(p._warnings.some((w) => /without any source/.test(w))).toBe(true)
  })

  it('preserves unmapped fields as legacy updates and flags review', () => {
    const raw = JSON.stringify({ slug: 'x', entity_type: 'herb', totally_unknown_xyz: 'keep me' })
    const res = normalizePatch({ filename: 'unmapped.json', raw })
    const p = res.patches[0]
    expect(p.operations.some((o) => o.field === 'legacy.totally_unknown_xyz' && o.value === 'keep me')).toBe(true)
    expect(p.requires_review).toBe(true)
  })

  it('preserves explicit canonical data and legacy field paths', () => {
  const raw = JSON.stringify({
    patch_id: 'paths-1',
    target: { slug: 'x', entity_type: 'herb' },
    operations: [
      { op: 'update_field', field: 'legacy.forms', value: 'extract' },
      { op: 'update_field', field: 'legacy.evidence_risk_of_bias', value: 'high' },
      { op: 'update_field', field: 'data.custom_context', value: 'context' },
    ],
  })
  const res = normalizePatch({ filename: 'paths.json', raw })
  const fields = res.patches[0].operations.map((operation) => operation.field)
  expect(fields).toEqual([
    'legacy.forms',
    'legacy.evidence_risk_of_bias',
    'data.custom_context',
  ])
  expectValid(res.patches)
})

  it('flags destructive operations (deprecate/merge) for review', () => {
    const raw = JSON.stringify({ patch_id: 'd1', target: { slug: 'x', entity_type: 'herb' }, operations: [{ op: 'deprecate', field: 'description' }] })
    const res = normalizePatch({ filename: 'd.json', raw })
    expect(res.patches[0].requires_review).toBe(true)
  })

  it('flags missing target identifier', () => {
    const raw = JSON.stringify({ entity_type: 'herb', effects: 'x' })
    const res = normalizePatch({ filename: 't.json', raw })
    expect(res.patches[0]._warnings.some((w) => /no target identifier/.test(w))).toBe(true)
  })

  it('preserves an exact content hash of the raw input', () => {
    const raw = '{"slug":"x","entity_type":"herb","effects":"y"}'
    const res = normalizePatch({ filename: 'h.json', raw })
    expect(res.patches[0].original_hash).toMatch(/^[0-9a-f]{64}$/)
    // stable across re-normalization
    const res2 = normalizePatch({ filename: 'h.json', raw })
    expect(res2.patches[0].original_hash).toBe(res.patches[0].original_hash)
    expect(res2.patches[0].patch_id).toBe(res.patches[0].patch_id)
  })

  it('returns an error for unparseable input rather than throwing', () => {
    const res = normalizePatch({ filename: 'bad.json', raw: '{not json' })
    expect(res.ok).toBe(false)
    expect(res.error).toMatch(/parse failed/)
  })
})
