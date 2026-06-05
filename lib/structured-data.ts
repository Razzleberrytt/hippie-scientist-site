export function buildMedicalWebPageSchema(entity: any, type: 'herb' | 'compound') {
  const url = `https://thehippiescientist.net/${type === 'herb' ? 'herbs' : 'compounds'}/${entity.slug}/`
  const description = entity.description || entity.summary || `${entity.name} profile – mechanisms, safety, evidence level, and practical context.`

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: entity.name,
    description: description,
    url: url,
    mainEntityOfPage: url,
    medicalAudience: {
      '@type': 'MedicalAudience',
      audienceType: 'Patient'
    },
    about: {
      '@type': type === 'herb' ? 'Drug' : 'ChemicalSubstance',
      name: entity.name,
      description: description
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Hippie Scientist',
      url: 'https://thehippiescientist.net',
      logo: {
        '@type': 'ImageObject',
        url: 'https://thehippiescientist.net/logo.png'
      }
    }
  }
}

export function buildArticleSchema(post: any) {
  const url = `https://thehippiescientist.net/blog/${post.slug}/`
  const datePublished = post.date ? new Date(post.date).toISOString() : new Date().toISOString()
  const dateModified = post.lastModified || post.updated || post.date 
    ? new Date(post.lastModified || post.updated || post.date).toISOString() 
    : datePublished

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.description || post.summary || '',
    datePublished: datePublished,
    dateModified: dateModified,
    mainEntityOfPage: url,
    url: url,
    author: {
      '@type': 'Organization',
      name: 'The Hippie Scientist'
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Hippie Scientist',
      logo: {
        '@type': 'ImageObject',
        url: 'https://thehippiescientist.net/logo.png'
      }
    }
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
      item: item.url.endsWith('/') || item.url.includes('?') || item.url.includes('#') ? item.url : `${item.url}/`
    }))
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
        text: faq.answer
      }
    }))
  }
}
