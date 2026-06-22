import type { CompareItem } from '@/lib/compare'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import { getCompareFaqs } from './CompareFAQ'

interface CompareSchemaProps {
  item1: CompareItem
  item2: CompareItem
  title: string
  description: string
  canonicalUrl: string
}

export default function CompareSchema({
  item1,
  item2,
  title,
  description,
  canonicalUrl,
}: CompareSchemaProps) {
  const breadcrumbs = [
    { name: 'Home', url: 'https://thehippiescientist.net' },
    { name: 'Compare', url: 'https://thehippiescientist.net/compare' },
    { name: `${item1.name} vs ${item2.name}`, url: canonicalUrl },
  ]

  const faqItems = getCompareFaqs(item1, item2)

  return (
    <AuthorityJsonLd
      title={title}
      description={description}
      url={canonicalUrl}
      type="Article"
      breadcrumbs={breadcrumbs}
      faqItems={faqItems}
    />
  )
}
