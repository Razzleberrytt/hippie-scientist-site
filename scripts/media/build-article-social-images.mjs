import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import sharp from 'sharp'
import {
  ARTICLE_SOCIAL_CARD_FORMAT,
  ARTICLE_SOCIAL_CARD_HEIGHT,
  ARTICLE_SOCIAL_CARD_VERSION,
  ARTICLE_SOCIAL_CARD_WIDTH,
  articleSocialAltText,
  articleSocialAssetPath,
  articleSocialCacheKey,
  articleSocialImagePath,
  normalizeArticleSocialCategory,
  normalizeArticleSocialSourceCount,
  normalizeArticleSocialTitle,
} from '../../lib/article-social.js'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const CONTENT_DIRS = [
  { dir: path.join(PROJECT_ROOT, 'content', 'articles'), defaultCategory: 'Evidence Review' },
  { dir: path.join(PROJECT_ROOT, 'content', 'blog'), defaultCategory: 'Field Notes' },
]
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'media', 'social', 'articles')
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json')
const MAX_SOCIAL_CARD_BYTES = 512 * 1024
const MIN_SOCIAL_CARD_BYTES = 2 * 1024

export const SOCIAL_CARD_WIDTH = ARTICLE_SOCIAL_CARD_WIDTH
export const SOCIAL_CARD_HEIGHT = ARTICLE_SOCIAL_CARD_HEIGHT
export const SOCIAL_CARD_FORMAT = ARTICLE_SOCIAL_CARD_FORMAT
export const SOCIAL_CARD_VERSION = ARTICLE_SOCIAL_CARD_VERSION

const COLORS = {
  forest: '#1F3A2E',
  graphite: '#292B29',
  ivory: '#F7F4EF',
  brass: '#B08D3C',
  sage: '#DCE5DD',
  white: '#FFFFFF',
  mist: '#EDF1ED',
}

const CATEGORY_ACCENTS = [
  { test: /sleep|circadian|dream/i, color: '#536D78' },
  { test: /stress|anxiety|calm|mood/i, color: '#77655D' },
  { test: /focus|cogn|memory|brain|nootropic/i, color: '#526B5C' },
  { test: /field notes|culture|history/i, color: '#756849' },
]

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim()

const escapeXml = value => clean(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const truncate = (value, max) => {
  const text = clean(value)
  if (text.length <= max) return text
  return `${text.slice(0, Math.max(1, max - 1)).trimEnd()}…`
}

const splitLongWord = (word, maxChars) => {
  if (word.length <= maxChars) return [word]
  const chunks = []
  for (let index = 0; index < word.length; index += maxChars) {
    chunks.push(word.slice(index, index + maxChars))
  }
  return chunks
}

const wrapTitle = title => {
  const text = normalizeArticleSocialTitle(title)
  const fontSize = text.length > 105 ? 46 : text.length > 78 ? 52 : text.length > 52 ? 58 : 64
  const maxChars = fontSize <= 46 ? 40 : fontSize <= 52 ? 36 : fontSize <= 58 ? 33 : 30
  const rawWords = text.split(/\s+/).filter(Boolean)
  const words = rawWords.flatMap(word => splitLongWord(word, maxChars))
  const lines = []
  let current = ''
  let wordIndex = 0

  while (wordIndex < words.length && lines.length < 3) {
    const word = words[wordIndex]
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxChars || !current) {
      current = candidate
      wordIndex += 1
      continue
    }
    lines.push(current)
    current = ''
  }

  if (current && lines.length < 3) lines.push(current)

  if (wordIndex < words.length && lines.length > 0) {
    const lastIndex = lines.length - 1
    lines[lastIndex] = truncate(lines[lastIndex], Math.max(14, maxChars - 1)).replace(/…?$/, '…')
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
  const references = Array.isArray(data.references) ? data.references : []

  return {
    slug,
    title,
    category,
    sourceCount: references.length,
    sourceFile: path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/'),
  }
}

const seedFromString = value => {
  let seed = 2166136261
  for (const character of String(value)) {
    seed ^= character.charCodeAt(0)
    seed = Math.imul(seed, 16777619) >>> 0
  }
  return seed >>> 0
}

const motifForSlug = slug => {
  let state = seedFromString(slug) || 1
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 0xffffffff
  }
  const nodes = Array.from({ length: 7 }, (_, index) => ({
    x: Math.round(944 + next() * 188),
    y: Math.round(198 + next() * 235),
    r: Math.round(5 + next() * 7),
    opacity: Number((0.34 + next() * 0.42).toFixed(2)),
    index,
  }))
  const lines = nodes.slice(1).map((node, index) => ({ from: nodes[index], to: node }))
  return { nodes, lines }
}

