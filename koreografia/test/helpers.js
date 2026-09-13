import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const repoRoot = join(root, '..');

export const readText = (...p) => readFileSync(join(root, ...p), 'utf8');
export const readJson = (...p) => JSON.parse(readText(...p));

export const loadExample = () => readJson('data', 'example-show.json');
export const loadRobots = () => readJson('data', 'robots.json');
export const loadTemplate = () => readText('templates', 'show_template.txt');
// The v5/v6 baseline sketch of robot 1 lives in RobotBaseStats/SHOW_robot1.md
// (moved there by the user on 2026-09-13), as a fenced code block.
export const loadShowRobot1 = () => {
  const md = readFileSync(join(repoRoot, 'RobotBaseStats', 'SHOW_robot1.md'), 'utf8');
  const m = md.match(/```cpp\r?\n([\s\S]*?)\r?\n```/);
  if (!m) throw new Error('RobotBaseStats/SHOW_robot1.md: no cpp code fence');
  return m[1];
};

/** Deep-clone a show so a test can break it without touching the original. */
export const clone = (o) => JSON.parse(JSON.stringify(o));

/** A minimal one-robot show for targeted tests. */
export function tinyShow(beats, start = { x: 1000, y: 1000, theta: 0 }) {
  return {
    field: { width_mm: 4000, height_mm: 3000, margin_mm: 250 },
    robots: [{ id: 1, start }],
    beats,
  };
}
