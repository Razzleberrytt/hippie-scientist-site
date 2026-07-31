import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  BookOpen,
  Download,
  FileCode2,
  ImageIcon,
  ShieldCheck,
} from 'lucide-react'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'

const TITLE = 'Supplement Evidence Infographics: Free Visual Research Resources'
const DESCRIPTION =
  'Download or embed evidence-aware supplement infographics for sleep, ADHD, focus, and research literacy. Free to share with attribution and careful context.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/info/infographics/',
  openGraphType: 'article',
})

const infographicItems = [
  {
    id: 'sleep-supplements',
    topic: 'Sleep',
    title: 'Sleep Supplements: Evidence vs Hype',
    src: '/images/guides/sleep-supplements-guide.jpg',
    alt: 'Sleep supplements evidence infographic comparing melatonin, magnesium, valerian, ashwagandha, L-theanine, and glycine',
    description:
      'A quick visual comparison of commonly discussed sleep ingredients, with evidence strength, practical context, and key cautions kept visible.',
    sourceHref: '/guides/sleep/',
    sourceLabel: 'Read the sleep guide',
    highlights: ['6 ingredients compared', 'Evidence-aware', 'Safety context'],
  },
  {
    id: 'adhd-supplements',
    topic: 'ADHD',
    title: 'ADHD Supplements: What the Research Actually Shows',
    src: '/images/guides/adhd-supplements-hub.jpg',
    alt: 'ADHD supplements evidence infographic comparing omega-3, magnesium, zinc, L-theanine, citicoline, iron, and vitamin D',
    description:
      'A careful overview of ADHD-adjacent supplement research, including where deficiency status matters and where the evidence remains limited.',
    sourceHref: '/guides/adhd/',
    sourceLabel: 'Read the ADHD guide',
    highlights: ['7 nutrients reviewed', 'Deficiency context', 'Research limits'],
  },
]

const infographicEmbedCode = (item: (typeof infographicItems)[number]) =>
  `<a href="https://thehippiescientist.net${item.sourceHref}">
  <img src="https://thehippiescientist.net${item.src}"
       alt="${item.alt}"
       width="600" height="800"
       style="max-width:100%;height:auto;border:0" />
</a>
<p style="font-size:12px;color:#666">
  Visual by <a href="https://thehippiescientist.net${item.sourceHref}">The Hippie Scientist</a>
</p>`

const faqItems = [
  {
    question: 'Can I share these supplement infographics?',
    answer:
      'Yes. You may share or embed them with attribution. Keep the visual intact and link to the related guide so readers can review the evidence and safety context.',
  },
  {
    question: 'Are these graphics medical advice?',
    answer:
      'No. They are educational summaries designed to make research easier to navigate. They do not replace individualized medical guidance.',
  },
  {
    question: 'Why are there only a few infographics?',
    answer:
      'The library is intentionally small while each visual is checked against its source material. New graphics will be added as they meet the same evidence and context standards.',
  },
]

