
import { Config } from "./config";
import { Enemies } from "./enemies";
import { Game } from "./game";
export class Enemy {
   height: number;
   width: number;
   x: number;
   y: number;
   index: number;
   img: HTMLImageElement;
   enemies: Enemies;
   game: Game;
   config: Config;
   constructor(x: number, y: number, index: number, enemyType: HTMLImageElement, enemies: Enemies) {
      this.width = enemies.width;
      this.height = enemies.height;
      this.x = x;
      this.y = y;
      this.index = index;
      this.img = enemyType;
      this.enemies = enemies;
      this.game = this.enemies.game;
      this.config = this.enemies.config;
      this.paint();
   }

   paint() {
      this.config.context.drawImage(this.img, this.x, this.y, this.width, this.height);
   }

   Obstruction() {
      var elementNumber = this.enemies.element.length - 1;
      for (var i = 0; i <= elementNumber; i++) {
         if ((this.enemies.element[i].x == this.x) && 
             (this.enemies.element[i].index > this.index))
            return true;
      }
      return false;
   };

   //Enemy fire
   fire() {
      if (!this.game.paused)
         this.directionFire(this.x, this.y, this);
   };

   //Fire direction
   directionFire(xPos: number, i: number, element: this) {
      setTimeout(() => {
         if (i <= this.config.canvas.height - 20) {//If the fire is not in screen border	
            //Make a fire and delete track
            this.config.context.fillStyle = "#FF0000";
            this.config.context.clearRect(xPos, i - 20, 3, 9);
            this.config.context.fillRect(xPos, i, 3, 9);
            this.config.context.fillStyle = "#7fff00";
            //the fire resume trayectory
            element.directionFire(xPos, i + 20, element);
         } else {
            if ((xPos >= this.enemies.nave.x) && (xPos <= (this.enemies.nave.x + this.width))) {
               this.enemies.nave.life--;
               this.config.life = this.enemies.nave.life;
               if (this.enemies.nave.life <= 0) {
                  this.game.showMessage("You are dead");
                  setTimeout(function () {
                     window.location.reload();
                  }, 3000);

               } else if (this.enemies.nave.life===1) {
                  alert("You have only "+this.enemies.nave.life+" life");
               }
            } else
            this.config.context.clearRect(xPos, i - 20, 3, 9);
         }
      }, 30);
   };

}