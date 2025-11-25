import { Config } from "../config";

export type Projectile = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  owner: "player" | "enemy";
  onStep?: (p: Projectile) => boolean;
};

export class ProjectileManager {
  private projectiles: Projectile[] = [];
  private frame?: number;
  private lastTimestamp?: number;

  add(projectile: Projectile) {
    this.projectiles.push(projectile);
    if (!this.frame) {
      this.lastTimestamp = undefined;
      this.frame = requestAnimationFrame((ts) => this.update(ts));
    }
  }

  count(owner: "player" | "enemy") {
    return this.projectiles.filter((p) => p.owner === owner).length;
  }

  forEach(fn: (p: Projectile) => boolean | void) {
    this.projectiles = this.projectiles.filter((p) => {
      const keep = fn(p);
      return keep !== false;
    });
  }

  clear() {
    this.projectiles = [];
    if (this.frame) {
      cancelAnimationFrame(this.frame);
      this.frame = undefined;
    }
    Config.projectileContext.clearRect(0, 0, Config.projectileCanvas.width, Config.projectileCanvas.height);
  }

  private update(timestamp: number) {
    if (this.lastTimestamp === undefined) {
      this.lastTimestamp = timestamp;
      this.frame = requestAnimationFrame((ts) => this.update(ts));
      return;
    }

    const deltaSeconds = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    const ctx = Config.projectileContext;
    ctx.clearRect(0, 0, Config.canvas.width, Config.canvas.height);

    const alive: Projectile[] = [];
    for (const p of this.projectiles) {
      p.x += p.vx * deltaSeconds;
      p.y += p.vy * deltaSeconds;

      let keep = p.y + p.height >= 0 && p.y <= Config.canvas.height;
      if (keep && p.onStep) {
        keep = p.onStep(p) !== false;
      }

      if (keep) {
        alive.push(p);
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, "white");
        ctx.fillStyle = grad;
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.restore();
      }
    }

    this.projectiles = alive;
    if (this.projectiles.length > 0) {
      this.frame = requestAnimationFrame((ts) => this.update(ts));
    } else {
      this.frame = undefined;
    }
  }
}
