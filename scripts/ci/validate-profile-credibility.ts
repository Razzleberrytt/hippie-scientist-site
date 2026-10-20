import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

if (!existsSync('out/index.html')) throw new Error('Production export is missing; run npm run build before this gate')
const errors: string[] = []
let scanned = 0
for (const [file, route] of [['herbs.json', 'herbs'], ['compounds.json', 'compounds']]) {
  const records = JSON.parse(readFileSync(path.join('public/data', file), 'utf8'))
  for (const record of records) {
    scanned += 1
    const key = `${route}/${record.slug}`
    if (record.evidence_human_study_count === 0 && /^[AB]$/i.test(record.evidence_grade || '')) errors.push(`${key}: A/B without recorded human evidence`)
    if (record.evidence_consistency === 'Consistent') errors.push(`${key}: study design cannot establish consistency`)
    const htmlPath = path.join('out', route, record.slug, 'index.html')
    if (!existsSync(htmlPath)) continue
    const html = readFileSync(htmlPath, 'utf8')
    const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ')
    if (/\bEfct\b|\b\w+_modulation\b|Generated profile|Minimum source-backed intake|Last reviewed August 2026|Evidence Engine proof of concept/.test(visible)) errors.push(`${key}: placeholder or unsupported template freshness`)
    if (record.evidence_human_study_count === 0 && !/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) errors.push(`${key}: zero-human profile must be noindex`)
    const imagePath = path.join('out/images/social/profiles', route === 'herbs' ? 'herb' : 'compound', `${record.slug}.png`)
    if (!existsSync(imagePath)) errors.push(`${key}: missing built PNG`)
    else {
      const png = readFileSync(imagePath)
      if (png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || png.readUInt32BE(16) !== 1200 || png.readUInt32BE(20) !== 630) errors.push(`${key}: invalid social card`)
    }
    const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/)?.[1] || ''
    if (!ogImage.endsWith(`/images/social/profiles/${route === 'herbs' ? 'herb' : 'compound'}/${record.slug}.png`)) errors.push(`${key}: missing profile social image in metadata`)
  }
}
for (const error of errors.slice(0, 40)) console.error(error)
console.log(`[profile-credibility] ${scanned} profiles; ${errors.length} failures`)
if (errors.length) process.exitCode = 1
