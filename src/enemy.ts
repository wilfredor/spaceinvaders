
import { Config } from "./config";
import { Enemies } from "./enemies";
import { Game } from "./game";
import { Tool } from "./tools";
export class Enemy {
   x: number;
   y: number;
   index: number;
   enemies: Enemies;
   width: number;
   height: number;
   private type: number;
   private animationFrame = 0;
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

   constructor(x: number, y: number, index: number, type: number, enemies:Enemies) {
      this.width = Config.enemyWidth;
      this.height = Config.enemyHeight;
      this.x = x;
      this.y = y;
      this.index = index;
      this.type = Math.min(type, Enemy.frames.length - 1);
      this.enemies = enemies;
      this.paint();
   }

   paint() {
      const frames = Enemy.frames[this.type];
      const frame = frames[this.animationFrame % frames.length];
      const pixelWidth = this.width / frame[0].length;
      const pixelHeight = this.height / frame.length;
      const ctx = Config.context;

      ctx.fillStyle = "#ffffff";
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
      this.animationFrame = (this.animationFrame + 1) % frames.length;
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

         Tool.addProjectile({
            x: startX,
            y: startY,
            vx: 0,
            vy: speed,
            width,
            height,
            color: "#ff4d4d",
            onStep: (p) => {
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
