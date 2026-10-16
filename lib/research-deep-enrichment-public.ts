import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

/**
 * Public bibliographic transparency for merged Deep Enrichment rounds.
 * Discover source documents directly at build time so future rounds cannot
 * be committed under docs/research/ without appearing on the website.
 * This inventory never promotes unreviewed claims into graded public evidence.
 */
const RESEARCH_PATH = 'docs/research'
const RESEARCH_NAME = /^deep-enrichment-(\d+)-(\d{4}-\d{2}-\d{2})\.md$/
const DEEP_ENRICHMENT_DOCUMENTS = readdirSync(path.join(process.cwd(), RESEARCH_PATH))
  .filter((filename) => filename.startsWith('deep-enrichment-'))
  .map((filename) => {
    const match = filename.match(RESEARCH_NAME)
    if (!match) throw new Error(`Unrecognized Deep Enrichment filename: ${filename}`)
    return { round: Number(match[1]), file: `${RESEARCH_PATH}/${filename}` }
  })
  .filter(({ round }) => round >= 10)
  .sort((a, b) => a.round - b.round)

if (DEEP_ENRICHMENT_DOCUMENTS.length < 6) {
  throw new Error('Deep Enrichment public inventory lost one or more of the original six rounds')
}
for (let index = 1; index < DEEP_ENRICHMENT_DOCUMENTS.length; index++) {
  if (DEEP_ENRICHMENT_DOCUMENTS[index].round !== DEEP_ENRICHMENT_DOCUMENTS[index - 1].round + 1) {
    throw new Error('Deep Enrichment inventory has duplicate or missing round numbers')
  }
}
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
  sharedDossierNotes: string
}

/**
 * Exact PMID occurrence links across the research-only archive.
 * These are citation reuses, never independent studies or ledger admissions.
 */
export function getDeepEnrichmentSourceOccurrences(rounds: DeepEnrichmentRound[]) {
  const uses = new Map<string, Array<{ id: string; round: number }>>()
  for (const { investigations } of rounds) {
    for (const { id, round, sourcePmids } of investigations) {
      for (const pmid of sourcePmids) {
        const entries = uses.get(pmid) ?? []
        entries.push({ id, round })
        uses.set(pmid, entries)
      }
    }
  }
  return uses
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

    // Keep end-of-round QA and admission notes distinct from DE##-10.
    // The original source text stays accessible on the public round page.
    const lastInvestigationOffset = headings[headings.length - 1].index ?? -1
    const sharedNotesHeading = [...fullText.matchAll(/^## (?!DE\d+-\d+\s+[—–-]).+$/gm)]
      .find((match) => (match.index ?? -1) > lastInvestigationOffset)
    const sharedNotesStart = sharedNotesHeading?.index ?? fullText.length
    // Some rounds place shared QA *before* DE##-01 rather than after DE##-10.
    // Both layouts must remain visible, without assigning round-level notes
    // to any individual source/study.
    const firstInvestigationOffset = headings[0].index ?? fullText.length
    const prefaceHeading = [...fullText.matchAll(/^### Whole-round research QA.*$/gm)]
      .find((match) => (match.index ?? -1) < firstInvestigationOffset)
    const prefacedGovernanceNotes = prefaceHeading
      ? fullText.slice(prefaceHeading.index, firstInvestigationOffset).trim()
      : ''
    const sharedDossierNotes = [
      prefacedGovernanceNotes,
      fullText.slice(sharedNotesStart).trim(),
    ].filter(Boolean).join('\n\n')

    const investigations = headings.map((heading, index) => {
      const id = heading[1]
      if (id !== `DE${round}-${String(index + 1).padStart(2, '0')}`) throw new Error(`Deep Enrichment ${round}: mismatched ${id}`)
      const start = heading.index! + heading[0].length
      const end = headings[index + 1]?.index ?? sharedNotesStart
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
      sharedDossierNotes,
    }
  })
}
