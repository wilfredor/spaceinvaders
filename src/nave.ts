import { Colision } from "./colision";
import { Config } from "./config";
import { Game } from "./game";
import { services as defaultServices, Services, Projectile } from "./tools";

export class Nave {
  life: number;
  shots: number;
  x: number;
  y: number;
  game: Game;
  private flashTimeout?: number;
  private flashesRemaining = 0;
  private readonly services: Services;
  constructor(
    game: Game,
    services: Services = defaultServices,
  ) {
    this.services = services;
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
      this.shots = this.services.countProjectiles('player');
      if (this.shots < Config.naveMaxshots) {
        this.shots++;
        this.directionFire(this.x + Config.naveWidth / 2 - 1.5, this.y - 10);
      }
    }
  }

  directionFire(x: number, y: number) {
    const width = 3;
    const height = 12;
    const speed = -500; // px/s upward

    this.services.addProjectile({
      x,
      y,
      vx: 0,
      vy: speed,
      width,
      height,
      color: "#7fff00",
      owner: "player",
      onStep: (p: Projectile) => {
        const enemyIndex = Colision.checkColision(p.x, p.y, width, height, this.game.enemies.items);
        if (enemyIndex !== -1) {
          const enemy = this.game.enemies.items[enemyIndex];
          if (enemy) {
            this.services.explode(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, undefined, enemy.getColor());
          }
          this.game.enemies.remove(enemyIndex);
          this.game.enemies.paint();
          this.shots = Math.max(0, this.shots - 1);
          return false;
        }
        if (p.y + height < 0) {
          this.shots = Math.max(0, this.shots - 1);
          return false;
        }
        return true;
      }
    });
  }

  paint() {
      this.services.paintNave(this.x,this.y);
  }

  moveLeft(step: number) {
    this.x -= Config.naveWidth / step;
    if (this.x <= 0)
      this.x = 0;
    this.paint();
  }

  moveRight(step: number) {
    this.x += Config.naveWidth / step;
    if (this.x + Config.naveWidth >= Config.canvas.width)
      this.x = Config.canvas.width - Config.naveWidth;
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

  flashHit() {
    this.flashesRemaining = 6;
    const blink = () => {
      if (this.flashesRemaining <= 0) {
        this.flashTimeout = undefined;
        this.paint();
        return;
      }
      const hitFrame = this.flashesRemaining % 2 === 0;
      this.services.paintNave(this.x, this.y, hitFrame ? "#ff4d4d" : "#7fff00");
      this.flashesRemaining--;
      this.flashTimeout = window.setTimeout(blink, 80);
    };

    if (this.flashTimeout) {
      clearTimeout(this.flashTimeout);
    }
    blink();
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
