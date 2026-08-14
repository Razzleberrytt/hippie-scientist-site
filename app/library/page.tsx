import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Brain,
  FlaskConical,
  Leaf,
  Search,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from 'lucide-react'
import { allArticleMonographs, allBlogPosts } from '../../.content-collections/generated'
import { SITE_URL } from '@/lib/navigation-config'
import { buildTwitterMetadata } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Explore Everything — Complete Site Directory',
  description:
    'The complete directory for The Hippie Scientist: health-goal guides, articles, herb and compound profiles, learning resources, evidence reports, and safety tools.',
  alternates: { canonical: `${SITE_URL}/library/` },
  openGraph: {
    title: 'Explore Everything — The Hippie Scientist',
    description:
      'Use one clear directory to browse every major guide, article, profile database, research resource, and safety tool.',
    url: `${SITE_URL}/library/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Explore Everything — The Hippie Scientist',
    description: 'Use one clear directory to browse every major guide, article, profile database, research resource, and safety tool.',
  }),
}

const latestArticles = [...allArticleMonographs, ...allBlogPosts]
  .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
  .slice(0, 6)

const quickStarts = [
  {
    title: 'I have a health goal',
    description: 'Start with organized guidance for sleep, ADHD, anxiety, focus, or mental health.',
    href: '/guides/',
    action: 'Browse topics',
    Icon: Brain,
  },
  {
    title: 'I am researching an ingredient',
    description: 'Look up a herb, nutrient, active compound, or standardized extract.',
    href: '/herbs/',
    action: 'Browse profiles',
    Icon: Leaf,
  },
  {
    title: 'I want to read the research',
    description: 'Browse evidence reviews, research notes, explainers, and recent updates.',
    href: '/articles/',
    action: 'Browse articles',
    Icon: BookOpen,
  },
]

const directorySections = [
  {
    id: 'topics',
    eyebrow: 'Browse by need',
    title: 'Health goals and practical topics',
    description: 'Start with the problem you are trying to understand rather than guessing which ingredient page to open.',
    Icon: Brain,
    links: [
      { label: 'Mental Health', href: '/guides/mental-health/', detail: 'Conditions, treatment evidence, safety, and stigma-aware explainers' },
      { label: 'ADHD', href: '/guides/adhd/', detail: 'Attention, executive function, nutrients, and treatment context' },
      { label: 'Sleep', href: '/guides/sleep/', detail: 'Sleep aids, alternatives, and sleep-hygiene evidence' },
      { label: 'Anxiety & Stress', href: '/guides/anxiety/', detail: 'Calming supports, adaptogens, and stress-management evidence' },
      { label: 'Focus & Cognition', href: '/guides/focus/', detail: 'Focus support, nootropics, and cognitive performance' },
      { label: 'More supplement topics', href: '/guides/other/', detail: 'Forms, quality, routines, advanced compounds, and harm reduction' },
    ],
  },
  {
    id: 'content',
    eyebrow: 'Browse by format',
    title: 'Guides, articles, and educational explainers',
    description: 'Every editorial collection has a visible front door here, including the article index that was previously buried.',
    Icon: BookOpen,
    links: [
      { label: 'All guides', href: '/guides/', detail: 'The organized hub for goal-based and practical guides' },
      { label: 'All articles', href: '/articles/', detail: 'Every published research note, evidence review, and editorial article' },
      { label: 'Learning library', href: '/learn/', detail: 'Neuroscience, evidence literacy, interactions, and safety education' },
      { label: 'Comparisons', href: '/guides/compare/', detail: 'Side-by-side supplement and compound tradeoffs' },
      { label: 'Best supplements', href: '/guides/best/', detail: 'Evidence-aware roundups organized by a specific need' },
      { label: 'Herb guides', href: '/guides/herbs/', detail: 'Long-form practical guides for important botanicals' },
    ],
  },
  {
    id: 'ingredients',
    eyebrow: 'Structured references',
    title: 'Herbs, compounds, and ingredient research',
    description: 'Use the databases for direct lookups, then move into evidence, dosing, interactions, and product-quality context.',
    Icon: FlaskConical,
    links: [
      { label: 'Herb database', href: '/herbs/', detail: 'Alphabetical profiles with evidence and safety summaries' },
      { label: 'Compound database', href: '/compounds/', detail: 'Nutrients, active compounds, and standardized extracts' },
      { label: 'Evidence lookup', href: '/evidence/evidence-checker/', detail: 'Filter compounds by clinical evidence grade' },
      { label: 'Dosing guide', href: '/info/dosing/', detail: 'Bioavailability, timing, stacking, and dose realism' },
      { label: 'Interactions', href: '/learn/interactions/', detail: 'Why herb-drug and supplement interactions matter' },
      { label: 'Product quality', href: '/learn/product-quality/', detail: 'Labels, standardization, testing, and quality signals' },
    ],
  },
  {
    id: 'evidence-safety',
    eyebrow: 'Verify before acting',
    title: 'Evidence and safety resources',
    description: 'Check the strength of the evidence, understand the site methodology, and review important safety context.',
    Icon: ShieldCheck,
    links: [
      { label: 'Safety checker', href: '/safety-checker/', detail: 'Interaction and contraindication lookup' },
      { label: 'Evidence report', href: '/evidence/evidence-report/', detail: 'The annual state of supplement evidence review' },
      { label: 'Evidence digest', href: '/evidence/evidence-digest/', detail: 'Recent human-trial highlights and research summaries' },
      { label: 'Methodology', href: '/info/methodology/', detail: 'How evidence grades, safety language, and conclusions are built' },
      { label: 'Citation explorer', href: '/learn/citation-explorer/', detail: 'Explore research references behind the site' },
      { label: 'Supplement checklist', href: '/info/supplement-safety-checklist/', detail: 'What to verify before buying or stacking a supplement' },
    ],
  },
  {
    id: 'specialty',
    eyebrow: 'Special collections',
    title: 'Advanced and visual resources',
    description: 'Explore specialized research collections and tools that do not fit neatly into a single health-goal category.',
    Icon: Waypoints,
    links: [
      { label: 'Novel psychoactive substances', href: '/novel-psychoactive-substances/', detail: 'Harm-reduction profiles for emerging substances' },
      { label: 'Infographics', href: '/info/infographics/', detail: 'Downloadable and embeddable evidence visuals' },
      { label: 'Efficacy model', href: '/learn/efficacy-model/', detail: 'Interactive supplement-efficacy exploration' },
      { label: 'Pathway explorer', href: '/learn/explorer/', detail: 'Explore biological pathway connections' },
      { label: 'Neuroscience glossary', href: '/learn/neuroscience-glossary/', detail: 'Plain-English definitions for brain and receptor terms' },
      { label: 'Free guide', href: '/info/free-guide/', detail: 'A downloadable introduction to safer supplement research' },
    ],
  },
  {
    id: 'about',
    eyebrow: 'About the project',
    title: 'Site information and help',
    description: 'Learn who created the site, how it is funded, and how to get help or report an issue.',
    Icon: Sparkles,
    links: [
      { label: 'About', href: '/info/about/', detail: 'The mission and editorial approach' },
      { label: 'Author', href: '/info/author/', detail: 'Author identity and credentials' },
      { label: 'FAQ', href: '/info/faq/', detail: 'Common questions about the site and its evidence language' },
      { label: 'Contact', href: '/info/contact/', detail: 'Corrections, feedback, and general contact' },
      { label: 'Disclaimer', href: '/info/disclaimer/', detail: 'Educational-use and medical-advice limitations' },
      { label: 'Affiliate disclosure', href: '/info/affiliate-disclosure/', detail: 'How commercial links and editorial independence are handled' },
    ],
  },
]

export default function SiteDirectoryPage() {
  return (
    <div className='mx-auto max-w-6xl space-y-12 px-4 pb-24 pt-8 sm:px-6 lg:px-8'>
      <header className='overflow-hidden rounded-[2rem] border border-brand-900/10 bg-white/90 shadow-sm'>
        <div className='grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.35fr_0.65fr] lg:p-10'>
          <div>
            <p className='eyebrow-label'>Master site directory</p>
            <h1 className='mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
              Explore everything without getting lost.
            </h1>
            <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
              This is the front door to every major content collection: health-goal guides, all published articles,
              herb and compound profiles, learning resources, evidence reports, and safety tools.
            </p>
            <div className='mt-6 flex flex-wrap gap-3'>
              <Link href='/search/' className='btn-primary inline-flex items-center gap-2'>
                <Search className='h-4 w-4' aria-hidden='true' />
                Search everything
              </Link>
              <Link href='/articles/' className='btn-secondary inline-flex items-center gap-2'>
                All articles
                <ArrowRight className='h-4 w-4' aria-hidden='true' />
              </Link>
            </div>
          </div>

          <aside className='rounded-3xl border border-brand-900/10 bg-brand-50/55 p-5'>
            <p className='text-sm font-bold text-ink'>How the site is organized</p>
            <ol className='mt-4 space-y-4 text-sm leading-6 text-muted'>
              <li><strong className='text-ink'>1. Topics</strong> answer a health or practical question.</li>
              <li><strong className='text-ink'>2. Ingredients</strong> provide structured herb and compound profiles.</li>
              <li><strong className='text-ink'>3. Research</strong> explains evidence, mechanisms, and uncertainty.</li>
              <li><strong className='text-ink'>4. Tools</strong> help check safety, evidence strength, and dosing context.</li>
            </ol>
          </aside>
        </div>
      </header>

      <section aria-labelledby='choose-a-path'>
        <div className='max-w-3xl'>
          <p className='eyebrow-label'>Start with your intent</p>
          <h2 id='choose-a-path' className='mt-2 text-3xl font-semibold tracking-tight text-ink'>What are you trying to do?</h2>
        </div>
        <div className='mt-6 grid gap-4 md:grid-cols-3'>
          {quickStarts.map(({ title, description, href, action, Icon }) => (
            <Link key={href} href={href} className='card-premium group flex h-full flex-col p-6'>
              <span className='inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-800'>
                <Icon className='h-5 w-5' aria-hidden='true' />
              </span>
              <h3 className='mt-5 text-xl font-bold text-ink'>{title}</h3>
              <p className='mt-3 flex-1 text-sm leading-7 text-muted'>{description}</p>
              <span className='mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-800'>
                {action}
                <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' aria-hidden='true' />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className='space-y-6' aria-labelledby='complete-directory'>
        <div className='max-w-3xl'>
          <p className='eyebrow-label'>Complete directory</p>
          <h2 id='complete-directory' className='mt-2 text-3xl font-semibold tracking-tight text-ink'>Every major section, in one place.</h2>
          <p className='mt-3 text-base leading-8 text-muted'>
            Individual herbs, compounds, guides, and articles live inside these browsable collections. No important content family is intentionally hidden from navigation.
          </p>
        </div>

        <div className='grid gap-5 lg:grid-cols-2'>
          {directorySections.map(({ id, eyebrow, title, description, Icon, links }) => (
            <section id={id} key={id} className='scroll-mt-28 rounded-[1.75rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-7'>
              <div className='flex items-start gap-4'>
                <span className='inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-800'>
                  <Icon className='h-5 w-5' aria-hidden='true' />
                </span>
                <div>
                  <p className='text-xs font-bold uppercase tracking-[0.14em] text-brand-700'>{eyebrow}</p>
                  <h3 className='mt-1 text-2xl font-bold tracking-tight text-ink'>{title}</h3>
                </div>
              </div>
              <p className='mt-4 text-sm leading-7 text-muted'>{description}</p>
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
            </section>
          ))}
        </div>
      </section>

      <section className='rounded-[2rem] border border-brand-900/10 bg-brand-50/55 p-6 sm:p-8' aria-labelledby='recent-articles'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='eyebrow-label'>Recently updated</p>
            <h2 id='recent-articles' className='mt-2 text-3xl font-semibold tracking-tight text-ink'>Latest articles</h2>
            <p className='mt-2 text-sm leading-7 text-muted'>A direct window into the editorial collection that was previously difficult to discover.</p>
          </div>
          <Link href='/articles/' className='inline-flex items-center gap-2 text-sm font-bold text-brand-800'>
            View every article
            <ArrowRight className='h-4 w-4' aria-hidden='true' />
          </Link>
        </div>

        <div className='mt-6 grid gap-3 md:grid-cols-2'>
          {latestArticles.map((article) => (
            <Link key={article.slug} href={article.url} className='rounded-2xl border border-brand-900/10 bg-white/90 p-5 transition hover:border-brand-700/25 hover:bg-white'>
              <div className='flex flex-wrap items-center gap-2 text-xs text-muted'>
                <span className='font-bold uppercase tracking-wider text-brand-700'>{article.category}</span>
                <span aria-hidden='true'>•</span>
                <time dateTime={article.lastUpdated}>{article.lastUpdated}</time>
              </div>
              <h3 className='mt-2 text-lg font-bold leading-snug text-ink'>{article.title}</h3>
              <p className='mt-2 line-clamp-2 text-sm leading-6 text-muted'>{article.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
