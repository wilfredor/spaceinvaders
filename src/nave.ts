import { Config } from "./config";
import { Game } from "./game";
import { Tool } from "./tools";

export class Nave {
  life: number;
  shots: number;
  x: number;
  y: number;
  game: Game;
  constructor(
    game: Game,
  ) {
    this.shots = Config.naveShots;
    this.x = 0;
    this.life = Config.naveLife;
    this.y = Config.canvas.height - Config.naveHeight;
    this.game = game;
    this.paint();
    window.onkeydown = (event: KeyboardEvent) => { this.move(event); };
    window.onmousedown = () => { this.fire(); };
    window.onmousemove = (event: MouseEvent) => { this.move(event); };

  }

  fire(): void {
    if (!this.game.paused) {
      if (this.shots <= Config.naveMaxshots) {
        this.shots++;
        this.directionFire(this.x + 25, Config.canvas.height - 60);
      }
    }
  }

  directionFire(x: number, y: number) {
    if ((y <= -Config.fireHeight))
      this.shots = 0;
    else {
      setTimeout(() => {
        if (y >= -Config.fireHeight) {//If the fire is in screen border	
          Tool.paintFire(x,y);
          //if some enemy the fire stop
          if (this.game.enemies.checkColision(x, y, 7, 12)) {
            y = -5;
            this.game.enemies.paint();
          }
          //Recursion, the shot is going
          this.directionFire(x, y - Config.fireHeight);
        }
      }, 30);
    }
  }

  paint() {
      Tool.paintNave(this.x,this.y);
  }

  moveLeft(step: number) {
    this.x -= Config.naveWidth / step;
    if (this.x <= (-Config.naveWidth))
      this.x = Config.canvas.width - Config.naveWidth;
    this.paint();
  }

  moveRight(step: number) {
    this.x += Config.naveWidth / step;
    if (this.x >= Config.canvas.width)
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
    if (this.game.mouseX > mouseXaux) {
      this.moveLeft(5);
    } else if (this.game.mouseX < mouseXaux) {
      this.moveRight(5);
    } 
    this.game.mouseX = mouseXaux;
  }
  
  private handleKeyboardMovement(event: KeyboardEvent) {
    if (event.code === 'ArrowLeft') {
      this.moveLeft(2);
    } else if (event.code === 'ArrowRight') {
      this.moveRight(2);
    } else if (event.code === 'ControlLeft' || event.code === 'Space') {
      this.fire();
    }
  }
  
};
