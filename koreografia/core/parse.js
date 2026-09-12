// =====================================================================
//  parse.js -- read a koreografia() body back into beats
//
//  The inverse of emit.js, used by the sign round-trip test: emit the
//  Arduino code, parse it back, re-simulate, and compare with the
//  compiler's intent. Also handy for importing a hand-written show
//  (e.g. the one in SHOW_robot1.txt).
//
//  Understands every motion call of block 5 of the template:
//    elore_cm, hatra_cm, megy_cm, balra_fok, jobbra_fok, porog_fok,
//    balra_kor, jobbra_kor
//  and the beat framing lepes_kezd() / lepes_var(ms).
// =====================================================================

import { OPS } from './config.js';

const CALL_ALIASES = Object.freeze({
  elore_cm: (v) => ({ op: OPS.FORWARD, value: v }),
  hatra_cm: (v) => ({ op: OPS.BACKWARD, value: v }),
  megy_cm: (v) => (v >= 0 ? { op: OPS.FORWARD, value: v } : { op: OPS.BACKWARD, value: -v }),
  balra_fok: (v) => ({ op: OPS.LEFT, value: v }),
  jobbra_fok: (v) => ({ op: OPS.RIGHT, value: v }),
  porog_fok: (v) => (v >= 0 ? { op: OPS.RIGHT, value: v } : { op: OPS.LEFT, value: -v }),
  balra_kor: (v) => ({ op: OPS.LEFT, value: v * 360 }),
  jobbra_kor: (v) => ({ op: OPS.RIGHT, value: v * 360 }),
});

export class ParseError extends Error {
  constructor(message) { super(message); this.name = 'ParseError'; }
}

/** The text between `void koreografia() {` and its closing brace. */
export function extractKoreografiaBody(text) {
  const src = text.replace(/\r\n?/g, '\n');
  const start = src.search(/void\s+koreografia\s*\(\s*\)\s*\{/);
  if (start < 0) throw new ParseError('koreografia() not found');
  const open = src.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(open + 1, i); }
  }
  throw new ParseError('koreografia() has no closing brace');
}

function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
}

/**
 * @returns {Array<{ duration_ms: number|null,
 *                   primitives: Array<{op, value}>,        canonical form
 *                   calls: Array<{call, arg}> }>}          raw, as written
 */
export function parseKoreografia(text) {
  const body = stripComments(extractKoreografiaBody(text));
  const re = /([A-Za-z_][A-Za-z_0-9]*)\s*\(\s*([-+]?(?:\d+\.?\d*|\.\d+))?\s*\)\s*;/g;
  const beats = [];
  let current = null;
  let m;
  while ((m = re.exec(body)) !== null) {
    const name = m[1];
    const arg = m[2] === undefined ? null : Number(m[2]);
    if (name === 'lepes_kezd') {
      current = { duration_ms: null, primitives: [], calls: [] };
      beats.push(current);
    } else if (name === 'lepes_var') {
      if (!current) throw new ParseError('lepes_var() before lepes_kezd()');
      current.duration_ms = arg;
    } else if (CALL_ALIASES[name]) {
      if (!current) throw new ParseError(`${name}() before lepes_kezd()`);
      if (arg === null) throw new ParseError(`${name}() without a numeric argument`);
      current.primitives.push(CALL_ALIASES[name](arg));
      current.calls.push({ call: name, arg });
    } else {
      throw new ParseError(`unknown call in koreografia(): ${name}()`);
    }
  }
  // remainder text must contain nothing but whitespace
  const leftover = body.replace(re, '').trim();
  if (leftover) throw new ParseError(`unparsed text in koreografia(): "${leftover.slice(0, 40)}"`);
  return beats;
}
