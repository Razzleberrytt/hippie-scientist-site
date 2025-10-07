import fs from "node:fs";

const FILES = [
  "src/data/herbs/herbs.normalized.json",
  "scripts/out/coverage.json",
  "scripts/out/coverage.md",
  "scripts/out/missing_key_fields.csv"
];

function fileExists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

const changed = process.argv.slice(2); // git diff --name-only passed from workflow
const interesting = changed.filter((p) => FILES.some((f) => p.endsWith(f)));

let body = `## Nightly data refresh

This PR was created automatically by the nightly workflow.

### What’s included
- Converted CSV → normalized JSON
- Autofilled missing key fields (effects / description / legalstatus) as needed
- Validated schema & audited coverage
- Coverage artifacts attached

`;

const coverageMd = fileExists("scripts/out/coverage.md")
  ? fs.readFileSync("scripts/out/coverage.md", "utf-8")
  : "";

if (coverageMd) {
  body += `### Coverage summary\n\n` + coverageMd.slice(0, 5000) + "\n\n";
}

if (fileExists("scripts/out/missing_key_fields.csv")) {
  const csv = fs.readFileSync("scripts/out/missing_key_fields.csv", "utf-8");
  const lines = csv.split(/\r?\n/).slice(0, 10).join("\n");
  body +=
    `### First rows with missing key fields (preview)\n\n` +
    "```\n" +
    lines +
    "\n```\n\n";
}

const outputFile = process.env.GITHUB_OUTPUT;
if (outputFile) {
  const output = [
    "pr_body<<EOF",
    body,
    "EOF",
    `changed_count=${interesting.length}`
  ].join("\n");
  fs.appendFileSync(outputFile, output + "\n");
} else {
  console.log(body);
  console.log(JSON.stringify({ changed_count: interesting.length }));
}
