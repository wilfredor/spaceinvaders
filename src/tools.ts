import { Config } from "./config";
import { Game } from "./game";

type Projectile = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    color: string;
    owner: 'player' | 'enemy';
    onStep?: (p: Projectile) => boolean;
};

//Check if a var exist
export class Tool {
    static readonly hudHeight = 28;
    private static projectiles: Projectile[] = [];
    private static projectileFrame?: number;
    private static lastProjectileTimestamp?: number;
    private static explosionFrame?: number;
    private static explosionTime = 0;
    private static explosionDuration = 0.5;
    private static explosionOrigin: { x: number; y: number } | null = null;

    //A random number multiple of 5
    static randomRange(min: number, max: number) {
        return Math.round((Math.random() * (max - min) + min) / 5) * 5;
    }
    static paintNave(x:number,y:number, color: string = "#7fff00") {
        const ctx = Config.context;
        const clearHeight = Config.naveHeight * 2;
        // Clear just the strip where the nave lives to avoid trails.
        ctx.clearRect(0, Config.canvas.height - clearHeight, Config.canvas.width, clearHeight);

        ctx.fillStyle = color;

        // Body
        ctx.fillRect(x, y, Config.naveWidth, Config.naveHeight);

        // Turret centered on the body.
        const turretWidth = Math.max(2, Config.naveWidth * 0.12);
        const turretHeight = Math.max(4, Config.naveHeight * 0.75);
        const turretX = x + (Config.naveWidth - turretWidth) / 2;
        const turretY = y - turretHeight + Config.naveHeight * 0.2;
        ctx.fillRect(turretX, turretY, turretWidth, turretHeight);

        // Wing cutouts for a simple silhouette.
        const cutoutWidth = Config.naveWidth * 0.15;
        const cutoutHeight = Config.naveHeight * 0.5;
        ctx.clearRect(x, y + Config.naveHeight - cutoutHeight, cutoutWidth, cutoutHeight);
        ctx.clearRect(x + Config.naveWidth - cutoutWidth, y + Config.naveHeight - cutoutHeight, cutoutWidth, cutoutHeight);
    }
    static printMessage(messageContent:string){
        const ctx = Config.context;
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, 0, Config.canvas.width, Config.canvas.height);

