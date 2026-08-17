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

const secondaryActionClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[color:var(--hs-hairline-strong)] bg-[color:var(--surface-card)] px-5 py-2.5 text-sm font-bold text-[color:var(--hs-ink)] transition hover:border-[color:var(--hs-gold)] hover:text-[color:var(--hs-gold-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2'

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

      <section className="hero-shell grid gap-8 rounded-[2rem] border p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end lg:p-10">
        <div>
          <p className="eyebrow-label inline-flex items-center gap-2">
            <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Visual evidence library
          </p>
          <h1 className="heading-premium mt-5 max-w-4xl">Research you can understand at a glance.</h1>
          <p className="text-reading mt-4 max-w-3xl">
            A growing collection of free, evidence-aware supplement visuals. Download them, share them intact,
            or embed them with a link back to the full research context.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#visual-library" className="button-primary inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold">
              Browse the visuals
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link href="/info/methodology/" className={secondaryActionClass}>
              How evidence is graded
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <aside className="section-frame p-5" aria-label="Infographic library summary">
          <p className="text-sm font-semibold text-[color:var(--hs-ink)]">Inside the library</p>
          <dl className="mt-4 grid grid-cols-3 gap-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:var(--surface-subtle)] p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-[color:var(--hs-body)]">Visuals</dt>
              <dd className="mt-1 text-2xl font-bold text-[color:var(--hs-ink)]">{infographicItems.length}</dd>
            </div>
            <div className="rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:var(--surface-subtle)] p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-[color:var(--hs-body)]">Cost</dt>
              <dd className="mt-1 text-sm font-bold text-[color:var(--hs-ink)]">Free</dd>
            </div>
            <div className="rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:var(--surface-subtle)] p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-[color:var(--hs-body)]">Use</dt>
              <dd className="mt-1 text-sm font-bold text-[color:var(--hs-ink)]">Share + embed</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section id="visual-library" className="scroll-mt-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow-label">Available now</p>
            <h2 className="compact-heading mt-3">Choose a visual guide.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[color:var(--hs-body)] sm:text-right">
            Each graphic links to the deeper guide behind it. The image is the overview; the source page is the evidence trail.
          </p>
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          {infographicItems.map((item, index) => (
            <article key={item.id} className="card-premium group overflow-hidden">
              <a
                href={item.src}
                target="_blank"
                rel="noreferrer"
                className="relative block bg-[color:var(--surface-subtle)] p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-inset sm:p-6"
                aria-label={`Open ${item.title} full size`}
              >
                <div className="absolute left-7 top-7 z-10 rounded-full border border-[color:var(--hs-hairline-strong)] bg-[color:var(--surface-card)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--hs-gold-ink)] shadow-sm backdrop-blur">
                  {item.topic}
                </div>
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={600}
                  height={800}
                  priority={index === 0}
                  sizes="(min-width: 1024px) 44vw, 92vw"
                  className="mx-auto aspect-[3/4] w-full max-w-[34rem] rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:var(--surface-card)] object-contain shadow-md transition duration-300 group-hover:scale-[1.01]"
                  unoptimized
                />
              </a>

              <div className="p-5 sm:p-7">
                <h3 className="text-2xl font-semibold tracking-tight text-[color:var(--hs-ink)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--hs-body)]">{item.description}</p>

                <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${item.title} highlights`}>
                  {item.highlights.map((highlight) => (
                    <li key={highlight} className="chip-readable px-3 py-1.5 text-xs font-semibold">
                      {highlight}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <a href={item.src} download className="button-primary inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold">
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download JPG
                  </a>
                  <Link href={item.sourceHref} className={secondaryActionClass}>
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    {item.sourceLabel}
                  </Link>
                </div>

                <details className="mt-4 rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:var(--surface-subtle)] p-4">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[color:var(--hs-ink)] marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2">
                    <FileCode2 className="h-4 w-4 text-[color:var(--hs-gold-ink)]" aria-hidden="true" />
                    Embed this infographic
                  </summary>
                  <p className="mt-3 text-xs leading-6 text-[color:var(--hs-body)]">
                    Copy this code into a blog post or resource page. Attribution and the source-guide link are included.
                  </p>
                  <pre className="mt-3 max-h-64 overflow-auto rounded-xl border border-[color:var(--hs-hairline)] bg-[color:var(--surface-card)] p-3 text-xs leading-relaxed text-[color:var(--hs-body)]">
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
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:var(--hs-gold-soft)] text-[color:var(--hs-gold-ink)]">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-[color:var(--hs-ink)]">Start with the overview</h2>
          <p className="mt-2 text-sm leading-7 text-[color:var(--hs-body)]">
            Use the infographic to orient yourself, then follow the source-guide link before making a decision.
          </p>
        </article>
        <article className="card-premium p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:var(--hs-gold-soft)] text-[color:var(--hs-gold-ink)]">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-[color:var(--hs-ink)]">Keep the cautions intact</h2>
          <p className="mt-2 text-sm leading-7 text-[color:var(--hs-body)]">
            Avoid cropping away qualifiers, safety notes, or attribution. Those details are part of the resource—not fine print.
          </p>
        </article>
        <article className="card-premium p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:var(--hs-gold-soft)] text-[color:var(--hs-gold-ink)]">
            <FileCode2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-[color:var(--hs-ink)]">Embed with context</h2>
          <p className="mt-2 text-sm leading-7 text-[color:var(--hs-body)]">
            The provided embed code links readers to the matching guide rather than leaving the visual disconnected from its evidence.
          </p>
        </article>
      </section>

      <section className="section-frame p-6 sm:p-8" aria-labelledby="responsible-sharing-heading">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="eyebrow-label">Responsible sharing</p>
            <h2 id="responsible-sharing-heading" className="compact-heading mt-3">Share the visual. Preserve the nuance.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--hs-body)]">
              These graphics summarize research; they do not turn uncertain findings into recommendations. Keep attribution,
              avoid changing the claims, and point people toward the supporting guide whenever possible.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:max-w-xs lg:justify-end">
            <Link href="/evidence/evidence-report/" className="chip-readable px-4 py-2 text-sm font-semibold">Evidence report</Link>
            <Link href="/learn/citation-explorer/" className="chip-readable px-4 py-2 text-sm font-semibold">Citation explorer</Link>
            <Link href="/info/methodology/" className="chip-readable px-4 py-2 text-sm font-semibold">Methodology</Link>
          </div>
        </div>
      </section>

      <section className="section-frame p-6 sm:p-8" aria-labelledby="infographic-faq-heading">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Common questions</p>
          <h2 id="infographic-faq-heading" className="compact-heading mt-3">Infographic FAQ</h2>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:var(--surface-subtle)] p-5">
              <h3 className="font-bold text-[color:var(--hs-ink)]">{item.question}</h3>
              <p className="mt-2 text-sm leading-7 text-[color:var(--hs-body)]">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
