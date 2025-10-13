import { useEffect, useState } from 'react';
import Meta from '../components/Meta';
import { useTrippy } from '@/lib/trippy';
import { useMelt } from '@/melt/useMelt';
import MeltControls from '@/components/MeltControls';

export default function Theme() {
  const { enabled: motionEnabled } = useTrippy();
  const { enabled, setEnabled, preset, setPreset } = useMelt();
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
          <p className='max-w-2xl text-base text-zinc-300/80 md:text-lg'>
            Experiment with background animation presets and accessibility settings to personalize The Hippie Scientist.
          </p>
        </header>
        <div className='mt-6 space-y-6 rounded-3xl bg-white/14 p-6 text-white ring-1 ring-white/12 shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)] backdrop-blur-xl'>
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

          <div className='space-y-2'>
            <h2 className='text-base font-semibold text-white'>Animation presets</h2>
            <div className='w-full overflow-x-hidden'>
              <MeltControls value={preset} onChange={setPreset} className='max-w-full' />
            </div>
            <p className='text-sm text-zinc-300/70'>Choose a preset to instantly recolor the Melt background. Your selection is saved for future visits.</p>
          </div>
        </div>
      </section>
    </>
  );
}