        const x = Config.canvas.width / 2; //Center text in canvas 
        const y = Config.canvas.height / 2;
        ctx.font = "30px Courier New";
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(messageContent, x, y);
        ctx.restore();
     }

     static addProjectile(projectile: Projectile) {
        this.projectiles.push(projectile);
        if (!this.projectileFrame) {
            this.lastProjectileTimestamp = undefined;
            this.projectileFrame = requestAnimationFrame(ts => this.updateProjectiles(ts));
        }
     }

     private static updateProjectiles(timestamp: number) {
        if (this.lastProjectileTimestamp === undefined) {
            this.lastProjectileTimestamp = timestamp;
            this.projectileFrame = requestAnimationFrame(ts => this.updateProjectiles(ts));
            return;
        }

        const deltaSeconds = (timestamp - this.lastProjectileTimestamp) / 1000;
        this.lastProjectileTimestamp = timestamp;

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
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.width, p.height);
            }
        }

        this.projectiles = alive;
        if (this.projectiles.length > 0) {
            this.projectileFrame = requestAnimationFrame(ts => this.updateProjectiles(ts));
        } else {
            this.projectileFrame = undefined;
        }
     }

     static countProjectiles(owner: 'player' | 'enemy'): number {
        return this.projectiles.filter(p => p.owner === owner).length;
     }

     static removeEnemies() {
        //Clean place
        // Preserve HUD band at the top, and keep the nave band intact.
        Config.context.clearRect(
                                0, 
                                Tool.hudHeight, 
                                Config.canvas.width, 
                                Config.canvas.height - Tool.hudHeight - (Config.naveHeight + 9));
      }

     static drawHud(level: number, score: number, lives: number) {
        const ctx = Config.context;
        const h = Tool.hudHeight;
        ctx.clearRect(0, 0, Config.canvas.width, h);

        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, Config.canvas.width, h);

        ctx.font = "14px Courier New";
        ctx.fillStyle = "#9fe29f";
        ctx.textBaseline = "middle";
        ctx.fillText(`LVL`, 10, h / 2);
        ctx.fillStyle = "#fff";
        ctx.fillText(String(level), 40, h / 2);

        ctx.fillStyle = "#9fe29f";
        ctx.fillText(`SCORE`, 80, h / 2);
        ctx.fillStyle = "#fff";
        ctx.fillText(String(score), 140, h / 2);

        ctx.fillStyle = "#9fe29f";
        ctx.fillText(`LIVES`, 200, h / 2);
        for (let i = 0; i < lives; i++) {
          ctx.fillStyle = "#ff4d4d";
          const size = 8;
          const x = 250 + i * (size + 6);
          ctx.fillRect(x, h / 2 - size / 2, size, size);
        }

        ctx.fillStyle = "#cfcfcf";
        const pauseText = "Press P to pause";
        const textWidth = ctx.measureText(pauseText).width;
        ctx.fillText(pauseText, Config.canvas.width - textWidth - 10, h / 2);
      }

     static clearAll() {
        Config.context.clearRect(0, 0, Config.canvas.width, Config.canvas.height);
        Config.projectileContext.clearRect(0, 0, Config.projectileCanvas.width, Config.projectileCanvas.height);
      }

      static explode(x: number, y: number, radius: number = 30, color?: string) {
        this.explosionOrigin = { x, y };
        this.explosionTime = 0;
        this.explosionPalette = this.makePalette(color);
        if (!this.explosionFrame) {
          this.explosionFrame = requestAnimationFrame(ts => this.updateExplosion(ts, radius));
        }
      }

      private static updateExplosion(timestamp: number, radius: number) {
        const ctx = Config.context;
        const step = 16; // approx 60fps
        const delta = step / 1000;
        this.explosionTime += delta;
        if (this.explosionOrigin) {
          const progress = Math.min(this.explosionTime / this.explosionDuration, 1);
          const alpha = 1 - progress;
          const r = radius * (0.5 + 0.8 * progress);
          const colors = this.explosionPalette.map(c => this.applyAlpha(c, alpha));
          const pixel = Math.max(2, radius * 0.08);
          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * r;
            const px = this.explosionOrigin.x + Math.cos(angle) * dist;
            const py = this.explosionOrigin.y + Math.sin(angle) * dist;
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(px, py, pixel, pixel);
          }
          ctx.restore();
        }

        if (this.explosionTime < this.explosionDuration) {
          this.explosionFrame = requestAnimationFrame(ts => this.updateExplosion(ts, radius));
        } else {
          this.explosionFrame = undefined;
          this.explosionOrigin = null;
          this.explosionPalette = this.defaultPalette;
        }
      }

      private static defaultPalette = ["#ffffff", "#ffb300", "#ff4000"];
      private static explosionPalette = Tool.defaultPalette;

      private static makePalette(color?: string): string[] {
        if (!color) return this.defaultPalette;
        const shades = [];
        shades.push(color);
        shades.push(this.tint(color, 1.2));
        shades.push(this.tint(color, 0.8));
        return shades;
      }

      private static tint(hex: string, factor: number): string {
        const m = hex.match(/^#?([0-9a-fA-F]{6})$/);
        if (!m) return hex;
        const num = parseInt(m[1], 16);
        const r = Math.min(255, Math.max(0, Math.round(((num >> 16) & 0xff) * factor)));
        const g = Math.min(255, Math.max(0, Math.round(((num >> 8) & 0xff) * factor)));
        const b = Math.min(255, Math.max(0, Math.round((num & 0xff) * factor)));
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      }

      private static applyAlpha(hex: string, alpha: number): string {
        const m = hex.match(/^#?([0-9a-fA-F]{6})$/);
        if (!m) return hex;
        const num = parseInt(m[1], 16);
        const r = (num >> 16) & 0xff;
        const g = (num >> 8) & 0xff;
        const b = num & 0xff;
        return `rgba(${r},${g},${b},${alpha})`;
      }
}
