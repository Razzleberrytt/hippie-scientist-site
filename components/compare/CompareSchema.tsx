import type { CompareItem } from '@/lib/compare'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

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
  const isAshwagandhaRhodiola =
    (item1.slug === 'ashwagandha' && item2.slug === 'rhodiola') ||
    (item1.slug === 'rhodiola' && item2.slug === 'ashwagandha')

  const breadcrumbs = [
    { name: 'Home', url: 'https://thehippiescientist.net' },
    { name: 'Compare', url: 'https://thehippiescientist.net/compare' },
    { name: `${item1.name} vs ${item2.name}`, url: canonicalUrl },
  ]

  const faqItems = isAshwagandhaRhodiola
    ? [
        {
          question: 'Which is better, ashwagandha or rhodiola?',
          answer: 'Neither is universally better; they target different stress presentations. Ashwagandha is usually better suited for calming tense, overactive stress patterns and supporting sleep. Rhodiola is better suited for fatigue-heavy stress, burnout, and mental stamina.',
        },
        {
          question: 'Can you take ashwagandha and rhodiola together?',
          answer: 'Yes, some users combine them since their mechanisms do not directly overlap. However, taking them together makes it harder to identify which supplement is causing specific benefits or side effects. It is generally recommended to test each adaptogen individually first before stacking them, and to consult with a healthcare professional.',
        },
        {
          question: 'Which works faster?',
          answer: 'Rhodiola is typically faster-acting, with acute cognitive and physical effects (such as fatigue resistance and focus) felt within 30 to 60 minutes. Ashwagandha generally requires daily, consistent use for 2 to 8 weeks to build systemic support and modulate baseline cortisol levels.',
        },
        {
          question: 'Which is better for stress?',
          answer: 'Ashwagandha is better for stress that manifests as anxiety, tension, and evening racing thoughts. Rhodiola is better for stress that results in exhaustion, physical lethargy, or cognitive burnout.',
        },
        {
          question: 'Which is better for energy and focus?',
          answer: 'Rhodiola is the superior choice for energy and focus. It acts as an acute stimulant-free adaptogen to reduce fatigue. Ashwagandha is relaxing rather than energizing and is better suited for restorative recovery.',
        },
      ]
    : [
        {
          question: `How do ${item1.name} and ${item2.name} differ?`,
          answer: `They are distinct classes of supplements. ${item1.name} has evidence for ${item1.primaryBenefits.join(', ') || 'general recovery'}, whereas ${item2.name} is studied for ${item2.primaryBenefits.join(', ') || 'general performance'}.`,
        },
      ]

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
