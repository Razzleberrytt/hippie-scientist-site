import * as React from 'react'

export const cache = typeof (React as any).cache === 'function'
  ? (React as any).cache
  : <T extends (...args: any[]) => any>(fn: T): T => fn
