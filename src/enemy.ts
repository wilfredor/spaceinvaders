
import { Config } from "./config";
import { Enemies } from "./enemies";
import { Game } from "./game";
import { Tool } from "./tools";
export class Enemy {
   x: number;
   y: number;
   index: number;
   img: HTMLImageElement;
   enemies: Enemies;
   width: number;
   height: number;
   constructor(x: number, y: number, index: number, enemyType: HTMLImageElement,enemies:Enemies) {
      this.width = Config.enemyWidth;
      this.height = Config.enemyHeight;
      this.x = x;
      this.y = y;
      this.index = index;
      this.img = enemyType;
      this.enemies = enemies;
      this.paint();
   }

   paint() {
      Config.context.drawImage(this.img, this.x, this.y, Config.enemyWidth, Config.enemyHeight);
   }

   Obstruction() {
      const elementNumber = this.enemies.element.length - 1;
      for (var i = 0; i <= elementNumber; i++) {
         if ((this.enemies.element[i].x == this.x) && 
             (this.enemies.element[i].index > this.index))
            return true;
      }
      return false;
   };

   //Enemy fire
   fire() {
      if (!this.enemies.game.paused) {
         Tool.directionFire(this.x, this.y,this.enemies.game);
      }
   };
}