#!/usr/bin/env node
/**
 * Build the combined global search index.
 *
 * Reads the generated monograph summaries (herbs + compounds) and the
 * structured educational content layer (`content/education/*.md` enriched over
 * the route list in `app/education/*`), normalizes them into a single
 * `SearchDoc[]` shape, and writes `public/data/search-index.json`.
 *
 * The output is a static artifact consumed client-side by the `/search` page
 * and the global command palette — keeping all `fs`/frontmatter work at build
 * time so the feature is fully static-export compatible.
 *
 * Usage: node scripts/data/build-search-index.mjs [--data-dir=public/data]
 */

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const dataDirArg = args.find((a) => a.startsWith('--data-dir='))
const DATA_DIR = path.resolve(ROOT, dataDirArg ? dataDirArg.split('=')[1] : 'public/data')
const OUT_FILE = path.join(DATA_DIR, 'search-index.json')

// ---------------------------------------------------------------------------
// Taxonomies — keyword → facet. Kept here so the index is fully precomputed and
// the client stays light. Education frontmatter supplies its own facets and is
// merged with anything matched from its text.
// ---------------------------------------------------------------------------

const GOAL_KEYWORDS = {
  sleep: ['sleep', 'insomnia', 'somnifera', 'melatonin', 'sedative', 'sedation', 'wind down', 'rest', 'circadian'],
  stress: ['stress', 'cortisol', 'adaptogen', 'adrenal', 'hpa', 'resilience', 'relax', 'calm'],
  anxiety: ['anxiety', 'anxiolytic', 'nervous', 'tension', 'gaba', 'panic'],
  focus: ['focus', 'attention', 'concentration', 'nootropic', 'alertness', 'executive', 'productivity', 'adhd'],
  energy: ['energy', 'fatigue', 'stamina', 'vitality', 'mitochondrial', 'atp', 'tired', 'endurance'],
  mood: ['mood', 'depression', 'serotonin', 'wellbeing', 'emotional', 'antidepressant'],
  cognition: ['cognition', 'memory', 'learning', 'neuroplasticity', 'acetylcholine', 'brain fog', 'clarity'],
  recovery: ['recovery', 'soreness', 'burnout', 'restoration', 'repair'],
  inflammation: ['inflammation', 'inflammatory', 'antioxidant', 'oxidative', 'nf-kb', 'cytokine'],
  pain: ['pain', 'analgesic', 'antinociceptive', 'joint', 'ache'],
  immune: ['immune', 'immunity', 'antiviral', 'antimicrobial', 'infection'],
  'gut-health': ['gut', 'digestion', 'digestive', 'microbiome', 'probiotic', 'gastrointestinal'],
  longevity: ['longevity', 'aging', 'senescence', 'sirt', 'autophagy', 'nad'],
  'heart-health': ['cardiovascular', 'blood pressure', 'circulation', 'cholesterol', 'cardiac'],
}

const PATHWAY_KEYWORDS = {
  dopamine: ['dopamine', 'dopaminergic', 'd2', 'reward', 'motivation'],
  serotonin: ['serotonin', 'serotonergic', '5-ht', 'ssri'],
  gaba: ['gaba', 'gabaergic', 'gaba-a', 'inhibitory'],
  glutamate: ['glutamate', 'glutamatergic', 'nmda', 'ampa', 'excitatory'],
  acetylcholine: ['acetylcholine', 'cholinergic', 'nicotinic', 'muscarinic'],
  'hpa-axis': ['hpa', 'cortisol', 'adrenal', 'glucocorticoid'],
  inflammation: ['inflammatory', 'cytokine', 'nf-kb', 'cox', 'prostaglandin'],
  'oxidative-stress': ['oxidative', 'antioxidant', 'free radical', 'nrf2'],
  bdnf: ['bdnf', 'neurotrophic', 'neurogenesis', 'ngf'],
  endocannabinoid: ['endocannabinoid', 'cb1', 'cb2', 'cannabinoid'],
}

