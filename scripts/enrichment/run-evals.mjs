#!/usr/bin/env node
console.log(
  JSON.stringify(
    {
      status: 'noop-skeleton',
      message: 'Evaluation harness scaffolded.',
      todo: [
        'Load gold sets for mechanism/dosage/interactions tasks.',
        'Compute precision/recall and calibration metrics.',
      ],
    },
    null,
    2,
  ),
);
