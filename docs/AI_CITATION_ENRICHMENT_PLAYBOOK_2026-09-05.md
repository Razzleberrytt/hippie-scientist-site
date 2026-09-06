# AI Citation Enrichment Playbook — 2026-09-05

## Why this change

Fresh 2026 research supports treating AI citation growth as a retrieval-and-evidence problem rather than a page-volume problem. The strongest practical signals are:

- authority-aware retrieval can improve both relevance and trustworthiness;
- generative search systems vary materially in retrieval footprint, source diversity, and stability;
- high-influence cited pages tend to be structured, semantically aligned, and rich in extractable evidence such as definitions, comparisons, procedures, and quantitative facts;
- repeated optimization against ranking signals can become counterproductive, so verifiable factual substance must remain the governing objective.

## Enrichment rules

1. Rank opportunities by citation headroom and expected upside, not raw query count or article count.
2. Defend established high-volume winners while expanding low-share queries where the site is already a cited source.
3. Prefer one strong canonical page or comparison hub over multiple thin query-matched routes.
4. Upgrade answer extraction: concise direct answers, explicit section hierarchy, comparison tables where appropriate, definitions, procedures, and clearly bounded conclusions.
5. Upgrade evidence extraction: primary/authoritative sources, transparent provenance, dates/freshness, uncertainty boundaries, and safety context where relevant.
6. Reinforce internal authority paths from relevant hubs to verified target pages.
7. Keep page ownership `Unknown` when query-only telemetry cannot establish a canonical URL; never infer a winner URL from the query string alone.
8. Measure rolling citation share, cited-page breadth, and recovery after negative days. Do not infer causation from a single report.

## Implemented

`scripts/seo/rank-ai-citation-opportunities.mjs` consumes a Bing AI Search Queries export and emits:

- `ops/reports/ai-citation-priority-queue.json`
- `ops/reports/ai-citation-priority-queue.md`

The ranking is deterministic and records citations, citation share, implied citation pool, estimated headroom, cluster, defend/expand mode, target-URL status, and recommended next action.

Run it with:

```bash
node scripts/seo/rank-ai-citation-opportunities.mjs --input=/path/to/search-queries.csv --date=2026-09-05
```

The tool is prioritization-only. It does not publish content, invent citations, infer page ownership, or weaken scientific/safety/release gates.

## Research references

- Wang et al., “From Relevance to Authority: Authority-aware Generative Retrieval in Web Search Engines,” ACL Industry Track 2026: https://aclanthology.org/2026.acl-industry.54/
- “Characterizing Web Search in the Age of Generative AI,” Findings of ACL 2026: https://aclanthology.org/2026.findings-acl.526/
- “From Citation Selection to Citation Absorption: A Measurement Framework for Generative Engine Optimization Across AI Search Platforms,” arXiv:2604.25707: https://arxiv.org/abs/2604.25707
- “Mechanism Design for Generative Engines: From Exploitation toward Win-Win Outcomes,” arXiv:2608.11390: https://arxiv.org/abs/2608.11390
- “When Optimization Becomes Manipulation: Defending Generative Search against Malicious Generative Engine Optimization,” arXiv:2609.02964: https://arxiv.org/abs/2609.02964

These references inform prioritization and content-quality principles; they do not override the repository's existing scientific, provenance, safety, accessibility, canonical, or release governance.
