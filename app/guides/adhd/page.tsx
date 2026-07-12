import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/src/lib/seo'
import References from '@/components/References'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { buildGuideHubSchemaGraph } from '../../../src/lib/schema-graph'

export const metadata: Metadata = {
  title: 'ADHD Supplement Guides & Research',
  description: 'Evidence-based guides on ADHD supplements, nutrient deficiencies, and medication context. Magnesium, omega-3, L-theanine, iron, zinc, and more.',
  alternates: { canonical: `${SITE_URL}/guides/adhd/` },
  openGraph: {
    title: 'ADHD Supplement Guides & Research',
    description: 'Evidence-based guides on ADHD supplements, nutrient deficiencies, and medication context.',
    url: `${SITE_URL}/guides/adhd/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
}

const GUIDES = [
  { slug: 'best-supplements-for-adhd', title: 'Best Supplements for ADHD', desc: 'Evidence-graded review of the top supplements studied for ADHD symptom support.' },
  { slug: 'adhd-stack-guide', title: 'ADHD Stack Guide', desc: 'How to combine supplements for ADHD — timing, synergies, and safety.' },
  { slug: 'best-magnesium-supplement-for-adhd', title: 'Best Magnesium for ADHD', desc: 'Comparing magnesium glycinate, citrate, and threonate for ADHD support.' },
  { slug: 'adhd-supplements', title: 'ADHD Supplements Overview', desc: 'Complete overview of supplements studied for attention and executive function.' },
  { slug: 'magnesium-for-adhd', title: 'Magnesium for ADHD', desc: 'How magnesium affects dopamine, focus, and hyperactivity.' },
  { slug: 'omega-3-and-adhd', title: 'Omega-3 and ADHD', desc: 'EPA and DHA fatty acids for attention and impulse control.' },
  { slug: 'l-theanine-for-adhd', title: 'L-Theanine for ADHD', desc: 'Calm focus without sedation — L-theanine\'s role in ADHD.' },
  { slug: 'iron-ferritin-and-adhd', title: 'Iron, Ferritin, and ADHD', desc: 'The link between low iron and ADHD symptoms — when to test and supplement.' },
  { slug: 'zinc-and-adhd', title: 'Zinc and ADHD', desc: 'Zinc\'s role in dopamine regulation and ADHD symptom management.' },
  { slug: 'vitamin-d-and-adhd', title: 'Vitamin D and ADHD', desc: 'Vitamin D deficiency and its relationship to attention and mood.' },
  { slug: 'citicoline-for-adhd', title: 'Citicoline for ADHD', desc: 'Citicoline as a cognitive enhancer for attention and working memory.' },
  { slug: 'alpha-gpc-and-adhd', title: 'Alpha-GPC and ADHD', desc: 'Choline source studied for focus and cognitive processing speed.' },
  { slug: 'citicoline-vs-alpha-gpc', title: 'Citicoline vs Alpha-GPC', desc: 'Head-to-head comparison of two leading choline supplements for ADHD.' },
  { slug: 'ashwagandha-for-adhd', title: 'Ashwagandha for ADHD', desc: 'Can ashwagandha\'s stress-reducing effects help with ADHD symptoms?' },
  { slug: 'l-tyrosine-and-adhd', title: 'L-Tyrosine and ADHD', desc: 'Dopamine precursor studied for focus and cognitive demand.' },
  { slug: 'rhodiola-rosea-and-adhd', title: 'Rhodiola Rosea and ADHD', desc: 'Adaptogenic support for mental fatigue and attention.' },
  { slug: 'nutrient-deficiencies-and-adhd', title: 'Nutrient Deficiencies and ADHD', desc: 'Which deficiencies are most common in ADHD and what to test.' },
  { slug: 'l-theanine-magnesium-adhd-stack', title: 'L-Theanine + Magnesium ADHD Stack', desc: 'Combining these two for synergistic calm-focus support.' },
  { slug: 'magnesium-glycinate-vs-citrate-for-adhd', title: 'Magnesium Glycinate vs Citrate for ADHD', desc: 'Which magnesium form is better for ADHD symptoms?' },
  { slug: 'adhd-blood-tests', title: 'ADHD Blood Tests', desc: 'What lab work to consider when evaluating ADHD — nutrients, hormones, and markers.' },
  { slug: 'melatonin-for-adhd-sleep', title: 'Melatonin for ADHD Sleep', desc: 'Melatonin for ADHD-related sleep onset difficulties.' },
  { slug: 'sleep-and-adhd', title: 'Sleep and ADHD', desc: 'The bidirectional relationship between sleep quality and ADHD symptoms.' },
]

const ADHD_REFS = [
  { n: 1, text: 'Bloch MH, et al. (2015). Nutritional supplements for ADHD. Child Adolesc Psychiatr Clin N Am, 23(4): 883-897.', url: 'https://pubmed.ncbi.nlm.nih.gov/25220094/' },
  { n: 2, text: 'Rucklidge JJ, et al. (2014). Vitamin-mineral treatment of ADHD. Br J Psychiatry, 204(4): 306-315.', url: 'https://pubmed.ncbi.nlm.nih.gov/24434087/' },
]

export default function AdhdGuideIndex() {
  const schemaGraph = buildGuideHubSchemaGraph({
    path: '/guides/adhd/',
    title: 'ADHD Supplement Guides & Research',
    description:
      'Evidence-based guides on ADHD supplements, nutrient deficiencies, and medication context. Magnesium, omega-3, L-theanine, iron, zinc, and more.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Guides', url: `${SITE_URL}/guides/` },
      { name: 'ADHD', url: `${SITE_URL}/guides/adhd/` },
    ],
    itemListName: 'ADHD Supplement Guides',
    items: GUIDES.map((g) => ({ name: g.title, url: `/guides/adhd/${g.slug}/` })),
  })

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <SchemaGraphScript graph={schemaGraph} />
      <nav className="text-xs text-muted mb-4">
        <Link href="/guides/" className="hover:text-ink">Guides</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink font-medium">ADHD</span>
      </nav>
      
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">ADHD Supplement Guides</h1>
        <p className="mt-3 text-lg text-muted max-w-2xl">
          Evidence-based guides on supplements, nutrients, and strategies for ADHD. 
          Every guide is referenced to published research.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/adhd/${guide.slug}/`}
            className="rounded-xl border border-brand-900/10 bg-white p-5 transition hover:border-brand-700/30 hover:shadow-sm"
          >
            <h3 className="font-semibold text-ink">{guide.title}</h3>
            <p className="mt-1.5 text-sm text-muted leading-relaxed">{guide.desc}</p>
          </Link>
        ))}
      </div>
      <References refs={ADHD_REFS} />
    </div>
  )
}
