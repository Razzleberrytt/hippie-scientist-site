import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const blogDataPath = path.join(projectRoot, "public", "blogdata", "index.json");
const outputDir = path.join(projectRoot, "public", "blog");
const outputPath = path.join(outputDir, "index.html");

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(iso) {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

async function generate() {
  const raw = await fs.readFile(blogDataPath, "utf8");
  const parsed = JSON.parse(raw);
  const posts = Array.isArray(parsed) ? parsed : [];

  await fs.mkdir(outputDir, { recursive: true });

  const sortedPosts = posts.slice().sort((a, b) => {
    const da = Date.parse(a?.date ?? "");
    const db = Date.parse(b?.date ?? "");
    const safeDa = Number.isNaN(da) ? 0 : da;
    const safeDb = Number.isNaN(db) ? 0 : db;
    return safeDb - safeDa;
  });

  const listItems = sortedPosts
    .map((post) => {
      const slug = String(post.slug || "").trim();
      if (!slug) return null;
      const title = escapeHtml(String(post.title || slug));
      const url = `/blog/${slug}/`;
      const formattedDate = formatDate(post.date);
      const description = escapeHtml(
        String(post.description || post.summary || "").trim().replace(/\s+/g, " "),
      );

      const meta = [
        formattedDate ? `<time datetime="${escapeHtml(post.date)}">${formattedDate}</time>` : "",
      ]
        .filter(Boolean)
        .join(" ");

      return `      <li>
        <article>
          <h2><a href="${url}">${title}</a></h2>
          ${meta ? `<p class="meta">${meta}</p>` : ""}
          ${description ? `<p class="summary">${description}</p>` : ""}
        </article>
      </li>`;
    })
    .filter(Boolean)
    .join("\n") || "      <li><p>No posts published yet.</p></li>";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>The Hippie Scientist — Blog</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Latest research notes and field reports from The Hippie Scientist." />
    <style>
      :root {
        color-scheme: dark;
        font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background-color: #05060a;
        color: #f4f6fb;
      }
      body {
        margin: 0;
        padding: 3rem 1.5rem;
        display: flex;
        justify-content: center;
      }
      main {
        width: min(720px, 100%);
      }
      h1 {
        font-size: clamp(2rem, 5vw, 2.5rem);
        margin-bottom: 1.5rem;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 1.5rem;
      }
      li {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 1rem;
        padding: 1.25rem 1.5rem;
      }
      h2 {
        margin: 0 0 0.5rem;
        font-size: clamp(1.35rem, 4vw, 1.75rem);
      }
      a {
        color: #8da7ff;
        text-decoration: none;
      }
      a:hover,
      a:focus {
        text-decoration: underline;
      }
      .meta {
        margin: 0 0 0.75rem;
        font-size: 0.95rem;
        color: rgba(244, 246, 251, 0.8);
      }
      .summary {
        margin: 0;
        line-height: 1.6;
        color: rgba(244, 246, 251, 0.85);
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>The Hippie Scientist Blog</h1>
        <p>Recent field notes, research logs, and herbal musings from The Hippie Scientist.</p>
      </header>
      <ul>
${listItems}
      </ul>
    </main>
  </body>
</html>
`;

  await fs.writeFile(outputPath, html);
}

generate().catch((error) => {
  console.error("Failed to generate blog index:", error);
  process.exitCode = 1;
});
