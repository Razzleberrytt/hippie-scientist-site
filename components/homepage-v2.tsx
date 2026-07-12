import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Check,
  FlaskConical,
  Leaf,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Wind,
  Zap,
} from 'lucide-react'
import articlesData from '@/data/articles/articles.json'
import styles from './homepage-reference-match.module.css'

const goals = [
  {
    href: '/guides/sleep/',
    label: 'Sleep',
    detail: 'Fall asleep, stay asleep, wake clearer.',
    Icon: Moon,
  },
  {
    href: '/guides/anxiety/',
    label: 'Stress',
    detail: 'Adaptogens, calming herbs, and tradeoffs.',
    Icon: Wind,
  },
  {
    href: '/guides/anxiety/',
    label: 'Anxiety',
    detail: 'Evidence for calm without vague promises.',
    Icon: Leaf,
  },
  {
    href: '/guides/focus/',
    label: 'Focus',
    detail: 'Compare stimulants and non-stimulants.',
    Icon: Zap,
  },
]

const trustPoints = [
  { label: 'Human evidence first', Icon: FlaskConical },
  { label: 'Safety in context', Icon: ShieldCheck },
  { label: 'No marketing fluff', Icon: BookOpen },
]

const startingPoints = [
  {
    href: '/herbs/ashwagandha/',
    title: 'Ashwagandha',
    description: 'Stress and sleep evidence, extract differences, and important liver and thyroid cautions.',
    image: '/images/guides/ashwagandha-herb.jpg',
    eyebrow: 'Popular herb',
  },
  {
    href: '/compounds/l-theanine/',
    title: 'L-theanine',
    description: 'Calm, attention, and sleep claims separated from what the trials actually show.',
    image: '/images/monographs/photos/l-theanine.jpg',
    eyebrow: 'Popular compound',
  },
  {
    href: '/compounds/magnesium-glycinate/',
    title: 'Magnesium glycinate',
    description: 'A practical look at sleep evidence, formulation limits, kidney risk, and interactions.',
    image: '/images/guides/magnesium-for-sleep-and-anxiety.svg',
    eyebrow: 'Popular comparison',
  },
]

const comparisonLinks = [
  {
    href: '/guides/compare/melatonin-vs-magnesium/',
    title: 'Melatonin vs magnesium',
    detail: 'Different problems, different tradeoffs.',
  },
  {
    href: '/guides/compare/rhodiola-vs-ashwagandha/',
    title: 'Rhodiola vs ashwagandha',
    detail: 'Activation, fatigue, stress, and timing.',
  },
  {
    href: '/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/',
    title: 'Ashwagandha vs L-theanine vs magnesium',
    detail: 'Three popular calm and sleep options compared.',
  },
]

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className='group inline-flex items-center gap-2 text-sm font-bold text-[#234f41] transition hover:text-[#0f352a]'
    >
      {children}
      <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' aria-hidden='true' />
    </Link>
  )
}

