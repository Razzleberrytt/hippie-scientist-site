import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'
import References from '@/components/References'

const PAGE_URL = `${SITE_URL}/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night`

export const metadata: Metadata = {
  title: 'Best Herbs for Stress and Anxiety at Night — Calm-Down Guide',
  description:
    'Evening stress and anxiety keeping you awake? An evidence-informed guide to calming herbs for nighttime — passionflower, lemon balm, ashwagandha, magnolia, valerian and L-theanine — with a wind-down routine, dosing and safety.',
  alternates: { canonical: '/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/' },
  openGraph: {
    title: 'Best Herbs for Stress and Anxiety at Night — Calm-Down Guide',
    description:
      'Calming herbs for evening stress and racing thoughts, matched to how nighttime anxiety actually shows up — with a practical wind-down routine, dosing and safety.',
    url: '/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/',
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const FAQS = [
  {
    question: 'Which herb is best for nighttime anxiety?',
    answer:
      'For most people, passionflower and lemon balm are the gentlest reliable starting points for evening anxiety, because they raise calming GABA tone without strong sedation. If the anxiety is clearly stress-hormone driven — the "wired but tired" pattern — ashwagandha taken in the evening addresses the cause rather than just the symptom. L-theanine is the fastest-acting option for racing thoughts at bedtime.',
  },
  {
    question: 'Can I take calming herbs every night?',
    answer:
      'Gentle options like lemon balm, passionflower and L-theanine are generally well tolerated for regular evening use. Ashwagandha is designed for daily use over weeks. Sedating herbs such as valerian are better used in shorter courses. If you feel you cannot fall asleep at all without a herbal aid for more than a few weeks, treat that as a prompt to look at the underlying stress, schedule or a possible anxiety disorder with a clinician.',
  },
  {
    question: 'Are calming herbs safe with anxiety medication?',
    answer:
      'Not automatically. Sedating and GABA-active herbs can add to the effects of benzodiazepines, sleep medications and alcohol, and some adaptogens may interact with other drugs. If you take any prescription medication for anxiety, sleep or mood, check with a pharmacist or clinician before adding herbs rather than assuming "natural" means compatible.',
  },
  {
    question: 'How fast do nighttime calming herbs work?',
    answer:
      'L-theanine and passionflower tea can take the edge off within 30–60 minutes. Lemon balm is similar. Ashwagandha works on the stress system over 2–6 weeks and is not a same-night fix. Valerian is variable and tends to perform better after a week or two of consistent use.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'takeaways', text: 'Key takeaways', level: 2 },
  { id: 'choose', text: 'Choose by how anxiety shows up at night', level: 2 },
  { id: 'herbs', text: 'The calming herbs worth knowing', level: 2 },
  { id: 'routine', text: 'A simple evening wind-down', level: 2 },
  { id: 'risks', text: 'Risks & safety', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

const BEST_HERBS_FOR_STRESS_AND_ANXIETY_AT_NIGHT_REFS = [
  { n: 1, text: 'Sarris J, et al. (2013). Kava for GAD. J Clin Psychopharmacol, 33(5): 643-648.', url: 'https://pubmed.ncbi.nlm.nih.gov/23942365/' },
  { n: 2, text: 'Chandrasekhar K, et al. (2012). Ashwagandha for stress. Indian J Psychol Med, 34(3): 255-262.', url: 'https://pubmed.ncbi.nlm.nih.gov/23439798/' },
  { n: 3, text: 'Ngan A, Conduit R. (2011). Passionflower for sleep. Phytother Res, 25(8): 1153-1159.', url: 'https://pubmed.ncbi.nlm.nih.gov/21294203/' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />
  const ashwagandhaProducts = getRevenueProductSet('ashwagandha')
  return (
    <ArticleLayout toc={toc} zone="supplement">
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Herbs for Stress and Anxiety at Night"
        description="Evidence-informed guide to calming herbs for nighttime stress and anxiety — passionflower, lemon balm, ashwagandha, magnolia, valerian and L-theanine — with a wind-down routine, dosing and safety."
        datePublished="2026-06-18"
        dateModified="2026-06-18"
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Best Herbs for Stress and Anxiety at Night', href: '/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night' },
        ]}
      />

      <div className="space-y-12">
        <AffiliateDisclosure variant="compact" className="mb-6" />
        {/* Hero */}
        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-10">
          <p className="eyebrow-label">Night routine guide</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Best Herbs for Stress and Anxiety at Night
          </h1>
          <p className="mt-2 text-xs text-muted">
            Written and reviewed by{' '}
            <Link href="/author/" className="font-medium text-brand-700 hover:underline">Will Thomas</Link>
            {' '}· Last updated June 2026
          </p>
          <p className="detail-reading mt-4 text-muted">
            Nighttime is when stress finally gets your attention. With the distractions of the day gone,
            the same worries circle back as racing thoughts, a tight chest, or a body that feels tired
            but refuses to switch off. Calming herbs can genuinely help here — but only when matched to
            how your evening anxiety actually shows up, and only alongside a consistent wind-down routine.
            This guide covers the best-supported options and how to use them safely.
          </p>

        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white">
            <Image
              src="/images/guides/best-herbs-for-stress-and-anxiety-at-night.jpg"
              alt="Calming nighttime herbs — lavender, chamomile, passionflower — with herbal tea"
              width={1536}
              height={1024}
              priority
              className="w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Calming herbs best suited to nighttime stress and anxiety.
          </figcaption>
        </figure>
        </section>

        {/* Fastest useful choice */}
        <section className="card-premium scroll-mt-20 space-y-3 border-brand-700/30 bg-brand-50/60 p-6">
          <p className="eyebrow-label">Fastest useful choice</p>
          <h2 className="text-xl font-semibold text-ink">If you only try one thing: passionflower tea or L-theanine</h2>
          <p className="text-muted">
            <strong>For racing thoughts at bedtime, L-theanine 100–200&nbsp;mg is the fastest useful choice</strong>{' '}
            — effects within 30–60 minutes, no sedation, no dependency. For a gentler route,{' '}
            <Link href="/herbs/passionflower/" className="font-semibold text-brand-700 hover:underline">
              passionflower
            </Link>{' '}
            tea is one of the most reliable calming bedtime options with mild evidence. Pair either with
            dim light, no screens, and a consistent bedtime &mdash; the routine is what makes the herb land.
            See the{' '}
            <Link href="/guides/herbs/l-theanine/" className="font-semibold text-brand-700 hover:underline">
              full L-theanine guide
            </Link>{' '}
            and the{' '}
            <Link href="/guides/herbs/ashwagandha/" className="font-semibold text-brand-700 hover:underline">
              ashwagandha guide
            </Link>{' '}
            for the deeper evidence reviews.
          </p>
        </section>

        {/* Quick Answer */}
        <section id="quick-answer" className="card-premium scroll-mt-20 space-y-3 p-6">
          <h2 className="text-2xl font-semibold text-ink">Quick answer</h2>
          <p className="text-muted">
            For racing thoughts at bedtime, start with{' '}
            <strong className="text-ink">L-theanine</strong> (100–200&nbsp;mg) or a cup of{' '}
            <strong className="text-ink">passionflower</strong> tea. For the &ldquo;wired but tired&rdquo;
            pattern driven by stress hormones, take{' '}
            <strong className="text-ink">ashwagandha</strong> in the evening and give it a few weeks. For
            mild restlessness, <strong className="text-ink">lemon balm</strong> and{' '}
            <strong className="text-ink">magnolia bark</strong> are gentle traditional options, with{' '}
            <strong className="text-ink">valerian</strong> reserved for short courses. Pair any of these
            with dim light, a screen curfew and a steady bedtime — the herb is the smaller lever.
          </p>
        </section>

        {/* Key Takeaways */}
        <section id="takeaways" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Key takeaways</h2>
          <ul className="space-y-2 text-muted">
            <li>• <strong className="text-ink">Identify the pattern first:</strong> racing mind, physical tension, or stress-hormone &ldquo;wired but tired.&rdquo; Each responds to a different herb.</li>
            <li>• <strong className="text-ink">Fast vs foundational:</strong> L-theanine, passionflower and lemon balm work the same night; ashwagandha works on the cause over weeks.</li>
            <li>• <strong className="text-ink">Gentle before strong:</strong> begin with the lowest-risk options before reaching for sedating herbs like valerian.</li>
            <li>• <strong className="text-ink">Routine multiplies the effect:</strong> dim light, no late caffeine and a consistent bedtime make every herb work better.</li>
            <li>• <strong className="text-ink">Persistent nighttime anxiety</strong> that disrupts daily life deserves a clinician&rsquo;s input, not just supplements.</li>
          </ul>
        </section>

        {/* Match pattern */}
        <section id="choose" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Match to your pattern</p>
          <h2 className="text-2xl font-semibold text-ink">Choose by how anxiety shows up at night</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { pattern: 'Racing thoughts you cannot switch off', pick: 'L-theanine, then passionflower', href: '/compounds/l-theanine' },
              { pattern: '"Wired but tired" — stress hormones high', pick: 'Ashwagandha in the evening', href: '/herbs/ashwagandha' },
              { pattern: 'Restless, tense, mild worry', pick: 'Lemon balm or magnolia bark', href: '/herbs/melissa-officinalis' },
              { pattern: 'Anxiety plus trouble staying asleep', pick: 'Passionflower + magnesium', href: '/herbs/passionflower/' },
              { pattern: 'Occasional, situational restlessness', pick: 'Valerian (short course)', href: '/herbs/valerian' },
              { pattern: 'Stress carried over from the whole day', pick: 'Magnesium glycinate base', href: '/compounds/magnesium-glycinate' },
            ].map((row) => (
              <Link key={row.pattern} href={row.href} className="card-premium block p-5 transition hover:border-brand-700/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">If it shows up as</p>
                <p className="mt-1 text-sm font-semibold text-ink">{row.pattern}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-brand-700">Start with</p>
                <p className="mt-1 text-sm font-medium text-brand-800">{row.pick} →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Evidence overview */}
        <section id="herbs" className="scroll-mt-20 space-y-5">
          <p className="eyebrow-label">Evidence overview</p>
          <h2 className="text-2xl font-semibold text-ink">The calming herbs worth knowing</h2>

          <article className="card-premium p-6">
            <h3 className="text-xl font-semibold text-brand-800">
              <Link href="/herbs/passionflower/" className="hover:underline">Passionflower</Link>
            </h3>
            <p className="mt-3 text-sm text-muted">
              Passionflower raises GABA activity and has small but encouraging trials for anxiety and
              restless sleep. It is one of the gentlest ways to take the edge off bedtime worry, used as a
              tea or extract. A practical first choice when the issue is anxiety rather than deep
              tiredness. See the dedicated{' '}
              <Link href="/guides/passionflower" className="font-medium text-brand-700 hover:underline">passionflower guide</Link>.
            </p>
          </article>

          <article className="card-premium p-6">
            <h3 className="text-xl font-semibold text-brand-800">
              <Link href="/herbs/melissa-officinalis" className="hover:underline">Lemon balm (Melissa)</Link>
            </h3>
            <p className="mt-3 text-sm text-muted">
              A mild, pleasant calming herb with traditional and some clinical support for reducing
              stress and improving calm, especially when combined with valerian. Good for low-grade
              evening tension and easy to take as a tea before bed.
            </p>
          </article>

          <article className="card-premium p-6">
            <h3 className="text-xl font-semibold text-brand-800">
              <Link href="/herbs/ashwagandha" className="hover:underline">Ashwagandha</Link>{' '}
              <span className="ml-2 rounded-full bg-brand-50 px-3 py-0.5 align-middle text-xs font-semibold text-brand-800">Best for &ldquo;wired but tired&rdquo;</span>
            </h3>
            <p className="mt-3 text-sm text-muted">
              The most clinically studied adaptogen for stress. By moderating the HPA axis and lowering
              cortisol, evening ashwagandha targets the root of stress-driven wakefulness rather than
              just sedating you. Allow 2–6 weeks of consistent use. Learn how it compares in{' '}
              <Link href="/guides/compare/rhodiola-vs-ashwagandha" className="font-medium text-brand-700 hover:underline">rhodiola vs ashwagandha</Link>{' '}
              and our{' '}
              <Link href="/guides/how-to-lower-cortisol-naturally" className="font-medium text-brand-700 hover:underline">how to lower cortisol naturally</Link>{' '}
              guide.
            </p>
          </article>

          <article className="card-premium p-6">
            <h3 className="text-xl font-semibold text-brand-800">
              <Link href="/herbs/magnolia-officinalis" className="hover:underline">Magnolia bark</Link> &amp;{' '}
              <Link href="/herbs/valerian" className="hover:underline">valerian</Link>
            </h3>
            <p className="mt-3 text-sm text-muted">
              Magnolia&rsquo;s honokiol acts on GABA receptors and is used traditionally for evening
              tension. Valerian is more sedating and better evidenced for sleep onset, but results vary by
              extract and it is best in short courses. Keep either away from alcohol and other sedatives.
            </p>
          </article>

          <article className="card-premium p-6">
            <h3 className="text-xl font-semibold text-brand-800">
              <Link href="/compounds/l-theanine" className="hover:underline">L-theanine</Link>{' '}
              <span className="ml-2 rounded-full bg-brand-50 px-3 py-0.5 align-middle text-xs font-semibold text-brand-800">Fastest for racing thoughts</span>
            </h3>
            <p className="mt-3 text-sm text-muted">
              Not a herb but the most reliable fast-acting option for mental noise: 100–200&nbsp;mg quiets
              stress-driven arousal within an hour without sedation, and it stacks cleanly with magnesium
              or passionflower. See{' '}
              <Link href="/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium" className="font-medium text-brand-700 hover:underline">L-theanine vs magnesium</Link>.
            </p>
          </article>
        </section>

        {/* Wind-down routine */}
        <section id="routine" className="scroll-mt-20 space-y-3 rounded-[1.65rem] border border-brand-900/10 bg-brand-50/40 p-6">
          <h2 className="text-xl font-semibold text-ink">A simple evening wind-down</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted">
            <li>Set a caffeine curfew — nothing after early afternoon if evenings are when anxiety peaks.</li>
            <li>Dim lights and reduce screens 60–90&nbsp;minutes before bed to let melatonin rise naturally.</li>
            <li>Take your chosen calming herb or L-theanine 30–60&nbsp;minutes before bed.</li>
            <li>Offload the racing mind: a two-minute &ldquo;brain dump&rdquo; on paper beats fighting it lying down.</li>
            <li>Keep a consistent bedtime — a steady schedule is the most powerful anti-anxiety lever you have.</li>
          </ol>
        </section>

        {/* Risks & safety */}
        <section id="risks" className="scroll-mt-20 space-y-3 rounded-[1.65rem] border border-amber-200 bg-amber-50/70 p-6">
          <h2 className="text-xl font-semibold text-amber-900">Risks &amp; safety</h2>
          <ul className="space-y-2 text-sm text-amber-900">
            <li>• Do not combine sedating herbs (valerian, passionflower, magnolia) with alcohol, benzodiazepines, sleep medication, or opioids &mdash; additive CNS depression is a real safety risk.</li>
            <li>• <strong>Ashwagandha:</strong> avoid in pregnancy and breastfeeding; rare hepatotoxicity reported; caution with thyroid conditions, autoimmune disease, and immunosuppressants.</li>
            <li>• <strong>Valerian:</strong> avoid in pregnancy; do not combine with sedatives; short courses only.</li>
            <li>• <strong>Passionflower:</strong> avoid in pregnancy (uterotonic activity in animal models); do not combine with prescription sedatives.</li>
            <li>• <strong>Lemon balm:</strong> caution with sedatives and thyroid medications.</li>
            <li>• Herbs are educational support, not a treatment for diagnosed anxiety disorders, panic disorder, PTSD, or OCD.</li>
            <li>• If nighttime anxiety is frequent, intense, or paired with low mood, panic, or suicidal thoughts, contact a clinician &mdash; this is a mental health concern that supplements cannot address.</li>
          </ul>
        </section>

        {ashwagandhaProducts && (
        <References refs={BEST_HERBS_FOR_STRESS_AND_ANXIETY_AT_NIGHT_REFS} />
          <RecommendationSection products={ashwagandhaProducts.products} />
        )}

        {/* FAQs */}
        <section id="faq" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.question} className="card-premium p-5">
                <summary className="cursor-pointer text-base font-semibold text-ink">{faq.question}</summary>
                <p className="mt-2 text-sm text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <EmailCapture location="guides-best-herbs-for-stress-and-anxiety-at-night" className="mt-6" />

        {/* Related */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Related guides &amp; comparisons</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/guides/best-natural-sleep-aids-that-work/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Natural Sleep Aids That Work →</Link>
            <Link href="/guides/anxiety/best-herbs-for-anxiety" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Herbs for Anxiety →</Link>
            <Link href="/guides/how-to-lower-cortisol-naturally" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">How to Lower Cortisol Naturally →</Link>
            <Link href="/guides/anxiety/natural-anxiolytics-beyond-ashwagandha" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Natural Anxiolytics Beyond Ashwagandha →</Link>
            <Link href="/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Ashwagandha vs L-theanine vs Magnesium →</Link>
            <Link href="/guides/anxiety" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">All Anxiety Guides →</Link>
          </div>
        </section>
      </div>
    </ArticleLayout>
  )
}
