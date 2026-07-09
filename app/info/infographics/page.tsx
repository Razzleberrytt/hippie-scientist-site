import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
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

const infoGraphicEmbedCode = (src: string, width: number, height: number, alt: string) =>
  `<a href="https://thehippiescientist.net/evidence/evidence-report/">
  <img src="https://thehippiescientist.net${src}"
       alt="${alt}" width="${width}" height="${height}"
       style="max-width:100%;height:auto;border:0" />
</a>
<p style="font-size:12px;color:#666">Data from
  <a href="https://thehippiescientist.net/evidence/evidence-report/">The Hippie Scientist Evidence Report</a>
</p>`

const infographicItems = [
  {
    title: 'Sleep Supplements: Evidence vs Hype',
    src: '/images/guides/sleep-supplements-guide.jpg',
    alt: 'Sleep supplements evidence infographic comparing melatonin, magnesium, valerian, ashwagandha, L-theanine, and glycine',
    body: 'A visual summary for comparing sleep-support ingredients by evidence strength, practical fit, and caution level.',
  },
  {
    title: 'ADHD Supplements: What the Research Actually Shows',
    src: '/images/guides/adhd-supplements-hub.jpg',
    alt: 'ADHD supplements evidence infographic comparing omega-3, magnesium, zinc, L-theanine, citicoline, iron, and vitamin D',
    body: 'A careful visual entry point for ADHD-adjacent supplement research, deficiency context, and evidence limits.',
  },
]

const useCases = [
  {
    title: 'For bloggers and journalists',
    body: 'Use the embed code when writing about supplement evidence, and keep attribution linked to the evidence report.',
  },
  {
    title: 'For educators and students',
    body: 'Use the visuals as discussion starters about evidence grades, research limits, and why mechanism is not the same as outcome.',
  },
  {
    title: 'For social sharing',
    body: 'Share the image with context. Avoid cropping out attribution or turning a cautious evidence graphic into a product recommendation.',
  },
]

const faqItems = [
  {
    question: 'Can I share these supplement infographics?',
    answer:
      'Yes. These resources are intended to be shared with attribution. Keep the context and link back to the evidence page so readers can review the methodology.',
  },
  {
    question: 'Are the infographics medical advice?',
    answer:
      'No. They are educational summaries meant to help readers understand evidence quality and research context. They should not replace individualized guidance.',
  },
  {
    question: 'Why do the graphics use cautious language?',
    answer:
      'Supplement research often has mixed study designs, different doses, and population-specific findings. Cautious wording keeps the visual aligned with the evidence.',
  },
]

export default function InfographicsPage() {
  return (
    <div className="container-page py-10 space-y-12">
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

      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="eyebrow-label">Shareable resources</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Free supplement evidence infographics.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
          Download or embed these evidence-aware visuals for education, newsletters, blog posts, and social sharing.
          They are designed to point readers toward the research context — not toward hype, shortcuts, or overconfident claims.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/evidence/evidence-report/" className="chip-readable hover:bg-white transition">Read the evidence report</Link>
          <Link href="/learn/citation-explorer/" className="chip-readable hover:bg-white transition">Citation explorer</Link>
          <Link href="/info/methodology/" className="chip-readable hover:bg-white transition">Methodology</Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {useCases.map((item) => (
          <article key={item.title} className="card-premium p-6">
            <p className="eyebrow-label">Use case</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{item.body}</p>
          </article>
        ))}
      </section>

      {infographicItems.map((item) => (
        <section key={item.src} className="max-w-4xl space-y-4">
          <div className="space-y-2">
            <p className="eyebrow-label">Embed-ready visual</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">{item.title}</h2>
            <p className="text-sm leading-7 text-muted">{item.body}</p>
          </div>
          <div className="card-premium p-4">
            <Image
              src={item.src}
              alt={item.alt}
              width={600}
              height={800}
              className="w-full rounded-xl border border-brand-900/10"
              unoptimized
            />
          </div>
          <details className="card-premium p-4 cursor-pointer">
            <summary className="text-sm font-semibold text-ink">Embed code — copy and paste</summary>
            <pre className="mt-3 text-xs leading-relaxed bg-surface-subtle p-3 rounded-lg overflow-x-auto text-muted">
{infoGraphicEmbedCode(item.src, 600, 800, item.alt)}
            </pre>
          </details>
        </section>
      ))}

      <section className="rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 shadow-sm sm:p-8">
        <p className="eyebrow-label">Sharing guidelines</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Share the context, not just the image.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          The best use of these graphics is as a doorway into the deeper evidence pages. Link back to the evidence report,
          avoid removing attribution, and keep cautious statements intact so readers understand the limits of the research.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/guides/sleep/" className="chip-readable hover:bg-white transition">Sleep guide hub</Link>
          <Link href="/guides/adhd/" className="chip-readable hover:bg-white transition">ADHD guide hub</Link>
          <Link href="/learn/product-quality/" className="chip-readable hover:bg-white transition">Product-quality guide</Link>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-white/90 p-6 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">FAQ</h2>
        <div className="mt-4 grid gap-4">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-2xl border border-brand-900/10 bg-brand-50/40 p-4">
              <h3 className="font-bold text-ink">{item.question}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
