/**
 * ADHD / Focus cluster graph and interlinking system.
 *
 * Defines five semantic clusters (ADHD-Focus, Sleep, Stress-Anxiety, Energy,
 * Neuroprotection) as static data — no runtime reads, fully tree-shakeable,
 * safe for static export.
 *
 * Public API:
 *  getEntityClusters(slug, kind)   — which clusters does this entity belong to?
 *  getClusterSeeAlso(slug, kind)   — up to N "see also" entries for cluster peers
 *  getGoalClusters(goalSlug)       — clusters anchored to a specific goal page
 *  buildProfileRelatedLinks(slug, kind) — relatedLink[] URLs for schema embedding
 *  buildProfileSchemaGraphWithCluster() — extends buildProfileSchemaGraph with relatedLink
 */

import { SITE_URL } from '@/lib/site'
import type { ClusterDefinition, ClusterId, EntityKind, SeeAlsoEntry } from '@/lib/schema'
import { buildRelatedLinksSchema } from '@/lib/schema'
import { buildProfileSchemaGraph, buildSchemaGraph, stripSchemaContext } from '@/lib/schema-graph'
import type { ProfileSchemaGraphArgs } from '@/lib/schema-graph'

// ─────────────────────────────────────────────────────────────────────────────
// Static cluster definitions
// All slugs verified against public/data/herbs-summary.json + compounds-summary.json
// ─────────────────────────────────────────────────────────────────────────────

