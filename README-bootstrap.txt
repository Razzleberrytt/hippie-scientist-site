Files in this bundle:

- AGENTS.md
- ops/codex-queue.yaml
- .github/codex/prompts/run-next-step.md
- .github/workflows/codex-next.yml
- .github/workflows/codex-post-merge.yml
- skills/run-enrichment-step/SKILL.md

Recommended rollout:
1. Add everything except codex-post-merge.yml.
2. Create the OPENAI_API_KEY repository secret.
3. Commit and push.
4. Run the codex-next workflow manually once.
5. Review the PR it creates.
6. After one successful cycle, add codex-post-merge.yml to auto-dispatch the next step after each merged Codex PR.

Current queue default in this bundle:
- current: C2

If your real progress is different, edit only the top-level current line and the relevant step statuses in ops/codex-queue.yaml.
