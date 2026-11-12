/* ------------------------------------------------------------------
   CursorEngine: ONE canvas, ONE requestAnimationFrame loop.
   Agents are plain pooled objects (never React components / state).
   Scroll "deliveries" (registered by storyController) pull agents to
   the exact edge of a reveal; everyone else roams in formations and
   reacts to the visitor's real pointer. Cursors never dispatch events.
------------------------------------------------------------------- */
const TAU = Math.PI * 2;
const COLORS = ["#3478F6", "#8758FF", "#FF5A70", "#13B89A", "#FF963B", "#E84CB8", "#28BCE8", "#A5C940", "#6741D9", "#F26B38"];
const LABELS = ["UI Designer", "Frontend Agent", "AI Engineer", "Motion Agent", "Research Agent", "Code Architect", "Creative Director", "Vision Agent", "Backend Agent", "Product Strategist"];
const ARROW = typeof Path2D !== "undefined"
  ? new Path2D("M1 1L1 20L6.2 15.1L10.1 22.5L13.2 20.9L9.3 13.7L17.1 13.4Z") : null;
const HIST = 96;               // 1.6 s of position history @60Hz for leader/follower delay
const HEADER_SAFE = 84;        // idle agents stay below the sticky header
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const seeded = (n) => { const x = Math.sin((n + 1) * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const rr = (n, a, b) => a + seeded(n) * (b - a);

const FORMATION_BY_SCENE = {
  hero: "orbit", about: "wave", skills: "grid", projects: "drift", dsa: "wave",
  achievements: "drift", journey: "drift", goals: "drift", contact: "converge",
};

export function pickCount(width, cores = 8, memory = 8) {
  let n = width >= 1440 ? 150 : width >= 1024 ? 100 : width >= 700 ? 50 : 24;
  if (cores <= 4) n = Math.min(n, 80);
  if (memory <= 4) n = Math.min(n, 64);
  return n;
}

export class CursorEngine {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.coarse = window.matchMedia("(pointer: coarse)").matches;
    this.agents = [];
    this.jobs = new Map();
    this.deliveries = [];
    this.ripples = Array.from({ length: 12 }, () => ({ a: false, x: 0, y: 0, r: 0, l: 0, c: "#fff" }));
    this.pointer = { x: -999, y: -999, vx: 0, vy: 0, active: false, last: 0, energy: 0, still: 0 };
    this.scene = "hero";
    this.formation = "orbit";
    this.formationSince = 0;
    this.anchorFn = null;
    this.scrollVel = 0;
    this.w = 0; this.h = 0; this.dpr = 1;
    this.maxCount = 0; this.targetCount = 0; this.slow = 0; this.frameMs = 16.7;
    this.raf = 0; this.last = 0; this.frame = 0; this.running = false;
    this.labelStart = 0;
    this.t0 = performance.now();
    this.grid = { cell: 36, cols: 0, rows: 0, head: null, next: null };
    this.tmp = { x: 0, y: 0 };
    this.lines = 0;
    this._burstTimers = [];
    this.bind();
    this.resize(true);
  }

  /* ---------------- lifecycle ---------------- */
  bind() {
    this.onMove = (e) => {
      const p = this.pointer, now = performance.now();
      if (p.active) { p.vx = e.clientX - p.x; p.vy = e.clientY - p.y; }
      p.x = e.clientX; p.y = e.clientY; p.active = true; p.last = now;
    };
    this.onLeave = () => { this.pointer.active = false; };
    this.onDown = (e) => {
      this.onMove(e);
      this.ripple(e.clientX, e.clientY, "#FF5A70");
    };
    this.onVis = () => {
      if (document.hidden) { this.running = false; cancelAnimationFrame(this.raf); this.raf = 0; }
      else if (!this.running) { this.last = 0; this.start(); }
    };
    this.onResize = () => {
      if (this._rz) return;
      this._rz = requestAnimationFrame(() => { this._rz = 0; this.resize(false); });
    };
    window.addEventListener("pointermove", this.onMove, { passive: true });
    window.addEventListener("pointerdown", this.onDown, { passive: true });
    document.addEventListener("pointerleave", this.onLeave);
    window.addEventListener("blur", this.onLeave);
    document.addEventListener("visibilitychange", this.onVis);
    window.addEventListener("resize", this.onResize, { passive: true });
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.raf = requestAnimationFrame((t) => this.tick(t));
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf); cancelAnimationFrame(this._rz);
    this._burstTimers.forEach(clearTimeout);
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerdown", this.onDown);
    document.removeEventListener("pointerleave", this.onLeave);
    window.removeEventListener("blur", this.onLeave);
    document.removeEventListener("visibilitychange", this.onVis);
    window.removeEventListener("resize", this.onResize);
    this.agents.length = 0; this.jobs.clear(); this.deliveries = [];
    this.ctx.clearRect(0, 0, this.c.width, this.c.height);
  }

  resize(first) {
    const ow = this.w, oh = this.h;
    this.w = window.innerWidth; this.h = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, this.coarse ? 1.25 : 1.5);
    this.c.width = Math.round(this.w * this.dpr); this.c.height = Math.round(this.h * this.dpr);
    this.c.style.width = this.w + "px"; this.c.style.height = this.h + "px";
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const g = this.grid;
    g.cols = Math.ceil(this.w / g.cell) + 1; g.rows = Math.ceil(this.h / g.cell) + 1;
    g.head = new Int16Array(g.cols * g.rows);
    const count = pickCount(this.w, navigator.hardwareConcurrency || 8, navigator.deviceMemory || 8);
    if (first || !this.agents.length) {
      this.maxCount = count; this.targetCount = count;
      this.agents = Array.from({ length: count }, (_, i) => this.makeAgent(i));
      g.next = new Int16Array(count);
    } else {
      // keep agents (no teleport / re-seeding): rescale positions and grow/shrink the pool
      const sx = ow ? this.w / ow : 1, sy = oh ? this.h / oh : 1;
      for (const a of this.agents) { a.x *= sx; a.y *= sy; }
      if (count > this.agents.length) for (let i = this.agents.length; i < count; i++) this.agents.push(this.makeAgent(i));
      this.maxCount = count; this.targetCount = Math.min(this.targetCount, count) || count;
      g.next = new Int16Array(this.agents.length);
    }
  }

  makeAgent(i) {
    const w = this.w, h = this.h, side = i % 4, t = seeded(i * 5 + 1);
    const lead = i < 14;
    return {
      i, lead,
      // spawn just outside the viewport so the swarm flies IN on first paint
      x: side === 0 ? -30 - t * 140 : side === 1 ? w + 30 + t * 140 : t * w,
      y: side === 2 ? -30 - t * 140 : side === 3 ? h + 30 + t * 140 : t * h,
      vx: 0, vy: 0,
      color: COLORS[i % COLORS.length],
      size: lead ? rr(i * 17, 20, 25) : rr(i * 19, 14, 19),
      baseAlpha: rr(i * 23, 0.62, 0.92),
      alpha: 0, vis: 0,
      maxSpeed: rr(i * 3, 120, 250) * (lead ? 1.25 : 1),   // px/s, independent per agent
      force: rr(i * 5, 240, 520),                            // px/s², independent acceleration
      wander: rr(i * 7, 10, 38),
      f1: rr(i * 11, 0.22, 0.7), f2: rr(i * 13, 0.2, 0.55),
      phase: rr(i * 29, 0, TAU),
      job: null, slot: 0,
      labelIdx: i % LABELS.length,
      hx: new Float32Array(HIST), hy: new Float32Array(HIST), hi: 0, hAcc: 0,
    };
  }

  /* ---------------- public api used by the story ---------------- */
  setDeliveries(list) { this.deliveries = list; this.releaseAll(); }
  setScroll(v) { this.scrollVel = v; }
  setScene(name, anchorFn) {
    this.scene = name; this.anchorFn = anchorFn || null;
    const f = FORMATION_BY_SCENE[name] || "drift";
    if (f !== this.formation && performance.now() - this.formationSince > 1800) {
      this.formation = f; this.formationSince = performance.now();
    }
  }
  ripple(x, y, color) {
    const r = this.ripples.find((q) => !q.a) || this.ripples[0];
    r.a = true; r.x = x; r.y = y; r.r = 2; r.l = 1; r.c = color || "#FF5A70";
  }
  burst(x, y) {
    [0, 140, 300].forEach((d, k) => this._burstTimers.push(setTimeout(() => this.ripple(x, y, COLORS[(k * 3) % COLORS.length]), d)));
  }
  stats() {
    return {
      count: this.targetCount, max: this.maxCount, jobs: this.jobs.size, scene: this.scene, formation: this.formation,
      frameMs: +this.frameMs.toFixed(1), costMs: +(this.costMs || 0).toFixed(2),
      jobAgents: this.agents.filter((a) => a.job).length,
      nearPointer: this.agents.filter((a) => Math.hypot(a.x - this.pointer.x, a.y - this.pointer.y) < 140 && a.vis > 0.5).length,
      onScreen: this.agents.filter((a) => a.vis > 0.5 && a.x > 0 && a.x < this.w && a.y > 0 && a.y < this.h).length,
      jobList: [...this.jobs.values()].map((j) => ({ kind: j.d.kind, p: +(j.d._p || 0).toFixed(2), n: j.agents.length, state: j.d._state })),
    };
  }

  /* ---------------- job allocation ---------------- */
  releaseAll() {
    for (const j of this.jobs.values()) for (const a of j.agents) { a.job = null; a.slot = 0; }
    this.jobs.clear();
  }

  anchor() {
    if (this.anchorFn) { const p = this.anchorFn(); if (p) return p; }
    return { x: this.w * 0.5, y: this.h * 0.55 };
  }

  refreshJobs() {
    const vh = this.h;
    const budget = Math.floor(this.targetCount * 0.7);
    const working = [], pending = [];
    for (const d of this.deliveries) {
      const p = d.getP(); d._p = p;
      if (p >= 0.999) { d._state = 2; continue; }
      const r = d.el.getBoundingClientRect(); d._r = r;
      const onScreen = r.bottom > 0 && r.top < vh;
      if (p > 0.001) {
        if (r.bottom > -60 && r.top < vh + 60) { d._state = 1; d._pri = Math.abs((r.top + r.bottom) / 2 - vh * 0.5); working.push(d); }
        else d._state = 3;
      } else if (d.intro ? onScreen : (r.top < vh + 380 && r.top > vh * 0.35)) {
        d._state = 0; d._pri = r.top; pending.push(d);
      } else d._state = 3;
    }
    working.sort((a, b) => a._pri - b._pri);
    pending.sort((a, b) => a._pri - b._pri);
    const want = []; let used = 0;
    const scaled = (d) => Math.max(2, Math.round(d.agents * Math.min(1, this.targetCount / 100 + 0.25)));
    for (const d of working) { const n = scaled(d); if (used + n > budget) continue; want.push([d, n]); used += n; }
    for (const d of pending.slice(0, 2)) { if (used + 3 > budget) break; want.push([d, 3]); used += 3; }

    const keep = new Set(want.map((w) => w[0].id));
    for (const [id, j] of this.jobs) {
      if (!keep.has(id)) { for (const a of j.agents) { a.job = null; a.slot = 0; } this.jobs.delete(id); }
    }
    const pe = this.pointer.energy;
    for (const [d, need] of want) {
      let j = this.jobs.get(d.id);
      if (!j) { j = { d, agents: [] }; this.jobs.set(d.id, j); }
      j.d = d;
      j.agents = j.agents.filter((a) => { const ok = a.i < this.targetCount; if (!ok) { a.job = null; } return ok; });
      const r = d._r || d.el.getBoundingClientRect();
      const ax = d._state === 0 ? r.left : r.left + r.width / 2, ay = d._state === 0 ? r.top : r.top + r.height / 2;
      while (j.agents.length < need) {
        let best = null, bd = 1e12;
        for (const a of this.agents) {
          if (a.job || a.vis < 0.5 || a.i >= this.targetCount) continue;
          if (pe > 0.3 && a.i % 9 < 3) continue;      // keep a few agents free to play with the real pointer
          const dd = (a.x - ax) ** 2 + (a.y - ay) ** 2;
          if (dd < bd) { bd = dd; best = a; }
        }
        if (!best) break;
        best.job = j; j.agents.push(best);
      }
      j.agents.forEach((a, s) => { a.slot = s; });
    }
  }

  /* ---------------- targets ---------------- */
  ambient(a, t, out) {
    const w = this.w, h = this.h, n = this.targetCount, i = a.i;
    let tx, ty;
    switch (this.formation) {
      case "orbit": {
        const c = this.anchor();
        const ring = (0.16 + ((i % 7) / 7) * 0.3) * Math.min(w, h) * 1.1;
        const ang = a.phase + t * (0.12 + (i % 3) * 0.03) * (i % 2 ? 1 : -1);
        tx = c.x + Math.cos(ang) * ring * 1.25; ty = c.y + Math.sin(ang) * ring * 0.8; break;
      }
      case "wave": {
        const u = i / n;
        tx = u * w; ty = h * 0.5 + Math.sin(u * TAU * 1.4 + t * 0.7) * h * 0.24 + ((i % 5) - 2) * 18; break;
      }
      case "grid": {
        const cols = Math.max(6, Math.round(Math.sqrt(n * w / h * 1.4)));
        const rows = Math.ceil(n / cols);
        tx = w * 0.08 + (i % cols) * (w * 0.84 / (cols - 1));
        ty = h * 0.55 + Math.floor(i / cols) * Math.min(38, (h * 0.38) / rows); break;
      }
      case "converge": {
        const c = this.anchor(), ang = a.phase + t * 0.35, rad = 70 + (i % 6) * 30;
        tx = c.x + Math.cos(ang) * rad * 1.5; ty = c.y + Math.sin(ang) * rad * 0.45; break;
      }
      default:
        tx = w * (0.5 + 0.46 * Math.sin(t * a.f1 + a.phase));
        ty = h * (0.5 + 0.4 * Math.sin(t * a.f2 + a.phase * 1.7));
    }
    tx += Math.sin(t * a.f1 * 2 + a.phase) * a.wander;
    ty += Math.cos(t * a.f2 * 2 + a.phase) * a.wander;
    ty += clamp(-this.scrollVel * 0.03, -70, 70) * (0.4 + (i % 5) * 0.15);   // scroll parallax
    out.x = clamp(tx, 12, w - 12); out.y = clamp(ty, HEADER_SAFE, h - 12);
  }

  trail(leader, slot, out, extra) {
    const idx = (leader.hi - 1 - (5 + slot * 4) + HIST * 4) % HIST;
    const ang = slot * 2.4 + leader.phase;
    out.x = leader.hx[idx] + Math.cos(ang) * (6 + slot * 2.2);
    out.y = leader.hy[idx] + Math.sin(ang) * (6 + slot * 2.2) + (extra || 0);
  }

  jobTarget(j, a, t, out) {
    const d = j.d, r = d._r, s = a.slot, n = j.agents.length, lead = j.agents[0];
    if (d._state === 0) {                              // scout: arrive BEFORE the reveal starts
      if (s === 0) { out.x = r.left + 14; out.y = clamp(r.top - 6, HEADER_SAFE, this.h - 30); }
      else { const g = t * 1.2 + s * 2.1; out.x = lead.x + Math.cos(g) * 26; out.y = lead.y + Math.sin(g) * 26; }
      return;
    }
    const p = d._p = d.getP();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let fx, fy;
    switch (d.kind) {
      case "wipe": fx = r.left + p * r.width; fy = cy + Math.sin(t * 3) * r.height * 0.2; break;
      case "lines": {
        const L = clamp(Math.round(r.height / 28), 2, 14);
        fy = r.top + p * r.height; fx = r.left + r.width * (0.5 + 0.44 * Math.sin(p * L * Math.PI)); break;
      }
      case "mask": fy = r.bottom - p * r.height; fx = r.left + r.width * (0.5 + 0.42 * Math.sin(p * 7 + t)); break;
      case "ring": {
        const R = p * 0.75 * Math.sqrt((r.width * r.width + r.height * r.height) / 2), g = p * TAU * 1.6 - Math.PI / 2;
        fx = cx + Math.cos(g) * R; fy = cy + Math.sin(g) * R; break;
      }
      case "line": fx = r.left + 13.5; fy = r.top + 16 + p * Math.max(0, r.height - 32); break;
      default: fx = cx; fy = cy;                        // finale
    }
    if (s === 0) { out.x = fx; out.y = fy; return; }
    switch (d.kind) {
      case "mask": out.x = r.left + r.width * (s / n); out.y = fy + Math.sin(t * 2 + s) * 6; break;
      case "ring": {
        const R = p * 0.75 * Math.sqrt((r.width * r.width + r.height * r.height) / 2), g = (s / n) * TAU + p * 2.5;
        out.x = cx + Math.cos(g) * R; out.y = cy + Math.sin(g) * R; break;
      }
      case "finale": {
        const g = t * 0.5 + (s / n) * TAU, rad = r.height * 0.9 + (s % 4) * 24;
        out.x = cx + Math.cos(g) * (r.width * 0.55 + (s % 3) * 18); out.y = cy + Math.sin(g) * rad * 0.7; break;
      }
      default: this.trail(lead, s, out, 4);
    }
  }

  /* ---------------- physics ---------------- */
  steer(a, tx, ty, dt, scale, arrive) {
    const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy) || 1e-6;
    const ms = Math.min(a.maxSpeed * scale, 2000);
    const sp = d < arrive ? ms * (d / arrive) : ms;
    let ax = (dx / d) * sp - a.vx, ay = (dy / d) * sp - a.vy;
    const lim = a.force * scale * dt, m = Math.hypot(ax, ay);
    if (m > lim) { ax *= lim / m; ay *= lim / m; }
    a.vx += ax; a.vy += ay;
  }

  buildGrid() {
    const g = this.grid; g.head.fill(-1);
    for (const a of this.agents) {
      if (a.vis < 0.02) continue;
      const cx = clamp((a.x / g.cell) | 0, 0, g.cols - 1), cy = clamp((a.y / g.cell) | 0, 0, g.rows - 1);
      const k = cy * g.cols + cx; g.next[a.i] = g.head[k]; g.head[k] = a.i;
    }
  }
  neighbors(a, rad, fn) {
    const g = this.grid, cr = Math.ceil(rad / g.cell);
    const cx = clamp((a.x / g.cell) | 0, 0, g.cols - 1), cy = clamp((a.y / g.cell) | 0, 0, g.rows - 1);
    for (let y = Math.max(0, cy - cr); y <= Math.min(g.rows - 1, cy + cr); y++)
      for (let x = Math.max(0, cx - cr); x <= Math.min(g.cols - 1, cx + cr); x++)
        for (let k = g.head[y * g.cols + x]; k !== -1; k = g.next[k]) if (k !== a.i) fn(this.agents[k]);
  }

  /* ---------------- frame ---------------- */
  tick(now, manual) {
    if (!this.running && !manual) return;
    if (!manual) this.raf = requestAnimationFrame((t) => this.tick(t));
    const cost0 = performance.now();
    const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 0.016;   // sub-100ms clamp: slow devices stay close to real time
    this.last = now; this.frame++;
    const t = now * 0.001;

    // adaptive density: drop 20% of agents (they fade, never pop) if the device can't keep up
    this.frameMs = lerp(this.frameMs, dt * 1000, 0.05);
    if (this.frameMs > 28) this.slow++; else this.slow = Math.max(0, this.slow - 1);
    if (this.slow > 100 && this.targetCount > Math.max(16, this.maxCount * 0.4)) {
      this.targetCount = Math.floor(this.targetCount * 0.8); this.slow = 0;
    }
    const p = this.pointer;
    const recent = p.active && now - p.last < 1800;
    p.energy += ((recent ? 1 : 0) - p.energy) * Math.min(1, dt * 2.5);
    p.still = now - p.last > 650 ? 1 : 0;
    if (this.frame % 6 === 0) this.refreshJobs();
    for (const j of this.jobs.values()) { j.d._r = j.d.el.getBoundingClientRect(); }
    this.buildGrid();

    const ctx = this.ctx, w = this.w, h = this.h, tmp = this.tmp, ptr = { x: 0, y: 0 };
    ctx.clearRect(0, 0, w, h);          // full clear each frame: no ghost copies; trails are drawn from history below

    if (!this.labelStart) this.labelStart = now;
    const labelPhase = Math.floor((now - this.labelStart) / 2800) % LABELS.length;
    const labelOn = (now - this.labelStart) % 2800 < 1900;

    for (const a of this.agents) {
      a.vis += ((a.i < this.targetCount ? 1 : 0) - a.vis) * Math.min(1, dt * 2.5);
      if (a.vis < 0.02) continue;
      const job = a.job;

      if (job) {
        this.jobTarget(job, a, t, tmp);
        tmp.x = clamp(tmp.x, 10, w - 10); tmp.y = clamp(tmp.y, HEADER_SAFE - 20, h - 10);
        const dist = Math.hypot(tmp.x - a.x, tmp.y - a.y);
        const scale = a.slot === 0 ? 1 + Math.min(6, dist / 80) : 1.4 + Math.min(3, dist / 120);
        this.steer(a, tmp.x, tmp.y, dt, scale, a.slot === 0 ? 40 : 60);
      } else {
        this.ambient(a, t, tmp);
        const role = a.i % 9;
        if (p.energy > 0.02 && p.x > -900) {
          if (role < 3) {
            const g = t * (role === 1 ? 1.9 : 1.1) + a.phase;
            const rad = role === 0 ? 26 + (a.i % 4) * 10 : role === 1 ? 64 + (a.i % 5) * 13 : (p.still ? 38 : 90) + (a.i % 3) * 10;
            ptr.x = p.x + Math.cos(g) * rad; ptr.y = p.y + Math.sin(g) * rad;
            tmp.x = lerp(tmp.x, ptr.x, p.energy); tmp.y = lerp(tmp.y, ptr.y, p.energy);
          }
        }
        this.steer(a, tmp.x, tmp.y, dt, now - this.t0 < 3200 ? 2.2 : 1, 90);   // faster first entrance, then calm
        if (p.active && p.energy > 0.05 && role >= 3) {            // everyone else politely keeps clear
          const dx = a.x - p.x, dy = a.y - p.y, d2 = dx * dx + dy * dy;
          if (d2 < 90 * 90 && d2 > 1) { const d = Math.sqrt(d2), f = (1 - d / 90) * 520 * dt * p.energy; a.vx += dx / d * f; a.vy += dy / d * f; }
        }
      }
      // separation (spatial grid): avoids pile-ups
      const sep = job ? 0.35 : 1;
      this.neighbors(a, 16, (b) => {
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < 256 && d2 > 0.01) { const d = Math.sqrt(d2), f = (1 - d / 16) * 260 * dt * sep; a.vx += dx / d * f; a.vy += dy / d * f; }
      });
      const damp = Math.pow(0.18, dt);                               // inertia: ~keeps momentum, bleeds drift
      a.vx *= lerp(1, damp, 0.35); a.vy *= lerp(1, damp, 0.35);
      a.x = clamp(a.x + a.vx * dt, -90, w + 90); a.y = clamp(a.y + a.vy * dt, -90, h + 90);

      a.hAcc += dt;                                                  // fixed-rate history for follower delay
      while (a.hAcc >= 1 / 60) { a.hAcc -= 1 / 60; a.hx[a.hi] = a.x; a.hy[a.hi] = a.y; a.hi = (a.hi + 1) % HIST; }
      a.alpha += ((job ? 1 : a.baseAlpha) - a.alpha) * Math.min(1, dt * 4);
    }

    // neural connections: skills scene and the contact finale
    const neural = this.scene === "skills" || [...this.jobs.values()].some((j) => j.d.kind === "finale" && j.d._state === 1);
    if (neural) this.drawConnections(ctx);

    for (const a of this.agents) {
      if (a.vis < 0.02) continue;
      if ((a.lead || a.job) && Math.hypot(a.vx, a.vy) > 25) {          // soft motion trail from position history (selected agents only)
        ctx.globalAlpha = 0.32 * a.vis; ctx.strokeStyle = a.color; ctx.lineWidth = 1.4; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(a.x, a.y);
        for (let k = 1; k <= 8; k++) { const ix = (a.hi - 1 - k * 2 + HIST * 4) % HIST; ctx.lineTo(a.hx[ix], a.hy[ix]); }
        ctx.stroke();
      }
      this.draw(a, now, labelOn && a.lead && a.labelIdx === labelPhase && !a.job);
    }
    for (const r of this.ripples) {
      if (!r.a) continue;
      r.r += 190 * dt; r.l *= Math.pow(0.05, dt);
      if (r.l < 0.03) { r.a = false; continue; }
      ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, TAU);
      ctx.strokeStyle = r.c; ctx.globalAlpha = r.l * 0.6; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    this.costMs = lerp(this.costMs || 0, performance.now() - cost0, 0.05);   // CPU time spent inside our frame
    // finale: cinematic visual "click" once the convergence completes (never a real click)
    for (const j of this.jobs.values()) {
      const d = j.d;
      if (d.kind === "finale") {
        if (d._p > 0.96 && !d._burst) { d._burst = true; const r = d._r; this.burst(r.left + r.width / 2, r.top + r.height / 2); }
        else if (d._p < 0.85) d._burst = false;
      }
    }
  }

  drawConnections(ctx) {
    let drawn = 0; ctx.lineWidth = 0.7;
    for (const a of this.agents) {
      if (a.vis < 0.3 || drawn > 160) continue;
      this.neighbors(a, 110, (b) => {
        if (b.i < a.i || b.vis < 0.3 || drawn > 160) return;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110) { ctx.globalAlpha = (1 - d / 110) * 0.2; ctx.strokeStyle = a.color; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); drawn++; }
      });
    }
    ctx.globalAlpha = 1;
  }

  draw(a, now, label) {
    const ctx = this.ctx;
    const sc = (a.size * (1 + Math.sin(now * 0.0014 + a.phase) * 0.025)) / 24;
    ctx.save(); ctx.translate(a.x, a.y); ctx.scale(sc, sc);
    ctx.globalAlpha = a.alpha * a.vis;
    if (a.lead || a.job) { ctx.shadowColor = a.color; ctx.shadowBlur = a.slot === 0 && a.job ? 12 : 6; }
    ctx.fillStyle = a.color; ctx.fill(ARROW);
    ctx.shadowBlur = 0; ctx.lineWidth = 1.1; ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.stroke(ARROW);
    ctx.restore();
    if (label) {
      const text = LABELS[a.labelIdx];
      ctx.save(); ctx.font = "600 9px Inter, system-ui, sans-serif";
      const tw = ctx.measureText(text).width;
      const x = clamp(a.x + 15, 8, this.w - tw - 22), y = clamp(a.y - 12, 24, this.h - 14);
      ctx.globalAlpha = 0.85 * a.vis; ctx.fillStyle = "rgba(8,10,16,.82)"; ctx.strokeStyle = a.color + "88"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(x, y - 10, tw + 14, 20, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#f5f5f7"; ctx.fillText(text, x + 7, y + 3); ctx.restore();
    }
  }
}
