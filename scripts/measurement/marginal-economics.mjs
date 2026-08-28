const UNKNOWN = 'Unknown';

const ALLOWED_DENOMINATORS = new Set([
  'engineering_hours',
  'operator_hours',
  'ci_runner_minutes',
  'assets_produced',
  'maintained_surfaces',
  'external_tool_spend',
  'incremental_throughput',
]);

const ALLOWED_OUTCOMES = new Set([
  'qualified_visits',
  'deep_evidence_interactions',
  'affiliate_outbound_actions',
  'email_signups',
  'network_reported_orders',
  'network_reported_revenue',
  'governed_distribution_outcomes',
  'merged_changes',
]);

function requireText(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required`);
  return value.trim();
}

function normalizeObservation(observation, role, allowedTypes) {
  if (!observation || typeof observation !== 'object') throw new Error(`${role} observation is required`);
  const type = requireText(observation.type, `${role}.type`);
  if (!allowedTypes.has(type)) throw new Error(`unsupported ${role} type: ${type}`);
  const source = requireText(observation.source, `${role}.source`);
  const scope = requireText(observation.scope, `${role}.scope`);
  const windowStart = requireText(observation.window?.start, `${role}.window.start`);
  const windowEnd = requireText(observation.window?.end, `${role}.window.end`);
  const definition = requireText(observation.definition, `${role}.definition`);
  const confidence = requireText(observation.confidence, `${role}.confidence`);

  if (observation.value === UNKNOWN || observation.value == null) {
    return { type, value: UNKNOWN, source, scope, window: { start: windowStart, end: windowEnd }, definition, confidence };
  }
  if (typeof observation.value !== 'number' || !Number.isFinite(observation.value) || observation.value < 0) {
    throw new Error(`${role}.value must be a non-negative finite number or Unknown`);
  }
  return { type, value: observation.value, source, scope, window: { start: windowStart, end: windowEnd }, definition, confidence };
}

export function deriveEfficiencyRatio({ id, numerator, denominator, attributionBoundary, estimate = false }) {
  const normalizedNumerator = normalizeObservation(numerator, 'numerator', ALLOWED_OUTCOMES);
  const normalizedDenominator = normalizeObservation(denominator, 'denominator', ALLOWED_DENOMINATORS);
  const ratioId = requireText(id, 'id');
  const boundary = requireText(attributionBoundary, 'attributionBoundary');

  if (normalizedNumerator.scope !== normalizedDenominator.scope) {
    throw new Error('numerator and denominator scopes must match');
  }
  if (normalizedNumerator.window.start !== normalizedDenominator.window.start || normalizedNumerator.window.end !== normalizedDenominator.window.end) {
    throw new Error('numerator and denominator observation windows must match');
  }

  const unknown = normalizedNumerator.value === UNKNOWN || normalizedDenominator.value === UNKNOWN;
  const zeroDenominator = normalizedDenominator.value === 0;
  const value = unknown || zeroDenominator ? UNKNOWN : normalizedNumerator.value / normalizedDenominator.value;

  return Object.freeze({
    schemaVersion: '1.0.0',
    id: ratioId,
    numerator: normalizedNumerator,
    denominator: normalizedDenominator,
    value,
    unit: `${normalizedNumerator.type}_per_${normalizedDenominator.type}`,
    attributionBoundary: boundary,
    estimate: Boolean(estimate),
    scaleSignal: value === UNKNOWN ? 'WAIT' : 'OBSERVED',
  });
}

export function evaluateMarginalScale({ current, prior, deteriorationThreshold = 0.15, qualityDebtRising = false, attributionReliable = true }) {
  if (!current || !prior) throw new Error('current and prior ratios are required');
  if (current.value === UNKNOWN || prior.value === UNKNOWN || prior.value === 0) {
    return { decision: 'WAIT', reason: 'insufficient comparable observations' };
  }
  const change = (current.value - prior.value) / prior.value;
  if (!attributionReliable) return { decision: 'STOP_OR_PIVOT', reason: 'attribution unreliable', change };
  if (qualityDebtRising) return { decision: 'STOP_OR_PIVOT', reason: 'quality or maintenance debt rising', change };
  if (change <= -Math.abs(deteriorationThreshold)) {
    return { decision: 'STOP_OR_PIVOT', reason: 'marginal qualified outcome deteriorated materially', change };
  }
  return { decision: 'ELIGIBLE_TO_SCALE', reason: 'marginal efficiency sustained or improved', change };
}

export { UNKNOWN, ALLOWED_DENOMINATORS, ALLOWED_OUTCOMES };
