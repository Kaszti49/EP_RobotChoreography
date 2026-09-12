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
export const loadShowRobot1 = () => readFileSync(join(repoRoot, 'SHOW_robot1.txt'), 'utf8');

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
