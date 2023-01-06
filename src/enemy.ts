

import { IGame } from "./modele/igame";
import {IEnemy} from "./modele/ienemy";
import { Game } from "./game";
export class Enemy implements IEnemy {
   height: number;
   width: number;
   x: number;
   y: number;
   index: number;
   img: HTMLImageElement;
   game: Game;
   constructor(x: number, y: number, index: number, enemyType: HTMLImageElement, game: Game) {
      this.width = game.config.enemyWidth;
      this.height = game.config.enemyHeight;
      this.x = x;
      this.y = y;
      this.index = index;
      this.img = enemyType;
      this.game = game;
      this.paint();
   }

   paint() {
      this.game.config.context.drawImage(this.img, this.x, this.y, this.width, this.height);
   }

   Obstruction() {
      var elementNumber = this.game.enemies.element.length - 1;
      for (var i = 0; i <= elementNumber; i++) {
         if ((this.game.enemies.element[i].x == this.x) && 
             (this.game.enemies.element[i].index > this.index))
            return true;
      }
      return false;
   };

   //Enemy fire
   fire() {
      if (!this.game.paused) {
         this.directionFire(this.x, this.y);
      }
   };

   _makefire(context:CanvasRenderingContext2D, i:number, xPos:number) {
      //Make a fire and delete track
      context.fillStyle = "#FF0000";
      context.clearRect(xPos, i - 20, 3, 9);
      context.fillRect(xPos, i, 3, 9);
      context.fillStyle = "#7fff00";
   }

   //Fire direction
   directionFire(xPos: number, i: number) {
      setTimeout(() => {
         if (i <= this.game.config.canvas.height - 20) {//If the fire is not in screen border	
            //Make a fire and delete track
            this._makefire(this.game.config.context, i, xPos);
            //the fire resume trayectory
            this.directionFire(xPos, i + 20);
         } else if ((xPos >= this.game.nave.x) && (xPos <= (this.game.nave.x + this.width))) {
               this.game.nave.life--;
               this.game.config.life = this.game.nave.life;
               if (this.game.nave.life <= 0) {
                  this.game.showMessage("You are dead");
                  this.game.reload();
               } else if (this.game.nave.life===1) {
                  alert(`You have only ${this.game.nave.life} life`);
               }
         } else
            this.game.config.context.clearRect(xPos, i - 20, 3, 9);
      }, 30);
   };

}