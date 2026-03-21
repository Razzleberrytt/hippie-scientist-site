import { Button } from './ui/Button'
import { recordDevMessage } from '../utils/devMessages'

type BundleUpgradeCardProps = {
  sourcePage: string
  currentBlendName?: string
  className?: string
}

const BUNDLE_LINK = 'https://buy.stripe.com/your-bundle-link-here'

const BUNDLE_GUIDES = ['Calm Blend Guide', 'Focus Blend Guide', 'Sleep Blend Guide']

export default function BundleUpgradeCard({
  sourcePage,
  currentBlendName,
  className = '',
}: BundleUpgradeCardProps) {
  const handleBundleUpgrade = () => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(
        'hs_bundle_interest',
        JSON.stringify({
          sourcePage,
          currentBlendName: currentBlendName ?? null,
          timestamp: new Date().toISOString(),
        })
      )
    } catch (error) {
      recordDevMessage('warning', 'Unable to store bundle interest', error)
    }

    window.open(BUNDLE_LINK, '_blank', 'noopener,noreferrer')
  }

  return (
    <section
      className={`border-brand-lime/50 from-brand-lime/20 via-panel to-panel/95 relative space-y-4 overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-[0_0_0_1px_rgba(163,230,53,0.16),0_16px_44px_-18px_rgba(163,230,53,0.95)] ${className}`.trim()}
    >
      <div className='from-brand-lime/25 via-brand-lime/10 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent' />
      <div className='relative z-10 space-y-4'>
        <p className='text-sub text-xs uppercase tracking-[0.3em]'>Bundle Upgrade</p>
        <div>
          <h4 className='text-text text-lg font-semibold'>Want the full set?</h4>
          <p className='text-sub mt-1 text-sm leading-relaxed'>
            Get 3 beginner-friendly blend guides for calm, focus, and sleep.
          </p>
        </div>

        <div className='rounded-xl border border-white/15 bg-black/30 p-3.5'>
          <p className='text-text text-sm font-semibold'>Bundle contents</p>
          <ul className='text-sub mt-2 list-inside list-disc space-y-1 text-sm'>
            {BUNDLE_GUIDES.map(guide => (
              <li key={guide}>{guide}</li>
            ))}
          </ul>
        </div>

        <div className='grid gap-2 rounded-xl border border-white/15 bg-black/30 p-3.5 text-sm sm:grid-cols-2'>
          <p className='text-sub'>
            Single Starter Pack: <span className='text-text font-semibold'>$9</span>
          </p>
          <p className='text-sub'>
            Bundle: <span className='text-brand-lime font-semibold'>$19</span>
          </p>
        </div>

        <div className='space-y-2.5 border-t border-white/10 pt-2'>
          <Button
            onClick={handleBundleUpgrade}
            className='border-brand-lime/55 bg-brand-lime/25 text-brand-lime hover:bg-brand-lime/35 w-full justify-center border'
          >
            Upgrade to Bundle
          </Button>
          <p className='text-sub text-center text-xs'>
            One payment • Instant access • Beginner-friendly
          </p>
        </div>
      </div>
    </section>
  )
}
