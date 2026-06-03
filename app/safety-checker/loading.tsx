import { WizardSkeleton } from '@/components/skeletons'

export default function SafetyCheckerLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <WizardSkeleton />
    </div>
  )
}