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

  const webpageRaw =
    args.kind === 'herb' && args.herb
      ? herbJsonLd({ ...args.herb, breadcrumbId })
      : args.compound
        ? compoundJsonLd({ ...args.compound, breadcrumbId })
        : null

  const webpage = webpageRaw
    ? {
        ...stripSchemaContext(webpageRaw),
        '@id': webpageId,
        url: canonical,
        mainEntityOfPage: canonical,
        ...(args.product ? { mainEntity: { '@id': productId } } : {}),
      }
    : null

  const breadcrumb = {
    ...stripSchemaContext(breadcrumbJsonLd(args.breadcrumbs, { id: breadcrumbId })),
    '@id': breadcrumbId,
  }

  const product = args.product
    ? {
        ...stripSchemaContext(
          productJsonLd({
            name: args.product.name,
            description: args.product.description,
            url: args.product.url,
          }),
        ),
        '@id': productId,
        mainEntityOfPage: { '@id': webpageId },
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
    ? { ...stripSchemaContext(faq), '@id': faqId, isPartOf: { '@id': webpageId } }
    : null

  const collection = {
    ...stripSchemaContext(
      collectionPageJsonLd({
        title: args.title,
        description: args.description,
        path: args.goalPath,
        itemListId,
        breadcrumbId,
      }),
    ),
    '@id': webpageId,
    url: canonical,
    mainEntityOfPage: canonical,
    ...(faqNode ? { hasPart: { '@id': faqId } } : {}),
  }

  const breadcrumb = {
    ...stripSchemaContext(breadcrumbJsonLd(args.breadcrumbs, { id: breadcrumbId })),
    '@id': breadcrumbId,
  }

  const itemList = {
    ...stripSchemaContext(
      itemListJsonLd({
        id: itemListId,
        name: args.itemList.name,
        path: args.goalPath,
        items: args.itemList.items,
      }),
    ),
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
    ...stripSchemaContext(breadcrumbJsonLd(args.breadcrumbs, { id: breadcrumbId })),
    '@id': breadcrumbId,
  }

  return buildSchemaGraph([webpage, breadcrumb])
}

export function buildSeoEntrySchemaGraph(args: {
  route: string
  title: string
  description: string
  h1: string
  faqs: Array<{ question: string; answer: string }>
}) {
  const canonical = normalizeCanonical(toAbsoluteUrl(args.route))
  const webpageId = `${canonical}#webpage`
  const breadcrumbId = `${canonical}#breadcrumb`
  const faqId = `${canonical}#faq`

  const article = {
    '@type': 'Article',
    '@id': webpageId,
    headline: args.title,
    description: args.description,
    url: canonical,
    mainEntityOfPage: canonical,
    isPartOf: { '@type': 'WebSite', name: 'The Hippie Scientist', url: SITE_URL },
    author: { '@type': 'Organization', name: 'The Hippie Scientist', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'The Hippie Scientist', url: SITE_URL },
    datePublished: '2026-01-01',
    breadcrumb: { '@id': breadcrumbId },
    ...(args.faqs.length ? { hasPart: { '@id': faqId } } : {}),
  }

  const breadcrumbsList = [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Supplement Guides', url: `${SITE_URL}/guides/` },
    { name: args.h1, url: canonical },
  ]
  const breadcrumb = {
    ...stripSchemaContext(breadcrumbJsonLd(breadcrumbsList, { id: breadcrumbId })),
    '@id': breadcrumbId,
  }

  const faq = args.faqs.length
    ? {
        '@type': 'FAQPage',
        '@id': faqId,
        isPartOf: { '@id': webpageId },
        mainEntity: args.faqs.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
        url: canonical,
      }
    : null

  return buildSchemaGraph([article, breadcrumb, faq])
}

export function buildCompareHubSchemaGraph(args: {
  path: string
  title: string
  description: string
  breadcrumbs: Array<{ name: string; url: string }>
  comparisonPairs: Array<{ name: string; url: string }>
}) {
  const canonical = normalizeCanonical(toAbsoluteUrl(args.path))
  const webpageId = `${canonical}#webpage`
  const breadcrumbId = `${canonical}#breadcrumb`
  const itemListId = `${canonical}#item-list`

  const webpage = {
    '@type': 'CollectionPage',
    '@id': webpageId,
    name: args.title,
    description: args.description,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'The Hippie Scientist', url: SITE_URL },
    breadcrumb: { '@id': breadcrumbId },
    mainEntity: { '@id': itemListId },
  }

  const breadcrumb = {
    ...stripSchemaContext(breadcrumbJsonLd(args.breadcrumbs, { id: breadcrumbId })),
    '@id': breadcrumbId,
  }

  const itemList = {
    ...stripSchemaContext(
      itemListJsonLd({
        id: itemListId,
        name: 'Popular Comparisons',
        path: args.path,
        items: args.comparisonPairs,
      }),
    ),
    isPartOf: { '@id': webpageId },
  }

  return buildSchemaGraph([webpage, breadcrumb, itemList])
}

export function buildCompareDetailSchemaGraph(args: {
  path: string
  title: string
  description: string
  breadcrumbs: Array<{ name: string; url: string }>
  entities: Array<{ name: string; url: string; type: 'herb' | 'compound' }>
}) {
  const canonical = normalizeCanonical(toAbsoluteUrl(args.path))
  const webpageId = `${canonical}#webpage`
  const breadcrumbId = `${canonical}#breadcrumb`

  const webpage = {
    '@type': ['MedicalWebPage', 'WebPage'],
    '@id': webpageId,
    name: args.title,
    description: args.description,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'The Hippie Scientist', url: SITE_URL },
    breadcrumb: { '@id': breadcrumbId },
    about: args.entities.map(entity => ({
      '@type': entity.type === 'herb' ? 'MedicalTherapy' : 'ChemicalSubstance',
      name: entity.name,
      url: normalizeCanonical(toAbsoluteUrl(entity.url)),
    })),
  }

  const breadcrumb = {
    ...stripSchemaContext(breadcrumbJsonLd(args.breadcrumbs, { id: breadcrumbId })),
    '@id': breadcrumbId,
  }

  return buildSchemaGraph([webpage, breadcrumb])
}