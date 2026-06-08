#!/usr/bin/env node
/**
 * Generates SVG hero images for guides.
 * Images are saved to public/images/guides/<slug>.svg
 * No external dependencies required.
 */
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const GUIDES_DIR = join(ROOT, 'public', 'data', 'guides')
const IMAGES_DIR = join(ROOT, 'public', 'images', 'guides')

mkdirSync(IMAGES_DIR, { recursive: true })

function seededRandom(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h ^= h >>> 16
  return (h >>> 0) / 0xFFFFFFFF
}

const PALETTES = [
  { from: '#f59e0b', mid: '#d97706', to: '#92400e', accent: '#fef3c7' },
  { from: '#10b981', mid: '#059669', to: '#064e3b', accent: '#d1fae5' },
  { from: '#8b5cf6', mid: '#7c3aed', to: '#4c1d95', accent: '#ede9fe' },
  { from: '#3b82f6', mid: '#2563eb', to: '#1e3a8a', accent: '#dbeafe' },
  { from: '#64748b', mid: '#475569', to: '#1e293b', accent: '#f1f5f9' },
  { from: '#f43f5e', mid: '#e11d48', to: '#881337', accent: '#ffe4e6' },
]

function getPalette(slug) {
  return PALETTES[Math.floor(seededRandom(slug) * PALETTES.length)]
}

function generateSvg(slug, title) {
  const p = getPalette(slug)
  const id = `g${slug.replace(/[^a-z0-9]/g, '')}`
  const r = (suffix) => seededRandom(slug + suffix)

  const cx1 = 80 + Math.floor(r('1') * 200)
  const cy1 = 80 + Math.floor(r('2') * 120)
  const cx2 = 350 + Math.floor(r('3') * 100)
  const cy2 = 200 + Math.floor(r('4') * 120)
  const cx3 = 150 + Math.floor(r('5') * 200)
  const cy3 = 280 + Math.floor(r('6') * 60)

  const words = title.split(' ')
  const mid = Math.ceil(words.length / 2)
  const line1 = words.slice(0, mid).join(' ')
  const line2 = words.length > 1 ? words.slice(mid).join(' ') : ''
  const textY = line2 ? 145 : 168

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 320" width="512" height="320">
  <defs>
    <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.from}"/>
      <stop offset="55%" stop-color="${p.mid}"/>
      <stop offset="100%" stop-color="${p.to}"/>
    </linearGradient>
    <filter id="b${id}"><feGaussianBlur stdDeviation="32"/></filter>
  </defs>
  <rect width="512" height="320" fill="url(#${id})"/>
  <circle cx="${cx1}" cy="${cy1}" r="120" fill="${p.accent}" fill-opacity="0.18" filter="url(#b${id})"/>
  <circle cx="${cx2}" cy="${cy2}" r="140" fill="${p.accent}" fill-opacity="0.14" filter="url(#b${id})"/>
  <circle cx="${cx3}" cy="${cy3}" r="90" fill="white" fill-opacity="0.10" filter="url(#b${id})"/>
  <g stroke="white" stroke-opacity="0.06" stroke-width="1">
    <line x1="0" y1="80" x2="512" y2="80"/>
    <line x1="0" y1="160" x2="512" y2="160"/>
    <line x1="0" y1="240" x2="512" y2="240"/>
    <line x1="128" y1="0" x2="128" y2="320"/>
    <line x1="256" y1="0" x2="256" y2="320"/>
    <line x1="384" y1="0" x2="384" y2="320"/>
  </g>
  <text x="40" y="${textY}" font-family="Georgia,'Times New Roman',serif" font-size="38" font-weight="bold" fill="white" fill-opacity="0.95" letter-spacing="-0.5">${line1}</text>
  ${line2 ? `<text x="40" y="${textY + 48}" font-family="Georgia,'Times New Roman',serif" font-size="38" font-weight="bold" fill="white" fill-opacity="0.95" letter-spacing="-0.5">${line2}</text>` : ''}
  <rect x="40" y="${textY + (line2 ? 64 : 26)}" width="178" height="28" rx="14" fill="white" fill-opacity="0.2"/>
  <text x="129" y="${textY + (line2 ? 83 : 45)}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="12" font-weight="600" fill="white" fill-opacity="0.9" letter-spacing="1.5">GUIDE</text>
  <circle cx="470" cy="290" r="48" fill="white" fill-opacity="0.07"/>
  <circle cx="480" cy="40" r="30" fill="white" fill-opacity="0.07"/>
</svg>`
}

let slugs = []
try {
  slugs = readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const slug = f.replace('.json', '')
      const data = JSON.parse(readFileSync(join(GUIDES_DIR, f), 'utf-8'))
      return { slug, title: data.title ?? slug }
    })
} catch {
  slugs = [{ slug: 'turmeric-curcumin', title: 'Turmeric & Curcumin' }]
}

for (const { slug, title } of slugs) {
  const svg = generateSvg(slug, title)
  const out = join(IMAGES_DIR, `${slug}.svg`)
  writeFileSync(out, svg, 'utf-8')
  console.log(`  Generated: public/images/guides/${slug}.svg`)
}

console.log(`Done — ${slugs.length} image(s).`)
