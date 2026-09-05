import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const source = readFileSync('scripts/ci/validate-hub-child-coverage.mjs', 'utf8');
const validator = resolve('scripts/ci/validate-hub-child-coverage.mjs');
const fixtures = [];

const governedHubs = [
  '/guides/compare',
  '/learn',
  '/evidence/evidence-report',
  '/guides/sleep',
  '/guides/adhd',
];

function writeRoute(root, route, html) {
  const dir = join(root, 'out', route.replace(/^\//, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

function makeFixture({
  adhdLinked = true,
  adhdNoindex = false,
  adhdInSitemap = true,
  adhdRobotsTag,
  adhdLinkTag,
} = {}) {
  const root = mkdtempSync(join(tmpdir(), 'hub-child-coverage-'));
  fixtures.push(root);

  for (const hub of governedHubs) writeRoute(root, hub, '<html><body></body></html>');

  const child = '/guides/adhd/focus-stack';
  const robotsTag = adhdRobotsTag ?? (adhdNoindex ? '<meta name="robots" content="noindex">' : '');
  writeRoute(
    root,
    child,
    `<html><head>${robotsTag}</head><body></body></html>`,
  );

  const defaultLinkTag = `<a href="${child}/">Focus stack</a>`;
  writeRoute(
    root,
    '/guides/adhd',
    `<html><body>${adhdLinked ? (adhdLinkTag ?? defaultLinkTag) : ''}</body></html>`,
  );

  const sitemapEntries = governedHubs.map((route) => `https://example.test${route}/`);
  if (adhdInSitemap) sitemapEntries.push(`https://example.test${child}/`);
  writeFileSync(join(root, 'out', 'sitemap.xml'), sitemapEntries.join('\n'));

  return root;
}

function runValidator(root) {
  return spawnSync(process.execPath, [validator], {
    cwd: root,
    encoding: 'utf8',
  });
}

afterEach(() => {
  while (fixtures.length) rmSync(fixtures.pop(), { recursive: true, force: true });
});

describe('hub child coverage contract', () => {
  it('protects the ADHD hub alongside the existing governed hubs', () => {
    const hubsBlock = source.match(/const HUBS = \[[\s\S]*?\]/)?.[0] ?? '';

    expect(hubsBlock).toContain("'/guides/adhd'");
    expect(hubsBlock).toContain("'/guides/sleep'");
    expect(hubsBlock).toContain("'/guides/compare'");
    expect(hubsBlock).toContain("'/learn'");
    expect(hubsBlock).toContain("'/evidence/evidence-report'");
  });

  it('passes when an indexable, sitemapped ADHD child is linked from its hub', () => {
    const result = runValidator(makeFixture());

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('[hub-child-coverage] PASS:');
  });

  it('recognizes canonical ADHD child hrefs regardless of quote style or attribute order', () => {
    const result = runValidator(makeFixture({
      adhdLinkTag: "<a class='guide-card' data-kind='child' href='/guides/adhd/focus-stack/'>Focus stack</a>",
    }));

    expect(result.status).toBe(0);
  });

  it('fails closed when an indexable, sitemapped ADHD child is stranded', () => {
    const result = runValidator(makeFixture({ adhdLinked: false }));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('/guides/adhd/focus-stack/ — indexable and in the sitemap, but not linked from /guides/adhd/');
  });

  it('does not accept loose prefix matches as canonical child links', () => {
    const result = runValidator(makeFixture({
      adhdLinkTag: '<a href="/guides/adhd/focus-stack/extra/">Wrong target</a>',
    }));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('/guides/adhd/focus-stack/ — indexable and in the sitemap, but not linked from /guides/adhd/');
  });

  it('does not require hub links for ADHD children outside the indexing commitment', () => {
    const noindex = runValidator(makeFixture({ adhdLinked: false, adhdNoindex: true }));
    const notSitemapped = runValidator(makeFixture({ adhdLinked: false, adhdInSitemap: false }));

    expect(noindex.status).toBe(0);
    expect(notSitemapped.status).toBe(0);
  });

  it('recognizes noindex regardless of robots-meta attribute order and quote style', () => {
    const reversedSingleQuoted = runValidator(makeFixture({
      adhdLinked: false,
      adhdRobotsTag: "<meta content='NOINDEX,follow' name='robots'>",
    }));

    expect(reversedSingleQuoted.status).toBe(0);
  });
});
