const MIN_WORDS = 500

const PLACEHOLDER_PATTERNS = [
  /placeholder reference\s+[ab]/i,
  /example references?/i,
  /sample citations?/i,
  /\bsources\s*\(placeholder\)/i,
  /\btodo\b/i,
  /todo article sections?/i,
  /demo text/i,
  /mock article paragraphs?/i,
  /temporary article summaries?/i,
  /no summary yet/i,
]

const BOILERPLATE_PATTERNS = [
  /this note is part of the scientific graph/i,
  /treat mechanisms as context,\s*not proof/i,
  /generic interpretation warnings?/i,
  /context and traditional (?:use|notes)/i,
  /quick pharmacology snapshot/i,
  /practical (?:prep|tips).*safety/i,
  /filed in:/i,
]

const DUMMY_REFERENCE_PATTERNS = [
  /placeholder/i,
  /example/i,
  /sample/i,
  /\bpubmed\b\s*$/i,
  /\bnih\b\s*$/i,
  /\bcochrane\b\s*$/i,
]

const KNOWN_ENTITY_ALIASES = new Map([
  ['ashwagandha', ['ashwagandha', 'withania somnifera']],
  ['bacopa-monnieri', ['bacopa', 'bacopa monnieri']],
  ['ginkgo-biloba', ['ginkgo', 'ginkgo biloba']],
  ['l-theanine', ['l-theanine', 'theanine']],
  ['lions-mane', ['lion\'s mane', 'lions mane', 'hericium erinaceus']],
  ['magnesium-glycinate', ['magnesium glycinate']],
  ['nac', ['nac', 'n-acetyl cysteine', 'n-acetylcysteine']],
  ['passionflower', ['passionflower', 'passiflora incarnata']],
  ['rhodiola-rosea', ['rhodiola', 'rhodiola rosea']],
  ['valerian-root', ['valerian', 'valerian root', 'valeriana officinalis']],
  ['blue-lotus', ['blue lotus', 'nymphaea']],
  ['cacao', ['cacao', 'theobromine']],
  ['kanna', ['kanna', 'sceletium']],
  ['kava', ['kava', 'kavalactones']],
  ['mugwort', ['mugwort']],
  ['reishi', ['reishi']],
  ['yerba-mate', ['yerba mate']],
])

const normalize = value =>
  String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const normalizeSlug = value =>
  normalize(value)
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')

