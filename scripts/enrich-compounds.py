#!/usr/bin/env python3
"""Disabled legacy compound enrichment entry point.

This script previously sent compound descriptions/mechanisms to an LLM, wrote the
result directly into generated ``public/data/compounds-detail`` files, and could
set ``indexability_status=PUBLISH`` based only on description length and mechanism
count. That bypasses the repository's source-backed workbook/governance pipeline.

Keep this file as an explicit tombstone so old local notes or automation fail
loudly instead of silently reintroducing unreviewed public medical content.
"""

import sys

MESSAGE = """
[enrich-compounds] DISABLED

The legacy LLM enrichment path is intentionally disabled because it can bypass
source-backed governance and mutate generated public/data files directly.

Use the canonical workflow instead:
  1. Edit/review canonical workbook or governed patch inputs.
  2. Attach real source identifiers (PMID/DOI/source URL) where claims require them.
  3. Run the normal data build/validation pipeline.
  4. Use the reviewed profile-promotion workflow when a held profile is ready.

Relevant npm commands include:
  npm run workbook:edit
  npm run data:patches:dry-run
  npm run data:patches:apply
  npm run data:build
  npm run data:validate
  npm run promote:check
  npm run promote:profile

Do not hand-edit public/data to change robots, sitemap inclusion, governance, or
indexability status.
""".strip()


def main() -> int:
    print(MESSAGE, file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
