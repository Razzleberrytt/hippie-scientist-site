import type { CompareItem } from '@/lib/compare'

interface CompareFAQProps {
  item1: CompareItem
  item2: CompareItem
}

type FAQItem = {
  question: string
  answer: string
}

export default function CompareFAQ({ item1, item2 }: CompareFAQProps) {
  const isAshwagandhaRhodiola =
    (item1.slug === 'ashwagandha' && item2.slug === 'rhodiola') ||
    (item1.slug === 'rhodiola' && item2.slug === 'ashwagandha')

  const faqs: FAQItem[] = [
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

  const activeFaqs = isAshwagandhaRhodiola
    ? faqs
    : [
        {
          question: `How do ${item1.name} and ${item2.name} differ?`,
          answer: `They are distinct classes of supplements. ${item1.name} has evidence for ${item1.primaryBenefits.join(', ') || 'general recovery'}, whereas ${item2.name} is studied for ${item2.primaryBenefits.join(', ') || 'general performance'}.`,
        },
        {
          question: `Can I take ${item1.name} and ${item2.name} on the same day?`,
          answer: `Co-administration depends on your specific goals and safety constraints. Review their respective cautions, interactions, and consult a doctor first.`,
        },
      ]

  return (
    <section className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">FAQ</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink mt-1">
          Common Questions
        </h2>
      </div>

      <div className="space-y-4">
        {activeFaqs.map((faq, index) => (
          <details key={index} className="accordion-readable group">
            <summary className="cursor-pointer select-none">
              <span>{faq.question}</span>
              <svg
                className="h-5 w-5 text-brand-700 transform transition-transform duration-200 group-open:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted whitespace-pre-wrap">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
export type { FAQItem }
