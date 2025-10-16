const WIKIMEDIA_HOST = 'upload.wikimedia.org'

function sanitizeUrl(rawUrl?: string | null): string {
  if (!rawUrl) return ''
  const trimmed = rawUrl.trim().replace(/\s+/g, '')
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^http:\/\//i, 'https://')
  }
  return ''
}

function wikimediaThumbUrl(url: URL, width: number): string {
  const parts = url.pathname.split('/')
  if (parts.length < 6) {
    return url.toString()
  }

  // ['', 'wikipedia', 'commons', ...]
  if (parts[3] === 'thumb') {
    if (parts.length < 8) return url.toString()
    const fileName = parts[6]
    return `${url.origin}/wikipedia/commons/thumb/${parts[4]}/${parts[5]}/${fileName}/${width}px-${fileName}`
  }

  const fileName = parts[5]
  return `${url.origin}/wikipedia/commons/thumb/${parts[3]}/${parts[4]}/${fileName}/${width}px-${fileName}`
}

function buildSrcForWidth(rawUrl: string, width: number): string {
  const sanitized = sanitizeUrl(rawUrl)
  if (!sanitized) return ''

  try {
    const parsed = new URL(sanitized)
    if (parsed.hostname === WIKIMEDIA_HOST) {
      return wikimediaThumbUrl(parsed, width)
    }
    return sanitized
  } catch (error) {
    return sanitized
  }
}

function buildSrcSet(rawUrl: string, widths: number[]): string {
  const entries = widths
    .map(width => {
      const candidate = buildSrcForWidth(rawUrl, width)
      return candidate ? `${candidate} ${width}w` : ''
    })
    .filter(Boolean)
  return entries.join(', ')
}

interface ResponsiveOptions {
  widths?: number[]
  sizes?: string
}

export function getResponsiveImageProps(
  rawUrl: string | null | undefined,
  {
    widths = [320, 640],
    sizes = '(min-width: 640px) 384px, (min-width: 375px) 320px, 100vw',
  }: ResponsiveOptions = {}
) {
  const sanitized = sanitizeUrl(rawUrl)
  if (!sanitized) return null

  const srcSet = buildSrcSet(sanitized, widths)
  const fallbackWidth = widths[widths.length - 1]
  const src = buildSrcForWidth(sanitized, fallbackWidth) || sanitized

  return {
    src,
    srcSet: srcSet || undefined,
    sizes,
  }
}
