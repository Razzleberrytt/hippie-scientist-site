import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import sharp from 'sharp'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const CONTENT_DIRS = [
  { dir: path.join(PROJECT_ROOT, 'content', 'articles'), defaultCategory: 'Evidence Review' },
  { dir: path.join(PROJECT_ROOT, 'content', 'blog'), defaultCategory: 'Field Notes' },
]
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'media', 'social', 'articles')
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json')

export const SOCIAL_CARD_WIDTH = 1200
export const SOCIAL_CARD_HEIGHT = 630
export const SOCIAL_CARD_FORMAT = 'jpeg'

const COLORS = {
  forest: '#1F3A2E',
  graphite: '#2B2B2B',
  ivory: '#F7F4EF',
  brass: '#B08D3C',
  sage: '#DCE5DD',
  white: '#FFFFFF',
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim()

const escapeXml = value => clean(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const normalizeTitle = value => clean(value)
  .replace(/\s*\|\s*The Hippie Scientist\s*$/i, '')
  .replace(/\s*\(2026\)\s*$/i, '')
  .trim()

const truncate = (value, max) => {
  const text = clean(value)
  if (text.length <= max) return text
  return `${text.slice(0, Math.max(1, max - 1)).trimEnd()}…`
}

const wrapTitle = title => {
  const text = normalizeTitle(title)
  const fontSize = text.length > 90 ? 50 : text.length > 66 ? 56 : 64
  const maxChars = fontSize <= 50 ? 39 : fontSize <= 56 ? 35 : 31
  const words = text.split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxChars || !current) {
      current = candidate
      continue
    }
    lines.push(current)
    current = word
    if (lines.length === 2) break
  }

  if (current && lines.length < 3) lines.push(current)

  const consumed = lines.join(' ').replace(/…$/, '').split(/\s+/).filter(Boolean).length
  if (consumed < words.length && lines.length > 0) {
    lines[lines.length - 1] = truncate(lines[lines.length - 1], Math.max(12, maxChars - 1)).replace(/…?$/, '…')
  }

  return { lines: lines.slice(0, 3), fontSize }
}

const walkContentFiles = dir => {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkContentFiles(fullPath))
    else if (/\.(md|mdx)$/i.test(entry.name)) out.push(fullPath)
  }
  return out
}

const readCardSource = (filePath, defaultCategory) => {
  const parsed = matter(fs.readFileSync(filePath, 'utf8'))
  const data = parsed.data || {}
  const slug = clean(data.slug || path.basename(filePath).replace(/\.(md|mdx)$/i, ''))
  const title = clean(data.title)
  if (!SLUG_PATTERN.test(slug) || !title) return null

  const category = clean(data.category || defaultCategory)
  const evidenceGrade = clean(data.evidenceGrade || data.evidence_grade)
  const references = Array.isArray(data.references) ? data.references : []

  return {
    slug,
    title,
    category,
    evidenceGrade,
    sourceCount: references.length,
    sourceFile: path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/'),
  }
}

export function buildSocialCardModel(source) {
  const title = normalizeTitle(source.title)
  const category = truncate(source.category || 'Evidence Review', 42)
  const evidenceGrade = truncate(source.evidenceGrade, 24)
  const sourceCount = Number.isInteger(source.sourceCount) && source.sourceCount > 0 ? source.sourceCount : 0
  return {
    slug: source.slug,
    title,
    category,
    evidenceGrade,
    sourceCount,
    publicPath: `/media/social/articles/${source.slug}.jpg`,
  }
}

