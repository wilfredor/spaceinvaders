
import { Config } from "./config";
import { Enemy } from "./enemy";
import { Game } from "./game";
import { Tool } from "./tools";

type Bounds = {
  x1: number,
  y1: number,
  x2: number,
  y2: number,
};

export class Enemies {
  x!: number;
  y!: number;
  element!: any[];
  enemiesType!: HTMLImageElement[];
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
    this.element = [];
    this.enemiesType = [];
  }

  //Remove a enemy bi index in enemies array
  remove(index: number) {
    this.element?.splice(index, 1);
    this.game.score++;

    if (this.element?.length === 0) {
      this.game.showMessage(`You win`);
      Tool.removeEnemies();
      this.game.level++;

      //Init enemies array
      this.reset();
    }
  }

   initEnemies() {
    // Enemy type images.
    const enemiesType: HTMLImageElement[] = [];
  
    for (let i = 0; i <= 2; i++) {
      enemiesType[i] = new Image();
      enemiesType[i].src = `images/enemies${i}.svg`;
    }
  
    // Create a new enemy element and add to enemies array.
    let index = 0;
    const screenBorderWidth = Config.canvas.width - Config.enemyWidth;
    const screenBorderHeight = Config.canvas.height - Config.enemyHeight;

    const step = Config.enemyWidth * 2;
    for (let i = this.x + Config.enemyWidth; i <= screenBorderWidth; i += step) {
      let enemyType = 0;
      for (
        let j = this.y;
        j <= screenBorderHeight / 2 + screenBorderHeight / 6;
        j += Config.enemyHeight * 2
      ) {
        const enemyElement = new Enemy(i, j, index, enemiesType[enemyType],this);
        this.element.push(enemyElement);
        index++;
        if (enemyType < enemiesType.length - 1) {
          enemyType++;
        }
      }
    }
    // This enemy go to fire.
    this.enemyFire(1000);
  }
  

  //paint all enemies
  paint() {
    Tool.removeEnemies();
    for (var i = 0; i <= this.element.length - 1; i++)
      this.element[i].paint();
    return true;
  }

  //move enemy elements  move elements enemies Horizontally and Vertically
  moveXY(moveLeft: boolean | null) {
    if (!this.game.paused) {
      Tool.removeEnemies(); // Clean enemies for repaint.
      const elementsNumber = this.element.length - 1;
      for (let i = 0; i <= elementsNumber; i++) {
        if (moveLeft !== null) {
          // If move is horizontally.
          this.element[i].x += moveLeft ? -this.element[i].width : this.element[i].width;
        } else {
          // Else if move is vertically and step is 5.
          this.element[i].y += Config.enemyHeight / 5;
        }
        this.element[i].paint(); // Repaint enemies in new x, y.
  
        // If enemy is in nave area.
        if (this.element[i].y >= Config.canvas.height - 3 * Config.naveHeight) {
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
      var index = Tool.randomRange(0, this.element.length - 1);
      if (this.element[index]) {
        this.element[index].fire();
      }
      this.enemyFire(speed);
    }, speed);
  }

  //move enemies Vertically and Horizontally in the screen
  move() {
    this.moveX(true, 800);
    this.moveY(Config.firstSpeedLevel * this.game.level);
  }

  //Check if a enemy in array is colision with a fire
  checkColision(
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    const fireBounds = {
      x1: x,
      y1: y,
      x2: x + width,
      y2: y + height,
    };
    const elementsNumber = this.element.length;
    for (let i = 0; i <= elementsNumber; i++) {
      if (this.element[i]) {
        const enemyBounds = {
          x1: this.element[i].x,
          y1: this.element[i].y,
          x2: this.element[i].x + this.element[i].width,
          y2: this.element[i].y + this.element[i].height,
        };

        if (this.checkVerticalCollision(fireBounds, enemyBounds) && 
            this.checkHorizontalCollision(fireBounds, enemyBounds)) {
          console.log(`killed ${i}`);
          this.remove(i);
          return true;
        }
      }
    }
    return false;
  }
  
  private checkVerticalCollision(bounds1: Bounds, bounds2: Bounds): boolean {
    return bounds2.y2 <= bounds1.y2 && bounds2.y2 >= bounds1.y1 || bounds1.y1 >= bounds2.y1 && bounds1.y1 <= bounds2.y2;
  }
  
  private checkHorizontalCollision(bounds1: Bounds, bounds2: Bounds): boolean {
    return bounds1.x1 >= bounds2.x1 && bounds1.x1 <= bounds2.x2 || bounds2.x2 <= bounds1.x2 && bounds2.x2 >= bounds1.x1;
  }
  
};