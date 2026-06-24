# Semantic Normalization Audit

- sampled herbs: 10
- recommendation: **safe to merge**

## Failing examples (original vs normalized)
- none

## Failure categories
- none

## Micro-rules applied
- protect phrases: may help, associated with, traditionally used for, reported to
- if contraindication contains soft uncertainty language, do not escalate to hard avoid phrasing
- if overlap is below category threshold, fallback to cleaned original
- last-line defense: any detected risky category forces fallback to cleaned original

### Safe transformations
- **acacia confusa**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/1/1
  - before contra: avoid with unstable mental health conditions | may interact with maois | avoid in pregnancy | avoid in liver disease
  - after contra: avoid with unstable mental health conditions | may interact with maois | avoid in pregnancy | avoid in liver disease
- **acacia maidenii**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/1/1
  - before contra: may interact with maois | avoid with unverified internal use
  - after contra: may interact with maois | avoid with unverified internal use
- **acacia nilotica**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/1/1
  - before contra: avoid in pregnancy | avoid with not recommended for children under 12
  - after contra: avoid in pregnancy | avoid with not recommended for children under 12
- **acacia phlebophylla**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/1/1
  - before contra: none
  - after contra: none
- **acmella oleracea**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/1/1
  - before contra: avoid in pregnancy | avoid with oral surgery | avoid with allergy to asteraceae | avoid with none established | avoid overuse on broken skin
  - after contra: avoid in pregnancy | avoid with oral surgery | avoid with allergy to asteraceae | avoid with none established | avoid overuse on broken skin
- **aconitum ferox**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/1/1
  - before contra: none
  - after contra: none
- **aconitum napellus**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/1/1
  - before contra: avoid with highly toxic | avoid with ingestion can cause severe arrhythmias | avoid with paralysis and death | avoid internal use | avoid with handling requires caution
  - after contra: avoid with highly toxic | avoid with ingestion can cause severe arrhythmias | avoid with paralysis and death | avoid internal use | avoid with handling requires caution
- **acorus americanus**
  - risk flags: none
  - overlap (compounds/effects/contra): 1/1/1
  - before contra: none
  - after contra: none

### Risky transformations
- none

### Should be reverted / manually reviewed
- none

