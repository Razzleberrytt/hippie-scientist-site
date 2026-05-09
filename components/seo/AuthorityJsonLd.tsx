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
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    name: title,
    headline: title,
    description,
    url,
  }

  const breadcrumbSchema = breadcrumbs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }
    : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />

      {breadcrumbSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
      ) : null}
    </>
  )
}
