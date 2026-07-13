import { coreMentalHealthArticles } from './mental-health/articles-core'
import { clusterAMentalHealthArticles } from './mental-health/articles-cluster-a'
import { clusterBMentalHealthArticles } from './mental-health/articles-cluster-b'
import { clusterCMentalHealthArticles } from './mental-health/articles-cluster-c'
import type { MentalHealthArticle } from './mental-health/types'

export type {
  CitedText,
  MentalHealthArticle,
  MentalHealthFaq,
  MentalHealthReference,
  MentalHealthSection,
  MentalHealthSourceTier,
} from './mental-health/types'

export const mentalHealthArticles: MentalHealthArticle[] = [
  ...coreMentalHealthArticles,
  ...clusterAMentalHealthArticles,
  ...clusterBMentalHealthArticles,
  ...clusterCMentalHealthArticles,
]

export const mentalHealthArticleSlugs = mentalHealthArticles.map((article) => article.slug)

export function getMentalHealthArticle(slug: string): MentalHealthArticle | undefined {
  return mentalHealthArticles.find((article) => article.slug === slug)
}

export function getMentalHealthArticlesByCluster(cluster: MentalHealthArticle['cluster']): MentalHealthArticle[] {
  return mentalHealthArticles.filter((article) => article.cluster === cluster)
}
