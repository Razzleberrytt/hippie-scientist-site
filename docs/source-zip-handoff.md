# Clean source ZIP handoff

Use this helper when you need to upload the repo to ChatGPT, Codex, Claude, or another agent without accidentally including `node_modules`.

```bash
node scripts/create-source-zip.mjs
```

By default it creates a ZIP in `scratch/` named with the current branch and short commit SHA.

You can also pass a custom ZIP path:

```bash
node scripts/create-source-zip.mjs scratch/hippie-scientist-site-clean.zip
```

The helper uses `git archive`, so the ZIP is built from tracked Git files only. That means local install folders and build output such as `node_modules/`, `.next/`, `out/`, caches, and logs are not included.

After another agent receives the ZIP, it should run:

```bash
npm ci
npm run check:fast
```
