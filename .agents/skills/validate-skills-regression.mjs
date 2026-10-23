import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = join(root, '.agents', 'skills');
const validator = join(source, 'validate_skills.py');

function withSkills(run) {
  const temp = mkdtempSync(join(tmpdir(), 'ths-skills-validator-'));
  try {
    cpSync(source, temp, { recursive: true });
    return run(temp);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}
function validate(dir) {
  return spawnSync('python3', [validator, '--root', dir], {
    cwd: root, encoding: 'utf8', timeout: 45_000,
  });
}

test('valid skill pack has strict YAML and explicit fail-closed sections', () => {
  withSkills(dir => {
    const run = validate(dir);
    assert.equal(run.status, 0, run.stdout + run.stderr);
  });
});

test('malformed YAML flow syntax is rejected', () => {
  withSkills(dir => {
    const path = join(dir, 'ths-publishing-seo-qa', 'SKILL.md');
    writeFileSync(path, readFileSync(path, 'utf8').replace(
      'description: Audit or repair THS pages', 'description: [unfinished',
    ));
    const run = validate(dir);
    assert.notEqual(run.status, 0);
    assert.match(run.stdout, /invalid YAML/i);
  });
});

test('duplicate YAML keys are rejected', () => {
  withSkills(dir => {
    const path = join(dir, 'ths-publishing-seo-qa', 'SKILL.md');
    writeFileSync(path, readFileSync(path, 'utf8').replace(
      'name: ths-publishing-seo-qa\n',
      'name: ths-publishing-seo-qa\nname: duplicated\n',
    ));
    const run = validate(dir);
    assert.notEqual(run.status, 0);
    assert.match(run.stdout, /invalid YAML/i);
  });
});

test('incidental Unknown cannot satisfy the explicit stop-path requirement', () => {
  withSkills(dir => {
    const path = join(dir, 'ths-publishing-seo-qa', 'SKILL.md');
    const content = readFileSync(path, 'utf8').replace(
      /\n## Fail-closed action\n[\s\S]*$/,
      '\n\n## Notes\nMetrics can be Unknown.\n',
    );
    writeFileSync(path, content);
    const run = validate(dir);
    assert.notEqual(run.status, 0);
    assert.match(run.stdout, /missing explicit/i);
  });
});
