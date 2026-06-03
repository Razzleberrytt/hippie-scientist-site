import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  compoundJsonLd,
  faqPageJsonLd,
  herbJsonLd,
  itemListJsonLd,
  productJsonLd,
  SITE_URL,
  toAbsoluteUrl,
  type CompoundJsonLdArgs,
  type HerbJsonLdArgs,
} from '@/lib/seo'

type SchemaNode = Record<string, unknown> | null | undefined

function normalizeCanonical(canonicalUrl: string): string {
  return canonicalUrl.endsWith('/') ? canonicalUrl : `${canonicalUrl}/`
}

export function stripSchemaContext<T extends Record<string, unknown>>(node: T): Omit<T, '@context'> {
  const { '@context': _removed, ...rest } = node
  return rest
}

export function buildSchemaGraph(nodes: SchemaNode[]) {
  const graph = nodes
    .filter((node): node is Record<string, unknown> => Boolean(node))
    .map(node => stripSchemaContext(node))

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

export type ProfileSchemaGraphArgs = {
  kind: 'herb' | 'compound'
  slug: string
  herb?: HerbJsonLdArgs
  compound?: CompoundJsonLdArgs
  breadcrumbs: Array<{ name: string; url: string }>
  product?: { name: string; description: string; url: string; rating?: number; ratingCount?: number } | null
}

export function buildProfileSchemaGraph(args: ProfileSchemaGraphArgs) {
  const segment = args.kind === 'herb' ? 'herbs' : 'compounds'
  const canonical = normalizeCanonical(`${SITE_URL}/${segment}/${args.slug}`)
  const webpageId = `${canonical}#webpage`
  const breadcrumbId = `${canonical}#breadcrumb`
  const productId = `${canonical}#product`

  const webpage =
    args.kind === 'herb' && args.herb
      ? {
          ...herbJsonLd({ ...args.herb, breadcrumbId }),
          '@id': webpageId,
          url: canonical,
          ...(args.product ? { mainEntity: { '@id': productId } } : {}),
        }
      : args.compound
        ? {
            ...compoundJsonLd({ ...args.compound, breadcrumbId }),
            '@id': webpageId,
            url: canonical,
            ...(args.product ? { mainEntity: { '@id': productId } } : {}),
          }
        : null

  const breadcrumb = {
    ...breadcrumbJsonLd(args.breadcrumbs, { id: breadcrumbId }),
    '@id': breadcrumbId,
  }

  const product = args.product
    ? {
        ...productJsonLd({
          name: args.product.name,
          description: args.product.description,
          url: args.product.url,
        }),
        '@id': productId,
        ...(typeof args.product.rating === 'number' && args.product.rating > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: args.product.rating,
                bestRating: 5,
                ...(typeof args.product.ratingCount === 'number' && args.product.ratingCount > 0
                  ? { ratingCount: args.product.ratingCount }
                  : {}),
              },
            }
          : {}),
      }
    : null

  return buildSchemaGraph([webpage, breadcrumb, product])
}

export function buildGoalSchemaGraph(args: {
  goalPath: string
  title: string
  description: string
  breadcrumbs: Array<{ name: string; url: string }>
  faqQuestions: Array<{ question: string; answer: string }>
  itemList: { name: string; items: Array<{ name: string; url: string }> }
}) {
  const canonical = normalizeCanonical(toAbsoluteUrl(args.goalPath))
  const breadcrumbId = `${canonical}#breadcrumb`
  const itemListId = `${canonical}#item-list`
  const faqId = `${canonical}#faq`
  const webpageId = `${canonical}#webpage`

  const faq = faqPageJsonLd({ pagePath: args.goalPath, questions: args.faqQuestions })
  const faqNode = faq
    ? { ...faq, '@id': faqId, isPartOf: { '@id': webpageId } }
    : null

  const collection = {
    ...collectionPageJsonLd({
      title: args.title,
      description: args.description,
      path: args.goalPath,
      itemListId,
      breadcrumbId,
    }),
    '@id': webpageId,
    url: canonical,
    ...(faqNode ? { hasPart: { '@id': faqId } } : {}),
  }

  const breadcrumb = {
    ...breadcrumbJsonLd(args.breadcrumbs, { id: breadcrumbId }),
    '@id': breadcrumbId,
  }

  const itemList = {
    ...itemListJsonLd({
      id: itemListId,
      name: args.itemList.name,
      path: args.goalPath,
      items: args.itemList.items,
    }),
    isPartOf: { '@id': webpageId },
  }

  return buildSchemaGraph([collection, breadcrumb, itemList, faqNode])
}

export function buildToolPageSchemaGraph(args: {
  path: string
  title: string
  description: string
  breadcrumbs: Array<{ name: string; url: string }>
}) {
  const canonical = normalizeCanonical(toAbsoluteUrl(args.path))
  const webpageId = `${canonical}#webpage`
  const breadcrumbId = `${canonical}#breadcrumb`

  const webpage = {
    '@type': ['MedicalWebPage', 'WebPage'],
    '@id': webpageId,
    name: args.title,
    headline: args.title,
    description: args.description,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'The Hippie Scientist', url: SITE_URL },
    breadcrumb: { '@id': breadcrumbId },
    medicalAudience: 'Consumer',
  }

  const breadcrumb = {
    ...breadcrumbJsonLd(args.breadcrumbs, { id: breadcrumbId }),
    '@id': breadcrumbId,
  }

  return buildSchemaGraph([webpage, breadcrumb])
}