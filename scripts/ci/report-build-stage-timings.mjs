#!/usr/bin/env node

const startedAt = Date.now()
const stages = []
let reportPrinted = false

function now() {
  return Date.now()
}

function durationMs(start) {
  return now() - start
}

export function createStageTimer(name) {
  const started = now()

  return {
    finish(metadata = {}) {
      const duration = durationMs(started)

      stages.push({
        name,
        duration,
        metadata,
      })

      return duration
    },
  }
}

export function printBuildTimingReport() {
  if (reportPrinted || stages.length === 0) {
    return
  }

  reportPrinted = true

  const totalDuration = durationMs(startedAt)

  const ordered = [...stages].sort((a, b) => b.duration - a.duration)

  console.log('\n=== Semantic Build Timing Report ===')

  for (const stage of ordered) {
    console.log(
      `${stage.name}: ${(stage.duration / 1000).toFixed(2)}s`,
    )
  }

  console.log(`Total tracked build time: ${(totalDuration / 1000).toFixed(2)}s`)

  const slowStages = ordered.filter((stage) => stage.duration > 10_000)

  if (slowStages.length > 0) {
    console.log('\nPotential scaling bottlenecks detected:')

    for (const stage of slowStages) {
      console.log(
        `- ${stage.name} exceeded 10s (${(stage.duration / 1000).toFixed(2)}s)`,
      )
    }
  }
}

export function getBuildTimingStages() {
  return [...stages]
}
