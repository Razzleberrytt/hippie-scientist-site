import chokidar from "chokidar";
import { execSync } from "child_process";
import fs from "node:fs";
import path from "node:path";

const WATCH_DIR = "scripts/incoming";
const MERGE_TARGET = "src/data/herbs/herbs.normalized.json";

if (!fs.existsSync(WATCH_DIR)) fs.mkdirSync(WATCH_DIR, { recursive: true });

console.log("👁️  Watching for new herb data in:", WATCH_DIR);
console.log("Drop any .csv or .json file to auto-process.\n");

let active = false;

async function run(cmd) {
  console.log(`\n→ ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (e) {
    console.error("⚠️  Command failed:", cmd);
  }
}

async function handleFile(file) {
  if (active) {
    console.log("⏳ Still processing previous update, skipping...");
    return;
  }
  active = true;
  const ext = path.extname(file).toLowerCase();
  const name = path.basename(file);
  console.log(`\n📥 Detected update: ${name}`);
  try {
    if (ext === ".csv") {
      // convert new CSV → normalized JSON → autofill → validate → audit
      await run(`node scripts/convert-herbs.mjs`);
      await run(`node scripts/autofill-herbs.mjs`);
      await run(`node scripts/validate-herbs.mjs`);
      await run(`node scripts/audit-herbs.mjs`);
      await run(`npm run data:report`);
    } else if (ext === ".json") {
      // treat as patch and merge
      await run(`npm run data:merge -- ${file}`);
      await run(`npm run data:refresh`);
    } else {
      console.log("Ignoring non-data file:", name);
    }

    if (fs.existsSync(MERGE_TARGET)) {
      const stats = fs.statSync(MERGE_TARGET);
      console.log(`✅ Current dataset: ${MERGE_TARGET} (${(stats.size/1024).toFixed(1)} KB)`);
    }
  } finally {
    active = false;
    console.log("\nReady for next drop.\n");
  }
}

chokidar
  .watch(WATCH_DIR, { persistent: true, ignoreInitial: false })
  .on("add", handleFile)
  .on("change", handleFile);

process.on("SIGINT", () => {
  console.log("\n👋 Exiting watcher.");
  process.exit(0);
});
