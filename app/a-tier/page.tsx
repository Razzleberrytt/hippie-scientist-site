import fs from "fs";
import path from "path";

export default function ATierPage() {
  const filePath = path.join(process.cwd(), "public/data/a-tier-index.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  return (
    <main className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Top Evidence Compounds</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Global A-Tier</h2>
        <ul>
          {data.global.map((item: any) => (
            <li key={item.slug}>
              {item.name} — {item.domain}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Context-Specific A-Tier</h2>
        <ul>
          {data.contextual.map((item: any) => (
            <li key={item.slug}>
              {item.name} — {item.domain}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
