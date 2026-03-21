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
      className={`border-brand-lime/45 from-brand-lime/18 via-panel to-panel/95 relative space-y-4 overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-[0_0_0_1px_rgba(163,230,53,0.16),0_16px_44px_-18px_rgba(163,230,53,0.95)] ${className}`.trim()}
    >
      <div className='from-brand-lime/20 via-brand-lime/8 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent' />
      <div className='relative z-10 space-y-4'>
        <p className='text-white/72 text-xs uppercase tracking-[0.3em]'>Bundle Upgrade</p>
        <div>
          <h4 className='text-text text-lg font-semibold'>Get every starter guide in one bundle</h4>
          <p className='text-sub mt-1 text-sm leading-relaxed'>
            Save and cover your full routine: calm evenings, focused mornings, and better sleep
            support.
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
            3 singles:{' '}
            <span className='text-text font-semibold line-through decoration-white/35'>$27</span>
          </p>
          <p className='text-sub'>
            Bundle today: <span className='text-brand-lime text-lg font-semibold'>$19</span>
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
