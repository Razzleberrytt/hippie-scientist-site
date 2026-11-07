/** Verified negative source assignments, shared by intake and final quarantine.
 * Workbook rows stay intact for audit. These rules cannot approve another claim.
 */
export const CONFIRMED_MISATTRIBUTIONS = [
  {
    profile: 'curcumin',
    pmid: '27403209',
    reason:
      'Study is a pilot of an art-gallery engagement programme for people with dementia. It does not involve curcumin, turmeric, or any supplement.',
    verifiedAgainst:
      "PubMed 27403209 — \"Impact of the 'Artful Moments' Intervention on Persons with Dementia and Their Care Partners: a Pilot Study\", Can Geriatr J 2016, doi:10.5770/cgj.19.220",
  },
  {
    profile: 'potassium',
    pmid: '25059961',
    reason:
      'Item is a news piece in a veterinary journal about One Health policy. It is not a study, and it concerns neither potassium nor any supplement.',
    verifiedAgainst:
      'PubMed 25059961 — "One Health: time to move on from just talking", Vet Rec 2014, doi:10.1136/vr.g4746, publication type News',
  },
  {
    profile: 'maca',
    pmid: '18072817',
    doi: '10.2165/00023210-200822010-00007',
    reason: 'Rasagiline/Parkinson disease review, not a maca intervention. Withdraw the source assignment; do not infer energy or libido evidence.',
    verifiedAgainst: 'PubMed 18072817 — Spotlight on rasagiline in Parkinson disease, CNS Drugs 2008;22(1):83–86; DOI 10.2165/00023210-200822010-00007; checked 2026-11-07. Reprint of PMID 17683172.',
  },
]

export function findConfirmedMisattribution(row, profile) {
  const pmids = [row?.pmid, row?.PMID, row?.pubmedId].map(value => String(value ?? '').trim())
  const urls = [row?.source_url, row?.url, row?.url_or_source, row?.sourceUrl].map(value => String(value ?? ''))
  const doi = String(row?.doi ?? row?.DOI ?? '').trim().replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '').toLowerCase()
  return CONFIRMED_MISATTRIBUTIONS.find(entry => entry.profile === profile && (
    pmids.includes(entry.pmid) ||
    (entry.doi && doi === entry.doi) ||
    urls.some(value => value.split(/\s*\|\s*/).some(url => {
      try {
        const parsed = new URL(url)
        return parsed.hostname === 'pubmed.ncbi.nlm.nih.gov' && parsed.pathname.replace(/\/$/, '') === `/${entry.pmid}` ||
          entry.doi && ['doi.org', 'dx.doi.org'].includes(parsed.hostname) && parsed.pathname.slice(1).toLowerCase() === entry.doi
      } catch { return false }
    }))
  ))
}

export function isConfirmedMisattribution(row, profile) {
  return Boolean(findConfirmedMisattribution(row, profile))
}
