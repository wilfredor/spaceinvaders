import { Config } from "./config";
import { Nave } from "./nave";

type Drop = {
  x: number;
  y: number;
  vy: number;
  size: number;
  alpha: number;
  hue: number;
  lastX: number;
  lastY: number;
};

export class PowerUpManager {
  private drop: Drop | null = null;
  private readonly chance = 0.2;

  maybeSpawn(x: number, y: number) {
    if (this.drop) return;
    if (Math.random() > this.chance) return;
    const size = Math.max(12, Math.round(Config.naveHeight * 0.9));
    this.drop = {
      x: x - size / 2,
      y: y - size / 2,
      vy: Config.canvas.height * 0.3,
      size,
      alpha: 0.9,
      hue: 45 + Math.random() * 60,
      lastX: x,
      lastY: y,
    };
  }

  update(deltaSeconds: number, nave: Nave) {
    if (!this.drop) return;
    const d = this.drop;
    const ctx = Config.projectileContext;
    const pad = 4;
    ctx.clearRect(d.lastX - pad, d.lastY - pad, d.size + pad * 2, d.size + pad * 2);

    d.y += d.vy * deltaSeconds;
    d.lastX = d.x;
    d.lastY = d.y;

    if (this.intersectsNave(d, nave)) {
      nave.applyFireBoost();
      this.drop = null;
      return;
    }
    if (d.y > Config.canvas.height + d.size) {
      this.drop = null;
      return;
    }

    const grad = ctx.createRadialGradient(
      d.x + d.size / 2,
      d.y + d.size / 2,
      d.size * 0.2,
      d.x + d.size / 2,
      d.y + d.size / 2,
      d.size * 0.6
    );
    grad.addColorStop(0, `hsla(${d.hue}, 90%, 70%, ${d.alpha})`);
    grad.addColorStop(1, `hsla(${d.hue + 40}, 90%, 55%, ${d.alpha * 0.6})`);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = grad;
    ctx.strokeStyle = `hsla(${d.hue}, 90%, 70%, ${d.alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(d.x, d.y, d.size, d.size, d.size * 0.2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  clear() {
    if (!this.drop) return;
    const pad = 4;
    Config.projectileContext.clearRect(this.drop.x - pad, this.drop.y - pad, this.drop.size + pad * 2, this.drop.size + pad * 2);
    this.drop = null;
  }

  private intersectsNave(drop: Drop, nave: Nave) {
    return (
      drop.x < nave.x + Config.naveWidth &&
      drop.x + drop.size > nave.x &&
      drop.y < nave.y + Config.naveHeight &&
      drop.y + drop.size > nave.y
    );
  }
}
