import type { EcosystemPanel, GraphLink } from '@/components/semantic-hubs/semantic-hub-sections'
import { matchTopicClusters, topicClusters, type TopicCluster } from './topic-taxonomy'

export { topicClusters, type TopicCluster } from './topic-taxonomy'

export function getTopicClusterLinks(limit = 10): GraphLink[] {
  return topicClusters.slice(0, limit).map((cluster: TopicCluster) => ({
    label: cluster.label,
    href: cluster.href,
    description: cluster.description,
  }))
}

export function getEcosystemPanels(signals: string[], limit = 6): EcosystemPanel[] {
  const matches = matchTopicClusters(signals)
  const selected = (matches.length ? matches : topicClusters).slice(0, limit)

  return selected.map((cluster) => ({
    eyebrow: 'Related scientific theme',
    title: cluster.label,
    body: cluster.description,
    href: cluster.href,
    signals: cluster.systems,
  }))
}

export function getAdjacentEcosystemPanels(signals: string[], limit = 4): EcosystemPanel[] {
  return getEcosystemPanels(signals, limit).map((panel) => ({
    ...panel,
    eyebrow: 'Research adjacency',
  }))
}