export default function HomepageV2() {
  const articles = Array.isArray(articlesData) ? articlesData : (articlesData as any).articles || []
  const latestArticles = articles
    .filter((article: any) => article.date && article.published !== false)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  return (
    <div className={styles.page}>
      <div className='mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6 sm:pb-24 sm:pt-8 lg:px-8'>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className='inline-flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-[#a87532]'>
              <span className='h-px w-7 bg-[#c9a66b]' aria-hidden='true' />
              Evidence-based supplement guidance
            </div>

            <h1 className='mt-5 max-w-[11ch] font-display text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.045em] text-[#123c2f] sm:text-[3.75rem] lg:text-[4.45rem]'>
              Herbs &amp; supplements, actually explained.
            </h1>

            <p className='mt-5 max-w-xl text-[0.98rem] leading-7 text-[#4c5b54] sm:text-lg sm:leading-8'>
              Clear guides for sleep, stress, anxiety, and focus — with mechanisms, safety context, and practical comparisons grounded in the research.
            </p>

            <div className='mt-7 flex flex-col gap-3 sm:flex-row'>
              <Link
                href='#browse-goals'
                className='inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#123c2f] px-6 py-3 text-sm font-bold text-[#fffdf8] shadow-[0_12px_30px_rgba(18,60,47,0.2)] transition hover:-translate-y-0.5 hover:bg-[#0e3328]'
              >
                Browse by health goal
                <ArrowRight className='h-4 w-4' aria-hidden='true' />
              </Link>
              <Link
                href='/search/'
                className='inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#123c2f]/15 bg-[#fffdf8]/80 px-6 py-3 text-sm font-bold text-[#123c2f] transition hover:border-[#b88a42]/45 hover:bg-white'
              >
                <Search className='h-4 w-4' aria-hidden='true' />
                Search the library
              </Link>
            </div>

            <div className='mt-8 grid gap-2.5 sm:grid-cols-3'>
              {trustPoints.map(({ label, Icon }) => (
                <div key={label} className='flex items-center gap-2 text-xs font-semibold text-[#526159]'>
                  <span className='flex h-7 w-7 items-center justify-center rounded-full bg-[#e4ecdf] text-[#315f50]'>
                    <Icon className='h-3.5 w-3.5' aria-hidden='true' strokeWidth={2} />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.heroVisual} aria-label='Botanical ingredients and supplement research'>
            <div className={styles.primaryPhoto}>
              <Image
                src='/images/guides/ashwagandha-herb.jpg'
                alt='Ashwagandha botanical study visual'
                fill
                priority
                sizes='(max-width: 900px) 100vw, 46vw'
                className='object-cover'
              />
              <div className={styles.photoWash} />
              <div className={styles.imageLabel}>
                <span className='text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-[#a87532]'>Featured profile</span>
                <span className='mt-1 block font-display text-xl font-semibold text-[#123c2f]'>Ashwagandha</span>
                <span className='mt-1 block text-xs leading-5 text-[#526159]'>Stress, sleep, extract quality, and safety.</span>
              </div>
            </div>

            <div className={styles.smallPhotoTop}>
              <Image
                src='/images/monographs/photos/chamomile.jpg'
                alt='Chamomile flowers'
                fill
                sizes='180px'
                className='object-cover'
              />
            </div>

            <div className={styles.smallPhotoBottom}>
              <Image
                src='/images/monographs/photos/l-theanine.jpg'
                alt='Tea leaves associated with L-theanine'
                fill
                sizes='180px'
                className='object-cover'
              />
            </div>

            <div className={styles.visualBadge}>
              <Sparkles className='h-4 w-4 text-[#b88a42]' aria-hidden='true' />
              <span>Research, translated</span>
            </div>
          </div>
        </section>

        <section id='browse-goals' className='scroll-mt-28 border-b border-[#123c2f]/10 py-10 sm:py-14'>
          <div className='mb-6 flex items-end justify-between gap-4'>
            <div>
              <p className='text-[0.7rem] font-extrabold uppercase tracking-[0.15em] text-[#a87532]'>Start here</p>
              <h2 className='mt-2 font-display text-3xl font-semibold tracking-[-0.035em] text-[#123c2f] sm:text-4xl'>Choose your health goal</h2>
            </div>
            <ArrowLink href='/guides/'>All guides</ArrowLink>
          </div>

          <div className='grid grid-cols-2 gap-px overflow-hidden rounded-[1.4rem] border border-[#123c2f]/10 bg-[#123c2f]/10 lg:grid-cols-4'>
            {goals.map(({ href, label, detail, Icon }) => (
              <Link
                key={label}
                href={href}
                className='group min-h-40 bg-[#fffdf8] p-4 transition hover:bg-[#f2f6ef] sm:p-5'
              >
                <span className='flex h-10 w-10 items-center justify-center rounded-full bg-[#e4ecdf] text-[#315f50]'>
                  <Icon className='h-5 w-5' aria-hidden='true' strokeWidth={1.8} />
                </span>
                <h3 className='mt-4 font-display text-xl font-semibold text-[#123c2f]'>{label}</h3>
                <p className='mt-1.5 text-xs leading-5 text-[#617069] sm:text-sm'>{detail}</p>
                <span className='mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#315f50]'>
                  Explore <ArrowRight className='h-3.5 w-3.5 transition group-hover:translate-x-1' aria-hidden='true' />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className='grid gap-10 border-b border-[#123c2f]/10 py-10 sm:py-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16'>
          <div>
            <p className='text-[0.7rem] font-extrabold uppercase tracking-[0.15em] text-[#a87532]'>Popular starting points</p>
            <h2 className='mt-2 max-w-[12ch] font-display text-3xl font-semibold tracking-[-0.035em] text-[#123c2f] sm:text-4xl'>Begin with the pages people use most.</h2>
            <p className='mt-4 max-w-md text-sm leading-7 text-[#59675f] sm:text-base'>
              Straightforward profiles that show what the research supports, where it is thin, and what deserves caution.
            </p>
            <div className='mt-5'>
              <ArrowLink href='/herbs/'>Browse the full library</ArrowLink>
            </div>
          </div>

          <div className='divide-y divide-[#123c2f]/10 border-y border-[#123c2f]/10'>
            {startingPoints.map((item) => (
              <Link key={item.href} href={item.href} className='group grid grid-cols-[5.75rem_1fr_auto] items-center gap-4 py-4 sm:grid-cols-[7rem_1fr_auto] sm:py-5'>
                <span className='relative block aspect-[4/3] overflow-hidden rounded-xl bg-[#e6ede3]'>
                  <Image src={item.image} alt='' fill sizes='112px' className='object-cover transition duration-500 group-hover:scale-[1.04]' />
                </span>
                <span className='min-w-0'>
                  <span className='text-[0.62rem] font-extrabold uppercase tracking-[0.13em] text-[#a87532]'>{item.eyebrow}</span>
                  <span className='mt-1 block font-display text-xl font-semibold text-[#123c2f]'>{item.title}</span>
                  <span className='mt-1 hidden text-sm leading-6 text-[#617069] sm:block'>{item.description}</span>
                </span>
                <ArrowRight className='h-5 w-5 text-[#315f50] transition group-hover:translate-x-1' aria-hidden='true' />
              </Link>
            ))}
          </div>
        </section>

        <section className='grid gap-10 border-b border-[#123c2f]/10 py-10 sm:py-14 lg:grid-cols-2 lg:gap-16'>
          <div>
            <p className='text-[0.7rem] font-extrabold uppercase tracking-[0.15em] text-[#a87532]'>Compare before you choose</p>
            <h2 className='mt-2 font-display text-3xl font-semibold tracking-[-0.035em] text-[#123c2f] sm:text-4xl'>Side-by-side answers, minus the sales pitch.</h2>
            <div className='mt-6 divide-y divide-[#123c2f]/10 border-y border-[#123c2f]/10'>
              {comparisonLinks.map((item) => (
                <Link key={item.href} href={item.href} className='group flex items-center justify-between gap-4 py-4'>
                  <span>
                    <span className='block text-sm font-bold text-[#123c2f]'>{item.title}</span>
                    <span className='mt-1 block text-xs leading-5 text-[#69766f]'>{item.detail}</span>
                  </span>
                  <ArrowRight className='h-4 w-4 shrink-0 text-[#315f50] transition group-hover:translate-x-1' aria-hidden='true' />
                </Link>
              ))}
            </div>
            <div className='mt-5'>
              <ArrowLink href='/guides/compare/'>All comparisons</ArrowLink>
            </div>
          </div>

          <div className={styles.safetyPanel}>
            <div className='flex h-11 w-11 items-center justify-center rounded-full bg-[#e4ecdf] text-[#315f50]'>
              <ShieldCheck className='h-5 w-5' aria-hidden='true' />
            </div>
            <p className='mt-5 text-[0.7rem] font-extrabold uppercase tracking-[0.15em] text-[#a87532]'>Safety first</p>
            <h2 className='mt-2 max-w-[13ch] font-display text-3xl font-semibold tracking-[-0.035em] text-[#123c2f] sm:text-4xl'>Check the combination before you stack it.</h2>
            <ul className='mt-6 space-y-3 text-sm text-[#526159]'>
              {[
                'Shared sedation and stimulation risks',
                'Blood-pressure and blood-sugar overlap',
                'Medication-spacing and kidney cautions',
              ].map((item) => (
                <li key={item} className='flex items-start gap-3'>
                  <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#123c2f] text-white'>
                    <Check className='h-3 w-3' aria-hidden='true' />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href='/safety-checker/'
              className='mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#123c2f] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0e3328]'
            >
              Open the safety checker
              <ArrowRight className='h-4 w-4' aria-hidden='true' />
            </Link>
          </div>
        </section>

        {latestArticles.length > 0 ? (
          <section className='py-10 sm:py-14'>
            <div className='mb-6 flex items-end justify-between gap-4'>
              <div>
                <p className='text-[0.7rem] font-extrabold uppercase tracking-[0.15em] text-[#a87532]'>Latest research</p>
                <h2 className='mt-2 font-display text-3xl font-semibold tracking-[-0.035em] text-[#123c2f] sm:text-4xl'>New guides and evidence reviews</h2>
              </div>
              <ArrowLink href='/guides/'>All guides</ArrowLink>
            </div>

            <div className='grid gap-6 md:grid-cols-3'>
              {latestArticles.map((article: any, index: number) => (
                <Link key={article.slug} href={`/articles/${article.slug}/`} className='group border-t border-[#123c2f]/15 pt-4'>
                  <span className='text-[0.65rem] font-extrabold uppercase tracking-[0.13em] text-[#a87532]'>0{index + 1}</span>
                  <h3 className='mt-3 font-display text-xl font-semibold leading-snug text-[#123c2f] transition group-hover:text-[#315f50]'>{article.title}</h3>
                  {article.excerpt ? <p className='mt-2 line-clamp-3 text-sm leading-6 text-[#647168]'>{article.excerpt}</p> : null}
                  <span className='mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#315f50]'>
                    Read guide <ArrowRight className='h-3.5 w-3.5 transition group-hover:translate-x-1' aria-hidden='true' />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
