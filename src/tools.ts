import { Config } from "./config";
import { CanvasCleaner } from "./managers/canvasCleaner";
import { ExplosionRenderer } from "./managers/explosionRenderer";
import { HudRenderer } from "./managers/hudRenderer";
import { Projectile, ProjectileManager } from "./managers/projectileManager";

export interface Services {
  readonly hudHeight: number;
  randomRange(min: number, max: number): number;
  paintNave(x: number, y: number, color?: string): void;
  printMessage(messageContent: string): void;
  addProjectile(projectile: Projectile): void;
  forEachProjectile(fn: (p: Projectile) => boolean | void): void;
  countProjectiles(owner: "player" | "enemy"): number;
  removeEnemies(): void;
  drawHud(level: number, score: number, lives: number): void;
  clearAll(): void;
  explode(x: number, y: number, radius?: number, color?: string): void;
}

export class Tool implements Services {
  readonly hudHeight = 28;
  private projectiles = new ProjectileManager();
  private explosions = new ExplosionRenderer();
  private hud = new HudRenderer();
  private cleaner = new CanvasCleaner(this.hudHeight);

  randomRange(min: number, max: number) {
    return Math.round((Math.random() * (max - min) + min) / 5) * 5;
  }

  paintNave(x: number, y: number, color: string = "#7fff00") {
    const ctx = Config.context;
    const clearHeight = Config.naveHeight * 2;
    ctx.clearRect(0, Config.canvas.height - clearHeight, Config.canvas.width, clearHeight);

    ctx.fillStyle = color;
    ctx.fillRect(x, y, Config.naveWidth, Config.naveHeight);

    const turretWidth = Math.max(2, Config.naveWidth * 0.12);
    const turretHeight = Math.max(4, Config.naveHeight * 0.75);
    const turretX = x + (Config.naveWidth - turretWidth) / 2;
    const turretY = y - turretHeight + Config.naveHeight * 0.2;
    ctx.fillRect(turretX, turretY, turretWidth, turretHeight);

    const cutoutWidth = Config.naveWidth * 0.15;
    const cutoutHeight = Config.naveHeight * 0.5;
    ctx.clearRect(x, y + Config.naveHeight - cutoutHeight, cutoutWidth, cutoutHeight);
    ctx.clearRect(x + Config.naveWidth - cutoutWidth, y + Config.naveHeight - cutoutHeight, cutoutWidth, cutoutHeight);
  }

  printMessage(messageContent: string) {
    const ctx = Config.context;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, 0, Config.canvas.width, Config.canvas.height);

    const x = Config.canvas.width / 2;
    const y = Config.canvas.height / 2;
    ctx.font = "30px Courier New";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(messageContent, x, y);
    ctx.restore();
  }

  addProjectile(projectile: Projectile) {
    this.projectiles.add(projectile);
  }

  forEachProjectile(fn: (p: Projectile) => boolean | void) {
    this.projectiles.forEach(fn);
  }

  countProjectiles(owner: "player" | "enemy"): number {
    return this.projectiles.count(owner);
  }

  removeEnemies() {
    this.cleaner.clearEnemiesArea();
  }

  drawHud(level: number, score: number, lives: number) {
    this.hud.draw(level, score, lives);
  }

  clearAll() {
    this.cleaner.clearAll();
    this.projectiles.clear();
    this.explosions.clear();
  }

  explode(x: number, y: number, radius: number = 30, color?: string) {
    this.explosions.trigger(x, y, radius, color);
  }
}

export const services = new Tool();
export type { Projectile };
