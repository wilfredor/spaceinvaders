import { Config } from "../config";

export class ExplosionRenderer {
  private frame?: number;
  private time = 0;
  private readonly duration = 0.5;
  private origin: { x: number; y: number } | null = null;
  private palette = ["#ffffff", "#ffb300", "#ff4000"];

  trigger(x: number, y: number, radius: number = 30, color?: string) {
    this.origin = { x, y };
    this.time = 0;
    this.palette = color ? this.makePalette(color) : this.palette;
    if (!this.frame) {
      this.frame = requestAnimationFrame((ts) => this.update(ts, radius));
    }
  }

  clear() {
    this.frame = undefined;
    this.origin = null;
  }

  private update(_timestamp: number, radius: number) {
    const ctx = Config.context;
    const step = 16; // approx 60fps
    const delta = step / 1000;
    this.time += delta;
    if (this.origin) {
      const progress = Math.min(this.time / this.duration, 1);
      const alpha = 1 - progress;
      const r = radius * (0.5 + 0.8 * progress);
      const colors = this.palette.map((c) => this.applyAlpha(c, alpha));
      const pixel = Math.max(2, radius * 0.08);
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * r;
        const px = this.origin.x + Math.cos(angle) * dist;
        const py = this.origin.y + Math.sin(angle) * dist;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(px, py, pixel, pixel);
      }
      ctx.restore();
    }

    if (this.time < this.duration) {
      this.frame = requestAnimationFrame((ts) => this.update(ts, radius));
    } else {
      this.frame = undefined;
      this.origin = null;
    }
  }

  private makePalette(color: string): string[] {
    return [color, this.tint(color, 1.2), this.tint(color, 0.8)];
  }

  private tint(hex: string, factor: number): string {
    const m = hex.match(/^#?([0-9a-fA-F]{6})$/);
    if (!m) return hex;
    const num = parseInt(m[1], 16);
    const r = Math.min(255, Math.max(0, Math.round(((num >> 16) & 0xff) * factor)));
    const g = Math.min(255, Math.max(0, Math.round(((num >> 8) & 0xff) * factor)));
    const b = Math.min(255, Math.max(0, Math.round((num & 0xff) * factor)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  private applyAlpha(hex: string, alpha: number): string {
    const m = hex.match(/^#?([0-9a-fA-F]{6})$/);
    if (!m) return hex;
    const num = parseInt(m[1], 16);
    const r = (num >> 16) & 0xff;
    const g = (num >> 8) & 0xff;
    const b = num & 0xff;
    return `rgba(${r},${g},${b},${alpha})`;
  }
}
