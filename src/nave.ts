
import { IConfig } from "./modele/iconfig";
import { Enemies } from "./enemies";
import { Game } from "./game";
import {INave } from "./modele/inave";
import { IGame } from "./modele/igame";
export class Nave implements INave {
  width: number;
  height: number;
  life: number;
  shots: number;
  maxshots: number;
  x: number;
  y: number;
  game: Game;
  constructor(
    x:number,
    game: Game,
  ) {
    this.width = game.config.naveWidth;
    this.height = game.config.naveHeight;
    this.shots = game.config.naveShots;
    this.maxshots = game.config.naveMaxshots;
    this.x = x;
    this.life = game.config.naveLife;
    this.y = game.config.canvas.height - this.height;
    this.game = game;
    this.paint();
    window.onkeydown = (event: KeyboardEvent) => { this.move(event); };
    window.onmousedown = () => { this.fire(); };
    window.onmousemove = (event: MouseEvent) => { this.move(event); };

  }

  fire(): void {
    if (!this.game.paused) {
      if (this.shots <= this.maxshots) {
        this.shots++;
        var xPos = this.x + 25;
        var i = (this.game.config.canvas.height - 60);
        this.directionFire(xPos, i);
      }
    }
  }

  directionFire(xPos: number, i: number) {
    if ((i <= -20))
      this.shots = 0;
    setTimeout(() => {
      if (i >= -20) {//If the fire is in screen border	
        //create fire and delete track
        this.game.config.context.clearRect(xPos, i + 20, 2, 12);
        this.game.config.context.fillRect(xPos, i, 2, 12);
        //if some enemy the fire stop
        if (this.game.enemies.checkColision(xPos, i, 7, 12)) {
          i = -5;
          this.game.enemies.paint();
          //this.shots=0;
        }
        //Recursion, the shot is going
        this.directionFire(xPos, i - 20);
      }
    }, 30);
  }

  paint() {
      //paint nave in relative screen position
      this.game.config.context.fillStyle = "#7fff00";
      this.game.config.context.clearRect(0, this.game.config.canvas.height - (this.height + this.height / 2), this.game.config.canvas.width, this.game.config.canvas.height);
      this.game.config.context.fillRect(this.x, this.y, this.width, this.height);
      //Nave canon
      this.game.config.context.fillRect(this.x + 24, this.game.config.canvas.height - 30, 3, 5);
      this.game.config.context.clearRect(this.x - 4, this.game.config.canvas.height - 27, 7, 12);
      this.game.config.context.fillRect(this.x + 22, this.game.config.canvas.height - 25, 7, 12);
      this.game.config.context.clearRect(this.x + this.width - 3, this.game.config.canvas.height - 27, 7, 12);
  }

  moveLeft(step: number) {
    this.x -= this.width / step;
    if (this.x <= (-this.width))
      this.x = this.game.config.canvas.width - this.width;
    this.paint();
  }

  moveRight(step: number) {
    this.x += this.width / step;
    if (this.x >= this.game.config.canvas.width)
      this.x = 0;
    this.paint();
  }

  move(event: KeyboardEvent | MouseEvent) {
    if (this.isPauseEvent(event)) {
      this.game.pause(!this.game.paused);
    } else if (!this.game.paused) {
      if (event instanceof MouseEvent) {
        this.handleMouseMovement(event);
      } else if (event instanceof KeyboardEvent) {
        this.handleKeyboardMovement(event);
      }
    }
  }
  
  private isPauseEvent(event: KeyboardEvent | MouseEvent): boolean {
    return event instanceof KeyboardEvent && event.code == 'KeyP';
  }
  
  private handleMouseMovement(event: MouseEvent) {
    const mouseXaux = event.clientX;
    if (this.game.config.mouseX > mouseXaux) {
      this.moveLeft(5);
    } else if (this.game.config.mouseX < mouseXaux) {
      this.moveRight(5);
    } 
    this.game.config.mouseX = mouseXaux;
  }
  
  private handleKeyboardMovement(event: KeyboardEvent) {
    console.log(event.code);
    if (event.code === 'ArrowLeft') {
      this.moveLeft(2);
    } else if (event.code === 'ArrowRight') {
      this.moveRight(2);
    } else if (event.code === 'ControlLeft' || event.code === 'Space') {
      this.fire();
    }
  }
  
};
