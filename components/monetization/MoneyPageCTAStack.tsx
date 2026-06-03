import type { EmailCaptureGoal } from '@/content/emailCapture'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import { EmailCaptureBox } from './EmailCaptureBox'
import { SafetyDisclaimerBox } from './SafetyDisclaimerBox'
import { TrustMethodologyCallout } from './TrustMethodologyCallout'

type MoneyPageCTAStackProps = {
  goal?: EmailCaptureGoal
  className?: string
}

export function MoneyPageCTAStack({
  goal = 'default',
  className = '',
}: MoneyPageCTAStackProps) {
  return (
    <section className={`grid gap-4 lg:grid-cols-[1fr_1.1fr] ${className}`}>
      <div className='space-y-4'>
        <TrustMethodologyCallout title='Before you compare products' />
        <SafetyDisclaimerBox compact />
      </div>
      <div className='space-y-3'>
        <EmailCaptureBox goal={goal} variant='card' />
        <AffiliateDisclosure variant='compact' />
      </div>
    </section>
  )
}
