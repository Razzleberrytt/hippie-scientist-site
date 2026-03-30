Read `AGENTS.md`, then complete only the task requested by the triggering prompt/reviewer.

Guidelines:
- Keep scope narrow and avoid unrelated cleanup.
- Preserve lane safety protections and schema/domain validation safeguards.
- Run only the narrowest relevant verification commands.
- If blocked, stop and write a concise blocker summary.

At the end, report:
1. changed-file list
2. key diffs
3. commands run
4. verification results
5. risks or follow-ups
