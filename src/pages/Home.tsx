import { useEffect, useState } from 'react';
import Meta from '../components/Meta';
import NewsletterCard from '@/components/NewsletterCard';
import BackgroundStage from '@/components/BackgroundStage';
import MeltControls from '@/components/MeltControls';
import KPIRow from '@/components/KPIRow';
import { getCounters } from '@/lib/counters';
import { toHash } from '../lib/routing';
import { useMelt } from '@/melt/useMelt';
import type { MeltEffectKey } from '@/lib/melt-effects';

const counters = getCounters();

export default function Home() {
  const { preset, setPreset } = useMelt();
  const [fx, setFx] = useState<MeltEffectKey>(preset);

  useEffect(() => {
    setFx(preset);
  }, [preset]);

  const { herbCount, compoundCount, articleCount } = counters;

  const handleFxChange = (key: MeltEffectKey) => {
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

        <div className='container mx-auto px-4 pt-3'>
          <MeltControls value={fx} onChange={handleFxChange} />
        </div>

        <section className='container mx-auto px-4 py-10'>
          <div className='mx-auto max-w-screen-md rounded-[28px] backdrop-glass shadow-[0_18px_60px_-20px_rgba(0,0,0,.6)] ring-1 ring-black/5 p-6 md:p-8'>
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

            <div className='mt-6'>
              <KPIRow herbs={herbCount} compounds={compoundCount} articles={articleCount} />
            </div>
          </div>
        </section>
      </div>

      <section aria-label='Newsletter signup' className='container mx-auto max-w-screen-md px-4 pb-12'>
        <NewsletterCard />
      </section>
    </>
  );
}
