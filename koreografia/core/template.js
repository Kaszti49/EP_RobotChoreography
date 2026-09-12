// =====================================================================
//  template.js -- slicing an on-robot sketch into its numbered blocks
//
//  SHOW_robot1.txt is organised in banners:
//    // ============ 1. MELYIK ROBOT VAGYOK ============        (one line)
//    // =====...
//    //  2. PER ROBOT MERT ADATOK  --  ROBOTONKENT MAS          (three lines)
//    // =====...
//  A block runs from its banner to the line before the next banner.
//  Everything before block 1 is the preamble. The emitter uses this to
//  copy blocks verbatim; the tests use it to prove that it did.
// =====================================================================

const SINGLE_LINE_BANNER = /^\/\/ ?=+ (\d)\. .*=+\s*$/;
const TITLE_LINE = /^\/\/\s+(\d)\. \S/;
const RULE_LINE = /^\/\/ =+\s*$/;

/** Split text into lines, tolerating CRLF. */
export function toLines(text) {
  return text.replace(/\r\n?/g, '\n').split('\n');
}

/**
 * @returns {{ preamble: string[], blocks: Map<number, string[]>, order: number[] }}
 */
export function splitBlocks(text) {
  const lines = toLines(text);
  const starts = []; // { number, line }
  for (let i = 0; i < lines.length; i++) {
    const m1 = lines[i].match(SINGLE_LINE_BANNER);
    if (m1) { starts.push({ number: Number(m1[1]), line: i }); continue; }
    const m2 = lines[i].match(TITLE_LINE);
    if (m2 && i > 0 && RULE_LINE.test(lines[i - 1])) {
      starts.push({ number: Number(m2[1]), line: i - 1 });
    }
  }
  const blocks = new Map();
  const order = [];
  starts.forEach((s, k) => {
    const end = k + 1 < starts.length ? starts[k + 1].line : lines.length;
    blocks.set(s.number, lines.slice(s.line, end));
    order.push(s.number);
  });
  const preamble = starts.length ? lines.slice(0, starts[0].line) : lines;
  return { preamble, blocks, order };
}

/** Re-assemble from a splitBlocks() result, optionally replacing blocks. */
export function joinBlocks({ preamble, blocks, order }, replacements = new Map()) {
  const out = [...preamble];
  for (const n of order) {
    out.push(...(replacements.has(n) ? replacements.get(n) : blocks.get(n)));
  }
  return out.join('\n');
}

/** Numeric `const` assignments of a block: { NAME: numberText }. */
export function readConsts(blockLines) {
  const out = {};
  const re = /^\s*const\s+(?:float|int|unsigned long|long)\s+([A-Z_0-9]+)\s*=\s*([-+]?[\d.]+)\s*;/;
  for (const line of blockLines) {
    const m = line.match(re);
    if (m) out[m[1]] = m[2];
  }
  return out;
}
