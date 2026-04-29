import fs from "node:fs";
import path from "node:path";

const dataDir = path.resolve("public/data");

fs.mkdirSync(dataDir, { recursive: true });

const files = {
  // governedResearch.ts expects this file to be an ARRAY.
  "enrichment-governed.json": [],

  // governedResearch.ts expects this file to be an ARRAY.
  "source-registry.json": []
};

for (const [filename, content] of Object.entries(files)) {
  const filePath = path.join(dataDir, filename);

  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + "\n");
  console.log(`[static-stubs] ensured ${filePath}`);
}
