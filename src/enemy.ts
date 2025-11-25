import { Config } from "./config";
import { Enemies } from "./enemies";
import { Game } from "./game";
import { services as defaultServices, Services, Projectile } from "./tools";
import { ShieldManager } from "./shields";
export class Enemy {
   x: number;
   y: number;
   index: number;
   enemies: Enemies;
   width: number;
   height: number;
   baseX: number;
   baseY: number;
   bobPhase: number;
   private framePhase = 0;
   private animationSpeed: number;
   private type: number;
   private animationFrame = 0;
   private isAttacking = false;
   private attackTime = 0;
   private vxAttack = 0;
   private vyAttack = 0;
   private attackAmplitude = 0;
   private attackFrequency = 0;
   private color: string;
   private readonly services: Services;
   private static frames: string[][][] = [
      // Classic invader shape: two-frame animation.
      [
        [
          "   ###   ",
          "  #####  ",
          " ####### ",
          "## ### ##",
          "#########",
          "#  # #  #",
          " #     # ",
          "##     ##",
        ],
        [
          "   ###   ",
          "  #####  ",
          " ####### ",
          "## ### ##",
          "#########",
          " #  #  # ",
          "##  #  ##",
          " #     # ",
        ],
      ],
      // Variant with wider stance.
      [
        [
          "  #####  ",
          " ####### ",
          "#########",
          "### ### #",
          "#########",
          "#  ###  #",
          "   # #   ",
          "  ## ##  ",
        ],
        [
          "  #####  ",
          " ####### ",
          "#########",
          "### ### #",
          "#########",
          " # ### # ",
          "  #   #  ",
          " ##   ## ",
        ],
      ],
      // Small invader.
      [
        [
          "  ###  ",
          " ##### ",
          "#######",
          "## # ##",
          "#######",
          "  # #  ",
          " #   # ",
          "##   ##",
        ],
        [
          "  ###  ",
          " ##### ",
          "#######",
          "## # ##",
          "#######",
          " # # # ",
          "  # #  ",
          " ## ## ",
        ],
      ],
   ];
   private static colors = [
    "#8fffcf", // low danger
    "#ffd166", // medium
    "#ff6b6b", // high
   ];

   constructor(x: number, y: number, index: number, type: number, enemies:Enemies, services: Services = defaultServices) {
      this.width = Config.enemyWidth;
      this.height = Config.enemyHeight;
      this.baseX = x;
      this.baseY = y;
      this.x = x;
      this.y = y;
      this.index = index;
      this.type = Math.min(Math.max(0, type), Enemy.frames.length - 1);
      this.color = Enemy.colors[this.type] ?? "#ffffff";
      this.enemies = enemies;
      this.animationSpeed = 1.5 + Math.random() * 1.5; // frames per second
      this.bobPhase = Math.random() * Math.PI * 2;
      this.services = services;
      this.paint();
   }

   startAttack(targetX: number, targetY: number) {
      const dx = targetX - (this.x + this.width / 2);
      const dy = targetY - (this.y + this.height / 2);
      const angle = Math.atan2(dy, dx);
      const speed = 180 + Math.random() * 60;
      this.vxAttack = Math.cos(angle) * speed;
      this.vyAttack = Math.sin(angle) * speed;
      this.attackAmplitude = this.width * (1 + Math.random());
      this.attackFrequency = 2 + Math.random() * 2;
      this.attackTime = 0;
      this.isAttacking = true;
   }

