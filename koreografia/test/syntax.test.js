// =====================================================================
//  Syntax-check the emitted sketch with a desktop g++ against a stub of
//  the on-robot framework (tools/keret_stub.h, from the Robot1 bundle's
//  eszkozok/). This is NOT the Arduino toolchain -- it proves the file
//  parses as C++ with the framework's API, nothing more. Skipped when
//  g++ is not installed.
// =====================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { compileShow } from '../core/compile.js';
import { validateShow } from '../core/validate.js';
import { emitRobot } from '../core/emit.js';
import { loadExample, loadRobots, loadTemplate, root } from './helpers.js';

const haveGpp = spawnSync('g++', ['--version'], { encoding: 'utf8' }).status === 0;

test('emitted robot 1 sketch passes g++ -fsyntax-only against the framework stub', { skip: !haveGpp && 'g++ not installed' }, () => {
  const compiled = compileShow(loadExample());
  const validation = validateShow(compiled);
  const txt = emitRobot(compiled, 1, { template: loadTemplate(), robots: loadRobots(), validation });

  const dir = mkdtempSync(join(tmpdir(), 'koreografia-'));
  try {
    const cpp = join(dir, 'show.cpp');
    writeFileSync(cpp, `#include "keret_stub.h"\n${txt}`);
    const res = spawnSync('g++', [
      '-std=c++17', '-fsyntax-only', '-Wall', '-Wno-unused-variable',
      '-I', join(root, 'tools'), cpp,
    ], { encoding: 'utf8' });
    assert.equal(res.status, 0, `g++ failed:\n${res.stderr}`);
    assert.equal(res.stderr.trim(), '', `g++ warnings:\n${res.stderr}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
