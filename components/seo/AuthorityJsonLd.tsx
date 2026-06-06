import { buildSchemaGraph } from '@/lib/schema-graph'
import { SITE_URL } from '@/lib/seo'

type AuthorityJsonLdProps = {
  title: string
  description: string
  url: string
  type?: 'Article' | 'CollectionPage' | 'MedicalWebPage'
  breadcrumbs?: Array<{
    name: string
    url: string
  }>
}

export default function AuthorityJsonLd({
  title,
  description,
  url,
  type = 'CollectionPage',
  breadcrumbs = [],
}: AuthorityJsonLdProps) {
  const normalizedUrl = url.replace('https://thehippiescientist.net', SITE_URL)
  const canonical = normalizedUrl.endsWith('/') ? normalizedUrl : `${normalizedUrl}/`
  const webpageId = `${canonical}#webpage`
  const breadcrumbId = `${canonical}#breadcrumb`

  const webpage = {
    '@type': type === 'MedicalWebPage' ? ['MedicalWebPage', 'WebPage'] : type,
    '@id': webpageId,
    name: title,
    headline: title,
    description,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'The Hippie Scientist', url: SITE_URL },
    ...(breadcrumbs.length ? { breadcrumb: { '@id': breadcrumbId } } : {}),
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

  const graph = buildSchemaGraph([webpage, breadcrumb])

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph),
      }}
    />
  )
}
