import { useEffect, useState } from 'react';
import Meta from '../components/Meta';
import NewsletterCard from '@/components/NewsletterCard';
import BackgroundStage from '@/components/BackgroundStage';
import MeltControl from '@/components/MeltControl';
import KPIRow from '@/components/KPIRow';
import { getCounters } from '@/lib/counters';
import { toHash } from '../lib/routing';
import { useMelt } from '@/melt/useMelt';
import type { MeltKey } from '@/lib/melt/effects';

const counters = getCounters();

export default function Home() {
  const { preset, setPreset } = useMelt();
  const [fx, setFx] = useState<MeltKey>(preset);

  useEffect(() => {
    setFx(preset);
  }, [preset]);

  const { herbCount, compoundCount, articleCount } = counters;

  const handleFxChange = (key: MeltKey) => {
    setFx(key);
    setPreset(key);
  };

  return (
    <>
      <Meta
        title='The Hippie Scientist — Mindful Exploration of Psychoactive Herbs'
        description='Independent research on psychoactive herbs, entheogens, and natural neurochemistry.'
        path='/'
        pageType='website'
      />

      <div className='relative'>
        <BackgroundStage effect={fx} />

        <div className='container mx-auto px-4 pt-3 flex justify-end'>
          <MeltControl value={fx} onChange={handleFxChange} />
        </div>

        <section className='container mx-auto px-4 py-10'>
          <div className='mx-auto max-w-screen-md rounded-[28px] border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]'>
            <h1 className='text-4xl md:text-5xl font-extrabold tracking-tight text-white'>The Hippie Scientist</h1>
            <p className='mt-4 text-white/85 leading-relaxed'>
              Psychedelic botany, mindful blends, and evidence-forward guidance for curious explorers.
            </p>

            <div className='mt-6 flex flex-col sm:flex-row gap-3'>
              <a
                href={toHash('/database')}
                className='glass-pill px-5 py-3 text-white font-medium bg-emerald-500/80 hover:bg-emerald-500 transition-colors border-transparent'
              >
                🌿 Browse Herbs
              </a>
              <a
                href={toHash('/build')}
                className='glass-pill px-5 py-3 text-white/95 font-medium hover:bg-white/10 transition-colors'
              >
                🧪 Build a Blend
              </a>
            </div>

            <KPIRow
              className='mt-6'
              herbs={herbCount}
              compounds={compoundCount}
              articles={articleCount}
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
