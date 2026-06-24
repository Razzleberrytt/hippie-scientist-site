#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const scripts = packageJson.scripts ?? {};

const defaultProductionCommands = ['prebuild', 'build', 'postbuild', 'verify:build'];
const rollbackOnlyCommands = new Set(['data:build:legacy', 'publish-data']);

const forbiddenReferences = [
  { value: 'sync-updated-datasets.mjs', reason: 'Legacy sync pipeline is rollback-only.' },
  { value: '--from-publish-input', reason: 'Publish-input mode is rollback-only.' },
  { value: 'convert-herbs-csv.ts', reason: 'Legacy CSV conversion is not allowed in default production path.' },
  { value: 'herbs_combined_updated.json', reason: 'Legacy combined dataset artifact is not allowed in default production path.' },
  { value: 'compounds_combined_updated.json', reason: 'Legacy combined dataset artifact is not allowed in default production path.' },
  { value: 'workbook-herbs.json', reason: 'Workbook export artifact is not allowed in default production path.' },
  { value: 'workbook-compounds.json', reason: 'Workbook export artifact is not allowed in default production path.' },
  { value: 'projections/monograph-runtime', reason: 'Projection runtime path is not allowed in default production path.' },
];

const npmRunPattern = /npm\s+run\s+([a-zA-Z0-9:_-]+)/g;

function getDirectScriptCalls(command) {
  const called = new Set();
  let match;
  while ((match = npmRunPattern.exec(command)) !== null) {
    called.add(match[1]);
  }
  return [...called];
}

function collectCommandsToInspect() {
  const collected = new Map();

  for (const rootCommand of defaultProductionCommands) {
    const rootScript = scripts[rootCommand];
    if (!rootScript) continue;
    collected.set(rootCommand, rootScript);

    for (const calledScript of getDirectScriptCalls(rootScript)) {
      if (scripts[calledScript]) {
        collected.set(calledScript, scripts[calledScript]);
      }
    }
  }

  return collected;
}

function findOffenders(commandsToInspect) {
  const offenders = [];

  for (const [commandName, command] of commandsToInspect.entries()) {
    if (rollbackOnlyCommands.has(commandName)) {
      continue;
    }

    for (const { value, reason } of forbiddenReferences) {
      if (command.includes(value)) {
        offenders.push({
          command: commandName,
          reference: value,
          reason,
        });
      }
    }
  }

  return offenders;
}

const commandsToInspect = collectCommandsToInspect();
const offenders = findOffenders(commandsToInspect);

if (offenders.length > 0) {
  console.error('command | offending reference | reason');
  for (const offender of offenders) {
    console.error(`${offender.command} | ${offender.reference} | ${offender.reason}`);
  }
  process.exit(1);
}

console.log('command | offending reference | reason');
console.log('PASS | none | Default production path is workbook-only (rollback references are isolated).');
