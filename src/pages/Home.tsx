import Meta from '../components/Meta';
import NewsletterCard from '@/components/NewsletterCard';
import Magnetic from '@/components/Magnetic';
import BackgroundCanvas from '@/components/BackgroundCanvas';
import MeltControls from '@/components/MeltControls';
import KPIRow from '@/components/KPIRow';
import { getCounters } from '@/lib/counters';
import { toHash } from '../lib/routing';
import { useMelt } from '@/melt/useMelt';

const counters = getCounters();

export default function Home() {
  const { preset, setPreset } = useMelt();
  const { herbCount, compoundCount, articleCount } = counters;

  return (
    <>
      <Meta
        title='The Hippie Scientist — Mindful Exploration of Psychoactive Herbs'
        description='Independent research on psychoactive herbs, entheogens, and natural neurochemistry.'
        path='/'
        pageType='website'
      />

      <div className='relative isolate'>
        <BackgroundCanvas preset={preset} className='absolute inset-0 -z-10' />

        <div className='container-safe pt-3'>
          <div className='w-full overflow-x-hidden'>
            <MeltControls value={preset} onChange={setPreset} className='max-w-full' />
          </div>
        </div>

        <section className='mx-auto max-w-screen-md w-full px-4 py-10'>
          <div className='relative overflow-hidden rounded-[28px] border border-white/18 bg-white/8 backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,.55)] ring-1 ring-black/5 p-6 md:p-8'>
            <div className='relative'>
              <h1 className='text-4xl font-extrabold tracking-tight text-white sm:text-5xl'>The Hippie Scientist</h1>
              <p className='mt-4 text-base text-white/80 sm:text-lg'>
                Psychedelic botany, mindful blends, and evidence-forward guidance for curious explorers.
              </p>

              <div className='mt-5 flex flex-wrap gap-3'>
                <Magnetic strength={12}>
                  <a
                    href={toHash('/database')}
                    className='inline-flex items-center gap-2 rounded-2xl bg-emerald-500/85 px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-400/90'
                  >
                    🌿 Browse Herbs
                  </a>
                </Magnetic>
                <Magnetic strength={12}>
                  <a
                    href={toHash('/build')}
                    className='inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10'
                  >
                    🧪 Build a Blend
                  </a>
                </Magnetic>
              </div>

              <KPIRow
                herbs={herbCount}
                compounds={compoundCount}
                articles={articleCount}
                className='mt-6'
              />
            </div>
          </div>
        </section>
      </div>

      <section
        aria-label='Newsletter signup'
        className='mx-auto max-w-screen-md w-full px-4 pb-12'
      >
        <NewsletterCard />
      </section>
    </>
  );
}
