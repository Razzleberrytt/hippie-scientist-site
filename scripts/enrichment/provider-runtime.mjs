const RETRYABLE_STATUS_CODES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
const RETRYABLE_ERROR_CODES = new Set(['ECONNABORTED', 'ECONNREFUSED', 'ECONNRESET', 'EAI_AGAIN', 'ENETDOWN', 'ENETUNREACH', 'ETIMEDOUT']);

function trimMessage(error) {
  if (typeof error?.message === 'string' && error.message.trim()) return error.message.trim();
  return String(error ?? 'Unknown provider runtime failure');
}

function normalizeStatusCode(error) {
  const candidates = [error?.status, error?.statusCode, error?.response?.status];
  for (const value of candidates) {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return null;
}

export function createRetryBoundary(failureClass) {
  return {
    policy: 'manual-only',
    attempts: 0,
    maxAttempts: 0,
    eligible: failureClass === 'retryable',
  };
}

export function classifyProviderFailure(error, context = {}) {
  const message = trimMessage(error);
  const code = typeof error?.code === 'string' ? error.code.toUpperCase() : null;
  const statusCode = normalizeStatusCode(error);
  const missingEnv = Array.isArray(context.missingEnv) ? context.missingEnv.filter(Boolean) : [];
  const providerId = context.providerId ?? null;

  if (missingEnv.length > 0) {
    return {
      providerId,
      class: 'auth-config',
      retryable: false,
      message,
      code,
      statusCode,
      missingEnv,
      reason: 'missing-required-env',
      retryBoundary: createRetryBoundary('auth-config'),
    };
  }

  if (statusCode === 401 || statusCode === 403 || /unauthorized|forbidden|api key|credential|token|authentication|authorization/i.test(message)) {
    return {
      providerId,
      class: 'auth-config',
      retryable: false,
      message,
      code,
      statusCode,
      missingEnv: [],
      reason: 'auth-or-config',
      retryBoundary: createRetryBoundary('auth-config'),
    };
  }

  if (statusCode !== null && RETRYABLE_STATUS_CODES.has(statusCode)) {
    return {
      providerId,
      class: 'retryable',
      retryable: true,
      message,
      code,
      statusCode,
      missingEnv: [],
      reason: 'transient-http-status',
      retryBoundary: createRetryBoundary('retryable'),
    };
  }

  if (code && RETRYABLE_ERROR_CODES.has(code)) {
    return {
      providerId,
      class: 'retryable',
      retryable: true,
      message,
      code,
      statusCode,
      missingEnv: [],
      reason: 'transient-network-error',
      retryBoundary: createRetryBoundary('retryable'),
    };
  }

  return {
    providerId,
    class: 'fatal',
    retryable: false,
    message,
    code,
    statusCode,
    missingEnv: [],
    reason: 'non-retryable-runtime',
    retryBoundary: createRetryBoundary('fatal'),
  };
}

export function evaluateProviderPreflight(provider, env = process.env) {
  const missingEnv = Array.isArray(provider?.requiredEnv)
    ? provider.requiredEnv.filter((name) => !String(env?.[name] ?? '').trim())
    : [];

  if (missingEnv.length === 0) {
    return {
      ok: true,
      providerId: provider?.id ?? null,
      missingEnv: [],
      retryBoundary: createRetryBoundary(null),
    };
  }

  return {
    ok: false,
    providerId: provider?.id ?? null,
    missingEnv,
    failure: classifyProviderFailure(new Error(`Missing required provider credentials: ${missingEnv.join(', ')}`), {
      providerId: provider?.id ?? null,
      missingEnv,
    }),
  };
}
