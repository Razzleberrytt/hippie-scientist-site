import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { probeCriticalUrl, probeCriticalRoutes } from './check-links-lib.mjs';

const URL = 'https://thehippiescientist.net/goals/stress/';

describe('critical route health check transient resilience', () => {
  it('retries a timeout/network error then retains the successful result', async () => {
    const fetchImpl = vi.fn()
      .mockRejectedValueOnce(new Error('socket reset'))
      .mockResolvedValueOnce({ status: 200 });
    const result = await probeCriticalUrl(URL, {
      fetchImpl, delay: async () => {},
    });
    expect(result).toMatchObject({
      url: URL, status: 200, ok: true, attempts: 2,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('does not hide or retry real missing routes', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ status: 404 });
    const result = await probeCriticalUrl(URL, {
      fetchImpl, delay: async () => {},
    });
    expect(result).toMatchObject({ status: 404, ok: false, attempts: 1 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retries 503 only within configured budget and still fails closed', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ status: 503 });
    const result = await probeCriticalUrl(URL, {
      fetchImpl, retries: 2, delay: async () => {},
    });
    expect(result).toMatchObject({ status: 503, ok: false, attempts: 3 });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('allows GET only when HEAD is unsupported, with final status authoritative', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ status: 405 })
      .mockResolvedValueOnce({ status: 200 });
    const result = await probeCriticalUrl(URL, { fetchImpl });
    expect(result).toMatchObject({ status: 200, ok: true, attempts: 1 });
    expect(fetchImpl.mock.calls.map(([, opts]) => opts.method))
      .toEqual(['HEAD', 'GET']);
  });

  it('rejects unsupported methods without masking a 410 or expired route', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ status: 410 });
    const result = await probeCriticalUrl(URL, { fetchImpl });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(410);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('bounds concurrent requests and preserves input route order', async () => {
    let active = 0;
    let maximum = 0;
    const urls = Array.from({ length: 31 }, (_, i) => URL + i);
    const responses = await probeCriticalRoutes(urls, {
      concurrency: 5,
      probe: async (url) => {
        active++;
        maximum = Math.max(maximum, active);
        await new Promise(resolve => setTimeout(resolve, url.endsWith('0') ? 9 : 1));
        active--;
        return { url, status: 200, ok: true };
      },
    });
    expect(maximum).toBeLessThanOrEqual(5);
    expect(maximum).toBeGreaterThan(1);
    expect(responses.map(x => x.url)).toEqual(urls);
  });

  it('never treats a failed or missing full-site crawl as a pass', () => {
    const workflow = readFileSync('.github/workflows/linkchecker.yml', 'utf8');
    expect(workflow).not.toMatch(/--output link-check-results\\.json\\s*\\|\\|\\s*true/);
    expect(workflow).toContain("console.error('Full-site crawl produced no results file')");
    expect(workflow).toContain("results.links.length === 0");
    expect(workflow).toContain("process.exit(1)");
  });

  it('fails on invalid retry budget rather than allowing unbounded checks', async () => {
    await expect(probeCriticalUrl(URL, { retries: 99 }))
      .rejects.toThrow('retries must be 0..4');
    await expect(probeCriticalRoutes([URL], { concurrency: 99 }))
      .rejects.toThrow('concurrency must be 1..10');
  });
});
