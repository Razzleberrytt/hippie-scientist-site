# COA Verification Methodology

This document describes how The Hippie Scientist evaluates Certificate of Analysis (COA) transparency for trust-facing UI primitives.

## Verification criteria

COA confidence is based on four signals:

1. **Lab identity and accreditation**
   - Named lab preferred.
   - ISO/IEC 17025 accreditation is treated as a stronger trust signal.
2. **Panel completeness**
   - Core panel expects potency, heavy metals, and microbial fields.
   - Missing measured values or limits lowers confidence.
3. **Document recency**
   - Recently dated reports are preferred over undated or stale documents.
4. **Batch traceability**
   - Batch/lot linkage improves confidence that the report maps to a specific product run.

## Confidence levels

- **High**: accredited or otherwise verifiable lab + complete core panel + traceable batch metadata.
- **Medium**: partial verification (for example, one missing field or unconfirmed accreditation) with mostly complete testing data.
- **Low**: missing or weak lab verification, incomplete data, undated report, or no accessible COA.

## Special states

- **No COA**: seller does not provide a report.
- **Insufficient Data**: report exists but required fields are missing/unreadable.
- **Unverified Lab**: report exists, but lab identity/accreditation cannot be verified.

## UX notes

- Language should remain neutral and evidence-aware.
- COA components communicate transparency quality and verification confidence; they do not provide medical guidance.
- Full report links should open the original source PDF where available.
