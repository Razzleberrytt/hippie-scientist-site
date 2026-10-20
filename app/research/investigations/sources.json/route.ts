/**
 * Build-time JSON view of publicly readable research-only DE investigations.
 * Do not merge this payload into public clinical evidence grade sources.
 */
import { getDeepEnrichmentRounds, getDeepEnrichmentSourceOccurrences } from '@/lib/research-deep-enrichment-public'

export const dynamic = 'force-static'

export async function GET() {
  const rounds = getDeepEnrichmentRounds()
  const occurrences = getDeepEnrichmentSourceOccurrences(rounds)
  const repeatedSources = [...occurrences.entries()]
    .filter(([, citedIn]) => citedIn.length > 1)
    .map(([pmid, citedIn]) => ({ pmid, cited_in: citedIn }))
    .sort((a, b) => a.pmid.localeCompare(b.pmid))
  const investigations = rounds.flatMap(({ round, investigations }) =>
    investigations.map(({ id, title, sourcePmids }) => ({
      id,
      title,
      round,
      page: `https://thehippiescientist.net/research/investigations/${round}/#${id.toLowerCase()}`,
      pmids: sourcePmids,
      pubmed_urls: sourcePmids.map((pmid) => `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`),
      research_only: true,
      independent_scientific_review: 'pending',
      approved_clinical_claim: false,
    }))
  )
  const uniquePmids = new Set(investigations.flatMap((item) => item.pmids))

  return new Response(JSON.stringify({
    schema_version: 1,
    kind: 'research-intake-transparency-inventory',
    review_status: 'owner-authorized AI scientific editorial review; not independently V_VERIFIED',
    medical_advice: false,
    auto_promoted_clinical_claims: 0,
    note: 'These research-only records are not new canonical studies, ingredient evidence grades, product endorsements, or qualified scientific signoff. Each PubMed reference may already exist in another site source index.',
    round_count: rounds.length,
    investigation_count: investigations.length,
    distinct_referenced_pmids: uniquePmids.size,
    repeated_pmid_count_across_investigations: repeatedSources.length,
    repeated_pubmed_sources: repeatedSources,
    rounds: rounds.map(({ round, sourceHref }) => ({
      round,
      url: `https://thehippiescientist.net/research/investigations/${round}/`,
      original_dossier: sourceHref,
    })),
    investigations,
  }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      'x-robots-tag': 'noindex, follow',
    },
  })
}
