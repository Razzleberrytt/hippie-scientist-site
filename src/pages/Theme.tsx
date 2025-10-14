import { useEffect, useState } from 'react';
import Meta from '../components/Meta';
import { useTrippy } from '@/lib/trippy';
import { useMelt } from '@/melt/useMelt';
import MeltToggle, { EFFECTS } from '@/components/MeltToggle';

export default function Theme() {
  const { enabled: motionEnabled } = useTrippy();
  const { enabled, setEnabled, effect, setEffect } = useMelt();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => setPrefersReducedMotion(media.matches);
    update();

    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }

    if (typeof media.addListener === 'function') {
      media.addListener(handler);
      return () => media.removeListener(handler);
    }

    return undefined;
  }, []);

  const canAnimate = motionEnabled && !prefersReducedMotion;

  return (
    <>
      <Meta title='Theme Lab | The Hippie Scientist' description='Adjust the site appearance to match your vibe.' path='/theme' />
      <section className='mx-auto max-w-6xl px-4 pb-20 pt-6 md:pt-10'>
        <header className='space-y-3'>
          <h1 className='text-4xl font-extrabold tracking-tight text-white/90 md:text-5xl'>Theme Lab</h1>
          <p className='max-w-2xl text-base text-white/85 md:text-lg'>
            Experiment with background animation types and accessibility settings to personalize The Hippie Scientist.
          </p>
        </header>
        <div className='mt-6 space-y-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-white shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-8'>
          <div className='flex flex-wrap items-center gap-3'>
            <button
              type='button'
              onClick={() => setEnabled(!enabled)}
              disabled={!canAnimate}
              className='btn-secondary rounded-2xl px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {enabled ? 'Disable Melt' : 'Enable Melt'}
            </button>
            <p className='text-sm text-zinc-300/80'>
              {prefersReducedMotion
                ? 'Melt stays off automatically because your device prefers reduced motion.'
                : !motionEnabled
                ? 'Melt controls are unavailable right now.'
                : enabled
                ? 'Melt is on. Tap to pause the animated background.'
                : 'Melt is off. Re-enable it when you want full vibes.'}
            </p>
          </div>

          <div className='space-y-3'>
            <h2 className='text-base font-semibold text-white'>Animation types</h2>
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
              {EFFECTS.map((option) => (
                <button
                  key={option.id}
                  type='button'
                  onClick={() => setEffect(option.id)}
                  className={`rounded-2xl border border-white/10 px-3 py-2 text-sm transition ${
                    effect === option.id ? 'bg-white/10 text-white' : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className='text-sm text-white/70'>Choose how the Melt background animates. Effects stay saved for your next visit.</p>
          </div>

          <div className='space-y-2'>
            <h2 className='text-base font-semibold text-white'>Quick toggle</h2>
            <MeltToggle state={{ enabled, effect }} onChange={(next) => { setEnabled(next.enabled); setEffect(next.effect); }} />
            <p className='text-sm text-white/70'>Access the Melt menu anywhere from the site header.</p>
          </div>
        </div>
      </section>
    </>
  );
}
