import curatedIndexPolicy from '../data/curated-index-policy.json'
import { getHerbSourceSlug } from './herb-canonical-source-aliases'

export const CORE_INDEXABLE_ROUTES = [
  '/',
  '/info',
  '/info/about',
  '/articles',
  '/compounds',
  '/info/contact',
  '/info/dosing',
  '/info/faq',
  '/evidence',
  '/goals',
  '/guides',
  '/herbs',
  '/learn',
  '/info/methodology',
  '/info/privacy',
  '/info/disclaimer',
  '/safety-checker',
  '/info/supplement-safety-checklist',
  '/stacks',
  '/tools',
  '/tools/botanical-activity-atlas',
  '/tools/botanical-activity-atlas/alkaloid-botanicals',
  '/tools/botanical-activity-atlas/natural-stimulants',
  '/tools/botanical-activity-atlas/calming-botanicals',
  '/tools/botanical-activity-atlas/dream-and-perception-herbs',
  '/tools/botanical-activity-atlas/serotonergic-interaction-risk',
  '/es',
  '/es/hierbas',
  '/es/compuestos',
  '/es/objetivos',
  '/es/objetivos/sueno',
  '/es/objetivos/estres',
  '/es/objetivos/ansiedad',
  '/es/objetivos/concentracion',
  '/es/metodologia',
  '/es/seguridad',
] as const

export const MONEY_ENTRY_ROUTES = [
  '/best-supplements-for-sleep',
  '/best-supplements-for-fat-loss',
  '/best-supplements-for-blood-pressure',
  '/best-supplements-for-gut-health',
  '/best-supplements-for-joint-support',
  '/best-magnesium-supplements-for-adhd',
] as const

// Canonical curated membership now comes from one data authority shared with the
// governance overlay and Node-based audits. Membership is a discoverability policy;
// it does not itself establish scientific approval.
export const CURATED_INDEXABLE_HERB_SLUGS = curatedIndexPolicy.herbs
  .map((entry) => entry.slug) as readonly string[]

export const CURATED_GOVERNANCE_INDEX_BYPASS_HERB_SLUGS = curatedIndexPolicy.herbs
  .filter((entry) => entry.governanceIndexBypass === true)
  .map((entry) => entry.slug) as readonly string[]

export function isCuratedIndexableHerbRouteSlug(slug: string): boolean {
  const sourceSlug = getHerbSourceSlug(slug)
  return (CURATED_INDEXABLE_HERB_SLUGS as readonly string[]).includes(slug) ||
    (CURATED_INDEXABLE_HERB_SLUGS as readonly string[]).includes(sourceSlug)
}

// Compound membership uses the same authority. The canonical policy also records
// the narrower legacy governance index-bypass explicitly so consolidation cannot
// promote a profile solely because duplicate lists were merged.
export const CURATED_INDEXABLE_COMPOUND_SLUGS = curatedIndexPolicy.compounds
  .map((entry) => entry.slug) as readonly string[]

export const CURATED_GOVERNANCE_INDEX_BYPASS_COMPOUND_SLUGS = curatedIndexPolicy.compounds
  .filter((entry) => entry.governanceIndexBypass === true)
  .map((entry) => entry.slug) as readonly string[]
