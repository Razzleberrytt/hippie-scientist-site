import type { ComponentType } from 'react'
import StudyDesignSnapshot from '@/components/evidence/StudyDesignSnapshot'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import MisconceptionCallout from '@/components/evidence/MisconceptionCallout'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import { NPSDisclaimer } from '@/components/NPSDisclaimer'

type MDXComponents = Record<string, ComponentType<Record<string, unknown>>>

/**
 * MDX component registry.
 *
 * Next.js looks up this file (the `useMDXComponents` export) to resolve the
 * components referenced inside MDX. Anything registered here can be embedded in
 * `content/education/*.mdx` with no per-file import — e.g.:
 *
 *   <StudyDesignSnapshot grade="Moderate" summary="..." />
 *
 * Evidence-transparency components are registered together so authors have a
 * consistent, discoverable toolkit. The cast keeps the registry permissive for
 * MDX's loosely-typed prop passing while each component still type-checks at its
 * own call sites in `.tsx` pages.
 */
const evidenceComponents = {
  StudyDesignSnapshot,
  EvidenceSummaryCard,
  ResearchLimitations,
  MisconceptionCallout,
  SafetyNotice,
  NPSDisclaimer,
} as unknown as MDXComponents

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...evidenceComponents,
    ...components,
  }
}

export default useMDXComponents
