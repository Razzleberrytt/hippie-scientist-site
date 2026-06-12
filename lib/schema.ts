/**
 * Schema.org type system — cluster layer.
 *
 * Complements src/lib/seo.ts (per-page JSON-LD builders) and
 * src/lib/schema-graph.ts (@graph assembly). This file adds:
 *  - ClusterDefinition / SeeAlsoEntry types (shared with lib/cluster-linking.ts)
 *  - Drug / Thing node builders not in the existing files
 *  - relatedLink + ItemList helpers for cluster interlinking
 */

import { SITE_URL } from '@/lib/site'

// ─────────────────────────────────────────────────────────────────────────────
// Cluster types — consumed by lib/cluster-linking.ts and components
// ─────────────────────────────────────────────────────────────────────────────

export type ClusterId =
  | 'adhd-focus'
  | 'sleep'
  | 'stress-anxiety'
  | 'energy'
  | 'neuroprotection'

export type EntityKind = 'herb' | 'compound'

export type EvidenceTier = 'high' | 'moderate' | 'low'

export type ClusterMember = {
  slug: string
  kind: EntityKind
  label: string
  /** Primary roles this entity plays within the cluster */
  primaryRoles: string[]
  evidenceTier: EvidenceTier
}

export type ClusterDefinition = {
  id: ClusterId
  label: string
  /** Canonical goal page slug that anchors this cluster */
  goalSlug: string
  description: string
  members: ClusterMember[]
}

export type SeeAlsoEntry = {
  slug: string
  kind: EntityKind
  label: string
  href: string
  /** Human-readable reason for the relationship */
  reason: string
  cluster: ClusterId
  clusterLabel: string
  clusterGoalHref: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema.org node arg types (strict — no `any` or generic unknown values)
// ─────────────────────────────────────────────────────────────────────────────

type SchemaNode = Record<string, unknown>

export type DrugSchemaArgs = {
  name: string
  slug: string
  description?: string
  /** ATC drug class if available */
  drugClass?: string
  legalStatus?: string
  relatedDrugs?: Array<{ name: string; url: string }>
}

export type ThingSchemaArgs = {
  name: string
  url: string
  description?: string
  sameAs?: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema.org node builders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a Schema.org Drug node.
 * Use for compound profiles that have a defined pharmacological identity.
 */
export function buildDrugNode(args: DrugSchemaArgs): SchemaNode {
  const url = `${SITE_URL}/compounds/${args.slug}/`
  return {
    '@type': 'Drug',
    name: args.name,
    url,
    ...(args.description ? { description: args.description } : {}),
    ...(args.drugClass
      ? { drugClass: { '@type': 'DrugClass', name: args.drugClass } }
      : {}),
    ...(args.legalStatus ? { legalStatus: args.legalStatus } : {}),
    ...(args.relatedDrugs?.length
      ? {
          relatedDrug: args.relatedDrugs.map((d) => ({
            '@type': 'Drug',
            name: d.name,
            url: d.url,
          })),
        }
      : {}),
  }
}

/**
 * Builds a Schema.org Thing node.
 * Use for generic entity cross-linking (e.g., cluster anchors, goal pages).
 */
export function buildThingNode(args: ThingSchemaArgs): SchemaNode {
  return {
    '@type': 'Thing',
    name: args.name,
    url: args.url,
    ...(args.description ? { description: args.description } : {}),
    ...(args.sameAs?.length ? { sameAs: args.sameAs } : {}),
  }
}

/**
 * Builds the `relatedLink` URL array for a MedicalWebPage schema node.
 *
 * Google uses relatedLink to understand topical cluster membership.
 * Each value must be an absolute canonical URL.
 */
export function buildRelatedLinksSchema(entries: SeeAlsoEntry[]): string[] {
  return entries.map((e) => {
    const raw = `${SITE_URL}${e.href}/`
    return raw.replace(/\/{2,}$/, '/')
  })
}

/**
 * Builds a Schema.org ItemList representing a cluster.
 * Embed as `mentions` or `hasPart` on CollectionPage / MedicalWebPage.
 */
export function buildClusterItemListNode(cluster: ClusterDefinition): SchemaNode {
  const goalUrl = `${SITE_URL}/goals/${cluster.goalSlug}/`
  return {
    '@type': 'ItemList',
    name: cluster.label,
    description: cluster.description,
    url: goalUrl,
    numberOfItems: cluster.members.length,
    itemListElement: cluster.members.map((member, index) => {
      const base = member.kind === 'herb' ? 'herbs' : 'compounds'
      const profileUrl = `${SITE_URL}/${base}/${member.slug}/`
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: member.label,
        url: profileUrl,
      }
    }),
  }
}

/**
 * Builds a Schema.org DefinedTermSet formally declaring a cluster as a semantic group.
 * Can be embedded as `specialty` on MedicalWebPage or stand-alone in a @graph.
 */
export function buildClusterDefinedTermSet(cluster: ClusterDefinition): SchemaNode {
  const goalUrl = `${SITE_URL}/goals/${cluster.goalSlug}/`
  const termSetId = `${goalUrl}#cluster-${cluster.id}`
  return {
    '@type': 'DefinedTermSet',
    '@id': termSetId,
    name: cluster.label,
    description: cluster.description,
    url: goalUrl,
    hasDefinedTerm: cluster.members.map((member) => {
      const base = member.kind === 'herb' ? 'herbs' : 'compounds'
      const profileUrl = `${SITE_URL}/${base}/${member.slug}/`
      return {
        '@type': 'DefinedTerm',
        name: member.label,
        url: profileUrl,
        description: member.primaryRoles.join(', '),
        inDefinedTermSet: { '@id': termSetId },
      }
    }),
  }
}
