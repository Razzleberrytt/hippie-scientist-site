import { buildHerbArticleSchema } from '../../lib/schema-injector'
import JsonLd from '@/components/seo/JsonLd'

export type HerbSchemaGeneratorProps = {
  /** Common display name, e.g. "Ashwagandha" */
  name: string
  /** URL slug, e.g. "ashwagandha" */
  slug: string
  /** One-sentence summary used as schema description */
  description: string
  /** Absolute canonical URL, e.g. "https://thehippiescientist.net/herbs/ashwagandha/" */
  url: string
  /** Absolute URL of the OG/representative image */
  image?: string
  /** ISO 8601 date the profile was last reviewed, e.g. "2026-06-14" */
  dateReviewed?: string
  /** Evidence grade string, e.g. "B — Moderate" */
  evidenceGrade?: string
}

/**
 * Renders a supplementary Article JSON-LD script tag for a herb profile page.
 * This node is additive — it sits alongside the existing MedicalWebPage/@graph
 * emitted by SchemaGraphScript and does not replace it.
 *
 * Informational herb profiles are educational references, not commercial
 * product listings, so no Product JSON-LD is emitted here. Article schema
 * remains eligible for article rich results.
 *
 * The component is a pure server component: it emits only a static <script>
 * tag and performs no client-side work, so it has zero hydration cost.
 */
export default function HerbSchemaGenerator({
  name,
  description,
  url,
  image,
  dateReviewed,
  evidenceGrade,
}: HerbSchemaGeneratorProps) {
  const articleSchema = buildHerbArticleSchema({
    headline: `${name} Benefits, Dosage & Safety`,
    description,
    url,
    image,
    datePublished: dateReviewed,
    dateModified: dateReviewed,
    evidenceGrade,
  })

  return <JsonLd schema={articleSchema} />
}
