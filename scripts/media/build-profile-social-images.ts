import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import sharp from 'sharp'
import { profileCommonName } from '../../lib/profile-credibility'

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]!))
let written = 0
for (const [kind, file] of [['herb', 'herbs.json'], ['compound', 'compounds.json'], ['library', '']]) {
  const dir = path.join('public/images/social/profiles', kind)
  mkdirSync(dir, { recursive: true })
  const records = kind === 'library' ? [{ slug: 'herbs', name: 'Herb Research Library' }] : JSON.parse(readFileSync(path.join('public/data', file), 'utf8'))
  for (const record of records) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) throw new Error(`Invalid profile slug: ${record.slug}`)
    const title = profileCommonName(record)
    const words = title.split(/\s+/)
    const lines: string[] = []
    for (const word of words) {
      if (!lines.length || `${lines.at(-1)} ${word}`.length > 31) lines.push(word)
      else lines[lines.length - 1] += ` ${word}`
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#fffdf7"/><rect x="0" y="0" width="24" height="630" fill="#358f52"/><text x="80" y="100" font-family="sans-serif" font-size="26" fill="#358f52">THE HIPPIE SCIENTIST</text>${lines.slice(0, 4).map((line, i) => `<text x="80" y="${210 + i * 64}" font-family="sans-serif" font-size="54" font-weight="bold" fill="#1d3026">${escape(line)}</text>`).join('')}<text x="80" y="540" font-family="sans-serif" font-size="27" fill="#3d5145">Research evidence · Uncertainties · Safety</text><text x="80" y="588" font-family="sans-serif" font-size="20" fill="#3d5145">thehippiescientist.net/${kind === 'library' ? 'herbs/' : `${kind === 'herb' ? 'herbs' : 'compounds'}/${escape(record.slug)}/`}</text></svg>`
    const output = path.join(dir, `${record.slug}.png`)
    const digestPath = path.join(dir, `${record.slug}.sha256`)
    const digest = createHash('sha256').update(svg).digest('hex')
    if (existsSync(output) && existsSync(digestPath) && readFileSync(digestPath, 'utf8') === digest) continue
    await sharp(Buffer.from(svg)).png().toFile(output)
    writeFileSync(digestPath, digest)
    written += 1
  }
}
console.log(`[profile-social] ${written} cards generated; PNG 1200 × 630, deterministic source cache`)
