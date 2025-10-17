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

const main = async () => {
  const file = await readFile(blogIndexPath, 'utf8');
  const posts = JSON.parse(file);

  await mkdir(outputDir, { recursive: true });

  const listItems = posts
    .map((post) => {
      const slug = escapeHtml(post.slug ?? '');
      const title = escapeHtml(post.title ?? slug);
      const description = escapeHtml(post.description ?? '');
      const date = escapeHtml(post.date ?? '');

      const dateMarkup = date ? ` — <time>${date}</time>` : '';
      const descriptionMarkup = description ? `<br>${description}` : '';

      return `    <li><a href="/blog/${slug}/">${title}</a>${dateMarkup}${descriptionMarkup}</li>`;
    })
    .join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Hippie Scientist Blog</title>
<meta name="robots" content="index,follow">
</head>
<body>
<h1>Hippie Scientist Blog</h1>
<ul>
${listItems}
</ul>
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
