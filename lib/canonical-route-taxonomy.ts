import { text } from '@/lib/display-utils'

export const canonicalRouteFamilies = {
  guides: '/guides',
  compare: '/guides/compare',
  ecosystems: '/ecosystems',
  herbs: '/herbs',
  compounds: '/compounds',
}

export function normalizeTopicSlug(value: unknown) {
  return text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function buildCanonicalGuideRoute(topic: unknown) {
  return `${canonicalRouteFamilies.guides}/${normalizeTopicSlug(topic)}`
}

export function buildCanonicalCompareRoute(left: unknown, right: unknown) {
  return `${canonicalRouteFamilies.compare}/${normalizeTopicSlug(left)}-vs-${normalizeTopicSlug(right)}`
}

export function buildCanonicalEcosystemRoute(topic: unknown) {
  return `${canonicalRouteFamilies.ecosystems}/${normalizeTopicSlug(topic)}`
}

export function normalizeLegacyRoute(path: string) {
  return path
    .replace(/^\/best-for\//, '/guides/')
    .replace(/^\/best-supplements-for-/, '/guides/')
    .replace(/^\/top\//, '/guides/')
    .replace(/^\/best\//, '/guides/')
}
