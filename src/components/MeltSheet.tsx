import { useEffect } from 'react';
import clsx from 'clsx';
import { MELT_OPTIONS } from './MeltControl';
import { useMelt } from '@/melt/useMelt';

type MeltSheetProps = {
  open: boolean;
  onClose: () => void;
};

export default function MeltSheet({ open, onClose }: MeltSheetProps) {
  const { preset, setPreset } = useMelt();

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-[60]'>
      <button
        type='button'
        aria-label='Close Melt panel'
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='absolute inset-x-0 bottom-0'>
        <div className='safe mx-auto max-w-screen-md w-full px-4 pb-6'>
          <div className='rounded-3xl bg-black/60 p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10 backdrop-blur-xl sm:p-6'>
            <div className='flex items-center justify-between gap-3'>
              <h3 className='text-base font-semibold text-white'>Melt presets</h3>
              <button
                type='button'
                className='text-sm text-white/70 transition hover:text-white'
                onClick={onClose}
              >
                Close
              </button>
            </div>

            <div className='mt-3 text-sm text-white/70'>Pick an animation preset to instantly shift the Melt background vibe.</div>
            <div className='mt-3 grid grid-cols-2 gap-2'>
              {MELT_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type='button'
                  onClick={() => {
                    setPreset(option.key);
                    onClose();
                  }}
                  className={clsx(
                    'rounded-full px-3 py-2 text-sm text-zinc-300 ring-1 ring-white/10 transition hover:text-white hover:ring-white/30',
                    preset === option.key && 'bg-white/10 text-white',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