const CLUSTERS: Record<ClusterId, ClusterDefinition> = {
  'adhd-focus': {
    id: 'adhd-focus',
    label: 'ADHD & Focus Support',
    goalSlug: 'focus',
    description:
      'Herbs and compounds studied for attention, cognitive clarity, and ADHD-adjacent support.',
    members: [
      {
        slug: 'bacopa',
        kind: 'herb',
        label: 'Bacopa',
        primaryRoles: ['memory consolidation', 'attention', 'learning speed'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'lions-mane',
        kind: 'herb',
        label: "Lion's Mane",
        primaryRoles: ['NGF synthesis', 'neuroplasticity', 'cognitive support'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'ashwagandha',
        kind: 'herb',
        label: 'Ashwagandha',
        primaryRoles: ['stress-driven cognitive fatigue', 'adaptogen', 'working memory'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'rhodiola',
        kind: 'herb',
        label: 'Rhodiola',
        primaryRoles: ['cognitive fatigue', 'mental endurance', 'stress resilience'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'ginkgo-biloba',
        kind: 'herb',
        label: 'Ginkgo Biloba',
        primaryRoles: ['cerebral circulation', 'memory', 'attention'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'panax-ginseng',
        kind: 'herb',
        label: 'Panax Ginseng',
        primaryRoles: ['mental performance', 'working memory', 'reaction time'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'gotu-kola',
        kind: 'herb',
        label: 'Gotu Kola',
        primaryRoles: ['cognitive support', 'anxiety-adjacent focus'],
        evidenceTier: 'low',
      },
      {
        slug: 'l-theanine',
        kind: 'compound',
        label: 'L-Theanine',
        primaryRoles: ['alpha-wave activity', 'calm focus', 'attention quality'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'phosphatidylserine',
        kind: 'compound',
        label: 'Phosphatidylserine',
        primaryRoles: ['ADHD support', 'memory', 'cognitive aging'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'alpha-gpc',
        kind: 'compound',
        label: 'Alpha-GPC',
        primaryRoles: ['cholinergic', 'memory', 'focus'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'l-tyrosine',
        kind: 'compound',
        label: 'L-Tyrosine',
        primaryRoles: ['dopamine precursor', 'working memory under stress', 'cognitive load'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'magnesium',
        kind: 'compound',
        label: 'Magnesium',
        primaryRoles: ['NMDA modulation', 'stress-related cognition', 'sleep quality'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'caffeine',
        kind: 'compound',
        label: 'Caffeine',
        primaryRoles: ['adenosine antagonism', 'alertness', 'reaction speed'],
        evidenceTier: 'high',
      },
    ],
  },

  sleep: {
    id: 'sleep',
    label: 'Sleep & Recovery',
    goalSlug: 'sleep',
    description:
      'Herbs and compounds studied for sleep onset, sleep quality, and overnight recovery support.',
    members: [
      {
        slug: 'valerian',
        kind: 'herb',
        label: 'Valerian',
        primaryRoles: ['sleep latency', 'GABA modulation', 'sleep quality'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'piper-methysticum',
        kind: 'herb',
        label: 'Kava',
        primaryRoles: ['relaxation', 'sleep onset', 'anxiolysis'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'ashwagandha',
        kind: 'herb',
        label: 'Ashwagandha',
        primaryRoles: ['stress-driven sleep disruption', 'cortisol reduction'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'bacopa',
        kind: 'herb',
        label: 'Bacopa',
        primaryRoles: ['stress reduction', 'sleep quality'],
        evidenceTier: 'low',
      },
      {
        slug: 'gotu-kola',
        kind: 'herb',
        label: 'Gotu Kola',
        primaryRoles: ['mild sedation', 'anxiety reduction'],
        evidenceTier: 'low',
      },
      {
        slug: 'glycine',
        kind: 'compound',
        label: 'Glycine',
        primaryRoles: ['sleep quality', 'core body temperature', 'REM sleep'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'magnesium',
        kind: 'compound',
        label: 'Magnesium',
        primaryRoles: ['sleep onset', 'NMDA modulation', 'muscle relaxation'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'magnesium-glycinate',
        kind: 'compound',
        label: 'Magnesium Glycinate',
        primaryRoles: ['sleep', 'bioavailable magnesium form'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'gaba',
        kind: 'compound',
        label: 'GABA',
        primaryRoles: ['inhibitory neurotransmitter', 'relaxation', 'sleep onset'],
        evidenceTier: 'low',
      },
      {
        slug: '5-htp',
        kind: 'compound',
        label: '5-HTP',
        primaryRoles: ['serotonin precursor', 'sleep onset', 'mood'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'l-theanine',
        kind: 'compound',
        label: 'L-Theanine',
        primaryRoles: ['alpha-wave activity', 'relaxation', 'sleep quality'],
        evidenceTier: 'moderate',
      },
    ],
  },

  'stress-anxiety': {
    id: 'stress-anxiety',
    label: 'Stress & Anxiety Support',
    goalSlug: 'stress',
    description:
      'Herbs and compounds studied for stress resilience, anxiety reduction, and HPA axis regulation.',
    members: [
      {
        slug: 'ashwagandha',
        kind: 'herb',
        label: 'Ashwagandha',
        primaryRoles: ['cortisol reduction', 'HPA axis regulation', 'adaptogen'],
        evidenceTier: 'high',
      },
      {
        slug: 'rhodiola',
        kind: 'herb',
        label: 'Rhodiola',
        primaryRoles: ['stress resilience', 'fatigue reduction', 'adaptogen'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'bacopa',
        kind: 'herb',
        label: 'Bacopa',
        primaryRoles: ['anxiety reduction', 'cognitive stress buffering'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'gotu-kola',
        kind: 'herb',
        label: 'Gotu Kola',
        primaryRoles: ['anxiolytic', 'GABAergic support'],
        evidenceTier: 'low',
      },
      {
        slug: 'piper-methysticum',
        kind: 'herb',
        label: 'Kava',
        primaryRoles: ['GABAergic anxiolytic', 'social anxiety'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'panax-ginseng',
        kind: 'herb',
        label: 'Panax Ginseng',
        primaryRoles: ['stress resilience', 'HPA axis support'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'l-theanine',
        kind: 'compound',
        label: 'L-Theanine',
        primaryRoles: ['cortisol buffering', 'alpha-wave activity', 'calm focus'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'magnesium',
        kind: 'compound',
        label: 'Magnesium',
        primaryRoles: ['HPA axis regulation', 'stress resilience'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'glycine',
        kind: 'compound',
        label: 'Glycine',
        primaryRoles: ['inhibitory neurotransmitter', 'calm', 'sleep quality'],
        evidenceTier: 'low',
      },
      {
        slug: 'gaba',
        kind: 'compound',
        label: 'GABA',
        primaryRoles: ['inhibitory neurotransmitter', 'anxiety reduction'],
        evidenceTier: 'low',
      },
      {
        slug: '5-htp',
        kind: 'compound',
        label: '5-HTP',
        primaryRoles: ['serotonin precursor', 'mood support', 'anxiety'],
        evidenceTier: 'moderate',
      },
    ],
  },

  energy: {
    id: 'energy',
    label: 'Energy & Fatigue',
    goalSlug: 'energy',
    description:
      'Herbs and compounds studied for energy metabolism, mitochondrial function, and fatigue resilience.',
    members: [
      {
        slug: 'rhodiola',
        kind: 'herb',
        label: 'Rhodiola',
        primaryRoles: ['fatigue reduction', 'physical endurance', 'adaptogen'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'panax-ginseng',
        kind: 'herb',
        label: 'Panax Ginseng',
        primaryRoles: ['energy metabolism', 'fatigue', 'cognitive performance'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'ashwagandha',
        kind: 'herb',
        label: 'Ashwagandha',
        primaryRoles: ['adrenal support', 'fatigue resilience', 'VO2 max'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'caffeine',
        kind: 'compound',
        label: 'Caffeine',
        primaryRoles: ['adenosine antagonism', 'energy', 'alertness'],
        evidenceTier: 'high',
      },
      {
        slug: 'l-tyrosine',
        kind: 'compound',
        label: 'L-Tyrosine',
        primaryRoles: ['dopamine precursor', 'motivation', 'cognitive energy'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'magnesium',
        kind: 'compound',
        label: 'Magnesium',
        primaryRoles: ['ATP production', 'mitochondrial function', 'energy metabolism'],
        evidenceTier: 'moderate',
      },
    ],
  },

  neuroprotection: {
    id: 'neuroprotection',
    label: 'Neuroprotection & Cognitive Aging',
    goalSlug: 'cognition',
    description:
      'Herbs and compounds studied for neuroplasticity, neurogenesis, and long-term cognitive health.',
    members: [
      {
        slug: 'lions-mane',
        kind: 'herb',
        label: "Lion's Mane",
        primaryRoles: ['NGF synthesis', 'neuroplasticity', 'cognitive aging'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'bacopa',
        kind: 'herb',
        label: 'Bacopa',
        primaryRoles: ['BDNF support', 'synaptic density', 'memory consolidation'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'ginkgo-biloba',
        kind: 'herb',
        label: 'Ginkgo Biloba',
        primaryRoles: ['cerebrovascular circulation', 'antioxidant', 'cognitive aging'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'gotu-kola',
        kind: 'herb',
        label: 'Gotu Kola',
        primaryRoles: ['neuroplasticity', 'dendritic growth'],
        evidenceTier: 'low',
      },
      {
        slug: 'phosphatidylserine',
        kind: 'compound',
        label: 'Phosphatidylserine',
        primaryRoles: ['neuronal membrane integrity', 'cognitive aging', 'ADHD'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'alpha-gpc',
        kind: 'compound',
        label: 'Alpha-GPC',
        primaryRoles: ['acetylcholine precursor', 'neuroplasticity', 'memory'],
        evidenceTier: 'moderate',
      },
      {
        slug: 'magnesium',
        kind: 'compound',
        label: 'Magnesium',
        primaryRoles: ['NMDA modulation', 'synaptic plasticity', 'neuroprotection'],
        evidenceTier: 'moderate',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Public query API
// ─────────────────────────────────────────────────────────────────────────────

/** Returns all clusters that contain a given entity. */
export function getEntityClusters(slug: string, kind: EntityKind): ClusterDefinition[] {
  return Object.values(CLUSTERS).filter((cluster) =>
    cluster.members.some((m) => m.slug === slug && m.kind === kind),
  )
}

/**
 * Returns cluster peers for a given entity, deduped, excluding itself.
 * Results are ordered by cluster priority then member list order.
 */
export function getClusterSeeAlso(
  slug: string,
  kind: EntityKind,
  limit = 6,
): SeeAlsoEntry[] {
  const entityClusters = getEntityClusters(slug, kind)
  if (!entityClusters.length) return []

  const seen = new Set<string>()
  const results: SeeAlsoEntry[] = []

  for (const cluster of entityClusters) {
    for (const member of cluster.members) {
      if (member.slug === slug && member.kind === kind) continue
      const key = `${member.kind}:${member.slug}`
      if (seen.has(key)) continue
      seen.add(key)

      const base = member.kind === 'herb' ? 'herbs' : 'compounds'
      results.push({
        slug: member.slug,
        kind: member.kind,
        label: member.label,
        href: `/${base}/${member.slug}`,
        reason: member.primaryRoles.slice(0, 2).join(', '),
        cluster: cluster.id,
        clusterLabel: cluster.label,
        clusterGoalHref: `/goals/${cluster.goalSlug}`,
      })

      if (results.length >= limit) return results
    }
  }

  return results
}

/** Returns clusters whose goalSlug matches the given goal page. */
export function getGoalClusters(goalSlug: string): ClusterDefinition[] {
  return Object.values(CLUSTERS).filter((c) => c.goalSlug === goalSlug)
}

/** Returns the full cluster definitions map (read-only reference). */
export function getAllClusters(): Readonly<Record<ClusterId, ClusterDefinition>> {
  return CLUSTERS
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema integration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the `relatedLink` URL array for embedding in a profile's MedicalWebPage node.
 * Returns absolute canonical URLs, safe for static export.
 */
export function buildProfileRelatedLinks(slug: string, kind: EntityKind): string[] {
  const seeAlso = getClusterSeeAlso(slug, kind, 8)
  return buildRelatedLinksSchema(seeAlso)
}

type ProfileSchemaGraphWithClusterArgs = ProfileSchemaGraphArgs & {
  /** Pre-computed see-also entries (from getClusterSeeAlso). Pass [] to skip. */
  seeAlsoEntries: SeeAlsoEntry[]
}

/**
 * Extends buildProfileSchemaGraph() to inject cluster relatedLink URLs
 * into the MedicalWebPage node.
 *
 * Usage:
 *   const seeAlso = getClusterSeeAlso(slug, 'herb')
 *   const graph = buildProfileSchemaGraphWithCluster({ ...args, seeAlsoEntries: seeAlso })
 */
export function buildProfileSchemaGraphWithCluster(
  args: ProfileSchemaGraphWithClusterArgs,
): Record<string, unknown> {
  const baseGraph = buildProfileSchemaGraph(args)

  if (!args.seeAlsoEntries.length) return baseGraph

  const relatedLinks = buildRelatedLinksSchema(args.seeAlsoEntries)
  const graphArray = baseGraph['@graph']
  if (!Array.isArray(graphArray)) return baseGraph

  // Inject relatedLink into the MedicalWebPage node (always the first node in the graph)
  const augmented = graphArray.map((node: unknown) => {
    if (typeof node !== 'object' || node === null || !('@type' in node)) return node
    const record = node as Record<string, unknown>
    const types = Array.isArray(record['@type']) ? record['@type'] : [record['@type']]
    if ((types as unknown[]).includes('MedicalWebPage')) {
      return { ...record, relatedLink: relatedLinks }
    }
    return node
  })

  return { ...baseGraph, '@graph': augmented }
}

/**
 * Builds a standalone @graph that lists all cluster members for a goal page.
 * Embed this as a second SchemaGraphScript on /goals/[goal] pages.
 */
export function buildGoalClusterGraph(goalSlug: string): Record<string, unknown> | null {
  const clusters = getGoalClusters(goalSlug)
  if (!clusters.length) return null

  const goalUrl = `${SITE_URL}/goals/${goalSlug}/`
  const nodes = clusters.map((cluster) => {
    const itemListId = `${goalUrl}#cluster-${cluster.id}`
    return {
      '@type': 'ItemList',
      '@id': itemListId,
      name: cluster.label,
      description: cluster.description,
      url: goalUrl,
      numberOfItems: cluster.members.length,
      itemListElement: cluster.members.map((member, index) => {
        const base = member.kind === 'herb' ? 'herbs' : 'compounds'
        return {
          '@type': 'ListItem',
          position: index + 1,
          name: member.label,
          url: `${SITE_URL}/${base}/${member.slug}/`,
        }
      }),
    }
  })

  return buildSchemaGraph(nodes as Array<Record<string, unknown>>)
}
