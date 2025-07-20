const fs = require('fs')
const path = require('path')

const inputPath = 'Full200.json'
const dataDir = 'data'
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
const outputPath = path.join(dataDir, 'herbs.json')
const cleanedPath = path.join(dataDir, 'herbs.cleaned.json')
const backupPath = path.join(dataDir, 'herbs.backup.json')

const slugify = s => s.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
const inferCategory = tags => {
  if (tags.includes('Oneirogen')) return 'Oneirogen'
  if (tags.includes('Dissociative') || tags.includes('Sedative')) return 'Dissociative / Sedative'
  if (tags.includes('Empathogen') || tags.includes('Euphoriant')) return 'Empathogen / Euphoriant'
  if (tags.includes('Visionary') || tags.includes('Psychedelic')) return 'Ritual / Visionary'
  return 'Other'
}

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'))

let processed = 0
let fixed = 0
let skipped = 0
let duplicates = 0
const seen = new Map()
const cleaned = []

for (const herb of raw) {
  processed++
  const h = { ...herb }

  // trim strings
  for (const k of Object.keys(h)) {
    if (typeof h[k] === 'string') h[k] = h[k].trim()
  }

  if (!Array.isArray(h.tags)) {
    h.tags = []
    fixed++
  }

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
  }

  const key = h.slug.toLowerCase()
  if (seen.has(key) || seen.has(h.name.toLowerCase())) {
    duplicates++
    continue
  }

  if (typeof h.name !== 'string' || typeof h.slug !== 'string' || !Array.isArray(h.tags) || typeof h.effects !== 'string') {
    skipped++
    continue
  }

  seen.set(key, true)
  seen.set(h.name.toLowerCase(), true)
  cleaned.push(h)
}

console.log('✅ Total processed', processed)
console.log('🔁 Fixed', fixed)
console.log('🗑️ Skipped', skipped)
console.log('⚠️ Duplicates removed', duplicates)

fs.writeFileSync(cleanedPath, JSON.stringify(cleaned, null, 2))
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(inputPath, backupPath)
}
fs.writeFileSync(outputPath, JSON.stringify(cleaned, null, 2))

console.log('Wrote cleaned data to', outputPath)
