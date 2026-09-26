# Actions orchestration inventory

Generated with `node scripts/ci/actions-efficiency-report.mjs --inventory=<directory>`. Static inventory; the command also emits full job/step predicates as JSON (kept outside version control to avoid duplicating workflow source). Build-command presence does not imply execution. Indirect script dispatches are described in the audit edge register.

| File | Triggers | Workflow concurrency | Jobs / reusable edges | Work classes present |
|---|---|---|---|---|
| agent.yml | workflow_dispatch | metadata-harvest; cancel=false | orchestrator | install;  |
| ai-citation-incident-check.yml | pull_request [path-filtered]; workflow_dispatch | ai-citation-incident-${{ github.event.pull_request.number || github.ref }}; cancel=true | incident-monitor | install;  |
| ai-entity-enrichment-check.yml | pull_request [path-filtered]; workflow_dispatch | ${{ github.workflow }}-${{ github.ref }}; cancel=true | validate | install;  |
| atomic-upgrade-gate.yml | pull_request; workflow_dispatch | ${{ github.workflow }}-${{ github.ref }}; cancel=true | atomic-contract, generator-release-quality |  |
| autonomous-merge-controller.yml | pull_request_target; workflow_run (CI, Site Health Check, Atomic upgrade gate, Build quality regression, Production Content Lint, Build Check, Lighthouse CI, Research Distribution); schedule (*/10 * * * *); workflow_dispatch | autonomous-merge-${{ github.event.pull_request.number || inputs.pr_number || 'fallback' }}; cancel=false | merge-controller, merge-commit, fallback-sweep | dispatch;  |
| backlog-integrity.yml | workflow_dispatch; pull_request [path-filtered]; push [path-filtered] | ${{ github.workflow }}-${{ github.ref }}; cancel=true | backlog-integrity |  |
| botanical-atlas-coverage.yml | pull_request [path-filtered]; push [path-filtered]; workflow_dispatch | ${{ github.workflow }}-${{ github.ref }}; cancel=true | coverage-report |  |
| build-candidates.yml | workflow_dispatch | None at workflow level | queue | install;  |
| build-check.yml | pull_request [path-filtered]; workflow_dispatch | build-check-${{ github.ref }}; cancel=true | build | install; build command; receipt verification;  |
| build-quality-regression.yml | pull_request; workflow_dispatch | ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}; cancel=true | compare-generated-quality | install;  |
| check.yml | push; pull_request; workflow_dispatch | ${{ github.workflow }}-${{ github.ref }}; cancel=true | check | install;  |
| ci.yml | pull_request; push; workflow_dispatch | ci-v2-${{ github.ref }}; cancel=true | validation, build-verification | install; build command; dispatch;  |
| citation-health-weekly.yml | schedule (0 7 * * 4); workflow_dispatch | None at workflow level | citation-health | install;  |
| content-claim-drift.yml | pull_request [path-filtered]; push [path-filtered]; schedule (17 14 * * *); workflow_dispatch | content-claim-drift-${{ github.ref }}; cancel=true | audit |  |
| content-decay-monthly.yml | schedule (40 7 1 * *); workflow_dispatch | None at workflow level | content-decay | install;  |
| content-integrity-weekly.yml | schedule (20 6 * * 2); workflow_dispatch | None at workflow level | content-integrity | install;  |
| crawl-experiment-guard.yml | workflow_dispatch; pull_request [path-filtered]; push [path-filtered] | ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}; cancel=true | validate | install; build command;  |
| crawl-governance.yml | pull_request [path-filtered]; push [path-filtered]; workflow_dispatch | crawl-governance-${{ github.ref }}; cancel=true | audit | install; build command; receipt verification;  |
| deep-enrichment.yml | workflow_dispatch | None at workflow level | enrich | install;  |
| deploy.yml | workflow_run (CI); workflow_dispatch | deploy-${{ github.ref }}; cancel=false | deploy | install; build command; receipt verification;  |
| enforce-main-protection.yml | pull_request [path-filtered]; issue_comment; workflow_dispatch | enforce-main-protection-${{ github.event_name }}-${{ github.ref }}; cancel=false | contract, enforce | install;  |
| enrichment-governor-maintenance.yml | schedule (2 * * * *); workflow_dispatch | enrichment-governor-persistent-writer; cancel=false | reconcile | install; dispatch; PR creation |
| enrichment-governor-transaction.yml | workflow_dispatch | enrichment-governor-persistent-writer; cancel=false | transact | install; dispatch; PR creation |
| enrichment-governor.yml | pull_request [path-filtered]; push [path-filtered]; workflow_dispatch; schedule (17 9 * * *) | ${{ github.workflow }}-${{ github.ref }}; cancel=true | verify | install;  |
| evidence-data-check.yml | pull_request [path-filtered]; workflow_dispatch | evidence-data-${{ github.ref }}; cancel=true | evidence-gate | install;  |
| evidence-graph-identity-check.yml | push [path-filtered]; pull_request [path-filtered]; workflow_dispatch | evidence-graph-identity-${{ github.ref }}; cancel=true | identity-registry | install;  |
| experience-backlog-contract.yml | workflow_dispatch; pull_request [path-filtered]; push [path-filtered] | ${{ github.workflow }}-${{ github.ref }}; cancel=true | experience-contract |  |
| experiment-learning-ledger.yml | pull_request [path-filtered]; push [path-filtered]; workflow_dispatch | ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}; cancel=true | validate-learning-ledger | install;  |
| fast-ui-check.yml | pull_request [path-filtered]; workflow_dispatch | ${{ github.workflow }}-${{ github.ref }}; cancel=true | fast-ui-check | install;  |
| lighthouse.yml | push; pull_request [path-filtered]; schedule (41 10 * * 2); workflow_dispatch | lighthouse-${{ github.ref }}; cancel=true | lighthouse | install; build command; receipt verification;  |
| linkchecker.yml | schedule (0 6 * * 1); workflow_dispatch | None at workflow level | check-links | install;  |
| main-protection-audit.yml | pull_request [path-filtered]; schedule (17 * * * *); workflow_dispatch | main-protection-audit-${{ github.ref }}; cancel=true | contract, live-main-protection | install;  |
| maintenance-cadence.yml | workflow_dispatch; schedule (17 9 * * 1; 37 10 1 * *) | maintenance-cadence; cancel=false | weekly-quality, monthly-decay | install;  |
| marginal-economics.yml | pull_request [path-filtered]; push [path-filtered]; workflow_dispatch | ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}; cancel=true | validate | install;  |
| master-research-pipeline.yml | workflow_dispatch | None at workflow level | metadata_harvest: ./.github/workflows/agent.yml, patch_qa: ./.github/workflows/patch-qa.yml, relationship_graph: ./.github/workflows/relationship-graph.yml, seo_assets: ./.github/workflows/seo-assets.yml, product_intelligence: ./.github/workflows/product-intelligence.yml, build_candidates: ./.github/workflows/build-candidates.yml, review_exports: ./.github/workflows/review-patches.yml |  |
| metricool-connector-measurement.yml | workflow_dispatch | metricool-measurement-${{ inputs.source_publication_run_id }}; cancel=false | ingest | install;  |
| metricool-connector-publication-proof.yml | workflow_dispatch | metricool-publication-proof-${{ inputs.source_receipt_run_id }}; cancel=false | ingest | install;  |
| metricool-connector-publication.yml | workflow_dispatch | metricool-publication; cancel=false | prepare | install;  |
| metricool-connector-receipt.yml | workflow_dispatch | metricool-receipt-${{ inputs.source_run_id }}; cancel=false | ingest | install;  |
| metricool-publication.yml | workflow_dispatch | metricool-publication; cancel=false | schedule | install;  |
| outreach-intelligence.yml | schedule (17 11 * * 1); workflow_dispatch | None at workflow level | intelligence |  |
| owner-control-plane-bridge.yml | pull_request [path-filtered]; issue_comment | owner-control-plane-bridge-global; cancel=false | contract, governor, metricool_publish, ready | dispatch;  |
| parallel-enrichment-safety.yml | workflow_dispatch; pull_request [path-filtered]; push [path-filtered] | ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}; cancel=true | validate-parallel-enrichment | install;  |
| patch-packaging.yml | workflow_dispatch | None at workflow level | package | install;  |
| patch-qa.yml | workflow_dispatch | None at workflow level | qa | install;  |
| performance-monitor.yml | schedule (23 10 * * 1); workflow_dispatch | None at workflow level | cloudflare-cache |  |
| prioritization-contract.yml | pull_request [path-filtered]; push [path-filtered]; workflow_dispatch | ${{ github.workflow }}-${{ github.ref }}; cancel=true | validate |  |
| product-intelligence.yml | workflow_dispatch | None at workflow level | products | install;  |
| production-content-invariants.yml | pull_request [path-filtered]; push [path-filtered]; workflow_dispatch | production-content-invariants-${{ github.ref }}; cancel=true | invariants | install; build command; receipt verification;  |
| production-content-lint.yml | pull_request; push; workflow_dispatch | production-content-lint-${{ github.ref }}; cancel=true | production-content-lint | install; build command; receipt verification;  |
| project-control-reconciliation.yml | pull_request [path-filtered]; push [path-filtered]; workflow_dispatch | ${{ github.workflow }}-${{ github.ref }}; cancel=true | reconcile |  |
| refresh-runtime-data.yml | workflow_dispatch | None at workflow level | refresh-runtime-data | install;  |
| related-botanicals-audit.yml | workflow_dispatch; pull_request [path-filtered]; push [path-filtered] | ${{ github.workflow }}-${{ github.ref }}; cancel=true | audit | install;  |
| relationship-graph.yml | workflow_dispatch | None at workflow level | graph | install;  |
| remediate-audit-lockfile.yml | push [path-filtered]; workflow_dispatch | None at workflow level | refresh-lockfile |  |
| research-distribution.yml | schedule (41 12 1 * *); workflow_dispatch; pull_request [path-filtered] | ${{ github.workflow }}-${{ github.ref }}; cancel=true | build | install;  |
| research-intake-demand-weekly.yml | schedule (10 8 * * 1); workflow_dispatch | None at workflow level | rank-demand |  |
| research-maintenance.yml | schedule (47 12 * * 1); workflow_dispatch | None at workflow level | maintenance |  |
| review-patches.yml | workflow_dispatch | review-agent-patches; cancel=false | review | install;  |
| schema-media-governance.yml | pull_request [path-filtered]; push [path-filtered]; workflow_dispatch | ${{ github.workflow }}-${{ github.ref }}; cancel=true | schema-and-media | install; build command; receipt verification;  |
| search-console-opportunities-weekly.yml | schedule (20 7 * * 5); workflow_dispatch | None at workflow level | search-opportunities | install;  |
| seo-assets.yml | workflow_dispatch | None at workflow level | seo | install;  |
| sitemap-seo.yml | schedule (40 6 * * 3); workflow_dispatch | None at workflow level | sitemap | install; build command;  |
| source-expansion.yml | workflow_dispatch | None at workflow level | expand | install;  |
| stale-actions-reaper.yml | push [path-filtered]; schedule (17 * * * *); workflow_dispatch | stale-actions-reaper; cancel=false | reap-stale-orphans |  |
| swarm-broken-sentinel.yml | schedule (7,37 * * * *); workflow_dispatch | swarm-broken-sentinel; cancel=true | sentinel | dispatch;  |
| swarm-runtime-resilience.yml | pull_request [path-filtered]; push [path-filtered]; workflow_dispatch | swarm-runtime-resilience-${{ github.ref }}; cancel=true | no-blocker-regression |  |
| technical-seo-monitor.yml | pull_request [path-filtered]; push [path-filtered]; schedule (17 11 * * 1); workflow_dispatch | technical-seo-${{ github.ref }}; cancel=true | static-contract, live-production | install; build command; receipt verification;  |
| workbook-patch-check.yml | pull_request [path-filtered]; workflow_dispatch | workbook-patch-check-${{ github.ref }}; cancel=true | validate | install;  |
