import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import EditorialFamilyNav from '@/components/navigation/EditorialFamilyNav'
import { SITE_URL } from '@/lib/navigation-config'
import { buildTwitterMetadata } from '@/lib/seo'
import NewsletterSignup from '@/components/NewsletterSignup'

export const metadata: Metadata = {
  title: 'Guides — Topics, Comparisons & Practical Decisions',
  description:
    'Browse The Hippie Scientist guides by health topic or decision type, with separate homes for education, articles, ingredient lookups, safety, and research.',
  alternates: { canonical: `${SITE_URL}/guides/` },
  openGraph: {
    title: 'Guides — Topics, Comparisons & Practical Decisions',
    description: 'Choose a health topic, compare options, or find a practical evidence-aware guide.',
    url: `${SITE_URL}/guides/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Guides — Topics, Comparisons & Practical Decisions',
    description: 'Choose a health topic, compare options, or find a practical evidence-aware guide.',
  }),
}

const GUIDE_GROUPS = [
  {
    title: 'Browse by health topic',
    description: 'Start here when the question is about a condition, symptom pattern, or functional goal.',
    items: [
      { title: 'Mental Health', href: '/guides/mental-health/', desc: 'Conditions, relationships, treatment evidence, safety, and stigma-aware research.' },
      { title: 'ADHD', href: '/guides/adhd/', desc: 'Attention, executive function, nutrients, supplements, and treatment context.' },
      { title: 'Sleep', href: '/guides/sleep/', desc: 'Sleep aids, insomnia evidence, melatonin alternatives, and practical sleep decisions.' },
      { title: 'Anxiety', href: '/guides/anxiety/', desc: 'Evidence-aware guides for anxious thoughts, physical tension, and calm.' },
      { title: 'Stress', href: '/guides/stress/', desc: 'Acute tension, chronic overload, burnout, adaptogens, and stress-support decisions.' },
      { title: 'Focus & Cognition', href: '/guides/focus/', desc: 'Nootropics, cognitive performance, stimulant tradeoffs, and focus support.' },
      { title: 'Metabolic Health', href: '/guides/metabolic-health/', desc: 'Blood sugar, insulin sensitivity, weight-loss claims, and medication context.' },
    ],
  },
  {
    title: 'Make a supplement or substance decision',
    description: 'Use these when you are comparing options, researching a substance, or choosing what kind of product or intervention to investigate.',
    items: [
      { title: 'Substance Use & Harm Reduction', href: '/guides/substance-use/', desc: 'Dependence, withdrawal, overdose risk, kratom-derived opioids, tianeptine, and emerging psychoactives.' },
      { title: 'Comparisons', href: '/guides/compare/', desc: 'Head-to-head comparisons by evidence, safety, form, dose, and practical tradeoffs.' },
      { title: 'Best Supplements', href: '/guides/best/', desc: 'Evidence-aware roundups organized around a specific need or decision.' },
      { title: 'Herb Guides', href: '/guides/herbs/', desc: 'Long-form practical guides for important botanicals and extracts.' },
      { title: 'Supplement Topic Guides', href: '/guides/other/', desc: 'Forms, quality, routines, advanced compounds, and topics outside a single goal.' },
    ],
  },
] as const

const OTHER_DESTINATIONS = [
  { label: 'Look up an ingredient', href: '/herbs/', detail: 'Use the herb or compound databases.' },
  { label: 'Check safety', href: '/safety-checker/', detail: 'Use interaction and contraindication tools.' },
  { label: 'Verify the research', href: '/research/', detail: 'Use citations, evidence tools, reports, and methodology.' },
] as const

function GuideCard({ title, href, desc }: { title: string; href: string; desc: string }) {
  return (
    <Link
      href={href}
      className='card-premium group flex min-h-[9rem] flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2'
    >
      <h3 className='text-lg font-semibold leading-snug tracking-tight text-ink'>{title}</h3>
      <p className='mt-2 text-sm leading-6 text-muted'>{desc}</p>
      <span className='mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold text-brand-700'>
        Explore
        <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' aria-hidden='true' />
      </span>
    </Link>
  )
}

export default function GuidesHub() {
  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 pb-24 pt-4 sm:pt-6'>
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Guides' }]} />

      <header className='hero-shell rounded-[2rem] border px-5 py-6 sm:p-8'>
        <p className='eyebrow-label'>Editorial library · Decisions and topics</p>
        <h1 className='heading-premium mt-5 max-w-4xl'>Guides</h1>
        <p className='text-reading mt-4 max-w-3xl'>
          Choose the question you want answered. Guides organize practical decisions and health topics; concepts live in Learn, and research/editorial reading lives in Articles.
        </p>
      </header>

      <EditorialFamilyNav active='guides' />

      {GUIDE_GROUPS.map((group) => (
        <section key={group.title} aria-labelledby={'group-' + group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
          <div className='max-w-3xl'>
            <h2 id={'group-' + group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')} className='compact-heading'>
              {group.title}
            </h2>
            <p className='mt-2 text-sm leading-6 text-muted'>{group.description}</p>
          </div>
          <div className='mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {group.items.map((item) => <GuideCard key={item.href} {...item} />)}
          </div>
        </section>
      ))}

      <aside className='section-frame p-5 sm:p-6' aria-labelledby='other-destinations-heading'>
        <p className='eyebrow-label'>Different job?</p>
        <h2 id='other-destinations-heading' className='mt-2 text-xl font-semibold text-ink'>
          Use the destination that matches what you are trying to do
        </h2>
        <div className='mt-4 grid gap-3 md:grid-cols-3'>
          {OTHER_DESTINATIONS.map((item) => (
            <Link key={item.href} href={item.href} className='rounded-xl border border-brand-900/10 bg-white p-4 transition hover:bg-brand-50/40'>
              <span className='block text-sm font-semibold text-brand-800'>{item.label} →</span>
              <span className='mt-1 block text-xs leading-5 text-muted'>{item.detail}</span>
            </Link>
          ))}
        </div>
      </aside>
      <NewsletterSignup location='guides-hub' variant='compact' />
    </div>
  )
}
