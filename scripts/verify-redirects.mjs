import fs from "fs";
import path from "path";

const out = path.resolve("dist", "_redirects");
if (!fs.existsSync(out)) {
  console.error("[verify-redirects] MISSING dist/_redirects — SPA deep links will 404.");
  process.exit(1);
}
const txt = fs.readFileSync(out, "utf-8");
console.log("[verify-redirects] dist/_redirects present:\n---\n" + txt + "\n---");
if (!txt.includes("/*") || !txt.includes("/index.html") || !txt.includes("200")) {
  console.error("[verify-redirects] Rule looks wrong; expected: `/*  /index.html  200`");
  process.exit(1);
}
console.log("[verify-redirects] OK");
