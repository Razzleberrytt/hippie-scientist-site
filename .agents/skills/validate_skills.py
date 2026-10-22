#!/usr/bin/env python3
"""Validate local THS SKILL.md metadata and explicit stop paths; never attest runtime."""
from pathlib import Path
import argparse
import json
import re
import subprocess
import sys

SOURCE_ROOT = Path(__file__).resolve().parent
REPO_ROOT = SOURCE_ROOT.parents[1]
EXPECTED = {
    "ths-operating-system", "em-build-repair", "em-verify-ship",
    "em-tiktok-producer", "ths-evidence-integrity", "ths-publishing-seo-qa",
    "ths-growth-economics", "ths-scheduler-reliability",
    "firstcert-regulatory-gate", "ths-skill-maintainer",
}
YAML_CHECK = r"""
import { readFileSync } from "node:fs";
import { parseDocument } from "yaml";
const items = JSON.parse(readFileSync(0, "utf8"));
const results = items.map(({ name, frontmatter }) => {
  try {
    const doc = parseDocument(frontmatter, { uniqueKeys: true, strict: true });
    if (doc.errors.length) return { name, errors: doc.errors.map(e => e.message) };
    const data = doc.toJS();
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { name, errors: ["frontmatter must be a YAML mapping"] };
    }
    return { name, data };
  } catch (error) {
    return { name, errors: [String(error)] };
  }
});
process.stdout.write(JSON.stringify(results));
"""

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root", type=Path, default=SOURCE_ROOT,
        help="Skill directory to validate (for isolated regression fixtures)",
    )
    args = parser.parse_args()
    root = args.root.resolve()
    found = {p.parent.name: p for p in root.glob("*/SKILL.md")}
    errors = []
    if set(found) != EXPECTED:
        errors.append(
            f"inventory mismatch: missing={sorted(EXPECTED - set(found))}, "
            f"extra={sorted(set(found) - EXPECTED)}"
        )
    yaml_payload = []
    for name, path in sorted(found.items()):
        data = path.read_text(encoding="utf-8")
        match = re.match(r"\A---\r?\n(.*?)\r?\n---(?:\r?\n|\Z)", data, re.S)
        if not match:
            errors.append(f"{name}: missing, malformed, or unclosed YAML frontmatter")
            continue
        yaml_payload.append({"name": name, "frontmatter": match.group(1)})
        if len(data.splitlines()) < 10:
            errors.append(f"{name}: too short")
        stop = re.search(r"(?ms)^## Fail-closed action\r?\n(.*?)(?=^## |\Z)", data)
        if not stop:
            errors.append(f"{name}: missing explicit '## Fail-closed action' section")
        else:
            block = stop.group(1)
            trigger = re.search(r"(?m)^- \*\*Trigger:\*\* (\S.{14,})$", block)
            action = re.search(r"(?m)^- \*\*Action:\*\* ((?:STOP|HOLD)\b\S*.{14,})$", block)
            if not trigger or not action:
                errors.append(
                    f"{name}: fail-closed section needs concrete Trigger and STOP/HOLD Action"
                )
        for ref in re.findall(r"\x60(\.\./[^\x60]+?SKILL\.md)\x60", data):
            target = (path.parent / ref).resolve()
            if not target.is_file() or not target.is_relative_to(root):
                errors.append(f"{name}: broken/out-of-root sibling skill reference {ref}")
    if yaml_payload:
        try:
            check = subprocess.run(
                ["node", "--input-type=module", "-e", YAML_CHECK],
                input=json.dumps(yaml_payload), text=True, cwd=REPO_ROOT,
                capture_output=True, check=False, timeout=30,
            )
            if check.returncode != 0:
                errors.append(
                    "YAML parser unavailable/failing: " + check.stderr.strip()[:700]
                )
            else:
                for row in json.loads(check.stdout):
                    if "errors" in row:
                        errors.append(
                            f"{row['name']}: invalid YAML: {'; '.join(row['errors'])}"
                        )
                        continue
                    metadata = row["data"]
                    for field in ("name", "version", "description", "owner"):
                        value = metadata.get(field)
                        if not isinstance(value, str) or not value.strip():
                            errors.append(
                                f"{row['name']}: {field} must be a nonempty YAML string"
                            )
                    if metadata.get("name") != row["name"]:
                        errors.append(
                            f"{row['name']}: YAML skill name does not match directory"
                        )
        except (OSError, ValueError, subprocess.TimeoutExpired) as exc:
            errors.append(f"YAML parser did not complete: {exc}")
    if errors:
        for error in errors:
            print("FAIL:", error)
        return 1
    print(
        f"PASS — {len(found)} skills; strict YAML, unique keys, "
        "relative refs and explicit stop paths (structural only)."
    )
    return 0

if __name__ == "__main__":
    sys.exit(main())
