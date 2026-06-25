import type { ComponentType, ReactNode } from 'react'
import StudyDesignSnapshot from '@/components/evidence/StudyDesignSnapshot'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import MisconceptionCallout from '@/components/evidence/MisconceptionCallout'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import { ComparisonTable } from '@/components/ComparisonTable'
import { EvidenceNote } from '@/components/EvidenceNote'
import { HarmReductionCallout } from '@/components/HarmReductionCallout'
import { NPSDisclaimer } from '@/components/NPSDisclaimer'
import ResponsiveTable from '@/components/ui/ResponsiveTable'

type MDXComponents = Record<string, ComponentType<Record<string, unknown>>>
type MdxTableProps = Record<string, unknown> & { children?: ReactNode }

function MdxTable({ children, ...props }: MdxTableProps) {
  return (
    <ResponsiveTable label="Article table" className="article-table">
      <table {...props}>
        <caption className="sr-only">Article table</caption>
        {children}
      </table>
    </ResponsiveTable>
  )
}

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
  ComparisonTable,
  NPSDisclaimer,
  EvidenceNote,
  HarmReductionCallout,
  table: MdxTable,
} as unknown as MDXComponents

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...evidenceComponents,
    ...components,
  }
}

export default useMDXComponents
