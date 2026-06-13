import { buildSchemaGraph } from '@/lib/schema-graph'
import { SITE_URL } from '@/lib/seo'

type FaqItem = { question: string; answer: string }

type AuthorityJsonLdProps = {
  title: string
  description: string
  url: string
  type?: 'Article' | 'CollectionPage' | 'MedicalWebPage'
  breadcrumbs?: Array<{
    name: string
    url: string
  }>
  faqItems?: FaqItem[]
}

export default function AuthorityJsonLd({
  title,
  description,
  url,
  type = 'CollectionPage',
  breadcrumbs = [],
  faqItems,
}: AuthorityJsonLdProps) {
  const normalizedUrl = url.replace('https://thehippiescientist.net', SITE_URL)
  const canonical = normalizedUrl.endsWith('/') ? normalizedUrl : `${normalizedUrl}/`
  const webpageId = `${canonical}#webpage`
  const breadcrumbId = `${canonical}#breadcrumb`
  const faqId = `${canonical}#faq`

  const webpage = {
    '@type': type === 'MedicalWebPage' ? ['MedicalWebPage', 'WebPage'] : type,
    '@id': webpageId,
    name: title,
    headline: title,
    description,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'The Hippie Scientist', url: SITE_URL },
    ...(breadcrumbs.length ? { breadcrumb: { '@id': breadcrumbId } } : {}),
    ...(faqItems?.length ? { hasPart: { '@id': faqId } } : {}),
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
    faqItems && faqItems.length > 0
      ? {
          '@type': 'FAQPage',
          '@id': faqId,
          url: canonical,
          isPartOf: { '@id': webpageId },
          mainEntity: faqItems.map((item) => ({
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
        __html: JSON.stringify(graph).replace(/</g, '\\u003c'),
      }}
    />
  )
}
