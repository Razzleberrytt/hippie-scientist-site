import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const trimSlash = (value) => value === '/' ? '/' : value.replace(/\/+$/, '') + '/'

export function normalizeCitationPath(input) {
  if (typeof input !== 'string') throw new Error('Citation URL must be a string')
  let value = input.trim()
  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value)
    if (!['thehippiescientist.net', 'www.thehippiescientist.net'].includes(url.hostname.toLowerCase())) throw new Error('Foreign citation host')
    value = url.pathname
  }
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('?') || value.includes('#') || value.includes('..')) throw new Error('Invalid citation path')
  return trimSlash(value)
}

function quoted(value) {
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (!text) return null
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) return text.slice(1, -1).trim() || null
  return text
}

function frontmatterField(source, name) {
  const frontmatter = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/)?.[1]
  if (!frontmatter) return null
  const m = frontmatter.match(new RegExp('^' + name + ':\\s*(.*)$', 'm'))
  return quoted(m?.[1])
}

function constLiteral(source, name) {
  const match = source.match(new RegExp('\\bconst\\s+' + name + '\\s*=\\s*([\\x27\\x22\\x60])([^\\x27\\x22\\x60\\r\\n]+)\\1'))
  return match?.[2] ?? null
}

function staticTitle(source) {
  const metaLiteral = source.match(/\btitle:\s*(['"])([^\r\n]*?)\1/)?.[2]
  return metaLiteral ?? constLiteral(source, 'TITLE')
}

function staticCanonical(source) {
  let value = source.match(/\balternates:\s*\{\s*canonical:\s*(['"])([^'"]+)\1/)?.[2]
  if (!value && /\balternates:\s*\{\s*canonical:\s*CANONICAL_PATH\b/.test(source)) value = constLiteral(source, 'CANONICAL_PATH')
  if (!value) value = source.match(/\bpath:\s*(['"])(\/[^'"]+)\1/)?.[2]
  if (!value) {
    const match = source.match(/\bpath:\s*\x60(\/[^\x60]+)\x60/)
    if (match) value = match[1].replace(/\x24\x7bSLUG\x7d/g, constLiteral(source, 'SLUG') ?? '__unknown__')
  }
  if (!value || value.includes('__unknown__') || value.includes('$' + '{')) return null
  return normalizeCitationPath(value)
}

export function extractCitationIdentity(source, sourceFile, requestedUrl) {
  const url = normalizeCitationPath(requestedUrl)
  if (sourceFile === 'public/_redirects') {
    const matches = source.split(/\r?\n/).map(line => line.trim().split(/\s+/))
      .filter(([from, to, status]) => from && to && status === '301' && from.startsWith('/') && normalizeCitationPath(from) === url)
    const targets = [...new Set(matches.map(([, to]) => normalizeCitationPath(to)))]
    if (targets.length !== 1) return null
    return { kind: 'redirect', title: null, h1: null, slug: url.split('/').filter(Boolean).at(-1), canonical: targets[0] }
  }
  if (/^content\/(articles|blog)\/.*\.mdx?$/.test(sourceFile)) {
    const title = frontmatterField(source, 'title')
    const slug = frontmatterField(source, 'slug')
    if (!title || !slug || !/^[a-z0-9-]+$/.test(slug)) return null
    if (normalizeCitationPath('/articles/' + slug) !== url) return null
    // Dynamic article route uses page.title for rendered metadata and H1.
    return { kind: sourceFile.startsWith('content/blog/') ? 'blog-mdx' : 'article', title, h1: null, slug, canonical: url }
  }
  if (sourceFile.startsWith('app/') && sourceFile.endsWith('/page.tsx')) {
    const canonical = staticCanonical(source)
    const slug = url.split('/').filter(Boolean).at(-1) ?? ''
    const title = staticTitle(source)
    const h1Match = source.match(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/i)?.[1]?.trim()
    let h1 = null
    if (h1Match && !/[<{]/.test(h1Match)) h1 = h1Match.replace(/\s+/g, ' ')
    if (h1Match === '{TITLE}' && constLiteral(source, 'TITLE')) h1 = constLiteral(source, 'TITLE')
    if (canonical !== url || !title) return null
    return { kind: 'tsx', title, h1, slug, canonical }
  }
  return null
}

// A small, explicit set of published winners delegates its actual H1 elsewhere.
// Do not label an unparsed delegated heading as protected.
function delegatedHeading(root, url, source, identity) {
  if (!identity) return null
  if (url === '/guides/best/supplements-for-stress/') {
    const headingSourceFile = 'app/guides/anxiety/best-supplements-for-stress/page.tsx'
    if (!source.includes("import BestSupplementsForStressPage from '../../anxiety/best-supplements-for-stress/page'") ||
      !source.includes('export default BestSupplementsForStressPage')) return null
    const file = path.join(root, headingSourceFile)
    if (!existsSync(file)) return null
    const h1 = readFileSync(file, 'utf8').match(/<h1(?:\s[^>]*)?>([^<{][\s\S]*?)<\/h1>/i)?.[1]?.replace(/\s+/g, ' ').trim()
    if (!h1) return null
    return { ...identity, h1, headingSourceFile }
  }
  if (url === '/guides/adhd/l-theanine-for-adhd/') {
    const headingSourceFile = 'lib/focus-adhd-articles.ts'
    const componentFile = path.join(root, 'components/articles/FocusAdhdArticlePage.tsx')
    if (!source.includes('return <FocusAdhdArticlePage slug={SLUG} />') ||
      !source.includes("const SLUG = 'l-theanine-for-adhd'") ||
      !existsSync(componentFile) ||
      !/<h1\b[^>]*>\s*\{article\.title\}\s*<\/h1>/i.test(readFileSync(componentFile, 'utf8'))) return null
    const file = path.join(root, headingSourceFile)
    if (!existsSync(file)) return null
    const content = readFileSync(file, 'utf8')
    const title = content.match(/\bslug:\s*(['"])l-theanine-for-adhd\1[\s\S]{0,360}?\btitle:\s*(['"])(.*?)\2/)?.[3]
    if (!title) return null
    return { ...identity, h1: title, headingSourceFile }
  }
  return identity
}

export function findCitationOwner(root, rawUrl) {
  const url = normalizeCitationPath(rawUrl)
  const slug = url.split('/').filter(Boolean).at(-1) ?? ''
  const candidates = [
    url === '/' ? 'app/page.tsx' : 'app' + url + 'page.tsx',
    ...(url.startsWith('/articles/') ? [
      'content/articles/' + slug + '.md',
      'content/articles/' + slug + '.mdx',
      'content/blog/' + slug + '.md',
      'content/blog/' + slug + '.mdx',
    ] : []),
  ]
  for (const sourceFile of candidates) {
    const file = path.join(root, sourceFile)
    if (existsSync(file)) { const source = readFileSync(file, 'utf8'); return { sourceFile, identity: delegatedHeading(root, url, source, extractCitationIdentity(source, sourceFile, url)) } }
  }
  const redirects = path.join(root, 'public/_redirects')
  if (existsSync(redirects)) {
    const identity = extractCitationIdentity(readFileSync(redirects, 'utf8'), 'public/_redirects', url)
    if (identity) return { sourceFile: 'public/_redirects', identity }
  }
  return { sourceFile: null, identity: null }
}
