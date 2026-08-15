const SITE_URL = 'https://thehippiescientist.net'
const AUTHOR_URL = `${SITE_URL}/info/author/`

function toIsoDate(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'The Hippie Scientist',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.svg`,
    },
  }
}

export function buildPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${AUTHOR_URL}#person`,
    name: 'Willie B. Randolph III',
    url: AUTHOR_URL,
    affiliation: { '@id': `${SITE_URL}/#organization` },
  }
}

export function buildMedicalWebPageSchema(entity: Record<string, unknown>, type: 'herb' | 'compound') {
  const url = `${SITE_URL}/${type === 'herb' ? 'herbs' : 'compounds'}/${entity.slug}/`
  const description = entity.description || entity.summary || `${entity.name} profile – mechanisms, safety, evidence level, and practical context.`

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: entity.name,
    description,
    url,
    mainEntityOfPage: url,
    // This is an educational research page, not a clinical service. Avoid
    // MedicalAudience/Patient and profession-bearing schema that could imply a
    // clinical relationship or credential the site does not claim.
    about: {
      '@type': 'Substance',
      name: entity.name,
      description,
    },
    author: { '@id': `${AUTHOR_URL}#person` },
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

export function buildArticleSchema(post: Record<string, unknown>) {
  const url = `${SITE_URL}/articles/${post.slug}/`
  const datePublished = toIsoDate(post.date || post.datePublished)
  const dateModified = toIsoDate(post.lastModified || post.updated || post.dateModified || post.date || post.datePublished)

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.description || post.summary || '',
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    mainEntityOfPage: url,
    url,
    author: { '@id': `${AUTHOR_URL}#person` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    ...(post.image ? { image: post.image } : {}),
  }
}

export function buildDatasetSchema(dataset: Record<string, unknown>) {
  const url = String(dataset.url || '')
  const datePublished = toIsoDate(dataset.datePublished)
  const dateModified = toIsoDate(dataset.dateModified)
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: dataset.name,
    description: dataset.description,
    url,
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    creator: { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    ...(dataset.license ? { license: dataset.license } : {}),
    ...(dataset.distribution ? { distribution: dataset.distribution } : {}),
  }
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.endsWith('/') || item.url.includes('?') || item.url.includes('#') ? item.url : `${item.url}/`,
    })),
  }
}

export function buildFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
