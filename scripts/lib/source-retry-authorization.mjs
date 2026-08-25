export function resolveSourceClassAuthorization(task, sourceClass) {
  if (!task) return { authorized: false, source: 'none', pass: null }

  if ((task.recommendedSourceClasses || []).includes(sourceClass)) {
    return { authorized: true, source: 'initial', pass: 'initial_recommended' }
  }

  for (const attempt of task.adaptiveRetryAttempts || []) {
    if (attempt.pass === 'pass_4_stop_manual_review') continue
    if ((attempt.allowedSourceClasses || []).includes(sourceClass)) {
      return { authorized: true, source: 'adaptive_retry', pass: attempt.pass }
    }
  }

  return { authorized: false, source: 'none', pass: null }
}
