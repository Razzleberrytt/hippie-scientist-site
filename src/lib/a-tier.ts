import aTierIndex from '@/public/data/a-tier-index.json'

type ATierEntry = {
  slug?: string | null
}

type ATierIndex = {
  global?: ATierEntry[]
  contextual?: ATierEntry[]
}

const index = aTierIndex as ATierIndex

const aTierSlugSet = new Set(
  [...(index.global ?? []), ...(index.contextual ?? [])]
    .map(entry => entry.slug?.trim().toLowerCase())
    .filter((slug): slug is string => Boolean(slug))
)

export const isATier = (slug: string): boolean =>
  aTierSlugSet.has(slug.trim().toLowerCase())
