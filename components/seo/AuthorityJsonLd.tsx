import { buildSchemaGraph } from '../../src/lib/schema-graph'
import { serializeJsonLd } from '../../src/lib/schema-injector'
import { SITE_URL } from '../../src/lib/seo'

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
}

function normalizeFaqItem(item: FaqItem): FaqItem | null {
  const question = String(item.question || '').trim()
  const answer = String(item.answer || '').trim()

  if (question.length < 12 || answer.length <= 50) {
    return null
  }

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
}: AuthorityJsonLdProps) {
  const normalizedUrl = url.replace('https://thehippiescientist.net', SITE_URL)
  const canonical = normalizedUrl.endsWith('/') ? normalizedUrl : `${normalizedUrl}/`
  const webpageId = `${canonical}#webpage`
  const breadcrumbId = `${canonical}#breadcrumb`
  const faqId = `${canonical}#faq`
  const meaningfulFaqItems = getMeaningfulFaqItems(faqItems)

  const webpage = {
    '@type': type === 'MedicalWebPage' ? ['MedicalWebPage', 'WebPage'] : type,
    '@id': webpageId,
    name: title,
    headline: title,
    description,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'The Hippie Scientist', url: SITE_URL },
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

  const faq =
    meaningfulFaqItems.length > 0
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

  const graph = buildSchemaGraph([webpage, breadcrumb, faq])

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(graph),
      }}
    />
  )
}
