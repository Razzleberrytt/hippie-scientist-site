#!/usr/bin/env node
import { bootstrapStateDb } from './_shared.mjs';

const state = bootstrapStateDb();

console.log(
  JSON.stringify(
    {
      status: 'noop-skeleton',
      message: 'Batch runner scaffolded. Wire provider calls and queue claiming in M2.',
      migrationCount: state.count,
      todo: [
        'Claim jobs from ops/state.db claim_backlog table.',
        'Call provider adapters in /providers.',
        'Write model outputs to /patches only.',
      ],
    },
    null,
    2,
  ),
);
