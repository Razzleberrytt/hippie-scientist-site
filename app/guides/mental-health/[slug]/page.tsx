import type { Metadata } from 'next'

import MentalHealthArticlePage, { mentalHealthMetadata } from '@/components/articles/MentalHealthArticlePage'
import { mentalHealthArticleSlugs } from '@/lib/mental-health-articles'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return mentalHealthArticleSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return mentalHealthMetadata(slug)
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  return <MentalHealthArticlePage slug={slug} />
}
