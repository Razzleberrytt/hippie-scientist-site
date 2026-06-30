import Link from 'next/link'
import { type EmailCaptureGoal, getLeadMagnet } from '@/content/emailCapture'

type LeadMagnetCTAProps = {
  goal?: EmailCaptureGoal
  href?: string
  className?: string
}

export function LeadMagnetCTA({
  goal = 'default',
  href = '/info/free-guide',
  className = '',
}: LeadMagnetCTAProps) {
  const leadMagnet = getLeadMagnet(goal)

  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900 ${className}`}
    >
      {leadMagnet.ctaLabel}
    </Link>
  )
}
