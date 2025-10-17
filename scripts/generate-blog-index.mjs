import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const blogIndexPath = resolve(rootDir, 'public', 'blogdata', 'index.json');
const outputDir = resolve(rootDir, 'public', 'blog');
const outputPath = resolve(outputDir, 'index.html');

const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDate = (value) => {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return escapeHtml(value);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return escapeHtml(value);
  }
};

const main = async () => {
  const file = await readFile(blogIndexPath, 'utf8');
  const posts = JSON.parse(file);

  await mkdir(outputDir, { recursive: true });

  const listItems = posts
    .map((post) => {
      const slug = escapeHtml(post.slug ?? '');
      const title = escapeHtml(post.title ?? slug);
      const description = escapeHtml(post.description ?? post.summary ?? '');
      const isoDate = escapeHtml(post.date ?? '');
      const humanDate = formatDate(post.date);

      const dateMarkup = isoDate
        ? `<p class="post-meta"><time datetime="${isoDate}">${humanDate}</time></p>`
        : '';

      const descriptionMarkup = description
        ? `<p class="post-description">${description}</p>`
        : '';

      return `      <li>
        <article>
          <h2><a href="/blog/${slug}/">${title}</a></h2>
          ${dateMarkup}
          ${descriptionMarkup}
        </article>
      </li>`;
    })
    .join('\n');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Blog — Hippie Scientist</title>
    <meta
      name="description"
      content="Browse Hippie Scientist blog posts without JavaScript."
    />
    <style>
      :root {
        color-scheme: light dark;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 2rem 1.5rem 3rem;
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.6;
        background: #0f172a;
        color: #f8fafc;
      }
      main {
        max-width: 60rem;
        margin: 0 auto;
      }
      h1 {
        font-size: clamp(2rem, 4vw, 3rem);
        margin-bottom: 1rem;
        text-align: center;
      }
      p.lede {
        max-width: 40rem;
        margin: 0 auto 2rem;
        text-align: center;
        color: #cbd5f5;
      }
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 1.5rem;
      }
      li {
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(148, 163, 184, 0.3);
        border-radius: 1rem;
        padding: 1.25rem 1.5rem;
        backdrop-filter: blur(6px);
      }
      h2 {
        margin: 0 0 0.25rem;
        font-size: clamp(1.25rem, 3vw, 1.75rem);
      }
      a {
        color: #38bdf8;
        text-decoration: none;
      }
      a:hover,
      a:focus {
        text-decoration: underline;
      }
      .post-meta {
        margin: 0 0 0.5rem;
        font-size: 0.9rem;
        color: #cbd5f5;
      }
      .post-description {
        margin: 0;
        color: #e2e8f0;
      }
      footer {
        margin-top: 3rem;
        font-size: 0.875rem;
        text-align: center;
        color: #94a3b8;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Hippie Scientist Blog</h1>
      <p class="lede">Explore our latest plant musings, experiments, and herbal deep dives.</p>
      <ul>
${listItems}
      </ul>
      <footer>
        <p>Prefer the full experience? Visit <a href="https://hippiescientist.com/blog">hippiescientist.com/blog</a>.</p>
      </footer>
    </main>
  </body>
</html>
`;

  await writeFile(outputPath, html, 'utf8');
};

main().catch((error) => {
  console.error('[generate-blog-index] failed to build static blog index');
  console.error(error);
  process.exitCode = 1;
});
