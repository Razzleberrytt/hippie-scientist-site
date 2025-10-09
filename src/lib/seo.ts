const SITE_URL = 'https://thehippiescientist.net'

export type PageType = 'website' | 'article'

export type BuildMetaArgs = {
  title: string
  description: string
  path?: string
  image?: string
}

type NormalizedMeta = {
  title: string
  description: string
  url: string
  image: string
}

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value)
const withLeadingSlash = (value: string) => {
  if (!value) return '/'
  return value.startsWith('/') || isAbsoluteUrl(value) ? value : `/${value}`
}

export function buildMeta({
  title,
  description,
  path = '/',
  image = '/og-image.png',
}: BuildMetaArgs): NormalizedMeta {
  const canonicalPath = withLeadingSlash(path)
  const url = new URL(canonicalPath, SITE_URL).toString()

  const fallbackImage = image || '/og-image.png'
  const imageUrl = isAbsoluteUrl(fallbackImage)
    ? fallbackImage
    : new URL(withLeadingSlash(fallbackImage), SITE_URL).toString()

  return {
    title,
    description,
    url,
    image: imageUrl,
  }
}
