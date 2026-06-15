const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')

export const SITE_URL = configuredSiteUrl === 'https://www.thehippiescientist.net'
  ? 'https://thehippiescientist.net'
  : configuredSiteUrl || 'https://thehippiescientist.net'
export const SITE_NAME = 'The Hippie Scientist'
