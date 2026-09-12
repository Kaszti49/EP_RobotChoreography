import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCompilerErrors } from '../tools/firmware.js';
import { parseTelemetry } from '../ui/dashboard.js';

test('parseCompilerErrors: gcc lines from arduino-cli, Windows and POSIX paths, framework vs show.ino', () => {
  const text = [
    'C:\\x\\build\\kod\\kod\\show.ino:12:5: error: \'foo\' was not declared in this scope',
    'C:\\x\\build\\kod\\kod\\kod.ino:91:17: warning: \'BluetoothSerial\' is deprecated [-Wdeprecated-declarations]',
    '/home/u/build/kod/kod/show.ino:7:1: fatal error: a.h: No such file or directory',
    'show.ino:3:2: note: in expansion of macro',
    '   12 |     foo();',
    'Error during build: exit status 1',
  ].join('\r\n');
  assert.deepEqual(parseCompilerErrors(text), [
    { file: 'show.ino', line: 12, col: 5, severity: 'error', message: '\'foo\' was not declared in this scope' },
    { file: 'kod.ino', line: 91, col: 17, severity: 'warning', message: '\'BluetoothSerial\' is deprecated [-Wdeprecated-declarations]' },
    { file: 'show.ino', line: 7, col: 1, severity: 'error', message: 'a.h: No such file or directory' },
    { file: 'show.ino', line: 3, col: 2, severity: 'note', message: 'in expansion of macro' },
  ]);
  assert.deepEqual(parseCompilerErrors(''), []);
  assert.deepEqual(parseCompilerErrors(undefined), []);
});

test('parseTelemetry: our v2 line, our v1 line, no-line marker, non-telemetry', () => {
  assert.deepEqual(parseTelemetry('E,120,-118,7650,FUT,100,200,3000,200,100,80,-80,-1500'), {
    firmware: 'ep', encBal: 120, encJobb: -118, mv: 7650, mode: 'FUT',
    sensors: [100, 200, 3000, 200, 100], pwmBal: 80, pwmJobb: -80, pos: -1500,
  });
  assert.deepEqual(parseTelemetry('E,0,0,7800,ALL'), {
    firmware: 'ep', encBal: 0, encJobb: 0, mv: 7800, mode: 'ALL', sensors: null, pwmBal: null, pwmJobb: null, pos: null,
  });
  assert.equal(parseTelemetry('E,1,2,3,ALL,1,2,3,4,5,0,0,9999').pos, null);
  assert.equal(parseTelemetry('P,keret-ep v2,TaborRobot-1,ALL'), null);
  assert.equal(parseTelemetry('STOP'), null);
  assert.equal(parseTelemetry('T'), null);          // our own T = start command echo, not telemetry
  assert.equal(parseTelemetry('T,abc,1,2,3'), null);
});

test("parseTelemetry: the camp framework's T line as seen on robot 1 (2026-09-12)", () => {
  assert.deepEqual(parseTelemetry('T,286963,1858,1861,2671,1861,2678,-1102,-1036,0,0,-666,0,8405,0'), {
    firmware: 'tabor', encBal: -1102, encJobb: -1036, mv: 8405, mode: null,
    sensors: [1858, 1861, 2671, 1861, 2678], pwmBal: 0, pwmJobb: 0, pos: -666,
  });
  assert.equal(parseTelemetry('T,287363,3024,3019,3021,3026,3024,-1102,-1036,0,0,9999,0,8385,0').pos, null);
});
