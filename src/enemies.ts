
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
    // Target roughly 6–8 columns and 4–5 rows like the classic layout.
    const columns = Math.max(6, Math.round(Config.canvas.width / (Config.enemyWidth * 2.5)));
    const rows = Math.max(4, Math.round(Config.canvas.height / (Config.enemyHeight * 6)));

    const horizontalPadding = Config.enemyWidth;
    const verticalPadding = Tool.hudHeight + Config.enemyHeight;

    const availableWidth = Config.canvas.width - horizontalPadding * 2;
    const availableHeight = Math.max(
      Config.enemyHeight * rows,
      Config.canvas.height * 0.5 - Tool.hudHeight
    ); // keep them on top half, below HUD

    const stepX = availableWidth / columns;
    const stepY = availableHeight / rows;

    let index = 0;
    for (let col = 0; col < columns; col++) {
      for (let row = 0, enemyType = 0; row < rows; row++, enemyType = Math.min(enemyType + 1, 2)) {
        const x = horizontalPadding + col * stepX;
        const y = verticalPadding + row * stepY;
        const enemyElement = new Enemy(x, y, index, enemyType, this);
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
