import { Button } from './ui/Button'

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
      console.warn('Unable to store bundle interest', error)
    }

    window.open(BUNDLE_LINK, '_blank', 'noopener,noreferrer')
  }

  return (
    <section
      className={`from-lime-400/18 to-black/40/95 relative space-y-4 overflow-hidden rounded-2xl border border-lime-400/45 bg-gradient-to-br via-black/40 p-5 shadow-[0_0_0_1px_rgba(163,230,53,0.16),0_16px_44px_-18px_rgba(163,230,53,0.95)] ${className}`.trim()}
    >
      <div className='via-lime-400/8 pointer-events-none absolute inset-0 bg-gradient-to-r from-lime-400/20 to-transparent' />
      <div className='relative z-10 space-y-4'>
        <p className='text-white/72 text-xs uppercase tracking-[0.3em]'>Bundle Upgrade</p>
        <div>
          <h4 className='text-lg font-semibold text-white'>
            Get every starter guide in one bundle
          </h4>
          <p className='mt-1 text-sm leading-relaxed text-white/60'>
            Save and cover your full routine: calm evenings, focused mornings, and better sleep
            support.
          </p>
        </div>

        <div className='rounded-xl border border-white/15 bg-black/30 p-3.5'>
          <p className='text-sm font-semibold text-white'>Bundle contents</p>
          <ul className='mt-2 list-inside list-disc space-y-1 text-sm text-white/60'>
            {BUNDLE_GUIDES.map(guide => (
              <li key={guide}>{guide}</li>
            ))}
          </ul>
        </div>

        <div className='grid gap-2 rounded-xl border border-white/15 bg-black/30 p-3.5 text-sm sm:grid-cols-2'>
          <p className='text-white/60'>
            3 singles:{' '}
            <span className='font-semibold text-white line-through decoration-white/35'>$27</span>
          </p>
          <p className='text-white/60'>
            Bundle today: <span className='text-lg font-semibold text-lime-300'>$19</span>
          </p>
        </div>

        <div className='space-y-2.5 border-t border-white/10 pt-2'>
          <Button
            onClick={handleBundleUpgrade}
            className='w-full justify-center border border-lime-400/55 bg-lime-400/25 text-lime-300 hover:bg-lime-400/35'
          >
            Upgrade to Bundle
          </Button>
          <p className='text-center text-xs text-white/60'>
            One payment • Instant access • Beginner-friendly
          </p>
        </div>
      </div>
    </section>
  )
}
