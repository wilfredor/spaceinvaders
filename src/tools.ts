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
        // Preserve HUD band at the top.
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
}
