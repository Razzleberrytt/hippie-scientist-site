import MentalHealthArticlePage, { mentalHealthMetadata } from '@/components/articles/MentalHealthArticlePage'

const SLUG = 'schizotypal-personality-disorder'

export const metadata = mentalHealthMetadata(SLUG)

export default function Page() {
  return <MentalHealthArticlePage slug={SLUG} />
}
