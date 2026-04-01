# Semantic Normalization Audit

- sampled herbs: 25
- recommendation: **safe to merge**

## Failing examples (original vs normalized)
- **acorus gramineus**
  - original: Similar risks to Acorus calamus | avoid large doses
  - normalized: similar risks to acorus calamus | avoid large doses
  - reason flags: compound_overlap_low

## Failure categories
- compound mismatch: 1

## Micro-rules applied
- protect phrases: may help, associated with, traditionally used for, reported to
- if contraindication contains soft uncertainty language, do not escalate to hard avoid phrasing
- if overlap is below category threshold, fallback to cleaned original
- last-line defense: any detected risky category forces fallback to cleaned original

### Safe transformations
- **acacia confusa**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/0.92/1
  - before contra: Mental health conditions | MAOI use | pregnancy | liver disease
  - after contra: mental health conditions | maoi use | pregnancy | liver disease
- **acacia maidenii**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/0.93/1
  - before contra: Use with MAOIs | unverified internal use
  - after contra: use with maois | unverified internal use
- **acacia nilotica**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/1/1
  - before contra: High doses of bark decoction can irritate the digestive tract and cause constipation or nausea | Avoid during pregnancy or lactation due to potential anti-fertility effects | Not recommended for children under 12
  - after contra: high doses of bark decoction can irritate the digestive tract and cause constipation or nausea | avoid during pregnancy or lactation due to potential anti-fertility effects | not recommended for children under 12
- **acacia phlebophylla**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/1/1
  - before contra: Not recommended for those with psychotic disorders or serotonin syndrome risk
  - after contra: not recommended for those with psychotic disorders or serotonin syndrome risk
- **acmella oleracea**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/1/1
  - before contra: Pregnancy | oral surgery | allergy to Asteraceae | None established | avoid overuse on broken skin
  - after contra: pregnancy | oral surgery | allergy to asteraceae | none established | avoid overuse on broken skin
- **aconitum ferox**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/1/1
  - before contra: none
  - after contra: none
- **aconitum napellus**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/1/1
  - before contra: Highly toxic | ingestion can cause severe arrhythmias | paralysis and death | avoid internal use | handling requires caution.
  - after contra: highly toxic | ingestion can cause severe arrhythmias | paralysis and death | avoid internal use | handling requires caution
- **acorus americanus**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/0.88/1
  - before contra: none
  - after contra: none

### Risky transformations
- **acorus gramineus**
  - risk flags: compound_overlap_low
  - overlap (compounds/effects/contra): 0.33/0.92/1
  - before contra: Similar risks to Acorus calamus | avoid large doses
  - after contra: similar risks to acorus calamus | avoid large doses

### Should be reverted / manually reviewed
- none