export default function InfographicsPage() {
  return (
    <div className="container-page space-y-10 py-10 sm:space-y-14">
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url="https://thehippiescientist.net/info/infographics"
        type="Article"
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net' },
          { name: 'Info', url: 'https://thehippiescientist.net/info' },
          { name: 'Infographics', url: 'https://thehippiescientist.net/info/infographics' },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Info', href: '/info' },
          { label: 'Infographics' },
        ]}
      />

      <section className="relative overflow-hidden rounded-[2rem] border border-brand-900/10 bg-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-brand-100/80 via-brand-50/40 to-transparent" />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-900/10 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-900 shadow-sm">
              <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Visual evidence library
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Research you can understand at a glance.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
              A growing collection of free, evidence-aware supplement visuals. Download them, share them intact,
              or embed them with a link back to the full research context.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#visual-library" className="btn-primary inline-flex items-center gap-2">
                Browse the visuals
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link href="/info/methodology/" className="btn-secondary inline-flex items-center gap-2">
                How evidence is graded
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-brand-900/10 bg-brand-50/70 p-5">
            <p className="text-sm font-semibold text-ink">Inside the library</p>
            <dl className="mt-4 grid grid-cols-3 gap-3 lg:grid-cols-1">
              <div className="rounded-2xl bg-white/80 p-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">Visuals</dt>
                <dd className="mt-1 text-2xl font-bold text-ink">{infographicItems.length}</dd>
              </div>
              <div className="rounded-2xl bg-white/80 p-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">Cost</dt>
                <dd className="mt-1 text-sm font-bold text-ink">Free</dd>
              </div>
              <div className="rounded-2xl bg-white/80 p-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">Use</dt>
                <dd className="mt-1 text-sm font-bold text-ink">Share + embed</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section id="visual-library" className="scroll-mt-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow-label">Available now</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Choose a visual guide.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted sm:text-right">
            Each graphic links to the deeper guide behind it. The image is the overview; the source page is the evidence trail.
          </p>
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          {infographicItems.map((item, index) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-[2rem] border border-brand-900/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <a
                href={item.src}
                target="_blank"
                rel="noreferrer"
                className="relative block bg-gradient-to-b from-brand-50/90 to-surface-subtle p-4 sm:p-6"
                aria-label={`Open ${item.title} full size`}
              >
                <div className="absolute left-7 top-7 z-10 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-900 shadow-sm backdrop-blur">
                  {item.topic}
                </div>
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={600}
                  height={800}
                  priority={index === 0}
                  sizes="(min-width: 1024px) 44vw, 92vw"
                  className="mx-auto aspect-[3/4] w-full max-w-[34rem] rounded-2xl border border-brand-900/10 bg-white object-contain shadow-md transition duration-300 group-hover:scale-[1.01]"
                  unoptimized
                />
              </a>

              <div className="p-5 sm:p-7">
                <h3 className="text-2xl font-semibold tracking-tight text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>

                <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${item.title} highlights`}>
                  {item.highlights.map((highlight) => (
                    <li key={highlight} className="chip-readable bg-brand-50/70">
                      {highlight}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <a href={item.src} download className="btn-primary inline-flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download JPG
                  </a>
                  <Link
                    href={item.sourceHref}
                    className="btn-secondary inline-flex items-center justify-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    {item.sourceLabel}
                  </Link>
                </div>

                <details className="mt-4 rounded-2xl border border-brand-900/10 bg-surface-subtle/70 p-4">
                  <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-ink marker:hidden">
                    <FileCode2 className="h-4 w-4 text-brand-700" aria-hidden="true" />
                    Embed this infographic
                  </summary>
                  <p className="mt-3 text-xs leading-6 text-muted">
                    Copy this code into a blog post or resource page. Attribution and the source-guide link are included.
                  </p>
                  <pre className="mt-3 max-h-64 overflow-auto rounded-xl border border-brand-900/10 bg-white p-3 text-xs leading-relaxed text-muted">
                    <code>{infographicEmbedCode(item)}</code>
                  </pre>
                </details>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <article className="card-premium p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-900">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">Start with the overview</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            Use the infographic to orient yourself, then follow the source-guide link before making a decision.
          </p>
        </article>
        <article className="card-premium p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-900">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">Keep the cautions intact</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            Avoid cropping away qualifiers, safety notes, or attribution. Those details are part of the resource—not fine print.
          </p>
        </article>
        <article className="card-premium p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-900">
            <FileCode2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">Embed with context</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            The provided embed code links readers to the matching guide rather than leaving the visual disconnected from its evidence.
          </p>
        </article>
      </section>

      <section className="rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="eyebrow-label">Responsible sharing</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Share the visual. Preserve the nuance.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              These graphics summarize research; they do not turn uncertain findings into recommendations. Keep attribution,
              avoid changing the claims, and point people toward the supporting guide whenever possible.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:max-w-xs lg:justify-end">
            <Link href="/evidence/evidence-report/" className="chip-readable bg-white hover:bg-white/80">
              Evidence report
            </Link>
            <Link href="/learn/citation-explorer/" className="chip-readable bg-white hover:bg-white/80">
              Citation explorer
            </Link>
            <Link href="/info/methodology/" className="chip-readable bg-white hover:bg-white/80">
              Methodology
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Common questions</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Infographic FAQ</h2>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-2xl border border-brand-900/10 bg-brand-50/40 p-5">
              <h3 className="font-bold text-ink">{item.question}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
