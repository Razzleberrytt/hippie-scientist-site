export const CLUSTER_MEMBER_RUNTIME_DECISION = 'cluster_member_runtime'

export const CLUSTER_MEMBER_INHERITANCE_MODE = 'core_record_with_validated_overlays'

const RECORDS = [
  {
    slug: 'green-tea-egcg-isolated',
    canonicalRuntimeSlug: 'green-tea-egcg-isolated',
    sideEffects: ['Rare liver injury has been reported with concentrated, high-dose green tea extract use.'],
  },
  {
    slug: 'green-tea-extract',
    canonicalRuntimeSlug: 'green-tea-extract',
    sideEffects: ['Rare liver injury has been reported with concentrated, high-dose green tea extract use.'],
  },
  {
    slug: 'green-tea-extract-egcg',
    canonicalRuntimeSlug: 'green-tea-extract-egcg',
    sideEffects: ['Rare liver injury has been reported with concentrated, high-dose green tea extract use.'],
  },
  {
    slug: 'turmeric',
    canonicalRuntimeSlug: 'turmeric',
    sideEffects: ['Mild gastrointestinal upset can occur with supplemental turmeric or curcumin preparations.'],
  },
]

export const CLUSTER_MEMBER_RUNTIME_TRUST_RECORDS = Object.freeze(
  RECORDS.map(record => Object.freeze({
    ...record,
    inheritanceMode: CLUSTER_MEMBER_INHERITANCE_MODE,
    source: 'Entity_Master plus source-backed cluster runtime override',
  })),
)

const BY_SLUG = new Map(CLUSTER_MEMBER_RUNTIME_TRUST_RECORDS.map(record => [record.slug, record]))

export function getClusterMemberRuntimeTrustRecord(slug) {
  return BY_SLUG.get(String(slug || '').trim()) || null
}