export function renderSocialCardSvg(source) {
  const model = buildSocialCardModel(source)
  const { lines, fontSize } = wrapTitle(model.title)
  const lineHeight = Math.round(fontSize * 1.08)
  const titleY = lines.length === 3 ? 245 : lines.length === 2 ? 270 : 304
  const evidenceChip = model.evidenceGrade
    ? `<g transform="translate(94 454)"><rect width="190" height="48" rx="24" fill="${COLORS.sage}"/><text x="95" y="31" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="${COLORS.forest}">EVIDENCE ${escapeXml(model.evidenceGrade.toUpperCase())}</text></g>`
    : ''
  const sourceChipX = model.evidenceGrade ? 304 : 94
  const sourceChip = model.sourceCount > 0
    ? `<g transform="translate(${sourceChipX} 454)"><rect width="188" height="48" rx="24" fill="${COLORS.white}" stroke="${COLORS.brass}" stroke-width="2"/><text x="94" y="31" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="${COLORS.graphite}">${model.sourceCount} CITED ${model.sourceCount === 1 ? 'SOURCE' : 'SOURCES'}</text></g>`
    : ''

  const titleMarkup = lines.map((line, index) => (
    `<text x="94" y="${titleY + index * lineHeight}" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="700" letter-spacing="-1.5" fill="${COLORS.graphite}">${escapeXml(line)}</text>`
  )).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SOCIAL_CARD_WIDTH}" height="${SOCIAL_CARD_HEIGHT}" viewBox="0 0 ${SOCIAL_CARD_WIDTH} ${SOCIAL_CARD_HEIGHT}">
  <rect width="1200" height="630" fill="${COLORS.ivory}"/>
  <rect width="18" height="630" fill="${COLORS.brass}"/>
  <circle cx="1085" cy="110" r="168" fill="none" stroke="${COLORS.sage}" stroke-width="34"/>
  <circle cx="1085" cy="110" r="104" fill="none" stroke="${COLORS.brass}" stroke-opacity="0.28" stroke-width="2"/>
  <path d="M940 585 C1010 500, 1110 500, 1198 420" fill="none" stroke="${COLORS.forest}" stroke-opacity="0.12" stroke-width="22"/>

  <g transform="translate(94 66)">
    <rect width="78" height="78" rx="20" fill="${COLORS.forest}"/>
    <text x="39" y="51" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="30" font-weight="700" fill="${COLORS.ivory}">THS</text>
    <text x="102" y="31" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700" fill="${COLORS.forest}">THE HIPPIE SCIENTIST</text>
    <text x="102" y="58" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" letter-spacing="2.8" fill="${COLORS.brass}">EVIDENCE • SAFETY • CLARITY</text>
  </g>

  <text x="94" y="190" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="3.2" fill="${COLORS.forest}">${escapeXml(model.category.toUpperCase())}</text>
  ${titleMarkup}
  ${evidenceChip}
  ${sourceChip}

  <line x1="94" y1="548" x2="1106" y2="548" stroke="${COLORS.brass}" stroke-opacity="0.38"/>
  <text x="94" y="585" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="${COLORS.forest}">THEHIPPIESCIENTIST.NET</text>
  <text x="1106" y="585" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="${COLORS.graphite}" fill-opacity="0.72">Evidence-first research, without the hype.</text>
</svg>`
}

export async function buildArticleSocialImages() {
  const sources = []
  for (const { dir, defaultCategory } of CONTENT_DIRS) {
    for (const filePath of walkContentFiles(dir)) {
      const source = readCardSource(filePath, defaultCategory)
      if (source) sources.push(source)
    }
  }

  const bySlug = new Map()
  for (const source of sources) {
    if (bySlug.has(source.slug)) {
      throw new Error(`[article-social] Duplicate article slug "${source.slug}" in ${bySlug.get(source.slug).sourceFile} and ${source.sourceFile}`)
    }
    bySlug.set(source.slug, source)
  }

  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const images = []
  for (const source of [...sources].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const model = buildSocialCardModel(source)
    const outputPath = path.join(OUTPUT_DIR, `${source.slug}.jpg`)
    const svg = renderSocialCardSvg(source)
    await sharp(Buffer.from(svg))
      .resize(SOCIAL_CARD_WIDTH, SOCIAL_CARD_HEIGHT, { fit: 'fill' })
      .jpeg({ quality: 88, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toFile(outputPath)

    const metadata = await sharp(outputPath).metadata()
    if (metadata.format !== SOCIAL_CARD_FORMAT || metadata.width !== SOCIAL_CARD_WIDTH || metadata.height !== SOCIAL_CARD_HEIGHT) {
      throw new Error(`[article-social] Invalid output for ${source.slug}: ${metadata.format} ${metadata.width}x${metadata.height}`)
    }

    images.push({
      slug: source.slug,
      title: model.title,
      sourceFile: source.sourceFile,
      publicPath: model.publicPath,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    })
  }

  const manifest = {
    version: 1,
    generatedBy: 'scripts/media/build-article-social-images.mjs',
    width: SOCIAL_CARD_WIDTH,
    height: SOCIAL_CARD_HEIGHT,
    format: SOCIAL_CARD_FORMAT,
    count: images.length,
    images,
  }
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`[article-social] Wrote ${images.length} article social preview JPEG(s) to ${path.relative(PROJECT_ROOT, OUTPUT_DIR)}`)
  return manifest
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invokedDirectly) {
  buildArticleSocialImages().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}
