const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

function validateCaption(caption, { destinationUrl, format }) {
  const errors = []
  const text = String(caption?.text ?? '')
  const firstLine = text.split('\n')[0]?.trim() || ''
  const hashtagCount = (text.match(/(^|\s)#[A-Za-z0-9]+/g) || []).length
  const cue = format === 'vertical-video' ? 'Watch for' : 'Swipe for'
  if (!firstLine || firstLine.length > 130) errors.push('media-first hook must be present and no longer than 130 characters')
  if (!text.includes(cue)) errors.push(`media-first ${format} caption must contain its native consumption cue`)
  if (!destinationUrl || (text.split(destinationUrl).length - 1) !== 1) errors.push('media-first destination URL must appear exactly once')
  if (hashtagCount > 3) errors.push('media-first caption may use at most three hashtags')
  return [...new Set(errors)]
}

function attributedDestination(sourceUrl, taggedDestination) {
  if (!taggedDestination) return sourceUrl
  let source
  let tagged
  try {
    source = new URL(sourceUrl)
    tagged = new URL(taggedDestination)
  } catch {
    throw new Error('media-first caption requires valid canonical and tagged destinations')
  }
  if (source.protocol !== 'https:' || tagged.protocol !== 'https:') throw new Error('media-first destinations must use HTTPS')
  if (source.origin !== tagged.origin || source.pathname !== tagged.pathname) {
    throw new Error('media-first tagged destination must preserve canonical origin and path')
  }
  if (!tagged.searchParams.get('utm_campaign')) throw new Error('media-first tagged destination must preserve campaign attribution')
  return tagged.toString()
}

export function buildMediaFirstCaption(object, socialPost, { format = 'carousel', taggedDestination = null } = {}) {
  if (!['carousel', 'vertical-video'].includes(format)) throw new Error(`unsupported media-first caption format: ${format}`)
  const hook = clean(socialPost?.hook)
  const sourceUrl = clean(object?.sourceUrl)
  const destinationUrl = attributedDestination(sourceUrl, clean(taggedDestination))
  const hashtags = Array.isArray(socialPost?.hashtags) ? socialPost.hashtags.map(clean).filter(Boolean).slice(0, 3) : []
  if (!hook) throw new Error('media-first caption requires the governed social hook')
  const cue = format === 'vertical-video'
    ? 'Watch for what the studies found, the key limitation, and the source trail.'
    : 'Swipe for what the studies found, the key limitation, and the source trail.'
  const text = [
    hook,
    cue,
    `Full evidence + sources:\n${destinationUrl}`,
    hashtags.join(' '),
  ].filter(Boolean).join('\n\n')
  const caption = {
    schemaVersion: 'media-first-caption-v1',
    format,
    text,
    hook,
    hashtags,
    canonicalSourceUrl: sourceUrl,
    destinationUrl,
    factualAuthority: 'creative-framing-only',
    governedFactsLocation: format === 'vertical-video' ? 'validated lossless video scenes' : 'validated lossless carousel slides',
    policy: 'This caption frames the attached governed media without restating scientific findings. The validated media retains the lossless finding, limitation, grade, disclosure, and source.',
  }
  const errors = validateCaption(caption, { destinationUrl, format })
  if (errors.length) throw new Error(`Invalid media-first caption: ${errors.join('; ')}`)
  return caption
}

export function buildMediaFirstCaptions(object, socialPost) {
  return {
    carousel: buildMediaFirstCaption(object, socialPost, { format: 'carousel' }),
    verticalVideo: buildMediaFirstCaption(object, socialPost, { format: 'vertical-video' }),
  }
}
