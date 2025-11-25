import { Colision } from "./colision";
import { Config } from "./config";
import { Game } from "./game";
import { services as defaultServices, Services, Projectile } from "./tools";

export class Nave {
  life: number;
  shots: number;
  x: number;
  y: number;
  private lastDrawX: number;
  private lastDrawY: number;
  private prevX: number;
  game: Game;
  private flashTimeout?: number;
  private flashesRemaining = 0;
  private fireIntervalId?: number;
  private readonly services: Services;
  constructor(
    game: Game,
    services: Services = defaultServices,
  ) {
    this.services = services;
    this.shots = Config.naveShots;
    this.x = 0;
    this.prevX = this.x;
    this.lastDrawX = this.x;
    this.lastDrawY = Config.canvas.height - Config.naveHeight;
    this.life = Config.naveLife;
    this.y = this.lastDrawY;
    this.game = game;
    this.paint();
    window.onkeydown = (event: KeyboardEvent) => { this.move(event); };
    window.onmousedown = () => { this.startAutoFire(); };
    window.onmouseup = () => { this.stopAutoFire(); };
    window.onmouseleave = () => { this.stopAutoFire(); };
    window.onmouseout = () => { this.stopAutoFire(); };
    window.ontouchstart = (event: TouchEvent) => {
      event.preventDefault();
      this.startAutoFire();
    };
    window.ontouchend = () => { this.stopAutoFire(); };
    window.ontouchcancel = () => { this.stopAutoFire(); };
    window.onmousemove = (event: MouseEvent) => { this.move(event); };

  }

  private startAutoFire() {
    this.fire();
    if (this.fireIntervalId !== undefined) return;
    this.fireIntervalId = window.setInterval(() => this.fire(), 180);
  }

  private stopAutoFire() {
    if (this.fireIntervalId !== undefined) {
      clearInterval(this.fireIntervalId);
      this.fireIntervalId = undefined;
    }
  }

  fire(): void {
    if (!this.game.paused) {
      this.shots = this.services.countProjectiles('player');
      if (this.shots < Config.naveMaxshots) {
        this.shots++;
        const width = 3;
        const height = 12;
        const startX = this.x + (Config.naveWidth - width) / 2;
        const startY = this.y - height;
        this.directionFire(startX, startY, width, height);
      }
    }
  }

  directionFire(x: number, y: number, width: number, height: number) {
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
    const ctx = Config.context;
    const bandMargin = 8;
    // Wipe a horizontal band where the nave moves to guarantee no trails.
    ctx.clearRect(
      0,
      this.y - bandMargin,
      Config.canvas.width,
      Config.naveHeight + bandMargin * 2 + 4
    );
    // Also clear the same band on the projectile layer in case a stale pixel landed there.
    Config.projectileContext.clearRect(
      0,
      this.y - bandMargin,
      Config.canvas.width,
      Config.naveHeight + bandMargin * 2 + 4
    );

    this.lastDrawX = this.x;
    this.lastDrawY = this.y;
    this.services.paintNave(this.x, this.y);
  }

  moveLeft(step: number) {
    this.prevX = this.x;
    this.x -= Config.naveWidth / step;
    if (this.x <= 0)
      this.x = 0;
    this.paint();
  }

  moveRight(step: number) {
    this.prevX = this.x;
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
    this.prevX = this.x;
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

  get velocityX(): number {
    return this.x - this.prevX;
  }

};
