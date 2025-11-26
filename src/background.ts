type Star = {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  twinkle: number;
};

type Trail = {
  x: number;
  y: number;
  length: number;
  speed: number;
  width: number;
  hue: number;
  alpha: number;
};

export class SpaceBackground {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private stars: Star[] = [];
  private trails: Trail[] = [];
  private lastTime = performance.now();
  private running = false;
  private hueBase = 220;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.populate();
    this.start();
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.populate(true);
  }

  private start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((ts) => this.tick(ts));
  }

  destroy() {
    this.running = false;
  }

  private tick(timestamp: number) {
    if (!this.running) return;
    const delta = Math.min(0.05, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;
    this.hueBase = (this.hueBase + delta * 4) % 360;

    this.paintSky();
    this.paintStars(delta);
    this.paintTrails(delta);

    requestAnimationFrame((ts) => this.tick(ts));
  }

  private paintSky() {
    const topHue = (this.hueBase + 200) % 360;
    const bottomHue = (this.hueBase + 250) % 360;
    const g = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    g.addColorStop(0, `hsl(${topHue}, 35%, 10%)`);
    g.addColorStop(0.45, `hsl(${(topHue + 20) % 360}, 40%, 8%)`);
    g.addColorStop(1, `hsl(${bottomHue}, 45%, 6%)`);
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private paintStars(delta: number) {
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.y += s.speed * delta;
      s.alpha += Math.sin(this.lastTime * 0.002 + s.twinkle) * 0.02;
      if (s.y > this.canvas.height) {
        this.stars[i] = this.spawnStar(false);
        continue;
      }
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0.1, Math.min(0.9, s.alpha));
      this.ctx.fillStyle = "white";
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  private paintTrails(delta: number) {
    for (let i = 0; i < this.trails.length; i++) {
      const t = this.trails[i];
      t.y += t.speed * delta;
      if (t.y - t.length > this.canvas.height) {
        this.trails[i] = this.spawnTrail(false);
        continue;
      }

      const grad = this.ctx.createLinearGradient(t.x, t.y - t.length, t.x, t.y);
      grad.addColorStop(0, `hsla(${t.hue}, 70%, 70%, 0)`);
      grad.addColorStop(0.45, `hsla(${t.hue}, 80%, 70%, ${t.alpha * 0.5})`);
      grad.addColorStop(1, `hsla(${t.hue}, 90%, 72%, ${t.alpha})`);

      this.ctx.save();
      this.ctx.globalCompositeOperation = "screen";
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = t.width;
      this.ctx.lineCap = "round";
      this.ctx.beginPath();
      this.ctx.moveTo(t.x, t.y - t.length);
      this.ctx.lineTo(t.x, t.y);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  private populate(reset: boolean = false) {
    if (reset) {
      this.stars = [];
      this.trails = [];
    }
    const starCount = Math.max(60, Math.round((this.canvas.width * this.canvas.height) / 9000));
    const trailCount = Math.max(8, Math.round(this.canvas.width / 80));
    while (this.stars.length < starCount) this.stars.push(this.spawnStar(true));
    while (this.trails.length < trailCount) this.trails.push(this.spawnTrail(true));
  }

  private spawnStar(initial: boolean): Star {
    const size = this.randomRange(0.5, 2.2);
    return {
      x: Math.random() * this.canvas.width,
      y: initial ? Math.random() * this.canvas.height : -size * 2,
      size,
      speed: this.randomRange(this.canvas.height * 0.05, this.canvas.height * 0.14),
      alpha: this.randomRange(0.3, 0.8),
      twinkle: Math.random() * Math.PI * 2,
    };
  }

  private spawnTrail(initial: boolean): Trail {
    const width = this.randomRange(1.2, 3.4);
    const length = this.randomRange(this.canvas.height * 0.08, this.canvas.height * 0.2);
    return {
      x: Math.random() * this.canvas.width,
      y: initial ? Math.random() * this.canvas.height : -length,
      length,
      speed: this.randomRange(this.canvas.height * 0.4, this.canvas.height * 0.8),
      width,
      hue: this.randomRange(200, 280),
      alpha: this.randomRange(0.35, 0.7),
    };
  }

  private randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
}

export class TronRoadBackground {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private running = false;
  private lastTime = performance.now();
  private offset = 0;
  private hueBase = 200;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.start();
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  private start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((ts) => this.tick(ts));
  }

  destroy() {
    this.running = false;
  }

  private tick(timestamp: number) {
    if (!this.running) return;
    const delta = Math.min(0.05, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;
    this.offset = (this.offset + delta * 140) % 48;
    this.hueBase = (this.hueBase + delta * 6) % 360;

    this.paintSky();
    this.paintGrid();

    requestAnimationFrame((ts) => this.tick(ts));
  }

  private paintSky() {
    const topHue = (this.hueBase + 40) % 360;
    const midHue = (this.hueBase + 15) % 360;
    const bottomHue = (this.hueBase + 300) % 360;
    const g = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    g.addColorStop(0, `hsl(${topHue}, 40%, 16%)`);
    g.addColorStop(0.45, `hsl(${midHue}, 45%, 12%)`);
    g.addColorStop(1, `hsl(${bottomHue}, 55%, 6%)`);
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Distant glow on horizon.
    const glow = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height * 0.32,
      20,
      this.canvas.width / 2,
      this.canvas.height * 0.3,
      this.canvas.height * 0.9
    );
    glow.addColorStop(0, `hsla(${(this.hueBase + 200) % 360}, 80%, 60%, 0.45)`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    this.ctx.fillStyle = glow;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private paintGrid() {
    const h = this.canvas.height;
    const w = this.canvas.width;
    const horizon = h * 0.25;
    const centerX = w / 2;
    const topWidth = w * 0.12;
    const bottomWidth = w * 1.3;
    const stripeSpacing = 40;
    const colorHue = (this.hueBase + 180) % 360;
    const lineColor = `hsla(${colorHue}, 90%, 65%, 0.8)`;
    const glowColor = `hsla(${colorHue}, 90%, 65%, 0.25)`;

    // Road body.
    const roadGradient = this.ctx.createLinearGradient(0, horizon, 0, h);
    roadGradient.addColorStop(0, "rgba(10, 5, 20, 0.7)");
    roadGradient.addColorStop(1, "rgba(5, 2, 12, 0.95)");
    const roadPath = new Path2D();
    roadPath.moveTo(centerX - topWidth / 2, horizon);
    roadPath.lineTo(centerX + topWidth / 2, horizon);
    roadPath.lineTo(centerX + bottomWidth / 2, h);
    roadPath.lineTo(centerX - bottomWidth / 2, h);
    roadPath.closePath();
    this.ctx.fillStyle = roadGradient;
    this.ctx.fill(roadPath);

    this.ctx.save();
    this.ctx.globalCompositeOperation = "screen";
    this.ctx.strokeStyle = lineColor;
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = lineColor;
    this.ctx.shadowBlur = 12;

    // Horizontal stripes moving toward the player.
    for (let y = h - this.offset; y > horizon; y -= stripeSpacing) {
      const t = (y - horizon) / (h - horizon);
      const roadW = topWidth + (bottomWidth - topWidth) * t;
      const xL = centerX - roadW / 2;
      const xR = centerX + roadW / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(xL, y);
      this.ctx.lineTo(xR, y);
      this.ctx.stroke();
    }

    // Vertical neon rails.
    const rails = 8;
    for (let i = 0; i < rails; i++) {
      const frac = i / (rails - 1);
      const xTop = centerX - topWidth / 2 + topWidth * frac;
      const xBottom = centerX - bottomWidth / 2 + bottomWidth * frac;
      this.ctx.beginPath();
      this.ctx.moveTo(xTop, horizon);
      this.ctx.lineTo(xBottom, h);
      this.ctx.stroke();
    }

    this.ctx.restore();

    // Soft bloom over the road.
    const bloom = this.ctx.createLinearGradient(0, horizon, 0, h);
    bloom.addColorStop(0, "rgba(255,255,255,0)");
    bloom.addColorStop(1, glowColor);
    this.ctx.fillStyle = bloom;
    this.ctx.fill(roadPath);
  }
}

export type BackgroundMode = "space" | "tron";

export class BackgroundController {
  private current: SpaceBackground | TronRoadBackground | null = null;
  private mode: BackgroundMode;
  private readonly canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, initialMode: BackgroundMode) {
    this.canvas = canvas;
    this.mode = initialMode;
    this.setMode(initialMode);
  }

  setMode(mode: BackgroundMode) {
    if (mode === this.mode && this.current) return;
    this.current?.destroy();
    this.mode = mode;
    this.current = mode === "tron"
      ? new TronRoadBackground(this.canvas)
      : new SpaceBackground(this.canvas);
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.current?.resize(width, height);
  }
}
