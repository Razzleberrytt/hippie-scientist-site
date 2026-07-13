import MentalHealthArticlePage, { mentalHealthMetadata } from '@/components/articles/MentalHealthArticlePage'

const SLUG = 'borderline-personality-disorder'

export const metadata = mentalHealthMetadata(SLUG)

export default function Page() {
  return <MentalHealthArticlePage slug={SLUG} />
}