function matchFacets(haystack, taxonomy) {
  const lower = haystack.toLowerCase()
  const matched = []
  for (const [facet, keywords] of Object.entries(taxonomy)) {
    if (keywords.some((kw) => lower.includes(kw))) matched.push(facet)
  }
  return matched
}

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

function toList(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

function normalizeEvidence(raw) {
  const v = String(raw || '').toLowerCase()
  if (!v) return 'Preliminary'
  if (/(strong|high|a-?tier|robust|well[-\s]?established|grade a|meta)/.test(v)) return 'Strong'
  if (/(moderate|medium|b-?tier|emerging|grade b)/.test(v)) return 'Moderate'
  if (/(limited|low|c-?tier|weak|grade c|early)/.test(v)) return 'Limited'
  if (/(educational|n\/a|none)/.test(v)) return 'Educational'
  return 'Preliminary'
}

function normalizeSafety({ safetyNotes, contraindications, interactions, isEducation }) {
  if (isEducation) return 'Educational'
  const notes = String(safetyNotes || '').toLowerCase()
  const hasContra = toList(contraindications).length > 0
  const hasInteractions = toList(interactions).length > 0
  if (/(avoid|danger|toxic|severe|do not|serious|contraindicated)/.test(notes)) return 'Notable considerations'
  if (hasContra || hasInteractions || /(caution|may cause|consult|pregnan|monitor)/.test(notes)) {
    return hasContra && hasInteractions ? 'Notable considerations' : 'Use with caution'
  }
  if (/(well tolerated|generally safe|low risk)/.test(notes)) return 'Generally well tolerated'
  return 'Use with caution'
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'))
}

// ---------------------------------------------------------------------------
// Source readers
// ---------------------------------------------------------------------------

function buildHerbDocs() {
  let records = []
  try {
    records = readJson('herbs-summary.json')
  } catch {
    return []
  }
  return records
    .map((item) => {
      const slug = String(item.slug || item.id || '').trim()
      const name = String(item.name || item.common || '').trim()
      if (!slug || !name) return null
      const effects = [...toList(item.primaryActions), ...toList(item.mechanisms)]
      const traditional = toList(item.traditionalUses)
      const haystack = [
        name,
        item.scientific,
        item.summary,
        effects.join(' '),
        traditional.join(' '),
        toList(item.contraindications).join(' '),
      ]
        .filter(Boolean)
        .join(' ')
      const contraindications = toList(item.contraindications)
      const interactions = toList(item.interactions)
      return {
        id: `Herb:${slug}`,
        slug,
        type: 'Herb',
        title: name,
        href: `/herbs/${slug}`,
        summary: String(item.summary || item.description || '').trim(),
        goals: matchFacets(haystack, GOAL_KEYWORDS),
        pathways: matchFacets(haystack, PATHWAY_KEYWORDS),
        evidenceGrade: normalizeEvidence(item.evidenceLevel || item.confidence),
        safety: normalizeSafety({ safetyNotes: item.safetyNotes, contraindications, interactions, isEducation: false }),
        safetyFlags: {
          hasInteractions: interactions.length > 0,
          hasContraindications: contraindications.length > 0,
        },
        tags: effects.slice(0, 4),
        searchText: [name, item.scientific, slug, haystack].filter(Boolean).join(' ').toLowerCase(),
      }
    })
    .filter(Boolean)
}

function buildCompoundDocs() {
  let records = []
  try {
    records = readJson('compounds-summary.json')
  } catch {
    return []
  }
  return records
    .map((item) => {
      const slug = String(item.slug || item.id || '').trim()
      const name = String(item.name || '').trim()
      if (!slug || !name) return null
      const effects = [...toList(item.mechanisms), ...toList(item.targets), ...toList(item.pathways)]
      const haystack = [
        name,
        item.compoundClass,
        item.summary,
        effects.join(' '),
        toList(item.foundIn).join(' '),
      ]
        .filter(Boolean)
        .join(' ')
      return {
        id: `Compound:${slug}`,
        slug,
        type: 'Compound',
        title: name,
        href: `/compounds/${slug}`,
        summary: String(item.summary || item.description || '').trim(),
        goals: matchFacets(haystack, GOAL_KEYWORDS),
        pathways: matchFacets(haystack, PATHWAY_KEYWORDS),
        evidenceGrade: normalizeEvidence(item.evidenceLevel),
        safety: normalizeSafety({ safetyNotes: item.safetyNotes, isEducation: false }),
        safetyFlags: {
          hasInteractions: false,
          hasContraindications: false,
        },
        tags: effects.slice(0, 4),
        searchText: [name, slug, item.compoundClass, haystack].filter(Boolean).join(' ').toLowerCase(),
      }
    })
    .filter(Boolean)
}

const NON_ARTICLE_SLUGS = new Set(['explorer', 'citation-explorer', 'efficacy-model'])

function titleize(slug) {
  return slug
    .split('-')
    .map((w) => (w.length <= 3 ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ')
    .replace(/^./, (c) => c.toUpperCase())
}

function toExcerpt(md, max = 320) {
  const text = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

function buildEducationDocs() {
  const routesDir = path.join(ROOT, 'app/education')
  const contentDir = path.join(ROOT, 'content/education')

  const slugs = new Set()
  if (fs.existsSync(routesDir)) {
    for (const entry of fs.readdirSync(routesDir, { withFileTypes: true })) {
      if (entry.isDirectory() && !NON_ARTICLE_SLUGS.has(entry.name)) slugs.add(entry.name)
    }
  }
  if (fs.existsSync(contentDir)) {
    for (const file of fs.readdirSync(contentDir)) {
      if (/\.mdx?$/.test(file) && file.toLowerCase() !== 'readme.md') {
        slugs.add(file.replace(/\.mdx?$/, ''))
      }
    }
  }

  return Array.from(slugs)
    .sort()
    .map((slug) => {
      const filePath = ['.md', '.mdx']
        .map((ext) => path.join(contentDir, `${slug}${ext}`))
        .find((candidate) => fs.existsSync(candidate))
      let fm = {}
      let excerpt = ''
      if (filePath) {
        const parsed = matter(fs.readFileSync(filePath, 'utf8'))
        fm = parsed.data || {}
        excerpt = toExcerpt(parsed.content || '')
      }
      const title = typeof fm.title === 'string' ? fm.title : titleize(slug)
      const summary = String(fm.summary || fm.description || excerpt || '').trim()
      const keywords = toList(fm.keywords)
      const tags = toList(fm.tags)
      const haystack = [title, summary, excerpt, keywords.join(' '), tags.join(' ')].join(' ')
      const goals = Array.from(new Set([...toList(fm.goals), ...matchFacets(haystack, GOAL_KEYWORDS)]))
      const pathways = Array.from(new Set([...toList(fm.pathways), ...matchFacets(haystack, PATHWAY_KEYWORDS)]))
      return {
        id: `Education:${slug}`,
        slug,
        type: 'Education',
        title,
        href: `/education/${slug}`,
        summary,
        goals,
        pathways,
        evidenceGrade: normalizeEvidence(fm.evidenceGrade || 'Educational'),
        safety: 'Educational',
        safetyFlags: { hasInteractions: false, hasContraindications: false },
        tags: (tags.length ? tags : keywords).slice(0, 4),
        searchText: [title, slug, summary, excerpt, keywords.join(' '), tags.join(' ')]
          .filter(Boolean)
          .join(' ')
          .toLowerCase(),
      }
    })
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const docs = [...buildHerbDocs(), ...buildCompoundDocs(), ...buildEducationDocs()]
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(OUT_FILE, JSON.stringify(docs))

  const byType = docs.reduce((acc, d) => ({ ...acc, [d.type]: (acc[d.type] || 0) + 1 }), {})
  console.log(
    `[build-search-index] wrote ${docs.length} docs → ${path.relative(ROOT, OUT_FILE)} ` +
      `(${Object.entries(byType).map(([k, v]) => `${k}: ${v}`).join(', ')})`
  )
}

main()
