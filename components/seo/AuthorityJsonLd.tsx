import { buildSchemaGraph } from '../../src/lib/schema-graph'
import { serializeJsonLd } from '../../src/lib/schema-injector'
import { SITE_URL } from '../../src/lib/seo'
import {
  AUTHOR_SCHEMA_ID,
  ORGANIZATION_SCHEMA_ID,
  WEBSITE_SCHEMA_ID,
} from '../../src/lib/schema-identities'

type FaqItem = { question: string; answer: string }

type AuthorityJsonLdProps = {
  title: string
  description: string
  url: string
  type?: 'Article' | 'CollectionPage' | 'ContactPage' | 'MedicalWebPage' | 'ProfilePage'
  breadcrumbs?: Array<{
    name: string
    url: string
  }>
  faqItems?: FaqItem[]
  citationUrls?: string[]
  /**
   * Emit an Article node alongside the page node. A long-form editorial guide is
   * both a MedicalWebPage and an Article; the page node can only carry one
   * @type, so a page that is reviewed as an article opts in here rather than
   * choosing between the two.
   */
  includeArticle?: boolean
}

function normalizeFaqItem(item: FaqItem): FaqItem | null {
  const question = String(item.question || '').trim()
  const answer = String(item.answer || '').trim()
  if (question.length < 12 || answer.length <= 50) return null
  return { question, answer }
}

function getMeaningfulFaqItems(items: FaqItem[] | undefined): FaqItem[] {
  const seenQuestions = new Set<string>()
  const meaningfulItems: FaqItem[] = []
  for (const item of items ?? []) {
    const normalized = normalizeFaqItem(item)
    if (!normalized) continue
    const questionKey = normalized.question.toLowerCase()
    if (seenQuestions.has(questionKey)) continue
    seenQuestions.add(questionKey)
    meaningfulItems.push(normalized)
  }
  return meaningfulItems
}

export default function AuthorityJsonLd({
  title,
  description,
  url,
  type = 'CollectionPage',
  breadcrumbs = [],
  faqItems,
  citationUrls = [],
  includeArticle = false,
}: AuthorityJsonLdProps) {
  const normalizedUrl = url.replace('https://thehippiescientist.net', SITE_URL)
  const canonical = normalizedUrl.endsWith('/') ? normalizedUrl : `${normalizedUrl}/`
  const webpageId = `${canonical}#webpage`
  const breadcrumbId = `${canonical}#breadcrumb`
  const faqId = `${canonical}#faq`
  const meaningfulFaqItems = getMeaningfulFaqItems(faqItems)
  const hasEditorialAuthor = type === 'Article' || type === 'MedicalWebPage'

  const webpage = {
    '@type': type === 'MedicalWebPage' ? ['MedicalWebPage', 'WebPage'] : type,
    '@id': webpageId,
    name: title,
    headline: title,
    description,
    url: canonical,
    inLanguage: 'en-US',
    ...(hasEditorialAuthor ? { mainEntityOfPage: canonical } : {}),
    isPartOf: { '@id': WEBSITE_SCHEMA_ID },
    ...(hasEditorialAuthor ? { author: { '@id': AUTHOR_SCHEMA_ID } } : {}),
    publisher: { '@id': ORGANIZATION_SCHEMA_ID },
    ...(type !== 'Article' && breadcrumbs.length ? { breadcrumb: { '@id': breadcrumbId } } : {}),
    ...(meaningfulFaqItems.length ? { hasPart: { '@id': faqId } } : {}),
    ...(citationUrls.length ? { citation: [...new Set(citationUrls)].filter(Boolean) } : {}),
  }

  const breadcrumb = breadcrumbs.length
    ? {
        '@type': 'BreadcrumbList',
        '@id': breadcrumbId,
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url.endsWith('/') ? item.url : `${item.url}/`,
        })),
      }
    : null

  const faq = meaningfulFaqItems.length > 0
    ? {
        '@type': 'FAQPage',
        '@id': faqId,
        url: canonical,
        isPartOf: { '@id': webpageId },
        mainEntity: meaningfulFaqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }
    : null

  const article = includeArticle && type !== 'Article'
    ? {
        '@type': 'Article',
        '@id': `${canonical}#article`,
        headline: title,
        description,
        url: canonical,
        inLanguage: 'en-US',
        mainEntityOfPage: { '@id': webpageId },
        isPartOf: { '@id': webpageId },
        author: { '@id': AUTHOR_SCHEMA_ID },
        publisher: { '@id': ORGANIZATION_SCHEMA_ID },
        ...(citationUrls.length ? { citation: [...new Set(citationUrls)].filter(Boolean) } : {}),
      }
    : null

  const graph = buildSchemaGraph([webpage, article, breadcrumb, faq])

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(graph) }}
    />
  )
}
