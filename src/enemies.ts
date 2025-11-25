
import { Config } from "./config";
import { Enemy } from "./enemy";
import { Game } from "./game";
import { Tool } from "./tools";

export class Enemies {
  x!: number;
  y!: number;
  items!: Enemy[];
  game: Game;

  constructor( game: Game) {
    this.game = game;
    this.x = 0;
    this.y = 0;
    this.reset();
    this.initEnemies();
    this.move();
  }

  reset() {
    this.items = [];
  }

  //Remove a enemy bi index in enemies array
  remove(index: number) {
    this.items?.splice(index, 1);
    this.game.score++;

    if (this.items?.length === 0) {
      this.game.showMessage(`You win`);
      Tool.removeEnemies();
      this.game.level++;

      //Init enemies array
      this.reset();
    }
  }

   initEnemies(): void {
    const screenBorderWidth = Config.canvas.width - Config.enemyWidth;
    const screenBorderHeight = Config.canvas.height - Config.enemyHeight;
    const step = Config.enemyWidth * 2;
    for (let i = this.x + Config.enemyWidth, index = 0; i <= screenBorderWidth; i += step) {
      for (
        let j = this.y, enemyType = 0;
        j <= screenBorderHeight / 2 + screenBorderHeight / 6;
        j += Config.enemyHeight * 2, enemyType = Math.min(enemyType + 1, 2)
      ) {
        const enemyElement = new Enemy(i, j, index, enemyType, this);
        this.items.push(enemyElement);
        index++;
      }
    }
    this.enemyFire(Config.enemyFireSpeed);
  }

  //paint all enemies
  paint() {
    Tool.removeEnemies();
    for (var i = 0; i <= this.items.length - 1; i++)
      this.items[i].paint();
    return true;
  }

  //move enemy elements  move elements enemies Horizontally and Vertically
  moveXY(moveLeft: boolean | null) {
    if (!this.game.paused) {
      Tool.removeEnemies(); // Clean enemies for repaint.
      const elementsNumber = this.items.length - 1;
      for (let i = 0; i <= elementsNumber; i++) {
        if (moveLeft !== null) {
          // If move is horizontally.
          this.items[i].x += moveLeft ? -this.items[i].width : this.items[i].width;
        } else {
          // Else if move is vertically and step is 5.
          this.items[i].y += Config.enemyHeight / 5;
        }
        this.items[i].paint(); // Repaint enemies in new x, y.
  
        // If enemy is in nave area.
        if (this.items[i].y >= Config.canvas.height - 3 * Config.naveHeight) {
          this.game.showMessage(`You are dead`);
          window.location.reload();
          return false;
        }
      }
    }
    return true;
  }
  //move elements enemies Horizontally
  moveX(move_left: boolean, speed: number) {
    setTimeout(() => {
      if (this.moveXY(move_left)) {
        move_left = (!this.game.paused) ? (!move_left) : (move_left); //If game is paused don't move Horizontally
        this.moveX(move_left, speed);
      }
    },speed);
  }

  //move elements enemies Vertically
  moveY(speed: number) {
    setTimeout(() => {
      //window.enemies.y+=window.enemies.height/5;
      if (this.moveXY(null))
        this.moveY(speed);
    }, speed);
  }

  //Run fire to a enemy
  enemyFire(speed: number) {
    //First enemy in last row
    setTimeout(() => {
      //Any enemy in last row
      var index = Tool.randomRange(0, this.items.length - 1);
      if (this.items[index]) {
        this.items[index].fire();
      }
      this.enemyFire(speed);
    }, speed);
  }

  //move enemies Vertically and Horizontally in the screen
  move() {
    this.moveX(true, 800);
    this.moveY(Config.firstSpeedLevel * this.game.level);
  }
};
