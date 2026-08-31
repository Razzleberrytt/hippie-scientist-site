const GENERIC_TAGS = new Set([
  'human-evidence',
  'evidence',
  'meta-analysis',
  'systematic-review',
  'randomized-trial',
  'rct',
  'clinical-trial',
])

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

function sentence(value) {
  const text = clean(value)
  if (!text) return ''
  return /[.!?]$/.test(text) ? text : `${text}.`
}

function stableIndex(value, size) {
  let hash = 2166136261
  for (const char of String(value ?? '')) {
    hash ^= char.codePointAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) % size
}

function titleCaseTag(value) {
  return clean(value)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

function compactSubjectFromTitle(value) {
  const title = clean(value)
  if (!title) return 'this topic'
  const candidates = title.split(/\s+(?:and|vs\.?|versus)\s+|[:|—]/i).map(clean).filter(Boolean)
  const subject = candidates[0] || title
  if (subject.length <= 46) return subject
  const words = subject.split(' ')
  let compact = ''
  for (const word of words) {
    const next = compact ? `${compact} ${word}` : word
    if (next.length > 46) break
    compact = next
  }
  return compact || subject.slice(0, 46).trim()
}

export function deriveSocialSubject(object) {
  const tags = Array.isArray(object?.tags) ? object.tags.map((tag) => clean(tag).toLowerCase()).filter(Boolean) : []
  const primary = tags.find((tag) => !GENERIC_TAGS.has(tag) && !/^(stress|anxiety|sleep|focus|memory|cognition|safety)$/.test(tag))
  return primary ? titleCaseTag(primary) : compactSubjectFromTitle(object?.title)
}

function topicEmoji(object) {
  const haystack = `${clean(object?.title)} ${(Array.isArray(object?.tags) ? object.tags : []).join(' ')}`.toLowerCase()
  if (/sleep|insomnia|circadian/.test(haystack)) return '😴'
  if (/memory|cognit|focus|nootrop|brain|attention/.test(haystack)) return '🧠'
  if (/stress|anxiety|mood/.test(haystack)) return '🌿'
  return '🔬'
}

export function buildCreativeHook(object) {
  const subject = deriveSocialSubject(object)
  const variants = [
    `What does ${subject} actually do?`,
    `Does ${subject} hold up in human studies?`,
    `${subject}: what actually changed?`,
    `${subject}: what do the studies show?`,
  ]
  return variants[stableIndex(`${object?.id}|${object?.title}|creative`, variants.length)]
}

export function buildSocialHook(object) {
  const subject = deriveSocialSubject(object)
  const emoji = topicEmoji(object)
  const variants = [
    `What does the human evidence actually show about ${subject}? ${emoji}`,
    `Does ${subject} hold up when you look at the human studies? ${emoji}`,
    `${subject}: the useful answer is more specific than “works” or “doesn't work.” ${emoji}`,
    `Before deciding what to think about ${subject}, look at what the studies actually measured. ${emoji}`,
  ]
  return variants[stableIndex(`${object?.id}|${object?.title}`, variants.length)]
}

function governedParagraphs(value) {
  const text = sentence(value)
  if (!text) return ''
  const pieces = text.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g)?.map(clean).filter(Boolean) || [text]
  return pieces.join('\n\n')
}

function toHashtag(value) {
  const parts = clean(value).split(/[-_\s]+/).filter(Boolean)
  if (!parts.length) return ''
  return `#${parts.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`).join('')}`
}

function hashtagsFor(object) {
  const tags = Array.isArray(object?.tags) ? object.tags.map((tag) => clean(tag).toLowerCase()).filter(Boolean) : []
  const subject = deriveSocialSubject(object)
  const result = [toHashtag(subject), '#SupplementScience']
  if (tags.some((tag) => /nootrop|cognit|memory|focus/.test(tag))) result.push('#Nootropics')
  if (tags.some((tag) => /sleep/.test(tag))) result.push('#SleepScience')
  if (tags.some((tag) => /stress|anxiety/.test(tag))) result.push('#StressResearch')
  return [...new Set(result.filter(Boolean))].slice(0, 3)
}

export function validateFeedNativeSocialPost(post, object) {
  const errors = []
  const text = String(post?.text ?? '')
  const normalizedText = clean(text)
  const finding = sentence(object?.finding)
  const limitation = sentence(object?.limitation)
  const sourceUrl = clean(object?.sourceUrl)
  const hashtagCount = (text.match(/(^|\s)#[A-Za-z0-9]+/g) || []).length
  const firstLine = text.split('\n')[0]?.trim() || ''

  if (!firstLine || firstLine.length > 130) errors.push('social hook must be present and no longer than 130 characters')
  if (!finding || !normalizedText.includes(clean(finding))) errors.push('governed finding must be preserved losslessly')
  if (!limitation || !normalizedText.includes(clean(limitation))) errors.push('governed limitation must be preserved losslessly')
  if (!sourceUrl || !text.includes(sourceUrl)) errors.push('canonical source URL must appear exactly in the social copy')
  if ((text.split(sourceUrl).length - 1) !== 1) errors.push('canonical source URL must appear exactly once')
  if (hashtagCount > 3) errors.push('social copy may use at most three hashtags')
  if (/read the evidence map/i.test(text)) errors.push('generic evidence-map CTA is not feed-native')
  if (/^Evidence:\s/i.test(firstLine)) errors.push('social copy may not open with evidence metadata')

  return [...new Set(errors)]
}

export function buildFeedNativeSocialPost(object) {
  const hook = buildSocialHook(object)
  const creativeHook = buildCreativeHook(object)
  const subject = deriveSocialSubject(object)
  const finding = governedParagraphs(object?.finding)
  const limitation = governedParagraphs(object?.limitation)
  const evidenceType = clean(object?.evidenceType)
  const evidenceGrade = clean(object?.evidenceGrade)
  const sourceUrl = clean(object?.sourceUrl)
  const hashtags = hashtagsFor(object)
  const text = [
    hook,
    `What the evidence shows:\n${finding}`,
    `The catch:\n${limitation}`,
    `Evidence type: ${evidenceType} • Grade ${evidenceGrade}`,
    `Full evidence + sources:\n${sourceUrl}`,
    hashtags.join(' '),
  ].filter(Boolean).join('\n\n')

  const archetype = ['question', 'human-studies', 'specificity', 'measurement'][stableIndex(`${object?.id}|${object?.title}`, 4)]
  const post = {
    schemaVersion: 'feed-native-social-copy-v1',
    archetype,
    subject,
    hook,
    creativeHook,
    text,
    hashtags,
    policy: 'Curiosity first, governed facts second. The hook may frame a question but may not add scientific claims. Finding and limitation remain lossless after whitespace normalization.',
  }
  const errors = validateFeedNativeSocialPost(post, object)
  if (errors.length) throw new Error(`Invalid feed-native social post: ${errors.join('; ')}`)
  return post
}
