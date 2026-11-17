/** Reliable, bounded critical-route HTTP probes with transient-only retries.
 *
 * A 404 / 410 is an actual missing route, not a flaky timeout: fail closed.
 * Timeout, connection reset, and 429/5xx are retried twice with backoff.
 * A 405/501 HEAD rejection may be checked with GET (discard body).
 */
const TRANSIENT_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const HEAD_UNSUPPORTED = new Set([405, 501]);

export async function probeCriticalUrl(url, {
  timeoutMs = 15_000,
  retries = 2,
  fetchImpl = fetch,
  delay = (ms) => new Promise(resolve => setTimeout(resolve, ms)),
} = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 120_000) {
    throw new RangeError('timeoutMs must be 100..120000');
  }
  if (!Number.isInteger(retries) || retries < 0 || retries > 4) {
    throw new RangeError('retries must be 0..4');
  }
  let last;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    let status = 0;
    let error;
    try {
      for (const method of ['HEAD', 'GET']) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const response = await fetchImpl(url, {
            method, signal: controller.signal, redirect: 'follow',
            headers: { 'User-Agent': 'HippieScientist-LinkChecker/1.1' },
          });
          status = response.status;
          // Never fetch page bodies for health checks if the server accepts GET.
          if (response.body?.cancel) await response.body.cancel();
        } finally {
          clearTimeout(timer);
        }
        if (method === 'HEAD' && HEAD_UNSUPPORTED.has(status)) continue;
        break;
      }
    } catch (err) {
      error = err?.name === 'AbortError' ? 'Request timeout' : 'Network request failed';
      status = 0;
    }
    last = {
      url, status, ok: status >= 200 && status < 400,
      attempts: attempt, ...(error ? { error } : {}),
    };
    if (last.ok || (!error && !TRANSIENT_STATUS.has(status)) || attempt > retries) {
      return last;
    }
    await delay(Math.min(2000, 300 * attempt));
  }
  return last;
}

export async function probeCriticalRoutes(urls, {
  concurrency = 5,
  probe = (url) => probeCriticalUrl(url),
} = {}) {
  if (!Array.isArray(urls) || urls.length === 0 || urls.length > 250) {
    throw new RangeError('Expected 1..250 critical route URLs');
  }
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 10) {
    throw new RangeError('concurrency must be 1..10');
  }
  const results = new Array(urls.length);
  let cursor = 0;
  await Promise.all(Array.from(
    { length: Math.min(concurrency, urls.length) },
    async () => {
      while (cursor < urls.length) {
        const i = cursor++;
        results[i] = await probe(urls[i]);
      }
    },
  ));
  return results;
}
