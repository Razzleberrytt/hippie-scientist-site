import { SeoEntryPage, generateSeoEntryMetadata } from '../../seo-entry-pages'
import StructuredData from '@/components/StructuredData'
import { ArticleLayout, RelatedArticles } from '@/components/articles'

const route = 'guides/magnesium-for-sleep'
const PAGE_URL = 'https://thehippiescientist.net/guides/magnesium-for-sleep'

export const metadata = {
  ...generateSeoEntryMetadata(route),
  robots: { index: true, follow: true },
}

const FAQS = [
  {
    question: 'What type of magnesium is best for sleep?',
    answer:
      'Magnesium glycinate (bisglycinate) has the strongest evidence for sleep and anxiety support, with high elemental magnesium content, excellent bioavailability, and minimal laxative effect. Magnesium L-threonate is a newer form that crosses the blood-brain barrier more efficiently and has been studied for cognitive and sleep applications. Avoid magnesium oxide — it has poor bioavailability despite appearing high-dose on labels.',
  },
  {
    question: 'How much magnesium should I take for sleep?',
    answer:
      'Most clinical trials for sleep improvement use 200–400 mg of elemental magnesium per day, typically taken 30–60 minutes before bed. The tolerable upper intake level (UL) from supplements is 350 mg/day for adults — above this, GI side effects (loose stool) become more common. Start at 150–200 mg and titrate up based on tolerance.',
  },
  {
    question: 'How long does magnesium take to improve sleep?',
    answer:
      'Subjective improvements in sleep onset and night waking are typically reported within 2–4 weeks of consistent use. Studies measuring objective sleep architecture (via polysomnography) show changes at 4–8 weeks. The effect is most pronounced in individuals with baseline magnesium deficiency, which is common due to dietary insufficiency.',
  },
  {
    question: 'Can magnesium help with anxiety as well as sleep?',
    answer:
      'Yes — magnesium has evidence for both. As a GABA-A receptor modulator and NMDA receptor blocker, it reduces neuronal excitability. Several randomized trials show modest reductions in anxiety scores (GAD-7, HAMA) over 6–8 weeks. The sleep and anxiety effects likely share a common mechanism through reduced neuronal overactivity.',
  },
  {
    question: 'Is magnesium safe to take every night?',
    answer:
      'Magnesium from food and supplements is considered safe for most adults at doses within the UL (350 mg/day from supplements). Long-term nightly use is supported in populations with chronic deficiency. Key cautions: kidney disease impairs magnesium excretion, increasing toxicity risk; and magnesium can interact with some antibiotics (tetracyclines, fluoroquinolones) and bisphosphonates if taken simultaneously.',
  },
]

const RELATED_GUIDES = [
  {
    href: '/guides/turmeric-curcumin',
    title: 'Turmeric & Curcumin Guide',
    description: 'Anti-inflammatory evidence, bioavailability forms, and dosage comparison.',
    category: 'stress' as const,
  },
  {
    href: '/guides/ashwagandha',
    title: 'Ashwagandha Guide',
    description: 'Cortisol modulation, stress adaptation, and sleep quality evidence.',
    category: 'stress' as const,
  },
  {
    href: '/guides/lions-mane',
    title: "Lion's Mane Guide",
    description: 'Cognitive support, NGF synthesis, and neuroregeneration evidence.',
    category: 'focus' as const,
  },
]

export default function MagnesiumForSleepGuidePage() {
  return (
    <ArticleLayout zone="supplement">
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Magnesium for Sleep and Anxiety: Evidence, Forms, and Dosage Guide"
        description="Science-backed breakdown of magnesium forms (glycinate, L-threonate, oxide), dosage ranges, evidence for sleep improvement and anxiety reduction, and safety context."
        datePublished="2024-10-01"
        dateModified="2026-06-14"
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Magnesium for Sleep', href: '/guides/magnesium-for-sleep' },
        ]}
      />
      <SeoEntryPage route={route} />
      <RelatedArticles articles={RELATED_GUIDES} />
    </ArticleLayout>
  )
}
