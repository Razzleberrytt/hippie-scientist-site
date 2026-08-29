#!/usr/bin/env node
/**
 * Classify every `!important` declaration in styles/.
 *
 * `docs/design/PREMIUM_VISUAL_SYSTEM.md` names "adds a global `!important`
 * override to fight another canonical layer" as a reject condition. Each one
 * that exists is a declaration that lost an ordering or specificity fight and
 * was forced through, and each is a future regression: the next edit to a
 * canonical owner gets silently overridden.
 *
 * For each such declaration this reports which rule it fights — the competing
 * file, line and selector — and buckets it:
 *
 *   ordering    the winner belongs in a later-loading canonical owner; move the
 *               declaration there and drop the flag
 *   specificity the competing selector is over-specific; fix the selector
 *   genuine     a third-party or base style really does require it
 *   dead        no competing declaration exists any more; just delete the flag
 *
 * Load order is read from the actual import statements rather than assumed, so
 * the report stays correct when the cascade is reordered.
 *
 * Usage: node scripts/ci/audit-css-important.mjs [--markdown]
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const asMarkdown = process.argv.includes('--markdown')

/** Read the cascade order from the files that actually import stylesheets. */
function loadOrder() {
  const order = []
  const seen = new Set()
  const add = (p, scope) => {
    if (!p || seen.has(p)) return
    seen.add(p)
    order.push({ file: p, scope })
  }

  const layout = fs.readFileSync(path.join(ROOT, 'app', 'layout.tsx'), 'utf8')
  for (const m of layout.matchAll(/^import\s+['"](?:@\/)?(?:\.\/)?([^'"]+\.css)['"]/gm)) {
    const rel = m[1].startsWith('styles/') ? m[1] : `app/${m[1]}`
    add(rel, 'global')
  }

  // Route-scoped sheets load only where they are imported.
  const routeImporters = [
    'app/page.tsx', 'app/herbs/page.tsx', 'app/compounds/page.tsx',
    'app/herbs/[slug]/layout.tsx', 'app/compounds/[slug]/layout.tsx',
    'components/ui/ProfileTOC.tsx',
  ]
  for (const importer of routeImporters) {
    const abs = path.join(ROOT, importer)
    if (!fs.existsSync(abs)) continue
    const src = fs.readFileSync(abs, 'utf8')
    for (const m of src.matchAll(/^import\s+['"](?:@\/|\.\.\/\.\.\/)?([^'"]*styles\/[^'"]+\.css)['"]/gm)) {
      add(m[1].replace(/^.*?styles\//, 'styles/'), `route:${importer}`)
    }
  }
  return order
}

const ORDER = loadOrder()
const orderIndex = new Map(ORDER.map((o, i) => [o.file, i]))

/** Rough CSS specificity as [ids, classes, elements]. */
function specificity(selector) {
  const s = selector.replace(/\s*[>+~]\s*/g, ' ')
  const ids = (s.match(/#[\w-]+/g) || []).length
  const classes = (s.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+(\([^)]*\))?/g) || []).length
  const elements = (s.match(/(^|\s)[a-zA-Z][\w-]*/g) || []).length
  return [ids, classes, elements]
}
const cmpSpec = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]

/** Class/element tokens a selector keys on, for overlap detection. */
function tokens(selector) {
  const out = new Set()
  for (const m of selector.matchAll(/\.([\w-]+)/g)) out.add('.' + m[1])
  for (const m of selector.matchAll(/#([\w-]+)/g)) out.add('#' + m[1])
  for (const m of selector.matchAll(/(?:^|[\s>+~])([a-zA-Z][\w-]*)/g)) out.add(m[1].toLowerCase())
  return out
}

// ---- collect every declaration in every sheet ------------------------------

const files = ORDER.map((o) => o.file).filter((f) => fs.existsSync(path.join(ROOT, f)))
const decls = []

for (const rel of files) {
  const css = fs.readFileSync(path.join(ROOT, rel), 'utf8')
  let root
  try { root = postcss.parse(css, { from: rel }) } catch (e) {
    console.error(`[css-important] could not parse ${rel}: ${e.message}`)
    continue
  }
  root.walkDecls((decl) => {
    const rule = decl.parent
    if (!rule || rule.type !== 'rule') return
    const media = []
    let p = rule.parent
    while (p && p.type === 'atrule') { media.unshift(`@${p.name} ${p.params}`); p = p.parent }
    for (const selector of rule.selectors || [rule.selector]) {
      decls.push({
        file: rel,
        line: decl.source?.start?.line ?? 0,
        selector: selector.trim(),
        prop: decl.prop,
        value: decl.value,
        important: Boolean(decl.important),
        media: media.join(' / '),
        order: orderIndex.get(rel) ?? 999,
        spec: specificity(selector),
        tokens: tokens(selector),
      })
    }
  })
}

// ---- Tailwind utilities, which live only in the built output ---------------
//
// Tailwind v4 generates its utilities at build time. They are not in styles/ or
// app/globals.css, so an `!important` that exists purely to beat `.mt-4` or
// `.grid` looks like it has no competitor at all. Without this, the audit
// reported the prefers-reduced-motion reset, the print overrides and the
// focus-visible outlines as "dead" — stripping those would have been an
// accessibility regression, not a cleanup.
//
// Only single-class selectors are taken, which is the shape of a utility; the
// built bundle also contains compiled copies of the very files being audited,
// and counting those would make every declaration look contested.
const UTILITY_SELECTOR = /^\.[A-Za-z0-9_-]+(?::[a-z-]+)?$/
function loadBuiltUtilities() {
  const dir = path.join(ROOT, 'out', '_next', 'static', 'css')
  if (!fs.existsSync(dir)) {
    console.error('[css-important] out/ not built — Tailwind utilities not considered.')
    return []
  }
  const found = []
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.css'))) {
    let root
    try { root = postcss.parse(fs.readFileSync(path.join(dir, name), 'utf8'), { from: name }) } catch { continue }
    root.walkDecls((decl) => {
      const rule = decl.parent
      if (!rule || rule.type !== 'rule') return
      for (const selector of rule.selectors || [rule.selector]) {
        const sel = selector.trim()
        if (!UTILITY_SELECTOR.test(sel)) continue
        found.push({
          file: `out/_next/static/css/${name}`,
          line: decl.source?.start?.line ?? 0,
          selector: sel,
          prop: decl.prop,
          value: decl.value,
          important: Boolean(decl.important),
          media: '',
          order: -1, // utilities sit below the authored layers
          spec: specificity(sel),
          tokens: tokens(sel),
          utility: true,
        })
      }
    })
  }
  return found
}

const utilities = loadBuiltUtilities()
decls.push(...utilities)

const importants = decls.filter((d) => d.important && !d.utility)

// ---- for each !important, find what it fights ------------------------------

function competitors(target) {
  const out = []
  for (const d of decls) {
    if (d === target) continue
    if (d.prop !== target.prop) continue
    if (d.important) continue
    // Overlap when the two selectors key on at least one shared token, or one
    // selector string contains the other.
    let overlap = false
    for (const t of target.tokens) if (d.tokens.has(t)) { overlap = true; break }
    if (!overlap && (d.selector.includes(target.selector) || target.selector.includes(d.selector))) overlap = true
    if (!overlap) continue
    out.push(d)
  }
  return out
}

function classify(target, comps) {
  // Structural cases where the flag is the mechanism, not a workaround.
  if (/prefers-reduced-motion/.test(target.media)) {
    return { bucket: 'genuine', reason: 'reduced-motion reset must override arbitrary component and utility animation' }
  }
  if (/@media print/.test(target.media)) {
    return { bucket: 'genuine', reason: 'print override must beat every screen rule' }
  }
  if (/:focus-visible|:focus(?![\w-])/.test(target.selector) && /^(outline|box-shadow)/.test(target.prop)) {
    return { bucket: 'genuine', reason: 'focus indicator must not be suppressible by a component style' }
  }
  const utilityRivals = comps.filter((c) => c.utility)
  if (utilityRivals.length > 0) {
    const c = utilityRivals[0]
    return {
      bucket: 'genuine',
      reason: `overrides Tailwind utility \`${c.selector}\`, which the markup applies directly to the element`,
      against: c,
    }
  }

  if (comps.length === 0) return { bucket: 'dead', reason: 'no competing declaration for this property remains' }

  const laterLoading = comps.filter((c) => c.order > target.order)
  const moreSpecific = comps.filter((c) => cmpSpec(c.spec, target.spec) > 0)

  if (laterLoading.length > 0) {
    const c = laterLoading.sort((a, b) => b.order - a.order)[0]
    return {
      bucket: 'ordering',
      reason: `${c.file} loads after ${target.file} and sets the same property, so it wins without the flag`,
      against: c,
    }
  }
  if (moreSpecific.length > 0) {
    const c = moreSpecific.sort((a, b) => cmpSpec(b.spec, a.spec))[0]
    return {
      bucket: 'specificity',
      reason: `${c.file}:${c.line} is more specific (${c.spec.join(',')} vs ${target.spec.join(',')})`,
      against: c,
    }
  }
  return {
    bucket: 'genuine',
    reason: 'competing declarations load earlier and are no more specific; needs manual justification',
    against: comps[0],
  }
}

// One row per declaration, not per selector. A rule listing three selectors
// holds one `!important` to remove, not three, and the file counts have to
// match what `grep -c '!important'` reports or the report is not checkable.
const seenDecl = new Map()
for (const d of importants) {
  const key = `${d.file}:${d.line}:${d.prop}`
  const comps = competitors(d)
  const verdict = classify(d, comps)
  const existing = seenDecl.get(key)
  // Keep the hardest verdict for the line: genuine > specificity > ordering > dead.
  const rank = { dead: 0, ordering: 1, specificity: 2, genuine: 3 }
  if (!existing || rank[verdict.bucket] > rank[existing.bucket]) {
    seenDecl.set(key, { ...d, ...verdict, competitorCount: comps.length })
  }
}
const rows = [...seenDecl.values()]

const counts = rows.reduce((acc, r) => { acc[r.bucket] = (acc[r.bucket] || 0) + 1; return acc }, {})

if (!asMarkdown) {
  console.log('[css-important] cascade order:')
  ORDER.forEach((o, i) => console.log(`  ${String(i).padStart(2)}  ${o.file}  (${o.scope})`))
  console.log(`\n[css-important] ${rows.length} !important declarations`)
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(3)}  ${k}`)
  const byFile = rows.reduce((a, r) => { a[r.file] = (a[r.file] || 0) + 1; return a }, {})
  console.log('\nby file:')
  for (const [k, v] of Object.entries(byFile).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(3)}  ${k}`)
  process.exit(0)
}

// ---- markdown report -------------------------------------------------------

const out = []
out.push('# `!important` audit', '')
out.push('Generated by `node scripts/ci/audit-css-important.mjs --markdown`. Do not edit by hand.', '')
out.push('## Cascade order', '')
out.push('Read from the actual import statements, not assumed.', '')
out.push('| # | stylesheet | scope |', '|---|---|---|')
ORDER.forEach((o, i) => out.push(`| ${i} | \`${o.file}\` | ${o.scope} |`))
out.push('')
out.push('## Bucket totals', '')
out.push('| bucket | count | meaning |', '|---|---|---|')
const MEANING = {
  ordering: 'belongs in a later-loading canonical owner — move it and drop the flag',
  specificity: 'the competing selector is over-specific — fix the selector',
  genuine: 'a base or third-party style really requires it — justify each',
  dead: 'no competing declaration remains — delete the flag',
}
for (const k of ['ordering', 'specificity', 'dead', 'genuine']) {
  if (counts[k]) out.push(`| ${k} | ${counts[k]} | ${MEANING[k]} |`)
}
out.push(`| **total** | **${rows.length}** | |`, '')

const byFile = {}
for (const r of rows) (byFile[r.file] ||= []).push(r)

out.push('## Declarations', '')
for (const file of Object.keys(byFile).sort((a, b) => byFile[b].length - byFile[a].length)) {
  out.push(`### \`${file}\` — ${byFile[file].length}`, '')
  out.push('| line | selector | property | bucket | fights | why |', '|---|---|---|---|---|---|')
  for (const r of byFile[file].sort((a, b) => a.line - b.line)) {
    const against = r.against ? `\`${r.against.file}:${r.against.line}\`<br>\`${r.against.selector}\`` : '—'
    out.push(`| ${r.line} | \`${r.selector}\`${r.media ? `<br><sub>${r.media}</sub>` : ''} | \`${r.prop}\` | **${r.bucket}** | ${against} | ${r.reason} |`)
  }
  out.push('')
}

const target = path.join(ROOT, 'docs', 'generated', 'css-important-audit.md')
fs.mkdirSync(path.dirname(target), { recursive: true })
fs.writeFileSync(target, out.join('\n') + '\n')
console.log(`[css-important] wrote ${path.relative(ROOT, target)}`)
console.log(`  ${rows.length} declarations: ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ')}`)
