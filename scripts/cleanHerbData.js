const fs = require('fs')
const path = require('path')


const dataDir = 'data'
const originalPath = path.join(dataDir, 'herbs.original.json')
const cleanedPath = path.join(dataDir, 'herbs.cleaned.json')
const outputPath = path.join(dataDir, 'herbs.json')
const backupPath = path.join(dataDir, 'herbs.backup.json')
const siteDataPath = path.join('src', 'data', 'herbs.json')

if (!fs.existsSync(originalPath)) {
  console.error(`Source dataset missing: ${originalPath}`)
  process.exit(1)
}

const slugify = s =>
  s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
const inferCategory = tags => {
  if (tags.includes('Oneirogen')) return 'Oneirogen'
  if (tags.some(t => /dissociative|sedative/i.test(t))) return 'Dissociative / Sedative'
  if (tags.some(t => /empathogen|euphoriant/i.test(t))) return 'Empathogen / Euphoriant'
  if (tags.some(t => /visionary|psychedelic/i.test(t))) return 'Ritual / Visionary'
  return 'Other'
}

const raw = JSON.parse(fs.readFileSync(originalPath, 'utf8'))

let processed = 0
let fixed = 0
let skipped = 0
let duplicates = 0
const seen = new Set()
const cleaned = []

for (const herb of raw) {
  processed++
  const h = { ...herb }

  for (const k of Object.keys(h)) {
    if (typeof h[k] === 'string') h[k] = h[k].trim()
  }

  h.tags = Array.isArray(h.tags) ? h.tags.map(t => t.trim()).filter(Boolean) : []

  if (!h.slug) {
    h.slug = slugify(h.name || '')
    fixed++
  } else {
    h.slug = slugify(h.slug)
  }

  h.tagCount = h.tags.length

  if (!h.category || !h.category.trim()) {
    h.category = inferCategory(h.tags)
    fixed++
  }

  if (!h.safetyRating) {
    h.safetyRating = 'Unknown'
    fixed++
  }

  if (Array.isArray(h.effects)) {
    h.effects = h.effects.join(', ')
    fixed++
  } else if (typeof h.effects !== 'string') {
    h.effects = ''
  }

  const key = (h.slug || '').toLowerCase()
  if (!key || seen.has(key)) {
    duplicates++
    continue
  }

  if (
    typeof h.name !== 'string' ||
    typeof h.slug !== 'string' ||
    !Array.isArray(h.tags) ||
    typeof h.effects !== 'string'
  ) {
    skipped++
    continue
  }

  seen.add(key)
  cleaned.push(h)
}

console.log('✅ Total processed', processed)
console.log('🔁 Fixed', fixed)
console.log('🗑️ Skipped', skipped)
console.log('⚠️ Duplicates removed', duplicates)

fs.writeFileSync(cleanedPath, JSON.stringify(cleaned, null, 2))
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(originalPath, backupPath)
}
fs.writeFileSync(outputPath, JSON.stringify(cleaned, null, 2))
fs.copyFileSync(outputPath, siteDataPath)

console.log('Wrote cleaned data to', outputPath)
