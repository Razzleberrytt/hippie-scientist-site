import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { getHerbs, getCompounds } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { WizardSkeleton } from '@/components/skeletons'

const RecommendationQuiz = dynamic(
  () => import('@/components/quiz/RecommendationQuiz'),
  { loading: () => <WizardSkeleton /> },
)

export const metadata: Metadata = {
  title: 'Personalized Botanical Supplement Quiz',
  description: 'Take our 1-minute science-first quiz to discover which herbs and compounds best fit your goals, sensitivity constraints, and baseline experience.',
}

export default async function QuizPage() {
  const [rawHerbs, rawCompounds] = await Promise.all([getHerbs(), getCompounds()])

  const herbs = rawHerbs.filter((h: Record<string, unknown>) => {
    try {
      return getRuntimeVisibility(h).canRender
    } catch {
      return true
    }
  })

  const compounds = rawCompounds.filter((c: Record<string, unknown>) => {
    try {
      return getRuntimeVisibility(c).canRender
    } catch {
      return true
    }
  })

  return (
    <div className='mx-auto max-w-4xl space-y-8 px-4 py-8 sm:py-10'>
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 text-center max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold tracking-tight text-ink sm:text-4xl'>
          Supplement Recommendation Quiz
        </h1>
        <p className='mt-3 text-sm leading-6 text-muted sm:text-base'>
          Answer a few quick questions to identify the highest-evidence herbs and compounds that align with your neurochemical goals and safety profile.
        </p>
      </section>

      <Suspense fallback={<WizardSkeleton />}>
        <RecommendationQuiz herbs={herbs} compounds={compounds} />
      </Suspense>
    </div>
  )
}