const categoryAccent = category => CATEGORY_ACCENTS.find(entry => entry.test.test(category))?.color || COLORS.forest

export function buildSocialCardModel(source) {
  const title = normalizeArticleSocialTitle(source.title)
  const category = truncate(normalizeArticleSocialCategory(source.category), 42)
  const sourceCount = normalizeArticleSocialSourceCount(source.sourceCount)
  const assetPath = articleSocialAssetPath(source.slug)
  const cacheKey = articleSocialCacheKey({ ...source, title, category, sourceCount })
  return {
    slug: source.slug,
    title,
    category,
    sourceCount,
    assetPath,
    publicPath: articleSocialImagePath({ ...source, title, category, sourceCount }),
    cacheKey,
    alt: articleSocialAltText(title),
  }
}

export function renderSocialCardSvg(source) {
  const model = buildSocialCardModel(source)
  const { lines, fontSize } = wrapTitle(model.title)
  const lineHeight = Math.round(fontSize * 1.08)
  const titleY = lines.length === 3 ? 252 : lines.length === 2 ? 282 : 314
  const accent = categoryAccent(model.category)
  const motif = motifForSlug(model.slug)
  const sourceChip = model.sourceCount > 0
    ? `<g transform="translate(94 454)"><rect width="218" height="50" rx="25" fill="${COLORS.white}" stroke="${COLORS.brass}" stroke-width="2"/><text x="109" y="32" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="0.5" fill="${COLORS.graphite}">${model.sourceCount} CITED ${model.sourceCount === 1 ? 'SOURCE' : 'SOURCES'}</text></g>`
    : ''

  const titleMarkup = lines.map((line, index) => (
    `<text x="94" y="${titleY + index * lineHeight}" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="700" letter-spacing="-1.4" fill="${COLORS.graphite}">${escapeXml(line)}</text>`
  )).join('')

  const motifLines = motif.lines.map(({ from, to }) => (
    `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${accent}" stroke-opacity="0.18" stroke-width="2"/>`
  )).join('')
  const motifNodes = motif.nodes.map(node => (
    `<circle cx="${node.x}" cy="${node.y}" r="${node.r}" fill="${accent}" fill-opacity="${node.opacity}"/>`
  )).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SOCIAL_CARD_WIDTH}" height="${SOCIAL_CARD_HEIGHT}" viewBox="0 0 ${SOCIAL_CARD_WIDTH} ${SOCIAL_CARD_HEIGHT}">
  <rect width="1200" height="630" fill="${COLORS.ivory}"/>
  <rect width="18" height="630" fill="${COLORS.brass}"/>
  <rect x="900" y="0" width="300" height="630" fill="${COLORS.mist}" fill-opacity="0.52"/>
  <line x1="900" y1="68" x2="900" y2="510" stroke="${COLORS.brass}" stroke-opacity="0.30"/>
  <circle cx="1085" cy="100" r="150" fill="none" stroke="${COLORS.sage}" stroke-width="28"/>
  <circle cx="1085" cy="100" r="96" fill="none" stroke="${COLORS.brass}" stroke-opacity="0.22" stroke-width="2"/>
  ${motifLines}
  ${motifNodes}

  <g transform="translate(94 64)">
    <rect width="74" height="74" rx="18" fill="${COLORS.forest}"/>
    <text x="37" y="49" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="29" font-weight="700" fill="${COLORS.ivory}">THS</text>
    <text x="98" y="29" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="${COLORS.forest}">THE HIPPIE SCIENTIST</text>
    <text x="98" y="56" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="2.6" fill="${COLORS.brass}">RESEARCH • SOURCES • CONTEXT</text>
  </g>

  <g transform="translate(94 164)">
    <rect width="${Math.min(360, Math.max(156, 54 + model.category.length * 10))}" height="40" rx="20" fill="${accent}" fill-opacity="0.10"/>
    <circle cx="20" cy="20" r="5" fill="${accent}"/>
    <text x="38" y="26" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" letter-spacing="2.2" fill="${accent}">${escapeXml(model.category.toUpperCase())}</text>
  </g>

  ${titleMarkup}
  ${sourceChip}

  <text x="1018" y="466" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="2.4" fill="${accent}" fill-opacity="0.78">ARTICLE SIGNAL</text>
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
  const outputPaths = new Set()
  const renderedDigests = new Map()

  for (const source of [...sources].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const model = buildSocialCardModel(source)
    const outputPath = path.join(OUTPUT_DIR, `${source.slug}.jpg`)
    if (outputPaths.has(outputPath)) {
      throw new Error(`[article-social] Duplicate output path for ${source.slug}: ${outputPath}`)
    }
    outputPaths.add(outputPath)

    const svg = renderSocialCardSvg(source)
    await sharp(Buffer.from(svg))
      .resize(SOCIAL_CARD_WIDTH, SOCIAL_CARD_HEIGHT, { fit: 'fill' })
      .jpeg({ quality: 90, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toFile(outputPath)

    const metadata = await sharp(outputPath).metadata()
    if (metadata.format !== SOCIAL_CARD_FORMAT || metadata.width !== SOCIAL_CARD_WIDTH || metadata.height !== SOCIAL_CARD_HEIGHT) {
      throw new Error(`[article-social] Invalid output for ${source.slug}: ${metadata.format} ${metadata.width}x${metadata.height}`)
    }

    const bytes = fs.statSync(outputPath).size
    if (bytes < MIN_SOCIAL_CARD_BYTES || bytes > MAX_SOCIAL_CARD_BYTES) {
      throw new Error(`[article-social] Suspicious asset size for ${source.slug}: ${bytes} bytes`)
    }

    const fileBuffer = fs.readFileSync(outputPath)
    const sha256 = createHash('sha256').update(fileBuffer).digest('hex')
    const duplicateSlug = renderedDigests.get(sha256)
    if (duplicateSlug) {
      throw new Error(`[article-social] Duplicate rendered image digest for ${source.slug} and ${duplicateSlug}`)
    }
    renderedDigests.set(sha256, source.slug)

    images.push({
      slug: source.slug,
      title: model.title,
      sourceFile: source.sourceFile,
      assetPath: model.assetPath,
      publicPath: model.publicPath,
      cacheKey: model.cacheKey,
      alt: model.alt,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      bytes,
      sha256,
    })
  }

  const manifest = {
    version: 2,
    cardVersion: SOCIAL_CARD_VERSION,
    generatedBy: 'scripts/media/build-article-social-images.mjs',
    width: SOCIAL_CARD_WIDTH,
    height: SOCIAL_CARD_HEIGHT,
    format: SOCIAL_CARD_FORMAT,
    maxBytes: MAX_SOCIAL_CARD_BYTES,
    count: images.length,
    uniqueDigestCount: renderedDigests.size,
    images,
  }
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`[article-social] Wrote ${images.length} cache-safe article social preview JPEG(s) to ${path.relative(PROJECT_ROOT, OUTPUT_DIR)}`)
  return manifest
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invokedDirectly) {
  buildArticleSocialImages().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}
