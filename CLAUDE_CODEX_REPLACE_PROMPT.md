# Codex/Claude Anti-Timeout Repo Replacement Prompt

Use this prompt after uploading `hippie-scientist-site-main-31-seo-audited.zip` into the root of your current local repository.

```md
You are in the root of my current buggy repository. I have placed this file in the repo root:

`hippie-scientist-site-main-31-seo-audited.zip`

Do not audit, refactor, summarize every file, run a build, or inspect the whole repository. Your task is only to replace the working tree with the contents of the zip.

Run these shell commands exactly, adapting only if the zip filename differs:

```bash
set -euo pipefail

ZIP="hippie-scientist-site-main-31-seo-audited.zip"
WORK="/tmp/hippie-scientist-site-replace"

test -f "$ZIP"

rm -rf "$WORK"
mkdir -p "$WORK"
unzip -q "$ZIP" -d "$WORK"

test -f "$WORK/hippie-scientist-site-main/package.json"

git status --short > /tmp/pre-replace-status.txt

rsync -a --delete \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='out/' \
  --exclude='.vercel/' \
  --exclude="$ZIP" \
  "$WORK/hippie-scientist-site-main/" \
  ./

git status --short
git diff --stat
```

Stop after `git diff --stat`. Do not run the build in this same Codex turn.

Report only:
1. Whether the replacement succeeded.
2. The `git diff --stat`.
3. Any shell error, if one occurred.

Do not perform additional analysis.
```
