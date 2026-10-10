import { tablePlane, type Corners, type XY } from "./geometry.ts";
export type Detection = XY & { confidence: number; time: number; size: number };
export type Suggestion = {
  id: string;
  loserSide: 0 | 1 | null;
  strong: boolean;
  reason: string;
};
export type VisionResult = {
  ball: Detection | null;
  trail: XY[];
  phase: "waiting" | "tracking" | "pending";
  suggestion: Suggestion | null;
  fps: number;
  motion: number;
};
export type VisionConfig = {
  corners: Corners;
  color: "white" | "orange";
  sensitivity: number;
  diameter: number;
};

export class BallTracker {
  private previous: Uint8ClampedArray | null = null;
  private older: Uint8ClampedArray | null = null;
  private last: Detection | null = null;
  private velocity: XY = { x: 0, y: 0 };
  private history: Detection[] = [];
  private started = 0;
  private lastSeen = 0;
  private frames = 0;
  private crossings = 0;
  private side: 0 | 1 | null = null;
  private lastBounce = 0;
  private bounces: { side: 0 | 1; at: number }[] = [];
  private pending: Suggestion | null = null;
  private lastFrameTime = 0;
  private stableFrames = 0;
  private continuous = true;
  private project: ReturnType<typeof tablePlane>;
  private config: VisionConfig;
  constructor(config: VisionConfig) {
    this.config = config;
    this.project = tablePlane(config.corners);
  }
  reset() {
    this.last = null;
    this.velocity = { x: 0, y: 0 };
    this.history = [];
    this.started = 0;
    this.lastSeen = 0;
    this.frames = 0;
    this.crossings = 0;
    this.side = null;
    this.bounces = [];
    this.lastBounce = 0;
    this.pending = null;
    this.stableFrames = 0;
    this.continuous = true;
    this.previous = null;
    this.older = null;
    this.lastFrameTime = 0;
  }
  process(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    time: number,
  ): VisionResult {
    const gap = this.lastFrameTime ? time - this.lastFrameTime : 0;
    const fps = gap > 0 ? 1000 / gap : 0;
    if (gap > 250 || gap < 0) this.reset();
    this.lastFrameTime = time;
    const previous = this.previous,
      older = this.older;
    this.older = previous;
    this.previous = data;
    if (
      !previous ||
      !older ||
      previous.length !== data.length ||
      older.length !== data.length
    )
      return this.result(null, fps, 0);
    const mask = new Uint8Array(width * height);
    let moving = 0;
    const threshold = 36 - this.config.sensitivity * 0.18;
    for (let pixel = 0; pixel < mask.length; pixel++) {
      const i = pixel * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const white =
        Math.min(r, g, b) > 130 && Math.max(r, g, b) - Math.min(r, g, b) < 72;
      const orange = r > 150 && g > 65 && r > g * 1.18 && g > b * 1.22;
      const delta =
        (Math.abs(r - previous[i]) +
          Math.abs(g - previous[i + 1]) +
          Math.abs(b - previous[i + 2])) /
        3;
      const delta2 =
        (Math.abs(r - older[i]) +
          Math.abs(g - older[i + 1]) +
          Math.abs(b - older[i + 2])) /
        3;
      if (delta > threshold) moving++;
      if (
        (this.config.color === "white" ? white : orange) &&
        delta > threshold &&
        delta2 > threshold * 0.7
      )
        mask[pixel] = 1;
    }
    const motion = moving / mask.length;
    // A moved camera or a near-total scene change invalidates the sequence.
    if (motion > 0.45) {
      this.reset();
      return this.result(null, fps, motion);
    }
    const candidates: Detection[] = [];
    const stack = new Int32Array(mask.length);
    for (let i = 0; i < mask.length; i++) {
      if (!mask[i]) continue;
      let top = 0,
        count = 0,
        sx = 0,
        sy = 0;
      let minX = width,
        minY = height,
        maxX = 0,
        maxY = 0;
      stack[top++] = i;
      mask[i] = 0;
      while (top) {
        const pixel = stack[--top],
          x = pixel % width,
          y = Math.floor(pixel / width);
        count++;
        sx += x;
        sy += y;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        const neighbors = [
          x > 0 ? pixel - 1 : -1,
          x < width - 1 ? pixel + 1 : -1,
          pixel - width,
          pixel + width,
        ];
        for (const n of neighbors)
          if (n >= 0 && n < mask.length && mask[n]) {
            mask[n] = 0;
            stack[top++] = n;
          }
      }
      const bw = maxX - minX + 1,
        bh = maxY - minY + 1;
      const maxDiameter = (this.config.diameter * width) / 320;
      if (
        count < 2 ||
        count > maxDiameter * maxDiameter * 3 ||
        bw > maxDiameter * 4 ||
        bh > maxDiameter * 3 ||
        count / (bw * bh) < 0.2
      )
        continue;
      const x = sx / count / width,
        y = sy / count / height;
      const projected = this.project({ x, y });
      if (
        projected.u < -0.7 ||
        projected.u > 1.7 ||
        projected.v < -0.8 ||
        projected.v > 1.8
      )
        continue;
      let confidence = 0.45 + 0.2 * Math.min(1, count / 8);
      if (this.last && time - this.last.time < 150) {
        const dt = time - this.last.time;
        const distance = Math.hypot(
          x - this.last.x - this.velocity.x * dt,
          y - this.last.y - this.velocity.y * dt,
        );
        if (distance > 0.28) continue;
        confidence += Math.max(0, 0.33 * (1 - distance / 0.2));
      }
      candidates.push({ x, y, confidence, time, size: count });
    }
    candidates.sort((a, b) => b.confidence - a.confidence);
    let ball: Detection | null = candidates[0] ?? null;
    if (
      candidates.length > 1 &&
      ball &&
      ball.confidence - candidates[1].confidence < 0.04
    )
      ball = null;
    if (!ball && this.started && time - this.lastSeen > 120)
      this.continuous = false;
    if (ball && !this.pending) this.observe(ball);
    if (!ball && this.started && !this.pending && time - this.lastSeen > 1000) {
      if (
        this.frames >= 8 &&
        this.crossings >= 1 &&
        time - this.started > 500
      ) {
        this.pending = {
          id: `rally-${Math.round(this.started)}`,
          loserSide: null,
          strong: false,
          reason: "Terminó el seguimiento. Confirma quién ganó.",
        };
      } else {
        this.last = null;
        this.history = [];
        this.frames = 0;
        this.started = 0;
        this.crossings = 0;
        this.side = null;
        this.bounces = [];
        this.continuous = true;
      }
    }
    return this.result(ball, fps, motion);
  }
  private observe(ball: Detection) {
    const prev = this.last;
    const dt = prev ? ball.time - prev.time : 0;
    if (!this.started) this.started = ball.time;
    this.frames++;
    this.lastSeen = ball.time;
    const plane = this.project(ball);
    const currentSide: 0 | 1 | null =
      plane.v < 0.43 ? 0 : plane.v > 0.57 ? 1 : null;
    if (currentSide !== null) {
      if (this.side !== null && this.side !== currentSide) this.crossings++;
      this.side = currentSide;
    }
    if (prev && dt > 0 && dt < 150) {
      const vx = (ball.x - prev.x) / dt,
        vy = (ball.y - prev.y) / dt;
      this.stableFrames++;
      const before = this.history[this.history.length - 2];
      if (
        before &&
        this.stableFrames > 5 &&
        plane.inside &&
        currentSide !== null &&
        ball.confidence > 0.78 &&
        ball.time - this.lastBounce > 160
      ) {
        const oldVy =
          (prev.y - before.y) / Math.max(1, prev.time - before.time);
        // Downward-to-upward image reversal is a bounce candidate, not 3D proof.
        if (oldVy > 0.00045 && vy < -0.00045 && Math.abs(vx) < 0.008) {
          this.lastBounce = ball.time;
          this.bounces.push({ side: currentSide, at: ball.time });
          const previousBounce = this.bounces[this.bounces.length - 2];
          if (
            previousBounce &&
            previousBounce.side === currentSide &&
            ball.time - previousBounce.at < 1000 &&
            this.crossings >= 2 &&
            ball.time - this.started > 900
          ) {
            this.pending = {
              id: `rally-${Math.round(this.started)}`,
              loserSide: currentSide,
              strong: this.continuous,
              reason: "Dos cambios de trayectoria compatibles con doble bote.",
            };
          }
        }
      }
      this.velocity = { x: vx, y: vy };
    } else {
      this.stableFrames = 0;
      this.velocity = { x: 0, y: 0 };
    }
    this.last = ball;
    this.history.push(ball);
    if (this.history.length > 16) this.history.shift();
  }
  private result(
    ball: Detection | null,
    fps: number,
    motion: number,
  ): VisionResult {
    return {
      ball,
      trail: this.history.map(({ x, y }) => ({ x, y })),
      phase: this.pending ? "pending" : this.started ? "tracking" : "waiting",
      suggestion: this.pending,
      fps,
      motion,
    };
  }
}
