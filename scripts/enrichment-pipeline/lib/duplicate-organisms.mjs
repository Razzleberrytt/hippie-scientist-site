import { normalizeText } from './normalize.mjs'

/**
 * Duplicate-organism audit.
 *
 * Two entities that carry the same `latin_name` describe the same organism.
 * Sometimes that is deliberate — a plant part or preparation split out as its
 * own profile (`roselle-seed` alongside `hibiscus-sabdariffa`) — and sometimes
 * it is a genuine duplicate that grew from a slug/common-name pair
 * (`allium-sativum` alongside `garlic`).
 *
 * The distinction the audit *can* make mechanically is how many of them the
 * site actually publishes. Two indexed profiles for one organism is a
 * duplicate-content problem whether or not the split was intentional, so those
 * are reported separately and are the ones worth a human pass first.
 *
 * This never proposes a fix: entity identity, slugs, and publishing controls are
 * all prohibited to the enrichment pipeline by contract.
 */

const PUBLIC_EXPORTS = new Set(['full_public_runtime', 'primary_runtime_priority'])

export function auditDuplicateOrganisms(canonical, { field = 'latin_name' } = {}) {
  const byValue = new Map()

  for (const [slug, { row }] of canonical.bySlug) {
    const value = normalizeText(row[field]).toLowerCase()
    if (!value) continue
    if (!byValue.has(value)) byValue.set(value, [])
    byValue.get(value).push({
      slug,
      name: normalizeText(row.name),
      value: normalizeText(row[field]),
      runtime_export_decision: normalizeText(row.runtime_export_decision),
      seo_indexing_recommendation: normalizeText(row.seo_indexing_recommendation),
      published: PUBLIC_EXPORTS.has(normalizeText(row.runtime_export_decision)),
    })
  }

  const groups = [...byValue.entries()]
    .filter(([, entities]) => entities.length > 1)
    .map(([value, entities]) => {
      const sorted = [...entities].sort((a, b) => a.slug.localeCompare(b.slug))
      const publishedCount = sorted.filter((e) => e.published).length
      return {
        value: sorted[0].value,
        key: value,
        entities: sorted,
        entity_count: sorted.length,
        published_count: publishedCount,
        severity: publishedCount > 1 ? 'published-duplicate' : 'single-published',
      }
    })
    .sort(
      (a, b) =>
        b.published_count - a.published_count ||
        b.entity_count - a.entity_count ||
        a.key.localeCompare(b.key),
    )

  return {
    audit_version: 1,
    field,
    distinct_values: byValue.size,
    shared_values: groups.length,
    published_duplicates: groups.filter((g) => g.severity === 'published-duplicate').length,
    groups,
  }
}

export function formatDuplicateAudit(report) {
  const lines = []
  lines.push(`${report.field}: ${report.distinct_values} distinct value(s)`)
  lines.push(`  held by more than one entity          ${report.shared_values}`)
  lines.push(`  with 2+ publicly exported profiles    ${report.published_duplicates}`)
  if (!report.groups.length) return lines.join('\n')

  lines.push('')
  for (const group of report.groups) {
    const flag = group.severity === 'published-duplicate' ? `PUBLIC x${group.published_count}` : '          '
    lines.push(`${flag}  ${group.value}`)
    for (const entity of group.entities) {
      lines.push(
        `             ${entity.slug.padEnd(28)} ${entity.name.padEnd(30)} ${entity.runtime_export_decision}`,
      )
    }
  }
  lines.push('')
  lines.push('Entity identity and publishing controls are prohibited to the enrichment pipeline.')
  lines.push('Resolving these is a human editorial decision: merge, or redirect one slug to the other.')
  return lines.join('\n')
}
