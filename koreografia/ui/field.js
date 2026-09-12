// =====================================================================
//  field.js -- top-down canvas view of the field
//
//  Screen mapping: world +X to the right, world +Y UP on screen (the
//  audience is at the bottom edge). Every robot is drawn as a heading
//  triangle inside its body circle, with the uncertainty disc
//  (r + body radius) around it -- the disc is the point of the tool.
// =====================================================================

import { locate, stateAt, schedule } from '../core/timeline.js';
import { interpolatePrimitive } from '../core/pose.js';

export const ROBOT_COLORS = ['#d33', '#e58a00', '#2a9d2a', '#1f5fbf', '#8a3ab9', '#0a8a8a'];
export const colorOf = (robotId) => ROBOT_COLORS[(robotId - 1) % ROBOT_COLORS.length];

export class FieldView {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.highlight = null; // { beat, robots: Set }
  }

  fit() {
    const box = this.canvas.parentElement.getBoundingClientRect();
    // cap the backing store: a 4K display at 2x would otherwise paint 8M pixels per frame
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    this.canvas.width = Math.max(1, Math.floor(box.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(box.height * dpr));
    this.canvas.style.width = `${box.width}px`;
    this.canvas.style.height = `${box.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = box.width;
    this.h = box.height;
  }

  /** world -> screen */
  map(field) {
    const pad = 24;
    const sx = (this.w - 2 * pad) / field.width_mm;
    const sy = (this.h - 2 * pad) / field.height_mm;
    const s = Math.min(sx, sy);
    const ox = (this.w - field.width_mm * s) / 2;
    const oy = (this.h - field.height_mm * s) / 2;
    return {
      s,
      x: (wx) => ox + wx * s,
      y: (wy) => this.h - oy - wy * s,
    };
  }

  draw(compiled, t_ms) {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    if (!compiled) return;
    const { field, config } = compiled;
    const m = this.map(field);

    // field and margin
    ctx.fillStyle = '#fbfbf9';
    ctx.fillRect(m.x(0), m.y(field.height_mm), field.width_mm * m.s, field.height_mm * m.s);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(m.x(0), m.y(field.height_mm), field.width_mm * m.s, field.height_mm * m.s);
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#b55';
    ctx.lineWidth = 1;
    const mg = field.margin_mm;
    ctx.strokeRect(m.x(mg), m.y(field.height_mm - mg), (field.width_mm - 2 * mg) * m.s, (field.height_mm - 2 * mg) * m.s);
    ctx.setLineDash([]);
    ctx.fillStyle = '#888';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KOZONSEG', m.x(field.width_mm / 2), m.y(0) + 16);
    ctx.textAlign = 'left';
    ctx.fillText(`${field.width_mm} x ${field.height_mm} mm, margo ${mg} mm`, m.x(0), m.y(field.height_mm) - 6);

    const loc = locate(compiled, t_ms);
    if (!loc) return;
    const { beat, t_in_beat } = loc;

    for (const robot of compiled.robots) {
      const br = beat.robots[robot.id];
      const color = colorOf(robot.id);
      const st = stateAt(br, t_in_beat);

      // planned path of the current beat (faint) and the part already driven (solid)
      this.#drawTrail(br, t_in_beat, m, color);

      // uncertainty disc
      const R = (st.uncertainty.r + config.robot_radius_mm) * m.s;
      ctx.beginPath();
      ctx.arc(m.x(st.pose.x), m.y(st.pose.y), R, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(color, 0.12);
      ctx.fill();
      ctx.strokeStyle = hexToRgba(color, 0.7);
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // body
      const bodyR = config.robot_radius_mm * m.s;
      ctx.beginPath();
      ctx.arc(m.x(st.pose.x), m.y(st.pose.y), bodyR, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(color, 0.25);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = this.#isHighlighted(beat.index, robot.id) ? 3 : 1.5;
      ctx.stroke();

      // heading triangle
      const th = st.pose.theta * Math.PI / 180;
      const cx = m.x(st.pose.x);
      const cy = m.y(st.pose.y);
      const tip = [cx + Math.cos(th) * bodyR, cy - Math.sin(th) * bodyR];
      const l = [cx + Math.cos(th + 2.5) * bodyR * 0.7, cy - Math.sin(th + 2.5) * bodyR * 0.7];
      const r = [cx + Math.cos(th - 2.5) * bodyR * 0.7, cy - Math.sin(th - 2.5) * bodyR * 0.7];
      ctx.beginPath();
      ctx.moveTo(...tip); ctx.lineTo(...l); ctx.lineTo(...r); ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // label
      ctx.fillStyle = '#222';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(robot.id), cx, cy - bodyR - 4);
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillStyle = '#555';
      ctx.fillText(`r=${Math.round(st.uncertainty.r)} s=${st.uncertainty.sigma_theta.toFixed(1)}°`, cx, cy + bodyR + 12);
      ctx.textAlign = 'left';
    }
  }

  #isHighlighted(beatIndex, robotId) {
    return this.highlight && this.highlight.beat === beatIndex && this.highlight.robots.has(robotId);
  }

  #drawTrail(br, t_in_beat, m, color) {
    const { ctx } = this;
    if (!br.primitives.length) return;
    // planned: whole beat path
    ctx.beginPath();
    ctx.moveTo(m.x(br.poseBefore.x), m.y(br.poseBefore.y));
    for (const p of br.primitives) ctx.lineTo(m.x(p.poseAfter.x), m.y(p.poseAfter.y));
    ctx.strokeStyle = hexToRgba(color, 0.35);
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    // driven so far
    const sched = schedule(br);
    ctx.beginPath();
    ctx.moveTo(m.x(br.poseBefore.x), m.y(br.poseBefore.y));
    for (let i = 0; i < br.primitives.length; i++) {
      const p = br.primitives[i];
      const s = sched[i];
      if (t_in_beat >= s.end_ms) { ctx.lineTo(m.x(p.poseAfter.x), m.y(p.poseAfter.y)); continue; }
      if (t_in_beat > s.start_ms) {
        const f = (t_in_beat - s.start_ms) / (s.end_ms - s.start_ms);
        const pose = interpolatePrimitive(p.poseBefore, p, f);
        ctx.lineTo(m.x(pose.x), m.y(pose.y));
      }
      break;
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function hexToRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = hex.length === 4
    ? [((n >> 8) & 15) * 17, ((n >> 4) & 15) * 17, (n & 15) * 17]
    : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return `rgba(${r},${g},${b},${a})`;
}
