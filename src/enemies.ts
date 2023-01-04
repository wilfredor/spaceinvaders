import { Config } from "./config";
import { Enemy } from "./enemy";
import { Game } from "./game";
import { Nave } from "./nave";
import { Tool } from "./tools";

export class Enemies {
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  element: any[];
  enemiesType: HTMLImageElement[];
  nave: Nave;
  game: Game;
  config: Config;

  constructor(game: Game, nave: Nave, config: Config) {
    this.config = config;
    this.context = this.config.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.x = 0;
    this.y = 0;
    this.width = 30;
    this.height = 30;
    this.element = [];
    this.enemiesType = [];
    this.nave = nave;
    this.game = game;
    this.initEnemies();
    this.move();
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.width = 30;
    this.height = 30;
    this.element = [];
    this.enemiesType = [];
  }

  removeEnemies() {
    //Clean place
    //window.nave.height+9 is the nave height + canon
    this.context?.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight - (this.nave.height + 9));
  }

  //Remove a enemy bi index in enemies array
  remove(index: number) {
    this.element?.splice(index, 1);
    if (this.config.score) this.config.score.textContent = String(Number(this.config.score?.textContent) + 1);

    if (this.element?.length === 0) {
      this.game.showMessage(`You win`);
      this.removeEnemies();
      if (this.config.level) this.config.level.textContent = String(Number(this.config.level?.textContent) + 1);

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
    const screenBorderWidth = this.config.canvasWidth - this.width;
    const step = this.width * 2;
    const screenBorderHeight = this.config.canvasHeight - this.height;
    for (let i = this.x + this.width; i <= screenBorderWidth; i += step) {
      let enemyType = 0;
      for (
        let j = this.y;
        j <= screenBorderHeight / 2 + screenBorderHeight / 6;
        j += this.height * 2
      ) {
        const enemyElement = new Enemy(i, j, index, enemiesType[enemyType], this);
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
    this.removeEnemies();
    for (var i = 0; i <= this.element.length - 1; i++)
      this.element[i].paint();
    return true;
  }

  //move enemy elements  move elements enemies Horizontally and Vertically
  moveXY(moveLeft: boolean | null) {
    if (!this.game.paused) {
      this.removeEnemies(); // Clean enemies for repaint.
      const elementsNumber = this.element.length - 1;
      for (let i = 0; i <= elementsNumber; i++) {
        if (moveLeft !== null) {
          // If move is horizontally.
          this.element[i].x += moveLeft ? -this.element[i].width : this.element[i].width;
        } else {
          // Else if move is vertically and step is 5.
          this.element[i].y += this.height / 5;
        }
        this.element[i].paint(); // Repaint enemies in new x, y.
  
        // If enemy is in nave area.
        if (this.element[i].y >= this.config.canvasHeight - 3 * this.nave.height) {
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
    //First speed level is 8000
    this.moveY(8000 * Number(this.config.level?.textContent));
  }

  //Check if a enemy in array is colision with a fire
   checkColision(
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    const x1Fire = x;
    const y1Fire = y;
    const x2Fire = x + width;
    const y2Fire = y + height;
    const elementsNumber = this.element.length;
    for (let i = 0; i <= elementsNumber; i++) {
      if (this.element[i]) {
        const x1Enemy = this.element[i].x;
        const y1Enemy = this.element[i].y;
        const x2Enemy = this.element[i].x + this.element[i].width;
        const y2Enemy = this.element[i].y + this.element[i].height;
        // Check colision areas.
        if (
          (y2Enemy <= y2Fire && y2Enemy >= y1Fire) ||
          (y1Enemy >= y1Fire && y1Enemy <= y2Fire)
        ) {
          if (
            (x1Fire >= x1Enemy && x1Fire <= x2Enemy) ||
            (x2Fire <= x2Enemy && x2Fire >= x1Enemy)
          ) {
            console.log(`killed ${i}`);
            this.remove(i);
            return true;
          }
        }
      }
    }
    return false;
  }
  
};