  updateAttack(deltaSeconds: number, formationOffsetX: number, formationOffsetY: number, shields: ShieldManager): boolean {
    if (!this.isAttacking) return false;
    this.attackTime += deltaSeconds;
    const wobble = Math.sin(this.attackTime * this.attackFrequency) * this.attackAmplitude * deltaSeconds;
    const shieldTop = shields.getTop();
    const shieldBottom = shields.getBottom();
    const gapCenters = shields.getGapCenters();
    if (this.y + this.height >= shieldTop - this.height && this.y <= shieldBottom + this.height) {
      // Nudge horizontally toward the nearest gap to avoid crashing into shields.
      const centerX = this.x + this.width / 2;
      if (gapCenters.length > 0) {
        const nearestGap = gapCenters.reduce((prev, curr) =>
          Math.abs(curr - centerX) < Math.abs(prev - centerX) ? curr : prev
        );
        const steer = Math.sign(nearestGap - centerX);
        const steerAccel = 140; // px/s^2 horizontal steering
        this.vxAttack += steer * steerAccel * deltaSeconds;
      }
    }

    const nextX = this.x + this.vxAttack * deltaSeconds + wobble;
    const nextY = this.y + this.vyAttack * deltaSeconds + wobble * 0.2;

    if (shields.collidesBody(nextX, nextY, this.width, this.height)) {
      this.resetPosition(formationOffsetX, formationOffsetY);
        return false;
      }

      this.x = nextX;
      this.y = nextY;
      this.animate(deltaSeconds);

      const outOfBounds = this.y > Config.canvas.height + this.height || this.x < -this.width || this.x > Config.canvas.width + this.width;
      if (outOfBounds) {
        // Clear the final attack position to avoid trails.
        Config.context.clearRect(this.x, this.y, this.width, this.height);
        this.isAttacking = false;
        // Rejoin the formation at its current offset.
        this.x = this.baseX + formationOffsetX;
        this.y = this.baseY + formationOffsetY;
        return false;
      }
      return true;
   }

   isInAttack(): boolean {
      return this.isAttacking;
   }

   stopAttack() { this.isAttacking = false; }
   resetPosition(formationOffsetX: number, formationOffsetY: number) {
      this.isAttacking = false;
      this.x = this.baseX + formationOffsetX;
      this.y = this.baseY + formationOffsetY;
      this.attackTime = 0;
      this.framePhase = 0;
   }

   getColor(): string {
      return this.color;
   }

   animate(deltaSeconds: number) {
      const frames = Enemy.frames[this.type] ?? Enemy.frames[0];
      this.framePhase += this.animationSpeed * deltaSeconds;
      this.animationFrame = Math.floor(this.framePhase) % frames.length;
   }

   paint() {
      const frames = Enemy.frames[this.type] ?? Enemy.frames[0];
      const frame = frames[this.animationFrame % frames.length];
      const pixelWidth = this.width / frame[0].length;
      const pixelHeight = this.height / frame.length;
      const ctx = Config.context;

      ctx.fillStyle = this.color;
      ctx.clearRect(this.x, this.y, this.width, this.height);
      for (let row = 0; row < frame.length; row++) {
        const line = frame[row];
        for (let col = 0; col < line.length; col++) {
          if (line[col] !== " ") {
            ctx.fillRect(
              this.x + col * pixelWidth,
              this.y + row * pixelHeight,
              pixelWidth,
              pixelHeight
            );
          }
        }
      }
   }

   Obstruction() {
      const elementNumber = this.enemies.items.length - 1;
      for (var i = 0; i <= elementNumber; i++) {
         if ((this.enemies.items[i].x == this.x) && 
             (this.enemies.items[i].index > this.index))
            return true;
      }
      return false;
   };

   //Enemy fire
   fire() {
      if (!this.enemies.game.paused) {
         const width = 3;
         const height = 12;
         const startX = this.x + this.width / 2 - width / 2;
         const startY = this.y + this.height + 5;
         const speed = 250; // px/s downward
         const game = this.enemies.game;
         const nave = game.nave;

         this.services.addProjectile({
            x: startX,
            y: startY,
            vx: 0,
            vy: speed,
            width,
            height,
            color: this.color,
            owner: "enemy",
            onStep: (p: Projectile) => {
               const hitHorizontally = p.x + width >= nave.x && p.x <= nave.x + Config.naveWidth;
               const hitVertically = p.y + height >= nave.y && p.y <= nave.y + Config.naveHeight;
               if (hitHorizontally && hitVertically) {
                  nave.life--;
                  game.life = nave.life;
                  nave.flashHit();
                  if (nave.life <= 0) {
                     game.showMessage("You are dead");
                     game.reload();
                  }
                  return false;
               }
               return p.y <= Config.canvas.height;
            }
         });
      }
   };
}