export const countArticleWords = content =>
  String(content || '')
    .replace(/^---[\s\S]*?---\s*/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[[^\]]+]\([^)]+\)/g, ' ')
    .replace(/[#*_`>|-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

const getSections = content => {
  const sections = []
  const lines = String(content || '').split(/\r?\n/)

  for (let index = 0; index < lines.length; index++) {
    const heading = lines[index].match(/^(#{2,3})\s+(.+?)\s*$/)
    if (!heading) continue

    const level = heading[1].length
    const body = []

    for (let bodyIndex = index + 1; bodyIndex < lines.length; bodyIndex++) {
      const nextHeading = lines[bodyIndex].match(/^(#{2,3})\s+(.+?)\s*$/)
      if (nextHeading && nextHeading[1].length <= level) break
      body.push(lines[bodyIndex])
    }

    sections.push({ heading: heading[2].trim(), body })
  }
  return sections
}

const stripMarkdownStructure = value =>
  String(value || '')
    .replace(/\|/g, ' ')
    .replace(/[-:]+/g, ' ')
    .replace(/\[[^\]]+]\([^)]+\)/g, ' link ')
    .replace(/[#*_`>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const hasVisibleSectionBody = body => {
  const visible = stripMarkdownStructure(body.join('\n'))
  return visible.length > 0
}

const getParagraphs = content =>
  String(content || '')
    .split(/\n{2,}/)
    .map(paragraph => stripMarkdownStructure(paragraph))
    .filter(paragraph => paragraph.split(/\s+/).length >= 20)

const findRepeatedParagraphs = content => {
  const seen = new Map()
  const repeated = []

  for (const paragraph of getParagraphs(content)) {
    const key = normalize(paragraph)
    if (!key) continue
    const count = seen.get(key) || 0
    if (count === 1) repeated.push(paragraph.slice(0, 80))
    seen.set(key, count + 1)
  }

  return repeated
}

const findTargetEntity = slug => {
  const normalizedSlug = normalizeSlug(slug)
  if (KNOWN_ENTITY_ALIASES.has(normalizedSlug)) return normalizedSlug

  const matches = [...KNOWN_ENTITY_ALIASES.keys()]
    .filter(entitySlug => normalizedSlug === entitySlug || normalizedSlug.includes(entitySlug))
    .sort((a, b) => b.length - a.length)

  return matches[0] || null
}

const includesAlias = (value, aliases) => {
  const normalized = ` ${normalize(value)} `
  return aliases.some(alias => normalized.includes(` ${normalize(alias)} `))
}

const findOtherEntityMentions = (value, targetEntity) => {
  const matches = []
  for (const [entitySlug, aliases] of KNOWN_ENTITY_ALIASES) {
    if (entitySlug === targetEntity) continue
    if (includesAlias(value, aliases)) matches.push(entitySlug)
  }
  return matches
}

const validateEntityIntegrity = ({ slug, title, content, fileName, requireEntityMatch }) => {
  const issues = []
  const targetEntity = findTargetEntity(slug)
  if (!targetEntity) return issues

  const aliases = KNOWN_ENTITY_ALIASES.get(targetEntity) || []
  const titleHasEntity = includesAlias(title, aliases)
  const intro = String(content || '').replace(/^#.+$/m, '').slice(0, 700)
  const introHasEntity = includesAlias(intro, aliases)

  if (requireEntityMatch && !titleHasEntity) {
    issues.push(`entity mismatch: title in ${fileName} does not include expected entity for slug "${slug}"`)
  }

  if (requireEntityMatch && !introHasEntity) {
    issues.push(`entity mismatch: article intro in ${fileName} does not include expected entity for slug "${slug}"`)
  }

  const otherIntroMentions = findOtherEntityMentions(intro, targetEntity)
  if (!introHasEntity && otherIntroMentions.length > 0) {
    issues.push(`entity mismatch: intro for "${slug}" appears to discuss ${otherIntroMentions.join(', ')}`)
  }

  return issues
}

export function validateArticleQuality(record, options = {}) {
  const {
    fileName = record.slug || 'article',
    requireReferences = false,
    requireEntityMatch = false,
  } = options

  const issues = []
  const title = String(record.title || '').trim()
  const slug = String(record.slug || '').trim()
  const description = String(record.description || record.excerpt || '').trim()
  const content = String(record.content || '').trim()
  const corpus = [title, description, content].join('\n')

  if (!slug) issues.push(`missing slug in ${fileName}`)
  if (!title) issues.push(`missing title in ${fileName}`)
  if (!record.date) issues.push(`missing publication date in ${fileName}`)
  if (!content) issues.push(`empty article body in ${fileName}`)

  const wordCount = countArticleWords(content)
  if (wordCount < MIN_WORDS) {
    issues.push(`article under ${MIN_WORDS} words in ${fileName}: ${wordCount}`)
  }

  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(corpus)) {
      issues.push(`placeholder text detected in ${fileName}: ${pattern}`)
    }
  }

  for (const pattern of BOILERPLATE_PATTERNS) {
    if (pattern.test(corpus)) {
      issues.push(`repeated template boilerplate detected in ${fileName}: ${pattern}`)
    }
  }

  for (const section of getSections(content)) {
    if (!hasVisibleSectionBody(section.body)) {
      issues.push(`empty section detected in ${fileName}: ${section.heading}`)
    }
  }

  for (const repeated of findRepeatedParagraphs(content)) {
    issues.push(`duplicate boilerplate paragraph in ${fileName}: ${repeated}`)
  }

  const references = Array.isArray(record.references) ? record.references : []
  if (requireReferences && references.length === 0 && !/(^|\n)##\s+References\b[\s\S]*https?:\/\//i.test(content)) {
    issues.push(`missing references in ${fileName}`)
  }

  for (const [index, ref] of references.entries()) {
    const refCorpus = [ref?.title, ref?.authors, ref?.year, ref?.pmid, ref?.url].filter(Boolean).join(' ')
    if (!String(ref?.title || '').trim()) {
      issues.push(`empty reference title in ${fileName} at index ${index}`)
    }
    if (!String(ref?.pmid || ref?.url || '').trim()) {
      issues.push(`reference without PMID or URL in ${fileName} at index ${index}`)
    }
    if (DUMMY_REFERENCE_PATTERNS.some(pattern => pattern.test(refCorpus))) {
      issues.push(`dummy reference detected in ${fileName} at index ${index}`)
    }
  }

  if (/(^|\n)##\s+(Further Reading|Sources|References)\b[\s\S]*placeholder/i.test(content)) {
    issues.push(`dummy bibliography block detected in ${fileName}`)
  }

  issues.push(...validateEntityIntegrity({ slug, title, content, fileName, requireEntityMatch }))

  return issues
}

export function assertUniqueArticleTitles(records, sourceName = 'articles') {
  const seen = new Map()
  const issues = []

  for (const record of records) {
    const key = normalize(record.title)
    if (!key) continue
    const previous = seen.get(key)
    if (previous) {
      issues.push(`duplicate title detected in ${sourceName}: "${record.title}" (${previous} and ${record.slug})`)
    } else {
      seen.set(key, record.slug)
    }
  }

  return issues
}

export function assertArticleQuality(records, options = {}) {
  const issues = records.flatMap(record =>
    validateArticleQuality(record, {
      ...options,
      fileName: record.__fileName || record.slug || 'article',
    })
  )

  issues.push(...assertUniqueArticleTitles(records, options.sourceName || 'articles'))

  if (issues.length > 0) {
    throw new Error(`Article quality validation failed:\n- ${issues.join('\n- ')}`)
  }
}
