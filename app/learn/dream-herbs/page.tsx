import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'Dream Herbs: Oneirogenic Plants, REM Sleep & Safety',
  description:
    'A premium educational guide to dream herbs, oneirogenic plants, REM sleep, dream vividness, traditional use, evidence limits, and safety-first decisions.',
  path: '/learn/dream-herbs/',
})

const herbs = [
  {
    href: '/herbs/valerian/',
    title: 'Valerian',
    body: 'A sedating herb most often discussed for sleep latency and sleep quality, with possible effects on dream recall mostly secondary to sleep architecture and sedation.',
    lens: 'Best viewed as a sleep-support herb first, not a dream-enhancement shortcut.',
  },
  {
    href: '/herbs/mugwort/',
    title: 'Mugwort',
    body: 'A traditional dream herb with strong cultural and ritual associations around vivid dreams, but limited modern clinical evidence for specific dream outcomes.',
    lens: 'Best viewed through the gap between ethnobotanical tradition and proven sleep science.',
  },
  {
    href: '/herbs/passionflower/',
    title: 'Passionflower',
    body: 'A calming herb often discussed for sleep and anxiety support, where changes in dream experience may reflect relaxation, sleep continuity, or sedation rather than direct oneirogenic action.',
    lens: 'Best compared when the goal is calming sleep support, not stronger altered dream states.',
  },
]

const concepts = [
  {
    title: 'Dream vividness is not the same as sleep quality',
    body: 'A herb may make dreams feel more vivid, memorable, emotional, or unusual without improving recovery. In some people, more intense dreams can fragment sleep, increase awakenings, or leave them feeling less rested.',
  },
  {
    title: 'Oneirogenic claims need evidence humility',
    body: 'Many dream-herb traditions are historically interesting, but modern human evidence is often thin. Traditional use can guide curiosity, but it should not be treated as proof of predictable lucid dreaming, REM enhancement, or psychological benefit.',
  },
  {
    title: 'Calming, sedating, and dream-oriented are different',
    body: 'A calming herb may reduce arousal. A sedating herb may increase sleep pressure or impairment. A dream-oriented herb may be used for recall or vividness. These categories overlap, but they are not interchangeable.',
  },
]

const decisionQuestions = [
  'Is the goal better sleep, dream recall, lucid dreaming, anxiety reduction, ritual exploration, or curiosity about ethnobotany?',
  'Does the herb have human evidence for sleep quality, or mostly traditional and anecdotal dream claims?',
  'Could the ingredient worsen nightmares, next-day grogginess, sleep fragmentation, mood instability, or medication interactions?',
  'Is the plan avoiding alcohol, sedatives, cannabis, sleep medications, antihistamines, and other calming herbs that may compound impairment?',
]

const DREAM_HERBS_REFS = [
  { n: 1, text: 'Luthringer R, et al. (2002). Valerian on sleep EEG. Phytother Res, 16(7): 650-654.', url: 'https://pubmed.ncbi.nlm.nih.gov/12410546/' },
]

export default function DreamHerbsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Dream Herbs"
        description="Educational exploration of oneirogenic herbs, REM-related neuropharmacology, dreaming systems, and psychoactive ethnobotany."
        url="https://thehippiescientist.net/learn/dream-herbs"
        type="CollectionPage"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Learn', href: '/learn/' },
          { label: 'Dream Herbs' },
        ]}
      />

      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5">
        <p className="eyebrow-label">Oneirogenic ecosystem</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Dream Herbs: Oneirogenic Plants, REM Sleep, Vivid Dreams, and the Safety Line
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
          Dream herbs sit at the intersection of sleep, tradition, psychoactive ethnobotany, and personal experience. Some are calming herbs that may change sleep continuity, some are sedating, and others are discussed mainly through cultural dream-practice traditions. This page explains how to approach dream-herb claims without confusing vivid dreams with better sleep or assuming tradition equals predictable effect.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Dream herb concepts">
        {concepts.map((concept) => (
          <article key={concept.title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-bold text-ink">{concept.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{concept.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" aria-labelledby="dream-framework-heading">
        <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 id="dream-framework-heading" className="text-2xl font-bold text-ink">The premium decision framework</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            The useful question is not simply “which herb causes dreams?” A better framework separates sleep support from dream recall, REM timing, cultural ritual, and altered-state curiosity. A dream herb can be interesting and still be a poor fit if it worsens rest, intensifies nightmares, or stacks badly with sedating substances.
          </p>
          <ol className="mt-5 space-y-3">
            {decisionQuestions.map((question, index) => (
              <li key={question} className="flex gap-3 rounded-xl border border-brand-900/10 bg-brand-50/40 p-3 text-sm leading-6 text-muted dark:border-white/10 dark:bg-white/5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">{index + 1}</span>
                <span>{question}</span>
              </li>
            ))}
          </ol>
        </div>

        <aside className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
          <p className="text-sm font-bold uppercase tracking-[0.16em]">Safety-first lens</p>
          <h2 className="mt-2 text-xl font-bold">Dream experimentation should not compromise sleep or safety</h2>
          <p className="mt-3 text-sm leading-6">
            Use extra caution with pregnancy, breastfeeding, psychiatric conditions, trauma-related nightmares, sedatives, alcohol, cannabis, sleep medications, antihistamines, and next-day driving or childcare responsibilities. More vivid dreams are not worth avoidable impairment or destabilized sleep.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
              Check sleep stack safety
            </Link>
            <Link href="/learn/cholinergic-system/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">
              Cholinergic system
            </Link>
          </div>
        </aside>
      </section>

      <section className="space-y-4" aria-labelledby="dream-herb-profiles-heading">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Dream herb profiles</p>
          <h2 id="dream-herb-profiles-heading" className="mt-2 text-2xl font-bold tracking-tight text-ink">
            Herbs to compare before chasing vivid dreams
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            These herbs sit in different parts of the dream and sleep landscape. Compare them by the actual decision: sleep onset, calming, dream recall, traditional dream work, or safety around sedation and next-day function.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {herbs.map((herb) => (
            <Link
              key={herb.href}
              href={herb.href}
              className="card-premium group flex h-full flex-col p-6 transition motion-safe:hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <p className="eyebrow-label">Dream Herb</p>
                <h3 className="text-2xl font-semibold tracking-tight text-ink">{herb.title}</h3>
                <p className="text-sm leading-6 text-muted">{herb.body}</p>
                <div className="rounded-xl border border-brand-900/10 bg-brand-50/50 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-100">Decision lens</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{herb.lens}</p>
                </div>
                <span className="inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-0.5 dark:text-brand-100">
                  Read profile -&gt;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-brand-50/60 p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-semibold text-ink">Where to go next</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          If your goal is better sleep, start with sleep guides before dream experimentation. If your goal is mechanism, read the cholinergic system page. If your goal is calming support, compare the calming psychoactives page so sedating and non-sedating options do not get mixed together.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/guides/sleep/" className="inline-flex min-h-[44px] items-center rounded-full bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-800">
            Sleep guides
          </Link>
          <Link href="/learn/calming/" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10">
            Calming psychoactives
          </Link>
          <Link href="/learn/why-sleep-changes-emotional-regulation/" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10">
            Sleep and emotional regulation
          </Link>
        </div>
      </section>

      <References refs={DREAM_HERBS_REFS} />
    </div>
  )
}
