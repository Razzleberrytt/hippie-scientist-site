import MentalHealthArticlePage, { mentalHealthMetadata } from '@/components/articles/MentalHealthArticlePage'

const SLUG = 'avoidant-personality-disorder'

export const metadata = mentalHealthMetadata(SLUG)

export default function Page() {
  return <MentalHealthArticlePage slug={SLUG} />
}
