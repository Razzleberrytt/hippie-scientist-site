import { readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Public transparency view of the research-only DE10–DE15 dossiers.
 * Reading the original files means an investigation cannot silently disappear
 * from the public inventory while its merged Markdown remains in the repo.
 *
 * Deliberately DOES NOT import these claims into the clinically graded evidence
 * dataset, the PubMed source-register totals, or any product recommendations.
 */
const DEEP_ENRICHMENT_DOCUMENTS = [
  { round: 10, file: 'docs/research/deep-enrichment-10-2026-10-11.md' },
  { round: 11, file: 'docs/research/deep-enrichment-11-2026-10-11.md' },
  { round: 12, file: 'docs/research/deep-enrichment-12-2026-10-12.md' },
  { round: 13, file: 'docs/research/deep-enrichment-13-2026-10-12.md' },
  { round: 14, file: 'docs/research/deep-enrichment-14-2026-10-12.md' },
  { round: 15, file: 'docs/research/deep-enrichment-15-2026-10-12.md' },
] as const

export type DeepEnrichmentInvestigation = {
  id: string
  title: string
  round: number
  sourcePmids: string[]
  body: string
}

export type DeepEnrichmentRound = {
  round: number
  file: string
  sourceHref: string
  investigations: DeepEnrichmentInvestigation[]
}

export const DEEP_ENRICHMENT_ROUND_NUMBERS: number[] = DEEP_ENRICHMENT_DOCUMENTS.map((doc) => doc.round)

export function getDeepEnrichmentRounds(): DeepEnrichmentRound[] {
  return DEEP_ENRICHMENT_DOCUMENTS.map(({ round, file }) => {
    const fullText = readFileSync(path.join(process.cwd(), file), 'utf8')
    const headings = [...fullText.matchAll(/^## (DE\d+-\d+)\s+[—–-]\s+(.+)$/gm)]

    // Fail closed: source inventory must be complete, not quietly truncated.
    if (headings.length !== 10) {
      throw new Error(`Deep Enrichment ${round}: expected 10 investigations, found ${headings.length}`)
    }

    const investigations = headings.map((heading, index) => {
      const id = heading[1]
      if (!id.startsWith(`DE${round}-`)) throw new Error(`Deep Enrichment ${round}: mismatched ${id}`)
      const start = heading.index! + heading[0].length
      const end = headings[index + 1]?.index ?? fullText.length
      const body = fullText.slice(start, end).trim()
      const sourcePmids = [...new Set(
        [...body.matchAll(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{7,9})\/?/g)].map((match) => match[1])
      )]

      if (!body || sourcePmids.length === 0) {
        throw new Error(`Deep Enrichment ${id}: missing notes or primary source links`)
      }

      return {
        id,
        title: heading[2].trim(),
        round,
        sourcePmids,
        body,
      }
    })

    return {
      round,
      file,
      sourceHref: `https://github.com/Razzleberrytt/hippie-scientist-site/blob/main/${file}`,
      investigations,
    }
  })
}
