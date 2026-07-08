import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from 'react'
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
import CollapsibleSection, { CollapsibleWarning, CollapsibleDetails } from '@/components/content/CollapsibleSection'
import Collapsible from '@/components/content/Collapsible'
import ScientificVerdictCard, { ScientificVerdict } from '@/components/editorial/ScientificVerdictCard'
import ComparisonVerdict from '@/components/editorial/ComparisonVerdict'
import DecisionMatrix from '@/components/editorial/DecisionMatrix'
import RealityCheck from '@/components/editorial/RealityCheck'
import CommonMistakes from '@/components/editorial/CommonMistakes'
import BetterAlternatives from '@/components/editorial/BetterAlternatives'
import WhereNext from '@/components/editorial/WhereNext'
import EvidenceConfidence from '@/components/editorial/EvidenceConfidence'
import EditorialNote from '@/components/editorial/EditorialNote'

type MDXComponents = Record<string, ComponentType<Record<string, unknown>>>
type MdxTableProps = Record<string, unknown> & { children?: ReactNode }
type MdxAnchorProps = ComponentPropsWithoutRef<'a'>

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

function getDisplayDomain(href: string | undefined) {
  if (!href) return 'source'

  try {
    return new URL(href).hostname.replace(/^www\./, '')
  } catch {
    return 'source'
  }
}

function isBareUrlLabel(children: ReactNode, href: string | undefined) {
  if (typeof children !== 'string' || !href) return false

  const label = children.trim().replace(/\/$/, '')
  const target = href.trim().replace(/\/$/, '')

  return /^https?:\/\//i.test(label) && label === target
}

function MdxAnchor({ children, href, target, rel, ...props }: MdxAnchorProps) {
  const isExternal = typeof href === 'string' && /^https?:\/\//i.test(href)
  const label = isBareUrlLabel(children, href) ? `Source: ${getDisplayDomain(href)}` : children

  return (
    <a
      {...props}
      href={href}
      target={target ?? (isExternal ? '_blank' : undefined)}
      rel={rel ?? (isExternal ? 'noopener noreferrer' : undefined)}
    >
      {label}
    </a>
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
  CollapsibleSection,
  CollapsibleWarning,
  CollapsibleDetails,
  Collapsible,
  ScientificVerdictCard,
  ScientificVerdict,
  ComparisonVerdict,
  DecisionMatrix,
  RealityCheck,
  CommonMistakes,
  BetterAlternatives,
  WhereNext,
  EvidenceConfidence,
  EditorialNote,
  table: MdxTable,
  a: MdxAnchor,
} as unknown as MDXComponents

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...evidenceComponents,
    ...components,
  }
}

export default useMDXComponents
