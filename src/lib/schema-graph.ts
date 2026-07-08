import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  compoundJsonLd,
  herbJsonLd,
  itemListJsonLd,
  SITE_URL,
  toAbsoluteUrl,
  type CompoundJsonLdArgs,
  type HerbJsonLdArgs,
} from './seo'
import {
  buildFAQPageFromComparisonRows,
  buildFocusClusterBreadcrumb,
  buildWorkbookEntitySchema,
  isFocusClusterRecord,
  type ComparisonFaqRow,
  type WorkbookLinkedProfile,
} from '@/lib/schema'

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
  workbookRecord?: WorkbookLinkedProfile
  reviewedAt?: string
  modifiedAt?: string
  citationCount?: number
}

export function buildProfileSchemaGraph(args: ProfileSchemaGraphArgs) {
  const segment = args.kind === 'herb' ? 'herbs' : 'compounds'
  const canonical = normalizeCanonical(`${SITE_URL}/${segment}/${args.slug}`)
  const webpageId = `${canonical}#webpage`
  const breadcrumbId = `${canonical}#breadcrumb`
  const evidenceArticleId = `${canonical}#evidence-review`
  const entityName = args.kind === 'herb'
    ? args.herb?.name ?? args.slug
    : args.compound?.name ?? args.slug
  const description = args.kind === 'herb'
    ? args.herb?.description
    : args.compound?.description
  const evidenceGrade = args.kind === 'herb'
    ? args.herb?.evidenceGrade
    : args.compound?.evidenceGrade
  const safetyNotes = args.kind === 'herb'
    ? args.herb?.safetyNotes
    : args.compound?.safetyNotes

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
        image: `${SITE_URL}/og-default.jpg`,
        mainEntityOfPage: canonical,
        mainEntity: { '@id': `${canonical}#entity` },
        hasPart: { '@id': evidenceArticleId },
        ...(args.modifiedAt ? { dateModified: args.modifiedAt } : {}),
        ...(args.reviewedAt ? { dateReviewed: args.reviewedAt } : {}),
        reviewedBy: { '@type': 'Organization', name: 'The Hippie Scientist', url: SITE_URL },
        author: { '@type': 'Organization', name: 'The Hippie Scientist', url: SITE_URL },
        publisher: { '@type': 'Organization', name: 'The Hippie Scientist', url: SITE_URL },
      }
    : null

  const entity = buildWorkbookEntitySchema({
    kind: args.kind,
    slug: args.slug,
    name: entityName,
    url: canonical,
    description,
    record: args.workbookRecord,
    evidenceGrade,
    safetyNotes,
    primaryEffects: args.kind === 'herb' ? args.herb?.primaryEffects : undefined,
  })

  const evidenceArticle = {
    '@type': 'Article',
    '@id': evidenceArticleId,
    headline: `${entityName} evidence and safety summary`,
    name: `${entityName} evidence and safety summary`,
    description:
      description ||
      `Evidence, safety, and practical interpretation notes for ${entityName}.`,
    image: `${SITE_URL}/og-default.jpg`,
    url: `${canonical}#evidence-summary`,
    isPartOf: { '@id': webpageId },
    mainEntityOfPage: { '@id': webpageId },
    about: { '@id': `${canonical}#entity` },
    articleSection: ['Evidence Summary', 'Safety & Cautions'],
    author: { '@type': 'Organization', name: 'The Hippie Scientist', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'The Hippie Scientist', url: SITE_URL },
    ...(args.reviewedAt ? { datePublished: args.reviewedAt } : {}),
    ...(args.modifiedAt ? { dateModified: args.modifiedAt } : {}),
  }

  const breadcrumb = {
    ...stripSchemaContext(breadcrumbJsonLd(args.breadcrumbs, { id: breadcrumbId })),
    '@id': breadcrumbId,
  }

  const focusBreadcrumb = isFocusClusterRecord(args.workbookRecord ?? args.slug)
    ? buildFocusClusterBreadcrumb({
        currentName: args.kind === 'herb' ? args.herb?.name ?? args.slug : args.compound?.name ?? args.slug,
        currentUrl: canonical,
      })
    : null

  return buildSchemaGraph([webpage, entity, evidenceArticle, breadcrumb, focusBreadcrumb])
}

export function buildGoalSchemaGraph(args: {
  goalPath: string
  title: string
  description: string
  breadcrumbs: Array<{ name: string; url: string }>
  faqQuestions: Array<{ question: string; answer: string }>
  comparisonRows?: ComparisonFaqRow[]
  itemList: { name: string; items: Array<{ name: string; url: string }> }
}) {
  const canonical = normalizeCanonical(toAbsoluteUrl(args.goalPath))
  const breadcrumbId = `${canonical}#breadcrumb`
  const itemListId = `${canonical}#item-list`
  const faqId = `${canonical}#faq`
  const webpageId = `${canonical}#webpage`

  const faq = buildFAQPageFromComparisonRows({
    pagePath: args.goalPath,
    fallbackQuestions: args.faqQuestions,
    rows: args.comparisonRows ?? [],
  })
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
  faqQuestions?: Array<{ question: string; answer: string }>
}) {
  const canonical = normalizeCanonical(toAbsoluteUrl(args.path))
  const webpageId = `${canonical}#webpage`
  const breadcrumbId = `${canonical}#breadcrumb`
  const faqId = `${canonical}#faq`
  const faqQuestions = args.faqQuestions ?? []

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
    ...(faqQuestions.length ? { hasPart: { '@id': faqId } } : {}),
  }

  const breadcrumb = {
    ...stripSchemaContext(breadcrumbJsonLd(args.breadcrumbs, { id: breadcrumbId })),
    '@id': breadcrumbId,
  }

  const faq = faqQuestions.length
    ? {
        '@type': 'FAQPage',
        '@id': faqId,
        url: canonical,
        isPartOf: { '@id': webpageId },
        mainEntity: faqQuestions.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null

  return buildSchemaGraph([webpage, breadcrumb, faq])
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
