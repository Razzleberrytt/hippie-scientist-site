# Scientific Intelligence Integration 2.0 — first governed vertical slice

**Owner request:** 2026-10-09 · [P0 scoped ticket #6547](https://github.com/Razzleberrytt/hippie-scientist-site/issues/6547) · **Status:** implementation proposed for review. This is not a deployment or scientific-review receipt.

## Value now: question → exact source → 8 + 12 tool case

Existing `/research/intelligence/` already offers eight research instruments, twelve read-only scientific projections, exact-source semantic relay, separately governed reviewed citation overlay, and a human-review-only editorial handoff. Previously the full cross-instrument case required knowing a PMID. This slice adds a small **topic/question-first source discovery** affordance **inside the same lazily-loaded static Studio**.

- Reader asks a natural question such as “Does magnesium improve sleep?”
- Discovery removes common question/stop words and requires **every remaining token** in the same study fingerprint's source metadata (title, category, method, comparator, controlled indexed concept words). It does **not** combine terms found in different PMIDs.
- Results are ordered for **text relevance only**, not quality, risk, evidence strength or causal likelihood; zero results means no match *in this bounded snapshot*, not no research.
- Each result requires a PMID present in the **currently loaded signed graph**, research-only grade, and matching indexed witness source signatures; invalid/replaced/out-of-scope identity is excluded.
- Selecting an item opens the original exact PMID case and scrolls to it. That unchanged case orchestrates eight instruments, twelve scientific projections, source witnesses and separately governed review-only downstream requests.
- Source data remains the existing 500-entry `/research/intelligence/dataset.json`. Public reviewed study identities remain the already-existing `/evidence/evidence-report/dataset.json`. **No new corpus, join authority, agent, API, credentials, network retrieval, mutable database, or premium service.**

## Explicit evidence and publication firewall

A metadata match means **only** that words occur in one publication record. An exact PMID is a publication identifier, **not** trial or cohort independence. A source-title match, DOI, co-mention, source signature or internal calibration pass does not establish an effect, interaction, clinical risk, treatment recommendation or independent human review. Research-only source identities cannot mutate published grades, dose advice, safety language or release authorization. A case is *research-only* until an existing independent scientific and editorial review process provides separate authority.

Waves 7501–8000 ([#6397](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6397)) and 8001–8500 ([#6546](https://github.com/Razzleberrytt/hippie-scientist-site/pull/6546)) **remain staged review-only drafts**, not admitted to this UI by the feature.

## Acceptance evidence required before "done"

- T0: `npx tsx scripts/ci/validate-research-intelligence-studio.ts` exercises normal question, direct PMID, empty/noisy question, no cross-PMID synthesis, forged PMID, mismatched source signatures, bounded results and the UI handoff.
- T1/T2: exact current-head TS/lint/science/a11y/SEO/source-governance, all required PR workflows and production static build; no bypass or borrowed green checks.
- T3: merged main SHA, verified Cloudflare deployment receipt, desktop/mobile and light/dark browser check, and visible user journey. Until confirmed, **status stays PR/proposed**.
- Usage, search impact, revenue and review-correctness outcomes are **Unknown**, not estimated.

## Subsequent scoped tickets — not silently admitted by this slice

1. **2.1 — Scientific classification repairs.** Reconcile primary-study versus animal-only reviews, category false positives, lineage/retraction limitations and pending 500-source review queues with expert approval. Do not release held batches on source verification alone.
2. **2.2 — Multi-step research journey.** User-selectable deterministic exploration of source-neighbor links, verified citation crosswalks and explicit uncertainty through the existing eight+12 tools, with accessibility, mobile and usage testing.
3. **2.3 — Reviewed insights.** Add only independently signed annotation/adjudication contracts; independently validated claims may be displayed only through existing governed clinical evidence interfaces.
4. **2.4 — Quality/impact.** Test real reader comprehension of source vs clinical evidence and instrument utility. Instrument anonymized, consent-compliant engagement where authorized; benchmark outcome versus overhead without inventing ROI.

Do not start those tickets until independently prioritized/admitted into `CURRENT_SPRINT.md`, within the existing D/R/A WIP cap.
