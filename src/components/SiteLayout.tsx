import { PropsWithChildren } from 'react'
import CosmicBackground from './CosmicBackground'
import { useTrippy } from '@/lib/trippy'
import { useMelt } from '@/melt/useMelt'

type SiteLayoutProps = PropsWithChildren<{
  ambientEnabled?: boolean
}>

export default function SiteLayout({ children, ambientEnabled = true }: SiteLayoutProps) {
  const { level, enabled: trippyEnabled } = useTrippy()
  const { enabled } = useMelt()

  const shouldAnimate = ambientEnabled && trippyEnabled && level !== 'off' && enabled

  return (
    <div className='relative isolate min-h-svh overflow-x-hidden'>
      <CosmicBackground animated={shouldAnimate} />
      <div className='relative z-10 flex min-h-svh flex-col'>{children}</div>
    </div>
  )
}
