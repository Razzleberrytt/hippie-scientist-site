# P0 #6968 — Batch 4 execution and release record

Owner instruction October 26: finish and publish all 50 articles, then improve navigation clarity and accessibility. This continues the existing ten-article release contract under #6968. One implementation branch; no parallel/stacked PR. Shared sprint/backlog paths are reserved by held #6934, so progress remains on #6968 and this scoped record.

## Reconciliation
- Batch 3 #6970 is merged at 023f62aaf986b203ad0b58288b7b48dffab8b6d8, contrary to stale issue prose.
- All 30 registry article URLs independently fetched with curl: substantive rendered HTML and canonical present, 30/30. The first urllib pass was blocked with HTTP 403 and was not counted as verification. Curl recovered the public check.
- All 18 open PRs inventoried through the GitHub connector, with separately fetched changed-file counts matching complete file lists. All drafts; no #6968 ownership or planned-file overlap. The actual `assessAdmission` implementation returned READY on that live complete inventory. CLI invocation could not run its gh transport (`spawnSync gh ENOENT`); equivalent connector-backed inventory was passed to the unchanged function. No admission gate modified.

## Manuscripts and intent
Ten source-graded research appraisals: OCPD/OCD evidence and course; persistent mistrust; schizoid/avoidant interpretation; HPD diagnostic validity; ASPD/psychopathy with MOAM; cyclothymia evidence gaps; autistic burnout/depression; PMDD; maladaptive daydreaming; childhood emotional neglect. Existing typed diagnostic guides remain clinical overviews; these reviews appraise specific primary studies, study limitations, conflicting findings and latest evidence rather than replacing their stable URLs.

No false quantitative meta-analysis, diagnoses of absent partners, medication schedules or commercial product rankings. Limited evidence is stated rather than padded with unrelated references. The cyclothymia and daydreaming reviews intentionally have two directly relevant sources; reference count is not an evidence grade.

## Specific safeguards
- MOAM clinical and economic papers are the same trial, not independent replication; aggression is distinct from QALYs and cost.
- PMDD intermittent SSRI schedules cannot be copied onto another prescription; subgroup schedules are not a definitive head-to-head ranking.
- Daydreaming trial abstract has internally inconsistent completion/arm counts; manuscript does not silently reconcile them.
- Cluster A pooled effects are not assigned to schizoid or paranoid personality individually.
- Retrospective mediation/imaging findings cannot prove a specific developmental cause or permanent damage.
- Autistic lived-experience studies are not randomized treatment or prevalence estimates.
- Historical gender-stereotype student study cannot quantify current clinician bias.

## Validation observed
- Article quality: PASS.
- Existing Batch 1–3 and directory interaction: 5 suites / 20 tests PASS.
- Batch 4 source/discovery and exact high-risk claim boundaries: 1 suite / 2 tests PASS.
- Changed TS/TSX eslint: PASS.
- Shared fast preflight, changed-source regressions and high-severity security audit: PASS.
- Production build: RUNNING when this record was written; require terminal result and exact-head hosted CI.

Source identities and abstracts resolved via Europe PMC MED records. Full-text methods, comprehensive correction/retraction checks and investigator-conflict review are not fully established. This is authoring-assistant QA, not independent human medical review. No screenshot or real-device visual PASS claimed. Full protected checks, review disposition, controller merge and exact deployment/public URL proof remain required. Batch 5 and the final navigation pass remain pending until this cohort is shipped.
