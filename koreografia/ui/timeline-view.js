// =====================================================================
//  timeline-view.js -- beats along the bottom, one lane per robot
//
//  Each beat is a column proportional to its duration. Inside a lane,
//  a robot's primitives are blocks placed by the same schedule() the
//  validator uses, so what you see is what the clearance check sampled.
// =====================================================================

import { schedule, showLengthMs } from '../core/timeline.js';
import { colorOf } from './field.js';
import { OPS } from '../core/config.js';

const SHORT = { [OPS.FORWARD]: 'E', [OPS.BACKWARD]: 'H', [OPS.LEFT]: 'B', [OPS.RIGHT]: 'J' };

export class TimelineView {
  constructor(canvas, onSeek) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onSeek = onSeek;
    this.highlightBeat = null;
    this.leftGutter = 28;
    this.headerH = 22;
    canvas.addEventListener('click', (e) => {
      if (!this.compiled) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - this.leftGutter;
      const usable = rect.width - this.leftGutter;
      if (x < 0) return;
      this.onSeek(Math.max(0, Math.min(1, x / usable)) * showLengthMs(this.compiled));
    });
  }

  fit() {
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = rect.width;
    this.h = rect.height;
    this.dpr = dpr;
    this.staticKey = null; // size changed -> redraw the static layer
  }

  /** Beats, lanes and primitive blocks change only with the show; the cursor moves every frame. */
  draw(compiled, t_ms) {
    this.compiled = compiled;
    const { ctx } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    if (!compiled) return;
    const key = `${compiled.beats.length}:${this.highlightBeat}:${this.w}x${this.h}`;
    if (this.staticCompiled !== compiled || this.staticKey !== key) {
      this.#renderStatic(compiled);
      this.staticCompiled = compiled;
      this.staticKey = key;
    }
    ctx.drawImage(this.staticLayer, 0, 0, this.w, this.h);

    const total = showLengthMs(compiled);
    const cx = this.leftGutter + (Math.min(t_ms, total) / total) * (this.w - this.leftGutter);
    ctx.strokeStyle = '#c00';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, this.h); ctx.stroke();
    ctx.lineWidth = 1;
  }

  #renderStatic(compiled) {
    if (!this.staticLayer) this.staticLayer = document.createElement('canvas');
    const layer = this.staticLayer;
    layer.width = Math.max(1, Math.floor(this.w * this.dpr));
    layer.height = Math.max(1, Math.floor(this.h * this.dpr));
    const ctx = layer.getContext('2d');
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const total = showLengthMs(compiled);
    const usable = this.w - this.leftGutter;
    const px = (ms) => this.leftGutter + (ms / total) * usable;
    const lanes = compiled.robots.length;
    const laneH = (this.h - this.headerH) / Math.max(1, lanes);

    // beat columns
    let start = 0;
    ctx.font = '10px system-ui, sans-serif';
    for (const beat of compiled.beats) {
      const x0 = px(start);
      const x1 = px(start + beat.duration_ms);
      ctx.fillStyle = beat.index === this.highlightBeat ? '#fff3c4' : (beat.index % 2 ? '#f6f6f3' : '#fdfdfb');
      if (beat.anchor) ctx.fillStyle = '#e6f2ff';
      ctx.fillRect(x0, 0, x1 - x0, this.h);
      ctx.strokeStyle = '#ddd';
      ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, this.h); ctx.stroke();
      ctx.fillStyle = '#333';
      ctx.save();
      ctx.beginPath(); ctx.rect(x0, 0, x1 - x0, this.headerH); ctx.clip();
      ctx.fillText(`${beat.index + 1} ${beat.name}${beat.anchor ? ' ⚓' : ''}`, x0 + 3, 9);
      ctx.fillStyle = '#888';
      ctx.fillText(`${beat.duration_ms} ms`, x0 + 3, 19);
      ctx.restore();

      // lanes
      compiled.robots.forEach((robot, li) => {
        const br = beat.robots[robot.id];
        const y0 = this.headerH + li * laneH + 3;
        const sched = schedule(br);
        br.primitives.forEach((p, i) => {
          const bx0 = px(start + sched[i].start_ms);
          const bx1 = px(start + Math.min(beat.duration_ms, sched[i].end_ms));
          ctx.fillStyle = colorOf(robot.id);
          ctx.globalAlpha = (p.op === OPS.LEFT || p.op === OPS.RIGHT) ? 0.45 : 0.8;
          ctx.fillRect(bx0, y0, Math.max(1, bx1 - bx0), laneH - 6);
          ctx.globalAlpha = 1;
          if (bx1 - bx0 > 18) {
            ctx.fillStyle = '#fff';
            ctx.fillText(`${SHORT[p.op]}${p.value}`, bx0 + 2, y0 + laneH / 2 + 1);
          }
        });
      });
      start += beat.duration_ms;
    }

    // lane labels
    compiled.robots.forEach((robot, li) => {
      const y = this.headerH + li * laneH;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, y, this.leftGutter - 2, laneH);
      ctx.fillStyle = colorOf(robot.id);
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText(`R${robot.id}`, 4, y + laneH / 2 + 4);
      ctx.font = '10px system-ui, sans-serif';
    });
  }
}
