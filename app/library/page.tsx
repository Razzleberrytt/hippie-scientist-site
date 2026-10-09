import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { coreGoals } from '@/lib/core-goals'
import { siteDestinationById, type SiteDestinationId } from '@/lib/site-destinations'
import { SITE_URL } from '@/lib/navigation-config'
import { buildTwitterMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Explore Everything — Complete Site Directory',
  description:
    'The complete directory for The Hippie Scientist, organized under Goals, Guides, Ingredients, Safety, Research, and supporting site information.',
  alternates: { canonical: `${SITE_URL}/library/` },
  openGraph: {
    title: 'Explore Everything — The Hippie Scientist',
    description:
      'Browse the complete site directory using the same five destinations that organize the rest of The Hippie Scientist.',
    url: `${SITE_URL}/library/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Explore Everything — The Hippie Scientist',
    description: 'Browse the complete site directory using the same five destinations that organize the rest of The Hippie Scientist.',
  }),
}

type DirectoryLink = { label: string; href: string; detail: string }

const destinationGroups: Array<{ id: SiteDestinationId; links: DirectoryLink[] }> = [
  {
    id: 'goals',
    links: [
      { label: 'Goal finder', href: '/goals/', detail: 'Start from the outcome or question you are researching' },
      ...coreGoals.map((goal) => ({ label: goal.label, href: goal.href, detail: goal.description })),
      { label: 'Metabolic health research', href: '/goals/metabolic-health/', detail: 'Berberine-centered metabolic-health evidence path' },
    ],
  },
  {
    id: 'guides',
    links: [
      { label: 'All guides', href: '/guides/', detail: 'Health topics, decisions, comparisons, and practical research paths' },
      { label: 'Learning library', href: '/learn/', detail: 'Evidence literacy, neuroscience, mechanisms, and educational context' },
      { label: 'All articles', href: '/articles/', detail: 'Research notes, evidence reviews, updates, and editorial reading' },
      { label: 'Mental Health', href: '/guides/mental-health/', detail: 'Conditions, relationships, treatment evidence, and stigma-aware research' },
      { label: 'ADHD', href: '/guides/adhd/', detail: 'Attention, executive function, nutrients, and treatment context' },
      { label: 'Sleep', href: '/guides/sleep/', detail: 'Sleep aids, insomnia evidence, and practical sleep decisions' },
      { label: 'Anxiety', href: '/guides/anxiety/', detail: 'Calm, tension, anxious thoughts, and supplement evidence' },
      { label: 'Stress', href: '/guides/stress/', detail: 'Stress load, burnout, adaptogens, and recovery context' },
      { label: 'Focus & Cognition', href: '/guides/focus/', detail: 'Nootropics, cognitive performance, and stimulant tradeoffs' },
      { label: 'Metabolic Health', href: '/guides/metabolic-health/', detail: 'Blood sugar, insulin sensitivity, and treatment-context explainers' },
      { label: 'Substance Use & Harm Reduction', href: '/guides/substance-use/', detail: 'Dependence, withdrawal, overdose risk, and emerging psychoactives' },
      { label: 'Comparisons', href: '/guides/compare/', detail: 'Side-by-side supplement and compound tradeoffs' },
      { label: 'Best supplements', href: '/guides/best/', detail: 'Evidence-aware roundups organized by a specific need' },
      { label: 'Herb guides', href: '/guides/herbs/', detail: 'Long-form practical guides for important botanicals' },
      { label: 'More supplement topics', href: '/guides/other/', detail: 'Forms, quality, routines, advanced compounds, and other decisions' },
      { label: 'Neuroscience glossary', href: '/learn/neuroscience-glossary/', detail: 'Plain-English brain, pathway, and receptor terms' },
      { label: 'Free decision guide', href: '/info/free-guide/', detail: 'A downloadable introduction to safer supplement research' },
    ],
  },
  {
    id: 'ingredients',
    links: [
      { label: 'Herb database', href: '/herbs/', detail: 'Alphabetical herb profiles with evidence and safety summaries' },
      { label: 'Compound database', href: '/compounds/', detail: 'Nutrients, active compounds, medications, and standardized extracts' },
      { label: 'Search everything', href: '/search/', detail: 'Search indexed herbs, compounds, and site content by name or topic' },
      { label: 'Dosing guide', href: '/info/dosing/', detail: 'Bioavailability, timing, stacking, and label-dose realism' },
      { label: 'Product quality', href: '/learn/product-quality/', detail: 'Labels, standardization, testing, and quality signals' },
    ],
  },
  {
    id: 'safety',
    links: [
      { label: 'Safety checker', href: '/safety-checker/', detail: 'Screen a stack for overlapping caution and interaction signals' },
      { label: 'Interaction guides', href: '/safety-checker/interactions/', detail: 'Evidence-gated supplement and medication-class interaction reviews' },
      { label: 'Understand interactions', href: '/learn/interactions/', detail: 'Mechanisms, pathway overlap, stacking, and uncertainty' },
      { label: 'Supplement safety checklist', href: '/info/supplement-safety-checklist/', detail: 'Medication, dose, stacking, and product-quality checks before buying' },
      { label: 'Novel psychoactive substances', href: '/novel-psychoactive-substances/', detail: 'Harm-reduction profiles for emerging substances' },
    ],
  },
  {
    id: 'research',
    links: [
      { label: 'Research library', href: '/research/', detail: 'Choose a research task: source lookup, evidence check, report, or methodology' },
      { label: 'PubMed source register', href: '/research/source-register/', detail: 'Browse verified research-intake titles and the historical unique PMID index; not evidence grades' },
      { label: 'Research Intelligence Studio', href: '/research/intelligence/', detail: 'Eight provenance-bound semantic research instruments for source questions, comparisons, and editorial review' },
      { label: 'Evidence lookup', href: '/evidence/evidence-checker/', detail: 'Inspect ingredient-level evidence grades and source coverage' },
      { label: 'Evidence report', href: '/evidence/evidence-report/', detail: 'Library-wide evidence metrics, grade distribution, and public data' },
      { label: 'Evidence digest', href: '/evidence/evidence-digest/', detail: 'Recent human-trial highlights and research summaries' },
      { label: 'Citation explorer', href: '/learn/citation-explorer/', detail: 'Explore the study-level source index' },
      { label: 'Methodology', href: '/info/methodology/', detail: 'How evidence grades, safety language, and uncertainty are handled' },
      { label: 'Botanical Activity Atlas', href: '/tools/botanical-activity-atlas/', detail: 'Explore evidence and mechanism relationships' },
      { label: 'Efficacy model', href: '/learn/efficacy-model/', detail: 'Interactive supplement-efficacy exploration' },
      { label: 'Pathway explorer', href: '/learn/explorer/', detail: 'Explore biological pathway connections' },
      { label: 'Infographics', href: '/info/infographics/', detail: 'Downloadable and embeddable evidence visuals' },
      { label: 'Research roadmap', href: '/info/research-roadmap/', detail: 'What is being improved next and how to suggest a topic' },
      { label: 'For writers & journalists', href: '/info/research-resources-for-writers/', detail: 'Report data, citation guidance, graphics, and contact routes' },
    ],
  },
]

const infoLinks: DirectoryLink[] = [
  { label: 'Site information', href: '/info/', detail: 'The trust, policy, support, and resource hub' },
  { label: 'About', href: '/info/about/', detail: 'The mission and editorial approach' },
  { label: 'Author', href: '/info/author/', detail: 'Author identity and accountability' },
  { label: 'FAQ', href: '/info/faq/', detail: 'Common questions about the site and its evidence language' },
  { label: 'Contact', href: '/info/contact/', detail: 'Corrections, feedback, and general contact' },
  { label: 'Editorial policy', href: '/info/editorial-policy/', detail: 'Source inclusion, conflict resolution, and automation policy' },
  { label: 'Corrections', href: '/info/corrections/', detail: 'Public history of material scientific and safety corrections' },
  { label: 'Disclaimer', href: '/info/disclaimer/', detail: 'Educational-use and medical-advice limitations' },
  { label: 'Privacy', href: '/info/privacy/', detail: 'Analytics, cookies, email, and contact-data handling' },
  { label: 'Affiliate disclosure', href: '/info/affiliate-disclosure/', detail: 'How commercial links and editorial independence are handled' },
  { label: 'Licensing & attribution', href: '/info/content-licensing/', detail: 'How to cite or reuse structured research data' },
  { label: 'Newsletter', href: '/info/newsletter/', detail: 'Evidence notes, safety checklists, and product-quality reminders' },
]

function DirectoryLinks({ links }: { links: DirectoryLink[] }) {
  return (
    <div className='mt-5 divide-y divide-brand-900/10 border-y border-brand-900/10'>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className='group flex items-start justify-between gap-4 py-3.5'>
          <span>
            <span className='block text-sm font-bold text-ink group-hover:text-brand-800'>{link.label}</span>
            <span className='mt-1 block text-xs leading-5 text-muted'>{link.detail}</span>
          </span>
          <ArrowRight className='mt-1 h-4 w-4 shrink-0 text-brand-700 transition-transform group-hover:translate-x-1' aria-hidden='true' />
        </Link>
      ))}
    </div>
  )
}

export default function SiteDirectoryPage() {
  return (
    <div className='mx-auto max-w-6xl space-y-10 px-4 pb-24 pt-8 sm:px-6 lg:px-8'>
      <header className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Complete site directory</p>
        <h1 className='mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          Everything, grouped the same way as the rest of the site.
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          Library is the intentionally exhaustive view. The five primary destinations stay the same; Site Information is kept separate as trust, policy, support, and resource documentation.
        </p>
        <Link href='/search/' className='btn-primary mt-6 inline-flex items-center gap-2'>
          <Search className='h-4 w-4' aria-hidden='true' />
          Search everything
        </Link>
      </header>

      <section aria-labelledby='directory-heading'>
        <div className='max-w-3xl'>
          <p className='eyebrow-label'>Directory</p>
          <h2 id='directory-heading' className='mt-2 text-3xl font-semibold tracking-tight text-ink'>
            Open the destination you need, then expand its complete index.
          </h2>
        </div>

        <div className='mt-6 space-y-4'>
          {destinationGroups.map((group) => {
            const destination = siteDestinationById[group.id]
            return (
              <details key={group.id} className='rounded-[1.5rem] border border-brand-900/10 bg-white p-5 shadow-sm sm:p-6'>
                <summary className='cursor-pointer list-none'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <p className='eyebrow-label'>{destination.eyebrow}</p>
                      <h3 className='mt-1 text-2xl font-semibold tracking-tight text-ink'>{destination.label}</h3>
                      <p className='mt-2 max-w-3xl text-sm leading-6 text-muted'>{destination.description}</p>
                    </div>
                    <span className='shrink-0 text-sm font-semibold text-brand-700'>{group.links.length} links</span>
                  </div>
                </summary>
                <DirectoryLinks links={group.links} />
              </details>
            )
          })}

          <details className='rounded-[1.5rem] border border-brand-900/10 bg-white p-5 shadow-sm sm:p-6'>
            <summary className='cursor-pointer list-none'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <p className='eyebrow-label'>Trust, policy, and support</p>
                  <h3 className='mt-1 text-2xl font-semibold tracking-tight text-ink'>Site Information</h3>
                  <p className='mt-2 max-w-3xl text-sm leading-6 text-muted'>
                    Learn who is responsible for the site, how it is governed, how corrections and commercial links are handled, and where to get help.
                  </p>
                </div>
                <span className='shrink-0 text-sm font-semibold text-brand-700'>{infoLinks.length} links</span>
              </div>
            </summary>
            <DirectoryLinks links={infoLinks} />
          </details>
        </div>
      </section>
    </div>
  )
}
