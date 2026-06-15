import {
  buildHerbProductSchema,
  buildHerbArticleSchema,
} from '@/lib/schema-injector'
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
  /** Product category label, defaults to "Herbal Supplement" */
  category?: string
  /** Optional affiliate/purchase offer to include in the Product node */
  offer?: {
    price: number
    priceCurrency: string
    availability?: string
    offerUrl?: string
  }
}

/**
 * Renders supplementary Product and Article JSON-LD script tags for a herb
 * profile page. These nodes are additive — they sit alongside the existing
 * MedicalWebPage/@graph emitted by SchemaGraphScript and do not replace it.
 *
 * Product schema is emitted only when a real offer is supplied. Educational
 * herb profiles without offers should not advertise Product rich-result data.
 * Article schema remains eligible for article rich results.
 *
 * The component is a pure server component: it emits only static <script>
 * tags and performs no client-side work, so it has zero hydration cost.
 */
export default function HerbSchemaGenerator({
  name,
  slug,
  description,
  url,
  image,
  dateReviewed,
  evidenceGrade,
  category = 'Herbal Supplement',
  offer,
}: HerbSchemaGeneratorProps) {
  const productSchema = buildHerbProductSchema({
    name,
    description,
    url,
    image,
    sku: slug,
    category,
    ...(offer ? { offers: offer } : {}),
  })

  const articleSchema = buildHerbArticleSchema({
    headline: `${name} Benefits, Dosage & Safety`,
    description,
    url,
    image,
    datePublished: dateReviewed,
    dateModified: dateReviewed,
    evidenceGrade,
  })

  return (
    <>
      {offer ? <JsonLd schema={productSchema} /> : null}
      <JsonLd schema={articleSchema} />
    </>
  )
}
