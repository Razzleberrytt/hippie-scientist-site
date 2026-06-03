import { WizardSkeleton } from '@/components/skeletons'

export default function QuizLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <WizardSkeleton />
    </div>
  )
}