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
    onStep?: (p: Projectile) => boolean;
};

//Check if a var exist
export class Tool {
    private static projectiles: Projectile[] = [];
    private static projectileFrame?: number;
    private static lastProjectileTimestamp?: number;

    //A random number multiple of 5
    static randomRange(min: number, max: number) {
        return Math.round((Math.random() * (max - min) + min) / 5) * 5;
    }
    static paintNave(x:number,y:number, color: string = "#7fff00") {
        //paint nave in relative screen position
        Config.context.fillStyle = color;
        Config.context.clearRect(0, 
                                Config.canvas.height - (Config.naveHeight + Config.naveHeight / 2), 
                                Config.canvas.width, Config.canvas.height);
        Config.context.fillRect(x, y, Config.naveWidth, Config.naveHeight);
        //Nave canon
        Config.context.fillRect(x + 24, Config.canvas.height - 30, 3, 5);
        Config.context.clearRect(x - 4, Config.canvas.height - 27, 7, 12);
        Config.context.fillRect(x + 22, Config.canvas.height - 25, 7, 12);
        Config.context.clearRect(x + Config.naveWidth - 3, Config.canvas.height - 27, 7, 12);
    }
    static printMessage(messageContent:string){
        var x = Config.canvas.width / 2; //Center text in canvas 
        var y = Config.canvas.height / 2;
        Config.context.font = "30px Courier New";
        Config.context.fillStyle = 'white';
        Config.context.fill();
        Config.context.textAlign = 'center';
        Config.context.fillText(messageContent, x, y);
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

     static removeEnemies() {
        //Clean place
        //9 is the canon height
        Config.context.clearRect(0, 
                                0, 
                                Config.canvas.width, 
                                Config.canvas.height - (Config.naveHeight + 9));
        Config.projectileContext.clearRect(0, 0, Config.canvas.width, Config.canvas.height);
      }
}
