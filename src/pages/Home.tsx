import Meta from '../components/Meta';
import NewsletterCard from '@/components/NewsletterCard';
import StatBadges from '@/components/StatBadges';
import { getCounters } from '@/lib/counters';
import { toHash } from '../lib/routing';

const counters = getCounters();

export default function Home() {
  const { herbCount, compoundCount, articleCount } = counters;

  return (
    <>
      <Meta
        title='The Hippie Scientist — Mindful Exploration of Psychoactive Herbs'
        description='Independent research on psychoactive herbs, entheogens, and natural neurochemistry.'
        path='/'
        pageType='website'
      />

      <div className='relative'>
        <section className='container mx-auto px-4 py-10'>
          <div className='mx-auto max-w-screen-md rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-white shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-10'>
            <h1 className='text-4xl font-extrabold tracking-tight text-white md:text-5xl'>The Hippie Scientist</h1>
            <p className='mt-4 text-base leading-relaxed text-white/90 md:text-lg'>
              Psychedelic botany, mindful blends, and evidence-forward guidance for curious explorers.
            </p>

            <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
              <a
                href={toHash('/database')}
                className='inline-flex items-center justify-center rounded-full border border-transparent bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400'
              >
                🌿 Browse Herbs
              </a>
              <a
                href={toHash('/build')}
                className='inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]'
              >
                🧪 Build a Blend
              </a>
            </div>

            <StatBadges
              stats={[
                { label: 'psychoactive herbs', value: herbCount },
                { label: 'active compounds', value: compoundCount },
                { label: 'articles', value: articleCount },
              ]}
            />
          </div>
        </section>
      </div>

      <section aria-label='Newsletter signup' className='container mx-auto max-w-screen-md px-4 pb-12'>
        <NewsletterCard />
      </section>
    </>
  );
}
